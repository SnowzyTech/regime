import { z } from "zod"

export const contactFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100, "Full name too long"), // Add max length
  email: z.string().email("Invalid email address").max(254, "Email too long"), // Add max length
  phone: z
    .string()
    .regex(/^[0-9\-+()\s]+$/, "Invalid phone number")
    .max(20, "Phone number too long"), // Add max length
  inquiryReason: z.string().min(1, "Please select an inquiry reason").max(100, "Inquiry reason too long"), // Add max length
  message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message too long"), // Add max length
})

export type ContactFormData = z.infer<typeof contactFormSchema>
