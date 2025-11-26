"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { verifyAdminAuth } from "@/lib/security/admin-auth"

export async function getDashboardStats() {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
        stats: { totalProducts: 0, totalOrders: 0 },
      }
    }

    const supabase = createAdminClient()

    // Fetch total products count
    const { count: productsCount, error: productsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })

    if (productsError) {
      console.error("Error fetching products count:", productsError)
    }

    // Fetch total orders count
    const { count: ordersCount, error: ordersError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })

    if (ordersError) {
      console.error("Error fetching orders count:", ordersError)
    }

    return {
      success: true,
      stats: {
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      success: false,
      stats: {
        totalProducts: 0,
        totalOrders: 0,
      },
    }
  }
}

export async function getTopProducts(limit = 5) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return { success: false, products: [], error: "Unauthorized" }
    }

    const supabase = createAdminClient()

    const safeLimit = Math.min(Math.max(1, limit), 50)

    const { data: products, error } = await supabase
      .from("products")
      .select("id, title, price, stock, images")
      .order("created_at", { ascending: false })
      .limit(safeLimit)

    if (error) {
      console.error("Error fetching top products:", error)
      return { success: false, products: [] }
    }

    return {
      success: true,
      products: products || [],
    }
  } catch (error) {
    console.error("Error fetching top products:", error)
    return {
      success: false,
      products: [],
    }
  }
}

export async function getTopOrders(limit = 5) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return { success: false, orders: [], error: "Unauthorized" }
    }

    const supabase = createAdminClient()

    const safeLimit = Math.min(Math.max(1, limit), 50)

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(safeLimit)

    if (error) {
      console.error("Error fetching top orders:", error)
      return { success: false, orders: [] }
    }

    return {
      success: true,
      orders: orders || [],
    }
  } catch (error) {
    console.error("Error fetching top orders:", error)
    return {
      success: false,
      orders: [],
    }
  }
}
