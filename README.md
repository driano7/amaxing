# Amaxing

Plataforma digital de turismo premium en México. Experiencias seleccionadas, guías de viaje, noticias de turismo generadas con IA y reservas, en inglés y español.

## Stack

- **Next.js 12** (Pages Router) + **React 17** + **TypeScript**
- **Tailwind CSS 3** + **Framer Motion**
- **Supabase** (autenticación, reservas, analytics, notas de noticias)
- **Stripe** (checkout con tarjeta en modo prueba)
- **Cripto**: Ethereum / Base / Lightning Network (verificación on-chain)
- **mdx-bundler** (blog con contenido MDX)
- **OpenRouter API** + **NewsAPI** + **FRED** (generación automática de noticias)
- **qrcode.react** (QRs minimalistas de reservas y clientes)
- **@zxing/browser** + **BarcodeDetector API** (lector de QRs)
- **Recharts 2** (gráficas animadas en dashboard)
- **Web Crypto API** (cifrado AES-256-GCM client-side)
- **Node.js crypto** (cifrado PBKDF2 + AES-256-GCM server-side)

## Scripts

```bash
npm run dev           # servidor de desarrollo
npm run build         # build de producción
npm start             # next-remote-watch (contenido de data/)
npm run serve         # next start
npm run lint          # next lint
npm run news:generate # genera las noticias del mes (usa OpenRouter)
```

## Estructura

```
pages/
├── api/              # API routes (bookings, encryption, stripe, admin, tours…)
├── profile.tsx       # Dashboard usuario: tabs, deep-link ?tab=, QR personal
├── admin.tsx         # Panel socio/admin: usuarios, métricas ML, analítica pasiva, lector QR
├── empleados.tsx     # Portal empleado: agenda del día + lector QR
├── checkout.jsx      # Pago tarjeta (Stripe) o cripto
components/
├── charts/           # SequentialBarChart, SequentialLineChart, SequentialRadialBarChart
├── analytics/        # SocioPanels: métricas avanzadas + analítica pasiva (solo socios)
├── tickets/          # VirtualTicket (dark mode) con QR minimalista AMX-T-
├── QrScanner.tsx     # Lector: cámara (BarcodeDetector/zxing) + código manual
├── CryptoPayment.tsx # Modal cripto: QR por red + verificación on-chain polling
├── GdprBanner.tsx    # Banner privacidad i18n en home → /profile?tab=security
├── ErrorBoundary.tsx # Aísla errores por tab (evita romper la navegación)
lib/
├── encryption.ts     # Client-side AES-GCM
├── server-encryption.ts # Server-side PBKDF2 + AES-GCM
├── userData.ts       # Perfil, favoritos, reservas (cifrados)
├── roles.ts          # Roles por env: ADMIN_EMAILS > EMPLOYEE_EMAILS > cliente
├── qr/               # types (AMX-T-/AMX-C-) + resolve (localStorage + mocks demo)
├── crypto/           # addresses (wallets negocio) + verify (Etherscan/Basescan/LN)
├── analytics/        # track (tracking pasivo) + ml-metrics (segmentación, proyección, anomalías)
└── mocks/socioData   # Datos demo para previsualizar paneles sin datos reales
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

Tracking automático de visitas (sin cookies de terceros): sesiones, usuarios únicos, tiempo en página, rutas más visitadas, dispositivos/navegadores/OS (parseo de user-agent) y flujo de navegación entre páginas.

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

## Carrito, checkout y Stripe

- **Carrito** (`/cart`): hasta `maxGuests` personas por tour, fecha/hora, totales USD/MXN según idioma.
- **Checkout**: vista flip de tarjeta + redirección a Stripe Checkout (test). Alternativa: pago cripto.
- APIs: `POST /api/stripe/checkout`, `POST /api/stripe/confirm`, `POST /api/stripe/webhook`.
- Tarjeta de prueba: `4242 4242 4242 4242`.

## Variables de entorno

Consulta `.env.example`. Claves principales:

```env
NEWS_API_KEY=
OPENROUTER_API_KEY=
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

MIT — ver [LICENSE](LICENSE). © 2024–2026 Donovan Riaño / Amaxing.
