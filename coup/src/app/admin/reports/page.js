// src/app/admin/reports/page.js
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

export default function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 })
  const [summary, setSummary] = useState({ pending: 0, inProgress: 0, resolved: 0, rejected: 0, hold: 0 })
  const [filters, setFilters] = useState({
    search: '',
    status: 'PENDING,IN_PROGRESS',
    targetType: '',
    priority: '',
    assignedTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  useEffect(() => {
    fetchReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      })

      const res = await fetch(`/api/admin/reports?${params}`)
      const data = await res.json()

      if (data.success) {
        setReports(data.data.reports)
        setPagination(data.data.pagination)
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchReports()
  }

  const getStatusBadge = (status) => {
    const classes = {
      PENDING: styles.badgePending,
      IN_PROGRESS: styles.badgeInProgress,
      RESOLVED: styles.badgeResolved,
      REJECTED: styles.badgeRejected,
      HOLD: styles.badgeHold
    }
    const labels = {
      PENDING: '대기',
      IN_PROGRESS: '처리중',
      RESOLVED: '완료',
      REJECTED: '기각',
      HOLD: '보류'
    }
    return (
      <span className={`${styles.badge} ${classes[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const classes = {
      URGENT: styles.badgeUrgent,
      HIGH: styles.badgeHigh,
      NORMAL: styles.badgeNormal,
      LOW: styles.badgeLow
    }
    const labels = {
      URGENT: '⚠️ 긴급',
      HIGH: '높음',
      NORMAL: '보통',
      LOW: '낮음'
    }
    return (
      <span className={`${styles.badge} ${classes[priority]}`}>
        {labels[priority]}
      </span>
    )
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>신고 관리</h1>
        <p className={styles.subtitle}>
          미처리: {summary.pending} | 처리중: {summary.inProgress} |
          완료: {summary.resolved} | 기각: {summary.rejected} | 보류: {summary.hold}
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
                placeholder="신고 번호, 신고자, 피신고자로 검색..."
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
                <option value="PENDING">대기</option>
                <option value="IN_PROGRESS">처리중</option>
                <option value="PENDING,IN_PROGRESS">대기+처리중</option>
                <option value="RESOLVED">완료</option>
                <option value="REJECTED">기각</option>
                <option value="HOLD">보류</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>대상 유형</label>
              <select
                value={filters.targetType}
                onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">전체</option>
                <option value="USER">사용자</option>
                <option value="STUDY">스터디</option>
                <option value="MESSAGE">메시지</option>
                <option value="NOTICE">공지</option>
                <option value="FILE">파일</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>우선순위</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">전체</option>
                <option value="URGENT">긴급</option>
                <option value="HIGH">높음</option>
                <option value="NORMAL">보통</option>
                <option value="LOW">낮음</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>담당자</label>
              <select
                value={filters.assignedTo}
                onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="">전체</option>
                <option value="unassigned">미배정</option>
                <option value="me">내가 처리</option>
              </select>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button
              type="button"
              onClick={() => {
                setFilters({ search: '', status: 'PENDING,IN_PROGRESS', targetType: '', priority: '', assignedTo: '', sortBy: 'createdAt', sortOrder: 'desc' })
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

      {/* 신고 목록 */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : reports.length === 0 ? (
          <div className={styles.empty}>
            신고가 없습니다
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeadCell}>번호</th>
                  <th className={styles.tableHeadCell}>유형</th>
                  <th className={styles.tableHeadCell}>대상</th>
                  <th className={styles.tableHeadCell}>상태</th>
                  <th className={styles.tableHeadCell}>우선순위</th>
                  <th className={styles.tableHeadCell}>신고자</th>
                  <th className={styles.tableHeadCell}>담당자</th>
                  <th className={styles.tableHeadCell}>접수일</th>
                  <th className={styles.tableHeadCell} style={{ textAlign: 'right' }}>작업</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {reports.map((report) => (
                  <tr key={report.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <span className={styles.reportId}>#{report.id.slice(0, 8)}</span>
                    </td>
                    <td className={styles.tableCell}>
                      {report.targetType === 'USER' && '사용자'}
                      {report.targetType === 'STUDY' && '스터디'}
                      {report.targetType === 'MESSAGE' && '메시지'}
                      {report.targetType === 'NOTICE' && '공지'}
                      {report.targetType === 'FILE' && '파일'}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.targetInfo}>
                        <p className={styles.targetName}>{report.targetName || report.targetId}</p>
                        <p className={styles.targetType}>{report.type}</p>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {getStatusBadge(report.status)}
                    </td>
                    <td className={styles.tableCell}>
                      {getPriorityBadge(report.priority)}
                    </td>
                    <td className={styles.tableCell}>
                      {report.reporter.name}
                    </td>
                    <td className={styles.tableCell}>
                      {report.assignedTo ? (
                        <span className={styles.assigned}>{report.assignedTo.name}</span>
                      ) : (
                        <span className={styles.unassigned}>미배정</span>
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      {new Date(report.createdAt).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className={styles.actionLink}
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}

