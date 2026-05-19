import { db } from "@/lib/db"
import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import AppShell from "@/components/layout/AppShell"
import GestionClient from "@/components/gestion/GestionClient"

export const dynamic = "force-dynamic"

export default async function GestionPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const proyectos = await db.proyecto.findMany({
    where: { deletedAt: null },
    orderBy: [{ orden: "asc" }, { idh: "asc" }],
  })

  return (
    <AppShell>
      <GestionClient proyectos={proyectos as any} />
    </AppShell>
  )
}
