import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Серверное логирование всех запросов
  const timestamp = new Date().toISOString()
  const method = request.method
  const url = request.nextUrl.pathname
  const searchParams = request.nextUrl.search.toString()
  const userAgent = request.headers.get('user-agent') || 'Unknown'
  const referer = request.headers.get('referer') || 'Direct'
  
  console.log(`🌐 [${timestamp}] ${method} ${url}${searchParams ? '?' + searchParams : ''}`)
  console.log(`📱 User-Agent: ${userAgent}`)
  console.log(`🔗 Referer: ${referer}`)
  
  // Проверяем, является ли это запросом от Telegram Mini Apps
  const isTelegram = userAgent.includes('Telegram') || userAgent.includes('t.me')
  
  // ДЛЯ TELEGRAM MINI APPS: ПОЛНОСТЬЮ ОТКЛЮЧАЕМ ВСЮ СЕРВЕРНУЮ ЛОГИКУ АУТЕНТИФИКАЦИИ
  // Вся аутентификация будет происходить ТОЛЬКО на клиентской стороне
  if (isTelegram) {
    console.log(`📱 Telegram Mini Apps request detected - completely bypassing server-side auth logic`)
    return NextResponse.next()
  }
  
  // Для всех остальных запросов (не Telegram) оставляем базовую логику
  // Проверяем, является ли это запросом к API аутентификации
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    console.log(`🔐 Auth API request detected: ${url}`)
    
    // Добавляем заголовок, указывающий на то, что это запрос аутентификации
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-auth-request', 'true')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  // Для API запросов всегда пропускаем
  if (url.startsWith('/api/')) {
    console.log(`🔄 API request detected, allowing access...`)
    return NextResponse.next()
  }
  
  // Для защищенных страниц (только для не-Telegram запросов)
  if (url.startsWith('/dashboard') || url.startsWith('/tasks') || url.startsWith('/projects')) {
    console.log(`🛡️ Protected page access (non-Telegram): ${url}`)
    
    // Проверяем наличие токена авторизации
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    
    console.log(`🔑 Auth Header: ${authHeader ? 'Present' : 'Missing'}`)
    console.log(`🍪 Cookie Header: ${cookieHeader ? 'Present' : 'Missing'}`)
    
    let hasAuthToken = false
    if (cookieHeader) {
      hasAuthToken = cookieHeader.includes('auth_token')
      console.log(`🎫 Auth Token in Cookie: ${hasAuthToken ? 'Present' : 'Missing'}`)
    }
    
    // Если есть токен в cookie, пропускаем запрос без перенаправления
    if (hasAuthToken) {
      console.log(`✅ Auth token found in cookie, allowing access...`)
      return NextResponse.next()
    }
    
    // Если есть заголовок авторизации, пропускаем запрос
    if (authHeader) {
      console.log(`✅ Auth header found, allowing access...`)
      return NextResponse.next()
    }
    
    // Проверяем, не является ли это запросом к главной странице или странице входа
    if (url === '/' || url === '/login') {
      console.log(`🔄 Skipping redirect for ${url} page...`)
      return NextResponse.next()
    }
    
    // Если нет токена ни в cookie, ни в заголовках, перенаправляем на страницу входа
    console.log(`🔄 No auth token found, redirecting to login...`)
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
