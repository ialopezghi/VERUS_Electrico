import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../../../auth"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string; pid: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { pid } = await params
  const body = await req.json()
  const email = session.user.email ?? "unknown"

  const prueba = await db.protocoloPrueba.update({
    where: { id: pid },
    data: { ...body, updatedBy: email },
  })
  return NextResponse.json(prueba)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { pid } = await params
  await db.protocoloPrueba.delete({ where: { id: pid } })
  return NextResponse.json({ ok: true })
}
