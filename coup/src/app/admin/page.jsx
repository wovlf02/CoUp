'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import UserGrowthChart from '@/components/admin/UserGrowthChart'
import StudyActivityChart from '@/components/admin/StudyActivityChart'
import ReportDetailModal from '@/components/admin/ReportDetailModal'
import UserDetailModal from '@/components/admin/UserDetailModal'
import SuspendUserModal from '@/components/admin/SuspendUserModal'
import { 
  adminStats, 
  userGrowthData, 
  studyActivitiesData,
  recentReports,
  recentUsers,
  systemStatus
} from '@/mocks/admin'
import styles from './page.module.css'

export default function AdminDashboard() {
  const router = useRouter()
  const [period, setPeriod] = useState('weekly')
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return `${Math.floor(diffInHours / 24)}일 전`
  }

  const handleReportClick = (report) => {
    setSelectedReport(report)
    setIsReportModalOpen(true)
  }

  const handleUserClick = (user) => {
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }

  const handleProcessReport = (data) => {
    console.log('신고 처리:', data)
    alert(`신고가 처리되었습니다.\\n액션: ${data.action}\\n메모: ${data.memo}`)
    setIsReportModalOpen(false)
    setSelectedReport(null)
  }

  const handleSuspendUser = (user) => {
    setIsUserModalOpen(false)
    setIsSuspendModalOpen(true)
  }

  const handleConfirmSuspend = (data) => {
    console.log('계정 정지:', data)
    alert(`계정이 정지되었습니다.\\n사용자: ${data.userId}\\n기간: ${data.duration}\\n사유: ${data.details}`)
    setIsSuspendModalOpen(false)
    setSelectedUser(null)
  }

  return (
    <AdminLayout>
      <div className={styles.dashboard}>
        {/* Header */}
        <div className="contentHeader">
          <h1 className="contentTitle">관리자 대시보드</h1>
          <button className="refreshButton" onClick={() => window.location.reload()}>
            새로고침
          </button>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <StatCard
            icon="👥"
            label="전체 사용자"
            value={adminStats.totalUsers}
            change={adminStats.totalUsersChange}
            period="1주"
            onClick={() => router.push('/admin/users')}
          />
          <StatCard
            icon="📚"
            label="활성 스터디"
            value={adminStats.activeStudies}
            change={adminStats.activeStudiesChange}
            period="1주"
            onClick={() => router.push('/admin/studies')}
          />
          <StatCard
            icon="✨"
            label="신규 가입"
            value={adminStats.newSignupsToday}
            change={0}
            period="오늘"
            onClick={() => router.push('/admin/users?filter=new')}
          />
          <StatCard
            icon="⚠️"
            label="신고 건수"
            value={adminStats.pendingReports}
            change={0}
            period="미처리"
            onClick={() => router.push('/admin/reports')}
          />
        </div>

        {/* User Growth Chart */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>사용자 증가 추이 (지난 30일)</h2>
            <div className={styles.chartFilters}>
              <button 
                className={`${styles.filterButton} ${period === 'weekly' ? styles.active : ''}`}
                onClick={() => setPeriod('weekly')}
              >
                주간
              </button>
              <button 
                className={`${styles.filterButton} ${period === 'monthly' ? styles.active : ''}`}
                onClick={() => setPeriod('monthly')}
              >
                월간
              </button>
              <button 
                className={`${styles.filterButton} ${period === 'yearly' ? styles.active : ''}`}
                onClick={() => setPeriod('yearly')}
              >
                연간
              </button>
            </div>
          </div>
          <UserGrowthChart data={userGrowthData} />
        </div>

        {/* Recent Reports & Users & Status */}
        <div className={styles.twoColumnGrid}>
          {/* Recent Reports */}
          <div className={styles.chartSection}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>최근 신고 내역</h2>
              <button 
                className={styles.moreButton}
                onClick={() => router.push('/admin/reports')}
              >
                더보기
              </button>
            </div>
            <div className={styles.cardList}>
              {recentReports.map(report => (
                <div 
                  key={report.id} 
                  className={`${styles.reportCard} ${
                    report.priority === 'URGENT' ? styles.urgent : ''
                  } ${
                    report.status === 'RESOLVED' ? styles.resolved : ''
                  }`}
                >
                  <div className={styles.reportHeader}>
                    <span className={`${styles.reportType} ${styles[report.type.toLowerCase()]}`}>
                      {report.type === 'SPAM' && '⚠️ 스팸'}
                      {report.type === 'HARASSMENT' && '🟠 욕설'}
                      {report.type === 'INAPPROPRIATE' && '🟡 부적절'}
                    </span>
                  </div>
                  <div className={styles.reportInfo}>
                    대상: {report.targetName}
                  </div>
                  <div className={styles.reportInfo}>
                    신고자: {report.reporter.name}
                  </div>
                  <div className={styles.reportMeta}>
                    <span>{formatTimeAgo(report.createdAt)}</span>
                    <span>·</span>
                    <span>{report.status === 'PENDING' ? '미처리' : '처리완료'}</span>
                  </div>
                  {report.status === 'PENDING' && (
                    <div className={styles.reportActions}>
                      <button 
                        className={`${styles.actionButton} ${styles.primary}`}
                        onClick={() => handleReportClick(report)}
                      >
                        처리하기
                      </button>
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleReportClick(report)}
                      >
                        상세보기
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Status */}
          <div className={styles.statusSection}>
            <h2 className={styles.chartTitle}>실시간 현황</h2>

            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <div className={styles.statusLabel}>활성 사용자</div>
                <div className={styles.statusValue}>{adminStats.totalUsers - 54}</div>
                <div className={styles.statusSubtext}>현재 접속 중</div>
              </div>

              <div className={styles.statusCard}>
                <div className={styles.statusLabel}>오늘 신규 가입</div>
                <div className={styles.statusValue}>{adminStats.newSignupsToday}</div>
                <div className={styles.statusSubtext}>명</div>
              </div>

              <div className={styles.statusCard}>
                <div className={styles.statusLabel}>진행중 스터디</div>
                <div className={styles.statusValue}>{adminStats.activeStudies}</div>
                <div className={styles.statusSubtext}>개</div>
              </div>

              <div className={styles.statusCard}>
                <div className={styles.statusLabel}>미처리 신고</div>
                <div className={styles.statusValue}>{adminStats.pendingReports}</div>
                <div className={styles.statusSubtext}>건</div>
              </div>
            </div>

            <div className={styles.systemHealth}>
              <span className={styles.systemHealthIcon}>🟢</span>
              <div className={styles.systemHealthText}>
                <div className={styles.systemHealthTitle}>시스템 정상 운영</div>
                <div className={styles.systemHealthMeta}>
                  CPU: {systemStatus.cpu}% | 메모리: {systemStatus.memory}% | 디스크: {systemStatus.disk}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Study Activities Chart */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>스터디 활동 현황 (주간)</h2>
          </div>
          <StudyActivityChart data={studyActivitiesData} />
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
