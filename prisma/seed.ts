import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  console.log("🌱 Sembrando datos de prueba VERUS Eléctrico...")

  // Usuarios
  const admin = await db.user.upsert({
    where: { email: "ilopez@ghifurnaces.com" },
    create: {
      email: "ilopez@ghifurnaces.com",
      nombre: "Iker Lasso",
      numeroEmpleado: 861,
      puesto: "Supervisor de Montaje y PEM",
      rol: "ADMIN",
      activo: true,
    },
    update: {},
  })

  const operario1 = await db.user.upsert({
    where: { email: "apalacios@ghifurnaces.com" },
    create: {
      email: "apalacios@ghifurnaces.com",
      nombre: "Andrés Palacios",
      numeroEmpleado: 977,
      puesto: "Técnico de automatización",
      rol: "OPERARIO",
      activo: true,
    },
    update: {},
  })

  const operario2 = await db.user.upsert({
    where: { email: "afernandez@ghifurnaces.com" },
    create: {
      email: "afernandez@ghifurnaces.com",
      nombre: "Ángel Fernández",
      numeroEmpleado: 977,
      puesto: "Técnico de Montaje",
      rol: "OPERARIO",
      activo: true,
    },
    update: {},
  })

  await db.user.upsert({
    where: { email: "aarana@ghifurnaces.com" },
    create: {
      email: "aarana@ghifurnaces.com",
      nombre: "Alberto Arana Uriarte",
      numeroEmpleado: 1552,
      puesto: "Técnico de Calidad",
      rol: "VISOR",
      activo: true,
    },
    update: {},
  })

  // ── PROYECTOS ────────────────────────────────────────────────────────────────

  // 12737 BEFESA H01;H02
  const p1 = await db.proyecto.upsert({
    where: { orden_idh: { orden: 12737, idh: "H01;H02" } },
    create: {
      idh: "H01;H02",
      orden: 12737,
      nombre: "BEFESA ALEMANIA — FRB-40 y KBV-40",
      cliente: "BEFESA",
      ubicacion: "Bernburg, Alemania",
      tipoEquipo: "FRB",
      estado: "en_proceso",
      activo: true,
      pausado: false,
      fatMangIni: new Date("2026-04-07"),
      fatMangFin: new Date("2026-05-30"),
      createdBy: admin.email,
      updatedBy: admin.email,
    },
    update: {},
  })

  // 12737 BEFESA H03;H04
  await db.proyecto.upsert({
    where: { orden_idh: { orden: 12737, idh: "H03;H04" } },
    create: {
      idh: "H03;H04",
      orden: 12737,
      nombre: "BEFESA ALEMANIA — FRB-40 y KBV-40",
      cliente: "BEFESA",
      ubicacion: "Bernburg, Alemania",
      tipoEquipo: "FRB",
      estado: "en_proceso",
      activo: true,
      pausado: false,
      fatMangIni: new Date("2026-04-07"),
      fatMangFin: new Date("2026-05-30"),
      createdBy: admin.email,
      updatedBy: admin.email,
    },
    update: {},
  })

  // 10517 BAUX
  await db.proyecto.upsert({
    where: { orden_idh: { orden: 10517, idh: "H01" } },
    create: {
      idh: "H01",
      orden: 10517,
      nombre: "BAUX HHVF-G-TR-18",
      cliente: "BAUX",
      ubicacion: "Castellón, España",
      tipoEquipo: "HHVF",
      estado: "completado",
      activo: false,
      pausado: false,
      createdBy: admin.email,
      updatedBy: admin.email,
    },
    update: {},
  })

  // 11576 GLOBALCAST
  await db.proyecto.upsert({
    where: { orden_idh: { orden: 11576, idh: "H01;H02;H03" } },
    create: {
      idh: "H01;H02;H03",
      orden: 11576,
      nombre: "GLOBALCAST FRB30",
      cliente: "GLOBALCAST",
      ubicacion: "Aguascalientes, México",
      tipoEquipo: "FRB",
      estado: "activo",
      activo: true,
      pausado: false,
      createdBy: admin.email,
      updatedBy: admin.email,
    },
    update: {},
  })

  // 12720 ARZYZ RMA-R-30-B
  const arzyz = await db.proyecto.upsert({
    where: { orden_idh: { orden: 12720, idh: "H01" } },
    create: {
      idh: "H01",
      orden: 12720,
      nombre: "ARZYZ RMA-R-30-B",
      cliente: "ARZYZ",
      ubicacion: "Monterrey, México",
      tipoEquipo: "RMA-R-30-B",
      estado: "en_proceso",
      activo: true,
      pausado: false,
      createdBy: admin.email,
      updatedBy: admin.email,
    },
    update: {},
  })

  // ── DATOS PROYECTO p1 (12737 H01;H02) ────────────────────────────────────────

  // Solo insertamos si no hay mangueras ya (evita duplicados al re-ejecutar seed)
  const yaMangueras = await db.manguera.count({ where: { proyectoId: p1.id } })
  if (yaMangueras === 0) {
    const manguerasFAT = [
      { imei: "=B01-3W1",   cO: true,  tO: true,  tD: true,  cD: true  },
      { imei: "=B01-3W1.1", cO: true,  tO: true,  tD: true,  cD: true  },
      { imei: "=B01-4W2",   cO: true,  tO: true,  tD: true,  cD: true  },
      { imei: "=B01-4W3",   cO: true,  tO: true,  tD: true,  cD: true  },
      { imei: "=B01-4W5",   cO: true,  tO: true,  tD: true,  cD: true  },
      { imei: "=B01-4W4",   cO: true,  tO: true,  tD: true,  cD: true  },
      { imei: "=B01-4W7",   cO: true,  tO: true,  tD: true,  cD: true  },
      { imei: "=B01-4W6",   cO: true,  tO: true,  tD: true,  cD: true  },
      { imei: "=B01-4W8",   cO: true,  tO: true,  tD: true,  cD: true  },
      { imei: "=B01-4W9",   cO: null,  tO: false, tD: true,  cD: null  },
      { imei: "=B01-4W10",  cO: true,  tO: true,  tD: true,  cD: true  },
      { imei: "=B01-4W11",  cO: true,  tO: false, tD: false, cD: false },
    ]
    for (const m of manguerasFAT) {
      await db.manguera.create({
        data: {
          proyectoId: p1.id, fase: "FAT", imei: m.imei,
          conectadoEnOrigen: m.cO, tendidoEnOrigen: m.tO,
          tendidoEnDestino: m.tD, conectadoEnDestino: m.cD,
          createdBy: admin.email, updatedBy: admin.email,
        },
      })
    }

    const pruebasFAT = [
      { id: "BASCULACIÓN", desc: "Comprobar la válvula anti-retorno",                     comprobado: true  },
      { id: "BASCULACIÓN", desc: "Probar el retorno de seguridad del horno",               comprobado: true  },
      { id: "BASCULACIÓN", desc: "Ajustar final de carrera horno retornado",               comprobado: true  },
      { id: "BASCULACIÓN", desc: "Probar movimiento basculación",                          comprobado: true  },
      { id: "BASCULACIÓN", desc: "Probar movimiento retorno",                              comprobado: true  },
      { id: "BASCULACIÓN", desc: "Comprobar correcta posición del inclinómetro en X e Y", comprobado: true  },
      { id: "ELÉCTRICO",   desc: "Prepare loops and connections for flushing",             comprobado: true  },
      { id: "ELÉCTRICO",   desc: "Ajustar aparamenta según documento de Ingeniería.",      comprobado: false },
      { id: "ELÉCTRICO",   desc: "Verificar que Célula Eléctrica ha superado Prueba",     comprobado: true  },
      { id: "ELÉCTRICO",   desc: "Completar el Check List del Listado de Señales",        comprobado: false },
    ]
    for (const p of pruebasFAT) {
      await db.protocoloPrueba.create({
        data: {
          proyectoId: p1.id, fase: "FAT",
          identificador: p.id, descripcion: p.desc,
          comprobado: p.comprobado,
          createdBy: admin.email, updatedBy: admin.email,
        },
      })
    }

    const senalesFAT = [
      { nombre: "Presión oxígeno (1)",    status: "OK" },
      { nombre: "Presión oxígeno (2)",    status: "OK" },
      { nombre: "Caudal oxígeno (1)",     status: ""   },
      { nombre: "Caudal oxígeno (2)",     status: ""   },
      { nombre: "Temperatura oxígeno (2)",status: "OK" },
      { nombre: "Presión gas (2)",        status: ""   },
      { nombre: "Presión gas (1)",        status: ""   },
      { nombre: "Temperatura oxígeno (1)",status: "OK" },
    ]
    for (const s of senalesFAT) {
      await db.signalRecord.create({
        data: {
          proyectoId: p1.id, fase: "FAT",
          signalName: s.nombre, checkedStatus: s.status,
          createdBy: admin.email, updatedBy: admin.email,
        },
      })
    }

    const baseDate = new Date("2026-04-07")
    for (const h of [
      { d: 0,  fat: 5.2,  sat: 0,    total: 2.6 },
      { d: 7,  fat: 8.1,  sat: 0,    total: 4.1 },
      { d: 14, fat: 20.5, sat: 10.1, total: 15.3 },
      { d: 21, fat: 22.0, sat: 14.2, total: 18.1 },
      { d: 28, fat: 27.5, sat: 15.5, total: 21.5 },
      { d: 35, fat: 27.5, sat: 16.8, total: 22.2 },
    ]) {
      const fecha = new Date(baseDate)
      fecha.setDate(fecha.getDate() + h.d)
      await db.historicoAvance.create({
        data: {
          proyectoId: p1.id, fecha,
          porcentajeFat: h.fat, porcentajeSat: h.sat, porcentajeTotal: h.total,
          porcentajeManguerasFat: h.fat * 0.82, porcentajeSenalesFat: h.fat * 0.88, porcentajePruebasFat: h.fat * 0.95,
          porcentajeManguerasSat: h.sat * 0.5,  porcentajeSenalesSat: 0,            porcentajePruebasSat: 0,
          createdBy: "system",
        },
      })
    }

    await db.asignacion.upsert({
      where: { userId_proyectoId: { userId: operario1.id, proyectoId: p1.id } },
      create: { userId: operario1.id, proyectoId: p1.id, createdBy: admin.email },
      update: {},
    })
    await db.asignacion.upsert({
      where: { userId_proyectoId: { userId: operario2.id, proyectoId: p1.id } },
      create: { userId: operario2.id, proyectoId: p1.id, createdBy: admin.email },
      update: {},
    })
  }

  console.log("✅ Seed completado:")
  console.log(`   - ${await db.user.count()} usuarios`)
  console.log(`   - ${await db.proyecto.count()} proyectos`)
  console.log(`   - ${await db.manguera.count()} mangueras`)
  console.log(`   - ${await db.protocoloPrueba.count()} pruebas`)
  console.log(`   - ${await db.signalRecord.count()} señales`)
  console.log(`   - ${await db.historicoAvance.count()} registros histórico`)
  console.log(`   Proyectos: BEFESA H01;H02, BEFESA H03;H04, BAUX H01, GLOBALCAST H01-H03, ARZYZ H01`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
