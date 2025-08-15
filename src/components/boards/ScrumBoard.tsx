'use client'

import { useState, useCallback, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Task, TaskStatus, TaskType } from '@/types/task'
import { useUpdateTask } from '@/lib/hooks/useTasks'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarDays, Clock, BarChart3, Target, Bug, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface ScrumBoardProps {
  tasks: Task[]
  projectId: string
}

const SCRUM_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'Product Backlog', color: 'bg-slate-100' },
  { id: 'in_progress', title: 'Sprint Backlog', color: 'bg-blue-100' },
  { id: 'in_review', title: 'In Review', color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' }
]

const TASK_TYPE_ICONS = {
  story: <Target className="w-3 h-3" />,
  task: <BarChart3 className="w-3 h-3" />,
  bug: <Bug className="w-3 h-3" />,
  epic: <Lightbulb className="w-3 h-3" />,
  feature: <Target className="w-3 h-3" />
}

const TASK_TYPE_COLORS = {
  story: 'bg-blue-500',
  task: 'bg-green-500',
  bug: 'bg-red-500',
  epic: 'bg-purple-500',
  feature: 'bg-orange-500'
}

export function ScrumBoard({ tasks, projectId }: ScrumBoardProps) {
  const [localTasks, setLocalTasks] = useState(tasks)
  const [selectedSprint, setSelectedSprint] = useState<string>('current')
  const updateTaskMutation = useUpdateTask()

  // Обновляем локальные задачи при изменении пропсов
  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newStatus = destination.droppableId as TaskStatus
    const taskId = draggableId

    // Оптимистичное обновление UI
    setLocalTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus }
          : task
      )
    )

    // Обновляем задачу на сервере
    updateTaskMutation.mutate({
      id: taskId,
      data: { status: newStatus }
    }, {
      onError: () => {
        // Откатываем изменения при ошибке
        setLocalTasks(tasks)
      }
    })
  }, [tasks, updateTaskMutation])

  const getTasksByStatus = (status: TaskStatus) => {
    return localTasks.filter(task => task.status === status)
  }

  const getStoryPoints = (tasks: Task[]) => {
    return tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
  }

  const getTaskTypeIcon = (type: TaskType) => {
    return TASK_TYPE_ICONS[type] || <BarChart3 className="w-3 h-3" />
  }

  const getTaskTypeColor = (type: TaskType) => {
    return TASK_TYPE_COLORS[type] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Sprint Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Текущий спринт
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div>Всего задач: {localTasks.length}</div>
              <div>Story Points: {getStoryPoints(localTasks)}</div>
              <div>Выполнено: {getTasksByStatus('done').length}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Scrum Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCRUM_COLUMNS.map(column => {
            const columnTasks = getTasksByStatus(column.id)
            const storyPoints = getStoryPoints(columnTasks)
            
            return (
              <div key={column.id} className="space-y-3">
                <div className={`p-4 rounded-lg ${column.color}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs" aria-label={`${columnTasks.length} задач`}>
                        {columnTasks.length}
                      </Badge>
                      <Badge variant="outline" className="text-xs" aria-label={`${storyPoints} story points`}>
                        {storyPoints} SP
                      </Badge>
                    </div>
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[300px] space-y-3 p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-slate-50' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-grab active:cursor-grabbing transition-all duration-300 ease-in-out ${
                                snapshot.isDragging ? 'shadow-lg scale-[1.02]' : 'hover:shadow-md hover:scale-[1.01]'
                              }`}
                            >
                              <Link href={`/tasks/${task.id}`} className="block">
                                <Card className="h-full hover:shadow-md transition-shadow">
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                          <div className={`p-1 rounded text-white ${getTaskTypeColor(task.type)}`}>
                                            {getTaskTypeIcon(task.type)}
                                          </div>
                                          <Badge variant="outline" className="text-xs">
                                            {task.key}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs capitalize">
                                            {task.type}
                                          </Badge>
                                        </div>
                                        <h4 className="font-medium text-sm leading-tight hover:text-primary transition-colors">
                                          {task.title}
                                        </h4>
                                      </div>
                                      <PriorityBadge priority={task.priority} />
                                    </div>

                                    {task.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-3">
                                        {task.description}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        {task.assignee && (
                                          <div className="flex items-center gap-1">
                                            <Avatar className="w-5 h-5">
                                              <AvatarImage src={task.assignee.avatarUrl} />
                                              <AvatarFallback className="text-xs">
                                                {task.assignee.firstName.charAt(0)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-muted-foreground">
                                              {task.assignee.firstName}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {task.estimatedHours && (
                                          <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{task.estimatedHours} SP</span>
                                          </div>
                                        )}
                                        
                                        {task.dueDate && (
                                          <div className="flex items-center gap-1">
                                            <CalendarDays className="w-3 h-3" />
                                            <span>
                                              {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
