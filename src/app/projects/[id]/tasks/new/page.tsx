'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useCreateTask } from '@/lib/hooks/useTasks'
import { useProject } from '@/lib/hooks/useProjects'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader2, ArrowLeft, CheckSquare } from 'lucide-react'
import Link from 'next/link'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(200, 'Максимум 200 символов'),
  description: z.string().max(2000, 'Максимум 2000 символов').optional(),
  type: z.enum(['task', 'bug', 'feature', 'epic', 'story']),
  priority: z.enum(['lowest', 'low', 'medium', 'high', 'highest']),
  estimatedHours: z.number().min(0).optional(),
  dueDate: z.string().optional(),
})

type CreateTaskForm = z.infer<typeof createTaskSchema>

interface NewProjectTaskPageProps {
  params: { id: string }
}

export default function NewProjectTaskPage({ params }: NewProjectTaskPageProps) {
  const router = useRouter()
  const createTask = useCreateTask()
  const { data: project, isLoading: projectLoading } = useProject(params.id)

  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'task',
      priority: 'medium',
      estimatedHours: undefined,
      dueDate: '',
    },
  })

  const onSubmit = async (data: CreateTaskForm) => {
    try {
      const task = await createTask.mutateAsync({ 
        projectId: params.id, 
        data: {
          ...data,
          estimatedHours: data.estimatedHours || undefined,
          dueDate: data.dueDate || undefined,
        }
      })
      router.push(`/tasks/${task.id}`)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  if (projectLoading) return <Loading />

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto pt-20">
        <EmptyState
          icon={CheckSquare}
          title="Проект не найден"
          description="Проект не существует или у вас нет доступа к нему"
          action={{
            label: 'Вернуться к проектам',
            onClick: () => router.push('/projects')
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/projects/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Новая задача</h1>
          <p className="text-muted-foreground">
            Создать задачу в проекте "{project.name}"
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о задаче</CardTitle>
          <CardDescription>
            Создайте новую задачу для проекта {project.name} ({project.key})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название задачи</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите название задачи" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание (необязательно)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Подробное описание задачи..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="task">Задача</SelectItem>
                          <SelectItem value="bug">Ошибка</SelectItem>
                          <SelectItem value="feature">Новая функция</SelectItem>
                          <SelectItem value="epic">Эпик</SelectItem>
                          <SelectItem value="story">История</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Приоритет</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lowest">Самый низкий</SelectItem>
                          <SelectItem value="low">Низкий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="high">Высокий</SelectItem>
                          <SelectItem value="highest">Критический</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Оценка времени (часы)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="8"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Срок выполнения</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  disabled={createTask.isPending}
                  className="flex-1"
                >
                  {createTask.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Создать задачу
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/projects/${params.id}`}>Отмена</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}