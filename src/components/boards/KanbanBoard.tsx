'use client'

import { useState, useCallback, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { TelegramCard } from '@/components/ui/telegram-card'
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
  { id: 'todo', title: 'К выполнению', color: 'bg-[var(--tg-theme-secondary-bg-color)]' },
  { id: 'in_progress', title: 'В работе', color: 'bg-[var(--tg-theme-button-color)]/10' },
  { id: 'in_review', title: 'На проверке', color: 'bg-[var(--tg-theme-link-color)]/10' },
  { id: 'done', title: 'Выполнено', color: 'bg-green-500/10' },
  { id: 'cancelled', title: 'Отменено', color: 'bg-[var(--tg-theme-destructive-text-color)]/10' }
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
            <div className={`p-4 rounded-xl ${column.color} border border-[var(--tg-theme-hint-color)]/10`}>
              <h3 className="font-semibold text-sm flex items-center justify-between text-[var(--tg-theme-text-color)]">
                <span>{column.title}</span>
                <div className="flex items-center gap-2">
                  <div className="bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] px-2 py-1 rounded-full text-xs font-medium">
                    {getTasksByStatus(column.id).length}
                  </div>
                </div>
              </h3>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[200px] space-y-3 p-2 rounded-xl transition-colors ${
                    snapshot.isDraggingOver ? 'bg-[var(--tg-theme-secondary-bg-color)]' : ''
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
                            <TelegramCard className="h-full transition-all duration-200 hover:scale-[1.02]">
                              <div className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] px-2 py-1 rounded-lg text-xs font-medium">
                                        {task.key}
                                      </div>
                                      <div className="bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] px-2 py-1 rounded-lg text-xs">
                                        {task.type}
                                      </div>
                                    </div>
                                    <h4 className="font-medium text-sm leading-tight text-[var(--tg-theme-text-color)] hover:text-[var(--tg-theme-link-color)] transition-colors">
                                      {task.title}
                                    </h4>
                                  </div>
                                  <PriorityBadge priority={task.priority} />
                                </div>

                                {task.description && (
                                  <p className="text-xs text-[var(--tg-theme-hint-color)] line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between text-xs text-[var(--tg-theme-hint-color)]">
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
                              </div>
                            </TelegramCard>
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
