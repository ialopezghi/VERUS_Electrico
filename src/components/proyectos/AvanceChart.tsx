"use client"

import { useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, TooltipProps,
} from "recharts"

interface HistoricoAvance {
  id: string
  fecha: Date | string
  porcentajeFat:            number | string
  porcentajeTendidoFat:     number | string
  porcentajeConectadoFat:   number | string
  porcentajeSenalesFat:     number | string
  porcentajePruebasFat:     number | string
  porcentajeSat:            number | string
  porcentajeManguerasSat:   number | string
  porcentajeManguerasPfSat: number | string
  porcentajeSenalesSat:     number | string
  porcentajePruebasSat:     number | string
  porcentajeTotal:          number | string
}

interface Props { historico: HistoricoAvance[]; codigo: string }
type AvanceTab = "FAT" | "SAT" | "TOTAL"

function fmtFecha(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d
  return `${dt.getDate().toString().padStart(2, "0")}/${(dt.getMonth() + 1).toString().padStart(2, "0")}`
}
const n = (v: number | string) => Number(v)
const p2 = (v: number | string) => `${n(v).toFixed(1)}%`

// ── Tooltip ───────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "#1C1C1C", borderRadius: 4, padding: "10px 14px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)", minWidth: 160,
    }}>
      <div style={{ fontSize: 11, color: "#959595", marginBottom: 8, fontWeight: 600, letterSpacing: "0.06em" }}>
        {label}
      </div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: entry.color, fontWeight: 500 }}>{entry.name}</span>
          <span style={{ fontSize: 12, color: "#FEFEFE", fontWeight: 700 }}>{entry.value?.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

// ── TH / TD ──────────────────────────────────────────────────────────────────
const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "#959595", fontSize: 11, borderBottom: "1px solid #E0E0E0", background: "#F7F7F7", whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>
    {children}
  </th>
)
const TD = ({ children, bold }: { children: React.ReactNode; bold?: boolean }) => (
  <td style={{ padding: "10px 14px", color: bold ? "#333333" : "#595959", fontWeight: bold ? 600 : 400, borderBottom: "1px solid #F3F4F6", whiteSpace: "nowrap", fontSize: 13 }}>
    {children}
  </td>
)

// ── Flecha de flujo ───────────────────────────────────────────────────────────
function FlowArrow({ steps }: { steps: { label: string; color: string }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "10px 16px", background: "#F7F7F7", borderBottom: "1px solid #E0E0E0", flexWrap: "wrap", gap: 4 }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 2, fontSize: 11, fontWeight: 700,
            background: `${s.color}18`, color: s.color, letterSpacing: "0.04em",
            border: `1px solid ${s.color}40`,
          }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: s.color }} />
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

