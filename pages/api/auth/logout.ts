// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// POST /api/auth/logout — destruye la sesión
import { destroySession } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  try {
    if (token) await destroySession(token)
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ message: 'Error al cerrar sesión' })
  }
}
