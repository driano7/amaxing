# Amaxing

Plataforma digital de turismo premium en México. Experiencias seleccionadas, guías de viaje, mapas interactivos, noticias de turismo generadas con IA y reservas, en inglés y español.

## Stack

- **Next.js 12** (Pages Router) + **React 17** + **TypeScript**
- **Tailwind CSS 3** + **Framer Motion**
- **Supabase** (autenticación, reservas, analytics, notas de noticias)
- **Stripe** (checkout con tarjeta en modo prueba)
- **Cripto**: Ethereum / Base / Lightning Network (verificación on-chain)
- **mdx-bundler** (blog, guides, maps y local picks con contenido MDX)
- **OpenRouter API** + **NewsAPI** + **FRED** (generación automática de noticias y local picks)
- **qrcode.react** (QRs minimalistas de reservas y clientes)
- **@zxing/browser** + **BarcodeDetector API** (lector de QRs)
- **Recharts 2** (gráficas animadas en dashboard)
- **Web Crypto API** (cifrado AES-256-GCM client-side)
- **Node.js crypto** (cifrado PBKDF2 + AES-256-GCM server-side)

## Scripts

```bash
npm run dev              # servidor de desarrollo
npm run build            # build de producción
npm start                # next-remote-watch (contenido de data/)
npm run serve            # next start
npm run lint             # next lint
npm run news:generate    # genera las noticias del mes (usa OpenRouter)
npm run local:generate   # genera local picks del mes (usa OpenRouter, descarga fotos a public/static/images/local-picks)
npm run guides:sync      # (opcional) sincroniza guides si se usa CMS externo
```

## Estructura

```
pages/
├── api/                 # API routes (bookings, encryption, stripe, admin, tours…)
├── guides/              # 5 Journeys de Cultura Fácil (self-guided)
│   ├── index.js         # Vista split-scroll con InteractiveGuidesSplitScroll
│   └── [slug].js        # Detalle MDX bilingüe con alternateSlug + switch idioma
├── maps/                # Guía Interactiva CDMX 2026 (5 mapas curados)
│   ├── index.js         # Vista split-scroll con CDMXInteractiveExperience
│   └── [slug].js        # Detalle MDX bilingüe por mapa
├── local/               # Local Picks (guía mensual curada por chilangos)
│   ├── index.js         # Lista con filtros por idioma + 3 picks destacadas
│   └── [slug].js        # Detalle MDX con imagen local y switch idioma
├── journeys/            # Caminatas (lista de experiencias curadas)
├── tours/[slug].js      # Detalle tour (multidioma)
├── profile.tsx          # Dashboard usuario: tabs, deep-link ?tab=, QR personal
├── admin.tsx            # Panel socio/admin: usuarios, métricas ML, analítica pasiva, lector QR
├── empleados.tsx        # Portal empleado: agenda del día + lector QR
├── about.js             # Quiénes Somos: CardStack (10s), contact cards con ScrollReveal, Background con partículas
├── checkout.jsx         # Pago tarjeta (Stripe) o cripto
components/
├── InteractiveGuidesSplitScroll.jsx  # 2 columnas desktop: cards izquierda + foto sticky derecha (h-[calc(100vh-140px)]), dock bottom-4, i18n via useLanguage/useRouter, solo activo para carga rápida
├── CDMXInteractiveExperience.jsx     # 2 columnas desktop: cards izquierda + iframe My Maps sticky derecha, i18n es/en, ver más → /maps/[slug], solo activo
├── PhoneWalletShowcase.tsx           # Hero iPhone con wallet mock, 5 pantallas periféricas (movidas 25% izq), Dynamic Island Secure 25% der, descripción h-[80%] en dark
├── charts/              # SequentialBarChart, SequentialLineChart, SequentialRadialBarChart (Recharts 2.12, fast-equals shim)
├── analytics/           # SocioPanels: métricas avanzadas + analítica pasiva (solo socios)
├── tickets/             # VirtualTicket (dark mode) con QR minimalista AMX-T-
├── QrScanner.tsx        # Lector: cámara (BarcodeDetector/zxing) + código manual
├── CryptoPayment.tsx    # Modal cripto: QR por red + verificación on-chain polling
├── SiteCookie.jsx       # Cookie amaxing_visited (30d) + localStorage + prefetch de imágenes críticas para retorno rápido
├── GdprBanner.tsx       # Banner privacidad i18n en home → /profile?tab=security
├── Particles.tsx        # Canvas partículas 200, accentRatio 0.25, color #DE1D8D, resolvedTheme aware, z-0
├── Background.jsx       # fixed inset-0 z-0 con Particles, fuera de SectionContainer para visibilidad en ambos temas
├── LayoutWrapper.js     # SectionContainer + Background + SiteCookie + Navbar + MobileDock + HubMenu
├── ErrorBoundary.tsx    # Aísla errores por tab (evita romper la navegación)
data/
├── selfGuidesData.js    # SELF_GUIDES_DATA (5 journeys: Condesa, Centro, Chapultepec II, Chimalistac, UNAM) bilingüe + GUIDES_PAGE_HEADER es/en
├── cdmxMapsData.js      # CDMX_MAPS_DATA (5 mapas: comida, precaución, vida nocturna, joyas, top) bilingüe + CDMX_PAGE_HEADER es/en
├── guides/              # MDX bilingües por journey (9 archivos máx, 5× es + 4× en, cada 3 meses se podan)
├── maps/                # MDX bilingües por mapa (5 mapas × es/en, con embedUrl My Maps y highlights)
├── local-picks/         # MDX bilingües generados (máx 9, cada pick → /static/images/local-picks/${month}-${idx}.jpg descargada vía OpenRouter)
├── toursData.js         # 12 tours con imágenes locales /static/images/*
lib/
├── localPicks/          # generator.js (OpenRouter → MDX + downloadImage a public/static/images/local-picks) + sync
├── mdx.js               # bundleMDX con remark/rehype (TOC, gfm, math, prism)
├── localPicks.js        # getAllLocalPicks (hyphen/dot aware, slug sin locale), getLocalPickBySlug (hyphen+dot candidates)
├── encryption.ts        # Client-side AES-GCM
├── server-encryption.ts # Server-side PBKDF2 + AES-GCM
├── userData.ts          # Perfil, favoritos, reservas (cifrados)
├── roles.ts             # Roles por env: ADMIN_EMAILS > EMPLOYEE_EMAILS > cliente
├── qr/                  # types (AMX-T-/AMX-C-) + resolve (localStorage + mocks demo)
├── crypto/              # addresses (wallets negocio) + verify (Etherscan/Basescan/LN)
├── analytics/           # track (tracking pasivo) + ml-metrics (segmentación, proyección, anomalías)
└── mocks/socioData      # Datos demo para previsualizar paneles sin datos reales
public/static/images/
├── guides/              # condesa.jpg, centro.jpg, chapultepec.jpg, chimalistac.jpg, unam.jpg (local, cacheable)
├── local-picks/         # ${month}-${idx}.jpg por pick (descargadas al generar, ex: 2026-09-09.jpg) + guide.jpg
└── tours / cochinita.jpg, mole.jpeg etc (local)
```

