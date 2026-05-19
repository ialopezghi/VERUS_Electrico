import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import Credentials from "next-auth/providers/credentials"

const microsoftProvider = process.env.AUTH_MICROSOFT_ENTRA_ID_ID
  ? MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
    })
  : null

const devProvider = Credentials({
  id: "dev",
  credentials: {
    email: { label: "Email", type: "email", placeholder: "admin@ghifurnaces.com" },
    nombre: { label: "Nombre", type: "text", placeholder: "Dev Admin" },
  },
  async authorize(credentials) {
    if (process.env.NODE_ENV !== "development") return null
    if (!credentials?.email) return null
    return {
      id: credentials.email as string,
      email: credentials.email as string,
      name: (credentials.nombre as string) || "Dev Admin",
    }
  },
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    ...(microsoftProvider ? [microsoftProvider] : []),
    devProvider,
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    session({ session, token }) {
      if (token.email) session.user.email = token.email
      if (token.name) session.user.name = token.name
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})
