import { chatJson, OllamaError, resolveModel } from '../../services/ollama.service.js';
import { llmPlanSchema, generatePlanResponseSchema } from './ai.validation.js';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const round = (n, d = 0) => {
    const f = 10 ** d;
    return Math.round(n * f) / f;
};
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const GOAL_LABEL = {
    WEIGHT_LOSS: 'weight loss',
    WEIGHT_GAIN: 'weight gain',
    FAT_LOSS: 'fat loss',
    MUSCLE_GAIN: 'muscle gain',
    STRENGTH: 'strength',
    FITNESS: 'general fitness',
};

const DEFAULT_MEAL_TIMES = {
    breakfast: '08:00',
    'morning snack': '10:30',
    snack: '11:00',
    lunch: '13:00',
    'evening snack': '17:00',
    'pre workout': '17:30',
    'post workout': '19:00',
    dinner: '20:30',
};

export const calcAge = (dob) => {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age > 0 && age < 110 ? age : null;
};

/* ------------------------------------------------------------------ */
/* Calorie / macro targets — computed in code, NOT by the LLM          */
/* (small local models are unreliable at arithmetic)                   */
/* ------------------------------------------------------------------ */
export const computeTargets = ({ member, measurement, goal, preferences }) => {
    const weight = Number(measurement?.weight) || null;
    let height = Number(measurement?.height) || null;
    const age = calcAge(member?.date_of_birth);
    if (height && height < 3) height *= 100; // metres -> cm
    if (!weight || !height || !age) return null;

    const gender = member?.gender;
    const bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : gender === 'female' ? -161 : -78);

    const days = preferences?.days_per_week || 4;
    const activity = days <= 2 ? 1.375 : days <= 4 ? 1.55 : 1.725;
    const tdee = bmr * activity;

    const weeks = weeksUntil(goal.target_date);
    const startW = goal.start_value || weight;
    const isWeightGoal = ['WEIGHT_LOSS', 'WEIGHT_GAIN'].includes(goal.goal_type) && goal.target_unit === 'KG';
    const ratePerWeek = isWeightGoal && startW ? Math.abs(goal.target_value - startW) / weeks : null;

    let delta = 0;
    switch (goal.goal_type) {
        case 'WEIGHT_LOSS':
            delta = -(ratePerWeek ? clamp(ratePerWeek * 1100, 250, 750) : 500);
            break;
        case 'FAT_LOSS':
            delta = -400;
            break;
        case 'WEIGHT_GAIN':
            delta = ratePerWeek ? clamp(ratePerWeek * 1100, 200, 500) : 300;
            break;
        case 'MUSCLE_GAIN':
            delta = 250;
            break;
        default:
            delta = 0;
    }

    const floor = gender === 'female' ? 1200 : gender === 'male' ? 1500 : 1350;
    const calories = Math.max(floor, round(tdee + delta));
    const proteinPerKg = ['WEIGHT_LOSS', 'FAT_LOSS'].includes(goal.goal_type) ? 2.0 : ['WEIGHT_GAIN', 'MUSCLE_GAIN'].includes(goal.goal_type) ? 1.8 : 1.6;
    const protein = round(weight * proteinPerKg);
    const fats = round((calories * 0.25) / 9);
    const carbs = Math.max(0, round((calories - protein * 4 - fats * 9) / 4));

    return {
        calories: round(calories / 10) * 10,
        protein,
        carbs,
        fats,
        basis: { weight_kg: weight, height_cm: round(height), age, activity_factor: activity },
        weekly_change_kg: ratePerWeek ? round(ratePerWeek, 2) : null,
    };
};

const weeksUntil = (date) => {
    const ms = new Date(date).getTime() - Date.now();
    return Math.max(1, Math.ceil(ms / (7 * 24 * 3600 * 1000)));
};

/* ------------------------------------------------------------------ */
/* JSON schema handed to Ollama (constrains the model's output)        */
/* ------------------------------------------------------------------ */
const S = { type: 'string' };
const N = { type: 'number' };
const obj = (properties) => ({ type: 'object', properties, required: Object.keys(properties) });
const arr = (items) => ({ type: 'array', items });

const OLLAMA_SCHEMA = obj({
    summary: S,
    workout: obj({
        days: arr(
            obj({
                day: S,
                focus: S,
                exercises: arr(
                    obj({ exercise_name: S, sets: N, reps: N, duration_minutes: N, rest_seconds: N, notes: S })
                ),
            })
        ),
    }),
    diet: obj({
        meals: arr(
            obj({
                meal_type: S,
                meal_time: S,
                food_name: S,
                quantity: N,
                unit: S,
                calories: N,
                protein: N,
                carbs: N,
                fats: N,
                fibers: N,
                sugar: N,
                notes: S,
            })
        ),
    }),
});

