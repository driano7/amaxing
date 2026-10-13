// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/auth/me — Usuario de la sesión actual
import { getSessionUser } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })

  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  try {
    const user = await getSessionUser(token)
    if (!user) return res.status(401).json({ success: false, message: 'No autenticado' })
    return res.status(200).json({ success: true, user })
  } catch (error) {
    console.error('Auth me error:', error)
    return res.status(500).json({ message: 'Error obteniendo la sesión' })
  }
}
