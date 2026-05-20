"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import ProyectoCard from "./ProyectoCard"
import ColSelector, { ColDef } from "@/components/ui/ColSelector"
import { fmt } from "@/lib/kpi"
import type { KpiResult } from "@/lib/kpi"
import ProgressBar from "@/components/ui/ProgressBar"

type Estado = "todos" | "en_proceso" | "activo" | "completado" | "pausado" | "ofertado"

interface Proyecto {
  id: string; orden: number; codigo: string; nombre: string | null; cliente: string | null
  ubicacion: string | null; tipoEquipo: string | null; estado: string
  fat: KpiResult; sat: KpiResult; total: number
}

interface Props { proyectos: Proyecto[] }

const ESTADO_LABELS: Record<string, string> = {
  todos: "Todos", en_proceso: "En proceso", activo: "Activo",
  completado: "Finalizado", pausado: "Pausado", ofertado: "Ofertado",
}
const ESTADO_COLORS: Record<string, string> = {
  en_proceso: "#F59E0B", activo: "#22C55E", completado: "#959595",
  pausado: "#EF4444", ofertado: "#A78BFA",
}

const TABLE_COLS: ColDef[] = [
  { key: "codigo",     label: "Código",      alwaysOn: true },
  { key: "cliente",    label: "Cliente" },
  { key: "ubicacion",  label: "Ubicación" },
  { key: "tipoEquipo", label: "Tipo equipo" },
  { key: "estado",     label: "Estado" },
  { key: "fatTotal",   label: "% FAT" },
  { key: "satTotal",   label: "% SAT" },
  { key: "total",      label: "% Total" },
  { key: "fatMang",    label: "Mang. FAT" },
  { key: "fatSen",     label: "Señ. FAT" },
  { key: "satMang",    label: "Mang. SAT" },
  { key: "satSen",     label: "Señ. SAT" },
]

const DEFAULT_COLS: Record<string, boolean> = {
  codigo: true, cliente: true, ubicacion: false, tipoEquipo: false,
  estado: true, fatTotal: true, satTotal: true, total: true,
  fatMang: false, fatSen: false, satMang: false, satSen: false,
}

function useLocalStorage<T>(key: string, def: T) {
  const [val, setVal] = useState<T>(def)
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setVal(JSON.parse(s)) } catch {}
  }, [key])
  function set(v: T) { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }
  return [val, set] as const
}

