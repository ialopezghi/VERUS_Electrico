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

**Estado**: ✅ Live en `https://verus-electrico.vercel.app`

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
6. `domain_hint: "ghifurnaces.com"` en auth.ts → redirigía al SSO corporativo de GHI → eliminado
7. Turbopack parse error en GestionClient `if...else` sin llaves → añadir `{ }` siempre

**⚠️ Pendiente — OAuthCallbackError en login Microsoft:**
- Login con cuenta @ghifurnaces.com da `OAuthCallbackError` en producción
- APLAZADO — por ahora usar solo "Acceso de desarrollo" (dev bypass)
- Posible fix: añadir `AUTH_URL=https://verus-electrico.vercel.app` a Vercel env vars

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
| `Proyecto` | `proyecto` | `idh` = identificador horno (ej: "H01;H02"), `orden` = nº pedido GHI, `faseActual: FaseMontaje?` |
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
- `RolUsuario`: `ADMIN | JEFE_OBRA | OPERARIO | VISOR | SUPERVISOR`

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
│   ├── seed.ts                      # Datos de prueba iniciales
│   ├── insert-users.ts              # 46 usuarios con asignaciones (npx tsx prisma/insert-users.ts)
│   ├── insert-amissa.ts             # AMISSA 11721
│   ├── insert-amissa2.ts            # AMISSA 14336
│   ├── insert-arzyz.ts              # ARZYZ 12720-H01
│   ├── insert-arzyz2.ts             # ARZYZ 12720 H03-H06
│   ├── insert-befesa2.ts            # BEFESA 12737 H03;H04
│   ├── insert-nama.ts               # NAMA 12290
│   ├── insert-neuss.ts              # Speira Neuss 12545
│   ├── insert-completados.ts        # BAUX+ArcelorMittal+FD2 completados
│   ├── insert-audubon.ts            # Audubon
│   ├── insert-jupiter.ts            # Jupiter 11202
│   ├── insert-holmestrand.ts        # Holmestrand 11576
│   ├── insert-globalcast-rma.ts     # Globalcast RMA 11559-H03
│   └── insert-globalcast-h0102.ts   # Globalcast FRB/KBV 11559-H01;H02
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout — SIN Google Fonts (Gotham es local)
│   │   ├── globals.css              # @font-face Gotham + Tailwind v4 @theme GHI + toggle
│   │   ├── (auth)/login/page.tsx    # LoginForm + export default con <Suspense>
│   │   ├── proyectos/
│   │   │   ├── layout.tsx           # Wraps AppShell — NO añadir AppShell en páginas hijas
│   │   │   ├── page.tsx             # Dashboard KPIs + ProyectosClient
│   │   │   └── [id]/page.tsx        # Detalle proyecto (server component)
│   │   ├── gestion/page.tsx         # → GestionClient
│   │   ├── usuarios/page.tsx        # Fetch usuarios+proyectos → UsuariosClient
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
│   │       └── usuarios/
│   │           ├── route.ts         # GET lista usuarios
│   │           └── [uid]/route.ts   # GET/PATCH usuario + sync asignaciones[]
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx         # SessionProvider + flex layout, fondo #F2F2F2
│   │   │   └── Sidebar.tsx          # Logo GHI SVG + icono VERUS, nav borde rojo activo
│   │   ├── proyectos/
│   │   │   ├── ProyectosClient.tsx  # Vista tarjetas/tabla, filtros estado, dropdown orden
│   │   │   ├── ProyectoCard.tsx     # Layout imagen+KPIs, resolverImagen() por keywords
│   │   │   ├── ProyectoDetailClient.tsx  # Tabs FAT/SAT/AVANCE estilo GHI oscuro
│   │   │   ├── ManguerasTable.tsx
│   │   │   ├── SenalesTable.tsx
│   │   │   ├── PruebasTable.tsx
│   │   │   ├── CanalizacionesTable.tsx
│   │   │   └── AvanceChart.tsx      # Sub-tabs FAT/SAT/TOTAL, tabla+gráfico stepAfter
│   │   ├── gestion/
│   │   │   └── GestionClient.tsx    # Lista inline de proyectos, edición fase/estado/fechas
│   │   ├── usuarios/
│   │   │   └── UsuariosClient.tsx   # Tabla usuarios, toggle activo, modal asignaciones
│   │   └── ui/
│   │       ├── Modal.tsx            # Requiere prop open={boolean} — sin él no renderiza
│   │       ├── FormField.tsx        # Label uppercase + inputStyle/selectStyle GHI
│   │       ├── FlagCell.tsx         # SI/NO/N/A → Boolean?
│   │       ├── ColSelector.tsx      # Selector de columnas visibles (tabla proyectos)
│   │       ├── Toggle.tsx
│   │       ├── KpiCard.tsx
│   │       └── ProgressBar.tsx      # #C0022C por defecto, radius 2px
│   └── lib/
│       ├── db.ts                    # Prisma singleton
│       └── kpi.ts                   # isMangueraOk, calcKpiFase, codProyecto, fmt
└── public/
    ├── logo-ghi-full.svg
    ├── ghi-machine.png              # BEFESA, GLOBALCAST FRB/KBV, genérico
    ├── img-baux.png                 # Horno vertical BAUX HHVF
    ├── img-baux-mcb.png             # BAUX MCB
    ├── img-arcelor.png              # ArcelorMittal FNG
    ├── img-fd2.png                  # FD2 CONSTELLIUM RAN-R
    ├── img-ran.png                  # RAN-60, NAMA
    ├── img-frb.png                  # FRB genérico
    ├── img-rma.png                  # RMA
    ├── img-mch.png                  # MCH
    ├── img-continuo.png             # Horno continuo
    ├── img-desescoriadora.png       # Desescoriadora
    ├── img-arzyz.png                # ARZYZ
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

