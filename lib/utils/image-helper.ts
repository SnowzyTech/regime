/**
 * Image Helper - Dynamically generates product image paths
 * Images follow naming convention: product-{id}-{type}.jpg
 * 
 * This allows you to:
 * 1. Add/replace images in /public folder without database changes
 * 2. Scale to unlimited products
 * 3. Easily manage images from the frontend
 */

/**
 * Map product titles to their image indices
 * This helps identify which product image set to use
 * Update this mapping to match your actual database product titles
 */
const PRODUCT_TITLE_TO_INDEX: Record<string, number> = {
  "THE REGIMEN DISCOLORATION SERUM": 1,
  "THE REGIMEN ULTRA LIGHT FACIAL MOISTURIZER": 2,
  "THE REGIMEN GLY-SA 10/2% ACNE WASH": 3,
  "THE REGIMEN FORMULA": 4,
  "THE REGIMEN BENZOYL PEROXIDE 10%": 5,
  "THE REGIMEN KLIGMAN": 6,
  "THE REGIMEN MINERAL SUNSCREEN": 7,
}

/**
 * Extract product image index from product ID or title
 * Tries multiple strategies to identify which image set to use
 */
export function extractProductIndex(productId: string, productTitle?: string): number {
  // Strategy 1: Check if product title matches known products
  if (productTitle && PRODUCT_TITLE_TO_INDEX[productTitle]) {
    return PRODUCT_TITLE_TO_INDEX[productTitle]
  }

  // Strategy 2: Try to extract numeric ID from UUID (last few digits)
  // This won't work for UUIDs, so we fall through

  // Strategy 3: Default to cycling through available image sets (1-7)
  // Use a simple hash of the product ID to pick an index
  let hash = 0
  for (let i = 0; i < productId.length; i++) {
    const char = productId.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  const index = (Math.abs(hash) % 7) + 1 // Maps to 1-7
  return index
}

/**
 * Generate image array for a product based on ID
 * Supports: main, hover, and up to 5 thumbnails
 * 
 * @param productId - The product ID (1, 2, 3, etc.)
 * @returns Array of image paths that match the naming convention
 */
export function generateProductImages(productId: number): string[] {
  const images = [
    `/product-${productId}-main.jpg`,
    `/product-${productId}-hover.jpg`,
    `/product-${productId}-thumb-1.jpg`,
    `/product-${productId}-thumb-2.jpg`,
    `/product-${productId}-thumb-3.jpg`,
  ]
  return images
}

/**
 * Get main product image
 * @param productId - The product ID
 * @returns Main image path
 */
export function getMainImage(productId: number): string {
  return `/product-${productId}-main.jpg`
}

/**
 * Get hover image for product card
 * @param productId - The product ID
 * @returns Hover image path
 */
export function getHoverImage(productId: number): string {
  return `/product-${productId}-hover.jpg`
}

/**
 * Get thumbnail images (excluding main and hover)
 * @param productId - The product ID
 * @returns Array of thumbnail paths
 */
export function getThumbnails(productId: number): string[] {
  return [
    `/product-${productId}-thumb-1.jpg`,
    `/product-${productId}-thumb-2.jpg`,
    `/product-${productId}-thumb-3.jpg`,
  ]
}
