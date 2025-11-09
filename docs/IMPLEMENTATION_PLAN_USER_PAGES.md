# 사용자 페이지 구현 설계 (Mock 기반 UI 우선)

> 마이페이지, 알림, 할 일 화면 구현 계획 (화면 레이아웃 & 디자인 확인용)  
> **작성일**: 2025-01-09  
> **업데이트**: 2025-01-09  
> **구현 방식**: Mock Data/API 기반 프론트엔드 우선 구현  
> **참고 문서**: 
> - `docs/screens/my-page/main.md`
> - `docs/screens/notifications/main.md`
> - `docs/screens/tasks/main.md`
> - `docs/screens/user/my-page.md`, `notifications.md`

---

## ? 구현 목표

**1단계: 화면 레이아웃 및 디자인 확인**
- Mock Data로 실제 데이터 구조 시뮬레이션
- Mock API로 상태 변경 동작 확인
- 실제 API 연동은 백엔드 준비 후 진행

**구현 범위**
- ? UI/UX 레이아웃 완성
- ? 인터랙션 및 상태 관리
- ? 스타일링 및 반응형
- ? 실제 API 연동 (추후)
- ? 인증/권한 처리 (추후)
- ? WebSocket 실시간 통신 (추후)

---

## ? 파일 구조 설계

### 1. 마이페이지 (`/me`)

```
coup/src/
├── app/
│   └── me/
│       ├── page.jsx                      # 마이페이지 메인
│       └── page.module.css               # 마이페이지 스타일
│
├── components/
│   └── my-page/
│       ├── ProfileSection.jsx            # 프로필 섹션 (이미지 + 기본 정보)
│       ├── ProfileSection.module.css
│       ├── ProfileEditForm.jsx           # 정보 수정 폼 (이름, 자기소개)
│       ├── ProfileEditForm.module.css
│       ├── MyStudiesList.jsx             # 참여 스터디 목록
│       ├── MyStudiesList.module.css
│       ├── ActivityStats.jsx             # 활동 통계 위젯
│       ├── ActivityStats.module.css
│       ├── AccountActions.jsx            # 계정 관리 (로그아웃, 삭제)
│       ├── AccountActions.module.css
│       └── DeleteAccountModal.jsx        # 계정 삭제 확인 모달
│           └── DeleteAccountModal.module.css
│
├── mocks/
│   └── user.js                           # 사용자 프로필, 참여 스터디, 통계 Mock Data
│
└── styles/
    └── my-page/
        └── my-page.module.css            # 마이페이지 전역 스타일
```

### 2. 알림 페이지 (`/notifications`)

```
coup/src/
├── app/
│   └── notifications/
│       ├── page.jsx                      # 알림 메인 페이지
│       └── page.module.css               # 알림 페이지 스타일
│
├── components/
│   └── notifications/
│       ├── NotificationCard.jsx          # 알림 카드 컴포넌트
│       ├── NotificationCard.module.css
│       ├── NotificationFilters.jsx       # 필터 바 (전체/읽지않음)
│       ├── NotificationFilters.module.css
│       ├── NotificationStats.jsx         # 알림 통계 위젯
│       ├── NotificationStats.module.css
│       ├── NotificationTypeFilter.jsx    # 유형별 필터 위젯
│       ├── NotificationTypeFilter.module.css
│       ├── NotificationSettings.jsx      # 알림 설정 위젯
│       ├── NotificationSettings.module.css
│       └── NotificationEmpty.jsx         # 빈 상태
│           └── NotificationEmpty.module.css
│
├── mocks/
│   └── notifications.js                  # 알림 목록, 통계 Mock Data
│
├── hooks/
│   ├── useSocket.js                      # WebSocket 연결 훅
│   └── useNotifications.js               # 알림 상태 관리 훅
│
└── styles/
    └── notifications/
        └── notifications.module.css      # 알림 페이지 전역 스타일
```

### 3. 할 일 페이지 (`/tasks`)

