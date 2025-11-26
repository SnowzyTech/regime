import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifyAdminAuth } from "@/lib/security/admin-auth"
import { sanitizeNumber, sanitizeString } from "@/lib/security/sanitize"
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/security/rate-limit"
import { z } from "zod"

const updateOrderSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
})

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientIp = getClientIdentifier(request.headers)
    const rateLimitResult = checkRateLimit(`admin-orders:${clientIp}`, RATE_LIMITS.admin)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    const filter = sanitizeString(searchParams.get("filter") || "all", { maxLength: 20 })
    const page = sanitizeNumber(searchParams.get("page"), { min: 1, max: 1000, defaultValue: 1 })
    const limit = sanitizeNumber(searchParams.get("limit"), { min: 1, max: 100, defaultValue: 10 })
    const offset = (page - 1) * limit

    let query = supabase.from("orders").select("*", { count: "exact" })

    // Apply date filter with validated values
    const now = new Date()
    if (filter === "7days") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      query = query.gte("created_at", sevenDaysAgo.toISOString())
    } else if (filter === "month") {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      query = query.gte("created_at", oneMonthAgo.toISOString())
    } else if (filter === "year") {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      query = query.gte("created_at", oneYearAgo.toISOString())
    }

    const {
      data: orders,
      error,
      count,
    } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    const ordersWithAddresses = await Promise.all(
      (orders || []).map(async (order) => {
        if (order.shipping_address_id) {
          const { data: address } = await supabase
            .from("addresses")
            .select("street, city, state, country")
            .eq("id", order.shipping_address_id)
            .single()

          return { ...order, addresses: address }
        }
        return { ...order, addresses: null }
      }),
    )

    return NextResponse.json({
      orders: ordersWithAddresses,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Error in orders API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientIp = getClientIdentifier(request.headers)
    const rateLimitResult = checkRateLimit(`admin-orders-update:${clientIp}`, RATE_LIMITS.admin)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const supabase = createAdminClient()
    const body = await request.json()

    const validatedData = updateOrderSchema.parse(body)

    const { data, error } = await supabase
      .from("orders")
      .update({ status: validatedData.status, updated_at: new Date().toISOString() })
      .eq("id", validatedData.orderId)
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
    console.error("Error in orders PATCH:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