## Roles y acceso (estilo Criptec)

Los roles se resuelven por variables de entorno con efecto inmediato:

```env
ADMIN_EMAILS=socio1@amaxing.com,socio2@amaxing.com   # socios (acceso total)
EMPLOYEE_EMAILS=guia@amaxing.com                     # empleados
```

| Vista                                                | Cliente | Empleado | Socio (admin)     |
| ---------------------------------------------------- | ------- | -------- | ----------------- |
| Perfil + dashboard + QR personal                     | ✅      | ✅       | ✅                |
| Portal empleados (`/empleados`)                      | ❌      | ✅       | ✅                |
| Panel admin (`/admin`): gestión usuarios, descifrado | ❌      | ❌       | ✅                |
| **Métricas avanzadas ML** 🔒                         | ❌      | ❌       | ✅                |
| **Analítica pasiva** 🔒                              | ❌      | ❌       | ✅                |
| Exportación / borrado GDPR                           | propios | ❌       | cualquier cliente |
| Guides / Maps / Local (lectura)                      | ✅      | ✅       | ✅                |

Empleados solo ven datos operativos (iniciales de cliente); los sensibles permanecen cifrados. Cada acceso/descifrado queda auditado (`access_audit_logs`, ver `supabase-roles.sql`).

## Sistema de QRs

Dos tipos de código minimalista (el QR solo contiene el string corto):

- `AMX-T-{CÓDIGO}` — reserva/ticket (ej. `AMX-T-7K9M2X`)
- `AMX-C-{CÓDIGO}` — cliente (ej. `AMX-C-D4R1A`)

- Los clientes muestran su QR en **Mi perfil** para el check-in.
- Empleados y socios tienen **lector QR** (cámara o manual) que identifica automáticamente si es reserva o cliente.
- Compatibilidad: los QRs legacy JSON se siguen resolviendo.
- Sin datos reales, el lector resuelve códigos demo (`7K9M2X`, `B4J1R`, `T9W5Q`; clientes `D4R1A`, `ANA01`, `MARIA`, `DEMO`).
- El cuerpo de los QRs es independiente del idioma del sitio (español).

## Métricas para socios (adaptadas de Xoco-POS)

Visibles solo con rol admin en `/admin`. Modelos heurísticos (sin librerías ML externas):

