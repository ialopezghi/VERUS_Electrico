"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import FlagCell from "@/components/ui/FlagCell"
import Modal from "@/components/ui/Modal"
import { FormField, inputStyle } from "@/components/ui/FormField"
import ColSelector, { ColDef } from "@/components/ui/ColSelector"
import { exportToExcel, flagLabel } from "@/lib/exportExcel"

type FlagValue = boolean | null

interface Manguera {
  id: string; imei: string; origen: string | null; destino: string | null
  descripcion: string | null; comentarios: string | null; metros: number | null
  conectadoEnOrigen: FlagValue; tendidoEnOrigen: FlagValue
  tendidoEnDestino: FlagValue; conectadoEnDestino: FlagValue
}

interface Props { proyectoId: string; fase: "FAT" | "SAT"; mangueras: Manguera[] }

const COLS: ColDef[] = [
  { key: "imei",           label: "IMEI",            alwaysOn: true },
  { key: "origen",         label: "Origen" },
  { key: "conectOrigen",   label: "Conect. origen" },
  { key: "tendidoOrigen",  label: "Tendido origen" },
  { key: "destino",        label: "Destino" },
  { key: "tendidoDestino", label: "Tendido destino" },
  { key: "conectDestino",  label: "Conect. destino" },
  { key: "metros",         label: "Metros" },
  { key: "descripcion",    label: "Descripción" },
  { key: "comentarios",    label: "Comentarios" },
]
const DEFAULT_COLS: Record<string, boolean> = {
  imei: true, origen: true, conectOrigen: true, tendidoOrigen: true,
  destino: true, tendidoDestino: true, conectDestino: true,
  metros: true, descripcion: true, comentarios: true,
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
    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap", background: "#F2F2F2" }}>
      {children}
    </th>
  ) : null

function EditableCell({ value, field, onSave }: { value: string | null; field: string; onSave: (field: string, value: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value ?? "")
  const ref = useRef<HTMLInputElement>(null)

  function start() { setEditing(true); setTimeout(() => ref.current?.focus(), 0) }
  function commit() { setEditing(false); if (val !== (value ?? "")) onSave(field, val) }

  if (editing) {
    return (
      <input
        ref={ref}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(value ?? ""); setEditing(false) } }}
        style={{ border: "1px solid #C0022C", borderRadius: 4, padding: "3px 6px", fontSize: 12, width: "100%", outline: "none", minWidth: 80 }}
      />
    )
  }
  return (
    <span onClick={start} title="Clic para editar" style={{ cursor: "text", display: "block", minHeight: 20, minWidth: 60, padding: "2px 4px", borderRadius: 4, color: val ? "#374151" : "#D1D5DB" }}>
      {val || "—"}
    </span>
  )
}

const emptyForm = { imei: "", origen: "", destino: "", descripcion: "", metros: "", comentarios: "" }

