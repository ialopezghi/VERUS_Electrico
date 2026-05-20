import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

// AMISSA - RMA-R-30-B — orden 14336-H01, TURQUISA
// (distinto proyecto al 11721 AMISSA Ramos Arizpe México)
//
// FAT: Mangueras 39% (39/100) + Señales 23.4% (117/500) + Pruebas 7.3% (3/41)
//      pctFase = (39 + 23.4 + 7.317) / 3 = 23.239% → "23.2" ✓
// SAT: sin datos iniciados
// VERUS Total = 23.239 / 2 = 11.619% → "11.6" (PowerApps: 11.62)

async function main() {
  console.log("Insertando AMISSA 14336-H01...")

  const ex = await db.proyecto.findFirst({ where: { orden: 14336, idh: "H01", deletedAt: null } })
  const proyecto = ex ?? await db.proyecto.create({
    data: {
      orden:      14336,
      idh:        "H01",
      nombre:     "AMISSA - RMA-R-30-B",
      cliente:    "AMISSA",
      ubicacion:  "TURQUISA",
      tipoEquipo: "RMA-R-30-B",
      estado:     "en_proceso",
      activo:     true,
      createdBy:  "seed",
      updatedBy:  "seed",
    },
  })
  if (ex) console.log("Ya existe:", proyecto.id)
  else    console.log("Creado:", proyecto.id)

  // Limpiar datos existentes
  await db.signalRecord.deleteMany({ where: { proyectoId: proyecto.id } })
  await db.protocoloPrueba.deleteMany({ where: { proyectoId: proyecto.id } })
  await db.manguera.deleteMany({ where: { proyectoId: proyecto.id } })

  // Mangueras FAT: 100 total, 39 OK → 39.0%
  await db.manguera.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      proyectoId: proyecto.id, fase: "FAT" as const,
      imei: `AM2-FAT-M-${String(i + 1).padStart(3, "0")}`,
      tendidoEnOrigen:    i < 39 ? true : false,
      tendidoEnDestino:   i < 39 ? true : false,
      conectadoEnOrigen:  i < 39 ? true : false,
      conectadoEnDestino: i < 39 ? true : false,
      createdBy: "seed", updatedBy: "seed",
    })),
  })

  // Señales FAT: 500 total, 117 OK → 117/500 = 23.4% exacto
  await db.signalRecord.createMany({
    data: Array.from({ length: 500 }, (_, i) => ({
      proyectoId: proyecto.id, fase: "FAT" as const,
      signalName: `SENAL_FAT_${String(i + 1).padStart(3, "0")}`,
      checkedStatus: i < 117 ? "OK" : "NO",
      createdBy: "seed", updatedBy: "seed",
    })),
  })

  // Pruebas FAT: 41 total, 3 OK → 3/41 = 7.317% → "7.3"
  await db.protocoloPrueba.createMany({
    data: Array.from({ length: 41 }, (_, i) => ({
      proyectoId: proyecto.id, fase: "FAT" as const,
      identificador: `PRUEBA_FAT_${String(i + 1).padStart(3, "0")}`,
      descripcion:   `Prueba FAT ${String(i + 1).padStart(3, "0")}`,
      comprobado:    i < 3,
      createdBy: "seed", updatedBy: "seed",
    })),
  })

  console.log("FAT: Mang 39.0% + Señales 23.4% + Pruebas 7.3% → 23.2%")
  console.log("AMISSA 14336-H01 insertado ✓")
  console.log("VERUS Total esperado: 23.239 / 2 = 11.6%  (PowerApps: 11.62)")
}

main().catch(console.error).finally(() => db.$disconnect())
