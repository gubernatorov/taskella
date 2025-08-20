'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
  const { user, devLogin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTelegramApp, setIsTelegramApp] = useState(false)
  const [isDevMode, setIsDevMode] = useState(false)
  const authAttemptedRef = useRef(false)

  const handleTelegramLogin = useCallback(async () => {
    if (isLoading) return

    const webApp = window.Telegram?.WebApp
    let initData = webApp?.initData

    // Если WebApp недоступен и мы в режиме разработки, используем тестовые данные
    if (!initData && isDevMode) {
      initData = 'dev_mode_test'
      console.log('Using dev mode for Telegram auth')
    }
    
    if (!initData) {
      const envDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
      if (envDevMode) {
        initData = 'dev_mode_test'
        console.log('Using env dev mode for Telegram auth')
      } else {
        setError('Это приложение должно быть открыто в Telegram. Пожалуйста, откройте приложение через Telegram бот.')
        return
      }
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
      document.cookie = `auth_token=${data.token}; path=/; max-age=2592000; secure; samesite=lax`
      
      // Очищаем флаг редиректа из sessionStorage
      sessionStorage.removeItem('dashboard_redirect_to_login')
      
      console.log('Token saved successfully, redirecting to dashboard...')
      
      // Небольшая задержка перед редиректом, чтобы cookie успел установиться
      setTimeout(() => {
        // Для Telegram Mini Apps используем window.location.href вместо router.replace
        if (isTelegramApp) {
          window.location.href = '/dashboard'
        } else {
          router.replace('/dashboard')
        }
      }, 200)
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login'
      
      if ((err as any)?.code === 'NETWORK_ERROR' || (err as any)?.isNetworkError) {
        setError('Сервер недоступен. Пожалуйста, попробуйте позже.')
      } else if (errorMessage.includes('Пользователь не найден') || (err as any)?.code === 'USER_NOT_FOUND') {
        setError('База данных не инициализирована. Пожалуйста, подождите несколько минут и попробуйте снова.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [router, isDevMode, isLoading, isTelegramApp])

  useEffect(() => {
    console.log('🔐 Login page useEffect - User:', !!user, 'AuthAttempted:', authAttemptedRef.current)
    
    // Проверяем наличие пользователя в состоянии AuthProvider (более надежно, чем localStorage)
    if (user) {
      console.log('✅ User found in auth state, redirecting to dashboard...')
      
      // Определяем, находимся ли мы в Telegram Mini Apps
      const isTelegramApp = window.Telegram?.WebApp?.initData
      
      // Для Telegram Mini Apps используем window.location.href вместо router.replace
      if (isTelegramApp) {
        window.location.href = '/dashboard'
      } else {
        router.replace('/dashboard')
      }
      return
    }
    
    // Проверяем флаг редиректа из sessionStorage, чтобы избежать циклов
    const dashboardRedirectFlag = sessionStorage.getItem('dashboard_redirect_to_login')
    if (dashboardRedirectFlag === 'true') {
      console.log('🔄 Dashboard redirect flag found, clearing it and staying on login page...')
      sessionStorage.removeItem('dashboard_redirect_to_login')
      return
    }
    
    // Проверяем, запущено ли приложение в Telegram
    const webApp = window.Telegram?.WebApp
    
    // Предотвращаем повторные попытки аутентификации
    if (authAttemptedRef.current) {
      console.log('🔄 Already attempted auth, skipping...')
      return
    }
    
    if (webApp?.initData) {
      console.log('📱 Telegram WebApp detected, starting auth...')
      setIsTelegramApp(true)
      webApp.ready()
      authAttemptedRef.current = true
      
      // Небольшая задержка перед автоматической аутентификацией
      setTimeout(() => {
        handleTelegramLogin()
      }, 100)
    } else if (!webApp?.initData) {
      // Проверяем переменную окружения для определения dev режима
      const envDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
      console.log('💻 No Telegram WebApp detected, checking env dev mode:', envDevMode)
      setIsDevMode(envDevMode)
      
      // Для продакшн-режима: если это не Telegram и не dev режим,
      // показываем сообщение о необходимости открыть через Telegram
      if (process.env.NODE_ENV === 'production' && !envDevMode) {
        console.log('🌐 Production mode: showing message to open via Telegram')
        setError('Пожалуйста, откройте приложение через Telegram бот для использования всех функций.')
      }
    }
  }, [user, handleTelegramLogin, router])

  const handleDevLogin = async () => {
    if (isLoading) return

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
      
      // Получаем токен из localStorage (devLogin сохраняет его там)
      const token = localStorage.getItem('auth_token')
      
      // Устанавливаем cookie для серверных запросов
      if (token) {
        document.cookie = `auth_token=${token}; path=/; max-age=2592000; secure; samesite=lax`
      }
      
      // Очищаем флаг редиректа из sessionStorage
      sessionStorage.removeItem('dashboard_redirect_to_login')
      
      console.log('Dev login successful, redirecting to dashboard...')
      
      // Небольшая задержка перед редиректом
      setTimeout(() => {
        // Определяем, находимся ли мы в Telegram Mini Apps
        const isTelegramApp = window.Telegram?.WebApp?.initData
        
        // Для Telegram Mini Apps используем window.location.href вместо router.replace
        if (isTelegramApp) {
          window.location.href = '/dashboard'
        } else {
          router.replace('/dashboard')
        }
      }, 200)
    } catch (err) {
      console.error('Dev login error:', err)
      
      if ((err as any)?.code === 'NETWORK_ERROR' || (err as any)?.isNetworkError) {
        setError('Сервер недоступен. Пожалуйста, попробуйте позже.')
      } else if (err instanceof Error && err.message.includes('Пользователь не найден')) {
        setError('База данных не инициализирована. Пожалуйста, подождите несколько минут и попробуйте снова.')
      } else {
        setError('Ошибка входа: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetryAuth = () => {
    setError(null)
    authAttemptedRef.current = false
    
    if (isTelegramApp) {
      handleTelegramLogin()
    }
  }

  // Если это Telegram и идет автоматическая авторизация
  if (isTelegramApp && isLoading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--tg-theme-bg-color, #ffffff)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'inline-block',
              width: '32px',
              height: '32px',
              border: '2px solid var(--tg-theme-hint-color, #999999)',
              borderTop: '2px solid var(--tg-theme-button-color, #3390ec)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
          <p style={{
            color: 'var(--tg-theme-text-color, #000000)',
            fontSize: '16px'
          }}>
            Вход через Telegram...
          </p>
        </div>
      </div>
    )
  }

  // Режим разработки или ошибка в Telegram
  return (
    <div style={{
      backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--tg-theme-text-color, #000000)',
            marginBottom: '8px'
          }}>
            {isDevMode ? 'Development Mode' : 'Вход в систему'}
          </h2>
          {isDevMode && (
            <p style={{
              fontSize: '14px',
              color: 'var(--tg-theme-hint-color, #999999)'
            }}>
              Откройте это приложение в Telegram для полной функциональности
            </p>
          )}
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ffcdd2',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '14px', color: '#d32f2f' }}>{error}</p>
            {error && (error.includes('Пользователь не найден') || error.includes('USER_NOT_FOUND') || error.includes('База данных')) && (
              <button
                onClick={handleRetryAuth}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--tg-theme-destructive-text-color, #ff3333)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Попробовать войти снова
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isDevMode ? (
            <>
              <button
                onClick={handleDevLogin}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: 'var(--tg-theme-button-color, #3390ec)',
                  color: 'var(--tg-theme-button-text-color, #ffffff)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Вход...' : 'Войти как тестовый пользователь'}
              </button>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '8px 0',
                color: 'var(--tg-theme-hint-color, #999999)',
                fontSize: '14px'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
                <span style={{ padding: '0 16px' }}>или</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
              </div>

              <button
                onClick={handleTelegramLogin}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, #f1f3f4)',
                  color: 'var(--tg-theme-text-color, #000000)',
                  border: '1px solid var(--tg-theme-button-color, #3390ec)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Вход...' : 'Тестировать авторизацию Telegram'}
              </button>

              <div style={{
                backgroundColor: '#e3f2fd',
                border: '1px solid #bbdefb',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1565c0',
                  marginBottom: '8px'
                }}>
                  Как использовать в Telegram:
                </h3>
                <ol style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '13px',
                  color: '#1976d2',
                  lineHeight: '1.4'
                }}>
                  <li>Откройте Telegram</li>
                  <li>Найдите вашего бота</li>
                  <li>Нажмите кнопку &quot;Открыть приложение&quot;</li>
                </ol>
              </div>
            </>
          ) : (
            <button
              onClick={handleTelegramLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'var(--tg-theme-button-color, #3390ec)',
                color: 'var(--tg-theme-button-text-color, #ffffff)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Вход...' : 'Войти через Telegram'}
            </button>
          )}
        </div>

        {isDevMode && (
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '12px',
            color: 'var(--tg-theme-hint-color, #999999)'
          }}>
            <p>Режим разработки активен</p>
            <p>Некоторые функции могут быть ограничены</p>
          </div>
        )}
      </div>
    </div>
  )
}
