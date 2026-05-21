import { db } from "@/lib/db"
import { auth } from "../../../../auth"
import { redirect, notFound } from "next/navigation"
import { codProyecto } from "@/lib/kpi"
import ProyectoDetailClient from "@/components/proyectos/ProyectoDetailClient"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProyectoDetailPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const proyecto = await db.proyecto.findUnique({
    where: { id, deletedAt: null },
    include: {
      mangueras:        { where: { deletedAt: null }, orderBy: { imei: "asc" } },
      signalRecords:    { where: { deletedAt: null }, orderBy: { signalName: "asc" } },
      protocoloPruebas: { where: { deletedAt: null }, orderBy: { identificador: "asc" } },
      canalizaciones:   { where: { deletedAt: null }, orderBy: { imei: "asc" } },
      historicoAvances: { orderBy: { fecha: "asc" } },
      customColumnDefs: { orderBy: [{ tabla: "asc" }, { orden: "asc" }, { createdAt: "asc" }] },
    },
  })

  if (!proyecto) notFound()

  const codigo = codProyecto(proyecto.orden, proyecto.idh)
  const proyectoPlain = JSON.parse(JSON.stringify(proyecto))

  return <ProyectoDetailClient proyecto={proyectoPlain} codigo={codigo} />
}
