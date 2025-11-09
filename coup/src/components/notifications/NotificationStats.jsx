import styles from './NotificationStats.module.css'

export default function NotificationStats({ stats }) {
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetHeader}>📊 알림 통계</h3>
      <div className={styles.statsList}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>오늘</span>
          <span className={styles.statValue}>{stats.today}건</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>이번 주</span>
          <span className={styles.statValue}>{stats.thisWeek}건</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>읽지않음</span>
          <span className={`${styles.statValue} ${styles.unread}`}>{stats.unread}건</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>전체</span>
          <span className={styles.statValue}>{stats.total}건</span>
        </div>
      </div>
    </div>
  )
}