```
coup/src/
├── app/
│   └── tasks/
│       ├── page.jsx                      # 할 일 메인 페이지
│       └── page.module.css               # 할 일 페이지 스타일
│
├── components/
│   └── tasks/
│       ├── TaskCard.jsx                  # 할 일 카드 컴포넌트
│       ├── TaskCard.module.css
│       ├── TaskGroup.jsx                 # 할 일 그룹 (긴급/이번주/나중에)
│       ├── TaskGroup.module.css
│       ├── TaskFilters.jsx               # 필터 바 (스터디/상태/정렬)
│       ├── TaskFilters.module.css
│       ├── TaskDetailModal.jsx           # 할 일 상세 모달
│       ├── TaskDetailModal.module.css
│       ├── TodayTasksWidget.jsx          # 오늘의 할 일 위젯
│       ├── TodayTasksWidget.module.css
│       ├── TaskProgressWidget.jsx        # 이번 주 진행률 위젯
│       ├── TaskProgressWidget.module.css
│       ├── TaskByStudyWidget.jsx         # 스터디별 할 일 위젯
│       ├── TaskByStudyWidget.module.css
│       ├── TaskAchievementWidget.jsx     # 달성률 위젯
│       ├── TaskAchievementWidget.module.css
│       ├── TaskTipsWidget.jsx            # 할 일 관리 팁 위젯
│       ├── TaskTipsWidget.module.css
│       └── TaskEmpty.jsx                 # 빈 상태 (3가지)
│           └── TaskEmpty.module.css
│
├── mocks/
│   └── tasks.js                          # 할 일 목록, 댓글, 통계 Mock Data
│
└── styles/
    └── tasks/
        └── tasks.module.css              # 할 일 페이지 전역 스타일
```

---

## ? 구현 순서 (Mock 기반 UI 우선)

### ? Phase 1: 기본 Mock Data 및 유틸리티 (최우선)

**1. Mock Data 생성**
   - [ ] `mocks/user.js` - 사용자 프로필, 참여 스터디, 통계 데이터
   - [ ] `mocks/notifications.js` - 알림 목록, 통계, 설정 데이터
   - [ ] `mocks/tasks.js` - 할 일 목록, 댓글, 첨부파일, 통계 데이터

**2. 유틸리티 함수 생성**
   - [ ] `utils/time.js` - 상대 시간, 날짜 포맷, 마감일 계산
   - [ ] `utils/format.js` - 텍스트 포맷팅, 숫자 포맷팅

**3. 공통 스타일 변수 추가**
   - [ ] `styles/variables.css`에 레이아웃 변수 추가
   - [ ] 알림/할일 상태별 색상 변수 추가

---

### ? Phase 2: 마이페이지 기본 구조 (우선순위: 높음)

**4. 마이페이지 레이아웃**
   - [ ] `app/me/page.jsx` - 2컬럼 그리드 레이아웃
   - [ ] `app/me/page.module.css` - 페이지 스타일

**5. 마이페이지 컴포넌트**
   - [ ] `components/my-page/ProfileSection.jsx` + CSS - 프로필 섹션
   - [ ] `components/my-page/ProfileEditForm.jsx` + CSS - 정보 수정 폼
   - [ ] `components/my-page/MyStudiesList.jsx` + CSS - 참여 스터디 목록
   - [ ] `components/my-page/ActivityStats.jsx` + CSS - 활동 통계 위젯
   - [ ] `components/my-page/AccountActions.jsx` + CSS - 계정 관리
   - [ ] `components/my-page/DeleteAccountModal.jsx` + CSS - 삭제 확인 모달

**6. 마이페이지 기능 (Mock)**
   - [ ] 프로필 이미지 변경 (파일 선택만, 실제 업로드는 추후)
   - [ ] 이름/자기소개 수정 (로컬 상태만 변경)
   - [ ] 로그아웃 버튼 (콘솔 로그만)
   - [ ] 계정 삭제 모달 (UI만)

---

### ? Phase 3: 알림 페이지 기본 구조 (우선순위: 높음)

**7. 알림 페이지 레이아웃**
   - [ ] `app/notifications/page.jsx` - 3컬럼 레이아웃
   - [ ] `app/notifications/page.module.css` - 페이지 스타일

**8. 알림 메인 컴포넌트**
   - [ ] `components/notifications/NotificationCard.jsx` + CSS - 알림 카드
   - [ ] `components/notifications/NotificationFilters.jsx` + CSS - 필터 바
   - [ ] `components/notifications/NotificationEmpty.jsx` + CSS - 빈 상태

**9. 알림 위젯 컴포넌트**
   - [ ] `components/notifications/NotificationStats.jsx` + CSS - 통계 위젯
   - [ ] `components/notifications/NotificationTypeFilter.jsx` + CSS - 유형별 필터
   - [ ] `components/notifications/NotificationSettings.jsx` + CSS - 설정 위젯

