import { z } from "zod";
import { isPasswordValid } from "@/components/auth/password-strength-indicator";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    password: z.string().refine(isPasswordValid, {
      message: "Password does not meet all requirements",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const inviteSchema = z
  .object({
    password: z.string().refine(isPasswordValid, {
      message: "Password does not meet all requirements",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().refine(isPasswordValid, {
      message: "Password does not meet all requirements",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type InviteFormData = z.infer<typeof inviteSchema>;
export type ResetRequestFormData = z.infer<typeof resetRequestSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
