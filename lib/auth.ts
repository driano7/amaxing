// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Autenticación real sobre Turso: hashing scrypt + sesiones persistidas + roles.
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { turso } from './turso'

const scrypt = promisify(_scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>

const KEYLEN = 64
export const SESSION_TTL_DAYS = 7

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: 'admin' | 'employee' | 'client'
  isEmailVerified: boolean
}

export type Role = AuthUser['role']

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, KEYLEN)
  return `scrypt$${salt}$${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false
  const [scheme, salt, expected] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !expected) return false
  const derived = await scrypt(password, salt, KEYLEN)
  const expectedBuf = Buffer.from(expected, 'hex')
  if (expectedBuf.length !== derived.length) return false
  return timingSafeEqual(derived, expectedBuf)
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export async function createSession(
  userId: string,
  meta: { ip?: string; userAgent?: string } = {}
): Promise<{ token: string; expiresAt: string }> {
  const token = generateSessionToken()
  const id = randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400_000).toISOString()

  await turso.execute({
    sql: `INSERT INTO sessions (id, "userId", token, "expiresAt", "ipAddress", "userAgent", "lastActivityAt")
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [id, userId, token, expiresAt, meta.ip ?? null, meta.userAgent ?? null],
  })

  await turso.execute({
    sql: `UPDATE users SET last_login_at = datetime('now'), failed_login_attempts = 0 WHERE id = ?`,
    args: [userId],
  })

  return { token, expiresAt }
}

export async function destroySession(token: string): Promise<void> {
  await turso.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] })
}

/** Resuelve el usuario de una sesión válida, o null. */
export async function getSessionUser(token: string | null): Promise<AuthUser | null> {
  if (!token) return null

  const result = await turso.execute({
    sql: `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role,
                 u.is_email_verified, u.is_active, s."expiresAt"
          FROM sessions s
          JOIN users u ON u.id = s."userId"
          WHERE s.token = ?`,
    args: [token],
  })

  const row: any = result.rows[0]
  if (!row) return null
  if (Number(row.is_active) !== 1) return null
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await destroySession(token)
    return null
  }

  await turso.execute({
    sql: `UPDATE sessions SET "lastActivityAt" = datetime('now') WHERE token = ?`,
    args: [token],
  })

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone ?? null,
    role: await resolveRole(row.id, row.email, row.role),
    isEmailVerified: Number(row.is_email_verified) === 1,
  }
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

const ROLE_PERMISSIONS: Record<Role, Record<string, boolean>> = {
  admin: {
    canManageUsers: true,
    canDecryptSensitiveFields: true,
    canManageAdmins: true,
    canExportGDPR: true,
    canViewAdvancedMetrics: true,
  },
  employee: {
    canManageUsers: false,
    canDecryptSensitiveFields: false,
    canManageAdmins: false,
    canExportGDPR: false,
    canViewAdvancedMetrics: false,
  },
  client: {
    canManageUsers: false,
    canDecryptSensitiveFields: false,
    canManageAdmins: false,
    canExportGDPR: false,
    canViewAdvancedMetrics: false,
  },
}

export function permissionsFor(role: Role) {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.client
}

export function panelsFor(role: Role): string[] {
  if (role === 'admin') return ['/profile', '/empleados', '/admin']
  if (role === 'employee') return ['/profile', '/empleados']
  return ['/profile']
}

function envEmails(name: string): string[] {
  return (process.env[name] || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Prioridad: ADMIN_EMAILS / EMPLOYEE_EMAILS (efecto inmediato) →
 * tabla user_roles (persistente) → users.role → client.
 */
export async function resolveRole(
  userId: string,
  email: string,
  usersRole?: string
): Promise<Role> {
  const normalized = (email || '').toLowerCase()

  if (envEmails('ADMIN_EMAILS').includes(normalized)) return 'admin'
  if (envEmails('EMPLOYEE_EMAILS').includes(normalized)) return 'employee'

  const result = await turso.execute({
    sql: 'SELECT role FROM user_roles WHERE "userId" = ? OR email = ? COLLATE NOCASE ORDER BY created_at DESC LIMIT 1',
    args: [userId, normalized],
  })

  const row: any = result.rows[0]
  if (row?.role === 'admin' || row?.role === 'employee' || row?.role === 'client') {
    return row.role
  }

  if (usersRole === 'admin' || usersRole === 'guide') return 'admin'
  if (usersRole === 'employee') return 'employee'
  return 'client'
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function findUserByEmail(email: string): Promise<any | null> {
  const result = await turso.execute({
    sql: `SELECT id, email, password_hash, first_name, last_name, phone, role,
                 is_email_verified, is_active, failed_login_attempts, account_locked_until
          FROM users WHERE email = ? COLLATE NOCASE`,
    args: [email.trim()],
  })
  return (result.rows[0] as any) ?? null
}

export async function registerUser(input: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase()
  const passwordHash = await hashPassword(input.password)

  const result = await turso.execute({
    sql: `INSERT INTO users (email, password_hash, first_name, last_name, is_email_verified)
          VALUES (?, ?, ?, ?, 0)
          RETURNING id`,
    args: [email, passwordHash, input.firstName.trim(), input.lastName.trim()],
  })

  const row: any = result.rows[0]
  const id = row?.id ?? row?.['id']
  if (!id) throw new Error('Could not create user')

  return {
    id,
    email,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: null,
    role: 'client',
    isEmailVerified: false,
  }
}

export async function recordFailedLogin(email: string): Promise<void> {
  await turso.execute({
    sql: `UPDATE users
          SET failed_login_attempts = failed_login_attempts + 1,
              account_locked_until = CASE
                WHEN failed_login_attempts + 1 >= 5 THEN datetime('now', '+15 minutes')
                ELSE account_locked_until END
          WHERE email = ? COLLATE NOCASE`,
    args: [email],
  })
}

export async function logAccess(params: {
  actorId: string | null
  actorEmail: string | null
  actorRole: string
  action: string
  targetEmail?: string | null
  details?: Record<string, unknown>
  ip?: string | null
}): Promise<void> {
  await turso.execute({
    sql: `INSERT INTO access_audit_logs
            (id, actor_id, actor_email, actor_role, action, target_email, details, ip)
          VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      params.actorId,
      params.actorEmail,
      params.actorRole,
      params.action,
      params.targetEmail ?? null,
      JSON.stringify(params.details ?? {}),
      params.ip ?? null,
    ],
  })
}
