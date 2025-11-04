# CoUp 기능별 구현 설계서

> **작성일**: 2025년 11월 4일  
> **목표**: 각 기능의 상세 구현 흐름 및 기술 스택 정의  
> **기간**: 11월 4일 ~ 11월 19일 (15일)

---

## 목차

1. [사용자 인증 시스템](#1-사용자-인증-시스템)
2. [스터디 그룹 관리](#2-스터디-그룹-관리)
3. [실시간 채팅](#3-실시간-채팅)
4. [화상 스터디 (WebRTC)](#4-화상-스터디-webrtc)
5. [공지사항 시스템](#5-공지사항-시스템)
6. [파일 공유 시스템](#6-파일-공유-시스템)
7. [캘린더 및 일정 관리](#7-캘린더-및-일정-관리)
8. [할 일 관리](#8-할-일-관리)
9. [알림 시스템](#9-알림-시스템)
10. [대시보드](#10-대시보드)

---

## 1. 사용자 인증 시스템

### 📋 개요
- **목적**: Google, GitHub 소셜 로그인 및 사용자 프로필 관리
- **기술**: NextAuth.js, JWT, OAuth 2.0
- **개발 기간**: 11/6 ~ 11/7 (2일)

### 🔧 기술 스택
```
- NextAuth.js v4 (인증 프레임워크)
- JWT (JSON Web Token)
- OAuth 2.0 (Google, GitHub)
- Prisma (User 모델)
- bcrypt (비밀번호 해싱 - 향후 확장용)
```

### 📊 데이터 모델
```prisma
model User {
  id          Int      @id @default(autoincrement())
  email       String   @unique
  name        String
  imageUrl    String?
  provider    String   // "google" | "github"
  providerId  String   @unique
  bio         String?  // 자기소개
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  studyGroups   StudyGroup[]   @relation("Owner")
  memberships   StudyMember[]
  notifications Notification[]
}
```

### 🔄 구현 흐름

#### 1단계: NextAuth 설정
```javascript
// app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/db/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.provider = account?.provider
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.provider = token.provider
      return session
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

#### 2단계: 로그인 페이지
```jsx
// app/(auth)/sign-in/page.jsx

'use client'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const router = useRouter()

  const handleGoogleLogin = async () => {
    const result = await signIn('google', {
      callbackUrl: '/dashboard',
      redirect: false,
    })
    
    if (result?.ok) {
      router.push('/dashboard')
    }
  }

  const handleGitHubLogin = async () => {
    const result = await signIn('github', {
      callbackUrl: '/dashboard',
      redirect: false,
    })
    
    if (result?.ok) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-center">CoUp 로그인</h1>
        
        <Button 
          onClick={handleGoogleLogin}
          className="w-full"
          variant="outline"
        >
          <GoogleIcon /> Google로 계속하기
        </Button>
        
        <Button 
          onClick={handleGitHubLogin}
          className="w-full"
          variant="outline"
        >
          <GitHubIcon /> GitHub로 계속하기
        </Button>
      </div>
    </div>
  )
}
```

#### 3단계: 인증 미들웨어
```javascript
// middleware.js

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // 인증 필요한 경로
    const protectedPaths = ['/dashboard', '/studies', '/me', '/notifications']
    const isProtected = protectedPaths.some(p => path.startsWith(p))

    // 미인증 사용자 리다이렉트
    if (isProtected && !token) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // 인증된 사용자가 로그인 페이지 접근 시
    if (path.startsWith('/sign-in') && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // 미들웨어 내부에서 처리
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/studies/:path*',
    '/me/:path*',
    '/notifications/:path*',
    '/sign-in',
    '/sign-up',
  ],
}
```

#### 4단계: 프로필 관리 API
```javascript
// app/api/v1/users/me/route.js

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// GET - 내 정보 조회
export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      imageUrl: true,
      bio: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ data: user })
}

// PATCH - 프로필 수정
export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, bio, imageUrl } = await req.json()

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, bio, imageUrl },
  })

  return NextResponse.json({ data: updatedUser })
}

// DELETE - 계정 삭제
export async function DELETE() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.user.delete({
    where: { id: session.user.id },
  })

  return NextResponse.json({ message: 'Account deleted' })
}
```

#### 5단계: 커스텀 훅
```javascript
// lib/hooks/useAuth.js

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const user = session?.user

  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/sign-in')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  }
}
```

### ✅ 완료 기준
- [ ] Google 소셜 로그인 동작
- [ ] GitHub 소셜 로그인 동작
- [ ] 로그인 후 대시보드 리다이렉트
- [ ] 프로필 수정 기능 동작
- [ ] 계정 삭제 기능 동작
- [ ] 미인증 사용자 접근 차단
- [ ] 로그아웃 동작

---

## 2. 스터디 그룹 관리

### 📋 개요
- **목적**: 스터디 그룹 생성, 탐색, 가입, 멤버 관리
- **기술**: Next.js SSR, Prisma, React Query
- **개발 기간**: 11/8 ~ 11/10 (3일)

### 🔧 기술 스택
```
- Next.js App Router (SSR)
- Prisma (StudyGroup, StudyMember 모델)
- React Query (캐싱, 상태 관리)
- Zod (폼 검증)
- shadcn/ui (UI 컴포넌트)
```

### 📊 데이터 모델
```prisma
model StudyGroup {
  id          Int      @id @default(autoincrement())
  name        String
  description String   @db.Text
  category    String   // "프로그래밍", "취업준비", "자격증", "어학" 등
  visibility  String   @default("PUBLIC") // "PUBLIC" | "PRIVATE"
  maxMembers  Int      @default(10)
  imageUrl    String?
  ownerId     Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner     User          @relation("Owner", fields: [ownerId], references: [id], onDelete: Cascade)
  members   StudyMember[]
  notices   Notice[]
  files     File[]
  events    Event[]
  tasks     Task[]
  
  @@index([category])
  @@index([ownerId])
}

