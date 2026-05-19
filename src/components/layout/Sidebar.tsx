"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

const nav = [
  {
    label: "Proyectos",
    href: "/proyectos",
    icon: <img src="/icons/dark/speedometer-04.svg" alt="" width={18} height={18} />,
    iconActive: <img src="/icons/red/speedometer-04.svg" alt="" width={18} height={18} />,
  },
  {
    label: "Gestión",
    href: "/gestion",
    icon: <img src="/icons/dark/folder.svg" alt="" width={18} height={18} />,
    iconActive: <img src="/icons/red/folder.svg" alt="" width={18} height={18} />,
  },
  {
    label: "Usuarios",
    href: "/usuarios",
    icon: <img src="/icons/dark/user-01.svg" alt="" width={18} height={18} />,
    iconActive: <img src="/icons/red/user-01.svg" alt="" width={18} height={18} />,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "#FEFEFE",
      borderRight: "1px solid #E0E0E0",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Logo GHI + marca VERUS */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #E0E0E0" }}>
        <img src="/logo-ghi-full.svg" alt="GHI Hornos Industriales" style={{ width: 100, height: "auto", marginBottom: 14 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 4,
            background: "#C0022C",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#333333", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              VERUS
            </div>
            <div style={{ fontSize: 10, color: "#959595", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1 }}>
              Eléctrico
            </div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ padding: "10px 8px", flex: 1 }}>
        {nav.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 10px",
              borderRadius: 4,
              marginBottom: 2,
              textDecoration: "none",
              color: active ? "#C0022C" : "#959595",
              background: active ? "#FAE8EB" : "transparent",
              fontWeight: active ? 700 : 400,
              fontSize: 13,
              letterSpacing: "0.01em",
              transition: "all 0.15s",
            }}>
              {active ? item.iconActive : item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div style={{
        padding: "14px 16px",
        borderTop: "1px solid #E0E0E0",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 4,
          background: "#F2F2F2",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: 13, fontWeight: 700, color: "#333333",
        }}>
          {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#333333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {session?.user?.name ?? "Usuario"}
          </div>
          <div style={{ fontSize: 10, color: "#959595", letterSpacing: "0.02em" }}>
            {session?.user?.email?.split("@")[0] ?? ""}
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} title="Cerrar sesión"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#959595", padding: 4, borderRadius: 4, display: "flex" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
  )
}
