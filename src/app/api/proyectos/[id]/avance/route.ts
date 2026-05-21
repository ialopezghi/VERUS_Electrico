import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {

  const { id } = await params
  const registros = await db.historicoAvance.findMany({
    where: { proyectoId: id },
    orderBy: { fecha: "asc" },
  })
  return NextResponse.json(registros)
}

export async function POST(req: NextRequest, { params }: Params) {

  const { id } = await params
  const body = await req.json()
  const email = "system"

  const n = (v: unknown) => (v != null ? Number(v) : 0)

  const registro = await db.historicoAvance.create({
    data: {
      proyectoId:             id,
      fecha:                  new Date(body.fecha),
      porcentajeFat:          n(body.porcentajeFat),
      porcentajePruebasFat:   n(body.porcentajePruebasFat),
      porcentajeSenalesFat:   n(body.porcentajeSenalesFat),
      porcentajeManguerasFat: n(body.porcentajeManguerasFat),
      porcentajeSat:          n(body.porcentajeSat),
      porcentajePruebasSat:   n(body.porcentajePruebasSat),
      porcentajeSenalesSat:   n(body.porcentajeSenalesSat),
      porcentajeManguerasSat: n(body.porcentajeManguerasSat),
      porcentajeTotal:        n(body.porcentajeTotal),
      createdBy:              email,
    },
  })
  return NextResponse.json(registro, { status: 201 })
}
