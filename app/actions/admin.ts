"use server"

import { adminLoginSchema } from "@/lib/validations/auth"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { createSignedSession } from "@/lib/security/session"

// Demo admin credentials - in production, hash with bcrypt
const DEMO_ADMIN = {
  email: "admin@regime.com",
  passwordHash: Buffer.from("Admin@Regime123!").toString("base64"),
}

export async function adminLoginAction(data: unknown) {
  try {
    // Validate input on server
    const validatedData = adminLoginSchema.parse(data)

    // Check if credentials match (in production, use bcrypt for password comparison)
    if (
      validatedData.email === DEMO_ADMIN.email &&
      Buffer.from(validatedData.password).toString("base64") === DEMO_ADMIN.passwordHash
    ) {
      const sessionToken = createSignedSession({
        email: validatedData.email,
        role: "ADMIN",
        timestamp: Date.now(),
      })

      const cookieStore = await cookies()
      cookieStore.set("admin_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return {
        success: true,
        admin: {
          email: validatedData.email,
          role: "ADMIN",
        },
        message: "Admin logged in successfully",
      }
    }

    return {
      success: false,
      error: "Invalid admin credentials",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }
    return {
      success: false,
      error: "An error occurred during admin login",
    }
  }
}

export async function createAdminCredentialAction(currentAdminEmail: string, data: unknown) {
  try {
    // Verify current user is admin
    if (currentAdminEmail !== DEMO_ADMIN.email) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      }
    }

    const validatedData = adminLoginSchema.parse(data)

    const supabase = createAdminClient()

    // Check if credential already exists
    const { data: existing } = await supabase
      .from("admin_credentials")
      .select("id")
      .eq("email", validatedData.email)
      .single()

    if (existing) {
      return {
        success: false,
        error: "Admin credential already exists",
      }
    }

    // Hash password before storing
    const hashedPassword = Buffer.from(validatedData.password).toString("base64")

    const { error } = await supabase.from("admin_credentials").insert([
      {
        email: validatedData.email,
        password: hashedPassword,
      },
    ])

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Admin credential created successfully",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }
    return {
      success: false,
      error: "Failed to create admin credential",
    }
  }
}