model StudyMember {
  id        Int      @id @default(autoincrement())
  userId    Int
  groupId   Int
  role      String   @default("MEMBER") // "OWNER" | "ADMIN" | "MEMBER"
  createdAt DateTime @default(now())

  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  group StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([userId, groupId])
  @@index([groupId])
  @@index([userId])
}
```

### 🔄 구현 흐름

#### 1단계: 스터디 생성 API
```javascript
// app/api/v1/studies/route.js

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// POST - 스터디 생성
export async function POST(req) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, description, category, visibility, maxMembers } = await req.json()

  // 트랜잭션으로 스터디 + 멤버 동시 생성
  const study = await prisma.$transaction(async (tx) => {
    // 1. 스터디 생성
    const newStudy = await tx.studyGroup.create({
      data: {
        name,
        description,
        category,
        visibility,
        maxMembers,
        ownerId: session.user.id,
      },
    })

    // 2. 생성자를 OWNER로 멤버 추가
    await tx.studyMember.create({
      data: {
        userId: session.user.id,
        groupId: newStudy.id,
        role: 'OWNER',
      },
    })

    return newStudy
  })

  return NextResponse.json({ data: study }, { status: 201 })
}

// GET - 스터디 목록 조회 (SSR용)
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const keyword = searchParams.get('keyword')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 12

  const where = {
    visibility: 'PUBLIC',
    ...(category && category !== 'all' && { category }),
    ...(keyword && {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ],
    }),
  }

  const [studies, total] = await Promise.all([
    prisma.studyGroup.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, imageUrl: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.studyGroup.count({ where }),
  ])

  return NextResponse.json({
    data: studies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
```

#### 2단계: 스터디 상세 API
```javascript
// app/api/v1/studies/[studyId]/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// GET - 스터디 상세 조회
export async function GET(req, { params }) {
  const studyId = parseInt(params.studyId)

  const study = await prisma.studyGroup.findUnique({
    where: { id: studyId },
    include: {
      owner: {
        select: { id: true, name: true, imageUrl: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, imageUrl: true },
          },
        },
      },
    },
  })

  if (!study) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ data: study })
}

// PATCH - 스터디 수정
export async function PATCH(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)

  // 권한 체크
  const member = await prisma.studyMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: studyId,
      },
    },
  })

  if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, description, category, maxMembers } = await req.json()

  const updated = await prisma.studyGroup.update({
    where: { id: studyId },
    data: { name, description, category, maxMembers },
  })

  return NextResponse.json({ data: updated })
}

// DELETE - 스터디 삭제 (OWNER만)
export async function DELETE(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)

  const study = await prisma.studyGroup.findUnique({
    where: { id: studyId },
  })

  if (study.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.studyGroup.delete({
    where: { id: studyId },
  })

  return NextResponse.json({ message: 'Deleted' })
}
```

#### 3단계: 멤버 가입 API
```javascript
// app/api/v1/studies/[studyId]/join/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function POST(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)

  // 이미 멤버인지 체크
  const existingMember = await prisma.studyMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: studyId,
      },
    },
  })

  if (existingMember) {
    return NextResponse.json({ error: 'Already joined' }, { status: 400 })
  }

  // 정원 체크
  const memberCount = await prisma.studyMember.count({
    where: { groupId: studyId },
  })

  const study = await prisma.studyGroup.findUnique({
    where: { id: studyId },
  })

  if (memberCount >= study.maxMembers) {
    return NextResponse.json({ error: 'Full' }, { status: 400 })
  }

  // 멤버 추가
  const member = await prisma.studyMember.create({
    data: {
      userId: session.user.id,
      groupId: studyId,
      role: 'MEMBER',
    },
  })

  return NextResponse.json({ data: member }, { status: 201 })
}
```

#### 4단계: 스터디 탐색 페이지 (SSR)
```jsx
// app/(main)/studies/page.jsx

import StudyList from '@/components/domain/study/StudyList'
import StudyFilters from '@/components/domain/study/StudyFilters'

export const metadata = {
  title: '스터디 탐색 - CoUp',
  description: '나에게 맞는 스터디 그룹을 찾아보세요',
}

async function getStudies(searchParams) {
  const params = new URLSearchParams(searchParams)
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/v1/studies?${params}`,
    { cache: 'no-store' } // SSR
  )
  return res.json()
}

export default async function StudiesPage({ searchParams }) {
  const { data: studies, pagination } = await getStudies(searchParams)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">스터디 탐색</h1>
      
      <StudyFilters />
      
      <StudyList studies={studies} pagination={pagination} />
    </div>
  )
}
```

### ✅ 완료 기준
- [ ] 스터디 생성 동작
- [ ] 스터디 목록 SSR 렌더링
- [ ] 카테고리 필터 동작
- [ ] 키워드 검색 동작
- [ ] 스터디 가입 동작
- [ ] 스터디 탈퇴 동작
- [ ] 멤버 강퇴 동작 (관리자)
- [ ] 스터디 수정 동작 (관리자)
- [ ] 스터디 삭제 동작 (소유자)

---

## 3. 실시간 채팅

### 📋 개요
- **목적**: 스터디 그룹 내 실시간 채팅
- **기술**: Socket.IO, Redis Pub/Sub, WebSocket
- **개발 기간**: 11/11 ~ 11/12 (2일)

### 🔧 기술 스택
```
- Socket.IO v4 (WebSocket 라이브러리)
- Redis (Pub/Sub, 메시지 브로커)
- Node.js + Express (시그널링 서버)
- Prisma (Message 모델)
- React Query (채팅 히스토리)
```

### 📊 데이터 모델
```prisma
model Message {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  userId    Int
  groupId   Int
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([groupId, createdAt])
}
```

### 🔄 구현 흐름

#### 1단계: 시그널링 서버 구축
```javascript
// signaling/src/server.js

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const redis = require('redis')
const jwt = require('jsonwebtoken')

const app = express()
const server = http.createServer(app)

// Socket.IO 설정
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
})

// Redis Pub/Sub
const pubClient = redis.createClient({ url: process.env.REDIS_URL })
const subClient = pubClient.duplicate()

await Promise.all([pubClient.connect(), subClient.connect()])

// JWT 인증 미들웨어
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.userId
    next()
  } catch (err) {
    next(new Error('Authentication error'))
  }
})

// Socket 연결 핸들러
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`)

  // 스터디 방 입장
  socket.on('join_study', async ({ studyId }) => {
    socket.join(`study:${studyId}`)
    console.log(`User ${socket.userId} joined study ${studyId}`)
  })

  // 메시지 전송
  socket.on('send_message', async ({ studyId, content }) => {
    const message = {
      id: Date.now(), // 임시 ID
      content,
      userId: socket.userId,
      groupId: studyId,
      createdAt: new Date().toISOString(),
    }

    // Redis Pub으로 메시지 발행
    await pubClient.publish(
      `study:${studyId}`,
      JSON.stringify(message)
    )

    // DB 저장 API 호출
    await fetch(`${process.env.INTERNAL_API_URL}/internal/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.INTERNAL_API_KEY,
      },
      body: JSON.stringify(message),
    })
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`)
  })
})

