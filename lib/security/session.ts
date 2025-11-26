/**
 * Secure session management utilities
 * Uses HMAC for session signing to prevent tampering
 */

import crypto from "crypto"

// Session secret should be set in environment variables
const SESSION_SECRET =
  process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "fallback-secret-change-in-production"

console.log("[v0] Session secret configured:", SESSION_SECRET.substring(0, 8) + "...")

export interface AdminSession {
  email: string
  role: string
  timestamp: number
  expiresAt: number
}

/**
 * Create a signed session token
 */
export function createSignedSession(
  data: Omit<AdminSession, "expiresAt">,
  expiresInMs: number = 7 * 24 * 60 * 60 * 1000,
): string {
  const session: AdminSession = {
    ...data,
    expiresAt: Date.now() + expiresInMs,
  }

  const payload = Buffer.from(JSON.stringify(session)).toString("base64url")
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url")

  const token = `${payload}.${signature}`

  console.log("[v0] createSignedSession - Email:", data.email)
  console.log("[v0] createSignedSession - Payload length:", payload.length)
  console.log("[v0] createSignedSession - Signature length:", signature.length)
  console.log("[v0] createSignedSession - Full token length:", token.length)
  console.log("[v0] createSignedSession - Full token:", token)

  return token
}

/**
 * Verify and decode a signed session token
 */
export function verifySignedSession(token: string): AdminSession | null {
  if (!token || typeof token !== "string") {
    console.log("[v0] verifySignedSession: No token provided")
    return null
  }

  console.log("[v0] verifySignedSession - Received token:", token)
  console.log("[v0] verifySignedSession - Token length:", token.length)

  const parts = token.split(".")

  if (parts.length !== 2) {
    console.log("[v0] verifySignedSession: Invalid token format, parts:", parts.length)
    console.log("[v0] verifySignedSession: Parts are:", parts)
    return null
  }

  const [payload, signature] = parts

  console.log("[v0] verifySignedSession - Payload length:", payload.length)
  console.log("[v0] verifySignedSession - Signature length:", signature.length)

  // Verify signature
  const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url")

  // This is simpler and avoids the buffer length mismatch issue
  if (signature !== expectedSignature) {
    console.log("[v0] verifySignedSession: Signature mismatch")
    console.log("[v0] Got signature:", signature.substring(0, 10) + "...")
    console.log("[v0] Expected:", expectedSignature.substring(0, 10) + "...")
    return null
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as AdminSession

    // Check expiration
    if (Date.now() > session.expiresAt) {
      console.log("[v0] verifySignedSession: Session expired")
      return null
    }

    console.log("[v0] verifySignedSession: Success for", session.email)
    return session
  } catch (error) {
    console.log("[v0] verifySignedSession: Parse error", error)
    return null
  }
}

/**
 * Hash a password using PBKDF2 (more secure than bcrypt for server actions)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(32).toString("hex")
  const iterations = 100000

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err)
      resolve(`${salt}:${iterations}:${derivedKey.toString("hex")}`)
    })
  })
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, iterations, key] = hash.split(":")

  if (!salt || !iterations || !key) {
    return false
  }

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, Number.parseInt(iterations), 64, "sha512", (err, derivedKey) => {
      if (err) reject(err)

      // Use timing-safe comparison
      try {
        const hashBuffer = Buffer.from(key, "hex")
        resolve(crypto.timingSafeEqual(hashBuffer, derivedKey))
      } catch {
        resolve(false)
      }
    })
  })
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}
