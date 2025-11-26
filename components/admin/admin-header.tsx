"use client"

import { Menu } from "lucide-react"

interface AdminHeaderProps {
  onMenuToggle: () => void
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-background z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold font-mono text-foreground">Admin Dashboard</h1>
        <button
          onClick={onMenuToggle}
          className="md:hidden bg-primary-foreground p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  )
}
