import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

// H01 SAT: mang=0% (50 rec), señales=96.9% (155/160), pruebas=100% (50/50)
// pctFase = (0 + 96.875 + 100) / 3 = 65.625% ≈ 65.6%

async function insertProyecto(orden: number, idh: string, nombre: string, tipoEquipo: string, estado: string) {
  const ex = await db.proyecto.findFirst({ where: { orden, idh, deletedAt: null } })
  if (ex) { console.log(`Ya existe ${orden}-${idh}:`, ex.id); return ex }
  const p = await db.proyecto.create({
    data: {
      orden, idh, nombre,
      cliente:    "Jupiter",
      ubicacion:  "Hammond, USA",
      tipoEquipo,
      estado,
      activo:     true,
      createdBy:  "seed",
      updatedBy:  "seed",
    },
  })
  console.log(`Creado ${orden}-${idh}:`, p.id)
  return p
}

async function main() {
  const h01 = await insertProyecto(11202, "H01", "JUPITER RAN-60",     "RAN-60",     "en_proceso")
  const h02 = await insertProyecto(11202, "H02", "JUPITER RMA-R-30-B", "RMA-R-30-B", "en_proceso")

  // Limpiar datos existentes H01
  await db.manguera.deleteMany({ where: { proyectoId: h01.id } })
  await db.signalRecord.deleteMany({ where: { proyectoId: h01.id } })
  await db.protocoloPrueba.deleteMany({ where: { proyectoId: h01.id } })

  // H01 SAT — mangueras (50, todas sin completar → 0%)
  const satMangs = Array.from({ length: 50 }, (_, i) => ({
    proyectoId:        h01.id,
    imei:              `J-SAT-M-${String(i + 1).padStart(3, "0")}`,
    fase:              "SAT" as const,
    tendidoEnOrigen:   false,
    tendidoEnDestino:  false,
    conectadoEnOrigen: false,
    conectadoEnDestino:false,
    createdBy:         "seed",
    updatedBy:         "seed",
  }))
  await db.manguera.createMany({ data: satMangs })

  // H01 SAT — señales (160 total, 155 OK → 96.875%)
  const satSen = Array.from({ length: 160 }, (_, i) => ({
    proyectoId:    h01.id,
    simbolico:     `SEN-SAT-${String(i + 1).padStart(3, "0")}`,
    signalName:    `Señal SAT ${i + 1}`,
    fase:          "SAT" as const,
    checkedStatus: i < 155 ? "OK" : "",
    createdBy:     "seed",
    updatedBy:     "seed",
  }))
  await db.signalRecord.createMany({ data: satSen })

  // H01 SAT — pruebas (50 total, 50 OK → 100%)
  const satPru = Array.from({ length: 50 }, (_, i) => ({
    proyectoId:   h01.id,
    identificador:`PRU-SAT-${String(i + 1).padStart(3, "0")}`,
    tipo:         "Funcional",
    fase:         "SAT" as const,
    comprobado:   true,
    createdBy:    "seed",
    updatedBy:    "seed",
  }))
  await db.protocoloPrueba.createMany({ data: satPru })

  console.log("H01 datos SAT insertados")
  console.log("H02 sin datos (0%)")
}

main().catch(console.error).finally(() => db.$disconnect())