**10. 알림 기능 (Mock)**
   - [ ] 읽음/읽지않음 필터링
   - [ ] 알림 클릭 → 읽음 처리 (로컬 상태)
   - [ ] 모두 읽음 처리 (로컬 상태)
   - [ ] 알림 클릭 → 페이지 이동 (콘솔 로그)

---

### ? Phase 4: 할 일 페이지 기본 구조 (우선순위: 높음)

**11. 할 일 페이지 레이아웃**
   - [ ] `app/tasks/page.jsx` - 3컬럼 레이아웃
   - [ ] `app/tasks/page.module.css` - 페이지 스타일

**12. 할 일 메인 컴포넌트**
   - [ ] `components/tasks/TaskCard.jsx` + CSS - 할 일 카드
   - [ ] `components/tasks/TaskGroup.jsx` + CSS - 그룹 (긴급/이번주/나중에)
   - [ ] `components/tasks/TaskFilters.jsx` + CSS - 필터 바
   - [ ] `components/tasks/TaskEmpty.jsx` + CSS - 빈 상태 (3종)

**13. 할 일 위젯 컴포넌트**
   - [ ] `components/tasks/TodayTasksWidget.jsx` + CSS - 오늘의 할 일
   - [ ] `components/tasks/TaskProgressWidget.jsx` + CSS - 진행률 위젯
   - [ ] `components/tasks/TaskByStudyWidget.jsx` + CSS - 스터디별 위젯
   - [ ] `components/tasks/TaskAchievementWidget.jsx` + CSS - 달성률 위젯
   - [ ] `components/tasks/TaskTipsWidget.jsx` + CSS - 관리 팁 위젯

**14. 할 일 기능 (Mock)**
   - [ ] 체크박스 완료/미완료 토글 (로컬 상태)
   - [ ] 스터디/상태/정렬 필터링
   - [ ] 긴급도별 그룹화 (24시간/7일/그 이후)
   - [ ] 할 일 카드 클릭 → 상세 모달 (UI만)

---

### ? Phase 5: 할 일 상세 모달 (우선순위: 중간)

**15. 할 일 상세 모달**
   - [ ] `components/tasks/TaskDetailModal.jsx` + CSS - 상세 정보 모달
   - [ ] 상세 정보 표시 (제목, 설명, 마감일, 생성자)
   - [ ] 첨부 파일 목록 표시
   - [ ] 멤버별 완료 현황 표시
   - [ ] 댓글 목록 표시
   - [ ] 댓글 입력 폼 (UI만)
   - [ ] 완료/수정/삭제 버튼 (UI만)

---

### ? Phase 6: 네비게이션 및 라우팅 (우선순위: 중간)

**16. 네비게이션 업데이트**
   - [ ] `components/layout/Sidebar.jsx` - 메뉴 항목 추가
     - ? 할 일 → `/tasks`
     - ? 알림 → `/notifications`
     - ? 마이페이지 → `/me`
   - [ ] 활성 메뉴 하이라이트 처리
   - [ ] 알림 배지 카운트 표시 (Mock)

---

### ? Phase 7: 반응형 디자인 (우선순위: 낮음)

**17. 반응형 스타일**
   - [ ] 마이페이지: 2컬럼 → 1컬럼 (Tablet)
   - [ ] 알림 페이지: 3컬럼 → 2컬럼 → 1컬럼
   - [ ] 할 일 페이지: 3컬럼 → 2컬럼 → 1컬럼
   - [ ] 모바일 메뉴 처리
   - [ ] 터치 인터랙션 최적화

---

### ? Phase 8: UI/UX 개선 (우선순위: 낮음)

**18. 애니메이션 및 전환 효과**
   - [ ] 카드 호버 효과
   - [ ] 모달 열기/닫기 애니메이션
   - [ ] 토스트 알림 애니메이션
   - [ ] 로딩 스켈레톤
   - [ ] 빈 상태 일러스트레이션

**19. 접근성 개선**
   - [ ] 키보드 네비게이션
   - [ ] ARIA 레이블
   - [ ] 포커스 인디케이터
   - [ ] 스크린 리더 지원

---

### ? Phase 9: 실제 API 연동 (백엔드 준비 후)

**20. API 연동 준비**
   - [ ] `lib/api/user.js` - 사용자 API 함수
   - [ ] `lib/api/notifications.js` - 알림 API 함수
   - [ ] `lib/api/tasks.js` - 할 일 API 함수
   - [ ] Mock API → 실제 API 교체
   - [ ] 에러 처리 및 로딩 상태 추가