export default function ManguerasTable({ proyectoId, fase, mangueras: initial }: Props) {
  const [data, setData] = useState(initial)
  const [, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, startSave] = useTransition()
  const [cols, setCols] = useLocalStorage<Record<string, boolean>>("verus_mang_cols", DEFAULT_COLS)

  function toggleCol(key: string, val: boolean) { setCols({ ...cols, [key]: val }) }
  const v = (key: string) => cols[key] ?? DEFAULT_COLS[key] ?? true

  function patch(id: string, body: Record<string, unknown>) {
    startTransition(async () => {
      await fetch(`/api/proyectos/${proyectoId}/mangueras/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    })
  }

  function updateFlag(id: string, field: string, value: FlagValue) {
    setData((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
    patch(id, { [field]: value })
  }

  function updateText(id: string, field: string, value: string) {
    setData((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
    patch(id, { [field]: value || null })
  }

  function field(k: keyof typeof emptyForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function addManguera() {
    startSave(async () => {
      const res = await fetch(`/api/proyectos/${proyectoId}/mangueras`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fase, metros: form.metros ? Number(form.metros) : null }),
      })
      if (res.ok) {
        const m = await res.json()
        setData((prev) => [...prev, m])
        setShowAdd(false)
        setForm(emptyForm)
      }
    })
  }

  const colSpan = COLS.filter((c) => v(c.key)).length

  function handleExport() {
    exportToExcel(data.map((m) => ({
      "IMEI":             m.imei,
      "Origen":           m.origen ?? "",
      "Conect. origen":   flagLabel(m.conectadoEnOrigen),
      "Tendido origen":   flagLabel(m.tendidoEnOrigen),
      "Destino":          m.destino ?? "",
      "Tendido destino":  flagLabel(m.tendidoEnDestino),
      "Conect. destino":  flagLabel(m.conectadoEnDestino),
      "Metros":           m.metros ?? "",
      "Descripción":      m.descripcion ?? "",
      "Comentarios":      m.comentarios ?? "",
    })), `mangueras_${fase}`)
  }

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
        <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 2, border: "1px solid #E0E0E0", background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#595959", letterSpacing: "0.04em" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar
        </button>
        <ColSelector cols={COLS} visible={cols} onChange={toggleCol} />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <TH visible={v("imei")}>IMEI</TH>
              <TH visible={v("origen")}>Origen</TH>
              <TH visible={v("conectOrigen")}>Conect. origen</TH>
              <TH visible={v("tendidoOrigen")}>Tendido origen</TH>
              <TH visible={v("destino")}>Destino</TH>
              <TH visible={v("tendidoDestino")}>Tendido destino</TH>
              <TH visible={v("conectDestino")}>Conect. destino</TH>
              <TH visible={v("metros")}>Metros</TH>
              <TH visible={v("descripcion")}>Descripción</TH>
              <TH visible={v("comentarios")}>Comentarios</TH>
            </tr>
          </thead>
          <tbody>
            {data.map((m, i) => (
              <tr key={m.id} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", borderLeft: i === 0 ? "3px solid #C0022C" : "3px solid transparent" }}>
                {v("imei") && (
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6", whiteSpace: "nowrap", minWidth: 120 }}>
                    <EditableCell value={m.imei} field="imei" onSave={(f, v) => updateText(m.id, f, v)} />
                  </td>
                )}
                {v("origen") && (
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6", minWidth: 100 }}>
                    <EditableCell value={m.origen} field="origen" onSave={(f, v) => updateText(m.id, f, v)} />
                  </td>
                )}
                {v("conectOrigen") && (
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6" }}>
                    <FlagCell value={m.conectadoEnOrigen} onChange={(v) => updateFlag(m.id, "conectadoEnOrigen", v)} />
                  </td>
                )}
                {v("tendidoOrigen") && (
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6" }}>
                    <FlagCell value={m.tendidoEnOrigen} onChange={(v) => updateFlag(m.id, "tendidoEnOrigen", v)} />
                  </td>
                )}
                {v("destino") && (
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6", minWidth: 100 }}>
                    <EditableCell value={m.destino} field="destino" onSave={(f, v) => updateText(m.id, f, v)} />
                  </td>
                )}
                {v("tendidoDestino") && (
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6" }}>
                    <FlagCell value={m.tendidoEnDestino} onChange={(v) => updateFlag(m.id, "tendidoEnDestino", v)} />
                  </td>
                )}
                {v("conectDestino") && (
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6" }}>
                    <FlagCell value={m.conectadoEnDestino} onChange={(v) => updateFlag(m.id, "conectadoEnDestino", v)} />
                  </td>
                )}
                {v("metros") && (
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6", minWidth: 60 }}>
                    <EditableCell value={m.metros != null ? String(m.metros) : null} field="metros" onSave={(f, v) => updateText(m.id, f, v)} />
                  </td>
                )}
                {v("descripcion") && (
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6", minWidth: 140 }}>
                    <EditableCell value={m.descripcion} field="descripcion" onSave={(f, v) => updateText(m.id, f, v)} />
                  </td>
                )}
                {v("comentarios") && (
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6", minWidth: 140 }}>
                    <EditableCell value={m.comentarios} field="comentarios" onSave={(f, v) => updateText(m.id, f, v)} />
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={colSpan} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No hay mangueras en fase {fase}</td></tr>
            )}
          </tbody>
        </table>
        <div style={{ padding: "10px 12px", borderTop: "1px solid #F3F4F6" }}>
          <button onClick={() => setShowAdd(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 4, border: "1px dashed #D1D5DB", background: "white", color: "#6B7280", fontSize: 13, cursor: "pointer" }}>
            <img src="/icons/dark/add.svg" alt="" width={14} height={14} />
            Añadir manguera
          </button>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={`Nueva manguera — ${fase}`} width={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="IMEI" required>
            <input style={inputStyle} value={form.imei} onChange={field("imei")} placeholder="=EM01+UC20-TF256..." />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Origen">
              <input style={inputStyle} value={form.origen} onChange={field("origen")} placeholder="Cuadro KE01" />
            </FormField>
            <FormField label="Destino">
              <input style={inputStyle} value={form.destino} onChange={field("destino")} placeholder="Terminal TF256" />
            </FormField>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Metros">
              <input style={inputStyle} type="number" value={form.metros} onChange={field("metros")} placeholder="12.5" />
            </FormField>
            <FormField label="Descripción">
              <input style={inputStyle} value={form.descripcion} onChange={field("descripcion")} />
            </FormField>
          </div>
          <FormField label="Comentarios">
            <input style={inputStyle} value={form.comentarios} onChange={field("comentarios")} />
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #F3F4F6" }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
            <button onClick={addManguera} disabled={saving || !form.imei}
              style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: saving ? "#F3F4F6" : "#C0022C", color: saving ? "#9CA3AF" : "white", fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}>
              {saving ? "Guardando…" : "Añadir"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
