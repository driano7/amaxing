# Amaxing

Plataforma digital de turismo premium en México. Experiencias seleccionadas, guías de viaje, noticias de turismo generadas con IA y reservas, en inglés y español.

## Stack

- **Next.js 14** (Pages Router) + **React 18** + **TypeScript**
- **Tailwind CSS 3** + **Framer Motion**
- **Supabase** (autenticación, reservas, analytics, notas de noticias)
- **Stripe** (checkout con tarjeta en modo prueba, redirección a Stripe Checkout)
- **mdx-bundler** (blog con contenido MDX)
- **OpenRouter API** + **NewsAPI** + **FRED** (generación automática de noticias)
- **qrcode.react** (QR de donaciones y tickets)
- **Recharts** (gráficas animadas en dashboard)
- **html-to-image** (export PNG de gráficas)
- **Web Crypto API** (cifrado AES-256-GCM client-side)
- **Node.js crypto** (cifrado PBKDF2 + AES-256-GCM server-side)

## Scripts

```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm start            # next-remote-watch (contenido de data/)
npm run serve        # next start
npm run lint         # next lint
npm run lint --fix   # next lint + prettier fix
npm run news:generate # genera las noticias del mes (usa OpenRouter)
```

## Estructura

```
pages/              # rutas (pages router)
├── api/            # API routes (bookings, encryption, stripe, tours, auth, etc.)
├── profile.tsx     # Dashboard de usuario con gráficas animadas
├── tours/[slug].js # Detalle de tour con scroll a reviews
components/         # UI, tours, experiencias, tickets, carrito, charts
├── charts/         # SequentialBarChart, SequentialLineChart, SequentialRadialBarChart
├── AuthLoader.tsx  # Loading XocoCafe-style
├── CoffeeBackground.tsx
lib/                # mdx, notes, news-generators, supabase, openrouter, i18n
├── encryption.ts   # Client-side AES-GCM
├── server-encryption.ts # Server-side PBKDF2 + AES-GCM
├── userData.ts     # Profile, favorites, bookings (encrypted)
data/               # blog (mdx), notes, siteMetadata, diccionarios i18n
hooks/              # useAuth, useLanguage, useAnalytics, useCartStore
scripts/            # utilidades (generate-news-notes, next-remote-watch)
```

## Funcionalidad

- Blog y guías de viaje en MDX (EN/ES)
- Noticias de turismo: cron mensual que genera 3 notas bilingües con OpenRouter (patrón de un solo request) y las persiste en Supabase
- Experiencias y tours con reserva, carrito, checkout con **Stripe** y tickets con QR
- Moneda por idioma: precios en USD (inglés) y MXN (español)
- **Autenticación** (login/registro), **perfil con dashboard animado** y analytics
- **Dashboard personal**: métricas (próximos viajes, completados, gasto total), gráficas animadas (barras, líneas, radial), favoritos, comentados, edición de perfil, seguridad y GDPR
- **Cifrado de datos**: AES-256-GCM en cliente (Web Crypto) y servidor (PBKDF2 + Node crypto), exportación cifrada/descifrada
- **Detalle de tour**: "Agregar al carrito" (login redirect), scroll suave a reviews
- Modo claro/oscuro, i18n EN/ES, SEO, JSON-LD
- Banner de donaciones (Bitcoin, Ethereum, cuenta bancaria) con QR

## Dashboard de Usuario (Profile)

Tabs:

- **Dashboard**: Tarjetas de resumen + 5 gráficas animadas (categorías, meses, estados, tendencia gasto, radial completitud)
- **Mis reservas**: Grid completa con tarjetas + tickets QR
- **Favoritos**: Tours guardados con toggle
- **Comentados**: Tours donde dejaste review
- **Mi perfil**: Editar nombre, email, teléfono, país, bio
- **Seguridad y datos**: Cambiar contraseña, exportar datos (JSON/JSON cifrado AES), eliminar cuenta (GDPR)

## Carrito, checkout y pago

- **Carrito** (`/cart`): agenda hasta `maxGuests` personas por tour, elige fecha y hora, y ve el total según el idioma (USD / MXN).
- **Checkout** (`/checkout`): vista previa de la tarjeta con animación flip, y pago redirigiendo a **Stripe Checkout** (modo prueba).
- Al volver de Stripe, `/api/stripe/confirm` verifica la sesión y crea las **reservas con código QR** (descargables como PNG/PDF desde el perfil).
- Las APIs:
  - `POST /api/stripe/checkout` — crea la sesión de Stripe (precios servidor-side desde `data/toursData.js`)
  - `POST /api/stripe/confirm` — verifica el pago y crea los bookings
  - `POST /api/stripe/webhook` — opcional, valida el evento `checkout.session.completed`

## Cifrado de Datos (GDPR)

### Cliente (`lib/encryption.ts`)

- Web Crypto API: `crypto.subtle.encrypt/decrypt` con AES-GCM
- Clave derivada del `userId` (7 dígitos) via `importKey`
- `encryptWithUserId()` / `decryptWithUserId()` — payloads completos
- `encryptSensitiveFields()` / `decryptSensitiveFields()` — campos sensibles (nombre, email, teléfono, etc.)

### Servidor (`lib/server-encryption.ts`)

- Node.js `crypto`: PBKDF2 (100k iter, SHA-256) + AES-256-GCM
- Clave derivada del email
- `encryptWithEmail()` / `decryptWithEmail()` — compatible con XocoCafe
- `encryptUserData()` / `decryptUserData()` — perfil completo

### API (`pages/api/encryption.ts`)

- `POST { action: 'encrypt'|'decrypt', email, data }` → `{ encrypted, hash }` / `{ decrypted }`

### userData (`lib/userData.ts`)

- `getProfileData()` — descifra automáticamente al leer
- `saveProfileData()` — cifra antes de guardar
- `exportMyData(encrypt=true)` — descarga JSON con `_encrypted` payload
- `exportEncryptedData()` — wrapper para exportación cifrada
- `deleteMyData()` — limpia localStorage (incluye `amaxing_user_id`)

## Variables de entorno

Consulta `.env.example`. Claves principales:

```env
NEWS_API_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

Pago con Stripe (modo prueba):

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # opcional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- Solo se aceptan claves `sk_test_...`.
- Tarjeta de prueba: `4242 4242 4242 4242`.
- La tasa USD→MXN usada para mostrar precios en español se configura en `lib/currency.ts`.

FRED (macros, opcional): `FRED` o `FRED_API_KEY`.

## Licencia

MIT — ver [LICENSE](LICENSE).
