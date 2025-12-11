# 관리자 도메인 (Admin)

## 개요

CoUp 프로젝트의 관리자 도메인은 플랫폼 운영을 위한 종합 관리 시스템을 제공합니다.
역할 기반 접근 제어(RBAC), 사용자/스터디 관리, 신고 처리, 통계 분석, 감사 로그 등 다양한 관리 기능을 포함합니다.

### 주요 특징

- **RBAC 기반 권한 시스템**: 4단계 관리자 역할 (VIEWER, MODERATOR, ADMIN, SUPER_ADMIN)
- **종합 대시보드**: 실시간 통계 및 최근 활동 모니터링
- **신고 관리**: 신고 접수, 처리, 제재 조치
- **감사 로그**: 모든 관리자 활동 추적 및 기록
- **시스템 설정**: 전역 설정 관리

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              관리자 도메인                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     /admin (관리자 레이아웃)                         │   │
│  │                                                                      │   │
│  │   ┌─────────────────────────────────────────────────────────────┐   │   │
│  │   │ AdminNavbar                                                  │   │   │
│  │   │ • 로고 • 메뉴 • 알림 • 프로필 • 사이트 이동                  │   │   │
│  │   └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │   ┌─────────────────────────────────────────────────────────────┐   │   │
│  │   │ Breadcrumb (경로 탐색)                                       │   │   │
│  │   └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │   ┌─────────────────────────────────────────────────────────────┐   │   │
│  │   │                      Main Content Area                       │   │   │
│  │   │                                                              │   │   │
│  │   │   /admin              → 대시보드                             │   │   │
│  │   │   /admin/users        → 사용자 관리                          │   │   │
│  │   │   /admin/studies      → 스터디 관리                          │   │   │
│  │   │   /admin/reports      → 신고 관리                            │   │   │
│  │   │   /admin/analytics    → 통계 분석                            │   │   │
│  │   │   /admin/settings     → 시스템 설정 (SUPER_ADMIN)            │   │   │
│  │   │   /admin/audit-logs   → 감사 로그 (SUPER_ADMIN)              │   │   │
│  │   │                                                              │   │   │
│  │   └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 페이지 구조

```
/admin                          # 관리자 루트
│
├── layout.jsx                  # 관리자 레이아웃 (인증/권한 체크)
├── page.jsx                    # 대시보드
│
├── /users                      # 사용자 관리
│   ├── page.jsx                # 사용자 목록
│   └── /[id]                   # 사용자 상세
│       └── page.jsx
│
├── /studies                    # 스터디 관리
│   ├── page.jsx                # 스터디 목록
│   └── /[studyId]              # 스터디 상세
│       └── page.jsx
│
├── /reports                    # 신고 관리
│   ├── page.jsx                # 신고 목록
│   └── /[reportId]             # 신고 상세
│       └── page.jsx
│
├── /analytics                  # 통계 분석
│   └── page.jsx
│
├── /settings                   # 시스템 설정 (SUPER_ADMIN)
│   └── page.jsx
│
└── /audit-logs                 # 감사 로그 (SUPER_ADMIN)
    └── page.jsx
```

---

## 권한 시스템 (RBAC)

### 관리자 역할

| 역할 | 설명 | 접근 가능 메뉴 |
|------|------|----------------|
| `VIEWER` | 조회만 가능 | 대시보드, 사용자(조회), 스터디(조회), 신고(조회), 분석(조회) |
| `MODERATOR` | 콘텐츠 모더레이션 | VIEWER + 신고 처리, 경고 부여, 콘텐츠 삭제 |
| `ADMIN` | 사용자/스터디 관리 | MODERATOR + 사용자 정지/해제, 스터디 폐쇄 |
| `SUPER_ADMIN` | 모든 권한 | ADMIN + 시스템 설정, 감사 로그, 관리자 역할 관리 |

### 권한 정의 (permissions.js)

