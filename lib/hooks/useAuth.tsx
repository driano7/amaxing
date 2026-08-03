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

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    if (savedToken) {
      setToken(savedToken)
      verifyToken(savedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setUser(result.user)
        setToken(tokenToVerify)
      } else {
        localStorage.removeItem('authToken')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Error verifying token:', error)
      localStorage.removeItem('authToken')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('authToken', newToken)
  }

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('/api/auth/me', {
          method: 'DELETE',
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
