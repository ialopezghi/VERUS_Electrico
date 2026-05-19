import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../../auth"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const canalizaciones = await db.canalizacion.findMany({
    where: { proyectoId: id },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(canalizaciones)
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const email = session.user.email ?? "unknown"

  const canal = await db.canalizacion.create({
    data: {
      proyectoId: id,
      fase:       body.fase ?? "FAT",
      imei:       body.imei,
      tipo:       body.tipo ?? null,
      ubicacion:  body.ubicacion ?? null,
      metros:     body.metros != null ? Number(body.metros) : null,
      createdBy:  email,
      updatedBy:  email,
    },
  })
  return NextResponse.json(canal, { status: 201 })
}
