'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/tasks/StatusBadge'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import { useTask, useUpdateTask } from '@/lib/hooks/useTasks'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { ArrowLeft, Edit, Clock, Calendar, User, MessageCircle, Send } from 'lucide-react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface TaskPageProps {
  params: { id: string }
}

export default function TaskPage({ params }: TaskPageProps) {
  const [comment, setComment] = useState('')
  const { data: task, isLoading } = useTask(params.id)
  const updateTask = useUpdateTask()

  if (isLoading) return <Loading />
  
  if (!task) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="Задача не найдена"
        description="Задача не существует или у вас нет доступа к ней"
      />
    )
  }

  const handleStatusChange = async (status: string) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: { status: status as any }
      })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          <p className="text-muted-foreground mt-1">
            {task.key} • {task.project.name}
          </p>
        </div>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Описание</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{task.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Описание не добавлено
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
              <CardDescription>
                Изменить статус задачи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(['todo', 'in_progress', 'in_review', 'done', 'cancelled'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={task.status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                    disabled={updateTask.isPending}
                  >
                    {status === 'todo' && 'К выполнению'}
                    {status === 'in_progress' && 'В работе'}
                    {status === 'in_review' && 'На проверке'}
                    {status === 'done' && 'Выполнено'}
                    {status === 'cancelled' && 'Отменено'}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Детали</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Автор</h4>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={task.reporter.avatarUrl} />
                    <AvatarFallback>
                      {task.reporter.firstName[0]}{task.reporter.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {task.reporter.firstName} {task.reporter.lastName}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Проект</h4>
                <Badge variant="outline">
                  {task.project.name}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Создана</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(task.createdAt), { 
                    addSuffix: true, 
                    locale: ru 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}