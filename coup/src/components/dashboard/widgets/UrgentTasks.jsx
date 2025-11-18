'use client'

import styles from './Widget.module.css'
import Link from 'next/link'

export default function UrgentTasks({ tasks }) {
  const urgentTasks = tasks?.filter(task => {
    const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    return !task.completed && daysUntilDue >= 0 && daysUntilDue <= 3
  }).slice(0, 3) || []

  if (urgentTasks.length === 0) {
    return null
  }

  const getUrgencyColor = (daysUntilDue) => {
    if (daysUntilDue <= 1) return '🔴'
    if (daysUntilDue <= 3) return '🟡'
    return '🟢'
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>✅ 급한 할일</h3>
        <span className={styles.badge}>{urgentTasks.length}</span>
      </div>

      <div className={styles.tasksList}>
        {urgentTasks.map((task) => {
          const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
          
          return (
            <div key={task.id} className={styles.taskItem}>
              <div className={styles.taskHeader}>
                <span className={styles.urgencyIndicator}>
                  {getUrgencyColor(daysUntilDue)}
                </span>
                <span className={styles.taskTitle}>{task.title}</span>
              </div>
              <div className={styles.taskMeta}>
                <span className={styles.taskDue}>
                  D-{daysUntilDue} ({new Date(task.dueDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })})
                </span>
              </div>
              {task.studyName && (
                <div className={styles.taskStudy}>{task.studyName}</div>
              )}
            </div>
          )
        })}
      </div>

      <Link href="/tasks" className={styles.widgetLink}>
        할일 전체보기 →
      </Link>
    </div>
  )
}

