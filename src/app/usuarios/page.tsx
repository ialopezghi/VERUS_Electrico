import { db } from "@/lib/db"
import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import AppShell from "@/components/layout/AppShell"
import UsuariosClient from "@/components/usuarios/UsuariosClient"

export const dynamic = "force-dynamic"

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
      <UsuariosClient usuarios={usuarios as any} />
    </AppShell>
  )
}
