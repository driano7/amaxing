# Amaxing

Plataforma digital de turismo premium en México. Experiencias seleccionadas, guías de viaje, noticias de turismo generadas con IA y reservas, en inglés y español.

## Stack

- **Next.js 12** (Pages Router) + **React 17** + **TypeScript**
- **Tailwind CSS 3** + **Framer Motion**
- **Supabase** (autenticación, reservas, analytics, notas de noticias)
- **Stripe** (checkout con tarjeta en modo prueba, redirección a Stripe Checkout)
- **mdx-bundler** (blog con contenido MDX)
- **OpenRouter API** + **NewsAPI** + **FRED** (generación automática de noticias)
- **qrcode.react** (QR de donaciones y tickets)

## Scripts

```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm start            # next-remote-watch (contenido de data/)
npm run serve        # next start
npm run lint         # next lint
npm run news:generate # genera las noticias del mes (usa OpenRouter)
```

## Estructura

```
pages/      # rutas (pages router)
components/ # UI, tours, experiencias, tickets, carrito
layouts/    # layouts de blog (PostLayout, NewsLayout, ...)
lib/        # mdx, notes, news-generators, supabase, openrouter, i18n
data/       # blog (mdx), notes, siteMetadata, diccionarios i18n
hooks/      # useAuth, useLanguage, useAnalytics
scripts/    # utilidades (generate-news-notes, next-remote-watch)
```

## Funcionalidad

- Blog y guías de viaje en MDX (EN/ES)
- Noticias de turismo: cron mensual que genera 3 notas bilingües con OpenRouter (patrón de un solo request) y las persiste en Supabase
- Experiencias y tours con reserva, carrito, checkout con **Stripe** y tickets con QR
- Moneda por idioma: precios en USD (inglés) y MXN (español)
- Autenticación (login/registro), perfil y analytics
- Modo claro/oscuro, i18n EN/ES, SEO, JSON-LD
- Banner de donaciones (Bitcoin, Ethereum, cuenta bancaria) con QR

## Carrito, checkout y pago

- **Carrito** (`/cart`): agenda hasta `maxGuests` personas por tour, elige fecha y hora, y ve el total según el idioma (USD / MXN).
- **Checkout** (`/checkout`): vista previa de la tarjeta con animación flip, y pago redirigiendo a **Stripe Checkout** (modo prueba).
- Al volver de Stripe, `/api/stripe/confirm` verifica la sesión y crea las **reservas con código QR** (descargables como PNG/PDF desde el perfil).
- Las APIs:
  - `POST /api/stripe/checkout` — crea la sesión de Stripe (precios servidor-side desde `data/toursData.js`)
  - `POST /api/stripe/confirm` — verifica el pago y crea los bookings
  - `POST /api/stripe/webhook` — opcional, valida el evento `checkout.session.completed`

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