### AvanceChart — series por pestaña
| Pestaña | Series (nombre exacto) | Colores |
|---|---|---|
| FAT | AvanceFAT, ManguerasFAT, SeñalesFAT, PruebasFAT | #3B82F6, #1E3A8A, #EA580C, #7C3AED |
| SAT | AvanceSAT, ManguerasPEM, ManguerasPF, SeñalesSAT, PruebasSAT | #3B82F6, #1E3A8A, #EA580C, #7C3AED, #DB2777 |
| TOTAL | AvanceFAT, AvanceSAT, AvanceTOTAL | #3B82F6, #1E3A8A, #EA580C |

### PATCH /api/usuarios/[uid]
Acepta: `nombre`, `puesto`, `rol`, `activo`, `numeroEmpleado`, `asignaciones: string[]`  
Si se pasa `asignaciones`, hace deleteMany + createMany (reemplaza todas las asignaciones del usuario).

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
| `OAuthCallbackError` login Microsoft | Causa pendiente | APLAZADO — dev bypass; posible fix: `AUTH_URL=https://verus-electrico.vercel.app` |
| Turbopack `path length exceeds max` | OneDrive ruta ~130 chars | `mklink /J C:\verus "C:\ruta\larga"` |
| Turbopack parse error `if...else` | Turbopack requiere llaves siempre | `if (x) { ... } else { ... }` con `{}` obligatorio |
| Modal no renderiza | Falta prop `open={true}` | `<Modal open={true} ...>` — sin `open` devuelve null |
| `Invalid value for argument rol: SUPERVISOR` | Prisma client compilado sin SUPERVISOR | Usar `$executeRaw` en scripts de seed; en API funciona porque el JS fue regenerado por `prisma db push` |
| `EPERM rename query_engine-windows.dll` | Dev server bloquea el DLL | Parar dev server antes de `prisma generate` |

---

## Estado del proyecto (20/05/2026)

### Completado ✅
- Autenticación (Microsoft Entra ID + dev bypass)
- Dashboard proyectos con KPIs FAT/SAT/Total — vista tarjetas y tabla
- Filtros por estado (Todos/Finalizado/En proceso/Activo) + dropdown por cliente
- Detalle proyecto: tabs FAT/SAT/AVANCE estilo GHI
- Tablas edición inline: mangueras, señales, pruebas, canalizaciones
- Gestión proyectos: lista inline editable (fase, estado, fechas, pausar)
- Página usuarios: búsqueda, toggle activo inline, modal asignaciones proyectos + edición
- Gráfico histórico de avance — sub-tabs FAT/SAT/TOTAL, series con nombres PowerApps
- Diseño GHI Smart Furnaces: Gotham, #C0022C, #333333, radios 2-4px
- Imágenes de máquinas por tipo (13 tipos cubiertos)
- 46 usuarios cargados con roles y asignaciones a proyectos
- 25 proyectos activos en BD coincidiendo con PowerApps

### Pendiente / Próximas mejoras ❌
1. **Vista personalizada por usuario** — operarios ven solo sus proyectos asignados (filtrar por session userId si rol OPERARIO/VISOR)
2. **Diseño responsive móvil/tablet** — técnicos en campo
3. **Exportar a Excel** — botón por tabla (mangueras/señales/pruebas), librería `xlsx`
4. **Login Microsoft en producción** — OAuthCallbackError pendiente de resolver
5. **Deploy Azure Container Apps** — objetivo final (Bicep + GitHub Actions)
6. **Migración datos reales** desde PowerApps/Dataverse (pendiente exportación por Imanolia)

---

## Entorno Microsoft

