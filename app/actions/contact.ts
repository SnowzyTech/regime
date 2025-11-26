"use server"

import { contactFormSchema } from "@/lib/validations/contact"
import { z } from "zod"
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/security/sanitize"
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/security/rate-limit"
import { headers } from "next/headers"

export async function sendContactMessageAction(data: unknown) {
  try {
    const headersList = await headers()
    const clientIp = getClientIdentifier(headersList)
    const rateLimitResult = checkRateLimit(`contact-action:${clientIp}`, RATE_LIMITS.strict)
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      return {
        success: false,
        error: `Too many messages. Please try again in ${retryAfter} seconds.`,
      }
    }

    // Validate input on server
    const validatedData = contactFormSchema.parse(data)

    const sanitizedData = {
      fullName: sanitizeString(validatedData.fullName, { maxLength: 100 }),
      email: sanitizeEmail(validatedData.email),
      phone: sanitizePhone(validatedData.phone),
      inquiryReason: sanitizeString(validatedData.inquiryReason, { maxLength: 100 }),
      message: sanitizeString(validatedData.message, { maxLength: 5000 }),
    }

    // Here you would send email using Resend or SendGrid
    // For now, we'll just store in database or log
    console.log("Contact message:", sanitizedData)

    // You could store in database:
    // await prisma.contactMessage.create({ data: sanitizedData })

    return {
      success: true,
      message: "Your message has been sent successfully",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }
    return {
      success: false,
      error: "Failed to send message",
    }
  }
}
