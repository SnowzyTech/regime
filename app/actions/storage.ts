"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { verifyAdminAuth } from "@/lib/security/admin-auth"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]

const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function uploadImageAction(formData: FormData) {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.isAuthenticated) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      }
    }

    const file = formData.get("file") as File
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      }
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, GIF, WebP, and AVIF images are allowed.",
      }
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "File size too large. Max 5MB.",
      }
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase()
    const validExtensions: Record<string, string[]> = {
      "image/jpeg": ["jpg", "jpeg"],
      "image/png": ["png"],
      "image/gif": ["gif"],
      "image/webp": ["webp"],
      "image/avif": ["avif"],
    }

    if (!fileExt || !validExtensions[file.type]?.includes(fileExt)) {
      return {
        success: false,
        error: "File extension does not match file type.",
      }
    }

    const supabase = createAdminClient()

    const randomId = crypto.randomUUID()
    const fileName = `${randomId}.${fileExt}`
    const filePath = `products/${fileName}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file to Supabase Storage using Service Role (bypasses RLS)
    const { error } = await supabase.storage.from("product-images").upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error) {
    console.error("Upload exception:", error)
    return {
      success: false,
      error: "Failed to upload image",
    }
  }
}
