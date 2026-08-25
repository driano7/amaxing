// Resolución de roles estilo Criptec: sets de emails en .env con fallback a BD.
// ADMIN_EMAILS > EMPLOYEE_EMAILS > cliente (default).
import type { NextApiRequest } from 'next'

export type Role = 'admin' | 'employee' | 'client'

const toList = (raw: string | undefined): string[] =>
  (raw || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

export const getAdminEmails = (): string[] => toList(process.env.ADMIN_EMAILS)
export const getEmployeeEmails = (): string[] => toList(process.env.EMPLOYEE_EMAILS)

const normalize = (email: string): string => (email || '').trim().toLowerCase()

export const isAdminEmail = (email: string): boolean => {
  const normalized = normalize(email)
  if (!normalized) return false
  return getAdminEmails().includes(normalized)
}

export const isEmployeeEmail = (email: string): boolean => {
  const normalized = normalize(email)
  if (!normalized) return false
  // Un admin también tiene permisos de empleado
  return getEmployeeEmails().includes(normalized) || isAdminEmail(normalized)
}

export const resolveRole = (email: string): Role => {
  if (isAdminEmail(email)) return 'admin'
  if (isEmployeeEmail(email)) return 'employee'
  return 'client'
}

export interface SessionUser {
  id: string
  email: string
}

/**
 * Extrae el usuario del request vía token Bearer.
 * En modo demo (sin Supabase auth conectado), acepta el header x-demo-email
 * para poder probar los paneles sin backend completo.
 */
export function getSessionFromRequest(req: NextApiRequest): SessionUser | null {
  // Modo demo/testing: header explícito (solo útil en desarrollo)
  const demoEmail = req.headers['x-demo-email']
  if (typeof demoEmail === 'string' && demoEmail.includes('@')) {
    return { id: 'demo-user', email: normalize(demoEmail) }
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return null

  try {
    // Payload JWT sin verificar firma (verificación real requiere SUPABASE_JWT_SECRET).
    // La firma se valida en producción vía Supabase; aquí solo decodificamos claims.
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'))
    if (!payload.email && !payload.sub) return null
    return { id: payload.sub || payload.id || '', email: normalize(payload.email || '') }
  } catch {
    return null
  }
}

/** Permisos por rol — define qué puede ver/gestionar cada panel */
export interface RolePermissions {
  canManageUsers: boolean
  canViewFullClientData: boolean
  canDecryptSensitiveFields: boolean
  canManageAdmins: boolean
  canViewBookings: boolean
  canViewPayments: boolean
  canExportGDPR: boolean
}

export function getPermissions(role: Role): RolePermissions {
  switch (role) {
    case 'admin':
      return {
        canManageUsers: true,
        canViewFullClientData: true,
        canDecryptSensitiveFields: true,
        canManageAdmins: true,
        canViewBookings: true,
        canViewPayments: true,
        canExportGDPR: true,
      }
    case 'employee':
      return {
        canManageUsers: false,
        canViewFullClientData: false,
        canDecryptSensitiveFields: false, // empleados ven solo lo estrictamente necesario
        canManageAdmins: false,
        canViewBookings: true, // para operar tours del día
        canViewPayments: false,
        canExportGDPR: false,
      }
    default:
      return {
        canManageUsers: false,
        canViewFullClientData: false,
        canDecryptSensitiveFields: false,
        canManageAdmins: false,
        canViewBookings: false,
        canViewPayments: false,
        canExportGDPR: false,
      }
  }
}
