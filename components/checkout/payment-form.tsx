"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface PaymentFormProps {
  amount: number
  orderId: string
  email: string
  onSuccess?: () => void
}

export default function PaymentForm({ amount, orderId, email, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePaystackPayment = async () => {
    setLoading(true)

    try {
      // Initialize Paystack payment
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount,
          orderId,
          metadata: { orderId },
        }),
      })

      const data = await response.json()

      if (data.authorizationUrl) {
        // Redirect to Paystack checkout
        window.location.href = data.authorizationUrl
      } else {
        console.error("Failed to initialize payment")
      }
    } catch (error) {
      console.error("Payment error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handlePaystackPayment} disabled={loading} className="w-full regime-button disabled:opacity-50">
        {loading ? "Initializing Payment..." : "Pay with Paystack"}
      </button>
    </div>
  )
}
