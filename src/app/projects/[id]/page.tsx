'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from '@/components/tasks/TaskCard'
import { useProject } from '@/lib/hooks/useProjects'
import { useTasks } from '@/lib/hooks/useTasks'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { Plus, ArrowLeft, Settings, Users, CheckSquare, Calendar, Activity, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ProjectPageProps {
  params: { id: string }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { data: project, isLoading: projectLoading } = useProject(params.id)
  const { data: tasks, isLoading: tasksLoading } = useTasks({
    projectId: params.id,
    limit: 6
  })

  if (projectLoading) return <Loading />
  
  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={CheckSquare}
          title="Проект не найден"
          description="Проект не существует или у вас нет доступа к нему"
          action={{
            label: 'Вернуться к проектам',
            onClick: () => window.location.href = '/projects'
          }}
        />
      </div>
    )
  }

  const taskList = tasks || []
  
  const statusVariant = {
    active: 'default',
    archived: 'secondary', 
    suspended: 'destructive',
  } as const

  const statusLabels = {
    active: 'Активный',
    archived: 'Архивный',
    suspended: 'Приостановлен',
  } as const

  // Подсчет статистики задач
  const taskStats = {
    todo: taskList.filter(task => task.status === 'todo').length,
    inProgress: taskList.filter(task => task.status === 'in_progress').length,
    inReview: taskList.filter(task => task.status === 'in_review').length,
    done: taskList.filter(task => task.status === 'done').length,
    cancelled: taskList.filter(task => task.status === 'cancelled').length,
  }

  const completionRate = project.tasksCount > 0 
    ? Math.round((taskStats.done / project.tasksCount) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge variant={statusVariant[project.status]}>
              {project.key}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {statusLabels[project.status]}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-1">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" title="Настройки проекта">
            <Settings className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href={`/projects/${params.id}/tasks/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Задача
            </Link>
          </Button>
        </div>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего задач</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.tasksCount}</div>
            <p className="text-xs text-muted-foreground">
              в проекте
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Завершено</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {taskStats.done} из {project.tasksCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В работе</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              активных задач
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Участники</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.membersCount}</div>
            <p className="text-xs text-muted-foreground">
              в команде
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - Задачи */}
        <div className="lg:col-span-2 space-y-6">
          {/* Статистика по статусам задач */}
          <Card>
            <CardHeader>
              <CardTitle>Распределение задач</CardTitle>
              <CardDescription>
                Статистика по статусам задач в проекте
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{taskStats.todo}</div>
                  <div className="text-xs text-muted-foreground">К выполнению</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{taskStats.inProgress}</div>
                  <div className="text-xs text-muted-foreground">В работе</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{taskStats.inReview}</div>
                  <div className="text-xs text-muted-foreground">На проверке</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{taskStats.done}</div>
                  <div className="text-xs text-muted-foreground">Выполнено</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{taskStats.cancelled}</div>
                  <div className="text-xs text-muted-foreground">Отменено</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Недавние задачи */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Недавние задачи</CardTitle>
                <CardDescription>
                  Последние обновленные задачи в проекте
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/projects/${params.id}/tasks`}>
                    Все задачи
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/projects/${params.id}/tasks/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : taskList.length === 0 ? (
                <EmptyState
                  icon={CheckSquare}
                  title="Нет задач"
                  description="В этом проекте пока нет задач. Создайте первую задачу, чтобы начать работу."
                  action={{
                    label: 'Создать первую задачу',
                    onClick: () => window.location.href = `/projects/${params.id}/tasks/new`
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {taskList.map((task) => (
                    <TaskCard key={task.id} task={task} compact />
                  ))}
                  {taskList.length >= 6 && (
                    <div className="pt-4 border-t">
                      <Button variant="outline" asChild className="w-full">
                        <Link href={`/projects/${params.id}/tasks`}>
                          Посмотреть все {project.tasksCount} задач проекта
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка - Информация о проекте */}
        <div className="space-y-6">
          {/* Информация о проекте */}
          <Card>
            <CardHeader>
              <CardTitle>О проекте</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Владелец</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {project.owner.firstName[0]}{project.owner.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {project.owner.firstName} {project.owner.lastName}
                    </p>
                    {project.owner.username && (
                      <p className="text-xs text-muted-foreground">
                        @{project.owner.username}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Создан</h4>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(project.createdAt), { 
                      addSuffix: true, 
                      locale: ru 
                    })}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Последнее обновление</h4>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(project.updatedAt), { 
                      addSuffix: true, 
                      locale: ru 
                    })}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Статус</h4>
                <Badge variant={statusVariant[project.status]} className="text-xs">
                  {statusLabels[project.status]}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Ключ проекта</h4>
                <Badge variant="outline" className="font-mono">
                  {project.key}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Действия */}
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/projects/${params.id}/tasks`}>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Все задачи проекта
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Управление командой
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Отчеты и аналитика
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Настройки проекта
              </Button>
            </CardContent>
          </Card>

          {/* Быстрая статистика */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрая статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Общий прогресс</span>
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Активных задач</span>
                  <span className="font-medium">{taskStats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">На проверке</span>
                  <span className="font-medium">{taskStats.inReview}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Завершено</span>
                  <span className="font-medium text-green-600">{taskStats.done}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}