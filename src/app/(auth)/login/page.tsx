"use client"

import { signIn } from "next-auth/react"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/proyectos"
  const error = searchParams.get("error")

  const [email, setEmail] = useState("ilopez@ghifurnaces.com")
  const [nombre, setNombre] = useState("Iker Lasso")
  const [loading, setLoading] = useState(false)

  async function handleMicrosoft() {
    setLoading(true)
    await signIn("microsoft-entra-id", { callbackUrl })
  }

  async function handleDev(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn("dev", { email, nombre, callbackUrl })
  }

  const inputSt: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    border: "1px solid #E0E0E0", borderRadius: 4,
    fontSize: 13, outline: "none", color: "#333333",
    background: "#FEFEFE", fontFamily: "inherit",
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Gotham', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Panel izquierdo — marca GHI */}
      <div style={{
        flex: 1,
        background: "#1E1E1E",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 56, position: "relative", overflow: "hidden",
      }}>
        {/* Línea roja superior */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#C0022C", zIndex: 3 }} />
        {/* Imagen máquina GHI — fondo */}
        <img
          src="/ghi-machine.png"
          alt="GHI Industrial"
          style={{
            position: "absolute",
            bottom: 0,
            right: -40,
            width: "90%",
            maxWidth: 560,
            opacity: 0.18,
            pointerEvents: "none",
            userSelect: "none",
            filter: "grayscale(30%)",
          }}
        />
        {/* Grid decorativo */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Logo GHI */}
          <img src="/logo-ghi-full.svg" alt="GHI Hornos Industriales" style={{ width: 140, height: "auto", marginBottom: 48, filter: "brightness(0) invert(1) opacity(0.9)" }} />

          {/* VERUS marca */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 4, background: "#C0022C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#FEFEFE", letterSpacing: "0.1em", textTransform: "uppercase" }}>VERUS</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Eléctrico</div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginTop: 24 }}>
            Sistema de seguimiento<br />de montaje eléctrico
          </div>

          {/* Stats decorativas */}
          <div style={{ marginTop: 56, display: "flex", gap: 32, justifyContent: "center" }}>
            {[["FAT", "Factory Acceptance Test"], ["SAT", "Site Acceptance Test"]].map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#C0022C" }}>{k}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{
        width: 460, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 56, background: "#F2F2F2",
      }}>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#333333", marginBottom: 6, letterSpacing: "0.01em" }}>
              Iniciar sesión
            </h1>
            <p style={{ fontSize: 13, color: "#959595" }}>Accede con tu cuenta GHI Hornos</p>
          </div>

          {error && (
            <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "10px 14px", borderRadius: 4, fontSize: 13, marginBottom: 20, borderLeft: "3px solid #C0022C" }}>
              Error de autenticación. Por favor, inténtalo de nuevo.
            </div>
          )}

          {/* Botón Microsoft */}
          <button onClick={handleMicrosoft} disabled={loading} style={{
            width: "100%", padding: "12px 20px",
            background: loading ? "#E0E0E0" : "#C0022C",
            color: loading ? "#959595" : "white",
            border: "none", borderRadius: 4,
            fontSize: 13, fontWeight: 700,
            cursor: loading ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            letterSpacing: "0.06em", textTransform: "uppercase",
            fontFamily: "inherit",
          }}>
            <svg width="18" height="18" viewBox="0 0 21 21" fill="white">
              <rect x="1" y="1" width="9" height="9" />
              <rect x="11" y="1" width="9" height="9" />
              <rect x="1" y="11" width="9" height="9" />
              <rect x="11" y="11" width="9" height="9" />
            </svg>
            {loading ? "Conectando…" : "Entrar con Microsoft GHI"}
          </button>

          {/* Dev login */}
          {process.env.NODE_ENV === "development" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#E0E0E0" }} />
                <span style={{ fontSize: 10, color: "#959595", letterSpacing: "0.1em", textTransform: "uppercase" }}>Acceso de desarrollo</span>
                <div style={{ flex: 1, height: 1, background: "#E0E0E0" }} />
              </div>

              <form onSubmit={handleDev} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="email" placeholder="Email @ghifurnaces.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputSt} />
                <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputSt} />
                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "10px 20px",
                  background: loading ? "#E0E0E0" : "#333333",
                  color: loading ? "#959595" : "white",
                  border: "none", borderRadius: 4,
                  fontSize: 12, fontWeight: 700,
                  cursor: loading ? "wait" : "pointer",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  fontFamily: "inherit",
                }}>
                  {loading ? "Entrando…" : "Entrar (desarrollo)"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
