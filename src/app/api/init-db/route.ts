import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'

export async function POST(request: NextRequest) {
  try {
    // Проверяем, что это не продакшн или есть специальный заголовок
    const authHeader = request.headers.get('x-init-secret')
    const expectedSecret = process.env.INIT_DB_SECRET || 'dev-init-secret'
    
    if (process.env.NODE_ENV === 'production' && authHeader !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🚀 Starting database initialization...')
    const stats = await initializeDatabase({
      force: false,
      seedData: true,
      createIndexes: true
    })

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      stats
    })
  } catch (error) {
    console.error('Database initialization failed:', error)
    return NextResponse.json(
      { 
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { checkDatabaseHealth } = await import('@/lib/db/init')
    const health = await checkDatabaseHealth()
    
    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}