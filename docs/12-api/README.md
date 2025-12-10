# API 문서

## 개요

Next.js App Router API Routes 기반의 REST API입니다.

## 기본 정보

| 항목 | 값 |
|------|-----|
| Base URL | `/api` |
| 인증 방식 | Cookie (Session) |
| 응답 형식 | JSON |

## 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지"
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { ... }
  }
}
```

### HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 찾을 수 없음 |
| 409 | 충돌 |
| 429 | 요청 과다 |
| 500 | 서버 에러 |

---

## API 구조

```
src/app/api/
├── auth/                  # 인증
│   ├── me/
│   ├── signup/
│   ├── validate-session/
│   ├── verify/
│   └── [...nextauth]/
├── dashboard/             # 대시보드
├── studies/               # 스터디
│   ├── route.js
│   └── [id]/
│       ├── route.js
│       ├── calendar/
│       ├── chat/
│       ├── check-member/
│       ├── files/
│       ├── invite/
│       ├── join/
│       ├── join-requests/
│       ├── leave/
│       ├── members/
│       ├── notices/
│       ├── tasks/
│       └── transfer-ownership/
├── my-studies/            # 내 스터디
├── tasks/                 # 할일
│   ├── route.js
│   ├── stats/
│   └── [id]/
├── notifications/         # 알림
│   ├── route.js
│   ├── bulk/
│   ├── count/
│   ├── mark-all-read/
│   └── [id]/
├── groups/                # 그룹
│   ├── route.js
│   ├── search/
│   └── [id]/
├── user/                  # 사용자
├── users/                 # 사용자 목록
├── upload/                # 파일 업로드
├── attendance/            # 출석
└── admin/                 # 관리자
    ├── analytics/
    ├── audit-logs/
    ├── reports/
    ├── settings/
    ├── stats/
    ├── studies/
    └── users/
