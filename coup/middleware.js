// middleware.js
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // 공개 경로 정의
    const publicPaths = [
      '/',
      '/sign-in',
      '/sign-up',
      '/privacy',
      '/terms',
    ]

    const isPublicPath = publicPaths.includes(pathname)

    // API 경로는 각 Route Handler에서 처리
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // 공개 경로는 항상 허용
    if (isPublicPath) {
      // 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시 대시보드로
      if (token && (pathname === '/sign-in' || pathname === '/sign-up')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return NextResponse.next()
    }

    // 여기까지 왔다면 보호된 페이지 + 로그인됨 (withAuth가 처리)
    
    // 계정 상태 확인
    if (token?.status === 'DELETED') {
      return NextResponse.redirect(new URL('/sign-in?error=account-deleted', req.url))
    }

    if (token?.status === 'SUSPENDED') {
      return NextResponse.redirect(new URL('/sign-in?error=account-suspended', req.url))
    }

    // 관리자 페이지 권한 확인
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN' && token?.role !== 'SYSTEM_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl
        
        // 공개 경로는 토큰 없이도 허용
        const publicPaths = ['/', '/sign-in', '/sign-up', '/privacy', '/terms']
        if (publicPaths.includes(pathname)) {
          return true
        }

        // API 경로는 항상 허용 (각 API에서 처리)
        if (pathname.startsWith('/api/')) {
          return true
        }

        // 나머지는 토큰 필요
        return !!token
      }
    },
    pages: {
      signIn: '/sign-in',
    }
  }
)

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
