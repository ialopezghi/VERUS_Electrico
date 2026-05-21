import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string; pid: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {

  const { pid } = await params
  const body = await req.json()
  const email = "system"

  const prueba = await db.protocoloPrueba.update({
    where: { id: pid },
    data: { ...body, updatedBy: email },
  })
  return NextResponse.json(prueba)
}

export async function DELETE(_: NextRequest, { params }: Params) {

  const { pid } = await params
  await db.protocoloPrueba.delete({ where: { id: pid } })
  return NextResponse.json({ ok: true })
}
