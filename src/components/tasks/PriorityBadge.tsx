import { Badge } from '@/components/ui/badge'
import { TaskPriority } from '@/types/task'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface PriorityBadgeProps {
  priority: TaskPriority
}

const priorityConfig = {
  lowest: { label: 'Самый низкий', variant: 'outline' as const, icon: ArrowDown },
  low: { label: 'Низкий', variant: 'secondary' as const, icon: ArrowDown },
  medium: { label: 'Средний', variant: 'outline' as const, icon: Minus },
  high: { label: 'Высокий', variant: 'default' as const, icon: ArrowUp },
  highest: { label: 'Критический', variant: 'destructive' as const, icon: ArrowUp },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}