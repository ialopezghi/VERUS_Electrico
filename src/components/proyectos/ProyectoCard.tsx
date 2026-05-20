"use client"

import Link from "next/link"
import ProgressBar from "@/components/ui/ProgressBar"
import { fmt } from "@/lib/kpi"
import type { KpiResult } from "@/lib/kpi"

interface Props {
  proyecto: {
    id: string
    codigo: string
    nombre: string | null
    cliente: string | null
    ubicacion: string | null
    tipoEquipo: string | null
    estado: string
    imagenUrl?: string | null
    fat: KpiResult
    sat: KpiResult
    total: number
  }
}

function resolverImagen(proyecto: { nombre: string | null; cliente: string | null; tipoEquipo: string | null; imagenUrl?: string | null }): string | null {
  if (proyecto.imagenUrl === "none") return null
  if (proyecto.imagenUrl) return proyecto.imagenUrl
  const texto = `${proyecto.nombre ?? ""} ${proyecto.cliente ?? ""} ${proyecto.tipoEquipo ?? ""}`.toUpperCase()
  if (texto.includes("MCB"))                                                              return "/img-baux-mcb.png"
  if (texto.includes("BAUX") || texto.includes("HHVF"))                                  return "/img-baux.png"
  if (texto.includes("ARCELOR") || texto.includes("FNG"))                                return "/img-arcelor.png"
  if (texto.includes("SPEIRA") || texto.includes("RAN-2R"))                              return "/img-ran2r.png"
  if (texto.includes("NAMA"))                                                             return "/img-ran.png"
  if (texto.includes("FD2") || texto.includes("CONSTELLIUM") || texto.includes("RAN-R")) return "/img-fd2.png"
  if (texto.includes("RAN-60"))                                                           return "/img-ran.png"
  if (texto.includes("DESESCORIADORA"))                                                   return "/img-desescoriadora.png"
  if (texto.includes("MCH"))                                                              return "/img-mch.png"
  if (texto.includes("CONTINUO"))                                                         return "/img-continuo.png"
  if (texto.includes("SOWERA"))                                                           return null
  if (texto.includes("FRB"))                                                              return "/img-frb.png"
  if (texto.includes("ARZYZ"))                                                            return "/img-arzyz.png"
  if (texto.includes("RMA"))                                                              return "/img-rma.png"
  if (texto.includes("GLOBALCAST") || texto.includes("KBV"))                             return "/ghi-machine.png"
  return "/ghi-machine.png"
}

const estadoConfig: Record<string, { label: string; color: string }> = {
  en_proceso: { label: "En Proceso", color: "#F59E0B" },
  activo:     { label: "Activo",     color: "#22C55E" },
  completado: { label: "Finalizado", color: "#959595" },
  pausado:    { label: "Pausado",    color: "#EF4444" },
  ofertado:   { label: "Ofertado",   color: "#A78BFA" },
  cancelado:  { label: "Cancelado",  color: "#959595" },
}

function KpiList({ kpi, label }: { kpi: KpiResult; label: "FAT" | "SAT" }) {
  const isSat = label === "SAT"
  const rows = [
    { name: "Mangueras", value: kpi.pctMangueras, hasData: kpi.totalMangueras > 0 },
    { name: "Señales",   value: kpi.pctSenales,   hasData: kpi.totalSenales > 0 },
    { name: "Pruebas",   value: kpi.pctPruebas,   hasData: kpi.totalPruebas > 0 },
  ]
  return (
    <div>
      {rows.map(({ name, value, hasData }) => (
        <div key={name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 12, color: "#595959" }}>{name}:</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: hasData ? "#333333" : "#C8C8C8" }}>
            {hasData ? `${fmt(value)}%` : "—"}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ProyectoCard({ proyecto }: Props) {
  const estado = estadoConfig[proyecto.estado] ?? estadoConfig.en_proceso
  const imagen = resolverImagen(proyecto)

  const fatHasData = proyecto.fat.totalMangueras > 0 || proyecto.fat.totalSenales > 0 || proyecto.fat.totalPruebas > 0
  const satHasData = proyecto.sat.totalMangueras > 0 || proyecto.sat.totalSenales > 0 || proyecto.sat.totalPruebas > 0

  return (
    <Link href={`/proyectos/${proyecto.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          background: "#FEFEFE",
          borderRadius: 4,
          border: "1px solid #E0E0E0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
          transition: "box-shadow 0.15s, transform 0.15s",
          cursor: "pointer",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(192,2,44,0.12)"
          ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.07)"
          ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"
        }}
      >
        {/* Cabecera: código + estado */}
        <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #F0F0F0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#959595", fontWeight: 500, letterSpacing: "0.04em", marginBottom: 2 }}>
              {proyecto.codigo}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#333333", lineHeight: 1.2, marginBottom: 2 }}>
              {proyecto.nombre ?? proyecto.codigo}
            </div>
            {proyecto.ubicacion && (
              <div style={{ fontSize: 11, color: "#959595", display: "flex", alignItems: "center", gap: 3 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {proyecto.ubicacion}
              </div>
            )}
          </div>
          {/* Badge estado */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            background: "#1C1C1C", borderRadius: 3, padding: "3px 9px",
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={estado.color} strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: estado.color, letterSpacing: "0.04em" }}>
              {estado.label}
            </span>
          </div>
        </div>

        {/* Cuerpo: 3 columnas */}
        <div className="proyecto-card-body">

          {/* Col 1: imagen + avance total */}
          <div className="proyecto-card-col-img" style={{
            background: "#F7F7F7", borderRight: "1px solid #E0E0E0",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "12px 10px", gap: 8,
          }}>
            {imagen && (
              <img
                src={imagen}
                alt={proyecto.tipoEquipo ?? "Equipo GHI"}
                style={{ width: "100%", maxWidth: 100, height: 80, objectFit: "contain" }}
              />
            )}
            <div style={{ width: "100%", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#595959", marginBottom: 2 }}>
                Avance Total (%): <strong style={{ color: "#333333" }}>{fmt(proyecto.total)}</strong>
              </div>
              <ProgressBar value={proyecto.total} color="#C0022C" height={7} />
            </div>
          </div>

          {/* Col 2: barras FAT + SAT */}
          <div className="proyecto-card-col-bars" style={{ padding: "14px 16px", borderRight: "1px solid #E0E0E0", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
            {/* FAT */}
            <div>
              <div style={{ fontSize: 12, color: "#595959", marginBottom: 5 }}>
                Avance FAT (%): <strong style={{ color: "#333333" }}>{fatHasData ? fmt(proyecto.fat.pctFase) : "—"}</strong>
              </div>
              <ProgressBar value={fatHasData ? proyecto.fat.pctFase : 0} color="#C0022C" height={10} />
            </div>
            {/* SAT */}
            <div>
              <div style={{ fontSize: 12, color: "#595959", marginBottom: 5 }}>
                Avance SAT (%): <strong style={{ color: "#333333" }}>{satHasData ? fmt(proyecto.sat.pctFase) : "—"}</strong>
              </div>
              <ProgressBar value={satHasData ? proyecto.sat.pctFase : 0} color="#C0022C" height={10} />
            </div>
          </div>

          {/* Col 3: KPIs FAT + SAT en texto */}
          <div style={{ padding: "14px 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
            {/* FAT KPIs */}
            <KpiList kpi={proyecto.fat} label="FAT" />
            <div style={{ height: 1, background: "#EFEFEF" }} />
            {/* SAT KPIs */}
            <KpiList kpi={proyecto.sat} label="SAT" />
          </div>

        </div>
      </div>
    </Link>
  )
}
