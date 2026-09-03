import {z} from 'zod';

export const memberValidationSchema = z.object({
    name:z.string().min(5).max(20),
    phone:z.string().min(10).max(15),
    email:z.string().email(),
    date_of_birth:z.string().optional(),
    gender:z.enum(['male','female','other']).optional(),
    profile_image:z.string().optional(),
    address:z.string().min(10).max(100).optional(),
    emergency_contact_name:z.string().min(5).max(20).optional(),
    emergency_contact_phone:z.string().min(10).max(15).optional(),
    joining_date:z.coerce.date(),
    branch_id:z.string().uuid(),

})

export const updateMemberValidationSchema = z.object({
    name:z.string().min(5).max(20).optional(),
    phone:z.string().min(10).max(15).optional(),
    email:z.string().email().optional(),
    date_of_birth:z.string().optional(),
    gender:z.enum(['male','female','other']).optional(),
    profile_image:z.string().optional(),
    address:z.string().min(10).max(100).optional(),
    emergency_contact_name:z.string().min(5).max(20).optional(),
    emergency_contact_phone:z.string().min(10).max(15).optional(),
    joining_date:z.coerce.date().optional(),
    branch_id:z.string().uuid().optional(),
})