// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Taxonomía controlada de Calpulli CDMX: términos canónicos + aliases + estado.
// Normaliza etiquetas existentes (evita architecture/architectural duplicados).
// Estados: active (usar), deprecated (no generar nuevo, mapear al canónico).

export const TAXONOMY_VERSION = '1.0.0'

const entry = (canonical, aliases = [], status = 'active') => ({ canonical, aliases, status })

export const INTERESTS = {
  food: entry('food', [
    'gastronomy',
    'gastronomía',
    'foodie',
    'tacos',
    'culinary',
    'cocina',
    'mercados',
    'markets',
  ]),
  history: entry('history', [
    'historia',
    'aztec',
    'azteca',
    'archaeology',
    'arqueología',
    'historic',
  ]),
  art: entry('art', [
    'arte',
    'murals',
    'murales',
    'museums',
    'museos',
    'contemporary',
    'contemporáneo',
  ]),
  architecture: entry('architecture', [
    'arquitectura',
    'architectural',
    'architecture lover',
    'art deco',
    'art decó',
  ]),
  neighborhoods: entry('neighborhoods', ['barrios', 'colonias', 'walks', 'caminatas', 'paseos']),
  nightlife: entry('nightlife', [
    'vida nocturna',
    'bares',
    'bars',
    'cantinas',
    'mixology',
    'coctelería',
  ]),
  nature: entry('nature', [
    'naturaleza',
    'parks',
    'parques',
    'bosque',
    'forest',
    'canals',
    'chinampas',
  ]),
  culture: entry('culture', [
    'cultura',
    'cultural',
    'traditions',
    'tradiciones',
    'crafts',
    'artesanías',
  ]),
}

export const THEMES = {
  'street-food': entry('street-food', ['comida callejera', 'antojitos', 'tacos', 'street food']),
  'mexican-history': entry('mexican-history', [
    'historia de méxico',
    'prehispánico',
    'pre-hispanic',
    'colonial',
  ]),
  muralism: entry('muralism', ['muralismo', 'rivera', 'orozco', 'siqueiros']),
  markets: entry('markets', ['mercados', 'market', 'tianguis']),
  'mezcal-pulque': entry('mezcal-pulque', ['mezcal', 'pulque', 'agave', 'destilados']),
  walking: entry('walking', ['a pie', 'walking tour', 'paseo', 'senderismo urbano']),
  museums: entry('museums', ['museos', 'museum', 'galerías', 'galleries']),
  'nightlife-bars': entry('nightlife-bars', ['bares', 'cantinas', 'vida nocturna']),
  'water-canals': entry('water-canals', ['trajineras', 'xochimilco', 'canales', 'chinampas']),
}

// Categoría de tour (toursData) → intereses canónicos. Mapeo editorial, no dato medido.
export const CATEGORY_INTERESTS = {
  gastronomy: ['food'],
  history: ['history', 'culture'],
  neighborhoods: ['neighborhoods', 'architecture', 'culture'],
  museums: ['art', 'history'],
}

export const LANGUAGES = {
  es: entry('es', ['español', 'spanish']),
  en: entry('en', ['english', 'inglés']),
}

export const TRAVELER_TYPES = {
  'first-time': entry('first-time', ['primera vez', 'first time', 'primeriza']),
  foodie: entry('foodie', ['food lover', 'amante de la comida']),
  'culture-seeker': entry('culture-seeker', ['cultura', 'history buff']),
  'night-owl': entry('night-owl', ['nocturno', 'fiesta']),
  family: entry('family', ['familia', 'niños', 'kids']),
  budget: entry('budget', ['económico', 'barato', 'cheap']),
}

function buildIndex(vocab) {
  const idx = new Map()
  for (const [key, { canonical, aliases, status }] of Object.entries(vocab)) {
    idx.set(norm(key), { canonical, status })
    for (const a of aliases) if (!idx.has(norm(a))) idx.set(norm(a), { canonical, status })
  }
  return idx
}

function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const INDEXES = {
  interests: buildIndex(INTERESTS),
  themes: buildIndex(THEMES),
  languages: buildIndex(LANGUAGES),
  travelerTypes: buildIndex(TRAVELER_TYPES),
}

/** Normaliza un término libre al canónico de un vocabulario. Null si no existe. */
export function normalizeTerm(vocabName, term) {
  const hit = INDEXES[vocabName]?.get(norm(term))
  if (!hit || hit.status === 'deprecated') return null
  return hit.canonical
}

/** Normaliza una lista; descarta desconocidos (se reportan como warnings aguas arriba). */
export function normalizeList(vocabName, terms) {
  const out = []
  const unknown = []
  for (const t of terms || []) {
    const c = normalizeTerm(vocabName, t)
    if (c && !out.includes(c)) out.push(c)
    else if (!c) unknown.push(t)
  }
  return { canonical: out, unknown }
}