**21. WebSocket 연동**
   - [ ] `hooks/useSocket.js` - WebSocket 연결
   - [ ] `hooks/useNotifications.js` - 알림 상태 관리
   - [ ] 실시간 알림 수신
   - [ ] 실시간 할 일 업데이트

---

## ? 상세 구현 가이드

### 1. 마이페이지 (`/me`)

#### 1-1. 페이지 컴포넌트 (`app/me/page.jsx`)

```jsx
'use client'

import { useState } from 'react'
import ProfileSection from '@/components/my-page/ProfileSection'
import ProfileEditForm from '@/components/my-page/ProfileEditForm'
import MyStudiesList from '@/components/my-page/MyStudiesList'
import ActivityStats from '@/components/my-page/ActivityStats'
import AccountActions from '@/components/my-page/AccountActions'
import { currentUser, userStudies, userStats } from '@/mocks/user'
import styles from './page.module.css'

export default function MyPage() {
  const [user, setUser] = useState(currentUser)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>? 마이페이지</h1>
      </header>

      <div className={styles.contentGrid}>
        {/* 좌측 컬럼 */}
        <div className={styles.leftColumn}>
          <ProfileSection user={user} />
          <MyStudiesList studies={userStudies} />
        </div>

        {/* 우측 컬럼 */}
        <div className={styles.rightColumn}>
          <ProfileEditForm user={user} onUpdate={setUser} />
          <ActivityStats stats={userStats} />
        </div>
      </div>

      {/* 하단 전체 너비 */}
      <div className={styles.fullWidthSection}>
        <AccountActions />
      </div>
    </div>
  )
}
```

#### 1-2. 프로필 섹션 (`components/my-page/ProfileSection.jsx`)

```jsx
'use client'

import Image from 'next/image'
import { useState } from 'react'
import styles from './ProfileSection.module.css'

export default function ProfileSection({ user }) {
  const [uploading, setUploading] = useState(false)

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다')
      return
    }

    setUploading(true)
    // TODO: 실제 업로드 로직 구현
    setTimeout(() => setUploading(false), 1000)
  }

  const getInitials = (name) => {
    return name.charAt(0).toUpperCase()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>1. 프로필</h2>

      <div className={styles.profileContent}>
        <div className={styles.profileImageWrapper}>
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.name}
              width={128}
              height={128}
              className={styles.profileImage}
            />
          ) : (
            <div className={styles.profileImagePlaceholder}>
              {getInitials(user.name)}
            </div>
          )}
        </div>

        <h3 className={styles.profileName}>{user.name}</h3>
        <p className={styles.profileEmail}>{user.email}</p>

        <label className={styles.changeImageButton}>
          {uploading ? '업로드 중...' : '프로필 이미지 변경'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>

        <p className={styles.profileInfo}>
          {user.provider === 'GOOGLE' ? 'Google 계정으로 가입' : '이메일로 가입'} · 
          가입일: {formatDate(user.createdAt)}
        </p>
      </div>
    </section>
  )
}
```

#### 1-3. Mock Data (`mocks/user.js`)

```javascript
export const currentUser = {
  id: 1,
  name: '김철수',
  email: 'kim@example.com',
  imageUrl: null, // 또는 '/avatars/1.png'
  bio: '안녕하세요! 백엔드 개발자입니다.\n알고리즘과 시스템 설계에 관심이 많습니다.',
  provider: 'GOOGLE', // GOOGLE, EMAIL
  createdAt: '2024-11-01T09:00:00',
}

export const userStudies = [
  {
    id: 1,
    name: '코딩테스트 마스터 스터디',
    emoji: '?',
    role: 'OWNER',
    memberCount: 12,
    lastActivityAt: '2024-11-09T09:00:00',
  },
  {
    id: 2,
    name: '취업 준비 스터디',
    emoji: '?',
    role: 'MEMBER',
    memberCount: 8,
    lastActivityAt: '2024-11-09T07:00:00',
  },
  {
    id: 3,
    name: '영어 회화 스터디',
    emoji: '?',
    role: 'ADMIN',
    memberCount: 15,
    lastActivityAt: '2024-11-08T09:00:00',
  },
  {
    id: 4,
    name: '운동 루틴 스터디',
    emoji: '?',
    role: 'MEMBER',
    memberCount: 5,
    lastActivityAt: '2024-11-07T09:00:00',
  },
]

export const userStats = {
  thisWeek: {
    completedTasks: 8,
    createdNotices: 3,
    uploadedFiles: 5,
    chatMessages: 42,
  },
  total: {
    studyCount: 4,
    completedTasks: 48,
    averageAttendance: 85,
    joinedDays: 9,
  },
  badges: [
    {
      id: 'study-master',
      icon: '?',
      name: '스터디 마스터',
      description: '4개 참여',
      unlocked: true,
    },
    {
      id: 'streak-7',
      icon: '?',
      name: '연속 출석 7일',
      description: '7일 연속 활동',
      unlocked: true,
    },
    {
      id: 'task-master',
      icon: '?',
      name: '할 일 완료왕',
      description: '48개 완료',
      unlocked: true,
    },
  ],
}
```

