'use client'

import ProfileSection from '@/components/my-page/ProfileSection'
import ProfileEditForm from '@/components/my-page/ProfileEditForm'
import MyStudiesList from '@/components/my-page/MyStudiesList'
import ActivityStats from '@/components/my-page/ActivityStats'
import AccountActions from '@/components/my-page/AccountActions'
import { useMe, useMyStudies, useUserStats } from '@/lib/hooks/useApi'
import styles from './page.module.css'

export default function MyPage() {
  // 실제 API 호출
  const { data: userData, isLoading: userLoading } = useMe()
  const { data: studiesData, isLoading: studiesLoading } = useMyStudies({ limit: 10 })
  const { data: statsData, isLoading: statsLoading } = useUserStats()

  const user = userData?.user || null
  const userStudies = studiesData?.data || []
  const userStats = statsData?.stats || null

  // 로딩 상태
  if (userLoading || studiesLoading || statsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>프로필을 불러오는 중...</div>
      </div>
    )
  }

  // 사용자 없음
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>사용자 정보를 불러올 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>👤 마이페이지</h1>
          <p className={styles.subtitle}>
            내 정보와 활동을 관리하세요
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <ProfileSection user={user} />
        <ProfileEditForm user={user} />
        {userStats && <ActivityStats stats={userStats} />}
        <MyStudiesList studies={userStudies} />
        <AccountActions />
      </div>
    </div>
  )
}