// Redis Subscribe 리스너
subClient.pSubscribe('study:*', (message, channel) => {
  const studyId = channel.split(':')[1]
  const parsedMessage = JSON.parse(message)
  
  // 해당 방의 모든 클라이언트에게 브로드캐스트
  io.to(`study:${studyId}`).emit('new_message', parsedMessage)
})

server.listen(8081, () => {
  console.log('Signaling server running on port 8081')
})
```

#### 2단계: 메시지 저장 API
```javascript
// app/api/v1/internal/messages/route.js

import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  // 내부 API 키 검증
  const apiKey = req.headers.get('X-Internal-Key')
  
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { content, userId, groupId } = await req.json()

  const message = await prisma.message.create({
    data: { content, userId, groupId },
    include: {
      user: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
  })

  return NextResponse.json({ data: message })
}
```

#### 3단계: 채팅 히스토리 API
```javascript
// app/api/v1/studies/[studyId]/messages/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor')
  const limit = 50

  // 멤버 확인
  const member = await prisma.studyMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: studyId,
      },
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 메시지 조회 (무한 스크롤)
  const messages = await prisma.message.findMany({
    where: {
      groupId: studyId,
      ...(cursor && { id: { lt: parseInt(cursor) } }),
    },
    include: {
      user: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  const nextCursor = messages.length === limit ? messages[limit - 1].id : null

  return NextResponse.json({
    data: messages.reverse(),
    nextCursor,
  })
}
```

#### 4단계: 채팅 컴포넌트
```jsx
// components/domain/chat/ChatRoom.jsx

'use client'
import { useEffect, useRef, useState } from 'react'
import { useSocket } from '@/lib/hooks/useSocket'
import { useInfiniteQuery } from '@tanstack/react-query'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

export default function ChatRoom({ studyId }) {
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)

  // 채팅 히스토리 로드
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['messages', studyId],
    queryFn: async ({ pageParam }) => {
      const res = await fetch(
        `/api/v1/studies/${studyId}/messages?cursor=${pageParam || ''}`
      )
      return res.json()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  // Socket 이벤트 리스너
  useEffect(() => {
    if (!socket) return

    socket.emit('join_study', { studyId })

    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message])
      scrollToBottom()
    })

    return () => {
      socket.off('new_message')
    }
  }, [socket, studyId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (content) => {
    if (!socket || !content.trim()) return

    socket.emit('send_message', { studyId, content })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {data?.pages.map((page) =>
          page.data.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSendMessage} disabled={!isConnected} />
    </div>
  )
}
```

#### 5단계: Socket Hook
```javascript
// lib/hooks/useSocket.js

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useSession } from 'next-auth/react'

export function useSocket() {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) return

    const socketInstance = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
      auth: {
        token: session.accessToken,
      },
    })

    socketInstance.on('connect', () => {
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [session])

  return { socket, isConnected }
}
```

### ✅ 완료 기준
- [ ] 시그널링 서버 실행
- [ ] WebSocket 연결 성공
- [ ] 실시간 메시지 전송/수신
- [ ] 채팅 히스토리 로드 (무한 스크롤)
- [ ] Redis Pub/Sub 동작
- [ ] DB에 메시지 저장
- [ ] 멤버만 채팅 가능

---

## 4. 화상 스터디 (WebRTC)

### 📋 개요
- **목적**: 다자간 화상 통화 및 화면 공유
- **기술**: WebRTC, Simple-Peer, Socket.IO (시그널링)
- **개발 기간**: 11/13 (1일)

### 🔧 기술 스택
```
- WebRTC (P2P 통신)
- Simple-Peer (WebRTC 래퍼 라이브러리)
- Socket.IO (SDP/ICE 교환)
- STUN Server (Google STUN)
- MediaStream API (카메라/마이크)
```

### 🔄 구현 흐름

#### 아키텍처
```
Mesh 방식 (최대 6명)
Client A ←→ Client B
    ↓  ×  ↙
Client C

- 각 클라이언트가 다른 모든 클라이언트와 P2P 연결
- STUN 서버로 NAT 통과 (Google STUN 무료)
- TURN 서버는 제외 (비용 문제)
```

#### 1단계: 시그널링 서버 WebRTC 핸들러
```javascript
// signaling/src/handlers/videoHandler.js

module.exports = (io, socket) => {
  // 화상 통화 방 입장
  socket.on('join_video_call', async ({ studyId }) => {
    const room = `video:${studyId}`
    
    // 기존 참여자 목록
    const existingPeers = Array.from(
      io.sockets.adapter.rooms.get(room) || []
    ).filter(id => id !== socket.id)

    // 방 입장
    socket.join(room)

    // 기존 참여자들에게 새 참여자 알림
    socket.to(room).emit('user_joined', {
      userId: socket.userId,
      socketId: socket.id,
    })

    // 새 참여자에게 기존 참여자 목록 전송
    socket.emit('existing_users', {
      users: existingPeers.map(id => ({
        socketId: id,
      })),
    })
  })

  // SDP Offer 전달
  socket.on('offer', ({ targetSocketId, offer }) => {
    io.to(targetSocketId).emit('offer', {
      fromSocketId: socket.id,
      offer,
    })
  })

  // SDP Answer 전달
  socket.on('answer', ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit('answer', {
      fromSocketId: socket.id,
      answer,
    })
  })

  // ICE Candidate 전달
  socket.on('ice_candidate', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('ice_candidate', {
      fromSocketId: socket.id,
      candidate,
    })
  })

  // 화상 통화 방 나가기
  socket.on('leave_video_call', ({ studyId }) => {
    const room = `video:${studyId}`
    socket.leave(room)
    
    socket.to(room).emit('user_left', {
      socketId: socket.id,
    })
  })
}
```

#### 2단계: WebRTC Hook
```javascript
// lib/hooks/useWebRTC.js

import { useEffect, useRef, useState } from 'react'
import SimplePeer from 'simple-peer'