---

### 2. 알림 페이지 (`/notifications`)

#### 2-1. 페이지 컴포넌트 (`app/notifications/page.jsx`)

```jsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import NotificationCard from '@/components/notifications/NotificationCard'
import NotificationFilters from '@/components/notifications/NotificationFilters'
import NotificationStats from '@/components/notifications/NotificationStats'
import NotificationTypeFilter from '@/components/notifications/NotificationTypeFilter'
import NotificationEmpty from '@/components/notifications/NotificationEmpty'
import { notifications, notificationStats } from '@/mocks/notifications'
import styles from './page.module.css'

export default function NotificationsPage() {
  const [filter, setFilter] = useState('unread') // 'all', 'unread'
  const [notificationList, setNotificationList] = useState(notifications)

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notificationList.filter(n => !n.isRead)
    }
    return notificationList
  }, [notificationList, filter])

  const handleMarkAllAsRead = async () => {
    setNotificationList(prev => prev.map(n => ({ ...n, isRead: true })))
    // TODO: API 호출
    alert('모든 알림을 읽음 처리했습니다!')
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      setNotificationList(prev => prev.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      ))
      // TODO: API 호출
    }

    // TODO: 링크로 이동
    console.log('이동:', notification.data)
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>? 알림</h1>
          <NotificationFilters
            filter={filter}
            onFilterChange={setFilter}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </header>

        {filteredNotifications.length === 0 ? (
          <NotificationEmpty filter={filter} />
        ) : (
          <div className={styles.notificationList}>
            {filteredNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        )}
      </div>

      <aside className={styles.sidebar}>
        <NotificationStats stats={notificationStats} />
        <NotificationTypeFilter stats={notificationStats} />
      </aside>
    </div>
  )
}
```

#### 2-2. 알림 카드 (`components/notifications/NotificationCard.jsx`)

```jsx
import styles from './NotificationCard.module.css'

export default function NotificationCard({ notification, onClick }) {
  const getBadgeClass = (type) => {
    const map = {
      JOIN_APPROVED: styles.badgeJoin,
      NOTICE: styles.badgeNotice,
      FILE: styles.badgeFile,
      EVENT: styles.badgeEvent,
      TASK: styles.badgeTask,
      MEMBER: styles.badgeMember,
      KICK: styles.badgeKick,
    }
    return map[type] || styles.badgeDefault
  }

  const getBadgeText = (type) => {
    const map = {
      JOIN_APPROVED: '가입승인',
      NOTICE: '공지',
      FILE: '파일',
      EVENT: '일정',
      TASK: '할일',
      MEMBER: '멤버',
      KICK: '강퇴',
    }
    return map[type] || type
  }

  const getRelativeTime = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    return `${diffDays}일 전`
  }

  return (
    <div
      className={`${styles.card} ${!notification.isRead ? styles.unread : ''}`}
      onClick={onClick}
    >
      <div className={styles.header}>
        <span className={!notification.isRead ? styles.unreadDot : styles.readDot} />
        <span className={`${styles.badge} ${getBadgeClass(notification.type)}`}>
          [{getBadgeText(notification.type)}]
        </span>
        <span className={styles.studyName}>
          {notification.studyEmoji} {notification.studyName}
        </span>
      </div>
      <p className={styles.message}>{notification.message}</p>
      <p className={styles.time}>{getRelativeTime(notification.createdAt)}</p>
    </div>
  )
}
```

#### 2-3. Mock Data (`mocks/notifications.js`)

