# CoUp 예외 처리 구현 - Step 7 작업 지침

**작업**: my-studies Phase 3 - 페이지 컴포넌트 예외 처리  
**예상 시간**: 8시간  
**진행률**: 75.6% → 93.3% (34h → 42h / 45h)

---

## 🎯 목표

my-studies 페이지 컴포넌트에 완전한 예외 처리, 로딩 상태, 빈 상태 UI를 구현하여 사용자 경험을 대폭 개선합니다.

---

## 📋 작업 개요

### Phase 3 범위

1. **메인 페이지** (`coup/src/app/my-studies/page.jsx`)
2. **에러 바운더리** (React Query 활용)
3. **로딩 상태** (Skeleton UI)
4. **빈 상태** (필터별 커스텀 메시지)
5. **에러 상태** (재시도 기능)

---

## 📝 상세 작업 계획

### 3.1 STEP-7-PROMPT.md 생성 ✅

**이 파일이 바로 그것입니다!**

---

### 3.2 메인 페이지 개선 (2.5시간)

**파일**: `coup/src/app/my-studies/page.jsx`

#### 현재 상태 분석

**기존 코드**:
```jsx
// 기본적인 로딩/에러 처리만 존재
if (isLoading) {
  return <div className={styles.loading}>내 스터디를 불러오는 중...</div>
}

if (error) {
  return <div className={styles.error}>
    스터디를 불러오는데 실패했습니다. 다시 시도해주세요.
  </div>
}
```

**문제점**:
- ❌ 로딩 중 레이아웃이 깨짐 (Skeleton UI 없음)
- ❌ 에러 메시지가 너무 단순 (재시도 버튼 없음)
- ❌ 무한 로딩 방지 없음
- ❌ 에러 타입별 분기 없음
- ❌ 에러 로깅 없음

#### 개선 내용

##### A. React Query 에러 처리 강화

```jsx
import { useMyStudies } from '@/lib/hooks/useApi'
import { handleReactQueryError, getUserFriendlyError } from '@/lib/exceptions/my-studies-errors'
import { useToast } from '@/components/admin/ui/Toast'

export default function MyStudiesListPage() {
  const { showToast } = useToast()
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false)

  // React Query 설정
  const { data, isLoading, error, refetch, isError } = useMyStudies({
    limit: 1000,
    onError: (error) => {
      // 에러 타입별 처리
      const handledError = handleReactQueryError(error, {
        onNetworkError: () => {
          showToast({
            message: '네트워크 연결을 확인해주세요',
            type: 'error'
          })
        },
        onAuthError: () => {
          showToast({
            message: '로그인이 필요합니다',
            type: 'error'
          })
          router.push('/auth/signin')
        },
        onServerError: () => {
          showToast({
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
            type: 'error'
          })
        }
      })
    },
    retry: 1, // 1회 재시도
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  })

  // 무한 로딩 방지 (10초 타임아웃)
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoadingTimeout(true)
      }, 10000)

      return () => clearTimeout(timer)
    } else {
      setIsLoadingTimeout(false)
    }
  }, [isLoading])

  // ...
}
```

##### B. Skeleton UI 로딩 상태

```jsx
// Skeleton 컴포넌트
function StudyCardSkeleton() {
  return (
    <div className={styles.studyCard} style={{ opacity: 0.7 }}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonBadge} />
        <div className={styles.skeletonTitle} />
      </div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} style={{ width: '80%' }} />
      </div>
      <div className={styles.skeletonActions}>
        <div className={styles.skeletonButton} />
        <div className={styles.skeletonButton} />
        <div className={styles.skeletonButton} />
      </div>
    </div>
  )
}

// 로딩 상태 렌더링
if (isLoading && !isLoadingTimeout) {
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>👥 내 스터디</h1>
            <p className={styles.subtitle}>
              참여 중인 스터디를 관리하고 활동하세요
            </p>
          </div>
        </div>

        <div className={styles.tabs}>
          {['전체', '참여중', '관리중', '대기중'].map((label) => (
            <div key={label} className={styles.skeletonTab} />
          ))}
        </div>

        <div className={styles.studiesList}>
          {[1, 2, 3].map((i) => (
            <StudyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// 타임아웃 발생 시
if (isLoadingTimeout) {
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.timeoutMessage}>
          <div className={styles.timeoutIcon}>⏱️</div>
          <h3>요청 시간이 초과되었습니다</h3>
          <p>네트워크 상태를 확인하고 다시 시도해주세요</p>
          <button onClick={() => refetch()} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    </div>
  )
}
```

