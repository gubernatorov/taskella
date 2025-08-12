'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    // Проверяем, запущено ли приложение в Telegram
    const webApp = window.Telegram?.WebApp
    
    if (webApp?.initData) {
      setIsTelegramApp(true)
      webApp.ready()
      
      // Автоматический вход для Telegram пользователей
      handleTelegramLogin()
    } else {
      // Режим разработки - приложение открыто в обычном браузере
      setIsDevMode(true)
      console.log('Running in development mode (outside Telegram)')
    }
  }, [])

  const handleTelegramLogin = async () => {
    const webApp = window.Telegram?.WebApp
    
    if (!webApp?.initData) {
      setError('Telegram WebApp not available')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: webApp.initData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
      
      // Сохраняем токен
      localStorage.setItem('auth_token', data.token)
      
      // Перенаправляем на главную страницу
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDevLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Для разработки используем тестовые данные
      const testUser = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'Mark',
        username: 'testuser',
      }

      await devLogin(testUser)
      router.push('/dashboard')
    } catch (err) {
      console.error('Dev login error:', err)
      setError('Development login failed')
    } finally {
      setIsLoading(false)
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
                {isLoading ? 'Signing in...' : 'Continue as Test User'}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="rounded-md bg-blue-50 p-4">
                <h3 className="text-sm font-medium text-blue-800">
                  How to use in Telegram:
                </h3>
                <ol className="mt-2 list-decimal list-inside text-sm text-blue-700 space-y-1">
                  <li>Open Telegram</li>
                  <li>Search for your bot</li>
                  <li>Click "Open App" button</li>
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