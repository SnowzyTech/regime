import Link from "next/link"

export default function NotFound() {
  return (
    <div className="pt-32 pb-24 regime-container min-h-screen flex items-center justify-center">
      <div className="regime-card max-w-md text-center">
        <h1 className="text-6xl font-light mb-4">404</h1>
        <h2 className="text-2xl font-light mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="regime-button inline-block">
          Go Home
        </Link>
      </div>
    </div>
  )
}
