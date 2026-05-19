import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../../../auth"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string; mid: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { mid } = await params
  const body = await req.json()
  const email = session.user.email ?? "unknown"

  const manguera = await db.manguera.update({
    where: { id: mid },
    data: { ...body, updatedBy: email },
  })
  return NextResponse.json(manguera)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { mid } = await params
  await db.manguera.delete({ where: { id: mid } })
  return NextResponse.json({ ok: true })
}
