# Amaxing

Plataforma digital de turismo premium en México. Experiencias seleccionadas, guías de viaje, noticias de turismo generadas con IA y reservas, en inglés y español.

## Stack

- **Next.js 12** (Pages Router) + **React 17** + **TypeScript**
- **Tailwind CSS 3** + **Framer Motion**
- **Supabase** (autenticación, reservas, analytics, notas de noticias)
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
- Experiencias y tours con reserva, carrito y tickets con QR
- Autenticación (login/registro), perfil y analytics
- Modo claro/oscuro, i18n EN/ES, SEO, JSON-LD
- Banner de donaciones (Bitcoin, Ethereum, cuenta bancaria) con QR

## Variables de entorno

Consulta `.env.example`. Claves principales:

```env
NEWS_API_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

FRED (macros, opcional): `FRED` o `FRED_API_KEY`.

## Licencia

MIT — ver [LICENSE](LICENSE).
