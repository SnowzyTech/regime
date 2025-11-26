import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/security/rate-limit"
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/security/sanitize"
import { z } from "zod"

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().max(20, "Phone number too long").optional(),
  email: z.string().email("Invalid email address"),
  inquiryType: z.string().min(1, "Inquiry type is required").max(50, "Inquiry type too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message too long"),
})

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIdentifier(request.headers)
    const rateLimitResult = checkRateLimit(`contact:${clientIp}`, RATE_LIMITS.strict)
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${retryAfter} seconds.` },
        { status: 429 },
      )
    }

    const body = await request.json()

    const validatedData = contactSchema.parse(body)

    const sanitizedData = {
      name: sanitizeString(validatedData.name, { maxLength: 100 }),
      phone: validatedData.phone ? sanitizePhone(validatedData.phone) : undefined,
      email: sanitizeEmail(validatedData.email),
      inquiryType: sanitizeString(validatedData.inquiryType, { maxLength: 50 }),
      message: sanitizeString(validatedData.message, { maxLength: 5000 }),
    }

    // TODO: Send email via Resend or SendGrid
    // TODO: Save to Supabase database
    console.log("Contact message received:", sanitizedData)

    return NextResponse.json({
      success: true,
      message: "Message received. We will contact you soon.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
