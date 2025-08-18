import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware básico - sem autenticação obrigatória por enquanto
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Rotas que precisam de middleware
    '/dashboard/:path*',
    '/api/:path*',
  ],
}
