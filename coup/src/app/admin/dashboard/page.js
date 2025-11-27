// src/app/admin/dashboard/page.js
'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      const data = await res.json()
      if (data.success) {
        setDashboardData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>
  }

  if (!dashboardData) {
    return <div className={styles.error}>데이터를 불러올 수 없습니다</div>
  }

  const { metrics, recentActivity, trends } = dashboardData

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>관리자 대시보드</h1>
        <p className={styles.subtitle}>
          플랫폼 전체 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 핵심 지표 카드 */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="전체 사용자"
          value={metrics.users.total}
          subtitle={`활성: ${metrics.users.active}`}
          icon="👥"
          trend={`+${metrics.users.newWeek} (7일)`}
        />
        <MetricCard
          title="활성 사용자"
          value={metrics.users.active}
          subtitle={`정지: ${metrics.users.suspended}`}
          icon="✅"
          trend={`오늘 +${metrics.users.newToday}`}
        />
        <MetricCard
          title="전체 스터디"
          value={metrics.studies.total}
          subtitle={`활성: ${metrics.studies.active}`}
          icon="📚"
          trend={`오늘 +${metrics.studies.newToday}`}
        />
        <MetricCard
          title="미처리 신고"
          value={metrics.reports.pending}
          subtitle={`오늘: ${metrics.reports.today}건`}
          icon="🚨"
          color="red"
        />
      </div>

      {/* 최근 활동 */}
      <div className={styles.activityGrid}>
        {/* 미처리 신고 */}
        <div className={styles.activityCard}>
          <h2 className={styles.activityHeader}>
            미처리 신고 ({recentActivity.reports.length})
          </h2>
          <div className={styles.activityList}>
            {recentActivity.reports.length === 0 ? (
              <p className={styles.emptyState}>미처리 신고가 없습니다</p>
            ) : (
              recentActivity.reports.map(report => (
                <div key={report.id} className={styles.activityItem}>
                  <div className={styles.activityItemContent}>
                    <div className={styles.activityItemBadges}>
                      <span className={`${styles.badge} ${
                        report.priority === 'URGENT' ? styles.urgent :
                        report.priority === 'HIGH' ? styles.high :
                        styles.medium
                      }`}>
                        {report.priority === 'URGENT' && '⚠️ '}
                        {report.targetType}
                      </span>
                    </div>
                    <p className={styles.activityItemTitle}>
                      {report.targetName || report.id}
                    </p>
                    <p className={styles.activityItemMeta}>
                      {report.type} · {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <a
                    href={`/admin/reports/${report.id}`}
                    className={styles.activityItemLink}
                  >
                    처리 →
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 최근 제재 */}
        <div className={styles.activityCard}>
          <h2 className={styles.activityHeader}>
            최근 제재 ({recentActivity.sanctions.length})
          </h2>
          <div className={styles.activityList}>
            {recentActivity.sanctions.length === 0 ? (
              <p className={styles.emptyState}>최근 제재 내역이 없습니다</p>
            ) : (
              recentActivity.sanctions.map(sanction => (
                <div key={sanction.id} className={styles.sanctionItem}>
                  <span className={styles.sanctionIcon}>
                    {sanction.type === 'WARNING' && '⚠️'}
                    {sanction.type === 'SUSPEND' && '⛔'}
                    {sanction.type === 'UNSUSPEND' && '✅'}
                  </span>
                  <div className={styles.sanctionContent}>
                    <div className={styles.sanctionHeader}>
                      <span className={styles.sanctionType}>
                        {sanction.type === 'WARNING' && '경고'}
                        {sanction.type === 'SUSPEND' && '정지'}
                        {sanction.type === 'UNSUSPEND' && '정지 해제'}
                      </span>
                    </div>
                    <p className={styles.sanctionReason}>
                      {sanction.reason}
                    </p>
                    <p className={styles.sanctionTime}>
                      {new Date(sanction.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 주간 추이 그래프 */}
      <div className={styles.trendsCard}>
        <h2 className={styles.trendsHeader}>
          주간 추이 (최근 7일)
        </h2>
        <div className={styles.trendsList}>
          {trends.daily.map((day, index) => (
            <div key={index} className={styles.trendDay}>
              <div className={styles.trendDate}>
                {new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </div>
              <div className={styles.trendBars}>
                <div className={styles.trendBarRow}>
                  <div
                    className={`${styles.trendBar} ${styles.users}`}
                    style={{ width: `${Math.max(day.newUsers * 10, 4)}px` }}
                  />
                  <span className={styles.trendLabel}>사용자 {day.newUsers}</span>
                </div>
                <div className={styles.trendBarRow}>
                  <div
                    className={`${styles.trendBar} ${styles.studies}`}
                    style={{ width: `${Math.max(day.newStudies * 10, 4)}px` }}
                  />
                  <span className={styles.trendLabel}>스터디 {day.newStudies}</span>
                </div>
                <div className={styles.trendBarRow}>
                  <div
                    className={`${styles.trendBar} ${styles.reports}`}
                    style={{ width: `${Math.max(day.reports * 10, 4)}px` }}
                  />
                  <span className={styles.trendLabel}>신고 {day.reports}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, trend, color = 'blue' }) {
  return (
    <div className={`${styles.metricCard} ${color === 'red' ? styles.red : ''}`}>
      <div className={styles.metricContent}>
        <div className={styles.metricInfo}>
          <p className={styles.metricTitle}>{title}</p>
          <p className={styles.metricValue}>{value.toLocaleString()}</p>
          <p className={styles.metricSubtitle}>{subtitle}</p>
          {trend && (
            <p className={styles.metricTrend}>{trend}</p>
          )}
        </div>
        <div className={styles.metricIcon}>
          {icon}
        </div>
      </div>
    </div>
  )
}

