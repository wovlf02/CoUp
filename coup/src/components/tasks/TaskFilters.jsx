import styles from './TaskFilters.module.css'

export default function TaskFilters({ filter, onFilterChange, incompleteCount }) {
  const getBadgeClass = () => {
    if (incompleteCount >= 5) return styles.badgeUrgent
    if (incompleteCount >= 3) return styles.badgeWarning
    if (incompleteCount > 0) return styles.badgeNormal
    return styles.badgeSuccess
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <select
          className={styles.select}
          value={filter.studyId || ''}
          onChange={(e) => onFilterChange({ ...filter, studyId: e.target.value || null })}
        >
          <option value="">전체 스터디</option>
          <option value="1">💻 알고리즘 마스터</option>
          <option value="2">📝 취업 준비</option>
          <option value="3">🌍 영어 회화</option>
        </select>

        <select
          className={styles.select}
          value={filter.status}
          onChange={(e) => onFilterChange({ ...filter, status: e.target.value })}
        >
          <option value="all">전체 상태</option>
          <option value="incomplete">미완료만</option>
          <option value="completed">완료만</option>
        </select>

        <select
          className={styles.select}
          value={filter.sortBy}
          onChange={(e) => onFilterChange({ ...filter, sortBy: e.target.value })}
        >
          <option value="deadline">마감일순</option>
          <option value="created">최신순</option>
          <option value="study">스터디별</option>
        </select>
      </div>

      <div className={`${styles.progressBadge} ${getBadgeClass()}`}>
        📊 미완료 {incompleteCount}건
      </div>
    </div>
  )
}

