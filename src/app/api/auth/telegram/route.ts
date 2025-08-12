import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/db/repositories/userRepository'
import { AuthResponse, TelegramAuthRequest } from '@/types/auth'
import jwt from 'jsonwebtoken'

const userRepo = new UserRepository()

export async function POST(request: NextRequest) {
  try {
    const body: TelegramAuthRequest = await request.json()
    
    // В реальном приложении здесь была бы валидация Telegram initData
    // Для демонстрации используем тестовые данные
    const mockTelegramUser = {
      id: 123456789,
      first_name: 'Иван',
      last_name: 'Петров',
      username: 'ivan_petrov',
      photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    }

    // Ищем пользователя в базе
    let user = await userRepo.findByTelegramId(mockTelegramUser.id)

    // Если пользователя нет, создаем нового
    if (!user) {
      user = await userRepo.create({
        telegramId: mockTelegramUser.id,
        firstName: mockTelegramUser.first_name,
        lastName: mockTelegramUser.last_name,
        username: mockTelegramUser.username,
        avatarUrl: mockTelegramUser.photo_url,
      })
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id, telegramId: user.telegramId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    )

    const response: AuthResponse = {
      token,
      user
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { message: 'Ошибка авторизации', code: 'AUTH_ERROR' },
      { status: 400 }
    )
  }
}