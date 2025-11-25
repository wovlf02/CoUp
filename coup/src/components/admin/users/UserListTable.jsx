'use client'

import UserTableRow from './UserTableRow'
import styles from './UserListTable.module.css'

/**
 * 사용자 목록 테이블 컴포넌트
 */
export default function UserListTable({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onUserClick,
  sortConfig,
  onSort,
  isLoading = false
}) {
  const isAllSelected = users.length > 0 && users.every(u => selectedUsers.includes(u.id))

  const handleSort = (column) => {
    if (onSort) {
      const direction = sortConfig?.column === column && sortConfig?.direction === 'asc' ? 'desc' : 'asc'
      onSort({ column, direction })
    }
  }

  const getSortIcon = (column) => {
    if (sortConfig?.column !== column) return '⇅'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  if (isLoading) {
    return (
      <div className={styles.userListTableLoading}>
        <div className={styles.spinner} />
        <p>사용자 목록을 불러오는 중...</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className={styles.userListTableEmpty}>
        <span className={styles.emptyIcon}>👥</span>
        <p>사용자가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={styles.userListTableWrapper}>
      <table className={styles.userListTable}>
        <thead className={styles.userListTableHeader}>
          <tr>
            <th style={{ width: '50px' }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked ? users.map(u => u.id) : [])}
                aria-label="전체 선택"
                className={styles.userListTableCheckbox}
              />
            </th>
            <th
              className={styles.userListTableSortable}
              onClick={() => handleSort('name')}
            >
              사용자 {getSortIcon('name')}
            </th>
            <th
              className={styles.userListTableSortable}
              onClick={() => handleSort('email')}
            >
              이메일 {getSortIcon('email')}
            </th>
            <th
              className={styles.userListTableSortable}
              onClick={() => handleSort('createdAt')}
            >
              가입일 {getSortIcon('createdAt')}
            </th>
            <th
              className={styles.userListTableSortable}
              onClick={() => handleSort('lastLoginAt')}
            >
              활동 {getSortIcon('lastLoginAt')}
            </th>
            <th
              className={styles.userListTableSortable}
              onClick={() => handleSort('status')}
            >
              상태 {getSortIcon('status')}
            </th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody className={styles.userListTableBody}>
          {users.map(user => (
            <UserTableRow
              key={user.id}
              user={user}
              isSelected={selectedUsers.includes(user.id)}
              onSelect={onSelectUser}
              onClick={() => onUserClick(user)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

