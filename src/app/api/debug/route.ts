import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? ""
  let dbStatus = "unknown"
  let errorMsg = ""

  try {
    const { PrismaClient } = await import("@prisma/client")
    const client = new PrismaClient()
    await client.$connect()
    await client.$disconnect()
    dbStatus = "connected"
  } catch (err) {
    dbStatus = "error"
    errorMsg = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json({
    dbStatus,
    errorMsg,
    dbUrlPrefix: dbUrl ? dbUrl.slice(0, 25) : "NOT_SET",
    dbUrlLength: dbUrl.length,
    nodeEnv: process.env.NODE_ENV,
  })
}
