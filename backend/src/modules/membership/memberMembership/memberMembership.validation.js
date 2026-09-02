import {z} from 'zod';

export const memberMembershipSchema = z.object({
    member_id:z.string().uuid(),
    membership_plan_id:z.string().uuid(),
    start_date:z.coerce.date(),
    discount:z.number().min(0).optional(),
    payment_status:z.enum([
        "PAID",
        "PENDING",
        "FAILED"
    ]),
    auto_renew:z.boolean().optional(),
    freeze_start_date:z.date().optional(),
    freeze_end_date:z.date().optional()


})

export const updateMemberMembershipSchema = z.object({
    membership_plan_id: z.string().uuid().optional(),
    payment_status:z.enum([
        "PAID",
        "PENDING",
        "FAILED"
    ]).optional(),
    auto_renew:z.boolean().optional(),
    discount:z.number().min(0).optional(),
    freeze_start_date:z.coerce.date().optional(),
    freeze_end_date:z.coerce.date().optional()
})