```javascript
export const notifications = [
  {
    id: 1,
    type: 'JOIN_APPROVED',
    title: '코딩테스트 마스터 스터디',
    message: '가입이 승인되었습니다',
    studyId: 1,
    studyName: '코딩테스트 마스터 스터디',
    studyEmoji: '?',
    isRead: false,
    createdAt: '2024-11-09T13:00:00',
    data: { studyId: 1 },
  },
  {
    id: 2,
    type: 'NOTICE',
    title: '알고리즘 마스터 스터디',
    message: '"이번 주 일정 안내" 공지가 등록되었습니다',
    studyId: 1,
    studyName: '알고리즘 마스터 스터디',
    studyEmoji: '?',
    isRead: false,
    createdAt: '2024-11-09T10:00:00',
    data: { studyId: 1, noticeId: 1 },
  },
  {
    id: 3,
    type: 'FILE',
    title: '취업 준비 스터디',
    message: '이영희님이 "자소서_템플릿.pdf"를 업로드했습니다',
    studyId: 2,
    studyName: '취업 준비 스터디',
    studyEmoji: '?',
    isRead: true,
    createdAt: '2024-11-08T09:00:00',
    data: { studyId: 2 },
  },
]

export const notificationStats = {
  today: 3,
  thisWeek: 12,
  unread: 5,
  total: 48,
  byType: {
    NOTICE: 4,
    FILE: 3,
    EVENT: 2,
    TASK: 2,
    MEMBER: 1,
  },
  byStudy: {
    1: { name: '알고리즘 마스터', emoji: '?', count: 5 },
    2: { name: '취업 준비', emoji: '?', count: 4 },
  },
}
```

---

### 3. 할 일 페이지 (`/tasks`)

#### 3-1. 페이지 컴포넌트 (`app/tasks/page.jsx`)

```jsx
'use client'

import { useState, useMemo } from 'react'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskGroup from '@/components/tasks/TaskGroup'
import TodayTasksWidget from '@/components/tasks/TodayTasksWidget'
import TaskProgressWidget from '@/components/tasks/TaskProgressWidget'
import TaskEmpty from '@/components/tasks/TaskEmpty'
import { userTasks, taskStats } from '@/mocks/tasks'
import styles from './page.module.css'

export default function TasksPage() {
  const [tasks, setTasks] = useState(userTasks)
  const [filter, setFilter] = useState({
    studyId: null,
    status: 'all',
    sortBy: 'deadline',
  })

  const filteredTasks = useMemo(() => {
    let result = tasks

    if (filter.studyId) {
      result = result.filter(t => t.studyId === filter.studyId)
    }

    if (filter.status === 'incomplete') {
      result = result.filter(t => !t.completed)
    } else if (filter.status === 'completed') {
      result = result.filter(t => t.completed)
    }

    // 정렬
    result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

    return result
  }, [tasks, filter])

  const groupedTasks = useMemo(() => {
    const now = new Date()
    const urgent = []
    const thisWeek = []
    const later = []

    filteredTasks.forEach(task => {
      const dueDate = new Date(task.dueDate)
      const hoursDiff = (dueDate - now) / (1000 * 60 * 60)
      const daysDiff = hoursDiff / 24

      if (hoursDiff <= 24) {
        urgent.push(task)
      } else if (daysDiff <= 7) {
        thisWeek.push(task)
      } else {
        later.push(task)
      }
    })

    return { urgent, thisWeek, later }
  }, [filteredTasks])

  const handleToggleComplete = async (taskId) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed, completedAt: new Date() }
        : task
    ))
    // TODO: API 호출
  }

  const incompleteCount = tasks.filter(t => !t.completed).length

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>? 내 할 일</h1>
        </header>

        <TaskFilters
          filter={filter}
          onFilterChange={setFilter}
          incompleteCount={incompleteCount}
        />

        {filteredTasks.length === 0 ? (
          <TaskEmpty type="no-tasks" />
        ) : (
          <>
            {groupedTasks.urgent.length > 0 && (
              <TaskGroup
                title="? 긴급 (마감 24시간 이내)"
                tasks={groupedTasks.urgent}
                onToggleComplete={handleToggleComplete}
              />
            )}
            {groupedTasks.thisWeek.length > 0 && (
              <TaskGroup
                title="?? 이번 주 (7일 이내)"
                tasks={groupedTasks.thisWeek}
                onToggleComplete={handleToggleComplete}
              />
            )}
            {groupedTasks.later.length > 0 && (
              <TaskGroup
                title="? 나중에 (7일 이후)"
                tasks={groupedTasks.later}
                onToggleComplete={handleToggleComplete}
              />
            )}
          </>
        )}
      </div>

      <aside className={styles.sidebar}>
        <TodayTasksWidget tasks={tasks} />
        <TaskProgressWidget stats={taskStats} />
      </aside>
    </div>
  )
}
```

