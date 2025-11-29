# 스터디 상세 페이지 (대시보드) 예외 처리

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**대상 파일**: `src/app/my-studies/[studyId]/page.jsx`  
**API 엔드포인트**: 
- `GET /api/studies/[id]`
- `GET /api/studies/[id]/notices`

---

## 📚 목차

1. [개요](#개요)
2. [스터디 로딩 예외](#스터디-로딩-예외)
3. [권한 검증 예외](#권한-검증-예외)
4. [탭 시스템 예외](#탭-시스템-예외)
5. [위젯 데이터 예외](#위젯-데이터-예외)
6. [통계 계산 예외](#통계-계산-예외)
7. [UI 렌더링 예외](#ui-렌더링-예외)
8. [네비게이션 예외](#네비게이션-예외)
9. [테스트 시나리오](#테스트-시나리오)

---

## 개요

### 기능 설명

**스터디 대시보드(개요)**는 스터디 멤버가 **스터디 내부에 진입했을 때** 가장 먼저 보는 페이지입니다. 이번 주 활동 요약, 최근 공지, 파일, 일정, 할일 등을 한눈에 볼 수 있습니다.

### 주요 기능

1. **스터디 헤더**: 이름, 이모지, 멤버 수, 내 역할
2. **탭 네비게이션**: 개요, 채팅, 공지, 파일, 캘린더, 할일, 화상, 멤버, 설정
3. **이번 주 활동 요약**: 출석률, 할일 완료율, 메시지/공지/파일 수
4. **스터디 소개**: 설명, 카테고리, 태그
5. **최근 공지**: 최근 3개
6. **최근 파일**: 최근 파일 목록 (현재 빈 배열)
7. **다가오는 일정**: 향후 7일 일정 (현재 빈 배열)
8. **긴급 할일**: 마감 임박 할일 (현재 빈 배열)
9. **우측 위젯**: 스터디 현황, 빠른 액션

### 데이터 흐름

```
사용자 → useStudy(studyId) → GET /api/studies/[id]
                               ↓
                          Prisma 쿼리
                               ↓
                       Study + myRole
                               ↓
                          React Query
                               ↓
                          위젯 렌더링
```

---

## 스터디 로딩 예외

### 1.1 스터디를 찾을 수 없음

#### 증상
- "스터디를 찾을 수 없습니다" 메시지
- 404 페이지

#### 원인
1. **잘못된 studyId**: URL에 존재하지 않는 ID
2. **삭제된 스터디**: study.deletedAt !== null
3. **멤버 권한 없음**: StudyMember 레코드 없음
4. **API 오류**: 서버 응답 실패

#### 현재 코드

```javascript
// ❌ 문제: 원인을 알 수 없음
if (!study) {
  return (
    <div className={styles.container}>
      <div className={styles.error}>스터디를 찾을 수 없습니다.</div>
    </div>
  )
}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 원인별 메시지
const { data: studyData, isLoading, error } = useStudy(studyId)
const study = studyData?.data

if (isLoading) {
  return <StudyDashboardSkeleton />
}

if (error) {
  const status = error.response?.status
  
  return (
    <div className={styles.container}>
      <div className={styles.error}>
        <div className={styles.errorIcon}>
          {status === 403 ? '🔒' : status === 404 ? '🔍' : '⚠️'}
        </div>
        <h3 className={styles.errorTitle}>
          {status === 403 
            ? '접근 권한이 없습니다' 
            : status === 404 
            ? '스터디를 찾을 수 없습니다'
            : '스터디를 불러올 수 없습니다'}
        </h3>
        <p className={styles.errorDescription}>
          {status === 403 
            ? '이 스터디의 멤버가 아니거나 승인 대기 중입니다'
            : status === 404 
            ? '삭제되었거나 존재하지 않는 스터디입니다'
            : '잠시 후 다시 시도해주세요'}
        </p>
        <div className={styles.errorActions}>
          <Link href="/my-studies" className={styles.backButton}>
            ← 내 스터디 목록
          </Link>
          {status !== 404 && status !== 403 && (
            <button onClick={() => refetch()} className={styles.retryButton}>
              🔄 다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

if (!study) {
  // API 성공했지만 데이터 없음
  return (
    <div className={styles.container}>
      <div className={styles.error}>
        <div className={styles.errorIcon}>🔍</div>
        <h3 className={styles.errorTitle}>스터디 정보가 없습니다</h3>
        <p className={styles.errorDescription}>
          스터디 데이터를 확인할 수 없습니다
        </p>
        <Link href="/my-studies" className={styles.backButton}>
          ← 내 스터디 목록
        </Link>
      </div>
    </div>
  )
}
```

---

### 1.2 로딩 상태 처리

#### 스켈레톤 컴포넌트

```javascript
// src/components/study/StudyDashboardSkeleton.jsx
export default function StudyDashboardSkeleton() {
  return (
    <div className={styles.container}>
      {/* 헤더 스켈레톤 */}
      <div className={styles.header}>
        <div className={styles.skeletonBackButton}></div>
        <div className={styles.studyHeader}>
          <div className={styles.skeletonStudyInfo}></div>
        </div>
      </div>

      {/* 탭 스켈레톤 */}
      <div className={styles.tabs}>
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className={styles.skeletonTab}></div>
        ))}
      </div>

      {/* 메인 콘텐츠 스켈레톤 */}
      <div className={styles.mainContent}>
        <div className={styles.leftSection}>
          {/* 활동 요약 스켈레톤 */}
          <div className={styles.skeletonWidget}></div>
          {/* 그리드 스켈레톤 */}
          <div className={styles.grid}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={styles.skeletonCard}></div>
            ))}
          </div>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.skeletonWidget}></div>
          <div className={styles.skeletonWidget}></div>
        </div>
      </div>
    </div>
  )
}
```

---

## 권한 검증 예외

### 2.1 멤버 권한 없음

#### 증상
- PENDING 상태 사용자 접근
- 탈퇴한 사용자 접근
- 강퇴된 사용자 접근

#### API 권한 검증

```javascript
// src/app/api/studies/[id]/route.js
import { requireStudyMember } from "@/lib/auth-helpers"

export async function GET(request, { params }) {
  const { id: studyId } = await params

  // 멤버 권한 검증
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member, study } = result

  // PENDING 상태 체크
  if (member.role === 'PENDING') {
    return NextResponse.json(
      { error: "가입 승인 대기 중입니다" },
      { status: 403 }
    )
  }

  // 삭제된 스터디 체크
  if (study.deletedAt) {
    return NextResponse.json(
      { error: "삭제된 스터디입니다" },
      { status: 404 }
    )
  }

  // 주간 통계 계산
  const weeklyStats = await calculateWeeklyStats(studyId, member.userId)

  return NextResponse.json({
    success: true,
    data: {
      ...study,
      myRole: member.role,
      weeklyStats
    }
  })
}
```

---

### 2.2 역할 기반 UI 표시

#### 문제 코드

```javascript
// ❌ 문제: myRole이 undefined일 수 있음
{['OWNER', 'ADMIN'].includes(study.myRole) && (
  <Link href={`/my-studies/${studyId}/settings`}>설정</Link>
)}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 안전한 권한 체크
const isAdmin = study?.myRole && ['OWNER', 'ADMIN'].includes(study.myRole)
const isOwner = study?.myRole === 'OWNER'

{isAdmin && (
  <Link href={`/my-studies/${studyId}/members`} className={styles.widgetButton}>
    👥 멤버 관리
  </Link>
)}

{isOwner && (
  <Link href={`/my-studies/${studyId}/settings`} className={styles.widgetButton}>
    ⚙️ 설정
  </Link>
)}
```

---

## 탭 시스템 예외

### 3.1 권한 없는 탭 접근

#### 증상
- MEMBER가 "멤버" 탭 접근
- MEMBER/ADMIN이 "설정" 탭 접근

#### StudyTabs 컴포넌트

```javascript
// src/components/study/StudyTabs.jsx
export default function StudyTabs({ studyId, activeTab, userRole }) {
  const tabs = [
    { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
    { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
    { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
    { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
    { label: '캘린더', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
    { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
    { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
    { label: '멤버', href: `/my-studies/${studyId}/members`, icon: '👥', adminOnly: true },
    { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️', ownerOnly: true },
  ]

  // 권한 필터링
  const visibleTabs = tabs.filter(tab => {
    if (tab.ownerOnly) return userRole === 'OWNER'
    if (tab.adminOnly) return ['OWNER', 'ADMIN'].includes(userRole)
    return true
  })

  return (
    <div className={styles.tabs}>
      {visibleTabs.map(tab => (
        <Link
          key={tab.label}
          href={tab.href}
          className={`${styles.tab} ${activeTab === tab.label ? styles.active : ''}`}
        >
          {tab.icon} {tab.label}
        </Link>
      ))}
    </div>
  )
}
```

---

### 3.2 탭 전환 시 데이터 갱신

#### 문제: 탭 전환해도 데이터 안 바뀜

```javascript
// ❌ 문제: 탭 전환 시 캐시 사용
const { data } = useNotices(studyId)
```

#### 개선: refetchOnMount

```javascript
// ✅ 좋은 예: 탭 전환 시 자동 갱신
const { data } = useNotices(studyId, {
  refetchOnMount: 'always', // 탭 진입 시 항상 새로고침
  staleTime: 30000, // 30초 동안은 fresh
})
```

---

## 위젯 데이터 예외

### 4.1 최근 공지 위젯

#### 증상
- 공지 로딩 실패
- 공지 없음
- 작성자 정보 없음

#### 현재 코드

```javascript
// ⚠️ 주의: 공지 없음 처리는 OK, 로딩 실패 처리 없음
const { data: noticesData, isLoading: isNoticesLoading } = useNotices(studyId, { limit: 3 })
const recentNotices = noticesData?.data || []

{recentNotices.length === 0 ? (
  <p className={styles.emptyText}>최근 공지가 없습니다</p>
) : (
  recentNotices.map((notice) => (
    <Link href={`/my-studies/${studyId}/announcements/${notice.id}`} key={notice.id}>
      <span>{notice.title}</span>
      <span>{notice.author?.name || '작성자'} · {formatDateTimeKST(notice.createdAt)}</span>
    </Link>
  ))
)}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 로딩/에러 상태 추가
const { data: noticesData, isLoading: isNoticesLoading, error: noticesError } = useNotices(studyId, { limit: 3 })
const recentNotices = noticesData?.data || []

<div className={styles.gridCard}>
  <div className={styles.cardHeader}>
    <h3 className={styles.cardTitle}>📢 최근 공지</h3>
    <Link href={`/my-studies/${studyId}/notices`} className={styles.moreLink}>
      전체보기 →
    </Link>
  </div>
  <div className={styles.listItems}>
    {isNoticesLoading ? (
      // 로딩 스켈레톤
      <div className={styles.widgetLoading}>
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.skeletonListItem}></div>
        ))}
      </div>
    ) : noticesError ? (
      // 에러 상태
      <div className={styles.widgetError}>
        <p>공지를 불러올 수 없습니다</p>
        <button onClick={() => refetch()}>다시 시도</button>
      </div>
    ) : recentNotices.length === 0 ? (
      // 빈 상태
      <p className={styles.emptyText}>최근 공지가 없습니다</p>
    ) : (
      // 정상 렌더링
      recentNotices.map((notice) => (
        <Link 
          href={`/my-studies/${studyId}/announcements/${notice.id}`} 
          key={notice.id} 
          className={styles.listItemLink}
        >
          <div className={styles.itemContent}>
            <span className={styles.itemTitle}>{notice.title}</span>
            <span className={styles.itemMeta}>
              {notice.author?.name || '익명'} · {formatDateTimeKST(notice.createdAt)}
            </span>
          </div>
          {notice.isPinned && <span className={styles.pinnedBadge}>📌</span>}
        </Link>
      ))
    )}
  </div>
</div>
```

---

### 4.2 최근 파일/일정/할일 위젯

#### 현재 상태
- `recentFiles = []`
- `upcomingEvents = []`
- `urgentTasks = []`

#### 향후 구현 시 주의사항

```javascript
// ✅ 구현 예시: 최근 파일
const { data: filesData, isLoading: isFilesLoading, error: filesError } = useStudyFiles(studyId, { limit: 5 })
const recentFiles = filesData?.data || []

<div className={styles.gridCard}>
  <div className={styles.cardHeader}>
    <h3 className={styles.cardTitle}>📁 최근 파일</h3>
    <Link href={`/my-studies/${studyId}/files`} className={styles.moreLink}>
      전체보기 →
    </Link>
  </div>
  <div className={styles.listItems}>
    {isFilesLoading ? (
      <WidgetSkeleton />
    ) : filesError ? (
      <WidgetError onRetry={() => refetch()} />
    ) : recentFiles.length === 0 ? (
      <p className={styles.emptyText}>최근 파일이 없습니다</p>
    ) : (
      recentFiles.map((file) => (
        <div key={file.id} className={styles.listItem}>
          <div className={styles.fileIcon}>
            {getFileIcon(file.mimeType)}
          </div>
          <div className={styles.itemContent}>
            <span className={styles.itemTitle}>{file.name}</span>
            <span className={styles.itemMeta}>
              {file.uploader?.name || '익명'} · {formatFileSize(file.size)} · {formatDateTimeKST(file.createdAt)}
            </span>
          </div>
          <button 
            onClick={() => downloadFile(file.id)} 
            className={styles.downloadButton}
          >
            ⬇️
          </button>
        </div>
      ))
    )}
  </div>
</div>
```

---

## 통계 계산 예외

### 5.1 주간 활동 통계 오류

#### 증상
- 출석률 NaN%
- 할일 완료율 계산 오류
- 통계 데이터 없음

#### 현재 코드

```javascript
// ⚠️ 주의: weeklyStats가 없으면 0으로 폴백
const weeklyActivity = {
  attendance: study.weeklyStats?.attendanceRate || 0,
  attendanceCount: study.weeklyStats?.attendanceCount || '0/0',
  taskCompletion: study.weeklyStats?.taskCompletionRate || 0,
  taskCount: study.weeklyStats?.taskCount || '0/0',
  messages: study.weeklyStats?.messageCount || 0,
  notices: study.weeklyStats?.noticeCount || 0,
  files: study.weeklyStats?.fileCount || 0,
}
```

#### 서버 측 통계 계산

```javascript
// src/app/api/studies/[id]/route.js
async function calculateWeeklyStats(studyId, userId) {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  try {
    // 출석률 계산
    const totalDays = 7
    const attendedDays = await prisma.attendance.count({
      where: {
        studyId,
        userId,
        date: { gte: oneWeekAgo },
        isPresent: true
      }
    })
    const attendanceRate = Math.round((attendedDays / totalDays) * 100)

    // 할일 완료율
    const totalTasks = await prisma.task.count({
      where: {
        studyId,
        assigneeId: userId,
        createdAt: { gte: oneWeekAgo }
      }
    })
    const completedTasks = await prisma.task.count({
      where: {
        studyId,
        assigneeId: userId,
        createdAt: { gte: oneWeekAgo },
        status: 'DONE'
      }
    })
    const taskCompletionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0

    // 메시지 수
    const messageCount = await prisma.message.count({
      where: {
        studyId,
        authorId: userId,
        createdAt: { gte: oneWeekAgo }
      }
    })

    // 공지 수
    const noticeCount = await prisma.notice.count({
      where: {
        studyId,
        createdAt: { gte: oneWeekAgo }
      }
    })

    // 파일 수
    const fileCount = await prisma.file.count({
      where: {
        studyId,
        createdAt: { gte: oneWeekAgo }
      }
    })

    return {
      attendanceRate,
      attendanceCount: `${attendedDays}/${totalDays}`,
      taskCompletionRate,
      taskCount: `${completedTasks}/${totalTasks}`,
      messageCount,
      noticeCount,
      fileCount
    }

  } catch (error) {
    console.error('[calculateWeeklyStats] Error:', error)
    
    // 에러 시 기본값 반환
    return {
      attendanceRate: 0,
      attendanceCount: '0/0',
      taskCompletionRate: 0,
      taskCount: '0/0',
      messageCount: 0,
      noticeCount: 0,
      fileCount: 0
    }
  }
}
```

---

### 5.2 퍼센트 표시 오류

#### 문제 코드

```javascript
// ❌ 문제: NaN 또는 Infinity 가능
<div className={styles.progressFill} style={{ width: `${weeklyActivity.attendance}%` }}></div>
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 안전한 퍼센트 계산
const getValidPercent = (value) => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return 0
  }
  return Math.max(0, Math.min(100, value))
}

<div 
  className={styles.progressFill} 
  style={{ width: `${getValidPercent(weeklyActivity.attendance)}%` }}
></div>
```

---

## UI 렌더링 예외

### 6.1 스터디 헤더 렌더링

#### 데이터 누락 처리

```javascript
// ✅ 좋은 예: 안전한 렌더링
<div className={styles.studyHeader} style={getStudyHeaderStyle(studyId)}>
  <div className={styles.studyInfo}>
    <span className={styles.emoji}>{study.emoji || '📚'}</span>
    <div>
      <h1 className={styles.studyName}>{study.name || '스터디'}</h1>
      <p className={styles.studyMeta}>
        👥 {study.currentMembers || 0}/{study.maxMembers || 0}명
        {study.category && ` · ${study.category}`}
      </p>
    </div>
  </div>
  <span className={`${styles.roleBadge} ${styles[study.myRole?.toLowerCase() || 'member']}`}>
    {study.myRole === 'OWNER' ? '👑' : study.myRole === 'ADMIN' ? '⭐' : '👤'} 
    {study.myRole || 'MEMBER'}
  </span>
</div>
```

---

### 6.2 태그 렌더링

#### 문제 코드

```javascript
// ❌ 문제: tags가 문자열일 수 있음
{study.tags.map(tag => (
  <span key={tag} className={styles.tag}>#{tag}</span>
))}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 배열 검증
{Array.isArray(study.tags) && study.tags.length > 0 && (
  <div className={styles.tags}>
    {study.tags.map((tag, index) => (
      <span key={`${tag}-${index}`} className={styles.tag}>
        #{typeof tag === 'string' ? tag : String(tag)}
      </span>
    ))}
  </div>
)}
```

---

## 네비게이션 예외

### 7.1 공지 상세 경로 오류

#### 문제 코드

```javascript
// ❌ 문제: 경로 불일치
<Link href={`/my-studies/${studyId}/announcements/${notice.id}`}>
```

#### 확인 사항

```javascript
// 실제 파일 경로 확인
// src/app/my-studies/[studyId]/announcements/[announcementId]/page.jsx 존재?
// 또는 src/app/my-studies/[studyId]/notices/[noticeId]/page.jsx ?
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 올바른 경로
<Link href={`/my-studies/${studyId}/notices/${notice.id}`} key={notice.id}>
  {/* ... */}
</Link>
```

---

### 7.2 뒤로가기 버튼

#### 개선 코드

```javascript
// ✅ 좋은 예: 히스토리 확인 후 이동
import { useRouter } from 'next/navigation'

const router = useRouter()

const handleBack = () => {
  // 히스토리가 있으면 뒤로가기, 없으면 목록으로
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/my-studies')
  }
}

<button onClick={handleBack} className={styles.backButton}>
  ← 뒤로가기
</button>
```

---

## 테스트 시나리오

### E2E 테스트

```javascript
// cypress/e2e/my-studies-detail.cy.js
describe('스터디 대시보드', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password')
    cy.visit('/my-studies/1')
  })

  it('스터디 정보를 표시한다', () => {
    cy.contains('알고리즘 스터디').should('be.visible')
    cy.contains('OWNER').should('be.visible')
  })

  it('주간 활동 통계를 표시한다', () => {
    cy.contains('출석률').should('be.visible')
    cy.contains('할일').should('be.visible')
  })

  it('최근 공지를 표시한다', () => {
    cy.get('[data-testid="recent-notices"]').should('exist')
  })

  it('탭 전환이 작동한다', () => {
    cy.contains('채팅').click()
    cy.url().should('include', '/chat')
  })

  it('MEMBER는 설정 탭이 보이지 않는다', () => {
    cy.login('member@example.com', 'password')
    cy.visit('/my-studies/1')
    cy.contains('설정').should('not.exist')
  })

  it('권한 없는 스터디 접근 시 에러를 표시한다', () => {
    cy.visit('/my-studies/999')
    cy.contains('스터디를 찾을 수 없습니다').should('be.visible')
  })
})
```

---

## 관련 문서

- [01-my-studies-list-exceptions.md](./01-my-studies-list-exceptions.md) - 목록 예외
- [03-notices-exceptions.md](./03-notices-exceptions.md) - 공지 예외
- [07-widgets-exceptions.md](./07-widgets-exceptions.md) - 위젯 예외
- [../studies/05-permissions-exceptions.md](../studies/05-permissions-exceptions.md) - 권한 예외

---

**다음 문서**: [03-notices-exceptions.md](./03-notices-exceptions.md)  
**이전 문서**: [01-my-studies-list-exceptions.md](./01-my-studies-list-exceptions.md)

