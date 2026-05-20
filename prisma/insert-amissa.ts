import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

// H01;H02 SAT mang: 93%  → 186/200 → SAT=(93+0+0)/3=31%
// H03;H04 SAT mang: 84.2% → 421/500 → SAT=(84.2+0+0)/3=28.07%≈28.1%
// H05     SAT mang: 82.6% → 413/500 → SAT=(82.6+0+0)/3=27.53%≈27.5%

async function mk(orden: number, idh: string, nombre: string, tipoEquipo: string) {
  const ex = await db.proyecto.findFirst({ where: { orden, idh, deletedAt: null } })
  if (ex) { console.log(`Ya existe ${orden}-${idh}`); return ex }
  const p = await db.proyecto.create({
    data: {
      orden, idh, nombre,
      cliente:   "AMISSA",
      ubicacion: "Ramos Arizpe, México",
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

async function satMangs(proyectoId: string, prefix: string, total: number, ok: number) {
  await db.manguera.deleteMany({ where: { proyectoId, fase: "SAT" } })
  await db.manguera.createMany({
    data: Array.from({ length: total }, (_, i) => ({
      proyectoId, fase: "SAT" as const,
      imei: `${prefix}-M-${String(i+1).padStart(3,"0")}`,
      tendidoEnOrigen:    i < ok ? true : false,
      tendidoEnDestino:   i < ok ? true : false,
      conectadoEnOrigen:  i < ok ? true : false,
      conectadoEnDestino: i < ok ? true : false,
      createdBy: "seed", updatedBy: "seed",
    })),
  })
}

async function main() {
  const h0102 = await mk(11721, "H01;H02", "AMISSA FRB30 y KBV30", "FRB30 y KBV30")
  const h0304 = await mk(11721, "H03;H04", "AMISSA RMA30 y EMS",   "RMA30")
  const h05   = await mk(11721, "H05",     "AMISSA SOWERA",         "SOWERA")

  await satMangs(h0102.id, "AM12-SAT", 200, 186) // 93%
  await satMangs(h0304.id, "AM34-SAT", 500, 421) // 84.2%
  await satMangs(h05.id,   "AM5-SAT",  500, 413) // 82.6%

  console.log("AMISSA datos insertados")
}

main().catch(console.error).finally(() => db.$disconnect())
