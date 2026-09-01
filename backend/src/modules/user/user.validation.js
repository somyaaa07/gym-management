import {z} from 'zod';

export const userSchema = z.object({
    name: z.string().min(3).max(50),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
    password: z.string().min(8),

    tenant_id: z.string().uuid().optional(),
branch_id: z.string().uuid().optional(),


    role: z.enum([
        "ADMIN",
        "MANAGER",
        "TRAINER",
        "RECEPTIONIST",
        "ACCOUNTANT"
    ])
});
export const updateUserSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
    password: z.string().min(8).optional(),
    branch_id: z.string().uuid().optional(),
    role: z.enum([
        "ADMIN",
        "MANAGER",
        "TRAINER",
        "RECEPTIONIST",
        "ACCOUNTANT"
    ]).optional()
});