# 관리자 화면 설계 - README

> **작성일**: 2025-11-25  
> **목적**: CoUp 플랫폼 관리자 페이지 화면 설계 개요  
> **Next.js**: 16 (App Router)  
> **언어**: JavaScript + JSDoc  
> **권한**: SYSTEM_ADMIN

---

## 📋 개요

관리자 페이지는 플랫폼 전반을 모니터링하고 관리하기 위한 전용 UI입니다. 효율성과 명확한 시각화를 중심으로 설계되었습니다.

---

## 🎨 전체 레이아웃 구조

```
┌────────────┬─────────────────────────────────────────────────────┬──────────────────┐
│   Admin    │                  Header                              │                  │
│    Nav     │                                                      │                  │
│   (12%)    ├──────────────────────────────────────────────────────┤   Right Widget   │
│            │                                                      │     (18%)        │
│ 📊 대시보드 │                  Main Content                        │                  │
│ 👥 사용자  │                   (70%)                              │  • 주요 통계     │
│ 📚 스터디  │                                                      │  • 긴급 알림     │
│ ⚠️ 신고   │                                                      │  • 시스템 상태   │
│ 📈 통계   │                                                      │  • 빠른 이동     │
│ ⚙️ 설정   │                                                      │                  │
│            │                                                      │                  │
│ ─────────  │                                                      │                  │
│ 🏠 메인    │                                                      │                  │
│ 🚪 로그아웃│                                                      │                  │
└────────────┴─────────────────────────────────────────────────────┴──────────────────┘
```

---

## 📁 화면 목록

### 1. 대시보드 (`01-dashboard.md`)
- 라우트: `/admin`
- 핵심 지표 4개 카드
- 사용자 증가 추이 차트
- 최근 신고 3건
- 실시간 현황 4개
- 시스템 상태
- 스터디 활동 현황

### 2. 사용자 관리 (`02-users.md`)
- 라우트: `/admin/users`
- 필터 바 (상태, 검색)
- 사용자 테이블 (7컬럼, 페이지네이션)
- 일괄 작업 (이메일, 정지, 삭제)
- 사용자 상세 모달
- 우측 위젯 (통계, 빠른 검색, 빠른 액션)

### 3. 스터디 관리 (`03-studies.md`)
- 라우트: `/admin/studies`
- 필터 바 (공개/비공개, 카테고리, 검색)
- 스터디 테이블 (8컬럼)
- 일괄 작업 (숨김, 삭제)
- 우측 위젯 (통계, 카테고리 현황)

### 4. 신고 관리 (`04-reports.md`)
- 라우트: `/admin/reports`
- 필터 바 (상태, 우선순위, 유형, 검색)
- 신고 테이블 (8컬럼)
- 신고 상세 및 처리 모달 (3탭)
- 우측 위젯 (통계, 유형별 통계, 빠른 필터)

### 5. 통계 분석 (`05-analytics.md`)
- 라우트: `/admin/analytics`
- 사용자 분석 (3개 차트)
- 스터디 분석 (3개 차트)
- 활동 분석 (2개 차트)
- 신보 분석 (2개 차트)
- 내보내기 기능

### 6. 시스템 설정 (`06-settings.md`)
- 라우트: `/admin/settings`
- 플랫폼 설정
- 카테고리 관리
- 시스템 설정
- 법적 문서 관리

---

## 🎨 디자인 시스템

### 색상 팔레트
```css
/* Admin Primary */
--admin-primary: #4F46E5;
--admin-primary-hover: #4338CA;

/* Status Colors */
--status-healthy: #10B981;
--status-warning: #F59E0B;
--status-critical: #EF4444;

/* Report Priority */
--priority-urgent: #DC2626;
--priority-high: #F59E0B;
--priority-normal: #3B82F6;
--priority-low: #6B7280;

/* User Status */
--user-active: #10B981;
--user-suspended: #EF4444;
--user-deleted: #6B7280;
```

### 타이포그래피
```css
/* Headings */
h1: 1.5rem (24px) Bold
h2: 1.25rem (20px) SemiBold
h3: 1.125rem (18px) SemiBold

/* Body */
body: 0.875rem (14px) Regular
small: 0.75rem (12px) Regular
```

