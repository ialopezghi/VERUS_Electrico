import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../../auth"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const pruebas = await db.protocoloPrueba.findMany({
    where: { proyectoId: id },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(pruebas)
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const email = session.user.email ?? "unknown"

  const prueba = await db.protocoloPrueba.create({
    data: {
      proyectoId:    id,
      fase:          body.fase ?? "FAT",
      identificador: body.identificador,
      tipo:          body.tipo ?? null,
      descripcion:   body.descripcion ?? null,
      valorTeorico:  body.valorTeorico ?? null,
      valorReal:     body.valorReal ?? null,
      comprobado:    body.comprobado ?? false,
      comentarios:   body.comentarios ?? null,
      createdBy:     email,
      updatedBy:     email,
    },
  })
  return NextResponse.json(prueba, { status: 201 })
}