```javascript
export const PERMISSIONS = {
  // 사용자 관리
  USER_VIEW: 'user:view',
  USER_SEARCH: 'user:search',
  USER_WARN: 'user:warn',
  USER_SUSPEND: 'user:suspend',
  USER_UNSUSPEND: 'user:unsuspend',
  USER_DELETE: 'user:delete',
  USER_RESTORE: 'user:restore',
  USER_UPDATE: 'user:update',

  // 스터디 관리
  STUDY_VIEW: 'study:view',
  STUDY_HIDE: 'study:hide',
  STUDY_CLOSE: 'study:close',
  STUDY_DELETE: 'study:delete',
  STUDY_RECOMMEND: 'study:recommend',
  STUDY_UPDATE: 'study:update',

  // 신고 처리
  REPORT_VIEW: 'report:view',
  REPORT_ASSIGN: 'report:assign',
  REPORT_PROCESS: 'report:process',
  REPORT_RESOLVE: 'report:resolve',
  REPORT_REJECT: 'report:reject',

  // 콘텐츠 관리
  CONTENT_VIEW: 'content:view',
  CONTENT_DELETE: 'content:delete',
  CONTENT_RESTORE: 'content:restore',

  // 통계 및 분석
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',

  // 시스템 설정
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',

  // 감사 로그
  AUDIT_VIEW: 'audit:view',
  AUDIT_EXPORT: 'audit:export',

  // 관리자 관리 (SUPER_ADMIN만)
  ADMIN_MANAGE: 'admin:manage',
  ADMIN_GRANT_ROLE: 'admin:grant_role',
};
```

### 역할별 권한 매핑

```javascript
export const ROLE_PERMISSIONS = {
  VIEWER: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_SEARCH,
    PERMISSIONS.STUDY_VIEW,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],

  MODERATOR: [
    // VIEWER 권한 포함
    ...VIEWER_PERMISSIONS,
    PERMISSIONS.USER_WARN,
    PERMISSIONS.REPORT_ASSIGN,
    PERMISSIONS.REPORT_PROCESS,
    PERMISSIONS.REPORT_RESOLVE,
    PERMISSIONS.REPORT_REJECT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.STUDY_HIDE,
  ],

  ADMIN: [
    // MODERATOR 권한 포함
    ...MODERATOR_PERMISSIONS,
    PERMISSIONS.USER_SUSPEND,
    PERMISSIONS.USER_UNSUSPEND,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.STUDY_CLOSE,
    PERMISSIONS.STUDY_DELETE,
    PERMISSIONS.STUDY_RECOMMEND,
    PERMISSIONS.AUDIT_VIEW,
  ],

  SUPER_ADMIN: Object.values(PERMISSIONS), // 모든 권한
};
```

---

## 데이터 모델

### AdminRole (관리자 역할)

```javascript
{
  id: String,
  userId: String,              // 관리자 사용자 ID
  role: AdminRoleType,         // VIEWER | MODERATOR | ADMIN | SUPER_ADMIN
  permissions: Json,           // 세부 권한
  grantedBy: String,           // 권한 부여자
  grantedAt: DateTime,         // 권한 부여 시간
  expiresAt: DateTime | null,  // 만료 시간 (영구는 null)
  user: User                   // 관계
}
```

### Warning (경고)

```javascript
{
  id: String,
  userId: String,              // 경고 대상
  adminId: String,             // 경고 부여 관리자
  reason: String,              // 경고 사유
  severity: WarningSeverity,   // MINOR | NORMAL | SERIOUS | CRITICAL
  relatedContent: String | null, // 관련 콘텐츠 ID/URL
  expiresAt: DateTime | null,  // 경고 유효 기간
  createdAt: DateTime
}
```

### Sanction (제재)

```javascript
{
  id: String,
  userId: String,              // 제재 대상
  adminId: String,             // 제재 부여 관리자
  type: SanctionType,          // 제재 유형
  reason: String,              // 제재 사유
  duration: String | null,     // "1d", "3d", "7d", "30d", "permanent"
  expiresAt: DateTime | null,  // 제재 만료 시간
  relatedReportId: String | null, // 관련 신고 ID
  metadata: String | null,     // 추가 데이터 (JSON)
  
  // 해제 정보
  isActive: Boolean,           // 활성 여부
  unsuspendedBy: String | null,
  unsuspendReason: String | null,
  unsuspendedAt: DateTime | null,
  
  createdAt: DateTime
}
```

