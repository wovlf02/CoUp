# 관리자 레이아웃 설계

> Next.js 14+ App Router 기반 관리자 레이아웃 (상단 네비게이션)

## 📁 파일 구조

```
src/app/admin/
├── layout.jsx           # 관리자 레이아웃 (~100줄)
├── page.jsx            # 대시보드 (~100줄)
├── loading.jsx         # 로딩 (~30줄)
└── error.jsx           # 에러 (~80줄)

src/components/admin/common/
├── AdminNavbar.jsx      # 상단 네비게이션 (~200줄)
├── AdminNavbar.module.css
├── Breadcrumb.jsx      # 브레드크럼 (~70줄)
└── Breadcrumb.module.css
```

## 1. 관리자 레이아웃 (layout.jsx)

**위치**: `src/app/admin/layout.jsx`  
**코드 길이**: ~100줄

```jsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminNavbar from '@/components/admin/common/AdminNavbar'
import Breadcrumb from '@/components/admin/common/Breadcrumb'
import styles from './layout.module.css'

export const metadata = {
  title: 'CoUp 관리자',
  description: 'CoUp 플랫폼 관리자 페이지'
}

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/admin')
  }
  
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin/unauthorized')
  }

  return (
    <div className={styles.adminLayout}>
      <header className={styles.navbar}>
        <AdminNavbar user={session.user} />
      </header>

      <div className={styles.mainContent}>
        <div className={styles.breadcrumbContainer}>
          <Breadcrumb />
        </div>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
```

**CSS**: `src/app/admin/layout.module.css`

```css
.adminLayout {
  min-height: 100vh;
  background-color: var(--gray-50);
  display: flex;
  flex-direction: column;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: white;
  border-bottom: 1px solid var(--gray-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mainContent {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.breadcrumbContainer {
  padding: var(--space-md) var(--space-xl);
  background-color: white;
  border-bottom: 1px solid var(--gray-100);
}

.content {
  flex: 1;
  padding: var(--space-xl);
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .breadcrumbContainer {
    padding: var(--space-sm) var(--space-md);
  }
  .content {
    padding: var(--space-md);
  }
}
```

## 2. 상단 네비게이션 (AdminNavbar.jsx)

**위치**: `src/components/admin/common/AdminNavbar.jsx`  
**코드 길이**: ~200줄

```jsx
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
  { label: '신고', href: '/admin/reports', badge: 5 },
  { label: '분석', href: '/admin/analytics' },
  { label: '설정', href: '/admin/settings', adminOnly: true }
]

export default function AdminNavbar({ user }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showProfile, setShowProfile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const isSuperAdmin = user.role === 'SUPER_ADMIN'

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isActive = (item) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || isSuperAdmin
  )

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
                  {item.badge && (
                    <span className={styles.menuBadge}>{item.badge}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.right}>
          <div className={styles.search}>
            <SearchIcon />
            <input 
              type="text" 
              placeholder="검색..."
              className={styles.searchInput}
            />
          </div>

          <button 
            className={styles.iconButton}
            onClick={() => router.push('/dashboard')}
            title="사이트로 이동"
          >
            <HomeIcon />
          </button>

          <button className={styles.iconButton} title="알림">
            <BellIcon />
            <span className={styles.notifBadge}>3</span>
          </button>

          <div className={styles.profileContainer}>
            <button 
              className={styles.profileButton}
              onClick={() => setShowProfile(!showProfile)}
            >
              <Image 
                src={user.avatar || '/default-avatar.png'}
                alt={user.name}
                width={32}
                height={32}
                className={styles.avatar}
              />
            </button>

            {showProfile && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <p className={styles.userName}>{user.name}</p>
                  <span className={styles.userRole}>
                    {isSuperAdmin ? '최고 관리자' : '관리자'}
                  </span>
                </div>
                <div className={styles.divider} />
                <button 
                  className={styles.dropdownItem}
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>

          <button 
            className={styles.mobileMenuButton}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div className={styles.mobileMenu}>
          {filteredMenuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`${styles.mobileMenuItem} ${
                isActive(item) ? styles.mobileActive : ''
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              {item.label}
              {item.badge && (
                <span className={styles.menuBadge}>{item.badge}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}
```

**CSS**: `src/components/admin/common/AdminNavbar.module.css`

```css
.navbar {
  background-color: white;
}

.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 var(--space-xl);
  height: 64px;
}

.left {
  display: flex;
  align-items: center;
  gap: var(--space-2xl);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
}

.logoText {
  font-size: var(--heading-sm);
  font-weight: 700;
  color: var(--gray-900);
}

.desktopMenu {
  display: flex;
  gap: var(--space-xs);
  list-style: none;
  padding: 0;
  margin: 0;
}

.menuItem {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  color: var(--gray-600);
  text-decoration: none;
  border-radius: 6px;
  font-size: var(--body-md);
  font-weight: 500;
  transition: all 0.2s;
}

.menuItem:hover {
  background-color: var(--gray-50);
  color: var(--gray-900);
}

.menuItem.active {
  background-color: var(--admin-primary-light);
  color: var(--admin-primary);
}

.menuBadge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background-color: var(--status-danger);
  color: white;
  font-size: 11px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.search {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  background-color: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  width: 240px;
}

.searchInput {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: var(--body-md);
}

.iconButton {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--gray-600);
  border-radius: 8px;
  transition: background-color 0.2s;
}

