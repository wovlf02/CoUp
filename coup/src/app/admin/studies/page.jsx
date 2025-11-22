'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminStudies, useAdminDeleteStudy } from '@/lib/hooks/useApi'
import { getMockStudies } from '@/mocks/studies'
import styles from '../users/page.module.css'

export default function AdminStudiesPage() {
  const [selectedStudies, setSelectedStudies] = useState([])
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const studiesPerPage = 10

  // 실제 API Hooks
  const { data: studiesData, isLoading } = useAdminStudies({
    page: currentPage,
    limit: studiesPerPage,
    search: searchQuery || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined
  })
  const deleteStudyMutation = useAdminDeleteStudy()

  const studies = studiesData?.data || []
  const totalPages = studiesData?.pagination?.totalPages || 1
  const totalStudies = studiesData?.pagination?.total || 0

  // Mock 데이터 (데이터가 없을 경우)
  const displayStudies = studies.length === 0 ? getMockStudies() : studies

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const handleSelectStudy = (studyId) => {
    if (selectedStudies.includes(studyId)) {
      setSelectedStudies(selectedStudies.filter(id => id !== studyId))
    } else {
      setSelectedStudies([...selectedStudies, studyId])
    }
  }

  const handleSelectAll = () => {
    if (selectedStudies.length === displayStudies.length) {
      setSelectedStudies([])
    } else {
      setSelectedStudies(displayStudies.map(s => s.id))
    }
  }

  const handleDeleteStudy = async (studyId) => {
    if (!confirm('정말 이 스터디를 삭제하시겠습니까?')) return

    try {
      await deleteStudyMutation.mutateAsync(studyId)
      alert('스터디가 삭제되었습니다.')
      setSelectedStudies(selectedStudies.filter(id => id !== studyId))
    } catch (error) {
      alert('스터디 삭제 실패: ' + (error.message || '알 수 없는 오류'))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedStudies.length === 0) return
    if (!confirm(`선택한 ${selectedStudies.length}개의 스터디를 삭제하시겠습니까?`)) return

    try {
      await Promise.all(selectedStudies.map(id => deleteStudyMutation.mutateAsync(id)))
      alert('선택한 스터디가 모두 삭제되었습니다.')
      setSelectedStudies([])
    } catch (error) {
      alert('일부 스터디 삭제에 실패했습니다.')
    }
  }

  return (
    <AdminLayout>
      <div className="adminPageWrapper">
        <div className="adminMainContent">
          <div className={styles.usersPage}>
            {/* Header */}
            <div className="contentHeader">
              <h1 className="contentTitle">스터디 관리</h1>
              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                전체 {totalStudies}개
              </span>
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
              <div className={styles.filterGroup}>
                <select
                  className={styles.filterSelect}
                  value={visibilityFilter}
                  onChange={(e) => {
                    setVisibilityFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="all">전체</option>
                  <option value="public">공개</option>
                  <option value="private">비공개</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <select
                  className={styles.filterSelect}
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="all">모든 카테고리</option>
                  <option value="개발">개발</option>
                  <option value="언어">언어</option>
                  <option value="취업/자격증">취업/자격증</option>
                  <option value="교양/취미">교양/취미</option>
                  <option value="학업">학업</option>
                </select>
              </div>

              <input
                type="text"
                className={styles.searchInput}
                placeholder="🔍 스터디명으로 검색..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            {/* Table */}
            <div className={styles.tableSection}>
              {selectedStudies.length > 0 && (
                <div className={styles.tableHeader}>
                  <div className={styles.selectedInfo}>
                    {selectedStudies.length}개 선택됨
                  </div>
                  <div className={styles.bulkActions}>
                    <button
                      className={`${styles.bulkButton} ${styles.danger}`}
                      onClick={handleBulkDelete}
                    >
                      🗑️ 선택 삭제
                    </button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>로딩 중...</div>
              ) : displayStudies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  스터디가 없습니다.
                </div>
              ) : (
                <>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>
                          <input
                            type="checkbox"
                            checked={selectedStudies.length === displayStudies.length && displayStudies.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th style={{ width: '60px' }}>아이콘</th>
                        <th>스터디명</th>
                        <th>그룹장</th>
                        <th>멤버</th>
                        <th>공개</th>
                        <th>생성일</th>
                        <th>액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayStudies.map(study => (
                        <tr key={study.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedStudies.includes(study.id)}
                              onChange={() => handleSelectStudy(study.id)}
                            />
                          </td>
                          <td>
                            <span style={{ fontSize: '2rem' }}>{study.emoji || '📚'}</span>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                                {study.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                {study.category}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontWeight: '500' }}>{study.owner?.name || '알 수 없음'}</div>
                              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                {study.owner?.email}
                              </div>
                            </div>
                          </td>
                          <td>
                            {study._count?.members || 0}/{study.maxMembers || 50}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${
                              study.visibility === 'PUBLIC' ? styles.active : styles.suspended
                            }`}>
                              {study.visibility === 'PUBLIC' ? '공개' : '비공개'}
                            </span>
                          </td>
                          <td>{formatDate(study.createdAt)}</td>
                          <td>
                            <button
                              className={styles.actionButton}
                              onClick={() => handleDeleteStudy(study.id)}
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className={styles.pagination}>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                      {(currentPage - 1) * studiesPerPage + 1}-{Math.min(currentPage * studiesPerPage, totalStudies)} / {totalStudies}
                    </div>
                    <div className={styles.paginationButtons}>
                      <button
                        className={styles.pageButton}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        ←
                      </button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
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
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        →
                      </button>
                    </div>
                    <select
                      className={styles.filterSelect}
                      value={studiesPerPage}
                      disabled
                    >
                      <option>10개씩</option>
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
            <div className="widgetTitle">📊 스터디 통계</div>
            <div className="widgetContent">
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '4px' }}>
                  전체 스터디
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                  {totalStudies}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>공개</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {studies.filter(s => s.visibility === 'PUBLIC').length}개
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>비공개</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {studies.filter(s => s.visibility === 'PRIVATE').length}개
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="widget">
            <div className="widgetTitle">📂 카테고리 현황</div>
            <div className="widgetContent">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>💻 개발</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {studies.filter(s => s.category === '개발').length}개
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>💼 취업/자격증</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {studies.filter(s => s.category === '취업/자격증').length}개
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>🗣️ 언어</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {studies.filter(s => s.category === '언어').length}개
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>🎨 교양/취미</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {studies.filter(s => s.category === '교양/취미').length}개
                </span>
              </div>
            </div>
          </div>

          <div className="widget">
            <div className="widgetTitle">⚡ 빠른 액션</div>
            <div className="widgetContent">
              <button
                className={styles.bulkButton}
                style={{ width: '100%', marginBottom: '8px' }}
                onClick={handleBulkDelete}
                disabled={selectedStudies.length === 0}
              >
                일괄 삭제 ({selectedStudies.length})
              </button>
              <button
                className={styles.bulkButton}
                style={{ width: '100%' }}
                onClick={() => alert('엑셀 추출 기능은 개발 예정입니다.')}
              >
                엑셀 추출
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
