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
- **Deploy objetivo**: Azure Container Apps + Bicep + GitHub Actions OIDC

---

## Arrancar en local

```powershell
cd "SEGUNDA PRUEBA APLICACION VERUS ELECTRICO (skill medio lasso)\verus-electrico"
npm install
# .env ya configurado con Neon
npm run dev
# → http://localhost:3000
```

Login de desarrollo: cualquier email @ghifurnaces.com en el formulario "Acceso de desarrollo".
El hot reload es automático — no hace falta reiniciar al editar ficheros.

### Scripts útiles
```powershell
npm run db:migrate    # migrar schema
npm run db:seed       # cargar datos de prueba
npm run db:studio     # Prisma Studio (explorador visual de BD)
npm run build         # build producción
```

---

## Base de datos

**Neon PostgreSQL** — Frankfurt (eu-central-1)
- URL en `.env` como `DATABASE_URL`
- Prisma 5 (no Prisma 7 — incompatibilidad con datasource url)

### Modelos principales

| Modelo | Tabla DB | Descripción |
|--------|----------|-------------|
| `Proyecto` | `proyecto` | Proyecto de montaje. `idh` = identificador horno (ej: "H01;H02"), `orden` = nº pedido GHI |
| `Manguera` | `manguera` | Flags SI/NO/N/A como `Boolean?` (null=N/A, true=SI, false=NO) |
| `SignalRecord` | `signal_record` | Señales eléctricas. Campo `signalName` (no `nombre`), `checkedStatus` (no `comprobado`) |
| `ProtocoloPrueba` | `protocolo_prueba` | Pruebas con `comprobado: Boolean` |
| `Canalizacion` | `canalizacion` | Bandejas/tubos |
| `HistoricoAvance` | `historico_avance` | KPIs por fecha. Campos: `porcentajeFat`, `porcentajeSat`, `porcentajeTotal`, `porcentajeSenalesFat` (sin ñ), `porcentajeSenalesSat` (sin ñ) |
| `User` | `user` | Usuarios con `rol: RolUsuario` |
| `Asignacion` | `asignacion` | Relación usuario↔proyecto |

### Enums
- `FaseMontaje`: `FAT | SAT`
- `EstadoProyecto`: `ofertado | en_proceso | activo | completado | pausado | cancelado`
- `RolUsuario`: `ADMIN | JEFE_OBRA | OPERARIO | VISOR`

### Convenciones schema
- Soft delete: `deletedAt DateTime?` en Proyecto, Manguera, SignalRecord, ProtocoloPrueba, Canalizacion
- Auditoría: `createdBy`, `updatedBy` (email)
- Concurrencia optimista: `version Int @default(1)`
- **Sin `ñ` en nombres de campo Prisma** — usar `Senales` en vez de `Señales`

---

## Estructura de archivos

```
verus-electrico/
├── auth.ts                          # Auth.js config (root, NO importar en middleware con @/)
├── middleware.ts                    # Protección de rutas (importa ./auth)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                      # Datos de prueba: BEFESA, BAUX, GLOBALCAST
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout — SIN Google Fonts (Gotham es local)
│   │   ├── globals.css              # @font-face Gotham + Tailwind v4 @theme GHI + toggle
│   │   ├── (auth)/login/page.tsx    # Login split-panel oscuro con imagen máquina GHI
│   │   ├── proyectos/
│   │   │   ├── layout.tsx           # Wraps en AppShell — NO añadir AppShell en páginas hijas
│   │   │   ├── page.tsx             # Dashboard KPIs + grid de tarjetas
│   │   │   └── [id]/page.tsx        # Detalle proyecto (server component)
│   │   ├── gestion/page.tsx         # Tabla gestión → renderiza GestionClient
│   │   ├── usuarios/page.tsx        # Lista usuarios (solo lectura)
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── proyectos/
│   │       │   ├── route.ts         # GET list, POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts     # GET single, PATCH update
│   │       │       ├── mangueras/route.ts + [mid]/route.ts
│   │       │       ├── senales/route.ts + [sid]/route.ts
│   │       │       ├── pruebas/route.ts + [pid]/route.ts
│   │       │       ├── canalizaciones/route.ts
│   │       │       └── avance/route.ts
│   │       └── usuarios/route.ts + [uid]/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx         # SessionProvider + flex layout, fondo #F2F2F2
│   │   │   └── Sidebar.tsx          # Logo GHI SVG real + icono VERUS, nav con borde rojo activo
│   │   ├── proyectos/
│   │   │   ├── ProyectoCard.tsx     # Layout imagen+KPIs, resolverImagen() por keywords
│   │   │   ├── ProyectoDetailClient.tsx  # Tabs FAT/SAT/AVANCE estilo GHI oscuro
│   │   │   ├── ManguerasTable.tsx   # Edición inline texto + flags + modal añadir
│   │   │   ├── SenalesTable.tsx     # Dropdown checkedStatus + modal añadir
│   │   │   ├── PruebasTable.tsx     # Toggle comprobado + barra progreso + modal añadir
│   │   │   ├── CanalizacionesTable.tsx  # Modal añadir + resumen metros
│   │   │   └── AvanceChart.tsx      # Recharts LineChart
│   │   ├── gestion/
│   │   │   └── GestionClient.tsx    # Modal nuevo/editar proyecto, estilo GHI
│   │   └── ui/
│   │       ├── Modal.tsx            # Cabecera #333333 + línea roja, Escape para cerrar
│   │       ├── FormField.tsx        # Label uppercase + inputStyle/selectStyle GHI
│   │       ├── FlagCell.tsx         # Dropdown SI/NO/N/A → Boolean?
│   │       ├── Toggle.tsx           # Toggle switch booleano
│   │       ├── KpiCard.tsx          # Tarjeta KPI estilo GHI
│   │       └── ProgressBar.tsx      # Barra #C0022C por defecto, radius 2px
│   └── lib/
│       ├── db.ts                    # Prisma singleton
│       └── kpi.ts                   # isMangueraOk, calcKpiFase, codProyecto, fmt
└── public/
    ├── logo-ghi-full.svg            # Logo GHI corporativo
    ├── ghi-machine.png              # Máquina rotativa (BEFESA, GLOBALCAST FRB/KBV)
    ├── img-baux.png                 # Horno vertical BAUX (HHVF, MCB)
    ├── img-arcelor.png              # Horno grande ArcelorMittal (FNG)
    ├── img-fd2.png                  # Laminador FD2 (CONSTELLIUM, RAN-R)
    ├── fonts/
    │   ├── Gotham-Book.ttf          # peso 400
    │   ├── Gotham-Medium.ttf        # peso 500
    │   ├── Gotham-Bold.ttf          # peso 700
    │   └── Gotham-Black.ttf         # peso 900
    └── icons/
        ├── dark/    # Iconos #414651 (gris oscuro) — librería Elena
        ├── red/     # Iconos #C0022C
        └── white/   # Iconos blancos
```

