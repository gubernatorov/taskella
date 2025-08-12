import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/db/repositories/userRepository'
import jwt from 'jsonwebtoken'

const userRepo = new UserRepository()

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Токен не предоставлен', code: 'NO_TOKEN' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      const user = await userRepo.findById(decoded.userId)
      
      if (!user) {
        return NextResponse.json(
          { message: 'Пользователь не найден', code: 'USER_NOT_FOUND' },
          { status: 404 }
        )
      }

      return NextResponse.json(user)
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Неверный токен', code: 'INVALID_TOKEN' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json(
      { message: 'Ошибка сервера', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}