import {z} from 'zod';

export const branchSchema = z.object({
    name:z.string().min(3).max(50),
    code:z.string().min(2).max(25),
    phone:z.string().min(10).max(15),
    email:z.string().email(),
    address_line:z.string().min(5).max(100),
    city:z.string().min(2).max(50),
    state:z.string().min(2).max(50),
    postal_code:z.string().min(4).max(10),
    country:z.string().min(2).max(50),
    opening_time:z.string(),
    closing_time:z.string(),
    capacity:z.number().int().positive()
})

export const updateBranchSchema = branchSchema.partial();