# CoUp 관리자 시스템 구축 - 완전 가이드 (세션 이어가기용)

> 이 문서만 읽으면 다른 세션에서 바로 작업을 이어갈 수 있습니다.

**최종 업데이트**: 2025-11-28 22:15  
**프로젝트**: CoUp 스터디 플랫폼 관리자 시스템  
**현재 진행률**: 문서화 100% 완료, 구현 0% 대기

---

## 📋 프로젝트 개요

### 목표
CoUp 플랫폼의 관리자 시스템을 **완전히 새로 설계하고 구현**합니다.

### 작업 범위
1. 기존 admin 코드 완전 제거 ✅
2. 관리자 기능 분석 및 설계 ✅
3. UI 설계 문서 작성 ✅
4. **실제 코드 구현** ⏳ (다음 작업)

### 기술 스택
- **Framework**: Next.js 14+ (App Router)
- **Language**: JavaScript
- **Styling**: CSS Modules (인라인 스타일 금지)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js

---

## ✅ 완료된 작업 (지금까지)

### 1. 기존 Admin 코드 삭제 (완료)

**삭제한 파일들:**
```bash
# 스크립트 파일 (4개)
coup/scripts/create-admin.js
coup/scripts/seed-admin-data.js
coup/scripts/seed-system-admin-data.js
coup/scripts/check-admin-data.js

# 디렉토리 (3개)
coup/src/app/api/admin/
docs/screens/admin/ (기존)
docs/backend/api/admin/
```

**수정한 파일들 (15개+):**
```javascript
// Prisma Schema
coup/prisma/schema.prisma
- UserRole enum에서 ADMIN, SYSTEM_ADMIN 제거
- MemberRole enum에서 ADMIN 제거
- Sanction, AdminLog, SystemSetting 모델 제거

// Middleware
coup/middleware.js
- /api/admin 경로 권한 확인 제거
- /admin 페이지 리다이렉션 제거

// API & Auth
coup/src/lib/api/index.js - adminApi 제거
coup/src/lib/hooks/useApi.js - admin 훅 제거
coup/src/lib/hooks/useAuth.js - isAdmin, isSystemAdmin 제거
coup/src/lib/auth.js - SessionUser에서 ADMIN 역할 제거
coup/src/lib/auth-helpers.js - requireAdmin 함수 제거

// UI Components
coup/src/app/(auth)/sign-in/page.jsx - admin 로그인 로직 제거
coup/src/components/layout/Header.jsx - 관리자 모드 메뉴 제거
coup/src/components/dashboard/DashboardClient.jsx - admin 링크 제거
coup/src/utils/format.js - ADMIN 역할 텍스트 제거
```

### 2. 관리자 기능 설계 문서 (12개 완료)

**위치**: `C:\Project\CoUp\docs\admin\`

**핵심 문서:**
```
docs/admin/
├── README.md                      # 전체 개요
├── COMPLETION-REPORT.md           # 작업 완료 보고서
├── FINAL-STATUS.md                # 최종 상태
│
├── features/                      # 사용자 기능 분석
│   ├── 01-user-management.md     # 사용자 관리 분석
│   ├── 02-study-management.md    # 스터디 관리 분석
│   └── 03-report-system.md       # 신고 시스템 분석
│
├── examples/
│   └── 01-best-practices.md      # 웹 관리자 시스템 모범 사례
│
└── features/complete/             # 최종 통합 명세 ⭐
    ├── 01-user-management-complete.md      # 26 KB
    ├── 02-study-management-complete.md     # 24 KB
    ├── 03-report-handling-complete.md      # 22 KB
    ├── 04-analytics-dashboard-complete.md  # 1.4 KB
    ├── 05-system-settings-complete.md      # 1.7 KB
    └── 06-audit-log-complete.md            # 1.6 KB
