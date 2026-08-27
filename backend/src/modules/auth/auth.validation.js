import {z} from 'zod';


const registerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string(),
})

const loginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8)
})

export {registerSchema,loginSchema} ;