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
    console.log('🏠 Main page useEffect - User:', !!user, 'Loading:', isLoading, 'HasRedirected:', hasRedirected)
    
    if (isLoading) {
      console.log('⏳ Still loading, waiting...')
      return
    }
    
    if (hasRedirected) {
      console.log('🔄 Already redirected, skipping...')
      return
    }

    console.log('📍 Main page redirect logic executing')
    setHasRedirected(true)
    
    if (user) {
      console.log('✅ User exists, redirecting to dashboard...')
      router.push('/dashboard')
    } else {
      console.log('❌ No user, redirecting to login...')
      router.push('/login')
    }
  }, [user, isLoading, router, hasRedirected])

  return <Loading />
}