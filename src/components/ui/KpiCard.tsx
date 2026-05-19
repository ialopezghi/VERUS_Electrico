interface KpiCardProps {
  label: string
  value: number | string
  color?: string
  icon?: React.ReactNode
}

export default function KpiCard({ label, value, color = "#959595", icon }: KpiCardProps) {
  return (
    <div style={{
      background: "#FEFEFE",
      borderRadius: 4,
      padding: "18px 22px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      boxShadow: "0 1px 2px rgba(11,11,12,0.06), 0 1px 3px rgba(11,11,12,0.08)",
      border: "1px solid #E0E0E0",
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 4,
        background: `${color}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#333333", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: "#959595", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}
