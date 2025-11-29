# 위젯 시스템 예외 처리

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**대상 파일**: `src/app/my-studies/[studyId]/page.jsx` (대시보드 위젯)

---

## 📚 목차

1. [개요](#개요)
2. [활동 요약 위젯](#활동-요약-위젯)
3. [최근 공지 위젯](#최근-공지-위젯)
4. [최근 파일 위젯](#최근-파일-위젯)
5. [다가오는 일정 위젯](#다가오는-일정-위젯)
6. [긴급 할일 위젯](#긴급-할일-위젯)
7. [위젯 자동 갱신](#위젯-자동-갱신)
8. [위젯 로딩 전략](#위젯-로딩-전략)

---

## 개요

### 위젯 시스템이란?

**위젯(Widgets)**은 스터디 대시보드에서 **다양한 정보를 한눈에** 볼 수 있도록 하는 **모듈형 컴포넌트**입니다.

### 주요 위젯

1. **이번 주 활동 요약**: 출석률, 할일 완료율, 메시지/공지/파일 수
2. **최근 공지**: 최근 3개 공지
3. **최근 파일**: 최근 업로드 파일
4. **다가오는 일정**: 향후 7일 일정
5. **긴급 할일**: 마감 임박 할일
6. **멤버 목록**: 온라인 멤버
7. **스터디 현황**: 멤버 수, 모집 상태
8. **빠른 액션**: 채팅, 공지, 파일 바로가기

---

## 활동 요약 위젯

### 1.1 통계 데이터 없음

#### 증상
- `weeklyStats`가 `undefined` 또는 `null`
- 통계 값이 `NaN`

#### 현재 코드

```javascript
// ⚠️ 주의: weeklyStats 없을 때 기본값 처리
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

#### 개선 코드

```javascript
// ✅ 좋은 예: 안전한 통계 처리
const getWeeklyActivity = (study) => {
  const stats = study?.weeklyStats

  if (!stats) {
    console.warn('[WeeklyActivity] No stats available for study:', study?.id)
    return {
      attendance: 0,
      attendanceCount: '0/0',
      taskCompletion: 0,
      taskCount: '0/0',
      messages: 0,
      notices: 0,
      files: 0,
      hasData: false
    }
  }

  return {
    attendance: validatePercent(stats.attendanceRate),
    attendanceCount: validateCountString(stats.attendanceCount),
    taskCompletion: validatePercent(stats.taskCompletionRate),
    taskCount: validateCountString(stats.taskCount),
    messages: validateCount(stats.messageCount),
    notices: validateCount(stats.noticeCount),
    files: validateCount(stats.fileCount),
    hasData: true
  }
}

const validatePercent = (value) => {
  const num = Number(value)
  if (isNaN(num) || !isFinite(num)) return 0
  return Math.max(0, Math.min(100, num))
}

const validateCount = (value) => {
  const num = Number(value)
  if (isNaN(num) || num < 0) return 0
  return Math.floor(num)
}

const validateCountString = (value) => {
  if (!value || typeof value !== 'string') return '0/0'
  
  const match = value.match(/^(\d+)\/(\d+)$/)
  if (!match) return '0/0'
  
  const [, current, total] = match
  return `${current}/${total}`
}

const weeklyActivity = getWeeklyActivity(study)
```

---

### 1.2 위젯 UI 렌더링

```javascript
// ✅ 좋은 예: 데이터 없음 상태 표시
<div className={styles.activitySummary}>
  <h2 className={styles.sectionTitle}>📊 이번 주 활동 요약</h2>

  {!weeklyActivity.hasData ? (
    <div className={styles.noData}>
      <p>이번 주 활동 데이터가 아직 없습니다</p>
    </div>
  ) : (
    <>
      <div className={styles.activityItem}>
        <div className={styles.activityLabel}>
          <span>출석률</span>
          <span className={styles.activityValue}>
            {weeklyActivity.attendance}% ({weeklyActivity.attendanceCount})
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${weeklyActivity.attendance}%` }}
          ></div>
        </div>
      </div>

      <div className={styles.activityItem}>
        <div className={styles.activityLabel}>
          <span>할일 완료율</span>
          <span className={styles.activityValue}>
            {weeklyActivity.taskCompletion}% ({weeklyActivity.taskCount})
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${weeklyActivity.taskCompletion}%` }}
          ></div>
        </div>
      </div>

      <div className={styles.activityStats}>
        <span>💬 메시지 {weeklyActivity.messages}개</span>
        <span>📢 공지 {weeklyActivity.notices}개</span>
        <span>📁 파일 {weeklyActivity.files}개</span>
      </div>
    </>
  )}
</div>
```

---

## 최근 공지 위젯

### 2.1 공지 로딩 실패

```javascript
// ✅ 좋은 예: 위젯별 에러 처리
const { 
  data: noticesData, 
  isLoading: isNoticesLoading, 
  error: noticesError 
} = useNotices(studyId, { limit: 3 })

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
      <div className={styles.widgetLoading}>
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.skeletonItem}></div>
        ))}
      </div>
    ) : noticesError ? (
      <div className={styles.widgetError}>
        <p className={styles.errorText}>공지를 불러올 수 없습니다</p>
        <button onClick={() => refetch()} className={styles.retryButton}>
          다시 시도
        </button>
      </div>
    ) : recentNotices.length === 0 ? (
      <p className={styles.emptyText}>최근 공지가 없습니다</p>
    ) : (
      recentNotices.map((notice) => (
        <Link 
          href={`/my-studies/${studyId}/notices/${notice.id}`} 
          key={notice.id} 
          className={styles.listItemLink}
        >
          <div className={styles.itemContent}>
            <span className={styles.itemTitle}>
              {notice.isPinned && <span className={styles.pinnedIcon}>📌 </span>}
              {notice.isImportant && <span className={styles.importantIcon}>❗ </span>}
              {notice.title}
            </span>
            <span className={styles.itemMeta}>
              {notice.author?.name || '익명'} · {formatDateTimeKST(notice.createdAt)}
            </span>
          </div>
        </Link>
      ))
    )}
  </div>
