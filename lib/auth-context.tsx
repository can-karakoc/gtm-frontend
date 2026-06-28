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
      try {
        // Try to get user from API (cookie is auto-sent)
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include' // Include cookies
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // Try localStorage as fallback
          const savedUser = localStorage.getItem('gtm_user')
          if (savedUser) {
            setUser(JSON.parse(savedUser))
          }
        }
      } catch (error) {
        console.error('Session restore failed:', error)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [API_URL])

  async function login(username: string, password: string, rememberMe = true) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies
      body: JSON.stringify({ username, password, remember_me: rememberMe })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed')
    }

    const userData = data.user
    setUser(userData)

    // Also save to localStorage for quick restore
    if (rememberMe) {
      localStorage.setItem('gtm_user', JSON.stringify(userData))
    }
  }

  async function logout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
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
