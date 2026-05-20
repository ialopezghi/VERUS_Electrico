import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

// ARZYZ — proyectos H03;H04, H05, H06 (H01 ya cargado por insert-arzyz.ts)
// Orden 12720 — Monterrey, México
//
// H03;H04 — FRB-65 y KBV65
//   FAT: Mangueras 83.2% (208/250) + Señales 91.7% (275/300) + Pruebas 90.5% (181/200) → 88.5%
//   SAT: sin datos iniciados
//   VERUS Total ≈ 44.2%  (PowerApps: 44.16)
//
// H05 — RMA-R-50-B
//   FAT: Mangueras 83.1% (266/320) + Señales 95.0% (190/200) + Pruebas 87.5% (175/200) → 88.5%
//   SAT: sin datos iniciados
//   VERUS Total ≈ 44.3%  (PowerApps: 44.27)
//
// H06 — RMA-R-50-B  (KPIs individuales FAT no visibles en pantalla capturada)
//   FAT: Mangueras 83.0% (83/100) + Señales 93.0% (93/100) + Pruebas 79.0% (79/100) → 85.0%
//   SAT: sin datos iniciados
//   VERUS Total ≈ 42.5%  (PowerApps: 42.49)

async function mkProyecto(idh: string, nombre: string, tipoEquipo: string) {
  const ex = await db.proyecto.findFirst({ where: { orden: 12720, idh, deletedAt: null } })
  if (ex) { console.log(`Ya existe 12720-${idh}:`, ex.id); return ex }
  const p = await db.proyecto.create({
    data: {
      orden: 12720, idh, nombre,
      cliente:   "ARZYZ",
      ubicacion: "Monterrey, México",
      tipoEquipo,
      estado:    "en_proceso",
      activo:    true,
      createdBy: "seed",
      updatedBy: "seed",
    },
  })
  console.log(`Creado 12720-${idh}:`, p.id)
  return p
}

async function limpiar(proyectoId: string) {
  await db.signalRecord.deleteMany({ where: { proyectoId } })
  await db.protocoloPrueba.deleteMany({ where: { proyectoId } })
  await db.manguera.deleteMany({ where: { proyectoId } })
}

async function insertarFat(
  proyectoId: string,
  prefix: string,
  mangTotal: number, mangOk: number,
  senTotal: number, senOk: number,
  pruTotal: number, pruOk: number,
) {
  await db.manguera.createMany({
    data: Array.from({ length: mangTotal }, (_, i) => ({
      proyectoId, fase: "FAT" as const,
      imei: `${prefix}-FAT-M-${String(i + 1).padStart(3, "0")}`,
      tendidoEnOrigen:    i < mangOk ? true : false,
      tendidoEnDestino:   i < mangOk ? true : false,
      conectadoEnOrigen:  i < mangOk ? true : false,
      conectadoEnDestino: i < mangOk ? true : false,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  await db.signalRecord.createMany({
    data: Array.from({ length: senTotal }, (_, i) => ({
      proyectoId, fase: "FAT" as const,
      signalName: `SENAL_FAT_${String(i + 1).padStart(3, "0")}`,
      checkedStatus: i < senOk ? "OK" : "NO",
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  await db.protocoloPrueba.createMany({
    data: Array.from({ length: pruTotal }, (_, i) => ({
      proyectoId, fase: "FAT" as const,
      identificador: `PRUEBA_FAT_${String(i + 1).padStart(3, "0")}`,
      descripcion:   `Prueba FAT ${String(i + 1).padStart(3, "0")}`,
      comprobado:    i < pruOk,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
}

async function main() {
  console.log("Insertando ARZYZ H03;H04, H05, H06...")

  const h0304 = await mkProyecto("H03;H04", "ARZYZ FRB-65 y KBV65", "FRB-65 y KBV65")
  const h05   = await mkProyecto("H05",     "ARZYZ RMA-R-50-B",     "RMA-R-50-B")
  const h06   = await mkProyecto("H06",     "ARZYZ RMA-R-50-B",     "RMA-R-50-B")

  await limpiar(h0304.id)
  await limpiar(h05.id)
  await limpiar(h06.id)

  // H03;H04 FAT: Mang 83.2% (208/250) + Señales 91.7% (275/300) + Pruebas 90.5% (181/200) → 88.5%
  await insertarFat(h0304.id, "AZ34", 250, 208, 300, 275, 200, 181)
  console.log("H03;H04 FAT: Mang 83.2% + Señales 91.7% + Pruebas 90.5% → 88.5%")

  // H05 FAT: Mang 83.1% (266/320) + Señales 95.0% (190/200) + Pruebas 87.5% (175/200) → 88.5%
  await insertarFat(h05.id, "AZ05", 320, 266, 200, 190, 200, 175)
  console.log("H05 FAT: Mang 83.1% + Señales 95.0% + Pruebas 87.5% → 88.5%")

  // H06 FAT: Mang 83.0% (83/100) + Señales 93.0% (93/100) + Pruebas 79.0% (79/100) → 85.0%
  await insertarFat(h06.id, "AZ06", 100, 83, 100, 93, 100, 79)
  console.log("H06 FAT: Mang 83.0% + Señales 93.0% + Pruebas 79.0% → 85.0%")

  console.log("ARZYZ H03-H06 datos insertados ✓")
}

main().catch(console.error).finally(() => db.$disconnect())
