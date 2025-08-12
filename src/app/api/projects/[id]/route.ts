import { NextRequest, NextResponse } from 'next/server'
import { ProjectRepository } from '@/lib/db/repositories/projectRepository'
import { UpdateProjectRequest } from '@/types/project'

const projectRepo = new ProjectRepository()

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const project = await projectRepo.findById(params.id)
    
    if (!project) {
      return NextResponse.json(
        { message: 'Проект не найден', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('API /projects/[id] error:', error)
    return NextResponse.json(
      { message: 'Ошибка получения проекта', code: 'FETCH_ERROR' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body: UpdateProjectRequest = await request.json()
    
    const project = await projectRepo.update(params.id, body)
    
    if (!project) {
      return NextResponse.json(
        { message: 'Проект не найден', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('API /projects/[id] PUT error:', error)
    return NextResponse.json(
      { message: 'Ошибка обновления проекта', code: 'UPDATE_ERROR' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const deleted = await projectRepo.delete(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { message: 'Проект не найден', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error('API /projects/[id] DELETE error:', error)
    return NextResponse.json(
      { message: 'Ошибка удаления проекта', code: 'DELETE_ERROR' },
      { status: 500 }
    )
  }
}