### Spacing
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-2xl: 32px
```

---

## 🎯 UX 원칙

### 1. 효율성 우선
- **한 화면에 최대한 많은 정보 표시**
  - 3단 레이아웃 (Nav 12% + Main 70% + Widget 18%)
  - 테이블 한 화면에 10개 항목
  - 필터 바로 빠른 검색

- **빠른 필터링 및 검색**
  - 실시간 검색 (debounce 500ms)
  - 다중 필터 조합
  - 최근 검색 저장

- **일괄 작업 지원**
  - 체크박스로 다중 선택
  - 일괄 이메일, 정지, 삭제
  - 선택 개수 표시

### 2. 명확한 시각화
- **그래프와 차트**
  - 라인 차트: 추이 파악
  - 바 차트: 카테고리별 비교
  - 파이 차트: 비율 파악
  - 프로그레스 바: 사용률 표시

- **색상 코딩**
  - 빨간색: 긴급, 위험
  - 주황색: 경고, 높음
  - 파란색: 정상, 보통
  - 회색: 낮음, 비활성

- **아이콘과 배지**
  - 신고 유형별 아이콘
  - 상태별 색상 배지
  - 우선순위 표시

### 3. 신속한 액션
- **2클릭 이내 모든 주요 액션**
  - 테이블 행 클릭 → 상세 모달
  - 액션 버튼 (⋯) → 드롭다운
  - 일괄 작업 버튼

- **모달을 통한 상세 정보**
  - 사용자 상세 (기본 정보 + 통계 + 스터디 + 신고)
  - 신고 처리 (정보 + 대상 + 내용 + 처리)

### 4. 안전한 확인 절차
- **중요한 액션은 확인 다이얼로그**
  - 계정 삭제, 스터디 삭제
  - 일괄 삭제

- **입력 확인**
  - "삭제"를 정확히 입력
  - 위험한 작업 방지

### 5. 실시간 업데이트
- **WebSocket 연결**
  - 통계 자동 업데이트
  - 새 신고 즉시 알림
  - 시스템 상태 변화 감지

---

## 🧩 공통 컴포넌트

### 1. AdminLayout
- **구조**: Nav (12%) + Header + Main (70%) + Widget (18%)
- **Props**: `children`, `rightWidget`

### 2. StatCard (통계 카드)
- **Props**: `icon`, `label`, `value`, `change`, `onClick`
- **크기**: 1/4 너비
- **호버**: 배경 변경

### 3. DataTable (데이터 테이블)
- **Props**: `columns`, `data`, `onRowClick`, `selectable`
- **기능**: 정렬, 체크박스, 페이지네이션

### 4. FilterBar (필터 바)
- **Props**: `filters` (select, input 등)
- **레이아웃**: 수평 나열

### 5. AdminModal (모달)
- **Props**: `isOpen`, `onClose`, `title`, `children`, `actions`
- **크기**: Small (400px), Medium (600px), Large (800px)

### 6. ConfirmDialog (확인 다이얼로그)
- **Props**: `message`, `onConfirm`, `requireInput`
- **입력 확인**: "삭제" 정확히 입력

### 7. Chart (차트)
- **라이브러리**: Recharts
- **타입**: Line, Bar, Pie
- **Props**: `type`, `data`, `options`

### 8. Badge (배지)
- **Props**: `color`, `text`
- **색상**: success, warning, danger, info, gray

### 9. ProgressBar (프로그레스 바)
- **Props**: `value`, `max`, `color`
- **색상**: 80% 초과 시 주황색, 90% 초과 시 빨간색

### 10. Toast (알림)
- **라이브러리**: react-hot-toast
- **타입**: success, error, info, warning
- **위치**: 우측 상단

---

## 📱 반응형 (관리자는 Desktop 위주)

### Desktop (1920px+) - 주 타겟
- 3단 레이아웃 (12% + 70% + 18%)
- 테이블 10개 항목
- 차트 전체 표시

### Laptop (1440px)
- 3단 레이아웃 유지
- Gap 축소
- 테이블 8개 항목

### Tablet (1024px 이하) - 제한적 지원
- 2단 레이아웃 (Nav + Main)
- 우측 위젯 숨김
- 테이블 5개 항목

### Mobile (<768px) - 지원 안 함
- "Desktop에서 접속하세요" 메시지 표시

---

## 🚀 성능 최적화

### 1. React Query 캐싱
```javascript
{
  stats: 5분 캐시,
  users: 1분 캐시,
  studies: 1분 캐시,
  reports: 30초 캐시 (실시간성 중요)
}
```

### 2. 가상 스크롤
- 테이블 항목 많을 때 (100개 이상)
- react-virtual 사용

### 3. 이미지 최적화
- Next.js Image 컴포넌트
- Lazy loading

### 4. Code Splitting
- 각 페이지별 동적 import
- 차트 라이브러리는 필요할 때만 로드

---

## 📚 상세 화면 설계 문서

1. **[01-dashboard.md](./01-dashboard.md)** - 대시보드
2. **[02-users.md](./02-users.md)** - 사용자 관리
3. **[03-studies.md](./03-studies.md)** - 스터디 관리
4. **[04-reports.md](./04-reports.md)** - 신고 관리
5. **[05-analytics.md](./05-analytics.md)** - 통계 분석
6. **[06-settings.md](./06-settings.md)** - 시스템 설정
7. **[07-components.md](./07-components.md)** - 공통 컴포넌트

---

**작성일**: 2025-11-25  
**작성자**: GitHub Copilot  
**버전**: 1.0