##### C. 에러 상태 개선

```jsx
if (isError) {
  const friendlyError = getUserFriendlyError(error)

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            {friendlyError.category === 'NETWORK' ? '🌐' : 
             friendlyError.category === 'AUTH' ? '🔒' : '⚠️'}
          </div>
          <h3 className={styles.errorTitle}>
            {friendlyError.userMessage || '스터디를 불러올 수 없습니다'}
          </h3>
          <p className={styles.errorDescription}>
            {friendlyError.message || '다시 시도해주세요'}
          </p>
          <div className={styles.errorActions}>
            <button 
              onClick={() => refetch()} 
              className={styles.retryButton}
            >
              🔄 다시 시도
            </button>
            <Link href="/studies" className={styles.exploreButton}>
              스터디 둘러보기
            </Link>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className={styles.errorDetails}>
              <summary>개발자 정보</summary>
              <pre>{JSON.stringify(friendlyError, null, 2)}</pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
```

##### D. 빈 상태 개선 (필터별)

```jsx
// 빈 상태 메시지 정의
const EMPTY_MESSAGES = {
  전체: {
    icon: '📚',
    title: '아직 참여 중인 스터디가 없어요',
    description: '지금 바로 관심있는 스터디를 찾아보세요!',
    cta: '스터디 둘러보기'
  },
  참여중: {
    icon: '👤',
    title: '참여 중인 스터디가 없습니다',
    description: '새로운 스터디에 참여하여 함께 공부해보세요',
    cta: '스터디 찾기'
  },
  관리중: {
    icon: '⭐',
    title: '관리 중인 스터디가 없습니다',
    description: '스터디를 만들어 리더가 되어보세요!',
    cta: '스터디 만들기'
  },
  대기중: {
    icon: '⏳',
    title: '승인 대기 중인 스터디가 없습니다',
    description: '관심있는 스터디에 참여 신청을 해보세요',
    cta: '스터디 둘러보기'
  }
}

// 빈 상태 렌더링
if (myStudies.length === 0) {
  const emptyMessage = EMPTY_MESSAGES[activeTab] || EMPTY_MESSAGES['전체']
  
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{emptyMessage.icon}</div>
      <h3 className={styles.emptyTitle}>{emptyMessage.title}</h3>
      <p className={styles.emptyText}>{emptyMessage.description}</p>
      <Link 
        href={activeTab === '관리중' ? '/studies/create' : '/studies'} 
        className={styles.exploreButton}
      >
        {emptyMessage.cta} →
      </Link>
    </div>
  )
}
```

##### E. CSS 스타일 추가

```css
/* Skeleton UI */
.skeletonTab {
  height: 40px;
  width: 100px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

.skeletonBadge {
  height: 24px;
  width: 80px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeletonTitle {
  height: 28px;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-top: 8px;
}

.skeletonLine {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-top: 8px;
}

.skeletonButton {
  height: 36px;
  width: 80px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 타임아웃 메시지 */
.timeoutMessage {
  text-align: center;
  padding: 60px 20px;
}

.timeoutIcon {
  font-size: 64px;
  margin-bottom: 16px;
}

.timeoutMessage h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.timeoutMessage p {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

/* 에러 상태 */
.errorState {
  text-align: center;
  padding: 60px 20px;
  max-width: 500px;
  margin: 0 auto;
}

.errorIcon {
  font-size: 64px;
  margin-bottom: 16px;
}

.errorTitle {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.errorDescription {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

.errorActions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.retryButton {
  padding: 12px 24px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retryButton:hover {
  background: #4338ca;
  transform: translateY(-1px);
}

.errorDetails {
  margin-top: 24px;
  text-align: left;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
}

.errorDetails summary {
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 8px;
}

.errorDetails pre {
  overflow-x: auto;
  white-space: pre-wrap;
}
```

