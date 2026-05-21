import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../../../auth"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string; colId: string }> }

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { colId } = await params
  await db.customColumnDef.delete({ where: { id: colId } })
  return new NextResponse(null, { status: 204 })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { colId } = await params
  const body = await req.json()
  const col = await db.customColumnDef.update({
    where: { id: colId },
    data:  { nombre: body.nombre },
  })
  return NextResponse.json(col)
}
