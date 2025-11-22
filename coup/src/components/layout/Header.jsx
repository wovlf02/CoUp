'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Header.module.css'
import { useMe } from '@/lib/hooks/useApi'

/**
 * 상단 헤더
 * - 로고, 글로벌 검색, 알림, 프로필
 * - 높이: 64px (Desktop), 56px (Mobile)
 */
export default function Header({ onMenuToggle }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  // 최신 사용자 정보 가져오기
  const { data: userData } = useMe()
  const user = userData?.user || session?.user

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?limit=5')
      const data = await response.json()
      if (data.success) {
        setNotifications(data.data)
        setUnreadCount(data.data.filter(n => !n.read).length)
      }
    } catch (error) {
      console.error('알림 로드 실패:', error)
    }
  }, [])

  // 알림 데이터 가져오기
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user, fetchNotifications])

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/studies?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setShowSearchResults(false)
    }
  }

  return (
    <header className={styles.header}>
      {/* Mobile Menu Button */}
      <button
        className={styles.menuButton}
        onClick={onMenuToggle}
        aria-label="메뉴 열기"
      >
        <span className={styles.menuIcon}>☰</span>
      </button>


      {/* Global Search */}
      <div className={styles.searchContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="스터디, 사용자, 태그 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={styles.searchClear}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </form>
        {showSearchResults && searchQuery && (
          <div className={styles.searchResults}>
            <div className={styles.searchResultsHeader}>
              <span className={styles.searchResultsTitle}>빠른 검색</span>
            </div>
            <button
              onClick={handleSearch}
              className={styles.searchResultItem}
            >
              <span className={styles.searchResultIcon}>🔍</span>
              <span className={styles.searchResultText}>
                "{searchQuery}" 검색하기
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className={styles.actions}>
        {/* Notifications */}
        <div className={styles.notificationWrapper}>
          <button
            className={styles.iconButton}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="알림"
          >
            <span className={styles.icon}>🔔</span>
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
            <span className={styles.buttonText}>알림</span>
          </button>

          {showNotifications && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <h3>알림</h3>
                {unreadCount > 0 && (
                  <button className={styles.markAllRead} onClick={handleMarkAllRead}>
                    모두 읽음
                  </button>
                )}
              </div>
              <div className={styles.dropdownContent}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotifications}>
                    <p>알림이 없습니다</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`${styles.notificationItem} ${notification.read ? styles.read : ''}`}
                    >
                      <div className={styles.notificationIcon}>
                        {notification.type === 'ANNOUNCEMENT' && '📢'}
                        {notification.type === 'INVITATION' && '💌'}
                        {notification.type === 'TASK' && '✅'}
                        {notification.type === 'COMMENT' && '💬'}
                        {notification.type === 'SYSTEM' && 'ℹ️'}
                      </div>
                      <div className={styles.notificationText}>
                        <p className={styles.notificationTitle}>{notification.title}</p>
                        <p className={styles.notificationDesc}>
                          {notification.message}
                        </p>
                        <span className={styles.notificationTime}>
                          {new Date(notification.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <Link href="/notifications" className={styles.viewAll} onClick={() => setShowNotifications(false)}>
                  모든 알림 보기
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className={styles.profileWrapper}>
          <button
            className={styles.profileButton}
            onClick={() => setShowProfile(!showProfile)}
            aria-label="프로필"
          >
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <span className={styles.userName}>{user?.name || '사용자'}</span>
            <span className={styles.dropdownIcon}>▼</span>
          </button>

          {showProfile && (
            <div className={styles.dropdown}>
              <div className={styles.profileInfo}>
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={48}
                    height={48}
                    className={styles.avatarLarge}
                  />
                ) : (
                  <div className={styles.avatarPlaceholderLarge}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <p className={styles.profileName}>{user?.name || '사용자'}</p>
                  <p className={styles.profileEmail}>{user?.email}</p>
                </div>
              </div>
              <div className={styles.dropdownDivider} />
              <Link href="/me" className={styles.dropdownItem} onClick={() => setShowProfile(false)}>
                <span className={styles.dropdownIcon}>👤</span>
                마이페이지
              </Link>
              <Link href="/settings" className={styles.dropdownItem} onClick={() => setShowProfile(false)}>
                <span className={styles.dropdownIcon}>⚙️</span>
                설정
              </Link>
              <div className={styles.dropdownDivider} />
              <button className={`${styles.dropdownItem} ${styles.logout}`} onClick={handleLogout}>
                <span className={styles.dropdownIcon}>🚪</span>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
