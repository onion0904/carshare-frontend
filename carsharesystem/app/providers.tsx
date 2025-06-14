"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { SettingsProvider } from "@/lib/settings-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <AuthProvider>{children}</AuthProvider>
    </SettingsProvider>
  )
}
