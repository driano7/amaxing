import type { NextApiRequest, NextApiResponse } from 'next'
import { encryptUserData, decryptUserData, generateDataHash } from '@/lib/server-encryption'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, email, data } = req.body

  if (!email || !data) {
    return res.status(400).json({ error: 'Email and data are required' })
  }

  try {
    if (action === 'encrypt') {
      const encrypted = encryptUserData(email, data)
      const hash = generateDataHash(JSON.stringify(data))
      return res.status(200).json({ success: true, encrypted, hash })
    }

    if (action === 'decrypt') {
      const decrypted = decryptUserData(email, data)
      return res.status(200).json({ success: true, decrypted })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    console.error('Encryption API error:', error)
    return res.status(500).json({ error: 'Encryption failed' })
  }
}
