// src/app/admin/studies/page.js
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

export default function AdminStudiesPage() {
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 })
  const [summary, setSummary] = useState({ total: 0, active: 0, recruiting: 0 })
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isPublic: '',
    isRecruiting: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  useEffect(() => {
    fetchStudies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters])

  const fetchStudies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      })

      const res = await fetch(`/api/admin/studies?${params}`)
      const data = await res.json()

      if (data.success) {
        setStudies(data.data.studies)
        setPagination(data.data.pagination)
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch studies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchStudies()
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>스터디 관리</h1>
        <p className={styles.subtitle}>
          총 {summary.total.toLocaleString()}개 | 공개: {summary.active.toLocaleString()} |
          모집중: {summary.recruiting.toLocaleString()}
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
                placeholder="ID, 이름, 태그, 생성자로 검색..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>카테고리</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">전체</option>
                <option value="프로그래밍">프로그래밍</option>
                <option value="취업">취업</option>
                <option value="어학">어학</option>
                <option value="자격증">자격증</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>공개 여부</label>
              <select
                value={filters.isPublic}
                onChange={(e) => setFilters({ ...filters, isPublic: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">전체</option>
                <option value="true">공개</option>
                <option value="false">비공개</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>모집 상태</label>
              <select
                value={filters.isRecruiting}
                onChange={(e) => setFilters({ ...filters, isRecruiting: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">전체</option>
                <option value="true">모집중</option>
                <option value="false">모집마감</option>
              </select>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button
              type="button"
              onClick={() => {
                setFilters({ search: '', category: '', isPublic: '', isRecruiting: '', sortBy: 'createdAt', sortOrder: 'desc' })
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

      {/* 스터디 목록 */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : studies.length === 0 ? (
          <div className={styles.empty}>
            스터디가 없습니다
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeadCell}>스터디</th>
                  <th className={styles.tableHeadCell}>멤버</th>
                  <th className={styles.tableHeadCell}>공개</th>
                  <th className={styles.tableHeadCell}>모집</th>
                  <th className={styles.tableHeadCell}>평점</th>
                  <th className={styles.tableHeadCell}>생성일</th>
                  <th className={styles.tableHeadCell} style={{ textAlign: 'right' }}>작업</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {studies.map((study) => (
                  <tr key={study.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.studyCell}>
                        <span className={styles.studyEmoji}>{study.emoji}</span>
                        <div className={styles.studyInfo}>
                          <p className={styles.studyName}>{study.name}</p>
                          <p className={styles.studyCategory}>{study.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.memberCount}>
                        <span className={styles.current}>{study._count.members}</span>
                        <span className={styles.max}>/{study.maxMembers}</span>
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={study.isPublic ? styles.badgePublic : styles.badgePrivate}>
                        {study.isPublic ? '공개' : '비공개'}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={study.isRecruiting ? styles.badgeRecruiting : styles.badgeClosed}>
                        {study.isRecruiting ? '모집중' : '마감'}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      {study.rating ? (
                        <>
                          <span className={styles.star}>⭐</span> {study.rating.toFixed(1)}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      {new Date(study.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                      <div className={styles.actions}>
                        <Link
                          href={`/admin/studies/${study.id}`}
                          className={styles.actionLink}
                        >
                          상세보기
                        </Link>
                      </div>
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}

