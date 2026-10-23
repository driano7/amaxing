// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import type { NextApiRequest, NextApiResponse } from 'next'
import { runLuchaScraper } from '@/scripts/scrapers/lucha-scraper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('⏰ Cron triggered: Lucha Libre scraper')
    try {
      await runLuchaScraper()
    } catch (error) {
      console.log('Scraper limited mode:', error.message)
    }
    return res.status(200).json({ success: true, message: 'Scraper completed' })
  } catch (error) {
    console.error('Cron job failed:', error)
    return res.status(500).json({ error: 'Scraper failed', details: String(error) })
  }
}
