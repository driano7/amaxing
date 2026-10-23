// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import type { NextApiRequest, NextApiResponse } from 'next'
import { getLuchaEvents, getLuchaEventsByWeek } from '@/lib/db/schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { arena, byWeek, from, to } = req.query

    if (byWeek === 'true') {
      const weeks = await getLuchaEventsByWeek()
      return res.status(200).json({ weeks })
    }

    const events = await getLuchaEvents(
      arena as 'mexico' | 'coliseo' | undefined,
      from as string,
      to as string
    )

    return res.status(200).json({ events })
  } catch (error) {
    console.error('Error fetching lucha events:', error)
    return res.status(500).json({ error: 'Failed to fetch lucha events' })
  }
}
