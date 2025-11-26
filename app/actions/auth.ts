"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { signUpSchema, signInSchema } from "@/lib/validations/auth"
import { z } from "zod"

export async function signUpAction(data: unknown) {
  try {
    // Validate input on server
    const validatedData = signUpSchema.parse(data)

    const supabase = await createServerSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", validatedData.email).single()

    if (existingUser) {
      return {
        success: false,
        error: "Email already registered",
      }
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          email: validatedData.email,
          name: validatedData.name,
          role: "USER",
        },
      ])
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      userId: newUser.id,
      message: "Account created successfully",
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
      error: "An error occurred during sign up",
    }
  }
}

export async function signInAction(data: unknown) {
  try {
    const validatedData = signInSchema.parse(data)

    const supabase = await createServerSupabaseClient()

    // Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("email", validatedData.email)
      .single()

    if (error || !user) {
      return {
        success: false,
        error: "Invalid email or password",
      }
    }

    return {
      success: true,
      user,
      message: "Signed in successfully",
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
      error: "An error occurred during sign in",
    }
  }
}
