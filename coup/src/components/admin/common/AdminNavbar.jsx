'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import Badge from '@/components/admin/ui/Badge'
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
  const [showNotifications, setShowNotifications] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [notifications] = useState([
    { id: 1, type: 'report', message: '새로운 신고가 접수되었습니다', time: '5분 전', unread: true },
    { id: 2, type: 'user', message: '새로운 사용자가 가입했습니다', time: '1시간 전', unread: true },
    { id: 3, type: 'system', message: '시스템 업데이트가 완료되었습니다', time: '2시간 전', unread: false },
  ])

  const isSuperAdmin = adminRole.role === 'SUPER_ADMIN'
  const unreadCount = notifications.filter(n => n.unread).length

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowProfile(false)
        setShowNotifications(false)
        setShowMobileMenu(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'report':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        )
      case 'user':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
          </svg>
        )
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        )
    }
  }

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/admin" className={styles.logo}>
            <Image src="/mainlogo.png" alt="CoUp" width={120} height={40} />
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
          {/* 알림 버튼 */}
          <div className={styles.notificationContainer}>
            <button
              className={styles.iconButton}
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowProfile(false)
              }}
              title="알림"
              aria-label="알림"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C7.79086 2 6 3.79086 6 6V9.58579L4.70711 10.8787C4.07714 11.5087 4.52331 12.6 5.41421 12.6H14.5858C15.4767 12.6 15.9229 11.5087 15.2929 10.8787L14 9.58579V6C14 3.79086 12.2091 2 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 15C8 16.1046 8.89543 17 10 17C11.1046 17 12 16.1046 12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {unreadCount > 0 && (
                <span className={styles.notificationBadge}>{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className={styles.backdrop}
                  onClick={() => setShowNotifications(false)}
                />
                <div className={styles.notificationDropdown}>
                  <div className={styles.notificationHeader}>
                    <h3>알림</h3>
                    {unreadCount > 0 && (
                      <Badge variant="primary" size="sm">{unreadCount}개 읽지 않음</Badge>
                    )}
                  </div>
                  <div className={styles.notificationList}>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          className={`${styles.notificationItem} ${
                            notification.unread ? styles.unread : ''
                          }`}
                          onClick={() => {
                            // 알림 클릭 처리
                            setShowNotifications(false)
                          }}
                        >
                          <div className={styles.notificationIcon}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className={styles.notificationContent}>
                            <p className={styles.notificationMessage}>
                              {notification.message}
                            </p>
                            <span className={styles.notificationTime}>
                              {notification.time}
                            </span>
                          </div>
                          {notification.unread && (
                            <div className={styles.unreadDot} />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className={styles.emptyNotifications}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                          <path d="M24 4C19.5817 4 16 7.58172 16 12V21.1716L13.4142 23.7574C11.6332 25.5383 12.5233 28.8 15.0294 28.8H32.9706C35.4767 28.8 36.3668 25.5383 34.5858 23.7574L32 21.1716V12C32 7.58172 28.4183 4 24 4Z" fill="currentColor" opacity="0.1"/>
                          <path d="M19 36C19 38.2091 20.7909 40 23 40H25C27.2091 40 29 38.2091 29 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <p>새로운 알림이 없습니다</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className={styles.notificationFooter}>
                      <button className={styles.notificationAction}>
                        모두 읽음으로 표시
                      </button>
                      <button className={styles.notificationAction}>
                        모두 보기
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 사이트 이동 버튼 */}
          <button
            className={styles.iconButton}
            onClick={() => router.push('/dashboard')}
            title="사이트로 이동"
            aria-label="사이트로 이동"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3L3 9V17H7V13H13V17H17V9L10 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 프로필 */}
          <div className={styles.profileContainer}>
            <button
              className={styles.profileButton}
              onClick={() => {
                setShowProfile(!showProfile)
                setShowNotifications(false)
              }}
              aria-label="프로필 메뉴"
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
              <svg
                className={styles.profileArrow}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {showProfile && (
              <>
                <div
                  className={styles.backdrop}
                  onClick={() => setShowProfile(false)}
                />
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.profileInfo}>
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || '관리자'}
                          width={48}
                          height={48}
                          className={styles.dropdownAvatar}
                        />
                      ) : (
                        <div className={styles.dropdownAvatarPlaceholder}>
                          {(user.name || 'A')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className={styles.userName}>{user.name || '관리자'}</p>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                    <Badge variant="info" size="sm">
                      {getRoleLabel(adminRole.role)}
                    </Badge>
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
                    onClick={() => {
                      setShowProfile(false)
                      router.push('/admin/settings')
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M13.5 8C13.5 8.28 13.48 8.56 13.45 8.83L14.84 9.85C14.96 9.94 15 10.11 14.92 10.25L13.6 12.24C13.52 12.38 13.36 12.43 13.21 12.38L11.58 11.72C11.26 11.96 10.91 12.16 10.53 12.3L10.28 14.04C10.26 14.19 10.13 14.3 9.98 14.3H7.34C7.19 14.3 7.06 14.19 7.04 14.04L6.79 12.3C6.41 12.16 6.06 11.96 5.74 11.72L4.11 12.38C3.96 12.43 3.8 12.38 3.72 12.24L2.4 10.25C2.32 10.11 2.36 9.94 2.48 9.85L3.87 8.83C3.84 8.56 3.82 8.28 3.82 8C3.82 7.72 3.84 7.44 3.87 7.17L2.48 6.15C2.36 6.06 2.32 5.89 2.4 5.75L3.72 3.76C3.8 3.62 3.96 3.57 4.11 3.62L5.74 4.28C6.06 4.04 6.41 3.84 6.79 3.7L7.04 1.96C7.06 1.81 7.19 1.7 7.34 1.7H9.98C10.13 1.7 10.26 1.81 10.28 1.96L10.53 3.7C10.91 3.84 11.26 4.04 11.58 4.28L13.21 3.62C13.36 3.57 13.52 3.62 13.6 3.76L14.92 5.75C15 5.89 14.96 6.06 14.84 6.15L13.45 7.17C13.48 7.44 13.5 7.72 13.5 8Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    설정
                  </button>
                  <div className={styles.divider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.danger}`}
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

          {/* 모바일 메뉴 버튼 */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => {
              setShowMobileMenu(!showMobileMenu)
              setShowProfile(false)
              setShowNotifications(false)
            }}
            aria-label="메뉴"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {showMobileMenu ? (
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              )}
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

