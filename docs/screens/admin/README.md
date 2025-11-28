# CoUp 관리자 UI 설계 문서

> Next.js 14+ App Router + JavaScript 환경에 최적화된 관리자 인터페이스

## 📋 문서 구조

### 레이아웃 및 공통
- `00-layout.md` - 전체 레이아웃 구조 및 네비게이션
- `01-components.md` - 공통 컴포넌트 라이브러리
- `02-styles.md` - 스타일 가이드 및 CSS 모듈

### 주요 화면
- `10-dashboard.md` - 대시보드 (홈)
- `11-users-list.md` - 사용자 목록
- `12-users-detail.md` - 사용자 상세
- `13-studies-list.md` - 스터디 목록
- `14-studies-detail.md` - 스터디 상세
- `15-reports-list.md` - 신고 목록
- `16-reports-detail.md` - 신고 상세
- `17-analytics.md` - 통계 및 분석
- `18-settings.md` - 시스템 설정
- `19-logs.md` - 감사 로그

## 🎯 설계 원칙

### 1. 모듈화 (100줄 권장, 최대 300줄)
```
✅ 좋은 예:
- 파일당 하나의 책임
- 작은 컴포넌트로 분리
- 로직과 UI 분리

❌ 나쁜 예:
- 1000줄짜리 거대 컴포넌트
- 모든 기능이 한 파일에
```

### 2. Next.js 14+ 최적화
- **Server Components** 기본 사용
- **Client Components** 필요시만 ('use client')
- **Dynamic Import** 큰 컴포넌트 지연 로딩
- **Suspense** 로딩 상태 처리
- **Streaming SSR** 점진적 렌더링
- **Route Groups** 레이아웃 공유

### 3. 성능 최적화
- **React Query** 서버 상태 관리
- **useMemo/useCallback** 불필요한 재렌더링 방지
- **Virtualization** 긴 목록 렌더링
- **Debouncing** 검색/필터 입력
- **Code Splitting** 라우트별 번들 분리

### 4. 접근성 (a11y)
- **Semantic HTML** 의미있는 태그 사용
- **ARIA** 속성 적절히 사용
- **Keyboard Navigation** 키보드 접근성
- **Screen Reader** 스크린 리더 지원

## 📁 디렉토리 구조

```
src/app/admin/
├── layout.jsx                    # 관리자 레이아웃
├── page.jsx                      # 대시보드
│
├── users/
│   ├── layout.jsx               # 사용자 관리 레이아웃
│   ├── page.jsx                 # 목록 (Server Component)
│   ├── loading.jsx              # 로딩 스켈레톤
│   ├── error.jsx                # 에러 바운더리
│   ├── [userId]/
│   │   ├── page.jsx            # 상세 페이지
│   │   └── loading.jsx
│   └── _components/            # 사용자 관련 컴포넌트
│       ├── UserTable.jsx       # 목록 테이블 (~200줄)
│       ├── UserFilters.jsx     # 필터 패널 (~150줄)
│       ├── UserCard.jsx        # 카드 아이템 (~100줄)
│       ├── UserStats.jsx       # 통계 카드 (~80줄)
│       ├── WarnModal.jsx       # 경고 모달 (~150줄)
│       ├── SuspendModal.jsx    # 정지 모달 (~180줄)
│       └── DeleteModal.jsx     # 삭제 모달 (~120줄)
│
├── studies/
│   ├── page.jsx
│   ├── [studyId]/page.jsx
│   └── _components/
│       ├── StudyTable.jsx
│       ├── StudyFilters.jsx
│       └── ...
│
├── reports/
│   ├── page.jsx
│   ├── [reportId]/page.jsx
│   └── _components/
│       ├── ReportQueue.jsx
│       ├── ReportCard.jsx
│       └── ...
│
├── analytics/
│   ├── page.jsx
│   └── _components/
│       ├── StatsCard.jsx
│       ├── TrendChart.jsx
│       └── ...
│
├── settings/
│   ├── page.jsx
│   └── _components/
│
└── logs/
    ├── page.jsx
    └── _components/

src/components/admin/          # 공통 관리자 컴포넌트
├── common/
│   ├── AdminHeader.jsx       # 헤더 (~100줄)
│   ├── AdminSidebar.jsx      # 사이드바 (~150줄)
│   ├── Breadcrumb.jsx        # 브레드크럼 (~60줄)
│   ├── SearchBar.jsx         # 검색바 (~80줄)
│   └── Pagination.jsx        # 페이지네이션 (~100줄)
│
├── ui/                       # UI 기본 컴포넌트
│   ├── Button.jsx           # 버튼 (~80줄)
│   ├── Modal.jsx            # 모달 (~120줄)
│   ├── Dropdown.jsx         # 드롭다운 (~100줄)
│   ├── Table.jsx            # 테이블 (~150줄)
│   ├── Tabs.jsx             # 탭 (~100줄)
│   ├── Badge.jsx            # 배지 (~50줄)
│   ├── Card.jsx             # 카드 (~60줄)
│   └── Skeleton.jsx         # 스켈레톤 (~80줄)
│
├── charts/                   # 차트 컴포넌트
│   ├── LineChart.jsx        # 라인 차트 (~120줄)
│   ├── BarChart.jsx         # 바 차트 (~120줄)
│   ├── PieChart.jsx         # 파이 차트 (~100줄)
│   └── StatsCard.jsx        # 통계 카드 (~80줄)
│
└── forms/                    # 폼 컴포넌트
    ├── Input.jsx            # 입력 (~80줄)
    ├── Select.jsx           # 셀렉트 (~100줄)
    ├── DatePicker.jsx       # 날짜 선택 (~150줄)
    └── FilterPanel.jsx      # 필터 패널 (~200줄)

src/lib/admin/               # 관리자 유틸리티
├── hooks/
│   ├── useAdminAuth.js     # 인증 훅 (~60줄)
│   ├── useAdminUsers.js    # 사용자 API 훅 (~150줄)
│   ├── useAdminStudies.js  # 스터디 API 훅 (~150줄)
│   ├── useAdminReports.js  # 신고 API 훅 (~150줄)
│   └── useDebounce.js      # 디바운스 훅 (~30줄)
│
├── utils/
│   ├── format.js           # 포맷 유틸 (~100줄)
│   ├── validation.js       # 검증 유틸 (~80줄)
│   └── constants.js        # 상수 정의 (~50줄)
│
└── api/
    ├── users.js            # 사용자 API (~200줄)
    ├── studies.js          # 스터디 API (~200줄)
    └── reports.js          # 신고 API (~200줄)
```

