"use client"

import { useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts"

interface HistoricoAvance {
  id: string
  fecha: Date | string
  porcentajeFat:          number | string
  porcentajeManguerasFat: number | string
  porcentajeSenalesFat:   number | string
  porcentajePruebasFat:   number | string
  porcentajeSat:          number | string
  porcentajeManguerasSat: number | string
  porcentajeSenalesSat:   number | string
  porcentajePruebasSat:   number | string
  porcentajeTotal:        number | string
}

interface Props {
  historico: HistoricoAvance[]
  codigo: string
}

type AvanceTab = "FAT" | "SAT" | "TOTAL"

function fmtFecha(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`
}
function n(v: number | string) { return Number(v) }
function pct(v: number | string) { return `${n(v).toFixed(2)} %` }

const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#959595", fontSize: 12, borderBottom: "1px solid #E0E0E0", background: "#F2F2F2", whiteSpace: "nowrap" }}>
    {children}
  </th>
)
const TD = ({ children }: { children: React.ReactNode }) => (
  <td style={{ padding: "10px 16px", color: "#374151", borderBottom: "1px solid #F3F4F6", whiteSpace: "nowrap" }}>
    {children}
  </td>
)

export default function AvanceChart({ historico, codigo }: Props) {
  const [tab, setTab] = useState<AvanceTab>("FAT")

  const sorted = [...historico].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  // ── FAT ──────────────────────────────────────────────────────────────────────
  const fatData = sorted.map((h) => ({
    fecha:          fmtFecha(h.fecha),
    "AvanceFAT":    n(h.porcentajeFat),
    "ManguerasFAT": n(h.porcentajeManguerasFat),
    "SeñalesFAT":   n(h.porcentajeSenalesFat),
    "PruebasFAT":   n(h.porcentajePruebasFat),
  }))

  // ── SAT ──────────────────────────────────────────────────────────────────────
  const satData = sorted.map((h) => ({
    fecha:          fmtFecha(h.fecha),
    "AvanceSAT":    n(h.porcentajeSat),
    "ManguerasSAT": n(h.porcentajeManguerasSat),
    "SeñalesSAT":   n(h.porcentajeSenalesSat),
    "PruebasSAT":   n(h.porcentajePruebasSat),
  }))

  // ── TOTAL ─────────────────────────────────────────────────────────────────────
  const totalData = sorted.map((h) => ({
    fecha:       fmtFecha(h.fecha),
    "AvanceFAT": n(h.porcentajeFat),
    "AvanceSAT": n(h.porcentajeSat),
    "AvanceTOTAL": n(h.porcentajeTotal),
  }))

  // ── Tabla + líneas según tab activo ──────────────────────────────────────────
  const config = {
    FAT: {
      cols: ["% Mangueras FAT", "% Señales FAT", "% Pruebas FAT", "% Total FAT"],
      rows: sorted.map((h) => [pct(h.porcentajeManguerasFat), pct(h.porcentajeSenalesFat), pct(h.porcentajePruebasFat), pct(h.porcentajeFat)]),
      chartData: fatData,
      lines: [
        { key: "AvanceFAT",    color: "#3B82F6" },
        { key: "ManguerasFAT", color: "#1D4ED8" },
        { key: "SeñalesFAT",   color: "#F97316" },
        { key: "PruebasFAT",   color: "#A855F7" },
      ],
    },
    SAT: {
      cols: ["% Mangueras SAT", "% Señales SAT", "% Pruebas SAT", "% Total SAT"],
      rows: sorted.map((h) => [pct(h.porcentajeManguerasSat), pct(h.porcentajeSenalesSat), pct(h.porcentajePruebasSat), pct(h.porcentajeSat)]),
      chartData: satData,
      lines: [
        { key: "AvanceSAT",    color: "#3B82F6" },
        { key: "ManguerasSAT", color: "#F97316" },
        { key: "SeñalesSAT",   color: "#1D4ED8" },
        { key: "PruebasSAT",   color: "#EC4899" },
      ],
    },
    TOTAL: {
      cols: ["% Avance FAT", "% Avance SAT", "% Avance TOTAL"],
      rows: sorted.map((h) => [pct(h.porcentajeFat), pct(h.porcentajeSat), pct(h.porcentajeTotal)]),
      chartData: totalData,
      lines: [
        { key: "AvanceSAT",   color: "#3B82F6" },
        { key: "AvanceFAT",   color: "#1D4ED8" },
        { key: "AvanceTOTAL", color: "#F97316" },
      ],
    },
  }

  const active = config[tab]

  return (
    <div>
      {/* Inner tabs FAT / SAT / TOTAL */}
      <div style={{ display: "flex", gap: 4, padding: "12px 16px 0", borderBottom: "1px solid #E0E0E0", background: "#FAFAFA" }}>
        {(["FAT", "SAT", "TOTAL"] as AvanceTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px",
            border: "none",
            borderBottom: tab === t ? "2px solid #C0022C" : "2px solid transparent",
            background: "transparent",
            color: tab === t ? "#C0022C" : "#959595",
            fontWeight: tab === t ? 700 : 400,
            fontSize: 12,
            cursor: "pointer",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            transition: "color 0.15s",
          }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {/* Tabla */}
        <div style={{ marginBottom: 28, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <TH>Identificador</TH>
                {active.cols.map((c) => <TH key={c}>{c}</TH>)}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={active.cols.length + 1} style={{ padding: 40, textAlign: "center", color: "#959595" }}>Sin datos históricos</td></tr>
              )}
              {sorted.map((h, i) => (
                <tr key={h.id} style={{ background: "white", borderLeft: i === 0 ? "3px solid #3B82F6" : "3px solid transparent" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 500, color: "#374151", borderBottom: "1px solid #F3F4F6", whiteSpace: "nowrap" }}>
                    {codigo} <span style={{ fontSize: 11, color: "#959595" }}>{fmtFecha(h.fecha)}</span>
                  </td>
                  {active.rows[i].map((v, j) => <TD key={j}>{v}</TD>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gráfico */}
        {sorted.length > 0 && (
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={active.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9CA3AF" }} tickFormatter={(v) => `${v}`} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {active.lines.map((l) => (
                  <Line key={l.key} type="stepAfter" dataKey={l.key} stroke={l.color} strokeWidth={1.5} dot={{ r: 2 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
