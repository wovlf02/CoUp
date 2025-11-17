// middleware.js
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // 관리자 경로 확인
    if (pathname.startsWith('/admin')) {
      if (!token || !['ADMIN', 'SYSTEM_ADMIN'].includes(token.role)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
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
          return true
        }

        // 보호된 경로는 토큰 필요
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

