# CoUp 화면 설계 개요

> **작성일**: 2025년 11월 5일  
> **레이아웃 원칙**: 좌측 네비게이션(10-15%) + 우측 콘텐츠(85-90%)

---

## 📐 전체 레이아웃 구조

### 기본 레이아웃 (Main Layout)
```
┌──────────────────────────────────────────────────────────┐
│                     Header (Fixed)                        │
│  Logo | Search | Notifications | Profile                 │
├────────┬─────────────────────────────────────────────────┤
│        │                                                  │
│  Nav   │           Content Area                          │
│  Bar   │           (Main Content)                        │
│        │                                                  │
│ 10-15% │              85-90%                             │
│        │                                                  │
│ Fixed  │           Scrollable                            │
│        │                                                  │
└────────┴─────────────────────────────────────────────────┘
```

### 반응형 브레이크포인트
- **Desktop (1280px+)**: 네비게이션 15%, 콘텐츠 85%
- **Tablet (768-1279px)**: 네비게이션 12%, 콘텐츠 88%
- **Mobile (<768px)**: 네비게이션 햄버거 메뉴로 전환, 콘텐츠 100%

---

## 🗂 화면 분류 및 목록

### 1. 인증 화면 (Auth Screens)
- `01_landing.md` - 랜딩 페이지 (네비게이션 없음)
- `02_sign-in.md` - 로그인 페이지 (네비게이션 없음)
- `03_sign-up.md` - 회원가입 페이지 (네비게이션 없음)

### 2. 메인 서비스 화면 (Main Screens)
- `04_dashboard.md` - 대시보드 (홈)
- `05_study-explore.md` - 스터디 탐색
- `06_study-create.md` - 스터디 생성
- `07_study-detail.md` - 스터디 상세 (개요)
- `08_study-chat.md` - 스터디 채팅
- `09_study-notice.md` - 공지사항
- `10_study-files.md` - 파일 공유
- `11_study-calendar.md` - 캘린더
- `12_study-tasks.md` - 할 일 관리
- `13_study-video-call.md` - 화상 스터디
- `14_study-settings.md` - 스터디 설정 (관리자)
- `15_my-page.md` - 마이페이지
- `16_notifications.md` - 알림 목록

### 3. 관리자 화면 (Admin Screens)
- `17_admin-dashboard.md` - 관리자 대시보드
- `18_admin-users.md` - 사용자 관리
- `19_admin-studies.md` - 스터디 관리
- `20_admin-reports.md` - 신고 관리
- `21_admin-analytics.md` - 통계 분석
- `22_admin-settings.md` - 시스템 설정

---

## 🎨 디자인 시스템 (공통)

### 색상 팔레트
```css
/* Primary */
--primary-50: #EEF2FF;
--primary-100: #E0E7FF;
--primary-500: #6366F1;  /* 메인 브랜드 */
--primary-600: #4F46E5;  /* Hover */
--primary-700: #4338CA;

/* Neutral */
--gray-50: #F9FAFB;      /* 배경 */
--gray-100: #F3F4F6;     /* 카드 배경 */
--gray-200: #E5E7EB;     /* 테두리 */
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;     /* 보조 텍스트 */
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;     /* 메인 텍스트 */

/* Semantic */
--success-500: #10B981;
--success-600: #059669;
--warning-500: #F59E0B;
--warning-600: #D97706;
--danger-500: #EF4444;
--danger-600: #DC2626;
--info-500: #3B82F6;
--info-600: #2563EB;
```

### 타이포그래피
```css
/* 폰트 패밀리 */
--font-primary: 'Pretendard Variable', -apple-system, sans-serif;

/* 폰트 크기 */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* 폰트 굵기 */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* 라인 높이 */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### 간격 (Spacing)
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### 그림자 (Shadow)
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### 둥근 모서리 (Border Radius)
```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* 완전한 원 */
```

---

## 🧭 네비게이션 구조

### 일반 사용자 네비게이션
```
┌─────────────────┐
│  [Logo]         │
│  CoUp           │
├─────────────────┤
│                 │
│ 🏠 대시보드      │
│ 🔍 스터디 탐색   │
│ 👥 내 스터디     │
│ 📋 할 일         │
│ 🔔 알림          │
│ 👤 마이페이지    │
│                 │
├─────────────────┤
│                 │
│ ⚙️ 설정         │
│ 🚪 로그아웃     │
│                 │
└─────────────────┘
```

### 관리자 네비게이션
```
┌─────────────────┐
│  [Logo]         │
│  CoUp Admin     │
├─────────────────┤
│                 │
│ 📊 대시보드      │
│ 👥 사용자 관리   │
│ 📚 스터디 관리   │
│ ⚠️ 신고 관리    │
│ 📈 통계 분석     │
│ ⚙️ 시스템 설정  │
│                 │
├─────────────────┤
│                 │
│ 🏠 메인으로     │
│ 🚪 로그아웃     │
│                 │
└─────────────────┘
```

---

## 📱 공통 컴포넌트

### Header (고정, 모든 화면)
```
┌──────────────────────────────────────────────────────────┐
│ [Logo] CoUp        [Search Bar]         [🔔] [👤]        │
└──────────────────────────────────────────────────────────┘
높이: 64px (Desktop), 56px (Mobile)
```

**구성 요소**:
- 로고 + 서비스명
- 검색바 (스터디 검색)
- 알림 아이콘 (배지 포함)
- 프로필 드롭다운

### Navigation Sidebar (좌측, 고정)
```
너비: 
- Desktop: 15% (최소 200px, 최대 240px)
- Tablet: 12% (최소 160px, 최대 200px)
- Mobile: 햄버거 메뉴 (전체 화면 오버레이)

