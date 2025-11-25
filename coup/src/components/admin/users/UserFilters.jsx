'use client'

import styles from './UserFilters.module.css'

/**
 * 사용자 필터 컴포넌트
 */
export default function UserFilters({
  filters,
  onStatusChange,
  onProviderChange,
  onDateRangeChange,
  onReset,
  activeFilterCount = 0
}) {
  return (
    <div className={styles.userFiltersBar}>
      <div className={styles.userFiltersGroup}>
        {/* 상태 필터 */}
        <select
          className={styles.userFiltersSelect}
          value={filters.status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="상태 필터"
        >
          <option value="all">전체 상태</option>
          <option value="active">활성</option>
          <option value="suspended">정지</option>
          <option value="deleted">탈퇴</option>
        </select>

        {/* 가입 방법 필터 */}
        <select
          className={styles.userFiltersSelect}
          value={filters.provider}
          onChange={(e) => onProviderChange(e.target.value)}
          aria-label="가입 방법 필터"
        >
          <option value="all">전체 가입 방법</option>
          <option value="google">Google</option>
          <option value="github">GitHub</option>
          <option value="email">Email</option>
        </select>

        {/* 날짜 범위 */}
        <div className={styles.userFiltersDateGroup}>
          <input
            type="date"
            className={styles.userFiltersDatePicker}
            value={filters.dateRange?.start || ''}
            onChange={(e) => onDateRangeChange({ ...filters.dateRange, start: e.target.value })}
            aria-label="시작 날짜"
          />
          <span className={styles.userFiltersDateSeparator}>~</span>
          <input
            type="date"
            className={styles.userFiltersDatePicker}
            value={filters.dateRange?.end || ''}
            onChange={(e) => onDateRangeChange({ ...filters.dateRange, end: e.target.value })}
            aria-label="종료 날짜"
          />
        </div>
      </div>

      {/* 필터 초기화 버튼 */}
      {activeFilterCount > 0 && (
        <button
          className={styles.userFiltersResetBtn}
          onClick={onReset}
          type="button"
        >
          🔄 초기화 ({activeFilterCount})
        </button>
      )}
    </div>
  )
}

