import { createClient } from "./client"

export async function uploadProductImage(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createClient()

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from("product-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("[v0] Upload error:", error)
      return { url: null, error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error("[v0] Upload exception:", error)
    return { url: null, error: "Failed to upload image" }
  }
}

export async function deleteProductImage(imageUrl: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createClient()

    // Extract file path from URL
    const urlParts = imageUrl.split("/product-images/")
    if (urlParts.length < 2) {
      return { success: false, error: "Invalid image URL" }
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage.from("product-images").remove([`products/${filePath}`])

    if (error) {
      console.error("[v0] Delete error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("[v0] Delete exception:", error)
    return { success: false, error: "Failed to delete image" }
  }
}
