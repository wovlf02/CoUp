'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import StatsCards from './_components/StatsCards'
import RecentActivity from './_components/RecentActivity'
import QuickActions from './_components/QuickActions'
import styles from './page.module.css'

export default function AdminDashboardPage() {
  const { status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin')
      return
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])

  async function fetchStats() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to fetch stats')
        return
      }

      const data = await res.json()
      setStats(data.success ? data.data : null)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError(err.message || '통계를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1 className={styles.title}>대시보드</h1>
          <p className={styles.subtitle}>플랫폼 현황을 한눈에 확인하세요</p>
        </div>
        <StatsCardsSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1 className={styles.title}>대시보드</h1>
          <p className={styles.subtitle}>플랫폼 현황을 한눈에 확인하세요</p>
        </div>
        <div className={styles.error}>
          <p>⚠️ 통계를 불러오는 중 오류가 발생했습니다.</p>
          <p>{error}</p>
          <button onClick={fetchStats} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>대시보드</h1>
        <p className={styles.subtitle}>플랫폼 현황을 한눈에 확인하세요</p>
      </div>

      <StatsCards stats={stats?.summary} />

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <RecentActivity activity={stats?.recentActivity} />
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

