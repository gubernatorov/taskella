import { Badge } from '@/components/ui/badge'
import { TaskStatus } from '@/types/task'

interface StatusBadgeProps {
  status: TaskStatus
}

const statusConfig = {
  todo: { label: 'К выполнению', variant: 'secondary' as const },
  in_progress: { label: 'В работе', variant: 'default' as const },
  in_review: { label: 'На проверке', variant: 'outline' as const },
  done: { label: 'Выполнено', variant: 'default' as const },
  cancelled: { label: 'Отменено', variant: 'destructive' as const },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}