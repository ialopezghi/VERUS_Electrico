import { db } from "@/lib/db"
import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import AppShell from "@/components/layout/AppShell"
import UsuariosClient from "@/components/usuarios/UsuariosClient"

export const dynamic = "force-dynamic"

export default async function UsuariosPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const [usuarios, proyectos] = await Promise.all([
    db.user.findMany({
      include: {
        asignaciones: {
          include: { proyecto: { select: { id: true, idh: true, orden: true, nombre: true } } },
        },
      },
      orderBy: { nombre: "asc" },
    }),
    db.proyecto.findMany({
      where: { deletedAt: null, activo: true },
      select: { id: true, orden: true, idh: true, nombre: true },
      orderBy: [{ orden: "asc" }, { idh: "asc" }],
    }),
  ])

  return (
    <AppShell>
      <UsuariosClient usuarios={usuarios as any} proyectos={proyectos} />
    </AppShell>
  )
}
