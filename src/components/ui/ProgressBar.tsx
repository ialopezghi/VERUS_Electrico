interface ProgressBarProps {
  value: number // 0-100
  color?: string
  height?: number
}

export default function ProgressBar({ value, color = "#C0022C", height = 6 }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      style={{
        width: "100%",
        height,
        background: "#E0E0E0",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: "100%",
          background: color,
          borderRadius: 2,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  )
}
