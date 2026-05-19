import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const proyectos = await db.proyecto.findMany({
    where: { deletedAt: null },
    orderBy: [{ orden: "asc" }, { idh: "asc" }],
  })
  return NextResponse.json(proyectos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const email = session.user.email ?? "unknown"

  const proyecto = await db.proyecto.create({
    data: {
      idh:       body.idh,
      orden:     Number(body.orden),
      nombre:    body.nombre,
      cliente:   body.cliente,
      ubicacion: body.ubicacion,
      tipoEquipo: body.tipoEquipo,
      estado:    body.estado ?? "en_proceso",
      createdBy: email,
      updatedBy: email,
    },
  })
  return NextResponse.json(proyecto, { status: 201 })
}
