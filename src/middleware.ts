import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/api/auth']
  
  // Rotas protegidas que precisam de autenticação
  const protectedRoutes = ['/dashboard', '/historico', '/api/records', '/api/tokens', '/api/users', '/api/operations']
  
  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Se não é rota protegida, permitir acesso
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Verificar token de autenticação
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Se não há token válido, redirecionar para login
  if (!token) {
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Adicionar headers de segurança
  const response = NextResponse.next()
  
  // Headers de segurança
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CSP (Content Security Policy)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  )

  return response
}

export const config = {
  matcher: [
    // Rotas que precisam de middleware
    '/dashboard/:path*',
    '/historico/:path*',
    '/api/records/:path*',
    '/api/tokens/:path*',
    '/api/users/:path*',
    '/api/operations/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