```

**각 complete 문서에 포함된 내용:**
- ✅ Prisma 데이터 모델 (복사 가능)
- ✅ API 명세 (TypeScript 타입 포함)
- ✅ 구현 예시 코드 (실제 사용 가능)
- ✅ 테스트 시나리오
- ✅ 단계별 구현 가이드

### 3. UI 설계 문서 (9개 완료)

**위치**: `C:\Project\CoUp\docs\screens\admin\`

**핵심 문서:**
```
docs/screens/admin/
├── README.md                      # UI 전체 구조
├── TASK-SUMMARY.md                # 작업 가이드
│
├── 00-layout.md                   # 레이아웃 ⭐
│   └── 상단 네비게이션 (AdminNavbar ~200줄)
│   └── Breadcrumb (~70줄)
│
├── 01-components.md               # 공통 컴포넌트 ⭐
│   └── Button, Modal, Table, Badge, Tabs 등
│
├── 10-dashboard.md                # 대시보드 ⭐
│   └── StatsCards (~100줄)
│   └── RecentActivity (~150줄)
│   └── QuickActions (~80줄)
│
├── 11-users-list.md               # 사용자 목록 ⭐
│   └── UserTable (~200줄)
│   └── UserFilters (~150줄)
│
├── 12-users-detail.md             # 사용자 상세 (템플릿)
├── 13-studies-list.md             # 스터디 목록 (템플릿)
└── 14-reports-list.md             # 신고 목록 (템플릿)
```

**각 UI 문서에 포함된 내용:**
- ✅ 파일 구조 및 위치
- ✅ 완전한 JSX 코드 (복사 가능)
- ✅ 완전한 CSS 모듈 코드
- ✅ Server/Client Component 구분
- ✅ Next.js 14+ 최적화 전략

---

## 🎯 다음 작업 (구현 단계)

### Phase 1: 데이터베이스 및 백엔드 (1-2주)

#### 1.1 Prisma 스키마 업데이트
**참고 문서**: `docs/admin/features/complete/01-user-management-complete.md`

```bash
# 위치: coup/prisma/schema.prisma

# 추가할 모델:
1. Warning - 경고 시스템
2. Sanction - 제재 이력
3. AdminLog - 관리자 활동 로그
4. AdminRole - 관리자 권한
5. ReportNote - 신고 처리 노트
6. ReportTimeline - 신고 타임라인
7. AutomationRule - 자동화 규칙
8. StudyModerationLog - 스터디 모더레이션 로그
9. StudyRecommendation - 스터디 추천
```

**실행 명령:**
```bash
cd C:\Project\CoUp\coup
npx prisma migrate dev --name add_admin_system
```

#### 1.2 권한 시스템 구현
**참고 문서**: `docs/admin/features/complete/01-user-management-complete.md` (권한 섹션)

```bash
# 생성할 파일:
coup/src/lib/admin/permissions.js       # 권한 정의 (~100줄)
coup/src/lib/admin/auth.js             # requireAdmin 미들웨어 (~80줄)
coup/src/lib/admin/roles.js            # 역할 관리 (~60줄)
```

**구현 체크리스트:**
- [ ] RBAC 권한 시스템 (VIEWER, MODERATOR, ADMIN, SUPER_ADMIN)
- [ ] requireAdmin() 미들웨어
- [ ] hasPermission() 유틸리티
- [ ] 권한 체크 테스트

#### 1.3 API 라우트 구현
**참고 문서**: 각 complete 문서의 API 명세 섹션

**사용자 관리 API:**
```bash
coup/src/app/api/admin/users/route.js              # GET (목록)
coup/src/app/api/admin/users/[userId]/route.js    # GET (상세)
coup/src/app/api/admin/users/[userId]/warn/route.js     # POST
coup/src/app/api/admin/users/[userId]/suspend/route.js  # POST
coup/src/app/api/admin/users/[userId]/unsuspend/route.js # POST
```

**스터디 관리 API:**
```bash
coup/src/app/api/admin/studies/route.js
coup/src/app/api/admin/studies/[studyId]/route.js
coup/src/app/api/admin/studies/[studyId]/hide/route.js
coup/src/app/api/admin/studies/[studyId]/close/route.js
```

**신고 처리 API:**
```bash
coup/src/app/api/admin/reports/route.js
coup/src/app/api/admin/reports/[reportId]/route.js
coup/src/app/api/admin/reports/[reportId]/assign/route.js
coup/src/app/api/admin/reports/[reportId]/process/route.js
```

**구현 순서:**
1. 사용자 관리 API (우선순위 1)
2. 신고 처리 API (우선순위 2)
3. 스터디 관리 API (우선순위 3)
4. 통계/분석 API (우선순위 4)

### Phase 2: 프론트엔드 UI (2-3주)

#### 2.1 레이아웃 구현
**참고 문서**: `docs/screens/admin/00-layout.md`

```bash
# 생성할 파일:
coup/src/app/admin/layout.jsx                           # ~100줄
coup/src/app/admin/layout.module.css
coup/src/app/admin/loading.jsx                          # ~30줄
coup/src/app/admin/error.jsx                            # ~80줄

