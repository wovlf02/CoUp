# 대시보드 에러 처리 가이드

## 개요

대시보드 도메인의 체계적인 에러 처리 시스템에 대한 문서입니다.

**파일 위치:** `src/lib/exceptions/dashboard/`

---

## 에러 처리 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        대시보드 에러 처리 계층                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      클라이언트 계층                               │  │
│  │                                                                    │  │
│  │   ┌─────────────────────────────────────────────────────────────┐ │  │
│  │   │              DashboardErrorBoundary                          │ │  │
│  │   │              (전체 대시보드 에러 격리)                        │ │  │
│  │   │                                                              │ │  │
│  │   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │ │  │
│  │   │   │ Widget       │  │ Widget       │  │ Widget       │      │ │  │
│  │   │   │ Error        │  │ Error        │  │ Error        │      │ │  │
│  │   │   │ Boundary     │  │ Boundary     │  │ Boundary     │      │ │  │
│  │   │   └──────────────┘  └──────────────┘  └──────────────┘      │ │  │
│  │   │                                                              │ │  │
│  │   └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                     │                                    │
│                                     ▼                                    │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                       API 계층                                      │  │
│  │                                                                     │  │
│  │   ┌─────────────────────────────────────────────────────────────┐  │  │
│  │   │           withDashboardErrorHandler                          │  │  │
│  │   │           (API 라우트 에러 래퍼)                             │  │  │
│  │   └────────────────────────────┬────────────────────────────────┘  │  │
│  │                                │                                    │  │
│  │   ┌────────────────────────────┼────────────────────────────────┐  │  │
│  │   │          DashboardException 계층                             │  │  │
│  │   │                            │                                 │  │  │
│  │   │  ┌─────────────────────────┼─────────────────────────────┐  │  │  │
│  │   │  │      DashboardException (Base)                         │  │  │  │
│  │   │  │                         │                              │  │  │  │
│  │   │  │  ┌──────────────┐ ┌─────┴──────┐ ┌──────────────────┐ │  │  │  │
│  │   │  │  │ Validation   │ │ Permission │ │ Business         │ │  │  │  │
│  │   │  │  │ Exception    │ │ Exception  │ │ Exception        │ │  │  │  │
│  │   │  │  └──────────────┘ └────────────┘ └──────────────────┘ │  │  │  │
│  │   │  │                                                        │  │  │  │
│  │   │  └────────────────────────────────────────────────────────┘  │  │  │
│  │   │                                                              │  │  │
│  │   └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Exception 클래스 계층

### DashboardException (Base)

**파일 위치:** `src/lib/exceptions/dashboard/DashboardException.js`

모든 대시보드 예외의 기본 클래스입니다.

#### 속성

| 속성 | 타입 | 설명 |
|------|------|------|
| `name` | `string` | 예외 이름 |
| `code` | `string` | 에러 코드 (DASH-XXX) |
| `message` | `string` | 에러 메시지 |
| `userMessage` | `string` | 사용자 친화적 메시지 |
| `devMessage` | `string` | 개발자용 상세 메시지 |
| `statusCode` | `number` | HTTP 상태 코드 |
| `securityLevel` | `string` | 보안 수준 |
| `domain` | `string` | 도메인 ('DASHBOARD') |
| `retryable` | `boolean` | 재시도 가능 여부 |
| `timestamp` | `string` | 에러 발생 시각 |
| `context` | `object` | 추가 컨텍스트 |
| `category` | `string` | 에러 카테고리 |

#### 생성자

```javascript
constructor(message, code, statusCode = 400, securityLevel = 'medium', context = {}) {
  super(message)
  this.name = 'DashboardException'
  this.code = code
  this.message = message
  this.statusCode = statusCode
  this.securityLevel = securityLevel
  this.context = context
  // ...
}
```

#### 정적 팩토리 메서드

```javascript
// 인증 관련
DashboardException.authenticationRequired()    // DASH-001, 401
DashboardException.sessionExpired()            // DASH-002, 401
DashboardException.invalidSession()            // DASH-003, 401
DashboardException.tokenExpired()              // DASH-004, 401

// 권한 관련
DashboardException.accessDenied()              // DASH-005, 403
DashboardException.studyAccessDenied()         // DASH-006, 403

// 리소스 관련
DashboardException.resourceNotFound()          // DASH-010, 404
DashboardException.studyNotFound()             // DASH-011, 404

// 서버 에러
DashboardException.internalError()             // DASH-040, 500
DashboardException.databaseError()             // DASH-041, 500
```

---

### DashboardValidationException

**파일 위치:** `src/lib/exceptions/dashboard/DashboardValidationException.js`

입력값 유효성 검증 실패 시 발생하는 예외입니다.

#### 정적 팩토리 메서드

