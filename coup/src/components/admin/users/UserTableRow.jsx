'use client'

import styles from './UserTableRow.module.css'

/**
 * 사용자 테이블 행 컴포넌트
 */
export default function UserTableRow({ user, isSelected, onSelect, onClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '알 수 없음'
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    return `${Math.floor(diffInMinutes / 1440)}일 전`
  }

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'GOOGLE': return '🔵'
      case 'GITHUB': return '🐙'
      case 'EMAIL': return '📧'
      default: return '👤'
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE': return styles.statusActive
      case 'SUSPENDED': return styles.statusSuspended
      case 'DELETED': return styles.statusDeleted
      default: return ''
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE': return '활성'
      case 'SUSPENDED': return '정지'
      case 'DELETED': return '탈퇴'
      default: return status
    }
  }

  return (
    <tr
      className={`${styles.userTableRowContainer} ${
        user.status === 'SUSPENDED' ? styles.suspended : ''
      }`}
      onClick={onClick}
    >
      <td className={styles.userTableRowCell} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(user.id)}
          aria-label={`${user.name} 선택`}
          className={styles.userTableRowCheckbox}
        />
      </td>
      <td className={styles.userTableRowCell}>
        <div className={styles.userTableRowUser}>
          <div className={styles.userTableRowAvatar}>
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className={styles.userTableRowDetails}>
            <div className={styles.userTableRowName}>{user.name || '알 수 없음'}</div>
            <div className={styles.userTableRowProvider}>
              {getProviderIcon(user.provider)} {user.provider}
            </div>
          </div>
        </div>
      </td>
      <td className={styles.userTableRowCell}>{user.email}</td>
      <td className={styles.userTableRowCell}>{formatDate(user.createdAt)}</td>
      <td className={styles.userTableRowCell}>
        <div className={styles.userTableRowActivity}>
          <span
            className={`${styles.userTableRowOnlineIndicator} ${
              user.status === 'ACTIVE' ? styles.online : styles.offline
            }`}
          />
          {formatTimeAgo(user.lastLoginAt)}
        </div>
      </td>
      <td className={styles.userTableRowCell}>
        <span className={`${styles.userTableRowStatus} ${getStatusClass(user.status)}`}>
          {getStatusText(user.status)}
        </span>
      </td>
      <td className={styles.userTableRowCell} onClick={(e) => e.stopPropagation()}>
        <button className={styles.userTableRowActionBtn} aria-label="작업 메뉴">
          ⋯
        </button>
      </td>
    </tr>
  )
}