</div>
```

---

## 최근 파일 위젯

### 3.1 파일 데이터 없음 (현재 빈 배열)

```javascript
// ✅ 향후 구현 시 사용
const { 
  data: filesData, 
  isLoading: isFilesLoading, 
  error: filesError 
} = useStudyFiles(studyId, { limit: 5, sortBy: 'createdAt', order: 'desc' })

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
      <WidgetSkeleton count={3} />
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
              {file.uploader?.name || '익명'} · 
              {formatFileSize(file.size)} · 
              {formatDateTimeKST(file.createdAt)}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault()
              handleDownload(file.id, file.name)
            }} 
            className={styles.downloadButton}
            title="다운로드"
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

## 다가오는 일정 위젯

### 4.1 일정 필터링

```javascript
// ✅ 좋은 예: 향후 7일 일정
const { data: eventsData } = useStudyEvents(studyId)
const allEvents = eventsData?.data || []

const upcomingEvents = useMemo(() => {
  const now = new Date()
  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

  return allEvents
    .filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate >= now && eventDate <= sevenDaysLater
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5) // 최대 5개
}, [allEvents])

<div className={styles.gridCard}>
  <div className={styles.cardHeader}>
    <h3 className={styles.cardTitle}>📅 다가오는 일정</h3>
    <Link href={`/my-studies/${studyId}/calendar`} className={styles.moreLink}>
      캘린더 →
    </Link>
  </div>
  <div className={styles.listItems}>
    {upcomingEvents.length === 0 ? (
      <p className={styles.emptyText}>예정된 일정이 없습니다</p>
    ) : (
      upcomingEvents.map((event) => {
        const daysUntil = Math.ceil(
          (new Date(event.startDate) - new Date()) / (1000 * 60 * 60 * 24)
        )
        
        return (
          <div key={event.id} className={styles.listItem}>
            <div className={styles.eventIcon}>
              {event.eventType === 'EXAM' ? '📝' :
               event.eventType === 'ASSIGNMENT' ? '📚' :
               '📅'}
            </div>
            <div className={styles.itemContent}>
              <span className={styles.itemTitle}>{event.title}</span>
              <span className={styles.itemMeta}>
                {formatDateTimeKST(event.startDate)}
                {event.location && ` · ${event.location}`}
              </span>
            </div>
            {daysUntil === 0 ? (
              <span className={styles.todayBadge}>오늘</span>
            ) : daysUntil === 1 ? (
              <span className={styles.tomorrowBadge}>내일</span>
            ) : (
              <span className={styles.ddayBadge}>D-{daysUntil}</span>
            )}
          </div>
        )
      })
    )}
  </div>
</div>
```

---

## 긴급 할일 위젯

### 5.1 마감 임박 할일 필터링

