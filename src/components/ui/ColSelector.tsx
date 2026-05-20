"use client"

import { useState, useRef, useEffect } from "react"

export interface ColDef {
  key: string
  label: string
  alwaysOn?: boolean
}

interface Props {
  cols: ColDef[]
  visible: Record<string, boolean>
  onChange: (key: string, val: boolean) => void
}

export default function ColSelector({ cols, visible, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const active = cols.filter((c) => !c.alwaysOn && visible[c.key]).length
  const total  = cols.filter((c) => !c.alwaysOn).length

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 2,
          border: "1px solid #E0E0E0",
          background: open ? "#333333" : "white",
          color: open ? "#FEFEFE" : "#595959",
          fontSize: 11, fontWeight: 600, cursor: "pointer",
          letterSpacing: "0.04em", textTransform: "uppercase",
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {/* Columns icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/>
        </svg>
        Columnas
        <span style={{
          background: open ? "rgba(255,255,255,0.2)" : "#F0F0F0",
          color: open ? "#FEFEFE" : "#595959",
          borderRadius: 2, fontSize: 10, fontWeight: 700,
          padding: "1px 5px", minWidth: 18, textAlign: "center",
        }}>
          {active}/{total}
        </span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 100,
          background: "white", border: "1px solid #E0E0E0", borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)", padding: "6px 0", minWidth: 200,
        }}>
          <div style={{ padding: "6px 14px 8px", fontSize: 10, fontWeight: 700, color: "#959595", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid #F0F0F0" }}>
            Columnas visibles
          </div>
          {cols.map((col) => (
            <label key={col.key} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "7px 14px", cursor: col.alwaysOn ? "default" : "pointer",
              opacity: col.alwaysOn ? 0.5 : 1,
              transition: "background 0.1s",
            }}
              onMouseEnter={(e) => { if (!col.alwaysOn) (e.currentTarget as HTMLElement).style.background = "#F7F7F7" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
            >
              <input
                type="checkbox"
                checked={visible[col.key] ?? true}
                disabled={col.alwaysOn}
                onChange={(e) => !col.alwaysOn && onChange(col.key, e.target.checked)}
                style={{ accentColor: "#C0022C", width: 14, height: 14, cursor: col.alwaysOn ? "default" : "pointer" }}
              />
              <span style={{ fontSize: 13, color: "#333333", fontWeight: visible[col.key] ? 500 : 400 }}>
                {col.label}
              </span>
              {col.alwaysOn && (
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#C8C8C8", fontWeight: 500 }}>FIJO</span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
