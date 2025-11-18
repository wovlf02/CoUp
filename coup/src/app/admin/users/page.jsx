'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import UserDetailModal from '@/components/admin/UserDetailModal'
import SuspendUserModal from '@/components/admin/SuspendUserModal'
import { useAdminUsers, useAdminUser, useSuspendUser, useRestoreUser } from '@/lib/hooks/useApi'
import styles from './page.module.css'

export default function AdminUsersPage() {
  const [selectedUsers, setSelectedUsers] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)
  const usersPerPage = 10

  // 실제 API Hooks
  const { data: usersData, isLoading } = useAdminUsers({
    page: currentPage,
    limit: usersPerPage,
    status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined,
    search: searchQuery || undefined
  })
  const suspendUserMutation = useSuspendUser()
  const restoreUserMutation = useRestoreUser()

  const users = usersData?.data || []
  const totalPages = usersData?.pagination?.totalPages || 1
  const totalUsers = usersData?.pagination?.total || 0

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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(u => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleUserClick = (user) => {
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }

  const handleSuspendUser = (user) => {
    setIsUserModalOpen(false)
    setIsSuspendModalOpen(true)
  }

  const handleConfirmSuspend = async (data) => {
    try {
      await suspendUserMutation.mutateAsync({
        id: data.userId,
        data: {
          duration: data.duration,
          reason: data.details
        }
      })
      alert(`계정이 정지되었습니다.\n사용자: ${data.userId}\n기간: ${data.duration}\n사유: ${data.details}`)
      setIsSuspendModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      alert('계정 정지 실패: ' + error.message)
    }
  }

  return (
    <AdminLayout>
      <div className="adminPageWrapper">
        <div className="adminMainContent">
          <div className={styles.usersPage}>
            {/* Header */}
            <div className="contentHeader">
              <h1 className="contentTitle">사용자 관리</h1>
              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                전체 {totalUsers}명
              </span>
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
              <div className={styles.filterGroup}>
                <select
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="all">전체</option>
                  <option value="active">활성</option>
                  <option value="suspended">정지</option>
                  <option value="deleted">탈퇴</option>
                </select>
              </div>

              <input
                type="text"
                className={styles.searchInput}
                placeholder="🔍 이름, 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />

              <button className={styles.filterSelect}>
                고급 검색
              </button>
            </div>

            {/* Table */}
            <div className={styles.tableSection}>
              {selectedUsers.length > 0 && (
                <div className={styles.tableHeader}>
                  <div className={styles.selectedInfo}>
                    {selectedUsers.length}명 선택됨
                  </div>
                  <div className={styles.bulkActions}>
                    <button className={styles.bulkButton}>
                      📧 이메일 발송
                    </button>
                    <button className={`${styles.bulkButton} ${styles.danger}`}>
                      ⚠️ 계정 정지
                    </button>
                    <button className={`${styles.bulkButton} ${styles.danger}`}>
                      🗑️ 계정 삭제
                    </button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>로딩 중...</div>
              ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  사용자가 없습니다.
                </div>
              ) : (
                <>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>사용자</th>
                        <th>이메일</th>
                        <th>가입일</th>
                        <th>활동</th>
                        <th>상태</th>
                        <th>액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr
                          key={user.id}
                          className={user.status === 'SUSPENDED' ? styles.suspended : ''}
                          onClick={() => handleUserClick(user)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                            />
                          </td>
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.userAvatar}>
                                {user.name?.charAt(0) || 'U'}
                              </div>
                              <div className={styles.userDetails}>
                                <div className={styles.userName}>{user.name || '알 수 없음'}</div>
                                <div className={styles.userProvider}>
                                  {user.provider === 'GOOGLE' && '🔵 Google'}
                                  {user.provider === 'GITHUB' && '🐙 GitHub'}
                                  {user.provider === 'EMAIL' && '📧 Email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span className={`${styles.onlineIndicator} ${
                                user.status === 'ACTIVE' ? styles.online : styles.offline
                              }`} />
                              {formatTimeAgo(user.lastLoginAt)}
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles[user.status?.toLowerCase()]}`}>
                              {user.status === 'ACTIVE' && '활성'}
                              {user.status === 'SUSPENDED' && '정지'}
                              {user.status === 'DELETED' && '탈퇴'}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button className={styles.actionButton}>
                              ⋯
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className={styles.pagination}>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                      {(currentPage - 1) * usersPerPage + 1}-{Math.min(currentPage * usersPerPage, totalUsers)} / {totalUsers}
                    </div>
                    <div className={styles.paginationButtons}>
                      <button
                        className={styles.pageButton}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        ←
                      </button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1
                        return (
                          <button
                            key={pageNum}
                            className={`${styles.pageButton} ${currentPage === pageNum ? styles.active : ''}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      <button
                        className={styles.pageButton}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        →
                      </button>
                    </div>
                    <select
                      className={styles.filterSelect}
                      value={usersPerPage}
                      onChange={(e) => {
                        // TODO: usersPerPage 변경 처리
                      }}
                    >
                      <option value={10}>10개씩</option>
                      <option value={20}>20개씩</option>
                      <option value={50}>50개씩</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Widget */}
        <div className="rightWidget">
          <div className="widget">
            <div className="widgetTitle">📊 사용자 통계</div>
            <div className="widgetContent">
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '4px' }}>
                  전체 사용자
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                  {totalUsers}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>활성</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {users.filter(u => u.status === 'ACTIVE').length}명
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>정지</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {users.filter(u => u.status === 'SUSPENDED').length}명
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>탈퇴</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {users.filter(u => u.status === 'DELETED').length}명
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="widget">
            <div className="widgetTitle">🔍 빠른 검색</div>
            <div className="widgetContent">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  가입 방법별
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Google</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {users.filter(u => u.provider === 'GOOGLE').length}명
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>GitHub</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {users.filter(u => u.provider === 'GITHUB').length}명
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Email</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {users.filter(u => u.provider === 'EMAIL').length}명
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="widget">
            <div className="widgetTitle">⚡ 빠른 액션</div>
            <div className="widgetContent">
              <button
                className={styles.bulkButton}
                style={{ width: '100%', marginBottom: '8px' }}
              >
                일괄 정지
              </button>
              <button
                className={styles.bulkButton}
                style={{ width: '100%', marginBottom: '8px' }}
              >
                일괄 삭제
              </button>
              <button
                className={styles.bulkButton}
                style={{ width: '100%' }}
              >
                엑셀 추출
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false)
          setSelectedUser(null)
        }}
        onSuspend={handleSuspendUser}
      />

      <SuspendUserModal
        user={selectedUser}
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        onConfirm={handleConfirmSuspend}
      />
    </AdminLayout>
  )
}
