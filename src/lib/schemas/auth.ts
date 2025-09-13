// REVIEWED

import { z } from "zod";

const validateEmail = z
  .string()
  .email("Please enter a valid email address.")
  .min(2, "Email is required.");

const validatePassword = z.string().min(2, "Password is required.");

export const signInSchema = z.object({
  email: validateEmail,
  password: validatePassword,
});

export const signUpSchema = z.object({
  role: z.string().min(2, "Role is required."),
  name: z.string().min(2, "Name is required."),
  email: validateEmail,
  password: validatePassword,
});

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
