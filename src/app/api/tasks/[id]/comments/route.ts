import { NextRequest, NextResponse } from 'next/server'
import { CommentRepository } from '@/lib/db/repositories/commentRepository'
import { CreateCommentRequest } from '@/types/comment'

const commentRepo = new CommentRepository()

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const comments = await commentRepo.findByTaskId(params.id)
    return NextResponse.json(comments)
  } catch (error) {
    console.error('API /tasks/[id]/comments GET error:', error)
    return NextResponse.json(
      { message: 'Ошибка получения комментариев', code: 'FETCH_ERROR' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body: CreateCommentRequest = await request.json()
    
    // В реальном приложении здесь должна быть проверка авторизации
    // Пока используем заглушку для authorId
    const authorId = '1' // TODO: получить из сессии/токена
    
    const comment = await commentRepo.create(params.id, authorId, body)
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('API /tasks/[id]/comments POST error:', error)
    return NextResponse.json(
      { message: 'Ошибка создания комментария', code: 'CREATE_ERROR' },
      { status: 500 }
    )
  }
}