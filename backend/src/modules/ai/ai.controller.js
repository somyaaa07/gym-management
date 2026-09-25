import { suggestPlanSchema, applyPlanSchema } from './ai.validation.js';
import { generateSuggestion } from './ai.service.js';
import { listModels, resolveModel, OllamaError } from '../../services/ollama.service.js';
import { Member, HealthProfile, Measurement, Exercise, AIGenerationLog, Goal, WorkoutPlan, WorkoutPlanExercise, DietPlan, DietPlanMeal } from '../../model/index.js';

const MAX_LIBRARY_EXERCISES = 80;

// GET /api/v1/ai/models  -> which Ollama models are configured / installed
export const getModels = async (req, res) => {
    try {
        const data = await listModels();
        return res.status(200).json({
            status: true,
            data
        });
    } catch (err) {
        console.log("Error in getModels", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
// POST /api/v1/ai/suggest  -> preview only, nothing is saved except an AIGenerationLog row
export const suggestPlan = async (req, res) => {
    const result = suggestPlanSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: "Validation Error",
            error: result.error.issues
        });
    }

    const { member_id, model: modelKey, goal, preferences } = result.data;
    const tenant_id = req.user.tenant_id;

    if (goal.target_date.getTime() <= Date.now()) {
        return res.status(400).json({
            status: false,
            message: "Target date must be in the future"
        });
    }

    // If the browser cancels (user kept typing / closed the modal), stop the Ollama call too.
    const controller = new AbortController();
    res.on('close', () => {
        if (!res.writableFinished) controller.abort();
    });

    let branch_id = null;
    let requestSummary = null;
    const startedAt = Date.now();

    try {
        const member = await Member.findOne({
            where: { id: member_id, tenant_id, status: 'ACTIVE' }
        });
        if (!member) {
            return res.status(404).json({ status: false, message: "Member not found" });
        }
        branch_id = member.branch_id;

        const [health, measurement, exerciseRows] = await Promise.all([
            HealthProfile.findOne({ where: { member_id, tenant_id } }),
            Measurement.findOne({
                where: { member_id, tenant_id },
                order: [['measured_at', 'DESC']]
            }),
            Exercise.findAll({
                where: { tenant_id, status: 'ACTIVE' },
                attributes: ['id', 'name', 'category', 'muscle_group', 'equipment', 'difficulty'],
                limit: MAX_LIBRARY_EXERCISES,
                order: [['name', 'ASC']]
            })
        ]);

        const suggestion = await generateSuggestion({
            modelKey,
            member: member.get({ plain: true }),
            health: health ? health.get({ plain: true }) : null,
            measurement: measurement ? measurement.get({ plain: true }) : null,
            goal,
            preferences: preferences || {},
            exercises: exerciseRows.map((e) => e.get({ plain: true })),
            signal: controller.signal
        });
        requestSummary = suggestion.requestSummary;

        await writeLog({
            tenant_id, branch_id, member_id,
            status: 'SUCCESS',
            request_summary: `[${suggestion.model}] ${requestSummary}`,
            ai_response: suggestion.raw
        });

        return res.status(200).json({
            status: true,
            message: "Suggestion generated",
            data: {
                model: { key: modelKey, name: suggestion.model },
                generated_in_ms: Date.now() - startedAt,
                targets: suggestion.targets,
                plan: suggestion.plan,
                warnings: suggestion.warnings,
                disclaimer: suggestion.disclaimer
            }
        });
    }
    catch (err) {
        // Client already left; nothing to send back.
        if (err instanceof OllamaError && err.code === 'CANCELLED') return;

        console.log("Error in suggestPlan", err);

        await writeLog({
            tenant_id, branch_id, member_id,
            status: 'FAILED',
            request_summary: `[${resolveModel(modelKey)}] ${err.requestSummary || requestSummary || ''}`.trim(),
            ai_response: err.raw || null,
            error_message: err.message
        });

        if (err instanceof OllamaError) {
            return res.status(err.statusCode).json({
                status: false,
                code: err.code,
                message: err.message
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Logging must never break the request.
const writeLog = async (row) => {
    if (!row.branch_id && !row.member_id) return;
    try {
        await AIGenerationLog.create({ type: 'WORKOUT_DIET_PLAN', ...row });
    } catch (e) {
        console.log("Could not write AIGenerationLog", e.message);
    }
};


export const applyPlan = async (req, res) => {
    const result = applyPlanSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: "Validation Error",
            error: result.error.issues
        });
    }

    const { member_id, goal_id, plan } = result.data;
    const tenant_id = req.user.tenant_id;

    try {
        const member = await Member.findOne({ where: { id: member_id, tenant_id, status: 'ACTIVE' } });
        if (!member) {
            return res.status(404).json({ status: false, message: "Member not found" });
        }

        const goal = await Goal.findOne({ where: { id: goal_id, member_id, tenant_id } });
        if (!goal) {
            return res.status(404).json({ status: false, message: "Goal not found" });
        }

        const branch_id = member.branch_id;

        // ---- 1. WorkoutPlan banayein ----
        const workoutPlan = await WorkoutPlan.create({
            tenant_id,
            branch_id,
            member_id,
            name: `${goal.goal_type.replaceAll('_', ' ')} Plan`,
            description: plan.summary || null,
            goal: goal.goal_type,
            start_date: new Date().toISOString().slice(0, 10),
            end_date: goal.target_date,
            status: 'ACTIVE',
        });

        // ---- 2. Har exercise: library mein nahi to naya Exercise bana do ----
        let autoCreatedCount = 0;
        for (const day of plan.workout.days) {
            for (const ex of day.exercises) {
                let exerciseId = ex.exercise_id;

                if (!exerciseId) {
                    const newExercise = await Exercise.create({
                        tenant_id,
                        name: ex.exercise_name,
                        description: 'Added automatically from an AI-generated plan.',
                        category: ex.duration ? 'CARDIO' : 'STRENGTH',
                        muscle_group: 'FULL_BODY',
                        equipment: 'Not specified',
                        difficulty: 'BEGINNER',
                        instructions: ex.notes || 'Review and update these instructions.',
                        status: 'ACTIVE',
                    });
                    exerciseId = newExercise.id;
                    autoCreatedCount++;
                }

                await WorkoutPlanExercise.create({
                    workout_plan_id: workoutPlan.id,
                    exercise_id: exerciseId,
                    day: day.day,
                    sets: ex.sets,
                    reps: ex.reps,
                    duration: ex.duration,
                    rest_seconds: ex.rest_seconds,
                    notes: ex.notes,
                });
            }
        }

        // ---- 3. DietPlan banayein ----
        const dietPlan = await DietPlan.create({
            tenant_id,
            branch_id,
            member_id,
            name: `${goal.goal_type.replaceAll('_', ' ')} Diet`,
            description: plan.summary || null,
            goal: goal.goal_type,
            start_date: new Date().toISOString().slice(0, 10),
            end_date: goal.target_date,
            status: 'ACTIVE',
        });

        for (const meal of plan.diet.meals) {
            await DietPlanMeal.create({
                diet_plan_id: dietPlan.id,
                meal_type: meal.meal_type,
                meal_time: meal.meal_time,
                food_name: meal.food_name,
                quantity: meal.quantity,
                unit: meal.unit,
                calories: meal.calories,
                protein: meal.protein,
                fat: meal.fats,
                carbs: meal.carbs,
                fiber: meal.fibers,
                sugar: meal.sugar,
                notes: meal.notes,
            });
        }

        await AIGenerationLog.create({
            tenant_id,
            branch_id,
            member_id,
            goal_id,
            type: 'WORKOUT_DIET_PLAN',
            status: 'SUCCESS',
            workout_plan_id: workoutPlan.id,
            diet_plan_id: dietPlan.id,
            request_summary: `Applied AI plan for goal ${goal.goal_type}`,
        });

        return res.status(201).json({
            status: true,
            message: "Plan applied successfully",
            data: {
                workout_plan_id: workoutPlan.id,
                diet_plan_id: dietPlan.id,
                auto_created_exercises: autoCreatedCount,
            }
        });
    } catch (err) {
        console.log("Error in applyPlan", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};