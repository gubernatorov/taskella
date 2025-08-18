'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTelegram } from '@/lib/hooks/useTelegram'
import { Loading } from '@/components/common/Loading'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const { webApp } = useTelegram()
  const router = useRouter()
  const hasRedirectedRef = useRef(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Настройка Telegram WebApp
    if (webApp) {
      webApp.ready()
      webApp.expand()
    }
  }, [webApp])

  useEffect(() => {
    // Избегаем множественных редиректов и ждем завершения загрузки
    console.log('🏠 Main page useEffect - User:', !!user, 'Loading:', isLoading, 'HasRedirected:', hasRedirectedRef.current, 'IsRedirecting:', isRedirecting)
    
    // Если уже редиректим, не делаем ничего
    if (isRedirecting) {
      console.log('🔄 Already redirecting, skipping...')
      return
    }
    
    // Если уже был редирект, не делаем повторный
    if (hasRedirectedRef.current) {
      console.log('🔄 Already redirected, skipping...')
      return
    }
    
    // Проверяем флаги аутентификации
    const authInProgress = typeof window !== 'undefined' ? sessionStorage.getItem('auth_in_progress') === 'true' : false
    const justAuthenticated = typeof window !== 'undefined' ? sessionStorage.getItem('just_authenticated') === 'true' : false
    
    console.log('🔍 Auth flags - InProgress:', authInProgress, 'JustAuth:', justAuthenticated)
    
    // Если идет процесс аутентификации, ждем
    if (authInProgress) {
      console.log('⏳ Authentication in progress, waiting...')
      return
    }
    
    // Если только что аутентифицировались, редиректим на dashboard
    if (justAuthenticated) {
      console.log('✅ Just authenticated, redirecting to dashboard...')
      hasRedirectedRef.current = true
      setIsRedirecting(true)
      router.replace('/dashboard')
      return
    }
    
    // Если еще загружается состояние аутентификации, ждем
    if (isLoading) {
      console.log('⏳ Still loading auth state, waiting...')
      return
    }

    console.log('📍 Main page redirect logic executing')
    hasRedirectedRef.current = true
    setIsRedirecting(true)
    
    if (user) {
      console.log('✅ User exists, redirecting to dashboard...')
      router.replace('/dashboard')
    } else {
      console.log('❌ No user, redirecting to login...')
      router.replace('/login')
    }
  }, [user, isLoading, router, isRedirecting])

  return <Loading />
}
