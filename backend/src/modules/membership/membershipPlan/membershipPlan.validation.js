import { z } from "zod";

export const membershipPlanSchema = z
  .object({
    name: z.string().min(3).max(50),

    description: z.string().min(5).max(255).optional(),

    duration: z.number().int().positive(),

    duration_unit: z.enum(["DAYS", "WEEKS", "MONTHS", "YEARS"]),

    price: z.number().positive(),

    discount: z.number().min(0).optional(),

    access_type: z.enum(["SINGLE_BRANCH", "ALL_BRANCHES"]),

    branch_id: z.string().uuid().nullable().optional(),

    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.access_type === "SINGLE_BRANCH" && !data.branch_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["branch_id"],
        message: "Branch is required for SINGLE_BRANCH plan",
      });
    }
  });

export const membershipPlanUpdateSchema = z
  .object({
    name: z.string().min(3).max(50).optional(),

    description: z.string().min(5).max(255).optional(),

    duration: z.number().int().positive().optional(),

    duration_unit: z.enum(["DAYS", "WEEKS", "MONTHS", "YEARS"]).optional(),

    price: z.number().positive().optional(),

    discount: z.number().min(0).optional(),

    access_type: z.enum(["SINGLE_BRANCH", "ALL_BRANCHES"]).optional(),

    branch_id: z.string().uuid().nullable().optional(),

    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.access_type === "SINGLE_BRANCH" && !data.branch_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["branch_id"],
        message: "Branch is required for SINGLE_BRANCH plan",
      });
    }
  });
