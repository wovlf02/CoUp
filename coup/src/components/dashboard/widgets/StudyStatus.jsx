'use client'

import styles from './Widget.module.css'

export default function StudyStatus({ stats, nextEvent }) {
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>📊 스터디 현황</h3>
      
      {nextEvent && (
        <div className={styles.nextEvent}>
          <div className={styles.eventLabel}>🎯 다음 일정</div>
          <div className={styles.eventDday}>D-{nextEvent.dday}</div>
          <div className={styles.eventDate}>{nextEvent.date}</div>
          <div className={styles.eventTitle}>{nextEvent.title}</div>
        </div>
      )}

      <div className={styles.statItem}>
        <div className={styles.statLabel}>
          <span>👥 출석률</span>
          <span className={styles.statValue}>{stats.attendanceRate}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${stats.attendanceRate}%` }}
          />
        </div>
        <div className={styles.statDetail}>
          {stats.attendedCount}/{stats.totalAttendance}명 (이번 주)
        </div>
      </div>

      <div className={styles.statItem}>
        <div className={styles.statLabel}>
          <span>✅ 할일</span>
          <span className={styles.statValue}>{stats.taskCompletionRate}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${stats.taskCompletionRate}%` }}
          />
        </div>
        <div className={styles.statDetail}>
          {stats.completedTasks}/{stats.totalTasks}개 완료
        </div>
      </div>

      {stats.streakDays > 0 && (
        <div className={styles.streak}>
          <span>🔥 연속</span>
          <span className={styles.streakDays}>{stats.streakDays}일</span>
          <span className={styles.streakEmoji}>{'🔥'.repeat(Math.min(stats.streakDays, 5))}</span>
        </div>
      )}
    </div>
  )
}
