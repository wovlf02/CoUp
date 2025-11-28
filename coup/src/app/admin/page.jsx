import { Suspense } from 'react'
import StatsCards from './_components/StatsCards'
import RecentActivity from './_components/RecentActivity'
import QuickActions from './_components/QuickActions'
import styles from './page.module.css'

export const metadata = {
  title: '관리자 대시보드 - CoUp',
}

async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/stats`, {
      cache: 'no-store', // 항상 최신 데이터
    })

    if (!res.ok) {
      throw new Error('Failed to fetch stats')
    }

    return res.json()
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return { success: false, data: null }
  }
}

export default async function AdminDashboardPage() {
  const statsData = await getStats()
  const stats = statsData.success ? statsData.data : null

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>대시보드</h1>
        <p className={styles.subtitle}>플랫폼 현황을 한눈에 확인하세요</p>
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards stats={stats?.summary} />
      </Suspense>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <Suspense fallback={<ActivitySkeleton />}>
            <RecentActivity activity={stats?.recentActivity} />
          </Suspense>
        </div>

        <div className={styles.sideColumn}>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

function StatsCardsSkeleton() {
  return (
    <div className={styles.statsGrid}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
          <div className={styles.skeletonLine} style={{ width: '60%', height: '2rem' }} />
        </div>
      ))}
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonLine} style={{ width: '30%', height: '1.5rem' }} />
      <div className={styles.skeletonLine} style={{ width: '100%' }} />
      <div className={styles.skeletonLine} style={{ width: '100%' }} />
      <div className={styles.skeletonLine} style={{ width: '80%' }} />
    </div>
  )
}

