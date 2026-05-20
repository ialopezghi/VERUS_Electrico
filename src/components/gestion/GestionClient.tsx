"use client"

import { useState } from "react"
import Modal from "@/components/ui/Modal"
import { FormField, inputStyle, selectStyle } from "@/components/ui/FormField"
import { codProyecto } from "@/lib/kpi"

const ESTADO_OPTIONS = [
  { value: "ofertado",   label: "Ofertado"   },
  { value: "activo",     label: "Activo"      },
  { value: "en_proceso", label: "En Proceso"  },
  { value: "completado", label: "Finalizado"  },
  { value: "pausado",    label: "Pausado"     },
  { value: "cancelado",  label: "Cancelado"   },
]

interface Proyecto {
  id: string; idh: string; orden: number; nombre: string | null; cliente: string | null
  ubicacion: string | null; tipoEquipo: string | null; estado: string
  activo: boolean; pausado: boolean; faseActual: string | null
  fatCanalIni: string | null; fatCanalFin: string | null
  satCanalIni: string | null; satCanalFin: string | null
  fatMangIni:  string | null; fatMangFin:  string | null
  satMangIni:  string | null; satMangFin:  string | null
  fatSenIni:   string | null; fatSenFin:   string | null
  satSenIni:   string | null; satSenFin:   string | null
  fatPruIni:   string | null; fatPruFin:   string | null
  satPruIni:   string | null; satPruFin:   string | null
}

function fmtDateInput(d: string | null): string {
  if (!d) return ""
  return new Date(d).toISOString().split("T")[0]
}

function parseDate(s: string): string | null {
  if (!s) return null
  return new Date(s + "T00:00:00Z").toISOString()
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{
    padding: "9px 10px", textAlign: "left", fontSize: 10, fontWeight: 700,
    color: "#959595", borderBottom: "2px solid #E0E0E0", whiteSpace: "nowrap",
    textTransform: "uppercase", letterSpacing: "0.08em", background: "#F2F2F2",
  }}>
    {children}
  </th>
)

const emptyForm = {
  idh: "", orden: "", nombre: "", cliente: "", ubicacion: "", tipoEquipo: "", estado: "en_proceso",
}

const btnPrimary: React.CSSProperties = {
  padding: "8px 18px", borderRadius: 4, border: "none",
  background: "#C0022C", color: "white",
  fontSize: 13, cursor: "pointer", fontWeight: 700,
  letterSpacing: "0.04em", textTransform: "uppercase",
}
const btnSecondary: React.CSSProperties = {
  padding: "8px 18px", borderRadius: 4,
  border: "1px solid #E0E0E0", background: "#FEFEFE",
  fontSize: 13, cursor: "pointer", fontWeight: 500, color: "#333333",
}
const inlineSelectStyle: React.CSSProperties = {
  border: "1px solid #D8D8D8", borderRadius: 2, padding: "4px 6px",
  fontSize: 12, cursor: "pointer", background: "white", color: "#333333",
  outline: "none", minWidth: 90,
}
const dateInputStyle: React.CSSProperties = {
  border: "1px solid #D8D8D8", borderRadius: 2, padding: "3px 5px",
  fontSize: 11, width: 118, cursor: "pointer", color: "#333333",
}

function DateField({
  value,
  fieldKey,
  proyectoId,
  onSave,
}: {
  value: string | null
  fieldKey: string
  proyectoId: string
  onSave: (id: string, data: Record<string, string | null>) => void
}) {
  const formatted = fmtDateInput(value)
  return (
    <input
      key={formatted}
      type="date"
      defaultValue={formatted}
      onBlur={(e) => {
        const v = e.target.value
        if (v !== formatted) onSave(proyectoId, { [fieldKey]: parseDate(v) })
      }}
      style={dateInputStyle}
    />
  )
}

