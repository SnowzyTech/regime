"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Copy, Check } from "lucide-react"
import { toast } from "sonner"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [copied, setCopied] = useState(false)
  const reference = searchParams.get("reference")

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setVerified(false)
        setVerifying(false)
        return
      }

      try {
        const response = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        })

        const data = await response.json()
        setVerified(data.status === "success")
      } catch (error) {
        console.error("Verification error:", error)
        setVerified(false)
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [reference])

  const copyReference = () => {
    if (reference) {
      navigator.clipboard.writeText(reference)
      setCopied(true)
      toast.success("Reference copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (verifying) {
    return (
      <div className="pt-32 pb-24 regime-container min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Verifying payment...</p>
      </div>
    )
  }

  if (!verified) {
    return (
      <div className="pt-32 pb-24 regime-container min-h-screen flex items-center justify-center">
        <div className="regime-card max-w-md text-center">
          <h1 className="text-3xl font-light mb-4">Payment Verification Failed</h1>
          <p className="text-muted-foreground mb-6">
            There was an issue verifying your payment. Please contact support.
          </p>
          <Link href="/contact" className="regime-button inline-block">
            Contact Support
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 regime-container min-h-screen flex items-center justify-center">
      <div className="regime-card max-w-md text-center">
        <CheckCircle size={64} className="text-accent mx-auto mb-6" />
        <h1 className="text-3xl font-light mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground mb-4">Your order has been confirmed and is being prepared for shipment.</p>

        {reference && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Reference Number</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-sm font-mono bg-background px-3 py-1 rounded">{reference}</code>
              <button
                onClick={copyReference}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="Copy reference"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/account" className="regime-button block">
            View Order
          </Link>
          <Link href="/shop" className="regime-button-outline block">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
