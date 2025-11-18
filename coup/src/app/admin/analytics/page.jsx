'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import UserGrowthChart from '@/components/admin/UserGrowthChart'
import StudyActivityChart from '@/components/admin/StudyActivityChart'
import EngagementChart from '@/components/admin/EngagementChart'
import { useAdminStats } from '@/lib/hooks/useApi'
import styles from './page.module.css'

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('monthly')

  // 실제 API Hook
  const { data: statsData, isLoading } = useAdminStats()

  const stats = statsData?.data || {}

  // Mock 데이터 (차트용 - 추후 API 추가 시 교체)
  const userGrowthData = [
    { date: '1일', count: 10 },
    { date: '5일', count: 25 },
    { date: '10일', count: 45 },
    { date: '15일', count: 70 },
    { date: '20일', count: 95 },
    { date: '25일', count: 120 },
    { date: '30일', count: 145 }
  ]

  const studyActivitiesData = stats.studies?.byCategory || []

  const engagementTrend = [
    { day: '월', rate: 75 },
    { day: '화', rate: 80 },
    { day: '수', rate: 85 },
    { day: '목', rate: 78 },
    { day: '금', rate: 82 },
    { day: '토', rate: 65 },
    { day: '일', rate: 68 }
  ]

  const conversionFunnel = [
    { stage: 'visit', count: 1000, conversionRate: 100 },
    { stage: 'signup', count: 800, conversionRate: 80 },
    { stage: 'create', count: 450, conversionRate: 56 },
    { stage: 'active', count: 360, conversionRate: 45 }
  ]

  const deviceDistribution = [
    { device: 'desktop', count: 720, percentage: 60 },
    { device: 'mobile', count: 360, percentage: 30 },
    { device: 'tablet', count: 120, percentage: 10 }
  ]

  const popularFeatures = [
    { feature: '채팅', count: 8500 },
    { feature: '파일 공유', count: 5200 },
    { feature: '캘린더', count: 4800 },
    { feature: '할일 관리', count: 4200 },
    { feature: '공지사항', count: 3600 }
  ]

  if (isLoading) {
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
        {/* 메인 콘텐츠 */}
        <div className="adminMainContent">
          <div className={styles.analyticsPage}>
            {/* Header */}
            <div className="contentHeader">
              <h1 className="contentTitle">통계 분석</h1>
              <div style={{ display: 'flex', gap: '8px' }}>
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

            {/* User Growth Chart */}
            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>사용자 성장 (지난 30일)</h2>
                <button className={styles.downloadButton}>📥 CSV 다운로드</button>
              </div>
              <UserGrowthChart data={userGrowthData} />
            </div>

            {/* Two Column Charts */}
            <div className={styles.twoColumnGrid}>
              {/* Category Distribution */}
              <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                  <h2 className={styles.chartTitle}>스터디 카테고리 분포</h2>
                </div>
                <StudyActivityChart data={studyActivitiesData} />
              </div>

              {/* User Activity */}
              <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                  <h2 className={styles.chartTitle}>사용자 활동</h2>
                </div>
                <div className={styles.chartPlaceholder}>
                  <div className={styles.userActivityBar}>
                    <div className={styles.userActivityLabel}>활성 사용자</div>
                    <div className={styles.userActivityProgress}>
                      <div className={styles.progressBarContainer}>
                        <div className={`${styles.progressBarFill} ${styles.active}`} style={{ width: `${Math.round((stats.users?.active || 0) / (stats.users?.total || 1) * 100)}%` }} />
                      </div>
                      <span className={styles.progressPercent}>{Math.round((stats.users?.active || 0) / (stats.users?.total || 1) * 100)}%</span>
                    </div>
                  </div>

                  <div className={styles.userActivityBar}>
                    <div className={styles.userActivityLabel}>신규 가입 (이번 주)</div>
                    <div className={styles.userActivityProgress}>
                      <div className={styles.progressBarContainer}>
                        <div className={`${styles.progressBarFill} ${styles.new}`} style={{ width: `${Math.min(100, Math.round((stats.users?.newThisWeek || 0) / (stats.users?.total || 1) * 100))}%` }} />
                      </div>
                      <span className={styles.progressPercent}>{stats.users?.newThisWeek || 0}명</span>
                    </div>
                  </div>

                  <div className={styles.userActivityBar}>
                    <div className={styles.userActivityLabel}>정지</div>
                    <div className={styles.userActivityProgress}>
                      <div className={styles.progressBarContainer}>
                        <div className={`${styles.progressBarFill} ${styles.churned}`} style={{ width: `${Math.round((stats.users?.suspended || 0) / (stats.users?.total || 1) * 100)}%` }} />
                      </div>
                      <span className={styles.progressPercent}>{Math.round((stats.users?.suspended || 0) / (stats.users?.total || 1) * 100)}%</span>
                    </div>
                  </div>

                  <div className={styles.statsRow}>
                    <div className={styles.statsItem}>
                      <span className={styles.statsLabel}>전체 사용자:</span>
                      <span className={styles.statsValue}>{stats.users?.total || 0}명</span>
                    </div>
                    <div className={styles.statsItem}>
                      <span className={styles.statsLabel}>활성 사용자:</span>
                      <span className={styles.statsValue}>{stats.users?.active || 0}명</span>
                    </div>
                    <div className={styles.statsItem}>
                      <span className={styles.statsLabel}>오늘 가입:</span>
                      <span className={styles.statsValue}>{stats.users?.newToday || 0}명</span>
                    </div>
                    <div className={styles.statsItem}>
                      <span className={styles.statsLabel}>정지:</span>
                      <span className={styles.statsValue}>{stats.users?.suspended || 0}명</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>전환 퍼널</h2>
              </div>
              <div className={styles.funnelContainer}>
                <div className={styles.funnelStages}>
                  {conversionFunnel.map((stage, index) => (
                    <div key={index} className={styles.funnelStage}>
                      <div className={styles.funnelStageHeader}>
                        <span className={styles.funnelStageName}>
                          {stage.stage === 'visit' && '방문'}
                          {stage.stage === 'signup' && '회원가입'}
                          {stage.stage === 'create' && '스터디 생성'}
                          {stage.stage === 'active' && '활성 사용자'}
                        </span>
                        <span className={styles.funnelStageCount}>{stage.count}명</span>
                      </div>
                      <div className={styles.funnelBar}>
                        <div
                          className={styles.funnelBarFill}
                          style={{ width: `${stage.conversionRate}%` }}
                        >
                          {stage.conversionRate}%
                        </div>
                      </div>
                      {index < conversionFunnel.length - 1 && (
                        <div className={styles.funnelArrow}>
                          ↓ {conversionFunnel[index + 1].conversionRate}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className={styles.funnelSummary}>
                  <div className={styles.funnelSummaryLabel}>전체 전환율</div>
                  <div className={styles.funnelSummaryValue}>45%</div>
                  <div className={styles.funnelSummaryNote}>
                    목표 (40%) 대비: +5%
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Trend */}
            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>참여도 추이 (일간)</h2>
              </div>
              <EngagementChart data={engagementTrend} />
              <div className={styles.chartPlaceholder}>
                평균 참여도: 78% | 최고: 85% (수요일) | 최저: 65% (토요일)
              </div>
            </div>

            {/* Device Distribution & Popular Features */}
            <div className={styles.twoColumnGrid}>
              <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                  <h2 className={styles.chartTitle}>디바이스 분포</h2>
                </div>
                <div className={styles.chartPlaceholder}>
                  {deviceDistribution.map((item, index) => (
                    <div key={index} className={styles.deviceItem}>
                      <div className={styles.deviceHeader}>
                        <span className={styles.deviceName}>
                          {item.device === 'desktop' && '🖥️ Desktop'}
                          {item.device === 'mobile' && '📱 Mobile'}
                          {item.device === 'tablet' && '💻 Tablet'}
                        </span>
                        <span className={styles.deviceCount}>
                          {item.count}명 ({item.percentage}%)
                        </span>
                      </div>
                      <div className={styles.deviceBar}>
                        <div
                          className={`${styles.deviceBarFill} ${styles[item.device]}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                  <h2 className={styles.chartTitle}>인기 기능 (사용 빈도)</h2>
                </div>
                <div className={styles.chartPlaceholder}>
                  {popularFeatures.map((item, index) => (
                    <div key={index} className={styles.featureItem}>
                      <div>
                        <span className={styles.featureRank}>{index + 1}.</span>
                        <span className={styles.featureName}>{item.feature}</span>
                      </div>
                      <span className={styles.featureCount}>
                        {item.count.toLocaleString()}회
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Widget */}
        <div className="rightWidget">
          <div className="widget">
            <div className="widgetTitle">📊 요약</div>
            <div className="widgetContent">
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>
                  총 사용자
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                  {stats.users?.total || 0}명
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>
                  총 스터디
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                  {stats.studies?.total || 0}개
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>
                  총 할일
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                  {stats.tasks?.total || 0}개
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>
                  미처리 신고
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                  {stats.reports?.pending || 0}개
                </div>
              </div>
            </div>
          </div>

          <div className="widget">
            <div className="widgetTitle">📅 기간 선택</div>
            <div className="widgetContent">
              <button className={styles.periodButton}>오늘</button>
              <button className={styles.periodButton}>어제</button>
              <button className={styles.periodButton}>이번 주</button>
              <button className={styles.periodButton}>이번 달</button>
            </div>
          </div>

          <div className="widget">
            <div className="widgetTitle">🔄 새로고침</div>
            <div className="widgetContent">
              <button className={styles.refreshButton} style={{ width: '100%', marginBottom: '12px' }}>
                수동 새로고침
              </button>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                <div style={{ marginBottom: '8px' }}>
                  <input type="checkbox" id="auto-refresh" />
                  <label htmlFor="auto-refresh" style={{ marginLeft: '4px' }}>자동 갱신</label>
                </div>
                <div>마지막: 방금 전</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
