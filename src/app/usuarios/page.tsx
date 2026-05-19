import { db } from "@/lib/db"
import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import AppShell from "@/components/layout/AppShell"

export const dynamic = "force-dynamic"

const ROL_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  JEFE_OBRA: "Jefe de Obra",
  OPERARIO: "Operario",
  VISOR: "Visor",
}

const rolColors: Record<string, { bg: string; color: string }> = {
  ADMIN:      { bg: "#EDE9FE", color: "#7C3AED" },
  JEFE_OBRA:  { bg: "#FAE8EB", color: "#C0022C" },
  OPERARIO:   { bg: "#F2F2F2", color: "#333333" },
  VISOR:      { bg: "#E0F2FE", color: "#0369A1" },
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#959595", borderBottom: "2px solid #E0E0E0", textTransform: "uppercase", letterSpacing: "0.08em", background: "#F2F2F2", whiteSpace: "nowrap" }}>
    {children}
  </th>
)

export default async function UsuariosPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const usuarios = await db.user.findMany({
    include: {
      asignaciones: {
        include: { proyecto: { select: { idh: true, orden: true } } },
      },
    },
    orderBy: { nombre: "asc" },
  })

  return (
    <AppShell>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#333333", letterSpacing: "0.02em", textTransform: "uppercase" }}>Usuarios</h1>
        </div>

        <div style={{ background: "#FEF9C3", border: "1px solid #FDE68A", borderLeft: "3px solid #D97706", borderRadius: 4, padding: "10px 14px", fontSize: 12, color: "#92400E", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Para activar o desactivar usuarios, contacte con IT.
        </div>

        <div style={{ background: "#FEFEFE", borderRadius: 4, border: "1px solid #E0E0E0", overflow: "hidden", boxShadow: "0 1px 2px rgba(11,11,12,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr><TH>Empleado</TH><TH>Puesto</TH><TH>Mail</TH><TH>Rol</TH><TH>Activo</TH><TH>Proyectos</TH></tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => {
                const proyectos = u.asignaciones.map((a) => `${a.proyecto.orden}-${a.proyecto.idh}`).join(", ")
                const rc = rolColors[u.rol] ?? { bg: "#F2F2F2", color: "#959595" }

                return (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? "#FEFEFE" : "#F9F9F9" }}>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid #F2F2F2" }}>
                      <div style={{ fontWeight: 700, color: "#333333" }}>{u.nombre}</div>
                      {u.numeroEmpleado && <div style={{ fontSize: 10, color: "#959595", marginTop: 2 }}>{u.numeroEmpleado}</div>}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#959595", borderBottom: "1px solid #F2F2F2", fontSize: 12 }}>{u.puesto ?? "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#C0022C", borderBottom: "1px solid #F2F2F2", fontSize: 12 }}>{u.email}</td>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid #F2F2F2" }}>
                      <span style={{ padding: "3px 8px", borderRadius: 2, fontSize: 10, fontWeight: 700, background: rc.bg, color: rc.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {ROL_LABELS[u.rol] ?? u.rol}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid #F2F2F2" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", display: "inline-block", background: u.activo ? "#22C55E" : "#E0E0E0" }} />
                    </td>
                    <td style={{ padding: "12px 14px", color: "#959595", borderBottom: "1px solid #F2F2F2", fontSize: 12, maxWidth: 280 }}>
                      {proyectos || "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
