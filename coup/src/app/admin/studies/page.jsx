'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminStudies } from '@/mocks/admin'
import styles from '../users/page.module.css'

export default function AdminStudiesPage() {
  const [studies, setStudies] = useState(adminStudies)
  const [selectedStudies, setSelectedStudies] = useState([])
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const filteredStudies = studies.filter(study => {
    if (visibilityFilter !== 'all' && study.visibility.toLowerCase() !== visibilityFilter) {
      return false
    }
    if (categoryFilter !== 'all' && study.category !== categoryFilter) {
      return false
    }
    if (searchQuery && !study.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const handleSelectStudy = (studyId) => {
    if (selectedStudies.includes(studyId)) {
      setSelectedStudies(selectedStudies.filter(id => id !== studyId))
    } else {
      setSelectedStudies([...selectedStudies, studyId])
    }
  }

  return (
    <AdminLayout>
      <div className={styles.usersPage}>
        {/* Header */}
        <div className="contentHeader">
          <h1 className="contentTitle">스터디 관리</h1>
          <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            전체 {filteredStudies.length}개
          </span>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <select
              className={styles.filterSelect}
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
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
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">모든 카테고리</option>
              <option value="PROGRAMMING">프로그래밍</option>
              <option value="JOB_PREP">취업/자격증</option>
              <option value="LANGUAGE">어학</option>
              <option value="EXERCISE">운동/취미</option>
              <option value="DESIGN">디자인</option>
            </select>
          </div>

          <input
            type="text"
            className={styles.searchInput}
            placeholder="🔍 스터디명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                <button className={styles.bulkButton}>
                  👁️‍🗨️ 숨김 처리
                </button>
                <button className={`${styles.bulkButton} ${styles.danger}`}>
                  🗑️ 강제 삭제
                </button>
              </div>
            </div>
          )}

          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <input type="checkbox" />
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
              {filteredStudies.map(study => (
                <tr key={study.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedStudies.includes(study.id)}
                      onChange={() => handleSelectStudy(study.id)}
                    />
                  </td>
                  <td>
                    <span style={{ fontSize: '2rem' }}>{study.icon}</span>
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
                      <div style={{ fontWeight: '500' }}>{study.owner.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {study.owner.provider}
                      </div>
                    </div>
                  </td>
                  <td>
                    {study.memberCount}/{study.maxMembers}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      study.visibility === 'PUBLIC' ? styles.active : styles.suspended
                    }`}>
                      {study.visibility === 'PUBLIC' ? '공개' : '비공개'}
                    </span>
                    {study.reportCount > 0 && (
                      <span style={{
                        marginLeft: '4px',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem'
                      }}>
                        ⚠️ 신고 {study.reportCount}건
                      </span>
                    )}
                  </td>
                  <td>{formatDate(study.createdAt)}</td>
                  <td>
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
              1-{filteredStudies.length} / {filteredStudies.length}
            </div>
            <div className={styles.paginationButtons}>
              <button className={styles.pageButton} disabled>←</button>
              <button className={`${styles.pageButton} ${styles.active}`}>1</button>
              <button className={styles.pageButton} disabled>→</button>
            </div>
            <select className={styles.filterSelect}>
              <option>10개씩</option>
            </select>
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
                {studies.length}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>활성</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>신고됨</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#EF4444' }}>
                  {studies.filter(s => s.reportCount > 0).length}개
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="widget">
          <div className="widgetTitle">📂 카테고리 현황</div>
          <div className="widgetContent">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>💻 프로그래밍</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {studies.filter(s => s.category === 'PROGRAMMING').length}개
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>💼 취업/자격증</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {studies.filter(s => s.category === 'JOB_PREP').length}개
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>🏃 운동/취미</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {studies.filter(s => s.category === 'EXERCISE').length}개
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>🎨 디자인</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {studies.filter(s => s.category === 'DESIGN').length}개
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
            >
              일괄 숨김
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
    </AdminLayout>
  )
}

