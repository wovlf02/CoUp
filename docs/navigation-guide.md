# 네비게이션 바 전역 적용 가이드

> **작성일**: 2025년 11월 5일  
> **구현 완료일**: 2025년 11월 5일

---

## 📋 개요

CoUp 프로젝트의 좌측 네비게이션 바는 **로그인/회원가입 페이지를 제외한 모든 페이지에서 전역으로 표시**됩니다.

---

## 🎯 네비게이션 표시 규칙

### ✅ 네비게이션 표시 (MainLayout 적용)
- `/dashboard` - 대시보드
- `/studies` - 스터디 탐색
- `/studies/[id]` - 스터디 상세 (개요, 채팅, 공지, 파일, 캘린더, 할일)
- `/my-studies` - 내 스터디
- `/tasks` - 할 일
- `/notifications` - 알림
- `/me` - 마이페이지
- `/settings` - 설정
- `/admin/*` - 관리자 페이지 (관리자용 네비게이션)

### ❌ 네비게이션 숨김 (레이아웃 없음)
- `/` - 랜딩 페이지 (자체 헤더 사용)
- `/sign-in` - 로그인
- `/sign-up` - 회원가입
- `/privacy` - 개인정보 처리방침
- `/terms` - 이용약관

---

## 🏗️ 구현 구조

### 1. 루트 레이아웃 (`app/layout.js`)
```javascript
import ConditionalLayout from '@/components/layout/ConditionalLayout'

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  )
}
```

### 2. 조건부 레이아웃 (`components/layout/ConditionalLayout.jsx`)
```javascript
'use client'

import { usePathname } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'

export default function ConditionalLayout({ children }) {
  const pathname = usePathname()

  // 네비게이션을 표시하지 않을 경로들
  const noLayoutPaths = [
    '/',           // 랜딩 페이지
    '/sign-in',    // 로그인
    '/sign-up',    // 회원가입
    '/privacy',    // 개인정보처리방침
    '/terms'       // 이용약관
  ]

  // 현재 경로가 제외 목록에 있는지 확인
  const shouldShowLayout = !noLayoutPaths.some(path => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  })

  // 관리자 페이지 여부 확인
  const isAdminPage = pathname.startsWith('/admin')

  if (!shouldShowLayout) {
    return <>{children}</>
  }

  return <MainLayout isAdmin={isAdminPage}>{children}</MainLayout>
}
```

### 3. 메인 레이아웃 (`components/layout/MainLayout.jsx`)
```javascript
'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import styles from './MainLayout.module.css'

export default function MainLayout({ children, isAdmin = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <Sidebar isAdmin={isAdmin} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Header */}
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
```

---

## 📱 컴포넌트 구조

### Sidebar (좌측 네비게이션)
- **위치**: `components/layout/Sidebar.jsx`
- **기능**: 메뉴 아이템 표시, 현재 페이지 활성화 표시
- **Props**:
  - `isAdmin`: 관리자 메뉴 표시 여부
  - `isOpen`: 모바일에서 열림/닫힘 상태
  - `onClose`: 모바일에서 메뉴 닫기 콜백

**일반 사용자 메뉴**:
- 🏠 대시보드 (`/dashboard`)
- 🔍 스터디 탐색 (`/studies`)
- 👥 내 스터디 (`/my-studies`)
- 📋 할 일 (`/tasks`)
- 🔔 알림 (`/notifications`)
- 👤 마이페이지 (`/me`)
- ⚙️ 설정 (`/settings`)
- 🚪 로그아웃

**관리자 메뉴**:
- 📊 대시보드 (`/admin`)
- 👥 사용자 관리 (`/admin/users`)
- 📚 스터디 관리 (`/admin/studies`)
- ⚠️ 신고 관리 (`/admin/reports`)
- 📈 통계 분석 (`/admin/analytics`)
- ⚙️ 시스템 설정 (`/admin/settings`)
- 🏠 메인으로 (`/dashboard`)
- 🚪 로그아웃

### Header (상단 헤더)
- **위치**: `components/layout/Header.jsx`
- **기능**: 검색, 알림, 프로필 드롭다운
- **Props**:
  - `onMenuToggle`: 모바일에서 사이드바 토글 콜백

**구성 요소**:
- 모바일 메뉴 버튼 (☰)
- 검색 바
- 알림 아이콘 (배지 포함)
- 프로필 버튼 (드롭다운)

---

## 🎨 스타일링

