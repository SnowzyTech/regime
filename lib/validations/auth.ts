import { z } from "zod"

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address").max(254, "Email too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long") // Add max length
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter") // Add lowercase requirement
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character"), // Add special char requirement
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"), // Add max length
})

export const signInSchema = z.object({
  email: z.string().email("Invalid email address").max(254, "Email too long"),
  password: z.string().min(1, "Password is required").max(128, "Password too long"),
})

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address").max(254, "Email too long"),
  password: z.string().min(1, "Password is required").max(128, "Password too long"),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type AdminLoginFormData = z.infer<typeof adminLoginSchema>
