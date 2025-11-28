'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './AdminNavbar.module.css'

const menuItems = [
  { label: '대시보드', href: '/admin', exact: true },
  { label: '사용자', href: '/admin/users' },
  { label: '스터디', href: '/admin/studies' },
  { label: '신고', href: '/admin/reports' },
  { label: '분석', href: '/admin/analytics' },
  { label: '설정', href: '/admin/settings', superAdminOnly: true },
  { label: '감사 로그', href: '/admin/audit-logs', superAdminOnly: true }
]

export default function AdminNavbar({ user, adminRole }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showProfile, setShowProfile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const isSuperAdmin = adminRole.role === 'SUPER_ADMIN'

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isActive = (item) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const filteredMenuItems = menuItems.filter(item =>
    !item.superAdminOnly || isSuperAdmin
  )

  const getRoleLabel = (role) => {
    const labels = {
      SUPER_ADMIN: '슈퍼 관리자',
      ADMIN: '관리자',
      MODERATOR: '모더레이터',
      VIEWER: '뷰어'
    }
    return labels[role] || '관리자'
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/admin" className={styles.logo}>
            <Image src="/mainlogo.png" alt="CoUp" width={32} height={32} />
            <span className={styles.logoText}>CoUp Admin</span>
          </Link>

          <ul className={styles.desktopMenu}>
            {filteredMenuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.menuItem} ${
                    isActive(item) ? styles.active : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.right}>
          <button
            className={styles.iconButton}
            onClick={() => router.push('/dashboard')}
            title="사이트로 이동"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3L3 9V17H7V13H13V17H17V9L10 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className={styles.profileContainer}>
            <button
              className={styles.profileButton}
              onClick={() => setShowProfile(!showProfile)}
            >
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || '관리자'}
                  width={32}
                  height={32}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {(user.name || 'A')[0].toUpperCase()}
                </div>
              )}
            </button>

            {showProfile && (
              <>
                <div
                  className={styles.backdrop}
                  onClick={() => setShowProfile(false)}
                />
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.userName}>{user.name || '관리자'}</p>
                    <span className={styles.userRole}>
                      {getRoleLabel(adminRole.role)}
                    </span>
                  </div>
                  <div className={styles.divider} />
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setShowProfile(false)
                      router.push('/dashboard')
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2L2 7V14H6V11H10V14H14V7L8 2Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    사용자 페이지로
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={handleLogout}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M11 12L15 8L11 4M15 8H6M6 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            className={styles.mobileMenuButton}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {showMobileMenu && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setShowMobileMenu(false)}
          />
          <div className={styles.mobileMenu}>
            {filteredMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileMenuItem} ${
                  isActive(item) ? styles.active : ''
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className={styles.divider} />
            <button
              className={styles.mobileMenuItem}
              onClick={() => {
                setShowMobileMenu(false)
                router.push('/dashboard')
              }}
            >
              사용자 페이지로
            </button>
            <button
              className={styles.mobileMenuItem}
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </nav>
  )
}