export function useWebRTC({ socket, studyId, userId }) {
  const [peers, setPeers] = useState({}) // { socketId: Peer }
  const [localStream, setLocalStream] = useState(null)
  const peersRef = useRef({})

  // 로컬 미디어 스트림 시작
  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setLocalStream(stream)
      return stream
    } catch (err) {
      console.error('Failed to get local stream', err)
    }
  }

  // Peer 생성
  const createPeer = (targetSocketId, initiator, stream) => {
    const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    })

    // Offer/Answer 생성 시
    peer.on('signal', (signal) => {
      if (signal.type === 'offer') {
        socket.emit('offer', { targetSocketId, offer: signal })
      } else if (signal.type === 'answer') {
        socket.emit('answer', { targetSocketId, answer: signal })
      }
    })

    // ICE Candidate 생성 시
    peer.on('icecandidate', (candidate) => {
      socket.emit('ice_candidate', { targetSocketId, candidate })
    })

    // 연결 완료
    peer.on('connect', () => {
      console.log('Peer connected:', targetSocketId)
    })

    // 에러 처리
    peer.on('error', (err) => {
      console.error('Peer error:', err)
    })

    return peer
  }

  useEffect(() => {
    if (!socket || !localStream) return

    // 화상 통화 방 입장
    socket.emit('join_video_call', { studyId })

    // 기존 사용자들과 연결 (Initiator)
    socket.on('existing_users', ({ users }) => {
      users.forEach(({ socketId }) => {
        const peer = createPeer(socketId, true, localStream)
        peersRef.current[socketId] = peer
        setPeers(prev => ({ ...prev, [socketId]: peer }))
      })
    })

    // 새 사용자 참여 (Receiver)
    socket.on('user_joined', ({ socketId }) => {
      const peer = createPeer(socketId, false, localStream)
      peersRef.current[socketId] = peer
      setPeers(prev => ({ ...prev, [socketId]: peer }))
    })

    // Offer 수신
    socket.on('offer', ({ fromSocketId, offer }) => {
      const peer = peersRef.current[fromSocketId]
      if (peer) {
        peer.signal(offer)
      }
    })

    // Answer 수신
    socket.on('answer', ({ fromSocketId, answer }) => {
      const peer = peersRef.current[fromSocketId]
      if (peer) {
        peer.signal(answer)
      }
    })

    // ICE Candidate 수신
    socket.on('ice_candidate', ({ fromSocketId, candidate }) => {
      const peer = peersRef.current[fromSocketId]
      if (peer) {
        peer.addIceCandidate(candidate)
      }
    })

    // 사용자 퇴장
    socket.on('user_left', ({ socketId }) => {
      const peer = peersRef.current[socketId]
      if (peer) {
        peer.destroy()
        delete peersRef.current[socketId]
        setPeers(prev => {
          const newPeers = { ...prev }
          delete newPeers[socketId]
          return newPeers
        })
      }
    })

    return () => {
      socket.off('existing_users')
      socket.off('user_joined')
      socket.off('offer')
      socket.off('answer')
      socket.off('ice_candidate')
      socket.off('user_left')
    }
  }, [socket, localStream, studyId])

  // 마이크 토글
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      return audioTrack.enabled
    }
  }

  // 카메라 토글
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      return videoTrack.enabled
    }
  }

  // 화면 공유
  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      })

      // 모든 Peer에게 화면 공유 스트림 전송
      Object.values(peersRef.current).forEach(peer => {
        const videoTrack = screenStream.getVideoTracks()[0]
        const sender = peer.streams[0].getVideoTracks()[0]
        peer.replaceTrack(sender, videoTrack, localStream)
      })

      // 화면 공유 종료 시
      screenStream.getVideoTracks()[0].onended = () => {
        // 다시 카메라로 전환
        const cameraTrack = localStream.getVideoTracks()[0]
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer.streams[0].getVideoTracks()[0]
          peer.replaceTrack(sender, cameraTrack, localStream)
        })
      }

      return screenStream
    } catch (err) {
      console.error('Failed to share screen', err)
    }
  }

  // 연결 종료
  const disconnect = () => {
    Object.values(peersRef.current).forEach(peer => peer.destroy())
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    socket.emit('leave_video_call', { studyId })
  }

  return {
    peers,
    localStream,
    startLocalStream,
    toggleAudio,
    toggleVideo,
    shareScreen,
    disconnect,
  }
}
```

#### 3단계: 화상 통화 컴포넌트
```jsx
// components/domain/video-call/VideoCallRoom.jsx

'use client'
import { useEffect, useState } from 'react'
import { useSocket } from '@/lib/hooks/useSocket'
import { useWebRTC } from '@/lib/hooks/useWebRTC'
import VideoTile from './VideoTile'
import LocalVideoControls from './LocalVideoControls'

export default function VideoCallRoom({ studyId }) {
  const { socket } = useSocket()
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  const {
    peers,
    localStream,
    startLocalStream,
    toggleAudio,
    toggleVideo,
    shareScreen,
    disconnect,
  } = useWebRTC({ socket, studyId })

  useEffect(() => {
    startLocalStream()

    return () => {
      disconnect()
    }
  }, [])

  const handleToggleAudio = () => {
    const enabled = toggleAudio()
    setIsAudioEnabled(enabled)
  }

  const handleToggleVideo = () => {
    const enabled = toggleVideo()
    setIsVideoEnabled(enabled)
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* 비디오 그리드 */}
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {/* 로컬 비디오 */}
        {localStream && (
          <VideoTile
            stream={localStream}
            isLocal
            isMuted
            label="나"
          />
        )}

        {/* 원격 비디오들 */}
        {Object.entries(peers).map(([socketId, peer]) => (
          <VideoTile
            key={socketId}
            stream={peer.streams[0]}
            label={`참여자 ${socketId.slice(0, 4)}`}
          />
        ))}
      </div>

      {/* 컨트롤 바 */}
      <LocalVideoControls
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onShareScreen={shareScreen}
        onLeave={disconnect}
      />
    </div>
  )
}
```

#### 4단계: 비디오 타일 컴포넌트
```jsx
// components/domain/video-call/VideoTile.jsx

'use client'
import { useEffect, useRef } from 'react'

