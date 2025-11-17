// src/lib/auth.js
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24시간
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요")
        }

        // 사용자 조회
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("가입되지 않은 이메일입니다")
        }

        // 계정 상태 확인
        if (user.status === 'SUSPENDED') {
          const message = user.suspendedUntil 
            ? `정지된 계정입니다 (${user.suspendedUntil.toLocaleDateString()}까지)`
            : "정지된 계정입니다"
          throw new Error(message)
        }

        if (user.status === 'DELETED') {
          throw new Error("삭제된 계정입니다")
        }

        // 비밀번호 확인
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) {
          throw new Error("비밀번호가 일치하지 않습니다")
        }

        // 마지막 로그인 시간 업데이트
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 로그인 시 user 정보를 token에 추가
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
        token.avatar = user.avatar
      }
      
      // update 트리거 시 세션 정보 업데이트
      if (trigger === "update" && session) {
        token.name = session.name
        token.avatar = session.avatar
      }
      
      return token
    },
    async session({ session, token }) {
      // token 정보를 session에 추가
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.email = token.email
        session.user.name = token.name
        session.user.avatar = token.avatar
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

