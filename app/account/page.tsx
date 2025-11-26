"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { LogOut, ShoppingBasket as ShoppingHistory, UserIcon, MapPin } from "lucide-react"

interface UserData {
  id: string
  email: string
  name?: string
}

interface Order {
  id: string
  total: number
  status: string
  created_at: string
  payment_id: string | null
}

export default function AccountPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/auth/sign-in")
      } else {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.user_metadata?.full_name || "",
        })
        fetchUserOrders(data.user.id)
      }
      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  const fetchUserOrders = async (userId: string) => {
    setOrdersLoading(true)
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total, status, created_at, payment_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
      } else {
        setOrders(data || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="pt-32 pb-24 regime-container min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-blue-100 text-blue-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  return (
    <div className="pt-32 pb-24 bg-primary-foreground min-h-screen">
      <div className="regime-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="regime-section-title mb-4">My Account</h1>
          <p className="text-muted-foreground font-mono">Welcome, {user?.name || user?.email}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="regime-card sticky top-32">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "profile" ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserIcon size={18} />
                    <span>Profile</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "orders" ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingHistory size={18} />
                    <span>Orders</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "addresses" ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    <span>Addresses</span>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors mt-4"
                >
                  <div className="flex items-center gap-2">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="regime-card">
                <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="text-lg font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Full Name</label>
                    <p className="text-lg font-medium">{user?.name || "Not set"}</p>
                  </div>
                  <button className="regime-button">Edit Profile</button>
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="regime-card bg-background">
                <h2 className="text-2xl font-bold uppercase mb-6">Order History</h2>
                {ordersLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Link href="/shop" className="regime-button">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-mono text-sm text-primary-foreground">Order #{order.id.slice(0, 8)}...</p>
                            <p className="text-lg font-bold text-secondary">₦{order.total.toLocaleString()}</p>
                            <p className="text-sm text-primary-foreground">
                              {new Date(order.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                statusColors[order.status] || "bg-gray-100"
                              }`}
                            >
                              {order.status}
                            </span>
                            {order.payment_id && (
                              <p className="text-xs text-muted-foreground">Ref: {order.payment_id}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "addresses" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="regime-card">
                <h2 className="text-2xl font-semibold mb-6">Saved Addresses</h2>
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No addresses saved</p>
                  <button className="regime-button">Add Address</button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
