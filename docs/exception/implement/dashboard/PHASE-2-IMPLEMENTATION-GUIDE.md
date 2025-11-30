# Dashboard Phase 2 구현 가이드

**Phase**: Phase 2 - API 안정성 구현  
**예상 시간**: 11시간  
**상태**: 🚧 진행 중 (2h/11h 완료)

---

## 📋 작업 목록

### ✅ 2.1 Prisma 연결 실패 처리 (완료 - 2h)

**파일**: `coup/src/app/api/dashboard/route.js`

**구현 완료**:
- [x] Promise.allSettled로 부분 실패 허용
- [x] 개별 쿼리 에러 처리
- [x] failedQueries 추적
- [x] Prisma 에러 변환
- [x] 부분 성공 응답 (207)
- [x] 성능 측정
- [x] 응답 데이터 검증

**결과**:
- Graceful Degradation 구현 ✅
- 완전한 에러 추적 ✅
- 사용자 경험 개선 ✅

---

### ⏳ 2.2 타임아웃 처리 (예정 - 2h)

**목표**: 느린 쿼리 및 네트워크 타임아웃 처리

**구현 계획**:

#### 1. Prisma 타임아웃 설정

```javascript
// prisma.config.ts
export const queryTimeout = 10000 // 10초

// route.js
const stats = await Promise.race([
  prisma.studyMember.count(...),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Query timeout')), queryTimeout)
  )
])
```

#### 2. Slow Query 감지

```javascript
const startTime = Date.now()
const result = await prisma.query(...)
const duration = Date.now() - startTime

if (duration > 5000) {
  logDashboardWarning('Slow Query', 'Query took too long', {
    query: 'studyMember.count',
    duration,
    threshold: 5000
  })
}
```

#### 3. 타임아웃 발생 시 캐시 사용

```javascript
import { redis } from '@/lib/redis' // 옵션

try {
  const data = await withTimeout(prisma.query(...), 10000)
  await redis.set(`dashboard:${userId}`, data, 'EX', 300) // 5분 캐시
  return data
} catch (error) {
  if (error.message.includes('timeout')) {
    // 캐시된 데이터 반환
    const cached = await redis.get(`dashboard:${userId}`)
    if (cached) {
      logDashboardWarning('Timeout Fallback', 'Using cached data', { userId })
      return { ...cached, cached: true, stale: true }
    }
  }
  throw error
}
```

---

### ⏳ 2.3 재시도 메커니즘 (예정 - 3h)

**목표**: 네트워크 실패 시 자동 재시도

**구현 계획**:

#### 1. withRetry 적용

```javascript
import { withRetry } from '@/lib/helpers/api-retry'

const myStudies = await withRetry(
  () => prisma.studyMember.findMany({...}),
  {
    maxRetries: 3,
    context: '내 스터디 조회',
    onRetry: (attempt, error, delay) => {
      logDashboardWarning('재시도', `${attempt}번째 재시도 (${delay}ms 지연)`, {
        userId,
        error: error.message
      })
    }
  }
).catch(error => {
  failedQueries.push('myStudies')
  return []
})
```

#### 2. Circuit Breaker 적용 (옵션)

```javascript
import { withCircuitBreaker } from '@/lib/helpers/api-retry'

const data = await withCircuitBreaker(
  () => prisma.query(...),
  { maxRetries: 3 }
)
```

---

### ⏳ 2.4 캐싱 전략 (예정 - 2h)

**목표**: 캐싱으로 DB 부하 감소 및 응답 속도 개선

**구현 계획**:

#### 1. 메모리 캐시 (간단한 방법)

```javascript
// 간단한 메모리 캐시
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5분

export async function GET() {
  const cacheKey = `dashboard:${userId}`
  const cached = cache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logDashboardWarning('Cache Hit', 'Returning cached data', { userId })
    return NextResponse.json({
      ...cached.data,
      cached: true,
      age: Math.floor((Date.now() - cached.timestamp) / 1000)
    })
  }

  // 데이터 로드...
  const data = await fetchDashboardData(userId)

  // 캐시 저장
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  })

  return NextResponse.json(data)
}
```

