# 인증/인가 시스템

> **라이브러리**: NextAuth.js v5 (Auth.js)  
> **작성일**: 2025-11-17

---

## 🔐 NextAuth.js 설정

### auth.js 설정

```javascript
// lib/auth.js
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    // 이메일/비밀번호
    CredentialsProvider({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        
        if (!isValid) {
          throw new Error("Invalid credentials")
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    }),
    
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    
    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  }
})
```

---

## 🛡️ 미들웨어

### 1. 인증 미들웨어

```javascript
// middleware.js
import { auth } from "./lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  
  // 보호된 경로
  const protectedPaths = [
    '/dashboard',
    '/my-studies',
    '/tasks',
    '/notifications',
    '/me'
  ]
  
  // 관리자 경로
  const adminPaths = ['/admin']
  
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }
  
  if (adminPaths.some(path => pathname.startsWith(path))) {
    if (!req.auth?.user?.role.includes('ADMIN')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
```

### 2. API 인증 헬퍼

```javascript
// lib/auth-helpers.js
import { auth } from "./auth"
import { NextResponse } from "next/server"

// 로그인 확인
export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  return session
}

// 관리자 확인
export async function requireAdmin() {
  const session = await requireAuth()
  
  if (session instanceof NextResponse) return session
  
  if (!session.user.role.includes('ADMIN')) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }
  
  return session
}

// 스터디 멤버 확인
export async function requireStudyMember(studyId, minRole = 'MEMBER') {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session
  
  const member = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId: session.user.id
      }
    }
  })
  
  if (!member || member.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: "Not a member" },
      { status: 403 }
    )
  }
  
  // 역할 확인
  const roleHierarchy = { MEMBER: 0, ADMIN: 1, OWNER: 2 }
  if (roleHierarchy[member.role] < roleHierarchy[minRole]) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    )
  }
  
  return { session, member }
}
```

---

## 🔑 비밀번호 해싱

```javascript
// 회원가입 시
import bcrypt from "bcryptjs"

const hashedPassword = await bcrypt.hash(password, 10)

await prisma.user.create({
  data: {
    email,
    password: hashedPassword
  }
})
```

---

## 🎫 JWT 토큰 구조

```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "name": "홍길동",
  "role": "USER",
  "iat": 1700000000,
  "exp": 1700086400
}
```

**만료 시간**: 24시간

---

## 🔒 환경 변수

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/coup
```
# API 명세서

> **버전**: 1.0  
> **작성일**: 2025-11-17  
> **Base URL**: `/api`

---

## 📋 목차

1. [인증 API](#1-인증-auth) (5개)
2. [사용자 API](#2-사용자-users) (8개)
3. [스터디 API](#3-스터디-studies) (15개)
4. [채팅 API](#4-채팅-chat) (6개)
5. [공지 API](#5-공지-notices) (7개)
6. [파일 API](#6-파일-files) (8개)
7. [캘린더 API](#7-캘린더-calendar) (6개)
8. [할일 API](#8-할일-tasks) (8개)
9. [알림 API](#9-알림-notifications) (5개)
10. [관리자 API](#10-관리자-admin) (12개)

**총 80개 엔드포인트**

---

## 1. 인증 (Auth)

### 1.1 이메일 로그인
```
POST /api/auth/signin
```

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "홍길동"
  },
  "token": "jwt_token"
}
```

### 1.2 회원가입
```
POST /api/auth/signup
```

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "user": { "id": "user_123", "email": "user@example.com" },
  "token": "jwt_token"
}
```

### 1.3 소셜 로그인 (Google/GitHub)
```
NextAuth.js 자동 처리
GET /api/auth/signin/google
GET /api/auth/signin/github
```

### 1.4 로그아웃
```
POST /api/auth/signout
```

### 1.5 세션 확인
```
GET /api/auth/session
```

---

## 2. 사용자 (Users)

### 2.1 내 정보 조회
```
GET /api/users/me
Authorization: Bearer {token}
```

**Response**:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "홍길동",
  "avatar": "https://...",
  "bio": "자기소개",
  "createdAt": "2025-11-01T00:00:00Z"
}
```

### 2.2 프로필 수정
```
PATCH /api/users/me
```

**Request**:
```json
{
  "name": "홍길동",
  "bio": "안녕하세요",
  "avatar": "base64_or_url"
}
```

### 2.3 사용자 검색
```
GET /api/users?q={keyword}&page={n}&limit={n}
```

### 2.4 사용자 상세 조회
```
GET /api/users/{userId}
```

### 2.5 ~ 2.8
- 계정 삭제, 비밀번호 변경, 이메일 변경, 통계 조회

---

## 3. 스터디 (Studies)

### 3.1 스터디 목록 조회
```
GET /api/studies?category={cat}&page={n}&limit={n}
```

