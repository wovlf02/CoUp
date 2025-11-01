import React from 'react';
import HeaderSearch from './HeaderSearch';
import NotificationBell from './NotificationBell';
import UserProfileDropdown from './UserProfileDropdown';
import styles from './Header.module.css';
import notificationStyles from './NotificationBell.module.css'; // Import NotificationBell styles
import userProfileStyles from './UserProfileDropdown.module.css'; // Import UserProfileDropdown styles

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* 로고 */}
        <div className={styles['header-logo']}>
          <a href="/">CoUp</a>
        </div>

        {/* 검색 바 (HeaderSearch 컴포넌트) */}
        <div className={styles['header-search']}>
          <HeaderSearch />
        </div>

        {/* 알림 및 사용자 프로필 드롭다운 */}
        <div className={styles['header-actions']}>
          <NotificationBell />
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
}

export default Header;