## 🎨 디자인 시스템

### 색상 팔레트
```css
/* Primary */
--admin-primary: #4F46E5;
--admin-primary-hover: #4338CA;
--admin-primary-light: #EEF2FF;

/* Status */
--status-success: #10B981;
--status-warning: #F59E0B;
--status-danger: #EF4444;
--status-info: #3B82F6;

/* Neutral */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

### 타이포그래피
```css
/* Heading */
--heading-xl: 2rem;      /* 32px */
--heading-lg: 1.5rem;    /* 24px */
--heading-md: 1.25rem;   /* 20px */
--heading-sm: 1.125rem;  /* 18px */

/* Body */
--body-lg: 1rem;         /* 16px */
--body-md: 0.875rem;     /* 14px */
--body-sm: 0.75rem;      /* 12px */
```

### 간격 (Spacing)
```css
--space-xs: 0.25rem;  /* 4px */
--space-sm: 0.5rem;   /* 8px */
--space-md: 1rem;     /* 16px */
--space-lg: 1.5rem;   /* 24px */
--space-xl: 2rem;     /* 32px */
--space-2xl: 3rem;    /* 48px */
```

## 🚀 성능 목표

- **Initial Load**: < 2초
- **Page Transition**: < 500ms
- **API Response**: < 1초
- **Table Rendering**: 1000+ rows with virtualization
- **Lighthouse Score**: 90+

## 📱 반응형 브레이크포인트

```css
/* Mobile */
@media (max-width: 640px)

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px)

/* Desktop */
@media (min-width: 1025px)

/* Large Desktop */
@media (min-width: 1440px)
```

## ✅ 각 화면별 체크리스트

### 모든 페이지 공통
- [ ] Server Component 우선 사용
- [ ] Loading State (loading.jsx)
- [ ] Error Boundary (error.jsx)
- [ ] 반응형 디자인
- [ ] 키보드 접근성
- [ ] 페이지네이션
- [ ] 검색/필터
- [ ] 일괄 작업 (해당시)

### 목록 페이지
- [ ] 가상 스크롤 (1000+ 아이템)
- [ ] 정렬 기능
- [ ] 필터 패널
- [ ] 빠른 액션 메뉴
- [ ] 선택/전체선택

### 상세 페이지
- [ ] 탭 구조
- [ ] 빠른 액션 버튼
- [ ] 이력 타임라인
- [ ] 관련 데이터 표시

## 🔗 관련 문서

- [데이터 모델](../../admin/features/complete/01-user-management-complete.md)
- [API 명세](../../backend/api/README.md)
- [컴포넌트 가이드](./01-components.md)

---

**작성일**: 2025-11-28  
**버전**: 1.0.0

