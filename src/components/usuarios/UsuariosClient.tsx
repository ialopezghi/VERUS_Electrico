"use client"
import { useState, useMemo } from "react"
import Modal from "@/components/ui/Modal"
import { inputStyle } from "@/components/ui/FormField"
import { codProyecto } from "@/lib/kpi"

const ROL_LABELS: Record<string, string> = {
  ADMIN:      "Administrador",
  JEFE_OBRA:  "Jefe de Obra",
  SUPERVISOR: "Supervisor",
  OPERARIO:   "Operario",
  VISOR:      "Visor",
}

const ROL_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN:      { bg: "#EDE9FE", color: "#7C3AED" },
  JEFE_OBRA:  { bg: "#FAE8EB", color: "#C0022C" },
  SUPERVISOR: { bg: "#E0F2FE", color: "#0369A1" },
  OPERARIO:   { bg: "#F2F2F2", color: "#333333" },
  VISOR:      { bg: "#FEF9C3", color: "#92400E" },
}

interface AsignProyecto {
  id: string; idh: string; orden: number; nombre: string | null
}

interface Asignacion {
  proyecto: AsignProyecto
}

interface Usuario {
  id: string
  email: string
  nombre: string
  numeroEmpleado: number | null
  puesto: string | null
  rol: string
  activo: boolean
  asignaciones: Asignacion[]
}

interface ProyectoOpt {
  id: string; orden: number; idh: string; nombre: string | null
}

