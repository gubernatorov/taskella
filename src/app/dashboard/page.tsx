'use client'

import { List, Section, Cell, Button } from '@telegram-apps/telegram-ui'
import { useProjects } from '@/lib/hooks/useProjects'
import { useTasks } from '@/lib/hooks/useTasks'
import { Plus, FolderOpen, CheckSquare, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { data: projects } = useProjects({ limit: 3 })
  const { data: tasks } = useTasks({ limit: 5, status: 'in_progress' })
  const router = useRouter()

  return (
    <List>
      <Section header="Дашборд" footer="Обзор ваших проектов и задач">
        <Cell
          before={<div style={{ color: 'var(--tg-theme-accent-text-color, #3390ec)' }}>📊</div>}
          subtitle="Добро пожаловать в Taskella"
        >
          Управление задачами
        </Cell>
      </Section>

      <Section
        header="Недавние проекты"
        footer={`Показано ${projects?.length || 0} из последних проектов`}
      >
        {projects?.map((project) => (
          <Cell
            key={project.id}
            before={<FolderOpen size={20} style={{ color: 'var(--tg-theme-accent-text-color, #3390ec)' }} />}
            after={<ArrowRight size={16} />}
            subtitle={project.description || 'Без описания'}
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            {project.name}
          </Cell>
        ))}
        
        <Cell
          before={<Plus size={20} />}
          onClick={() => router.push('/projects/new')}
        >
          Создать новый проект
        </Cell>
        
        <Cell
          before={<ArrowRight size={20} />}
          onClick={() => router.push('/projects')}
        >
          Все проекты
        </Cell>
      </Section>

      <Section
        header="Активные задачи"
        footer={`Показано ${tasks?.length || 0} задач в работе`}
      >
        {tasks?.map((task) => (
          <Cell
            key={task.id}
            before={<CheckSquare size={20} style={{ color: 'var(--tg-theme-accent-text-color, #3390ec)' }} />}
            after={<ArrowRight size={16} />}
            subtitle={`Приоритет: ${task.priority || 'normal'}`}
            onClick={() => router.push(`/tasks/${task.id}`)}
          >
            {task.title}
          </Cell>
        ))}
        
        <Cell
          before={<Plus size={20} />}
          onClick={() => router.push('/tasks/new')}
        >
          Создать новую задачу
        </Cell>
        
        <Cell
          before={<ArrowRight size={20} />}
          onClick={() => router.push('/tasks')}
        >
          Все задачи
        </Cell>
      </Section>
    </List>
  )
}