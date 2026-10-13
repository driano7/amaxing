// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET  /api/admin/referrals        — métricas del referido del actor (o todas, si es admin)
// POST /api/admin/referrals/status — pausa/reactiva un código
import { getSessionUser, logAccess, permissionsFor, type Role } from '@/lib/auth'
import { turso } from '@/lib/turso'
import { ensureReferralCode, getReferralStats } from '@/lib/referrals'

export default async function handler(req, res) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const actor = await getSessionUser(token)
  if (!actor) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const permissions = await permissionsFor(actor.role as Role)
    if (!permissions.canBeReferrer) {
      return res.status(403).json({ error: 'Tu rol no tiene referidos' })
    }

    if (req.method === 'GET') {
      // Admin ve todas las filas; cada quien ve la suya.
      if (permissions.canViewReferralStats && req.query.all === '1') {
        const codes = await turso.execute({
          sql: `SELECT rc.*,
                  (SELECT COUNT(*) FROM referral_visits v WHERE v.referral_code_id = rc.id) AS visits,
                  (SELECT COUNT(*) FROM referral_attributions a WHERE a.referral_code_id = rc.id) AS attributed,
                  (SELECT COUNT(*) FROM referral_conversions c WHERE c.referral_code_id = rc.id) AS conversions,
                  (SELECT COALESCE(SUM(c.amount), 0) FROM referral_conversions c WHERE c.referral_code_id = rc.id) AS revenue
                FROM referral_codes rc
                ORDER BY rc.created_at DESC`,
          args: [],
        })

        return res.status(200).json({
          all: codes.rows.map((r: any) => ({
            id: r.id,
            email: r.email,
            displayName: r.display_name,
            referralCode: r.referral_code,
            status: r.status,
            commissionRate: r.commission_rate,
            visits: Number(r.visits) || 0,
            attributed: Number(r.attributed) || 0,
            conversions: Number(r.conversions) || 0,
            revenue: Number(r.revenue) || 0,
          })),
        })
      }

      const referral = await ensureReferralCode(
        actor.id,
        actor.email,
        `${actor.firstName ?? ''} ${actor.lastName ?? ''}`.trim() || null
      )
      const stats = await getReferralStats(referral.id)
      return res.status(200).json({ stats })
    }

    if (req.method === 'POST') {
      if (!permissions.canViewReferralStats) {
        return res.status(403).json({ error: 'Solo un admin gestiona los referidos' })
      }

      const { referralCode, status } = req.body ?? {}
      if (!referralCode || !['active', 'paused'].includes(status)) {
        return res.status(400).json({ error: 'referralCode y status (active|paused) requeridos' })
      }

      const result = await turso.execute({
        sql: 'UPDATE referral_codes SET status = ? WHERE referral_code = ?',
        args: [status, String(referralCode).toUpperCase()],
      })

      if (!result.rowsAffected) return res.status(404).json({ error: 'Código no encontrado' })

      await logAccess({
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        action: 'referral_status',
        targetEmail: String(referralCode),
        details: { status },
        ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? null,
      })

      return res.status(200).json({ success: true, referralCode, status })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin referrals error:', error)
    return res.status(500).json({ error: 'Failed to process referrals' })
  }
}
