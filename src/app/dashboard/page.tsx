'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjects } from '@/lib/hooks/useProjects'
import { useTasks } from '@/lib/hooks/useTasks'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { TaskCard } from '@/components/tasks/TaskCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: projects } = useProjects({ limit: 3 })
  const { data: tasks } = useTasks({ limit: 5, status: 'in_progress' })

  return (
    <div className="space-y-6 animate-float">
      <div className="glass glass-hover p-6 rounded-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Дашборд
        </h1>
        <p className="text-muted-foreground/80 mt-1">
          Обзор ваших проектов и задач
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Недавние проекты
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">Ваши последние проекты</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Создать
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects?.map((project) => (
              <ProjectCard key={project.id} project={project} compact />
            ))}
            <Button variant="outline" asChild className="w-full">
              <Link href="/projects">Все проекты</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                В работе
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">Ваши активные задачи</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/tasks/new">
                <Plus className="h-4 w-4 mr-2" />
                Создать
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks?.map((task) => (
              <TaskCard key={task.id} task={task} compact />
            ))}
            <Button variant="outline" asChild className="w-full">
              <Link href="/tasks">Все задачи</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}