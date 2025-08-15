'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <Card>
        <CardHeader>
          <CardTitle>Настройки доски</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Проект</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
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
              <label className="text-sm font-medium">Тип доски</label>
              <Select value={boardType} onValueChange={(value: BoardType) => setBoardType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">Kanban</SelectItem>
                  <SelectItem value="scrum">Scrum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Доска */}
      {selectedProject ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {selectedProjectData?.name} - {boardType === 'kanban' ? 'Kanban' : 'Scrum'} доска
            </h2>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Обновить
            </Button>
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
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-muted-foreground">
                Выберите проект для отображения доски
              </h3>
              <p className="text-sm text-muted-foreground">
                Выберите проект из списка выше, чтобы увидеть задачи на доске
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
