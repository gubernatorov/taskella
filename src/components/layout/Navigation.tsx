'use client'

import { List, Section, Cell } from '@telegram-apps/telegram-ui'
import { FolderOpen, CheckSquare, Home, Kanban } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navigation = [
  {
    name: 'Дашборд',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Проекты',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    name: 'Задачи',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Доски',
    href: '/boards',
    icon: Kanban,
  },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <List>
      <Section header="Навигация">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const IconComponent = item.icon
          
          return (
            <Cell
              key={item.href}
              before={<IconComponent size={20} />}
              onClick={() => router.push(item.href)}
              style={{
                backgroundColor: isActive ? 'var(--tg-theme-button-color, #3390ec)' : 'transparent',
                color: isActive ? 'var(--tg-theme-button-text-color, #ffffff)' : 'var(--tg-theme-text-color, #000000)'
              }}
            >
              {item.name}
            </Cell>
          )
        })}
      </Section>
    </List>
  )
}
