import { calculatePercentage } from '@/utils/format'
import styles from './TaskProgressWidget.module.css'

export default function TaskProgressWidget({ stats }) {
  const totalTasks = stats.completed + stats.incomplete
  const progressPercent = calculatePercentage(stats.completed, totalTasks)

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetHeader}>⏰ 이번 주</h3>

      <div className={styles.progressInfo}>
        <span className={styles.progressText}>
          {totalTasks}건 중 {stats.completed}건 완료
        </span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className={styles.progressStats}>
        <div className={styles.statItem}>
          <span>✅ 완료</span>
          <span>{stats.completed}건</span>
        </div>
        <div className={styles.statItem}>
          <span>⏳ 진행중</span>
          <span>{stats.incomplete}건</span>
        </div>
        <div className={styles.statItem}>
          <span>📅 전체</span>
          <span>{totalTasks}건</span>
        </div>
      </div>
    </div>
  )
}

