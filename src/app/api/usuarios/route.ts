import { NextResponse } from "next/server"
import { auth } from "../../../../auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const usuarios = await db.user.findMany({
    include: {
      asignaciones: {
        include: { proyecto: { select: { idh: true, orden: true } } },
      },
    },
    orderBy: { nombre: "asc" },
  })
  return NextResponse.json(usuarios)
}
