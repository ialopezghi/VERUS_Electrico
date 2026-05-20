"use client"

import { SessionProvider } from "next-auth/react"
import { useState } from "react"
import Sidebar from "./Sidebar"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-col flex-1 min-w-0">
          {/* Top bar — solo móvil */}
          <header
            className="flex md:hidden items-center gap-3 px-4 shrink-0"
            style={{ height: 52, background: "#FEFEFE", borderBottom: "1px solid #E0E0E0" }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ padding: 6, borderRadius: 4, background: "none", border: "none", cursor: "pointer", color: "#333333", display: "flex" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <img src="/logo-ghi-full.svg" alt="GHI" style={{ height: 22, width: "auto" }} />

            <div style={{ flex: 1 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 3,
                background: "#C0022C",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#333333", letterSpacing: "0.05em" }}>VERUS</span>
            </div>
          </header>

          <main
            className="flex-1 overflow-auto p-4 md:p-8"
            style={{ background: "#F2F2F2" }}
          >
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
