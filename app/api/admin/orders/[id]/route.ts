import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifyAdminAuth } from "@/lib/security/admin-auth"
import { sanitizeUUID } from "@/lib/security/sanitize"
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/security/rate-limit"
import { z } from "zod"

const statusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientIp = getClientIdentifier(request.headers)
    const rateLimitResult = checkRateLimit(`admin-order-update:${clientIp}`, RATE_LIMITS.admin)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const supabase = createAdminClient()
    const { id } = await params

    const sanitizedId = sanitizeUUID(id)
    if (!sanitizedId) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const body = await request.json()

    const validatedData = statusSchema.parse(body)

    const { data, error } = await supabase
      .from("orders")
      .update({ status: validatedData.status, updated_at: new Date().toISOString() })
      .eq("id", sanitizedId)
      .select()
      .single()

    if (error) {
      console.error("Error updating order:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Error in order PATCH:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