```javascript
// ✅ 좋은 예: 긴급도 기반 필터링
const { data: tasksData } = useStudyTasks(studyId)
const allTasks = tasksData?.data || []

const urgentTasks = useMemo(() => {
  const now = new Date()
  const threeDaysLater = new Date()
  threeDaysLater.setDate(threeDaysLater.getDate() + 3)

  return allTasks
    .filter(task => {
      // 완료되지 않은 할일
      if (task.status === 'DONE') return false

      // 마감일이 있고, 3일 이내
      if (!task.dueDate) return false

      const dueDate = new Date(task.dueDate)
      return dueDate >= now && dueDate <= threeDaysLater
    })
    .sort((a, b) => {
      // 우선순위 정렬
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      
      if (priorityDiff !== 0) return priorityDiff

      // 마감일 정렬
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
    .slice(0, 5) // 최대 5개
}, [allTasks])

<div className={styles.gridCard}>
  <div className={styles.cardHeader}>
    <h3 className={styles.cardTitle}>⚠️ 긴급 할일</h3>
    <Link href={`/my-studies/${studyId}/tasks`} className={styles.moreLink}>
      전체보기 →
    </Link>
  </div>
  <div className={styles.listItems}>
    {urgentTasks.length === 0 ? (
      <p className={styles.emptyText}>긴급한 할일이 없습니다</p>
    ) : (
      urgentTasks.map((task) => {
        const dueDate = new Date(task.dueDate)
        const hoursUntil = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60))
        const isOverdue = dueDate < new Date()

        return (
          <div key={task.id} className={styles.listItem}>
            <div className={styles.itemContent}>
              <span className={styles.itemTitle}>
                {task.priority === 'HIGH' && <span className={styles.highPriority}>🔴 </span>}
                {task.title}
              </span>
              <span className={styles.itemMeta}>
                {task.assignee?.name || '미할당'} · 
                마감: {formatDateTimeKST(task.dueDate)}
              </span>
            </div>
            {isOverdue ? (
              <span className={styles.overdueBadge}>지남</span>
            ) : hoursUntil < 24 ? (
              <span className={styles.urgentBadge}>🔥 {hoursUntil}시간</span>
            ) : (
              <span className={styles.dueSoonBadge}>
                {Math.ceil(hoursUntil / 24)}일
              </span>
            )}
          </div>
        )
      })
    )}
  </div>
</div>
```

---

## 위젯 자동 갱신

### 6.1 React Query 자동 갱신

```javascript
// ✅ 좋은 예: 위젯별 갱신 전략
const { data: studyData } = useStudy(studyId, {
  refetchInterval: 60000, // 1분마다
  refetchOnWindowFocus: true
})

const { data: noticesData } = useNotices(studyId, { limit: 3 }, {
  refetchInterval: 30000, // 30초마다
  refetchOnWindowFocus: true,
  staleTime: 20000 // 20초 동안 fresh
})

const { data: tasksData } = useStudyTasks(studyId, {
  refetchInterval: 45000, // 45초마다
  refetchOnWindowFocus: true
})
```

---

### 6.2 수동 새로고침

```javascript
// ✅ 좋은 예: 새로고침 버튼
const queryClient = useQueryClient()

const handleRefreshAll = async () => {
  setIsRefreshing(true)

  try {
    await Promise.all([
      queryClient.invalidateQueries(['study', studyId]),
      queryClient.invalidateQueries(['notices', studyId]),
      queryClient.invalidateQueries(['studyTasks', studyId]),
      queryClient.invalidateQueries(['studyEvents', studyId]),
      queryClient.invalidateQueries(['studyFiles', studyId])
    ])

    // 성공 피드백
    showToast('모든 위젯이 새로고침되었습니다')

  } catch (error) {
    console.error('Refresh failed:', error)
    showToast('새로고침에 실패했습니다')
  } finally {
    setIsRefreshing(false)
  }
}

// UI
<button 
  onClick={handleRefreshAll}
  className={styles.refreshButton}
  disabled={isRefreshing}
>
  {isRefreshing ? '⏳' : '🔄'} 새로고침
</button>
```

---

## 위젯 로딩 전략

### 7.1 스켈레톤 UI

```javascript
// ✅ 좋은 예: 재사용 가능한 위젯 스켈레톤
function WidgetSkeleton({ count = 3 }) {
  return (
    <div className={styles.widgetSkeleton}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonItem}>
          <div className={styles.skeletonIcon}></div>
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonMeta}></div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

### 7.2 에러 컴포넌트

```javascript
// ✅ 좋은 예: 재사용 가능한 위젯 에러
function WidgetError({ message, onRetry }) {
  return (
    <div className={styles.widgetError}>
      <div className={styles.errorIcon}>⚠️</div>
      <p className={styles.errorMessage}>
        {message || '데이터를 불러올 수 없습니다'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          다시 시도
        </button>
      )}
    </div>
  )
}
```

---

## 관련 문서

- [02-study-detail-exceptions.md](./02-study-detail-exceptions.md) - 스터디 대시보드
- [03-notices-exceptions.md](./03-notices-exceptions.md) - 공지사항
- [04-tasks-exceptions.md](./04-tasks-exceptions.md) - 할일 관리
- [06-calendar-exceptions.md](./06-calendar-exceptions.md) - 캘린더

---

**다음 문서**: [08-chat-exceptions.md](./08-chat-exceptions.md)  
**이전 문서**: [06-calendar-exceptions.md](./06-calendar-exceptions.md)

