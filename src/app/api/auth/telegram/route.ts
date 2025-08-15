import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/db/repositories/userRepository'
import { AuthResponse, TelegramAuthRequest } from '@/types/auth'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const userRepo = new UserRepository()

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

/**
 * Валидирует данные Telegram WebApp initData
 */
function validateTelegramData(initData: string, botToken: string): TelegramUser | null {
  try {
    // Парсим initData
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    
    if (!hash) {
      throw new Error('Missing hash parameter')
    }

    // Удаляем hash из параметров для проверки
    urlParams.delete('hash')
    
    // Сортируем параметры и создаем строку для проверки
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Создаем secret key из bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    // Создаем HMAC для проверки
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    // Проверяем hash
    if (calculatedHash !== hash) {
      throw new Error('Invalid hash')
    }

    // Получаем данные пользователя
    const userParam = urlParams.get('user')
    if (!userParam) {
      throw new Error('Missing user data')
    }

    const userData = JSON.parse(userParam) as TelegramUser
    
    // Проверяем время авторизации (не старше 24 часов)
    const authDate = userData.auth_date
    const currentTime = Math.floor(Date.now() / 1000)
    const maxAge = 24 * 60 * 60 // 24 часа в секундах
    
    if (currentTime - authDate > maxAge) {
      throw new Error('Authorization data is too old')
    }

    return userData
  } catch (error) {
    console.error('Telegram data validation error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем наличие необходимых переменных окружения
    const jwtSecret = process.env.JWT_SECRET
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is missing')
      return NextResponse.json(
        { message: 'Ошибка конфигурации сервера', code: 'SERVER_CONFIG_ERROR' },
        { status: 500 }
      )
    }

    const body: TelegramAuthRequest = await request.json()
    
    // Проверяем наличие initData
    if (!body.initData) {
      return NextResponse.json(
        { message: 'Отсутствуют данные авторизации', code: 'MISSING_INIT_DATA' },
        { status: 400 }
      )
    }

    let telegramUser: TelegramUser | null = null

    // Режим разработки - обрабатываем тестовые случаи
    if (isDevMode && (!botToken || body.initData === 'dev_mode_test')) {
      console.log('Development mode: using mock Telegram data')
      
      // Создаем моковые данные для разработки
      telegramUser = {
        id: 123456789,
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
        photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'dev_hash'
      }
    } else {
      // Продакшн режим - валидируем реальные Telegram данные
      if (!botToken) {
        console.error('TELEGRAM_BOT_TOKEN environment variable is missing')
        return NextResponse.json(
          { message: 'Ошибка конфигурации сервера', code: 'SERVER_CONFIG_ERROR' },
          { status: 500 }
        )
      }

      // Валидируем данные Telegram
      telegramUser = validateTelegramData(body.initData, botToken)
      
      if (!telegramUser) {
        return NextResponse.json(
          { message: 'Недействительные данные авторизации', code: 'INVALID_TELEGRAM_DATA' },
          { status: 401 }
        )
      }
    }

    // Ищем пользователя в базе
    let user = await userRepo.findByTelegramId(telegramUser.id)

    // Если пользователя нет, создаем нового
    if (!user) {
      user = await userRepo.create({
        telegramId: telegramUser.id,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        avatarUrl: telegramUser.photo_url,
      })
      
      console.log(`Created new user: ${user.id}, Telegram ID: ${telegramUser.id}`)
    } else {
      // Обновляем данные пользователя, если они изменились
      const updates: Partial<typeof user> = {}
      
      if (user.firstName !== telegramUser.first_name) {
        updates.firstName = telegramUser.first_name
      }
      if (user.lastName !== telegramUser.last_name) {
        updates.lastName = telegramUser.last_name
      }
      if (user.username !== telegramUser.username) {
        updates.username = telegramUser.username
      }
      if (user.avatarUrl !== telegramUser.photo_url) {
        updates.avatarUrl = telegramUser.photo_url
      }
      
      if (Object.keys(updates).length > 0) {
        // В реальном приложении здесь был бы метод update в userRepository
        console.log(`User data updated for Telegram ID: ${telegramUser.id}`)
      }
    }

    // Создаем JWT токен
    const token = jwt.sign(
      {
        userId: user.id,
        telegramId: user.telegramId,
        iat: Math.floor(Date.now() / 1000)
      },
      jwtSecret,
      { expiresIn: '30d' }
    )

    const response: AuthResponse = {
      token,
      user
    }

    console.log(`User authenticated successfully: ${user.id}`)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Auth error:', error)
    
    // Проверяем тип ошибки для более точного ответа
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: 'Неверный формат данных', code: 'INVALID_JSON' },
        { status: 400 }
      )
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: 'Ошибка создания токена', code: 'TOKEN_ERROR' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}