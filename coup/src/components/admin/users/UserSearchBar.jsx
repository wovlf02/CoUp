'use client'

import styles from './UserSearchBar.module.css'

/**
 * 사용자 검색 바 컴포넌트
 */
export default function UserSearchBar({
  value,
  onChange,
  placeholder = '🔍 이름, 이메일로 검색...',
  isSearching = false
}) {
  const handleClear = () => {
    onChange('')
  }

  return (
    <div className={styles.userSearchBarContainer}>
      <span className={styles.userSearchBarIcon}>🔍</span>
      <input
        type="text"
        className={styles.userSearchBarInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="사용자 검색"
      />
      {isSearching && (
        <span className={styles.userSearchBarLoading}>
          <span className={styles.spinner} />
        </span>
      )}
      {value && !isSearching && (
        <button
          className={styles.userSearchBarClearBtn}
          onClick={handleClear}
          aria-label="검색어 지우기"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  )
}

