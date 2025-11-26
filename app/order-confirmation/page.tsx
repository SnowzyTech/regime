"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

export default function OrderConfirmationPage() {
  const orderId = "ORD-" + Date.now()

  return (
    <div className="pt-32 pb-24 bg-background min-h-screen flex items-center justify-center">
      <div className="regime-container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="regime-card text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <CheckCircle size={64} className="text-accent" />
          </motion.div>

          <h1 className="text-4xl font-light mb-4">Order Confirmed!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Thank you for your purchase. Your order is being prepared.
          </p>

          <div className="bg-secondary p-6 rounded-lg mb-8">
            <p className="text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="text-2xl font-semibold">{orderId}</p>
          </div>

          <p className="text-foreground mb-8">
            A confirmation email has been sent to your email address with tracking information.
          </p>

          <div className="space-y-3">
            <Link href="/account" className="regime-button block">
              View Order Status
            </Link>
            <Link href="/shop" className="regime-button-outline block">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
