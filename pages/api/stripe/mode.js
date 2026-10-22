// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Modo de pago de Stripe, para poder avisarlo en la interfaz.
 *
 * El navegador no puede saber si hay llave de prueba o si el cobro se esta
 * simulando: eso solo se ve desde el servidor. La respuesta es publica a
 * proposito (no lleva ningun dato), para que el checkout pueda mostrar si el
 * pago es real, de prueba o una simulacion.
 *
 *   mock -> no hay llave, o no es de prueba: el checkout se simula
 *   test -> hay llave sk_test_: Stripe de pruebas, no se cobra de verdad
 *   live -> hay llave sk_ o pk_live_: cobro real
 */
export const config = { runtime: 'nodejs' }

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_PRIVATE || ''

  let mode = 'mock'
  if (key.startsWith('sk_test_')) mode = 'test'
  else if (key.startsWith('sk_live_') || key.startsWith('sk_')) mode = 'live'

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ mode, demo: mode !== 'live' })
}
