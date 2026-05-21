import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string; sid: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {

  const { sid } = await params
  const body = await req.json()
  const email = "system"

  const senal = await db.signalRecord.update({
    where: { id: sid },
    data: { ...body, updatedBy: email },
  })
  return NextResponse.json(senal)
}

export async function DELETE(_: NextRequest, { params }: Params) {

  const { sid } = await params
  await db.signalRecord.delete({ where: { id: sid } })
  return NextResponse.json({ ok: true })
}
