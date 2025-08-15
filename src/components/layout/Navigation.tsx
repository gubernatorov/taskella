'use client'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { FolderOpen, CheckSquare, Home, Settings, Kanban } from 'lucide-react'
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
  {
    name: 'Доски',
    href: '/boards',
    icon: Kanban,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="glass hidden md:flex md:w-64 md:flex-col md:border-r transition-all duration-300">
      <div className="flex flex-col gap-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'justify-start glass-hover transition-all duration-300',
                isActive && 'bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 shadow-md'
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className={cn(
                  "mr-2 h-4 w-4 transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "transition-colors duration-300",
                  isActive ? "text-primary font-medium" : "text-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
