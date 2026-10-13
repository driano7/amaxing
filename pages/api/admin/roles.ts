// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET  /api/admin/roles — lista roles y permisos (matriz de la BD)
// POST /api/admin/roles — asigna un rol a un usuario (queda en user_roles)
import { turso } from '@/lib/turso'
import { getSessionUser, permissionsFor, type Role } from '@/lib/auth'
import { logAccess } from '@/lib/auth'

const VALID_ROLES: Role[] = ['client', 'employee', 'admin']

export default async function handler(req, res) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const actor = await getSessionUser(token)
  if (!actor) return res.status(401).json({ error: 'Unauthorized' })

  try {
    if (req.method === 'GET') {
      const result = await turso.execute({
        sql: 'SELECT * FROM role_permissions WHERE is_active = 1 ORDER BY rank',
        args: [],
      })

      const roles = await Promise.all(
        result.rows.map(async (row: any) => ({
          role: row.role,
          label: row.label,
          description: row.description,
          rank: row.rank,
          panels: safeJson(row.panels),
          permissions: await permissionsFor(row.role as Role),
        }))
      )

      const assigned = await turso.execute({
        sql: `SELECT email, role, note, created_at
              FROM user_roles ORDER BY created_at DESC`,
        args: [],
      })

      return res.status(200).json({
        roles,
        assignments: assigned.rows.map((r: any) => ({
          email: r.email,
          role: r.role,
          note: r.note,
          since: r.created_at,
        })),
      })
    }

    if (req.method === 'POST') {
      if (!actor.role || actor.role !== 'admin') {
        return res.status(403).json({ error: 'Solo un admin puede asignar roles' })
      }

      const { email, role, note } = req.body ?? {}

      if (!email || !VALID_ROLES.includes(role)) {
        return res.status(400).json({ error: 'email y role (client|employee|admin) requeridos' })
      }

      const normalized = String(email).trim().toLowerCase()

      const user = await turso.execute({
        sql: 'SELECT id, email FROM users WHERE email = ? COLLATE NOCASE',
        args: [normalized],
      })

      const row: any = user.rows[0]
      if (!row) return res.status(404).json({ error: 'Ese usuario no existe' })

      // Un usuario tiene un solo rol activo: se reemplazan los anteriores.
      await turso.execute({
        sql: 'DELETE FROM user_roles WHERE "userId" = ?',
        args: [row.id],
      })

      await turso.execute({
        sql: `INSERT INTO user_roles ("userId", email, role, granted_by, note)
              VALUES (?, ?, ?, ?, ?)`,
        args: [row.id, row.email, role, actor.id, note ?? null],
      })

      await turso.execute({
        sql: 'UPDATE users SET role = ? WHERE id = ?',
        args: [role === 'admin' ? 'admin' : role === 'employee' ? 'guide' : 'customer', row.id],
      })

      await logAccess({
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        action: 'assign_role',
        targetEmail: row.email,
        details: { role, note: note ?? null },
        ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? null,
      })

      return res.status(200).json({ success: true, email: row.email, role })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Roles error:', error)
    return res.status(500).json({ error: 'Failed to process roles' })
  }
}

function safeJson(value: unknown): string[] {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
