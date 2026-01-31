"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    reason: "General Inquiry",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ fullName: "", phone: "", email: "", reason: "General Inquiry", message: "" })
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="pt-32 pb-16 border-b border-border">
        <div className="regime-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="regime-section-title font-bold text-primary-foreground">Contact Us</h1>
            <p className="regime-section-subtitle max-w-2xl mx-auto text-primary-foreground/90">
              We're here to help and answer any question you might have. We look forward to hearing from you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="py-24 bg-primary-foreground">
        <div className="regime-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.form
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              onSubmit={handleSubmit}
              className="bg-card rounded-lg p-8 border border-border"
            >
              <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>

              <div className="space-y-6">
                {/* Full Name & Phone Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(123) 456-7890"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                </div>

                {/* Reason for Inquiry */}
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Inquiry</label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  >
                    <option>New Patient Inquiry</option>
                    <option>Follow-up Care</option>
                    <option>Product Question</option>
                    <option>Consultation Request</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please describe your inquiry..."
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>

                {success && <p className="text-sm text-green-600 text-center">Message sent successfully!</p>}

                <p className="text-xs text-muted-foreground text-center">
                  By sending this message, you agree to our Privacy Policy
                </p>
              </div>
            </motion.form>

            {/* Clinic Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-semibold mb-8">Our Clinic</h3>

                {/* Address */}
                <div className="flex gap-4 mb-6">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Address</h4>
                    <p className="text-muted-foreground">132 Ogbatuluenyi drive federal housing estate </p>
                    <p className="text-muted-foreground">33 Onitsha, Anambra</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4 mb-6">
                  <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <p className="text-muted-foreground">08038905589</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4 mb-6">
                  <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-muted-foreground">support@regime.com</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Operating Hours</h4>
                    <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p className="text-muted-foreground">Saturday & Sunday: Closed</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="w-full h-80 bg-muted rounded-lg border border-border flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">Google Map Integration</p>
                  <p className="text-xs text-muted-foreground mt-2">132 Ogbatuluenyi drive federal housing estate 33 Onitsha, Anambra</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
