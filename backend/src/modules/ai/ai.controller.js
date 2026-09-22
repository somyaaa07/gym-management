import { suggestPlanSchema } from './ai.validation.js';
import { generateSuggestion } from './ai.service.js';
import { listModels, resolveModel, OllamaError } from '../../services/ollama.service.js';
import { Member, HealthProfile, Measurement, Exercise, AIGenerationLog } from '../../model/index.js';

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
