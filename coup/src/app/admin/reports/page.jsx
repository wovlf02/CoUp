'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import ReportDetailModal from '@/components/admin/ReportDetailModal'
import { useAdminReports, useProcessReport } from '@/lib/hooks/useApi'
import styles from '../users/page.module.css'

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // 실제 API 호출
  const { data, isLoading, error } = useAdminReports({
    status: statusFilter === 'all' ? undefined : statusFilter.toUpperCase(),
    priority: priorityFilter === 'all' ? undefined : priorityFilter.toUpperCase(),
    page: 1,
    limit: 50
  })

  const processReport = useProcessReport()
  const reports = data?.data || []

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return '#EF4444'
      case 'HIGH': return '#F59E0B'
      case 'MEDIUM': return '#FCD34D'
      case 'LOW': return '#10B981'
      default: return '#9CA3AF'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'URGENT': return '🔴'
      case 'HIGH': return '🟠'
      case 'MEDIUM': return '🟡'
      case 'LOW': return '🟢'
      default: return '⚪'
    }
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return `${Math.floor(diffInHours / 24)}일 전`
  }

  // 클라이언트 사이드 타입 필터링
  const filteredReports = reports.filter(report => {
    if (typeFilter !== 'all' && report.type !== typeFilter) {
      return false
    }
    return true
  })

  const handleReportClick = (report) => {
    setSelectedReport(report)
    setIsReportModalOpen(true)
  }

  const handleProcessReport = async (data) => {
    try {
      await processReport.mutateAsync({ id: selectedReport.id, data })
      alert(`신고가 처리되었습니다.\n액션: ${data.action}\n메모: ${data.memo}`)
      setIsReportModalOpen(false)
      setSelectedReport(null)
    } catch (error) {
      console.error('신고 처리 실패:', error)
      alert('신고 처리에 실패했습니다.')
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="adminPageWrapper">
          <div className="adminMainContent">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              신고 목록을 불러오는 중...
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <AdminLayout>
        <div className="adminPageWrapper">
          <div className="adminMainContent">
            <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
              신고 목록을 불러오는데 실패했습니다. 다시 시도해주세요.
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="adminPageWrapper">
        <div className="adminMainContent">
          <div className={styles.usersPage}>
            {/* Header */}
            <div className="contentHeader">
              <h1 className="contentTitle">신고 관리</h1>
              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                총 {filteredReports.length}건
              </span>
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
              <div className={styles.filterGroup}>
                <select
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">전체</option>
                  <option value="pending">미처리</option>
                  <option value="in_progress">처리중</option>
                  <option value="resolved">완료</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <select
                  className={styles.filterSelect}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">모든 유형</option>
                  <option value="SPAM">스팸/광고</option>
                  <option value="HARASSMENT">욕설/비방</option>
                  <option value="INAPPROPRIATE">부적절</option>
                  <option value="COPYRIGHT">저작권</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <select
                  className={styles.filterSelect}
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">모든 우선순위</option>
                  <option value="urgent">긴급</option>
                  <option value="high">높음</option>
                  <option value="medium">중간</option>
                  <option value="low">낮음</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className={styles.tableSection}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>
                      <input type="checkbox" />
                    </th>
                    <th style={{ width: '60px' }}>🚨</th>
                    <th>유형</th>
                    <th>대상</th>
                    <th>신고자</th>
                    <th>우선순위</th>
                    <th>상태</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(report => (
                    <tr
                      key={report.id}
                      onClick={() => handleReportClick(report)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" />
                      </td>
                      <td>
                        <span style={{ fontSize: '1.5rem' }}>
                          {getPriorityIcon(report.priority)}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge}`}
                          style={{
                            background: report.type === 'SPAM' ? '#FEE2E2' :
                                      report.type === 'HARASSMENT' ? '#FED7AA' : '#FEF3C7',
                            color: report.type === 'SPAM' ? '#DC2626' :
                                   report.type === 'HARASSMENT' ? '#C2410C' : '#92400E'
                          }}
                        >
                          {report.type === 'SPAM' && '스팸'}
                          {report.type === 'HARASSMENT' && '욕설'}
                          {report.type === 'INAPPROPRIATE' && '부적절'}
                          {report.type === 'COPYRIGHT' && '저작권'}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                            {report.targetName || '대상 없음'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            {report.targetType === 'STUDY' && '📚 스터디'}
                            {report.targetType === 'USER' && '👤 사용자'}
                            {report.targetType === 'MESSAGE' && '💬 메시지'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: '500' }}>{report.reporter?.name || '알 수 없음'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            {report.reporter?.email || ''}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: getPriorityColor(report.priority)
                          }} />
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: getPriorityColor(report.priority) }}>
                            {report.priority === 'URGENT' && '긴급'}
                            {report.priority === 'HIGH' && '높음'}
                            {report.priority === 'MEDIUM' && '중간'}
                            {report.priority === 'LOW' && '낮음'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>
                          {formatTimeAgo(report.createdAt)}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          report.status === 'PENDING' ? styles.suspended :
                          report.status === 'RESOLVED' ? styles.active : ''
                        }`}>
                          {report.status === 'PENDING' && '미처리'}
                          {report.status === 'IN_PROGRESS' && '처리중'}
                          {report.status === 'RESOLVED' && '완료'}
                          {report.status === 'REJECTED' && '기각'}
                        </span>
                      </td>
                      <td>
                        <button className={styles.actionButton}>
                          ⋯
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {filteredReports.length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                  신고 내역이 없습니다.
                </div>
              )}

              {/* Pagination */}
              <div className={styles.pagination}>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  1-{filteredReports.length} / {filteredReports.length}
                </div>
                <div className={styles.paginationButtons}>
                  <button className={styles.pageButton} disabled>←</button>
                  <button className={`${styles.pageButton} ${styles.active}`}>1</button>
                  <button className={styles.pageButton} disabled>→</button>
                </div>
                <select className={styles.filterSelect}>
                  <option>50개씩</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Widget */}
        <div className="rightWidget">
          <div className="widget">
            <div className="widgetTitle">⚠️ 신고 통계</div>
            <div className="widgetContent">
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '4px' }}>
                  전체 신고
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                  {reports.length}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>미처리</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#EF4444' }}>
                    {reports.filter(r => r.status === 'PENDING').length}건
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>처리중</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#F59E0B' }}>
                    {reports.filter(r => r.status === 'IN_PROGRESS').length}건
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>완료</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10B981' }}>
                    {reports.filter(r => r.status === 'RESOLVED').length}건
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="widget">
            <div className="widgetTitle">📊 유형별 현황</div>
            <div className="widgetContent">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>🔴 스팸/광고</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {reports.filter(r => r.type === 'SPAM').length}건
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>🟠 욕설/비방</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {reports.filter(r => r.type === 'HARASSMENT').length}건
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>🟡 부적절</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {reports.filter(r => r.type === 'INAPPROPRIATE').length}건
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>📜 저작권</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {reports.filter(r => r.type === 'COPYRIGHT').length}건
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
                onClick={() => setPriorityFilter('urgent')}
              >
                긴급 신고만
              </button>
              <button
                className={styles.bulkButton}
                style={{ width: '100%', marginBottom: '8px' }}
                onClick={() => setStatusFilter('pending')}
              >
                미처리만 보기
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
      <ReportDetailModal
        report={selectedReport}
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false)
          setSelectedReport(null)
        }}
        onProcess={handleProcessReport}
      />
    </AdminLayout>
  )
}