export default function AvanceChart({ historico, codigo }: Props) {
  const [tab, setTab] = useState<AvanceTab>("FAT")
  const sorted = [...historico].sort((a, b) => new Date(String(a.fecha)).getTime() - new Date(String(b.fecha)).getTime())

  const fatData = sorted.map((h) => ({
    fecha:        fmtFecha(h.fecha),
    "Cableado":   n(h.porcentajeTendidoFat),
    "Conectado":  n(h.porcentajeConectadoFat),
    "Señales":    n(h.porcentajeSenalesFat),
    "Pruebas":    n(h.porcentajePruebasFat),
    "Total FAT":  n(h.porcentajeFat),
  }))

  const satData = sorted.map((h) => ({
    fecha:        fmtFecha(h.fecha),
    "PEM":        n(h.porcentajeManguerasSat),
    "PF":         n(h.porcentajeManguerasPfSat),
    "Señales":    n(h.porcentajeSenalesSat),
    "Pruebas":    n(h.porcentajePruebasSat),
    "Total SAT":  n(h.porcentajeSat),
  }))

  const totalData = sorted.map((h) => ({
    fecha:         fmtFecha(h.fecha),
    "FAT":         n(h.porcentajeFat),
    "SAT":         n(h.porcentajeSat),
    "Total":       n(h.porcentajeTotal),
  }))

  const config = {
    FAT: {
      flow: [
        { label: "Cableado",  color: "#1E3A5F" },
        { label: "Conectado", color: "#3B82F6" },
        { label: "Señales",   color: "#EA580C" },
        { label: "Pruebas",   color: "#7C3AED" },
      ],
      cols:      ["% Cableado", "% Conectado", "% Señales", "% Pruebas", "% Total FAT"],
      rows:      sorted.map((h) => [p2(h.porcentajeTendidoFat), p2(h.porcentajeConectadoFat), p2(h.porcentajeSenalesFat), p2(h.porcentajePruebasFat), p2(h.porcentajeFat)]),
      chartData: fatData,
      lines: [
        { key: "Total FAT",  color: "#C0022C", width: 2.5 },
        { key: "Cableado",   color: "#1E3A5F", width: 2 },
        { key: "Conectado",  color: "#3B82F6", width: 2 },
        { key: "Señales",    color: "#EA580C", width: 2 },
        { key: "Pruebas",    color: "#7C3AED", width: 2 },
      ],
    },
    SAT: {
      flow: [
        { label: "PEM", color: "#1E40AF" },
        { label: "PF",  color: "#EA580C" },
        { label: "Señales", color: "#7C3AED" },
        { label: "Pruebas", color: "#DB2777" },
      ],
      cols:      ["% PEM", "% PF", "% Señales", "% Pruebas", "% Total SAT"],
      rows:      sorted.map((h) => [p2(h.porcentajeManguerasSat), p2(h.porcentajeManguerasPfSat), p2(h.porcentajeSenalesSat), p2(h.porcentajePruebasSat), p2(h.porcentajeSat)]),
      chartData: satData,
      lines: [
        { key: "Total SAT", color: "#C0022C", width: 2.5 },
        { key: "PEM",       color: "#1E40AF", width: 2 },
        { key: "PF",        color: "#EA580C", width: 2 },
        { key: "Señales",   color: "#7C3AED", width: 2 },
        { key: "Pruebas",   color: "#DB2777", width: 2 },
      ],
    },
    TOTAL: {
      flow: [
        { label: "FAT",   color: "#1E40AF" },
        { label: "SAT",   color: "#3B82F6" },
        { label: "Total", color: "#C0022C" },
      ],
      cols:      ["% FAT", "% SAT", "% Total"],
      rows:      sorted.map((h) => [p2(h.porcentajeFat), p2(h.porcentajeSat), p2(h.porcentajeTotal)]),
      chartData: totalData,
      lines: [
        { key: "Total", color: "#C0022C", width: 2.5 },
        { key: "FAT",   color: "#1E40AF", width: 2 },
        { key: "SAT",   color: "#3B82F6", width: 2 },
      ],
    },
  }

  const active = config[tab]

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #E0E0E0", background: "#FAFAFA" }}>
        {(["FAT", "SAT", "TOTAL"] as AvanceTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "9px 22px", border: "none",
            borderBottom: tab === t ? "2px solid #C0022C" : "2px solid transparent",
            background: "transparent",
            color: tab === t ? "#C0022C" : "#959595",
            fontWeight: tab === t ? 700 : 400,
            fontSize: 12, cursor: "pointer", letterSpacing: "0.08em",
            textTransform: "uppercase", transition: "color 0.15s",
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Flujo de pasos */}
      <FlowArrow steps={active.flow} />

      {/* Tabla histórica */}
      <div style={{ overflowX: "auto", borderBottom: "1px solid #E0E0E0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <TH>Fecha</TH>
              {active.cols.map((c) => <TH key={c}>{c}</TH>)}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={active.cols.length + 1} style={{ padding: 40, textAlign: "center", color: "#959595" }}>Sin datos históricos</td></tr>
            )}
            {sorted.map((h, i) => (
              <tr key={String(h.id)} style={{ background: "white", borderLeft: i === sorted.length - 1 ? "3px solid #C0022C" : "3px solid transparent" }}>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ fontWeight: 700, color: "#333333", fontSize: 13 }}>{codigo}</span>
                  <span style={{ fontSize: 11, color: "#959595", marginLeft: 6 }}>{fmtFecha(h.fecha)}</span>
                </td>
                {active.rows[i].map((v, j) => <TD key={j} bold={j === active.cols.length - 1}>{v}</TD>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráfico */}
      {sorted.length > 0 && (
        <div style={{ padding: "24px 16px 16px", background: "white" }}>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={active.chartData} margin={{ top: 10, right: 24, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="0" stroke="#F0F0F0" vertical={false} />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11, fill: "#959595" }}
                axisLine={{ stroke: "#E0E0E0" }}
                tickLine={false}
                dy={6}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#959595" }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                iconType="circle"
                iconSize={8}
              />
              {active.lines.map((l) => (
                <Line
                  key={l.key}
                  type="stepAfter"
                  dataKey={l.key}
                  stroke={l.color}
                  strokeWidth={l.width}
                  dot={{ r: 3, fill: l.color, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: l.color, strokeWidth: 2, stroke: "white" }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
