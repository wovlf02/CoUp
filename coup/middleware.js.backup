// middleware.js
import { NextResponse } from "next/server"
import { verifyAccessToken } from "./src/lib/jwt"

export async function middleware(req) {
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

  // API 경로 중 인증 관련은 제외
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // 다른 API 경로도 제외 (각 API에서 처리)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Access Token 검증
  const accessToken = req.cookies.get('access-token')?.value
  const refreshToken = req.cookies.get('refresh-token')?.value

  if (!accessToken) {
    // Access Token이 없으면 로그인 페이지로
    if (!refreshToken) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Refresh Token이 있으면 자동 갱신 시도
    try {
      const refreshResponse = await fetch(new URL('/api/auth/refresh', req.url), {
        method: 'POST',
        headers: {
          'Cookie': `refresh-token=${refreshToken}`
        }
      })

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        const response = NextResponse.next()

        // 새로운 Access Token을 쿠키에 설정
        response.cookies.set('access-token', data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60,
          path: '/'
        })

        return response
      }
    } catch (error) {
      console.error('Auto refresh failed:', error)
    }

    // 자동 갱신 실패 시 로그인 페이지로
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const decoded = verifyAccessToken(accessToken)
  if (!decoded) {
    // Access Token이 만료되었고 Refresh Token이 있으면 갱신 시도
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(new URL('/api/auth/refresh', req.url), {
          method: 'POST',
          headers: {
            'Cookie': `refresh-token=${refreshToken}`
          }
        })

        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          const response = NextResponse.next()

          response.cookies.set('access-token', data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60,
            path: '/'
          })

          return response
        }
      } catch (error) {
        console.error('Auto refresh failed:', error)
      }
    }

    // 갱신 실패 시 토큰 삭제 후 로그인 페이지로
    const response = NextResponse.redirect(new URL('/sign-in', req.url))
    response.cookies.delete('access-token')
    response.cookies.delete('refresh-token')
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
