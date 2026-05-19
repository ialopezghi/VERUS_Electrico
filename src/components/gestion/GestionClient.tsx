"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/ui/Modal"
import { FormField, inputStyle, selectStyle } from "@/components/ui/FormField"
import { codProyecto } from "@/lib/kpi"

const ESTADOS = ["ofertado", "en_proceso", "activo", "completado", "pausado", "cancelado"]
const ESTADO_LABELS: Record<string, string> = {
  ofertado: "Ofertado", en_proceso: "En proceso", activo: "Activo",
  completado: "Completado", pausado: "Pausado", cancelado: "Cancelado",
}

function fmtDate(d: Date | string | null) {
  if (!d) return ""
  return new Date(d).toISOString().split("T")[0]
}

const estadoColors: Record<string, { bg: string; color: string }> = {
  completado: { bg: "#DCFCE7", color: "#15803D" },
  activo:     { bg: "#DBEAFE", color: "#1D4ED8" },
  en_proceso: { bg: "#FEF3C7", color: "#D97706" },
  pausado:    { bg: "#FEE2E2", color: "#DC2626" },
  ofertado:   { bg: "#F2F2F2", color: "#959595" },
  cancelado:  { bg: "#F2F2F2", color: "#959595" },
}

function EstadoBadge({ estado }: { estado: string }) {
  const c = estadoColors[estado] ?? { bg: "#F2F2F2", color: "#959595" }
  return (
    <span style={{ padding: "3px 8px", borderRadius: 2, fontSize: 10, fontWeight: 700, background: c.bg, color: c.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {ESTADO_LABELS[estado] ?? estado}
    </span>
  )
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#959595", borderBottom: "2px solid #E0E0E0", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.08em", background: "#F2F2F2" }}>
    {children}
  </th>
)

interface Proyecto {
  id: string; idh: string; orden: number; nombre: string | null; cliente: string | null
  ubicacion: string | null; tipoEquipo: string | null; estado: string
  activo: boolean; pausado: boolean
  fatMangIni: Date | null; fatMangFin: Date | null
  satMangIni: Date | null; satMangFin: Date | null
}

interface Props { proyectos: Proyecto[] }

const emptyForm = { idh: "", orden: "", nombre: "", cliente: "", ubicacion: "", tipoEquipo: "", estado: "en_proceso" }

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

export default function GestionClient({ proyectos: initial }: Props) {
  const router = useRouter()
  const [proyectos, setProyectos] = useState(initial)
  const [showNew, setShowNew] = useState(false)
  const [editando, setEditando] = useState<Proyecto | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, startSave] = useTransition()

  function openNew() { setForm(emptyForm); setShowNew(true) }

  function openEdit(p: Proyecto) {
    setEditando(p)
    setForm({ idh: p.idh, orden: String(p.orden), nombre: p.nombre ?? "", cliente: p.cliente ?? "", ubicacion: p.ubicacion ?? "", tipoEquipo: p.tipoEquipo ?? "", estado: p.estado })
  }

  function field(k: keyof typeof emptyForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function saveNew() {
    startSave(async () => {
      const res = await fetch("/api/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, orden: Number(form.orden) }),
      })
      if (res.ok) {
        const p = await res.json()
        setProyectos((prev) => [...prev, p])
        setShowNew(false)
        router.refresh()
      }
    })
  }

  async function saveEdit() {
    if (!editando) return
    startSave(async () => {
      const res = await fetch(`/api/proyectos/${editando.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, orden: Number(form.orden) }),
      })
      if (res.ok) {
        const p = await res.json()
        setProyectos((prev) => prev.map((x) => (x.id === p.id ? p : x)))
        setEditando(null)
        router.refresh()
      }
    })
  }

  const formBody = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="IDH" required hint="Ej: H01 o H01;H02 para múltiples">
          <input style={inputStyle} value={form.idh} onChange={field("idh")} placeholder="H01" />
        </FormField>
        <FormField label="Nº Pedido" required>
          <input style={inputStyle} type="number" value={form.orden} onChange={field("orden")} placeholder="12737" />
        </FormField>
      </div>
      <FormField label="Nombre interno">
        <input style={inputStyle} value={form.nombre} onChange={field("nombre")} placeholder="BEFESA — Horno rotativo" />
      </FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Cliente">
          <input style={inputStyle} value={form.cliente} onChange={field("cliente")} placeholder="BEFESA" />
        </FormField>
        <FormField label="Ubicación">
          <input style={inputStyle} value={form.ubicacion} onChange={field("ubicacion")} placeholder="Bilbao" />
        </FormField>
      </div>
      <FormField label="Tipo de equipo">
        <input style={inputStyle} value={form.tipoEquipo} onChange={field("tipoEquipo")} placeholder="Horno rotativo" />
      </FormField>
      <FormField label="Estado">
        <select style={selectStyle} value={form.estado} onChange={field("estado")}>
          {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
        </select>
      </FormField>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 10, borderTop: "1px solid #E0E0E0" }}>
        <button onClick={() => { setShowNew(false); setEditando(null) }} style={btnSecondary}>Cancelar</button>
        <button onClick={editando ? saveEdit : saveNew} disabled={saving || !form.idh || !form.orden}
          style={{ ...btnPrimary, background: saving ? "#E0E0E0" : "#C0022C", color: saving ? "#959595" : "white", cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Guardando…" : editando ? "Guardar cambios" : "Crear proyecto"}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#333333", letterSpacing: "0.02em", textTransform: "uppercase" }}>Gestión Proyectos</h1>
          <button onClick={openNew} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
            <img src="/icons/white/add.svg" alt="" width={14} height={14} style={{ filter: "brightness(10)" }} />
            Nuevo proyecto
          </button>
        </div>

        <div style={{ background: "#FEFEFE", borderRadius: 4, border: "1px solid #E0E0E0", overflow: "hidden", boxShadow: "0 1px 2px rgba(11,11,12,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <TH>ID-H</TH><TH>Cliente</TH><TH>Ubicación</TH><TH>Tipo equipo</TH>
                  <TH>Estado</TH><TH>FAT Mang Ini</TH><TH>FAT Mang Fin</TH>
                  <TH>SAT Mang Ini</TH><TH>SAT Mang Fin</TH><TH>{""}</TH>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? "#FEFEFE" : "#F9F9F9", borderLeft: "3px solid transparent" }}>
                    <td style={{ padding: "12px 12px", fontWeight: 700, color: "#333333", borderBottom: "1px solid #F2F2F2" }}>
                      {codProyecto(p.orden, p.idh)}
                      {p.nombre && <div style={{ fontSize: 11, fontWeight: 400, color: "#959595", marginTop: 2 }}>{p.nombre}</div>}
                    </td>
                    <td style={{ padding: "12px 12px", color: "#333333", borderBottom: "1px solid #F2F2F2" }}>{p.cliente ?? "—"}</td>
                    <td style={{ padding: "12px 12px", color: "#959595", borderBottom: "1px solid #F2F2F2", fontSize: 12 }}>{p.ubicacion ?? "—"}</td>
                    <td style={{ padding: "12px 12px", color: "#333333", borderBottom: "1px solid #F2F2F2" }}>{p.tipoEquipo ?? "—"}</td>
                    <td style={{ padding: "12px 12px", borderBottom: "1px solid #F2F2F2" }}><EstadoBadge estado={p.estado} /></td>
                    <td style={{ padding: "12px 12px", color: "#959595", borderBottom: "1px solid #F2F2F2", fontSize: 12 }}>{fmtDate(p.fatMangIni) || "—"}</td>
                    <td style={{ padding: "12px 12px", color: "#959595", borderBottom: "1px solid #F2F2F2", fontSize: 12 }}>{fmtDate(p.fatMangFin) || "—"}</td>
                    <td style={{ padding: "12px 12px", color: "#959595", borderBottom: "1px solid #F2F2F2", fontSize: 12 }}>{fmtDate(p.satMangIni) || "—"}</td>
                    <td style={{ padding: "12px 12px", color: "#959595", borderBottom: "1px solid #F2F2F2", fontSize: 12 }}>{fmtDate(p.satMangFin) || "—"}</td>
                    <td style={{ padding: "12px 12px", borderBottom: "1px solid #F2F2F2" }}>
                      <button onClick={() => openEdit(p)}
                        style={{ padding: "4px 10px", borderRadius: 2, border: "1px solid #E0E0E0", background: "#FEFEFE", fontSize: 11, cursor: "pointer", color: "#333333", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                        <img src="/icons/dark/edit-04.svg" alt="" width={13} height={13} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {proyectos.length === 0 && (
                  <tr><td colSpan={10} style={{ padding: 60, textAlign: "center", color: "#959595" }}>No hay proyectos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nuevo proyecto">
        {formBody}
      </Modal>
      <Modal open={!!editando} onClose={() => setEditando(null)} title={editando ? `Editar ${codProyecto(editando.orden, editando.idh)}` : ""}>
        {formBody}
      </Modal>
    </>
  )
}
