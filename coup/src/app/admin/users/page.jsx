import { Suspense } from 'react'
import UserList from './_components/UserList'
import UserFilters from './_components/UserFilters'
import styles from './page.module.css'

export const metadata = {
  title: '사용자 관리 - CoUp Admin',
}

export default function UsersPage({ searchParams }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>사용자 관리</h1>
          <p className={styles.subtitle}>모든 사용자를 관리하고 모니터링하세요</p>
        </div>
      </div>

      <UserFilters />

      <Suspense fallback={<UserListSkeleton />}>
        <UserList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

function UserListSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonTable}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.skeletonRow}>
            <div className={styles.skeletonCell} style={{ width: '40%' }} />
            <div className={styles.skeletonCell} style={{ width: '20%' }} />
            <div className={styles.skeletonCell} style={{ width: '20%' }} />
            <div className={styles.skeletonCell} style={{ width: '20%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

