"use client"

import { useState, useTransition } from "react"
import Toggle from "@/components/ui/Toggle"
import Modal from "@/components/ui/Modal"
import { FormField, inputStyle } from "@/components/ui/FormField"

interface Prueba {
  id: string; identificador: string; tipo: string | null; descripcion: string | null
  valorTeorico: string | null; valorReal: string | null; comprobado: boolean; comentarios: string | null
}

interface Props { proyectoId: string; fase: "FAT" | "SAT"; pruebas: Prueba[] }

const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap", background: "#F2F2F2" }}>
    {children}
  </th>
)

const emptyForm = { identificador: "", tipo: "", descripcion: "", valorTeorico: "", valorReal: "", comentarios: "" }

export default function PruebasTable({ proyectoId, fase, pruebas: initial }: Props) {
  const [data, setData] = useState(initial)
  const [, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, startSave] = useTransition()

  function updateComprobado(id: string, comprobado: boolean) {
    setData((prev) => prev.map((p) => (p.id === id ? { ...p, comprobado } : p)))
    startTransition(async () => {
      await fetch(`/api/proyectos/${proyectoId}/pruebas/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comprobado }),
      })
    })
  }

  function field(k: keyof typeof emptyForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function addPrueba() {
    startSave(async () => {
      const res = await fetch(`/api/proyectos/${proyectoId}/pruebas`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fase }),
      })
      if (res.ok) {
        const p = await res.json()
        setData((prev) => [...prev, p])
        setShowAdd(false)
        setForm(emptyForm)
      }
    })
  }

  const pct = data.length ? Math.round((data.filter((p) => p.comprobado).length / data.length) * 100) : 0

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        {data.length > 0 && (
          <div style={{ padding: "10px 16px", background: "#F2F2F2", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#6B7280" }}>Completado:</span>
            <div style={{ flex: 1, maxWidth: 200, height: 6, background: "#E5E7EB", borderRadius: 3 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#22C55E" : "#C0022C", borderRadius: 3, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: pct === 100 ? "#15803D" : "#374151" }}>{pct}%</span>
          </div>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <TH>Identificador</TH><TH>Tipo</TH><TH>Descripción</TH>
              <TH>Valor teórico</TH><TH>Valor real</TH><TH>Comprobado</TH><TH>Comentarios</TH>
            </tr>
          </thead>
          <tbody>
            {data.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", opacity: p.comprobado ? 0.7 : 1 }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: "#111827", borderBottom: "1px solid #F3F4F6" }}>{p.identificador}</td>
                <td style={{ padding: "10px 12px", color: "#6B7280", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{p.tipo ?? "—"}</td>
                <td style={{ padding: "10px 12px", color: "#374151", borderBottom: "1px solid #F3F4F6", maxWidth: 220 }}>{p.descripcion ?? "—"}</td>
                <td style={{ padding: "10px 12px", color: "#6B7280", borderBottom: "1px solid #F3F4F6", fontSize: 12 }}>{p.valorTeorico ?? "—"}</td>
                <td style={{ padding: "10px 12px", color: p.valorReal ? "#111827" : "#D1D5DB", borderBottom: "1px solid #F3F4F6", fontSize: 12, fontWeight: p.valorReal ? 500 : 400 }}>{p.valorReal || "—"}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #F3F4F6" }}>
                  <Toggle checked={p.comprobado} onChange={(v) => updateComprobado(p.id, v)} />
                </td>
                <td style={{ padding: "10px 12px", color: "#6B7280", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{p.comentarios ?? ""}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No hay pruebas en fase {fase}</td></tr>
            )}
          </tbody>
        </table>
        <div style={{ padding: "10px 12px", borderTop: "1px solid #F3F4F6" }}>
          <button onClick={() => setShowAdd(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 4, border: "1px dashed #D1D5DB", background: "white", color: "#6B7280", fontSize: 13, cursor: "pointer" }}>
            <img src="/icons/dark/add.svg" alt="" width={14} height={14} />
            Añadir prueba
          </button>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={`Nueva prueba — ${fase}`} width={520}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Identificador" required>
              <input style={inputStyle} value={form.identificador} onChange={field("identificador")} placeholder="ELÉCTRICO" />
            </FormField>
            <FormField label="Tipo">
              <input style={inputStyle} value={form.tipo} onChange={field("tipo")} placeholder="FRB / FRA..." />
            </FormField>
          </div>
          <FormField label="Descripción">
            <input style={inputStyle} value={form.descripcion} onChange={field("descripcion")} placeholder="Comprobar continuidad..." />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Valor teórico">
              <input style={inputStyle} value={form.valorTeorico} onChange={field("valorTeorico")} placeholder="NA / 400V..." />
            </FormField>
            <FormField label="Valor real">
              <input style={inputStyle} value={form.valorReal} onChange={field("valorReal")} />
            </FormField>
          </div>
          <FormField label="Comentarios">
            <input style={inputStyle} value={form.comentarios} onChange={field("comentarios")} />
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #F3F4F6" }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
            <button onClick={addPrueba} disabled={saving || !form.identificador}
              style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: saving ? "#F3F4F6" : "#C0022C", color: saving ? "#9CA3AF" : "white", fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}>
              {saving ? "Guardando…" : "Añadir"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
