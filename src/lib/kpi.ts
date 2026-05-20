// null = N/A (no aplica → no bloquea), true = SI (ok), false = NO (falta)
export function isMangueraOk(m: {
  conectadoEnOrigen: boolean | null
  tendidoEnOrigen: boolean | null
  tendidoEnDestino: boolean | null
  conectadoEnDestino: boolean | null
}): boolean {
  return (
    m.conectadoEnOrigen !== false &&
    m.tendidoEnOrigen !== false &&
    m.tendidoEnDestino !== false &&
    m.conectadoEnDestino !== false
  )
}

export function isSenalOk(checkedStatus: string): boolean {
  const s = checkedStatus.trim().toUpperCase()
  return s === "OK" || s === "SI" || s === "S"
}

export interface KpiResult {
  pctMangueras: number
  pctSenales: number
  pctPruebas: number
  pctFase: number
  totalMangueras: number
  okMangueras: number
  totalSenales: number
  okSenales: number
  totalPruebas: number
  okPruebas: number
}

export function calcKpiFase(data: {
  mangueras: Array<{
    conectadoEnOrigen: boolean | null
    tendidoEnOrigen: boolean | null
    tendidoEnDestino: boolean | null
    conectadoEnDestino: boolean | null
    deletedAt: Date | null
  }>
  senales: Array<{ checkedStatus: string; deletedAt: Date | null }>
  pruebas: Array<{ comprobado: boolean; deletedAt: Date | null }>
}): KpiResult {
  const mangueras = data.mangueras.filter((m) => !m.deletedAt)
  const senales = data.senales.filter((s) => !s.deletedAt)
  const pruebas = data.pruebas.filter((p) => !p.deletedAt)

  const okMangueras = mangueras.filter(isMangueraOk).length
  const okSenales = senales.filter((s) => isSenalOk(s.checkedStatus)).length
  const okPruebas = pruebas.filter((p) => p.comprobado).length

  const pctMangueras = mangueras.length ? (okMangueras / mangueras.length) * 100 : 0
  const pctSenales = senales.length ? (okSenales / senales.length) * 100 : 0
  const pctPruebas = pruebas.length ? (okPruebas / pruebas.length) * 100 : 0

  const divisor = [mangueras.length, senales.length, pruebas.length].filter(Boolean).length || 1
  const pctFase =
    ((mangueras.length ? pctMangueras : 0) +
      (senales.length ? pctSenales : 0) +
      (pruebas.length ? pctPruebas : 0)) /
    divisor

  return {
    pctMangueras,
    pctSenales,
    pctPruebas,
    pctFase,
    totalMangueras: mangueras.length,
    okMangueras,
    totalSenales: senales.length,
    okSenales,
    totalPruebas: pruebas.length,
    okPruebas,
  }
}

export function calcSubKpisMangueras(mangueras: Array<{
  tendidoEnOrigen: boolean | null
  tendidoEnDestino: boolean | null
  conectadoEnOrigen: boolean | null
  conectadoEnDestino: boolean | null
}>) {
  const total = mangueras.length
  if (!total) return { pctTendido: 0, pctConectado: 0 }
  const okTendido  = mangueras.filter((m) => m.tendidoEnOrigen !== false && m.tendidoEnDestino !== false).length
  const okConectado = mangueras.filter((m) => m.conectadoEnOrigen !== false && m.conectadoEnDestino !== false).length
  return {
    pctTendido:   (okTendido  / total) * 100,
    pctConectado: (okConectado / total) * 100,
  }
}

export function fmt(n: number): string {
  return n.toFixed(1)
}

export function codProyecto(orden: number, idh: string): string {
  return `${orden}-${idh.replace(/;/g, " y ")}`
}
