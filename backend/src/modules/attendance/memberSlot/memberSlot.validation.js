import {z} from 'zod';

export const createMemberSlotSchema = z.object({
  member_id : z.string().uuid(),
  slot_start_time :z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Invalid time format"),
  slot_end_time :z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Invalid time format"),
})

export const updateMemberSlotSchema = z.object({
    slot_start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Invalid time format").optional(),
    slot_end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Invalid time format").optional()
})