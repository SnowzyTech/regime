"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        console.error(error)
      } else {
        setSent(true)
      }
    } catch (err) {
      console.error("Reset failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-32 pb-24 regime-container min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md regime-card">
        <h1 className="text-3xl font-light mb-2">Reset Password</h1>
        <p className="text-muted-foreground mb-8">Enter your email and we'll send you a link to reset your password.</p>

        {sent ? (
          <div className="text-center">
            <div className="mb-6 p-4 bg-accent/10 text-accent rounded-lg">
              Check your email for a reset link. It may take a few minutes to arrive.
            </div>
            <p className="text-muted-foreground mb-6">
              Didn't receive an email?{" "}
              <button onClick={() => setSent(false)} className="text-accent hover:underline">
                Try again
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="you@example.com"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full regime-button disabled:opacity-50">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-border text-center">
          <Link href="/auth/sign-in" className="text-accent hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
