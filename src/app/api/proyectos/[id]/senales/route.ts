import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {

  const { id } = await params
  const senales = await db.signalRecord.findMany({
    where: { proyectoId: id },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(senales)
}

export async function POST(req: NextRequest, { params }: Params) {

  const { id } = await params
  const body = await req.json()
  const email = "system"

  const senal = await db.signalRecord.create({
    data: {
      proyectoId:    id,
      fase:          body.fase ?? "FAT",
      simbolico:     body.simbolico ?? null,
      ime:           body.ime ?? null,
      tipoSenhal:    body.tipoSenhal ?? null,
      signalName:    body.signalName ?? body.nombre ?? "",
      checkedStatus: body.checkedStatus ?? body.comprobado ?? "NA",
      comentarios:   body.comentarios ?? null,
      createdBy:     email,
      updatedBy:     email,
    },
  })
  return NextResponse.json(senal, { status: 201 })
}
