import { z } from 'zod';

export const createMeasurementSchema = z.object({
    member_id: z.string().uuid(),
    height: z.number().positive(),
    weight: z.number().min(20),
    measured_at: z.coerce.date(),

    //optional not required
    body_fat: z.number().optional(),
    muscle_mass: z.number().optional(),
    waist: z.number().optional(),
    chest: z.number().optional(),
    arms: z.number().optional(),
    thighs: z.number().optional(),
    neck: z.number().optional(),

    systolic_bp: z.int().positive().optional(),
    diastolic_bp: z.int().positive().optional(),

})

export const updateMeasurementSchema = z.object({
    member_id: z.string().uuid().optional(),
    height: z.number().positive().optional(),
    weight: z.number().min(20).optional(),
    measured_at: z.coerce.date().optional(),
    body_fat:z.number().optional(),
    muscle_mass:z.number().optional(),
    waist:z.number().optional(),
    chest:z.number().optional(),
    arms:z.number().optional(),
    thighs:z.number().optional(),
    neck:z.number().optional(),
    systolic_bp:z.int().positive().optional(),
    diastolic_bp:z.int().positive().optional(),

})