```

---

## 인증 API

### 회원가입

```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "name": "홍길동"
    }
  }
}
```

### 현재 사용자 정보

```http
GET /api/auth/me
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "/uploads/avatar.jpg",
    "role": "USER",
    "status": "ACTIVE"
  }
}
```

### 세션 검증

```http
GET /api/auth/validate-session
```

---

## 대시보드 API

### 대시보드 데이터

```http
GET /api/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "activeStudies": 3,
      "pendingTasks": 5,
      "unreadNotifications": 2,
      "completedThisMonth": 12
    },
    "myStudies": [...],
    "recentActivities": [...],
    "upcomingEvents": [...],
    "widgetData": {...}
  }
}
```

---

## 스터디 API

### 스터디 목록

```http
GET /api/studies
```

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `search` | String | 검색어 |
| `category` | String | 카테고리 |
| `isRecruiting` | Boolean | 모집 중만 |
| `page` | Number | 페이지 |
| `limit` | Number | 개수 |
| `sort` | String | 정렬 |

### 스터디 생성

```http
POST /api/studies
```

**Request Body:**
```json
{
  "name": "스터디 이름",
  "emoji": "📚",
  "description": "스터디 설명",
  "category": "programming",
  "tags": ["React", "Next.js"],
  "maxMembers": 10,
  "isPublic": true,
  "autoApprove": false
}
```

### 스터디 상세

```http
GET /api/studies/{id}
```

### 스터디 수정

```http
PATCH /api/studies/{id}
```

### 스터디 삭제

```http
DELETE /api/studies/{id}
```

### 스터디 가입

```http
POST /api/studies/{id}/join
```

**Request Body:**
```json
{
  "introduction": "자기소개",
  "motivation": "지원 동기"
}
```

### 스터디 탈퇴

```http
POST /api/studies/{id}/leave
```

### 멤버 목록

```http
GET /api/studies/{id}/members
```

### 멤버 역할 변경

```http
PATCH /api/studies/{id}/members/{memberId}/role
```

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

### 멤버 강퇴

```http
DELETE /api/studies/{id}/members/{memberId}
```

### 가입 신청 목록

```http
GET /api/studies/{id}/join-requests
```

### 가입 승인

```http
POST /api/studies/{id}/join-requests/{requestId}/approve
```

### 가입 거절

```http
POST /api/studies/{id}/join-requests/{requestId}/reject
```

### 소유권 이전

```http
POST /api/studies/{id}/transfer-ownership
```

**Request Body:**
```json
{
  "targetUserId": "새로운_소유자_ID"
}
```

---

## 공지사항 API

### 공지 목록

```http
GET /api/studies/{id}/notices
```

### 공지 생성

```http
POST /api/studies/{id}/notices
```

**Request Body:**
```json
{
  "title": "공지 제목",
  "content": "공지 내용",
  "isPinned": false,
  "isImportant": false
}
```

### 공지 수정

```http
PATCH /api/studies/{id}/notices/{noticeId}
```

### 공지 삭제

```http
DELETE /api/studies/{id}/notices/{noticeId}
```

### 공지 고정 토글

```http
POST /api/studies/{id}/notices/{noticeId}/pin
```

---

## 채팅 API

### 메시지 목록

```http
GET /api/studies/{id}/chat
```

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `cursor` | String | 페이지네이션 커서 |
| `limit` | Number | 개수 (기본: 50) |

### 메시지 전송

```http
POST /api/studies/{id}/chat
```

**Request Body:**
```json
{
  "content": "메시지 내용",
  "fileId": null
}
```

### 메시지 삭제

```http
DELETE /api/studies/{id}/chat/{messageId}
```

### 메시지 검색

```http
GET /api/studies/{id}/chat/search?q=검색어
```

---

## 캘린더 API

### 일정 목록

```http
GET /api/studies/{id}/calendar
```

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `year` | Number | 연도 |
| `month` | Number | 월 |

### 일정 생성

```http
POST /api/studies/{id}/calendar
```

**Request Body:**
```json
{
  "title": "일정 제목",
  "date": "2025-12-15",
  "startTime": "14:00",
  "endTime": "16:00",
  "location": "온라인",
  "color": "#6366F1"
}
```

### 일정 수정

```http
PATCH /api/studies/{id}/calendar/{eventId}
```

### 일정 삭제

```http
DELETE /api/studies/{id}/calendar/{eventId}
```

---

## 파일 API

### 파일 목록

```http
GET /api/studies/{id}/files
```

### 파일 업로드

```http
POST /api/studies/{id}/files
Content-Type: multipart/form-data
```

### 파일 삭제

```http
DELETE /api/studies/{id}/files/{fileId}
```

---

## 할일 API

### 할일 목록

```http
GET /api/tasks
```

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | String | 상태 필터 |
| `priority` | String | 우선순위 필터 |
| `studyId` | String | 스터디 필터 |
| `completed` | Boolean | 완료 여부 |

### 할일 생성

```http
POST /api/tasks
```

**Request Body:**
```json
{
  "title": "할일 제목",
  "description": "할일 설명",
  "studyId": null,
  "priority": "MEDIUM",
  "dueDate": "2025-12-20"
}
```

### 할일 수정

```http
PATCH /api/tasks/{id}
```

### 할일 삭제

```http
DELETE /api/tasks/{id}
```

### 완료 토글

```http
PATCH /api/tasks/{id}/toggle
```

### 할일 통계

```http
GET /api/tasks/stats
```

---

## 알림 API

### 알림 목록

```http
GET /api/notifications
```

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `isRead` | Boolean | 읽음 상태 |
| `type` | String | 알림 유형 |
| `limit` | Number | 개수 |

### 알림 읽음 처리

```http
POST /api/notifications/{id}/read
```

### 전체 읽음 처리

```http
POST /api/notifications/mark-all-read
```

### 알림 삭제

```http
DELETE /api/notifications/{id}
```

### 읽지 않은 알림 수

```http
GET /api/notifications/count
```

---

## 관리자 API

### 통계

```http
GET /api/admin/stats
```

### 사용자 목록

```http
GET /api/admin/users
```

### 사용자 경고

```http
POST /api/admin/users/{id}/warn
```

**Request Body:**
```json
{
  "reason": "경고 사유",
  "severity": "NORMAL"
}
```

### 사용자 정지

```http
POST /api/admin/users/{id}/suspend
```

**Request Body:**
```json
{
  "reason": "정지 사유",
  "duration": "7d"
}
```

### 정지 해제

```http
POST /api/admin/users/{id}/unsuspend
```

### 신고 목록

```http
GET /api/admin/reports
```

### 신고 처리

```http
POST /api/admin/reports/{id}/resolve
```

**Request Body:**
```json
{
  "resolution": "처리 내용",
  "sanctions": [...]
}
```

### 감사 로그

```http
GET /api/admin/audit-logs
```

### 시스템 설정

```http
GET /api/admin/settings
PUT /api/admin/settings
```

---

## Rate Limiting

| 엔드포인트 | 제한 |
|------------|------|
| 인증 API | 5회/분 |
| 일반 API | 100회/분 |
| 파일 업로드 | 10회/분 |
| 관리자 API | 200회/분 |

---

## 에러 코드

| 코드 | 설명 |
|------|------|
| `AUTH_REQUIRED` | 로그인 필요 |
| `FORBIDDEN` | 권한 없음 |
| `NOT_FOUND` | 리소스 없음 |
| `VALIDATION_ERROR` | 유효성 검증 실패 |
| `ALREADY_EXISTS` | 이미 존재 |
| `RATE_LIMITED` | 요청 과다 |
| `STUDY_FULL` | 스터디 정원 초과 |
| `ALREADY_MEMBER` | 이미 멤버 |
| `NOT_MEMBER` | 멤버 아님 |
| `OWNER_CANNOT_LEAVE` | 소유자 탈퇴 불가 |

