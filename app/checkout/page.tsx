"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import Link from "next/link"
import { toast } from "sonner"
import { createOrderAction } from "@/app/actions/checkout"
import { createClient } from "@/lib/supabase/client"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: existingUser } = await supabase.from("users").select("id").eq("id", user.id).single()

        if (!existingUser) {
          const { error: insertError } = await supabase.from("users").insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            role: "USER",
          })

          if (insertError && insertError.code !== "23505") {
            console.error("Failed to create user record:", insertError)
            toast.error("Account setup error. Please contact support.")
            setCheckingAuth(false)
            return
          }
        }
      }

      setUser(user)

      if (user?.email) {
        setFormData((prev) => ({ ...prev, email: user.email! }))
      }

      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const shouldRestore = sessionStorage.getItem("checkoutRedirect")
    const savedFormData = sessionStorage.getItem("checkoutFormData")

    if (shouldRestore && savedFormData && user) {
      try {
        const parsed = JSON.parse(savedFormData)
        setFormData(parsed)
        sessionStorage.removeItem("checkoutRedirect")
      } catch (error) {
        console.error("Failed to restore form data:", error)
      }
    }
  }, [user])

  if (!cart || cart.items.length === 0) {
    return (
      <div className="pt-32 pb-24 regime-container min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-light mb-4">Checkout</h1>
        <p className="text-muted-foreground mb-8">Your cart is empty</p>
        <Link href="/shop" className="regime-button">
          Continue Shopping
        </Link>
      </div>
    )
  }

  const subtotal = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0)
  const shipping = 0
  const tax = 0
  const total = subtotal + shipping + tax

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required"
    }
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Name is required (at least 2 characters)"
    }
    if (!formData.phone || !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Valid phone number is required"
    }
    if (!formData.street || formData.street.trim().length < 5) {
      newErrors.street = "Street address is required (at least 5 characters)"
    }
    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = "City is required"
    }
    if (!formData.state || formData.state.trim().length < 2) {
      newErrors.state = "State is required"
    }
    if (!formData.country || formData.country.trim().length < 2) {
      newErrors.country = "Country is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    if (!user) {
      toast.error("Please sign in to continue with payment")
      sessionStorage.setItem("checkoutFormData", JSON.stringify(formData))
      sessionStorage.setItem("checkoutRedirect", "true")
      router.push("/auth/sign-in")
      return
    }

    setLoading(true)

    try {
      const cartItems = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
      }))

      const orderResult = await createOrderAction(user.id, cartItems, formData)

      if (!orderResult.success) {
        toast.error(orderResult.error || "Failed to create order")
        setLoading(false)
        return
      }

      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          amount: total,
          orderId: orderResult.orderId,
          metadata: {
            orderId: orderResult.orderId,
            customerName: formData.name,
            customerPhone: formData.phone,
          },
        }),
      })

      const paymentData = await response.json()

      if (paymentData.error || !paymentData.authorizationUrl) {
        toast.error("Failed to initialize payment")
        setLoading(false)
        return
      }

      clearCart()
      sessionStorage.removeItem("checkoutFormData")
      sessionStorage.removeItem("checkoutRedirect")

      window.location.href = paymentData.authorizationUrl
    } catch (error) {
      console.error("Checkout failed:", error)
      toast.error("Checkout failed. Please try again.")
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="pt-32 pb-24 regime-container min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 regime-container bg-primary-foreground">
      <h1 className="text-3xl font-light mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleCheckout} className="space-y-8">
            {/* Shipping Info */}
            <div className="regime-card">
              <h2 className="text-lg md:text-xl font-semibold mb-6 font-mono">Shipping Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg bg-input border ${
                      errors.email ? "border-destructive" : "border-border"
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg bg-input border ${
                        errors.name ? "border-destructive" : "border-border"
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                    />
                    {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+234 xxx xxx xxxx"
                      className={`w-full px-4 py-3 font-mono rounded-lg bg-input border ${
                        errors.phone ? "border-destructive" : "border-border"
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                    />
                    {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    placeholder="House number and street name"
                    className={`w-full px-4 py-3 rounded-lg bg-input border ${
                      errors.street ? "border-destructive" : "border-border"
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  />
                  {errors.street && <p className="text-destructive text-sm mt-1">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg bg-input border ${
                        errors.city ? "border-destructive" : "border-border"
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                    />
                    {errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg bg-input border ${
                        errors.state ? "border-destructive" : "border-border"
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                    />
                    {errors.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg bg-input border ${
                      errors.country ? "border-destructive" : "border-border"
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  />
                  {errors.country && <p className="text-destructive text-sm mt-1">{errors.country}</p>}
                </div>
              </div>
            </div>

            {/* Payment Info (Paystack) */}
            <div className="regime-card">
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
              <p className="text-muted-foreground mb-4">Secure payment powered by Paystack</p>
              {!user && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    You need to be signed in to continue with payment. Click the button below and you'll be redirected
                    to sign in.
                  </p>
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full regime-button disabled:opacity-50">
                {loading ? "Processing..." : user ? "Continue to Payment" : "Sign In to Continue"}
              </button>
            </div>
          </form>
        </div>

        <div className="regime-card h-fit sticky top-32">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6 pb-6 border-b border-border">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName} {item.size && `(${item.size})`} × {item.quantity}
                </span>
                <span>₦{(item.quantity * item.price).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-6 pb-6 border-b border-border">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `₦${shipping.toLocaleString()}`}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>₦{tax.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
