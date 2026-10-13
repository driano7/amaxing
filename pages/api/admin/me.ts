// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/admin/me — Rol y permisos reales desde la sesión (Turso)
import { getSessionUser, panelsFor, permissionsFor } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const user = await getSessionUser(token)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    return res.status(200).json({
      success: true,
      demo: false,
      data: {
        email: user.email,
        role: user.role,
        permissions: permissionsFor(user.role),
        panels: panelsFor(user.role),
      },
    })
  } catch (error) {
    console.error('Admin me error:', error)
    return res.status(500).json({ error: 'Failed to get admin data' })
  }
}
