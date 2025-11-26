"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        setError(error.message)
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        toast.error("Failed to create account")
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email!,
        name: name || data.user.email?.split("@")[0] || "User",
        role: "USER",
      })

      if (insertError) {
        // If insert fails due to duplicate, ignore it (user already exists)
        if (insertError.code !== "23505") {
          console.error("Failed to create user record:", insertError)
          toast.error("Account created but setup incomplete. Please try signing in.")
          setLoading(false)
          return
        }
      }

      toast.success("Account created successfully!")
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("Sign up error:", err)
      setError("An error occurred. Please try again.")
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md regime-card">
        <h1 className="text-3xl font-light mb-2">Create Account</h1>
        <p className="text-muted-foreground mb-8">Join REGIME for personalized skincare</p>

        {error && <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Your name"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full regime-button disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground mb-4">Already have an account?</p>
          <Link href="/auth/sign-in" className="regime-button-outline block">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
