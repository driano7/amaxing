import type { NextApiRequest, NextApiResponse } from 'next'
import { getSessionFromRequest, resolveRole } from '@/lib/roles'

/**
 * GET /api/admin/stats
 * Métricas del panel. Admin: totales completos. Empleado: métricas operativas del día.
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
  if (role === 'client') {
    return res.status(403).json({ success: false, message: 'Sin permisos' })
  }

  // Mocks — al conectar Supabase se reemplazan por agregaciones reales
  const adminStats = {
    totalUsers: 342,
    totalBookings: 891,
    totalRevenue: 2145800,
    activeTours: 12,
    usersByMonth: [
      { label: 'mar', value: 28 },
      { label: 'abr', value: 35 },
      { label: 'may', value: 41 },
      { label: 'jun', value: 38 },
      { label: 'jul', value: 52 },
      { label: 'ago', value: 61 },
    ],
    bookingsByCategory: [
      { label: 'Gastronomía', value: 320 },
      { label: 'Historia', value: 240 },
      { label: 'Barrios', value: 190 },
      { label: 'Museos', value: 141 },
    ],
    recentAudit: [
      {
        action: 'decrypt_field',
        actor: 'admin@amaxing.mx',
        target: 'ana.r•••',
        at: '2025-08-24T18:22:00Z',
      },
      {
        action: 'grant_role',
        actor: 'admin@amaxing.mx',
        target: 'empleado2@amaxing.mx',
        at: '2025-08-23T11:05:00Z',
      },
      {
        action: 'export_gdpr',
        actor: 'admin@amaxing.mx',
        target: 'maria.g•••',
        at: '2025-08-21T09:40:00Z',
      },
    ],
  }

  const employeeStats = {
    toursToday: 4,
    guestsToday: 38,
    checkinsPending: 6,
    toursThisWeek: 19,
    upcomingTours: [
      { time: '09:00', title: 'Ruta del Jaguar en Baja', guests: 12 },
      { time: '11:30', title: 'Historia Viva: Centro Histórico', guests: 8 },
      { time: '16:00', title: 'Barrios Mágicos: Roma y Condesa', guests: 10 },
      { time: '18:30', title: 'Sabores de Oaxaca', guests: 8 },
    ],
  }

  return res.status(200).json({
    success: true,
    data: role === 'admin' ? adminStats : employeeStats,
  })
}