export default function VideoTile({ stream, isLocal, isMuted, label }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
      />
      
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
        {label}
      </div>
    </div>
  )
}
```

### ✅ 완료 기준
- [ ] 로컬 카메라/마이크 접근
- [ ] 다자간 P2P 연결 (최대 6명)
- [ ] 실시간 비디오/오디오 전송
- [ ] 마이크 on/off
- [ ] 카메라 on/off
- [ ] 화면 공유 기능
- [ ] 참여자 퇴장 처리

---

## 5. 공지사항 시스템

### 📋 개요
- **목적**: 그룹 내 공지사항 작성 및 관리 (관리자 전용)
- **기술**: Markdown, Next.js API Routes
- **개발 기간**: 11/14 (0.5일)

### 🔧 기술 스택
```
- React Markdown (Markdown 렌더링)
- React SimpleMDE (Markdown 에디터)
- Prisma (Notice 모델)
- DOMPurify (XSS 방어)
```

### 📊 데이터 모델
```prisma
model Notice {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  authorId  Int
  groupId   Int
  isPinned  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  group StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@index([groupId, createdAt])
}
```

### 🔄 구현 흐름

#### 1단계: 공지사항 CRUD API
```javascript
// app/api/v1/studies/[studyId]/notices/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// GET - 공지사항 목록
export async function GET(req, { params }) {
  const studyId = parseInt(params.studyId)

  const notices = await prisma.notice.findMany({
    where: { groupId: studyId },
    include: {
      author: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json({ data: notices })
}

// POST - 공지사항 작성 (관리자만)
export async function POST(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)

  // 권한 체크
  const member = await prisma.studyMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: studyId,
      },
    },
  })

  if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, content, isPinned } = await req.json()

  const notice = await prisma.notice.create({
    data: {
      title,
      content,
      isPinned: isPinned || false,
      authorId: session.user.id,
      groupId: studyId,
    },
  })

  // 알림 발송 (추후 구현)
  // await notificationService.sendNotification(...)

  return NextResponse.json({ data: notice }, { status: 201 })
}
```

#### 2단계: 공지사항 상세/수정/삭제 API
```javascript
// app/api/v1/studies/[studyId]/notices/[noticeId]/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// GET - 공지사항 상세
export async function GET(req, { params }) {
  const noticeId = parseInt(params.noticeId)

  const notice = await prisma.notice.findUnique({
    where: { id: noticeId },
    include: {
      author: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
  })

  if (!notice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ data: notice })
}

// PATCH - 공지사항 수정 (관리자만)
export async function PATCH(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)
  const noticeId = parseInt(params.noticeId)

  // 권한 체크
  const member = await prisma.studyMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: studyId,
      },
    },
  })

  if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, content, isPinned } = await req.json()

  const updated = await prisma.notice.update({
    where: { id: noticeId },
    data: { title, content, isPinned },
  })

  return NextResponse.json({ data: updated })
}

// DELETE - 공지사항 삭제 (관리자만)
export async function DELETE(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)
  const noticeId = parseInt(params.noticeId)

  // 권한 체크
  const member = await prisma.studyMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: studyId,
      },
    },
  })

  if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.notice.delete({
    where: { id: noticeId },
  })

  return NextResponse.json({ message: 'Deleted' })
}
```

#### 3단계: Markdown 렌더러 컴포넌트
```jsx
// components/domain/notice/MarkdownRenderer.jsx

'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import DOMPurify from 'dompurify'

export default function MarkdownRenderer({ content }) {
  const sanitized = DOMPurify.sanitize(content)

  return (
    <div className="prose prose-indigo max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-7" {...props} />
          ),
          code: ({ node, inline, ...props }) => (
            inline ? (
              <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />
            ) : (
              <code className="block bg-gray-900 text-white p-4 rounded-lg overflow-x-auto" {...props} />
            )
          ),
        }}
      >
        {sanitized}
      </ReactMarkdown>
    </div>
  )
}
```

### ✅ 완료 기준
- [ ] 공지사항 작성 (관리자)
- [ ] Markdown 에디터 동작
- [ ] Markdown 렌더링
- [ ] 공지사항 수정/삭제
- [ ] 공지사항 고정 (Pin)
- [ ] XSS 방어 (DOMPurify)

---

## 6. 파일 공유 시스템

### 📋 개요
- **목적**: AWS S3를 통한 파일 업로드/다운로드
- **기술**: AWS S3, Pre-signed URL
- **개발 기간**: 11/14 (0.5일)

### 🔧 기술 스택
```
- AWS SDK v3 (S3 클라이언트)
- Pre-signed URL (보안 업로드/다운로드)
- Prisma (File 모델)
- React Dropzone (드래그 앤 드롭)
```

### 📊 데이터 모델
```prisma
model File {
  id         Int      @id @default(autoincrement())
  name       String
  url        String
  size       Int
  mimeType   String
  uploaderId Int
  groupId    Int
  createdAt  DateTime @default(now())

  group StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@index([groupId, createdAt])
}
```

### 🔄 구현 흐름

#### 1단계: S3 Pre-signed URL 생성 API
```javascript
// app/api/v1/studies/[studyId]/files/upload/route.js

import { getServerSession } from 'next-auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextResponse } from 'next/server'

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
})

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  const studyId = parseInt(params.studyId)

  // 멤버 확인
  const member = await prisma.studyMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: studyId,
      },
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { fileName, fileType, fileSize } = await req.json()

  // 파일 크기 제한 (50MB)
  const MAX_SIZE = 50 * 1024 * 1024
  if (fileSize > MAX_SIZE) {
    return NextResponse.json(
      { error: 'File too large. Max 50MB' },
      { status: 400 }
    )
  }

  // S3 키 생성
  const key = `studies/${studyId}/${Date.now()}-${fileName}`

  // Pre-signed URL 생성 (15분 유효)
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 })

  // 파일 URL
  const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`

  return NextResponse.json({
    uploadUrl,
    fileUrl,
    key,
  })
}
```

#### 2단계: 파일 메타데이터 저장 API
```javascript
// app/api/v1/studies/[studyId]/files/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// GET - 파일 목록
export async function GET(req, { params }) {
  const studyId = parseInt(params.studyId)

  const files = await prisma.file.findMany({
    where: { groupId: studyId },
    include: {
      uploader: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: files })
}

// POST - 파일 메타데이터 저장 (업로드 완료 후)
export async function POST(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)

  const { name, url, size, mimeType } = await req.json()

  const file = await prisma.file.create({
    data: {
      name,
      url,
      size,
      mimeType,
      uploaderId: session.user.id,
      groupId: studyId,
    },
  })

  return NextResponse.json({ data: file }, { status: 201 })
}
```

