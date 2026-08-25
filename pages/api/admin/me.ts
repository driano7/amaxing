import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getSessionFromRequest,
  resolveRole,
  getPermissions,
  getAdminEmails,
  getEmployeeEmails,
} from '@/lib/roles'

/**
 * GET /api/admin/me
 * Devuelve rol, permisos y acceso a paneles del usuario autenticado.
 * Los roles se resuelven por ADMIN_EMAILS / EMPLOYEE_EMAILS (env) — patrón Criptec.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const session = getSessionFromRequest(req)
  if (!session || !session.email) {
    return res.status(401).json({ success: false, message: 'No autenticado' })
  }

  const role = resolveRole(session.email)
  const permissions = getPermissions(role)

  // Accesos disponibles según rol
  const panels: string[] = ['/profile']
  if (role === 'employee' || role === 'admin') panels.push('/empleados')
  if (role === 'admin') panels.push('/admin')

  return res.status(200).json({
    success: true,
    data: {
      userId: session.id,
      email: session.email,
      role,
      permissions,
      panels,
      source: 'env',
    },
  })
}
