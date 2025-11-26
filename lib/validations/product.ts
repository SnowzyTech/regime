import { z } from "zod"

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title too long"), // Add max length
  description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description too long"), // Add max length
  price: z.number().min(0, "Price must be positive").max(10000000, "Price too large"), // Add max value
  category: z.string().min(1, "Category is required").max(100, "Category too long"), // Add max length
  productType: z.string().min(1, "Product type is required").max(100, "Product type too long"), // Add max length
  skinConcern: z.string().max(100, "Skin concern too long").optional(), // Add max length
  sku: z.string().min(1, "SKU is required").max(50, "SKU too long"), // Add max length
  stock: z.number().min(0, "Stock cannot be negative").max(1000000, "Stock too large"), // Add max value
  images: z.array(z.string().url().max(500, "Image URL too long")).max(20, "Too many images").optional(), // Add limits
  ingredients: z.array(z.string().max(200, "Ingredient name too long")).max(100, "Too many ingredients").optional(), // Add limits
  application: z.string().max(2000, "Application instructions too long").optional(), // Add max length
  warning: z.string().max(1000, "Warning text too long").optional(), // Add max length
  sizes: z.array(z.string().max(50, "Size too long")).max(20, "Too many sizes").optional(), // Add limits
})

export type ProductFormData = z.infer<typeof productSchema>
