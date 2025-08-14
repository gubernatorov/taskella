'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTelegram } from '@/lib/hooks/useTelegram'
import { User, Settings } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()
  const { webApp } = useTelegram()

  const handleBack = () => {
    if (webApp?.BackButton) {
      webApp.BackButton.show()
      webApp.BackButton.onClick(() => window.history.back())
    }
  }

  return (
    <header className="glass sticky top-0 z-50 w-full border-b transition-all duration-300">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <h1 className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-lg font-semibold text-transparent">
            Task Tracker
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search можно добавить позже */}
          </div>
          <nav className="flex items-center space-x-3">
            <div className="glass glass-hover rounded-full p-1 transition-all duration-300">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-sm font-medium text-foreground/90">
              {user?.firstName} {user?.lastName}
            </span>
          </nav>
        </div>
      </div>
    </header>
  )
}