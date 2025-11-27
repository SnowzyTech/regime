import { streamText, createGateway } from "ai"
import { createAdminClient } from "@/lib/supabase/admin"

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY_PROJECT2,
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Fetch products from database for RAG context
    const supabase = createAdminClient()
    const { data: products, error } = await supabase
      .from("products")
      .select("title, description, price, category, product_type, skin_concern, ingredients, application, sizes")
      .limit(50)

    if (error) {
      console.error("[v0] Error fetching products:", error)
    }

    // Build product context for RAG
    const productContext =
      products && products.length > 0
        ? products
            .map(
              (p) =>
                `Product: ${p.title}
Description: ${p.description || "Premium skincare product"}
Price: ₦${p.price?.toLocaleString() || "Contact for price"}
Category: ${p.category || "Skincare"}
Type: ${p.product_type || "General"}
Skin Concern: ${p.skin_concern || "All skin types"}
Ingredients: ${Array.isArray(p.ingredients) ? p.ingredients.join(", ") : p.ingredients || "Premium ingredients"}
Application: ${p.application || "Apply as directed"}
Sizes: ${Array.isArray(p.sizes) ? p.sizes.join(", ") : p.sizes || "Standard"}`,
            )
            .join("\n\n")
        : "Our product catalog is being updated. Please check back soon or ask about general skincare advice."

    // Comprehensive website information context
    const websiteContext = `
REGIME - Premium Dermatology Skincare Brand

ABOUT US:
REGIME is a premium dermatology skincare brand focused on the intersection of science and self-care. We believe in science-backed formulas designed for modern skin health and vitality. Our products are crafted with quality ingredients to deliver lasting results.

OUR PHILOSOPHY:
- Science meets self-care
- Quality ingredients matter
- Dermatology-grade formulations
- Personalized skincare solutions
- Commitment to skin health and vitality

WHAT WE OFFER:
- Cleansers and face washes
- Serums and treatments
- Moisturizers and creams
- Sunscreens and protection
- Specialty treatments for specific skin concerns

SKIN CONCERNS WE ADDRESS:
- Acne and breakouts
- Anti-aging and fine lines
- Hydration and dryness
- Hyperpigmentation and dark spots
- Sensitive skin
- Oily skin control
- General skin maintenance

SERVICES:
- Free skincare consultations
- Personalized product recommendations
- Expert dermatology advice
- Skincare routine guidance

SHOPPING INFORMATION:
- Browse our products at /shop
- Detailed product pages with ingredients and usage instructions
- Secure checkout process
- Multiple payment options available

SHIPPING & DELIVERY:
- We ship nationwide across Nigeria
- Fast and reliable delivery
- Order tracking available
- Careful packaging to protect products

RETURNS & REFUNDS:
- 30-day return policy for unopened products
- Contact customer support for return requests
- Refunds processed within 7-14 business days

CONTACT US:
- Visit our Contact page at /contact
- Email support available
- Customer service team ready to help

PAGES ON OUR WEBSITE:
- Home (/) - Main landing page with featured products
- Shop (/shop) - Browse all our products
- About (/about) - Learn about REGIME and our story
- Contact (/contact) - Get in touch with us
- Account (/account) - Manage your account and orders
`

    const systemPrompt = `You are REGIME's friendly and knowledgeable skincare assistant. Your role is to help customers with any questions about REGIME and skincare.

You can help with:
1. Product recommendations based on skin type and concerns
2. Information about our skincare products, ingredients, and how to use them
3. General skincare advice, routines, and tips
4. Questions about REGIME as a brand - our story, philosophy, and values
5. Website navigation - where to find products, how to shop, etc.
6. Orders, shipping, and returns information
7. Skincare concerns and which products might help

CURRENT PRODUCT CATALOG:
${productContext}

ABOUT REGIME & WEBSITE:
${websiteContext}

GUIDELINES:
- Be warm, friendly, professional, and helpful
- Always recommend products from our catalog when relevant
- If asked about products we don't have, explain what we do offer instead
- For serious medical skin conditions, recommend consulting a dermatologist
- Keep responses concise but informative (2-4 sentences for simple questions, more for detailed queries)
- Use ₦ (Naira) for all prices
- If you don't know something specific, be honest and offer to help in other ways
- Direct users to relevant pages on the website when appropriate
- Be enthusiastic about skincare and helping customers achieve healthy skin`

    const result = streamText({
      model: gateway("openai/gpt-3.5-turbo"),
      system: systemPrompt,
      messages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
