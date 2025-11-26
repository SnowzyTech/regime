import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY not configured")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    const body = await request.text()

    const hash = crypto.createHmac("sha512", paystackSecretKey).update(body).digest("hex")
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    try {
      const isValid = crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(signature, "hex"))
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid signature format" }, { status: 401 })
    }

    const payload = JSON.parse(body)

    if (payload.event === "charge.success") {
      const { reference, amount, metadata } = payload.data

      if (metadata?.orderId) {
        try {
          const supabase = createAdminClient()
          const { error } = await supabase
            .from("orders")
            .update({
              status: "PAID",
              payment_reference: reference,
              paid_at: new Date().toISOString(),
            })
            .eq("id", metadata.orderId)

          if (error) {
            console.error("Failed to update order:", error)
          } else {
            console.log("Payment successful and order updated:", {
              reference,
              amount: amount / 100,
              orderId: metadata.orderId,
            })
          }
        } catch (dbError) {
          console.error("Database error:", dbError)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}
