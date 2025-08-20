'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthResponse } from '@/types/auth'
import { authApi, DevAuthRequest } from '@/lib/api/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean
  login: (initData: string) => Promise<void>
  devLogin: (userData: DevAuthRequest['user']) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Максимально простая инициализация - сразу разблокируем UI
  useEffect(() => {
    console.log('🔄 AuthProvider: Starting initialization')
    
    // Немедленно разблокируем UI, чтобы избежать блокировки
    setIsLoading(false)
    setIsInitialized(true)
    
    // Загружаем токен из localStorage в фоновом режиме
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      console.log('✅ Token found in localStorage')
      setToken(savedToken)
      
      // Пытаемся загрузить пользователя, но не блокируем UI если не получится
      authApi.getMe()
        .then(user => {
          console.log('✅ User loaded successfully:', user?.id)
          setUser(user)
        })
        .catch(error => {
          console.log('⚠️ Could not load user data:', error)
          // Если не удалось загрузить пользователя, очищаем токен
          localStorage.removeItem('auth_token')
          setToken(null)
        })
    } else {
      console.log('📝 No token found in localStorage')
    }
  }, [])

  const login = async (initData: string) => {
    const timestamp = new Date().toISOString()
    console.log(`🔐 [${timestamp}] LOGIN PROCESS START`)
    
    try {
      console.log(`📡 [${timestamp}] Calling auth API...`)
      const response = await authApi.login({ initData })
      
      console.log(`✅ [${timestamp}] LOGIN SUCCESS:`)
      console.log(`  - User ID: ${response.user.id}`)
      console.log(`  - Token length: ${response.token.length}`)
      
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('auth_token', response.token)
      
      // Устанавливаем cookie для серверных запросов (если нужно)
      if (typeof window !== 'undefined') {
        document.cookie = `auth_token=${response.token}; path=/; max-age=2592000; secure; samesite=lax`
        console.log(`🍪 [${timestamp}] Cookie set for auth token`)
      }
    } catch (error: any) {
      console.error(`❌ [${timestamp}] LOGIN ERROR:`, error)
      throw error
    }
  }

  const devLogin = async (userData: DevAuthRequest['user']) => {
    const timestamp = new Date().toISOString()
    console.log(`🔐 [${timestamp}] DEV LOGIN PROCESS START`)
    
    try {
      console.log(`📡 [${timestamp}] Calling dev auth API...`)
      const response = await authApi.devLogin({ user: userData })
      
      console.log(`✅ [${timestamp}] DEV LOGIN SUCCESS:`)
      console.log(`  - User ID: ${response.user.id}`)
      console.log(`  - Token length: ${response.token.length}`)
      
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('auth_token', response.token)
      
      // Устанавливаем cookie для серверных запросов (если нужно)
      if (typeof window !== 'undefined') {
        document.cookie = `auth_token=${response.token}; path=/; max-age=2592000; secure; samesite=lax`
        console.log(`🍪 [${timestamp}] Cookie set for auth token`)
      }
    } catch (error: any) {
      console.error(`❌ [${timestamp}] DEV LOGIN ERROR:`, error)
      throw error
    }
  }

  const logout = () => {
    const timestamp = new Date().toISOString()
    console.log(`🚪 [${timestamp}] LOGOUT PROCESS START`)
    
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    
    // Очищаем cookie
    if (typeof window !== 'undefined') {
      document.cookie = 'auth_token=; path=/; max-age=0; secure; samesite=lax'
      console.log(`🍪 [${timestamp}] Cookie cleared`)
    }
    
    console.log(`✅ [${timestamp}] LOGOUT COMPLETED`)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isInitialized, login, devLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
