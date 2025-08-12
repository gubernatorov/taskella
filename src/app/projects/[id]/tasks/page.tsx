'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TaskCard } from '@/components/tasks/TaskCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Loading } from '@/components/common/Loading'
import { useProject } from '@/lib/hooks/useProjects'
import { useTasks } from '@/lib/hooks/useTasks'
import { TaskStatus, TaskPriority } from '@/types/task'
import { Plus, Search, CheckSquare, ArrowLeft, Filter, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'

interface ProjectTasksPageProps {
  params: { id: string }
}

export default function ProjectTasksPage({ params }: ProjectTasksPageProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: project, isLoading: projectLoading } = useProject(params.id)
  const { data: tasks, isLoading: tasksLoading } = useTasks({
    projectId: params.id,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
  })

  if (projectLoading) return <Loading />

  if (!project) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Проект не найден"
        description="Проект не существует или у вас нет доступа к нему"
      />
    )
  }

  const taskList = tasks || []
  const filteredTasks = search
    ? taskList.filter((task) =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase())
      )
    : taskList

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/projects/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Задачи проекта</h1>
          <p className="text-muted-foreground">
            {project.name} • {filteredTasks.length} из {project.tasksCount} задач
          </p>
        </div>
        <Button asChild>
          <Link href={`/projects/${params.id}/tasks/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Новая задача
          </Link>
        </Button>
      </div>

      {/* Фильтры и поиск */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск задач..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="todo">К выполнению</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="in_review">На проверке</SelectItem>
            <SelectItem value="done">Выполнено</SelectItem>
            <SelectItem value="cancelled">Отменено</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
            <SelectItem value="highest">Критический</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
            <SelectItem value="lowest">Самый низкий</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Список задач */}
      {tasksLoading ? (
        <Loading />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Нет задач"
          description={search || statusFilter !== 'all' || priorityFilter !== 'all' 
            ? "Задачи не найдены по указанным фильтрам"
            : "В этом проекте пока нет задач"
          }
          action={(!search && statusFilter === 'all' && priorityFilter === 'all') ? {
            label: 'Создать первую задачу',
            onClick: () => window.location.href = `/projects/${params.id}/tasks/new`
          } : undefined}
        />
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              compact={viewMode === 'list'} 
            />
          ))}
        </div>
      )}
    </div>
  )
}