- **Tenant ID**: `aa0adef3-bffb-4b93-86ef-c77158ee71e5`
- **Dominio**: `@ghifurnaces.com`
- **PowerApps**: datos en Dataverse, prefijo tablas `crac0_`
- **Cuenta admin PowerApps**: Iker Lasso (`ilasso@ghifurnaces.com`)
- **Cuenta desarrolladora**: Imanolia Lopez (`imanolia1@ghifurnaces.com`)

---

## Datos en BD

### Usuarios (46 total) — `insert-users.ts`
Roles: ADMIN (Iker Lasso, Alejandro Varela, Ander Galidez, Jon Rioja, Raul Villasante, Unai Pazos, Ignacio Zabala), SUPERVISOR (David Ballen, David Gomez, Eider Gonzalez, Iker Camin, Saul Benito, Wilson Delgado), VISOR (Alberto Arana, Arkaitz Astoreca, Cristina Rementeria), resto OPERARIO.

### Proyectos (25 activos) — scripts en `/prisma/insert-*.ts`

| Orden | IDH | Cliente | Estado | Fase | Notas |
|---|---|---|---|---|---|
| 10517 | H01 | BAUX | completado | — | HHVF-G-TR-18 |
| 10517 | H02 | BAUX | completado | — | MCB-D-25-D |
| 11202 | H01 | Jupiter | en_proceso | FAT | RAN-60 |
| 11202 | H02 | Jupiter | en_proceso | FAT | RMA-R-30-B |
| 11559 | H01;H02 | Globalcast | activo | FAT | FRB30 y KBV30, Aguascalientes México |
| 11559 | H03 | Globalcast | activo | SAT | RMA-30, Aguascalientes México |
| 11576 | H01 | Holmestrand | activo | SAT | — |
| 11576 | H05 | Holmestrand | en_proceso | FAT | — |
| 11576 | H06 | Holmestrand | en_proceso | FAT | — |
| 11721 | H01;H02 | AMISSA | en_proceso | SAT | Ramos Arizpe México |
| 11721 | H03;H04 | AMISSA | en_proceso | SAT | Ramos Arizpe México |
| 11721 | H05 | AMISSA | en_proceso | SAT | Ramos Arizpe México |
| 11866 | H01 | ArcelorMittal | completado | — | FNG-200 |
| 12290 | H01 | NAMA | en_proceso | SAT | SAT: Mang 0%, Sen 96.8%, Pru 89.2% |
| 12545 | H01 | Speira Neuss | en_proceso | SAT | RAN-2R, FAT 16.5% + SAT 65.3% |
| 12545 | H02 | Speira Neuss | en_proceso | SAT | MCH-H-12, SAT 32.0% |
| 12720 | H01 | ARZYZ | en_proceso | SAT | RMA-R-30-B, Monterrey — FAT+SAT completos |
| 12720 | H03;H04 | ARZYZ | en_proceso | FAT | FRB-65 y KBV65, FAT 88.5% |
| 12720 | H05 | ARZYZ | en_proceso | FAT | RMA-R-50-B, FAT 88.5% |
| 12720 | H06 | ARZYZ | en_proceso | FAT | RMA-R-50-B, FAT 85.0% |
| 12737 | H01;H02 | BEFESA | en_proceso | FAT | FRB-40/KBV-40, Bernburg Alemania |
| 12737 | H03;H04 | BEFESA | en_proceso | SAT | FRB-40/KBV-40, FAT 83.3% + SAT 15.9% |
| 13420 | H01 | FD2 CONSTELLIUM | completado | — | RAN-R-70 |
| 14336 | H01 | AMISSA | en_proceso | FAT | RMA-R-30-B TURQUISA, FAT 23.2% |
| — | — | Audubon | en_proceso | FAT | — |

### Scripts de inserción
Ejecutar con: `npx tsx prisma/insert-<nombre>.ts`
- `insert-users.ts` — 46 usuarios con asignaciones (usa `$executeRaw` para SUPERVISOR)
- `insert-completados.ts` — BAUX H01/H02, ArcelorMittal, FD2 (completados)
- `insert-amissa.ts` — AMISSA 11721 H01-H05
- `insert-amissa2.ts` — AMISSA 14336-H01 TURQUISA
- `insert-arzyz.ts` — ARZYZ 12720-H01
- `insert-arzyz2.ts` — ARZYZ 12720 H03;H04 + H05 + H06
- `insert-befesa2.ts` — BEFESA 12737 H03;H04
- `insert-nama.ts` — NAMA 12290-H01
- `insert-neuss.ts` — Speira Neuss 12545 H01+H02
- `insert-jupiter.ts` — Jupiter 11202 H01+H02
- `insert-holmestrand.ts` — Holmestrand 11576
- `insert-globalcast-rma.ts` — Globalcast 11559-H03 RMA
- `insert-globalcast-h0102.ts` — Globalcast 11559-H01;H02 FRB/KBV
- `insert-audubon.ts` — Audubon
