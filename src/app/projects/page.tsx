'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Loading } from '@/components/common/Loading'
import { useProjects } from '@/lib/hooks/useProjects'
import { Plus, Search, FolderOpen } from 'lucide-react'
import Link from 'next/link'

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const { data: projects, isLoading, error } = useProjects({ search })

  // Отладочная информация
  console.log('Projects page debug:', {
    projects,
    isLoading,
    error,
    search
  })

  if (isLoading) return <Loading />

  if (error) {
    console.error('Projects error:', error)
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Проекты</h1>
            <p className="text-muted-foreground">
              Управляйте своими проектами и командами
            </p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Новый проект
            </Link>
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Ошибка загрузки проектов</h3>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    )
  }

  const projectList = projects || []

  return (
    <div className="space-y-6 animate-float">
      <div className="glass glass-hover p-6 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Проекты
            </h1>
            <p className="text-muted-foreground/80 mt-1">
              Управляйте своими проектами и командами
            </p>
          </div>
          <Button asChild className="mt-4 sm:mt-0">
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Новый проект
            </Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2 mt-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <Input
              placeholder="Поиск проектов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 glass"
            />
          </div>
        </div>
      </div>

      {projectList.length === 0 ? (
        <div className="glass glass-hover p-8 rounded-xl">
          <EmptyState
            icon={FolderOpen}
            title="Нет проектов"
            description="Создайте свой первый проект, чтобы начать работу с задачами"
            action={{
              label: 'Создать проект',
              onClick: () => window.location.href = '/projects/new'
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectList.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}