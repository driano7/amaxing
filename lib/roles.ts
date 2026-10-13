// Resolución de roles estilo Criptec: sets de emails en .env con fallback a BD.
// ADMIN_EMAILS > EMPLOYEE_EMAILS > tabla user_roles > cliente (default).
import type { NextApiRequest } from 'next'
import { getSessionUser, type AuthUser } from '@/lib/auth'

export type Role = 'admin' | 'employee' | 'client'

// Cuentas.bootstrap: acceso inicial garantizado aunque falten las vars en Vercel.
// Mover a ADMIN_EMAILS / EMPLOYEE_EMAILS en cuanto las variables existan en prod.
const BOOTSTRAP_ADMINS = ['donovanriano@gmail.com']
const BOOTSTRAP_EMPLOYEES = ['dnvn77@gmail.com']

const toList = (raw: string | undefined): string[] =>
  (raw || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

export const getAdminEmails = (): string[] => [
  ...new Set([...toList(process.env.ADMIN_EMAILS), ...BOOTSTRAP_ADMINS]),
]
export const getEmployeeEmails = (): string[] => [
  ...new Set([...toList(process.env.EMPLOYEE_EMAILS), ...BOOTSTRAP_EMPLOYEES, ...BOOTSTRAP_ADMINS]),
]

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
 * Extrae el usuario autenticado del request vía token Bearer, validando la
 * sesión contra Turso. No acepta headers de suplantación ni JWT sin verificar.
 */
export async function getSessionFromRequest(req: NextApiRequest): Promise<SessionUser | null> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7).trim()
  if (!token) return null

  const user: AuthUser | null = await getSessionUser(token)
  if (!user) return null
  return { id: user.id, email: normalize(user.email) }
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
  /** Solo socios (admins): métricas ML, predicciones y analítica pasiva */
  canViewAdvancedMetrics: boolean
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
        canViewAdvancedMetrics: true, // socio = admin en calpulli
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
        canViewAdvancedMetrics: false,
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
        canViewAdvancedMetrics: false,
      }
  }
}
