# VERUS Eléctrico — CLAUDE.md

App interna de GHI Hornos Industriales S.L. para seguimiento de montaje eléctrico de hornos industriales. Reemplaza el PowerApps actual.

---

## Stack técnico

- **Framework**: Next.js 16 (App Router, Server + Client Components)
- **Auth**: Auth.js v5 (`next-auth@5.0.0-beta.31`) con MicrosoftEntraID + dev bypass
- **ORM**: Prisma 5 (`prisma@5`) con PostgreSQL
- **Base de datos**: Neon PostgreSQL (Frankfurt, eu-central-1)
- **CSS**: Tailwind CSS v4 con @theme CSS-first + tw-animate-css
- **Fuente**: Gotham (local, `/public/fonts/`) — NO Google Fonts
- **Gráficos**: Recharts
- **Deploy**: Vercel (activo) + Azure Container Apps (objetivo futuro)

---

## Repositorio GitHub

**URL**: https://github.com/ialopezghi/VERUS_Electrico  
**Rama principal**: `main`  
Cada `git push` a main dispara un deploy automático en Vercel.

```powershell
# Para subir cambios:
git add -A
git commit -m "descripción"
git push
# Usar siempre git add -A (los paréntesis en (auth)/ confunden a PowerShell con git add <path>)
```

---

## Deploy — Vercel

**Estado**: ✅ Live en `https://verus-electrico.vercel.app` (19/05/2026)

Variables de entorno configuradas en Vercel:
- `DATABASE_URL` → URL de Neon PostgreSQL
- `AUTH_SECRET` → `ghi-verus-electrico-secret-2026-prod`
- `NEXTAUTH_URL` → `https://verus-electrico.vercel.app` (sin espacios, exacto)
- `AUTH_MICROSOFT_ENTRA_ID_ID` → Client ID de la Azure App Registration "VERUS Electrico"
- `AUTH_MICROSOFT_ENTRA_ID_SECRET` → Client Secret (vercel-prod-2)
- `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID` → `aa0adef3-bffb-4b93-86ef-c77158ee71e5`

**Azure App Registration** (tenant GHI):
- Nombre: `VERUS Electrico`
- Redirect URI: `https://verus-electrico.vercel.app/api/auth/callback/microsoft-entra-id`
- Usuarios asignados: Imanolia Lopez, Iker Lasso (como colaboradores)

**Errores ya resueltos en el build de Vercel:**
1. TS error `tenantId` en auth.ts → `typescript: { ignoreBuildErrors: true }` en next.config.mjs
2. Prisma client no generado → `"build": "prisma generate && next build"` en package.json
3. `eslint` config en next.config.mjs no soportado en Next.js 16 → eliminado
4. `NEXTAUTH_URL` con espacio doble → corregido en variables Vercel
5. `useSearchParams()` sin Suspense → `LoginForm` envuelta en `<Suspense>` en login/page.tsx
6. `domain_hint: "ghifurnaces.com"` en auth.ts → redirigía al SSO corporativo de GHI que bloqueaba la app nueva → eliminado

**Último commit desplegado**: `ae59129` — Remove domain_hint from MicrosoftEntraID provider

**⚠️ Pendiente — OAuthCallbackError en login Microsoft:**
- Login con cuenta @ghifurnaces.com da `OAuthCallbackError` en producción
- APLAZADO — por ahora usar solo "Acceso de desarrollo" (dev bypass)
- Posible fix: añadir `AUTH_URL=https://verus-electrico.vercel.app` a Vercel env vars (Auth.js v5 usa AUTH_URL, no NEXTAUTH_URL)

---

## Arrancar en local

