"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import Modal from "@/components/ui/Modal"
import { FormField, inputStyle } from "@/components/ui/FormField"
import ColSelector, { ColDef } from "@/components/ui/ColSelector"
import { exportToExcel } from "@/lib/exportExcel"

interface Senal {
  id: string; simbolico: string | null; ime: string | null
  tipoSenhal: string | null; signalName: string; checkedStatus: string
  comentarios: string | null; extra: Record<string, string> | null
}

interface CustomCol { id: string; nombre: string; orden: number }

interface Props {
  proyectoId: string; fase: "FAT" | "SAT"; senales: Senal[]
  columnDefs?: CustomCol[]; registerExport?: (fn: (() => void) | null) => void
}

const COLS: ColDef[] = [
  { key: "simbolico",  label: "Simbólico",   alwaysOn: true },
  { key: "ime",        label: "IME" },
  { key: "tipo",       label: "Tipo señal" },
  { key: "nombre",     label: "Nombre señal", alwaysOn: true },
  { key: "comprobado", label: "Comprobado",   alwaysOn: true },
  { key: "comentarios",label: "Comentarios" },
]
const DEFAULT_COLS: Record<string, boolean> = {
  simbolico: true, ime: true, tipo: true, nombre: true, comprobado: true, comentarios: true,
}

function useLocalStorage<T>(key: string, def: T) {
  const [val, setVal] = useState<T>(def)
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setVal(JSON.parse(s)) } catch {}
  }, [key])
  function set(v: T) { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }
  return [val, set] as const
}

const STATUS_CYCLE = ["OK", "NO", "N/A", ""]

const STATUS_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  OK:  { bg: "#DCFCE7", color: "#15803D", icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> },
  NO:  { bg: "#FEE2E2", color: "#B91C1C", icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
  "N/A": { bg: "#FEF9C3", color: "#A16207", icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/></svg> },
  "":  { bg: "#F3F4F6", color: "#9CA3AF", icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="6" cy="12" r="1"/><circle cx="18" cy="12" r="1"/></svg> },
}

function StatusButton({ status, onClick }: { status: string; onClick: () => void }) {
  const s = status.trim().toUpperCase()
  const key = STATUS_STYLES[s] ? s : ""
  const st = STATUS_STYLES[key]
  return (
    <button onClick={onClick} title="Clic para cambiar" style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 2, border: "none",
      background: st.bg, color: st.color, fontWeight: 700, fontSize: 11,
      cursor: "pointer", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none",
      transition: "opacity 0.1s",
    }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.75" }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
    >
      {st.icon}
      {key || "—"}
    </button>
  )
}