coup/src/components/admin/common/AdminNavbar.jsx        # ~200줄
coup/src/components/admin/common/AdminNavbar.module.css
coup/src/components/admin/common/Breadcrumb.jsx         # ~70줄
coup/src/components/admin/common/Breadcrumb.module.css
```

**구현 팁:**
- 문서의 코드를 그대로 복사하여 시작
- 상단 네비게이션 구조 사용 (사이드바 아님)
- Server Component로 인증 확인
- Client Component는 상호작용 부분만

#### 2.2 공통 컴포넌트 라이브러리
**참고 문서**: `docs/screens/admin/01-components.md`

```bash
# 생성할 파일 (각 100줄 이하):
coup/src/components/admin/ui/Button.jsx
coup/src/components/admin/ui/Button.module.css
coup/src/components/admin/ui/Modal.jsx
coup/src/components/admin/ui/Modal.module.css
coup/src/components/admin/ui/Table.jsx
coup/src/components/admin/ui/Badge.jsx
coup/src/components/admin/ui/Tabs.jsx
coup/src/components/admin/ui/Pagination.jsx
coup/src/components/admin/ui/Skeleton.jsx
```

**구현 순서:**
1. Button (필수, 가장 먼저)
2. Modal (필수)
3. Table (사용자/스터디 목록에 필요)
4. Badge (상태 표시)
5. 나머지 (필요시)

#### 2.3 대시보드 구현
**참고 문서**: `docs/screens/admin/10-dashboard.md`

```bash
coup/src/app/admin/page.jsx                             # ~100줄
coup/src/app/admin/page.module.css
coup/src/app/admin/_components/StatsCards.jsx           # ~100줄
coup/src/app/admin/_components/StatsCards.module.css
coup/src/app/admin/_components/RecentActivity.jsx       # ~150줄
coup/src/app/admin/_components/RecentActivity.module.css
coup/src/app/admin/_components/QuickActions.jsx         # ~80줄
coup/src/app/admin/_components/QuickActions.module.css
```

**데이터 fetching:**
```javascript
// Server Component에서
const res = await fetch('http://localhost:3000/api/admin/stats', {
  next: { revalidate: 60 } // 1분 캐시
})
```

#### 2.4 사용자 관리 구현
**참고 문서**: `docs/screens/admin/11-users-list.md`

```bash
coup/src/app/admin/users/page.jsx                       # ~100줄
coup/src/app/admin/users/page.module.css
coup/src/app/admin/users/loading.jsx
coup/src/app/admin/users/_components/UserTable.jsx      # ~200줄
coup/src/app/admin/users/_components/UserTable.module.css
coup/src/app/admin/users/_components/UserFilters.jsx    # ~150줄
coup/src/app/admin/users/_components/UserFilters.module.css
coup/src/app/admin/users/_components/UserActions.jsx    # ~100줄
```

**구현 체크리스트:**
- [ ] Server Component 목록 페이지
- [ ] Client Component 테이블
- [ ] 검색 및 필터링 (URL 쿼리 파라미터)
- [ ] 페이지네이션
- [ ] 정렬 기능
- [ ] 일괄 선택
- [ ] 경고/정지/삭제 모달

#### 2.5 사용자 상세 페이지
**참고 문서**: `docs/screens/admin/12-users-detail.md`

```bash
coup/src/app/admin/users/[userId]/page.jsx
coup/src/app/admin/users/[userId]/_components/UserProfile.jsx
coup/src/app/admin/users/[userId]/_components/UserActivity.jsx
coup/src/app/admin/users/[userId]/_components/SanctionHistory.jsx
coup/src/app/admin/users/[userId]/_components/ActionPanel.jsx
```

#### 2.6 스터디 관리 구현
**참고 문서**: `docs/screens/admin/13-studies-list.md`

사용자 관리와 유사한 구조로 구현

#### 2.7 신고 처리 구현
**참고 문서**: `docs/screens/admin/14-reports-list.md`

우선순위 기반 큐 시스템으로 구현

### Phase 3: 고급 기능 (1-2주)

#### 3.1 통계 및 분석
**참고 문서**: `docs/admin/features/complete/04-analytics-dashboard-complete.md`

```bash
coup/src/app/admin/analytics/page.jsx
# 차트 라이브러리: recharts 또는 chart.js
npm install recharts
```

#### 3.2 시스템 설정
**참고 문서**: `docs/admin/features/complete/05-system-settings-complete.md`

SUPER_ADMIN만 접근 가능

#### 3.3 감사 로그
**참고 문서**: `docs/admin/features/complete/06-audit-log-complete.md`

모든 관리자 활동 추적

---

## 🔧 구현 시 주의사항

### 필수 준수 사항

#### 1. 파일 크기 제한
```javascript
// ✅ 좋은 예: 각 파일 100-300줄
// UserTable.jsx - 200줄
// UserFilters.jsx - 150줄
// UserActions.jsx - 100줄

