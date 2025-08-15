'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTelegram } from '@/lib/hooks/useTelegram'
import { Loading } from '@/components/common/Loading'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const { webApp } = useTelegram()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Настройка Telegram WebApp
    if (webApp) {
      webApp.ready()
      webApp.expand()
    }
  }, [webApp])

  useEffect(() => {
    // Избегаем множественных редиректов
    if (!isLoading && !hasRedirected) {
      console.log('Main page redirect logic - User:', !!user, 'Loading:', isLoading)
      setHasRedirected(true)
      
      // Добавляем небольшую задержку для стабилизации состояния
      setTimeout(() => {
        if (user) {
          console.log('Redirecting to dashboard...')
          router.push('/dashboard')
        } else {
          // Проверяем, есть ли токен в localStorage (возможно, только что установлен)
          const token = localStorage.getItem('auth_token')
          if (token) {
            console.log('Token found but user not loaded yet, waiting...')
            // Даем дополнительное время для загрузки пользователя
            setTimeout(() => {
              if (!user) {
                console.log('User still not loaded, redirecting to login...')
                router.push('/login')
              }
            }, 500)
          } else {
            console.log('Redirecting to login...')
            router.push('/login')
          }
        }
      }, 50)
    }
  }, [user, isLoading, router, hasRedirected])

  return <Loading />
}