'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useCreateProject } from '@/lib/hooks/useProjects'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Максимум 100 символов'),
  key: z.string()
    .min(2, 'Минимум 2 символа')
    .max(10, 'Максимум 10 символов')
    .regex(/^[A-Z]+$/, 'Только заглавные латинские буквы'),
  description: z.string().max(500, 'Максимум 500 символов').optional(),
})

type CreateProjectForm = z.infer<typeof createProjectSchema>

export default function NewProjectPage() {
  const router = useRouter()
  const createProject = useCreateProject()

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      key: '',
      description: '',
    },
  })

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      const project = await createProject.mutateAsync(data)
      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const generateKey = (name: string) => {
    const key = name
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 5)
    
    if (key.length >= 2) {
      form.setValue('key', key)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Новый проект</h1>
          <p className="text-muted-foreground">
            Создайте новый проект для управления задачами
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о проекте</CardTitle>
          <CardDescription>
            Заполните основную информацию о вашем проекте
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название проекта</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Мой проект"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          if (!form.getValues('key')) {
                            generateKey(e.target.value)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ключ проекта</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="PROJ"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        maxLength={10}
                      />
                    </FormControl>
                    <FormDescription>
                      Короткий ключ для задач (например: TASK-123). Только заглавные латинские буквы.
                    </FormDescription>
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
                        placeholder="Описание проекта..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  disabled={createProject.isPending}
                  className="flex-1"
                >
                  {createProject.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Создать проект
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/projects">Отмена</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}