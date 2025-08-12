import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Task } from '@/types/task'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { Calendar, Clock, User } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'

interface TaskCardProps {
  task: Task
  compact?: boolean
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <Link href={`/tasks/${task.id}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm line-clamp-1">{task.title}</CardTitle>
              <StatusBadge status={task.status} />
            </div>
            <CardDescription className="text-xs">
              {task.key} • {task.project.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {task.assignee && (
                <div className="flex items-center">
                  <Avatar className="h-4 w-4 mr-1">
                    <AvatarImage src={task.assignee.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {task.assignee.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {task.assignee.firstName}
                </div>
              )}
              <PriorityBadge priority={task.priority} />
            </div>
          </CardContent>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <StatusBadge status={task.status} />
            </div>
            <CardDescription>
              {task.key} • {task.project.name}
            </CardDescription>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <PriorityBadge priority={task.priority} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            {task.assignee && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={task.assignee.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                {task.assignee.firstName}
              </div>
            )}
            {task.estimatedHours && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {task.estimatedHours}ч
              </div>
            )}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {task.dueDate
              ? format(new Date(task.dueDate), 'dd.MM.yyyy')
              : formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true, locale: ru })}
          </div>
        </div>
        <Button asChild className="w-full">
          <Link href={`/tasks/${task.id}`}>
            Открыть задачу
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
