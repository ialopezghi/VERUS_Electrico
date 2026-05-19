"use client"

import { useState, useTransition } from "react"
import Modal from "@/components/ui/Modal"
import { FormField, inputStyle } from "@/components/ui/FormField"

interface Senal {
  id: string; simbolico: string | null; ime: string | null
  tipoSenhal: string | null; signalName: string; checkedStatus: string; comentarios: string | null
}

interface Props { proyectoId: string; fase: "FAT" | "SAT"; senales: Senal[] }

const STATUS_OPTIONS = ["", "OK", "NO", "N/A"]

const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap", background: "#F2F2F2" }}>
    {children}
  </th>
)

function StatusBadge({ status }: { status: string }) {
  const s = status.trim().toUpperCase()
  let bg = "#F3F4F6", color = "#9CA3AF"
  if (s === "OK" || s === "SI") { bg = "#DCFCE7"; color = "#15803D" }
  else if (s === "NO") { bg = "#FEE2E2"; color = "#B91C1C" }
  else if (s === "N/A") { bg = "#FEF9C3"; color = "#A16207" }
  return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color }}>{status || "—"}</span>
}

const emptyForm = { simbolico: "", ime: "", tipoSenhal: "", signalName: "", comentarios: "" }

export default function SenalesTable({ proyectoId, fase, senales: initial }: Props) {
  const [data, setData] = useState(initial)
  const [, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, startSave] = useTransition()

  function updateStatus(id: string, checkedStatus: string) {
    setData((prev) => prev.map((s) => (s.id === id ? { ...s, checkedStatus } : s)))
    startTransition(async () => {
      await fetch(`/api/proyectos/${proyectoId}/senales/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkedStatus }),
      })
    })
  }

  function field(k: keyof typeof emptyForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function addSenal() {
    startSave(async () => {
      const res = await fetch(`/api/proyectos/${proyectoId}/senales`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fase }),
      })
      if (res.ok) {
        const s = await res.json()
        setData((prev) => [...prev, s])
        setShowAdd(false)
        setForm(emptyForm)
      }
    })
  }

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <TH>Simbólico</TH><TH>IME</TH><TH>Tipo señal</TH>
              <TH>Nombre señal</TH><TH>Comprobado</TH><TH>Comentarios</TH>
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                <td style={{ padding: "10px 12px", color: "#2563EB", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{s.simbolico ?? "—"}</td>
                <td style={{ padding: "10px 12px", color: "#374151", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{s.ime ?? "—"}</td>
                <td style={{ padding: "10px 12px", color: "#6B7280", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{s.tipoSenhal ?? "—"}</td>
                <td style={{ padding: "10px 12px", fontWeight: 500, color: "#374151", borderBottom: "1px solid #F3F4F6" }}>{s.signalName}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatusBadge status={s.checkedStatus} />
                    <select value={s.checkedStatus} onChange={(e) => updateStatus(s.id, e.target.value)}
                      style={{ appearance: "none", border: "1px solid #E5E7EB", borderRadius: 6, padding: "2px 8px", fontSize: 12, cursor: "pointer", background: "white" }}>
                      {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt || "(vacío)"}</option>)}
                    </select>
                  </div>
                </td>
                <td style={{ padding: "10px 12px", color: "#6B7280", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{s.comentarios ?? ""}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No hay señales en fase {fase}</td></tr>
            )}
          </tbody>
        </table>
        <div style={{ padding: "10px 12px", borderTop: "1px solid #F3F4F6" }}>
          <button onClick={() => setShowAdd(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 4, border: "1px dashed #D1D5DB", background: "white", color: "#6B7280", fontSize: 13, cursor: "pointer" }}>
            <img src="/icons/dark/add.svg" alt="" width={14} height={14} />
            Añadir señal
          </button>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={`Nueva señal — ${fase}`} width={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Nombre de señal" required>
            <input style={inputStyle} value={form.signalName} onChange={field("signalName")} placeholder="Presión oxígeno (1)" />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Simbólico">
              <input style={inputStyle} value={form.simbolico} onChange={field("simbolico")} placeholder="=EM01+UC20-TF256.2:12+" />
            </FormField>
            <FormField label="IME">
              <input style={inputStyle} value={form.ime} onChange={field("ime")} placeholder="=KE01+UC02-KE174.2" />
            </FormField>
          </div>
          <FormField label="Tipo de señal">
            <input style={inputStyle} value={form.tipoSenhal} onChange={field("tipoSenhal")} placeholder="Analógica / Digital..." />
          </FormField>
          <FormField label="Comentarios">
            <input style={inputStyle} value={form.comentarios} onChange={field("comentarios")} />
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #F3F4F6" }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
            <button onClick={addSenal} disabled={saving || !form.signalName}
              style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: saving ? "#F3F4F6" : "#C0022C", color: saving ? "#9CA3AF" : "white", fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}>
              {saving ? "Guardando…" : "Añadir"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