---

### 3.3 헬퍼 함수 추가 (30분)

**파일**: `coup/src/lib/exceptions/my-studies-errors.js`

#### handleReactQueryError 함수

```javascript
/**
 * React Query 에러 처리 헬퍼
 *
 * @param {Error} error - React Query 에러 객체
 * @param {Object} callbacks - 에러 타입별 콜백
 * @param {Function} [callbacks.onNetworkError] - 네트워크 에러 콜백
 * @param {Function} [callbacks.onAuthError] - 인증 에러 콜백
 * @param {Function} [callbacks.onServerError] - 서버 에러 콜백
 * @param {Function} [callbacks.onTimeoutError] - 타임아웃 에러 콜백
 * @returns {Object} 처리된 에러 정보
 *
 * @example
 * handleReactQueryError(error, {
 *   onNetworkError: () => showToast('네트워크 에러'),
 *   onAuthError: () => router.push('/login')
 * })
 */
export function handleReactQueryError(error, callbacks = {}) {
  const {
    onNetworkError,
    onAuthError,
    onServerError,
    onTimeoutError
  } = callbacks

  // 1. 네트워크 에러
  if (!window.navigator.onLine || error.message?.includes('Network')) {
    onNetworkError?.()
    return {
      category: 'NETWORK',
      userMessage: '인터넷 연결을 확인해주세요',
      shouldRetry: true
    }
  }

  // 2. 타임아웃
  if (error.name === 'AbortError' || error.code === 'MYS-103') {
    onTimeoutError?.()
    return {
      category: 'TIMEOUT',
      userMessage: '요청 시간이 초과되었습니다',
      shouldRetry: true
    }
  }

  // 3. 인증 에러 (401, 403)
  if (error.response?.status === 401 || error.response?.status === 403) {
    onAuthError?.()
    return {
      category: 'AUTH',
      userMessage: '로그인이 필요합니다',
      shouldRetry: false
    }
  }

  // 4. 서버 에러 (500+)
  if (error.response?.status >= 500) {
    onServerError?.()
    return {
      category: 'SERVER',
      userMessage: '서버에 일시적인 문제가 발생했습니다',
      shouldRetry: true
    }
  }

  // 5. 일반 에러
  return {
    category: 'GENERAL',
    userMessage: error.response?.data?.error?.userMessage || '문제가 발생했습니다',
    shouldRetry: true
  }
}

/**
 * 사용자 친화적 에러 메시지 추출
 *
 * @param {Error} error - 에러 객체
 * @returns {Object} 사용자 친화적 에러 정보
 *
 * @example
 * const friendly = getUserFriendlyError(error)
 * console.log(friendly.userMessage) // "네트워크 연결을 확인해주세요"
 */
export function getUserFriendlyError(error) {
  // API 응답에서 에러 정보 추출
  const apiError = error?.response?.data?.error

  if (apiError) {
    return {
      code: apiError.code,
      message: apiError.message,
      userMessage: apiError.userMessage,
      category: apiError.category,
      timestamp: apiError.timestamp
    }
  }

  // React Query 에러 처리
  return handleReactQueryError(error)
}
```

---

### 3.4 Toast 컴포넌트 확인 (30분)

**파일**: `coup/src/components/admin/ui/Toast/ToastProvider.js`

Toast 컴포넌트가 이미 존재하는지 확인하고, 필요 시 import 경로를 수정합니다.

**확인 사항**:
- ✅ `useToast` 훅이 존재하는가?
- ✅ `showToast({ message, type })` 형태로 사용 가능한가?
- ✅ ToastProvider가 App에 적용되어 있는가?

**필요 시 수정**:
```jsx
// coup/src/app/providers.js
import { ToastProvider } from '@/components/admin/ui/Toast'

export default function Providers({ children }) {
  return (
    <ToastProvider>
      {/* ...기존 Provider들 */}
      {children}
    </ToastProvider>
  )
}
```

---

## 📊 예상 성과

### 개선 전/후 비교

