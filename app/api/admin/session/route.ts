import { NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/security/admin-auth"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    console.log("[v0] Session check - Token exists:", !!sessionToken)
    console.log("[v0] Session check - Token length:", sessionToken?.length || 0)

    const authResult = await verifyAdminAuth()

    console.log("[v0] Auth result:", {
      isAuthenticated: authResult.isAuthenticated,
      hasSession: !!authResult.session,
      error: authResult.error,
    })

    if (!authResult.isAuthenticated || !authResult.session) {
      return NextResponse.json({ error: authResult.error || "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      admin: {
        email: authResult.session.email,
        role: authResult.session.role,
      },
    })
  } catch (error) {
    console.error("[v0] Session API error:", error)
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }
}
