import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {

  const { id } = await params
  const mangueras = await db.manguera.findMany({
    where: { proyectoId: id },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(mangueras)
}

export async function POST(req: NextRequest, { params }: Params) {

  const { id } = await params
  const body = await req.json()
  const email = "system"

  const manguera = await db.manguera.create({
    data: {
      proyectoId:           id,
      fase:                 body.fase ?? "FAT",
      imei:                 body.imei,
      origen:               body.origen ?? null,
      destino:              body.destino ?? null,
      descripcion:          body.descripcion ?? null,
      metros:               body.metros != null ? Number(body.metros) : null,
      conectadoEnOrigen:    body.conectadoEnOrigen ?? null,
      tendidoEnOrigen:      body.tendidoEnOrigen ?? null,
      tendidoEnDestino:     body.tendidoEnDestino ?? null,
      conectadoEnDestino:   body.conectadoEnDestino ?? null,
      comentarios:          body.comentarios ?? null,
      createdBy:            email,
      updatedBy:            email,
    },
  })
  return NextResponse.json(manguera, { status: 201 })
}
