import { db } from "@/lib/db"
import AppShell from "@/components/layout/AppShell"
import GestionClient from "@/components/gestion/GestionClient"

export const dynamic = "force-dynamic"

export default async function GestionPage() {

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