// ❌ 나쁜 예: 1000줄 짜리 거대 파일
// UsersPage.jsx - 1000줄 (모든 것 포함)
```

#### 2. CSS 모듈 분리
```jsx
// ✅ 좋은 예
import styles from './UserTable.module.css'
<table className={styles.userTable}>

// ❌ 나쁜 예
<table style={{ width: '100%' }}>  // 인라인 스타일 금지
```

#### 3. 고유한 className
```css
/* ✅ 좋은 예 */
.userTable { }
.userTableHeader { }
.userTableRow { }

/* ❌ 나쁜 예 */
.table { }    /* 너무 일반적 */
.header { }   /* 충돌 가능 */
```

#### 4. Server/Client Component 구분
```jsx
// ✅ Server Component (기본)
export default async function UsersPage() {
  const users = await fetch(...)  // 서버에서 데이터 가져오기
  return <UserTable users={users} />
}

// ✅ Client Component (상호작용 필요시만)
'use client'
export default function UserTable({ users }) {
  const [selected, setSelected] = useState([])
  // ...
}
```

### Next.js 14+ 최적화 전략

#### 1. Dynamic Import (코드 분할)
```jsx
import dynamic from 'next/dynamic'

// 무거운 모달은 필요할 때만 로드
const WarnModal = dynamic(() => import('./WarnModal'), {
  loading: () => <p>Loading...</p>
})
```

#### 2. Suspense (로딩 상태)
```jsx
import { Suspense } from 'react'

<Suspense fallback={<TableSkeleton />}>
  <UserTable />
</Suspense>
```

#### 3. 캐싱 전략
```javascript
// 1분마다 revalidate
const res = await fetch('/api/admin/stats', {
  next: { revalidate: 60 }
})

// 항상 최신 데이터
const res = await fetch('/api/admin/reports', {
  cache: 'no-store'
})
```

---

## 📝 코딩 컨벤션

### 파일명
```bash
# 컴포넌트: PascalCase
UserTable.jsx
AdminNavbar.jsx

# CSS 모듈: 컴포넌트명.module.css
UserTable.module.css
AdminNavbar.module.css

# API 라우트: 소문자
route.js
[userId]/route.js
```

### 함수명
```javascript
// 컴포넌트: PascalCase
export default function UserTable() {}

// 일반 함수: camelCase
function formatDate() {}
function handleClick() {}

// 핸들러: handle 접두사
const handleSubmit = () => {}
const handleDelete = () => {}

// Boolean: is/has 접두사
const isLoading = false
const hasPermission = true
```

### CSS 클래스명
```css
/* camelCase 사용 */
.userTable { }
.tableHeader { }
.activeRow { }

