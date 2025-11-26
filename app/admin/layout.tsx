"use client"

import { AdminLayoutWrapper } from "@/components/admin/admin-layout-wrapper"
import type { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
}
