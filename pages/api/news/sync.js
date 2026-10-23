import { generateNotes } from '@/lib/news-generators/autoNewsGenerator'

const CRON_SECRET = process.env.CRON_SECRET || process.env.JWT_SECRET || ''

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = req.headers.authorization || ''
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const count = Math.min(parseInt(req.query.count || '3', 10), 3)

  try {
    const result = await generateNotes('en', count)

    // Also fetch lucha event news for Arena Mexico and Arena Coliseo
    const fetchLuchaEvents = async () => {
      const NEWS_API_KEY = process.env.NEWS_API_KEY || ''
      if (!NEWS_API_KEY) {
        console.log('No NEWS_API_KEY configured, skipping lucha events fetch')
        return []
      }

      const baseUrl = 'https://newsapi.org/v2/everything'
      // 3 days back for more recent events
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const queries = [
        'Arena Mexico lucha libre',
        'Arena Coliseo lucha libre',
        'CMLL Arena Mexico',
        'CMLL Arena Coliseo',
      ]

      const allArticles = []

      for (const query of queries) {
        const params = new URLSearchParams({
          apiKey: NEWS_API_KEY,
          q: query,
          from: threeDaysAgo.toISOString().split('T')[0],
          language: 'es',
          sortBy: 'publishedAt',
          pageSize: 10,
        })

        try {
          const fetchUrl = `${baseUrl}?${params.toString()}`
          const fetchRes = await fetch(fetchUrl)
          if (!fetchRes.ok) {
            console.log(`NewsAPI error for "${query}": ${fetchRes.status}`)
            continue
          }
          const data = await fetchRes.json()
          if (data.articles && data.articles.length > 0) {
            allArticles.push(
              ...data.articles.map((a) => ({
                title: a.title,
                description: a.description,
                url: a.url,
                publishedAt: a.publishedAt,
                source: a.source.name,
              }))
            )
          }
        } catch (err) {
          console.log(`Error fetching "${query}":`, err.message)
        }
      }

      return allArticles
    }

    const luchaEvents = await fetchLuchaEvents()

    // Also fetch FRED macro data for context
    const fetchFredData = async () => {
      const FRED_KEY = process.env.FRED || process.env.FRED_API_KEY || ''
      if (!FRED_KEY) {
        console.log('No FRED API key configured, skipping FRED data')
        return []
      }

      const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations'
      const seriesIds = [
        'DEXMXUS', // USD/MXN exchange rate
        'MEXCPIALLMINMEI', // Inflación México
      ]

      const results = await Promise.allSettled(
        seriesIds.map(async (seriesId) => {
          try {
            const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`
            const fetchRes = await fetch(url, { next: { revalidate: 86400 } })
            if (!fetchRes.ok) return null
            const data = await fetchRes.json()
            const observations = data.observations || []
            if (observations.length > 0) {
              const latest = observations[0]
              return {
                seriesId,
                value: latest.value,
                date: latest.date,
              }
            }
            return null
          } catch (err) {
            console.log(`FRED error for ${seriesId}:`, err.message)
            return null
          }
        })
      )

      return results.filter((r) => r.status === 'fulfilled' && r.value !== null)
    }

    const fredData = await fetchFredData()

    const response = {
      ...result,
      luchaEventsFound: luchaEvents.length,
      luchaEvents: luchaEvents,
      fredData: fredData,
      timestamp: new Date().toISOString(),
      status: 'success',
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('News sync error:', error)
    res.status(500).json({ error: 'Failed to sync news', details: error.message })
  }
}
