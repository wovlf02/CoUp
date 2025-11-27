# Next.js 15 최적화 전략 및 모달 설계

> **작성일**: 2025-11-27  
> **Next.js 버전**: 15.x (App Router)  
> **목적**: 관리자 페이지 성능 최적화 및 모달 전략

---

## 🚀 Next.js 15 최신 기능 활용

### 1. React Server Components (RSC)
```typescript
// app/admin/dashboard/page.tsx
import { Suspense } from 'react'
import { DashboardMetrics } from '@/components/admin/DashboardMetrics'
import { ActivityFeed } from '@/components/admin/ActivityFeed'
import { MetricsSkeleton } from '@/components/admin/skeletons'

// ✅ Server Component (기본)
export default async function AdminDashboard() {
  // 서버에서 직접 데이터 fetch
  const metrics = await fetchDashboardMetrics()
  
  return (
    <div className="dashboard">
      {/* Static 데이터는 바로 렌더링 */}
      <DashboardMetrics data={metrics} />
      
      {/* Streaming으로 지연 로딩 */}
      <Suspense fallback={<MetricsSkeleton />}>
        <ActivityFeed />
      </Suspense>
    </div>
  )
}

// 서버 컴포넌트에서 직접 DB 접근
async function fetchDashboardMetrics() {
  const { prisma } = await import('@/lib/prisma')
  
  const [totalUsers, activeUsers, pendingReports] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.report.count({ where: { status: 'PENDING' } })
  ])
  
  return { totalUsers, activeUsers, pendingReports }
}
```

### 2. Server Actions (폼 처리)
```typescript
// app/admin/users/[userId]/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-helpers'

export async function suspendUser(userId: string, formData: FormData) {
  // 권한 체크
  const admin = await requireAdmin()
  if (!admin) {
    return { error: '권한이 없습니다' }
  }
  
  const duration = formData.get('duration') as string
  const reason = formData.get('reason') as string
  
  // Validation
  if (reason.length < 10) {
    return { error: '사유는 최소 10자 이상 입력해주세요' }
  }
  
  // DB 업데이트
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'SUSPENDED',
      suspendedUntil: calculateSuspendDate(duration),
      suspendReason: reason
    }
  })
  
  // 제재 이력 생성
  await prisma.sanction.create({
    data: {
      userId,
      type: 'SUSPEND',
      reason,
      duration,
      adminId: admin.id
    }
  })
  
  // 캐시 재검증
  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
  
  return { success: true }
}

// 클라이언트 컴포넌트에서 사용
'use client'

export function SuspendUserForm({ userId }: { userId: string }) {
  const [state, formAction] = useFormState(suspendUser.bind(null, userId), null)
  const { pending } = useFormStatus()
  
  return (
    <form action={formAction}>
      <textarea name="reason" required minLength={10} />
      <select name="duration">
        <option value="1">1일</option>
        <option value="3">3일</option>
        <option value="7">7일</option>
      </select>
      <button disabled={pending}>
        {pending ? '처리 중...' : '정지 실행'}
      </button>
      {state?.error && <p className="error">{state.error}</p>}
    </form>
  )
}
```

### 3. Parallel Routes (병렬 라우팅)
```typescript
// app/admin/users/[userId]/layout.tsx
export default function UserDetailLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}

// app/admin/users/[userId]/@modal/(.)suspend/page.tsx
// Intercepting Routes로 모달 구현
import { Modal } from '@/components/ui/Modal'
import { SuspendUserForm } from './SuspendUserForm'

export default function SuspendModal({ params }: { params: { userId: string } }) {
  return (
    <Modal>
      <h2>사용자 정지</h2>
      <SuspendUserForm userId={params.userId} />
    </Modal>
  )
}

// app/admin/users/[userId]/suspend/page.tsx
// 직접 접근 시 전체 페이지
export default function SuspendPage({ params }: { params: { userId: string } }) {
  return (
    <div className="page">
      <h1>사용자 정지</h1>
      <SuspendUserForm userId={params.userId} />
    </div>
  )
}
```

### 4. Streaming & Suspense
```typescript
// app/admin/dashboard/page.tsx
import { Suspense } from 'react'

export default function Dashboard() {
  return (
    <div>
      {/* 즉시 표시 */}
      <Header />
      
      {/* 병렬 스트리밍 */}
      <div className="grid">
        <Suspense fallback={<MetricsSkeleton />}>
          <Metrics />
        </Suspense>
        
        <Suspense fallback={<ChartSkeleton />}>
          <Charts />
        </Suspense>
        
        <Suspense fallback={<FeedSkeleton />}>
          <ActivityFeed />
        </Suspense>
      </div>
    </div>
  )
}

// 각 컴포넌트는 독립적으로 데이터 fetch
async function Metrics() {
  const data = await fetchMetrics()
  return <MetricsCard data={data} />
}

async function Charts() {
  const data = await fetchChartData()
  return <ChartComponent data={data} />
}

async function ActivityFeed() {
  const activities = await fetchActivities()
  return <FeedList activities={activities} />
}
```

