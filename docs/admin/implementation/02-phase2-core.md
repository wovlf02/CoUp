# 구현 가이드 - Phase 2: 핵심 기능 (Week 3-4)

> **파일**: 02-phase2-core.md  
> **분량**: ~1000줄
> **기간**: Week 3 ~ Week 4

---

## 1. Phase 2 목표

Phase 2의 목표는 관리자 시스템의 핵심 기능인 **사용자 관리**와 **신고 관리**를 완성하는 것입니다. 이 단계가 완료되면 관리자는 사용자를 검색, 조회하고 제재를 가할 수 있으며, 사용자들이 제출한 신고를 처리할 수 있게 됩니다.

### 완료 기준
- ✅ **사용자 관리**: 목록 조회, 검색, 필터링, 상세 조회, 계정 정지/해제 기능이 완벽하게 동작한다.
- ✅ **신고 관리**: 목록 조회, 필터링, 상세 조회, 신고 처리(승인/반려) 기능이 완벽하게 동작한다.
- ✅ **자동화**: 신고 처리 시 3-Strike 정책에 따른 제재가 자동으로 적용된다.
- ✅ **로깅**: 모든 관리자 활동이 감사 로그에 기록된다.
- ✅ **테스트**: 주요 API와 로직에 대한 단위/통합 테스트가 작성되고 통과한다.

---

## 2. Week 3: 사용자 관리 구현

### 2.1 체크리스트

- [ ] **API (User List)**: `GET /api/admin/users`
  - [ ] 검색 (이름, 이메일)
  - [ ] 필터 (역할, 상태)
  - [ ] 페이지네이션 (페이지당 20개)
  - [ ] 정렬 (생성일순)
- [ ] **API (User Detail)**: `GET /api/admin/users/[userId]`
- [ ] **API (Suspend/Unsuspend)**:
  - [ ] `POST /api/admin/users/[userId]/suspend`
  - [ ] `POST /api/admin/users/[userId]/unsuspend`
- [ ] **Frontend (User List Page)**: `app/admin/users/page.tsx`
  - [ ] `UsersTable` 컴포넌트 구현
  - [ ] `SearchBar`, `FilterPanel` 컴포넌트 구현
  - [ ] 클라이언트 사이드 페이지네이션 및 URL `searchParams` 연동
- [ ] **Frontend (User Detail Page)**: `app/admin/users/[userId]/page.tsx`
  - [ ] 사용자 기본 정보, 통계, 제재/신고 이력 표시
- [ ] **Frontend (Suspend Modal)**: `SuspendModal` 컴포넌트 구현

### 2.2 API 구현 가이드

#### 사용자 목록 API (`/api/admin/users`)

- **파일**: `app/api/admin/users/route.ts`
- **핵심 로직**:
  1. `requireAdmin()`으로 관리자 권한을 확인합니다.
  2. `URL.searchParams`를 사용하여 `q`, `role`, `status`, `page` 파라미터를 파싱합니다.
  3. `prisma.user.findMany`를 사용하여 조건에 맞는 사용자를 조회합니다.
     - `where` 절에 동적으로 검색(`OR` 조건)과 필터(`AND` 조건)를 조합합니다.
     - `skip`, `take` 옵션으로 페이지네이션을 구현합니다.
  4. 전체 사용자 수를 `count`하여 `total`과 함께 반환, 페이지네이션 UI에 사용합니다.

**코드 예시**:
```typescript
// app/api/admin/users/route.ts
export async function GET(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  // ... diğer parametreler
  
  const where = {
    ...(q && { OR: [{ name: { contains: q } }, { email: { contains: q } }] }),
    // ... diğer filtreler
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({ where, skip: (page - 1) * 20, take: 20 }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ data: users, total });
}
```

### 2.3 Frontend 구현 가이드

#### 사용자 테이블 (`UsersTable.tsx`)

- **상태 관리**: `useReactTable` 또는 유사 라이브러리를 사용하여 정렬, 선택 등의 상태를 관리하는 것을 권장합니다.
- **UI**: `shadcn/ui`의 `Table` 컴포넌트를 기반으로 구현합니다.
- **인터랙션**:
  - 행 클릭 시 `next/navigation`의 `useRouter`를 사용하여 상세 페이지로 이동합니다.
  - 체크박스를 통해 여러 사용자를 선택하고, 일괄 작업(Phase 3)을 위한 `selectedUserIds` 상태를 관리합니다.

#### 검색 및 필터 (`SearchBar.tsx`, `FilterPanel.tsx`)

- **상태와 URL 동기화**:
  - 사용자가 검색어를 입력하거나 필터를 변경하면, `useRouter`와 `useSearchParams`를 사용하여 URL 쿼리 파라미터를 업데이트합니다.
  - 페이지 컴포넌트는 업데이트된 `searchParams`를 읽어 API를 다시 호출하고 테이블을 업데이트합니다.