#### 3-2. Mock Data (`mocks/tasks.js`)

```javascript
export const userTasks = [
  {
    id: 1,
    title: '백준 1234번 풀이',
    description: '백준 1234번 문제를 풀고 풀이를 공유해주세요.',
    studyId: 1,
    studyName: '알고리즘 마스터 스터디',
    studyEmoji: '?',
    dueDate: '2024-11-09T18:00:00',
    createdAt: '2024-11-05T09:00:00',
    completed: false,
    completedAt: null,
    completedCount: 8,
    totalCount: 12,
  },
  {
    id: 2,
    title: '자소서 1차 작성',
    description: '자소서 1차 초안을 작성해주세요',
    studyId: 2,
    studyName: '취업 준비 스터디',
    studyEmoji: '?',
    dueDate: '2024-11-09T23:59:00',
    createdAt: '2024-11-04T10:00:00',
    completed: false,
    completedAt: null,
    completedCount: 5,
    totalCount: 8,
  },
]

export const taskStats = {
  today: 2,
  thisWeek: 8,
  completed: 5,
  incomplete: 3,
  byStudy: {
    1: { incomplete: 2, completed: 1 },
    2: { incomplete: 1, completed: 1 },
  },
}
```

---

## ? 공통 스타일 가이드

### 레이아웃 변수 (`styles/variables.css`에 추가)

```css
:root {
  /* 레이아웃 너비 */
  --nav-width: 240px;
  --sidebar-width: 280px;
  --content-max-width: 1920px;
  
  /* 간격 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  
  /* 알림/할일 색상 */
  --urgent-bg: #fef2f2;
  --urgent-border: #fca5a5;
  --urgent-text: #dc2626;
  
  --unread-bg: #eff6ff;
  --unread-border: #bfdbfe;
  --unread-dot: #3b82f6;
  
  /* 역할 배지 색상 */
  --role-owner-bg: #fee2e2;
  --role-owner-text: #dc2626;
  --role-admin-bg: #ede9fe;
  --role-admin-text: #7c3aed;
  --role-member-bg: #dbeafe;
  --role-member-text: #2563eb;
}
```

### 공통 CSS 패턴

```css
/* 2컬럼 그리드 (마이페이지) */
.contentGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

/* 3컬럼 레이아웃 (알림, 할일) */
.container {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1920px;
  margin: 0 auto;
}

.mainContent {
  flex: 1;
  min-width: 0;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

/* 위젯 공통 스타일 */
.widget {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* 섹션 공통 스타일 */
.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.sectionHeader {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20px;
}

/* 버튼 공통 스타일 */
.buttonPrimary {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.buttonPrimary:hover {
  background: #2563eb;
}

.buttonSecondary {
  padding: 10px 20px;
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.buttonSecondary:hover {
  background: #f9fafb;
}

/* 카드 호버 효과 */
.cardHover {
  transition: all 0.2s;
  cursor: pointer;
}

.cardHover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

---

## ? 필요한 유틸리티 함수

### 시간 관련 (`utils/time.js` 생성)

```javascript
export const getRelativeTime = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  return date.toLocaleDateString('ko-KR')
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

export const getTimeLeft = (dueDate) => {
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due - now
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return { text: '1시간 미만', urgent: true }
  if (diffHours < 24) return { text: `${diffHours}시간 남음`, urgent: true }
  if (diffDays < 7) return { text: `${diffDays}일 남음`, urgent: false }
  return { text: `${diffDays}일 남음`, urgent: false }
}
```

---

## ? 네비게이션 업데이트

`components/layout/Sidebar.jsx`에 새로운 메뉴 항목 추가:

```jsx
const navItems = [
  { icon: '?', label: '대시보드', path: '/dashboard' },
  { icon: '?', label: '스터디 탐색', path: '/studies' },
  { icon: '?', label: '내 스터디', path: '/my-studies' },
  { icon: '?', label: '할 일', path: '/tasks' },        // 추가
  { icon: '?', label: '알림', path: '/notifications', badge: 5 },  // 추가 (배지 포함)
  { icon: '?', label: '마이페이지', path: '/me' },      // 추가
]
```

---

## ? Mock API 구조

### Mock API Helper (`mocks/mockApi.js`)

```javascript
// Mock API 지연 시뮬레이션
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API Response 래퍼
export const mockApiCall = async (data, shouldFail = false, delayMs = 500) => {
  await delay(delayMs)
  
  if (shouldFail) {
    throw new Error('Mock API Error')
  }
  
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}

