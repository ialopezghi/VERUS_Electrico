import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../../../auth"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string; sid: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { sid } = await params
  const body = await req.json()
  const email = session.user.email ?? "unknown"

  const senal = await db.signalRecord.update({
    where: { id: sid },
    data: { ...body, updatedBy: email },
  })
  return NextResponse.json(senal)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { sid } = await params
  await db.signalRecord.delete({ where: { id: sid } })
  return NextResponse.json({ ok: true })
}
