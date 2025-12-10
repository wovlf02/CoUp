# 공통 컴포넌트

## 개요

전역에서 사용되는 레이아웃, UI 컴포넌트, 유틸리티 등입니다.

## 레이아웃 컴포넌트

```
src/components/layout/
├── ConditionalLayout.jsx   # 조건부 레이아웃
├── Header.jsx              # 상단 헤더
├── MainLayout.jsx          # 메인 레이아웃
└── Sidebar.jsx             # 사이드바
```

### Header

상단 헤더 컴포넌트입니다.

| 속성 | 타입 | 설명 |
|------|------|------|
| `onMenuToggle` | Function | 모바일 메뉴 토글 |

**기능:**
- 로고
- 글로벌 검색
- 알림 드롭다운
- 프로필 메뉴
- 모바일 햄버거 메뉴

**높이:**
- Desktop: 64px
- Mobile: 56px

### Sidebar

좌측 네비게이션 사이드바입니다.

| 속성 | 타입 | 설명 |
|------|------|------|
| `isAdmin` | Boolean | 관리자 모드 |
| `isOpen` | Boolean | 모바일 열림 상태 |
| `onClose` | Function | 닫기 핸들러 |

**일반 사용자 메뉴:**
| 아이콘 | 메뉴 | 경로 |
|--------|------|------|
| 🏠 | 대시보드 | `/dashboard` |
| 🔍 | 스터디 탐색 | `/studies` |
| 👥 | 내 스터디 | `/my-studies` |
| 📋 | 할 일 | `/tasks` |
| 🔔 | 알림 | `/notifications` |
| 👤 | 마이페이지 | `/me` |

**관리자 메뉴:**
| 아이콘 | 메뉴 | 경로 |
|--------|------|------|
| 📊 | 대시보드 | `/admin` |
| 👥 | 사용자 관리 | `/admin/users` |
| 📚 | 스터디 관리 | `/admin/studies` |
| ⚠️ | 신고 관리 | `/admin/reports` |
| 📈 | 통계 분석 | `/admin/analytics` |
| ⚙️ | 시스템 설정 | `/admin/settings` |

**너비:**
- Desktop: 15%
- Tablet: 12%
- Mobile: 햄버거 메뉴

### MainLayout

메인 레이아웃 래퍼입니다.

```jsx
<MainLayout>
  {/* Header + Sidebar + Content */}
</MainLayout>
```

### ConditionalLayout

경로에 따라 레이아웃을 조건부로 렌더링합니다.

```jsx
// 인증 페이지는 레이아웃 없이 렌더링
// 일반 페이지는 MainLayout 적용
```

---

## 랜딩 페이지 컴포넌트

```
src/components/landing/
├── CTASection.jsx       # CTA 섹션
├── Features.jsx         # 기능 소개
├── Hero.jsx             # 히어로 섹션
├── HowItWorks.jsx       # 사용 방법
├── LandingFooter.jsx    # 푸터
├── LandingHeader.jsx    # 헤더
└── Testimonials.jsx     # 사용자 후기
```

### Hero

메인 히어로 섹션입니다.

**콘텐츠:**
- 메인 타이틀: "함께, 더 높이."
- 서브타이틀: "당신의 성장을 위한 스터디 허브"
- CTA 버튼: 지금 시작하기, 스터디 둘러보기
- 스크롤 인디케이터

### Features

주요 기능 소개 섹션입니다.

### HowItWorks

사용 방법 단계 설명입니다.

### Testimonials

사용자 후기 섹션입니다.

### CTASection

행동 유도 섹션입니다.

### LandingHeader

랜딩 페이지 전용 헤더입니다.

### LandingFooter

랜딩 페이지 푸터입니다.

---

## UI 컴포넌트

```
src/components/ui/
├── ConnectionBanner.js   # 연결 상태 배너
├── EmptyState.js         # 빈 상태
├── ErrorToast.js         # 에러 토스트
├── index.js              # 모듈 export
├── LoadingSpinner.js     # 로딩 스피너
└── MessageError.js       # 메시지 에러
```

### ConnectionBanner

네트워크 연결 상태 배너입니다.

| 속성 | 타입 | 설명 |
|------|------|------|
| `isConnected` | Boolean | 연결 상태 |
| `onReconnect` | Function | 재연결 핸들러 |

### EmptyState

데이터가 없을 때 빈 상태를 표시합니다.

| 속성 | 타입 | 설명 |
|------|------|------|
| `icon` | String | 이모지 아이콘 |
| `title` | String | 제목 |
| `description` | String | 설명 |
| `actionLabel` | String | 버튼 텍스트 |
| `onAction` | Function | 버튼 클릭 핸들러 |

### ErrorToast

에러 토스트 알림입니다.

| 속성 | 타입 | 설명 |
|------|------|------|
| `error` | Object | 에러 정보 |
| `onClose` | Function | 닫기 핸들러 |

### LoadingSpinner

로딩 스피너입니다.

| 속성 | 타입 | 설명 |
|------|------|------|
| `size` | String | sm, md, lg |
| `color` | String | 색상 |

### MessageError

메시지 전송 실패 표시입니다.

