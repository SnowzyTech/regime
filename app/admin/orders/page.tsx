"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface OrderAddress {
  street: string
  city: string
  state: string
  country: string
}

interface Order {
  id: string
  email: string
  total: number
  status: string
  created_at: string
  phone: string | null
  user_id: string
  addresses: OrderAddress | null
  customer_name?: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          credentials: "include",
        })
        if (!response.ok) {
          router.push("/admin/login")
          return
        }

        await loadOrders()
      } catch {
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!loading) {
      loadOrders()
    }
  }, [dateFilter, currentPage])

  const loadOrders = async () => {
    try {
      const response = await fetch(`/api/admin/orders?filter=${dateFilter}&page=${currentPage}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setFilteredOrders(data.orders || [])
        setTotalPages(data.totalPages || 1)
        setTotalOrders(data.total || 0)
      }
    } catch (error) {
      console.error("Failed to load orders:", error)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
        setFilteredOrders((prev) =>
          prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
        )
        toast.success("Order status updated")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to update order status")
      }
    } catch (error) {
      console.error("Failed to update order:", error)
      toast.error("Failed to update order status")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredOrders(
        orders.filter(
          (order) =>
            order.id.toLowerCase().includes(query) ||
            order.email.toLowerCase().includes(query) ||
            order.status.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, orders])

  if (loading) {
    return <div className="pt-8 text-center">Loading...</div>
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500 text-white",
    PAID: "bg-green-500 text-white",
    PROCESSING: "bg-blue-500 text-white",
    SHIPPED: "bg-blue-500 text-white",
    DELIVERED: "bg-green-500 text-white",
    CANCELLED: "bg-red-500 text-white",
    completed: "bg-green-500 text-white",
  }

  const statusOptions = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

  const getCustomerName = (order: Order) => {
    if (order.customer_name) return order.customer_name
    // Extract name from addresses if available
    if (order.addresses?.city) return order.addresses.city
    // Fallback to email username
    return order.email.split("@")[0]
  }

  return (
    <div className="pb-24 min-h-screen">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex border border-accent/60 p-3 rounded-sm bg-accent/90 items-center gap-2 text-primary-foreground hover:text-primary-foreground/80"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-light mb-4">Order Management</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <Select
            value={dateFilter}
            onValueChange={(value) => {
              setDateFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="month">Last month</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground mt-2">Total: {totalOrders} orders</p>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="regime-card py-12 text-center text-muted-foreground">
            {searchQuery ? "No orders found matching your search." : "No orders yet"}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="regime-card overflow-hidden">
              {/* Order Card - Full Width */}
              <div
                className="p-4 md:p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 items-start">
                  {/* Order ID */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                    <p className="font-mono text-sm md:text-base font-medium">#{order.id.slice(0, 8)}</p>
                  </div>

                  {/* Customer */}
                  <div className="col-span-1">
                    <p className="text-xs text-muted-foreground mb-1">Customer</p>
                    <p className="font-medium text-sm md:text-base truncate">{getCustomerName(order)}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.email}</p>
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="font-semibold text-sm md:text-base">₦{order.total.toLocaleString()}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-500 text-white"}`}
                    >
                      {order.status.toLowerCase()}
                    </span>
                  </div>

                  {/* Date + Expand Icon */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <p className="text-sm md:text-base">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-4">
                      {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="border-t border-border bg-muted/30 p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Customer Details</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">Email:</span> {order.email}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Phone:</span> {order.phone || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Shipping Address</h4>
                      {order.addresses ? (
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-muted-foreground">Street:</span> {order.addresses.street}
                          </p>
                          <p>
                            <span className="text-muted-foreground">City:</span> {order.addresses.city}
                          </p>
                          <p>
                            <span className="text-muted-foreground">State:</span> {order.addresses.state}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Country:</span> {order.addresses.country}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No address on file</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <h4 className="font-semibold mb-3">Update Status</h4>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                        disabled={updatingOrderId === order.id}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
