import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/security/rate-limit"
import { z } from "zod"

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive().max(100),
        price: z.number().positive(),
      }),
    )
    .min(1, "Order must have at least one item"),
  customer: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
  }),
  total: z.number().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIdentifier(request.headers)
    const rateLimitResult = checkRateLimit(`orders:${clientIp}`, RATE_LIMITS.standard)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()

    const validatedData = orderSchema.parse(body)

    // TODO:
    // 1. Create order in Supabase
    // 2. Integrate with Paystack for payment
    // 3. Send confirmation email

    return NextResponse.json({
      success: true,
      orderId: "ORD-" + Date.now(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