### AdminLog (관리자 활동 로그)

```javascript
{
  id: String,
  adminId: String,             // 관리자 ID
  action: AdminAction,         // 액션 타입
  targetType: String | null,   // "User", "Study", "Report"
  targetId: String | null,     // 대상 ID
  before: Json | null,         // 변경 전 상태
  after: Json | null,          // 변경 후 상태
  reason: String | null,       // 사유
  ipAddress: String | null,    // IP 주소
  userAgent: String | null,    // User Agent
  createdAt: DateTime
}
```

### Report (신고)

```javascript
{
  id: String,
  reporterId: String,          // 신고자
  targetType: TargetType,      // USER | STUDY | MESSAGE
  targetId: String,            // 신고 대상 ID
  targetName: String | null,   // 신고 대상 이름 (캐시)
  type: ReportType,            // SPAM | HARASSMENT | INAPPROPRIATE | COPYRIGHT | OTHER
  reason: String,              // 신고 사유
  evidence: Json | null,       // 증거 자료
  
  status: ReportStatus,        // PENDING | IN_PROGRESS | RESOLVED | REJECTED
  priority: Priority,          // LOW | MEDIUM | HIGH | URGENT
  
  // 처리 정보
  processedBy: String | null,  // 처리 관리자
  processedAt: DateTime | null,
  resolution: String | null,   // 처리 결과
  
  createdAt: DateTime
}
```

---

## Enum 정의

### WarningSeverity (경고 심각도)

| 값 | 설명 |
|----|------|
| `MINOR` | 경미한 위반 |
| `NORMAL` | 일반 위반 |
| `SERIOUS` | 심각한 위반 |
| `CRITICAL` | 치명적 위반 |

### SanctionType (제재 유형)

| 값 | 설명 |
|----|------|
| `WARNING` | 경고 |
| `CHAT_BAN` | 채팅 금지 |
| `STUDY_CREATE_BAN` | 스터디 생성 금지 |
| `FILE_UPLOAD_BAN` | 파일 업로드 금지 |
| `RESTRICTION` | 활동 제한 |
| `SUSPENSION` | 계정 정지 |
| `PERMANENT_BAN` | 영구 정지 |

### ReportType (신고 유형)

| 값 | 설명 |
|----|------|
| `SPAM` | 스팸 |
| `HARASSMENT` | 괴롭힘 |
| `INAPPROPRIATE` | 부적절한 콘텐츠 |
| `COPYRIGHT` | 저작권 침해 |
| `OTHER` | 기타 |

### ReportStatus (신고 상태)

| 값 | 설명 |
|----|------|
| `PENDING` | 대기 중 |
| `IN_PROGRESS` | 처리 중 |
| `RESOLVED` | 해결됨 |
| `REJECTED` | 반려됨 |

### AdminAction (관리자 액션)

| 카테고리 | 액션 | 설명 |
|----------|------|------|
| 사용자 | `USER_VIEW` | 사용자 조회 |
| | `USER_SEARCH` | 사용자 검색 |
| | `USER_WARN` | 경고 부여 |
| | `USER_SUSPEND` | 계정 정지 |
| | `USER_UNSUSPEND` | 정지 해제 |
| | `USER_DELETE` | 계정 삭제 |
| | `USER_RESTORE` | 계정 복구 |
| | `USER_UPDATE` | 정보 수정 |
| 스터디 | `STUDY_VIEW` | 스터디 조회 |
| | `STUDY_HIDE` | 스터디 숨김 |
| | `STUDY_UNHIDE` | 숨김 해제 |
| | `STUDY_CLOSE` | 스터디 폐쇄 |
| | `STUDY_REOPEN` | 스터디 재개 |
| | `STUDY_DELETE` | 스터디 삭제 |
| | `STUDY_RECOMMEND` | 추천 설정 |
| 신고 | `REPORT_VIEW` | 신고 조회 |
| | `REPORT_ASSIGN` | 담당자 지정 |
| | `REPORT_RESOLVE` | 신고 해결 |
| | `REPORT_REJECT` | 신고 반려 |
| 콘텐츠 | `CONTENT_DELETE` | 콘텐츠 삭제 |
| | `CONTENT_RESTORE` | 콘텐츠 복구 |
| 설정 | `SETTINGS_VIEW` | 설정 조회 |
| | `SETTINGS_UPDATE` | 설정 변경 |
| | `SETTINGS_CACHE_CLEAR` | 캐시 초기화 |
| 분석 | `ANALYTICS_VIEW` | 분석 조회 |
| | `ANALYTICS_EXPORT` | 데이터 내보내기 |
| 감사 | `AUDIT_VIEW` | 로그 조회 |
| | `AUDIT_EXPORT` | 로그 내보내기 |