/* ------------------------------------------------------------------ */
/* Prompt                                                              */
/* ------------------------------------------------------------------ */
const SYSTEM_PROMPT = `You are an assistant for a gym: a certified strength coach and sports nutritionist.
Reply with ONE JSON object that matches the provided schema. No markdown, no commentary.

Workout rules:
- "days" must contain exactly the requested number of training days (one weekly template), each with 4-6 exercises.
- Rep based exercise: reps > 0 and duration_minutes = 0. Time based (cardio, plank): duration_minutes > 0 and reps = 0.
- sets >= 1, rest_seconds between 30 and 180. Keep notes under 12 words.
- If an EXERCISE LIBRARY is given, exercise_name must be copied EXACTLY from it.
- Never include an exercise that conflicts with the member's injuries or restrictions.
- Match difficulty to the fitness level and only use the listed equipment.

Diet rules:
- Describe ONE typical day with 4-6 meals. meal_time is 24h "HH:MM".
- quantity is a number, unit is like "g", "ml", "piece", "cup". Macros are for that quantity.
- Meals should add up close to the daily nutrition target.
- Never include any food the member is allergic to. Respect the diet preference.

"summary" is 2 short sentences explaining the approach. Do not give medical advice.`;

const buildUserPrompt = ({ member, measurement, health, goal, prefs, targets, exercises, weeks }) => {
    const lines = [];
    const age = calcAge(member?.date_of_birth);

    lines.push('MEMBER');
    lines.push(`- Gender: ${member?.gender || 'unknown'}, Age: ${age ?? 'unknown'}`);
    if (measurement) {
        const bits = [];
        if (measurement.weight) bits.push(`weight ${Number(measurement.weight)} kg`);
        if (measurement.height) bits.push(`height ${Number(measurement.height)} cm`);
        if (measurement.bmi) bits.push(`BMI ${Number(measurement.bmi)}`);
        if (measurement.body_fat) bits.push(`body fat ${Number(measurement.body_fat)}%`);
        if (bits.length) lines.push(`- Latest measurements: ${bits.join(', ')}`);
    }

    if (health) {
        const h = [];
        if (health.medical_condition?.trim()) h.push(`medical: ${health.medical_condition.trim()}`);
        if (health.injury_history?.trim()) h.push(`injuries: ${health.injury_history.trim()}`);
        if (health.exercise_restriction?.trim()) h.push(`exercise restrictions: ${health.exercise_restriction.trim()}`);
        if (health.allergies?.trim()) h.push(`ALLERGIES (never use): ${health.allergies.trim()}`);
        if (h.length) {
            lines.push('HEALTH NOTES');
            h.forEach((x) => lines.push(`- ${x}`));
        }
    }

    lines.push('GOAL');
    lines.push(`- Type: ${GOAL_LABEL[goal.goal_type] || goal.goal_type}`);
    lines.push(`- Target: ${goal.target_value} ${goal.target_unit}${goal.start_value ? ` (starting from ${goal.start_value})` : ''}`);
    lines.push(`- Time available: about ${weeks} week(s)`);
    if (goal.notes) lines.push(`- Notes from member: ${goal.notes}`);

    lines.push('PLAN PARAMETERS');
    lines.push(`- Training days per week: ${prefs.days_per_week}`);
    lines.push(`- Session length: ${prefs.session_duration_minutes} minutes`);
    lines.push(`- Fitness level: ${prefs.fitness_level}`);
    lines.push(`- Equipment: ${prefs.equipment.join(', ')}`);
    lines.push(`- Diet preference: ${prefs.diet_preference}`);

    if (targets) {
        lines.push('DAILY NUTRITION TARGET (already calculated, follow it)');
        lines.push(`- About ${targets.calories} kcal, protein ${targets.protein} g, carbs ${targets.carbs} g, fat ${targets.fats} g`);
    } else {
        lines.push('DAILY NUTRITION TARGET');
        lines.push('- Not available (missing weight/height/age). Choose a sensible daily total for this goal.');
    }

    if (exercises.length) {
        lines.push('EXERCISE LIBRARY (choose exercise_name from this list only)');
        exercises.forEach((e) => lines.push(`- ${e.name} [${e.muscle_group}, ${e.category}, ${e.equipment}, ${e.difficulty}]`));
    }

    return lines.join('\n');
};

/* ------------------------------------------------------------------ */
/* Post-processing: LLM output -> API response shape                   */
/* ------------------------------------------------------------------ */
const toHHMM = (value, mealType) => {
    const fallback = DEFAULT_MEAL_TIMES[norm(mealType)] || '12:00';
    const m = String(value || '').trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!m) return fallback;
    let h = Number(m[1]);
    const min = Number(m[2] || 0);
    const ap = m[3]?.toLowerCase();
    if (ap === 'pm' && h < 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
    if (h > 23 || min > 59) return fallback;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
};

