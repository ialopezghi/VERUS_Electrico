import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const BY = "ilopez@ghifurnaces.com"

// ── Helpers ───────────────────────────────────────────────────────────────────
type F = "FAT" | "SAT"

function mkMang(n: number, ok: number, prefix: string, fase: F) {
  return Array.from({ length: n }, (_, i) => {
    const isOk = i < ok
    return {
      fase, imei: `=${prefix}-W${String(i + 1).padStart(3, "0")}`,
      origen: `${prefix} Origen ${i + 1}`, destino: `${prefix} Destino ${i + 1}`,
      conectadoEnOrigen: isOk ? true : false,
      tendidoEnOrigen:   isOk ? true : false,
      tendidoEnDestino:  isOk ? true : false,
      conectadoEnDestino:isOk ? true : false,
      createdBy: BY, updatedBy: BY,
    }
  })
}

function mkSen(n: number, ok: number, prefix: string, fase: F) {
  return Array.from({ length: n }, (_, i) => ({
    fase, signalName: `${prefix}-S${String(i + 1).padStart(3, "0")}`,
    checkedStatus: i < ok ? "OK" : "",
    createdBy: BY, updatedBy: BY,
  }))
}

function mkPru(n: number, done: number, tipo: string, fase: F) {
  return Array.from({ length: n }, (_, i) => ({
    fase, identificador: tipo,
    descripcion: `Prueba ${String(i + 1).padStart(3, "0")}`,
    comprobado: i < done,
    createdBy: BY, updatedBy: BY,
  }))
}

async function insertData(
  proyectoId: string,
  fatMang: ReturnType<typeof mkMang>,
  fatSen:  ReturnType<typeof mkSen>,
  fatPru:  ReturnType<typeof mkPru>,
  satMang: ReturnType<typeof mkMang>,
  satSen:  ReturnType<typeof mkSen>,
  satPru:  ReturnType<typeof mkPru>,
) {
  await db.manguera.deleteMany({ where: { proyectoId } })
  await db.signalRecord.deleteMany({ where: { proyectoId } })
  await db.protocoloPrueba.deleteMany({ where: { proyectoId } })
  await db.historicoAvance.deleteMany({ where: { proyectoId } })

  for (const m of [...fatMang, ...satMang])
    await db.manguera.create({ data: { proyectoId, ...m } })
  for (const s of [...fatSen, ...satSen])
    await db.signalRecord.create({ data: { proyectoId, ...s } })
  for (const p of [...fatPru, ...satPru])
    await db.protocoloPrueba.create({ data: { proyectoId, ...p } })
}

