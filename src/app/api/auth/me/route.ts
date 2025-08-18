import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/db/repositories/userRepository'
import jwt from 'jsonwebtoken'

const userRepo = new UserRepository()

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString()
  console.log(`👤 [${timestamp}] AUTH ME API REQUEST START`)
  
  try {
    // Логируем информацию о запросе
    const url = request.url
    const method = request.method
    const headers = Object.fromEntries(request.headers.entries())
    const authHeader = request.headers.get('Authorization')
    
    console.log(`📝 [${timestamp}] Request details:`)
    console.log(`  - URL: ${url}`)
    console.log(`  - Method: ${method}`)
    console.log(`  - User-Agent: ${headers['user-agent'] || 'Unknown'}`)
    console.log(`  - Origin: ${headers['origin'] || 'Unknown'}`)
    console.log(`  - Referer: ${headers['referer'] || 'Unknown'}`)
    console.log(`  - Auth Header: ${authHeader ? 'Present' : 'Missing'}`)
    console.log(`  - Auth Header Preview: ${authHeader ? authHeader.substring(0, 20) + '...' : 'N/A'}`)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`❌ [${timestamp}] ERROR: Invalid or missing Authorization header`)
      return NextResponse.json(
        { message: 'Токен не предоставлен', code: 'NO_TOKEN' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      
      // Проверяем, существует ли пользователь
      let user = null
      try {
        user = await userRepo.findById(decoded.userId)
      } catch (dbError: any) {
        console.log(`⚠️ [${timestamp}] Database query error:`, dbError.message)
        
        // Если ошибка связана с отсутствием таблицы, пробуем инициализировать БД
        if (dbError.message && dbError.message.includes('no such table')) {
          console.log(`🔄 [${timestamp}] Tables not found, attempting database initialization...`)
          
          try {
            const { initializeDatabase } = await import('@/lib/db/init')
            await initializeDatabase({ force: false, seedData: true, createIndexes: true })
            ;(global as any).__db_initialized = true
            console.log(`✅ [${timestamp}] Database initialized successfully`)
            
            // Повторно пытаемся найти пользователя после инициализации
            user = await userRepo.findById(decoded.userId)
          } catch (initError: any) {
            console.error(`❌ [${timestamp}] Failed to initialize database:`, initError.message)
            return NextResponse.json(
              { message: 'Ошибка инициализации базы данных', code: 'DB_INIT_ERROR' },
              { status: 503 }
            )
          }
        } else {
          // Другие ошибки базы данных
          console.error(`❌ [${timestamp}] Database error:`, dbError.message)
          return NextResponse.json(
            { message: 'Ошибка базы данных', code: 'DATABASE_ERROR' },
            { status: 500 }
          )
        }
      }
      
      // Если пользователь не найден и мы в продакшене, возможно база данных не инициализирована
      if (!user && process.env.NODE_ENV === 'production') {
        console.log('User not found in production mode, checking DB initialization...')
        
        // Проверяем, была ли уже инициализация
        const isInitialized = (global as any).__db_initialized
        if (!isInitialized) {
          console.log('🔄 DB not initialized, initializing...')
          try {
            // Пытаемся инициализировать базу данных
            const { initializeDatabase } = await import('@/lib/db/init')
            await initializeDatabase({ force: false, seedData: true, createIndexes: true })
            // Помечаем как инициализированную
            ;(global as any).__db_initialized = true
            console.log('✅ DB initialization completed in /auth/me')
            
            // Повторно пытаемся найти пользователя после инициализации
            user = await userRepo.findById(decoded.userId)
          } catch (initError) {
            console.error('Failed to initialize database:', initError)
            console.log(`⚠️ [${timestamp}] Database initialization failed, but user may exist. Trying to continue...`)
            // Не возвращаем ошибку, а пытаемся продолжить
            // Возможно, пользователь уже существует в базе данных
          }
        } else {
          console.log('⏭️ DB already initialized, user still not found')
        }
        
        if (!user) {
          return NextResponse.json(
            { message: 'Пользователь не найден', code: 'USER_NOT_FOUND' },
            { status: 404 }
          )
        }
      } else if (!user) {
        return NextResponse.json(
          { message: 'Пользователь не найден', code: 'USER_NOT_FOUND' },
          { status: 404 }
        )
      }

      console.log(`✅ [${timestamp}] SUCCESS: User found and returned`)
      console.log(`  - User ID: ${user.id}`)
      console.log(`  - Telegram ID: ${user.telegramId}`)
      console.log(`  - Username: ${user.username || 'N/A'}`)
      
      return NextResponse.json(user)
    } catch (jwtError) {
      console.log(`❌ [${timestamp}] ERROR: Invalid JWT token`)
      console.log(`  - Error: ${jwtError instanceof Error ? jwtError.message : 'Unknown error'}`)
      return NextResponse.json(
        { message: 'Неверный токен', code: 'INVALID_TOKEN' },
        { status: 401 }
      )
    }
  } catch (error) {
    const errorTimestamp = new Date().toISOString()
    console.error(`❌ [${errorTimestamp}] AUTH ME ERROR:`)
    console.error(`  - Error type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`)
    console.error(`  - Error message: ${error instanceof Error ? error.message : 'Unknown error'}`)
    console.error(`  - Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`)
    
    return NextResponse.json(
      { message: 'Ошибка сервера', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}