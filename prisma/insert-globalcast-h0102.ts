import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

// GLOBALCAST 11559 — Aguascalientes, México
// H01;H02: FRB30 y KBV30 — Activo, FAT
// H03:     RMA-30         — Activo, SAT  (ya cargado por insert-globalcast-rma.ts)
//
// También corrige el error del seed: 11576-H01;H02;H03 estaba marcado como
// GLOBALCAST (incorrecto) → se hace soft-delete de ese registro.
// El 11576 real son los proyectos de Holmestrand (cargados por insert-holmestrand.ts).

async function main() {
  // ── Corregir error de orden: soft-delete el falso GLOBALCAST 11576 ────────
  const falso = await db.proyecto.findFirst({ where: { orden: 11576, idh: "H01;H02;H03" } })
  if (falso && !falso.deletedAt) {
    await db.proyecto.update({ where: { id: falso.id }, data: { deletedAt: new Date(), updatedBy: "seed" } })
    console.log("Soft-deleted 11576-H01;H02;H03 GLOBALCAST (incorrecto)")
  }

  // ── GLOBALCAST 11559-H01;H02 ──────────────────────────────────────────────
  const ex = await db.proyecto.findFirst({ where: { orden: 11559, idh: "H01;H02", deletedAt: null } })
  if (ex) {
    console.log("Ya existe 11559-H01;H02:", ex.id)
    return
  }
  const p = await db.proyecto.create({
    data: {
      orden:      11559,
      idh:        "H01;H02",
      nombre:     "Globalcast FRB30 y KBV30",
      cliente:    "Globalcast",
      ubicacion:  "Aguascalientes, México",
      tipoEquipo: "FRB-30",
      estado:     "activo",
      activo:     true,
      faseActual: "FAT",
      createdBy:  "seed",
      updatedBy:  "seed",
    },
  })
  console.log("Creado 11559-H01;H02:", p.id)
}

main().catch(console.error).finally(() => db.$disconnect())
