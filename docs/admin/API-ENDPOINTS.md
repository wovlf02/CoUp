# CoUp 관리자 API 문서

**버전**: 1.0.0  
**최종 업데이트**: 2025-11-29

---

## 📚 목차

1. [인증](#인증)
2. [사용자 관리](#사용자-관리)
3. [스터디 관리](#스터디-관리)
4. [신고 처리](#신고-처리)
5. [통계 분석](#통계-분석)
6. [시스템 설정](#시스템-설정)
7. [감사 로그](#감사-로그)
8. [에러 응답](#에러-응답)

---

## 🔐 인증

### 개요
- **인증 방식**: NextAuth.js (JWT 기반)
- **세션 쿠키**: `__Secure-next-auth.session-token`
- **세션 유효기간**: 30일

### 로그인
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**응답**
```json
{
  "user": {
    "id": "clx...",
    "email": "admin@example.com",
    "name": "관리자"
  }
}
```

### 로그아웃
```http
POST /api/auth/signout
```

---

## 👥 사용자 관리

### 1. 사용자 목록 조회

```http
GET /api/admin/users?page=1&limit=20&status=ACTIVE&sortBy=createdAt
Authorization: Required
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| page | number | ❌ | 페이지 번호 (기본: 1) |
| limit | number | ❌ | 페이지 크기 (기본: 20, 최대: 100) |
| search | string | ❌ | 검색어 (이름, 이메일) |
| status | string | ❌ | 상태 (ACTIVE, SUSPENDED, DELETED) |
| provider | string | ❌ | 가입 방식 (CREDENTIALS, GOOGLE, GITHUB) |
| sortBy | string | ❌ | 정렬 기준 (createdAt, name, email) |
| sortOrder | string | ❌ | 정렬 순서 (asc, desc) |
| dateFrom | string | ❌ | 가입일 시작 (ISO 8601) |
| dateTo | string | ❌ | 가입일 종료 (ISO 8601) |

**응답**
```json
{
  "users": [
    {
      "id": "clx...",
      "email": "user@example.com",
      "name": "홍길동",
      "avatar": "https://...",
      "status": "ACTIVE",
      "provider": "CREDENTIALS",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastLoginAt": "2025-11-29T10:00:00.000Z",
      "adminRole": null,
      "_count": {
        "ownedStudies": 3,
        "reports": 0
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**권한**: VIEWER 이상

---

### 2. 사용자 상세 조회

```http
GET /api/admin/users/{userId}
Authorization: Required
```

**응답**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "https://...",
    "bio": "안녕하세요",
    "status": "ACTIVE",
    "provider": "CREDENTIALS",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "lastLoginAt": "2025-11-29T10:00:00.000Z",
    "adminRole": null,
    "ownedStudies": [...],
    "receivedWarnings": [...],
    "sanctions": [...],
    "_count": {
      "ownedStudies": 3,
      "studyMembers": 5,
      "reports": 0
    }
  },
  "stats": {
    "totalStudies": 3,
    "activeStudies": 2,
    "totalWarnings": 1,
    "activeSanctions": 0
  }
}
```

**권한**: VIEWER 이상

---

### 3. 경고 부여

```http
POST /api/admin/users/{userId}/warn
Authorization: Required
Content-Type: application/json

{
  "reason": "부적절한 콘텐츠 게시",
  "severity": "NORMAL",
  "relatedContent": "study-id-123"
}
```

**Request Body**
| 필드 | 타입 | 필수 | 설명 |
|-----|------|------|------|
| reason | string | ✅ | 경고 사유 (10자 이상) |
| severity | string | ❌ | 심각도 (MINOR, NORMAL, SERIOUS, CRITICAL) |
| relatedContent | string | ❌ | 관련 콘텐츠 ID 또는 URL |

**응답**
```json
{
  "success": true,
  "warning": {
    "id": "clx...",
    "userId": "clx...",
    "adminId": "clx...",
    "reason": "부적절한 콘텐츠 게시",
    "severity": "NORMAL",
    "createdAt": "2025-11-29T10:00:00.000Z"
  }
}
```

**권한**: MODERATOR 이상

---

### 4. 사용자 정지

```http
POST /api/admin/users/{userId}/suspend
Authorization: Required
Content-Type: application/json

{
  "reason": "반복적인 규정 위반",
  "duration": "7d"
}
```

**Request Body**
| 필드 | 타입 | 필수 | 설명 |
|-----|------|------|------|
| reason | string | ✅ | 정지 사유 (10자 이상) |
| duration | string | ✅ | 정지 기간 (1d, 3d, 7d, 30d, permanent) |

**응답**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "status": "SUSPENDED",
    "suspendedUntil": "2025-12-06T10:00:00.000Z"
  },
  "sanction": {
    "id": "clx...",
    "type": "SUSPENSION",
    "duration": "7d",
    "expiresAt": "2025-12-06T10:00:00.000Z"
  }
}
```

**권한**: ADMIN 이상

---

### 5. 정지 해제

```http
POST /api/admin/users/{userId}/unsuspend
Authorization: Required
Content-Type: application/json

{
  "reason": "정지 기간 만료 및 반성 확인"
}
```

**응답**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "status": "ACTIVE",
    "suspendedUntil": null
  }
}
```

**권한**: ADMIN 이상

---

## 📚 스터디 관리

### 1. 스터디 목록 조회

```http
GET /api/admin/studies?page=1&limit=20&category=프로그래밍
Authorization: Required
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| page | number | ❌ | 페이지 번호 (기본: 1) |
| limit | number | ❌ | 페이지 크기 (기본: 20) |
| search | string | ❌ | 검색어 (제목, 설명) |
| category | string | ❌ | 카테고리 |
| isPublic | boolean | ❌ | 공개 여부 |
| isRecruiting | boolean | ❌ | 모집 여부 |
| sortBy | string | ❌ | 정렬 (createdAt, name, rating) |
| sortOrder | string | ❌ | 정렬 순서 (asc, desc) |

**응답**
```json
{
  "studies": [
    {
      "id": "clx...",
      "name": "자바스크립트 스터디",
      "emoji": "📚",
      "description": "초보자를 위한 스터디",
      "category": "프로그래밍",
      "isPublic": true,
      "isRecruiting": true,
      "rating": 4.5,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "owner": {
        "id": "clx...",
        "name": "홍길동",
        "email": "user@example.com",
        "avatar": "https://..."
      },
      "_count": {
        "members": 8,
        "messages": 152
      }
    }
  ],
  "pagination": {
    "total": 85,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

**권한**: VIEWER 이상

---

### 2. 스터디 상세 조회

```http
GET /api/admin/studies/{studyId}
Authorization: Required
```

**응답**
```json
{
  "study": {
    "id": "clx...",
    "name": "자바스크립트 스터디",
    "emoji": "📚",
    "description": "초보자를 위한 스터디",
    "category": "프로그래밍",
    "subCategory": "웹 개발",
    "maxMembers": 20,
    "isPublic": true,
    "isRecruiting": true,
    "rating": 4.5,
    "reviewCount": 10,
    "tags": ["자바스크립트", "초보"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "owner": {...},
    "members": [...],
    "_count": {
      "members": 8,
      "messages": 152,
      "files": 24
    }
  },
  "stats": {
    "totalMembers": 8,
    "activeMembers": 6,
    "avgMessagesPerDay": 15.2
  }
}
```

**권한**: VIEWER 이상

---

### 3. 스터디 숨김 처리

```http
POST /api/admin/studies/{studyId}/hide
Authorization: Required
Content-Type: application/json

{
  "reason": "부적절한 콘텐츠 포함"
}
```

**응답**
```json
{
  "success": true,
  "study": {
    "id": "clx...",
    "isPublic": false
  }
}
```

**권한**: MODERATOR 이상

---

### 4. 스터디 강제 종료

```http
POST /api/admin/studies/{studyId}/close
Authorization: Required
Content-Type: application/json

{
  "reason": "운영 정책 위반"
}
```

**응답**
```json
{
  "success": true,
  "study": {
    "id": "clx...",
    "isRecruiting": false
  }
}
```

**권한**: ADMIN 이상

---

### 5. 스터디 삭제

```http
DELETE /api/admin/studies/{studyId}
Authorization: Required
Content-Type: application/json

{
  "reason": "심각한 규정 위반"
}
```

**응답**
```json
{
  "success": true,
  "message": "스터디가 삭제되었습니다"
}
```

**권한**: ADMIN 이상

---

## 🚨 신고 처리

### 1. 신고 목록 조회

```http
GET /api/admin/reports?status=PENDING&priority=HIGH
Authorization: Required
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| page | number | ❌ | 페이지 번호 |
| limit | number | ❌ | 페이지 크기 |
| search | string | ❌ | 검색어 |
| status | string | ❌ | PENDING, IN_PROGRESS, RESOLVED, REJECTED |
| type | string | ❌ | SPAM, HARASSMENT, INAPPROPRIATE, COPYRIGHT, OTHER |
| priority | string | ❌ | LOW, MEDIUM, HIGH, URGENT |
| assignee | string | ❌ | 담당자 ID (me, unassigned, {userId}) |
| targetType | string | ❌ | USER, STUDY, MESSAGE |

**응답**
```json
{
  "reports": [
    {
      "id": "clx...",
      "reporterId": "clx...",
      "targetType": "USER",
      "targetId": "clx...",
      "targetName": "홍길동",
      "type": "HARASSMENT",
      "reason": "욕설 및 비방",
      "evidence": {"screenshots": [...]},
      "status": "PENDING",
      "priority": "HIGH",
      "processedBy": null,
      "createdAt": "2025-11-29T09:00:00.000Z",
      "reporter": {
        "id": "clx...",
        "name": "신고자",
        "email": "reporter@example.com"
      }
    }
  ],
  "pagination": {...}
}
```

**권한**: VIEWER 이상

---

### 2. 신고 상세 조회

```http
GET /api/admin/reports/{reportId}
Authorization: Required
```

**응답**
```json
{
  "report": {
    "id": "clx...",
    "reporter": {...},
    "targetType": "USER",
    "targetId": "clx...",
    "targetName": "홍길동",
    "type": "HARASSMENT",
    "reason": "욕설 및 비방",
    "evidence": {...},
    "status": "PENDING",
    "priority": "HIGH",
    "processedBy": null,
    "createdAt": "2025-11-29T09:00:00.000Z"
  },
  "relatedReports": [...]
}
```

**권한**: VIEWER 이상

---

### 3. 담당자 배정

```http
POST /api/admin/reports/{reportId}/assign
Authorization: Required
Content-Type: application/json

{
  "assigneeId": "clx..."
}
```

**Request Body**
| 필드 | 타입 | 필수 | 설명 |
|-----|------|------|------|
| assigneeId | string | ❌ | 담당자 ID (없으면 자동 배정) |

**응답**
```json
{
  "success": true,
  "report": {
    "id": "clx...",
    "processedBy": "clx...",
    "status": "IN_PROGRESS"
  }
}
```

**권한**: MODERATOR 이상

---

### 4. 신고 처리

```http
POST /api/admin/reports/{reportId}/process
Authorization: Required
Content-Type: application/json

{
  "action": "APPROVE",
  "resolution": "경고 부여 및 콘텐츠 삭제",
  "linkedActions": {
    "warn": true,
    "suspend": false,
    "deleteContent": true
  }
}
```

**Request Body**
| 필드 | 타입 | 필수 | 설명 |
|-----|------|------|------|
| action | string | ✅ | APPROVE, REJECT, HOLD |
| resolution | string | ✅ | 처리 내용 (10자 이상) |
| linkedActions | object | ❌ | 연계 조치 |

**응답**
```json
{
  "success": true,
  "report": {
    "id": "clx...",
    "status": "RESOLVED",
    "processedAt": "2025-11-29T10:00:00.000Z",
    "resolution": "경고 부여 및 콘텐츠 삭제"
  }
}
```

**권한**: MODERATOR 이상

---

## 📊 통계 분석

### 1. 전체 통계 개요

```http
GET /api/admin/analytics/overview?range=30d&period=daily
Authorization: Required
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| range | string | ❌ | 7d, 30d, 90d (기본: 30d) |
| period | string | ❌ | daily, weekly, monthly (기본: daily) |

**응답**
```json
{
  "summary": {
    "users": {
      "total": 1250,
      "active": 820,
      "suspended": 15,
      "growthRate": 12.5
    },
    "studies": {
      "total": 180,
      "active": 145,
      "recruiting": 85,
      "growthRate": 8.3
    },
    "reports": {
      "total": 45,
      "pending": 8,
      "resolved": 32,
      "rejected": 5
    }
  },
  "trends": {
    "users": [
      {"date": "2025-11-01", "count": 15},
      {"date": "2025-11-02", "count": 18}
    ],
    "studies": [...],
    "reports": [...]
  }
}
```

**권한**: VIEWER 이상

---

### 2. 사용자 분석

```http
GET /api/admin/analytics/users?range=30d
Authorization: Required
```

**응답**
```json
{
  "signupTrend": [...],
  "activityMetrics": {
    "dau": 450,
    "wau": 820,
    "mau": 1050
  },
  "providerDistribution": {
    "CREDENTIALS": 60,
    "GOOGLE": 25,
    "GITHUB": 15
  },
  "sanctionStats": {
    "warnings": 45,
    "suspensions": 12,
    "bans": 3
  }
}
```

**권한**: VIEWER 이상

---

### 3. 스터디 분석

```http
GET /api/admin/analytics/studies?range=30d
Authorization: Required
```

**응답**
```json
{
  "creationTrend": [...],
  "categoryDistribution": {
    "프로그래밍": 45,
    "언어": 30,
    "자격증": 25
  },
  "activityStats": {
    "activeRate": 80.5,
    "avgMembersPerStudy": 8.3
  }
}
```

**권한**: VIEWER 이상

---

## ⚙️ 시스템 설정

### 1. 설정 조회

```http
GET /api/admin/settings?useCache=true
Authorization: Required
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| useCache | boolean | ❌ | 캐시 사용 여부 (기본: true) |

**응답**
```json
{
  "settings": {
    "general": {
      "site_name": {
        "value": "CoUp",
        "type": "string",
        "description": "사이트 이름"
      },
      "site_description": {...},
      "contact_email": {...}
    },
    "security": {...},
    "notification": {...},
    "feature": {...}
  }
}
```

**권한**: VIEWER 이상

---

### 2. 설정 업데이트

```http
PUT /api/admin/settings
Authorization: Required
Content-Type: application/json

{
  "settings": {
    "site_name": "CoUp Platform",
    "max_login_attempts": "5",
    "allow_signup": "true"
  }
}
```

**응답**
```json
{
  "success": true,
  "updated": 3,
  "settings": {...}
}
```

**권한**: SUPER_ADMIN만

---

### 3. 변경 이력 조회

```http
GET /api/admin/settings/history?limit=20
Authorization: Required
```

**응답**
```json
{
  "history": [
    {
      "id": "clx...",
      "adminId": "clx...",
      "changes": {
        "max_login_attempts": {"before": "3", "after": "5"}
      },
      "ipAddress": "127.0.0.1",
      "createdAt": "2025-11-29T10:00:00.000Z",
      "admin": {...}
    }
  ]
}
```

**권한**: VIEWER 이상

---

### 4. 캐시 초기화

```http
POST /api/admin/settings/cache/clear
Authorization: Required
```

**응답**
```json
{
  "success": true,
  "message": "캐시가 초기화되었습니다"
}
```

**권한**: SUPER_ADMIN만

---

## 📋 감사 로그

### 1. 로그 목록 조회

```http
GET /api/admin/audit-logs?action=USER_SUSPEND&dateFrom=2025-11-01
Authorization: Required
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| page | number | ❌ | 페이지 번호 |
| limit | number | ❌ | 페이지 크기 |
| adminId | string | ❌ | 관리자 ID (me, all) |
| action | string | ❌ | 액션 (와일드카드 지원: USER_*) |
| targetType | string | ❌ | User, Study, Report |
| dateFrom | string | ❌ | 시작일 (ISO 8601) |
| dateTo | string | ❌ | 종료일 (ISO 8601) |

**응답**
```json
{
  "logs": [
    {
      "id": "clx...",
      "adminId": "clx...",
      "action": "USER_SUSPEND",
      "targetType": "User",
      "targetId": "clx...",
      "before": {...},
      "after": {...},
      "reason": "반복적인 규정 위반",
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-11-29T10:00:00.000Z",
      "admin": {
        "id": "clx...",
        "name": "관리자",
        "email": "admin@example.com",
        "avatar": "https://..."
      }
    }
  ],
  "pagination": {...},
  "admins": [...]
}
```

**권한**: VIEWER 이상

---

### 2. CSV 내보내기

```http
GET /api/admin/audit-logs/export?action=USER_*&dateFrom=2025-11-01
Authorization: Required
```

**Query Parameters**: 로그 목록 조회와 동일

**응답**: CSV 파일 다운로드
```csv
일시,관리자,액션,대상 타입,대상 ID,사유,IP 주소
2025-11-29 10:00:00,admin@example.com,USER_SUSPEND,User,clx...,반복적인 규정 위반,127.0.0.1
```

**권한**: ADMIN 이상

---

## ❌ 에러 응답

### 에러 응답 형식
```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### HTTP 상태 코드

| 코드 | 설명 |
|-----|------|
| 400 | Bad Request - 잘못된 요청 |
| 401 | Unauthorized - 인증 필요 |
| 403 | Forbidden - 권한 없음 |
| 404 | Not Found - 리소스 없음 |
| 500 | Internal Server Error - 서버 오류 |

### 공통 에러 코드

| 코드 | 메시지 |
|-----|------|
| AUTH_REQUIRED | 인증이 필요합니다 |
| PERMISSION_DENIED | 권한이 없습니다 |
| INVALID_INPUT | 잘못된 입력값입니다 |
| NOT_FOUND | 리소스를 찾을 수 없습니다 |
| SERVER_ERROR | 서버 오류가 발생했습니다 |

---

## 📝 변경 이력

### v1.0.0 (2025-11-29)
- ✅ 초기 API 문서 작성
- ✅ 모든 엔드포인트 문서화
- ✅ 권한 명시
- ✅ 예제 요청/응답 추가

---

**문의**: admin@coup.com

