"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"

export default function NewsletterCTA() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSuccess(true)
        setEmail("")
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Newsletter signup failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-12 md:py-24 bg-secondary overflow-hidden">
      <div className="regime-container max-w-2xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Begin Your Journey</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
            Get exclusive skincare tips and product launches delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-lg bg-input border border-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent text-sm md:text-base"
            />
            <button type="submit" disabled={loading} className="regime-button disabled:opacity-50 whitespace-nowrap">
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {success && <p className="text-accent mt-4 text-sm md:text-base">Successfully subscribed!</p>}
        </motion.div>
      </div>
    </section>
  )
}
