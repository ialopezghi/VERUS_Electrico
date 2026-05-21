import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Pass the trimmed URL explicitly to handle any accidental whitespace in env vars
const dbUrl = (process.env.DATABASE_URL ?? "").trim()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: dbUrl } },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