**Response**:
```json
{
  "studies": [
    {
      "id": "study_1",
      "name": "알고리즘 마스터",
      "emoji": "💻",
      "category": "개발",
      "members": { "current": 12, "max": 20 },
      "isRecruiting": true
    }
  ],
  "pagination": { "page": 1, "totalPages": 5, "total": 30 }
}
```

### 3.2 스터디 생성
```
POST /api/studies
Authorization: Bearer {token}
```

**Request**:
```json
{
  "name": "알고리즘 마스터",
  "emoji": "💻",
  "category": "개발",
  "subCategory": "알고리즘",
  "description": "매일 알고리즘 문제 풀이",
  "maxMembers": 20,
  "isPublic": true,
  "autoApprove": false,
  "tags": ["알고리즘", "코테"]
}
```

### 3.3 스터디 상세 조회
```
GET /api/studies/{studyId}
```

### 3.4 스터디 가입
```
POST /api/studies/{studyId}/join
```

**Request**:
```json
{
  "introduction": "안녕하세요...",
  "motivation": "학습",
  "level": "중급"
}
```

### 3.5 ~ 3.15
- 스터디 수정/삭제, 멤버 관리, 역할 변경, 강퇴, 탈퇴 등

---

## 4. 채팅 (Chat)

### 4.1 메시지 목록
```
GET /api/studies/{studyId}/chat?before={messageId}&limit=50
```

### 4.2 메시지 전송
```
POST /api/studies/{studyId}/chat
```

**Request**:
```json
{
  "content": "안녕하세요!",
  "fileId": "file_123" // optional
}
```

**Response**:
```json
{
  "id": "msg_123",
  "content": "안녕하세요!",
  "userId": "user_123",
  "userName": "홍길동",
  "createdAt": "2025-11-17T10:00:00Z",
  "readers": []
}
```

### 4.3 메시지 읽음 처리
```
POST /api/studies/{studyId}/chat/{messageId}/read
```

### 4.4 ~ 4.6
- 메시지 삭제, 고정 메시지, 검색

---

## 5. 공지 (Notices)

### 5.1 공지 목록
```
GET /api/studies/{studyId}/notices?filter={type}
```

### 5.2 공지 작성
```
POST /api/studies/{studyId}/notices
Authorization: ADMIN+
```

**Request**:
```json
{
  "title": "이번 주 일정",
  "content": "...",
  "isPinned": false,
  "isImportant": false
}
```

### 5.3 ~ 5.7
- 공지 수정/삭제, 고정/해제, 댓글 등

---

## 6. 파일 (Files)

### 6.1 파일 업로드
```
POST /api/studies/{studyId}/files
Content-Type: multipart/form-data
```

**Request**:
```
file: File (최대 50MB)
folderId: string (optional)
```

**Response**:
```json
{
  "id": "file_123",
  "name": "document.pdf",
  "size": 1024000,
  "url": "https://s3.../file_123",
  "type": "pdf"
}
```

### 6.2 파일 다운로드
```
GET /api/studies/{studyId}/files/{fileId}/download
```

### 6.3 ~ 6.8
- 파일 목록, 삭제, 폴더 생성, 이동 등

---

## 7. 캘린더 (Calendar)

### 7.1 일정 목록
```
GET /api/studies/{studyId}/calendar?month=2025-11
```

### 7.2 일정 생성
```
POST /api/studies/{studyId}/calendar
```

**Request**:
```json
{
  "title": "주간 회의",
  "date": "2025-11-13",
  "startTime": "14:00",
  "endTime": "16:00",
  "location": "Zoom"
}
```

---

## 8. 할일 (Tasks)

### 8.1 할일 목록
```
GET /api/tasks?studyId={id}&status={status}
```

### 8.2 할일 생성
```
POST /api/tasks
```

### 8.3 할일 완료/미완료 토글
```
PATCH /api/tasks/{taskId}/toggle
```

---

## 9. 알림 (Notifications)

### 9.1 알림 목록
```
GET /api/notifications?filter=unread&page=1
```

### 9.2 모두 읽음
```
POST /api/notifications/mark-all-read
```

---

## 10. 관리자 (Admin)

### 10.1 통계 조회
```
GET /api/admin/stats
Authorization: ADMIN+
```

### 10.2 사용자 관리
```
GET /api/admin/users
POST /api/admin/users/{userId}/suspend
```

### 10.3 ~ 10.12
- 스터디 관리, 신고 처리, 시스템 설정 등

---

## 🔄 WebSocket 이벤트

### 채팅
```javascript
// Client → Server
socket.emit('message:send', { studyId, content })
socket.emit('typing:start', { studyId })

// Server → Client
socket.on('message:new', (message) => {})
socket.on('user:typing', (user) => {})
```

### 알림
```javascript
// Server → Client
socket.on('notification:new', (notification) => {})
```

---

## 📝 공통 응답 형식

### 성공
```json
{
  "success": true,
  "data": { ... }
}
```

### 에러
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "로그인이 필요합니다"
  }
}
```

### 페이지네이션
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

