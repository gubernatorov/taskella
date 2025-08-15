import { Badge } from '@/components/ui/badge'
import { TaskType } from '@/types/task'
import { CheckSquare, AlertTriangle, Zap, Target, BookOpen } from 'lucide-react'

interface TypeBadgeProps {
  type: TaskType
}

const typeConfig = {
  task: { label: 'Задача', variant: 'default' as const, icon: CheckSquare },
  bug: { label: 'Ошибка', variant: 'destructive' as const, icon: AlertTriangle },
  feature: { label: 'Новая функция', variant: 'secondary' as const, icon: Zap },
  epic: { label: 'Эпик', variant: 'outline' as const, icon: Target },
  story: { label: 'История', variant: 'outline' as const, icon: BookOpen },
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const config = typeConfig[type]
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
