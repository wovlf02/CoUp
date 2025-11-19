'use client'

import { useMyStudies } from '@/lib/hooks/useApi'
import styles from './TaskFilters.module.css'

export default function TaskFilters({ filter, setFilter, taskCount }) {
  const { data: studiesData } = useMyStudies({ limit: 50, filter: 'active' })
  // API 응답에서 study 객체만 추출
  const studies = studiesData?.data?.map(item => item.study).filter(study => study) || []

  const incompleteCount = taskCount || 0

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
          onChange={(e) => setFilter({ ...filter, studyId: e.target.value || null })}
        >
          <option value="">전체 스터디</option>
          {studies.map(study => (
            <option key={study.id} value={study.id}>
              {study.emoji} {study.name}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="all">전체 상태</option>
          <option value="incomplete">미완료만</option>
          <option value="completed">완료만</option>
        </select>

        <select
          className={styles.select}
          value={filter.sortBy}
          onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
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
