import { z } from 'zod';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const createMemberSlotSchema = z
  .object({
    member_id: z.string().uuid(),
    slot_start_time: z.string().regex(TIME_REGEX, "Invalid time format"),
    slot_end_time: z.string().regex(TIME_REGEX, "Invalid time format"),
  })
  .refine((d) => d.slot_start_time < d.slot_end_time, {
    message: "End time must be after start time",
    path: ["slot_end_time"],
  });

export const updateMemberSlotSchema = z.object({
  slot_start_time: z.string().regex(TIME_REGEX, "Invalid time format").optional(),
  slot_end_time: z.string().regex(TIME_REGEX, "Invalid time format").optional(),
});