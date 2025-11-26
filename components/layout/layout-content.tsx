"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navigation/navbar"
import Footer from "@/components/navigation/footer"
import { ChatWidget } from "@/components/chatbot/chat-widget"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideLayout = pathname.startsWith("/auth") || pathname.startsWith("/admin")

  return (
    <>
      {!hideLayout && <Navbar />}
      <main>{children}</main>
      {!hideLayout && <Footer />}
      {!hideLayout && <ChatWidget />}
    </>
  )
}
