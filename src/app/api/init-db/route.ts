import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'

export async function POST(request: NextRequest) {
  // Только в development режиме
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Инициализация БД доступна только в development режиме' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const force = body.force === true
    
    await initializeDatabase(force)
    return NextResponse.json({
      success: true,
      message: force
        ? 'База данных успешно пересоздана с новыми данными'
        : 'База данных успешно инициализирована'
    })
  } catch (error) {
    console.error('Ошибка инициализации БД:', error)
    return NextResponse.json(
      {
        error: 'Ошибка инициализации базы данных',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}