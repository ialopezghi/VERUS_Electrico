import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params { params: Promise<{ uid: string }> }

export async function GET(_: NextRequest, { params }: Params) {

  const { uid } = await params
  const usuario = await db.user.findUnique({
    where: { id: uid },
    include: {
      asignaciones: {
        include: { proyecto: { select: { id: true, idh: true, orden: true, nombre: true } } },
      },
    },
  })
  if (!usuario) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(usuario)
}

export async function PATCH(req: NextRequest, { params }: Params) {

  const { uid } = await params
  const body = await req.json()

  const allowedFields = ["nombre", "puesto", "rol", "activo", "numeroEmpleado"]
  const data: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) data[key] = body[key]
  }

  if (Object.keys(data).length > 0) {
    await db.user.update({ where: { id: uid }, data })
  }

  if ("asignaciones" in body && Array.isArray(body.asignaciones)) {
    const proyectoIds: string[] = body.asignaciones
    await db.asignacion.deleteMany({ where: { userId: uid } })
    if (proyectoIds.length > 0) {
      await db.asignacion.createMany({
        data: proyectoIds.map(proyectoId => ({
          userId: uid, proyectoId, createdBy: session.user?.email ?? "system",
        })),
        skipDuplicates: true,
      })
    }
  }

  const usuario = await db.user.findUniqueOrThrow({
    where: { id: uid },
    include: { asignaciones: { include: { proyecto: { select: { idh: true, orden: true } } } } },
  })
  return NextResponse.json(usuario)
}
