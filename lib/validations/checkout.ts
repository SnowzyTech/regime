import { z } from "zod"

export const checkoutSchema = z.object({
  email: z.string().email("Invalid email address").max(254, "Email too long"), // Add max length
  phone: z
    .string()
    .regex(/^[0-9\-+()\s]+$/, "Invalid phone number")
    .max(20, "Phone number too long"), // Add max length
  street: z.string().min(5, "Street address is required (at least 5 characters)").max(200, "Street address too long"), // Add max length
  city: z.string().min(2, "City is required").max(100, "City name too long"), // Add max length
  state: z.string().min(2, "State/Province is required").max(100, "State name too long"), // Add max length
  country: z.string().min(2, "Country is required").max(100, "Country name too long"), // Add max length
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