---

## API 엔드포인트

### 대시보드 통계

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/api/admin/stats` | ANALYTICS_VIEW | 통계 데이터 조회 |

**응답 구조:**

```javascript
{
  success: true,
  data: {
    summary: {
      users: {
        total: 1234,
        active: 1100,
        suspended: 34,
        newToday: 15,
        newThisWeek: 89
      },
      studies: {
        total: 456,
        active: 400,
        newToday: 5,
        newThisWeek: 32
      },
      reports: {
        total: 78,
        pending: 12,
        urgent: 3,
        newToday: 2
      },
      warnings: {
        total: 156,
        today: 4
      },
      sanctions: {
        active: 23
      }
    },
    recentActivity: {
      users: [...],
      reports: [...],
      warnings: [...]
    },
    charts: {
      userGrowth: [...],
      reportStats: [...]
    }
  }
}
```

### 사용자 관리

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/api/admin/users` | USER_VIEW | 사용자 목록 |
| GET | `/api/admin/users/[id]` | USER_VIEW | 사용자 상세 |
| PUT | `/api/admin/users/[id]` | USER_UPDATE | 사용자 수정 |
| POST | `/api/admin/users/[id]/warn` | USER_WARN | 경고 부여 |
| POST | `/api/admin/users/[id]/suspend` | USER_SUSPEND | 계정 정지 |
| POST | `/api/admin/users/[id]/unsuspend` | USER_UNSUSPEND | 정지 해제 |
| DELETE | `/api/admin/users/[id]` | USER_DELETE | 계정 삭제 |

**목록 쿼리 파라미터:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `page` | number | 페이지 번호 |
| `limit` | number | 페이지당 항목 수 |
| `search` | string | 검색어 (이메일, 이름) |
| `status` | string | 상태 필터 |
| `provider` | string | 가입 방식 필터 |
| `hasWarnings` | boolean | 경고 있음 필터 |
| `sortBy` | string | 정렬 필드 |
| `sortOrder` | string | 정렬 방향 |

### 스터디 관리

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/api/admin/studies` | STUDY_VIEW | 스터디 목록 |
| GET | `/api/admin/studies/[studyId]` | STUDY_VIEW | 스터디 상세 |
| POST | `/api/admin/studies/[studyId]/hide` | STUDY_HIDE | 스터디 숨김 |
| POST | `/api/admin/studies/[studyId]/close` | STUDY_CLOSE | 스터디 폐쇄 |
| DELETE | `/api/admin/studies/[studyId]` | STUDY_DELETE | 스터디 삭제 |

### 신고 관리

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/api/admin/reports` | REPORT_VIEW | 신고 목록 |
| GET | `/api/admin/reports/[reportId]` | REPORT_VIEW | 신고 상세 |
| POST | `/api/admin/reports/[reportId]/assign` | REPORT_ASSIGN | 담당자 지정 |
| POST | `/api/admin/reports/[reportId]/resolve` | REPORT_RESOLVE | 신고 해결 |
| POST | `/api/admin/reports/[reportId]/reject` | REPORT_REJECT | 신고 반려 |

