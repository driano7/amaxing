// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Cron job to run lucha scraper every 3 days
 * Can be triggered by:
 * - Vercel Cron (vercel.json)
 * - GitHub Actions (cron schedule)
 * - Traditional cron
 * - Any scheduler
 */

import { runLuchaScraper } from '../scrapers/lucha-scraper'

async function main() {
  console.log('⏰ Running scheduled Lucha Libre scraper...')
  console.log(`⏰ Started at: ${new Date().toISOString()}`)

  try {
    await runLuchaScraper()
    console.log('✅ Scraper completed successfully')
  } catch (error) {
    console.error('❌ Scraper failed:', error)
    process.exit(1)
  }

  console.log(`⏰ Finished at: ${new Date().toISOString()}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Cron job failed:', err)
    process.exit(1)
  })