```javascript
// 날짜 관련
DashboardValidationException.dateRequired()           // DASH-V01
DashboardValidationException.invalidDateFormat()      // DASH-V02
DashboardValidationException.dateRangeInvalid()       // DASH-V03
DashboardValidationException.dateRangeTooLong()       // DASH-V04

// 파라미터 관련
DashboardValidationException.invalidPeriodType()      // DASH-V10
DashboardValidationException.invalidStatisticsType()  // DASH-V11
DashboardValidationException.invalidWidgetType()      // DASH-V12
DashboardValidationException.invalidAggregationType() // DASH-V13

// 페이지네이션 관련
DashboardValidationException.invalidPageNumber()      // DASH-V20
DashboardValidationException.invalidLimit()           // DASH-V21
DashboardValidationException.invalidSortOrder()       // DASH-V22
```

---

### DashboardPermissionException

**파일 위치:** `src/lib/exceptions/dashboard/DashboardPermissionException.js`

권한 부족 시 발생하는 예외입니다.

#### 정적 팩토리 메서드

```javascript
DashboardPermissionException.accessDenied()           // DASH-P01, 403
DashboardPermissionException.studyAccessDenied()      // DASH-P02, 403
DashboardPermissionException.adminRequired()          // DASH-P03, 403
DashboardPermissionException.ownerRequired()          // DASH-P04, 403
```

---

### DashboardBusinessException

**파일 위치:** `src/lib/exceptions/dashboard/DashboardBusinessException.js`

비즈니스 로직 관련 예외입니다.

#### 정적 팩토리 메서드

```javascript
DashboardBusinessException.dataFetchFailed()          // DASH-B01, 500
DashboardBusinessException.statisticsNotAvailable()   // DASH-B02, 503
DashboardBusinessException.widgetNotFound()           // DASH-B03, 404
DashboardBusinessException.widgetConfigInvalid()      // DASH-B04, 400
```

---

## 에러 코드 체계

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DASH 에러 코드 체계                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  DASH-0XX: 인증/세션                                                    │
│  ├── DASH-001: 인증 필요 (401)                                         │
│  ├── DASH-002: 세션 만료 (401)                                         │
│  ├── DASH-003: 유효하지 않은 세션 (401)                                │
│  └── DASH-004: 토큰 만료 (401)                                         │
│                                                                         │
│  DASH-0XX: 권한                                                         │
│  ├── DASH-005: 접근 거부 (403)                                         │
│  └── DASH-006: 스터디 접근 거부 (403)                                  │
│                                                                         │
│  DASH-01X: 리소스                                                       │
│  ├── DASH-010: 리소스 없음 (404)                                       │
│  └── DASH-011: 스터디 없음 (404)                                       │
│                                                                         │
│  DASH-04X: 서버 에러                                                    │
│  ├── DASH-040: 내부 서버 오류 (500)                                    │
│  └── DASH-041: 데이터베이스 오류 (500)                                 │
│                                                                         │
│  DASH-VXX: 유효성 검증                                                  │
│  ├── DASH-V01 ~ V04: 날짜 관련                                         │
│  ├── DASH-V10 ~ V13: 파라미터 타입                                     │
│  └── DASH-V20 ~ V22: 페이지네이션                                      │
│                                                                         │
│  DASH-PXX: 권한                                                         │
│  ├── DASH-P01: 접근 거부                                               │
│  ├── DASH-P02: 스터디 접근 거부                                        │
│  ├── DASH-P03: 관리자 권한 필요                                        │
│  └── DASH-P04: 소유자 권한 필요                                        │
│                                                                         │
│  DASH-BXX: 비즈니스 로직                                                │
│  ├── DASH-B01: 데이터 조회 실패                                        │
│  ├── DASH-B02: 통계 이용 불가                                          │
│  ├── DASH-B03: 위젯 없음                                               │
│  └── DASH-B04: 위젯 설정 유효하지 않음                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## API 에러 핸들러

### withDashboardErrorHandler

API 라우트를 감싸는 에러 핸들러 래퍼입니다.

```javascript
export function withDashboardErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      // DashboardException 계열 처리
      if (error instanceof DashboardException) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.userMessage,
              statusCode: error.statusCode
            }
          },
          { status: error.statusCode }
        )
      }
      
      // Prisma 에러 처리
      if (error.code?.startsWith('P')) {
        const dashboardError = handlePrismaError(error)
        return NextResponse.json(
          { success: false, error: dashboardError },
          { status: dashboardError.statusCode }
        )
      }
      
      // 알 수 없는 에러
      logDashboardError('Unknown error', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DASH-040',
            message: '서버 오류가 발생했습니다',
            statusCode: 500
          }
        },
        { status: 500 }
      )
    }
  }
}
```

### 사용 예시

