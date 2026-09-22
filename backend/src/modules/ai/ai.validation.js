import { z } from 'zod';


const GOAL_TYPES = [
    "WEIGHT_LOSS",
    "WEIGHT_GAIN",
    "FAT_LOSS",
    "MUSCLE_GAIN",
    "STRENGTH",
    "FITNESS"
];

const TARGET_UNITS = [
    "KG",
    "PERCENT",
    "REPS",
    "MINUTES"
];

export const generatePlanSchema = z.object({
    days_per_week: z.number().min(1).max(7).optional(),
    session_duration_minutes: z.number().min(1).max(120).optional(),
    fitness_level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    equipment: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
    diet_preference: z.enum(['ANY', 'VEGETARIAN', 'NON_VEGETARIAN', 'EGGETARIAN', 'VEGAN']).optional(),
});


export const suggestPlanSchema = z.object({
    member_id: z.string().uuid(),
    model: z.enum(['llama', 'gemma']).default('llama'),
    goal: z.object({
        goal_type: z.enum(GOAL_TYPES),
        target_value: z.coerce.number().positive(),
        target_unit: z.enum(TARGET_UNITS).default('KG'),
        start_value: z.coerce.number().positive().optional(),
        target_date: z.coerce.date(),
        notes: z.string().max(500).optional(),
    }),
    preferences: generatePlanSchema.optional(),
});

const num = () => z.coerce.number().catch(0);

export const llmPlanSchema = z.object({
    summary: z.string().catch(''),

    workout: z.object({
        days: z.array(
            z.object({
                day: z.string(),
                focus: z.string(),
                exercises: z.array(
                    z.object({
                        exercise_name: z.string(),
                        sets: num(),
                        reps: num(),
                        duration_minutes: num(),
                        rest_seconds: num(),
                        notes: z.string().catch(''),
                    })
                ),
            })
        ),
    }),

    diet: z.object({
        meals: z.array(
            z.object({
                meal_type: z.string(),
                meal_time: z.string(),
                food_name: z.string(),
                quantity: num(),
                unit: z.string().catch('g'),
                calories: num(),
                protein: num(),
                carbs: num(),
                fats: num(),
                fibers: num(),
                sugar: num(),
                notes: z.string().catch(''),
            })
        ),
    }),
});



export const generatePlanResponseSchema = z.object({
    duration_weeks: z.number().min(1),
    summary: z.string(),
    workout: z.object({
        days_per_week: z.number().min(1).max(7),
        session_duration_minutes: z.number().min(1).max(120),
        days: z.array(
            z.object({
                day: z.string(),
                focus: z.string(),
                exercises: z.array(
                    z.object({
                        exercise_name: z.string(),
                        exercise_id: z.string().nullable(),
                        in_library: z.boolean(),
                        sets: z.number().min(1),
                        reps: z.number().min(1).nullable(),
                        duration: z.number().min(1).nullable(),
                        rest_seconds: z.number().min(0),
                        notes: z.string().nullable(),
                    })
                ),
            })
        ),
    }),
    diet: z.object({
        meals_per_day: z.number().min(1),
        meals: z.array(
            z.object({
                meal_type: z.string(),
                meal_time: z.string(),
                food_name: z.string(),
                quantity: z.number().positive(),
                unit: z.string(),
                calories: z.number().nonnegative(),
                protein: z.number().nonnegative(),
                fats: z.number().nonnegative(),
                fibers: z.number().nonnegative(),
                carbs: z.number().nonnegative(),
                sugar: z.number().nonnegative(),
                notes: z.string().nullable(),
            })
        ),
        totals: z.object({
            calories: z.number(),
            protein: z.number(),
            carbs: z.number(),
            fats: z.number(),
            fibers: z.number(),
            sugar: z.number(),
        }),
    }),
});