const posInt = (n) => (Number(n) > 0 ? Math.round(Number(n)) : null);

const buildLibraryMatcher = (exercises) => {
    const byName = new Map(exercises.map((e) => [norm(e.name), e]));
    return (name) => {
        const key = norm(name);
        if (byName.has(key)) return byName.get(key);
        // forgiving match: "Barbell Bench Press (flat)" -> "Barbell Bench Press"
        for (const [libKey, ex] of byName) {
            if (key.includes(libKey) || libKey.includes(key)) return ex;
        }
        return null;
    };
};

const normalizePlan = (raw, { weeks, prefs, exercises }) => {
    const match = buildLibraryMatcher(exercises);

    const days = raw.workout.days.map((d, i) => ({
        day: d.day?.trim() || `Day ${i + 1}`,
        focus: d.focus?.trim() || 'Full body',
        exercises: d.exercises
            .filter((e) => e.exercise_name?.trim())
            .map((e) => {
                const lib = match(e.exercise_name);
                const reps = posInt(e.reps);
                const duration = posInt(e.duration_minutes);
                return {
                    exercise_name: lib ? lib.name : e.exercise_name.trim(),
                    exercise_id: lib ? lib.id : null,
                    in_library: !!lib,
                    sets: posInt(e.sets) || 3,
                    reps: reps || (duration ? null : 10),
                    duration: reps ? null : duration,
                    rest_seconds: clamp(Number.isFinite(Number(e.rest_seconds)) ? Math.round(Number(e.rest_seconds)) : 60, 0, 300),
                    notes: e.notes?.trim() || null,
                };
            }),
    }));

    const meals = raw.diet.meals
        .filter((m) => m.food_name?.trim() && Number(m.quantity) > 0)
        .map((m) => ({
            meal_type: m.meal_type?.trim() || 'Meal',
            meal_time: toHHMM(m.meal_time, m.meal_type),
            food_name: m.food_name.trim(),
            quantity: round(Number(m.quantity), 1),
            unit: m.unit?.trim() || 'g',
            calories: round(Math.max(0, m.calories)),
            protein: round(Math.max(0, m.protein), 1),
            fats: round(Math.max(0, m.fats), 1),
            fibers: round(Math.max(0, m.fibers), 1),
            carbs: round(Math.max(0, m.carbs), 1),
            sugar: round(Math.max(0, m.sugar), 1),
            notes: m.notes?.trim() || null,
        }))
        .sort((a, b) => a.meal_time.localeCompare(b.meal_time));

    const sum = (k) => round(meals.reduce((s, m) => s + m[k], 0), k === 'calories' ? 0 : 1);

    return {
        duration_weeks: weeks,
        summary: raw.summary?.trim() || '',
        workout: {
            days_per_week: clamp(days.length, 1, 7),
            session_duration_minutes: prefs.session_duration_minutes,
            days,
        },
        diet: {
            meals_per_day: Math.max(1, meals.length),
            meals,
            totals: {
                calories: sum('calories'),
                protein: sum('protein'),
                carbs: sum('carbs'),
                fats: sum('fats'),
                fibers: sum('fibers'),
                sugar: sum('sugar'),
            },
        },
    };
};

