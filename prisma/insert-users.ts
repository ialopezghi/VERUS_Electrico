import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

// Helper: lookup proyecto ID by (orden, idh)
async function pid(orden: number, idh: string): Promise<string | null> {
  const p = await db.proyecto.findFirst({ where: { orden, idh, deletedAt: null } })
  if (!p) { console.warn(`  ⚠ No encontrado: ${orden}-${idh}`); return null }
  return p.id
}

async function asignar(userId: string, proyectoIds: (string | null)[]) {
  for (const proyectoId of proyectoIds) {
    if (!proyectoId) continue
    await db.asignacion.upsert({
      where: { userId_proyectoId: { userId, proyectoId } },
      create: { userId, proyectoId, createdBy: "seed" },
      update: {},
    })
  }
}

type Rol = "ADMIN" | "OPERARIO" | "VISOR" | "SUPERVISOR" | "JEFE_OBRA"

async function upsertUser(data: {
  email: string; nombre: string; emp: number; puesto: string; rol: Rol; activo: boolean
}) {
  // Use raw SQL to bypass Prisma client enum validation (SUPERVISOR not in compiled client)
  await db.$executeRaw`
    INSERT INTO "user" (id, email, nombre, numero_empleado, puesto, rol, activo, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      ${data.email},
      ${data.nombre},
      ${data.emp},
      ${data.puesto},
      ${data.rol}::"RolUsuario",
      ${data.activo},
      now(), now()
    )
    ON CONFLICT (email) DO UPDATE SET
      nombre          = EXCLUDED.nombre,
      numero_empleado = EXCLUDED.numero_empleado,
      puesto          = EXCLUDED.puesto,
      rol             = EXCLUDED.rol,
      activo          = EXCLUDED.activo,
      updated_at      = now()
  `
  const u = await db.user.findUniqueOrThrow({ where: { email: data.email } })
  return u
}