### 5. Partial Prerendering (PPR) - Experimental
```typescript
// next.config.js
module.exports = {
  experimental: {
    ppr: true, // Partial Prerendering 활성화
  },
}

// app/admin/users/page.tsx
export const experimental_ppr = true

export default function UsersPage() {
  return (
    <div>
      {/* Static Shell - 즉시 표시 */}
      <Header />
      <SearchBar />
      
      {/* Dynamic Content - Streaming */}
      <Suspense fallback={<TableSkeleton />}>
        <UserTable />
      </Suspense>
    </div>
  )
}
```

---

## 📦 모달 구현 전략

### 1. Intercepting Routes 모달 (권장)
```typescript
// 폴더 구조
app/
  admin/
    users/
      [userId]/
        layout.tsx
        page.tsx
        @modal/
          (.)suspend/
            page.tsx    // 모달로 표시
          (.)delete/
            page.tsx
        suspend/
          page.tsx      // 전체 페이지
        delete/
          page.tsx

// app/admin/users/[userId]/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal}
      <div id="modal-root" />
    </>
  )
}

// app/admin/users/[userId]/@modal/(.)suspend/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'

export default function SuspendModal({ params }: { params: { userId: string } }) {
  const router = useRouter()
  
  return (
    <Modal
      isOpen={true}
      onClose={() => router.back()}
    >
      <SuspendUserForm 
        userId={params.userId}
        onSuccess={() => router.back()}
      />
    </Modal>
  )
}
```

**장점**:
- URL 기반 (브라우저 히스토리 지원)
- 뒤로가기로 모달 닫기
- 새로고침해도 모달 상태 유지
- 딥링크 지원

### 2. Parallel Routes 모달
```typescript
// app/admin/layout.tsx
export default function AdminLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      <nav>...</nav>
      <main>{children}</main>
      {modal}
    </>
  )
}

// app/admin/@modal/(..)users/[userId]/suspend/page.tsx
import { Modal } from '@/components/ui/Modal'

export default function SuspendModal() {
  return (
    <Modal>
      <SuspendUserForm />
    </Modal>
  )
}
```

### 3. 상태 기반 모달 (간단한 경우)
```typescript
'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'

export function UserActions({ userId }: { userId: string }) {
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  
  return (
    <>
      <button onClick={() => setShowSuspendModal(true)}>
        정지
      </button>
      
      <Dialog
        open={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
      >
        <Dialog.Panel>
          <Dialog.Title>사용자 정지</Dialog.Title>
          <SuspendUserForm
            userId={userId}
            onSuccess={() => setShowSuspendModal(false)}
          />
        </Dialog.Panel>
      </Dialog>
    </>
  )
}
```

### 4. Portal 기반 모달 (고급)
```typescript
'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export function Modal({ children, isOpen, onClose }: ModalProps) {
  const modalRoot = useRef<HTMLElement | null>(null)
  
  useEffect(() => {
    modalRoot.current = document.getElementById('modal-root')
  }, [])
  
  if (!isOpen || !modalRoot.current) return null
  
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    modalRoot.current
  )
}
```

---

## 🎯 필수 모달 목록

### 1. 사용자 관리 모달
```typescript
// 1-1. 사용자 경고
<WarnUserModal userId={string} />

// 1-2. 사용자 정지
<SuspendUserModal userId={string} />

// 1-3. 정지 해제
<UnsuspendUserModal userId={string} />

// 1-4. 사용자 삭제 (SYSTEM_ADMIN)
<DeleteUserModal userId={string} />

// 1-5. 일괄 작업 확인
<BulkActionModal userIds={string[]} action={Action} />

// 1-6. 관리자 메모 추가
<AddNoteModal userId={string} />

// 1-7. 관리자 임명 (SYSTEM_ADMIN)
<PromoteAdminModal userId={string} />
```

### 2. 신고 관리 모달
```typescript
// 2-1. 신고 승인 (제재 실행)
<ApproveReportModal reportId={string} />

// 2-2. 신고 기각
<RejectReportModal reportId={string} />

// 2-3. 신고 보류
<HoldReportModal reportId={string} />

// 2-4. 에스컬레이션
<EscalateReportModal reportId={string} />

// 2-5. 유사 신고 보기
<SimilarReportsModal reportId={string} />

// 2-6. 일괄 처리
<BulkProcessReportsModal reportIds={string[]} />
```

