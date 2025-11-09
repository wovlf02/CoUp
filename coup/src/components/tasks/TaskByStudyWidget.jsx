import styles from './TaskByStudyWidget.module.css'

export default function TaskByStudyWidget({ stats }) {
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetHeader}>📊 스터디별 할 일</h3>
      <div className={styles.studyList}>
        {Object.entries(stats.byStudy).map(([studyId, data]) => (
          <div key={studyId} className={styles.studyItem}>
            <div className={styles.studyHeader}>
              <span>{data.emoji} {data.name}</span>
            </div>
            <div className={styles.studyStats}>
              미완료 {data.incomplete} / 완료 {data.completed}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

