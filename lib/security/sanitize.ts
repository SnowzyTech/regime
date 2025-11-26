/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize a string by escaping HTML entities
 */
export function escapeHtml(str: string): string {
  if (typeof str !== "string") return ""

  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  }

  return str.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char])
}

/**
 * Remove potentially dangerous characters and patterns
 */
export function sanitizeString(str: string, options: { maxLength?: number; allowNewlines?: boolean } = {}): string {
  if (typeof str !== "string") return ""

  const { maxLength = 10000, allowNewlines = true } = options

  let sanitized = str
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")

  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]/g, " ")
  }

  // Trim and limit length
  return sanitized.trim().slice(0, maxLength)
}

/**
 * Sanitize an email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== "string") return ""

  return email
    .toLowerCase()
    .trim()
    .slice(0, 254) // Max email length per RFC 5321
    .replace(/[<>]/g, "") // Remove angle brackets
}

/**
 * Sanitize a phone number - keep only digits and common separators
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== "string") return ""

  return phone
    .replace(/[^0-9+\-().\s]/g, "")
    .trim()
    .slice(0, 20)
}

/**
 * Sanitize a UUID - ensure it matches UUID format
 */
export function sanitizeUUID(uuid: string): string | null {
  if (typeof uuid !== "string") return null

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const trimmed = uuid.trim().toLowerCase()

  if (uuidRegex.test(trimmed)) {
    return trimmed
  }

  return null
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(
  value: unknown,
  options: { min?: number; max?: number; defaultValue?: number } = {},
): number {
  const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, defaultValue = 0 } = options

  const num = typeof value === "number" ? value : Number(value)

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return defaultValue
  }

  return Math.max(min, Math.min(max, num))
}

/**
 * Sanitize an object by recursively sanitizing all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (typeof obj !== "object" || obj === null) {
    return obj
  }

  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeString(item) : typeof item === "object" ? sanitizeObject(item) : item,
      )
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}

/**
 * Validate and sanitize a URL
 */
export function sanitizeUrl(url: string, allowedProtocols: string[] = ["http:", "https:"]): string | null {
  if (typeof url !== "string") return null

  try {
    const parsed = new URL(url)

    if (!allowedProtocols.includes(parsed.protocol)) {
      return null
    }

    // Prevent javascript: and data: URLs
    if (parsed.protocol === "javascript:" || parsed.protocol === "data:") {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}
