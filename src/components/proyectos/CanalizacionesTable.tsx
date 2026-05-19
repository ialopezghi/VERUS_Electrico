"use client"

import { useState, useTransition } from "react"
import Modal from "@/components/ui/Modal"
import { FormField, inputStyle } from "@/components/ui/FormField"

interface Canalizacion {
  id: string; imei: string; tipo: string; ubicacion: string; metros: number | null
}

interface Props { proyectoId: string; fase: "FAT" | "SAT"; canalizaciones: Canalizacion[] }

const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap", background: "#F2F2F2" }}>
    {children}
  </th>
)

const emptyForm = { imei: "", tipo: "", ubicacion: "", metros: "" }

export default function CanalizacionesTable({ proyectoId, fase, canalizaciones: initial }: Props) {
  const [data, setData] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, startSave] = useTransition()

  function field(k: keyof typeof emptyForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function addCanalizacion() {
    startSave(async () => {
      const res = await fetch(`/api/proyectos/${proyectoId}/canalizaciones`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fase, metros: form.metros ? Number(form.metros) : null }),
      })
      if (res.ok) {
        const c = await res.json()
        setData((prev) => [...prev, c])
        setShowAdd(false)
        setForm(emptyForm)
      }
    })
  }

  const totalMetros = data.reduce((acc, c) => acc + (c.metros ? Number(c.metros) : 0), 0)

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        {data.length > 0 && (
          <div style={{ padding: "10px 16px", background: "#F2F2F2", borderBottom: "1px solid #E5E7EB", fontSize: 12, color: "#6B7280" }}>
            Total: <strong style={{ color: "#111827" }}>{data.length} canalizaciones</strong>
            {totalMetros > 0 && <> · <strong style={{ color: "#111827" }}>{totalMetros.toFixed(1)} m</strong> totales</>}
          </div>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr><TH>IMEI</TH><TH>Tipo</TH><TH>Ubicación</TH><TH>Metros</TH></tr>
          </thead>
          <tbody>
            {data.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                <td style={{ padding: "10px 12px", fontWeight: 500, color: "#374151", borderBottom: "1px solid #F3F4F6" }}>{c.imei}</td>
                <td style={{ padding: "10px 12px", color: "#6B7280", borderBottom: "1px solid #F3F4F6", fontSize: 12 }}>{c.tipo || "—"}</td>
                <td style={{ padding: "10px 12px", color: "#6B7280", borderBottom: "1px solid #F3F4F6", fontSize: 12 }}>{c.ubicacion || "—"}</td>
                <td style={{ padding: "10px 12px", color: "#374151", borderBottom: "1px solid #F3F4F6", fontSize: 12 }}>{c.metros != null ? `${c.metros} m` : "—"}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No hay canalizaciones en fase {fase}</td></tr>
            )}
          </tbody>
        </table>
        <div style={{ padding: "10px 12px", borderTop: "1px solid #F3F4F6" }}>
          <button onClick={() => setShowAdd(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 4, border: "1px dashed #D1D5DB", background: "white", color: "#6B7280", fontSize: 13, cursor: "pointer" }}>
            <img src="/icons/dark/add.svg" alt="" width={14} height={14} />
            Añadir canalización
          </button>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={`Nueva canalización — ${fase}`} width={460}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="IMEI" required>
            <input style={inputStyle} value={form.imei} onChange={field("imei")} placeholder="=EM01+UC20-CC256..." />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Tipo">
              <input style={inputStyle} value={form.tipo} onChange={field("tipo")} placeholder="Bandeja / Tubo..." />
            </FormField>
            <FormField label="Metros">
              <input style={inputStyle} type="number" value={form.metros} onChange={field("metros")} placeholder="12.5" />
            </FormField>
          </div>
          <FormField label="Ubicación">
            <input style={inputStyle} value={form.ubicacion} onChange={field("ubicacion")} placeholder="Pasillo central nave 2" />
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #F3F4F6" }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
            <button onClick={addCanalizacion} disabled={saving || !form.imei}
              style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: saving ? "#F3F4F6" : "#C0022C", color: saving ? "#9CA3AF" : "white", fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}>
              {saving ? "Guardando…" : "Añadir"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
