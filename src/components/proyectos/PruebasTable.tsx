"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import Toggle from "@/components/ui/Toggle"
import Modal from "@/components/ui/Modal"
import { FormField, inputStyle } from "@/components/ui/FormField"
import ColSelector, { ColDef } from "@/components/ui/ColSelector"
import { exportToExcel } from "@/lib/exportExcel"

interface Prueba {
  id: string; identificador: string; tipo: string | null; descripcion: string | null
  valorTeorico: string | null; valorReal: string | null; comprobado: boolean
  comentarios: string | null; extra: Record<string, string> | null
}

interface CustomCol { id: string; nombre: string; orden: number }

interface Props {
  proyectoId: string; fase: "FAT" | "SAT"; pruebas: Prueba[]
  columnDefs?: CustomCol[]; registerExport?: (fn: (() => void) | null) => void
}

const COLS: ColDef[] = [
  { key: "identificador", label: "Identificador", alwaysOn: true },
  { key: "tipo",          label: "Tipo" },
  { key: "descripcion",   label: "Descripción" },
  { key: "valorTeorico",  label: "Valor teórico" },
  { key: "valorReal",     label: "Valor real" },
  { key: "comprobado",    label: "Comprobado",   alwaysOn: true },
  { key: "comentarios",   label: "Comentarios" },
]
const DEFAULT_COLS: Record<string, boolean> = {
  identificador: true, tipo: true, descripcion: true,
  valorTeorico: true, valorReal: true, comprobado: true, comentarios: true,
}

function useLocalStorage<T>(key: string, def: T) {
  const [val, setVal] = useState<T>(def)
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setVal(JSON.parse(s)) } catch {}
  }, [key])
  function set(v: T) { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }
  return [val, set] as const
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

const emptyForm = { identificador: "", tipo: "", descripcion: "", valorTeorico: "", valorReal: "", comentarios: "" }