#### 3단계: 파일 업로드 컴포넌트
```jsx
// components/domain/file/FileUploadZone.jsx

'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

export default function FileUploadZone({ studyId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setProgress(0)

    try {
      // 1. Pre-signed URL 요청
      const { data } = await axios.post(
        `/api/v1/studies/${studyId}/files/upload`,
        {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }
      )

      // 2. S3에 직접 업로드
      await axios.put(data.uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setProgress(percent)
        },
      })

      // 3. 메타데이터 저장
      await axios.post(`/api/v1/studies/${studyId}/files`, {
        name: file.name,
        url: data.fileUrl,
        size: file.size,
        mimeType: file.type,
      })

      onUploadComplete?.()
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [studyId, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploading,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      {uploading ? (
        <div>
          <p className="text-sm text-gray-600">업로드 중... {progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600">
            {isDragActive
              ? '파일을 여기에 놓으세요'
              : '파일을 드래그하거나 클릭하여 업로드'}
          </p>
          <p className="text-xs text-gray-400 mt-2">최대 50MB</p>
        </div>
      )}
    </div>
  )
}
```

### ✅ 완료 기준
- [ ] Pre-signed URL 생성
- [ ] S3 직접 업로드
- [ ] 파일 메타데이터 DB 저장
- [ ] 파일 목록 조회
- [ ] 파일 다운로드
- [ ] 파일 삭제 (업로더/관리자)
- [ ] 드래그 앤 드롭 업로드
- [ ] 업로드 진행률 표시

---

## 7. 캘린더 및 일정 관리

### 📋 개요
- **목적**: 스터디 그룹 일정 공유 및 관리
- **기술**: React Big Calendar, Prisma
- **개발 기간**: 11/15 (0.5일)

### 🔧 기술 스택
```
- React Big Calendar (캘린더 UI)
- date-fns (날짜 처리)
- Prisma (Event 모델)
- React Query (캐싱)
```

### 📊 데이터 모델
```prisma
model Event {
  id          Int      @id @default(autoincrement())
  title       String
  description String?  @db.Text
  startDate   DateTime
  endDate     DateTime
  type        String   @default("EVENT") // "EVENT" | "DEADLINE" | "MEETING"
  groupId     Int
  createdBy   Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  group StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@index([groupId, startDate])
}
```

### 🔄 구현 흐름

#### 1단계: 일정 CRUD API
```javascript
// app/api/v1/studies/[studyId]/events/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// GET - 일정 목록 (월별 조회)
export async function GET(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)
  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start') // YYYY-MM-DD
  const end = searchParams.get('end')

  // 멤버 확인
  const member = await prisma.studyMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: studyId,
      },
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const events = await prisma.event.findMany({
    where: {
      groupId: studyId,
      ...(start && end && {
        startDate: {
          gte: new Date(start),
          lte: new Date(end),
        },
      }),
    },
    orderBy: { startDate: 'asc' },
  })

  return NextResponse.json({ data: events })
}

// POST - 일정 생성 (관리자만)
export async function POST(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)

  // 권한 체크
  const member = await prisma.studyMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: studyId,
      },
    },
  })

  if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, description, startDate, endDate, type } = await req.json()

  const event = await prisma.event.create({
    data: {
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      type,
      groupId: studyId,
      createdBy: session.user.id,
    },
  })

  return NextResponse.json({ data: event }, { status: 201 })
}
```

#### 2단계: 캘린더 컴포넌트
```jsx
// components/domain/calendar/CalendarView.jsx

'use client'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import EventAddEditModal from '@/components/modals/EventAddEditModal'

const locales = { ko }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function CalendarView({ studyId }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-01'),
    end: format(new Date(), 'yyyy-MM-31'),
  })

  // 일정 조회
  const { data, refetch } = useQuery({
    queryKey: ['events', studyId, dateRange],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/studies/${studyId}/events?start=${dateRange.start}&end=${dateRange.end}`
      )
      return res.json()
    },
  })

  const events = data?.data?.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    resource: event,
  })) || []

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent({ start, end })
    setModalOpen(true)
  }

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource)
    setModalOpen(true)
  }

  const handleRangeChange = (range) => {
    if (Array.isArray(range)) {
      setDateRange({
        start: format(range[0], 'yyyy-MM-dd'),
        end: format(range[range.length - 1], 'yyyy-MM-dd'),
      })
    }
  }

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onRangeChange={handleRangeChange}
        selectable
        culture="ko"
        messages={{
          next: '다음',
          previous: '이전',
          today: '오늘',
          month: '월',
          week: '주',
          day: '일',
          agenda: '일정',
        }}
      />

      {modalOpen && (
        <EventAddEditModal
          studyId={studyId}
          event={selectedEvent}
          onClose={() => {
            setModalOpen(false)
            setSelectedEvent(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}
```

### ✅ 완료 기준
- [ ] 캘린더 UI 렌더링
- [ ] 일정 생성 (관리자)
- [ ] 일정 수정/삭제
- [ ] 월/주/일 뷰 전환
- [ ] 일정 클릭 시 상세 보기

---

## 8. 할 일 관리

### 📋 개요
- **목적**: 스터디 그룹 할 일 목록 관리
- **기술**: Prisma, React Query
- **개발 기간**: 11/15 (0.5일)

### 🔧 기술 스택
```
- Prisma (Task 모델)
- React Query (Optimistic Update)
- shadcn/ui (Checkbox)
```

### 📊 데이터 모델
```prisma
model Task {
  id          Int       @id @default(autoincrement())
  content     String    @db.Text
  isCompleted Boolean   @default(false)
  assigneeId  Int?
  dueDate     DateTime?
  priority    String    @default("MEDIUM") // "HIGH" | "MEDIUM" | "LOW"
  groupId     Int
  createdBy   Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  group    StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  assignee User?      @relation("TaskAssignee", fields: [assigneeId], references: [id])

  @@index([groupId, dueDate])
  @@index([assigneeId])
}
```

### 🔄 구현 흐름

#### 1단계: 할 일 CRUD API
```javascript
// app/api/v1/studies/[studyId]/tasks/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// GET - 할 일 목록
export async function GET(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') // "all" | "completed" | "pending"

  const member = await prisma.studyMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: studyId,
      },
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const where = {
    groupId: studyId,
    ...(filter === 'completed' && { isCompleted: true }),
    ...(filter === 'pending' && { isCompleted: false }),
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
    orderBy: [
      { isCompleted: 'asc' },
      { priority: 'desc' },
      { dueDate: 'asc' },
    ],
  })

  return NextResponse.json({ data: tasks })
}

// POST - 할 일 생성
export async function POST(req, { params }) {
  const session = await getServerSession()
  const studyId = parseInt(params.studyId)

  const { content, assigneeId, dueDate, priority } = await req.json()

  const task = await prisma.task.create({
    data: {
      content,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'MEDIUM',
      groupId: studyId,
      createdBy: session.user.id,
    },
  })

  return NextResponse.json({ data: task }, { status: 201 })
}
```

#### 2단계: 할 일 완료 토글 API
```javascript
// app/api/v1/studies/[studyId]/tasks/[taskId]/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// PATCH - 할 일 수정 (완료 토글 포함)
export async function PATCH(req, { params }) {
  const session = await getServerSession()
  const taskId = parseInt(params.taskId)

  const { isCompleted, content, assigneeId, dueDate, priority } = await req.json()

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(typeof isCompleted === 'boolean' && { isCompleted }),
      ...(content && { content }),
      ...(assigneeId !== undefined && { assigneeId }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(priority && { priority }),
    },
  })

  return NextResponse.json({ data: updated })
}

