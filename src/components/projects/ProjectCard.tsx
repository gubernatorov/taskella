import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Project } from '@/types/project'
import { Calendar, Users, CheckSquare } from 'lucide-react'
import Link from 'next/link'

interface ProjectCardProps {
  project: Project
  compact?: boolean
}

export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  console.log('Rendering ProjectCard:', project)

  const statusVariant = {
    active: 'default',
    archived: 'secondary',
    suspended: 'destructive',
  } as const

  if (compact) {
    return (
      <Card className="glass glass-hover cursor-pointer">
        <Link href={`/projects/${project.id}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                {project.name}
              </CardTitle>
              <Badge variant={statusVariant[project.status]} className="text-xs">
                {project.key}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center text-xs text-muted-foreground space-x-4">
              <div className="flex items-center">
                <CheckSquare className="h-3 w-3 mr-1 text-primary/70" />
                {project.tasksCount}
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1 text-primary/70" />
                {project.membersCount}
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    )
  }

  return (
      <Card className="glass glass-hover">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {project.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">{project.description}</CardDescription>
          </div>
          <Badge variant={statusVariant[project.status]}>
            {project.key}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <CheckSquare className="h-4 w-4 mr-1 text-primary/70" />
              {project.tasksCount} задач
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1 text-primary/70" />
              {project.membersCount} участников
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button asChild className="flex-1">
            <Link href={`/projects/${project.id}`}>
              Открыть
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
