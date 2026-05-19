"use client"

type FlagValue = boolean | null

interface FlagCellProps {
  value: FlagValue
  onChange: (v: FlagValue) => void
  disabled?: boolean
}

const OPTIONS: { label: string; value: FlagValue; bg: string; text: string }[] = [
  { label: "SI",  value: true,  bg: "var(--color-si-bg)",  text: "var(--color-si-text)"  },
  { label: "NO",  value: false, bg: "var(--color-no-bg)",  text: "var(--color-no-text)"  },
  { label: "N/A", value: null,  bg: "var(--color-na-bg)",  text: "var(--color-na-text)"  },
]

function currentOption(v: FlagValue) {
  return OPTIONS.find((o) => o.value === v) ?? OPTIONS[0]
}

export default function FlagCell({ value, onChange, disabled = false }: FlagCellProps) {
  const curr = currentOption(value)

  function next(e: React.ChangeEvent<HTMLSelectElement>) {
    const raw = e.target.value
    const selected = OPTIONS.find((o) => String(o.value) === raw)
    if (selected) onChange(selected.value)
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", minWidth: 72 }}>
      <select
        disabled={disabled}
        value={String(value)}
        onChange={next}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          background: curr.bg,
          color: curr.text,
          fontWeight: 600,
          fontSize: 12,
          padding: "4px 24px 4px 10px",
          borderRadius: 2,
          border: "none",
          cursor: disabled ? "default" : "pointer",
          width: "100%",
        }}
      >
        {OPTIONS.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
      <span
        style={{
          position: "absolute",
          right: 6,
          pointerEvents: "none",
          color: curr.text,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>
  )
}
