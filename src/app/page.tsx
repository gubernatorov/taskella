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
    // Избегаем множественных редиректов и ждем завершения загрузки
    if (isLoading || hasRedirected) return

    console.log('Main page redirect logic - User:', !!user, 'Loading:', isLoading)
    setHasRedirected(true)
    
    if (user) {
      console.log('Redirecting to dashboard...')
      router.push('/dashboard')
    } else {
      console.log('Redirecting to login...')
      router.push('/login')
    }
  }, [user, isLoading, router, hasRedirected])

  return <Loading />
}