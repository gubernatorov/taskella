'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
          }
        }
        close: () => void
        MainButton: {
          show: () => void
          hide: () => void
          setText: (text: string) => void
          onClick: (callback: () => void) => void
        }
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
        }
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
        }
      }
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { devLogin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTelegramApp, setIsTelegramApp] = useState(false)
  const [isDevMode, setIsDevMode] = useState(false)
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const handleTelegramLogin = useCallback(async () => {
    // Проверяем, не идет ли уже процесс аутентификации
    if (isLoading) {
      console.log('🔄 Authentication already in progress, skipping...')
      return
    }

    // Проверяем, не был ли уже запущен процесс аутентификации в этой сессии
    const authInProgress = sessionStorage.getItem('auth_in_progress')
    if (authInProgress === 'true') {
      console.log('🔄 Authentication already in progress (session flag), skipping...')
      return
    }

    const webApp = window.Telegram?.WebApp
    let initData = webApp?.initData

    // Если WebApp недоступен и мы в режиме разработки, используем тестовые данные
    if (!initData && isDevMode) {
      initData = 'dev_mode_test'
      console.log('Using dev mode for Telegram auth')
    }
    
    if (!initData) {
      setError('Telegram WebApp not available')
      return
    }

    setIsLoading(true)
    setError(null)
    
    // Устанавливаем флаг процесса аутентификации
    sessionStorage.setItem('auth_in_progress', 'true')
    console.log('🚀 Authentication process started, flag set')

    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: initData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
      
      // Сохраняем токен в localStorage для клиентской части
      localStorage.setItem('auth_token', data.token)
      
      // Устанавливаем cookie для серверных запросов
      document.cookie = `auth_token=${data.token}; path=/; max-age=2592000; secure; samesite=strict`
      
      // Устанавливаем флаг недавней аутентификации
      sessionStorage.setItem('just_authenticated', 'true')
      
      console.log('Token saved successfully in localStorage and cookie, redirecting to dashboard...')
      console.log('Cookie set:', document.cookie)
      
      // Очищаем флаг процесса аутентификации
      sessionStorage.removeItem('auth_in_progress')
      console.log('✅ Authentication process completed, flag cleared')
      
      // Добавляем небольшую задержку перед редиректом, чтобы cookie успел установиться
      setTimeout(() => {
        // Немедленный редирект без задержки
        router.push('/dashboard')
      }, 100)
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login'
      
      // Улучшенная обработка ошибок для продакшн-режима
      if ((err as any)?.code === 'NETWORK_ERROR' || (err as any)?.isNetworkError) {
        setError('Сервер недоступен. Пожалуйста, попробуйте позже.')
      } else if (errorMessage.includes('Пользователь не найден') || (err as any)?.code === 'USER_NOT_FOUND') {
        setError('База данных не инициализирована. Пожалуйста, подождите несколько минут и попробуйте снова.')
        setHasAttemptedAuth(true)
      } else {
        setError(errorMessage)
      }
      
      setAuthError(errorMessage)
    } finally {
      setIsLoading(false)
      // Очищаем флаг процесса аутентификации в любом случае
      sessionStorage.removeItem('auth_in_progress')
      console.log('🔄 Authentication process ended, flag cleared')
    }
  }, [router, isDevMode])

  useEffect(() => {
    console.log('🔐 Login page useEffect - HasAttempted:', hasAttemptedAuth, 'AuthError:', !!authError)
    
    // Проверяем, запущено ли приложение в Telegram
    const webApp = window.Telegram?.WebApp
    
    // Проверяем, не был ли пользователь только что аутентифицирован
    const token = localStorage.getItem('auth_token')
    const justAuthenticated = sessionStorage.getItem('just_authenticated') === 'true'
    
    console.log('🔍 Login check - Token:', !!token, 'JustAuth:', justAuthenticated)
    
    if (justAuthenticated && token) {
      console.log('✅ User just authenticated, redirecting to dashboard...')
      sessionStorage.removeItem('just_authenticated')
      router.push('/dashboard')
      return
    }
    
    // Предотвращаем повторные попытки аутентификации
    if (hasAttemptedAuth) {
      console.log('🔄 Already attempted auth, skipping...')
      return
    }
    
    if (webApp?.initData && !authError) {
      console.log('📱 Telegram WebApp detected, starting auth...')
      setIsTelegramApp(true)
      webApp.ready()
      setHasAttemptedAuth(true)
      
      // Автоматический вход для Telegram пользователей
      handleTelegramLogin()
    } else if (!webApp?.initData) {
      // Режим разработки - приложение открыто в обычном браузере
      console.log('💻 Development mode detected (outside Telegram)')
      setIsDevMode(true)
    }
  }, [handleTelegramLogin, hasAttemptedAuth, authError, router])

  const handleDevLogin = async () => {
    // Проверяем, не идет ли уже процесс аутентификации
    if (isLoading) {
      console.log('🔄 Dev authentication already in progress, skipping...')
      return
    }

    // Проверяем, не был ли уже запущен процесс аутентификации в этой сессии
    const authInProgress = sessionStorage.getItem('auth_in_progress')
    if (authInProgress === 'true') {
      console.log('🔄 Dev authentication already in progress (session flag), skipping...')
      return
    }

    setIsLoading(true)
    setError(null)
    
    // Устанавливаем флаг процесса аутентификации
    sessionStorage.setItem('auth_in_progress', 'true')
    console.log('🚀 Dev authentication process started, flag set')

    try {
      // Для разработки используем тестовые данные
      const testUser = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'Mark',
        username: 'testuser',
      }

      await devLogin(testUser)
      
      // Получаем токен из localStorage (devLogin сохраняет его там)
      const token = localStorage.getItem('auth_token')
      
      // Устанавливаем cookie для серверных запросов
      if (token) {
        document.cookie = `auth_token=${token}; path=/; max-age=2592000; secure; samesite=strict`
      }
      
      // Устанавливаем флаг недавней аутентификации
      sessionStorage.setItem('just_authenticated', 'true')
      
      console.log('Dev login successful, token saved in localStorage and cookie, redirecting to dashboard...')
      console.log('Cookie set:', document.cookie)
      
      // Очищаем флаг процесса аутентификации
      sessionStorage.removeItem('auth_in_progress')
      console.log('✅ Dev authentication process completed, flag cleared')
      
      // Добавляем небольшую задержку перед редиректом, чтобы cookie успел установиться
      setTimeout(() => {
        // Немедленный редирект без задержки
        router.push('/dashboard')
      }, 100)
    } catch (err) {
      console.error('Dev login error:', err)
      
      // Улучшенная обработка ошибок для продакшн-режима
      if ((err as any)?.code === 'NETWORK_ERROR' || (err as any)?.isNetworkError) {
        setError('Сервер недоступен. Пожалуйста, попробуйте позже.')
      } else if (err instanceof Error && err.message.includes('Пользователь не найден')) {
        setError('База данных не инициализирована. Пожалуйста, подождите несколько минут и попробуйте снова.')
      } else {
        setError('Ошибка входа: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
      }
    } finally {
      setIsLoading(false)
      // Очищаем флаг процесса аутентификации в любом случае
      sessionStorage.removeItem('auth_in_progress')
      console.log('🔄 Dev authentication process ended, flag cleared')
    }
  }

  // Если это Telegram и идет автоматическая авторизация
  if (isTelegramApp && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
          <p className="text-gray-600">Signing in with Telegram...</p>
        </div>
      </div>
    )
  }

  // Режим разработки или ошибка в Telegram
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isDevMode ? 'Development Mode' : 'Login'}
          </h2>
          {isDevMode && (
            <p className="mt-2 text-sm text-gray-600">
              Open this app in Telegram for full functionality
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
            {(error.includes('Пользователь не найден') || error.includes('USER_NOT_FOUND')) && (
              <Button
                onClick={() => {
                  setError(null)
                  setAuthError(null)
                  setHasAttemptedAuth(false)
                }}
                className="mt-2 w-full bg-red-600 hover:bg-red-700"
              >
                Попробовать войти снова
              </Button>
            )}
          </div>
        )}

        <div className="space-y-4">
          {isDevMode ? (
            <>
              <Button
                onClick={handleDevLogin}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Continue as Test User (Dev API)'}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                onClick={handleTelegramLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Signing in...' : 'Test Telegram Auth (Dev Mode)'}
              </Button>

              <div className="rounded-md bg-blue-50 p-4">
                <h3 className="text-sm font-medium text-blue-800">
                  How to use in Telegram:
                </h3>
                <ol className="mt-2 list-decimal list-inside text-sm text-blue-700 space-y-1">
                  <li>Open Telegram</li>
                  <li>Search for your bot</li>
                  <li>Click &ldquo;Open App&rdquo; button</li>
                </ol>
              </div>
            </>
          ) : (
            <Button
              onClick={handleTelegramLogin}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in with Telegram'}
            </Button>
          )}
        </div>

        {isDevMode && (
          <div className="text-center text-xs text-gray-500">
            <p>Development mode detected</p>
            <p>Some features may be limited</p>
          </div>
        )}
      </div>
    </div>
  )
}