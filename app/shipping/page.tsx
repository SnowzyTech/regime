"use client"

import { motion } from "framer-motion"

export default function ShippingPage() {
  return (
    <div className="pt-32 pb-24 bg-background">
      <div className="regime-container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="regime-section-title mb-8">Shipping & Returns Policy</h1>

          <div className="space-y-8 text-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
              <p className="mb-4">We ship all orders via tracked courier services to ensure safe delivery.</p>
              <div className="bg-secondary p-6 rounded-lg">
                <h3 className="font-semibold mb-3">Shipping Rates:</h3>
                <ul className="space-y-2 ml-4">
                  <li>Standard Shipping (5-7 business days): $10</li>
                  <li>Express Shipping (2-3 business days): $25</li>
                  <li>Overnight Shipping (Next business day): $40</li>
                  <li>Free shipping on orders over $150</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Return Eligibility</h2>
              <p>We offer returns within 30 days of purchase. Items must be:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Unused and in original packaging</li>
                <li>Not opened or tampered with</li>
                <li>In resellable condition</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How to Return</h2>
              <p>To initiate a return:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2 ml-4">
                <li>Contact us at returns@regime.com</li>
                <li>Provide your order number</li>
                <li>Receive a prepaid return label</li>
                <li>Ship the item back to us</li>
                <li>Receive your refund within 7 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Refund Processing</h2>
              <p>
                Refunds are processed to the original payment method within 5-7 business days of receiving and
                inspecting your return.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
