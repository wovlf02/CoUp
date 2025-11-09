'use client'

import { useState } from 'react'
import ProfileSection from '@/components/my-page/ProfileSection'
import ProfileEditForm from '@/components/my-page/ProfileEditForm'
import MyStudiesList from '@/components/my-page/MyStudiesList'
import ActivityStats from '@/components/my-page/ActivityStats'
import AccountActions from '@/components/my-page/AccountActions'
import { currentUser, userStudies, userStats } from '@/mocks/user'
import styles from './page.module.css'

export default function MyPage() {
  const [user, setUser] = useState(currentUser)

  const handleUpdateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }))
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>👤 마이페이지</h1>
      </header>

      <div className={styles.contentGrid}>
        {/* 좌측 컬럼 */}
        <div className={styles.leftColumn}>
          <ProfileSection user={user} onUpdate={handleUpdateUser} />
          <MyStudiesList studies={userStudies} />
        </div>

        {/* 우측 컬럼 */}
        <div className={styles.rightColumn}>
          <ProfileEditForm user={user} onUpdate={handleUpdateUser} />
          <ActivityStats stats={userStats} />
        </div>
      </div>

      {/* 하단 전체 너비 */}
      <div className={styles.fullWidthSection}>
        <AccountActions />
      </div>
    </div>
  )
}

