import { CardDescription, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { User, Clock, Calendar } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'
import { Task } from '@/types/task'

interface TaskHeaderProps {
  task: Task
  compact?: boolean
}

export function TaskHeader({ task, compact = false }: TaskHeaderProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className={compact ? 'space-y-2 flex-1' : 'space-y-2 flex-1'}>
          <div className="flex items-center space-x-2">
            <CardTitle className={compact ? 'text-sm font-semibold' : 'text-xl font-bold'}>
              {task.title}
            </CardTitle>
            <StatusBadge status={task.status} />
          </div>
          <CardDescription className="text-muted-foreground/80">
            {task.key} • {task.project.name}
          </CardDescription>
          {!compact && task.description && (
            <p className="text-sm text-muted-foreground/80 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {task.assignee && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 mr-1 text-primary/70" />
              <div className="flex items-center gap-1">
                <Avatar className={compact ? 'h-4 w-4' : 'h-5 w-5'}>
                  <AvatarImage src={task.assignee.avatarUrl} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-purple-600 text-white">
                    {task.assignee.firstName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm font-medium">{task.assignee.firstName}</span>
            </div>
          )}
          {task.estimatedHours && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 mr-1 text-primary/70" />
              <span className="text-sm font-medium">{task.estimatedHours}ч</span>
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-muted-foreground mt-4">
          <div className="flex flex-wrap items-center gap-4">
            {task.assignee && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 mr-1 text-primary/70" />
                <span className="text-sm font-medium">{task.assignee.firstName}</span>
              </div>
            )}
            {task.estimatedHours && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 mr-1 text-primary/70" />
                <span className="text-sm font-medium">{task.estimatedHours}ч</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 mr-1 text-primary/70" />
<span className="text-sm">
              {task.dueDate
                ? format(new Date(task.dueDate), 'dd.MM.yyyy')
                : formatDistanceToNow(new Date(task.updatedAt), {
                    addSuffix: true,
                    locale: ru,
                  })}
</span>
          </div>
        </div>
      )}
    </>
  )
}
