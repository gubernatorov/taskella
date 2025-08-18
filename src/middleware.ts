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
  
  // Логируем запросы к защищенным страницам
  if (url.startsWith('/dashboard') || url.startsWith('/tasks') || url.startsWith('/projects')) {
    console.log(`🛡️ Protected page access: ${url}`)
    
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
    
    // Проверяем флаг недавней аутентификации
    const justAuthenticated = request.headers.get('x-just-authenticated') === 'true'
    console.log(`🎫 Just Authenticated Flag: ${justAuthenticated ? 'Present' : 'Missing'}`)
    
    // Если нет токена и нет флага недавней аутентификации, перенаправляем на страницу входа
    if (!hasAuthToken && !justAuthenticated && !authHeader) {
      console.log(`🔄 No auth token found, redirecting to login...`)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