/* ------------------------------------------------------------------ */
/* Safety net — flags things a small model might get wrong             */
/* ------------------------------------------------------------------ */
const buildWarnings = ({ plan, prefs, targets, health, goal, measurement, exercises }) => {
    const warnings = [];

    const requested = prefs.days_per_week;
    if (plan.workout.days.length !== requested) {
        warnings.push(`Model returned ${plan.workout.days.length} training days instead of ${requested}.`);
    }
    if (plan.workout.days.some((d) => d.exercises.length === 0)) {
        warnings.push('Some training days have no exercises. Regenerate or try the other model.');
    }
    if (exercises.length) {
        const missing = plan.workout.days.flatMap((d) => d.exercises).filter((e) => !e.in_library).length;
        if (missing) warnings.push(`${missing} exercise(s) are not in your exercise library. Add them before applying the plan.`);
    }

    if (targets) {
        const diff = Math.abs(plan.diet.totals.calories - targets.calories) / targets.calories;
        if (diff > 0.2) {
            warnings.push(`Meal calories (${plan.diet.totals.calories} kcal) are more than 20% away from the target (${targets.calories} kcal).`);
        }
    } else {
        warnings.push('Height, weight or date of birth is missing, so calorie targets were estimated by the model.');
    }

    if (targets?.weekly_change_kg > 1) {
        warnings.push(`Goal needs about ${targets.weekly_change_kg} kg/week change, which is aggressive. Consider a later target date.`);
    }
    const startW = goal.start_value || Number(measurement?.weight) || null;
    if (goal.target_unit === 'KG' && startW) {
        if (goal.goal_type === 'WEIGHT_LOSS' && goal.target_value >= startW) {
            warnings.push('Target value is not below the starting weight for a weight-loss goal. Check that the target is the goal weight.');
        }
        if (goal.goal_type === 'WEIGHT_GAIN' && goal.target_value <= startW) {
            warnings.push('Target value is not above the starting weight for a weight-gain goal. Check that the target is the goal weight.');
        }
    }

    // Allergy safety net: substring check on food names / notes
    const allergens = String(health?.allergies || '')
        .split(/[,;/\n]+/)
        .map((a) => norm(a))
        .filter((a) => a.length >= 3);
    for (const a of allergens) {
        const hit = plan.diet.meals.find((m) => norm(`${m.food_name} ${m.notes || ''}`).includes(a));
        if (hit) warnings.push(`Allergy alert: "${hit.food_name}" may contain "${a}". Remove it before using this plan.`);
    }

    const level = String(health?.health_risk_level || '').toUpperCase();
    if (level === 'HIGH' || health?.doctor_clearance === false || health?.medical_condition?.trim() || health?.exercise_restriction?.trim()) {
        warnings.push('This member has health notes on file. A trainer or doctor should review the plan before it is applied.');
    }

    return warnings;
};

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */
export const DISCLAIMER =
    'AI-generated suggestion for trainer review. It is not medical advice.';

/**
 * Pure function: takes plain data (no DB access) and returns the suggestion.
 * `member`, `health`, `measurement` are plain objects (or Sequelize instances).
 */
export const generateSuggestion = async ({
    modelKey,
    member,
    health = null,
    measurement = null,
    goal,
    preferences = {},
    exercises = [],
    signal,
}) => {
    const prefs = {
        days_per_week: preferences.days_per_week || 4,
        session_duration_minutes: preferences.session_duration_minutes || 60,
        fitness_level: preferences.fitness_level || 'BEGINNER',
        equipment: preferences.equipment?.length ? preferences.equipment : ['gym machines', 'free weights'],
        diet_preference: preferences.diet_preference || 'ANY',
    };

    const weeks = weeksUntil(goal.target_date);
    const targets = computeTargets({ member, measurement, goal, preferences: prefs });

    let userPrompt = buildUserPrompt({ member, measurement, health, goal, prefs, targets, exercises, weeks });

    // const messages = [
    //     { role: 'system', content: SYSTEM_PROMPT },
    //     { role: 'user', content: buildUserPrompt({ member, measurement, health, goal, prefs, targets, exercises, weeks }) },
    // ];

    const requestSummary = `${goal.goal_type} ${goal.target_value}${goal.target_unit} by ${new Date(goal.target_date).toISOString().slice(0, 10)}; ` +
        `${prefs.days_per_week}d/wk, ${prefs.session_duration_minutes}min, ${prefs.fitness_level}, ${prefs.diet_preference}`;

    let lastError = null;
    let raw = '';
    let modelName = '';
    for (let attempt = 0; attempt < 2; attempt++) {
        const ollamaJson = await chatJson({
            model: modelKey,
            system: SYSTEM_PROMPT,
            user: userPrompt,
            jsonSchema: OLLAMA_SCHEMA,
            signal,
        });
        raw = JSON.stringify(ollamaJson);
        modelName = resolveModel(modelKey);

        const parsed = llmPlanSchema.safeParse(ollamaJson);
        if (parsed.success && parsed.data.workout.days.length && parsed.data.diet.meals.length) {
            const plan = normalizePlan(parsed.data, { weeks, prefs, exercises });
            const final = generatePlanResponseSchema.safeParse(plan);
            if (final.success) {
                return {
                    model: modelName,
                    raw,
                    requestSummary,
                    targets,
                    plan: final.data,
                    warnings: buildWarnings({ plan: final.data, prefs, targets, health, goal, measurement, exercises }),
                    disclaimer: DISCLAIMER,
                };
            }
            lastError = final.error.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        } else {
            lastError = parsed.success
                ? 'workout days or meals were empty'
                : parsed.error.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        }

        userPrompt = `${userPrompt}\n\nYour previous JSON was invalid (${lastError}). Return the corrected JSON object only.`;
    }
    
    

    const err = new OllamaError(`Model output failed validation: ${lastError}`, 502, 'BAD_OUTPUT');
    err.raw = raw;
    err.requestSummary = requestSummary;
    throw err;
};
