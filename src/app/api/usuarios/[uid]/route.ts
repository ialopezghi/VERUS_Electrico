import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../auth"
import { db } from "@/lib/db"

interface Params { params: Promise<{ uid: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { uid } = await params
  const body = await req.json()

  const allowedFields = ["nombre", "puesto", "rol", "activo", "numeroEmpleado"]
  const data: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) data[key] = body[key]
  }

  const usuario = await db.user.update({ where: { id: uid }, data })
  return NextResponse.json(usuario)
}
