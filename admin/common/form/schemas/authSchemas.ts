import { z } from "zod";

export const signinSchema = z.object({
  identifier: z.string().min(3, "Enter your email or phone"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});
export type SigninValues = z.infer<typeof signinSchema>;

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(7, "Enter a valid phone number"),
    password: z.string().min(3, "Password must be at least 3 characters"),
    confirm_password: z
      .string()
      .min(3, "Confirm password must be at least 3 characters"),
    country: z.string().min(1, "Country is required"),
    country_code: z.string().min(1, "Country code is required"),
    currency_code: z.string().min(1, "Currency code is required"),
    currency_symbol: z.string().min(1, "Currency symbol is required"),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;
