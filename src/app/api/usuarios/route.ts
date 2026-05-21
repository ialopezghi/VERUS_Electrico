import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {

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
