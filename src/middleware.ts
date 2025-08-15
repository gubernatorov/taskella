import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Проверяем, является ли это запросом к API аутентификации
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    // Добавляем заголовок, указывающий на то, что это запрос аутентификации
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-auth-request', 'true')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
