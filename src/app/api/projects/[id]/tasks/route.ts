import { NextRequest, NextResponse } from 'next/server'
import { TaskRepository } from '@/lib/db/repositories/taskRepository'
import { CreateTaskRequest, TaskStatus, TaskPriority } from '@/types/task'

const taskRepo = new TaskRepository()

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as TaskStatus | null
    const priority = searchParams.get('priority') as TaskPriority | null
    const assignee = searchParams.get('assignee')

    const result = await taskRepo.findAll({
      projectId: params.id,
      status: status || undefined,
      priority: priority || undefined,
      assignee: assignee || undefined,
      page,
      limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('API /projects/[id]/tasks error:', error)
    return NextResponse.json(
      { message: 'Ошибка получения задач', code: 'FETCH_ERROR' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body: CreateTaskRequest = await request.json()
    
    if (!body.title || !body.type || !body.priority) {
      return NextResponse.json(
        { message: 'Название, тип и приоритет задачи обязательны', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // В реальном приложении получаем ID текущего пользователя из JWT токена
    const currentUserId = '1' // TODO: получать из токена

    const task = await taskRepo.create(body, params.id, currentUserId)

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('API /projects/[id]/tasks POST error:', error)
    
    if (error instanceof Error && error.message?.includes('не найден')) {
      return NextResponse.json(
        { message: error.message, code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Ошибка создания задачи', code: 'CREATE_ERROR' },
      { status: 500 }
    )
  }
}