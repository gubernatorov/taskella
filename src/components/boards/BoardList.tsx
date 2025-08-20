'use client'

import { useState, useEffect } from 'react'
import { TelegramUIButton } from '@/components/ui/telegram-button'
import { TelegramCard } from '@/components/ui/telegram-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KanbanBoard } from './KanbanBoard'
import { ScrumBoard } from './ScrumBoard'
import { useProjects } from '@/lib/hooks/useProjects'
import { useTasks } from '@/lib/hooks/useTasks'
import { Project } from '@/types/project'

type BoardType = 'kanban' | 'scrum'

export function BoardList() {
  const [selectedProject, setSelectedProject] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedBoardProject') || ''
    }
    return ''
  })
  const [boardType, setBoardType] = useState<BoardType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selectedBoardType') as BoardType) || 'kanban'
    }
    return 'kanban'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedBoardProject', selectedProject)
      localStorage.setItem('selectedBoardType', boardType)
    }
  }, [selectedProject, boardType])
  
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: tasks, isLoading: tasksLoading } = useTasks({
    projectId: selectedProject || undefined
  })

  const selectedProjectData = projects?.find((p: Project) => p.id === selectedProject)

  if (projectsLoading) {
    return <div className="flex justify-center p-8">Загрузка проектов...</div>
  }

  return (
    <div className="space-y-6">
      {/* Настройки доски */}
      <TelegramCard>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)] mb-4">Настройки доски</h2>
          <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="project-select" className="text-sm font-medium text-[var(--tg-theme-text-color)]">Проект</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="project-select">
                  <SelectValue placeholder="Выберите проект" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project: Project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="board-type-select" className="text-sm font-medium text-[var(--tg-theme-text-color)]">Тип доски</label>
              <Select value={boardType} onValueChange={(value: BoardType) => setBoardType(value)}>
                <SelectTrigger id="board-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">Kanban</SelectItem>
                  <SelectItem value="scrum">Scrum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>
        </div>
      </TelegramCard>

      {/* Доска */}
      {selectedProject ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--tg-theme-text-color)]">
              {selectedProjectData?.name} - {boardType === 'kanban' ? 'Kanban' : 'Scrum'} доска
            </h2>
            <TelegramUIButton
              variant="secondary"
              onClick={() => {
                // Используем более React-подходный способ обновления данных
                const currentProject = selectedProject;
                const currentBoardType = boardType;
                setSelectedProject('');
                setTimeout(() => {
                  setSelectedProject(currentProject);
                  setBoardType(currentBoardType);
                }, 100);
              }}
            >
              Обновить
            </TelegramUIButton>
          </div>
          
          {tasksLoading ? (
            <div className="flex justify-center p-8">Загрузка задач...</div>
          ) : boardType === 'kanban' ? (
            <KanbanBoard 
              tasks={tasks || []} 
              projectId={selectedProject}
            />
          ) : (
            <ScrumBoard 
              tasks={tasks || []} 
              projectId={selectedProject}
            />
          )}
        </div>
      ) : (
        <TelegramCard>
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-[var(--tg-theme-hint-color)]">
                Выберите проект для отображения доски
              </h3>
              <p className="text-sm text-[var(--tg-theme-hint-color)]">
                Выберите проект из списка выше, чтобы увидеть задачи на доске
              </p>
            </div>
          </div>
        </TelegramCard>
      )}
    </div>
  )
}
