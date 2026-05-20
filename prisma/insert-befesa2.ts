import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

// BEFESA ALEMANIA — H03;H04 (H01;H02 ya existe en BD)
// Orden 12737 — Bernburg, Alemania
//
// H03;H04 — FRB-40 y KBV-40
//   FAT: Mangueras 71.1% (64/90) + Señales 87.3% (131/150) + Pruebas 91.4% (64/70) → 83.3%
//   SAT: Mangueras 47.6% (119/250) + Señales 0% + Pruebas 0% → 15.9%
//        (47.6 + 0 + 0) / 3 = 15.87% → "15.9"
//   VERUS Total ≈ 49.6%  (PowerApps: 49.49)

async function main() {
  console.log("Insertando BEFESA 12737-H03;H04...")

  // Buscar incluyendo soft-deleted (H03;H04 fue borrado el 14/05/2026)
  const ex = await db.proyecto.findFirst({ where: { orden: 12737, idh: "H03;H04" } })
  const proyecto = ex
    ? await db.proyecto.update({
        where: { id: ex.id },
        data: {
          nombre:     "BEFESA ALEMANIA - FRB-40 y KBV-40",
          cliente:    "BEFESA",
          ubicacion:  "Bernburg, Alemania",
          tipoEquipo: "FRB-40 y KBV-40",
          estado:     "en_proceso",
          activo:     true,
          deletedAt:  null,  // restaurar soft-delete
          updatedBy:  "seed",
        },
      })
    : await db.proyecto.create({
        data: {
          orden:      12737,
          idh:        "H03;H04",
          nombre:     "BEFESA ALEMANIA - FRB-40 y KBV-40",
          cliente:    "BEFESA",
          ubicacion:  "Bernburg, Alemania",
          tipoEquipo: "FRB-40 y KBV-40",
          estado:     "en_proceso",
          activo:     true,
          createdBy:  "seed",
          updatedBy:  "seed",
        },
      })
  console.log(ex ? "Restaurado (era soft-deleted):" : "Creado:", proyecto.id)

  // Limpiar datos existentes
  await db.signalRecord.deleteMany({ where: { proyectoId: proyecto.id } })
  await db.protocoloPrueba.deleteMany({ where: { proyectoId: proyecto.id } })
  await db.manguera.deleteMany({ where: { proyectoId: proyecto.id } })

  // ── FAT ──────────────────────────────────────────────────────────────────────
  // Mangueras FAT: 90 total, 64 OK → 71.111% → "71.1"
  await db.manguera.createMany({
    data: Array.from({ length: 90 }, (_, i) => ({
      proyectoId: proyecto.id, fase: "FAT" as const,
      imei: `BEF34-FAT-M-${String(i + 1).padStart(3, "0")}`,
      tendidoEnOrigen:    i < 64 ? true : false,
      tendidoEnDestino:   i < 64 ? true : false,
      conectadoEnOrigen:  i < 64 ? true : false,
      conectadoEnDestino: i < 64 ? true : false,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  // Señales FAT: 150 total, 131 OK → 87.333% → "87.3"
  await db.signalRecord.createMany({
    data: Array.from({ length: 150 }, (_, i) => ({
      proyectoId: proyecto.id, fase: "FAT" as const,
      signalName: `SENAL_FAT_${String(i + 1).padStart(3, "0")}`,
      checkedStatus: i < 131 ? "OK" : "NO",
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  // Pruebas FAT: 70 total, 64 OK → 91.428% → "91.4"
  await db.protocoloPrueba.createMany({
    data: Array.from({ length: 70 }, (_, i) => ({
      proyectoId: proyecto.id, fase: "FAT" as const,
      identificador: `PRUEBA_FAT_${String(i + 1).padStart(3, "0")}`,
      descripcion:   `Prueba FAT ${String(i + 1).padStart(3, "0")}`,
      comprobado:    i < 64,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  console.log("FAT: Mang 71.1% + Señales 87.3% + Pruebas 91.4% → 83.3%")

  // ── SAT ──────────────────────────────────────────────────────────────────────
  // Mangueras SAT: 250 total, 119 OK → 47.6%  (PEM = isMangueraOk = conectado en ambos extremos)
  await db.manguera.createMany({
    data: Array.from({ length: 250 }, (_, i) => ({
      proyectoId: proyecto.id, fase: "SAT" as const,
      imei: `BEF34-SAT-M-${String(i + 1).padStart(3, "0")}`,
      tendidoEnOrigen:    i < 134 ? true : false,  // tendido (PF) ≈ 53.7% = 134/250
      tendidoEnDestino:   i < 134 ? true : false,
      conectadoEnOrigen:  i < 119 ? true : false,  // conectado (PEM) = 47.6% = 119/250
      conectadoEnDestino: i < 119 ? true : false,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  // Señales SAT: 100 total, 0 OK → 0%
  await db.signalRecord.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      proyectoId: proyecto.id, fase: "SAT" as const,
      signalName: `SENAL_SAT_${String(i + 1).padStart(3, "0")}`,
      checkedStatus: "NO",
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  // Pruebas SAT: 50 total, 0 OK → 0%
  await db.protocoloPrueba.createMany({
    data: Array.from({ length: 50 }, (_, i) => ({
      proyectoId: proyecto.id, fase: "SAT" as const,
      identificador: `PRUEBA_SAT_${String(i + 1).padStart(3, "0")}`,
      descripcion:   `Prueba SAT ${String(i + 1).padStart(3, "0")}`,
      comprobado:    false,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
  console.log("SAT: Mang 47.6% + Señales 0% + Pruebas 0% → 15.9%")
  console.log("BEFESA H03;H04 datos insertados ✓")
  console.log("VERUS Total esperado: (83.3 + 15.9) / 2 ≈ 49.6%")
}

main().catch(console.error).finally(() => db.$disconnect())