| 속성 | 타입 | 설명 |
|------|------|------|
| `error` | Object | 에러 정보 |
| `onRetry` | Function | 재시도 핸들러 |
| `onDelete` | Function | 삭제 핸들러 |

---

## 공통 컴포넌트 (common)

```
src/components/common/
├── RestrictionBanner.jsx   # 활동 제한 배너
└── RestrictionBanner.module.css
```

### RestrictionBanner

사용자 활동 제한 시 표시되는 배너입니다.

**표시 정보:**
- 제한된 활동 목록
- 제한 해제 일시
- 문의하기 링크

---

## 마이페이지 컴포넌트

```
src/components/my-page/
├── AccountActions.jsx      # 계정 관련 액션
├── ActivityStats.jsx       # 활동 통계
├── DeleteAccountModal.jsx  # 계정 삭제 모달
├── ErrorState.jsx          # 에러 상태
├── HeroProfile.jsx         # 프로필 히어로
├── LoadingState.jsx        # 로딩 상태
├── MyStudiesList.jsx       # 내 스터디 목록
├── OverviewTab.jsx         # 개요 탭
├── ProfileEditForm.jsx     # 프로필 수정 폼
├── ProfileSection.jsx      # 프로필 섹션
├── QuickStats.jsx          # 빠른 통계
├── SettingsTab.jsx         # 설정 탭
├── StudiesTab.jsx          # 스터디 탭
└── TabNavigation.jsx       # 탭 네비게이션
```

### TabNavigation

마이페이지 탭 네비게이션입니다.

| 탭 | 설명 |
|----|------|
| 개요 | 활동 요약, 통계 |
| 스터디 | 내 스터디 목록 |
| 설정 | 계정 설정 |

### ProfileEditForm

프로필 수정 폼입니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `name` | String | 이름 |
| `avatar` | File | 프로필 이미지 |
| `bio` | String | 자기소개 |

### ActivityStats

활동 통계 위젯입니다.

| 통계 | 설명 |
|------|------|
| 가입한 스터디 | 현재 참여 중인 스터디 수 |
| 완료한 할일 | 완료 처리된 할일 수 |
| 작성한 메시지 | 채팅 메시지 수 |
| 활동 일수 | 연속 활동 일수 |

### DeleteAccountModal

계정 삭제 확인 모달입니다.

---

## Context

```
src/contexts/
├── SettingsContext.js   # 앱 설정 Context
└── SocketContext.js     # Socket.IO Context
```

### SettingsContext

앱 전역 설정을 관리합니다.

```javascript
// 사용법
const { settings, updateSettings } = useSettings()

// 설정 항목
{
  theme: 'light' | 'dark',
  language: 'ko' | 'en',
  notifications: {
    push: true,
    email: true
  }
}
```

### SocketContext

Socket.IO 연결을 관리합니다.

```javascript
// 사용법
const { socket, isConnected } = useSocket()

// 이벤트 리스닝
socket.on('event', handler)

// 이벤트 발신
socket.emit('event', data)
```

---

## Hooks

```
src/hooks/
├── index.js             # 모듈 export
├── useRestriction.js    # 활동 제한 Hook
└── useSettingsUtils.js  # 설정 유틸 Hook
```

### useRestriction

사용자 활동 제한 상태를 확인합니다.

```javascript
const { isRestricted, restrictedActions, restrictedUntil } = useRestriction()

// 특정 활동 제한 여부
const canCreateStudy = !isRestricted('create_study')
```

### useSettingsUtils

설정 관련 유틸리티입니다.

---

## Providers

```
src/app/providers.js
src/components/Providers.js
```

앱 전역 Provider를 구성합니다.

```jsx
<SessionProvider>
  <QueryClientProvider>
    <SocketProvider>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </SocketProvider>
  </QueryClientProvider>
</SessionProvider>
```

---

## 유틸리티

```
src/utils/
├── clsx.js          # 클래스 유틸
├── file.js          # 파일 유틸
├── format.js        # 포맷 유틸
├── studyColors.js   # 스터디 색상
└── time.js          # 시간 유틸
```

### clsx

조건부 클래스 결합 유틸리티입니다.

```javascript
import { clsx } from '@/utils/clsx'

// 사용법
className={clsx(
  styles.button,
  isActive && styles.active,
  disabled && styles.disabled
)}
```

### format

포맷팅 유틸리티입니다.

```javascript
// 숫자 포맷
formatNumber(1000) // "1,000"

// 날짜 포맷
formatDate(date) // "2025년 12월 11일"

// 상대 시간
formatRelativeTime(date) // "3분 전"
```

### time

시간 관련 유틸리티입니다.

```javascript
// 시간 차이 계산
getTimeDiff(date1, date2)

// D-day 계산
calculateDday(targetDate) // "D-3"

// 지속 시간 포맷
formatDuration(seconds) // "01:23:45"
```

### file

파일 관련 유틸리티입니다.

```javascript
// 파일 크기 포맷
formatFileSize(bytes) // "1.5 MB"

// 파일 확장자
getFileExtension(filename) // "pdf"

// MIME 타입 확인
isImageFile(mimeType) // true/false
```

### studyColors

스터디 색상 유틸리티입니다.

```javascript
// 카테고리별 색상
getCategoryColor('programming') // '#6366F1'

// 랜덤 색상
getRandomColor()
```