function EditableCell({ value, field, onSave }: { value: string | null; field: string; onSave: (field: string, value: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value ?? "")
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { setVal(value ?? "") }, [value])

  function start() { setEditing(true); setTimeout(() => ref.current?.focus(), 0) }
  function commit() { setEditing(false); if (val !== (value ?? "")) onSave(field, val) }

  if (editing) {
    return (
      <input ref={ref} value={val} onChange={(e) => setVal(e.target.value)} onBlur={commit}
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

const TH = ({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) =>
  visible ? (
    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap", background: "#F2F2F2" }}>
      {children}
    </th>
  ) : null

const emptyForm = { simbolico: "", ime: "", tipoSenhal: "", signalName: "", comentarios: "" }

export default function SenalesTable({ proyectoId, fase, senales: initial, columnDefs: initialCols = [], registerExport }: Props) {
  const [data, setData] = useState(initial)
  const [colDefs, setColDefs] = useState<CustomCol[]>(initialCols)
  const [, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [showAddCol, setShowAddCol] = useState(false)
  const [newColName, setNewColName] = useState("")
  const [savingCol, startSaveCol] = useTransition()
  const [form, setForm] = useState(emptyForm)
  const [saving, startSave] = useTransition()
  const [cols, setCols] = useLocalStorage<Record<string, boolean>>("verus_sen_cols", DEFAULT_COLS)

  function toggleCol(key: string, val: boolean) { setCols({ ...cols, [key]: val }) }
  const v = (key: string) => cols[key] ?? DEFAULT_COLS[key] ?? true

  function updateStatus(id: string, checkedStatus: string) {
    setData((prev) => prev.map((s) => (s.id === id ? { ...s, checkedStatus } : s)))
    startTransition(async () => {
      await fetch(`/api/proyectos/${proyectoId}/senales/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkedStatus }),
      })
    })
  }

  function cycleStatus(id: string, current: string) {
    const s = current.trim().toUpperCase()
    const idx = STATUS_CYCLE.indexOf(STATUS_CYCLE.find((x) => x === s) ?? "")
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    updateStatus(id, next)
  }

  function updateExtra(rowId: string, colId: string, value: string) {
    setData((prev) => prev.map((s) => {
      if (s.id !== rowId) return s
      return { ...s, extra: { ...(s.extra ?? {}), [colId]: value } }
    }))
    const row = data.find((s) => s.id === rowId)
    const newExtra = { ...(row?.extra ?? {}), [colId]: value }
    startTransition(async () => {
      await fetch(`/api/proyectos/${proyectoId}/senales/${rowId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extra: newExtra }),
      })
    })
  }

  function fieldHandler(k: keyof typeof emptyForm) {
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

  function addColumn() {
    if (!newColName.trim()) return
    startSaveCol(async () => {
      const res = await fetch(`/api/proyectos/${proyectoId}/columnas`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tabla: "senhal", nombre: newColName.trim(), orden: colDefs.length }),
      })
      if (res.ok) {
        const col = await res.json()
        setColDefs((prev) => [...prev, col])
        setNewColName("")
        setShowAddCol(false)
      }
    })
  }

  function deleteColumn(colId: string) {
    startTransition(async () => {
      await fetch(`/api/proyectos/${proyectoId}/columnas/${colId}`, { method: "DELETE" })
      setColDefs((prev) => prev.filter((c) => c.id !== colId))
    })
  }

  const colSpan = COLS.filter((c) => v(c.key)).length + colDefs.length

  function handleExport() {
    exportToExcel(data.map((s) => {
      const row: Record<string, unknown> = {
        "Simbólico":    s.simbolico ?? "",
        "IME":          s.ime ?? "",
        "Tipo señal":   s.tipoSenhal ?? "",
        "Nombre señal": s.signalName,
        "Comprobado":   s.checkedStatus || "—",
        "Comentarios":  s.comentarios ?? "",
      }
      for (const col of colDefs) {
        row[col.nombre] = s.extra?.[col.id] ?? ""
      }
      return row
    }), `senales_${fase}`)
  }

  const exportRef = useRef(handleExport)
  exportRef.current = handleExport
  useEffect(() => {
    registerExport?.(() => exportRef.current())
    return () => registerExport?.(null)
  }, [registerExport])

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
        <button onClick={() => setShowAddCol(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 2, border: "1px dashed #C0022C", background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#C0022C", letterSpacing: "0.04em" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Columna
        </button>
        <ColSelector cols={COLS} visible={cols} onChange={toggleCol} />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <TH visible={v("simbolico")}>Simbólico</TH>
              <TH visible={v("ime")}>IME</TH>
              <TH visible={v("tipo")}>Tipo señal</TH>
              <TH visible={v("nombre")}>Nombre señal</TH>
              <TH visible={v("comprobado")}>Comprobado</TH>
              <TH visible={v("comentarios")}>Comentarios</TH>
              {colDefs.map((col) => (
                <th key={col.id} style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#C0022C", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap", background: "#F2F2F2" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {col.nombre}
                    <button onClick={() => deleteColumn(col.id)} title="Eliminar columna" style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, lineHeight: 1 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C0022C" }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                {v("simbolico") && <td style={{ padding: "10px 12px", color: "#2563EB", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{s.simbolico ?? "—"}</td>}
                {v("ime") && <td style={{ padding: "10px 12px", color: "#374151", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{s.ime ?? "—"}</td>}
                {v("tipo") && <td style={{ padding: "10px 12px", color: "#6B7280", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{s.tipoSenhal ?? "—"}</td>}
                {v("nombre") && <td style={{ padding: "10px 12px", fontWeight: 500, color: "#374151", borderBottom: "1px solid #F3F4F6" }}>{s.signalName}</td>}
                {v("comprobado") && (
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #F3F4F6" }}>
                    <StatusButton status={s.checkedStatus} onClick={() => cycleStatus(s.id, s.checkedStatus)} />
                  </td>
                )}
                {v("comentarios") && <td style={{ padding: "10px 12px", color: "#6B7280", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{s.comentarios ?? ""}</td>}
                {colDefs.map((col) => (
                  <td key={col.id} style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6", minWidth: 120 }}>
                    <EditableCell
                      value={s.extra?.[col.id] ?? null}
                      field={col.id}
                      onSave={(_, val) => updateExtra(s.id, col.id, val)}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={colSpan} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No hay señales en fase {fase}</td></tr>
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

      {/* Modal nueva señal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={`Nueva señal — ${fase}`} width={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Nombre de señal" required>
            <input style={inputStyle} value={form.signalName} onChange={fieldHandler("signalName")} placeholder="Presión oxígeno (1)" />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Simbólico">
              <input style={inputStyle} value={form.simbolico} onChange={fieldHandler("simbolico")} placeholder="=EM01+UC20-TF256.2:12+" />
            </FormField>
            <FormField label="IME">
              <input style={inputStyle} value={form.ime} onChange={fieldHandler("ime")} placeholder="=KE01+UC02-KE174.2" />
            </FormField>
          </div>
          <FormField label="Tipo de señal">
            <input style={inputStyle} value={form.tipoSenhal} onChange={fieldHandler("tipoSenhal")} placeholder="Analógica / Digital..." />
          </FormField>
          <FormField label="Comentarios">
            <input style={inputStyle} value={form.comentarios} onChange={fieldHandler("comentarios")} />
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

      {/* Modal nueva columna */}
      <Modal open={showAddCol} onClose={() => { setShowAddCol(false); setNewColName("") }} title="Nueva columna" width={360}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Nombre de la columna" required>
            <input style={inputStyle} value={newColName} autoFocus
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addColumn() }}
              placeholder="Ej: Nº serie, Referencia..."
            />
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #F3F4F6" }}>
            <button onClick={() => { setShowAddCol(false); setNewColName("") }} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
            <button onClick={addColumn} disabled={savingCol || !newColName.trim()}
              style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: savingCol ? "#F3F4F6" : "#C0022C", color: savingCol ? "#9CA3AF" : "white", fontSize: 14, cursor: savingCol ? "not-allowed" : "pointer", fontWeight: 600 }}>
              {savingCol ? "Guardando…" : "Añadir"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