| 항목 | Before | After |
|-----|--------|-------|
| 로딩 UI | 텍스트만 | Skeleton UI |
| 에러 처리 | 단순 메시지 | 타입별 분기 + 재시도 |
| 빈 상태 | 하나의 메시지 | 필터별 커스텀 |
| 타임아웃 | 없음 | 10초 제한 |
| 에러 로깅 | 없음 | React Query 콜백 |
| 재시도 | 수동 새로고침 | 버튼 클릭 |

### 사용자 경험 개선

- ✅ 로딩 중에도 레이아웃 유지 (Skeleton)
- ✅ 에러 상황에 명확한 안내
- ✅ 한 번의 클릭으로 재시도
- ✅ 필터별 맞춤 빈 상태 메시지
- ✅ 10초 이상 로딩 시 자동 타임아웃

---

## ✅ 완료 조건

### 체크리스트

- [ ] STEP-7-PROMPT.md 생성 완료
- [ ] `page.jsx`에 `handleReactQueryError` import
- [ ] `page.jsx`에 `getUserFriendlyError` import
- [ ] `page.jsx`에 `useToast` import
- [ ] React Query `onError` 콜백 추가
- [ ] 무한 로딩 방지 타임아웃 구현
- [ ] Skeleton UI 로딩 상태 구현
- [ ] 타임아웃 메시지 UI 구현
- [ ] 에러 상태 UI 개선 (아이콘, 재시도 버튼)
- [ ] 필터별 빈 상태 메시지 구현
- [ ] CSS 스타일 추가 (Skeleton, Error, Timeout)
- [ ] `my-studies-errors.js`에 `handleReactQueryError` 함수 추가
- [ ] `my-studies-errors.js`에 `getUserFriendlyError` 함수 추가
- [ ] Toast Provider 확인 및 설정
- [ ] 로컬에서 테스트 (로딩, 에러, 빈 상태)

---

## 🧪 테스트 시나리오

### 수동 테스트

1. **로딩 상태**
   - [ ] 페이지 진입 시 Skeleton UI 표시
   - [ ] 3초 이내 데이터 로드 시 정상 렌더링

2. **타임아웃**
   - [ ] API 응답을 10초 이상 지연시켜 타임아웃 확인
   - [ ] "다시 시도" 버튼 클릭 시 refetch 실행

3. **에러 상태**
   - [ ] 네트워크 끊고 접속 → 네트워크 에러 메시지
   - [ ] 로그아웃 후 접속 → 인증 에러 메시지
   - [ ] API 500 에러 발생 → 서버 에러 메시지

4. **빈 상태**
   - [ ] 전체 탭 - "스터디 둘러보기" CTA
   - [ ] 참여중 탭 - "스터디 찾기" CTA
   - [ ] 관리중 탭 - "스터디 만들기" CTA
   - [ ] 대기중 탭 - "스터디 둘러보기" CTA

5. **Toast 알림**
   - [ ] 에러 발생 시 Toast 표시
   - [ ] 3초 후 자동 사라짐

---

## 🔗 관련 파일

### 수정 대상
- `coup/src/app/my-studies/page.jsx` - 메인 페이지
- `coup/src/app/my-studies/page.module.css` - 스타일
- `coup/src/lib/exceptions/my-studies-errors.js` - 에러 핸들러 추가

### 참조 파일
- `coup/src/lib/validators/my-studies-validation.js` - 유효성 검사
- `coup/src/lib/my-studies-helpers.js` - 헬퍼 함수
- `coup/src/components/admin/ui/Toast/index.js` - Toast 컴포넌트
- `docs/exception/implement/my-studies/STEP-6-COMPLETE-REPORT.md` - Phase 2 완료 보고

---

## 🚀 다음 단계 (Step 8)

### Step 8: my-studies Phase 4 - 스터디 상세 페이지 (5.5시간)

1. **스터디 상세 페이지** (`[studyId]/page.jsx`)
2. **탭 전환 에러 처리**
3. **권한별 UI 분기**
4. **404 페이지**
5. **접근 권한 체크**

---

**작성일**: 2025-12-01  
**작성자**: GitHub Copilot  
**버전**: 1.0

