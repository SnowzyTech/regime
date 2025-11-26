import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/security/rate-limit"
import { sanitizeEmail } from "@/lib/security/sanitize"
import { z } from "zod"

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIdentifier(request.headers)
    const rateLimitResult = checkRateLimit(`newsletter:${clientIp}`, RATE_LIMITS.strict)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const body = await request.json()

    const validatedData = newsletterSchema.parse(body)

    const sanitizedEmail = sanitizeEmail(validatedData.email)

    // TODO: Save to Supabase database
    // const { data, error } = await supabase
    //   .from('newsletter')
    //   .insert([{ email: sanitizedEmail }])

    console.log("Newsletter subscription:", sanitizedEmail)

    return NextResponse.json({ success: true, message: "Subscribed successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
