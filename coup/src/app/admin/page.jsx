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
import { useAdminStats, useAdminReports, useSuspendUser } from '@/lib/hooks/useApi'
import { generateUserGrowthByPeriod, generateStudyActivityData, generateSystemStatus, getMockStats } from '@/mocks/stats'
import { getMockReports } from '@/mocks/reports'
import styles from './page.module.css'

export default function AdminDashboard() {
  const router = useRouter()
  const [period, setPeriod] = useState('weekly')
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)

  // 실제 API Hooks
  const { data: statsData, isLoading: statsLoading } = useAdminStats()
  const { data: reportsData } = useAdminReports({ status: 'PENDING', limit: 5 })
  const suspendUserMutation = useSuspendUser()

  // Mock 데이터 사용 (실제 데이터가 없을 경우)
  const mockStats = getMockStats()
  const hasRealData = statsData?.data?.users?.total > 0

  const adminStats = {
    totalUsers: hasRealData ? statsData.data.users.total : mockStats.users.total,
    activeStudies: hasRealData ? statsData.data.studies.active : mockStats.studies.active,
    newSignupsToday: hasRealData ? statsData.data.users.newToday : mockStats.users.newToday,
    pendingReports: hasRealData ? statsData.data.reports.pending : mockStats.reports.pending,
    totalUsersChange: hasRealData ? statsData.data.users.newThisWeek : mockStats.users.newThisWeek,
    activeStudiesChange: hasRealData ? statsData.data.studies.newThisWeek : mockStats.studies.newThisWeek
  }

  const recentReports = (reportsData?.data && reportsData.data.length > 0) ? reportsData.data : getMockReports().slice(0, 5)

  // Mock 데이터 (차트용) - 기간별로 생성
  const userGrowthData = generateUserGrowthByPeriod(period)
  const studyActivitiesData = generateStudyActivityData()
  const systemStatus = generateSystemStatus()

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

  const handleProcessReport = (data) => {
    console.log('신고 처리:', data)
    alert(`신고가 처리되었습니다.\n액션: ${data.action}\n메모: ${data.memo}`)
    setIsReportModalOpen(false)
    setSelectedReport(null)
  }

  const handleSuspendUser = () => {
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

  if (statsLoading) {
    return (
      <AdminLayout>
        <div className="adminPageWrapper">
          <div className="adminMainContent">
            <div style={{ textAlign: 'center', padding: '3rem' }}>로딩 중...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="adminPageWrapper">
        <div className="adminMainContent">
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
                <h2 className={styles.chartTitle}>
                  사용자 증가 추이
                  {period === 'weekly' && ' (최근 7일)'}
                  {period === 'monthly' && ' (최근 30일)'}
                  {period === 'yearly' && ' (최근 12개월)'}
                </h2>
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
              {userGrowthData.length > 0 ? (
                <UserGrowthChart data={userGrowthData} />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  차트 데이터 없음
                </div>
              )}
            </div>

            {/* Recent Reports & Recent Activities - 2 columns */}
            <div className={styles.twoColumnLayout}>
              {/* Recent Reports */}
              <div className={styles.reportsSectionCompact}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>⚠️ 최근 신고 내역</h2>
                  <button
                    className={styles.viewMoreButton}
                    onClick={() => router.push('/admin/reports')}
                  >
                    더보기 →
                  </button>
                </div>
                <div className={styles.compactCardList}>
                  {recentReports.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>📭</div>
                      <div className={styles.emptyText}>신고 내역이 없습니다</div>
                    </div>
                  ) : (
                    recentReports.map(report => (
                      <div
                        key={report.id}
                        className={`${styles.compactReportCard} ${
                          report.priority === 'URGENT' ? styles.urgent : ''
                        }`}
                      >
                        <div className={styles.compactReportHeader}>
                          <span className={`${styles.reportBadge} ${styles[report.type?.toLowerCase()]}`}>
                            {report.type === 'SPAM' && '스팸'}
                            {report.type === 'HARASSMENT' && '욕설'}
                            {report.type === 'INAPPROPRIATE' && '부적절'}
                            {report.type === 'COPYRIGHT' && '저작권'}
                            {report.type === 'OTHER' && '기타'}
                          </span>
                          {report.priority === 'URGENT' && (
                            <span className={styles.urgentBadge}>🔴 긴급</span>
                          )}
                        </div>
                        <div className={styles.compactReportContent}>
                          <div className={styles.compactReportInfo}>
                            대상: <strong>{report.targetName || report.reported?.name || '알 수 없음'}</strong>
                          </div>
                          <div className={styles.compactReportInfo}>
                            신고자: {report.reporter?.name || '알 수 없음'}
                          </div>
                        </div>
                        <div className={styles.compactReportFooter}>
                          <span className={styles.reportTime}>{formatTimeAgo(report.createdAt)}</span>
                          {report.status === 'PENDING' && (
                            <button
                              className={styles.processButton}
                              onClick={() => handleReportClick(report)}
                            >
                              처리
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activities */}
              <div className={styles.activitiesSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>📈 최근 활동</h2>
                </div>
                <div className={styles.activityList}>
                  {/* 최근 가입한 사용자 */}
                  <div className={styles.activityGroup}>
                    <div className={styles.activityGroupTitle}>
                      <span className={styles.activityIcon}>👥</span>
                      <span>최근 가입</span>
                    </div>
                    <div className={styles.activityItems}>
                      <div className={styles.activityItem}>
                        <div className={styles.activityAvatar}>👤</div>
                        <div className={styles.activityContent}>
                          <div className={styles.activityName}>김철수님이 가입했습니다</div>
                          <div className={styles.activityTime}>5분 전</div>
                        </div>
                      </div>
                      <div className={styles.activityItem}>
                        <div className={styles.activityAvatar}>👤</div>
                        <div className={styles.activityContent}>
                          <div className={styles.activityName}>이영희님이 가입했습니다</div>
                          <div className={styles.activityTime}>23분 전</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 새로운 스터디 */}
                  <div className={styles.activityGroup}>
                    <div className={styles.activityGroupTitle}>
                      <span className={styles.activityIcon}>📚</span>
                      <span>새로운 스터디</span>
                    </div>
                    <div className={styles.activityItems}>
                      <div className={styles.activityItem}>
                        <div className={styles.activityAvatar}>⚛️</div>
                        <div className={styles.activityContent}>
                          <div className={styles.activityName}>React 마스터하기 생성</div>
                          <div className={styles.activityTime}>1시간 전</div>
                        </div>
                      </div>
                      <div className={styles.activityItem}>
                        <div className={styles.activityAvatar}>🐍</div>
                        <div className={styles.activityContent}>
                          <div className={styles.activityName}>Python 알고리즘 생성</div>
                          <div className={styles.activityTime}>2시간 전</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 활발한 활동 */}
                  <div className={styles.activityGroup}>
                    <div className={styles.activityGroupTitle}>
                      <span className={styles.activityIcon}>🔥</span>
                      <span>활발한 활동</span>
                    </div>
                    <div className={styles.activityItems}>
                      <div className={styles.activityItem}>
                        <div className={styles.activityAvatar}>💬</div>
                        <div className={styles.activityContent}>
                          <div className={styles.activityName}>React 스터디에 새 메시지 15개</div>
                          <div className={styles.activityTime}>방금 전</div>
                        </div>
                      </div>
                      <div className={styles.activityItem}>
                        <div className={styles.activityAvatar}>📁</div>
                        <div className={styles.activityContent}>
                          <div className={styles.activityName}>Python 스터디에 파일 업로드</div>
                          <div className={styles.activityTime}>10분 전</div>
                        </div>
                      </div>
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
              {studyActivitiesData.length > 0 ? (
                <StudyActivityChart data={studyActivitiesData} />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  차트 데이터 없음
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Widget */}
        <div className="rightWidget">
          <div className="widget widgetMainStats">
            <div className="widgetTitle">📊 주요 통계</div>
            <div className="widgetContent">
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '4px' }}>
                  전체 사용자
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                  {adminStats.totalUsers.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px' }}>
                  🔺 +{adminStats.totalUsersChange} (1주)
                </div>
              </div>
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>활성 스터디</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {adminStats.activeStudies}개
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>오늘 신규 가입</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {adminStats.newSignupsToday}명
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>미처리 신고</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#EF4444' }}>
                    {adminStats.pendingReports}건
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="widget widgetUrgentAlerts">
            <div className="widgetTitle">🚨 긴급 알림</div>
            <div className="widgetContent">
              {recentReports.filter(r => r.priority === 'URGENT').length > 0 ? (
                <>
                  {recentReports.filter(r => r.priority === 'URGENT').slice(0, 3).map(report => (
                    <div key={report.id} style={{
                      padding: '12px',
                      background: '#FEF2F2',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      border: '1px solid #FEE2E2',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleReportClick(report)}
                    >
                      <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#DC2626', marginBottom: '4px' }}>
                        🔴 {report.type === 'SPAM' ? '스팸' : report.type === 'HARASSMENT' ? '욕설' : '부적절'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {report.targetName || report.reported?.name || '알 수 없음'}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF', fontSize: '0.875rem' }}>
                  긴급 알림이 없습니다
                </div>
              )}
            </div>
          </div>

          <div className="widget widgetSystemStatus">
            <div className="widgetTitle">🔄 시스템 상태</div>
            <div className="widgetContent">
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🟢</span>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669' }}>
                      정상 운영
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      모든 서비스 정상 작동
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>CPU</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{systemStatus.cpu}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${systemStatus.cpu}%`,
                      height: '100%',
                      background: systemStatus.cpu > 80 ? '#EF4444' : '#10B981',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>메모리</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{systemStatus.memory}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${systemStatus.memory}%`,
                      height: '100%',
                      background: systemStatus.memory > 80 ? '#EF4444' : '#3B82F6',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>디스크</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{systemStatus.disk}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${systemStatus.disk}%`,
                      height: '100%',
                      background: systemStatus.disk > 80 ? '#EF4444' : '#6366F1',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
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
