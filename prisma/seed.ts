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

  const visor = await db.user.upsert({
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

  // Proyectos — orden 12737 BEFESA ALEMANIA
  const p1 = await db.proyecto.upsert({
    where: { idh: "H01;H02" },
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

  const p2 = await db.proyecto.upsert({
    where: { idh: "H03;H04" },
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

  // Proyecto finalizado
  const p3 = await db.proyecto.upsert({
    where: { idh: "H01" },
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

  // Proyecto activo
  const p4 = await db.proyecto.upsert({
    where: { idh: "H01;H02;H03" },
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

  // Mangueras FAT — proyecto p1 (12737 H01;H02) — mezcla de SI/NO/NA
  const manguerasFAT = [
    { imei: "=B01-3W1",  origen: "=B01+UC02-3X1",      destino: "=B01+UC11-3X1",      desc: "Manguera interconexión",          cO: true,  tO: true,  tD: true,  cD: true  },
    { imei: "=B01-3W1.1",origen: "=B01+UC11-3X1",      destino: "=B01+UC63-3X1",       desc: "Manguera interconexión",          cO: true,  tO: true,  tD: true,  cD: true  },
    { imei: "=B01-4W2",  origen: "=B01+UC63-TF325.4",  destino: "=B01+-2100_RF01_BT01-X1", desc: "Maestro IO-Link",             cO: true,  tO: true,  tD: true,  cD: true  },
    { imei: "=B01-4W3",  origen: "=B01+UC63-TF325.8",  destino: "=B01+-2100_RF01_BT02-X1", desc: "Temperatura rodamiento del.", cO: true,  tO: true,  tD: true,  cD: true  },
    { imei: "=B01-4W5",  origen: "=B01+UC63-TF325.17", destino: "=B01+-2100_RF01_BT04-X1", desc: "Temperatura rodamiento tra.", cO: true,  tO: true,  tD: true,  cD: true  },
    { imei: "=B01-4W4",  origen: "=B01+UC63-TF325.13", destino: "=B01+-2100_RF01_BT03-X1", desc: "Temperatura rodamiento del.", cO: true,  tO: true,  tD: true,  cD: true  },
    { imei: "=B01-4W7",  origen: "=B01+-2100_RF01_BT06",destino: "=B01+UC63-KEC326.2", desc: "Sensor infrarrojos tambor int.", cO: true,  tO: true,  tD: true,  cD: true  },
    { imei: "=B01-4W6",  origen: "=B01+-2100_RF01_BT05",destino: "=B01+UC63-KEC326.2", desc: "",                               cO: true,  tO: true,  tD: true,  cD: true  },
    { imei: "=B01-4W8",  origen: "=B01+-2100_RF01_BT07",destino: "=B01+UC63-KEC326.2", desc: "Sensor infrarrojos tambor fond.",cO: true,  tO: true,  tD: true,  cD: true  },
    { imei: "=B01-4W9",  origen: "=B01+UC02-4X9",      destino: "=B01+-2100_RF01_BT10", desc: "Termopar humos",                cO: null,  tO: false, tD: true,  cD: null  },
    { imei: "=B01-4W10", origen: "=B01+UC02-4X10",     destino: "=B01+UC11-4X10",      desc: "Manguera interconexión",         cO: true,  tO: true,  tD: true,  cD: true  },
    { imei: "=B01-4W11", origen: "=B01+UC02-4X11",     destino: "=B01+UC11-4X11",      desc: "Manguera potencia",              cO: true,  tO: false, tD: false, cD: false },
  ]

  for (const m of manguerasFAT) {
    await db.manguera.create({
      data: {
        proyectoId: p1.id,
        fase: "FAT",
        imei: m.imei,
        origen: m.origen,
        destino: m.destino,
        descripcion: m.desc,
        conectadoEnOrigen: m.cO,
        tendidoEnOrigen: m.tO,
        tendidoEnDestino: m.tD,
        conectadoEnDestino: m.cD,
        createdBy: admin.email,
        updatedBy: admin.email,
      },
    })
  }

  // Pruebas FAT — proyecto p1
  const pruebasFAT = [
    { id: "BASCULACIÓN", tipo: "FRB", desc: "Comprobar la válvula anti-retorno",                      vTeo: "NA", comprobado: true  },
    { id: "BASCULACIÓN", tipo: "FRB", desc: "Probar el retorno de seguridad del horno",                vTeo: "Se consigue retornar completamente mediante maniobra de seguridad", comprobado: true  },
    { id: "BASCULACIÓN", tipo: "FRB", desc: "Ajustar final de carrera horno retornado",                vTeo: "NA", comprobado: true  },
    { id: "BASCULACIÓN", tipo: "FRB", desc: "Probar movimiento basculación",                           vTeo: "Se consigue ligero movimiento", comprobado: true  },
    { id: "BASCULACIÓN", tipo: "FRB", desc: "Probar movimiento retorno",                               vTeo: "Se consigue retornar completamente", comprobado: true  },
    { id: "BASCULACIÓN", tipo: "FRB", desc: "Comprobar correcta posición del inclinómetro en X e Y",  vTeo: "NA", comprobado: true  },
    { id: "ELÉCTRICO",   tipo: "FRB", desc: "Prepare loops and connections for flushing",              vTeo: "NA", comprobado: true  },
    { id: "ELÉCTRICO",   tipo: "FRB", desc: "Ajustar aparamenta según documento facilitado por Ingeniería.", vTeo: "NA", comprobado: false },
    { id: "ELÉCTRICO",   tipo: "FRB", desc: "Verificar que Célula Eléctrica ha superado la Prueba de Armarios", vTeo: "NA", comprobado: true },
    { id: "ELÉCTRICO",   tipo: "FRB", desc: "Completar el Check List del Listado de Señales",         vTeo: "NA", comprobado: false },
  ]

  for (const p of pruebasFAT) {
    await db.protocoloPrueba.create({
      data: {
        proyectoId: p1.id,
        fase: "FAT",
        identificador: p.id,
        tipo: p.tipo,
        descripcion: p.desc,
        valorTeorico: p.vTeo,
        comprobado: p.comprobado,
        createdBy: admin.email,
        updatedBy: admin.email,
      },
    })
  }

  // Señales FAT — proyecto p1
  const senalesFAT = [
    { simb: "=EM01+UC20-TF256.2:12+", ime: "=KE01+UC02-KE174.2", tipo: "", nombre: "Presión oxígeno (1)",  status: "OK" },
    { simb: "=EM01+UC20-TF256.2:14+", ime: "=KE01+UC02-KE174.2", tipo: "", nombre: "Presión oxígeno (2)",  status: "OK" },
    { simb: "=EM01+UC20-TF256.10:12+",ime: "=KE01+UC02-KE174.2", tipo: "", nombre: "Caudal oxígeno (1)",   status: ""   },
    { simb: "=EM01+UC20-TF256.10:14+",ime: "=KE01+UC02-KE174.2", tipo: "", nombre: "Caudal oxígeno (2)",   status: ""   },
    { simb: "=EM01+UC20-TF257.2:14+", ime: "=KE01+UC02-KE175.2", tipo: "", nombre: "Temperatura oxígeno (2)", status: "OK" },
    { simb: "=EM01+UC20-TF257.10:14+",ime: "=KE01+UC02-KE175.2", tipo: "", nombre: "Presión gas (2)",      status: ""   },
    { simb: "=EM01+UC20-TF257.10:12+",ime: "=KE01+UC02-KE175.2", tipo: "", nombre: "Presión gas (1)",      status: ""   },
    { simb: "=EM01+UC20-TF257.2:12+", ime: "=KE01+UC02-KE175.2", tipo: "", nombre: "Temperatura oxígeno (1)", status: "OK" },
  ]

  for (const s of senalesFAT) {
    await db.signalRecord.create({
      data: {
        proyectoId: p1.id,
        fase: "FAT",
        simbolico: s.simb,
        ime: s.ime,
        tipoSenhal: s.tipo,
        signalName: s.nombre,
        checkedStatus: s.status,
        createdBy: admin.email,
        updatedBy: admin.email,
      },
    })
  }

  // Histórico de avance — proyecto p1
  const baseDate = new Date("2026-04-07")
  const histData = [
    { d: 0,  fat: 5.2,  sat: 0,    total: 2.6 },
    { d: 4,  fat: 5.2,  sat: 0,    total: 2.6 },
    { d: 7,  fat: 8.1,  sat: 0,    total: 4.1 },
    { d: 10, fat: 14.3, sat: 5.2,  total: 9.8 },
    { d: 14, fat: 20.5, sat: 10.1, total: 15.3 },
    { d: 17, fat: 22.0, sat: 13.5, total: 17.8 },
    { d: 21, fat: 22.0, sat: 14.2, total: 18.1 },
    { d: 24, fat: 27.5, sat: 14.8, total: 21.2 },
    { d: 28, fat: 27.5, sat: 15.5, total: 21.5 },
    { d: 31, fat: 27.5, sat: 16.2, total: 21.9 },
    { d: 35, fat: 27.5, sat: 16.8, total: 22.2 },
  ]

  for (const h of histData) {
    const fecha = new Date(baseDate)
    fecha.setDate(fecha.getDate() + h.d)
    await db.historicoAvance.create({
      data: {
        proyectoId: p1.id,
        fecha,
        porcentajeFat: h.fat,
        porcentajeManguerasFat: h.fat * 0.82,
        porcentajeSenalesFat: h.fat * 0.88,
        porcentajePruebasFat: h.fat * 0.95,
        porcentajeSat: h.sat,
        porcentajeManguerasSat: h.sat * 0.5,
        porcentajeSenalesSat: 0,
        porcentajePruebasSat: 0,
        porcentajeTotal: h.total,
        createdBy: "system",
      },
    })
  }

  // Asignaciones
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

  console.log("✅ Seed completado:")
  console.log(`   - ${await db.user.count()} usuarios`)
  console.log(`   - ${await db.proyecto.count()} proyectos`)
  console.log(`   - ${await db.manguera.count()} mangueras`)
  console.log(`   - ${await db.protocoloPrueba.count()} pruebas`)
  console.log(`   - ${await db.signalRecord.count()} señales`)
  console.log(`   - ${await db.historicoAvance.count()} registros histórico`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
