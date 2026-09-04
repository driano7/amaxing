// Trigger Local Picks generation (used by Vercel cron and admin).
import { generateLocalPicks } from '@/lib/localPicks/generator'

const CRON_SECRET = process.env.CRON_SECRET || process.env.JWT_SECRET || ''

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = req.headers.authorization || ''
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const result = await generateLocalPicks()
    return res.status(200).json({ ok: true, ...result })
  } catch (error) {
    console.error('Local Picks sync failed:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
}
