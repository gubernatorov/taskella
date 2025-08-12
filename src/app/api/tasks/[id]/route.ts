import { NextRequest, NextResponse } from 'next/server'
import { TaskRepository } from '@/lib/db/repositories/taskRepository'
import { UpdateTaskRequest } from '@/types/task'

const taskRepo = new TaskRepository()

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const task = await taskRepo.findById(params.id)
    
    if (!task) {
      return NextResponse.json(
        { message: 'Задача не найдена', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('API /tasks/[id] error:', error)
    return NextResponse.json(
      { message: 'Ошибка получения задачи', code: 'FETCH_ERROR' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body: UpdateTaskRequest = await request.json()
    
    const task = await taskRepo.update(params.id, body)
    
    if (!task) {
      return NextResponse.json(
        { message: 'Задача не найдена', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('API /tasks/[id] PUT error:', error)
    return NextResponse.json(
      { message: 'Ошибка обновления задачи', code: 'UPDATE_ERROR' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const deleted = await taskRepo.delete(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { message: 'Задача не найдена', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error('API /tasks/[id] DELETE error:', error)
    return NextResponse.json(
      { message: 'Ошибка удаления задачи', code: 'DELETE_ERROR' },
      { status: 500 }
    )
  }
}
