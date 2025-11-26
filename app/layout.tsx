import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "sonner"
import { LayoutContent } from "@/components/layout/layout-content"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "REGIME - Dermatology Skincare | Science-Backed Formulas",
  description: "Dermatology-grade skincare redefined. Science-backed formulas for modern skin health.",
  keywords: "skincare, dermatology, serums, moisturizers, cleansers, skincare routine",
  openGraph: {
    title: "REGIME - Dermatology Skincare",
    description: "Science-backed formulas redefining modern skin health.",
    url: "https://regime.com",
    siteName: "REGIME",
    images: [
      {
        url: "https://regime.com/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Providers>
          <LayoutContent>{children}</LayoutContent>
          <Analytics />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
