# 관리자 레이아웃 설계

> **화면**: 관리자 전체 레이아웃  
> **경로**: `/admin/*`  
> **권한**: ADMIN, SYSTEM_ADMIN

---

## 🎯 레이아웃 구조

### Desktop (1920x1080)
```
┌─────────────────────────────────────────────────────────────┐
│  Header (고정, 64px)                                         │
│  [Logo Admin] [검색] [알림 🔔 3] [프로필 홍길동 ▼]           │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  Sidebar   │  Content Area                                 │
│  (240px)   │  (나머지 공간)                                 │
│            │                                                │
│  📊 대시보드 │  ┌──────────────────────────────────────┐   │
│  👥 사용자   │  │  Page Header                         │   │
│  📚 스터디   │  │  제목 + 필터 + 액션 버튼              │   │
│  ⚠️ 신고    │  └──────────────────────────────────────┘   │
│  📝 콘텐츠   │                                                │
│  📈 통계     │  ┌──────────────────────────────────────┐   │
│  ⚙️ 설정    │  │  Main Content                        │   │
│            │  │  - 테이블                             │   │
│  ──────    │  │  - 차트                               │   │
│  🏠 메인으로│  │  - 폼                                 │   │
│  🚪 로그아웃│  │  (스크롤 가능)                        │   │
│            │  └──────────────────────────────────────┘   │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘
```

---

## 🎨 컴포넌트 상세

### 1. Header (AdminHeader.jsx)

#### 1.1 로고 영역
```
[🔧 CoUp Admin]
```
- 관리자 모드임을 명확히 표시
- 클릭 시 → 대시보드로 이동

#### 1.2 검색바
```
[🔍 사용자, 스터디 검색...]
```
- 전역 검색 기능
- 자동완성 지원
- 검색 결과:
  - 사용자 (이름, 이메일)
  - 스터디 (이름)
  - 신고 (ID)

#### 1.3 알림 아이콘
```
[🔔 3]
```
- 읽지 않은 알림 개수 표시
- 클릭 시 드롭다운:
  ```
  ┌─────────────────────────────┐
  │  알림                        │
  ├─────────────────────────────┤
  │  [🔴] 긴급 신고 접수          │
  │       5분 전                 │
  │                             │
  │  [⚠️] 시스템 경고            │
  │       1시간 전               │
  │                             │
  │  [모두 보기 →]              │
  └─────────────────────────────┘
  ```

#### 1.4 프로필 드롭다운
```
[👤 홍길동 ▼]
```
- 클릭 시 메뉴:
  ```
  ┌─────────────────────────────┐
  │  홍길동                      │
  │  admin@coup.com             │
  │  역할: ADMIN                │
  ├─────────────────────────────┤
  │  🏠 메인 사이트로 이동       │
  │  ⚙️ 내 설정                  │
  │  🚪 로그아웃                 │
  └─────────────────────────────┘
  ```

#### 스타일 (AdminHeader.module.css)
```css
.header {
  height: 64px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--admin-primary-600);
  display: flex;
  align-items: center;
  gap: 8px;
}

.search {
  flex: 1;
  max-width: 500px;
  margin: 0 auto;
}

.notificationIcon {
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #EF4444;
  color: white;
  border-radius: 9999px;
  padding: 2px 6px;
  font-size: 0.75rem;
}
```

---

### 2. Sidebar (AdminSidebar.jsx)

#### 2.1 메뉴 구조
```javascript
const menuItems = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: '📊',
    path: '/admin',
    badge: null
  },
  {
    id: 'users',
    label: '사용자',
    icon: '👥',
    path: '/admin/users',
    badge: null
  },
  {
    id: 'studies',
    label: '스터디',
    icon: '📚',
    path: '/admin/studies',
    badge: null
  },
  {
    id: 'reports',
    label: '신고',
    icon: '⚠️',
    path: '/admin/reports',
    badge: 23, // 미처리 신고 수
    badgeColor: 'danger'
  },
  {
    id: 'content',
    label: '콘텐츠',
    icon: '📝',
    path: '/admin/content',
    badge: null
  },
  {
    id: 'stats',
    label: '통계',
    icon: '📈',
    path: '/admin/stats',
    badge: null
  },
  {
    id: 'settings',
    label: '설정',
    icon: '⚙️',
    path: '/admin/settings',
    badge: null,
    adminOnly: 'SYSTEM_ADMIN' // SYSTEM_ADMIN만 표시
  }
]
```

#### 2.2 메뉴 아이템 렌더링
```jsx
<nav className={styles.sidebar}>
  <ul className={styles.menuList}>
    {menuItems.map(item => (
      <li key={item.id}>
        <Link
          href={item.path}
          className={`${styles.menuItem} ${
            pathname === item.path ? styles.active : ''
          }`}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
          {item.badge && (
            <span className={`${styles.badge} ${styles[item.badgeColor]}`}>
              {item.badge}
            </span>
          )}
        </Link>
      </li>
    ))}
  </ul>

  <div className={styles.bottomMenu}>
    <Link href="/dashboard" className={styles.menuItem}>
      <span className={styles.icon}>🏠</span>
      <span className={styles.label}>메인으로</span>
    </Link>
    <button onClick={handleLogout} className={styles.menuItem}>
      <span className={styles.icon}>🚪</span>
      <span className={styles.label}>로그아웃</span>
    </button>
  </div>
</nav>
```

#### 스타일 (AdminSidebar.module.css)
```css
.sidebar {
  width: 240px;
  height: calc(100vh - 64px);
  background: white;
  border-right: 1px solid #E5E7EB;
  position: fixed;
  top: 64px;
  left: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.menuList {
  flex: 1;
  padding: 16px 0;
}

.menuItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #4B5563;
  transition: all 0.2s;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.menuItem:hover {
  background: #F9FAFB;
  color: #111827;
}

.menuItem.active {
  background: #F5F3FF;
  color: var(--admin-primary-600);
  border-left-color: var(--admin-primary-600);
  font-weight: 600;
}

.badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.danger {
  background: #FEE2E2;
  color: #DC2626;
}

.bottomMenu {
  border-top: 1px solid #E5E7EB;
  padding: 16px 0;
}
```

---

### 3. Content Area (AdminLayout.jsx)

#### 3.1 레이아웃 컴포넌트
```jsx
export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminLayout}>
      <AdminHeader />
      <div className={styles.container}>
        <AdminSidebar />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### 스타일 (AdminLayout.module.css)
```css
.adminLayout {
  min-height: 100vh;
  background: #F9FAFB;
}

.container {
  display: flex;
  padding-top: 64px; /* Header 높이 */
}

.content {
  margin-left: 240px; /* Sidebar 너비 */
  width: calc(100% - 240px);
  padding: 24px;
  min-height: calc(100vh - 64px);
}
```

---

## 📱 반응형 디자인

### Tablet (768px ~ 1199px)
```
- Sidebar: 축소 (아이콘만)
- Content: 확장
```

### Mobile (~ 767px)
```
- Sidebar: 햄버거 메뉴 (오버레이)
- Header: 간소화
```

---

## 🔐 권한 체크

### 페이지 레벨 체크
```jsx
// app/admin/layout.jsx
export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)
  
  if (!session || !['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }
  
  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>
}
```

---

**다음 문서**: `04-dashboard.md` - 대시보드 화면 설계

