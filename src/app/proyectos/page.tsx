import { db } from "@/lib/db"
import { codProyecto, calcKpiFase } from "@/lib/kpi"
import KpiCard from "@/components/ui/KpiCard"
import ProyectosClient from "@/components/proyectos/ProyectosClient"

export const dynamic = "force-dynamic"

export default async function ProyectosPage() {
  try {
    return await renderPage()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack ?? "" : ""
    return (
      <div style={{ padding: 40, fontFamily: "monospace", background: "#fff0f0", minHeight: "100vh" }}>
        <h2 style={{ color: "#C0022C", marginBottom: 16 }}>Error en /proyectos</h2>
        <pre style={{ background: "#fee", padding: 16, borderRadius: 4, overflowX: "auto", fontSize: 13 }}>{msg}</pre>
        <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 4, overflowX: "auto", fontSize: 11, marginTop: 12 }}>{stack}</pre>
      </div>
    )
  }
}

async function renderPage() {
  const proyectos = await db.proyecto.findMany({
    where: { deletedAt: null },
    include: {
      mangueras:        { where: { deletedAt: null } },
      signalRecords:    { where: { deletedAt: null } },
      protocoloPruebas: { where: { deletedAt: null } },
    },
    orderBy: [{ orden: "asc" }, { idh: "asc" }],
  })

  const counts = {
    finalizados: proyectos.filter((p) => p.estado === "completado").length,
    en_proceso:  proyectos.filter((p) => p.estado === "en_proceso").length,
    activos:     proyectos.filter((p) => p.activo && p.estado !== "completado").length,
    ofertados:   proyectos.filter((p) => p.estado === "ofertado").length,
  }

  // Agrupar por orden para el selector
  const grupos: Record<number, typeof proyectos> = {}
  for (const p of proyectos) {
    if (!grupos[p.orden]) grupos[p.orden] = []
    grupos[p.orden].push(p)
  }

  const proyectosConKpi = proyectos.map((p) => {
    const fat = calcKpiFase({
      mangueras:        p.mangueras.filter((m) => m.fase === "FAT"),
      senales:          p.signalRecords.filter((s) => s.fase === "FAT"),
      pruebas:          p.protocoloPruebas.filter((pr) => pr.fase === "FAT"),
    })
    const sat = calcKpiFase({
      mangueras:        p.mangueras.filter((m) => m.fase === "SAT"),
      senales:          p.signalRecords.filter((s) => s.fase === "SAT"),
      pruebas:          p.protocoloPruebas.filter((pr) => pr.fase === "SAT"),
    })
    const total = (fat.pctFase + sat.pctFase) / 2
    return { ...p, fat, sat, total, codigo: codProyecto(p.orden, p.idh) }
  })

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#333333", marginBottom: 24, letterSpacing: "0.02em", textTransform: "uppercase" }}>
        Proyectos
      </h1>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KpiCard label="Finalizados" value={counts.finalizados} color="#22C55E"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>}
        />
        <KpiCard label="En proceso" value={counts.en_proceso} color="#F59E0B"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <KpiCard label="Activos" value={counts.activos} color="#C0022C"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
        />
        <KpiCard label="Ofertados" value={counts.ofertados} color="#959595"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
        />
      </div>

      {/* Proyectos (tarjetas / tabla con selector de columnas) */}
      <ProyectosClient proyectos={proyectosConKpi.map((p) => ({
        id:         p.id,
        orden:      p.orden,
        codigo:     p.codigo,
        nombre:     p.nombre,
        cliente:    p.cliente,
        ubicacion:  p.ubicacion,
        tipoEquipo: p.tipoEquipo,
        estado:     p.estado,
        fat:        p.fat,
        sat:        p.sat,
        total:      p.total,
      }))} />
    </div>
  )
}
