# 관리자 도메인

## 개요

시스템 관리자를 위한 대시보드 및 관리 기능입니다.

## 페이지 구조

```
src/app/admin/
├── layout.jsx              # 관리자 레이아웃
├── page.jsx                # 관리자 대시보드
├── error.jsx               # 에러 페이지
├── loading.jsx             # 로딩 페이지
├── _components/            # 대시보드 컴포넌트
│   ├── QuickActions.jsx    # 빠른 액션
│   ├── RecentActivity.jsx  # 최근 활동
│   └── StatsCards.jsx      # 통계 카드
├── users/                  # 사용자 관리
│   ├── page.jsx
│   ├── [id]/               # 사용자 상세
│   └── _components/
│       ├── UserBulkActions.jsx
│       ├── UserColumns.jsx
│       ├── UserEmptyState.jsx
│       ├── UserError.jsx
│       ├── UserFilters.jsx
│       └── UserList.jsx
├── studies/                # 스터디 관리
│   ├── page.jsx
│   ├── [studyId]/          # 스터디 상세
│   └── _components/
│       ├── StudyBulkActions.jsx
│       ├── StudyColumns.jsx
│       ├── StudyEmptyState.jsx
│       ├── StudyError.jsx
│       ├── StudyFilters.jsx
│       └── StudyList.jsx
├── reports/                # 신고 관리
│   ├── page.jsx
│   ├── [reportId]/         # 신고 상세
│   └── _components/
│       ├── ReportBulkActions.jsx
│       ├── ReportColumns.jsx
│       ├── ReportEmptyState.jsx
│       ├── ReportError.jsx
│       ├── ReportFilters.jsx
│       └── ReportList.jsx
├── analytics/              # 통계 분석
│   ├── page.jsx
│   └── _components/
│       ├── OverviewCharts.jsx
│       ├── StudyAnalytics.jsx
│       └── UserAnalytics.jsx
├── audit-logs/             # 감사 로그
│   ├── page.jsx
│   └── _components/
│       ├── LogFilters.jsx
│       └── LogTable.jsx
└── settings/               # 시스템 설정
    ├── page.jsx
    └── _components/
        ├── SettingsForm.jsx
        └── SettingsHistory.jsx
```

## 공통 컴포넌트

```
src/components/admin/
├── common/                 # 공통 컴포넌트
│   ├── AdminNavbar.jsx     # 관리자 네비게이션 바
│   ├── Breadcrumb.jsx      # 브레드크럼
│   ├── FilterPanel.jsx     # 필터 패널
│   ├── SearchBar.jsx       # 검색 바
│   ├── Sidebar.jsx         # 관리자 사이드바
│   └── navbar/             # 네비게이션 하위 컴포넌트
└── ui/                     # UI 컴포넌트
    ├── Badge.jsx           # 배지
    ├── Button.jsx          # 버튼
    ├── Card/               # 카드
    ├── Input/              # 입력
    ├── Modal.jsx           # 모달
    ├── Select/             # 셀렉트
    ├── Stats/              # 통계
    ├── Table/              # 테이블
    └── Toast/              # 토스트
```

---

## 관리자 대시보드

### StatsCards

통계 카드를 표시합니다.

| 통계 | 설명 |
|------|------|
| 총 사용자 | 전체 등록 사용자 수 |
| 활성 스터디 | 현재 활성 스터디 수 |
| 대기 신고 | 처리 대기 중인 신고 |
| 신규 사용자 | 이번 주 가입자 |

### QuickActions

빠른 관리 액션입니다.

| 액션 | 설명 |
|------|------|
| 사용자 검색 | 사용자 빠른 검색 |
| 신고 처리 | 대기 신고 바로가기 |
| 시스템 상태 | 서버 상태 확인 |
| 캐시 초기화 | 캐시 클리어 |

### RecentActivity

최근 관리 활동 목록입니다.

---

## 사용자 관리

### UserList

사용자 목록 테이블입니다.

| 컬럼 | 설명 |
|------|------|
| 사용자 | 이름, 이메일, 아바타 |
| 상태 | ACTIVE, SUSPENDED, DELETED |
| 역할 | USER, ADMIN |
| 가입일 | 가입 일시 |
| 최근 로그인 | 마지막 접속 |
| 액션 | 상세, 경고, 정지 |

