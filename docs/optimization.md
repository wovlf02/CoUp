# CoUp Next.js 16 최적화 전략 설계서

> **작성일**: 2025년 11월 5일  
> **Next.js 버전**: 16.x  
> **목표**: 최적의 사용자 경험과 SEO, 성능 최적화

---

## ? 목차

1. [렌더링 전략 (SSR/CSR/ISR/SSG)](#1-렌더링-전략)
2. [라우트 그룹 최적화](#2-라우트-그룹-최적화)
3. [데이터 페칭 전략](#3-데이터-페칭-전략)
4. [스트리밍 및 Suspense](#4-스트리밍-및-suspense)
5. [이미지 최적화](#5-이미지-최적화)
6. [코드 스플리팅](#6-코드-스플리팅)
7. [캐싱 전략](#7-캐싱-전략)
8. [미들웨어 최적화](#8-미들웨어-최적화)
9. [번들 최적화](#9-번들-최적화)
10. [성능 모니터링](#10-성능-모니터링)

---

## 1. 렌더링 전략

### ? 화면별 렌더링 방식 매트릭스

| 화면 | 라우트 | 렌더링 | 이유 | 캐시 |
|------|--------|--------|------|------|
| **랜딩 페이지** | `/` | **SSG** | SEO 최우선, 정적 콘텐츠 | 빌드 시 생성 |
| **로그인** | `/sign-in` | **CSR** | 인증 플로우, SEO 불필요 | 없음 |
| **회원가입** | `/sign-up` | **CSR** | 인증 플로우, SEO 불필요 | 없음 |
| **대시보드** | `/dashboard` | **CSR** | 개인화된 데이터, 실시간 | React Query 5분 |
| **스터디 탐색** | `/studies` | **SSR** | SEO 중요, 동적 필터링 | 60초 Revalidate |
| **스터디 생성** | `/studies/create` | **CSR** | 인증 필요, 폼 인터랙션 | 없음 |
| **스터디 상세** | `/studies/[id]` | **SSR + Streaming** | SEO + 실시간 데이터 | 30초 Revalidate |
| **채팅** | `/studies/[id]/chat` | **CSR** | WebSocket 실시간 | 없음 |
| **공지사항** | `/studies/[id]/notices` | **SSR** | SEO, 공개 콘텐츠 | 60초 Revalidate |
| **파일** | `/studies/[id]/files` | **CSR** | 멤버 전용, 동적 | React Query 3분 |
| **캘린더** | `/studies/[id]/calendar` | **CSR** | 인터랙티브, 동적 | React Query 5분 |
| **할 일** | `/studies/[id]/tasks` | **CSR** | 실시간 업데이트 | Optimistic Update |
| **화상 통화** | `/studies/[id]/video-call` | **CSR** | WebRTC, 실시간 | 없음 |
| **스터디 설정** | `/studies/[id]/settings` | **CSR** | 관리자 전용, 폼 | 없음 |
| **마이페이지** | `/me` | **CSR** | 개인정보, 실시간 | React Query 10분 |
| **알림** | `/notifications` | **CSR** | 실시간 WebSocket | Optimistic Update |
| **관리자** | `/admin/*` | **CSR** | 관리자 전용, 동적 | React Query 1분 |

---

## 2. 라우트 그룹 최적화

### 2.1 라우트 그룹 구조

```typescript
// app/(auth)/layout.tsx - 인증 레이아웃
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 없음, 중앙 정렬 */}
      {children}
    </div>
  )
}

// app/(main)/layout.tsx - 메인 레이아웃
export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </>
  )
}

// app/(admin)/layout.tsx - 관리자 레이아웃
export default function AdminLayout({ children }) {
  return (
    <>
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </>
  )
}
```

### 2.2 레이아웃 최적화

```typescript
// app/(main)/layout.tsx
import { Suspense } from 'react'
import { HeaderSkeleton, SidebarSkeleton } from '@/components/loading'

export default function MainLayout({ children }) {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      <div className="flex">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </>
  )
}
```

---

## 3. 데이터 페칭 전략

### 3.1 SSR 페이지 (Server Components)

#### 랜딩 페이지 (SSG)
```typescript
// app/page.tsx
export default async function LandingPage() {
  // 빌드 시 생성, 정적 콘텐츠
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
    </main>
  )
}

// 완전 정적 생성
export const dynamic = 'force-static'
```

#### 스터디 탐색 (SSR + Revalidate)
```typescript
// app/(main)/studies/page.tsx
import { prisma } from '@/lib/db/prisma'

export const revalidate = 60 // 60초마다 재검증

interface SearchParams {
  category?: string
  keyword?: string
  sort?: string
  page?: string
}

export default async function StudiesPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  // 서버에서 직접 데이터 페칭
  const studies = await prisma.studyGroup.findMany({
    where: {
      visibility: 'PUBLIC',
      ...(searchParams.category && {
        category: searchParams.category
      }),
      ...(searchParams.keyword && {
        OR: [
          { name: { contains: searchParams.keyword, mode: 'insensitive' } },
          { description: { contains: searchParams.keyword, mode: 'insensitive' } }
        ]
      })
    },
    include: {
      owner: {
        select: { id: true, name: true, imageUrl: true }
      },
      _count: {
        select: { members: true }
      }
    },
    orderBy: searchParams.sort === 'popular' 
      ? { members: { _count: 'desc' } }
      : { createdAt: 'desc' },
    take: 12,
    skip: ((parseInt(searchParams.page || '1') - 1) * 12)
  })

  return (
    <div>
      <StudyFilters />
      <StudyList studies={studies} />
    </div>
  )
}

// SEO 최적화
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }) {
  return {
    title: `스터디 탐색${searchParams.category ? ` - ${searchParams.category}` : ''} | CoUp`,
    description: '나에게 맞는 스터디 그룹을 찾아보세요',
    openGraph: {
      title: '스터디 탐색 - CoUp',
      description: '함께 성장하는 스터디 플랫폼',
      images: ['/og-image.png']
    }
  }
}
```

#### 스터디 상세 (SSR + Streaming)
```typescript
// app/(main)/studies/[studyId]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'

export const revalidate = 30 // 30초 재검증

// 정적 경로 생성 (인기 스터디 상위 100개)
export async function generateStaticParams() {
  const studies = await prisma.studyGroup.findMany({
    select: { id: true },
    take: 100,
    orderBy: { members: { _count: 'desc' } }
  })

  return studies.map(study => ({
    studyId: study.id.toString()
  }))
}

async function getStudy(studyId: string) {
  const study = await prisma.studyGroup.findUnique({
    where: { id: parseInt(studyId) },
    include: {
      owner: { select: { id: true, name: true, imageUrl: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, imageUrl: true } }
        },
        take: 4 // 첫 4명만
      },
      _count: { select: { members: true } }
    }
  })

  if (!study) notFound()
  return study
}

async function getRecentActivities(studyId: string) {
  // 최근 활동 조회 (느린 쿼리)
  const activities = await prisma.$queryRaw`
    SELECT * FROM (
      SELECT 'notice' as type, id, title as content, "createdAt" FROM "Notice" WHERE "groupId" = ${parseInt(studyId)}
      UNION ALL
      SELECT 'file' as type, id, name as content, "createdAt" FROM "File" WHERE "groupId" = ${parseInt(studyId)}
      UNION ALL
      SELECT 'event' as type, id, title as content, "createdAt" FROM "Event" WHERE "groupId" = ${parseInt(studyId)}
    ) activities
    ORDER BY "createdAt" DESC
    LIMIT 5
  `
  return activities
}

export default async function StudyDetailPage({
  params
}: {
  params: { studyId: string }
}) {
  // 1. 핵심 데이터 먼저 로드 (빠름)
  const study = await getStudy(params.studyId)

  return (
    <div>
      <StudyHeader study={study} />
      <StudyTabs />

      <div className="grid grid-cols-3 gap-6">
        {/* 즉시 렌더링 */}
        <div className="col-span-2">
          <StudyIntro study={study} />
        </div>

        <div>
          <StudyMembers members={study.members} totalCount={study._count.members} />
        </div>

        {/* Streaming: 최근 활동은 나중에 로드 */}
        <div className="col-span-3">
          <Suspense fallback={<ActivitySkeleton />}>
            <RecentActivities studyId={params.studyId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

// Streaming 컴포넌트 (Server Component)
async function RecentActivities({ studyId }: { studyId: string }) {
  const activities = await getRecentActivities(studyId)
  return <ActivityList activities={activities} />
}

// SEO
export async function generateMetadata({ params }: { params: { studyId: string } }) {
  const study = await getStudy(params.studyId)
  
  return {
    title: `${study.name} | CoUp`,
    description: study.description.slice(0, 160),
    openGraph: {
      title: study.name,
      description: study.description,
      images: [study.imageUrl || '/og-image.png']
    }
  }
}
```

### 3.2 CSR 페이지 (Client Components)

#### 대시보드
```typescript
// app/(main)/dashboard/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { DashboardSkeleton } from '@/components/loading'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/v1/dashboard')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000 // 1분마다 자동 갱신
  })

  if (isLoading) return <DashboardSkeleton />

  return (
    <div>
      <WelcomeMessage userName={data.user.name} />
      <StatsCards stats={data.stats} />
      <MyStudies studies={data.myStudies} />
      <RecentActivities activities={data.recentActivities} />
    </div>
  )
}
```

#### 채팅 (실시간)
```typescript
// app/(main)/studies/[studyId]/chat/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSocket } from '@/lib/hooks/useSocket'
import { useInfiniteQuery } from '@tanstack/react-query'

export default function ChatPage({ params }: { params: { studyId: string } }) {
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState([])

  // 이전 메시지 (무한 스크롤)
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['messages', params.studyId],
    queryFn: async ({ pageParam }) => {
      const res = await fetch(
        `/api/v1/studies/${params.studyId}/messages?cursor=${pageParam || ''}`
      )
      return res.json()
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: Infinity // 메시지는 불변
  })

  // WebSocket 실시간 메시지
  useEffect(() => {
    if (!socket) return

    socket.emit('join_study', { studyId: params.studyId })

    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socket.emit('leave_study', { studyId: params.studyId })
      socket.off('new_message')
    }
  }, [socket, params.studyId])

  return (
    <ChatRoom
      messages={[...data?.pages.flatMap(p => p.data) || [], ...messages]}
      onSend={(content) => socket.emit('send_message', { studyId: params.studyId, content })}
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
    />
  )
}
```

---

## 4. 스트리밍 및 Suspense

### 4.1 Parallel Data Fetching (병렬 페칭)

```typescript
// app/(main)/studies/[studyId]/page.tsx
import { Suspense } from 'react'

export default function StudyDetailPage({ params }) {
  return (
    <div>
      {/* 병렬로 로드 */}
      <Suspense fallback={<StudyHeaderSkeleton />}>
        <StudyHeader studyId={params.studyId} />
      </Suspense>

      <div className="grid grid-cols-2 gap-6">
        <Suspense fallback={<IntroSkeleton />}>
          <StudyIntro studyId={params.studyId} />
        </Suspense>

        <Suspense fallback={<MembersSkeleton />}>
          <StudyMembers studyId={params.studyId} />
        </Suspense>
      </div>

      <Suspense fallback={<ActivitiesSkeleton />}>
        <RecentActivities studyId={params.studyId} />
      </Suspense>
    </div>
  )
}

// 각 컴포넌트가 독립적으로 데이터 페칭
async function StudyHeader({ studyId }: { studyId: string }) {
  const study = await prisma.studyGroup.findUnique({
    where: { id: parseInt(studyId) },
    select: { id: true, name: true, category: true }
  })
  return <header>{study.name}</header>
}

async function StudyIntro({ studyId }: { studyId: string }) {
  const study = await prisma.studyGroup.findUnique({
    where: { id: parseInt(studyId) },
    select: { description: true, createdAt: true }
  })
  return <div>{study.description}</div>
}
```

### 4.2 Waterfall 방지

? **나쁜 예 (순차 로딩)**:
```typescript
export default async function Page() {
  const user = await getUser() // 1초
  const studies = await getStudies(user.id) // 1초
  const tasks = await getTasks(user.id) // 1초
  // 총 3초
}
```

? **좋은 예 (병렬 로딩)**:
```typescript
export default async function Page() {
  const [user, studies, tasks] = await Promise.all([
    getUser(),
    getStudies(),
    getTasks()
  ])
  // 총 1초
}
```

---

## 5. 이미지 최적화

### 5.1 Next.js Image 컴포넌트

```typescript
// components/ui/OptimizedImage.tsx
import Image from 'next/image'

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false
}: {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      className="object-cover"
    />
  )
}
```

### 5.2 이미지 사용 전략

| 위치 | 사이즈 | Priority | Lazy |
|------|--------|----------|------|
| 히어로 섹션 | 1920×1080 | ? | ? |
| 프로필 이미지 | 128×128 | ? | ? |
| 스터디 카드 | 400×300 | ? | ? |
| 파일 썸네일 | 200×200 | ? | ? |

### 5.3 외부 이미지 최적화

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google 프로필
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub 프로필
      },
      {
        protocol: 'https',
        hostname: process.env.AWS_S3_BUCKET_NAME + '.s3.amazonaws.com', // S3
      }
    ],
    formats: ['image/avif', 'image/webp'], // 최신 포맷 우선
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일 캐시
  }
}
```

---

## 6. 코드 스플리팅

### 6.1 Dynamic Import

```typescript
// 화상 통화 컴포넌트 (무거운 WebRTC)
import dynamic from 'next/dynamic'

const VideoCallRoom = dynamic(
  () => import('@/components/domain/video-call/VideoCallRoom'),
  {
    ssr: false, // CSR만
    loading: () => <VideoCallSkeleton />
  }
)

export default function VideoCallPage({ params }) {
  return <VideoCallRoom studyId={params.studyId} />
}
```

```typescript
// Markdown 에디터 (무거운 라이브러리)
import dynamic from 'next/dynamic'

const MarkdownEditor = dynamic(
  () => import('react-simplemde-editor'),
  {
    ssr: false,
    loading: () => <EditorSkeleton />
  }
)

export function NoticeCreateModal() {
  return (
    <Modal>
      <MarkdownEditor />
    </Modal>
  )
}
```

### 6.2 라우트별 청크 분할

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      '@tanstack/react-query',
      'react-markdown',
      'react-big-calendar',
      'recharts'
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // React Query 별도 청크
          reactQuery: {
            name: 'react-query',
            test: /[\\/]node_modules[\\/](@tanstack)[\\/]/,
            priority: 40
          },
          // Socket.IO 별도 청크
          socket: {
            name: 'socket-io',
            test: /[\\/]node_modules[\\/](socket\.io-client)[\\/]/,
            priority: 30
          },
          // UI 라이브러리 별도 청크
          ui: {
            name: 'ui-libs',
            test: /[\\/]node_modules[\\/](react-markdown|remark-gfm|react-big-calendar)[\\/]/,
            priority: 20
          }
        }
      }
    }
    return config
  }
}
```

---

## 7. 캐싱 전략

### 7.1 React Query 캐싱

```typescript
// lib/utils/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분 (기본)
      cacheTime: 10 * 60 * 1000, // 10분
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1
    }
  }
})

// 화면별 커스텀 설정
export const queryKeys = {
  dashboard: {
    all: ['dashboard'],
    staleTime: 5 * 60 * 1000 // 5분
  },
  studies: {
    list: (filters: any) => ['studies', 'list', filters],
    detail: (id: string) => ['studies', 'detail', id],
    staleTime: 60 * 1000 // 1분
  },
  messages: {
    list: (studyId: string, cursor?: string) => ['messages', studyId, cursor],
    staleTime: Infinity // 메시지는 불변
  },
  notifications: {
    all: ['notifications'],
    staleTime: 30 * 1000 // 30초
  }
}
```

### 7.2 Next.js 캐싱

```typescript
// 1. Fetch Cache (Server Components)
// 60초 재검증
export const revalidate = 60

// 또는 fetch 옵션
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }
})

// 2. 동적 렌더링 강제
export const dynamic = 'force-dynamic' // 캐시 안 함
export const dynamic = 'force-static'  // 빌드 시 정적 생성

// 3. Route Segment Config
// app/(main)/studies/page.tsx
export const revalidate = 60 // 60초
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
```

### 7.3 Redis 캐싱 (서버 사이드)

```typescript
// lib/utils/cache.ts
import { redis } from '@/lib/utils/redis'

export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  // 1. Redis에서 확인
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }

  // 2. DB 쿼리
  const data = await fetcher()

  // 3. Redis에 저장
  await redis.setex(key, ttl, JSON.stringify(data))

  return data
}

// 사용 예시
async function getPopularStudies() {
  return cachedQuery(
    'studies:popular',
    async () => {
      return prisma.studyGroup.findMany({
        where: { visibility: 'PUBLIC' },
        orderBy: { members: { _count: 'desc' } },
        take: 10
      })
    },
    300 // 5분
  )
}
```

---

## 8. 미들웨어 최적화

### 8.1 인증 미들웨어

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 미들웨어가 실행될 경로 매칭
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // 1. 인증 필요한 경로
  const protectedPaths = ['/dashboard', '/studies', '/me', '/notifications', '/admin']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath && !token) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // 2. 관리자 경로
  if (pathname.startsWith('/admin') && token?.role !== 'SYSTEM_ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 3. 인증된 사용자가 로그인 페이지 접근
  if ((pathname === '/sign-in' || pathname === '/sign-up') && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 4. 응답 헤더 추가 (보안)
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}
```

### 8.2 Rate Limiting (미들웨어)

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10초에 10번
  analytics: true,
})

export async function middleware(req: NextRequest) {
  // API 경로만 Rate Limit 적용
  if (req.nextUrl.pathname.startsWith('/api/v1')) {
    const ip = req.ip ?? '127.0.0.1'
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      })
    }
  }

  return NextResponse.next()
}
```

---

## 9. 번들 최적화

### 9.1 next.config.js 최적화

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. React 컴파일러 활성화 (실험적)
  experimental: {
    reactCompiler: true,
    optimizePackageImports: ['@tanstack/react-query', 'lodash', 'date-fns'],
  },

  // 2. 압축 최적화
  compress: true,
  poweredByHeader: false,

  // 3. SWC Minify (기본값)
  swcMinify: true,

  // 4. 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 5. 번들 분석
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle Analyzer (개발 시만)
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze.html',
          openAnalyzer: false,
        })
      )
    }

    // Tree Shaking 최적화
    config.optimization.usedExports = true
    config.optimization.providedExports = true
    config.optimization.sideEffects = true

    return config
  },

  // 6. 환경 변수 최적화
  env: {
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  },
}

