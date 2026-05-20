import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

// H01 FAT: señales 36.5% → 73/200; SAT mangueras 4.5% → 9/200 → SAT=(4.5+0+0)/3=1.5% → total=(12.17+1.5)/2=6.83%≈6.82%
// H05: todo 0%
// H06 FAT: señales 58.7% → 88/150 → FAT=(0+58.67+0)/3=19.56%≈19.6% → total=(19.56+0)/2=9.78%

async function insertProyecto(orden: number, idh: string, nombre: string, tipoEquipo: string) {
  const ex = await db.proyecto.findFirst({ where: { orden, idh, deletedAt: null } })
  if (ex) { console.log(`Ya existe ${orden}-${idh}`); return ex }
  const p = await db.proyecto.create({
    data: {
      orden, idh, nombre,
      cliente:   "Holmestrand",
      ubicacion: "Holmestrand, Noruega",
      tipoEquipo,
      estado:    "en_proceso",
      activo:    true,
      createdBy: "seed",
      updatedBy: "seed",
    },
  })
  console.log(`Creado ${orden}-${idh}:`, p.id)
  return p
}

async function main() {
  const h01 = await insertProyecto(11576, "H01", "H01, H05, H06 y H08",     "Horno Continuo")
  const h05 = await insertProyecto(11576, "H05", "Holmestrand, MCH-H-15",   "MCH-H-15")
  const h06 = await insertProyecto(11576, "H06", "Holmestrand, Desescoriadora", "Desescoriadora")

  // ── H01 ─────────────────────────────────────────────────────────────────────
  await db.manguera.deleteMany({ where: { proyectoId: h01.id } })
  await db.signalRecord.deleteMany({ where: { proyectoId: h01.id } })
  await db.protocoloPrueba.deleteMany({ where: { proyectoId: h01.id } })

  // FAT señales: 200 total, 73 OK → 36.5%
  await db.signalRecord.createMany({
    data: Array.from({ length: 200 }, (_, i) => ({
      proyectoId: h01.id, fase: "FAT" as const,
      simbolico: `H1-FAT-S-${String(i+1).padStart(3,"0")}`,
      signalName: `Señal FAT ${i+1}`,
      checkedStatus: i < 73 ? "OK" : "",
      createdBy: "seed", updatedBy: "seed",
    })),
  })

  // SAT mangueras: 200 total, 9 OK → 4.5%
  await db.manguera.createMany({
    data: Array.from({ length: 200 }, (_, i) => ({
      proyectoId: h01.id, fase: "SAT" as const,
      imei: `H1-SAT-M-${String(i+1).padStart(3,"0")}`,
      tendidoEnOrigen:    i < 9 ? true : false,
      tendidoEnDestino:   i < 9 ? true : false,
      conectadoEnOrigen:  i < 9 ? true : false,
      conectadoEnDestino: i < 9 ? true : false,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  console.log("H01 datos insertados")

  // ── H06 ─────────────────────────────────────────────────────────────────────
  await db.signalRecord.deleteMany({ where: { proyectoId: h06.id } })

  // FAT señales: 150 total, 88 OK → 58.67%
  await db.signalRecord.createMany({
    data: Array.from({ length: 150 }, (_, i) => ({
      proyectoId: h06.id, fase: "FAT" as const,
      simbolico: `H6-FAT-S-${String(i+1).padStart(3,"0")}`,
      signalName: `Señal FAT ${i+1}`,
      checkedStatus: i < 88 ? "OK" : "",
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  console.log("H06 datos insertados")
  console.log("H05 sin datos (0%)")
}

main().catch(console.error).finally(() => db.$disconnect())
