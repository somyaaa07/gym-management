import {z} from 'zod';

export const createDietPlanSchema = z.object({
    member_id:z.uuid(),
    name:z.string().min(1).max(30,"Name must be between 1 and 30 characters"),
    description:z.string().min(1).max(100,"Description must be between 1 and 100 characters").optional(),
    goal:z.string().min(1).max(30,"Goal must be between 1 and 30 characters"),
    start_date:z.coerce.date(),
    end_date:z.coerce.date(),
}).refine((data)=>data.end_date >= data.start_date,
{
    message:"End date must be greater than start date",
    path:["end_date"]
})


export const updateDietPlanSchema = z.object({
    name:z.string().min(1).max(30,"Name must be between 1 and 30 characters").optional(),
    description:z.string().min(1).max(100,"Description must be between 1 and 100 characters").optional(),
    goal:z.string().min(1).max(30,"Goal must be between 1 and 30 characters").optional(),
    start_date:z.coerce.date().optional(),
    end_date:z.coerce.date().optional(),
    status:z.enum(['ACTIVE','INACTIVE','COMPLETED']).optional()
})