import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { UserRepository } from '@/lib/db/repositories/userRepository'

// ВАЖНО: Используйте этот endpoint ТОЛЬКО для разработки!
// В продакшене он должен быть отключен

const userRepo = new UserRepository()

export async function POST(request: NextRequest) {
  // Проверяем, что мы в режиме разработки
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Development login is not available in production' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { user } = body

    const telegramId = user.id || 123456789
    const firstName = user.first_name || 'Test'
    const lastName = user.last_name || 'User'
    const username = user.username || 'testuser'

    // Ищем существующего пользователя или создаем нового
    let dbUser = await userRepo.findByTelegramId(telegramId)
    
    if (!dbUser) {
      // Создаем тестового пользователя в БД
      dbUser = await userRepo.create({
        telegramId,
        firstName,
        lastName,
        username,
      })
    }

    // Создаем токен с userId из БД
    const token = jwt.sign(
      {
        userId: dbUser.id, // Используем userId вместо id
        telegramId: dbUser.telegramId,
        first_name: dbUser.firstName,
        last_name: dbUser.lastName,
        username: dbUser.username,
        is_dev: true, // Маркер, что это dev-токен
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      token,
      user: dbUser,
    })
  } catch (error) {
    console.error('Dev auth error:', error)
    return NextResponse.json(
      { error: 'Development authentication failed' },
      { status: 500 }
    )
  }
}