module.exports = nextConfig
```

### 9.2 Package.json 최적화

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "analyze": "ANALYZE=true next build",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^16.0.0",
    "webpack-bundle-analyzer": "^4.10.0"
  }
}
```

---

## 10. 성능 모니터링

### 10.1 Web Vitals 추적

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

```typescript
// app/providers.tsx
'use client'

import { useEffect } from 'react'
import { useReportWebVitals } from 'next/web-vitals'

export function Providers({ children }) {
  useReportWebVitals((metric) => {
    // Google Analytics로 전송
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }

    // 콘솔에도 출력 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.log(metric)
    }
  })

  return <>{children}</>
}
```

### 10.2 목표 성능 지표

| 지표 | 목표 | 현재 | 개선 방법 |
|------|------|------|-----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | ? | 이미지 최적화, SSR |
| **FID** (First Input Delay) | < 100ms | ? | 코드 스플리팅, Lazy Loading |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ? | 이미지 크기 명시, Skeleton UI |
| **FCP** (First Contentful Paint) | < 1.8s | ? | Inline CSS, Font Preload |
| **TTFB** (Time to First Byte) | < 600ms | ? | CDN, Edge Functions |

### 10.3 Lighthouse 목표

- **Performance**: 90+ 점
- **Accessibility**: 95+ 점
- **Best Practices**: 100 점
- **SEO**: 100 점

