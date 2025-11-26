import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const mockProducts = [
  {
    id: "1",
    title: "Gentle Cleanser",
    description: "pH-balanced, non-stripping formula",
    price: 45,
    images: ["/cleanser.png"],
  },
  {
    id: "2",
    title: "Hydrating Serum",
    description: "Hyaluronic acid serum for deep hydration",
    price: 65,
    images: ["/glowing-serum.png"],
  },
  {
    id: "3",
    title: "Moisture Lock",
    description: "Rich moisturizer with ceramides",
    price: 85,
    images: ["/moisturizer-product-shot.png"],
  },
  {
    id: "4",
    title: "Antioxidant Defense SPF",
    description: "Broad spectrum SPF 50 with antioxidants",
    price: 55,
    images: ["/sunscreen.png"],
  },
]

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "4")

  try {
    const { data: products, error } = await supabase.from("products").select("*").limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      products: products || [],
    })
  } catch (err) {
    console.error("Error fetching featured products:", err)
    return NextResponse.json({ error: "Failed to fetch featured products" }, { status: 500 })
  }
}
