import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../../auth"
import { db } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const cols = await db.customColumnDef.findMany({
    where: { proyectoId: id },
    orderBy: [{ tabla: "asc" }, { orden: "asc" }, { createdAt: "asc" }],
  })
  return NextResponse.json(cols)
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const email = session.user.email ?? "unknown"

  const col = await db.customColumnDef.create({
    data: {
      proyectoId: id,
      tabla:      body.tabla,
      nombre:     body.nombre,
      orden:      body.orden ?? 0,
      createdBy:  email,
    },
  })
  return NextResponse.json(col, { status: 201 })
}
