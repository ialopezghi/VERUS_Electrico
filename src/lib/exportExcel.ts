import * as XLSX from "xlsx"

export function exportToExcel(rows: Record<string, unknown>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Datos")
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export const flagLabel = (v: boolean | null | undefined): string =>
  v === true ? "SI" : v === false ? "NO" : "N/A"
