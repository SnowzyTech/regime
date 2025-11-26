import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/security/rate-limit"
import { sanitizeString } from "@/lib/security/sanitize"
import { z } from "zod"

const verifySchema = z.object({
  reference: z.string().min(1, "Reference is required").max(100, "Reference too long"),
})

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIdentifier(request.headers)
    const rateLimitResult = checkRateLimit(`paystack-verify:${clientIp}`, RATE_LIMITS.standard)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()

    const validatedData = verifySchema.parse(body)
    const sanitizedReference = sanitizeString(validatedData.reference, { maxLength: 100 })

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY not configured")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    const encodedReference = encodeURIComponent(sanitizedReference)

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodedReference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    if (data.data.status === "success" && data.data.metadata?.orderId) {
      try {
        const supabase = createAdminClient()
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "PAID",
            payment_reference: sanitizedReference,
            paid_at: new Date().toISOString(),
          })
          .eq("id", data.data.metadata.orderId)

        if (updateError) {
          console.error("Failed to update order status:", updateError)
        }
      } catch (dbError) {
        console.error("Database error:", dbError)
      }
    }

    return NextResponse.json({
      status: data.data.status,
      amount: data.data.amount / 100,
      orderId: data.data.metadata?.orderId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Paystack verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
