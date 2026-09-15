import {z} from 'zod';

export const updateAttendanceRuleSchema = z.object({
    grace_period_minutes:z.number().int().min(0).optional(),
    early_leave_threshold_minutes:z.number().int().min(0).optional(),
})