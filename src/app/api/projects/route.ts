import { NextRequest, NextResponse } from 'next/server'
import { ProjectRepository } from '@/lib/db/repositories/projectRepository'
import { CreateProjectRequest } from '@/types/project'

const projectRepo = new ProjectRepository()

export async function GET(request: NextRequest) {
  try {
    console.log('API /projects GET called')
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    console.log('API params:', { page, limit, search })

    const result = await projectRepo.findAll({
      search: search || undefined,
      page,
      limit,
    })

    console.log('API response:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('API /projects error:', error)
    return NextResponse.json(
      { message: 'Ошибка получения проектов', code: 'FETCH_ERROR' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API /projects POST called')
    
    const body: CreateProjectRequest = await request.json()
    console.log('Create project body:', body)
    
    // Валидация данных
    if (!body.name || !body.key) {
      return NextResponse.json(
        { message: 'Название и ключ проекта обязательны', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // В реальном приложении получаем ID текущего пользователя из JWT токена
    // Для демо используем первого пользователя
    const currentUserId = '1' // TODO: получать из токена

    const project = await projectRepo.create(body, currentUserId)
    console.log('Project created:', project)

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('API /projects POST error:', error)
    
    if (error instanceof Error && error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { message: 'Проект с таким ключом уже существует', code: 'KEY_EXISTS' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Ошибка создания проекта', code: 'CREATE_ERROR' },
      { status: 500 }
    )
  }
}