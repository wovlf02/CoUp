// middleware.js
import { NextResponse } from "next/server"
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function middleware(req) {
  const { pathname } = req.nextUrl

  // 공개 경로는 항상 허용
  const publicPaths = [
    '/',
    '/sign-in',
    '/sign-up',
    '/privacy',
    '/terms',
  ]

  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // API 경로는 제외 (각 API에서 처리)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // JWT 토큰 검증
  const token = req.cookies.get('auth-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const decoded = verifyJWT(token)
  if (!decoded) {
    // 토큰이 유효하지 않으면 쿠키 삭제 후 로그인 페이지로
    const response = NextResponse.redirect(new URL('/sign-in', req.url))
    response.cookies.delete('auth-token')
    return response
  }

  // 관리자 경로 확인
  if (pathname.startsWith('/admin')) {
    if (!['ADMIN', 'SYSTEM_ADMIN'].includes(decoded.role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
