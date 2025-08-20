'use client'

import { Avatar, Cell, Section } from '@telegram-apps/telegram-ui'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTelegram } from '@/lib/hooks/useTelegram'

export function Header() {
  const { user } = useAuth()
  const { webApp } = useTelegram()

  const handleBack = () => {
    if (webApp?.BackButton) {
      webApp.BackButton.show()
      webApp.BackButton.onClick(() => window.history.back())
    }
  }

  // В Telegram Mini Apps обычно не используется традиционный header
  // Вместо этого используется встроенная навигация Telegram
  // Но если нужно показать информацию о пользователе, можем использовать Cell
  
  return (
    <Section>
      <Cell
        before={
          <Avatar
            size={40}
            src={user?.avatarUrl}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
        }
        subtitle="Taskella - Управление задачами"
      >
        {user?.firstName} {user?.lastName}
      </Cell>
    </Section>
  )
}