---

## Diseño — GHI Smart Furnaces Design System ✅ APLICADO

**Zip origen**: `C:\Users\ialopez\OneDrive - GHI HORNOS INDUSTRIALES S.L\Estilo diseño GHI\GHI Smart Furnaces Design System 4.zip`

### Paleta de colores (tokens activos en @theme)

| Variable CSS | Valor | Uso |
|---|---|---|
| `--color-brand` | `#C0022C` | Rojo GHI — botones primarios, acciones, indicadores activos |
| `--color-brand-dark` | `#9A0022` | Hover del rojo |
| `--color-bg` | `#F2F2F2` | Fondo general |
| `--color-surface` | `#FEFEFE` | Fondo tarjetas y superficies |
| `--color-border` | `#E0E0E0` | Bordes |
| `--color-text` | `#333333` | Texto principal (ink) |
| `--color-muted` | `#959595` | Texto secundario |
| `--color-neon` | `#4AFF92` | Acento verde (uso puntual) |
| `--color-si/si-bg/si-text` | `#22C55E / #DCFCE7 / #15803D` | Flag SI |
| `--color-no/no-bg/no-text` | `#EF4444 / #FEE2E2 / #B91C1C` | Flag NO |
| `--color-na/na-bg/na-text` | `#EAB308 / #FEF9C3 / #A16207` | Flag N/A |

### Radios y sombras

```css
--radius-sm: 2px;   --radius-md: 4px;   --radius-lg: 8px;
--shadow-1: 0 1px 2px rgba(11,11,12,0.06), 0 1px 3px rgba(11,11,12,0.08);
--shadow-brand: 0 10px 40px -10px rgba(192,2,44,0.45);
```

### Tipografía
- **Gotham** — local en `/public/fonts/`, cargada con `@font-face` en `globals.css`
- NO usar Google Fonts (`@import url()` rompe Tailwind v4 PostCSS)
- Títulos y botones: `textTransform: uppercase`, `letterSpacing: 0.06em`

### Iconos Elena
- 25 SVGs en `public/icons/dark/`, `public/icons/red/`, `public/icons/white/`
- Tamaño base: 16-18px, stroke-width: 1.67, stroke-linecap: round
- Uso: `<img src="/icons/dark/add.svg" width={16} height={16} />`
- Iconos disponibles: `add.svg`, `edit-04.svg`, `search-lg.svg`, `user-01.svg`, `calendar.svg`, `Download cloud.svg`, `speedometer-04.svg`, `folder.svg`, `flag-05.svg`, `layers-two-01.svg`...

---

## Imágenes de máquinas por proyecto

La función `resolverImagen()` en `ProyectoCard.tsx` selecciona automáticamente la imagen según palabras clave en `nombre`, `cliente` o `tipoEquipo`:

| Palabras clave | Imagen |
|---|---|
| BAUX, HHVF, MCB | `/img-baux.png` |
| ARCELOR, FNG | `/img-arcelor.png` |
| FD2, CONSTELLIUM, RAN-R | `/img-fd2.png` |
| GLOBALCAST, FRB, KBV | `/ghi-machine.png` |
| (resto / defecto) | `/ghi-machine.png` |