export default function GestionClient({ proyectos: initial }: { proyectos: Proyecto[] }) {
  const [proyectos, setProyectos]   = useState(initial)
  const [expanded,  setExpanded]    = useState<Set<string>>(new Set())
  const [showNew,   setShowNew]     = useState(false)
  const [form,      setForm]        = useState(emptyForm)
  const [saving,    setSaving]      = useState(false)

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  async function patch(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/proyectos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json()
      setProyectos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)))
    }
  }

  function field(k: keyof typeof emptyForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function saveNew() {
    setSaving(true)
    const res = await fetch("/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orden: Number(form.orden) }),
    })
    setSaving(false)
    if (res.ok) {
      const p = await res.json()
      setProyectos((prev) => [...prev, p])
      setShowNew(false)
    }
  }

  const formBody = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="IDH" required hint="Ej: H01 o H01;H02">
          <input style={inputStyle} value={form.idh} onChange={field("idh")} placeholder="H01" />
        </FormField>
        <FormField label="Nº Pedido" required>
          <input style={inputStyle} type="number" value={form.orden} onChange={field("orden")} placeholder="12737" />
        </FormField>
      </div>
      <FormField label="Nombre interno">
        <input style={inputStyle} value={form.nombre} onChange={field("nombre")} placeholder="BEFESA — FRB-40" />
      </FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Cliente">
          <input style={inputStyle} value={form.cliente} onChange={field("cliente")} placeholder="BEFESA" />
        </FormField>
        <FormField label="Ubicación">
          <input style={inputStyle} value={form.ubicacion} onChange={field("ubicacion")} placeholder="Bernburg, Alemania" />
        </FormField>
      </div>
      <FormField label="Tipo de equipo">
        <input style={inputStyle} value={form.tipoEquipo} onChange={field("tipoEquipo")} placeholder="FRB-40" />
      </FormField>
      <FormField label="Estado">
        <select style={selectStyle} value={form.estado} onChange={field("estado")}>
          {ESTADO_OPTIONS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </FormField>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 10, borderTop: "1px solid #E0E0E0" }}>
        <button onClick={() => setShowNew(false)} style={btnSecondary}>Cancelar</button>
        <button
          onClick={saveNew}
          disabled={saving || !form.idh || !form.orden}
          style={{ ...btnPrimary, background: saving ? "#E0E0E0" : "#C0022C", color: saving ? "#959595" : "white", cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "Guardando…" : "Crear proyecto"}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#333333", letterSpacing: "0.02em", textTransform: "uppercase" }}>
            Gestión Proyectos
          </h1>
          <button
            onClick={() => { setForm(emptyForm); setShowNew(true) }}
            style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo proyecto
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#FEFEFE", borderRadius: 4, border: "1px solid #E0E0E0", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <TH>ID-H</TH>
                  <TH>Cliente</TH>
                  <TH>Ubicacion</TH>
                  <TH>Tipo de equipo</TH>
                  <TH>Fase</TH>
                  <TH>Estado</TH>
                  <TH>Pausar proyecto</TH>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p, i) => {
                  const isExp = expanded.has(p.id)
                  const rowBg = i % 2 === 0 ? "#FEFEFE" : "#F9F9F9"
                  return [
                    /* ── Main row ── */
                    <tr
                      key={p.id}
                      style={{
                        background: rowBg,
                        borderBottom: isExp ? "none" : "1px solid #F0F0F0",
                        borderLeft: `3px solid ${isExp ? "#C0022C" : "transparent"}`,
                      }}
                    >
                      {/* ID-H + expand */}
                      <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <button
                            onClick={() => toggleExpand(p.id)}
                            style={{
                              width: 18, height: 18, border: "1px solid #C0C0C0", borderRadius: 2,
                              background: isExp ? "#333333" : "white", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              padding: 0, flexShrink: 0,
                            }}
                          >
                            <svg
                              width="7" height="7" viewBox="0 0 12 12" fill="none"
                              stroke={isExp ? "white" : "#595959"} strokeWidth="2.2"
                              style={{ transform: isExp ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
                            >
                              <polyline points="3 2 9 6 3 10" />
                            </svg>
                          </button>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#333333" }}>
                            {codProyecto(p.orden, p.idh)}
                          </span>
                        </div>
                      </td>

                      {/* nombre (= "Cliente" en PowerApps) */}
                      <td style={{ padding: "10px 12px", color: "#333333", maxWidth: 220 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.nombre ?? "—"}
                        </div>
                      </td>

                      {/* Ubicación */}
                      <td style={{ padding: "10px 12px", color: "#595959", fontSize: 12, whiteSpace: "nowrap" }}>
                        {p.ubicacion ?? "—"}
                      </td>

                      {/* Tipo de equipo */}
                      <td style={{ padding: "10px 12px", color: "#333333", whiteSpace: "nowrap" }}>
                        {p.tipoEquipo ?? "—"}
                      </td>

                      {/* Fase dropdown */}
                      <td style={{ padding: "10px 12px" }}>
                        <select
                          value={p.faseActual ?? ""}
                          onChange={(e) => patch(p.id, { faseActual: e.target.value || null })}
                          style={inlineSelectStyle}
                        >
                          <option value="">—</option>
                          <option value="FAT">FAT</option>
                          <option value="SAT">SAT</option>
                        </select>
                      </td>

                      {/* Estado dropdown */}
                      <td style={{ padding: "10px 12px" }}>
                        <select
                          value={p.estado}
                          onChange={(e) => patch(p.id, { estado: e.target.value })}
                          style={inlineSelectStyle}
                        >
                          {ESTADO_OPTIONS.map((e) => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Pausar toggle */}
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          <span style={{ fontSize: 10, color: p.pausado ? "#C0022C" : "#959595", fontWeight: p.pausado ? 700 : 400 }}>
                            {p.pausado ? "Pausado" : "Activo"}
                          </span>
                          <button
                            onClick={() => patch(p.id, { pausado: !p.pausado })}
                            style={{
                              width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
                              background: p.pausado ? "#C0022C" : "#CCCCCC",
                              position: "relative", transition: "background 0.2s", padding: 0,
                            }}
                          >
                            <span style={{
                              position: "absolute", top: 2, left: p.pausado ? 18 : 2,
                              width: 16, height: 16, borderRadius: 8, background: "white",
                              transition: "left 0.2s", display: "block",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            }} />
                          </button>
                        </div>
                      </td>
                    </tr>,

                    /* ── Expandable date rows ── */
                    isExp ? (
                      <tr key={`${p.id}-exp`} style={{ background: rowBg, borderBottom: "2px solid #E8E8E8", borderLeft: "3px solid #C0022C" }}>
                        <td colSpan={7} style={{ padding: "0 12px 10px 38px" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
                            <thead>
                              <tr>
                                <th style={{ width: 40, padding: "5px 8px 5px 0" }}></th>
                                <th style={subThStyle}>Canalizaciones</th>
                                <th style={subThStyle}>Mangueras</th>
                                <th style={subThStyle}>Señales</th>
                                <th style={subThStyle}>Pruebas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(["FAT", "SAT"] as const).map((fase) => {
                                const f = fase === "FAT"
                                return (
                                  <tr key={fase}>
                                    <td style={{ padding: "4px 8px 4px 0", fontWeight: 700, fontSize: 11, color: "#595959" }}>
                                      {fase}:
                                    </td>
                                    {([
                                      { ini: f ? "fatCanalIni" : "satCanalIni", fin: f ? "fatCanalFin" : "satCanalFin" },
                                      { ini: f ? "fatMangIni"  : "satMangIni",  fin: f ? "fatMangFin"  : "satMangFin"  },
                                      { ini: f ? "fatSenIni"   : "satSenIni",   fin: f ? "fatSenFin"   : "satSenFin"   },
                                      { ini: f ? "fatPruIni"   : "satPruIni",   fin: f ? "fatPruFin"   : "satPruFin"   },
                                    ] as { ini: keyof Proyecto; fin: keyof Proyecto }[]).map(({ ini, fin }) => (
                                      <td key={String(ini)} style={{ padding: "4px 8px" }}>
                                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                          <DateField
                                            value={p[ini] as string | null}
                                            fieldKey={String(ini)}
                                            proyectoId={p.id}
                                            onSave={patch}
                                          />
                                          <DateField
                                            value={p[fin] as string | null}
                                            fieldKey={String(fin)}
                                            proyectoId={p.id}
                                            onSave={patch}
                                          />
                                        </div>
                                      </td>
                                    ))}
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    ) : null,
                  ]
                })}
                {proyectos.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 60, textAlign: "center", color: "#959595" }}>
                      No hay proyectos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nuevo proyecto">
        {formBody}
      </Modal>
    </>
  )
}

const subThStyle: React.CSSProperties = {
  padding: "5px 8px", textAlign: "left", fontSize: 9, fontWeight: 700,
  color: "#AAAAAA", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.06em",
}