**신고 목록 쿼리 파라미터:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | string | 상태 필터 |
| `type` | string | 신고 유형 필터 |
| `priority` | string | 우선순위 필터 |
| `targetType` | string | 대상 유형 필터 |
| `assignedTo` | string | 담당자 필터 (me, unassigned, userId) |
| `createdFrom` | date | 시작 날짜 |
| `createdTo` | date | 종료 날짜 |

### 통계 분석

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/api/admin/analytics` | ANALYTICS_VIEW | 상세 분석 데이터 |
| GET | `/api/admin/analytics/export` | ANALYTICS_EXPORT | 데이터 내보내기 |

### 감사 로그

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/api/admin/audit-logs` | AUDIT_VIEW | 감사 로그 목록 |
| GET | `/api/admin/audit-logs/export` | AUDIT_EXPORT | 로그 내보내기 |

### 시스템 설정

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/api/admin/settings` | SETTINGS_VIEW | 설정 조회 |
| PUT | `/api/admin/settings` | SETTINGS_UPDATE | 설정 변경 |

---

## 컴포넌트 구조

### 공통 컴포넌트 (admin/common)

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| `AdminNavbar` | AdminNavbar.jsx | 상단 네비게이션 바 |
| `Breadcrumb` | Breadcrumb.jsx | 경로 탐색 |
| `FilterPanel` | FilterPanel.jsx | 필터 패널 |
| `SearchBar` | SearchBar.jsx | 검색 바 |
| `Sidebar` | Sidebar.jsx | 사이드바 |

### UI 컴포넌트 (admin/ui)

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| `Button` | Button.jsx | 버튼 |
| `Card` | Card/index.jsx | 카드 |
| `Input` | Input/index.jsx | 입력 필드 |
| `Select` | Select/index.jsx | 선택 박스 |
| `Modal` | Modal.jsx | 모달 |
| `Table` | Table/index.jsx | 테이블 |
| `Badge` | Badge.jsx | 배지 |
| `Stats` | Stats/index.jsx | 통계 카드 |
| `Toast` | Toast/index.jsx | 토스트 알림 |

### 대시보드 컴포넌트

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| `StatsCards` | _components/StatsCards.jsx | 통계 카드 그리드 |
| `RecentActivity` | _components/RecentActivity.jsx | 최근 활동 목록 |
| `QuickActions` | _components/QuickActions.jsx | 빠른 작업 버튼 |

---

## 인증 미들웨어

### requireAdmin

**파일 위치:** `src/lib/admin/auth.js`

API 라우트에서 관리자 권한을 확인하는 함수입니다.

```javascript
async function requireAdmin(request, requiredPermissions = null) {
  // 1. 세션 확인
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  // 2. AdminRole 확인
  const adminRole = await prisma.adminRole.findUnique({
    where: { userId: session.user.id }
  });
  if (!adminRole) {
    return NextResponse.json(
      { error: '관리자 권한이 없습니다.' },
      { status: 403 }
    );
  }

  // 3. 역할 만료 확인
  if (adminRole.expiresAt && new Date(adminRole.expiresAt) < new Date()) {
    return NextResponse.json(
      { error: '관리자 권한이 만료되었습니다.' },
      { status: 403 }
    );
  }

  // 4. 특정 권한 확인
  if (requiredPermissions) {
    const hasRequired = hasPermission(adminRole.role, requiredPermissions);
    if (!hasRequired) {
      return NextResponse.json(
        { error: '해당 작업을 수행할 권한이 없습니다.' },
        { status: 403 }
      );
    }
  }

  return { user: session.user, adminRole };
}
```

### getAdminRole

서버 컴포넌트에서 관리자 역할을 확인하는 함수입니다.

```javascript
async function getAdminRole(userId) {
  const adminRole = await prisma.adminRole.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true, avatar: true } } }
  });
  
  if (!adminRole) return null;
  
  // 만료 확인
  if (adminRole.expiresAt && new Date(adminRole.expiresAt) < new Date()) {
    return null;
  }
  
  return adminRole;
}
```

---

## 로깅 시스템

### AdminLogger

**파일 위치:** `src/lib/logging/adminLogger.js`

관리자 활동을 로깅하는 유틸리티입니다.

```javascript
class AdminLogger {
  // 기본 로그
  static info(message, data) { ... }
  static warn(message, data) { ... }
  static error(message, data) { ... }
  static debug(message, data) { ... }
  
