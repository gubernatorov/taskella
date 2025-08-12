import { NextRequest, NextResponse } from 'next/server'
import { TaskRepository } from '@/lib/db/repositories/taskRepository'
import { TaskStatus, TaskPriority } from '@/types/task'

const taskRepo = new TaskRepository()

export async function GET(request: NextRequest) {
  try {
    console.log('API /tasks GET called')
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as TaskStatus | null
    const priority = searchParams.get('priority') as TaskPriority | null
    const assignee = searchParams.get('assignee')
    const projectId = searchParams.get('projectId')

    const result = await taskRepo.findAll({
      projectId: projectId || undefined,
      status: status || undefined,
      priority: priority || undefined,
      assignee: assignee || undefined,
      page,
      limit,
    })

    console.log('API /tasks response:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('API /tasks error:', error)
    return NextResponse.json(
      { message: 'Ошибка получения задач', code: 'FETCH_ERROR' },
      { status: 500 }
    )
  }
}