/* BEM 스타일 금지 */
.user-table { }  /* 사용 안 함 */
```

---

## 🐛 테스트 가이드

### 단위 테스트 (Jest)
```javascript
// __tests__/admin/users/warn.test.js
describe('User Warning', () => {
  it('should issue warning', async () => {
    const response = await warnUser('user123', {
      reason: 'Spam'
    })
    expect(response.success).toBe(true)
  })
})
```

### E2E 테스트 (Playwright)
```javascript
// e2e/admin/users.spec.js
test('admin can suspend user', async ({ page }) => {
  await page.goto('/admin/users')
  await page.click('[data-testid="user-123-actions"]')
  await page.click('text=정지')
  await page.fill('textarea', '스팸 행위')
  await page.click('text=확인')
  
  await expect(page.locator('.toast')).toContainText('정지되었습니다')
})
```

---

## 📊 진행 상황 체크리스트

### Backend
- [ ] Prisma 스키마 업데이트
- [ ] 데이터베이스 마이그레이션 실행
- [ ] 권한 시스템 구현
- [ ] 사용자 관리 API (8개 엔드포인트)
- [ ] 스터디 관리 API (6개 엔드포인트)
- [ ] 신고 처리 API (8개 엔드포인트)
- [ ] 통계 API (4개 엔드포인트)
- [ ] 감사 로그 시스템

### Frontend - 레이아웃
- [ ] admin/layout.jsx (Server Component)
- [ ] AdminNavbar.jsx (상단 네비게이션)
- [ ] Breadcrumb.jsx
- [ ] loading.jsx, error.jsx

### Frontend - 공통 컴포넌트
- [ ] Button
- [ ] Modal
- [ ] Table
- [ ] Badge
- [ ] Tabs
- [ ] Pagination
- [ ] Skeleton

### Frontend - 페이지
- [ ] 대시보드 (page.jsx + 3개 컴포넌트)
- [ ] 사용자 목록 (page.jsx + 3개 컴포넌트)
- [ ] 사용자 상세 (page.jsx + 4개 컴포넌트)
- [ ] 스터디 목록
- [ ] 스터디 상세
- [ ] 신고 목록
- [ ] 신고 상세
- [ ] 통계 대시보드
- [ ] 시스템 설정
- [ ] 감사 로그

### 테스트
- [ ] API 단위 테스트
- [ ] 컴포넌트 테스트
- [ ] E2E 테스트
- [ ] 통합 테스트

---

## 🚀 빠른 시작 (다음 세션에서)

### 1단계: 문서 위치 확인
```bash
cd C:\Project\CoUp

# 기능 명세 확인
start docs\admin\features\complete\01-user-management-complete.md

# UI 설계 확인
start docs\screens\admin\00-layout.md
start docs\screens\admin\10-dashboard.md
```

### 2단계: 데이터베이스 준비
```bash
cd C:\Project\CoUp\coup

# Prisma 스키마 열기
code prisma\schema.prisma

# docs/admin/features/complete/01-user-management-complete.md의
# "데이터 모델" 섹션을 참고하여 모델 추가

# 마이그레이션 실행
npx prisma migrate dev --name add_admin_system
```

### 3단계: 첫 API 구현
```bash
# 사용자 목록 API부터 시작
mkdir -p src\app\api\admin\users
code src\app\api\admin\users\route.js

# docs/admin/features/complete/01-user-management-complete.md의
# "API 명세" 섹션 코드를 복사
```

### 4단계: 첫 UI 구현
```bash
# 레이아웃부터 시작
code src\app\admin\layout.jsx

# docs/screens/admin/00-layout.md의 코드를 복사
```

---

## 📁 중요 파일 경로 참조

### 문서 위치
```
C:\Project\CoUp\docs\
├── FINAL-ADMIN-COMPLETE.md          # 최종 완료 보고서
├── admin\
│   └── features\complete\           # 기능 명세 (API, 데이터 모델)
│       ├── 01-user-management-complete.md    ⭐ 가장 중요
│       ├── 02-study-management-complete.md
│       └── 03-report-handling-complete.md
└── screens\admin\                   # UI 설계 (JSX, CSS)
    ├── 00-layout.md                 ⭐ 먼저 구현
    ├── 01-components.md             ⭐ 공통 컴포넌트
    ├── 10-dashboard.md              ⭐ 대시보드
    └── 11-users-list.md             ⭐ 사용자 목록