---

## ? 최적화 체크리스트

### SSR/CSR 선택
- [ ] 랜딩 페이지: SSG
- [ ] 스터디 탐색: SSR + Revalidate
- [ ] 스터디 상세: SSR + Streaming
- [ ] 대시보드: CSR
- [ ] 채팅: CSR + WebSocket
- [ ] 화상 통화: CSR

### 데이터 페칭
- [ ] Server Components에서 직접 DB 쿼리
- [ ] Parallel Data Fetching (Suspense)
- [ ] React Query 캐싱 설정
- [ ] Optimistic Updates (할 일, 알림)

### 이미지
- [ ] Next.js Image 컴포넌트 사용
- [ ] AVIF/WebP 포맷
- [ ] Lazy Loading (Viewport 외부)
- [ ] Priority (Hero 이미지)

### 코드 스플리팅
- [ ] Dynamic Import (무거운 컴포넌트)
- [ ] Route-based Splitting
- [ ] Component-based Splitting

### 캐싱
- [ ] React Query: 화면별 staleTime 설정
- [ ] Next.js: revalidate 설정
- [ ] Redis: 인기 데이터 캐싱

### 번들
- [ ] Tree Shaking
- [ ] Code Splitting
- [ ] Webpack Bundle Analyzer

### 성능
- [ ] Web Vitals 추적
- [ ] Lighthouse 90+ 점
- [ ] 성능 모니터링 대시보드

---

## ? 추가 권장사항

### 1. Font 최적화
```typescript
// app/layout.tsx
import { Pretendard } from 'next/font/google'

const pretendard = Pretendard({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-pretendard'
})

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### 2. Prefetching
```typescript
// 링크 프리페칭
<Link href="/studies" prefetch={true}>
  스터디 탐색
</Link>

// 프로그래매틱 프리페칭
import { useRouter } from 'next/navigation'

const router = useRouter()

// 마우스 호버 시 프리페칭
<div onMouseEnter={() => router.prefetch('/studies/123')}>
  스터디 카드
</div>
```

### 3. Error Boundary
```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>문제가 발생했습니다!</h2>
      <button onClick={() => reset()}>다시 시도</button>
    </div>
  )
}
```

---

**최종 작성**: 2025년 11월 5일  
**버전**: 1.0.0  
**다음 단계**: 실제 구현 및 성능 측정