async function main() {
  console.log("Insertando usuarios...")

  // ── Usuarios ──────────────────────────────────────────────────────────────

  const ahmed = await upsertUser({ email:"aelidrissi@ghifurnaces.com",  nombre:"Ahmed El Idrissi",           emp:982,  puesto:"Montador Eléctrico",                          rol:"OPERARIO",   activo:false })
  const aimar = await upsertUser({ email:"aqonzalez@ghifurnaces.com",   nombre:"Aimar Gonzalez",              emp:972,  puesto:"Montador Eléctrico",                          rol:"OPERARIO",   activo:true  })
  const aitor = await upsertUser({ email:"aortiz@ghifurnaces.com",      nombre:"Aitor Ortiz",                 emp:956,  puesto:"Técnico de Montaje",                          rol:"OPERARIO",   activo:true  })
  const arana = await upsertUser({ email:"aarana@ghifurnaces.com",      nombre:"Alberto Arana Uriarte",       emp:1552, puesto:"Técnico de Calidad",                          rol:"VISOR",      activo:true  })
  const berru = await upsertUser({ email:"aberrueta@ghifurnaces.com",   nombre:"Alejandro Berrueta",          emp:985,  puesto:"Montador electromecánico",                    rol:"OPERARIO",   activo:false })
  const varel = await upsertUser({ email:"avarela@ghifurnaces.com",     nombre:"Alejandro Varela",            emp:1559, puesto:"Técnico IT",                                  rol:"ADMIN",      activo:true  })
  const andre = await upsertUser({ email:"amartinez@ghifurnaces.com",   nombre:"Andeka Rodríguez",            emp:885,  puesto:"Coordinador de Montaje",                      rol:"OPERARIO",   activo:false })
  const ander = await upsertUser({ email:"agalindez@ghifurnaces.com",   nombre:"Ander Galidez",               emp:1385, puesto:"Director de Producción",                      rol:"ADMIN",      activo:true  })
  const apala = await upsertUser({ email:"apalacios@ghifurnaces.com",   nombre:"Andrés Palacios",             emp:977,  puesto:"Tecnico de automatizacion",                   rol:"OPERARIO",   activo:true  })
  const afern = await upsertUser({ email:"afernandez@ghifurnaces.com",  nombre:"Ángel Fernández",             emp:977,  puesto:"Técnico de Montaje",                          rol:"OPERARIO",   activo:true  })
  const arkai = await upsertUser({ email:"aastoreka@ghifurnaces.com",   nombre:"Arkaitz Astoreca Ormaza",     emp:864,  puesto:"Técnico de Calidad",                          rol:"VISOR",      activo:true  })
  const asier = await upsertUser({ email:"aqarcia@ghifurnces.com",      nombre:"Asier Garcia",                emp:1513, puesto:"Tecnico de automatizacion",                   rol:"OPERARIO",   activo:false })
  const arian = await upsertUser({ email:"ariano@ghifurnaces.com",      nombre:"Asier Riaño Sainz",           emp:732,  puesto:"Inspector de Puesta en Marcha",               rol:"OPERARIO",   activo:true  })
  const creme = await upsertUser({ email:"crementeria@ghifurnaces.com", nombre:"Cristina Rementeria Ardanaz", emp:1539, puesto:"Técnico de Calidad",                          rol:"VISOR",      activo:true  })
  const dariu = await upsertUser({ email:"dbartosiewicz@ghifurnaces.com",nombre:"Darius Bartosiewicz",        emp:895,  puesto:"Técnico de Montaje",                          rol:"OPERARIO",   activo:false })
  const balle = await upsertUser({ email:"dballen@ghifurnaces.com",     nombre:"David Ballen",                emp:873,  puesto:"Supervisor de Montaje y PEM",                 rol:"SUPERVISOR", activo:true  })
  const couto = await upsertUser({ email:"dcouto@ghifurnaces.com",      nombre:"David Couto",                 emp:709,  puesto:"Site Manager",                                rol:"OPERARIO",   activo:true  })
  const dfern = await upsertUser({ email:"dfernandez@ghifurnaces.com",  nombre:"David Fernandez",             emp:1000, puesto:"",                                            rol:"OPERARIO",   activo:true  })
  const dgome = await upsertUser({ email:"dgomez@ghifurnaces.com",      nombre:"David Gomez",                 emp:1454, puesto:"Tecnico de automatizacion",                   rol:"SUPERVISOR", activo:false })
  const efern = await upsertUser({ email:"efernandez@ghifurnaces.com",  nombre:"Eduardo Fernandez",           emp:9069, puesto:"Tecnico de automatizacion",                   rol:"OPERARIO",   activo:true  })
  const elino = await upsertUser({ email:"elino@ghifurnaces.com",       nombre:"Edwin Lino",                  emp:900,  puesto:"Coordinador de Montaje",                      rol:"OPERARIO",   activo:true  })
  const egonz = await upsertUser({ email:"egonzalez@ghifurnaces.com",   nombre:"Eider Gonzalez",              emp:1233, puesto:"Project Manager",                             rol:"SUPERVISOR", activo:true  })
  const canar = await upsertUser({ email:"acanarte@ghifurnaces.com",    nombre:"Felipe Cañarte",              emp:945,  puesto:"Técnico de Montaje",                          rol:"OPERARIO",   activo:false })
  const izaba = await upsertUser({ email:"izabala@ghifurnaces.com",     nombre:"Ignacio Zabala",              emp:1579, puesto:"Técnico IT",                                  rol:"ADMIN",      activo:true  })
  const iazpi = await upsertUser({ email:"iazpitarte@ghifurnaces.com",  nombre:"Iker Azpitarte",              emp:949,  puesto:"Técnico de Montaje",                          rol:"OPERARIO",   activo:false })
  const icami = await upsertUser({ email:"icamin@ghifurnaces.com",      nombre:"Iker Camin",                  emp:894,  puesto:"Resp. Célula Eléctrica",                      rol:"SUPERVISOR", activo:true  })
  const iguti = await upsertUser({ email:"iqutierrez@ghifurnces.com",   nombre:"Iker Gutierrez",              emp:1562, puesto:"Tecnico de automatizacion",                   rol:"OPERARIO",   activo:false })
  const ilasso= await upsertUser({ email:"ilasso@ghifurnaces.com",      nombre:"Iker Lasso",                  emp:861,  puesto:"Supervisor de Montaje y PEM",                 rol:"ADMIN",      activo:true  })
  const iamez = await upsertUser({ email:"iamezaqa@ghifurnces.com",     nombre:"Iñigo Amezaga",               emp:1527, puesto:"Tecnico de automatizacion",                   rol:"OPERARIO",   activo:false })
  const ivlop = await upsertUser({ email:"ilopez@ghifurnaces.com",      nombre:"Iván López",                  emp:1561, puesto:"Tecnico de automatizacion",                   rol:"OPERARIO",   activo:false })
  const jmaig = await upsertUser({ email:"jmaigua@ghifurnaces.com",     nombre:"Joel Maigua",                 emp:1211, puesto:"Montador electromecánico",                    rol:"OPERARIO",   activo:true  })
  const jrioj = await upsertUser({ email:"jrioja@ghifurnaces.com",      nombre:"Jon Rioja",                   emp:1456, puesto:"Tecnico de automatizacion",                   rol:"ADMIN",      activo:true  })
  const jbarr = await upsertUser({ email:"jbarriocanal@ghifurnaces.com",nombre:"Jorge Barriocanal",           emp:897,  puesto:"Inspector de Puesta en Marcha",               rol:"OPERARIO",   activo:true  })
  const jdela = await upsertUser({ email:"jdelamo@ghifurnaces.com",     nombre:"Julián de Lamo",              emp:875,  puesto:"Inspector de Puesta en Marcha",               rol:"OPERARIO",   activo:true  })
  const mrodr = await upsertUser({ email:"mrodriguez@ghifurnaces.com",  nombre:"Marcos Rodriguez",            emp:987,  puesto:"Técnico de Montaje",                          rol:"OPERARIO",   activo:true  })
  const mrojo = await upsertUser({ email:"mrojo@ghifurnaces.com",       nombre:"Mikel Rojo",                  emp:934,  puesto:"Técnico de Montaje",                          rol:"OPERARIO",   activo:true  })
  const nadio = await upsertUser({ email:"nadiouma@ghifurnaces.com",    nombre:"Nicolás Adiouma",             emp:1010, puesto:"Técnico de Montaje",                          rol:"OPERARIO",   activo:true  })
  const rvill = await upsertUser({ email:"rvillasante@ghifurnaces.com", nombre:"Raul Villasante",             emp:1523, puesto:"Resp. Montaje y Puesta en marcha",            rol:"ADMIN",      activo:true  })
  const rhorm = await upsertUser({ email:"rhormaza@ghifurnaces.com",    nombre:"Rocío Hormaza",               emp:1519, puesto:"Project Manager",                             rol:"OPERARIO",   activo:true  })
  const sbeni = await upsertUser({ email:"sbenito@ghifurnaces.com",     nombre:"Saul Benito",                 emp:994,  puesto:"Site Manager",                                rol:"SUPERVISOR", activo:true  })
  const svega = await upsertUser({ email:"svega@ghifurnaces.com",       nombre:"Sergio Vega",                 emp:1434, puesto:"Inspector de Puesta en Marcha",               rol:"OPERARIO",   activo:true  })
  const upazos= await upsertUser({ email:"upazos@ghifurnaces.com",      nombre:"Unai Pazos",                  emp:1546, puesto:"Responsable de ingenieria electrica y automatizacion", rol:"ADMIN", activo:true })
  const wdel  = await upsertUser({ email:"wdelgado@ghifurnaces.com",    nombre:"Wilson Alfredo Delgado",      emp:1111, puesto:"Site Manager",                                rol:"SUPERVISOR", activo:true  })
  const xbarr = await upsertUser({ email:"xbarrios@ghifurnaces.com",    nombre:"Xabier Barrios",              emp:788,  puesto:"Coordinador de Montaje",                      rol:"OPERARIO",   activo:true  })
  const xolal = await upsertUser({ email:"xolalde@ghifurnaces.com",     nombre:"Xabier Olalde",               emp:1547, puesto:"Project Manager",                             rol:"OPERARIO",   activo:true  })
  const ymari = await upsertUser({ email:"ymarinez@ghifurnaces.com",    nombre:"Yohan Mariñez",               emp:959,  puesto:"Técnico de Montaje",                          rol:"OPERARIO",   activo:true  })

  console.log(`Usuarios creados/actualizados: ${(await db.user.count())}`)

  // ── Asignaciones ──────────────────────────────────────────────────────────
  // (limpiamos y recreamos para que sea idempotente)
  // Solo creamos, no borramos — upsert ignora duplicados

  await asignar(ahmed.id,  [await pid(12720,"H03;H04")])
  await asignar(aimar.id,  [await pid(11202,"H01"), await pid(11202,"H02")])
  await asignar(berru.id,  [await pid(10517,"H01"), await pid(10517,"H02")])
  await asignar(andre.id,  [await pid(11866,"H01")])
  await asignar(apala.id,  [await pid(12737,"H03;H04"), await pid(12737,"H01;H02"), await pid(11576,"H01"), await pid(11576,"H05"), await pid(11576,"H06")])
  await asignar(afern.id,  [await pid(12737,"H03;H04"), await pid(12737,"H01;H02"), await pid(11576,"H01"), await pid(11576,"H05"), await pid(11576,"H06")])
  await asignar(asier.id,  [await pid(12720,"H03;H04"), await pid(12720,"H05"), await pid(12720,"H06"), await pid(12720,"H01")])
  await asignar(arian.id,  [await pid(11721,"H01;H02"), await pid(11721,"H03;H04"), await pid(11721,"H05"), await pid(11559,"H01;H02"), await pid(12545,"H01"), await pid(12545,"H02"), await pid(12720,"H01"), await pid(12720,"H03;H04")])
  await asignar(balle.id,  [await pid(11559,"H01;H02"), await pid(11559,"H03")])
  await asignar(couto.id,  [await pid(11721,"H01;H02"), await pid(11721,"H03;H04"), await pid(11721,"H05"), await pid(12720,"H01"), await pid(12720,"H03;H04"), await pid(12720,"H05"), await pid(12720,"H06")])
  await asignar(dfern.id,  [await pid(12737,"H01;H02"), await pid(12737,"H03;H04")])
  await asignar(dgome.id,  [await pid(13420,"H01")])
  await asignar(efern.id,  [await pid(11721,"H03;H04"), await pid(11721,"H05"), await pid(10517,"H01"), await pid(11559,"H01;H02"), await pid(12545,"H01"), await pid(12545,"H02"), await pid(12720,"H03;H04"), await pid(12720,"H05"), await pid(12720,"H06"), await pid(12737,"H01;H02"), await pid(12737,"H03;H04"), await pid(11202,"H01")])
  await asignar(elino.id,  [await pid(13420,"H01")])
  await asignar(egonz.id,  [await pid(10517,"H01"), await pid(10517,"H02"), await pid(12545,"H01"), await pid(12545,"H02"), await pid(12290,"H01")])
  await asignar(canar.id,  [await pid(12720,"H01")])
  await asignar(icami.id,  [await pid(11576,"H01"), await pid(11576,"H05"), await pid(11576,"H06")])
  await asignar(iguti.id,  [await pid(10517,"H02"), await pid(10517,"H01")])
  await asignar(iamez.id,  [await pid(10517,"H01"), await pid(10517,"H02")])
  await asignar(jmaig.id,  [await pid(10517,"H02")])
  await asignar(jrioj.id,  [await pid(11559,"H03"), await pid(11721,"H05"), await pid(12545,"H01")])
  await asignar(jbarr.id,  [await pid(11721,"H03;H04"), await pid(11721,"H05"), await pid(10517,"H01"), await pid(11559,"H01;H02"), await pid(12545,"H01"), await pid(12720,"H01"), await pid(12720,"H03;H04"), await pid(12720,"H05"), await pid(12720,"H06")])
  await asignar(jdela.id,  [await pid(11721,"H01;H02"), await pid(11721,"H03;H04"), await pid(11721,"H05"), await pid(10517,"H01"), await pid(11559,"H01;H02"), await pid(12545,"H01"), await pid(12545,"H02"), await pid(12720,"H03;H04"), await pid(12720,"H05"), await pid(12720,"H06"), await pid(12737,"H01;H02")])
  await asignar(mrojo.id,  [await pid(12737,"H01;H02"), await pid(12737,"H03;H04")])
  await asignar(nadio.id,  [await pid(13420,"H01")])
  await asignar(rhorm.id,  [await pid(13420,"H01")])
  await asignar(sbeni.id,  [await pid(12545,"H01"), await pid(12545,"H02")])
  await asignar(svega.id,  [await pid(11721,"H01;H02"), await pid(11721,"H03;H04"), await pid(11721,"H05"), await pid(10517,"H01"), await pid(11559,"H01;H02"), await pid(12545,"H01"), await pid(12545,"H02"), await pid(12720,"H01"), await pid(12720,"H03;H04"), await pid(12720,"H05"), await pid(12720,"H06"), await pid(12737,"H01;H02")])
  await asignar(wdel.id,   [await pid(13420,"H01"), await pid(11576,"H01"), await pid(11576,"H05"), await pid(11576,"H06")])
  await asignar(xbarr.id,  [await pid(11721,"H01;H02"), await pid(11721,"H03;H04"), await pid(11721,"H05"), await pid(12290,"H01")])
  await asignar(xolal.id,  [await pid(12545,"H01"), await pid(12545,"H02"), await pid(10517,"H01")])
  await asignar(ymari.id,  [await pid(12545,"H01"), await pid(12545,"H02")])

  console.log("Asignaciones creadas.")
  console.log(`Total usuarios: ${await db.user.count()}`)
}

main().catch(console.error).finally(() => db.$disconnect())
