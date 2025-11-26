"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { verifyAdminAuth } from "@/lib/security/admin-auth"
import { sanitizeString, sanitizeUUID, sanitizeNumber, sanitizeUrl } from "@/lib/security/sanitize"
import { z } from "zod"

export type Testimonial = {
  id: string
  product_id: string
  user_name: string
  rating: number
  review: string
  date: string
  image_url?: string
}

const testimonialSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  user_name: z.string().min(1, "User name is required").max(100, "User name too long"),
  rating: z.number().min(1).max(5),
  review: z.string().min(1, "Review is required").max(2000, "Review too long"),
  date: z.string().max(50),
  image_url: z.string().url().optional().or(z.literal("")),
})

export async function getTestimonialsByProduct(productId: string) {
  try {
    const sanitizedProductId = sanitizeUUID(productId)
    if (!sanitizedProductId) {
      return { success: false, testimonials: [], error: "Invalid product ID" }
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("product_id", sanitizedProductId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, testimonials: data as Testimonial[] }
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return { success: false, testimonials: [] }
  }
}

export async function createTestimonial(data: Omit<Testimonial, "id">) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required" }
    }

    const validatedData = testimonialSchema.parse(data)

    const sanitizedData = {
      product_id: validatedData.product_id,
      user_name: sanitizeString(validatedData.user_name, { maxLength: 100 }),
      rating: sanitizeNumber(validatedData.rating, { min: 1, max: 5 }),
      review: sanitizeString(validatedData.review, { maxLength: 2000 }),
      date: sanitizeString(validatedData.date, { maxLength: 50 }),
      image_url: validatedData.image_url ? sanitizeUrl(validatedData.image_url) : null,
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("testimonials").insert(sanitizedData)

    if (error) throw error

    revalidatePath(`/shop/${sanitizedData.product_id}`)
    revalidatePath("/admin/testimonials")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error("Error creating testimonial:", error)
    return { success: false, error: "Failed to create testimonial" }
  }
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required" }
    }

    const sanitizedId = sanitizeUUID(id)
    if (!sanitizedId) {
      return { success: false, error: "Invalid testimonial ID" }
    }

    const sanitizedData: Partial<Testimonial> = {}
    if (data.user_name) sanitizedData.user_name = sanitizeString(data.user_name, { maxLength: 100 })
    if (data.rating !== undefined) sanitizedData.rating = sanitizeNumber(data.rating, { min: 1, max: 5 })
    if (data.review) sanitizedData.review = sanitizeString(data.review, { maxLength: 2000 })
    if (data.date) sanitizedData.date = sanitizeString(data.date, { maxLength: 50 })
    if (data.image_url !== undefined) {
      sanitizedData.image_url = data.image_url ? sanitizeUrl(data.image_url) || undefined : undefined
    }
    if (data.product_id) {
      const productId = sanitizeUUID(data.product_id)
      if (productId) sanitizedData.product_id = productId
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("testimonials").update(sanitizedData).eq("id", sanitizedId)

    if (error) throw error

    if (sanitizedData.product_id) {
      revalidatePath(`/shop/${sanitizedData.product_id}`)
    }
    revalidatePath("/admin/testimonials")

    return { success: true }
  } catch (error) {
    console.error("Error updating testimonial:", error)
    return { success: false, error: "Failed to update testimonial" }
  }
}

export async function getAllTestimonials() {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return { success: false, testimonials: [], error: "Unauthorized" }
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("testimonials")
      .select(`
        *,
        products (
          title,
          images
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, testimonials: data }
  } catch (error) {
    console.error("Error fetching all testimonials:", error)
    return { success: false, testimonials: [] }
  }
}

export async function deleteTestimonial(id: string) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required" }
    }

    const sanitizedId = sanitizeUUID(id)
    if (!sanitizedId) {
      return { success: false, error: "Invalid testimonial ID" }
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("testimonials").delete().eq("id", sanitizedId)

    if (error) throw error

    revalidatePath("/admin/testimonials")
    return { success: true }
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return { success: false, error: "Failed to delete testimonial" }
  }
}