### 3. 스터디 관리 모달
```typescript
// 3-1. 스터디 숨김
<HideStudyModal studyId={string} />

// 3-2. 스터디 종료
<CloseStudyModal studyId={string} />

// 3-3. 스터디 추천
<RecommendStudyModal studyId={string} />

// 3-4. 모집 중단
<StopRecruitmentModal studyId={string} />
```

### 4. 시스템 설정 모달
```typescript
// 4-1. 이메일 템플릿 편집 (전체 화면)
<EditEmailTemplateModal templateId={string} />

// 4-2. 템플릿 테스트 발송
<TestEmailModal templateId={string} />

// 4-3. 설정 변경 확인
<ConfirmSettingsChangeModal settings={Settings} />

// 4-4. 도메인 관리
<ManageEmailDomainsModal />

// 4-5. 확장자 관리
<ManageFileExtensionsModal />
```

### 5. 공통 모달
```typescript
// 5-1. 확인 모달
<ConfirmModal
  title={string}
  message={string}
  onConfirm={() => void}
  danger={boolean}
/>

// 5-2. 알림 모달
<AlertModal type="success|error|warning|info" message={string} />

// 5-3. 이미지 뷰어
<ImageViewerModal src={string} alt={string} />

// 5-4. PDF 뷰어
<PDFViewerModal url={string} />

// 5-5. 로딩 모달
<LoadingModal message={string} />
```

---

## ⚡ 성능 최적화 전략

### 1. Dynamic Import (코드 스플리팅)
```typescript
// 무거운 컴포넌트는 동적 import
import dynamic from 'next/dynamic'

const EmailTemplateEditor = dynamic(
  () => import('@/components/admin/EmailTemplateEditor'),
  {
    loading: () => <EditorSkeleton />,
    ssr: false, // 클라이언트에서만 로드
  }
)

const ChartComponent = dynamic(
  () => import('@/components/admin/Charts'),
  { loading: () => <ChartSkeleton /> }
)

// 모달도 동적 import
const SuspendUserModal = dynamic(
  () => import('@/components/modals/SuspendUserModal')
)

export function UserActions() {
  const [showModal, setShowModal] = useState(false)
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>정지</button>
      {showModal && <SuspendUserModal />}
    </>
  )
}
```

### 2. Image Optimization
```typescript
import Image from 'next/image'

// 자동 최적화
<Image
  src="/admin/avatar.jpg"
  alt="User Avatar"
  width={48}
  height={48}
  className="rounded-full"
  priority={false} // LCP 아니면 false
  loading="lazy"
/>

// Blur placeholder
<Image
  src={user.avatar}
  alt={user.name}
  width={200}
  height={200}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3. Font Optimization
```typescript
// app/layout.tsx
import { Inter, Noto_Sans_KR } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['korean'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
})

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### 4. Metadata API
```typescript
// app/admin/users/[userId]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const user = await getUser(params.userId)
  
  return {
    title: `${user.name} - 사용자 관리`,
    description: `${user.name}님의 상세 정보`,
    robots: 'noindex, nofollow', // 관리자 페이지는 검색 제외
  }
}
```

### 5. Caching 전략
```typescript
// 1. Route Segment Config
export const revalidate = 60 // 60초마다 재검증
export const dynamic = 'force-dynamic' // 매번 새로 fetch
export const fetchCache = 'force-no-store' // 캐시 안 함

// 2. fetch 옵션
async function getUsers() {
  const res = await fetch('/api/admin/users', {
    next: { 
      revalidate: 3600, // 1시간 캐시
      tags: ['users'] // 태그 기반 재검증
    }
  })
  return res.json()
}

// 3. 캐시 재검증
'use server'

import { revalidateTag, revalidatePath } from 'next/cache'

export async function updateUser(userId: string, data: any) {
  await prisma.user.update({ where: { id: userId }, data })
  
  // 태그로 재검증
  revalidateTag('users')
  
  // 경로로 재검증
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
}
```

### 6. React Compiler (Experimental)
```javascript
// next.config.js
module.exports = {
  experimental: {
    reactCompiler: true, // 자동 메모이제이션
  },
}

// 수동 메모이제이션 불필요
// ❌ Before
const MemoizedComponent = React.memo(ExpensiveComponent)
const memoizedValue = useMemo(() => computeValue(a, b), [a, b])
const memoizedCallback = useCallback(() => doSomething(a), [a])

// ✅ After - 컴파일러가 자동 처리
function Component({ a, b }) {
  const value = computeValue(a, b)
  const handleClick = () => doSomething(a)
  
  return <ExpensiveComponent value={value} onClick={handleClick} />
}
```

