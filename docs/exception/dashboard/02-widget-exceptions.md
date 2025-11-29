# 위젯 예외 처리

대시보드 위젯들에서 발생할 수 있는 모든 예외 상황과 처리 방법을 다룹니다.

---

## 📋 목차

1. [StudyStatus 위젯](#studystatus-위젯)
2. [OnlineMembers 위젯](#onlinemembers-위젯)
3. [QuickActions 위젯](#quickactions-위젯)
4. [UrgentTasks 위젯](#urgenttasks-위젯)
5. [PinnedNotice 위젯](#pinnednotice-위젯)
6. [위젯 공통 예외 처리](#위젯-공통-예외-처리)

---

## StudyStatus 위젯

### 개요

**파일**: `coup/src/components/dashboard/widgets/StudyStatus.jsx`

**기능**:
- 다음 일정 D-day 표시
- 출석률 (attendanceRate)
- 할일 완료율 (taskCompletionRate)
- 연속 일수 (streakDays)

### 예외 상황 1: 출석률 계산 오류

#### 증상
- 출석률이 `NaN%` 또는 `Infinity%`로 표시
- 프로그레스 바가 깨짐

#### 원인
```javascript
// ❌ 문제가 있는 코드
const attendanceRate = (attendedCount / totalAttendance) * 100
// totalAttendance가 0이면 NaN 또는 Infinity
```

#### 해결 방법

**개선된 코드**:
```jsx
'use client'

import styles from './Widget.module.css'

export default function StudyStatus({ stats, nextEvent }) {
  // 안전한 계산
  const safePercentage = (numerator, denominator) => {
    if (!denominator || denominator === 0) return 0
    const result = (numerator / denominator) * 100
    return Math.min(Math.max(result, 0), 100) // 0-100 범위로 제한
  }

  const attendanceRate = safePercentage(
    stats?.attendedCount || 0,
    stats?.totalAttendance || 0
  )

  const taskCompletionRate = safePercentage(
    stats?.completedTasks || 0,
    stats?.totalTasks || 0
  )

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>📊 스터디 현황</h3>
      
      {/* 다음 일정 */}
      {nextEvent ? (
        <div className={styles.nextEvent}>
          <div className={styles.eventLabel}>🎯 다음 일정</div>
          <div className={styles.eventDday}>D-{nextEvent.dday}</div>
          <div className={styles.eventDate}>{nextEvent.date}</div>
          <div className={styles.eventTitle}>{nextEvent.title}</div>
        </div>
      ) : (
        <div className={styles.emptyEvent}>
          📅 다가오는 일정이 없습니다
        </div>
      )}

      {/* 출석률 */}
      <div className={styles.statItem}>
        <div className={styles.statLabel}>
          <span>👥 출석률</span>
          <span className={styles.statValue}>
            {attendanceRate.toFixed(1)}%
          </span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
        <div className={styles.statDetail}>
          {stats?.attendedCount || 0}/{stats?.totalAttendance || 0}명 (이번 주)
        </div>
      </div>

      {/* 할일 완료율 */}
      <div className={styles.statItem}>
        <div className={styles.statLabel}>
          <span>✅ 할일</span>
          <span className={styles.statValue}>
            {taskCompletionRate.toFixed(1)}%
          </span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${taskCompletionRate}%` }}
          />
        </div>
        <div className={styles.statDetail}>
          {stats?.completedTasks || 0}/{stats?.totalTasks || 0}개 완료
        </div>
      </div>

      {/* 연속 일수 */}
      {stats?.streakDays > 0 && (
        <div className={styles.streak}>
          <span>🔥 연속</span>
          <span className={styles.streakDays}>{stats.streakDays}일</span>
          <span className={styles.streakEmoji}>
            {'🔥'.repeat(Math.min(stats.streakDays, 5))}
          </span>
        </div>
      )}
    </div>
  )
}
```

### 예외 상황 2: 데이터 누락

#### 증상
- 위젯이 빈 화면으로 표시
- `stats`가 `undefined`

#### 원인
```javascript
// API 응답에 widgetData가 없는 경우
const { widgetData } = dashboardData.data
// widgetData가 undefined
```

#### 해결 방법

**DashboardClient에서 기본값 설정**:
```jsx
// coup/src/components/dashboard/DashboardClient.jsx

export default function DashboardClient({ user: initialUser }) {
  const { data: dashboardData, isLoading } = useDashboard()

  // ...

  // 위젯 데이터 준비 (기본값 포함)
  const widgetStats = dashboardData?.data?.widgetData?.stats || {
    attendanceRate: 0,
    attendedCount: 0,
    totalAttendance: 0,
    taskCompletionRate: 0,
    completedTasks: 0,
    totalTasks: 0,
    streakDays: 0
  }

  const nextEvent = dashboardData?.data?.widgetData?.nextEvent || null

  return (
    <>
      {/* ... */}
      <StudyStatus stats={widgetStats} nextEvent={nextEvent} />
    </>
  )
}
```

### 예외 상황 3: D-day 계산 오류

#### 증상
- D-day가 음수 또는 매우 큰 수로 표시
- "D--5", "D-9999"

#### 원인
```javascript
// ❌ 날짜 파싱 오류
const dday = Math.ceil((new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24))
// Invalid Date면 NaN 발생
```

#### 해결 방법

```jsx
// coup/src/components/dashboard/DashboardClient.jsx

const nextEvent = widgetData?.nextEvent || (upcomingEvents && upcomingEvents.length > 0 ? {
  dday: calculateDday(upcomingEvents[0].date),
  date: formatEventDate(upcomingEvents[0].date),
  title: upcomingEvents[0].title
} : null)

function calculateDday(dateString) {
  try {
    const eventDate = new Date(dateString)
    const now = new Date()
    
    // Invalid Date 체크
    if (isNaN(eventDate.getTime())) {
      console.error('Invalid event date:', dateString)
      return 0
    }
    
    // 자정 기준으로 계산
    eventDate.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    
    const diffTime = eventDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // 음수 방지 (과거 일정)
    return Math.max(0, diffDays)
  } catch (error) {
    console.error('Error calculating D-day:', error)
    return 0
  }
}

function formatEventDate(dateString) {
  try {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return '날짜 오류'
    }
    
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return '날짜 오류'
  }
}
```

---

## OnlineMembers 위젯

### 개요

**파일**: `coup/src/components/dashboard/widgets/OnlineMembers.jsx`

**기능**:
- 현재 온라인 멤버 목록
- 아바타 표시
- 역할 배지 (OWNER)
- 현재 활동 표시

### 예외 상황 1: 아바타 로딩 실패

#### 증상
- 깨진 이미지 아이콘 표시
- Next.js Image 에러

#### 원인
```jsx
<Image 
  src={member.avatar} // 잘못된 URL 또는 없는 이미지
  alt={member.name}
  width={32}
  height={32}
/>
```

#### 해결 방법

**개선된 코드**:
```jsx
'use client'

import styles from './Widget.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

function MemberAvatar({ member }) {
  const [imageError, setImageError] = useState(false)

  if (!member.avatar || imageError) {
    return (
      <div className={styles.avatarPlaceholder}>
        {member.name?.[0]?.toUpperCase() || '?'}
      </div>
    )
  }

  return (
    <Image 
      src={member.avatar} 
      alt={member.name}
      width={32}
      height={32}
      onError={() => setImageError(true)}
    />
  )
}

export default function OnlineMembers({ members, totalMembers }) {
  const onlineMembers = members?.filter(m => m.isOnline) || []
  
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>👥 온라인 멤버</h3>
        <span className={styles.badge}>{onlineMembers.length}명</span>
      </div>

      {onlineMembers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>현재 온라인인 멤버가 없습니다</p>
        </div>
      ) : (
        <div className={styles.membersList}>
          {onlineMembers.slice(0, 5).map((member) => (
            <div key={member.id} className={styles.memberItem}>
              <div className={styles.memberAvatar}>
                <MemberAvatar member={member} />
                <span className={styles.onlineIndicator}>🟢</span>
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>
                  {member.name || '알 수 없음'}
                  {member.role === 'OWNER' && (
                    <span className={styles.roleBadge}>👑</span>
                  )}
                </div>
                {member.currentActivity && (
                  <div className={styles.memberActivity}>
                    {member.currentActivity}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalMembers > 0 && (
        <Link href="/members" className={styles.widgetLink}>
          📊 전체 멤버 ({totalMembers}명) →
        </Link>
      )}
    </div>
  )
}
```

### 예외 상황 2: WebSocket 연결 끊김

#### 증상
- 온라인 상태가 업데이트되지 않음
- Stale 데이터 표시

#### 해결 방법

자세한 내용은 [03-real-time-sync-exceptions.md](./03-real-time-sync-exceptions.md#websocket-재연결)를 참고하세요.

**임시 해결책** (WebSocket 미구현 시):
```jsx
import { useQuery } from '@tanstack/react-query'

export default function OnlineMembers({ studyId }) {
  // 30초마다 자동 갱신
  const { data } = useQuery({
    queryKey: ['online-members', studyId],
    queryFn: () => api.get(`/api/studies/${studyId}/members/online`),
    refetchInterval: 30000, // 30초
  })

  const members = data?.members || []
  // ...
}
```

### 예외 상황 3: 멤버 목록 로딩 실패

#### 증상
- 빈 화면
- 에러 메시지 없음

#### 해결 방법

```jsx
export default function OnlineMembers({ members, totalMembers, isLoading, error }) {
  if (isLoading) {
    return (
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>👥 온라인 멤버</h3>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>멤버 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>👥 온라인 멤버</h3>
        <div className={styles.error}>
          <p>⚠️ 멤버 목록을 불러올 수 없습니다</p>
        </div>
      </div>
    )
  }

  // 정상 렌더링...
}
```

---

## QuickActions 위젯

### 개요

**파일**: `coup/src/components/dashboard/widgets/QuickActions.jsx`

**기능**:
- 채팅 시작
- 화상 스터디
- 멤버 초대
- 통계 보기
- 설정 (관리자만)

### 예외 상황 1: 권한 오류

#### 증상
- 관리자 전용 버튼이 일반 사용자에게 표시됨
- 클릭 시 403 오류

#### 해결 방법

```jsx
'use client'

import styles from './Widget.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function QuickActions({ user, study }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // 권한 확인
  const isOwner = study?.role === 'OWNER'
  const isAdmin = study?.role === 'ADMIN' || isOwner

  const handleVideoCall = async () => {
    try {
      setIsLoading(true)
      // TODO: 화상 통화 기능 구현
      alert('화상 스터디 기능은 준비 중입니다')
    } catch (error) {
      console.error('화상 통화 시작 실패:', error)
      alert('화상 통화를 시작할 수 없습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async () => {
    try {
      setIsLoading(true)
      
      // 초대 링크 생성
      const inviteLink = `${window.location.origin}/studies/${study.id}/join?invite=${study.inviteCode}`
      
      // 클립보드에 복사
      await navigator.clipboard.writeText(inviteLink)
      alert('초대 링크가 복사되었습니다!')
    } catch (error) {
      console.error('초대 링크 복사 실패:', error)
      
      // 폴백: 수동 복사
      const textarea = document.createElement('textarea')
      textarea.value = inviteLink
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      
      alert('초대 링크가 복사되었습니다!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
      
      <div className={styles.actionButtons}>
        <Link href="/chat" className={styles.actionButton}>
          💬 채팅 시작
        </Link>
        
        <button 
          onClick={handleVideoCall}
          className={styles.actionButton}
          disabled={isLoading}
        >
          📹 화상 스터디
        </button>
        
        <button 
          onClick={handleInvite}
          className={styles.actionButton}
          disabled={isLoading}
        >
          📤 멤버 초대
        </button>
        
        <Link href="/my-studies/stats" className={styles.actionButton}>
          📊 통계 보기
        </Link>
        
        {/* 관리자 전용 버튼 */}
        {isAdmin && (
          <Link 
            href={`/my-studies/${study.id}/settings`} 
            className={`${styles.actionButton} ${styles.adminAction}`}
          >
            ⚙️ 스터디 설정
          </Link>
        )}

        {/* 오너 전용 버튼 */}
        {isOwner && (
          <Link 
            href={`/my-studies/${study.id}/danger`} 
            className={`${styles.actionButton} ${styles.dangerAction}`}
          >
            🗑️ 스터디 삭제
          </Link>
        )}
      </div>
    </div>
  )
}
```

### 예외 상황 2: 클립보드 API 미지원

#### 증상
- 초대 링크 복사 실패
- `navigator.clipboard` is undefined

#### 해결 방법

위의 `handleInvite` 함수에 폴백 로직 포함됨.

---

## UrgentTasks 위젯

### 개요

**파일**: `coup/src/components/dashboard/widgets/UrgentTasks.jsx`

**기능**:
- 3일 이내 마감 할일 표시
- D-day 계산
- 긴급도 색상 표시

### 예외 상황 1: 날짜 계산 오류

#### 증상
- D-day가 음수
- "D--5"
- 마감 지난 할일도 표시됨

#### 원인
```javascript
const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
return !task.completed && daysUntilDue >= 0 && daysUntilDue <= 3
// 음수 처리 안 됨
```

#### 해결 방법

**개선된 코드**:
```jsx
'use client'

import styles from './Widget.module.css'
import Link from 'next/link'

export default function UrgentTasks({ tasks }) {
  // 안전한 날짜 계산
  const calculateDaysUntilDue = (dueDateString) => {
    try {
      const dueDate = new Date(dueDateString)
      const now = new Date()
      
      // Invalid Date 체크
      if (isNaN(dueDate.getTime())) {
        console.error('Invalid due date:', dueDateString)
        return null
      }
      
      // 자정 기준
      dueDate.setHours(0, 0, 0, 0)
      now.setHours(0, 0, 0, 0)
      
      const diffTime = dueDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays
    } catch (error) {
      console.error('Error calculating days until due:', error)
      return null
    }
  }

  // 긴급 할일 필터링
  const urgentTasks = tasks?.filter(task => {
    if (task.completed) return false
    
    const daysUntilDue = calculateDaysUntilDue(task.dueDate)
    
    // 계산 실패 시 제외
    if (daysUntilDue === null) return false
    
    // 0일 이상 3일 이하
    return daysUntilDue >= 0 && daysUntilDue <= 3
  })
  .sort((a, b) => {
    // D-day 오름차순 정렬
    const aDays = calculateDaysUntilDue(a.dueDate)
    const bDays = calculateDaysUntilDue(b.dueDate)
    return aDays - bDays
  })
  .slice(0, 3) || []

  if (urgentTasks.length === 0) {
    return null // 또는 빈 상태 표시
  }

  const getUrgencyColor = (daysUntilDue) => {
    if (daysUntilDue === 0) return '🔴' // 오늘
    if (daysUntilDue === 1) return '🟠' // 내일
    if (daysUntilDue <= 3) return '🟡' // 3일 이내
    return '🟢' // 그 외
  }

  const formatDueDate = (dateString) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '날짜 오류'
      
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      })
    } catch (error) {
      return '날짜 오류'
    }
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>✅ 급한 할일</h3>
        <span className={styles.badge}>{urgentTasks.length}</span>
      </div>

      <div className={styles.tasksList}>
        {urgentTasks.map((task) => {
          const daysUntilDue = calculateDaysUntilDue(task.dueDate)
          
          return (
            <Link 
              key={task.id} 
              href={`/tasks/${task.id}`}
              className={styles.taskItem}
            >
              <div className={styles.taskHeader}>
                <span className={styles.urgencyIndicator}>
                  {getUrgencyColor(daysUntilDue)}
                </span>
                <span className={styles.taskTitle}>
                  {task.title || '제목 없음'}
                </span>
              </div>
              <div className={styles.taskMeta}>
                <span className={styles.taskDue}>
                  {daysUntilDue === 0 ? '오늘' : `D-${daysUntilDue}`}
                  {' '}
                  ({formatDueDate(task.dueDate)})
                </span>
              </div>
              {task.studyName && (
                <div className={styles.taskStudy}>
                  {task.studyEmoji} {task.studyName}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      <Link href="/tasks" className={styles.widgetLink}>
        할일 전체보기 →
      </Link>
    </div>
  )
}
```

### 예외 상황 2: 할일 없음

#### 증상
- 위젯이 표시되지 않음

#### 해결 방법

현재 코드에서 `return null`로 처리 중. 원한다면 빈 상태 표시:

```jsx
if (urgentTasks.length === 0) {
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>✅ 급한 할일</h3>
      <div className={styles.emptyState}>
        <p>✨ 급한 할일이 없습니다!</p>
        <Link href="/tasks" className={styles.link}>
          할일 추가하기 →
        </Link>
      </div>
    </div>
  )
}
```

---

## PinnedNotice 위젯

### 개요

**파일**: `coup/src/components/dashboard/widgets/PinnedNotice.jsx`

**기능**:
- 고정된 공지사항 표시
- 작성자, 작성 시간
- 내용 미리보기

### 예외 상황 1: 상대 시간 계산 오류

#### 증상
- "NaN시간 전"
- 매우 큰 숫자 표시

#### 원인
```javascript
const diff = now - date // Invalid Date면 NaN
const hours = Math.floor(diff / 3600000) // NaN
```

#### 해결 방법

**개선된 코드**:
```jsx
'use client'

import styles from './Widget.module.css'
import Link from 'next/link'

export default function PinnedNotice({ notice }) {
  if (!notice) {
    return null
  }

  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      
      // Invalid Date 체크
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString)
        return '날짜 오류'
      }
      
      const diff = now - date
      
      // 음수 방지 (미래 날짜)
      if (diff < 0) {
        return '방금 전'
      }

      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      const weeks = Math.floor(diff / 604800000)
      const months = Math.floor(diff / 2592000000)

      if (minutes < 1) return '방금 전'
      if (minutes < 60) return `${minutes}분 전`
      if (hours < 24) return `${hours}시간 전`
      if (days < 7) return `${days}일 전`
      if (weeks < 4) return `${weeks}주 전`
      if (months < 12) return `${months}개월 전`

      // 1년 이상은 절대 날짜 표시
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric' 
      })
    } catch (error) {
      console.error('Error formatting relative time:', error)
      return '날짜 오류'
    }
  }

  // 안전한 텍스트 자르기
  const truncateText = (text, maxLength = 80) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>📌 고정 공지</h3>
      
      <div className={styles.noticeContent}>
        <h4 className={styles.noticeTitle}>
          {notice.title || '제목 없음'}
        </h4>
        <div className={styles.noticeMeta}>
          <span>{notice.authorName || '알 수 없음'}</span>
          <span>·</span>
          <span>{formatRelativeTime(notice.createdAt)}</span>
        </div>
        {notice.content && (
          <p className={styles.noticePreview}>
            {truncateText(notice.content, 80)}
          </p>
        )}
      </div>

      <Link 
        href={`/notices/${notice.id}`} 
        className={styles.widgetLink}
      >
        자세히 보기 →
      </Link>
    </div>
  )
}
```

### 예외 상황 2: 공지 없음

#### 증상
- 위젯이 표시되지 않음

#### 해결 방법

현재 `return null`로 처리. 원한다면:

```jsx
if (!notice) {
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>📌 고정 공지</h3>
      <div className={styles.emptyState}>
        <p>고정된 공지사항이 없습니다</p>
      </div>
    </div>
  )
}
```

---

## 위젯 공통 예외 처리

### 위젯 로딩 상태

**공통 로딩 컴포넌트**:

```jsx
// coup/src/components/dashboard/widgets/WidgetSkeleton.jsx
export default function WidgetSkeleton() {
  return (
    <div className={styles.widget}>
      <div className={styles.skeletonHeader}></div>
      <div className={styles.skeletonContent}></div>
      <div className={styles.skeletonContent}></div>
      <div className={styles.skeletonContent}></div>
    </div>
  )
}
```

### 위젯 에러 처리

**공통 에러 컴포넌트**:

```jsx
// coup/src/components/dashboard/widgets/WidgetError.jsx
export default function WidgetError({ title, onRetry }) {
  return (
    <div className={styles.widget}>
      <div className={styles.widgetError}>
        <span className={styles.errorIcon}>⚠️</span>
        <p className={styles.errorMessage}>
          {title}을(를) 불러올 수 없습니다
        </p>
        {onRetry && (
          <button onClick={onRetry} className={styles.retryButton}>
            다시 시도
          </button>
        )}
      </div>
    </div>
  )
}
```

### 위젯 조건부 렌더링

```jsx
// coup/src/components/dashboard/DashboardClient.jsx

export default function DashboardClient({ user }) {
  const { data, isLoading, error } = useDashboard()

  // ...

  return (
    <div className={styles.container}>
      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 통계 카드 */}
        {/* 내 스터디 */}
      </div>

      {/* 위젯 사이드바 */}
      <aside className={styles.widgets}>
        {/* StudyStatus - 항상 표시 */}
        <StudyStatus 
          stats={widgetStats} 
          nextEvent={nextEvent} 
        />

        {/* OnlineMembers - 데이터 있을 때만 */}
        {onlineMembers && onlineMembers.length > 0 && (
          <OnlineMembers 
            members={onlineMembers}
            totalMembers={totalMembers}
          />
        )}

        {/* QuickActions - 항상 표시 */}
        <QuickActions user={user} study={currentStudy} />

        {/* UrgentTasks - 긴급 할일 있을 때만 */}
        {urgentTasks && urgentTasks.length > 0 && (
          <UrgentTasks tasks={urgentTasks} />
        )}

        {/* PinnedNotice - 공지 있을 때만 */}
        {pinnedNotice && (
          <PinnedNotice notice={pinnedNotice} />
        )}
      </aside>
    </div>
  )
}
```

---

## 테스트

### 위젯 단위 테스트

```javascript
// coup/src/components/dashboard/widgets/__tests__/StudyStatus.test.jsx
import { render, screen } from '@testing-library/react'
import StudyStatus from '../StudyStatus'

describe('StudyStatus Widget', () => {
  it('출석률 0/0 일 때 0%로 표시', () => {
    const stats = {
      attendanceRate: 0,
      attendedCount: 0,
      totalAttendance: 0,
      taskCompletionRate: 0,
      completedTasks: 0,
      totalTasks: 0,
      streakDays: 0
    }

    render(<StudyStatus stats={stats} nextEvent={null} />)

    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })

  it('Invalid D-day 처리', () => {
    const nextEvent = {
      dday: 0,
      date: '날짜 오류',
      title: 'Test Event'
    }

    render(<StudyStatus stats={{}} nextEvent={nextEvent} />)

    expect(screen.getByText('D-0')).toBeInTheDocument()
  })
})
```

---

## 디버깅 체크리스트

위젯 문제 발생 시:

- [ ] props가 올바르게 전달되는가?
- [ ] 데이터 타입이 맞는가? (숫자, 문자열, 날짜)
- [ ] 필수 필드가 누락되지 않았는가?
- [ ] 날짜 파싱이 성공하는가?
- [ ] 0으로 나누기가 발생하지 않는가?
- [ ] 이미지 URL이 유효한가?

---

**다음 문서**: [03-real-time-sync-exceptions.md](./03-real-time-sync-exceptions.md)