Para añadir una nueva: copiar imagen a `/public/img-xxx.png` y añadir línea en `resolverImagen()`.
Si un proyecto tiene `imagenUrl` en BD, esa tiene prioridad sobre el mapeo automático.

---

## Lógica de negocio

### codProyecto
```typescript
codProyecto(orden: number, idh: string) → `${orden}-${idh.replace(/;/g, " y ")}`
// Ej: orden=12737, idh="H01;H02" → "12737-H01 y H02"
```

### KPI de fase (calcKpiFase)
- **Manguera OK**: todos los flags !== false (null=N/A no bloquea)
- **% Mangueras**: okMangueras / totalMangueras × 100
- **% Señales**: checkedStatus === "OK" | "SI" | "S"
- **% Pruebas**: comprobado === true
- **% Fase**: promedio de los módulos que tienen datos (ignora módulos vacíos)

### FAT vs SAT
- Cada manguera/señal/prueba/canalización tiene `fase: FaseMontaje` (FAT|SAT)
- Las tablas filtran por fase al renderizar
- El detalle de proyecto incluye todos y filtra en cliente

---

## ⚠️ Errores conocidos y soluciones

| Error | Causa | Solución |
|---|---|---|
| `@import url() must precede all rules` | Google Fonts con @import en globals.css | Usar `@font-face` local en globals.css |
| `Event handlers cannot be passed to Client Component` | Falta `"use client"` en componente con onClick/onMouseEnter | Añadir `"use client"` al inicio |
| `Prisma url no longer supported` | Prisma 7 cambió API | Usar Prisma 5 (instalado) |
| `next-auth@^5.0.0 not found` | No existe como release estable | Usar `5.0.0-beta.31` |
| `porcentajeSeñalesFat` schema error | `ñ` no válido en Prisma | Usar `porcentajeSenalesFat` (sin ñ) |
| `middleware.ts import auth` | `@/*` no resuelve a root | Usar `import { auth } from "./auth"` |
| Double AppShell | `proyectos/layout.tsx` ya wraps AppShell | No añadir AppShell en `proyectos/page.tsx` ni `[id]/page.tsx` |
| `tenantId` TS error en auth.ts | Bug tipo en next-auth beta | No bloquea ejecución, ignorar |

---

## Estado del proyecto (Mayo 2026)

### Completado ✅
- Autenticación (Microsoft Entra ID + dev bypass)
- Dashboard proyectos con KPIs FAT/SAT/Total
- Detalle proyecto: tabs FAT/SAT/AVANCE estilo GHI
- Tablas con edición inline: mangueras (flags + texto), señales (status), pruebas (toggle)
- Formularios añadir fila: mangueras, señales, pruebas, canalizaciones
- Gestión proyectos: crear y editar proyecto
- Página usuarios (solo lectura)
- Gráfico histórico de avance (Recharts)
- Seed con datos de prueba (BEFESA, BAUX, GLOBALCAST)
- **Diseño GHI Smart Furnaces aplicado**: Gotham, #C0022C, #333333, radios 2-4px
- **Imágenes de máquinas por tipo**: BAUX, ArcelorMittal, FD2, BEFESA/GLOBALCAST
- Logo GHI real en sidebar y login
- ProyectoCard con layout imagen + KPIs (igual que PowerApps)

### Pendiente ❌
- **Migración de datos reales** desde PowerApps/Dataverse
  - Imanolia tiene pendiente exportar — posiblemente via Excel/CSV
  - Error 403 con cuenta imanolia1@ghifurnaces.com en Dataverse directo
- Imagen por proyecto para tipo RMA (Globalcast RMA-30) — falta archivo
- Imagen por proyecto para BEFESA (si difiere de ghi-machine.png)
- Página usuarios: editar rol / activar-desactivar (actualmente "contactar con IT")
- Gestión asignaciones usuario↔proyecto desde UI
- Deploy en Azure Container Apps (Bicep + GitHub Actions)
- App Registration en Microsoft Entra ID para login real (tenant: aa0adef3-bffb-4b93-86ef-c77158ee71e5)
- Exportar datos a Excel desde las tablas

---

## Entorno Microsoft

- **Tenant ID**: `aa0adef3-bffb-4b93-86ef-c77158ee71e5`
- **Dominio**: `@ghifurnaces.com`
- **PowerApps**: datos en Dataverse, prefijo tablas `crac0_`
- **Cuenta admin PowerApps**: Iker Lasso (`ilopez@ghifurnaces.com`)
- **Cuenta desarrolladora**: Imanolia Lopez (`imanolia1@ghifurnaces.com`)

---

## Datos de prueba (seed)

Usuarios: Iker Lasso (ADMIN), Andrés Palacios (OPERARIO), Ángel Fernández (OPERARIO), Alberto Arana (VISOR)

Proyectos activos en BD:
- `12737` BEFESA ALEMANIA — H01;H02 (en_proceso, Bernburg Alemania) — con datos FAT
- `10517` BAUX — H01 (completado)
- `11576` GLOBALCAST — (activo)

> Nota: BEFESA H03;H04 fue eliminado (soft delete) el 14/05/2026 por estar vacío y duplicado.
