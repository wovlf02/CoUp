'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import styles from './AdminLayout.module.css'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[date.getDay()]

    return `${year}.${month}.${day} (${weekday})`
  }

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${hours}:${minutes}:${seconds}`
  }

  const navItems = [
    { href: '/admin', label: '대시보드', icon: '📊' },
    { href: '/admin/users', label: '사용자 관리', icon: '👥' },
    { href: '/admin/studies', label: '스터디 관리', icon: '📚' },
    { href: '/admin/reports', label: '신고 관리', icon: '⚠️' },
    { href: '/admin/analytics', label: '통계 분석', icon: '📈' },
    { href: '/admin/settings', label: '시스템 설정', icon: '⚙️' }
  ]

  return (
    <div className={styles.adminLayout}>
      {/* Admin Navigation */}
      <nav className={styles.adminNav}>
        <div className={styles.navContent}>
          <div className={styles.adminLogo}>
            <Image
              src="/mainlogo.png?v=2"
              alt="CoUp Admin"
              width={180}
              height={40}
              className={styles.logoImage}
              priority
              unoptimized
            />
          </div>

          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.adminNavItem} ${
                pathname === item.href ? styles.active : ''
              }`}
            >
              <span className={styles.adminNavIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className={styles.navDivider} />

          <Link href="/dashboard" className={styles.adminNavItem}>
            <span className={styles.adminNavIcon}>🏠</span>
            <span>메인으로</span>
          </Link>

          <Link href="/api/auth/signout" className={styles.adminNavItem}>
            <span className={styles.adminNavIcon}>🚪</span>
            <span>로그아웃</span>
          </Link>
        </div>

        {/* System Time at Bottom */}
        <div className={styles.navSystemTime}>
          <div className={styles.systemTimeLabel}>시스템 시각</div>
          <div className={styles.systemTimeDisplay}>
            {isMounted && currentTime ? (
              <>
                <div className={styles.systemTime}>{formatTime(currentTime)}</div>
                <div className={styles.systemDate}>{formatDate(currentTime)}</div>
              </>
            ) : (
              <>
                <div className={styles.systemTime}>--:--:--</div>
                <div className={styles.systemDate}>----.--.-- (-)</div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  )
}

