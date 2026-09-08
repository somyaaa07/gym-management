import {z} from 'zod';

export const healthProfileSchema = z.object({
    member_id:z.string().uuid(),
    blood_group:z.enum(['A+','A-','B+','B-','O+','O-','AB+','AB-']).optional(),
    medical_condition:z.string().min(3).max(500).optional(),
    allergies:z.string().min(3).max(300).optional(),
    current_medication:z.string().min(3).max(500).optional(),
    injury_history:z.string().min(3).max(1000).optional(),
    exercise_restriction:z.string().min(3).max(500).optional(),
    doctor_clearance:z.boolean().optional(),
    doctor_notes:z.string().min(3).max(1000).optional()

})

export const updateHealthProfileSchema = z.object({
    // member_id:z.string().uuid(),
    blood_group:z.enum(['A+','A-','B+','B-','O+','O-','AB+','AB-']).optional(),
    medical_condition:z.string().min(3).max(500).optional(),
    allergies:z.string().min(3).max(300).optional(),
    current_medication:z.string().min(3).max(500).optional(),
    injury_history:z.string().min(3).max(1000).optional(),
    exercise_restriction:z.string().min(3).max(500).optional(),
    doctor_clearance:z.boolean().optional(),
    doctor_notes:z.string().min(3).max(1000).optional()
})