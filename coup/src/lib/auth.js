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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.")
        }

        // 사용자 조회
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.")
        }

        // 비밀번호 확인
        if (!user.password) {
          throw new Error("소셜 로그인 계정입니다. 해당 방법으로 로그인해주세요.")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.")
        }

        // 계정 상태 확인
        if (user.status === "DELETED") {
          throw new Error("삭제된 계정입니다.")
        }

        if (user.status === "SUSPENDED") {
          const message = user.suspendReason
            ? `정지된 계정입니다. 사유: ${user.suspendReason}`
            : "정지된 계정입니다."
          throw new Error(message)
        }

        // lastLoginAt 업데이트
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          status: user.status,
          provider: user.provider
        }
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
    async redirect({ url, baseUrl }) {
      // 로그인 후 리다이렉트 처리
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

