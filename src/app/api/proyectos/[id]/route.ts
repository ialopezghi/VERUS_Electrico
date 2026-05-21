import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {

  const { id } = await params
  const p = await db.proyecto.findUnique({ where: { id, deletedAt: null } })
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(p)
}

export async function PATCH(req: NextRequest, { params }: Params) {

  const { id } = await params
  const body = await req.json()
  const email = "system"

  const p = await db.proyecto.update({
    where: { id },
    data: { ...body, updatedBy: email, version: { increment: 1 } },
  })
  return NextResponse.json(p)
}
