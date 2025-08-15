import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/tasks/StatusBadge'
import { Task } from '@/types/task'
import { Calendar, Clock, User, MessageCircle, Paperclip } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface TaskCardProps {
  task: Task
  compact?: boolean
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  if (compact) {
    return (
      <Card className="hover:scale-[1.02] transition-all duration-200 cursor-pointer">
        <Link href={`/tasks/${task.id}`}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">{task.title}</CardTitle>
                  <StatusBadge status={task.status} />
                </div>
                <CardDescription>
                  {task.key} • {task.project.name}
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {task.assignee && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={task.assignee.avatarUrl} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-purple-600 text-white">
                        {task.assignee.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                {task.estimatedHours && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{task.estimatedHours}ч</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="hover:scale-[1.01] transition-all duration-200 cursor-pointer">
      <Link href={`/tasks/${task.id}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
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
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {task.assignee && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.assignee.avatarUrl} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-purple-600 text-white">
                      {task.assignee.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{task.assignee.firstName}</span>
                </div>
              )}
              {task.estimatedHours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{task.estimatedHours}ч</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {task.dueDate
                  ? format(new Date(task.dueDate), 'dd.MM.yyyy')
                  : formatDistanceToNow(new Date(task.updatedAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>0 комм.</span>
              </div>
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span>0 вложений</span>
              </div>
            </div>
          </div>
          
          <Button asChild className="w-full">
            <Link href={`/tasks/${task.id}`}>Открыть задачу</Link>
          </Button>
        </CardContent>
      </Link>
    </Card>
  )
}
