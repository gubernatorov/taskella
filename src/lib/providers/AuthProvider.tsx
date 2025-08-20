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
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // РАДИКАЛЬНОЕ ИЗМЕНЕНИЕ: Немедленно устанавливаем isLoading в false после монтирования
  // чтобы избежать блокировки UI при инициализации
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      console.log('🔄 AuthProvider: isLoading set to false after timeout')
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Предотвращаем повторную инициализацию
    if (hasInitialized) return

    const initAuth = async () => {
      console.log('🔄 AuthProvider initAuth started')
      setHasInitialized(true)
      
      // Проверяем, не находимся ли мы в процессе аутентификации
      const authInProgress = typeof window !== 'undefined' ? sessionStorage.getItem('auth_in_progress') === 'true' : false
      if (authInProgress) {
        console.log('🎫 Authentication in progress, skipping validation')
        setIsLoading(false)
        return
      }
      
      // Проверяем, не был ли пользователь только что аутентифицирован
      const justAuthenticated = typeof window !== 'undefined' ? sessionStorage.getItem('just_authenticated') === 'true' : false
      if (justAuthenticated) {
        console.log('🎫 User just authenticated, skipping validation')
        // Загружаем токен из localStorage
        const savedToken = localStorage.getItem('auth_token')
        if (savedToken) {
          setToken(savedToken)
          // Пытаемся загрузить пользователя, но не блокируем если не получится
          try {
            const user = await authApi.getMe()
            setUser(user)
          } catch (error) {
            console.log('⚠️ Could not load user data, will retry later')
          }
        }
        setIsLoading(false)
        setIsInitialized(true)
        return
      }
      
      // Проверяем, находимся ли мы в Telegram WebApp
      const isTelegramApp = typeof window !== 'undefined' && window.Telegram?.WebApp?.initData
      
      // Если мы в Telegram WebApp и нет токена, не пытаемся валидировать
      // Пусть страница логина обработает аутентификацию
      if (isTelegramApp && !localStorage.getItem('auth_token')) {
        console.log('📱 Telegram WebApp detected without token, skipping validation')
        setIsLoading(false)
        setIsInitialized(true)
        return
      }
      
      // Для продакшн-режима: если нет токена и это не Telegram WebApp,
      // сразу помечаем как инициализированное, чтобы избежать бесконечного редиректа
      if (!localStorage.getItem('auth_token') && !isTelegramApp && process.env.NODE_ENV === 'production') {
        console.log('🌐 Production mode: no token found, marking as initialized to prevent redirect loop')
        setIsLoading(false)
        setIsInitialized(true)
        return
      }
      
      // Проверяем сохраненный токен при инициализации
      const savedToken = localStorage.getItem('auth_token')
      console.log('🔍 Saved token exists:', !!savedToken)
      
      if (savedToken) {
        setToken(savedToken)
        console.log('✅ Token set in state')
        
        try {
          // Валидируем токен и получаем пользователя
          console.log('🔍 Validating token with API...')
          const user = await authApi.getMe()
          console.log('✅ User loaded successfully:', user?.id)
          setUser(user)
        } catch (error: any) {
          console.error('❌ Auth validation error:', error)
          // Проверяем, является ли ошибка ошибкой "Пользователь не найден"
          // Это может произойти после очистки БД или при первом запуске в продакшене
          if (error?.message === 'Пользователь не найден' || error?.code === 'USER_NOT_FOUND') {
            console.log('🧹 User not found in database, clearing token and user state')
            // Очищаем токен и состояние пользователя
            localStorage.removeItem('auth_token')
            setToken(null)
            setUser(null)
          } else if (error?.code === 'NETWORK_ERROR' || error?.isNetworkError ||
                    (error?.message && (error.message.includes('Failed to fetch') ||
                                      error.message.includes('Сетевая ошибка')))) {
            // Ошибка сети или API недоступен
            console.log('🌐 API unavailable, keeping token for retry')
            // Не очищаем токен, просто устанавливаем isLoading в false
            // Это позволит пользователю продолжить работу с приложением
          } else {
            // Другие ошибки валидации токена
            console.log('🧹 Other validation error, clearing token')
            localStorage.removeItem('auth_token')
            setToken(null)
            setUser(null)
          }
        }
      } else {
        console.log('📝 No saved token found')
      }
      
      console.log('✅ AuthProvider initialization complete, setting isLoading to false')
      setIsLoading(false)
      setIsInitialized(true)
    }

    initAuth()
  }, [hasInitialized])

  const login = async (initData: string) => {
    const timestamp = new Date().toISOString()
    console.log(`🔐 [${timestamp}] LOGIN PROCESS START`)
    console.log(`  - InitData length: ${initData.length}`)
    console.log(`  - InitData preview: ${initData.substring(0, 100) + '...'}`)
    
    try {
      console.log(`📡 [${timestamp}] Calling auth API...`)
      const response = await authApi.login({ initData })
      
      console.log(`✅ [${timestamp}] LOGIN SUCCESS:`)
      console.log(`  - User ID: ${response.user.id}`)
      console.log(`  - Username: ${response.user.username || 'N/A'}`)
      console.log(`  - Token length: ${response.token.length}`)
      
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('auth_token', response.token)
      
      // Устанавливаем cookie для серверных запросов
      if (typeof window !== 'undefined') {
        document.cookie = `auth_token=${response.token}; path=/; max-age=2592000; secure; samesite=lax`
        console.log(`🍪 [${timestamp}] Cookie set for auth token`)
        sessionStorage.setItem('just_authenticated', 'true')
        console.log(`🎫 [${timestamp}] Just authenticated flag set`)
        
        // Очищаем флаг через небольшую задержку, чтобы избежать циклов
        setTimeout(() => {
          sessionStorage.removeItem('just_authenticated')
          console.log(`🧹 [${timestamp}] Just authenticated flag cleared after timeout`)
        }, 2000)
      }
    } catch (error: any) {
      const errorTimestamp = new Date().toISOString()
      console.error(`❌ [${errorTimestamp}] LOGIN ERROR:`)
      console.error(`  - Error Type: ${error?.constructor?.name || 'Unknown'}`)
      console.error(`  - Error Message: ${error?.message || 'Unknown error'}`)
      console.error(`  - Error Code: ${error?.code || 'No code'}`)
      console.error(`  - Error Stack: ${error?.stack || 'No stack trace'}`)
      throw error
    }
  }

  const devLogin = async (userData: DevAuthRequest['user']) => {
    const timestamp = new Date().toISOString()
    console.log(`🔐 [${timestamp}] DEV LOGIN PROCESS START`)
    console.log(`  - User Data:`, userData)
    
    try {
      console.log(`📡 [${timestamp}] Calling dev auth API...`)
      const response = await authApi.devLogin({ user: userData })
      
      console.log(`✅ [${timestamp}] DEV LOGIN SUCCESS:`)
      console.log(`  - User ID: ${response.user.id}`)
      console.log(`  - Username: ${response.user.username || 'N/A'}`)
      console.log(`  - Token length: ${response.token.length}`)
      
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('auth_token', response.token)
      
      // Устанавливаем cookie для серверных запросов
      if (typeof window !== 'undefined') {
        document.cookie = `auth_token=${response.token}; path=/; max-age=2592000; secure; samesite=lax`
        console.log(`🍪 [${timestamp}] Cookie set for auth token`)
        sessionStorage.setItem('just_authenticated', 'true')
        console.log(`🎫 [${timestamp}] Just authenticated flag set`)
        
        // Очищаем флаг через небольшую задержку, чтобы избежать циклов
        setTimeout(() => {
          sessionStorage.removeItem('just_authenticated')
          console.log(`🧹 [${timestamp}] Just authenticated flag cleared after timeout`)
        }, 2000)
      }
    } catch (error: any) {
      const errorTimestamp = new Date().toISOString()
      console.error(`❌ [${errorTimestamp}] DEV LOGIN ERROR:`)
      console.error(`  - Error Type: ${error?.constructor?.name || 'Unknown'}`)
      console.error(`  - Error Message: ${error?.message || 'Unknown error'}`)
      console.error(`  - Error Code: ${error?.code || 'No code'}`)
      console.error(`  - Error Stack: ${error?.stack || 'No stack trace'}`)
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
      // Очищаем все флаги сессии
      sessionStorage.removeItem('just_authenticated')
      sessionStorage.removeItem('auth_in_progress')
    }
    
    console.log(`✅ [${timestamp}] LOGOUT COMPLETED`)
    console.log(`  - User state cleared`)
    console.log(`  - Token state cleared`)
    console.log(`  - LocalStorage cleared`)
    console.log(`  - Cookie cleared`)
    console.log(`  - Session flags cleared`)
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
