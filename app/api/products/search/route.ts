import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const query = request.nextUrl.searchParams.get("q")?.toLowerCase() || ""

  if (!query) {
    return NextResponse.json({ products: [] })
  }

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products: products || [] })
  } catch (err) {
    console.error("Error searching products:", err)
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 })
  }
}