// DELETE - 할 일 삭제
export async function DELETE(req, { params }) {
  const taskId = parseInt(params.taskId)

  await prisma.task.delete({
    where: { id: taskId },
  })

  return NextResponse.json({ message: 'Deleted' })
}
```

#### 3단계: 할 일 목록 컴포넌트
```jsx
// components/domain/task/TaskList.jsx

'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import TaskCreateForm from './TaskCreateForm'

export default function TaskList({ studyId }) {
  const [filter, setFilter] = useState('all')
  const queryClient = useQueryClient()

  // 할 일 목록 조회
  const { data } = useQuery({
    queryKey: ['tasks', studyId, filter],
    queryFn: async () => {
      const res = await fetch(`/api/v1/studies/${studyId}/tasks?filter=${filter}`)
      return res.json()
    },
  })

  // 완료 토글 (Optimistic Update)
  const toggleMutation = useMutation({
    mutationFn: async ({ taskId, isCompleted }) => {
      const res = await fetch(`/api/v1/studies/${studyId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted }),
      })
      return res.json()
    },
    onMutate: async ({ taskId, isCompleted }) => {
      // Optimistic Update
      await queryClient.cancelQueries(['tasks', studyId, filter])

      const previousTasks = queryClient.getQueryData(['tasks', studyId, filter])

      queryClient.setQueryData(['tasks', studyId, filter], (old) => ({
        ...old,
        data: old.data.map(task =>
          task.id === taskId ? { ...task, isCompleted } : task
        ),
      }))

      return { previousTasks }
    },
    onError: (err, variables, context) => {
      // 에러 시 롤백
      queryClient.setQueryData(['tasks', studyId, filter], context.previousTasks)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tasks', studyId, filter])
    },
  })

  const tasks = data?.data || []

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          전체
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          미완료
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          완료
        </Button>
      </div>

      {/* 할 일 생성 */}
      <TaskCreateForm studyId={studyId} />

      {/* 할 일 목록 */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
          >
            <Checkbox
              checked={task.isCompleted}
              onCheckedChange={(checked) => {
                toggleMutation.mutate({
                  taskId: task.id,
                  isCompleted: checked,
                })
              }}
            />
            <div className="flex-1">
              <p className={task.isCompleted ? 'line-through text-gray-400' : ''}>
                {task.content}
              </p>
              {task.assignee && (
                <p className="text-xs text-gray-500">
                  담당: {task.assignee.name}
                </p>
              )}
              {task.dueDate && (
                <p className="text-xs text-gray-500">
                  마감: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### ✅ 완료 기준
- [ ] 할 일 생성
- [ ] 할 일 목록 조회
- [ ] 완료 토글 (Optimistic Update)
- [ ] 담당자 지정
- [ ] 마감일 설정
- [ ] 필터링 (전체/완료/미완료)
- [ ] 할 일 삭제

---

## 9. 알림 시스템

### 📋 개요
- **목적**: 실시간 WebSocket 기반 알림
- **기술**: Socket.IO, Prisma, Zustand
- **개발 기간**: 11/16 (1일)

### 🔧 기술 스택
```
- Socket.IO (실시간 알림 전송)
- Prisma (Notification 모델)
- Zustand (알림 상태 관리)
- React Query (알림 목록)
```

### 📊 데이터 모델
```prisma
model Notification {
  id        Int      @id @default(autoincrement())
  type      String   // "STUDY_JOIN" | "NEW_NOTICE" | "NEW_MESSAGE" | "MEMBER_KICKED" | "EVENT_CREATED"
  title     String
  message   String
  link      String?
  isRead    Boolean  @default(false)
  userId    Int
  createdAt DateTime @default(now())

  @@index([userId, isRead, createdAt])
}
```

### 🔄 구현 흐름

#### 1단계: 알림 생성 서비스
```javascript
// lib/services/notification.service.js

import prisma from '@/lib/db/prisma'
import redis from '@/lib/utils/redis'

export const notificationService = {
  // 알림 생성 및 발송
  async create({ userId, type, title, message, link }) {
    // 1. DB에 저장
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, link },
    })

    // 2. Redis Pub으로 실시간 전송
    await redis.publish(
      `notification:${userId}`,
      JSON.stringify(notification)
    )

    return notification
  },

  // 스터디 가입 승인 알림
  async notifyStudyJoin({ userId, studyName, studyId }) {
    return this.create({
      userId,
      type: 'STUDY_JOIN',
      title: '스터디 가입 승인',
      message: `${studyName} 스터디에 가입되었습니다.`,
      link: `/studies/${studyId}`,
    })
  },

  // 새 공지사항 알림
  async notifyNewNotice({ memberIds, studyName, studyId, noticeId }) {
    const promises = memberIds.map(userId =>
      this.create({
        userId,
        type: 'NEW_NOTICE',
        title: '새 공지사항',
        message: `${studyName}에 새 공지사항이 등록되었습니다.`,
        link: `/studies/${studyId}/notices/${noticeId}`,
      })
    )
    return Promise.all(promises)
  },

  // 멤버 강퇴 알림
  async notifyMemberKicked({ userId, studyName }) {
    return this.create({
      userId,
      type: 'MEMBER_KICKED',
      title: '스터디 강퇴',
      message: `${studyName}에서 강퇴되었습니다.`,
      link: '/studies',
    })
  },
}
```

#### 2단계: 시그널링 서버 알림 핸들러
```javascript
// signaling/src/handlers/notificationHandler.js

const redis = require('redis')

const subClient = redis.createClient({ url: process.env.REDIS_URL })
await subClient.connect()

module.exports = (io) => {
  // Redis Subscribe: 사용자별 알림
  subClient.pSubscribe('notification:*', (message, channel) => {
    const userId = channel.split(':')[1]
    const notification = JSON.parse(message)

    // 해당 사용자의 모든 소켓에 알림 전송
    io.to(`user:${userId}`).emit('notification', notification)
  })
}
```

#### 3단계: 알림 API
```javascript
// app/api/v1/notifications/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// GET - 알림 목록
export async function GET(req) {
  const session = await getServerSession()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({
      where: { userId: session.user.id },
    }),
    prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    }),
  ])

  return NextResponse.json({
    data: notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    unreadCount,
  })
}
```

#### 4단계: 알림 읽음 처리 API
```javascript
// app/api/v1/notifications/[notificationId]/read/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  const session = await getServerSession()
  const notificationId = parseInt(params.notificationId)

  const notification = await prisma.notification.update({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
    data: { isRead: true },
  })

  return NextResponse.json({ data: notification })
}
```

#### 5단계: 알림 상태 관리 (Zustand)
```javascript
// lib/store/notificationStore.js

