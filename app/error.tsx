"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="pt-32 pb-24 regime-container min-h-screen flex items-center justify-center">
      <div className="regime-card max-w-md text-center">
        <h1 className="text-3xl font-light mb-4">Something went wrong!</h1>
        <p className="text-muted-foreground mb-8">{error.message}</p>
        <div className="space-y-3">
          <button onClick={reset} className="w-full regime-button">
            Try Again
          </button>
          <Link href="/" className="w-full regime-button-outline block">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