// 로컬 스토리지 기반 Mock DB
export class MockDB {
  static get(key) {
    const data = localStorage.getItem(`mock_${key}`)
    return data ? JSON.parse(data) : null
  }
  
  static set(key, value) {
    localStorage.setItem(`mock_${key}`, JSON.stringify(value))
  }
  
  static clear(key) {
    localStorage.removeItem(`mock_${key}`)
  }
}
```

### Mock User API (`mocks/api/userApi.js`)

```javascript
import { mockApiCall, MockDB } from '../mockApi'
import { currentUser } from '../user'

export const mockUserApi = {
  // 프로필 조회
  getProfile: async () => {
    const stored = MockDB.get('user_profile') || currentUser
    return mockApiCall(stored)
  },
  
  // 프로필 업데이트
  updateProfile: async (data) => {
    const stored = MockDB.get('user_profile') || currentUser
    const updated = { ...stored, ...data, updatedAt: new Date().toISOString() }
    MockDB.set('user_profile', updated)
    return mockApiCall(updated)
  },
  
  // 프로필 이미지 업로드
  uploadImage: async (file) => {
    // 실제로는 파일을 서버에 업로드하지만, Mock에서는 로컬 URL 생성
    const imageUrl = URL.createObjectURL(file)
    return mockApiCall({ imageUrl })
  },
  
  // 계정 삭제
  deleteAccount: async () => {
    MockDB.clear('user_profile')
    MockDB.clear('user_studies')
    return mockApiCall({ deleted: true })
  }
}
```

---

## ? 체크리스트 (Mock 기반 UI 구현)

### ? 필수 구현 (Phase 1-4)
- [ ] Mock Data 생성 (user, notifications, tasks)
- [ ] 유틸리티 함수 (time, format)
- [ ] 공통 스타일 변수
- [ ] 마이페이지 전체 레이아웃 및 컴포넌트
- [ ] 알림 페이지 전체 레이아웃 및 컴포넌트
- [ ] 할 일 페이지 전체 레이아웃 및 컴포넌트
- [ ] 네비게이션 메뉴 추가

### ? 고급 UI (Phase 5-6)
- [ ] 할 일 상세 모달
- [ ] 계정 삭제 확인 모달
- [ ] 알림 배지 카운트
- [ ] 활성 메뉴 하이라이트

### ? 선택 사항 (Phase 7-8)
- [ ] 반응형 디자인 (모바일/태블릿)
- [ ] 애니메이션 및 전환 효과
- [ ] 로딩 스켈레톤
- [ ] 접근성 개선

### ? 추후 구현 (Phase 9)
- [ ] 실제 API 연동
- [ ] WebSocket 실시간 통신
- [ ] 인증/권한 처리
- [ ] 에러 처리 및 재시도

---

## ? 시작 가이드

### 1. Mock Data부터 시작
```bash
# 1. Mock Data 파일 생성
coup/src/mocks/user.js
coup/src/mocks/notifications.js
coup/src/mocks/tasks.js
coup/src/mocks/mockApi.js
```

### 2. 유틸리티 함수 생성
```bash
# 2. 유틸리티 함수
coup/src/utils/time.js
coup/src/utils/format.js
```

### 3. 페이지별 순차 구현
```bash
# 3-1. 마이페이지
coup/src/app/me/page.jsx
coup/src/components/my-page/...

# 3-2. 알림 페이지
coup/src/app/notifications/page.jsx
coup/src/components/notifications/...

# 3-3. 할 일 페이지
coup/src/app/tasks/page.jsx
coup/src/components/tasks/...
```

### 4. 네비게이션 업데이트
```bash
# 4. 사이드바 메뉴 추가
coup/src/components/layout/Sidebar.jsx
```

---

## ? 구현 진행률 추적

| 카테고리 | 진행률 | 완료/전체 |
|---------|--------|----------|
| Mock Data | 0% | 0/3 |
| 유틸리티 | 0% | 0/2 |
| 마이페이지 | 0% | 0/6 |
| 알림 페이지 | 0% | 0/6 |
| 할 일 페이지 | 0% | 0/9 |
| 네비게이션 | 0% | 0/1 |
| **전체** | **0%** | **0/27** |

---

**작성 완료!** Mock 기반으로 UI/UX를 먼저 완성한 후, 백엔드 준비되면 API 연동하시면 됩니다. ?