```javascript
export const GET = withDashboardErrorHandler(async (request) => {
  const session = await getServerSession(authOptions)
  const user = validateSession(session)
  
  // 비즈니스 로직 - 에러 발생 시 자동으로 처리됨
  const data = await getDashboardData(user.id)
  
  return NextResponse.json(
    createSuccessResponse(data),
    { status: 200 }
  )
})
```

---

## 클라이언트 에러 처리

### DashboardErrorBoundary

대시보드 전체를 감싸는 에러 경계입니다.

```jsx
export default class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // 에러 빈도 추적
    const { errorCount, lastErrorTime } = this.state
    const now = Date.now()
    const timeSinceLastError = lastErrorTime ? now - lastErrorTime : Infinity
    const newErrorCount = timeSinceLastError < 60000 ? errorCount + 1 : 1

    this.setState({
      errorInfo,
      errorCount: newErrorCount,
      lastErrorTime: now
    })

    // 에러 로깅
    logDashboardError('렌더링 에러', error, {
      componentStack: errorInfo.componentStack,
      errorCount: newErrorCount,
      userId: this.props.userId
    })
  }

  render() {
    if (this.state.hasError) {
      return <DashboardErrorFallback onRetry={() => this.setState({ hasError: false })} />
    }
    return this.props.children
  }
}
```

### WidgetErrorBoundary

개별 위젯의 에러를 격리합니다.

```jsx
<WidgetErrorBoundary widgetName="스터디 현황">
  <StudyStatus stats={stats} />
</WidgetErrorBoundary>
```

#### 장점

- 한 위젯의 에러가 다른 위젯에 영향을 주지 않음
- 에러 발생 위젯만 폴백 UI 표시
- 대시보드 전체는 정상 동작 유지

---

## 로깅 함수

### logDashboardError

에러 로깅

```javascript
export function logDashboardError(context, error, additionalData = {}) {
  console.error(`❌ [DASHBOARD] ${context}:`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...additionalData
  })
}
```

### logDashboardWarning

경고 로깅

```javascript
export function logDashboardWarning(context, message, additionalData = {}) {
  console.warn(`⚠️ [DASHBOARD] ${context}: ${message}`, {
    timestamp: new Date().toISOString(),
    ...additionalData
  })
}
```

---

## 부분 실패 처리

### Promise.allSettled 패턴

```javascript
const [result1, result2, result3] = await Promise.allSettled([
  query1(),
  query2(),
  query3()
])

const failedQueries = []

const data1 = result1.status === 'fulfilled'
  ? result1.value
  : (() => { failedQueries.push('query1'); return defaultValue1; })()

if (failedQueries.length > 0) {
  logDashboardWarning('부분 쿼리 실패', { failedQueries })
}
```

### createPartialSuccessResponse

```javascript
export function createPartialSuccessResponse(data, failedQueries) {
  return {
    success: true,
    partial: true,
    data,
    warnings: failedQueries.map(q => ({
      query: q,
      message: `${q} 데이터를 불러오지 못했습니다`
    }))
  }
}
```

---

## Prisma 에러 처리

### handlePrismaError

```javascript
export function handlePrismaError(error) {
  switch (error.code) {
    case 'P2002':
      return {
        code: 'DASH-B10',
        message: '중복된 데이터가 존재합니다',
        statusCode: 409
      }
    case 'P2025':
      return {
        code: 'DASH-010',
        message: '데이터를 찾을 수 없습니다',
        statusCode: 404
      }
    default:
      return {
        code: 'DASH-041',
        message: '데이터베이스 오류가 발생했습니다',
        statusCode: 500
      }
  }
}
```

---

## 사용 예시

### API Route

```javascript
export const GET = withDashboardErrorHandler(async (request) => {
  // 세션 검증 - 실패 시 DashboardException 발생
  const session = await getServerSession(authOptions)
  const user = validateSession(session)

  // 쿼리 파라미터 검증 - 실패 시 DashboardValidationException 발생
  const { searchParams } = new URL(request.url)
  const params = validateStatisticsParams({
    type: searchParams.get('type'),
    period: searchParams.get('period')
  })

  // 데이터 조회 - 실패 시 DashboardBusinessException 발생
  const data = await getStatistics(user.id, params)

  return NextResponse.json(
    createSuccessResponse(data),
    { status: 200 }
  )
})
```

### 클라이언트 컴포넌트

```jsx
function DashboardClient({ user }) {
  const { data, isLoading, error } = useDashboard()

  if (error) {
    // React Query가 에러를 잡아서 error 상태로 전달
    return <ErrorState error={error} />
  }

  return (
    <DashboardErrorBoundary userId={user.id}>
      <div className={styles.container}>
        <WidgetErrorBoundary widgetName="스터디 현황">
          <StudyStatus />
        </WidgetErrorBoundary>
        
        <WidgetErrorBoundary widgetName="온라인 멤버">
          <OnlineMembers />
        </WidgetErrorBoundary>
      </div>
    </DashboardErrorBoundary>
  )
}
```

