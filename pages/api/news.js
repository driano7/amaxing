import { getNewsCache, setNewsCache } from '@/lib/utils/newsCache'
import { checkRateLimit, getRemaining } from '@/lib/utils/rateLimiter'

const NEWS_API_KEY = process.env.NEWS_API_KEY || ''
const BASE_URL = 'https://newsapi.org/v2/everything'
const CACHE_TTL_SECONDS = 3600

const TOURISM_QUERIES = {
  en: [
    'Mexico tourism travel',
    'Cancun Riviera Maya',
    'Oaxaca cultural tourism',
    'Mexico City food tour',
    'Guanajuato colonial',
    'Baja California wine',
    'Puerto Vallarta',
    'Los Cabos luxury',
  ],
  es: [
    'turismo México viajes',
    'Cancún Riviera Maya',
    'Oaxaca turismo cultural',
    'CDMX tour gastronómico',
    'Guanajuato colonial',
    'Baja California vinos',
    'Puerto Vallarta',
    'Los Cabos lujo',
  ],
}

// Fallback images from Unsplash (free API) - themed to Mexico tourism
const TOURISM_IMAGES_EN = [
  'https://images.unsplash.com/photo-1581091012172-8a9d4a6f4d7d?w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
  'https://images.unsplash.com/photo-1519046904884-dadc6682cbd7?w=800&q=80',
  'https://images.unsplash.com/photo-1544564610-42b8b95f7f6f?w=800&q=80',
  'https://images.unsplash.com/photo-1476820860382-1c7e3a0c3e4d?w=800&q=80',
]

const TOURISM_IMAGES_ES = [
  'https://images.unsplash.com/photo-1581091012172-8a9d4a6f4d7d?w=800&q=80',
  'https://images.unsplash.com/photo-1519421002-3f22a7dfc892?w=800&q=80',
  'https://images.unsplash.com/photo-1544564610-42b8b95f7f6f?w=800&q=80',
  'https://images.unsplash.com/photo-1566073808743-5d1a8a9f8476?w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
]

const FALLBACK_ARTICLES = {
  en: [
    {
      title: 'Discover the Hidden Gems of Mexico Beyond the Tourist Trail',
      description:
        'Explore lesser-known destinations in Mexico where authentic culture and natural beauty await the adventurous traveler.',
      url: 'https://amaxing.mx/blog/hidden-gems-mexico',
      publishedAt: new Date().toISOString(),
      source: { name: 'Amaxing Travel' },
      sentiment: 'positive',
    },
    {
      title: 'Sustainable Tourism Initiatives in Riviera Maya',
      description:
        "New eco-resorts and conservation programs are transforming how we experience Mexico's Caribbean coast.",
      url: 'https://amaxing.mx/blog/sustainable-riviera-maya',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: 'Amaxing Travel' },
      sentiment: 'positive',
    },
    {
      title: "Oaxaca's Culinary Revolution: From Street Food to Fine Dining",
      description:
        'Oaxaca continues to redefine Mexican cuisine with innovative chefs and traditional cooking techniques.',
      url: 'https://amaxing.mx/blog/oaxaca-culinary-revolution',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: 'Amaxing Travel' },
      sentiment: 'positive',
    },
    {
      title: 'What NOT to Do When Visiting Mexico City',
      description:
        'Avoid these common tourist mistakes to fully enjoy the vibrant culture and rich history of Mexico City.',
      url: 'https://amaxing.mx/blog/mexico-city-mistakes',
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { name: 'Amaxing Travel' },
      sentiment: 'neutral',
    },
  ],
  es: [
    {
      title: 'Descubre los Tesoros Ocultos de México Más Allá de la Ruta Turística',
      description:
        'Explora destinos menos conocidos en México donde la cultura auténtica y la belleza natural te esperan.',
      url: 'https://amaxing.mx/blog/tesoros-ocultos-mexico',
      publishedAt: new Date().toISOString(),
      source: { name: 'Amaxing Travel' },
      sentiment: 'positive',
    },
    {
      title: 'Iniciativas de Turismo Sostenible en Riviera Maya',
      description:
        'Nuevos eco-resorts y programas de conservación están transformando la experiencia en la costa carreña de México.',
      url: 'https://amaxing.mx/blog/turismo-sostenible-riviera-maya',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: 'Amaxing Travel' },
      sentiment: 'positive',
    },
    {
      title: 'La Revolución Gastronómica de Oaxaca: De la Calle a la Alta Cocina',
      description:
        'Oaxaca sigue redefiniendo la cocina mexicana con chefs innovadores y técnicas tradicionales.',
      url: 'https://amaxing.mx/blog/revolucion-gastronomica-oaxaca',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: 'Amaxing Travel' },
      sentiment: 'positive',
    },
    {
      title: 'Lo Que NO Debes Hacer Cuando Visitas la Ciudad de México',
      description:
        'Evita estos errores comunes de turistas para disfrutar plenamente de la cultura y riqueza histórica de la CDMX.',
      url: 'https://amaxing.mx/blog/errores-cdmx',
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { name: 'Amaxing Travel' },
      sentiment: 'neutral',
    },
  ],
}

function addFallbackImages(articles, locale) {
  const images = locale === 'es' ? TOURISM_IMAGES_ES : TOURISM_IMAGES_EN

  return articles.map((article, index) => ({
    ...article,
    urlToImage: article.urlToImage || images[index % images.length],
  }))
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { locale = 'en', page = 1 } = req.query

  // Rate limiting check
  const { allowed, remaining } = await checkRateLimit()
  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Daily API limit reached. Please try again tomorrow.',
      articles: [],
      locale,
    })
  }

  try {
    const news = await getTourismNews(locale, Number(page))
    res.status(200).json({ articles: news, locale, rateLimit: { remaining } })
  } catch (error) {
    console.error('News API error:', error)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
}

async function getTourismNews(locale, page = 1) {
  const cacheKey = `news:${locale}:${page}`

  const cached = await getNewsCache(cacheKey)

  if (cached && Array.isArray(cached)) {
    return cached
  }

  if (!NEWS_API_KEY) {
    return addFallbackImages(FALLBACK_ARTICLES[locale] || FALLBACK_ARTICLES.en, locale)
  }

  const queries = TOURISM_QUERIES[locale] || TOURISM_QUERIES.en
  const randomQuery = queries[Math.floor(Math.random() * queries.length)]

  const fromDate = new Date()
  fromDate.setMonth(fromDate.getMonth() - 3)
  const from = fromDate.toISOString().split('T')[0]

  const url = `${BASE_URL}?q=${encodeURIComponent(
    randomQuery
  )}&from=${from}&sortBy=publishedAt&pageSize=12&page=${page}&language=${locale}&apiKey=${NEWS_API_KEY}`

  const response = await fetch(url)
  if (!response.ok) {
    console.error('NewsAPI error:', response.status)
    return addFallbackImages(FALLBACK_ARTICLES[locale] || FALLBACK_ARTICLES.en, locale)
  }

  const data = await response.json()
  const articles = data.articles || []

  const articlesWithImages = addFallbackImages(articles, locale)

  await setNewsCache(cacheKey, articlesWithImages, CACHE_TTL_SECONDS)

  return articlesWithImages
}
