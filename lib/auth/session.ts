import { NextApiRequest, NextApiResponse } from 'next'

interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
}

export interface AuthSession {
  user: AuthUser
  token: string
}

export async function getSession(req: NextApiRequest): Promise<AuthSession | null> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  // In a real app, verify JWT token here
  // For demo, we'll decode from localStorage or use mock
  try {
    // This is a simplified version - in production, verify JWT properly
    const userData = localStorage.getItem('authUser')
    if (userData) {
      const user = JSON.parse(userData)
      return { user, token }
    }
  } catch (e) {
    // Ignore
  }

  return null
}

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthSession | null> {
  const session = await getSession(req)
  if (!session) {
    res.status(401).json({ error: 'No autorizado' })
    return null
  }
  return session
}