.iconButton:hover {
  background-color: var(--gray-50);
}

.notifBadge {
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background-color: var(--status-danger);
  color: white;
  font-size: 10px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profileContainer {
  position: relative;
}

.profileButton {
  display: flex;
  padding: 4px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 50%;
}

.avatar {
  border-radius: 50%;
  border: 2px solid var(--gray-200);
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.dropdownHeader {
  padding: var(--space-md);
  background-color: var(--gray-50);
}

.userName {
  font-size: var(--body-md);
  font-weight: 600;
  margin: 0 0 4px 0;
}

.userRole {
  display: inline-block;
  padding: 2px 8px;
  background-color: var(--admin-primary-light);
  color: var(--admin-primary);
  font-size: var(--body-sm);
  border-radius: 4px;
  font-weight: 500;
}

.divider {
  height: 1px;
  background-color: var(--gray-200);
}

.dropdownItem {
  display: block;
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
}

.dropdownItem:hover {
  background-color: var(--gray-50);
}

.mobileMenuButton {
  display: none;
}

.mobileMenu {
  display: none;
  border-top: 1px solid var(--gray-200);
}

.mobileMenuItem {
  display: flex;
  justify-content: space-between;
  padding: var(--space-md) var(--space-xl);
  color: var(--gray-700);
  text-decoration: none;
  border-bottom: 1px solid var(--gray-100);
}

.mobileMenuItem.mobileActive {
  background-color: var(--admin-primary-light);
  color: var(--admin-primary);
  font-weight: 600;
}

@media (max-width: 1024px) {
  .desktopMenu {
    display: none;
  }
  .mobileMenuButton {
    display: flex;
  }
  .mobileMenu {
    display: block;
  }
}

@media (max-width: 640px) {
  .logoText {
    display: none;
  }
  .search {
    display: none;
  }
}
```

## 3. 브레드크럼 (Breadcrumb.jsx)

**위치**: `src/components/admin/common/Breadcrumb.jsx`  
**코드 길이**: ~70줄

```jsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './Breadcrumb.module.css'

const pathNames = {
  '/admin': '대시보드',
  '/admin/users': '사용자 관리',
  '/admin/studies': '스터디 관리',
  '/admin/reports': '신고 처리',
  '/admin/analytics': '통계 및 분석',
  '/admin/settings': '시스템 설정',
  '/admin/logs': '감사 로그'
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)
  
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/')
    const label = pathNames[path] || segment
    
    return {
      path,
      label,
      isLast: index === pathSegments.length - 1
    }
  })

  return (
    <nav className={styles.breadcrumb}>
      <ol className={styles.list}>
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className={styles.item}>
            {index > 0 && <span className={styles.separator}>/</span>}
            {crumb.isLast ? (
              <span className={styles.current}>{crumb.label}</span>
            ) : (
              <Link href={crumb.path} className={styles.link}>
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

**CSS**: `src/components/admin/common/Breadcrumb.module.css`

```css
.breadcrumb {
  font-size: var(--body-md);
}

.list {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: var(--space-sm);
}

.item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.separator {
  color: var(--gray-400);
}

.link {
  color: var(--gray-600);
  text-decoration: none;
  transition: color 0.2s;
}

.link:hover {
  color: var(--admin-primary);
}

.current {
  color: var(--gray-900);
  font-weight: 500;
}
```

## ✅ 체크리스트

- [x] Server Component 레이아웃
- [x] 상단 네비게이션 구조
- [x] CSS 모듈 분리
- [x] 고유 className
- [x] 100-300줄 준수
- [x] 반응형 디자인
- [x] 모바일 햄버거 메뉴

