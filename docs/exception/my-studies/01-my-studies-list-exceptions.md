# 내 스터디 목록 예외 처리

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**대상 파일**: `src/app/my-studies/page.jsx`  
**API 엔드포인트**: `GET /api/my-studies`

---

## 📚 목차

1. [개요](#개요)
2. [데이터 로딩 예외](#데이터-로딩-예외)
3. [빈 상태 처리](#빈-상태-처리)
4. [필터링 예외](#필터링-예외)
5. [페이지네이션 예외](#페이지네이션-예외)
6. [역할 배지 표시 예외](#역할-배지-표시-예외)
7. [카드 렌더링 예외](#카드-렌더링-예외)
8. [네비게이션 예외](#네비게이션-예외)
9. [성능 최적화](#성능-최적화)
10. [테스트 시나리오](#테스트-시나리오)

---

## 개요

### 기능 설명

**내 스터디 목록**은 사용자가 **참여하고 있는 모든 스터디**를 조회하고 관리하는 페이지입니다.

### 주요 기능

1. **스터디 목록 조회**: useMyStudies 훅으로 API 호출
2. **탭별 필터링**: 전체, 참여중, 관리중, 대기중
3. **역할 배지**: OWNER, ADMIN, MEMBER, PENDING
4. **페이지네이션**: 5개씩 클라이언트 측 페이징
5. **빠른 액션**: 채팅, 공지, 파일, 캘린더 바로가기

### 데이터 흐름

```
사용자 → useMyStudies() → GET /api/my-studies
                              ↓
                         Prisma 쿼리
                              ↓
                      StudyMember + Study
                              ↓
                         React Query
                              ↓
                      클라이언트 필터링
                              ↓
                      클라이언트 페이징
                              ↓
                           UI 렌더링
```

---

## 데이터 로딩 예외

### 1.1 API 호출 실패

#### 증상
- "스터디를 불러오는데 실패했습니다" 메시지 표시
- 빈 화면
- 로딩 상태에서 멈춤

#### 원인
1. **네트워크 오류**: 인터넷 연결 끊김
2. **서버 오류**: 500 Internal Server Error
3. **인증 오류**: 세션 만료, 로그아웃 상태
4. **타임아웃**: 응답 시간 초과

#### 현재 코드

```javascript
// ❌ 문제: 에러 상태만 표시, 재시도 없음
const { data, isLoading, error } = useMyStudies({ limit: 1000 })

if (error) {
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.error}>
          스터디를 불러오는데 실패했습니다. 다시 시도해주세요.
        </div>
      </div>
    </div>
  )
}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 에러 상세 정보 + 재시도 버튼
const { data, isLoading, error, refetch } = useMyStudies({ limit: 1000 })

if (error) {
  const errorMessage = error.response?.status === 401
    ? '로그인이 필요합니다'
    : error.response?.status === 500
    ? '서버 오류가 발생했습니다'
    : error.message === 'Network Error'
    ? '네트워크 연결을 확인해주세요'
    : '스터디를 불러오는데 실패했습니다'

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>{errorMessage}</h3>
          <p className={styles.errorDescription}>
            {error.response?.status === 401
              ? '다시 로그인해주세요'
              : '잠시 후 다시 시도해주세요'}
          </p>
          <div className={styles.errorActions}>
            <button onClick={() => refetch()} className={styles.retryButton}>
              🔄 다시 시도
            </button>
            {error.response?.status === 401 && (
              <Link href="/login" className={styles.loginButton}>
                로그인하기
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### API 수정 (서버 측)

```javascript
// src/app/api/my-studies/route.js
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 타임아웃 설정 (10초)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    )

    const queryPromise = prisma.studyMember.findMany({
      where: {
        userId,
        deletedAt: null, // 탈퇴한 스터디 제외
      },
      include: {
        study: {
          select: {
            id: true,
            name: true,
            description: true,
            emoji: true,
            category: true,
            currentMembers: true,
            maxMembers: true,
            isPublic: true,
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    const members = await Promise.race([queryPromise, timeoutPromise])

    // 삭제된 스터디 필터링
    const activeMembers = members.filter(m => m.study && !m.study.deletedAt)

    return NextResponse.json({
      success: true,
      data: activeMembers
    })

  } catch (error) {
    console.error('Get my studies error:', error)
    
    if (error.message === 'Request timeout') {
      return NextResponse.json(
        { error: "요청 시간이 초과되었습니다" },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: "스터디 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

### 1.2 로딩 상태 처리

#### 증상
- 데이터 로딩 중 빈 화면
- "내 스터디를 불러오는 중..." 텍스트만 표시
- 사용자가 로딩 중인지 알기 어려움

#### 현재 코드

```javascript
// ❌ 문제: 간단한 텍스트만 표시
if (isLoading) {
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.loading}>내 스터디를 불러오는 중...</div>
      </div>
    </div>
  )
}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 스켈레톤 UI
if (isLoading) {
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* 헤더 스켈레톤 */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonSubtitle}></div>
          </div>
          <div className={styles.skeletonButton}></div>
        </div>

        {/* 탭 스켈레톤 */}
        <div className={styles.tabs}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.skeletonTab}></div>
          ))}
        </div>

        {/* 카드 스켈레톤 */}
        <div className={styles.studiesList}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonCardHeader}></div>
              <div className={styles.skeletonCardContent}></div>
              <div className={styles.skeletonCardFooter}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### 스켈레톤 CSS

```css
/* page.module.css */
.skeletonTitle {
  width: 200px;
  height: 32px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

.skeletonCard {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: white;
}

.skeletonCardHeader {
  width: 100%;
  height: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 12px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 빈 상태 처리

### 2.1 스터디 없음 (신규 사용자)

#### 증상
- 가입 직후 내 스터디 페이지 접근
- 빈 화면
- 사용자가 다음 행동을 모름

#### 현재 코드

```javascript
// ✅ 이미 좋은 예: 빈 상태 안내
{myStudies.length === 0 ? (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📚</div>
    <h3 className={styles.emptyTitle}>아직 참여 중인 스터디가 없어요</h3>
    <p className={styles.emptyText}>
      지금 바로 관심있는 스터디를 찾아보세요!
    </p>
    <Link href="/studies" className={styles.exploreButton}>
      스터디 둘러보기 →
    </Link>
  </div>
) : (
  // 스터디 목록
)}
```

#### 추가 개선 (온보딩 팁)

```javascript
// ✅ 더 좋은 예: 온보딩 가이드 추가
{myStudies.length === 0 ? (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📚</div>
    <h3 className={styles.emptyTitle}>아직 참여 중인 스터디가 없어요</h3>
    <p className={styles.emptyText}>
      지금 바로 관심있는 스터디를 찾아보세요!
    </p>
    
    {/* 빠른 시작 가이드 */}
    <div className={styles.quickStart}>
      <h4>빠른 시작 가이드</h4>
      <ol className={styles.guideList}>
        <li>
          <strong>스터디 탐색하기</strong>
          <p>카테고리별로 다양한 스터디를 둘러보세요</p>
        </li>
        <li>
          <strong>가입 신청하기</strong>
          <p>관심있는 스터디에 가입 신청을 보내세요</p>
        </li>
        <li>
          <strong>직접 만들기</strong>
          <p>원하는 스터디가 없다면 직접 만들어보세요</p>
        </li>
      </ol>
    </div>

    <div className={styles.emptyActions}>
      <Link href="/studies" className={styles.primaryButton}>
        스터디 둘러보기 →
      </Link>
      <Link href="/studies/create" className={styles.secondaryButton}>
        스터디 만들기
      </Link>
    </div>
  </div>
) : (
  // 스터디 목록
)}
```

---

### 2.2 탭별 빈 상태

#### 증상
- "참여중", "관리중", "대기중" 탭에 스터디 없음
- 사용자가 혼란스러워함

#### 문제 코드

```javascript
// ❌ 문제: 모든 탭에서 동일한 빈 상태 메시지
{myStudies.length === 0 ? (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📚</div>
    <h3 className={styles.emptyTitle}>아직 참여 중인 스터디가 없어요</h3>
  </div>
) : (
  // ...
)}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 탭별 맞춤 메시지
{myStudies.length === 0 ? (
  <div className={styles.emptyState}>
    {activeTab === '전체' && (
      <>
        <div className={styles.emptyIcon}>📚</div>
        <h3 className={styles.emptyTitle}>아직 참여 중인 스터디가 없어요</h3>
        <p className={styles.emptyText}>지금 바로 관심있는 스터디를 찾아보세요!</p>
        <Link href="/studies" className={styles.exploreButton}>
          스터디 둘러보기 →
        </Link>
      </>
    )}
    {activeTab === '참여중' && (
      <>
        <div className={styles.emptyIcon}>👤</div>
        <h3 className={styles.emptyTitle}>일반 멤버로 참여 중인 스터디가 없어요</h3>
        <p className={styles.emptyText}>
          관리중인 스터디는 "관리중" 탭에서 확인하세요
        </p>
      </>
    )}
    {activeTab === '관리중' && (
      <>
        <div className={styles.emptyIcon}>⭐</div>
        <h3 className={styles.emptyTitle}>관리 중인 스터디가 없어요</h3>
        <p className={styles.emptyText}>
          스터디를 만들어서 리더가 되어보세요!
        </p>
        <Link href="/studies/create" className={styles.createButton}>
          스터디 만들기 →
        </Link>
      </>
    )}
    {activeTab === '대기중' && (
      <>
        <div className={styles.emptyIcon}>⏳</div>
        <h3 className={styles.emptyTitle}>승인 대기 중인 스터디가 없어요</h3>
        <p className={styles.emptyText}>
          가입 신청 후 관리자의 승인을 기다리는 스터디가 표시됩니다
        </p>
      </>
    )}
  </div>
) : (
  // 스터디 목록
)}
```

---

## 필터링 예외

### 3.1 클라이언트 측 필터링 오류

#### 증상
- 탭 전환 시 잘못된 스터디 표시
- 역할 분류 오류

#### 현재 코드

```javascript
// ❌ 문제: role 필드가 없거나 잘못된 경우 처리 안됨
const getFilteredStudies = () => {
  switch (activeTab) {
    case '참여중':
      return allStudies.filter(s => s.role === 'MEMBER')
    case '관리중':
      return allStudies.filter(s => ['OWNER', 'ADMIN'].includes(s.role))
    case '대기중':
      return allStudies.filter(s => s.role === 'PENDING')
    case '전체':
    default:
      return allStudies
  }
}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 안전한 필터링
const getFilteredStudies = () => {
  // 유효한 스터디만 필터링 (study 데이터 있고, deletedAt 없음)
  const validStudies = allStudies.filter(s => 
    s && 
    s.study && 
    !s.study.deletedAt && 
    s.role // role 필드 필수
  )

  switch (activeTab) {
    case '참여중':
      // MEMBER만 (OWNER, ADMIN 제외)
      return validStudies.filter(s => s.role === 'MEMBER')
    
    case '관리중':
      // OWNER 또는 ADMIN
      return validStudies.filter(s => ['OWNER', 'ADMIN'].includes(s.role))
    
    case '대기중':
      // PENDING (승인 대기 중)
      return validStudies.filter(s => s.role === 'PENDING')
    
    case '전체':
    default:
      // PENDING 제외 (전체 = 활성 멤버십만)
      return validStudies.filter(s => s.role !== 'PENDING')
  }
}
```

---

### 3.2 탭 카운트 불일치

#### 증상
- 탭 레이블의 숫자와 실제 표시되는 스터디 수 다름
- 필터링 후 카운트 업데이트 안됨

#### 문제 코드

```javascript
// ❌ 문제: 탭 카운트 계산 시 유효성 검사 없음
const tabs = [
  { label: '전체', count: allStudies.length },
  { label: '참여중', count: allStudies.filter(s => s.role === 'MEMBER').length },
  { label: '관리중', count: allStudies.filter(s => ['OWNER', 'ADMIN'].includes(s.role)).length },
  { label: '대기중', count: allStudies.filter(s => s.role === 'PENDING').length },
]
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 유효한 스터디만 카운트
const validStudies = allStudies.filter(s => 
  s && 
  s.study && 
  !s.study.deletedAt && 
  s.role
)

const tabs = [
  { 
    label: '전체', 
    count: validStudies.filter(s => s.role !== 'PENDING').length 
  },
  { 
    label: '참여중', 
    count: validStudies.filter(s => s.role === 'MEMBER').length 
  },
  { 
    label: '관리중', 
    count: validStudies.filter(s => ['OWNER', 'ADMIN'].includes(s.role)).length 
  },
  { 
    label: '대기중', 
    count: validStudies.filter(s => s.role === 'PENDING').length 
  },
]
```

---

## 페이지네이션 예외

### 4.1 페이지 계산 오류

#### 증상
- 마지막 페이지에 항목 없음
- 페이지 번호 클릭 시 빈 화면
- totalPages 계산 오류

#### 현재 코드

```javascript
// ⚠️ 주의: 필터링 변경 시 currentPage 초기화 필요
const filteredStudies = getFilteredStudies()

const totalPages = Math.ceil(filteredStudies.length / itemsPerPage)
const startIndex = (currentPage - 1) * itemsPerPage
const endIndex = startIndex + itemsPerPage
const myStudies = filteredStudies.slice(startIndex, endIndex)
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 페이지 범위 검증
const filteredStudies = getFilteredStudies()

const totalPages = Math.max(1, Math.ceil(filteredStudies.length / itemsPerPage))

// 현재 페이지가 범위를 벗어나면 1페이지로 리셋
useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(1)
  }
}, [currentPage, totalPages])

const startIndex = (currentPage - 1) * itemsPerPage
const endIndex = Math.min(startIndex + itemsPerPage, filteredStudies.length)
const myStudies = filteredStudies.slice(startIndex, endIndex)

// 빈 결과 처리
if (filteredStudies.length > 0 && myStudies.length === 0) {
  // 페이지 범위 오류 - 1페이지로 이동
  setCurrentPage(1)
}
```

---

### 4.2 탭 전환 시 페이지 상태

#### 증상
- 탭 전환 시 이전 페이지 번호 유지
- 새 탭에 해당 페이지 없음 (빈 화면)

#### 개선 코드

```javascript
// ✅ 좋은 예: 탭 전환 시 페이지 리셋
<button
  key={tab.label}
  className={`${styles.tab} ${activeTab === tab.label ? styles.active : ''}`}
  onClick={() => {
    setActiveTab(tab.label)
    setCurrentPage(1) // 페이지 리셋
  }}
>
  {tab.label} {tab.count > 0 && <span className={styles.tabCount}>{tab.count}</span>}
</button>
```

---

## 역할 배지 표시 예외

### 5.1 알 수 없는 역할

#### 증상
- role 필드가 null, undefined, 또는 예상치 못한 값
- 배지 표시 안됨 또는 기본값으로 표시

#### 현재 코드

```javascript
// ⚠️ 주의: 기본값만 처리
const getRoleBadge = (role) => {
  const badges = {
    OWNER: { label: 'OWNER', icon: '👑', color: 'owner' },
    ADMIN: { label: 'ADMIN', icon: '⭐', color: 'admin' },
    MEMBER: { label: 'MEMBER', icon: '👤', color: 'member' },
    PENDING: { label: 'PENDING', icon: '⏳', color: 'pending' },
  }
  return badges[role] || badges.MEMBER
}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 로깅 + 기본값
const getRoleBadge = (role) => {
  const badges = {
    OWNER: { label: 'OWNER', icon: '👑', color: 'owner' },
    ADMIN: { label: 'ADMIN', icon: '⭐', color: 'admin' },
    MEMBER: { label: 'MEMBER', icon: '👤', color: 'member' },
    PENDING: { label: 'PENDING', icon: '⏳', color: 'pending' },
  }

  if (!role) {
    console.error('[getRoleBadge] role is undefined or null')
    return { label: 'UNKNOWN', icon: '❓', color: 'unknown' }
  }

  if (!badges[role]) {
    console.error(`[getRoleBadge] Unknown role: ${role}`)
    return { label: role, icon: '❓', color: 'unknown' }
  }

  return badges[role]
}
```

---

## 카드 렌더링 예외

### 6.1 고유 키 문제

#### 증상
- React 경고: "Each child in a list should have a unique key"
- 카드 업데이트 시 잘못된 카드 렌더링

#### 현재 코드

```javascript
// ✅ 이미 안전한 키 생성
{myStudies.map((study, index) => {
  const uniqueKey = study.id || study.studyId || `study-${index}`
  
  return (
    <Link key={uniqueKey} href={`/my-studies/${study.study?.id || study.studyId}`}>
      {/* ... */}
    </Link>
  )
})}
```

---

### 6.2 데이터 누락 처리

#### 증상
- study.study가 null/undefined
- 스터디 이름, 설명 등 표시 안됨

#### 문제 코드

```javascript
// ❌ 문제: study.study 없으면 오류
<h3 className={styles.studyName}>{study.study.name}</h3>
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 옵셔널 체이닝 + 기본값
<div className={styles.emoji}>{study.study?.emoji || '📚'}</div>
<h3 className={styles.studyName}>{study.study?.name || '스터디'}</h3>
<p className={styles.description}>{study.study?.description || '설명 없음'}</p>
<span className={styles.members}>
  👥 {study.study?.currentMembers || 0}/{study.study?.maxMembers || 0}명
</span>
```

---

## 네비게이션 예외

### 7.1 잘못된 스터디 ID

#### 증상
- 클릭 시 404 페이지
- 스터디 상세 페이지 접근 불가

#### 문제 코드

```javascript
// ❌ 문제: study.studyId가 없으면 /my-studies/undefined
<Link href={`/my-studies/${study.studyId}`}>
```

#### 개선 코드

```javascript
// ✅ 좋은 예: ID 검증 + 폴백
const studyId = study.study?.id || study.studyId
const isValidId = studyId && !isNaN(Number(studyId))

if (!isValidId) {
  console.error('[MyStudyCard] Invalid study ID:', study)
  return null // 카드 렌더링 안함
}

return (
  <Link href={`/my-studies/${studyId}`} className={styles.studyCard}>
    {/* ... */}
  </Link>
)
```

---

### 7.2 빠른 액션 버튼 클릭

#### 증상
- 빠른 액션 버튼 클릭 시 카드 전체 Link 작동
- 의도한 페이지로 이동 안됨

#### 현재 코드

```javascript
// ⚠️ 주의: preventDefault만 호출
<button
  className={styles.actionButton}
  onClick={(e) => e.preventDefault()}
>
  {action.label}
</button>
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 실제 네비게이션
<button
  className={styles.actionButton}
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/my-studies/${studyId}/${action.id}`)
  }}
>
  {action.label}
</button>
```

---

## 성능 최적화

### 8.1 대량 데이터 처리

#### 문제
- limit: 1000으로 전체 데이터 가져오기
- 클라이언트 측 필터링/페이징
- 스터디 100개 이상 시 느림

#### 개선 방안

**옵션 1: 서버 측 페이징**

```javascript
// 클라이언트
const { data, isLoading } = useMyStudies({
  page: currentPage,
  limit: itemsPerPage,
  role: activeTab === '참여중' ? 'MEMBER' : activeTab === '관리중' ? 'ADMIN,OWNER' : undefined
})

// 서버 (src/app/api/my-studies/route.js)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '5')
  const role = searchParams.get('role') // 'MEMBER' | 'ADMIN,OWNER' | undefined

  const skip = (page - 1) * limit

  let whereClause = {
    userId,
    deletedAt: null
  }

  if (role) {
    const roles = role.split(',')
    whereClause.role = { in: roles }
  }

  const total = await prisma.studyMember.count({ where: whereClause })

  const members = await prisma.studyMember.findMany({
    where: whereClause,
    skip,
    take: limit,
    include: { study: true },
    orderBy: { joinedAt: 'desc' }
  })

  return NextResponse.json({
    success: true,
    data: members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}
```

**옵션 2: 무한 스크롤**

```javascript
import { useInfiniteQuery } from '@tanstack/react-query'

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['myStudies', activeTab],
  queryFn: ({ pageParam = 1 }) => 
    fetch(`/api/my-studies?page=${pageParam}&limit=10&role=${getRoleParam()}`)
      .then(res => res.json()),
  getNextPageParam: (lastPage) => 
    lastPage.pagination.page < lastPage.pagination.totalPages 
      ? lastPage.pagination.page + 1 
      : undefined
})

// 스크롤 감지
useEffect(() => {
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
  }

  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [hasNextPage, isFetchingNextPage, fetchNextPage])
```

---

### 8.2 React.memo 최적화

```javascript
// StudyCard를 별도 컴포넌트로 분리
import React from 'react'

const MyStudyCard = React.memo(({ study, onQuickAction }) => {
  const badge = getRoleBadge(study.role)
  const studyId = study.study?.id || study.studyId

  return (
    <Link href={`/my-studies/${studyId}`} className={styles.studyCard}>
      {/* 카드 내용 */}
    </Link>
  )
})

MyStudyCard.displayName = 'MyStudyCard'

export default MyStudyCard
```

---

## 테스트 시나리오

### 단위 테스트

```javascript
// __tests__/my-studies-list.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyStudiesListPage from '@/app/my-studies/page'

describe('MyStudiesListPage', () => {
  it('로딩 상태를 표시한다', () => {
    render(<MyStudiesListPage />)
    expect(screen.getByText(/내 스터디를 불러오는 중/)).toBeInTheDocument()
  })

  it('에러 상태를 표시하고 재시도 버튼을 제공한다', async () => {
    // Mock API 에러
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

    render(<MyStudiesListPage />)

    await waitFor(() => {
      expect(screen.getByText(/스터디를 불러오는데 실패했습니다/)).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /다시 시도/ })
    expect(retryButton).toBeInTheDocument()
  })

  it('스터디 목록을 표시한다', async () => {
    const mockStudies = [
      { id: 1, study: { name: '알고리즘 스터디', emoji: '💻' }, role: 'MEMBER' },
      { id: 2, study: { name: '영어 회화', emoji: '🗣️' }, role: 'OWNER' }
    ]

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockStudies })
    })

    render(<MyStudiesListPage />)

    await waitFor(() => {
      expect(screen.getByText('알고리즘 스터디')).toBeInTheDocument()
      expect(screen.getByText('영어 회화')).toBeInTheDocument()
    })
  })

  it('탭 전환이 작동한다', async () => {
    render(<MyStudiesListPage />)

    const 참여중Tab = screen.getByRole('button', { name: /참여중/ })
    await userEvent.click(참여중Tab)

    // 필터링된 결과 확인
    // ...
  })

  it('페이지네이션이 작동한다', async () => {
    // 10개 스터디 (페이지당 5개)
    const mockStudies = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      study: { name: `스터디 ${i + 1}` },
      role: 'MEMBER'
    }))

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockStudies })
    })

    render(<MyStudiesListPage />)

    await waitFor(() => {
      expect(screen.getByText('스터디 1')).toBeInTheDocument()
    })

    const page2Button = screen.getByRole('button', { name: '2' })
    await userEvent.click(page2Button)

    expect(screen.getByText('스터디 6')).toBeInTheDocument()
  })

  it('빈 상태를 표시한다', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] })
    })

    render(<MyStudiesListPage />)

    await waitFor(() => {
      expect(screen.getByText(/아직 참여 중인 스터디가 없어요/)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /스터디 둘러보기/ })).toBeInTheDocument()
    })
  })
})
```

---

## 관련 문서

- [INDEX.md](./INDEX.md) - 색인
- [02-study-detail-exceptions.md](./02-study-detail-exceptions.md) - 스터디 상세 예외
- [../auth/02-session-exceptions.md](../auth/02-session-exceptions.md) - 세션 예외

---

**다음 문서**: [02-study-detail-exceptions.md](./02-study-detail-exceptions.md)  
**이전 문서**: [INDEX.md](./INDEX.md)