### 7. TanStack Query (React Query) 통합
```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
        gcTime: 5 * 60 * 1000, // 5분 (cacheTime 대체)
        refetchOnWindowFocus: false,
      },
    },
  }))
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

// app/admin/users/page.tsx
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function UserList() {
  const queryClient = useQueryClient()
  
  // 데이터 fetch
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/admin/users').then(r => r.json()),
  })
  
  // Mutation
  const suspendMutation = useMutation({
    mutationFn: (userId: string) => 
      fetch(`/api/admin/users/${userId}/suspend`, { method: 'POST' }),
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
  
  if (isLoading) return <Skeleton />
  if (error) return <Error error={error} />
  
  return (
    <table>
      {data.users.map(user => (
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>
            <button onClick={() => suspendMutation.mutate(user.id)}>
              정지
            </button>
          </td>
        </tr>
      ))}
    </table>
  )
}
```

### 8. Virtualization (대량 데이터)
```typescript
'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

export function VirtualizedUserList({ users }: { users: User[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // 각 행 높이
    overscan: 5, // 추가로 렌더링할 행 수
  })
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const user = users[virtualRow.index]
          
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <UserRow user={user} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

## 🔄 실시간 업데이트 전략

### 1. Server-Sent Events (SSE)
```typescript
// app/api/admin/activity-feed/route.ts
export async function GET() {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // 초기 데이터
      const data = JSON.stringify({ type: 'init', activities: [] })
      controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      
      // 실시간 업데이트 (예: Redis Pub/Sub)
      const subscription = subscribeToActivityUpdates((activity) => {
        const data = JSON.stringify({ type: 'update', activity })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      })
      
      return () => subscription.unsubscribe()
    },
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// 클라이언트
'use client'

export function ActivityFeed() {
  const [activities, setActivities] = useState([])
  
  useEffect(() => {
    const eventSource = new EventSource('/api/admin/activity-feed')
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'init') {
        setActivities(data.activities)
      } else if (data.type === 'update') {
        setActivities(prev => [data.activity, ...prev].slice(0, 20))
      }
    }
    
    return () => eventSource.close()
  }, [])
  
  return <ActivityList activities={activities} />
}
```

### 2. WebSocket (양방향)
```typescript
// 이미 Socket.io 사용 중이므로 활용
'use client'

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export function useAdminSocket() {
  const [socket, setSocket] = useState(null)
  
  useEffect(() => {
    const socketInstance = io('/admin', {
      auth: { token: getAuthToken() }
    })
    
    socketInstance.on('connect', () => {
      console.log('Admin socket connected')
    })
    
    setSocket(socketInstance)
    
    return () => {
      socketInstance.disconnect()
    }
  }, [])
  
  return socket
}

export function ReportManagement() {
  const socket = useAdminSocket()
  const [reports, setReports] = useState([])
  
  useEffect(() => {
    if (!socket) return
    
    // 새 신고 접수
    socket.on('new-report', (report) => {
      setReports(prev => [report, ...prev])
      showNotification('새 신고가 접수되었습니다')
    })
    
    // 신고 상태 변경
    socket.on('report-updated', ({ reportId, status }) => {
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status } : r
      ))
    })
    
    return () => {
      socket.off('new-report')
      socket.off('report-updated')
    }
  }, [socket])
  
  return <ReportList reports={reports} />
}
```

---

## 📊 성능 모니터링

### 1. Web Vitals 추적
```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}

// 커스텀 리포팅
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // 서버로 전송
    fetch('/api/analytics/vitals', {
      method: 'POST',
      body: JSON.stringify(metric),
    })
  })
  
  return null
}
```

### 2. Error Boundary
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
  useEffect(() => {
    // 에러 로깅 (Sentry 등)
    console.error(error)
  }, [error])
  
  return (
    <div>
      <h2>문제가 발생했습니다</h2>
      <p>{error.message}</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  )
}

// app/admin/users/[userId]/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>사용자를 찾을 수 없습니다</h2>
      <Link href="/admin/users">목록으로 돌아가기</Link>
    </div>
  )
}
```

---

## 🎨 UI 라이브러리 추천

### 1. Shadcn/ui (권장)
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button dialog table
```

```typescript
// components/ui/modal.tsx
import * as Dialog from '@radix-ui/react-dialog'

export function Modal({ children, ...props }) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content">
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### 2. Headless UI
```bash
npm install @headlessui/react
```

### 3. Radix UI
```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

---

**다음: 통합 예제 코드 생성...**