const TH = ({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) =>
  visible ? (
    <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "#959595", fontSize: 11, borderBottom: "1px solid #E0E0E0", background: "#F7F7F7", whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {children}
    </th>
  ) : null

const TD = ({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) =>
  visible ? (
    <td style={{ padding: "10px 14px", color: "#595959", fontSize: 13, borderBottom: "1px solid #F3F4F6", whiteSpace: "nowrap" }}>
      {children}
    </td>
  ) : null

export default function ProyectosClient({ proyectos }: Props) {
  const [view,           setView]           = useLocalStorage<"tarjetas" | "tabla">("verus_proj_view", "tarjetas")
  const [cols,           setCols]           = useLocalStorage<Record<string, boolean>>("verus_proj_cols", DEFAULT_COLS)
  const [estadoFt,       setEstadoFt]       = useState<Estado>("todos")
  const [openGroups,     setOpenGroups]     = useState<Set<number>>(new Set())
  const [selectedOrdens, setSelectedOrdens] = useState<Set<number>>(new Set())
  const [dropdownOpen,   setDropdownOpen]   = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const filtered = proyectos.filter((p) => estadoFt === "todos" || p.estado === estadoFt)
  const estados  = Array.from(new Set(proyectos.map((p) => p.estado)))

  // Desplegable disponible para en_proceso, activo y completado
  const showDropdown = estadoFt === "en_proceso" || estadoFt === "activo" || estadoFt === "completado"

  // Grupos únicos del estado actual (para el desplegable)
  const dropdownGroups: Map<number, string | null> = new Map()
  if (showDropdown) {
    for (const p of filtered) {
      if (!dropdownGroups.has(p.orden)) dropdownGroups.set(p.orden, p.cliente)
    }
  }

  // Tarjetas/tabla filtradas por orden seleccionado (en_proceso y activo)
  const filteredCards = estadoFt !== "completado" && selectedOrdens.size > 0
    ? filtered.filter((p) => selectedOrdens.has(p.orden))
    : filtered

  // Grupos visibles según selección (completado — vista acordeón)
  const completadosGroups: Map<number, { cliente: string | null; items: typeof filtered }> = new Map()
  if (estadoFt === "completado") {
    for (const p of filtered) {
      if (selectedOrdens.size > 0 && !selectedOrdens.has(p.orden)) continue
      const g = completadosGroups.get(p.orden) ?? { cliente: p.cliente, items: [] }
      g.items.push(p)
      completadosGroups.set(p.orden, g)
    }
  }

  function toggleOrden(orden: number) {
    setSelectedOrdens((prev) => {
      const next = new Set(prev)
      if (next.has(orden)) next.delete(orden)
      else next.add(orden)
      return next
    })
  }

  function toggleGroup(orden: number) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(orden)) next.delete(orden)
      else next.add(orden)
      return next
    })
  }

  const isOpen  = (orden: number) => !openGroups.has(orden)

  function toggleCol(key: string, val: boolean) { setCols({ ...cols, [key]: val }) }
  const v = (key: string) => cols[key] ?? DEFAULT_COLS[key] ?? true

  return (
    <div>
      {/* ── Toolbar principal ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: estadoFt === "completado" ? 12 : 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {(["todos", ...estados] as Estado[]).map((e) => (
            <button key={e} onClick={() => { setEstadoFt(e); setSelectedOrdens(new Set()); setDropdownOpen(false) }} style={{
              padding: "5px 12px", borderRadius: 2, fontSize: 11, fontWeight: estadoFt === e ? 700 : 400,
              cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase",
              border: estadoFt === e ? "none" : "1px solid #E0E0E0",
              background: estadoFt === e ? (ESTADO_COLORS[e] ?? "#333333") : "white",
              color: estadoFt === e ? "white" : "#595959", transition: "all 0.15s",
            }}>
              {ESTADO_LABELS[e] ?? e}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Vista toggle */}
        <div style={{ display: "flex", border: "1px solid #E0E0E0", borderRadius: 2, overflow: "hidden" }}>
          {([
            { mode: "tarjetas", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { mode: "tabla",    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> },
          ] as { mode: "tarjetas" | "tabla"; icon: React.ReactNode }[]).map(({ mode, icon }) => (
            <button key={mode} onClick={() => setView(mode)} title={mode} style={{
              padding: "5px 10px", border: "none", cursor: "pointer",
              background: view === mode ? "#333333" : "white",
              color: view === mode ? "white" : "#595959", transition: "all 0.15s",
            }}>
              {icon}
            </button>
          ))}
        </div>

        {view === "tabla" && (
          <ColSelector cols={TABLE_COLS} visible={cols} onChange={toggleCol} />
        )}
      </div>

      {/* ── Desplegable filtro (En proceso / Activo / Finalizados) ── */}
      {showDropdown && dropdownGroups.size > 1 && (
        <div style={{ marginBottom: 20 }} ref={dropdownRef}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 14px", minWidth: 260,
                border: "1px solid #C0022C", borderRadius: 2,
                background: "white", cursor: "pointer",
                fontSize: 13, color: selectedOrdens.size > 0 ? "#333333" : "#959595",
                fontWeight: selectedOrdens.size > 0 ? 600 : 400,
              }}
            >
              <span style={{ flex: 1, textAlign: "left" }}>
                {selectedOrdens.size === 0
                  ? "Filtrar por proyecto..."
                  : `${selectedOrdens.size} proyecto${selectedOrdens.size > 1 ? "s" : ""} seleccionado${selectedOrdens.size > 1 ? "s" : ""}`}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C0022C" strokeWidth="2.5"
                style={{ transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 2px)", left: 0, zIndex: 200,
                background: "white", border: "1px solid #C0022C", borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)", minWidth: 260,
              }}>
                {selectedOrdens.size > 0 && (
                  <button
                    onClick={() => setSelectedOrdens(new Set())}
                    style={{
                      width: "100%", padding: "7px 14px", border: "none", borderBottom: "1px solid #F0F0F0",
                      background: "transparent", cursor: "pointer", textAlign: "left",
                      fontSize: 11, color: "#C0022C", fontWeight: 600, letterSpacing: "0.04em",
                    }}
                  >
                    Mostrar todos
                  </button>
                )}
                {Array.from(dropdownGroups.entries()).map(([orden, cliente]) => (
                  <label key={orden} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 14px", cursor: "pointer",
                    borderBottom: "1px solid #F7F7F7",
                    background: selectedOrdens.has(orden) ? "#FFF5F6" : "white",
                    transition: "background 0.1s",
                  }}
                    onMouseEnter={(e) => { if (!selectedOrdens.has(orden)) (e.currentTarget as HTMLElement).style.background = "#F7F7F7" }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = selectedOrdens.has(orden) ? "#FFF5F6" : "white" }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOrdens.has(orden)}
                      onChange={() => toggleOrden(orden)}
                      style={{ accentColor: "#C0022C", width: 15, height: 15, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: 13, color: "#333333", fontWeight: selectedOrdens.has(orden) ? 600 : 400 }}>
                      {orden} — {cliente}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Vista tarjetas — no completados ── */}
      {view === "tarjetas" && estadoFt !== "completado" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 16 }}>
          {filteredCards.map((p) => <ProyectoCard key={p.id} proyecto={p} />)}
          {filteredCards.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#959595" }}>
              Sin proyectos con ese filtro
            </div>
          )}
        </div>
      )}

      {/* ── Vista tarjetas — Finalizados agrupados ── */}
      {view === "tarjetas" && estadoFt === "completado" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {completadosGroups.size === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "#959595" }}>Sin proyectos finalizados</div>
          )}
          {Array.from(completadosGroups.entries()).map(([orden, group]) => (
            <div key={orden} style={{ background: "white", borderRadius: 4, border: "1px solid #E0E0E0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <button
                onClick={() => toggleGroup(orden)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 18px", background: "#F7F7F7", border: "none",
                  cursor: "pointer", borderBottom: isOpen(orden) ? "1px solid #E0E0E0" : "none",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EFEFEF" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#F7F7F7" }}
              >
                <span style={{
                  display: "inline-block", padding: "2px 8px", borderRadius: 2,
                  background: "#33333318", color: "#333333", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.06em",
                }}>
                  {orden}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#333333" }}>{group.cliente}</span>
                <span style={{ fontSize: 12, color: "#959595", marginLeft: 4 }}>
                  {group.items.length} {group.items.length === 1 ? "horno" : "hornos"}
                </span>
                <span style={{ marginLeft: "auto", color: "#959595", transform: isOpen(orden) ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
              {isOpen(orden) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 16, padding: 16 }}>
                  {group.items.map((p) => <ProyectoCard key={p.id} proyecto={p} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Vista tabla ── */}
      {view === "tabla" && (
        <div style={{ background: "white", borderRadius: 4, border: "1px solid #E0E0E0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <TH visible={v("codigo")}>Código</TH>
                  <TH visible={v("cliente")}>Cliente</TH>
                  <TH visible={v("ubicacion")}>Ubicación</TH>
                  <TH visible={v("tipoEquipo")}>Tipo</TH>
                  <TH visible={v("estado")}>Estado</TH>
                  <TH visible={v("fatTotal")}>% FAT</TH>
                  <TH visible={v("satTotal")}>% SAT</TH>
                  <TH visible={v("total")}>% Total</TH>
                  <TH visible={v("fatMang")}>Mang. FAT</TH>
                  <TH visible={v("fatSen")}>Señ. FAT</TH>
                  <TH visible={v("satMang")}>Mang. SAT</TH>
                  <TH visible={v("satSen")}>Señ. SAT</TH>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF5F6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "white" : "#FAFAFA")}
                  >
                    {v("codigo") && (
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #F3F4F6", whiteSpace: "nowrap" }}>
                        <Link href={`/proyectos/${p.id}`} style={{ textDecoration: "none" }}>
                          <span style={{ fontWeight: 700, color: "#C0022C", fontSize: 12 }}>{p.codigo}</span>
                          {p.nombre && <span style={{ fontSize: 12, color: "#595959", marginLeft: 8 }}>{p.nombre}</span>}
                        </Link>
                      </td>
                    )}
                    <TD visible={v("cliente")}>{p.cliente ?? "—"}</TD>
                    <TD visible={v("ubicacion")}>{p.ubicacion ?? "—"}</TD>
                    <TD visible={v("tipoEquipo")}>{p.tipoEquipo ?? "—"}</TD>
                    {v("estado") && (
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #F3F4F6", whiteSpace: "nowrap" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 2,
                          background: `${ESTADO_COLORS[p.estado] ?? "#959595"}20`,
                          color: ESTADO_COLORS[p.estado] ?? "#959595",
                          letterSpacing: "0.06em", textTransform: "uppercase",
                        }}>
                          {ESTADO_LABELS[p.estado] ?? p.estado}
                        </span>
                      </td>
                    )}
                    {v("fatTotal") && (
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #F3F4F6", minWidth: 90 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 3 }}>{fmt(p.fat.pctFase)}%</div>
                        <ProgressBar value={p.fat.pctFase} color="#C0022C" height={4} />
                      </td>
                    )}
                    {v("satTotal") && (
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #F3F4F6", minWidth: 90 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 3 }}>{fmt(p.sat.pctFase)}%</div>
                        <ProgressBar value={p.sat.pctFase} color="#C0022C" height={4} />
                      </td>
                    )}
                    {v("total") && (
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #F3F4F6", minWidth: 90 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#C0022C", marginBottom: 3 }}>{fmt(p.total)}%</div>
                        <ProgressBar value={p.total} color="#C0022C" height={4} />
                      </td>
                    )}
                    <TD visible={v("fatMang")}>{p.fat.totalMangueras > 0 ? `${fmt(p.fat.pctMangueras)}%` : "—"}</TD>
                    <TD visible={v("fatSen")}>{p.fat.totalSenales > 0 ? `${fmt(p.fat.pctSenales)}%` : "—"}</TD>
                    <TD visible={v("satMang")}>{p.sat.totalMangueras > 0 ? `${fmt(p.sat.pctMangueras)}%` : "—"}</TD>
                    <TD visible={v("satSen")}>{p.sat.totalSenales > 0 ? `${fmt(p.sat.pctSenales)}%` : "—"}</TD>
                  </tr>
                ))}
                {filteredCards.length === 0 && (
                  <tr><td colSpan={12} style={{ padding: 40, textAlign: "center", color: "#959595" }}>Sin proyectos con ese filtro</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
