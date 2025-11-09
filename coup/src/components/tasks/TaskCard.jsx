import { getTimeLeft } from '@/utils/time'
import { calculatePercentage } from '@/utils/format'
import styles from './TaskCard.module.css'

export default function TaskCard({ task, onToggleComplete, onDeleteTask }) {
  const timeLeft = getTimeLeft(task.dueDate)
  const completionRate = calculatePercentage(task.completedCount, task.totalCount)

  const getDeadlineClass = () => {
    if (timeLeft.expired) return styles.deadlineExpired
    if (timeLeft.urgent) return styles.deadlineUrgent
    return styles.deadlineNormal
  }

  const getCardClass = () => {
    let classes = [styles.taskCard]
    if (task.completed) classes.push(styles.completed)
    if (timeLeft.urgent && !task.completed) classes.push(styles.urgent)
    return classes.join(' ')
  }

  return (
    <div className={getCardClass()}>
      <div className={styles.taskHeader}>
        <div
          className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
          onClick={() => onToggleComplete(task.id)}
        >
          {task.completed && '✓'}
        </div>
        <h3 className={styles.taskTitle}>{task.title}</h3>
        <button
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation()
            onDeleteTask(task.id)
          }}
          title="삭제"
        >
          🗑️
        </button>
      </div>

      <div className={styles.taskMeta}>
        <div className={styles.studyInfo}>
          <span>{task.studyEmoji}</span>
          <span>{task.studyName}</span>
        </div>

        <div className={`${styles.deadline} ${getDeadlineClass()}`}>
          ⏰ {timeLeft.text}
        </div>

        <div className={styles.progress}>
          👥 {task.completedCount}/{task.totalCount}명 완료 ({completionRate}%)
        </div>
      </div>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}
    </div>
  )
}