### UserFilters

사용자 필터입니다.

| 필터 | 옵션 |
|------|------|
| 상태 | 전체, 활성, 정지, 삭제 |
| 역할 | 전체, 사용자, 관리자 |
| 가입 기간 | 전체, 오늘, 이번 주, 이번 달, 직접 설정 |
| 정렬 | 최신순, 오래된순, 이름순 |

### UserBulkActions

사용자 일괄 작업입니다.

| 액션 | 설명 |
|------|------|
| 일괄 경고 | 선택 사용자에게 경고 |
| 일괄 정지 | 선택 사용자 정지 |
| 내보내기 | CSV/Excel 내보내기 |

---

## 스터디 관리

### StudyList

스터디 목록 테이블입니다.

| 컬럼 | 설명 |
|------|------|
| 스터디 | 이름, 이모지, 카테고리 |
| 소유자 | 스터디 소유자 |
| 멤버 수 | 현재 멤버 / 최대 인원 |
| 상태 | 모집 중, 마감 |
| 생성일 | 생성 일시 |
| 액션 | 상세, 숨김, 삭제 |

### StudyFilters

스터디 필터입니다.

| 필터 | 옵션 |
|------|------|
| 카테고리 | 전체, 프로그래밍, 어학, 자격증 등 |
| 상태 | 전체, 모집 중, 마감, 숨김 |
| 공개 여부 | 전체, 공개, 비공개 |
| 기간 | 생성일 범위 |

---

## 신고 관리

### ReportList

신고 목록 테이블입니다.

| 컬럼 | 설명 |
|------|------|
| 신고 대상 | 대상 유형 및 정보 |
| 신고자 | 신고한 사용자 |
| 유형 | SPAM, HARASSMENT 등 |
| 상태 | PENDING, IN_PROGRESS, RESOLVED, REJECTED |
| 우선순위 | LOW, MEDIUM, HIGH, URGENT |
| 신고일 | 신고 일시 |
| 액션 | 상세, 처리 |

### ReportFilters

신고 필터입니다.

| 필터 | 옵션 |
|------|------|
| 상태 | 전체, 대기, 처리 중, 완료, 반려 |
| 대상 유형 | 전체, 사용자, 스터디, 메시지 |
| 신고 유형 | 스팸, 괴롭힘, 부적절 등 |
| 우선순위 | 전체, LOW, MEDIUM, HIGH, URGENT |

### 신고 처리 흐름

```
PENDING (대기)
    ↓ 담당자 배정
IN_PROGRESS (처리 중)
    ↓
    ├─ RESOLVED (완료) → 제재 적용
    └─ REJECTED (반려) → 신고 기각
```

---

## 통계 분석

### OverviewCharts

전체 통계 차트입니다.

**차트:**
- 일별 가입자 추이
- 스터디 생성 추이
- 활성 사용자 추이
- 신고 처리 현황

### UserAnalytics

사용자 분석입니다.

| 지표 | 설명 |
|------|------|
| DAU | 일간 활성 사용자 |
| WAU | 주간 활성 사용자 |
| MAU | 월간 활성 사용자 |
| 리텐션율 | 재방문율 |
| 가입 전환율 | 방문자 → 가입자 |

### StudyAnalytics

스터디 분석입니다.

| 지표 | 설명 |
|------|------|
| 카테고리별 분포 | 스터디 카테고리 비율 |
| 평균 멤버 수 | 스터디당 평균 멤버 |
| 활동률 | 활성 스터디 비율 |
| 생존율 | 30일 이상 유지 비율 |

---

## 감사 로그

### LogTable

관리자 활동 로그 테이블입니다.

| 컬럼 | 설명 |
|------|------|
| 관리자 | 작업 수행자 |
| 액션 | 수행한 작업 |
| 대상 | 작업 대상 |
| 변경 내용 | before/after 비교 |
| IP | 접속 IP |
| 시간 | 작업 시간 |

### LogFilters

로그 필터입니다.

| 필터 | 옵션 |
|------|------|
| 관리자 | 특정 관리자 |
| 액션 유형 | 사용자, 스터디, 신고, 설정 등 |
| 기간 | 시작일 ~ 종료일 |

---

## 시스템 설정

### SettingsForm

시스템 설정 폼입니다.