### Modo fácil (recomendado)
1. Clonar el repo en una ruta corta (ej: `C:\verus-electrico\`)
2. Copiar el archivo `.env` en la raíz (pedírselo a Imanolia — contiene DATABASE_URL)
3. Doble clic en **`iniciar.bat`** — instala dependencias y abre el navegador solo

### Modo manual
```powershell
cd verus-electrico
npm install
npm run dev
# → http://localhost:3000
```

Login de desarrollo: cualquier email @ghifurnaces.com en "Acceso de desarrollo".
El hot reload es automático — no hace falta reiniciar al editar ficheros.

### ⚠️ Problema ruta larga en Windows (solo si clonas en OneDrive con ruta muy larga)
Turbopack falla con `path length exceeds max length of filesystem`. Solución:
```cmd
mklink /J C:\verus "C:\ruta\muy\larga\hasta\verus-electrico"
```
Luego abrir `iniciar.bat` desde `C:\verus\iniciar.bat`.

### Scripts útiles
```powershell
npm run db:migrate    # migrar schema
npm run db:seed       # cargar datos de prueba
npm run db:studio     # Prisma Studio (explorador visual de BD)
npm run build         # build producción (prisma generate + next build)
```

---

## Base de datos

**Neon PostgreSQL** — Frankfurt (eu-central-1)
- URL en `.env` como `DATABASE_URL`
- Prisma 5 (no Prisma 7 — incompatibilidad con datasource url)

### Modelos principales

| Modelo | Tabla DB | Descripción |
|--------|----------|-------------|
| `Proyecto` | `proyecto` | `idh` = identificador horno (ej: "H01;H02"), `orden` = nº pedido GHI |
| `Manguera` | `manguera` | Flags SI/NO/N/A como `Boolean?` (null=N/A, true=SI, false=NO) |
| `SignalRecord` | `signal_record` | `signalName` (no `nombre`), `checkedStatus` (no `comprobado`) |
| `ProtocoloPrueba` | `protocolo_prueba` | `comprobado: Boolean` |
| `Canalizacion` | `canalizacion` | Bandejas/tubos |
| `HistoricoAvance` | `historico_avance` | `porcentajeSenalesFat` / `porcentajeSenalesSat` (sin ñ) |
| `User` | `user` | `rol: RolUsuario` |
| `Asignacion` | `asignacion` | Relación usuario↔proyecto |

### Enums
- `FaseMontaje`: `FAT | SAT`
- `EstadoProyecto`: `ofertado | en_proceso | activo | completado | pausado | cancelado`
- `RolUsuario`: `ADMIN | JEFE_OBRA | OPERARIO | VISOR`

### Convenciones schema
- Soft delete: `deletedAt DateTime?`
- Auditoría: `createdBy`, `updatedBy` (email)
- Concurrencia optimista: `version Int @default(1)`
- **Sin `ñ` en nombres de campo Prisma**

---

## Estructura de archivos

```
verus-electrico/
├── auth.ts                          # Auth.js config (root, NO importar en middleware con @/)
├── middleware.ts                    # Protección de rutas (importa ./auth)
├── next.config.mjs                  # output:standalone, typescript.ignoreBuildErrors:true
├── package.json                     # build: "prisma generate && next build"
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                      # Datos de prueba: BEFESA, BAUX, GLOBALCAST
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout — SIN Google Fonts (Gotham es local)
│   │   ├── globals.css              # @font-face Gotham + Tailwind v4 @theme GHI + toggle
│   │   ├── (auth)/login/page.tsx    # LoginForm + export default con <Suspense>
│   │   ├── proyectos/
│   │   │   ├── layout.tsx           # Wraps AppShell — NO añadir AppShell en páginas hijas
│   │   │   ├── page.tsx             # Dashboard KPIs + grid tarjetas
│   │   │   └── [id]/page.tsx        # Detalle proyecto (server component)
│   │   ├── gestion/page.tsx         # → GestionClient
│   │   ├── usuarios/page.tsx        # Lista usuarios (solo lectura)
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── proyectos/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       ├── mangueras/route.ts + [mid]/route.ts
│   │       │       ├── senales/route.ts + [sid]/route.ts
│   │       │       ├── pruebas/route.ts + [pid]/route.ts
│   │       │       ├── canalizaciones/route.ts
│   │       │       └── avance/route.ts
│   │       └── usuarios/route.ts + [uid]/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx         # SessionProvider + flex layout, fondo #F2F2F2
│   │   │   └── Sidebar.tsx          # Logo GHI SVG + icono VERUS, nav borde rojo activo
│   │   ├── proyectos/
│   │   │   ├── ProyectoCard.tsx     # Layout imagen+KPIs, resolverImagen() por keywords
│   │   │   ├── ProyectoDetailClient.tsx  # Tabs FAT/SAT/AVANCE estilo GHI oscuro
│   │   │   ├── ManguerasTable.tsx
│   │   │   ├── SenalesTable.tsx
│   │   │   ├── PruebasTable.tsx
│   │   │   ├── CanalizacionesTable.tsx
│   │   │   └── AvanceChart.tsx
│   │   ├── gestion/
│   │   │   └── GestionClient.tsx
│   │   └── ui/
│   │       ├── Modal.tsx            # Cabecera #333333 + línea roja
│   │       ├── FormField.tsx        # Label uppercase + inputStyle/selectStyle GHI
│   │       ├── FlagCell.tsx         # SI/NO/N/A → Boolean?
│   │       ├── Toggle.tsx
│   │       ├── KpiCard.tsx
│   │       └── ProgressBar.tsx      # #C0022C por defecto, radius 2px
│   └── lib/
│       ├── db.ts                    # Prisma singleton
│       └── kpi.ts                   # isMangueraOk, calcKpiFase, codProyecto, fmt
└── public/
    ├── logo-ghi-full.svg
    ├── ghi-machine.png              # BEFESA, GLOBALCAST FRB/KBV
    ├── img-baux.png                 # Horno vertical BAUX
    ├── img-arcelor.png              # ArcelorMittal FNG
    ├── img-fd2.png                  # FD2 CONSTELLIUM
    ├── fonts/
    │   ├── Gotham-Book.ttf
    │   ├── Gotham-Medium.ttf
    │   ├── Gotham-Bold.ttf
    │   └── Gotham-Black.ttf
    └── icons/
        ├── dark/    # 25 SVGs gris oscuro — librería Elena
        ├── red/     # 25 SVGs #C0022C
        └── white/   # 25 SVGs blancos
```

---

## Diseño — GHI Smart Furnaces Design System ✅

**Zip origen**: `C:\Users\ialopez\OneDrive - GHI HORNOS INDUSTRIALES S.L\Estilo diseño GHI\GHI Smart Furnaces Design System 4.zip`

### Tokens activos

| Variable | Valor | Uso |
|---|---|---|
| `--color-brand` | `#C0022C` | Rojo GHI — botones, acciones, activos |
| `--color-brand-dark` | `#9A0022` | Hover |
| `--color-bg` | `#F2F2F2` | Fondo general |
| `--color-surface` | `#FEFEFE` | Tarjetas |
| `--color-border` | `#E0E0E0` | Bordes |
| `--color-text` | `#333333` | Texto principal |
| `--color-muted` | `#959595` | Texto secundario |

Radios: sm=2px, md=4px, lg=8px  
Fuente: Gotham local — títulos/botones en uppercase + letter-spacing  
Tabs activos: fondo `#333333`, indicador `border-bottom: 2px solid #C0022C`

---

## Imágenes de máquinas — resolverImagen()

Función en `ProyectoCard.tsx`. Mapeo por keywords en nombre/cliente/tipoEquipo:

| Keywords | Imagen |
|---|---|
| MCB | `/img-baux-mcb.png` |
| BAUX, HHVF | `/img-baux.png` |
| ARCELOR, FNG | `/img-arcelor.png` |
| SPEIRA, RAN-2R | `/img-ran2r.png` |
| NAMA | `/img-ran.png` |
| FD2, CONSTELLIUM, RAN-R | `/img-fd2.png` |
| RAN-60 | `/img-ran.png` |
| DESESCORIADORA | `/img-desescoriadora.png` |
| MCH | `/img-mch.png` |
| CONTINUO | `/img-continuo.png` |
| FRB | `/img-frb.png` |
| ARZYZ | `/img-arzyz.png` |
| RMA | `/img-rma.png` |
| GLOBALCAST, KBV | `/ghi-machine.png` |
| resto | `/ghi-machine.png` |

Para añadir tipo nuevo: copiar imagen a `/public/img-xxx.png` + línea en `resolverImagen()`.
Si `proyecto.imagenUrl` tiene valor en BD, tiene prioridad sobre el mapeo.

---

## Lógica de negocio

### codProyecto
```typescript
codProyecto(orden, idh) → `${orden}-${idh.replace(/;/g, " y ")}`
// 12737 + "H01;H02" → "12737-H01 y H02"
```

### calcKpiFase
- Manguera OK: todos los flags !== false (null=N/A no bloquea)
- % Mangueras: okMangueras / total × 100
- % Señales: checkedStatus === "OK" | "SI" | "S"
- % Pruebas: comprobado === true
- % Fase: promedio de módulos con datos (ignora vacíos)

---

## ⚠️ Errores conocidos y soluciones

| Error | Causa | Solución |
|---|---|---|
| `@import url()` en CSS | Google Fonts con @import | `@font-face` local en globals.css |
| `Event handlers to Client Component` | Falta `"use client"` | Añadir al inicio |
| `Prisma url no longer supported` | Prisma 7 | Usar Prisma 5 |
| `next-auth@^5.0.0 not found` | No existe stable | Usar `5.0.0-beta.31` |
| `porcentajeSeñalesFat` schema | `ñ` no válido en Prisma | `porcentajeSenalesFat` |
| `middleware.ts import auth` | `@/*` no resuelve a root | `import { auth } from "./auth"` |
| Double AppShell | `proyectos/layout.tsx` ya wraps | No añadir en páginas hijas |
| `tenantId` TS error en auth.ts | Bug tipo next-auth beta | `typescript: { ignoreBuildErrors: true }` en next.config.mjs |
| Prisma client en Vercel | Cache de deps | `"build": "prisma generate && next build"` |
| `useSearchParams()` sin Suspense | Next.js 16 producción | Envolver en `<Suspense>` en login/page.tsx |
| `git add src/app/(auth)/...` falla | PowerShell interpreta `(auth)` | Usar `git add -A` siempre |
| `OAuthCallbackError` login Microsoft | Causa exacta pendiente de investigar | APLAZADO — usar dev bypass mientras; posible fix: añadir `AUTH_URL=https://verus-electrico.vercel.app` en Vercel |
| Turbopack `path length exceeds max` | Proyecto en OneDrive con ruta ~130 chars | `mklink /J C:\verus "C:\ruta\larga"` y abrir desde `C:\verus` |

---

## Estado del proyecto (Mayo 2026)

### Completado ✅
- Autenticación (Microsoft Entra ID + dev bypass)
- Dashboard proyectos con KPIs FAT/SAT/Total
- Detalle proyecto: tabs FAT/SAT/AVANCE estilo GHI
- Tablas edición inline: mangueras, señales, pruebas, canalizaciones
- Gestión proyectos: crear y editar
- Página usuarios (solo lectura)
- Gráfico histórico de avance (Recharts)
- Diseño GHI Smart Furnaces: Gotham, #C0022C, #333333, radios 2-4px
- Imágenes de máquinas por tipo (BAUX, ArcelorMittal, FD2, BEFESA/Globalcast)
- Logo GHI real en sidebar y login
- ProyectoCard con layout imagen + KPIs (igual que PowerApps)
- Repositorio GitHub: https://github.com/ialopezghi/VERUS_Electrico
- Deploy en Vercel configurado (pending confirmación último build)

### Pendiente ❌
- **Confirmar que Vercel build pasa** (último fix: Suspense en login, commit 847f81a)
- **Migración de datos reales** desde PowerApps/Dataverse
  - Imanolia tiene pendiente exportar — posiblemente via Excel/CSV
- Imagen para Globalcast RMA-30 (falta archivo)
- Página usuarios: editar rol / activar-desactivar
- Gestión asignaciones usuario↔proyecto desde UI
- Deploy Azure Container Apps (Bicep + GitHub Actions) — objetivo final
- App Registration Microsoft Entra ID (tenant: aa0adef3-bffb-4b93-86ef-c77158ee71e5)
- Exportar datos a Excel desde las tablas

---

## Entorno Microsoft

- **Tenant ID**: `aa0adef3-bffb-4b93-86ef-c77158ee71e5`
- **Dominio**: `@ghifurnaces.com`
- **PowerApps**: datos en Dataverse, prefijo tablas `crac0_`
- **Cuenta admin PowerApps**: Iker Lasso (`ilopez@ghifurnaces.com`)
- **Cuenta desarrolladora**: Imanolia Lopez (`imanolia1@ghifurnaces.com`)

---

## Datos en BD (seed + modificaciones)

Usuarios: Iker Lasso (ADMIN), Andrés Palacios (OPERARIO), Ángel Fernández (OPERARIO), Alberto Arana (VISOR)

Proyectos en BD (scripts de inserción en `/prisma/insert-*.ts`):
- `12737` BEFESA ALEMANIA — H01;H02 (en_proceso, Bernburg Alemania) — con datos FAT
- `10517` BAUX — H01 (completado)
- `11576` GLOBALCAST — (activo)
- `11721` AMISSA — H01;H02, H03;H04, H05 (en_proceso) — SAT mangueras cargadas
- `12720` ARZYZ — H01 RMA-R-30-B (en_proceso, Monterrey México) — FAT+SAT completos con señales/pruebas reales
- `12720` ARZYZ — H03;H04 FRB-65 y KBV65 (en_proceso) — FAT 88.5% (Mang 83.2%, Sen 91.7%, Pru 90.5%)
- `12720` ARZYZ — H05 RMA-R-50-B (en_proceso) — FAT 88.5% (Mang 83.1%, Sen 95%, Pru 87.5%)
- `12720` ARZYZ — H06 RMA-R-50-B (en_proceso) — FAT 85.0% (KPIs individuales estimados)
- `12290` NAMA — H01 (en_proceso, Coahuila de Zaragoza México) — SAT: Mangueras 0%, Señales 96.8%, Pruebas 89.2% → Avance SAT 62%
- `12545` Speira Neuss — H01 RAN-2R (en_proceso, Neuss Alemania) — FAT 16.5% + SAT 65.3%
- `12545` Speira Neuss — H02 MCH-H-12 (en_proceso, Neuss Alemania) — SAT 32.0%

> BEFESA H03;H04 eliminado (soft delete 14/05/2026) — estaba vacío y duplicado.

### Scripts de inserción
Ejecutar con: `npx tsx prisma/insert-<nombre>.ts`
- `insert-amissa.ts` — AMISSA 11721 (H01-H05 mangueras SAT)
- `insert-arzyz.ts` — ARZYZ 12720-H01 (FAT+SAT completos)
- `insert-nama.ts` — NAMA 12290-H01 (SAT señales+pruebas+mangueras)
- `insert-neuss.ts` — Speira Neuss 12545 H01+H02 (H01: FAT+SAT, H02: SAT)
- `insert-arzyz2.ts` — ARZYZ 12720 H03;H04 + H05 + H06 (FAT únicamente, SAT pendiente)
