import { z } from "zod";

export const authFormSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signupFormSchema = authFormSchema.extend({
  fullName: z.string().trim().min(2, "Enter your full name."),
  role: z.enum(["patient", "provider"]),
});

export type AuthFormValues = z.infer<typeof authFormSchema>;
export type SignupFormValues = z.infer<typeof signupFormSchema>;
