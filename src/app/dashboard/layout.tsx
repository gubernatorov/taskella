'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Loading } from '@/components/common/Loading'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    console.log('🏢 Dashboard layout useEffect - User:', !!user, 'Loading:', isLoading, 'HasRedirected:', hasRedirected)
    
    if (isLoading) {
      console.log('⏳ Dashboard still loading auth...')
      return
    }
    
    if (hasRedirected) {
      console.log('🔄 Dashboard already redirected, skipping...')
      return
    }
    
    if (!user) {
      console.log('❌ No user in dashboard, redirecting to main page...')
      setHasRedirected(true)
      // Временно редиректим на главную страницу вместо /login для избежания цикла
      router.push('/')
    } else {
      console.log('✅ User exists in dashboard, staying...')
    }
  }, [user, isLoading, router, hasRedirected])

  if (isLoading) {
    return <Loading />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}