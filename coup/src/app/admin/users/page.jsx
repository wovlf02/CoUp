'use client'

import { useState, useMemo } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import CurrentTimeWidget from '@/components/admin/CurrentTimeWidget'
import UserSearchBar from '@/components/admin/users/UserSearchBar'
import UserFilters from '@/components/admin/users/UserFilters'
import UserBulkActions from '@/components/admin/users/UserBulkActions'
import UserListTable from '@/components/admin/users/UserListTable'
import UserPagination from '@/components/admin/users/UserPagination'
import UserDetailModal from '@/components/admin/UserDetailModal'
import SuspendUserModal from '@/components/admin/SuspendUserModal'
import { useAdminUsers, useSuspendUser } from '@/lib/hooks/useApi'
import { useUserFilters } from '@/lib/hooks/admin/useUserFilters'
import { useUserSearch } from '@/lib/hooks/admin/useUserSearch'
import { useUserSelection } from '@/lib/hooks/admin/useUserSelection'
import { getMockUsers } from '@/mocks/users'
import styles from './page.module.css'

export default function AdminUsersPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState({ column: 'createdAt', direction: 'desc' })
  const [selectedUser, setSelectedUser] = useState(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)

  // API Hooks
  const { data: usersData, isLoading } = useAdminUsers({
    page: currentPage,
    limit: itemsPerPage
  })
  const suspendUserMutation = useSuspendUser()

  // Mock 데이터 (데이터가 없을 경우)
  const allUsers = usersData?.data?.length > 0 ? usersData.data : getMockUsers()

  // Custom Hooks
  const {
    filters,
    filteredUsers,
    activeFilterCount,
    setStatusFilter,
    setProviderFilter,
    setDateRangeFilter,
    resetFilters
  } = useUserFilters(allUsers)

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching
  } = useUserSearch(filteredUsers)

  const {
    selectedUsers,
    selectedCount,
    selectUser,
    selectAll,
    deselectAll
  } = useUserSelection()

  // 정렬 처리
  const sortedUsers = useMemo(() => {
    const sorted = [...searchResults]
    sorted.sort((a, b) => {
      const aValue = a[sortConfig.column]
      const bValue = b[sortConfig.column]

      if (aValue === bValue) return 0
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    return sorted
  }, [searchResults, sortConfig])

  // 페이지네이션 처리
  const totalItems = sortedUsers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage)

  // 핸들러
  const handleUserClick = (user) => {
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }

  const handleSuspendUser = () => {
    setIsUserModalOpen(false)
    setIsSuspendModalOpen(true)
  }

  const handleConfirmSuspend = async (data) => {
    try {
      await suspendUserMutation.mutateAsync({
        id: data.userId,
        data: { duration: data.duration, reason: data.details }
      })
      alert(`계정이 정지되었습니다.`)
      setIsSuspendModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      alert('계정 정지 실패: ' + error.message)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    deselectAll()
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
    deselectAll()
  }

  // 통계 계산
  const stats = useMemo(() => ({
    total: allUsers.length,
    active: allUsers.filter(u => u.status === 'ACTIVE').length,
    suspended: allUsers.filter(u => u.status === 'SUSPENDED').length,
    deleted: allUsers.filter(u => u.status === 'DELETED').length,
    google: allUsers.filter(u => u.provider === 'GOOGLE').length,
    github: allUsers.filter(u => u.provider === 'GITHUB').length,
    email: allUsers.filter(u => u.provider === 'EMAIL').length
  }), [allUsers])

  return (
    <AdminLayout>
      <div className="adminPageWrapper">
        <div className="adminMainContent">
          <div className={styles.usersPageContainer}>
            {/* Header */}
            <div className="contentHeader">
              <h1 className="contentTitle">사용자 관리</h1>
              <span className={styles.usersPageTotalCount}>
                전체 {totalItems.toLocaleString()}명
              </span>
            </div>

            {/* Search and Filters */}
            <div className={styles.usersPageToolbar}>
              <UserSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                isSearching={isSearching}
              />
            </div>

            <UserFilters
              filters={filters}
              onStatusChange={setStatusFilter}
              onProviderChange={setProviderFilter}
              onDateRangeChange={setDateRangeFilter}
              onReset={resetFilters}
              activeFilterCount={activeFilterCount}
            />

            {/* Bulk Actions */}
            <UserBulkActions
              selectedCount={selectedCount}
              onEmailSend={() => alert('이메일 발송 기능 (개발 예정)')}
              onSuspend={() => alert('일괄 정지 기능 (개발 예정)')}
              onDelete={() => alert('일괄 삭제 기능 (개발 예정)')}
              onExport={() => alert('엑셀 내보내기 기능 (개발 예정)')}
              onDeselectAll={deselectAll}
            />

            {/* User List Table */}
            <UserListTable
              users={displayedUsers}
              selectedUsers={selectedUsers}
              onSelectUser={selectUser}
              onSelectAll={selectAll}
              onUserClick={handleUserClick}
              sortConfig={sortConfig}
              onSort={setSortConfig}
              isLoading={isLoading}
            />

            {/* Pagination */}
            <UserPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>

        {/* Right Widget */}
        <div className="rightWidget">
          {/* Current Time Widget */}
          <CurrentTimeWidget />

          <div className="widget">
            <div className="widgetTitle">📊 사용자 통계</div>
            <div className="widgetContent">
              <div className={styles.usersPageStatItem}>
                <div className={styles.usersPageStatLabel}>전체 사용자</div>
                <div className={styles.usersPageStatValue}>{stats.total}</div>
              </div>
              <div className={styles.usersPageStatDivider} />
              <div className={styles.usersPageStatRow}>
                <span className={styles.usersPageStatRowLabel}>활성</span>
                <span className={styles.usersPageStatRowValue}>{stats.active}명</span>
              </div>
              <div className={styles.usersPageStatRow}>
                <span className={styles.usersPageStatRowLabel}>정지</span>
                <span className={styles.usersPageStatRowValue}>{stats.suspended}명</span>
              </div>
              <div className={styles.usersPageStatRow}>
                <span className={styles.usersPageStatRowLabel}>탈퇴</span>
                <span className={styles.usersPageStatRowValue}>{stats.deleted}명</span>
              </div>
            </div>
          </div>

          <div className="widget">
            <div className="widgetTitle">🔍 가입 방법별</div>
            <div className="widgetContent">
              <div className={styles.usersPageStatRow}>
                <span className={styles.usersPageStatRowLabel}>🔵 Google</span>
                <span className={styles.usersPageStatRowValue}>{stats.google}명</span>
              </div>
              <div className={styles.usersPageStatRow}>
                <span className={styles.usersPageStatRowLabel}>🐙 GitHub</span>
                <span className={styles.usersPageStatRowValue}>{stats.github}명</span>
              </div>
              <div className={styles.usersPageStatRow}>
                <span className={styles.usersPageStatRowLabel}>📧 Email</span>
                <span className={styles.usersPageStatRowValue}>{stats.email}명</span>
              </div>
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

