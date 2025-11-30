# Dashboard 예외 처리 사용 가이드

**버전**: 1.0.0  
**작성일**: 2025-12-01  
**대상**: Phase 1 유틸리티 파일

---

## 📋 목차

1. [에러 처리](#에러-처리)
2. [데이터 검증](#데이터-검증)
3. [헬퍼 함수](#헬퍼-함수)
4. [Error Boundary](#error-boundary)
5. [API 재시도](#api-재시도)

---

## 에러 처리

### 파일: `dashboard-errors.js`

#### 1. API 라우트에서 에러 응답 생성

```javascript
import { DASHBOARD_ERRORS, createDashboardErrorResponse } from '@/lib/exceptions/dashboard-errors'

// GET /api/dashboard
export async function GET(request) {
  try {
    const data = await fetchDashboardData()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    // Prisma 연결 실패
    return NextResponse.json(
      createDashboardErrorResponse('PRISMA_CONNECTION', {
        message: error.message
      }),
      { status: 500 }
    )
  }
}
```

#### 2. 부분 성공 응답 (일부 데이터만 성공)

```javascript
import { createPartialSuccessResponse } from '@/lib/exceptions/dashboard-errors'

// 여러 데이터 소스에서 데이터 로드
const [stats, tasks, members] = await Promise.allSettled([
  fetchStats(),
  fetchTasks(),
  fetchMembers()
])

const successData = {}
const errors = []

if (stats.status === 'fulfilled') {
  successData.stats = stats.value
} else {
  errors.push({ field: 'stats', error: stats.reason.message })
}

// 207 Multi-Status 응답
return NextResponse.json(
  createPartialSuccessResponse(successData, errors),
  { status: 207 }
)
```

#### 3. Prisma 에러 변환

```javascript
import { handlePrismaError } from '@/lib/exceptions/dashboard-errors'

try {
  const data = await prisma.study.findMany()
} catch (error) {
  const dashboardError = handlePrismaError(error)
  // { code: 'DASH-001', message: '...', statusCode: 500 }
  
  return NextResponse.json(
    dashboardError,
    { status: dashboardError.statusCode }
  )
}
```

#### 4. React Query 에러 처리

```javascript
import { handleReactQueryError } from '@/lib/exceptions/dashboard-errors'

function DashboardClient() {
  const { data, error } = useDashboard()

  if (error) {
    const dashboardError = handleReactQueryError(error)
    return <ErrorDisplay error={dashboardError} />
  }
}
```

#### 5. 에러 로깅

```javascript
import { logDashboardError, logDashboardWarning } from '@/lib/exceptions/dashboard-errors'

// 에러 로깅
try {
  await fetchData()
} catch (error) {
  logDashboardError('대시보드 데이터 로드', error, {
    userId: session.user.id,
    context: 'API Route',
    additionalInfo: { query: request.query }
  })
}

// 경고 로깅
if (data.length === 0) {
  logDashboardWarning('빈 데이터', {
    userId: session.user.id,
    message: '대시보드 데이터가 비어있습니다'
  })
}
```

---

## 데이터 검증

### 파일: `dashboard-validation.js`

#### 1. 날짜 검증

```javascript
import { validateDate, validateDateRange } from '@/lib/validators/dashboard-validation'

// 단일 날짜 검증
const dateResult = validateDate('2025-12-01')
// { isValid: true, date: Date, error: null }

const invalidDate = validateDate('invalid')
// { isValid: false, date: null, error: '유효하지 않은 날짜 형식입니다' }

// 날짜 범위 검증 (최대 1년)
const rangeResult = validateDateRange('2025-01-01', '2025-12-31')
// { isValid: true, error: null }
```

#### 2. 숫자 검증

```javascript
import { validateNumber } from '@/lib/validators/dashboard-validation'

// 0~100 범위
const result = validateNumber(75, { min: 0, max: 100 })
// { isValid: true, value: 75, error: null }

// 음수 불허
const result2 = validateNumber(-5, { allowNegative: false })
// { isValid: false, value: null, error: '음수는 허용되지 않습니다' }
```

#### 3. XSS 방어

```javascript
import { sanitizeHtml } from '@/lib/validators/dashboard-validation'

const userInput = '<script>alert("XSS")</script>Hello'
const safe = sanitizeHtml(userInput)
// 'Hello'
```

#### 4. 전체 대시보드 데이터 검증

```javascript
import { validateDashboardData } from '@/lib/validators/dashboard-validation'

const data = {
  stats: { /* ... */ },
  tasks: [/* ... */],
  members: [/* ... */]
}

const result = validateDashboardData(data)
if (!result.isValid) {
  console.error(result.errors)
  // [
  //   { field: 'stats.attendanceRate', error: '백분율은 0-100 사이여야 합니다' }
  // ]
}
```

#### 5. 위젯 데이터 검증

```javascript
import { validateWidgetData } from '@/lib/validators/dashboard-validation'

const widgetData = {
  type: 'StudyStatus',
  stats: {
    attendanceRate: 85.5,
    taskCompletionRate: 90.2
  },
  nextEvent: {
    date: '2025-12-10',
    dday: 9
  }
}

const result = validateWidgetData(widgetData)
// { isValid: true, errors: [] }
```

---

## 헬퍼 함수

### 파일: `dashboard-helpers.js`

#### 1. 안전한 백분율 계산

```javascript
import { calculatePercentage } from '@/lib/helpers/dashboard-helpers'

// 정상 케이스
calculatePercentage(75, 100) // 75

// 0으로 나누기 방지
calculatePercentage(10, 0) // 0

// 100 초과 방지
calculatePercentage(150, 100) // 100

// 음수 방지
calculatePercentage(-10, 100) // 0
```

#### 2. D-day 계산 및 포맷팅

```javascript
import { calculateDday, formatDday } from '@/lib/helpers/dashboard-helpers'

// D-day 계산
const dday = calculateDday('2025-12-25')
// 24

// 포맷팅
formatDday('2025-12-25') // "D-24"
formatDday(new Date()) // "D-Day"
formatDday('2025-11-20') // "D+11"
formatDday(null) // "날짜 없음"
```

#### 3. 상대 시간 표시

```javascript
import { formatRelativeTime } from '@/lib/helpers/dashboard-helpers'

const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
formatRelativeTime(fiveMinutesAgo) // "5분 전"

const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
formatRelativeTime(twoHoursAgo) // "2시간 전"

const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
formatRelativeTime(yesterday) // "1일 전"
```

#### 4. 긴급 할일 필터링

```javascript
import { getUrgentTasks } from '@/lib/helpers/dashboard-helpers'

const tasks = [
  { title: '과제 제출', dueDate: '2025-12-03' }, // 2일 후
  { title: '발표 준비', dueDate: '2025-12-10' }, // 9일 후
  { title: '시험 공부', dueDate: '2025-12-02' }  // 1일 후
]

// 3일 이내 마감 할일만
const urgent = getUrgentTasks(tasks, 3)
// [
//   { title: '시험 공부', dueDate: '2025-12-02' },
//   { title: '과제 제출', dueDate: '2025-12-03' }
// ]
```

#### 5. 부분 데이터 병합 (기본값 포함)

```javascript
import { mergePartialData } from '@/lib/helpers/dashboard-helpers'

const defaults = {
  stats: { attendanceRate: 0, taskCompletionRate: 0 },
  tasks: [],
  members: []
}

const partialData = {
  stats: { attendanceRate: 85.5 }
  // tasks, members 누락
}

const merged = mergePartialData(partialData, defaults)
// {
//   stats: { attendanceRate: 85.5, taskCompletionRate: 0 },
//   tasks: [],
//   members: []
// }
```

#### 6. 숫자 포맷팅

```javascript
import { formatNumber, formatCompactNumber } from '@/lib/helpers/dashboard-helpers'

formatNumber(12345) // "12,345"
formatNumber(12345.67) // "12,345.67"

formatCompactNumber(1234) // "1.2K"
formatCompactNumber(1234567) // "1.2M"
formatCompactNumber(123) // "123"
```

---

## Error Boundary

### 파일: `ErrorBoundary.jsx`

#### 1. 전체 대시보드 감싸기

```jsx
import DashboardErrorBoundary from '@/components/dashboard/ErrorBoundary'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary
      userId={session?.user?.id}
      resetOnRetry={false}
      onError={(error, errorInfo) => {
        // 프로덕션 에러 리포팅 (예: Sentry)
        if (process.env.NODE_ENV === 'production') {
          reportToSentry(error, errorInfo)
        }
      }}
    >
      <DashboardClient />
    </DashboardErrorBoundary>
  )
}
```

#### 2. 위젯 개별 감싸기

```jsx
import { WidgetErrorBoundary } from '@/components/dashboard/ErrorBoundary'
import StudyStatus from './widgets/StudyStatus'

export default function DashboardClient({ data }) {
  return (
    <div className={styles.widgets}>
      <WidgetErrorBoundary widgetName="StudyStatus">
        <StudyStatus stats={data.stats} nextEvent={data.nextEvent} />
      </WidgetErrorBoundary>

      <WidgetErrorBoundary widgetName="OnlineMembers">
        <OnlineMembers members={data.members} />
      </WidgetErrorBoundary>

      <WidgetErrorBoundary widgetName="UrgentTasks">
        <UrgentTasks tasks={data.tasks} />
      </WidgetErrorBoundary>
    </div>
  )
}
```

#### 3. HOC 사용

```jsx
import { withErrorBoundary, withWidgetErrorBoundary } from '@/components/dashboard/ErrorBoundary'

// 전체 컴포넌트
const SafeDashboardClient = withErrorBoundary(DashboardClient, {
  resetOnRetry: false
})

// 위젯
const SafeStudyStatus = withWidgetErrorBoundary(StudyStatus, 'StudyStatus')
const SafeOnlineMembers = withWidgetErrorBoundary(OnlineMembers, 'OnlineMembers')

export default function DashboardPage() {
  return (
    <SafeDashboardClient>
      <SafeStudyStatus />
      <SafeOnlineMembers />
    </SafeDashboardClient>
  )
}
```

---

## API 재시도

### 파일: `api-retry.js`

#### 1. 기본 재시도

```javascript
import { withRetry } from '@/lib/helpers/api-retry'

async function fetchDashboard() {
  const data = await withRetry(
    () => fetch('/api/dashboard').then(r => r.json()),
    {
      maxRetries: 3,
      timeout: 10000,
      onRetry: (attempt, error, delay) => {
        console.log(`재시도 ${attempt}/${3} (${delay}ms 후)`)
      }
    }
  )
  return data
}
```

#### 2. React Query 통합

```javascript
import { useQuery } from '@tanstack/react-query'
import { getReactQueryRetryConfig } from '@/lib/helpers/api-retry'

function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    ...getReactQueryRetryConfig({
      maxRetries: 5,
      baseDelay: 1000
    })
  })
}
```

#### 3. 병렬 요청 (부분 실패 허용)

```javascript
import { retryableParallel } from '@/lib/helpers/api-retry'

async function fetchAllData() {
  const { successes, failures } = await retryableParallel([
    () => fetch('/api/dashboard/stats').then(r => r.json()),
    () => fetch('/api/dashboard/tasks').then(r => r.json()),
    () => fetch('/api/dashboard/members').then(r => r.json())
  ], {
    throwOnAllFailed: true, // 모두 실패 시에만 에러
    maxRetries: 3
  })

  console.log(`성공: ${successes.length}, 실패: ${failures.length}`)

  // 성공한 데이터만 사용
  const data = {}
  successes.forEach(({ index, data: result }) => {
    if (index === 0) data.stats = result
    if (index === 1) data.tasks = result
    if (index === 2) data.members = result
  })

  return data
}
```

#### 4. Circuit Breaker 패턴

```javascript
import { withCircuitBreaker, globalCircuitBreaker } from '@/lib/helpers/api-retry'

async function fetchDashboard() {
  try {
    const data = await withCircuitBreaker(
      () => fetch('/api/dashboard').then(r => r.json()),
      {
        maxRetries: 3,
        circuitBreaker: globalCircuitBreaker
      }
    )
    return data
  } catch (error) {
    if (error.message === 'Circuit breaker is OPEN') {
      // Circuit Breaker가 열려있음 (서버 다운 상태)
      console.log('서버가 일시적으로 사용 불가능합니다')
      return null
    }
    throw error
  }
}

// Circuit Breaker 상태 확인
const state = globalCircuitBreaker.getState()
console.log(state)
// { state: 'CLOSED', failureCount: 0, lastFailureTime: null }
```

---

## 🎯 실전 예제

### 완전한 대시보드 API 라우트

```javascript
// coup/src/app/api/dashboard/route.js
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { DASHBOARD_ERRORS, createDashboardErrorResponse, createPartialSuccessResponse, handlePrismaError, logDashboardError } from '@/lib/exceptions/dashboard-errors'
import { validateDashboardData } from '@/lib/validators/dashboard-validation'
import { withRetry } from '@/lib/helpers/api-retry'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    // 1. 인증 확인
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    // 2. 여러 데이터 소스에서 데이터 로드 (재시도 적용)
    const results = await Promise.allSettled([
      withRetry(() => fetchStats(session.user.id), { maxRetries: 2 }),
      withRetry(() => fetchTasks(session.user.id), { maxRetries: 2 }),
      withRetry(() => fetchMembers(session.user.id), { maxRetries: 2 })
    ])

    // 3. 성공/실패 분리
    const data = {}
    const errors = []

    if (results[0].status === 'fulfilled') {
      data.stats = results[0].value
    } else {
      errors.push({ field: 'stats', error: results[0].reason.message })
    }

    if (results[1].status === 'fulfilled') {
      data.tasks = results[1].value
    } else {
      errors.push({ field: 'tasks', error: results[1].reason.message })
    }

    if (results[2].status === 'fulfilled') {
      data.members = results[2].value
    } else {
      errors.push({ field: 'members', error: results[2].reason.message })
    }

    // 4. 모두 실패 시 에러
    if (Object.keys(data).length === 0) {
      logDashboardError('대시보드 전체 실패', new Error('All queries failed'), {
        userId: session.user.id,
        errors
      })

      return NextResponse.json(
        createDashboardErrorResponse('QUERY_FAILED'),
        { status: 500 }
      )
    }

    // 5. 데이터 검증
    const validation = validateDashboardData(data)
    if (!validation.isValid) {
      logDashboardError('데이터 검증 실패', new Error('Validation failed'), {
        userId: session.user.id,
        errors: validation.errors
      })

      return NextResponse.json(
        createDashboardErrorResponse('INVALID_DATA', {
          details: validation.errors
        }),
        { status: 400 }
      )
    }

    // 6. 부분 성공 응답
    if (errors.length > 0) {
      return NextResponse.json(
        createPartialSuccessResponse(data, errors),
        { status: 207 } // Multi-Status
      )
    }

    // 7. 전체 성공
    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const dashboardError = handlePrismaError(error)
      logDashboardError('Prisma 에러', error, {
        userId: session?.user?.id
      })
      return NextResponse.json(dashboardError, { status: dashboardError.statusCode })
    }

    // 일반 에러
    logDashboardError('대시보드 로드 실패', error, {
      userId: session?.user?.id
    })

    return NextResponse.json(
      createDashboardErrorResponse('UNKNOWN_ERROR', {
        message: error.message
      }),
      { status: 500 }
    )
  }
}

async function fetchStats(userId) {
  return prisma.studyMember.findMany({
    where: { userId },
    include: { study: true }
  })
}

async function fetchTasks(userId) {
  return prisma.task.findMany({
    where: { assigneeId: userId }
  })
}

async function fetchMembers(userId) {
  return prisma.studyMember.findMany({
    where: { study: { members: { some: { userId } } } }
  })
}
```

---

**작성일**: 2025-12-01  
**작성자**: GitHub Copilot  
**버전**: 1.0.0

