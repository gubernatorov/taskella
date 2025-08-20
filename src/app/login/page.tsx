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
  const { devLogin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTelegramApp, setIsTelegramApp] = useState(false)
  const [isDevMode, setIsDevMode] = useState(false)
  const authAttemptedRef = useRef(false)
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
        // Используем replace вместо push, чтобы избежать возврата на страницу логина
        router.replace('/dashboard')
      }, 200)
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login'
      
      // Улучшенная обработка ошибок для продакшн-режима
      if ((err as any)?.code === 'NETWORK_ERROR' || (err as any)?.isNetworkError) {
        setError('Сервер недоступен. Пожалуйста, попробуйте позже.')
      } else if (errorMessage.includes('Пользователь не найден') || (err as any)?.code === 'USER_NOT_FOUND') {
        setError('База данных не инициализирована. Пожалуйста, подождите несколько минут и попробуйте снова.')
      } else {
        setError(errorMessage)
      }
      
      setAuthError(errorMessage)
      // Очищаем флаг процесса аутентификации при ошибке
      sessionStorage.removeItem('auth_in_progress')
    } finally {
      setIsLoading(false)
    }
  }, [router, isDevMode])

  useEffect(() => {
    console.log('🔐 Login page useEffect - AuthAttempted:', authAttemptedRef.current, 'AuthError:', !!authError)
    
    // Проверяем, не был ли пользователь только что аутентифицирован
    const token = localStorage.getItem('auth_token')
    const justAuthenticated = sessionStorage.getItem('just_authenticated') === 'true'
    const authInProgress = sessionStorage.getItem('auth_in_progress') === 'true'
    
    console.log('🔍 Login check - Token:', !!token, 'JustAuth:', justAuthenticated, 'InProgress:', authInProgress)
    
    // Если есть токен и флаг недавней аутентификации, сразу редиректим
    if (justAuthenticated && token) {
      console.log('✅ User just authenticated, redirecting to dashboard...')
      router.replace('/dashboard')
      return
    }
    
    // Если процесс аутентификации уже идет, ждем
    if (authInProgress) {
      console.log('⏳ Authentication in progress, waiting...')
      return
    }
    
    // Если есть токен без флага недавней аутентификации, тоже редиректим
    if (token && !authError) {
      console.log('✅ Token found, redirecting to dashboard...')
      router.replace('/dashboard')
      return
    }
    
    // Проверяем, запущено ли приложение в Telegram
    const webApp = window.Telegram?.WebApp
    
    // Предотвращаем повторные попытки аутентификации
    if (authAttemptedRef.current) {
      console.log('🔄 Already attempted auth, skipping...')
      return
    }
    
    if (webApp?.initData && !authError) {
      console.log('📱 Telegram WebApp detected, starting auth...')
      setIsTelegramApp(true)
      webApp.ready()
      authAttemptedRef.current = true
      
      // Добавляем небольшую задержку перед автоматической аутентификацией
      // чтобы дать время WebApp полностью инициализироваться
      setTimeout(() => {
        handleTelegramLogin()
      }, 100)
    } else if (!webApp?.initData) {
      // Проверяем переменную окружения для определения dev режима
      const envDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
      console.log('💻 No Telegram WebApp detected, checking env dev mode:', envDevMode)
      setIsDevMode(envDevMode)
    }
  }, [handleTelegramLogin, authError, router])

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
        // Используем replace вместо push
        router.replace('/dashboard')
      }, 200)
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
      
      // Очищаем флаг процесса аутентификации при ошибке
      sessionStorage.removeItem('auth_in_progress')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetryAuth = () => {
    setError(null)
    setAuthError(null)
    authAttemptedRef.current = false
    // Очищаем флаги сессии
    sessionStorage.removeItem('auth_in_progress')
    sessionStorage.removeItem('just_authenticated')
    
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
