// Trigger note generation (used by Vercel cron and admin).
// NOTE: On serverless (Vercel), data/notes is read-only at runtime, so generated
// notes cannot persist there. Run the manual script locally and commit the files.
// The generator makes a SINGLE OpenRouter request for up to 3 bilingual (en+es)
// notes per month (patrón EarningsAI), y persiste en Supabase.
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
    return res.status(200).json({ ok: true, ...result })
  } catch (error) {
    console.error('News sync failed:', error)
    return res.status(500).json({
      ok: false,
      error: error.message,
      hint: 'On serverless the filesystem is read-only. Run `npm run news:generate` locally and commit the generated data/notes files.',
    })
  }
}
