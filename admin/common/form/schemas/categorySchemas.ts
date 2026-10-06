import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  details: z.string().optional(),
  parent_id: z.string().optional(),
  icon: z.string().optional(),
  admin_commission_rate: z
    .string()
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
      message: "Commission rate must be 0 or more",
    })
    .optional(),
  is_active: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