#### 2. Redis 캐시 (프로덕션)

```javascript
import { redis } from '@/lib/redis'

const cached = await redis.get(`dashboard:${userId}`)
if (cached) {
  return NextResponse.json(JSON.parse(cached))
}

const data = await fetchDashboardData(userId)
await redis.set(
  `dashboard:${userId}`, 
  JSON.stringify(data), 
  'EX', 
  300 // 5분
)
```

#### 3. 캐시 무효화

```javascript
// study 생성/수정 시 캐시 무효화
export async function POST() {
  // ... study 생성 ...
  
  // 관련 사용자의 캐시 무효화
  await redis.del(`dashboard:${userId}`)
  
  return NextResponse.json({ success: true })
}
```

---

### ⏳ 2.5 성능 최적화 (예정 - 2h)

**목표**: 쿼리 최적화 및 병렬 처리

**구현 계획**:

#### 1. 쿼리 최적화

```javascript
// Before: N+1 쿼리 문제
const studies = await prisma.study.findMany()
for (const study of studies) {
  const memberCount = await prisma.studyMember.count({ 
    where: { studyId: study.id } 
  })
}

// After: 한 번의 쿼리
const studies = await prisma.study.findMany({
  include: {
    _count: {
      select: { members: true }
    }
  }
})
```

#### 2. 선택적 데이터 로드

```javascript
// 클라이언트가 필요한 데이터만 요청
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sections = searchParams.get('sections')?.split(',') || [
    'stats', 'studies', 'activities', 'events'
  ]

  const data = {}

  if (sections.includes('stats')) {
    data.stats = await fetchStats(userId)
  }

  if (sections.includes('studies')) {
    data.myStudies = await fetchStudies(userId)
  }

  // ...

  return NextResponse.json({ success: true, data })
}
```

#### 3. 데이터 페이지네이션

```javascript
// 대량 데이터는 페이지네이션
const { page = 1, limit = 10 } = searchParams

const activities = await prisma.notification.findMany({
  where: { userId },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
})

const total = await prisma.notification.count({ where: { userId } })

return NextResponse.json({
  data: activities,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
})
```

---

## 📊 진행률

```
Phase 2: API 안정성 (11h)
├─ 2.1 Prisma 연결 실패  ✅ 완료 (2h)
├─ 2.2 타임아웃 처리    ⏳ 대기 (2h)
├─ 2.3 재시도 메커니즘  ⏳ 대기 (3h)
├─ 2.4 캐싱 전략       ⏳ 대기 (2h)
└─ 2.5 성능 최적화     ⏳ 대기 (2h)

완료: 18.2% (2h/11h)
```

---

## 🎯 우선순위

현재 구현된 2.1만으로도 기본적인 안정성은 확보됨.

**필수** (프로덕션 배포 전):
- [x] 2.1 Prisma 연결 실패 처리
- [ ] 2.2 타임아웃 처리 (권장)

**권장** (성능 개선):
- [ ] 2.3 재시도 메커니즘
- [ ] 2.4 캐싱 전략

**선택** (최적화):
- [ ] 2.5 성능 최적화

---

## 💡 제안

### 최소 구현 (2.1 + 간단한 캐싱)

Phase 2.1만으로도 충분한 안정성이 확보되었으므로, 다음 중 선택:

**옵션 A - Phase 3으로 진행**:
- 위젯 에러 처리 구현
- Phase 2의 나머지는 나중에 추가

**옵션 B - Phase 2 완성**:
- 2.2 타임아웃 처리 추가
- 2.4 간단한 메모리 캐시 추가
- 2.3, 2.5는 필요 시 추가

**추천**: 옵션 A
- 현재 구현만으로도 안정적
- 위젯 에러 처리가 사용자 경험에 더 중요
- Phase 2 나머지는 성능 이슈 발생 시 추가

---

**작성일**: 2025-12-01  
**작성자**: GitHub Copilot  
**버전**: 1.0.0

