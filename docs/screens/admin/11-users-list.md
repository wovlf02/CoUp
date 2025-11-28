# 사용자 목록 페이지

> 사용자 조회, 검색, 필터링 및 관리

## 📁 파일 구조

```
src/app/admin/users/
├── page.jsx                    # 목록 페이지 (~100줄)
├── loading.jsx                 # 로딩 (~30줄)
└── _components/
    ├── UserTable.jsx          # 테이블 (~200줄)
    ├── UserTable.module.css
    ├── UserFilters.jsx        # 필터 (~150줄)
    ├── UserFilters.module.css
    ├── UserActions.jsx        # 액션 버튼 (~100줄)
    └── UserActions.module.css
```

## 1. 사용자 목록 페이지 (page.jsx)

**위치**: `src/app/admin/users/page.jsx`  
**코드 길이**: ~100줄

```jsx
import { Suspense } from 'react'
import UserTable from './_components/UserTable'
import UserFilters from './_components/UserFilters'
import styles from './page.module.css'

export const metadata = {
  title: '사용자 관리 | CoUp 관리자'
}

export default function UsersPage({ searchParams }) {
  return (
    <div className={styles.usersPage}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>사용자 관리</h1>
          <p className={styles.subtitle}>
            플랫폼 사용자를 조회하고 관리합니다
          </p>
        </div>
      </header>

      {/* 필터 패널 */}
      <div className={styles.filterSection}>
        <UserFilters />
      </div>

      {/* 사용자 테이블 */}
      <div className={styles.tableSection}>
        <Suspense fallback={<TableSkeleton />}>
          <UserTable searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className={styles.skeleton}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={styles.skeletonRow} />
      ))}
    </div>
  )
}
```

**CSS**: `src/app/admin/users/page.module.css`

```css
.usersPage {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title {
  font-size: var(--heading-xl);
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 var(--space-xs) 0;
}

.subtitle {
  font-size: var(--body-lg);
  color: var(--gray-600);
  margin: 0;
}

.filterSection {
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--space-lg);
}

.tableSection {
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  overflow: hidden;
}

.skeleton {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.skeletonRow {
  height: 60px;
  background: linear-gradient(90deg, var(--gray-100) 25%, var(--gray-50) 50%, var(--gray-100) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 2. 사용자 테이블 (UserTable.jsx)

**위치**: `src/app/admin/users/_components/UserTable.jsx`  
**코드 길이**: ~200줄

```jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import UserActions from './UserActions'
import styles from './UserTable.module.css'

export default function UserTable({ initialUsers, initialPagination }) {
  const router = useRouter()
  const [selectedUsers, setSelectedUsers] = useState([])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(initialUsers.map(u => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectOne = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      }
      return [...prev, userId]
    })
  }

  const handleRowClick = (userId) => {
    router.push(`/admin/users/${userId}`)
  }

  return (
    <div className={styles.userTable}>
      {/* 일괄 작업 바 */}
      {selectedUsers.length > 0 && (
        <div className={styles.bulkActions}>
          <span className={styles.bulkCount}>
            {selectedUsers.length}명 선택됨
          </span>
          <button className={styles.bulkButton}>
            일괄 내보내기
          </button>
          <button className={styles.bulkButton}>
            선택 해제
          </button>
        </div>
      )}

      {/* 테이블 */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedUsers.length === initialUsers.length}
                />
              </th>
              <th className={styles.userCell}>사용자</th>
              <th>이메일</th>
              <th>상태</th>
              <th>가입일</th>
              <th>활동</th>
              <th>경고</th>
              <th className={styles.actionsCell}>액션</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {initialUsers.map((user) => (
              <tr 
                key={user.id}
                className={styles.row}
                onClick={() => handleRowClick(user.id)}
              >
                <td 
                  className={styles.checkboxCell}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectOne(user.id)}
                  />
                </td>
                
                <td className={styles.userCell}>
                  <div className={styles.userInfo}>
                    <Image
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.name}
                      width={40}
                      height={40}
                      className={styles.avatar}
                    />
                    <div>
                      <div className={styles.userName}>{user.name}</div>
                      <div className={styles.userId}>ID: {user.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </td>
                
                <td>
                  <span className={styles.email}>{user.maskedEmail}</span>
                </td>
                
                <td>
                  <StatusBadge status={user.status} />
                </td>
                
                <td>
                  <span className={styles.date}>
                    {formatDate(user.createdAt)}
                  </span>
                </td>
                
                <td>
                  <div className={styles.activityStats}>
                    <span>스터디 {user.stats.studiesJoined}</span>
                    <span className={styles.dot}>•</span>
                    <span>메시지 {user.stats.messagesCount}</span>
                  </div>
                </td>
                
                <td>
                  <WarningBadge count={user.stats.warningCount} />
                </td>
                
                <td 
                  className={styles.actionsCell}
                  onClick={(e) => e.stopPropagation()}
                >
                  <UserActions user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <Pagination pagination={initialPagination} />
    </div>
  )
}

function StatusBadge({ status }) {
  const config = {
    ACTIVE: { label: '활성', color: 'success' },
    SUSPENDED: { label: '정지', color: 'danger' },
    DELETED: { label: '삭제', color: 'gray' }
  }
  
  const { label, color } = config[status] || config.ACTIVE
  
  return (
    <span className={`${styles.statusBadge} ${styles[color]}`}>
      {label}
    </span>
  )
}

function WarningBadge({ count }) {
  if (count === 0) return <span className={styles.noWarning}>없음</span>
  
  return (
    <span className={`${styles.warningBadge} ${count >= 3 ? styles.highWarning : ''}`}>
      {count}회
    </span>
  )
}

function Pagination({ pagination }) {
  const { page, totalPages } = pagination
  
  return (
    <div className={styles.pagination}>
      <button 
        className={styles.pageButton}
        disabled={page === 1}
      >
        이전
      </button>
      
      <span className={styles.pageInfo}>
        {page} / {totalPages}
      </span>
      
      <button 
        className={styles.pageButton}
        disabled={page === totalPages}
      >
        다음
      </button>
    </div>
  )
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
```

**CSS**: `src/app/admin/users/_components/UserTable.module.css`

```css
.userTable {
  display: flex;
  flex-direction: column;
}

.bulkActions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background-color: var(--admin-primary-light);
  border-bottom: 1px solid var(--admin-primary);
}

.bulkCount {
  font-weight: 600;
  color: var(--admin-primary);
}

.bulkButton {
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--admin-primary);
  background-color: white;
  color: var(--admin-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--body-sm);
  font-weight: 500;
}