| 카테고리 | 설정 항목 |
|----------|----------|
| 일반 | 사이트 이름, 설명, 로고 |
| 보안 | 비밀번호 정책, 세션 만료, 2FA |
| 알림 | 이메일 설정, 푸시 설정 |
| 기능 | 회원가입 허용, 스터디 생성 제한 |
| 제한 | Rate Limit, 파일 크기 제한 |

### SettingsHistory

설정 변경 이력입니다.

---

## 제재 시스템

### 제재 유형 (SanctionType)

| 유형 | 설명 | 기간 |
|------|------|------|
| `WARNING` | 경고 | - |
| `CHAT_BAN` | 채팅 금지 | 1일 ~ 영구 |
| `STUDY_CREATE_BAN` | 스터디 생성 금지 | 1일 ~ 영구 |
| `FILE_UPLOAD_BAN` | 파일 업로드 금지 | 1일 ~ 영구 |
| `RESTRICTION` | 활동 제한 | 1일 ~ 영구 |
| `SUSPENSION` | 계정 정지 | 1일 ~ 영구 |
| `PERMANENT_BAN` | 영구 정지 | 영구 |

### 경고 심각도 (WarningSeverity)

| 레벨 | 설명 |
|------|------|
| `MINOR` | 경미한 위반 |
| `NORMAL` | 일반 위반 |
| `SERIOUS` | 심각한 위반 |
| `CRITICAL` | 치명적 위반 |

---

## 관리자 역할

### AdminRoleType

| 역할 | 권한 |
|------|------|
| `VIEWER` | 조회만 가능 |
| `MODERATOR` | 콘텐츠 모더레이션, 신고 처리 |
| `ADMIN` | 사용자/스터디 관리, 제재 |
| `SUPER_ADMIN` | 모든 권한, 시스템 설정 |

### 권한 매트릭스

| 기능 | VIEWER | MODERATOR | ADMIN | SUPER_ADMIN |
|------|:------:|:---------:|:-----:|:-----------:|
| 대시보드 조회 | ✅ | ✅ | ✅ | ✅ |
| 사용자 조회 | ✅ | ✅ | ✅ | ✅ |
| 사용자 경고 | ❌ | ✅ | ✅ | ✅ |
| 사용자 정지 | ❌ | ❌ | ✅ | ✅ |
| 스터디 숨김/삭제 | ❌ | ✅ | ✅ | ✅ |
| 신고 처리 | ❌ | ✅ | ✅ | ✅ |
| 통계 조회 | ✅ | ✅ | ✅ | ✅ |
| 통계 내보내기 | ❌ | ❌ | ✅ | ✅ |
| 감사 로그 | ❌ | ❌ | ✅ | ✅ |
| 시스템 설정 | ❌ | ❌ | ❌ | ✅ |
| 관리자 관리 | ❌ | ❌ | ❌ | ✅ |

---

## API 엔드포인트

### 통계

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/admin/stats` | 대시보드 통계 |
| GET | `/api/admin/analytics` | 상세 분석 |

### 사용자 관리

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/admin/users` | 사용자 목록 |
| GET | `/api/admin/users/[id]` | 사용자 상세 |
| PATCH | `/api/admin/users/[id]` | 사용자 수정 |
| POST | `/api/admin/users/[id]/warn` | 경고 |
| POST | `/api/admin/users/[id]/suspend` | 정지 |
| POST | `/api/admin/users/[id]/unsuspend` | 정지 해제 |

### 스터디 관리

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/admin/studies` | 스터디 목록 |
| GET | `/api/admin/studies/[id]` | 스터디 상세 |
| POST | `/api/admin/studies/[id]/hide` | 스터디 숨김 |
| DELETE | `/api/admin/studies/[id]` | 스터디 삭제 |

### 신고 관리

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/admin/reports` | 신고 목록 |
| GET | `/api/admin/reports/[id]` | 신고 상세 |
| POST | `/api/admin/reports/[id]/assign` | 담당자 배정 |
| POST | `/api/admin/reports/[id]/resolve` | 신고 처리 |
| POST | `/api/admin/reports/[id]/reject` | 신고 반려 |

### 감사 로그

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/admin/audit-logs` | 로그 목록 |

### 시스템 설정

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/admin/settings` | 설정 조회 |
| PUT | `/api/admin/settings` | 설정 수정 |

