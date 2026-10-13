// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET  /api/referrals/me   — Mi código de referido (solo employee/admin)
// POST /api/referrals/claim — Atribuye mi cuenta al referido de la cookie
import { getSessionUser, permissionsFor, type Role } from '@/lib/auth'
import { ensureReferralCode, findByCode, attributeUser } from '@/lib/referrals'

function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of (header || '').split(';')) {
    const index = part.indexOf('=')
    if (index === -1) continue
    out[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim())
  }
  return out
}

export default async function handler(req, res) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const actor = await getSessionUser(token)
  if (!actor) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const permissions = await permissionsFor(actor.role as Role)

    if (req.method === 'GET') {
      if (!permissions.canBeReferrer) {
        return res.status(403).json({ error: 'Tu rol no puede tener código de referido' })
      }

      const referral = await ensureReferralCode(
        actor.id,
        actor.email,
        `${actor.firstName ?? ''} ${actor.lastName ?? ''}`.trim() || null
      )

      const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? ''
      return res.status(200).json({
        referralCode: referral.referralCode,
        shareUrl: origin ? `${origin}/?ref=${referral.referralCode}` : null,
        commissionRate: referral.commissionRate,
        status: referral.status,
      })
    }

    if (req.method === 'POST') {
      // Atribución: el cliente acepta ser atribuido a un referido.
      const cookies = parseCookies(req.headers.cookie)
      const ref = cookies.calpulli_ref || req.body?.ref

      const referral = await findByCode(ref)
      if (!referral)
        return res.status(200).json({ attributed: false, reason: 'sin referido válido' })

      // Nadie se auto-referencia.
      if (referral.userId === actor.id) {
        return res.status(200).json({ attributed: false, reason: 'auto-referencia' })
      }

      const ok = await attributeUser({
        referral,
        referredUserId: actor.id,
        campaign: typeof req.body?.campaign === 'string' ? req.body.campaign.slice(0, 80) : null,
        source: 'profile',
      })

      return res.status(200).json({ attributed: ok })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Referrals error:', error)
    return res.status(500).json({ error: 'Failed to process referral' })
  }
}
