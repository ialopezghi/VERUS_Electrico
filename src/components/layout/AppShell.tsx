"use client"

import { SessionProvider } from "next-auth/react"
import Sidebar from "./Sidebar"

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: "auto", padding: "28px 32px", minWidth: 0, background: "#F2F2F2" }}>
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
