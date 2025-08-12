'use client'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { FolderOpen, CheckSquare, Home, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex md:w-64 md:flex-col md:border-r">
      <div className="flex flex-col gap-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'justify-start',
                isActive && 'bg-secondary'
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}