import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Verus Eléctrico — GHI",
  description: "Sistema de seguimiento de montaje eléctrico",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
