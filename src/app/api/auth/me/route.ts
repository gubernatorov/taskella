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
      
      // Проверяем, существует ли пользователь
      let user = await userRepo.findById(decoded.userId)
      
      // Если пользователь не найден и мы в продакшене, возможно база данных не инициализирована
      if (!user && process.env.NODE_ENV === 'production') {
        console.log('User not found in production mode, attempting to initialize database...')
        
        try {
          // Пытаемся инициализировать базу данных
          const { initializeDatabase } = await import('@/lib/db/init')
          await initializeDatabase({ force: false, seedData: true, createIndexes: true })
          
          // Повторно пытаемся найти пользователя после инициализации
          user = await userRepo.findById(decoded.userId)
          
          if (!user) {
            return NextResponse.json(
              { message: 'Пользователь не найден', code: 'USER_NOT_FOUND' },
              { status: 404 }
            )
          }
        } catch (initError) {
          console.error('Failed to initialize database:', initError)
          return NextResponse.json(
            { message: 'Ошибка инициализации базы данных', code: 'DB_INIT_ERROR' },
            { status: 503 }
          )
        }
      } else if (!user) {
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