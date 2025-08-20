'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface TelegramContextType {
  webApp: any
  user: any
  isReady: boolean
}

const TelegramContext = createContext<TelegramContextType | null>(null)

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).Telegram) {
        const tg = (window as any).Telegram.WebApp
        setWebApp(tg)
        setUser(tg.initDataUnsafe?.user)
        
        // Настройка темы
        if (tg.colorScheme === 'dark') {
          document.documentElement.classList.add('dark')
        }
        
        // Настройка WebApp
        tg.ready()
        tg.expand()
        tg.setHeaderColor('#ffffff')
        
        console.log('📱 Telegram WebApp initialized')
      } else {
        console.log('🌐 Running in regular browser (not Telegram WebApp)')
      }
      
      // Устанавливаем isReady в true независимо от того, в Telegram мы или нет
      setIsReady(true)
    }
  }, [])

  return (
    <TelegramContext.Provider value={{ webApp, user, isReady }}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegramContext() {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegramContext must be used within TelegramProvider')
  }
  return context
}