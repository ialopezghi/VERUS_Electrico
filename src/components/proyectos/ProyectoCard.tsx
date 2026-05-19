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

function resolverImagen(proyecto: { nombre: string | null; cliente: string | null; tipoEquipo: string | null; imagenUrl?: string | null }) {
  if (proyecto.imagenUrl) return proyecto.imagenUrl
  const texto = `${proyecto.nombre ?? ""} ${proyecto.cliente ?? ""} ${proyecto.tipoEquipo ?? ""}`.toUpperCase()
  if (texto.includes("BAUX") || texto.includes("HHVF") || texto.includes("MCB"))        return "/img-baux.png"
  if (texto.includes("ARCELOR") || texto.includes("FNG"))                               return "/img-arcelor.png"
  if (texto.includes("FD2") || texto.includes("CONSTELLIUM") || texto.includes("RAN-R")) return "/img-fd2.png"
  if (texto.includes("GLOBALCAST") || texto.includes("FRB") || texto.includes("KBV"))   return "/ghi-machine.png"
  return "/ghi-machine.png"
}

const estadoConfig: Record<string, { bg: string; text: string; label: string }> = {
  en_proceso: { bg: "#1C1C1C", text: "#F59E0B",  label: "En Proceso" },
  activo:     { bg: "#1C1C1C", text: "#22C55E",  label: "Activo" },
  completado: { bg: "#1C1C1C", text: "#959595",  label: "Finalizado" },
  pausado:    { bg: "#1C1C1C", text: "#EF4444",  label: "Pausado" },
  ofertado:   { bg: "#1C1C1C", text: "#A78BFA",  label: "Ofertado" },
  cancelado:  { bg: "#1C1C1C", text: "#959595",  label: "Cancelado" },
}

function KpiRow({ label, value, color = "#C0022C" }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "#959595" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{fmt(value)}%</span>
      </div>
      <ProgressBar value={value} color={color} height={5} />
    </div>
  )
}

export default function ProyectoCard({ proyecto }: Props) {
  const estado = estadoConfig[proyecto.estado] ?? estadoConfig.en_proceso
  const imagen = resolverImagen(proyecto)

  return (
    <Link href={`/proyectos/${proyecto.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#FEFEFE",
          borderRadius: 4,
          border: "1px solid #E0E0E0",
          boxShadow: "0 1px 2px rgba(11,11,12,0.06), 0 1px 3px rgba(11,11,12,0.08)",
          transition: "box-shadow 0.15s, transform 0.15s",
          cursor: "pointer",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(192,2,44,0.12)"
          ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 2px rgba(11,11,12,0.06), 0 1px 3px rgba(11,11,12,0.08)"
          ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"
        }}
      >
        {/* Header */}
        <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid #F2F2F2", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "#959595", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>
              {proyecto.codigo}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333333", lineHeight: 1.2 }}>
              {proyecto.nombre ?? proyecto.codigo}
            </div>
            {proyecto.ubicacion && (
              <div style={{ fontSize: 11, color: "#959595", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {proyecto.ubicacion}
              </div>
            )}
          </div>
          {/* Badge estado */}
          <span style={{
            padding: "3px 8px", borderRadius: 2,
            fontSize: 10, fontWeight: 700,
            background: estado.bg, color: estado.text,
            textTransform: "uppercase", letterSpacing: "0.06em",
            whiteSpace: "nowrap", border: `1px solid ${estado.text}33`,
          }}>
            {estado.label}
          </span>
        </div>

        {/* Cuerpo: imagen + KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 0 }}>

          {/* Imagen máquina */}
          <div style={{ background: "#F2F2F2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 10px", gap: 10, borderRight: "1px solid #E0E0E0" }}>
            <img
              src={imagen}
              alt={proyecto.tipoEquipo ?? "Equipo GHI"}
              style={{ width: "100%", maxWidth: 110, height: 90, objectFit: "contain", display: "block" }}
            />
            {/* Total en la imagen */}
            <div style={{ textAlign: "center", width: "100%" }}>
              <div style={{ fontSize: 10, color: "#959595", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                Avance Total
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#333333", lineHeight: 1 }}>
                {fmt(proyecto.total)}<span style={{ fontSize: 11, fontWeight: 400 }}>%</span>
              </div>
              <div style={{ marginTop: 5 }}>
                <ProgressBar value={proyecto.total} color="#C0022C" height={5} />
              </div>
            </div>
          </div>

          {/* KPIs FAT + SAT */}
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 0 }}>

            {/* FAT */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.08em" }}>FAT</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#C0022C" }}>{fmt(proyecto.fat.pctFase)}<span style={{ fontSize: 11, fontWeight: 400 }}>%</span></span>
              </div>
              <ProgressBar value={proyecto.fat.pctFase} color="#C0022C" height={5} />
              <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px 8px" }}>
                {[
                  { label: "Mangueras", v: proyecto.fat.pctMangueras },
                  { label: "Señales",   v: proyecto.fat.pctSenales },
                  { label: "Pruebas",   v: proyecto.fat.pctPruebas },
                ].map(({ label, v }) => (
                  <div key={label} style={{ fontSize: 10, color: "#959595" }}>
                    <span style={{ display: "block", color: "#333333", fontWeight: 500 }}>{fmt(v)}%</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "#F2F2F2", marginBottom: 10 }} />

            {/* SAT */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.08em" }}>SAT</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#333333" }}>{fmt(proyecto.sat.pctFase)}<span style={{ fontSize: 11, fontWeight: 400 }}>%</span></span>
              </div>
              <ProgressBar value={proyecto.sat.pctFase} color="#333333" height={5} />
              <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px 8px" }}>
                {[
                  { label: "Mangueras", v: proyecto.sat.pctMangueras },
                  { label: "Señales",   v: proyecto.sat.pctSenales },
                  { label: "Pruebas",   v: proyecto.sat.pctPruebas },
                ].map(({ label, v }) => (
                  <div key={label} style={{ fontSize: 10, color: "#959595" }}>
                    <span style={{ display: "block", color: "#333333", fontWeight: 500 }}>{fmt(v)}%</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Link>
  )
}