배경: white (--gray-50 테마 시)
그림자: shadow-sm
```

**상태 표시**:
- Active: primary-500 배경 + 흰색 텍스트
- Hover: gray-100 배경
- Default: 투명 배경 + gray-700 텍스트

### Content Area (우측, 스크롤 가능)
```
너비: 
- Desktop: 85%
- Tablet: 88%
- Mobile: 100%

패딩: 24px (Desktop), 16px (Mobile)
배경: gray-50
최대 너비: 1600px (초대형 화면 대응)
```

---

## 🎯 UI 패턴 가이드

### 카드 (Card)
```css
배경: white
테두리: 1px solid gray-200
둥근 모서리: radius-lg (8px)
그림자: shadow-sm
패딩: 20px (Desktop), 16px (Mobile)
```

### 버튼 (Button)
```css
/* Primary */
배경: primary-500
텍스트: white
Hover: primary-600
높이: 40px (medium), 36px (small), 48px (large)
둥근 모서리: radius-md (6px)

/* Secondary */
배경: white
테두리: 1px solid gray-300
텍스트: gray-700
Hover: gray-50

/* Danger */
배경: danger-500
텍스트: white
Hover: danger-600
```

### 입력 필드 (Input)
```css
배경: white
테두리: 1px solid gray-300
포커스: 2px solid primary-500
둥근 모서리: radius-md (6px)
높이: 40px
패딩: 0 12px
```

### 모달 (Modal)
```css
오버레이: rgba(0, 0, 0, 0.5)
배경: white
둥근 모서리: radius-xl (12px)
그림자: shadow-2xl
최대 너비: 600px (medium), 900px (large)
패딩: 24px
```

---

## 🔄 상태 표시

### 로딩 (Loading)
- Skeleton UI (콘텐츠 모양 유지)
- Spinner (작은 액션)
- Progress Bar (파일 업로드)

### 빈 상태 (Empty State)
- 일러스트레이션 + 텍스트 + CTA 버튼
- 중앙 정렬

### 에러 (Error)
- 빨간색 아이콘 + 에러 메시지
- 재시도 버튼

---

## 📐 그리드 시스템

### 12컬럼 그리드
```
Desktop: 12컬럼 (갭 24px)
Tablet: 8컬럼 (갭 20px)
Mobile: 4컬럼 (갭 16px)
```

### 레이아웃 예시
```
┌────────────────────────────────────────┐
│  [3컬럼 카드] [3컬럼 카드] [6컬럼 카드]  │
│                                        │
│  [4컬럼]      [4컬럼]      [4컬럼]      │
│                                        │
│  [12컬럼 전체 너비]                     │
└────────────────────────────────────────┘
```

---

## 🎬 애니메이션 가이드

### 트랜지션
```css
/* 기본 */
transition: all 0.2s ease-in-out;

/* 빠른 피드백 */
transition: all 0.15s ease;

/* 부드러운 전환 */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### 페이드 인 (Fade In)
```css
opacity: 0 → 1
duration: 0.3s
```

### 슬라이드 (Slide)
```css
transform: translateY(10px) → translateY(0)
duration: 0.3s
```

---

## 📝 접근성 (Accessibility)

### 키보드 네비게이션
- Tab: 다음 요소
- Shift + Tab: 이전 요소
- Enter: 선택/실행
- Esc: 모달 닫기

### 포커스 표시
```css
outline: 2px solid primary-500
outline-offset: 2px
```

### 색상 대비
- 텍스트: 최소 4.5:1 (WCAG AA)
- 큰 텍스트: 최소 3:1

### 스크린 리더
- 모든 이미지에 alt 텍스트
- 버튼에 aria-label
- 폼 입력에 label 연결

---

## 📏 화면별 우선순위

### 🔥 최우선 (Phase 1-3)
1. 랜딩 페이지
2. 로그인/회원가입
3. 대시보드
4. 스터디 탐색
5. 스터디 상세

### ⚡ 우선 (Phase 4-7)
6. 스터디 생성
7. 채팅
8. 공지사항
9. 파일 공유
10. 캘린더
11. 할 일 관리

### 🎯 일반 (Phase 8-10)
12. 화상 스터디
13. 스터디 설정
14. 마이페이지
15. 알림 목록

### 🔧 관리자 (Post-MVP)
16. 관리자 대시보드
17. 사용자 관리
18. 스터디 관리
19. 신고 관리
20. 통계 분석
21. 시스템 설정

---

**다음 단계**: 각 화면별 상세 설계 문서 작성 (`01_landing.md` ~ `22_admin-settings.md`)
