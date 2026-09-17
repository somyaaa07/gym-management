import {z} from 'zod';

export const createWorkoutSchema = z.object({
    member_id:z.uuid(),
    name:z.string().min(1,"Name is required").max(50,"Name must be less than 50 characters"),
    description:z.string().min(1,"Description is required").max(100,"Description must be less than 100 characters").optional(),
    goal:z.string().min(1,"Goal is required").max(50,"Goal must be less than 50 characters"),
    start_date:z.coerce.date(),
    end_date:z.coerce.date(),
}).refine((data)=>data.end_date >= data.start_date,{
    message:"End date must be greater than start date",
    path:["end_date"]
})

export const updateWorkoutSchema = z.object({
    name:z.string().min(1,"Name is required").max(50,"Name must be less than 50 characters").optional(),
    description:z.string().min(1,"Description is required").max(100,"Description must be less than 100 characters").optional(),
    goal:z.string().min(1,"Goal is required").max(50,"Goal must be less than 50 characters").optional(),
    start_date:z.coerce.date().optional(),
    end_date:z.coerce.date().optional(),
    status:z.enum(["ACTIVE","INACTIVE","COMPLETED"]).optional()
})
