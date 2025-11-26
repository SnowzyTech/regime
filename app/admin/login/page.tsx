"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { adminLoginSchema, type AdminLoginFormData } from "@/lib/validations/auth"
import { adminLoginAction } from "@/app/actions/admin"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: AdminLoginFormData) {
    setIsLoading(true)
    try {
      const result = await adminLoginAction(data)

      if (result.success) {
        toast.success(result.message)
        await new Promise((resolve) => setTimeout(resolve, 500))
        router.refresh()
        router.push("/admin")
      } else {
        toast.error(result.error)
        form.setError("root", { message: result.error })
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">REGIME</h1>
          <p className="text-muted-foreground mt-2">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">Admin Login</h2>

          {form.formState.errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{form.formState.errors.root.message}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <Input
                          type="email"
                          placeholder="admin@regime.com"
                          className="pl-10"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>

          {/* Demo Credentials Notice */}
          <div className="mt-6 p-3 bg-secondary/30 rounded-lg border border-secondary">
            <p className="text-xs text-foreground font-mono">
              Demo: admin@regime.com
              <br />
              Pass: Admin@Regime123!
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back to Shop
          </Link>
        </div>
      </div>
    </div>
  )
}
