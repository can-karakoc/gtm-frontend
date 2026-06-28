'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  username: string
  full_name: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      console.log('[AUTH] Restoring session...')
      try {
        // Try to get token from localStorage
        const token = localStorage.getItem('gtm_token')
        console.log('[AUTH] Token from localStorage:', token ? 'EXISTS' : 'MISSING')

        if (token) {
          // Validate token with backend
          console.log('[AUTH] Validating token with:', `${API_URL}/api/auth/me`)
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          console.log('[AUTH] Validation response status:', response.status)

          if (response.ok) {
            const userData = await response.json()
            console.log('[AUTH] User data received:', userData)
            setUser(userData)
          } else {
            // Token invalid, clear it
            console.log('[AUTH] Token invalid, clearing storage')
            localStorage.removeItem('gtm_token')
            localStorage.removeItem('gtm_user')
          }
        }
      } catch (error) {
        console.error('[AUTH] Session restore failed:', error)
      } finally {
        console.log('[AUTH] Setting loading=false')
        setLoading(false)
      }
    }

    restoreSession()
  }, [API_URL])

  async function login(username: string, password: string, rememberMe = true) {
    console.log('[AUTH] Login attempt:', username, 'rememberMe:', rememberMe)
    console.log('[AUTH] API URL:', API_URL)

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, remember_me: rememberMe })
    })

    console.log('[AUTH] Login response status:', response.status)
    const data = await response.json()
    console.log('[AUTH] Login response data:', data)

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed')
    }

    const userData = data.user
    const token = data.token
    console.log('[AUTH] Setting user:', userData)
    console.log('[AUTH] Token received:', token ? 'YES' : 'NO')
    setUser(userData)

    // Save token and user to localStorage
    if (rememberMe) {
      console.log('[AUTH] Saving to localStorage')
      localStorage.setItem('gtm_token', token)
      localStorage.setItem('gtm_user', JSON.stringify(userData))
    }
    console.log('[AUTH] Login complete!')
  }

  async function logout() {
    try {
      const token = localStorage.getItem('gtm_token')
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('gtm_token')
      localStorage.removeItem('gtm_user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
