import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/security/rate-limit"
import { sanitizeEmail, sanitizeString, sanitizeNumber, sanitizeUUID } from "@/lib/security/sanitize"
import { z } from "zod"

const paymentInitSchema = z.object({
  email: z.string().email("Invalid email"),
  amount: z.number().positive("Amount must be positive").max(100000000, "Amount too large"),
  orderId: z.string().uuid("Invalid order ID"),
  metadata: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIdentifier(request.headers)
    const rateLimitResult = checkRateLimit(`paystack-init:${clientIp}`, RATE_LIMITS.standard)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()

    const validatedData = paymentInitSchema.parse(body)

    const sanitizedEmail = sanitizeEmail(validatedData.email)
    const sanitizedOrderId = sanitizeUUID(validatedData.orderId)
    const sanitizedAmount = sanitizeNumber(validatedData.amount, { min: 1, max: 100000000 })

    if (!sanitizedOrderId) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY not configured")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const callbackUrl = `${siteUrl}/checkout/success`

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: sanitizedEmail,
        amount: Math.round(sanitizedAmount * 100), // Convert to kobo
        callback_url: callbackUrl,
        metadata: {
          orderId: sanitizedOrderId,
          ...(validatedData.metadata
            ? Object.fromEntries(
                Object.entries(validatedData.metadata).map(([k, v]) => [
                  sanitizeString(k, { maxLength: 50 }),
                  typeof v === "string" ? sanitizeString(v, { maxLength: 200 }) : v,
                ]),
              )
            : {}),
        },
      }),
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json({ error: data.message || "Payment initialization failed" }, { status: 400 })
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Paystack initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