### 반응형 레이아웃
```css
/* Desktop (1280px+) */
.sidebar {
  width: 240px; /* 15% */
}
.main {
  margin-left: 240px;
  margin-top: 64px; /* Header 높이 */
}

/* Tablet (768-1279px) */
.sidebar {
  width: 200px; /* 12% */
}
.main {
  margin-left: 200px;
  margin-top: 64px;
}

/* Mobile (<768px) */
.sidebar {
  transform: translateX(-100%); /* 기본 숨김 */
  width: 280px;
}
.sidebar.open {
  transform: translateX(0); /* 열림 */
}
.main {
  margin-left: 0;
  margin-top: 56px; /* Header 높이 줄어듦 */
}
```

---

## ✅ 페이지별 적용 방법

### 기존 페이지 수정
기존 페이지에서 **MainLayout을 제거**하세요. ConditionalLayout이 자동으로 적용합니다.

**Before:**
```jsx
import MainLayout from '@/components/layout/MainLayout'

export default function DashboardPage() {
  return (
    <MainLayout>
      <div>대시보드 콘텐츠</div>
    </MainLayout>
  )
}
```

**After:**
```jsx
export default function DashboardPage() {
  return (
    <div>대시보드 콘텐츠</div>
  )
}
```

### 새 페이지 생성
새 페이지는 **콘텐츠만 구현**하면 됩니다. 네비게이션은 자동으로 적용됩니다.

```jsx
export default function NewPage() {
  return (
    <div className={styles.container}>
      <h1>페이지 제목</h1>
      <p>페이지 콘텐츠</p>
    </div>
  )
}
```

### 예외 페이지 추가
새로운 예외 페이지가 필요하면 `ConditionalLayout.jsx`의 `noLayoutPaths`에 추가:

```javascript
const noLayoutPaths = [
  '/',
  '/sign-in',
  '/sign-up',
  '/privacy',
  '/terms',
  '/new-exception-path', // 새로운 예외 경로
]
```

---

## 🧪 테스트 체크리스트

### Desktop
- [ ] 모든 페이지에서 좌측 네비게이션 표시
- [ ] 랜딩/로그인/회원가입 페이지에서 네비게이션 숨김
- [ ] 네비게이션 메뉴 클릭 시 정상 이동
- [ ] 현재 페이지 활성화 표시 (파란색)
- [ ] 상단 헤더 고정 표시
- [ ] 검색, 알림, 프로필 버튼 동작

### Tablet
- [ ] 네비게이션 너비 축소 (200px)
- [ ] 콘텐츠 영역 자동 조정

### Mobile
- [ ] 네비게이션 기본 숨김
- [ ] 햄버거 메뉴 버튼 표시
- [ ] 햄버거 클릭 시 사이드바 슬라이드 인
- [ ] 오버레이 클릭 시 사이드바 닫힘
- [ ] 메뉴 클릭 시 사이드바 자동 닫힘

### 관리자
- [ ] `/admin` 경로에서 관리자 네비게이션 표시
- [ ] 빨간색 테마 적용
- [ ] "메인으로" 버튼 표시

---

## 📝 구현 완료 내역

### 생성된 파일
1. `components/layout/ConditionalLayout.jsx` - 조건부 레이아웃 래퍼
2. `components/layout/MainLayout.jsx` - 메인 레이아웃 (네비게이션 + 헤더)
3. `components/layout/Sidebar.jsx` - 좌측 네비게이션 바
4. `components/layout/Sidebar.module.css` - 네비게이션 스타일
5. `components/layout/Header.jsx` - 상단 헤더
6. `components/layout/Header.module.css` - 헤더 스타일
7. `components/layout/MainLayout.module.css` - 메인 레이아웃 스타일

### 수정된 파일
1. `app/layout.js` - ConditionalLayout 적용
2. `app/dashboard/page.jsx` - MainLayout 제거
3. `app/studies/[studyId]/notices/page.jsx` - 헤더 구조 수정
4. `app/studies/[studyId]/notices/[noticeId]/page.jsx` - 헤더 구조 수정

---

## 🎉 완료!

이제 CoUp의 모든 페이지에서 **일관된 네비게이션 경험**을 제공합니다!

- ✅ 로그인/회원가입을 제외한 모든 페이지에 자동 적용
- ✅ 반응형 디자인 (Desktop/Tablet/Mobile)
- ✅ 관리자 페이지 별도 네비게이션
- ✅ 간편한 페이지 개발 (콘텐츠만 구현)

---

**작성자**: CoUp 개발팀  
**문서 버전**: 1.0.0  
**최종 업데이트**: 2025년 11월 5일