  // 관리자 액션 로그 (DB 저장)
  static async logAdminAction(adminId, action, details) { ... }
  
  // 특화 로그
  static logReportView(adminId, details) { ... }
  static logUserAction(adminId, action, userId, details) { ... }
  static logDatabaseError(operation, error, context) { ... }
}
```

### 로그 기록 자동화

API 핸들러에서 자동으로 관리자 액션을 로그에 기록합니다.

```javascript
// 사용 예시
async function getUsersHandler(request) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW);
  // ...
  
  // 로그 기록
  AdminLogger.logAdminAction(auth.adminRole.userId, 'USER_LIST_VIEW', {
    filters: { search, status, provider },
    resultCount: users.length,
    duration: Date.now() - startTime
  });
}
```

---

## 예외 처리

### 관리자 예외 클래스

**파일 위치:** `src/lib/exceptions/admin.js`

```javascript
class AdminPermissionException extends Error {
  static insufficientPermission(permission, adminId) {
    return new AdminPermissionException(
      `권한이 부족합니다: ${permission}`,
      'INSUFFICIENT_PERMISSION'
    );
  }
}

class AdminValidationException extends Error {
  static invalidSorting(field, validFields) { ... }
  static invalidDateRange(from, to) { ... }
  static invalidReportStatus(status, validStatuses) { ... }
}

class AdminDatabaseException extends Error {
  static queryFailed(operation, message) { ... }
  static queryTimeout(operation, timeout, context) { ... }
}
```

### 에러 핸들러

**파일 위치:** `src/lib/utils/admin-utils.js`

```javascript
function withAdminErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof AdminPermissionException) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 403 }
        );
      }
      // ... 다른 예외 처리
    }
  };
}
```

---

## 유틸리티 함수

### admin-utils.js

```javascript
// 페이지네이션 검증
function validatePagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// 페이지네이션 응답 생성
function createPaginatedResponse(data, total, page, limit, extra = {}) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    ...extra
  });
}

// 민감 정보 제거
function sanitizeUserData(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}
```

---

## 레이아웃

### 관리자 레이아웃 (layout.jsx)

```javascript
export default async function AdminLayout({ children }) {
  // 1. 세션 확인
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/admin');
  }

  // 2. 관리자 권한 확인
  const adminRole = await getAdminRole(session.user.id);
  if (!adminRole) {
    redirect('/unauthorized');
  }

  return (
    <div className={styles.adminLayout}>
      <header className={styles.navbar}>
        <AdminNavbar user={session.user} adminRole={adminRole} />
      </header>
      <div className={styles.mainContent}>
        <Breadcrumb />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 네비게이션

### 메뉴 구조

```javascript
const menuItems = [
  { label: '대시보드', href: '/admin', exact: true },
  { label: '사용자', href: '/admin/users' },
  { label: '스터디', href: '/admin/studies' },
  { label: '신고', href: '/admin/reports' },
  { label: '분석', href: '/admin/analytics' },
  { label: '설정', href: '/admin/settings', superAdminOnly: true },
  { label: '감사 로그', href: '/admin/audit-logs', superAdminOnly: true }
];
```

### 메뉴 필터링

```javascript
const filteredMenuItems = menuItems.filter(item =>
  !item.superAdminOnly || adminRole.role === 'SUPER_ADMIN'
);
```

---

## 보안 고려사항

### 인증

- 모든 관리자 페이지는 서버 사이드에서 인증 확인
- NextAuth.js 세션 기반 인증
- 관리자 역할 만료 자동 확인

### 권한

- 역할 기반 접근 제어 (RBAC)
- 세부 권한 검증
- 최소 권한 원칙 적용

### 감사

- 모든 관리자 활동 로깅
- IP 주소 및 User Agent 기록
- 변경 전/후 상태 저장

### 데이터 보호

- 민감 정보 (비밀번호) 응답에서 제외
- 입력 값 검증 및 정제
- SQL 인젝션 방지 (Prisma ORM)

