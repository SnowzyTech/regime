"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getDashboardStats, getTopProducts, getTopOrders } from "@/app/actions/dashboard"
import { Package, ShoppingCart, MessageSquare } from "lucide-react"
import Image from "next/image"

type Product = {
  id: string
  title: string
  price: number
  stock: number
  images: string[]
}

type Order = {
  id: string
  total: number
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0 })
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [topOrders, setTopOrders] = useState<Order[]>([])

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const sessionData = await response.json()
          setUser(sessionData.admin)
        }

        const statsResult = await getDashboardStats()
        if (statsResult.success) {
          setStats(statsResult.stats)
        }

        const productsResult = await getTopProducts(5)
        if (productsResult.success) {
          setTopProducts(productsResult.products)
        }

        const ordersResult = await getTopOrders(5)
        if (ordersResult.success) {
          setTopOrders(ordersResult.orders)
        }
      } catch (error) {
        console.error("Error fetching admin data:", error)
      }

      setLoading(false)
    }

    checkAdmin()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="bg-primary-foreground min-h-screen">
      <h1 className="text-3xl font-light mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="regime-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Package className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Products</p>
              <p className="text-3xl font-semibold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="regime-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Orders</p>
              <p className="text-3xl font-semibold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Products */}
        <div className="regime-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Top Products</h2>
            <Link href="/admin/products" className="text-accent text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.images?.[0] || "/placeholder.svg?height=64&width=64"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium truncate">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₦{product.price.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No products found</p>
            )}
          </div>
        </div>

        {/* Top Orders */}
        <div className="regime-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-accent text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {topOrders.length > 0 ? (
              topOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                  <div className="flex-grow">
                    <h3 className="font-medium">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₦{order.total.toLocaleString()}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No orders found</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Link href="/admin/products">
          <div className="regime-card hover:shadow-lg transition-shadow cursor-pointer h-full">
            <h2 className="text-xl font-semibold mb-4">Product Management</h2>
            <p className="text-muted-foreground mb-6">Add, edit, or delete products</p>
            <button className="regime-button w-full">Manage Products</button>
          </div>
        </Link>

        <Link href="/admin/orders">
          <div className="regime-card hover:shadow-lg transition-shadow cursor-pointer h-full">
            <h2 className="text-xl font-semibold mb-4">Order Management</h2>
            <p className="text-muted-foreground mb-6">View and update orders</p>
            <button className="regime-button w-full">View Orders</button>
          </div>
        </Link>

        <Link href="/admin/testimonials">
          <div className="regime-card hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Testimonials</h2>
            </div>
            <p className="text-muted-foreground mb-6">Create and assign reviews to products</p>
            <button className="regime-button w-full">Manage Reviews</button>
          </div>
        </Link>
      </div>
    </div>
  )
}
