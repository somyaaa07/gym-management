import { z } from 'zod';

export const createExerciseSchema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().min(1).max(100),
    equipment: z.string().min(1).max(50),
    category: z.enum([
        'STRENGTH',
        'CARDIO',
        'FLEXIBILITY',
        'MOBILITY'
    ]),
    muscle_group: z.enum([
        'CHEST',
        'BACK',
        'SHOULDERS',
        'BICEPS',
        'TRICEPS',
        'LEGS',
        'GLUTES',
        'ABS',
        'FULL_BODY'
    ]),
    difficulty: z.enum([
        'BEGINNER',
        'INTERMEDIATE',
        'ADVANCED'
    ]),
    instructions:z.string().min(1),
    video_url:z.string().url().optional()
})

export const updateExerciseSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    description: z.string().min(1).max(100).optional(),
    equipment: z.string().min(1).max(50).optional(),
    category: z.enum([
        'STRENGTH',
        'CARDIO',
        'FLEXIBILITY',
        'MOBILITY'
    ]).optional(),
    muscle_group: z.enum([
        'CHEST',
        'BACK',
        'SHOULDERS',
        'BICEPS',
        'TRICEPS',
        'LEGS',
        'GLUTES',
        'ABS',
        'FULL_BODY'
    ]).optional(),
    difficulty: z.enum([
        'BEGINNER',
        'INTERMEDIATE',
        'ADVANCED'
    ]).optional(),
    instructions:z.string().min(1).optional(),
    video_url:z.string().url().optional()
})