// ── Histórico helper ──────────────────────────────────────────────────────────
async function insertHistorico(
  proyectoId: string,
  entries: Array<{
    fecha: string
    fat: number; tF: number; cF: number; sF: number; pF: number
    sat: number; mSp: number; mSpf: number; sS: number; pS: number
    total: number
  }>
) {
  for (const h of entries) {
    await db.historicoAvance.create({
      data: {
        proyectoId, fecha: new Date(h.fecha),
        porcentajeFat:            h.fat,
        porcentajeTendidoFat:     h.tF,
        porcentajeConectadoFat:   h.cF,
        porcentajeSenalesFat:     h.sF,
        porcentajePruebasFat:     h.pF,
        porcentajeSat:            h.sat,
        porcentajeManguerasSat:   h.mSp,
        porcentajeManguerasPfSat: h.mSpf,
        porcentajeSenalesSat:     h.sS,
        porcentajePruebasSat:     h.pS,
        porcentajeTotal:          h.total,
        createdBy: BY,
      },
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Insertando proyectos completados...")

  // ── 10517-H01  BAUX HHVF-G-TR-18 ─────────────────────────────────────────
  // FAT: mang=249/250(99.6%) sen=187/200(93.5%) pru=78/80(97.5%) → 96.9%
  // SAT: all 100%
  const p_baux_h01 = await db.proyecto.upsert({
    where: { orden_idh: { orden: 10517, idh: "H01" } },
    create: {
      idh: "H01", orden: 10517,
      nombre: "BAUX HHVF-G-TR-18",
      cliente: "BAUX", ubicacion: "Castellón, España",
      tipoEquipo: "HHVF", estado: "completado", activo: false,
      createdBy: BY, updatedBy: BY,
    },
    update: {
      nombre: "BAUX HHVF-G-TR-18", cliente: "BAUX",
      ubicacion: "Castellón, España", tipoEquipo: "HHVF",
      estado: "completado", activo: false, updatedBy: BY,
    },
  })
  await insertData(
    p_baux_h01.id,
    mkMang(250, 249, "BAUX-H01-F", "FAT"),
    mkSen (200, 187, "BAUX-H01-F", "FAT"),
    mkPru ( 80,  78, "ELÉCTRICO",  "FAT"),
    mkMang(200, 200, "BAUX-H01-S", "SAT"),
    mkSen (150, 150, "BAUX-H01-S", "SAT"),
    mkPru ( 60,  60, "ELÉCTRICO",  "SAT"),
  )
  await insertHistorico(p_baux_h01.id, [
    { fecha:"2024-08-01", fat:15.0, tF:22,  cF:12,  sF: 8,  pF: 0,  sat: 0, mSp: 0,  mSpf: 0,  sS: 0,  pS: 0,  total: 7.5  },
    { fecha:"2024-10-01", fat:32.0, tF:45,  cF:28,  sF:18,  pF: 0,  sat: 0, mSp: 0,  mSpf: 0,  sS: 0,  pS: 0,  total:16.0  },
    { fecha:"2025-01-01", fat:55.0, tF:70,  cF:50,  sF:38,  pF:15,  sat:20, mSp:22,  mSpf:18,  sS:14,  pS: 8,  total:37.5  },
    { fecha:"2025-04-01", fat:74.0, tF:88,  cF:72,  sF:60,  pF:52,  sat:55, mSp:60,  mSpf:55,  sS:44,  pS:38,  total:64.5  },
    { fecha:"2025-07-01", fat:88.0, tF:97,  cF:88,  sF:80,  pF:74,  sat:82, mSp:88,  mSpf:84,  sS:72,  pS:68,  total:85.0  },
    { fecha:"2025-10-01", fat:95.0, tF:100, cF:99,  sF:91,  pF:95,  sat:97, mSp:99,  mSpf:99,  sS:96,  pS:98,  total:96.0  },
    { fecha:"2025-12-01", fat:96.9, tF:100, cF:100, sF:93.5,pF:97.5,sat:100,mSp:100, mSpf:100, sS:100, pS:100, total:98.5  },
  ])
  console.log("✅ 10517-H01 BAUX HHVF-G-TR-18")

  // ── 10517-H02  BAUX MCB-D-25-D ────────────────────────────────────────────
  // FAT: mang=100/100(100%) sen=150/150(100%) pru=79/90(87.8%) → 95.9%
  // SAT: all 100%
  const p_baux_h02 = await db.proyecto.upsert({
    where: { orden_idh: { orden: 10517, idh: "H02" } },
    create: {
      idh: "H02", orden: 10517,
      nombre: "BAUX MCB-D-25-D",
      cliente: "BAUX", ubicacion: "Castellón, España",
      tipoEquipo: "MCB", estado: "completado", activo: false,
      createdBy: BY, updatedBy: BY,
    },
    update: {
      nombre: "BAUX MCB-D-25-D", cliente: "BAUX",
      ubicacion: "Castellón, España", tipoEquipo: "MCB",
      estado: "completado", activo: false, updatedBy: BY,
    },
  })
  await insertData(
    p_baux_h02.id,
    mkMang(100, 100, "BAUX-H02-F", "FAT"),
    mkSen (150, 150, "BAUX-H02-F", "FAT"),
    mkPru ( 90,  79, "ELÉCTRICO",  "FAT"),
    mkMang(100, 100, "BAUX-H02-S", "SAT"),
    mkSen (100, 100, "BAUX-H02-S", "SAT"),
    mkPru ( 60,  60, "ELÉCTRICO",  "SAT"),
  )
  await insertHistorico(p_baux_h02.id, [
    { fecha:"2024-09-01", fat:12.0, tF:18,  cF: 9,  sF: 6,  pF: 0,  sat: 0, mSp: 0,  mSpf: 0,  sS: 0,  pS: 0,  total: 6.0  },
    { fecha:"2024-11-01", fat:38.0, tF:52,  cF:33,  sF:22,  pF: 0,  sat: 5, mSp: 8,  mSpf: 5,  sS: 2,  pS: 0,  total:21.5  },
    { fecha:"2025-02-01", fat:60.0, tF:78,  cF:57,  sF:46,  pF:25,  sat:30, mSp:35,  mSpf:30,  sS:22,  pS:16,  total:45.0  },
    { fecha:"2025-05-01", fat:80.0, tF:94,  cF:78,  sF:72,  pF:60,  sat:68, mSp:75,  mSpf:72,  sS:58,  pS:50,  total:74.0  },
    { fecha:"2025-08-01", fat:92.0, tF:100, cF:97,  sF:95,  pF:85,  sat:92, mSp:96,  mSpf:95,  sS:90,  pS:88,  total:92.0  },
    { fecha:"2025-11-01", fat:95.9, tF:100, cF:100, sF:100, pF:87.8,sat:100,mSp:100, mSpf:100, sS:100, pS:100, total:98.0  },
  ])
  console.log("✅ 10517-H02 BAUX MCB-D-25-D")

  // ── 11866-H01  ArcelorMittal FNG-200 ──────────────────────────────────────
  // FAT: mang=140/150(93.3%) sen=140/200(70%) pru=87/100(87%) → 83.4%
  // SAT: mang=197/200(98.5%) sen=193/200(96.5%) pru=93/100(93%) → 96%
  const p_arcelor = await db.proyecto.upsert({
    where: { orden_idh: { orden: 11866, idh: "H01" } },
    create: {
      idh: "H01", orden: 11866,
      nombre: "ArcelorMittal FNG-200",
      cliente: "ArcelorMittal", ubicacion: "Cracovia, Polonia",
      tipoEquipo: "FNG", estado: "completado", activo: false,
      createdBy: BY, updatedBy: BY,
    },
    update: {
      nombre: "ArcelorMittal FNG-200", cliente: "ArcelorMittal",
      ubicacion: "Cracovia, Polonia", tipoEquipo: "FNG",
      estado: "completado", activo: false, updatedBy: BY,
    },
  })
  await insertData(
    p_arcelor.id,
    mkMang(150, 140, "ARC-H01-F",  "FAT"),
    mkSen (200, 140, "ARC-H01-F",  "FAT"),
    mkPru (100,  87, "ELÉCTRICO",  "FAT"),
    mkMang(200, 197, "ARC-H01-S",  "SAT"),
    mkSen (200, 193, "ARC-H01-S",  "SAT"),
    mkPru (100,  93, "ELÉCTRICO",  "SAT"),
  )
  await insertHistorico(p_arcelor.id, [
    { fecha:"2023-06-01", fat:10.0, tF:15,  cF: 8,  sF: 5,  pF: 0,  sat: 0, mSp: 0,  mSpf: 0,  sS: 0,  pS: 0,  total: 5.0  },
    { fecha:"2023-10-01", fat:28.0, tF:38,  cF:22,  sF:16,  pF: 0,  sat: 8, mSp:10,  mSpf: 9,  sS: 5,  pS: 0,  total:18.0  },
    { fecha:"2024-02-01", fat:50.0, tF:64,  cF:44,  sF:32,  pF:20,  sat:35, mSp:40,  mSpf:38,  sS:28,  pS:22,  total:42.5  },
    { fecha:"2024-06-01", fat:66.0, tF:80,  cF:60,  sF:52,  pF:44,  sat:62, mSp:70,  mSpf:68,  sS:55,  pS:48,  total:64.0  },
    { fecha:"2024-09-01", fat:76.0, tF:90,  cF:74,  sF:64,  pF:72,  sat:82, mSp:88,  mSpf:87,  sS:76,  pS:72,  total:79.0  },
    { fecha:"2024-12-01", fat:83.4, tF:99,  cF:93,  sF:70,  pF:87,  sat:96, mSp:98.5,mSpf:98.8,sS:96.5,pS:93, total:89.7  },
  ])
  console.log("✅ 11866-H01 ArcelorMittal FNG-200")

  // ── 13420-H01  FD2 CONSTELLIUM RAN-R-70 ───────────────────────────────────
  // FAT: mang=131/150(87.3%) sen=186/200(93%) pru=72/100(72%) → 84.1%
  // SAT: mang=174/200(87%) sen=0/200(0%) pru=0/100(0%) → 29% (divisor=3)
  const p_fd2 = await db.proyecto.upsert({
    where: { orden_idh: { orden: 13420, idh: "H01" } },
    create: {
      idh: "H01", orden: 13420,
      nombre: "FD2 CONSTELLIUM RAN-R-70",
      cliente: "CONSTELLIUM", ubicacion: "Breisach, Francia",
      tipoEquipo: "FD2", estado: "completado", activo: false,
      createdBy: BY, updatedBy: BY,
    },
    update: {
      nombre: "FD2 CONSTELLIUM RAN-R-70", cliente: "CONSTELLIUM",
      ubicacion: "Breisach, Francia", tipoEquipo: "FD2",
      estado: "completado", activo: false, updatedBy: BY,
    },
  })
  await insertData(
    p_fd2.id,
    mkMang(150, 131, "FD2-H01-F",  "FAT"),
    mkSen (200, 186, "FD2-H01-F",  "FAT"),
    mkPru (100,  72, "ELÉCTRICO",  "FAT"),
    mkMang(200, 174, "FD2-H01-S",  "SAT"),
    mkSen (200,   0, "FD2-H01-S",  "SAT"),  // SAT señales en curso → 0%
    mkPru (100,   0, "ELÉCTRICO",  "SAT"),  // SAT pruebas en curso → 0%
  )
  await insertHistorico(p_fd2.id, [
    { fecha:"2024-03-01", fat:12.0, tF:18,  cF: 9,  sF: 6,  pF: 0,  sat: 0, mSp: 0,  mSpf: 0,  sS: 0, pS: 0, total: 6.0  },
    { fecha:"2024-06-01", fat:36.0, tF:50,  cF:30,  sF:22,  pF: 0,  sat: 5, mSp: 8,  mSpf: 6,  sS: 0, pS: 0, total:20.5  },
    { fecha:"2024-09-01", fat:58.0, tF:72,  cF:52,  sF:46,  pF:30,  sat:18, mSp:25,  mSpf:22,  sS: 0, pS: 0, total:38.0  },
    { fecha:"2024-12-01", fat:74.0, tF:87,  cF:70,  sF:72,  pF:55,  sat:26, mSp:65,  mSpf:60,  sS: 0, pS: 0, total:50.0  },
    { fecha:"2025-03-01", fat:84.1, tF:96,  cF:87,  sF:93,  pF:72,  sat:29, mSp:85.2,mSpf:88.5,sS: 0, pS: 0, total:56.6  },
  ])
  console.log("✅ 13420-H01 FD2 CONSTELLIUM RAN-R-70")

  const totP = await db.proyecto.count()
  const totM = await db.manguera.count()
  const totS = await db.signalRecord.count()
  const totPr = await db.protocoloPrueba.count()
  console.log(`\nTotal BD: ${totP} proyectos | ${totM} mangueras | ${totS} señales | ${totPr} pruebas`)
}

main().catch(console.error).finally(() => db.$disconnect())
