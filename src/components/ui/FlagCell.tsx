"use client"

type FlagValue = boolean | null

interface FlagCellProps {
  value: FlagValue
  onChange: (v: FlagValue) => void
  disabled?: boolean
}

const CYCLE: FlagValue[] = [true, false, null]

const STATES = {
  true: {
    label: "SI",
    bg: "#DCFCE7",
    color: "#15803D",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  false: {
    label: "NO",
    bg: "#FEE2E2",
    color: "#B91C1C",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  null: {
    label: "N/A",
    bg: "#F3F4F6",
    color: "#9CA3AF",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
}

export default function FlagCell({ value, onChange, disabled = false }: FlagCellProps) {
  const key = value === null ? "null" : String(value) as "true" | "false"
  const state = STATES[key]

  function cycle() {
    if (disabled) return
    const idx = CYCLE.indexOf(value)
    onChange(CYCLE[(idx + 1) % CYCLE.length])
  }

  return (
    <button
      onClick={cycle}
      disabled={disabled}
      title={`${state.label} — clic para cambiar`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 2,
        border: "none",
        background: state.bg,
        color: state.color,
        fontWeight: 700,
        fontSize: 11,
        cursor: disabled ? "default" : "pointer",
        letterSpacing: "0.04em",
        transition: "opacity 0.1s",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.opacity = "0.75" }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
    >
      {state.icon}
      {state.label}
    </button>
  )
}
