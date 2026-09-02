import {z} from 'zod';

export const membershipPlanSchema = z.object({
    name:z.string().min(3).max(50),
    description:z.string().min(5).max(255).optional(),
    duration:z.number().int().positive(),
    duration_unit:z.enum([
        'DAYS',
        'WEEKS',
        'MONTHS',
        'YEARS'
    ]),
    price:z.number().positive(),
    discount:z.number().min(0).optional(),
    access_type:z.enum([
        'SINGLE_BRANCH',
        'ALL_BRANCHES'
    ]),
    status:z.enum([
        'ACTIVE',
        'INACTIVE'
    ]).optional()
})

export const membershipPlanUpdateSchema = z.object({
    name:z.string().min(3).max(50).optional(),
    description:z.string().min(5).max(255).optional(),
    duration:z.number().int().positive().optional(),
    duration_unit:z.enum([
        'DAYS',
        'WEEKS',
        'MONTHS',
        'YEARS'
    ]).optional(),
    price:z.number().positive().optional(),
    discount:z.number().min(0).optional(),
    access_type:z.enum([
        'SINGLE_BRANCH',
        'ALL_BRANCHES'
    ]).optional(),
    status:z.enum
    ([
        'ACTIVE',
        'INACTIVE'
    ]).optional()
})