// ── Multi-select de proyectos (inline, sin position:absolute) ─────────────────
function ProyectoPicker({
  todos,
  selected,
  onChange,
}: {
  todos: ProyectoOpt[]
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [buscar, setBuscar] = useState("")

  const selectedProyectos = todos.filter(p => selected.includes(p.id))

  const disponibles = useMemo(() => {
    const q = buscar.toLowerCase()
    return todos.filter(p => {
      if (selected.includes(p.id)) return false
      const cod = codProyecto(p.orden, p.idh).toLowerCase()
      const nom = (p.nombre ?? "").toLowerCase()
      return !q || cod.includes(q) || nom.includes(q)
    })
  }, [todos, selected, buscar])

  function add(id: string) { onChange([...selected, id]); setBuscar("") }
  function remove(id: string) { onChange(selected.filter(x => x !== id)) }

  return (
    <div style={{ border: "1px solid #E0E0E0", borderRadius: 2, background: "#fff", overflow: "hidden" }}>
      {/* Tags row + toggle */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          minHeight: 38, padding: "5px 8px", cursor: "pointer",
          display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center",
          background: open ? "#FAFAFA" : "#fff",
        }}
      >
        {selectedProyectos.map(p => (
          <span key={p.id} style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            background: "#EEF0F3", border: "1px solid #D8DBE0", borderRadius: 2,
            padding: "2px 6px", fontSize: 11, color: "#333333", fontWeight: 600,
          }}>
            {codProyecto(p.orden, p.idh)}
            <button type="button" onClick={e => { e.stopPropagation(); remove(p.id) }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "#888", fontSize: 14, marginLeft: 1 }}>
              ×
            </button>
          </span>
        ))}
        {selectedProyectos.length === 0 && (
          <span style={{ color: "#aaa", fontSize: 12 }}>Sin asignaciones</span>
        )}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#959595" strokeWidth="2.5"
          style={{ marginLeft: "auto", flexShrink: 0, transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Inline dropdown */}
      {open && (
        <>
          {/* Search */}
          <div style={{ borderTop: "1px dashed #E0E0E0", padding: "6px 10px", background: "#FAFAFA" }}>
            <input
              autoFocus
              type="text"
              placeholder="Buscar elementos"
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              style={{ width: "100%", border: "none", outline: "none", fontSize: 12, color: "#333", background: "transparent", boxSizing: "border-box" }}
            />
          </div>
          {/* List */}
          <div style={{ borderTop: "1px solid #EFEFEF", maxHeight: 220, overflowY: "auto" }}>
            {disponibles.length === 0 ? (
              <div style={{ padding: "10px 12px", color: "#959595", fontSize: 12 }}>
                {buscar ? "Sin resultados" : "Todos los proyectos ya asignados"}
              </div>
            ) : disponibles.map(p => (
              <div
                key={p.id}
                onClick={() => add(p.id)}
                style={{ padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #F5F5F5" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F5F8FF")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#C0022C", letterSpacing: "0.02em" }}>
                  {codProyecto(p.orden, p.idh)}
                </div>
                {p.nombre && (
                  <div style={{ fontSize: 11, color: "#777", marginTop: 1 }}>{p.nombre}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Header de tabla ────────────────────────────────────────────────────────────
const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#959595", borderBottom: "2px solid #E0E0E0", textTransform: "uppercase", letterSpacing: "0.08em", background: "#F2F2F2", whiteSpace: "nowrap" }}>
    {children}
  </th>
)

// ── Componente principal ───────────────────────────────────────────────────────
export default function UsuariosClient({
  usuarios: initial,
  proyectos,
}: {
  usuarios: Usuario[]
  proyectos: ProyectoOpt[]
}) {
  const [usuarios, setUsuarios] = useState(initial)
  const [query, setQuery] = useState("")
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [editEmp, setEditEmp] = useState("")
  const [editAsig, setEditAsig] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const filtrados = useMemo(() => {
    if (!query.trim()) return usuarios
    const q = query.toLowerCase()
    return usuarios.filter(u =>
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.puesto ?? "").toLowerCase().includes(q) ||
      ROL_LABELS[u.rol]?.toLowerCase().includes(q)
    )
  }, [usuarios, query])

  function abrirEdicion(u: Usuario) {
    setEditando(u)
    setEditEmp(u.numeroEmpleado != null ? String(u.numeroEmpleado) : "")
    setEditAsig(u.asignaciones.map(a => a.proyecto.id))
  }

  async function patchUsuario(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) { alert("Error al guardar"); return null }
    return await res.json()
  }

  async function toggleActivo(u: Usuario) {
    const updated = await patchUsuario(u.id, { activo: !u.activo })
    if (updated) setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, ...updated } : x))
  }

  async function insertar() {
    if (!editando) return
    setSaving(true)
    const updated = await patchUsuario(editando.id, {
      numeroEmpleado: editEmp !== "" ? Number(editEmp) : null,
      asignaciones: editAsig,
    })
    setSaving(false)
    if (updated) {
      setUsuarios(prev => prev.map(u => u.id === editando.id ? { ...u, ...updated } : u))
      setEditando(null)
    }
  }

  async function eliminar() {
    if (!editando) return
    if (!confirm(`¿Desactivar a ${editando.nombre}?`)) return
    setSaving(true)
    const updated = await patchUsuario(editando.id, { activo: false })
    setSaving(false)
    if (updated) {
      setUsuarios(prev => prev.map(u => u.id === editando.id ? { ...u, ...updated } : u))
      setEditando(null)
    }
  }

  const btnBase: React.CSSProperties = {
    flex: 1, padding: "10px 0", border: "none", cursor: saving ? "not-allowed" : "pointer",
    fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    borderRadius: 2, opacity: saving ? 0.6 : 1,
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#333333", letterSpacing: "0.02em", textTransform: "uppercase" }}>
          Usuarios
        </h1>
        <span style={{ fontSize: 12, color: "#959595" }}>
          {usuarios.filter(u => u.activo).length} activos · {usuarios.length} total
        </span>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 340 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#959595" strokeWidth="2"
          style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text" placeholder="Buscar por nombre, email, puesto…"
          value={query} onChange={e => setQuery(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 32, paddingRight: query ? 32 : 12, width: "100%", boxSizing: "border-box" }}
        />
        {query && (
          <button onClick={() => setQuery("")}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#959595", padding: 2, lineHeight: 1 }}>
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "#FEFEFE", borderRadius: 4, border: "1px solid #E0E0E0", overflow: "hidden", boxShadow: "0 1px 2px rgba(11,11,12,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <TH>Empleado</TH>
              <TH>Puesto</TH>
              <TH>Mail</TH>
              <TH>Rol</TH>
              <TH>Activar</TH>
              <TH>Proyectos</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((u, i) => {
              const rc = ROL_COLORS[u.rol] ?? { bg: "#F2F2F2", color: "#959595" }
              const proyectosStr = u.asignaciones.length > 0
                ? u.asignaciones.map(a => codProyecto(a.proyecto.orden, a.proyecto.idh)).join(", ")
                : "—"

              return (
                <tr key={u.id} style={{ background: i % 2 === 0 ? "#FEFEFE" : "#F9F9F9" }}>
                  <td style={{ padding: "12px 14px", borderBottom: "1px solid #F2F2F2" }}>
                    <div style={{ fontWeight: 700, color: "#333333" }}>{u.nombre}</div>
                    {u.numeroEmpleado != null && (
                      <div style={{ fontSize: 10, color: "#959595", marginTop: 2 }}>#{u.numeroEmpleado}</div>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", color: "#959595", borderBottom: "1px solid #F2F2F2", fontSize: 12, fontStyle: "italic" }}>
                    {u.puesto || "—"}
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: "1px solid #F2F2F2", fontSize: 12 }}>
                    <a href={`mailto:${u.email}`} style={{ color: "#C0022C", textDecoration: "none" }}>{u.email}</a>
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: "1px solid #F2F2F2" }}>
                    <span style={{ padding: "3px 8px", borderRadius: 2, fontSize: 10, fontWeight: 700, background: rc.bg, color: rc.color, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                      {ROL_LABELS[u.rol] ?? u.rol}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: "1px solid #F2F2F2" }}>
                    <button
                      onClick={() => toggleActivo(u)}
                      title={u.activo ? "Desactivar" : "Activar"}
                      style={{
                        width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                        background: u.activo ? "#22C55E" : "#D1D5DB",
                        position: "relative", transition: "background 0.2s", display: "inline-block",
                      }}
                    >
                      <span style={{
                        position: "absolute", top: 3, left: u.activo ? 18 : 3,
                        width: 16, height: 16, borderRadius: "50%", background: "#fff",
                        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }} />
                    </button>
                  </td>
                  <td style={{ padding: "12px 14px", color: "#959595", borderBottom: "1px solid #F2F2F2", fontSize: 11, maxWidth: 280, lineHeight: 1.5 }}>
                    {proyectosStr}
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: "1px solid #F2F2F2", textAlign: "center" }}>
                    <button onClick={() => abrirEdicion(u)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#959595", padding: 4, borderRadius: 2 }}
                      title="Editar usuario">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "32px 14px", textAlign: "center", color: "#959595", fontSize: 13 }}>
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editando && (
        <Modal open={true} title={editando.nombre} onClose={() => setEditando(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0 8px" }}>
            {/* Nº empleado */}
            <input
              type="number"
              value={editEmp}
              onChange={e => setEditEmp(e.target.value)}
              placeholder="Nº empleado"
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
            />

            {/* Proyectos multi-select */}
            <ProyectoPicker
              todos={proyectos}
              selected={editAsig}
              onChange={setEditAsig}
            />

            {/* Botones */}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={eliminar}
                disabled={saving}
                style={{ ...btnBase, background: "#E0E0E0", color: "#333333" }}>
                Eliminar
              </button>
              <button
                type="button"
                onClick={insertar}
                disabled={saving}
                style={{ ...btnBase, background: "#C0022C", color: "#fff" }}>
                {saving ? "Guardando…" : "Insertar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
