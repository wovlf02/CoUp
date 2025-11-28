// src/lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

/**
 * @typedef {Object} SessionUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} image
 * @property {"USER"} role
 * @property {"ACTIVE" | "SUSPENDED" | "DELETED"} status
 * @property {"CREDENTIALS" | "GOOGLE" | "GITHUB"} provider
 */

/**
 * @typedef {Object} Session
 * @property {SessionUser} user
 */

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] authorize 시작')
        console.log('🔐 [AUTH] credentials:', { email: credentials?.email, hasPassword: !!credentials?.password })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH] 이메일 또는 비밀번호 누락')
          throw new Error("이메일과 비밀번호를 입력해주세요.")
        }

        // 사용자 조회
        console.log('🔍 [AUTH] 사용자 조회 중:', credentials.email)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          console.log('❌ [AUTH] 사용자를 찾을 수 없음')
          throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.")
        }
        
        console.log('✅ [AUTH] 사용자 발견:', { id: user.id, email: user.email, status: user.status })

        // 비밀번호 확인
        if (!user.password) {
          console.log('❌ [AUTH] 비밀번호가 설정되지 않음 (소셜 로그인 계정)')
          throw new Error("소셜 로그인 계정입니다. 해당 방법으로 로그인해주세요.")
        }

        console.log('🔑 [AUTH] 비밀번호 검증 중...')
        const isValid = await bcrypt.compare(credentials.password, user.password)
        console.log('🔑 [AUTH] 비밀번호 검증 결과:', isValid)
        
        if (!isValid) {
          console.log('❌ [AUTH] 비밀번호 불일치')
          throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.")
        }

        // 계정 상태 확인
        if (user.status === "DELETED") {
          console.log('❌ [AUTH] 삭제된 계정')
          throw new Error("삭제된 계정입니다.")
        }

        if (user.status === "SUSPENDED") {
          console.log('❌ [AUTH] 정지된 계정')
          const message = user.suspendReason
            ? `정지된 계정입니다. 사유: ${user.suspendReason}`
            : "정지된 계정입니다."
          throw new Error(message)
        }

        // 관리자 권한 확인
        console.log('🔍 [AUTH] 관리자 권한 확인 중...')
        const adminRole = await prisma.adminRole.findUnique({
          where: { userId: user.id },
          select: {
            role: true,
            expiresAt: true,
          }
        })

        const isAdmin = adminRole && (!adminRole.expiresAt || new Date(adminRole.expiresAt) > new Date())
        console.log(`👤 [AUTH] 관리자 여부: ${isAdmin ? '✅ 관리자' : '❌ 일반 사용자'}`, adminRole?.role)

        // lastLoginAt 업데이트
        console.log('✅ [AUTH] 로그인 성공, lastLoginAt 업데이트 중...')
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        const result = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          status: user.status,
          provider: user.provider,
          isAdmin: isAdmin,  // 관리자 여부 추가
          adminRole: adminRole?.role || null,  // 관리자 역할 추가
        }
        
        console.log('✅ [AUTH] authorize 완료, 반환값:', result)
        return result
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1일 (브라우저를 닫으면 로그아웃)
    updateAge: 0, // 세션 갱신 비활성화
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: undefined, // 브라우저 세션 쿠키 (브라우저 닫으면 삭제)
      },
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    error: "/sign-in", // 에러 페이지도 로그인으로
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 초기 로그인 시
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.role = user.role
        token.status = user.status
        token.provider = user.provider
        token.isAdmin = user.isAdmin  // 관리자 여부 추가
        token.adminRole = user.adminRole  // 관리자 역할 추가

        console.log('🔑 [AUTH] JWT 생성:', {
          email: token.email,
          isAdmin: token.isAdmin,
          adminRole: token.adminRole
        })
      }

      // 세션 업데이트 시 (update 호출 시)
      if (trigger === "update" && session) {
        token.name = session.name || token.name
        token.image = session.image || token.image
      }

      return token
    },
    async session({ session, token }) {
      // JWT 토큰에서 세션으로 정보 전달 (단순하게)
      if (token && session) {
        session.user = {
          id: token.id || '',
          email: token.email || '',
          name: token.name || '',
          image: token.image || null,
          role: token.role || 'USER',
          status: token.status || 'ACTIVE',
          provider: token.provider || 'CREDENTIALS'
        }
      }

      return session
    },
    async signIn({ user: _user, account, profile: _profile }) {
      // OAuth 로그인 시 처리
      if (account?.provider === "google" || account?.provider === "github") {
        // OAuth 사용자 처리 로직 (추후 구현)
        return true
      }

      // Credentials 로그인은 authorize에서 처리
      return true
    },
    async redirect({ url, baseUrl, token }) {
      console.log('🔄 [AUTH] redirect 콜백:', { url, baseUrl, hasToken: !!token })

      // 로그인 성공 시 - 관리자 권한 확인 (최우선)
      if (token?.id) {
        console.log('👤 [AUTH] 사용자 ID:', token.id)

        try {
          // AdminRole 테이블에서 관리자 권한 확인
          const adminRole = await prisma.adminRole.findUnique({
            where: { userId: token.id },
            select: {
              role: true,
              expiresAt: true,
            }
          })

          // 관리자 역할 확인 및 만료 체크
          const isAdmin = adminRole && (!adminRole.expiresAt || new Date(adminRole.expiresAt) > new Date())

          if (isAdmin) {
            console.log('🔐 [AUTH] 관리자 확인됨, /admin으로 리다이렉트')
            return baseUrl + "/admin"
          } else {
            console.log('👤 [AUTH] 일반 사용자, /dashboard로 리다이렉트')
            return baseUrl + "/dashboard"
          }
        } catch (error) {
          console.error('❌ [AUTH] 관리자 권한 확인 오류:', error)
          // 에러 시 기본 대시보드로
          return baseUrl + "/dashboard"
        }
      }

      // token이 없는 경우 (로그아웃 등)
      // 상대 경로면 baseUrl과 합침
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // 같은 origin이면 그대로 사용
      else if (new URL(url).origin === baseUrl) return url

      // 기본 리다이렉트는 대시보드로
      return baseUrl + "/dashboard"
    }
  },
  events: {
    async signOut({ token }) {
      // 로그아웃 시 처리 (필요시)
      console.log(`User ${token?.email} signed out`)
    }
  },
  debug: process.env.NODE_ENV === "development",
}

// NextAuth v4 export
export { authConfig as authOptions }

// NextAuth v4에서는 auth, signIn, signOut을 직접 export하지 않음
// 대신 getServerSession, signIn (from next-auth/react) 사용

