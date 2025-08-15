'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthResponse } from '@/types/auth'
import { authApi, DevAuthRequest } from '@/lib/api/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
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

  useEffect(() => {
    // Предотвращаем повторную инициализацию
    if (hasInitialized) return

    setHasInitialized(true)
    
    // Проверяем сохраненный токен при инициализации
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
      // Валидируем токен и получаем пользователя
      authApi.getMe()
        .then((user) => {
          setUser(user)
        })
        .catch((error) => {
          console.error('Auth validation error:', error)
          // Проверяем, является ли ошибка ошибкой "Пользователь не найден"
          // Это может произойти после очистки БД или при первом запуске в продакшене
          if (error.message === 'Пользователь не найден' || error.code === 'USER_NOT_FOUND') {
            console.log('User not found in database, clearing token and user state')
            // Очищаем токен и состояние пользователя
            localStorage.removeItem('auth_token')
            setToken(null)
            setUser(null)
          } else if (error.code === 'NETWORK_ERROR' || error.isNetworkError ||
                    (error.message && (error.message.includes('Failed to fetch') ||
                                      error.message.includes('Сетевая ошибка')))) {
            // Ошибка сети или API недоступен
            console.log('API unavailable, keeping token for retry')
            // Не очищаем токен, просто устанавливаем isLoading в false
            // Это позволит пользователю продолжить работу с приложением
          } else {
            // Другие ошибки валидации токена
            localStorage.removeItem('auth_token')
            setToken(null)
            setUser(null)
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [hasInitialized])

  const login = async (initData: string) => {
    try {
      const response = await authApi.login({ initData })
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('auth_token', response.token)
      // Устанавливаем флаг недавней аутентификации
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('just_authenticated', 'true')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const devLogin = async (userData: DevAuthRequest['user']) => {
    try {
      const response = await authApi.devLogin({ user: userData })
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('auth_token', response.token)
      // Устанавливаем флаг недавней аутентификации
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('just_authenticated', 'true')
      }
    } catch (error) {
      console.error('Dev login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, devLogin, logout }}>
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