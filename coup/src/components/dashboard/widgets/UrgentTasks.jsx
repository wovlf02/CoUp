/**
 * UrgentTasks.jsx
 *
 * 급한 할일 위젯 (메모이제이션)
 * - 3일 이내 마감 할일 표시
 * - D-day 계산
 * - 긴급도 색상 표시
 *
 * @module components/dashboard/widgets/UrgentTasks
 */

'use client'

import { memo, useMemo } from 'react'
import styles from './Widget.module.css'
import Link from 'next/link'
import { UrgentTasksSkeleton } from './WidgetSkeleton'

/**
 * 안전한 D-day 계산
 */
function calculateDaysUntilDue(dueDateString) {
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

/**
 * 날짜 포맷팅
 */
function formatDueDate(dateString) {
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

/**
 * 긴급도 색상 가져오기
 */
function getUrgencyColor(daysUntilDue) {
  if (daysUntilDue === 0) return '🔴' // 오늘
  if (daysUntilDue === 1) return '🟠' // 내일
  if (daysUntilDue <= 3) return '🟡' // 3일 이내
  return '🟢' // 그 외
}
/**
 * 급한 할일 위젯 컴포넌트
 */
function UrgentTasksComponent({ tasks = [], isLoading = false }) {
export default function UrgentTasks({ tasks = [], isLoading = false }) {
  // 로딩 상태
  if (isLoading) {
    return <UrgentTasksSkeleton />
  }
  // useMemo로 긴급 할일 필터링 및 정렬 최적화
  const urgentTasks = useMemo(() => {
    return (tasks || [])
      .filter(task => {
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
      .slice(0, 3)
  }, [tasks]) // tasks가 변경될 때만 재계산
    .slice(0, 3) || []

  if (urgentTasks.length === 0) {
    return null // 위젯 숨김
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
/**
 * Props 비교 함수
 * tasks 배열의 길이와 각 task의 id, completed, dueDate만 비교
 */
const arePropsEqual = (prevProps, nextProps) => {
  // 로딩 상태 비교
  if (prevProps.isLoading !== nextProps.isLoading) return false

  const prevTasks = prevProps.tasks || []
  const nextTasks = nextProps.tasks || []

  // 배열 길이가 다르면 다름
  if (prevTasks.length !== nextTasks.length) return false

  // 각 task의 주요 속성만 비교
  for (let i = 0; i < prevTasks.length; i++) {
    const prev = prevTasks[i]
    const next = nextTasks[i]

    if (
      prev?.id !== next?.id ||
      prev?.completed !== next?.completed ||
      prev?.dueDate !== next?.dueDate ||
      prev?.title !== next?.title
    ) {
      return false
    }
  }

  return true
}

/**
 * 메모이제이션된 UrgentTasks 컴포넌트
 */
export default memo(UrgentTasksComponent, arePropsEqual)

        할일 전체보기 →
      </Link>
    </div>
  )
}
