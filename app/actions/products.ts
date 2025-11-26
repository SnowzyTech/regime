"use server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { productSchema } from "@/lib/validations/product"
import { z } from "zod"
import { verifyAdminAuth } from "@/lib/security/admin-auth"
import { sanitizeString, sanitizeUUID, sanitizeNumber } from "@/lib/security/sanitize"

export async function createProductAction(userId: string, isAdmin: boolean, data: unknown) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      }
    }

    // Validate input on server
    const validatedData = productSchema.parse(data)

    const sanitizedData = {
      title: sanitizeString(validatedData.title, { maxLength: 200 }),
      description: sanitizeString(validatedData.description, { maxLength: 5000 }),
      price: sanitizeNumber(validatedData.price, { min: 0, max: 10000000 }),
      category: sanitizeString(validatedData.category, { maxLength: 100 }),
      product_type: sanitizeString(validatedData.productType, { maxLength: 100 }),
      skin_concern: validatedData.skinConcern ? sanitizeString(validatedData.skinConcern, { maxLength: 100 }) : null,
      sku: sanitizeString(validatedData.sku, { maxLength: 50 }),
      stock: sanitizeNumber(validatedData.stock, { min: 0, max: 1000000 }),
      images: validatedData.images?.map((img) => sanitizeString(img, { maxLength: 500 })) || [],
      ingredients: validatedData.ingredients?.map((ing) => sanitizeString(ing, { maxLength: 200 })) || [],
      application: validatedData.application ? sanitizeString(validatedData.application, { maxLength: 2000 }) : null,
      warning: validatedData.warning ? sanitizeString(validatedData.warning, { maxLength: 1000 }) : null,
      sizes: validatedData.sizes?.map((size) => sanitizeString(size, { maxLength: 50 })) || [],
    }

    const supabase = createAdminClient()

    const { data: product, error } = await supabase.from("products").insert([sanitizedData]).select().single()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      productId: product.id,
      message: "Product created successfully",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }
    return {
      success: false,
      error: "Failed to create product",
    }
  }
}

export async function updateProductAction(productId: string, isAdmin: boolean, data: unknown) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      }
    }

    const sanitizedProductId = sanitizeUUID(productId)
    if (!sanitizedProductId) {
      return {
        success: false,
        error: "Invalid product ID",
      }
    }

    const validatedData = productSchema.partial().parse(data)

    const supabase = createAdminClient()

    const updateData: Record<string, unknown> = {}
    if (validatedData.title) updateData.title = sanitizeString(validatedData.title, { maxLength: 200 })
    if (validatedData.description)
      updateData.description = sanitizeString(validatedData.description, { maxLength: 5000 })
    if (validatedData.price !== undefined)
      updateData.price = sanitizeNumber(validatedData.price, { min: 0, max: 10000000 })
    if (validatedData.category) updateData.category = sanitizeString(validatedData.category, { maxLength: 100 })
    if (validatedData.productType)
      updateData.product_type = sanitizeString(validatedData.productType, { maxLength: 100 })
    if (validatedData.skinConcern)
      updateData.skin_concern = sanitizeString(validatedData.skinConcern, { maxLength: 100 })
    if (validatedData.stock !== undefined)
      updateData.stock = sanitizeNumber(validatedData.stock, { min: 0, max: 1000000 })
    if (validatedData.images)
      updateData.images = validatedData.images.map((img) => sanitizeString(img, { maxLength: 500 }))
    if (validatedData.ingredients)
      updateData.ingredients = validatedData.ingredients.map((ing) => sanitizeString(ing, { maxLength: 200 }))
    if (validatedData.sizes)
      updateData.sizes = validatedData.sizes.map((size) => sanitizeString(size, { maxLength: 50 }))
    if (validatedData.warning !== undefined)
      updateData.warning = validatedData.warning ? sanitizeString(validatedData.warning, { maxLength: 1000 }) : null

    const { error } = await supabase.from("products").update(updateData).eq("id", sanitizedProductId)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Product updated successfully",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }
    return {
      success: false,
      error: "Failed to update product",
    }
  }
}

export async function deleteProductAction(productId: string, isAdmin: boolean) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      }
    }

    const sanitizedProductId = sanitizeUUID(productId)
    if (!sanitizedProductId) {
      return {
        success: false,
        error: "Invalid product ID",
      }
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from("products").delete().eq("id", sanitizedProductId)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Product deleted successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete product",
    }
  }
}

export async function getProducts() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message,
        products: [],
      }
    }

    return {
      success: true,
      products: products,
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return {
      success: false,
      error: "Failed to fetch products",
      products: [],
    }
  }
}