- **Segmentación de clientes**: Viajero frecuente / Explorador regular / Aventurero ocasional (clustering por umbrales sobre frecuencia y gasto)
- **Proyección de ingresos** a 7/14/30 días (línea base últimos 30 días)
- **Demanda por tour** con tendencia ↑↓ y revenue
- **Mejores horarios** (top 5 slots día+hora)
- **Anomalías** z-score (demanda inusualmente alta/baja)
- **Ticket promedio**, clientes activos, ingresos totales

Sin datos reales muestra un dataset mock etiquetado «Datos demo».

## Analítica pasiva 🔒

Tracking automático de visitas (sin cookies de terceros): sesiones, usuarios únicos, tiempo en página, rutas más visitadas, dispositivos/navegadores/OS (parseo de user-agent) y flujo de navegación entre páginas. **SiteCookie** añade `amaxing_visited` (30d, SameSite=Lax) + `localStorage amaxing_cache_v1` y prefetch de imágenes críticas (`/static/images/guides/condesa.jpg` etc.) para retorno rápido en todo el sitio.

## Guía Interactiva CDMX (`/maps`) y Journeys de Cultura Fácil (`/guides`)

Ambas vistas comparten la UI **split-scroll** (inspirada en AllVoices: 2 columnas desktop, sticky derecha, scroll natural izquierda, IntersectionObserver `-35%`, transición de opacidad):

- **Izquierda**: cards con `badge` (barrio/acento), `H2`, `duración`, `resumen`, `lista de datos curiosos` (`✓` con `accentColor`) y botón `Ver Journey Completo / Explore Journey` → `/guides/[slug]` o `Ver más / See more` → `/maps/[slug]`.
- **Derecha**: contenedor `sticky top-24 h-[calc(100vh-140px)] min-h-[560px] max-h-[820px] rounded-3xl` que muestra **solo el activo** (1 iframe My Maps o 1 `next/image` local) para carga rápida — antes 5 simultáneos parecían rotos/lentos.
- **Header**: `CDMX_PAGE_HEADER` / `GUIDES_PAGE_HEADER` bilingüe (`es`/`en`) vía `useLanguage` (`currentLanguage`) + `useRouter().locale`, cambia al pulsar el botón de idioma del header.
- **Datos**: `data/cdmxMapsData.js` (5 mapas: comida tradicional, zonas precaución, vida nocturna, joyas, top) y `data/selfGuidesData.js` (5 journeys: Condesa, Centro, Chapultepec II, Chimalistac, UNAM) con `title_es/_en`, `summary_es/_en`, `slug_es/_en`, `image` local, `accentColor`, `dockIcon`.

Detalle: `data/guides/*.mdx` y `data/maps/*.mdx` bilingües (`slug`, `alternateSlug`, `lang`, `image` local) renderizados con `mdx-bundler` en `pages/guides/[slug].js` y `pages/maps/[slug].js` (`prose dark:prose-invert max-w-3xl mx-auto`) y botón flotante para alternar idioma.

Límite: máx. **9 MDX en `data/guides`** (5 journeys → 9 archivos: 5× es + 4× en, cada 3 meses se podan los más antiguos).

## Local Picks (`/local`)

Guía mensual curada por chilangos para visitantes 2–7 días. Generador `lib/localPicks/generator.js` usa **OpenRouter** (modelo `nvidia/nemotron-3-super-120b-a12b:free` con fallback Gemini/Groq) para escribir 8 picks bilingües, y **descarga cada foto a `public/static/images/local-picks/${month}-${idx}.jpg`** (como `/journeys` con `/static/images/*` local) para evitar retardo de Unsplash y permitir cache. Frontmatter `images: ['/static/images/local-picks/...']` (local, no Unsplash remoto).

- Vista lista: `pages/local/index.js` (`getServerSideProps` ahora `getStaticProps` para `Leer más` instantáneo) muestra cards con `Image` local (Unsplash cacheado) y `Link` a `/local/[slug]`.
- Vista detalle: `pages/local/[slug].js` (`getStaticPaths` con `getAllLocalPickSlugs`, `getStaticProps` con `getLocalPickBySlug` hyphen/dot aware) renderiza MDX con `PostLayout`.
- Límite: cada 3 meses se borran los más antiguos, máx. 9 en total (actualmente 3 picks → 6 MDX: `2026-09-09/10/11-es/en`).
- Header: `data/hubMenuLinks.js` incluye `/local` en el orden `/journeys → /maps → /guides → /local → /about` y dropdown `headerDropdownConfig` con 3 picks destacadas.

## Pagos con cripto

En `/checkout` se elige **Tarjeta (Stripe)** o **Cripto**:

