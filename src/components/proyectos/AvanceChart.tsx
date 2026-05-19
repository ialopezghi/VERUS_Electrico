"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface HistoricoAvance {
  id: string
  fecha: Date | string
  porcentajeFat: number | string
  porcentajeSat: number | string
  porcentajeTotal: number | string
}

interface Props {
  historico: HistoricoAvance[]
  codigo: string
}

function fmt(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`
}

export default function AvanceChart({ historico, codigo }: Props) {
  const data = historico.map((h) => ({
    fecha: fmt(h.fecha),
    "Avance FAT": Number(h.porcentajeFat),
    "Avance SAT": Number(h.porcentajeSat),
    "Avance TOTAL": Number(h.porcentajeTotal),
  }))

  // Tabla resumen
  const rows = historico.slice(-5).map((h) => ({
    id: h.id,
    fecha: fmt(h.fecha),
    fat: Number(h.porcentajeFat).toFixed(2),
    sat: Number(h.porcentajeSat).toFixed(2),
    total: Number(h.porcentajeTotal).toFixed(2),
  }))

  return (
    <div style={{ padding: 24 }}>
      {/* Tabla resumen */}
      <div style={{ marginBottom: 24, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-muted)", fontSize: 12, borderBottom: "1px solid var(--color-border)" }}>Identificador</th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-muted)", fontSize: 12, borderBottom: "1px solid var(--color-border)" }}>% Avance FAT</th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-muted)", fontSize: 12, borderBottom: "1px solid var(--color-border)" }}>% Avance SAT</th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-muted)", fontSize: 12, borderBottom: "1px solid var(--color-border)" }}>% Avance TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ borderLeft: i === 0 ? "3px solid #3B82F6" : "3px solid transparent", background: "white" }}>
                <td style={{ padding: "10px 16px", fontWeight: 500, color: "#374151", borderBottom: "1px solid #F3F4F6" }}>
                  {codigo} <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{r.fecha}</span>
                </td>
                <td style={{ padding: "10px 16px", color: "#374151", borderBottom: "1px solid #F3F4F6" }}>{r.fat} %</td>
                <td style={{ padding: "10px 16px", color: "#374151", borderBottom: "1px solid #F3F4F6" }}>{r.sat} %</td>
                <td style={{ padding: "10px 16px", color: "#374151", borderBottom: "1px solid #F3F4F6" }}>{r.total} %</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 40, textAlign: "center", color: "var(--color-muted)" }}>
                  Sin datos históricos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Gráfico */}
      {data.length > 0 && (
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9CA3AF" }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Avance FAT"   stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Avance SAT"   stroke="#1D4ED8" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Avance TOTAL" stroke="var(--color-brand)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
