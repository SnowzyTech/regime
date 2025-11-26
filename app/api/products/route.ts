import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/security/rate-limit"
import { sanitizeString, sanitizeNumber } from "@/lib/security/sanitize"

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIdentifier(request.headers)
    const rateLimitResult = checkRateLimit(`products:${clientIp}`, RATE_LIMITS.relaxed)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const supabase = await createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams

    const search = searchParams.get("search") ? sanitizeString(searchParams.get("search")!, { maxLength: 100 }) : null
    const category = searchParams.get("category")
      ? sanitizeString(searchParams.get("category")!, { maxLength: 50 })
      : null
    const skinConcern = searchParams.get("skinConcern")
      ? sanitizeString(searchParams.get("skinConcern")!, { maxLength: 50 })
      : null
    const productType = searchParams.get("productType")
      ? sanitizeString(searchParams.get("productType")!, { maxLength: 50 })
      : null
    const page = sanitizeNumber(searchParams.get("page"), { min: 1, max: 1000, defaultValue: 1 })
    const limit = sanitizeNumber(searchParams.get("limit"), { min: 1, max: 100, defaultValue: 6 })

    let query = supabase.from("products").select("*", { count: "exact" })

    if (search) {
      // Using .or() with .ilike() is safe as Supabase parameterizes the query
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq("category", category)
    }

    if (skinConcern) {
      query = query.eq("skin_concern", skinConcern)
    }

    if (productType) {
      query = query.eq("product_type", productType)
    }

    const itemsPerPage = limit
    const start = (page - 1) * itemsPerPage

    const { data: products, error, count } = await query.range(start, start + itemsPerPage - 1)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to fetch products", products: [], total: 0, page, perPage: itemsPerPage },
        { status: 500 },
      )
    }

    return NextResponse.json({
      products: products || [],
      total: count || 0,
      page,
      perPage: itemsPerPage,
    })
  } catch (err) {
    console.error("Error fetching products:", err)
    return NextResponse.json(
      { error: "Failed to fetch products", products: [], total: 0, page: 1, perPage: 6 },
      { status: 500 },
    )
  }
}
