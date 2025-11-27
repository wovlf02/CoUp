// src/app/admin/layout.js
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import styles from './layout.module.css'

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/sign-in')
    } else if (session.user.role !== 'ADMIN' && session.user.role !== 'SYSTEM_ADMIN') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        로딩 중...
      </div>
    )
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SYSTEM_ADMIN')) {
    return null
  }

  return (
    <div className={styles.adminLayout}>
      {/* 관리자 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Link href="/admin/dashboard" className={styles.logo}>
                CoUp Admin
              </Link>
              <nav className={styles.nav}>
                <Link
                  href="/admin/dashboard"
                  className={styles.navLink}
                >
                  대시보드
                </Link>
                <Link
                  href="/admin/users"
                  className={styles.navLink}
                >
                  사용자 관리
                </Link>
                <Link
                  href="/admin/studies"
                  className={styles.navLink}
                >
                  스터디 관리
                </Link>
                <Link
                  href="/admin/reports"
                  className={styles.navLink}
                >
                  신고 관리
                </Link>
                {session.user.role === 'SYSTEM_ADMIN' && (
                  <Link
                    href="/admin/settings"
                    className={styles.navLink}
                  >
                    설정
                  </Link>
                )}
              </nav>
            </div>
            <div className={styles.headerRight}>
              <span className={styles.userInfo}>
                {session.user.name} ({session.user.role})
              </span>
              <Link
                href="/dashboard"
                className={styles.userModeLink}
              >
                사용자 모드로
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}

