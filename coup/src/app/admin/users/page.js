// src/app/admin/users/page.js
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 })
  const [summary, setSummary] = useState({ total: 0, active: 0, suspended: 0, deleted: 0 })
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      })

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()

      if (data.success) {
        setUsers(data.data.users)
        setPagination(data.data.pagination)
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  const getStatusBadge = (status) => {
    const classes = {
      ACTIVE: styles.badgeStatus,
      SUSPENDED: `${styles.badgeStatus} ${styles.suspended}`,
      DELETED: `${styles.badgeStatus} ${styles.deleted}`
    }
    const labels = {
      ACTIVE: '활성',
      SUSPENDED: '정지',
      DELETED: '탈퇴'
    }
    return (
      <span className={classes[status]}>
        {labels[status]}
      </span>
    )
  }

  const getRoleBadge = (role) => {
    const classes = {
      USER: styles.badgeRole,
      ADMIN: `${styles.badgeRole} ${styles.admin}`,
      SYSTEM_ADMIN: `${styles.badgeRole} ${styles.systemAdmin}`
    }
    return (
      <span className={classes[role]}>
        {role}
      </span>
    )
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>사용자 관리</h1>
        <p className={styles.subtitle}>
          총 {summary.total.toLocaleString()}명 | 활성: {summary.active.toLocaleString()} |
          정지: {summary.suspended.toLocaleString()} | 탈퇴: {summary.deleted.toLocaleString()}
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.filterCard}>
        <form onSubmit={handleSearch} className={styles.filterForm}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>검색</label>
              <input
                type="text"
                placeholder="ID, 이름, 이메일로 검색..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>상태</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">전체</option>
                <option value="ACTIVE">활성</option>
                <option value="SUSPENDED">정지</option>
                <option value="DELETED">탈퇴</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>역할</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">전체</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
              </select>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button
              type="button"
              onClick={() => {
                setFilters({ search: '', status: '', role: '', sortBy: 'createdAt', sortOrder: 'desc' })
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className={`${styles.filterButton} ${styles.filterButtonReset}`}
            >
              초기화
            </button>
            <button
              type="submit"
              className={`${styles.filterButton} ${styles.filterButtonSubmit}`}
            >
              검색
            </button>
          </div>
        </form>
      </div>

      {/* 사용자 목록 */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : users.length === 0 ? (
          <div className={styles.empty}>
            사용자가 없습니다
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr className={styles.tableHeadRow}>
                  <th className={styles.tableHeadCell}>사용자</th>
                  <th className={styles.tableHeadCell}>역할</th>
                  <th className={styles.tableHeadCell}>상태</th>
                  <th className={styles.tableHeadCell}>가입일</th>
                  <th className={styles.tableHeadCell}>최근 로그인</th>
                  <th className={styles.tableHeadCell}>스터디</th>
                  <th className={styles.tableHeadCell} style={{ textAlign: 'right' }}>작업</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {users.map((user) => (
                  <tr key={user.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.userCell}>
                        {user.avatar ? (
                          <Image
                            className={styles.userAvatar}
                            src={user.avatar}
                            alt=""
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className={styles.userAvatarPlaceholder}>
                            {user.name?.[0] || 'U'}
                          </div>
                        )}
                        <div className={styles.userInfo}>
                          <p className={styles.userName}>{user.name || '이름 없음'}</p>
                          <p className={styles.userEmail}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {getRoleBadge(user.role)}
                    </td>
                    <td className={styles.tableCell}>
                      {getStatusBadge(user.status)}
                      {user.status === 'SUSPENDED' && user.suspendedUntil && (
                        <div className={styles.suspendInfo}>
                          {new Date(user.suspendedUntil).toLocaleDateString('ko-KR')}까지
                        </div>
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className={styles.tableCell}>
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString('ko-KR')
                        : '-'
                      }
                    </td>
                    <td className={styles.tableCell}>
                      {user._count.studyMembers}개
                    </td>
                    <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className={styles.detailLink}
                      >
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 페이지네이션 */}
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                전체 <strong>{pagination.total}</strong>개 중{' '}
                <strong>{(pagination.page - 1) * pagination.limit + 1}</strong>
                {' '}-{' '}
                <strong>
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </strong>
              </div>
              <div className={styles.paginationButtons}>
                {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`${styles.pageButton} ${pagination.page === page ? styles.active : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <div className={styles.paginationMobile}>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className={styles.pageButton}
                >
                  이전
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className={styles.pageButton}
                >
                  다음
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