- Redes: **Ethereum/EVM**, **Base** y **Lightning Network**
- Modal con QR de la wallet del negocio + copiar dirección
- El cliente pega su hash/wallet/factura LN; el sistema valida formato (`0x…`, `.eth`, `lnbc…`)
- Verificación on-chain con polling cada 5 s: `WAITING → DETECTED → CONFIRMED`
  - EVM vía Etherscan/Basescan · Lightning vía API Wallet-of-Satoshi-compatible
- Al confirmar se crean las reservas con badge «₿ Pagado con cripto» en el ticket

Variables (ver `.env.example`):

```env
NEXT_PUBLIC_CRYPTO_WALLET_EVM=0x…
NEXT_PUBLIC_CRYPTO_WALLET_LIGHTNING=nombre@walletofsatoshi.com
NEXT_PUBLIC_CHAIN_MODE=TESTNET            # o MAINNET
NEXT_PUBLIC_ETHERSCAN_API_KEY=
NEXT_PUBLIC_BASESCAN_API_KEY=
NEXT_PUBLIC_LN_API_URL_MAINNET=
NEXT_PUBLIC_LN_API_KEY_MAINNET=
```

Sin claves configuradas funciona en modo demo (confirmación manual en Lightning).

## Cifrado y GDPR

### Cliente (`lib/encryption.ts`)

Web Crypto API, AES-GCM con clave derivada del userId. Cifra campos sensibles del perfil.

### Servidor (`lib/server-encryption.ts`)

PBKDF2 (100k iter, SHA-256) + AES-256-GCM derivado del email. Compatible con XocoCafe.

### Derechos del usuario

- Banner de privacidad en home (i18n) → acceso directo a Seguridad y datos
- Exportar datos (JSON plano o cifrado AES), eliminar todo permanentemente
- Cambio de contraseña desde el perfil

## Dashboard de Usuario (`/profile`)

Tabs con deep-linking (`?tab=dashboard`, `?tab=security`, …): Dashboard, Mis reservas, Favoritos, Comentados, Mi perfil (con QR personal), Seguridad y datos.

- Gráficas `components/charts/AnimatedCharts.tsx` (Recharts 2.12, `animationEasing="ease-out"`, `isStepper` fix) con `SequentialChartDataRenderer` y `EmptyChart`.

## Carrito, checkout y Stripe

- **Carrito** (`/cart`): hasta `maxGuests` personas por tour, fecha/hora, totales USD/MXN según idioma.
- **Checkout**: vista flip de tarjeta + redirección a Stripe Checkout (test). Alternativa: pago cripto.
- APIs: `POST /api/stripe/checkout`, `POST /api/stripe/confirm`, `POST /api/stripe/webhook`.
- Tarjeta de prueba: `4242 4242 4242 4242`.

## iPhone Showcase (`/`) y Partículas

- `components/PhoneWalletShowcase.tsx`: hero con iPhone central y 5 pantallas periféricas (todas movidas 25% a la izquierda: `-96→-120/-260→-325` etc., `DynamicIsland` `left-[10%]→left-[35%]` 25% a la derecha), descripción `h-[80%]` recortada 20% en dark, `gap-8 pb-20 pt-12` (antes `gap-10 pb-24`), fondos oscuros `dark:from-black dark:via-zinc-900` y textos `dark:text-white/70` corregidos (antes `dark:text-zinc-900` invisible).
- `components/Particles.tsx`: canvas 200 partículas, `accentRatio 0.25`, `accentColor #DE1D8D`, `resolvedTheme` aware, `alpha` aumentado para visibilidad, `Background.jsx` `fixed inset-0 z-0` fuera de `SectionContainer` + `SiteCookie` prefetch; visible en `/` y `/about` (about con `Background` en `getLayout` y secciones `rgba(...0.82) backdrop-blur`).

## Variables de entorno

Consulta `.env.example`. Claves principales:

```env
NEWS_API_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
STRIPE_SECRET_KEY=sk_test_...
ADMIN_EMAILS=
EMPLOYEE_EMAILS=
# Cripto (opcional en modo demo)
NEXT_PUBLIC_CRYPTO_WALLET_EVM=
NEXT_PUBLIC_CHAIN_MODE=TESTNET
```

FRED (macros, opcional): `FRED` o `FRED_API_KEY`.

## Licencia

MIT — ver [LICENSE](LICENSE). © 2024–2026 Donovan Riaño / Amaxing. Todos los nuevos archivos (`data/selfGuidesData.js`, `data/cdmxMapsData.js`, `components/InteractiveGuidesSplitScroll.jsx`, `components/CDMXInteractiveExperience.jsx`, `components/SiteCookie.jsx`, `components/Particles.tsx`, `public/static/images/guides/*`, `public/static/images/local-picks/*`, `data/guides/*.mdx`, `data/maps/*.mdx`, `data/local-picks/*.mdx`, `pages/guides/*`, `pages/maps/*`, `pages/local/*`, `lib/localPicks/*`) bajo misma licencia MIT.
