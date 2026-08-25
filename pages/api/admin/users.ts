import type { NextApiRequest, NextApiResponse } from 'next'
import { getSessionFromRequest, resolveRole, getPermissions } from '@/lib/roles'
import { decryptWithEmail } from '@/lib/server-encryption'

/**
 * GET /api/admin/users
 *
 * Lista de usuarios con datos cifrados. El nivel de visibilidad depende del rol:
 *  - admin: ve TODO y puede pedir ?decrypt=1 para descifrar campos sensibles (nombre,
 *    apellido, teléfono) vía AES-256-GCM derivado del email (mismo esquema XocoCafe).
 *  - employee: solo ve lo estrictamente necesario (id, iniciales, tour reservado,
 *    fecha, estado). NUNCA recibe los payloads cifrados.
 *  - client: 403.
 */

// Mock de usuarios "en BD". Los campos *Encrypted/*Iv/*Tag/*Salt son hex reales
// generados con encryptWithEmail(email, valor) para que el descifrado funcione de verdad.
const MOCK_USERS = [
  {
    id: 'u1',
    email: 'maria.garcia@example.com',
    firstNameEncrypted: null as string | null,
    firstNameIv: null as string | null,
    firstNameTag: null as string | null,
    firstNameSalt: null as string | null,
    lastNameEncrypted: null as string | null,
    lastNameIv: null as string | null,
    lastNameTag: null as string | null,
    lastNameSalt: null as string | null,
    phoneEncrypted: null as string | null,
    phoneIv: null as string | null,
    phoneTag: null as string | null,
    phoneSalt: null as string | null,
    // Fallback visible sin descifrar (iniciales/mask)
    displayNameMask: 'M***a',
    initials: 'MG',
    bookingsCount: 4,
    totalSpent: 8600,
    lastTour: 'Ruta del Jaguar en Baja',
    lastTourDate: '2025-02-15',
    status: 'active',
    createdAt: '2024-06-12T10:00:00Z',
  },
  {
    id: 'u2',
    email: 'jorge.luna@example.com',
    firstNameEncrypted: null,
    firstNameIv: null,
    firstNameTag: null,
    firstNameSalt: null,
    lastNameEncrypted: null,
    lastNameIv: null,
    lastNameTag: null,
    lastNameSalt: null,
    phoneEncrypted: null,
    phoneIv: null,
    phoneTag: null,
    phoneSalt: null,
    displayNameMask: 'J***a',
    initials: 'JL',
    bookingsCount: 2,
    totalSpent: 4300,
    lastTour: 'Historia Viva: Centro Histórico CDMX',
    lastTourDate: '2025-01-20',
    status: 'active',
    createdAt: '2024-09-03T14:30:00Z',
  },
  {
    id: 'u3',
    email: 'ana.rodriguez@example.com',
    firstNameEncrypted: null,
    firstNameIv: null,
    firstNameTag: null,
    firstNameSalt: null,
    lastNameEncrypted: null,
    lastNameIv: null,
    lastNameTag: null,
    lastNameSalt: null,
    phoneEncrypted: null,
    phoneIv: null,
    phoneTag: null,
    phoneSalt: null,
    displayNameMask: 'A***z',
    initials: 'AR',
    bookingsCount: 6,
    totalSpent: 15400,
    lastTour: 'Sabores de Oaxaca: Mercado 20 de Noviembre',
    lastTourDate: '2025-04-05',
    status: 'vip',
    createdAt: '2024-01-22T08:15:00Z',
  },
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const session = getSessionFromRequest(req)
  if (!session || !session.email) {
    return res.status(401).json({ success: false, message: 'No autenticado' })
  }

  const role = resolveRole(session.email)
  if (role === 'client') {
    return res.status(403).json({ success: false, message: 'Sin permisos' })
  }

  const permissions = getPermissions(role)

  // Modo demo: si la petición pide decrypt pero el rol no permite, se rechaza explícitamente
  const wantsDecrypt = req.query.decrypt === '1'
  if (wantsDecrypt && !permissions.canDecryptSensitiveFields) {
    return res.status(403).json({
      success: false,
      message: 'Tu rol no permite descifrar datos sensibles de clientes.',
    })
  }

  // ── Aquí iría la lectura real de Supabase (select de columnas cifradas) ──
  // Para el mock, poblamos los payloads cifrados en caliente usando encryptWithEmail
  // con el MISMO esquema que usará producción, así decryptWithEmail funciona real.
  const { encryptWithEmail } = await import('@/lib/server-encryption')

  const seedUsers = [
    { ...MOCK_USERS[0], plainFirst: 'María', plainLast: 'García', plainPhone: '+52 55 1234 5678' },
    { ...MOCK_USERS[1], plainFirst: 'Jorge', plainLast: 'Luna', plainPhone: '+52 81 8765 4321' },
    { ...MOCK_USERS[2], plainFirst: 'Ana', plainLast: 'Rodríguez', plainPhone: '+52 33 2233 4455' },
  ].map((u) => {
    const enc = encryptWithEmail(u.email, u.plainFirst)
    const encLast = encryptWithEmail(u.email, u.plainLast)
    const encPhone = encryptWithEmail(u.email, u.plainPhone)
    return {
      id: u.id,
      email: u.email,
      firstNameEncrypted: enc.encryptedData,
      firstNameIv: enc.iv,
      firstNameTag: enc.tag,
      firstNameSalt: enc.salt,
      lastNameEncrypted: encLast.encryptedData,
      lastNameIv: encLast.iv,
      lastNameTag: encLast.tag,
      lastNameSalt: encLast.salt,
      phoneEncrypted: encPhone.encryptedData,
      phoneIv: encPhone.iv,
      phoneTag: encPhone.tag,
      phoneSalt: encPhone.salt,
      displayNameMask: u.displayNameMask,
      initials: u.initials,
      bookingsCount: u.bookingsCount,
      totalSpent: u.totalSpent,
      lastTour: u.lastTour,
      lastTourDate: u.lastTourDate,
      status: u.status,
      createdAt: u.createdAt,
    }
  })

  let users = seedUsers

  // Descifrado REAL server-side — solo admin
  if (wantsDecrypt && permissions.canDecryptSensitiveFields) {
    users = users.map((u) => {
      const dec = decryptWithEmail(
        u.email,
        u.firstNameEncrypted!,
        u.firstNameIv!,
        u.firstNameTag!,
        u.firstNameSalt!
      )
      const decLast = decryptWithEmail(
        u.email,
        u.lastNameEncrypted!,
        u.lastNameIv!,
        u.lastNameTag!,
        u.lastNameSalt!
      )
      const decPhone = decryptWithEmail(
        u.email,
        u.phoneEncrypted!,
        u.phoneIv!,
        u.phoneTag!,
        u.phoneSalt!
      )
      return {
        id: u.id,
        email: u.email,
        firstName: dec.success ? dec.decryptedData : '(error)',
        lastName: decLast.success ? decLast.decryptedData : '(error)',
        phone: decPhone.success ? decPhone.decryptedData : '(error)',
        bookingsCount: u.bookingsCount,
        totalSpent: u.totalSpent,
        lastTour: u.lastTour,
        lastTourDate: u.lastTourDate,
        status: u.status,
        createdAt: u.createdAt,
        decrypted: true,
      }
    })
  } else {
    // Vista limitada: sin payloads cifrados jamás salen del servidor
    users = users.map((u) => ({
      id: u.id,
      email: role === 'admin' ? u.email : u.email.replace(/^(.).*(@.*)$/, '$1•••$2'),
      displayNameMask: u.displayNameMask,
      initials: u.initials,
      bookingsCount: u.bookingsCount,
      totalSpent: role === 'admin' ? u.totalSpent : undefined,
      lastTour: u.lastTour,
      lastTourDate: u.lastTourDate,
      status: u.status,
      createdAt: u.createdAt,
      decrypted: false,
    }))
  }

  return res.status(200).json({
    success: true,
    data: {
      role,
      permissions,
      count: users.length,
      users,
    },
  })
}