```

### 코드 위치 (생성 예정)
```
C:\Project\CoUp\coup\
├── prisma\schema.prisma             # 데이터 모델
├── src\
│   ├── app\
│   │   ├── api\admin\               # API 라우트
│   │   │   ├── users\
│   │   │   ├── studies\
│   │   │   └── reports\
│   │   └── admin\                   # 관리자 UI
│   │       ├── layout.jsx           ⭐ 먼저
│   │       ├── page.jsx             ⭐ 대시보드
│   │       ├── users\
│   │       ├── studies\
│   │       └── reports\
│   ├── components\admin\
│   │   ├── common\                  # 레이아웃 컴포넌트
│   │   └── ui\                      # 공통 UI 컴포넌트
│   └── lib\admin\
│       ├── permissions.js           # 권한 시스템
│       └── auth.js                  # 인증 미들웨어
```

---

## 💡 유용한 팁

### 문서 읽는 순서 (처음 시작할 때)
1. `FINAL-ADMIN-COMPLETE.md` (이 문서) - 전체 개요
2. `docs/admin/features/complete/01-user-management-complete.md` - 데이터 모델 & API
3. `docs/screens/admin/00-layout.md` - UI 레이아웃
4. `docs/screens/admin/01-components.md` - 공통 컴포넌트
5. `docs/screens/admin/10-dashboard.md` - 첫 페이지 구현

### 구현 추천 순서
1. **Week 1**: Prisma 스키마 + 권한 시스템 + 사용자 관리 API
2. **Week 2**: 레이아웃 + 공통 컴포넌트 + 대시보드
3. **Week 3**: 사용자 관리 UI (목록 + 상세)
4. **Week 4**: 신고 처리 API + UI
5. **Week 5**: 스터디 관리
6. **Week 6**: 통계, 설정, 테스트

### 막힐 때 참고할 것
- **API 구현 막힘**: `docs/admin/features/complete/` 문서의 "구현 예시" 섹션
- **UI 구현 막힘**: `docs/screens/admin/` 문서의 전체 코드 복사
- **권한 시스템**: `01-user-management-complete.md`의 "권한 시스템" 섹션
- **테스트 작성**: complete 문서의 "테스트 시나리오" 섹션

---

## 🎯 목표 및 완료 기준

### 최소 기능 (MVP)
- [x] 문서화 (완료)
- [ ] 관리자 로그인 및 인증
- [ ] 사용자 목록 조회
- [ ] 사용자 상세 조회
- [ ] 경고 발급
- [ ] 계정 정지/해제
- [ ] 신고 목록 조회
- [ ] 신고 처리

### 완전 기능
- [ ] MVP 기능
- [ ] 스터디 관리
- [ ] 통계 대시보드
- [ ] 감사 로그
- [ ] 시스템 설정
- [ ] 자동화 규칙
- [ ] 이메일 알림
- [ ] 테스트 커버리지 80%+

---

## 📞 문제 해결 가이드

### "어디서부터 시작해야 할지 모르겠어요"
→ Prisma 스키마부터 시작하세요. `docs/admin/features/complete/01-user-management-complete.md`의 "데이터 모델" 섹션 참조

### "API를 어떻게 만들어야 할지 모르겠어요"
→ complete 문서에 전체 코드가 있습니다. 복사해서 수정하세요.

### "UI를 어떻게 만들어야 할지 모르겠어요"
→ `docs/screens/admin/` 문서에 JSX + CSS 전체 코드가 있습니다. 복사하세요.

### "파일을 어디에 만들어야 할지 모르겠어요"
→ 각 문서의 "파일 구조" 섹션을 확인하세요.

### "코드가 너무 길어요"
→ 100-300줄로 분리하세요. 각 문서에 분리 예시가 있습니다.

---

## ✅ 이 문서 사용법

### 새 세션 시작 시
1. 이 문서(`SESSION-GUIDE.md`) 열기
2. "진행 상황 체크리스트" 확인
3. 다음 작업 선택
4. 해당 문서 참조하여 구현

### 작업 중
- 막히면 → "문제 해결 가이드" 참조
- 코드 필요 → complete 또는 screens 문서 복사
- 구조 확인 → "중요 파일 경로 참조" 섹션

### 작업 완료 시
- 체크리스트 업데이트
- 다음 작업 확인

---

**이 문서는 계속 업데이트됩니다.**  
**새로운 진행 상황이 있으면 "진행 상황 체크리스트"를 업데이트하세요.**

**최종 업데이트**: 2025-11-28 22:15  
**작성자**: AI Assistant  
**버전**: 1.0.0

