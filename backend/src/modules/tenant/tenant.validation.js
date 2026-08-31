import {z} from 'zod';

export const tenantSchema = z.object({
    name:z.string().min(3).max(50),
    email:z.string().email(),
    phone:z.string().min(10).max(15),
    address_line:z.string().min(5).max(100),
    city:z.string().min(2).max(50),
    state:z.string().min(2).max(50),
    postal_code:z.string().min(4).max(10)
})