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
          console.log('Redirecting to login...')
          router.push('/login')
        }
      }, 50)
    }
  }, [user, isLoading, router, hasRedirected])

  return <Loading />
}