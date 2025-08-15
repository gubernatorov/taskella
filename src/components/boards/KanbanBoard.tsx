'use client'

import { useState, useCallback, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Task, TaskStatus } from '@/types/task'
import { useUpdateTask } from '@/lib/hooks/useTasks'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import { StatusBadge } from '@/components/tasks/StatusBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarDays, Clock, User } from 'lucide-react'
import Link from 'next/link'

interface KanbanBoardProps {
  tasks: Task[]
  projectId: string
}

const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'К выполнению', color: 'bg-slate-100' },
  { id: 'in_progress', title: 'В работе', color: 'bg-blue-100' },
  { id: 'in_review', title: 'На проверке', color: 'bg-yellow-100' },
  { id: 'done', title: 'Выполнено', color: 'bg-green-100' },
  { id: 'cancelled', title: 'Отменено', color: 'bg-red-100' }
]

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const [localTasks, setLocalTasks] = useState(tasks)
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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {KANBAN_COLUMNS.map(column => (
          <div key={column.id} className="space-y-3">
            <div className={`p-3 rounded-lg ${column.color}`}>
              <h3 className="font-semibold text-sm flex items-center justify-between">
                <span>{column.title}</span>
                <Badge variant="secondary" className="ml-2" aria-label={`${getTasksByStatus(column.id).length} задач`}>
                  {getTasksByStatus(column.id).length}
                </Badge>
              </h3>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[200px] space-y-2 p-2 rounded-lg transition-colors ${
                    snapshot.isDraggingOver ? 'bg-slate-50' : ''
                  }`}
                >
                  {getTasksByStatus(column.id).map((task, index) => (
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
                              <CardContent className="p-3 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {task.key}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
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
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    {task.assignee && (
                                      <div className="flex items-center gap-1">
                                        <Avatar className="w-4 h-4">
                                          <AvatarImage src={task.assignee.avatarUrl} />
                                          <AvatarFallback className="text-xs">
                                            {task.assignee.firstName.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                      </div>
                                    )}
                                    
                                    {task.estimatedHours && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{task.estimatedHours}ч</span>
                                      </div>
                                    )}
                                  </div>

                                  {task.dueDate && (
                                    <div className="flex items-center gap-1">
                                      <CalendarDays className="w-3 h-3" />
                                      <span>
                                        {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                                      </span>
                                    </div>
                                  )}
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
        ))}
      </div>
    </DragDropContext>
  )
}
