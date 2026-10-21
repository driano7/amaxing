import GA from './GoogleAnalytics'
import Plausible from './Plausible'
import SimpleAnalytics from './SimpleAnalytics'
import Umami from './Umami'
import Posthog from './Posthog'
import siteMetadata from '@/data/siteMetadata'

/**
 * Hay TRES sistemas de analitica activos, y conviene saber quien hace que:
 *
 *  1. First-party (components/PageAnalyticsTracker.tsx -> /api/analytics/track)
 *     Es el mas rico: ruta, titulo, tiempo en pagina, scroll, bounce, exit,
 *     referrer y device/browser/OS. Vive en Turso y alimenta el panel propio.
 *     No manda datos a terceros.
 *
 *  2. Plausible (plausible.io). Analitica aggregate y sin cookies: no guarda
 *     identificadores personales ni hace perfiles. Se activa con
 *     `analytics.plausibleDataDomain`.
 *
 *  3. Google Analytics 4 (googletagmanager.com). Es el que sirve para
 *     campanas, conversiones de Ads y datos de SEO. Se activa con
 *     `analytics.googleAnalyticsId`.
 *
 * OJO: Plausible y GA4 cuentan los MISMOS pageviews, asi que los datos
 * agregados estan duplicados en dos proveedores. Si se quiere un solo
 * proveedor externo, se apaga el otro cambiando su bandera en
 * `data/siteMetadata.js` (no hace falta tocar codigo).
 *
 * SimpleAnalytics, Umami y Posthog estan soportados pero desactivados: sus
 * banderas estan vacias o en false.
 */
const isProduction = process.env.NODE_ENV === 'production'

const Analytics = () => {
  return (
    <>
      {isProduction && siteMetadata.analytics.plausibleDataDomain && <Plausible />}
      {isProduction && siteMetadata.analytics.simpleAnalytics && <SimpleAnalytics />}
      {isProduction && siteMetadata.analytics.umamiWebsiteId && <Umami />}
      {isProduction && siteMetadata.analytics.googleAnalyticsId && <GA />}
      {isProduction && siteMetadata.analytics.posthogAnalyticsId && <Posthog />}
    </>
  )
}

export default Analytics
