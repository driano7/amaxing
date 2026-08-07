/**
 * Amaxing — lib/news-generators/fredStore.js (CommonJS)
 * Snapshot macro de FRED (St. Louis Fed) adaptado del patrón de EarningsAI
 * (lib/macro.ts). Best-effort: si no hay FRED_API_KEY configurada devuelve [].
 * Se usa como contexto adicional para las notas de turismo mensuales.
 */
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations'
const FRED_KEY = process.env.FRED || process.env.FRED_API_KEY || ''

// Series relevantes para turismo México / costo de viaje
const MACRO_SERIES = [
  { id: 'DEXMXUS', label: 'USD/MXN (tipo de cambio)', unit: 'MXN' },
  { id: 'MEXCPIALLMINMEI', label: 'Inflación México', unit: '%' },
  { id: 'CPIAUCSL', label: 'Inflación USA', unit: 'índice' },
  { id: 'DCOILWTICO', label: 'Petróleo WTI', unit: 'USD' },
  { id: 'DTWEXBGS', label: 'DXY (dólar)', unit: 'índice' },
]

function isConfigured() {
  return Boolean(FRED_KEY)
}

function parseValue(value) {
  if (!value || value === '.') return null
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : null
}

async function fetchFredSerie(seriesId) {
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=2`
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return { value: null, previousValue: null, date: '' }
    const data = await res.json()
    const observations = data.observations || []
    const latest = observations[0]
    const previous = observations[1]
    return {
      value: parseValue(latest?.value),
      previousValue: parseValue(previous?.value),
      date: latest?.date || '',
    }
  } catch {
    return { value: null, previousValue: null, date: '' }
  }
}

/**
 * @returns {Promise<Array<{ id: string, label: string, value: number|null,
 *           previousValue: number|null, change: number|null, unit: string, date: string }>>}
 */
async function getMacroSnapshot() {
  if (!isConfigured()) return []
  const results = await Promise.allSettled(
    MACRO_SERIES.map(async (serie) => {
      const { value, previousValue, date } = await fetchFredSerie(serie.id)
      let change = null
      if (value !== null && previousValue !== null && previousValue !== 0) {
        change = ((value - previousValue) / Math.abs(previousValue)) * 100
      }
      return { ...serie, value, previousValue, change, date }
    })
  )
  return results
    .filter((r) => r.status === 'fulfilled' && r.value && r.value.value !== null)
    .map((r) => r.value)
}

function formatMacroForPrompt(macros) {
  if (!macros.length) return 'No disponibles'
  return macros
    .map((m) => {
      const change =
        m.change !== null ? `${m.change >= 0 ? '+' : ''}${m.change.toFixed(2)}%` : 'N/A'
      return `- ${m.label}: ${m.value}${m.unit} (cambio: ${change}, fecha: ${m.date})`
    })
    .join('\n')
}

module.exports = { getMacroSnapshot, formatMacroForPrompt, isConfigured }
