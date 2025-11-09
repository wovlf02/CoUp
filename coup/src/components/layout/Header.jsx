'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './Header.module.css'

/**
 * 상단 헤더
 * - 로고, 검색바, 알림, 프로필
 * - 높이: 64px (Desktop), 56px (Mobile)
 */
export default function Header({ onMenuToggle }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // 검색 처리
      console.log('Search:', searchQuery)
    }
  }

  // Mock 데이터
  const unreadCount = 3
  const user = {
    name: '김민준',
    email: 'user@example.com',
    imageUrl: null
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

      {/* Search Bar */}
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="스터디 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className={styles.searchButton} aria-label="검색">
          🔍
        </button>
      </form>

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
                <button className={styles.markAllRead}>모두 읽음</button>
              </div>
              <div className={styles.dropdownContent}>
                <div className={styles.notificationItem}>
                  <div className={styles.notificationIcon}>📢</div>
                  <div className={styles.notificationText}>
                    <p className={styles.notificationTitle}>새 공지사항</p>
                    <p className={styles.notificationDesc}>
                      코딩테스트 스터디에 새 공지사항이 등록되었습니다.
                    </p>
                    <span className={styles.notificationTime}>5분 전</span>
                  </div>
                </div>
                <Link href="/notifications" className={styles.viewAll}>
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
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.name} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.name.charAt(0)}
              </div>
            )}
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.dropdownIcon}>▼</span>
          </button>

          {showProfile && (
            <div className={styles.dropdown}>
              <div className={styles.profileInfo}>
                <div className={styles.avatarPlaceholder}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className={styles.profileName}>{user.name}</p>
                  <p className={styles.profileEmail}>{user.email}</p>
                </div>
              </div>
              <div className={styles.dropdownDivider} />
              <Link href="/me" className={styles.dropdownItem}>
                <span className={styles.dropdownIcon}>👤</span>
                마이페이지
              </Link>
              <Link href="/settings" className={styles.dropdownItem}>
                <span className={styles.dropdownIcon}>⚙️</span>
                설정
              </Link>
              <div className={styles.dropdownDivider} />
              <button className={`${styles.dropdownItem} ${styles.logout}`}>
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
