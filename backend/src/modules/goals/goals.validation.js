import {z} from 'zod';

export const createGoalSchema = z.object({
    member_id:z.string().uuid(),
    goal_type:z.enum([
        'WEIGHT_LOSS',
        'WEIGHT_GAIN',
        'FAT_LOSS',
        'MUSCLE_GAIN',
        'STRENGTH',
        'FITNESS'
    ]).optional(),
    target_value:z.number().positive(),
    target_unit:z.enum([
        'KG',
        'PERCENT',
        'REPS',
        'MINUTES'
    ]).optional(),
    start_value:z.number().positive().optional(),
    target_date:z.coerce.date(),
    notes:z.string().optional()
})

export const updateGoalSchema = z.object({
    goal_type:z.enum([
        'WEIGHT_LOSS',
        'WEIGHT_GAIN',
        'FAT_LOSS',
        'MUSCLE_GAIN',
        'STRENGTH',
        'FITNESS'
    ]).optional(),
    target_value:z.number().positive().optional(),
    target_unit:z.enum([
        'KG',
        'PERCENT',
        'REPS',
        'MINUTES'
    ]).optional(),
    start_value:z.number().positive().optional(),
    target_date:z.coerce.date().optional(),
    status:z.enum([
        'ACTIVE',
        'COMPLETED',
        'CANCELLED'
    ]).optional(),
    notes:z.string().optional()

})