import { create } from 'zustand'

export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  notifications: [],

  setUnreadCount: (count) => set({ unreadCount: count }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
}))
```

#### 6단계: 알림 Hook
```javascript
// lib/hooks/useNotifications.js

import { useEffect } from 'react'
import { useSocket } from './useSocket'
import { useNotificationStore } from '@/lib/store/notificationStore'
import { useQueryClient } from '@tanstack/react-query'

export function useNotifications() {
  const { socket } = useSocket()
  const { addNotification } = useNotificationStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    // 알림 수신
    socket.on('notification', (notification) => {
      // Zustand 상태 업데이트
      addNotification(notification)

      // Toast 알림 표시
      toast({
        title: notification.title,
        description: notification.message,
      })

      // React Query 캐시 무효화
      queryClient.invalidateQueries(['notifications'])
    })

    return () => {
      socket.off('notification')
    }
  }, [socket, addNotification, queryClient])
}
```

### ✅ 완료 기준
- [ ] 알림 생성 서비스 동작
- [ ] 실시간 알림 수신 (WebSocket)
- [ ] 알림 목록 조회
- [ ] 알림 읽음 처리
- [ ] 헤더 알림 배지 표시
- [ ] Toast 알림 표시
- [ ] 알림 클릭 시 해당 페이지 이동

---

## 10. 대시보드

### 📋 개요
- **목적**: 사용자 맞춤 메인 화면
- **기술**: Next.js CSR, React Query
- **개발 기간**: 11/16 (0.5일)

### 🔄 구현 흐름

#### 1단계: 대시보드 데이터 API
```javascript
// app/api/v1/dashboard/route.js

import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession()

  // 병렬로 데이터 조회
  const [myStudies, recentNotices, upcomingEvents, pendingTasks] = await Promise.all([
    // 내가 참여 중인 스터디
    prisma.studyMember.findMany({
      where: { userId: session.user.id },
      include: {
        group: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      take: 6,
    }),

    // 최근 공지사항
    prisma.notice.findMany({
      where: {
        group: {
          members: {
            some: { userId: session.user.id },
          },
        },
      },
      include: {
        group: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),

    // 다가오는 일정
    prisma.event.findMany({
      where: {
        groupId: {
          in: await prisma.studyMember
            .findMany({
              where: { userId: session.user.id },
              select: { groupId: true },
            })
            .then(members => members.map(m => m.groupId)),
        },
        startDate: { gte: new Date() },
      },
      include: {
        group: { select: { name: true } },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    }),

    // 미완료 할 일
    prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
        isCompleted: false,
      },
      include: {
        group: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
  ])

  return NextResponse.json({
    data: {
      myStudies: myStudies.map(m => m.group),
      recentNotices,
      upcomingEvents,
      pendingTasks,
    },
  })
}
```

#### 2단계: 대시보드 페이지
```jsx
// app/(main)/dashboard/page.jsx

'use client'
import { useQuery } from '@tanstack/react-query'
import DashboardStats from '@/components/domain/dashboard/DashboardStats'
import MyStudyList from '@/components/domain/dashboard/MyStudyList'
import RecentActivities from '@/components/domain/dashboard/RecentActivities'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/v1/dashboard')
      return res.json()
    },
  })

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  const { myStudies, recentNotices, upcomingEvents, pendingTasks } = data.data

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">대시보드</h1>

      {/* 통계 카드 */}
      <DashboardStats
        studyCount={myStudies.length}
        noticeCount={recentNotices.length}
        taskCount={pendingTasks.length}
      />

      {/* 내 스터디 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">참여 중인 스터디</h2>
        <MyStudyList studies={myStudies} />
      </section>

      {/* 최근 활동 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">최근 활동</h2>
        <RecentActivities
          notices={recentNotices}
          events={upcomingEvents}
          tasks={pendingTasks}
        />
      </section>
    </div>
  )
}
```

### ✅ 완료 기준
- [ ] 대시보드 데이터 조회
- [ ] 참여 중인 스터디 목록
- [ ] 최근 공지사항 표시
- [ ] 다가오는 일정 표시
- [ ] 미완료 할 일 표시
- [ ] 통계 카드 (스터디 수, 알림 수 등)

---

## 📝 마무리

### 전체 기능 체크리스트

#### Phase 1-2: 인증 & 기반 (11/6-11/7)
- [ ] NextAuth.js 소셜 로그인
- [ ] 프로필 관리
- [ ] 인증 미들웨어

#### Phase 3: 스터디 그룹 (11/8-11/10)
- [ ] 스터디 CRUD
- [ ] 멤버 관리
- [ ] 권한 시스템

#### Phase 4: 실시간 채팅 (11/11-11/12)
- [ ] Socket.IO 서버
- [ ] WebSocket 채팅
- [ ] Redis Pub/Sub

#### Phase 5: 화상 스터디 (11/13)
- [ ] WebRTC P2P 연결
- [ ] 화면 공유
- [ ] 미디어 제어

#### Phase 6-7: 콘텐츠 관리 (11/14-11/15)
- [ ] 공지사항 (Markdown)
- [ ] 파일 공유 (S3)
- [ ] 캘린더
- [ ] 할 일 관리

#### Phase 8: 알림 (11/16)
- [ ] 실시간 알림
- [ ] 알림 목록
- [ ] Toast 알림

#### Phase 9-10: 테스트 & 배포 (11/17-11/19)
- [ ] 통합 테스트
- [ ] 버그 수정
- [ ] Vercel 배포
- [ ] 시그널링 서버 배포

---

**문서 작성 완료**: 2025년 11월 4일  
**버전**: 1.0.0  
**다음 단계**: 개발 시작! 🚀
