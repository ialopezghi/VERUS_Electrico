import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

async function main() {
  const existing = await db.proyecto.findFirst({ where: { orden: 11559, idh: "H03", deletedAt: null } })
  if (existing) {
    console.log("Ya existe:", existing.id)
    return
  }

  const p = await db.proyecto.create({
    data: {
      orden:      11559,
      idh:        "H03",
      nombre:     "Globalcast RMA-30",
      cliente:    "Globalcast",
      ubicacion:  "Aguascalientes, México",
      tipoEquipo: "RMA-30",
      estado:     "activo",
      activo:     true,
      createdBy:  "seed",
      updatedBy:  "seed",
    },
  })
  console.log("Creado:", p.id, p.orden, p.idh)
}

main().catch(console.error).finally(() => db.$disconnect())