- **디바운싱(Debouncing)**: `SearchBar`에서는 `use-debounce` 라이브러리를 사용하여 사용자가 타이핑을 멈춘 후(예: 500ms)에만 API 요청이 가도록 최적화합니다.

---

## 3. Week 4: 신고 관리 구현

### 3.1 체크리스트

- [ ] **알고리즘**: `calculateReportPriority()` 우선순위 계산 함수 구현.
- [ ] **API (Report List)**: `GET /api/admin/reports`
  - [ ] 필터 (상태, 우선순위, 유형)
  - [ ] 정렬 (우선순위, 생성일순)
- [ ] **API (Report Detail)**: `GET /api/admin/reports/[reportId]`
- [ ] **API (Process Report)**: `POST /api/admin/reports/[reportId]/process`
  - [ ] 처리 결정(승인/반려) 로직
  - [ ] 승인 시 `determineSanctionLevel` 호출 및 자동 제재 실행
- [ ] **API (Assign Report)**: `POST /api/admin/reports/[reportId]/assign`
- [ ] **Frontend (Report List Page)**: `app/admin/reports/page.tsx`
  - [ ] 카드 기반 UI, 우선순위별 색상 표시
- [ ] **Frontend (Report Detail Page)**: `app/admin/reports/[reportId]/page.tsx`
  - [ ] 신고 정보, 증거 자료(이미지/텍스트), 피신고자 정보, 처리 액션 UI
- [ ] **Frontend (Process Modal)**: `ProcessModal` 컴포넌트 구현

### 3.2 핵심 로직 구현 가이드

#### 신고 우선순위 계산 (`calculateReportPriority`)

- **파일**: `lib/admin/reportPriority.ts`
- **로직**:
  - 점수 기반 시스템을 사용합니다.
  - **입력**: `Report` 객체 (피신고자 정보 포함)
  - **평가 항목**:
    - 신고 유형의 심각도 (예: 괴롭힘 > 스팸)
    - 피신고자의 과거 제재 이력 (경고, 정지 횟수)
    - 단기간 내 반복 신고된 빈도
    - 증거 자료(스크린샷, 메시지 로그) 유무
  - **출력**: `Priority` Enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)

**코드 예시**:
```typescript
// lib/admin/reportPriority.ts
export function calculateReportPriority(report: ReportWithTarget): Priority {
  let score = 0;
  // ... 점수 계산 로직 ...
  if (report.target.suspensionCount > 1) score += 40;
  if (report.type === 'HARASSMENT') score += 30;
  // ...
  if (score >= 70) return 'URGENT';
  // ...
}
```

#### 신고 처리 및 자동 제재 (`/process`)

- **파일**: `app/api/admin/reports/[reportId]/process/route.ts`
- **트랜잭션**: 신고 상태 변경, 제재 기록 생성, 사용자 상태 업데이트 등 여러 DB 작업을 포함하므로 `prisma.$transaction`을 사용하여 원자성을 보장해야 합니다.
- **흐름**:
  1. 관리자 권한 확인 및 신고 정보 로드.
  2. 요청 body에서 `action`('approve'/'reject'), `resolution`(처리 사유) 등을 파싱.
  3. `action === 'approve'`인 경우:
     a. `determineSanctionLevel`을 호출하여 적절한 제재 수위를 결정.
     b. `executeSanction` 헬퍼 함수를 호출하여 실제 제재(사용자 상태 변경, 제재 기록 생성)를 실행.
  4. 신고(`Report`)의 상태를 `RESOLVED` 또는 `REJECTED`로 업데이트하고, 처리자, 처리 시간, 처리 사유를 기록.
  5. 신고자와 피신고자에게 인앱/이메일 알림 발송.
  6. 감사 로그 기록.

---

## 4. 테스트 시나리오

### 4.1 단위 테스트 (Vitest)
- **`calculateReportPriority`**: 다양한 `Report` 객체를 입력하여 예상된 `Priority`가 반환되는지 검증.
- **`determineSanctionLevel`**: 사용자의 `suspensionCount`에 따라 정확한 제재 종류와 기간이 결정되는지 검증.

### 4.2 통합 테스트
- **사용자 정지**: `/suspend` API 호출 후, 해당 유저로 로그인 시도 시 실패하는지 확인.
- **신고 승인 및 자동 제재**:
  1. 정지 이력이 없는 사용자에 대한 신고를 생성.
  2. `/process` API로 신고를 '승인'.
  3. `Sanction` 테이블에 '7일 정지' 기록이 생성되었는지 확인.
  4. `User` 테이블의 `status`가 'SUSPENDED'로, `suspensionCount`가 1로 변경되었는지 확인.
  5. 동일 사용자에 대한 신고를 다시 생성하고 '승인'.
  6. `Sanction` 테이블에 '30일 정지' 기록이 생성되고 `suspensionCount`가 2로 변경되었는지 확인.

---

**이전**: [01-phase1-infra.md](01-phase1-infra.md)  
**다음**: [03-phase3-extended.md](03-phase3-extended.md)

**작성일**: 2025-11-28
