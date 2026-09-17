import {z} from 'zod';

export const createWorkoutPlanExerciseSchema = z.object({
    workout_plan_id : z.uuid(),
    exercise_id : z.uuid(),
    day:z.string().min(1).max(10),
    sets:z.number().min(1).max(25),
    reps:z.number().min(1).max(25).optional(),
    duration:z.number().min(1).max(180).optional(),
    rest_seconds:z.number().min(1).max(180),
    notes:z.string().min(1).max(100).optional()

})

export const updateWorkoutPlanExerciseSchema = z.object({
    day:z.string().min(1).max(10).optional(),
    sets:z.number().min(1).max(25).optional(),
    reps:z.number().min(1).max(25).optional(),
    duration:z.number().min(1).max(180).optional(),
    rest_seconds:z.number().min(1).max(180).optional(),
    notes:z.string().min(1).max(100).optional()
})