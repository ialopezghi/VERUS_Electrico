"use client"

import { useState, useRef, useCallback } from "react"
import ManguerasTable from "./ManguerasTable"
import SenalesTable from "./SenalesTable"
import PruebasTable from "./PruebasTable"
import CanalizacionesTable from "./CanalizacionesTable"
import AvanceChart from "./AvanceChart"

type Fase = "FAT" | "SAT"
type SubTab = "mangueras" | "senales" | "pruebas" | "canalizaciones"
type MainTab = "FAT" | "SAT" | "AVANCE"

interface ColDef { id: string; nombre: string; tabla: string; orden: number }

interface Props {
  proyecto: {
    id: string; idh: string; orden: number; nombre: string | null
    cliente: string | null; ubicacion: string | null; estado: string
    mangueras: any[]; signalRecords: any[]; protocoloPruebas: any[]
    canalizaciones: any[]; historicoAvances: any[]; customColumnDefs: ColDef[]
  }
  codigo: string
}

const subTabs: { key: SubTab; label: string }[] = [
  { key: "canalizaciones", label: "Canalización" },
  { key: "mangueras",      label: "Mangueras" },
  { key: "senales",        label: "Señales" },
  { key: "pruebas",        label: "Pruebas" },
]

const estadoConfig: Record<string, { bg: string; text: string; label: string }> = {
  en_proceso: { bg: "#FEF3C7", text: "#D97706",  label: "En Proceso" },
  activo:     { bg: "#DCFCE7", text: "#15803D",  label: "Activo" },
  completado: { bg: "#F2F2F2", text: "#959595",  label: "Finalizado" },
  pausado:    { bg: "#FEE2E2", text: "#B91C1C",  label: "Pausado" },
  ofertado:   { bg: "#EDE9FE", text: "#7C3AED",  label: "Ofertado" },
  cancelado:  { bg: "#F2F2F2", text: "#959595",  label: "Cancelado" },
}

export default function ProyectoDetailClient({ proyecto, codigo }: Props) {
  const [mainTab, setMainTab] = useState<MainTab>("FAT")
  const [subTab, setSubTab] = useState<SubTab>("mangueras")
  const exportFnRef = useRef<(() => void) | null>(null)
  const registerExport = useCallback((fn: (() => void) | null) => { exportFnRef.current = fn }, [])

  const fase = mainTab as Fase
  const estado = estadoConfig[proyecto.estado] ?? estadoConfig.en_proceso

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontSize: 11, color: "#959595", marginBottom: 6, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <a href="/proyectos" style={{ color: "#959595", textDecoration: "none" }}>Proyectos</a>
        <span>›</span>
        <span style={{ color: "#C0022C", fontWeight: 700 }}>{codigo}</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#333333", margin: 0, letterSpacing: "0.01em" }}>
            {proyecto.nombre ?? codigo}
          </h1>
          {proyecto.ubicacion && (
            <div style={{ fontSize: 12, color: "#959595", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {proyecto.ubicacion}
            </div>
          )}
        </div>
        <span style={{ padding: "4px 10px", borderRadius: 2, fontSize: 10, fontWeight: 700, background: estado.bg, color: estado.text, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>
          {estado.label}
        </span>
      </div>

      {/* Panel de tabs */}
      <div style={{ background: "#FEFEFE", borderRadius: 4, border: "1px solid #E0E0E0", overflow: "hidden", boxShadow: "0 1px 2px rgba(11,11,12,0.06)" }}>

        {/* Main tabs FAT / SAT / AVANCE */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #E0E0E0", background: "#333333" }}>
          {(["FAT", "SAT", "AVANCE"] as MainTab[]).map((t) => (
            <button key={t} onClick={() => setMainTab(t)} style={{
              padding: "12px 22px",
              border: "none",
              borderBottom: mainTab === t ? "2px solid #C0022C" : "2px solid transparent",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              background: "transparent",
              color: mainTab === t ? "#FEFEFE" : "rgba(255,255,255,0.45)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition: "color 0.15s, border-color 0.15s",
            }}>
              {t}
            </button>
          ))}
          <span style={{ marginLeft: "auto", paddingRight: 16, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
            {codigo}
          </span>
        </div>

        {/* Sub tabs (solo FAT/SAT) */}
        {mainTab !== "AVANCE" && (
          <div style={{ display: "flex", alignItems: "center", padding: "0 12px", borderBottom: "1px solid #E0E0E0", background: "#F2F2F2", gap: 2 }}>
            {subTabs.map((st) => (
              <button key={st.key} onClick={() => setSubTab(st.key)} style={{
                padding: "9px 14px",
                border: "none",
                borderBottom: subTab === st.key ? "2px solid #C0022C" : "2px solid transparent",
                background: "transparent",
                color: subTab === st.key ? "#C0022C" : "#959595",
                fontWeight: subTab === st.key ? 700 : 400,
                fontSize: 12,
                cursor: "pointer",
                letterSpacing: "0.04em",
                transition: "color 0.15s, border-color 0.15s",
              }}>
                {st.label}
              </button>
            ))}
            {subTab !== "canalizaciones" && (
              <div style={{ marginLeft: "auto" }}>
                <button onClick={() => exportFnRef.current?.()} style={{
                  padding: "5px 12px",
                  background: "transparent",
                  color: "#959595",
                  border: "1px solid #E0E0E0",
                  borderRadius: 2,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <img src="/icons/dark/Download cloud.svg" alt="" width={13} height={13} />
                  Exportar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contenido */}
        <div style={{ padding: 0 }}>
          {mainTab === "AVANCE" ? (
            <AvanceChart historico={proyecto.historicoAvances} codigo={codigo} />
          ) : subTab === "mangueras" ? (
            <ManguerasTable key={`mangueras-${fase}`} proyectoId={proyecto.id} fase={fase} mangueras={proyecto.mangueras.filter((m) => m.fase === fase)} columnDefs={proyecto.customColumnDefs.filter((c) => c.tabla === "manguera")} registerExport={registerExport} />
          ) : subTab === "senales" ? (
            <SenalesTable key={`senales-${fase}`} proyectoId={proyecto.id} fase={fase} senales={proyecto.signalRecords.filter((s) => s.fase === fase)} columnDefs={proyecto.customColumnDefs.filter((c) => c.tabla === "senhal")} registerExport={registerExport} />
          ) : subTab === "pruebas" ? (
            <PruebasTable key={`pruebas-${fase}`} proyectoId={proyecto.id} fase={fase} pruebas={proyecto.protocoloPruebas.filter((p) => p.fase === fase)} columnDefs={proyecto.customColumnDefs.filter((c) => c.tabla === "prueba")} registerExport={registerExport} />
          ) : (
            <CanalizacionesTable key={`canal-${fase}`} proyectoId={proyecto.id} fase={fase} canalizaciones={proyecto.canalizaciones.filter((c) => c.fase === fase)} />
          )}
        </div>
      </div>
    </div>
  )
}
