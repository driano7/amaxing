'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/router'

interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  updateUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fallbackContext: AuthContextType = {
  user: null,
  token: null,
  isLoading: false,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context || fallbackContext
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const verifyToken = useCallback(async (tokenToVerify: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      })

      if (!response.ok) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        setToken(null)
        setUser(null)
        return
      }

      const result = await response.json()
      const verified = result?.user as AuthUser | undefined

      if (!verified) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        setToken(null)
        setUser(null)
        return
      }

      // La sesión válida en Turso es la fuente de verdad.
      setUser(verified)
      setToken(tokenToVerify)
      localStorage.setItem('authUser', JSON.stringify(verified))
    } catch (error) {
      console.error('Error verifying token:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const restoreSession = useCallback(() => {
    const savedToken = localStorage.getItem('authToken')
    if (savedToken) {
      // Siempre validado contra el servidor: nunca confiar en localStorage solo.
      void verifyToken(savedToken)
    } else {
      localStorage.removeItem('authUser')
      setToken(null)
      setUser(null)
      setIsLoading(false)
    }
  }, [verifyToken])

  useEffect(() => {
    restoreSession()
    // Login/register pages dispatch 'authChange' after writing localStorage
    window.addEventListener('authChange', restoreSession)
    return () => window.removeEventListener('authChange', restoreSession)
  }, [restoreSession])

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('authToken', newToken)
    localStorage.setItem('authUser', JSON.stringify(newUser))
  }

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      router.push('/')
    }
  }, [router, token])

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser)
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