export default function PruebasTable({ proyectoId, fase, pruebas: initial, columnDefs: initialCols = [], registerExport }: Props) {
  const [data, setData] = useState(initial)
  const [colDefs, setColDefs] = useState<CustomCol[]>(initialCols)
  const [, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [showAddCol, setShowAddCol] = useState(false)
  const [newColName, setNewColName] = useState("")
  const [savingCol, startSaveCol] = useTransition()
  const [form, setForm] = useState(emptyForm)
  const [saving, startSave] = useTransition()
  const [cols, setCols] = useLocalStorage<Record<string, boolean>>("verus_pru_cols", DEFAULT_COLS)

  function toggleCol(key: string, val: boolean) { setCols({ ...cols, [key]: val }) }
  const v = (key: string) => cols[key] ?? DEFAULT_COLS[key] ?? true

  function updateComprobado(id: string, comprobado: boolean) {
    setData((prev) => prev.map((p) => (p.id === id ? { ...p, comprobado } : p)))
    startTransition(async () => {
      await fetch(`/api/proyectos/${proyectoId}/pruebas/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comprobado }),
      })
    })
  }

  function updateExtra(rowId: string, colId: string, value: string) {
    setData((prev) => prev.map((p) => {
      if (p.id !== rowId) return p
      return { ...p, extra: { ...(p.extra ?? {}), [colId]: value } }
    }))
    const row = data.find((p) => p.id === rowId)
    const newExtra = { ...(row?.extra ?? {}), [colId]: value }
    startTransition(async () => {
      await fetch(`/api/proyectos/${proyectoId}/pruebas/${rowId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extra: newExtra }),
      })
    })
  }

  function fieldHandler(k: keyof typeof emptyForm) {
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

  function addColumn() {
    if (!newColName.trim()) return
    startSaveCol(async () => {
      const res = await fetch(`/api/proyectos/${proyectoId}/columnas`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tabla: "prueba", nombre: newColName.trim(), orden: colDefs.length }),
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

  const pct = data.length ? Math.round((data.filter((p) => p.comprobado).length / data.length) * 100) : 0
  const colSpan = COLS.filter((c) => v(c.key)).length + colDefs.length

  function handleExport() {
    exportToExcel(data.map((p) => {
      const row: Record<string, unknown> = {
        "Identificador": p.identificador,
        "Tipo":          p.tipo ?? "",
        "Descripción":   p.descripcion ?? "",
        "Valor teórico": p.valorTeorico ?? "",
        "Valor real":    p.valorReal ?? "",
        "Comprobado":    p.comprobado ? "SI" : "NO",
        "Comentarios":   p.comentarios ?? "",
      }
      for (const col of colDefs) {
        row[col.nombre] = p.extra?.[col.id] ?? ""
      }
      return row
    }), `pruebas_${fase}`)
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
              <TH visible={v("identificador")}>Identificador</TH>
              <TH visible={v("tipo")}>Tipo</TH>
              <TH visible={v("descripcion")}>Descripción</TH>
              <TH visible={v("valorTeorico")}>Valor teórico</TH>
              <TH visible={v("valorReal")}>Valor real</TH>
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
            {data.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", opacity: p.comprobado ? 0.7 : 1 }}>
                {v("identificador") && <td style={{ padding: "10px 12px", fontWeight: 600, color: "#111827", borderBottom: "1px solid #F3F4F6" }}>{p.identificador}</td>}
                {v("tipo") && <td style={{ padding: "10px 12px", color: "#6B7280", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{p.tipo ?? "—"}</td>}
                {v("descripcion") && <td style={{ padding: "10px 12px", color: "#374151", borderBottom: "1px solid #F3F4F6", maxWidth: 220 }}>{p.descripcion ?? "—"}</td>}
                {v("valorTeorico") && <td style={{ padding: "10px 12px", color: "#6B7280", borderBottom: "1px solid #F3F4F6", fontSize: 12 }}>{p.valorTeorico ?? "—"}</td>}
                {v("valorReal") && <td style={{ padding: "10px 12px", color: p.valorReal ? "#111827" : "#D1D5DB", borderBottom: "1px solid #F3F4F6", fontSize: 12, fontWeight: p.valorReal ? 500 : 400 }}>{p.valorReal || "—"}</td>}
                {v("comprobado") && (
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #F3F4F6" }}>
                    <Toggle checked={p.comprobado} onChange={(v) => updateComprobado(p.id, v)} />
                  </td>
                )}
                {v("comentarios") && <td style={{ padding: "10px 12px", color: "#6B7280", fontSize: 12, borderBottom: "1px solid #F3F4F6" }}>{p.comentarios ?? ""}</td>}
                {colDefs.map((col) => (
                  <td key={col.id} style={{ padding: "8px 12px", borderBottom: "1px solid #F3F4F6", minWidth: 120 }}>
                    <EditableCell
                      value={p.extra?.[col.id] ?? null}
                      field={col.id}
                      onSave={(_, val) => updateExtra(p.id, col.id, val)}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={colSpan} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No hay pruebas en fase {fase}</td></tr>
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

      {/* Modal nueva prueba */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={`Nueva prueba — ${fase}`} width={520}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Identificador" required>
              <input style={inputStyle} value={form.identificador} onChange={fieldHandler("identificador")} placeholder="ELÉCTRICO" />
            </FormField>
            <FormField label="Tipo">
              <input style={inputStyle} value={form.tipo} onChange={fieldHandler("tipo")} placeholder="FRB / FRA..." />
            </FormField>
          </div>
          <FormField label="Descripción">
            <input style={inputStyle} value={form.descripcion} onChange={fieldHandler("descripcion")} placeholder="Comprobar continuidad..." />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Valor teórico">
              <input style={inputStyle} value={form.valorTeorico} onChange={fieldHandler("valorTeorico")} placeholder="NA / 400V..." />
            </FormField>
            <FormField label="Valor real">
              <input style={inputStyle} value={form.valorReal} onChange={fieldHandler("valorReal")} />
            </FormField>
          </div>
          <FormField label="Comentarios">
            <input style={inputStyle} value={form.comentarios} onChange={fieldHandler("comentarios")} />
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