.bulkButton:hover {
  background-color: var(--admin-primary);
  color: white;
}

.tableWrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.thead {
  background-color: var(--gray-50);
  border-bottom: 2px solid var(--gray-200);
}

.thead th {
  padding: var(--space-md) var(--space-lg);
  text-align: left;
  font-size: var(--body-sm);
  font-weight: 600;
  color: var(--gray-700);
  white-space: nowrap;
}

.tbody {
  font-size: var(--body-md);
}

.row {
  border-bottom: 1px solid var(--gray-100);
  cursor: pointer;
  transition: background-color 0.2s;
}

.row:hover {
  background-color: var(--gray-50);
}

.row td {
  padding: var(--space-md) var(--space-lg);
}

.checkboxCell {
  width: 40px;
  text-align: center;
}

.userCell {
  min-width: 200px;
}

.actionsCell {
  width: 80px;
  text-align: center;
}

.userInfo {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.avatar {
  border-radius: 50%;
  border: 2px solid var(--gray-200);
}

.userName {
  font-weight: 600;
  color: var(--gray-900);
}

.userId {
  font-size: var(--body-sm);
  color: var(--gray-500);
}

.email {
  color: var(--gray-700);
}

.date {
  color: var(--gray-600);
  font-size: var(--body-sm);
}

.activityStats {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--body-sm);
  color: var(--gray-600);
}

.dot {
  color: var(--gray-400);
}

.statusBadge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: var(--body-sm);
  font-weight: 600;
}

.statusBadge.success {
  background-color: #F0FDF4;
  color: #15803D;
}

.statusBadge.danger {
  background-color: #FEE2E2;
  color: #DC2626;
}

.statusBadge.gray {
  background-color: var(--gray-100);
  color: var(--gray-600);
}

.noWarning {
  color: var(--gray-400);
  font-size: var(--body-sm);
}

.warningBadge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #FEF3C7;
  color: #D97706;
  border-radius: 4px;
  font-size: var(--body-sm);
  font-weight: 600;
}

.warningBadge.highWarning {
  background-color: #FEE2E2;
  color: #DC2626;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-top: 1px solid var(--gray-200);
}

.pageButton {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--gray-300);
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--body-sm);
}

.pageButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pageInfo {
  font-size: var(--body-md);
  color: var(--gray-700);
}
```

## 3. 사용자 필터 (UserFilters.jsx)

**위치**: `src/app/admin/users/_components/UserFilters.jsx`  
**코드 길이**: ~150줄

```jsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './UserFilters.module.css'

export default function UserFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    role: searchParams.get('role') || 'all',
    sortBy: searchParams.get('sortBy') || 'createdAt'
  })

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // URL 업데이트
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all') params.set(k, v)
    })
    
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleReset = () => {
    setFilters({
      search: '',
      status: 'all',
      role: 'all',
      sortBy: 'createdAt'
    })
    router.push('/admin/users')
  }

  return (
    <div className={styles.userFilters}>
      <div className={styles.row}>
        {/* 검색 */}
        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder="이름, 이메일로 검색..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* 상태 */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>상태</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.select}
          >
            <option value="all">전체</option>
            <option value="ACTIVE">활성</option>
            <option value="SUSPENDED">정지</option>
            <option value="DELETED">삭제</option>
          </select>
        </div>

        {/* 정렬 */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>정렬</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className={styles.select}
          >
            <option value="createdAt">최근 가입순</option>
            <option value="lastLoginAt">최근 로그인순</option>
            <option value="warningCount">경고 많은순</option>
          </select>
        </div>

        {/* 초기화 */}
        <button 
          onClick={handleReset}
          className={styles.resetButton}
        >
          초기화
        </button>
      </div>
    </div>
  )
}
```

**CSS**: `src/app/admin/users/_components/UserFilters.module.css`

```css
.userFilters {
  width: 100%;
}

.row {
  display: flex;
  gap: var(--space-md);
  align-items: flex-end;
  flex-wrap: wrap;
}

.filterGroup {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  flex: 1;
  min-width: 200px;
}

.label {
  font-size: var(--body-sm);
  font-weight: 500;
  color: var(--gray-700);
}

.searchInput,
.select {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: var(--body-md);
  outline: none;
}

.searchInput:focus,
.select:focus {
  border-color: var(--admin-primary);
}

.resetButton {
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--gray-300);
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: var(--body-md);
}

.resetButton:hover {
  background-color: var(--gray-50);
}
```

## ✅ 체크리스트

- [x] Client Component (상호작용)
- [x] 검색 및 필터링
- [x] 정렬 기능
- [x] 일괄 선택
- [x] 페이지네이션
- [x] CSS 모듈 분리
- [x] 100-300줄 준수
- [x] 반응형 테이블

