"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkoutSchema } from "@/lib/validations/checkout"
import { z } from "zod"
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeUUID, sanitizeNumber } from "@/lib/security/sanitize"
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/security/rate-limit"
import { headers } from "next/headers"

const cartItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().positive().max(100, "Quantity too large"),
  price: z.number().positive().max(10000000, "Price too large"),
  size: z.string().max(50).optional(),
})

export async function createOrderAction(
  userId: string,
  cartItems: Array<{ productId: string; quantity: number; price: number; size?: string }>,
  data: unknown,
) {
  try {
    const headersList = await headers()
    const clientIp = getClientIdentifier(headersList)
    const rateLimitResult = checkRateLimit(`checkout:${clientIp}`, RATE_LIMITS.standard)
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: "Too many checkout attempts. Please try again later.",
      }
    }

    const sanitizedUserId = sanitizeUUID(userId)
    if (!sanitizedUserId) {
      return {
        success: false,
        error: "Invalid user session",
      }
    }

    // Validate address data on server
    const validatedData = checkoutSchema.parse(data)

    if (!cartItems || cartItems.length === 0) {
      return {
        success: false,
        error: "Cart is empty",
      }
    }

    if (cartItems.length > 50) {
      return {
        success: false,
        error: "Too many items in cart",
      }
    }

    const validatedCartItems = cartItems.map((item) => {
      const validated = cartItemSchema.parse(item)
      return {
        productId: validated.productId,
        quantity: sanitizeNumber(validated.quantity, { min: 1, max: 100 }),
        price: sanitizeNumber(validated.price, { min: 0, max: 10000000 }),
        size: validated.size ? sanitizeString(validated.size, { maxLength: 50 }) : undefined,
      }
    })

    // Calculate total with server-side verification
    const total = validatedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (total > 100000000) {
      return {
        success: false,
        error: "Order total exceeds maximum allowed",
      }
    }

    const supabase = await createServerSupabaseClient()

    const { data: userExists } = await supabase.from("users").select("id").eq("id", sanitizedUserId).single()

    if (!userExists) {
      return {
        success: false,
        error: "User account not found. Please sign out and sign in again.",
      }
    }

    const sanitizedAddress = {
      user_id: sanitizedUserId,
      street: sanitizeString(validatedData.street, { maxLength: 200 }),
      city: sanitizeString(validatedData.city, { maxLength: 100 }),
      state: sanitizeString(validatedData.state, { maxLength: 100 }),
      zip: "",
      country: sanitizeString(validatedData.country, { maxLength: 100 }),
      is_default: true,
    }

    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .insert([sanitizedAddress])
      .select()
      .single()

    if (addressError) {
      console.error("Address creation error:", addressError)
      return {
        success: false,
        error: "Failed to save shipping address: " + addressError.message,
      }
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: sanitizedUserId,
          email: sanitizeEmail(validatedData.email),
          phone: sanitizePhone(validatedData.phone),
          total,
          status: "PENDING",
          shipping_address_id: address.id,
        },
      ])
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return {
        success: false,
        error: orderError.message,
      }
    }

    // Create order items
    const orderItems = validatedCartItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Order items creation error:", itemsError)
    }

    return {
      success: true,
      orderId: order.id,
      total: order.total,
    }
  } catch (error) {
    console.error("Checkout error:", error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }
    return {
      success: false,
      error: "Failed to create order",
    }
  }
}
