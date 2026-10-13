// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/referrals/track?ref=CODIGO — Registra el clic y devuelve el destino.
// Público por diseño: es el enlace de compartido.
import { findByCode, recordVisit } from '@/lib/referrals'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const ref = req.query.ref
  const referral = await findByCode(ref)

  // Un ref inválido no rompe nada: solo no se atribuye.
  if (!referral) {
    res.setHeader('Set-Cookie', 'calpulli_ref=; Max-Age=0; Path=/; SameSite=Lax')
    return res.status(200).json({ tracked: false })
  }

  await recordVisit({
    referral,
    visitUrl: typeof req.query.url === 'string' ? req.query.url : null,
    referrerUrl: (req.headers.referer as string) || null,
    ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || null,
    userAgent: req.headers['user-agent'] as string,
  })

  // 30 días, como en Cripte.
  res.setHeader(
    'Set-Cookie',
    `calpulli_ref=${encodeURIComponent(
      referral.referralCode
    )}; Max-Age=2592000; Path=/; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`
  )

  return res.status(200).json({
    tracked: true,
    referralCode: referral.referralCode,
  })
}
