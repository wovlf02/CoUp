# 관리자 화면 설계 - 개요

> **버전**: 2.0  
> **디자인 시스템**: 관리자 전용 테마

---

## 📐 레이아웃 구조

### 기본 레이아웃
```
┌────────────────────────────────────────────────────────┐
│  Header: [CoUp Admin] [🔔 알림] [👤 프로필]             │
├──────────┬─────────────────────────────────────────────┤
│          │                                             │
│ Sidebar  │          Content Area                      │
│ (15%)    │          (85%)                             │
│          │                                             │
│ 📊 대시보드│   - Page Header (제목, 필터, 액션)          │
│ 👥 사용자 │   - Main Content                           │
│ 📚 스터디 │   - Data Table / Charts / Forms            │
│ ⚠️ 신고   │                                             │
│ 📝 콘텐츠 │                                             │
│ 📈 통계   │                                             │
│ ⚙️ 설정   │                                             │
│          │                                             │
└──────────┴─────────────────────────────────────────────┘
```

---

## 🎨 디자인 시스템

### 색상 팔레트
```css
/* Admin Primary - 보라색 계열 */
--admin-primary-50: #FAF5FF;
--admin-primary-500: #7C3AED;  /* 메인 */
--admin-primary-600: #6D28D9;  /* Hover */
--admin-primary-700: #5B21B6;

/* Status Colors */
--success: #10B981;   /* 승인, 완료 */
--warning: #F59E0B;   /* 경고, 검토 */
--danger: #EF4444;    /* 정지, 삭제 */
--info: #3B82F6;      /* 정보 */
```

### 컴포넌트
1. **AdminTable**: 정렬, 필터, 페이징 지원
2. **AdminStats**: 통계 카드
3. **AdminModal**: 확인, 입력 모달
4. **AdminBadge**: 상태 배지
5. **AdminChart**: 차트 컴포넌트

---

## 📄 화면 목록

### 1. 레이아웃 및 공통
- **[01-layout.md](./01-layout.md)** - 관리자 레이아웃
- **02-navigation.md** - 네비게이션 바
- **03-header.md** - 헤더

### 2. 대시보드
- **[04-dashboard.md](./04-dashboard.md)** - 대시보드 메인

### 3. 사용자 관리
- **05-users-list.md** - 사용자 목록
- **06-users-detail.md** - 사용자 상세
- **07-users-suspend.md** - 정지 처리 모달

### 4. 스터디 관리
- **08-studies-list.md** - 스터디 목록
- **09-studies-detail.md** - 스터디 상세
- **10-studies-close.md** - 종료 모달

### 5. 신고 관리
- **11-reports-list.md** - 신고 목록
- **12-reports-detail.md** - 신고 상세
- **13-reports-action.md** - 조치 실행 모달

### 6. 설정
- **14-settings.md** - 시스템 설정

---

## 🎯 UX 최적화 전략

### 1. 빠른 액션
- 주요 작업을 2클릭 이내로 완료
- 자주 사용하는 필터 저장
- 키보드 단축키 지원

### 2. 명확한 피드백
- 모든 작업에 확인 토스트
- 에러 시 명확한 메시지
- 로딩 상태 표시

### 3. 데이터 시각화
- 차트로 트렌드 파악
- 배지로 상태 구분
- 색상으로 우선순위 표시

### 4. 일괄 작업
- 여러 항목 선택 및 일괄 처리
- 벌크 액션 지원

---

**다음 문서**: 각 화면별 상세 설계
# 관리자 대시보드 API

> **Base URL**: `/api/admin/dashboard`  
> **권한**: ADMIN, SYSTEM_ADMIN

---

## 📊 핵심 지표 조회

### `GET /api/admin/dashboard/stats`

**설명**: 대시보드 핵심 지표 반환

**Request**:
```http
GET /api/admin/dashboard/stats
Cookie: next-auth.session-token=...
```

**Response**:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1234,
      "todayNew": 12,
      "active": 856,
      "suspended": 3
    },
    "studies": {
      "total": 542,
      "todayNew": 5,
      "active": 312,
      "recruiting": 189
    },
    "reports": {
      "pending": 23,
      "urgent": 2,
      "today": 8
    },
    "content": {
      "totalMessages": 12345,
      "totalFiles": 1234,
      "totalNotices": 456
    }
  }
}
```

---

## 👥 최근 가입 사용자

### `GET /api/admin/dashboard/recent-users`

**설명**: 최근 가입한 사용자 5명 반환

**Request**:
```http
GET /api/admin/dashboard/recent-users?limit=5
```

**Query Parameters**:
- `limit` (optional): 조회할 개수 (기본값: 5)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "name": "홍길동",
      "email": "hong@example.com",
      "avatar": "https://...",
      "provider": "GOOGLE",
      "createdAt": "2025-11-26T10:30:00Z"
    },
    {
      "id": "user_124",
      "name": "김철수",
      "email": "kim@example.com",
      "avatar": null,
      "provider": "CREDENTIALS",
      "createdAt": "2025-11-26T10:15:00Z"
    }
  ]
}
```

---

## 📚 최근 생성 스터디

### `GET /api/admin/dashboard/recent-studies`

**설명**: 최근 생성된 스터디 5개 반환

**Request**:
```http
GET /api/admin/dashboard/recent-studies?limit=5
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "study_123",
      "name": "알고리즘 스터디",
      "emoji": "📚",
      "category": "개발",
      "owner": {
        "id": "user_123",
        "name": "홍길동",
        "avatar": "https://..."
      },
      "memberCount": 5,
      "createdAt": "2025-11-26T09:00:00Z"
    }
  ]
}
```

---

## ⚠️ 최근 접수 신고

### `GET /api/admin/dashboard/recent-reports`

**설명**: 최근 접수된 신고 10건 반환

**Request**:
```http
GET /api/admin/dashboard/recent-reports?limit=10
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "report_123",
      "type": "USER",
      "reason": "욕설 및 혐오 발언",
      "priority": "URGENT",
      "status": "PENDING",
      "reporter": {
        "id": "user_456",
        "name": "익명"
      },
      "target": {
        "id": "user_789",
        "name": "홍길동"
      },
      "createdAt": "2025-11-26T11:00:00Z"
    }
  ]
}
```

---

## 📈 차트 데이터

### `GET /api/admin/dashboard/chart-data`

**설명**: 대시보드 차트용 데이터 반환

**Request**:
```http
GET /api/admin/dashboard/chart-data?period=30
```

**Query Parameters**:
- `period` (optional): 기간 (일 단위, 기본값: 30)

**Response**:
```json
{
  "success": true,
  "data": {
    "userTrend": [
      {
        "date": "2025-11-01",
        "newUsers": 15,
        "activeUsers": 850
      },
      {
        "date": "2025-11-02",
        "newUsers": 20,
        "activeUsers": 860
      }
    ],
    "reportStatus": {
      "pending": 23,
      "inProgress": 15,
      "resolved": 42,
      "rejected": 8
    },
    "popularCategories": [
      {
        "category": "개발",
        "count": 142
      },
      {
        "category": "어학",
        "count": 98
      },
      {
        "category": "디자인",
        "count": 75
      }
    ]
  }
}
```

---

## 🔄 데이터 갱신

모든 대시보드 API는 실시간 데이터를 반환합니다. 캐싱이 필요한 경우 클라이언트에서 처리하세요.

**권장 갱신 주기**:
- 핵심 지표: 30초
- 최근 활동: 10초
- 차트 데이터: 5분

