'use client'

import styles from './StatCard.module.css'

export default function StatCard({
  icon,
  label,
  value,
  change,
  period,
  onClick
}) {
  const getChangeClass = () => {
    if (change > 0) return 'increase'
    if (change < 0) return 'decrease'
    return 'neutral'
  }

  const getChangeSymbol = () => {
    if (change > 0) return '🔺'
    if (change < 0) return '🔻'
    return '➖'
  }

  return (
    <div className={styles.statCard} onClick={onClick}>
      <div className={styles.statHeader}>
        <span className={styles.statIcon}>{icon}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>

      <div className={styles.statNumber}>
        {value.toLocaleString()}
      </div>

      <div className={`${styles.statChange} ${styles[getChangeClass()]}`}>
        <span>{getChangeSymbol()}</span>
        <span>
          {change > 0 ? '+' : ''}{change}
        </span>
        {period && (
          <span className={styles.statPeriod}>({period})</span>
        )}
      </div>
    </div>
  )
}

