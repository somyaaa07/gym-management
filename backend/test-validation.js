import { randomUUID } from 'crypto';
import { suggestPlanSchema, llmPlanSchema } from './src/modules/ai/ai.validation.js';

const r1 = suggestPlanSchema.safeParse({
    member_id: randomUUID(),
    model: 'llama',
    goal: { goal_type: 'WEIGHT_LOSS', target_value: '74', start_value: 82.5, target_date: '2026-12-31' },
});
console.log('suggestPlanSchema:', r1.success ? r1.data : r1.error.issues);

const r2 = llmPlanSchema.safeParse({
    summary: 'test',
    workout: {
        days: [{
            day: 'Mon', focus: 'Legs',
            exercises: [{ exercise_name: 'Squat', sets: '3', reps: 10, duration_minutes: 0, rest_seconds: 60 }]
        }]
    },
    diet: {
        meals: [{
            meal_type: 'Lunch', meal_time: '13:00', food_name: 'Rice',
            quantity: '200', unit: 'g', calories: 300, protein: 5, carbs: 60, fats: 1, fibers: 2, sugar: 0
        }]
    },
});
console.log('llmPlanSchema (with string numbers):', r2.success ? 'PASSED ✅' : r2.error.issues);