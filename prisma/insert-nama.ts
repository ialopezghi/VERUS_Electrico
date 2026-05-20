import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

// NAMA 12290-H01 — VORTEX 5 t/h RAN-R-40 — Coahuila de Zaragoza, México
// SAT: Mangueras 0%, Señales 96.8% (242/250), Pruebas 89.2% (223/250)
// Avance SAT = (0 + 96.8 + 89.2) / 3 = 62%

async function main() {
  console.log("Insertando datos NAMA 12290-H01...")

  // Crear o reutilizar proyecto
  let proyecto = await db.proyecto.findFirst({ where: { orden: 12290, idh: "H01", deletedAt: null } })
  if (!proyecto) {
    proyecto = await db.proyecto.create({
      data: {
        orden:      12290,
        idh:        "H01",
        nombre:     "NAMA - VORTEX 5 t/h RAN-R-40",
        cliente:    "NAMA",
        ubicacion:  "Coahuila de Zaragoza, México",
        tipoEquipo: "RAN-R-40",
        estado:     "en_proceso",
        activo:     true,
        createdBy:  "seed",
        updatedBy:  "seed",
      },
    })
    console.log("Proyecto creado:", proyecto.id)
  } else {
    console.log("Proyecto ya existe:", proyecto.id)
  }

  // Limpiar datos existentes
  await db.signalRecord.deleteMany({ where: { proyectoId: proyecto.id } })
  await db.protocoloPrueba.deleteMany({ where: { proyectoId: proyecto.id } })
  await db.manguera.deleteMany({ where: { proyectoId: proyecto.id } })

  // SAT Mangueras: 100 total, 0 OK → 0%
  await db.manguera.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      proyectoId:         proyecto!.id,
      fase:               "SAT" as const,
      imei:               `NA-SAT-M-${String(i + 1).padStart(3, "0")}`,
      tendidoEnOrigen:    false,
      tendidoEnDestino:   false,
      conectadoEnOrigen:  false,
      conectadoEnDestino: false,
      createdBy:          "seed",
      updatedBy:          "seed",
    })),
  })
  console.log("Mangueras SAT: 100 total, 0 OK → 0%")

  // SAT Señales: 250 total, 242 OK → 96.8%
  await db.signalRecord.createMany({
    data: Array.from({ length: 250 }, (_, i) => ({
      proyectoId:    proyecto!.id,
      fase:          "SAT" as const,
      signalName:    `SENAL_SAT_${String(i + 1).padStart(3, "0")}`,
      checkedStatus: i < 242 ? "OK" : "NO",
      createdBy:     "seed",
      updatedBy:     "seed",
    })),
  })
  console.log("Señales SAT: 242/250 → 96.8%")

  // SAT Pruebas: 250 total, 223 OK → 89.2%
  await db.protocoloPrueba.createMany({
    data: Array.from({ length: 250 }, (_, i) => ({
      proyectoId:   proyecto!.id,
      fase:         "SAT" as const,
      identificador: `PRUEBA_${String(i + 1).padStart(3, "0")}`,
      descripcion:  `Prueba SAT ${String(i + 1).padStart(3, "0")}`,
      comprobado:   i < 223,
      createdBy:    "seed",
      updatedBy:    "seed",
    })),
  })
  console.log("Pruebas SAT: 223/250 → 89.2%")

  console.log("NAMA datos insertados ✓")
  console.log("Avance SAT esperado: (0 + 96.8 + 89.2) / 3 = 62.0%")
}

main().catch(console.error).finally(() => db.$disconnect())
