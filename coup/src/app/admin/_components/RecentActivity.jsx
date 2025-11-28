'use client'

import { Card, CardHeader, CardContent } from '@/components/admin/ui/Card'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import styles from './RecentActivity.module.css'

/**
 * RecentActivity 컴포넌트
 * 최근 활동 타임라인
 */
export default function RecentActivity({ activity }) {
  // activity를 안전하게 배열로 변환
  const activityList = Array.isArray(activity) ? activity : []

  if (activityList.length === 0) {
    return (
      <Card variant="outlined">
        <CardHeader>
          <h3>최근 활동</h3>
        </CardHeader>
        <CardContent>
          <div className={styles.empty}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>최근 활동이 없습니다</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="outlined">
      <CardHeader>
        <div className={styles.header}>
          <h3>최근 활동</h3>
          <Button size="sm" variant="ghost">전체보기</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className={styles.timeline}>
          {activityList.map((item, index) => (
            <div key={item.id || index} className={styles.timelineItem}>
              <div className={styles.timelineIcon} style={{
                backgroundColor: getActivityColor(item.type).bg,
                color: getActivityColor(item.type).fg,
              }}>
                {getActivityIcon(item.type)}
              </div>

              <div className={styles.timelineContent}>
                <div className={styles.timelineTop}>
                  <span className={styles.timelineTitle}>{item.title}</span>
                  <span className={styles.timelineTime}>{formatRelativeTime(item.createdAt)}</span>
                </div>

                {item.description && (
                  <p className={styles.timelineDescription}>{item.description}</p>
                )}

                {item.user && (
                  <div className={styles.timelineUser}>
                    <span className={styles.userName}>{item.user.name}</span>
                    {item.badge && (
                      <Badge size="sm" variant={item.badge.variant}>
                        {item.badge.label}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getActivityIcon(type) {
  const icons = {
    USER_CREATED: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
      </svg>
    ),
    STUDY_CREATED: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z" clipRule="evenodd" />
      </svg>
    ),
    REPORT_CREATED: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    PAYMENT: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M1 4.25a3.733 3.733 0 012.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0016.75 2H3.25A2.25 2.25 0 001 4.25zM1 7.25A2.25 2.25 0 013.25 5h13.5A2.25 2.25 0 0119 7.25v5.5A2.25 2.25 0 0116.75 15H3.25A2.25 2.25 0 011 12.75v-5.5zm7.5 5c-.28 0-.5.22-.5.5s.22.5.5.5h3a.5.5 0 000-1h-3z" />
      </svg>
    ),
  }
  return icons[type] || icons.USER_CREATED
}

function getActivityColor(type) {
  const colors = {
    USER_CREATED: { bg: 'var(--pastel-purple-100)', fg: 'var(--pastel-purple-600)' },
    STUDY_CREATED: { bg: 'var(--pastel-teal-100)', fg: 'var(--pastel-teal-600)' },
    REPORT_CREATED: { bg: 'var(--pastel-orange-100)', fg: 'var(--pastel-orange-600)' },
    PAYMENT: { bg: 'var(--pastel-green-100)', fg: 'var(--pastel-green-600)' },
  }
  return colors[type] || colors.USER_CREATED
}

function formatRelativeTime(date) {
  if (!date) return ''

  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)

  if (diffInSeconds < 60) return '방금 전'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`

  return past.toLocaleDateString('ko-KR')
}

