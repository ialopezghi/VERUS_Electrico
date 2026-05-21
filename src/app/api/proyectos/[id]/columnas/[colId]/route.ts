import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string; colId: string }> }

export async function DELETE(_: NextRequest, { params }: Params) {

  const { colId } = await params
  await db.customColumnDef.delete({ where: { id: colId } })
  return new NextResponse(null, { status: 204 })
}

export async function PATCH(req: NextRequest, { params }: Params) {

  const { colId } = await params
  const body = await req.json()
  const col = await db.customColumnDef.update({
    where: { id: colId },
    data:  { nombre: body.nombre },
  })
  return NextResponse.json(col)
}
