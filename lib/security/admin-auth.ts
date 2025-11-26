/**
 * Admin authentication verification utilities
 * Used to protect admin routes and server actions
 */

import { cookies } from "next/headers"
import { verifySignedSession, type AdminSession } from "./session"

export interface AdminAuthResult {
  isAuthenticated: boolean
  session: AdminSession | null
  error?: string
}

/**
 * Verify admin session from cookies (for server actions and API routes)
 */
export async function verifyAdminAuth(): Promise<AdminAuthResult> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (!sessionToken) {
      return {
        isAuthenticated: false,
        session: null,
        error: "No admin session found",
      }
    }

    const session = verifySignedSession(sessionToken)

    if (!session) {
      return {
        isAuthenticated: false,
        session: null,
        error: "Invalid or expired session",
      }
    }

    if (session.role !== "ADMIN") {
      return {
        isAuthenticated: false,
        session: null,
        error: "Insufficient permissions",
      }
    }

    return {
      isAuthenticated: true,
      session,
    }
  } catch (error) {
    console.error("Admin auth verification error:", error)
    return {
      isAuthenticated: false,
      session: null,
      error: "Authentication verification failed",
    }
  }
}

/**
 * Higher-order function to wrap server actions with admin auth
 */
export function withAdminAuth<T extends (...args: unknown[]) => Promise<unknown>>(
  action: T,
): (...args: Parameters<T>) => Promise<ReturnType<T> | { success: false; error: string }> {
  return async (...args: Parameters<T>) => {
    const authResult = await verifyAdminAuth()

    if (!authResult.isAuthenticated) {
      return {
        success: false,
        error: authResult.error || "Unauthorized: Admin access required",
      }
    }

    return action(...args) as ReturnType<T>
  }
}

/**
 * Verify admin session from request headers (for API routes)
 */
export async function verifyAdminAuthFromRequest(): Promise<AdminAuthResult> {
  return verifyAdminAuth()
}
