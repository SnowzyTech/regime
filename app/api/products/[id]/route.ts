import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/security/rate-limit"
import { sanitizeUUID } from "@/lib/security/sanitize"

const mockProducts: Record<string, any> = {
  "1": {
    id: "1",
    title: "Gentle Cleanser",
    description:
      "pH-balanced, non-stripping formula for sensitive skin. Removes makeup and impurities without disrupting the skin barrier.",
    price: 45,
    images: ["/cleanser.png", "/placeholder.svg?height=400&width=400"],
    ingredients: ["Water", "Glycerin", "Chamomile Extract", "Aloe Vera", "Hyaluronic Acid"],
    application:
      "Wet face with lukewarm water. Apply cleanser and massage gently in circular motions. Rinse thoroughly. Use twice daily.",
    stock: 50,
  },
  "2": {
    id: "2",
    title: "Hydrating Serum",
    description: "Lightweight serum with hyaluronic acid for intense hydration without heaviness.",
    price: 65,
    images: ["/glowing-serum.png"],
    ingredients: ["Hyaluronic Acid", "Niacinamide", "Vitamin E", "Ferulic Acid", "Green Tea"],
    application: "Apply 2-3 drops to clean skin before moisturizer. Pat gently to absorb.",
    stock: 40,
  },
  "3": {
    id: "3",
    title: "Moisture Lock",
    description: "Rich moisturizer with ceramides to restore and maintain skin barrier integrity.",
    price: 85,
    images: ["/moisturizer-product-shot.png"],
    ingredients: ["Ceramides", "Squalane", "Glycerin", "Peptides", "Shea Butter"],
    application: "Apply to damp skin morning and night. Use after serums and treatments.",
    stock: 35,
  },
  "4": {
    id: "4",
    title: "Antioxidant Defense SPF",
    description: "Broad spectrum SPF 50 with antioxidants to protect and defend.",
    price: 55,
    images: ["/sunscreen.png"],
    ingredients: ["Zinc Oxide", "Vitamin C", "Green Tea Extract", "Resveratrol", "Niacinamide"],
    application: "Apply generously 15 minutes before sun exposure. Reapply every 2 hours.",
    stock: 60,
  },
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clientIp = getClientIdentifier(request.headers)
    const rateLimitResult = checkRateLimit(`product-detail:${clientIp}`, RATE_LIMITS.relaxed)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { id } = await params

    const sanitizedId = sanitizeUUID(id)
    if (!sanitizedId) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { data: product, error } = await supabase.from("products").select("*").eq("id", sanitizedId).single()

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (err) {
    console.error("Error fetching product:", err)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
