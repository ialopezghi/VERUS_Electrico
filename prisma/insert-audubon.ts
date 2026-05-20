import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

// FAT: mang=100%(300/300), señales=84.1%(269/320), pruebas=98.1%(157/160) → (100+84.06+98.125)/3=94.06%≈94.1%
// SAT: mang=100%(200/200), señales=100%(200/200), pruebas=88.7%(133/150) → (100+100+88.67)/3=96.22%≈96.2%

async function main() {
  const ex = await db.proyecto.findFirst({ where: { orden: 11586, idh: "H01;H02", deletedAt: null } })
  let p = ex
  if (!p) {
    p = await db.proyecto.create({
      data: {
        orden:      11586,
        idh:        "H01;H02",
        nombre:     "Audubon FRB-30",
        cliente:    "Audubon",
        ubicacion:  "Ohio, USA",
        tipoEquipo: "FRB-30",
        estado:     "en_proceso",
        activo:     true,
        createdBy:  "seed",
        updatedBy:  "seed",
      },
    })
    console.log("Creado 11586-H01;H02:", p.id)
  } else {
    console.log("Ya existe:", p.id)
  }

  await db.manguera.deleteMany({ where: { proyectoId: p.id } })
  await db.signalRecord.deleteMany({ where: { proyectoId: p.id } })
  await db.protocoloPrueba.deleteMany({ where: { proyectoId: p.id } })

  // FAT mangueras: 300 OK → 100%
  await db.manguera.createMany({
    data: Array.from({ length: 300 }, (_, i) => ({
      proyectoId: p!.id, fase: "FAT" as const,
      imei: `AUD-FAT-M-${String(i+1).padStart(3,"0")}`,
      tendidoEnOrigen: true, tendidoEnDestino: true,
      conectadoEnOrigen: true, conectadoEnDestino: true,
      createdBy: "seed", updatedBy: "seed",
    })),
  })

  // FAT señales: 320 total, 269 OK → 84.06%
  await db.signalRecord.createMany({
    data: Array.from({ length: 320 }, (_, i) => ({
      proyectoId: p!.id, fase: "FAT" as const,
      simbolico: `AUD-FAT-S-${String(i+1).padStart(3,"0")}`,
      signalName: `Señal FAT ${i+1}`,
      checkedStatus: i < 269 ? "OK" : "",
      createdBy: "seed", updatedBy: "seed",
    })),
  })

  // FAT pruebas: 160 total, 157 OK → 98.125%
  await db.protocoloPrueba.createMany({
    data: Array.from({ length: 160 }, (_, i) => ({
      proyectoId: p!.id, fase: "FAT" as const,
      identificador: `AUD-FAT-P-${String(i+1).padStart(3,"0")}`,
      tipo: "Funcional",
      comprobado: i < 157,
      createdBy: "seed", updatedBy: "seed",
    })),
  })

  // SAT mangueras: 200 OK → 100%
  await db.manguera.createMany({
    data: Array.from({ length: 200 }, (_, i) => ({
      proyectoId: p!.id, fase: "SAT" as const,
      imei: `AUD-SAT-M-${String(i+1).padStart(3,"0")}`,
      tendidoEnOrigen: true, tendidoEnDestino: true,
      conectadoEnOrigen: true, conectadoEnDestino: true,
      createdBy: "seed", updatedBy: "seed",
    })),
  })

  // SAT señales: 200 OK → 100%
  await db.signalRecord.createMany({
    data: Array.from({ length: 200 }, (_, i) => ({
      proyectoId: p!.id, fase: "SAT" as const,
      simbolico: `AUD-SAT-S-${String(i+1).padStart(3,"0")}`,
      signalName: `Señal SAT ${i+1}`,
      checkedStatus: "OK",
      createdBy: "seed", updatedBy: "seed",
    })),
  })

  // SAT pruebas: 150 total, 133 OK → 88.67%
  await db.protocoloPrueba.createMany({
    data: Array.from({ length: 150 }, (_, i) => ({
      proyectoId: p!.id, fase: "SAT" as const,
      identificador: `AUD-SAT-P-${String(i+1).padStart(3,"0")}`,
      tipo: "Funcional",
      comprobado: i < 133,
      createdBy: "seed", updatedBy: "seed",
    })),
  })

  console.log("Audubon datos insertados: 500 mang, 520 señales, 310 pruebas")
}

main().catch(console.error).finally(() => db.$disconnect())
