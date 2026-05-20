import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

// Speira Neuss — 2 hornos, orden 12545, Neuss Alemania
//
// H01: Speira Neuss RAN-2R
//   FAT: Mangueras 0% + Señales 0% + Pruebas 49.5% (99/200) → Avance FAT 16.5%
//   SAT: Mangueras 0% + Señales 98% (245/250) + Pruebas 97.8% (489/500) → Avance SAT 65.3%
//
// H02: Speira Neuss MCH-H-12
//   FAT: sin datos
//   SAT: Mangueras 0% + Señales 96.1% (298/310) + Pruebas 0% → Avance SAT 32.0%

async function mkProyecto(orden: number, idh: string, nombre: string, tipoEquipo: string) {
  const ex = await db.proyecto.findFirst({ where: { orden, idh, deletedAt: null } })
  if (ex) { console.log(`Ya existe ${orden}-${idh}:`, ex.id); return ex }
  const p = await db.proyecto.create({
    data: {
      orden, idh, nombre,
      cliente:   "Speira",
      ubicacion: "Neuss, Alemania",
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

async function limpiar(proyectoId: string) {
  await db.signalRecord.deleteMany({ where: { proyectoId } })
  await db.protocoloPrueba.deleteMany({ where: { proyectoId } })
  await db.manguera.deleteMany({ where: { proyectoId } })
}

async function main() {
  console.log("Insertando datos Speira Neuss 12545...")

  const h01 = await mkProyecto(12545, "H01", "Speira Neuss RAN-2R", "RAN-2R")
  const h02 = await mkProyecto(12545, "H02", "Speira Neuss MCH-H-12", "MCH-H-12")

  await limpiar(h01.id)
  await limpiar(h02.id)

  // ── H01 FAT ──────────────────────────────────────────────────────────────────
  // Mangueras FAT: 100 total, 0 OK → 0%
  await db.manguera.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      proyectoId: h01.id, fase: "FAT" as const,
      imei: `NEU01-FAT-M-${String(i + 1).padStart(3, "0")}`,
      tendidoEnOrigen: false, tendidoEnDestino: false,
      conectadoEnOrigen: false, conectadoEnDestino: false,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  // Señales FAT: 100 total, 0 OK → 0%
  await db.signalRecord.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      proyectoId: h01.id, fase: "FAT" as const,
      signalName: `SENAL_FAT_${String(i + 1).padStart(3, "0")}`,
      checkedStatus: "NO",
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  // Pruebas FAT: 200 total, 99 OK → 99/200 = 49.5%
  await db.protocoloPrueba.createMany({
    data: Array.from({ length: 200 }, (_, i) => ({
      proyectoId: h01.id, fase: "FAT" as const,
      identificador: `PRUEBA_FAT_${String(i + 1).padStart(3, "0")}`,
      descripcion: `Prueba FAT ${String(i + 1).padStart(3, "0")}`,
      comprobado: i < 99,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  console.log("H01 FAT: Mang 0% + Señales 0% + Pruebas 49.5% → 16.5%")

  // ── H01 SAT ──────────────────────────────────────────────────────────────────
  // Mangueras SAT: 100 total, 0 OK → 0%
  await db.manguera.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      proyectoId: h01.id, fase: "SAT" as const,
      imei: `NEU01-SAT-M-${String(i + 1).padStart(3, "0")}`,
      tendidoEnOrigen: false, tendidoEnDestino: false,
      conectadoEnOrigen: false, conectadoEnDestino: false,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  // Señales SAT: 250 total, 245 OK → 98.0%
  await db.signalRecord.createMany({
    data: Array.from({ length: 250 }, (_, i) => ({
      proyectoId: h01.id, fase: "SAT" as const,
      signalName: `SENAL_SAT_${String(i + 1).padStart(3, "0")}`,
      checkedStatus: i < 245 ? "OK" : "NO",
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  // Pruebas SAT: 500 total, 489 OK → 97.8%
  await db.protocoloPrueba.createMany({
    data: Array.from({ length: 500 }, (_, i) => ({
      proyectoId: h01.id, fase: "SAT" as const,
      identificador: `PRUEBA_SAT_${String(i + 1).padStart(3, "0")}`,
      descripcion: `Prueba SAT ${String(i + 1).padStart(3, "0")}`,
      comprobado: i < 489,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  console.log("H01 SAT: Mang 0% + Señales 98.0% + Pruebas 97.8% → 65.3%")

  // ── H02 SAT ──────────────────────────────────────────────────────────────────
  // Mangueras SAT: 100 total, 0 OK → 0%
  await db.manguera.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      proyectoId: h02.id, fase: "SAT" as const,
      imei: `NEU02-SAT-M-${String(i + 1).padStart(3, "0")}`,
      tendidoEnOrigen: false, tendidoEnDestino: false,
      conectadoEnOrigen: false, conectadoEnDestino: false,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  // Señales SAT: 310 total, 298 OK → 298/310 = 96.129% → "96.1"
  await db.signalRecord.createMany({
    data: Array.from({ length: 310 }, (_, i) => ({
      proyectoId: h02.id, fase: "SAT" as const,
      signalName: `SENAL_SAT_${String(i + 1).padStart(3, "0")}`,
      checkedStatus: i < 298 ? "OK" : "NO",
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  // Pruebas SAT: 100 total, 0 OK → 0%
  await db.protocoloPrueba.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      proyectoId: h02.id, fase: "SAT" as const,
      identificador: `PRUEBA_SAT_${String(i + 1).padStart(3, "0")}`,
      descripcion: `Prueba SAT ${String(i + 1).padStart(3, "0")}`,
      comprobado: false,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  console.log("H02 SAT: Mang 0% + Señales 96.1% + Pruebas 0% → 32.0%")

  console.log("Speira Neuss datos insertados ✓")
}

main().catch(console.error).finally(() => db.$disconnect())
