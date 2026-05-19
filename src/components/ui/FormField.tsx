"use client"

interface Props {
  label: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}

export function FormField({ label, required, children, hint }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}{required && <span style={{ color: "#C0022C", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ fontSize: 10, color: "#959595" }}>{hint}</span>}
    </div>
  )
}

export const inputStyle: React.CSSProperties = {
  border: "1px solid #E0E0E0",
  borderRadius: 4,
  padding: "8px 10px",
  fontSize: 13,
  color: "#333333",
  background: "#FEFEFE",
  width: "100%",
  outline: "none",
  fontFamily: "inherit",
}

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
}
