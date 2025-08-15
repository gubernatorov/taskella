'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/tasks/StatusBadge'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import { TaskComments } from '@/components/tasks/TaskComments'
import { TaskMiniChat } from '@/components/tasks/TaskMiniChat'
import { TaskAttachments } from '@/components/tasks/TaskAttachments'
import { useTask, useUpdateTask } from '@/lib/hooks/useTasks'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { ArrowLeft, Edit, Clock, Calendar, User, MessageCircle, Send, Paperclip } from 'lucide-react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Task, UpdateTaskRequest, TaskStatus, TaskPriority } from '@/types/task'

interface TaskPageProps {
  params: { id: string }
}

export default function TaskPage({ params }: TaskPageProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<UpdateTaskRequest>({})
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

  const handleEditTask = () => {
    if (task) {
      setEditFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        estimatedHours: task.estimatedHours,
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleSaveEdit = async () => {
    try {
      await updateTask.mutateAsync({
        id: task!.id,
        data: editFormData
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Failed to update task:', error)
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
        <Button variant="outline" size="icon" onClick={handleEditTask}>
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

          {/* Вложения */}
          <TaskAttachments taskId={task.id} />

          {/* Комментарии */}
          <TaskComments taskId={task.id} />
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

              {task.estimatedHours && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Оценочное время</h4>
                  <p className="text-sm text-muted-foreground">
                    {task.estimatedHours} ч.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Мини-чат */}
          <TaskMiniChat taskId={task.id} />
        </div>
      </div>

      {/* Диалог редактирования задачи */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редактировать задачу</DialogTitle>
            <DialogDescription>
              Внесите изменения в задачу и нажмите &quot;Сохранить&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value: TaskStatus) => setEditFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">К выполнению</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="in_review">На проверке</SelectItem>
                    <SelectItem value="done">Выполнено</SelectItem>
                    <SelectItem value="cancelled">Отменено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Приоритет</Label>
                <Select
                  value={editFormData.priority}
                  onValueChange={(value: TaskPriority) => setEditFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lowest">Очень низкий</SelectItem>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="highest">Очень высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimatedHours">Оценочное время (часы)</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={editFormData.estimatedHours || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || undefined }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateTask.isPending}>
              {updateTask.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}