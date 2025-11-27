# 사용자 관리 API

> **Base URL**: `/api/admin/users`  
> **권한**: ADMIN (조회/제재), SYSTEM_ADMIN (삭제)  
> **작성일**: 2025-11-27

---

## 📋 API 엔드포인트 목록

1. [사용자 목록 조회](#1-사용자-목록-조회)
2. [사용자 상세 조회](#2-사용자-상세-조회)
3. [경고 발송](#3-경고-발송)
4. [정지 실행](#4-정지-실행)
5. [정지 해제](#5-정지-해제)
6. [기능 제한](#6-기능-제한)
7. [제재 이력 조회](#7-제재-이력-조회)
8. [사용자 완전 삭제](#8-사용자-완전-삭제)
9. [데이터 익스포트](#9-데이터-익스포트)

---

## 1. 사용자 목록 조회

**Endpoint**: `GET /api/admin/users`

**권한**: ADMIN, SYSTEM_ADMIN

**Query Parameters**:
```typescript
{
  page?: number;           // 페이지 번호 (기본: 1)
  limit?: number;          // 페이지당 개수 (기본: 20, 최대: 100)
  search?: string;         // 검색어 (ID, 이름, 이메일)
  status?: string;         // 상태 필터 (ACTIVE, SUSPENDED, DELETED)
  role?: string;           // 역할 필터 (USER, ADMIN, SYSTEM_ADMIN)
  provider?: string;       // 가입 경로 (email, google, github)
  sortBy?: string;         // 정렬 기준 (createdAt, name, lastActivityAt)
  sortOrder?: 'asc' | 'desc';  // 정렬 방향
  startDate?: string;      // 가입일 시작 (ISO 8601)
  endDate?: string;        // 가입일 종료 (ISO 8601)
}
```

**Response 200**:
```typescript
{
  success: true,
  data: {
    users: [
      {
        id: string;
        email: string;
        name: string;
        avatar?: string;
        role: 'USER' | 'ADMIN' | 'SYSTEM_ADMIN';
        status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
        provider: 'email' | 'google' | 'github';
        createdAt: string;
        lastLoginAt?: string;
        lastActivityAt?: string;
        suspendedUntil?: string;
        _count: {
          studyMembers: number;  // 참여 스터디 수
        };
      }
    ],
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    },
    summary: {
      total: number;
      active: number;
      suspended: number;
      deleted: number;
    }
  }
}
```

---

## 2. 사용자 상세 조회

**Endpoint**: `GET /api/admin/users/:userId`

**권한**: ADMIN, SYSTEM_ADMIN

**Response 200**:
```typescript
{
  success: true,
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
      bio?: string;
      role: 'USER' | 'ADMIN' | 'SYSTEM_ADMIN';
      status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
      provider: 'email' | 'google' | 'github';
      createdAt: string;
      lastLoginAt?: string;
      lastActivityAt?: string;
      suspendedUntil?: string;
      suspendReason?: string;
    },
    stats: {
      studyCount: number;        // 참여 스터디
      noticeCount: number;       // 작성 공지
      fileCount: number;         // 업로드 파일
      messageCount: number;      // 채팅 메시지
    },
    sanctions: {
      warningCount: number;
      suspendCount: number;
      recentSanctions: Array<{
        id: string;
        type: 'WARNING' | 'SUSPEND' | 'UNSUSPEND' | 'RESTRICT';
        reason: string;
        duration?: string;
        createdAt: string;
        adminId: string;
      }>;
    },
    reports: {
      reportedCount: number;     // 신고당한 횟수
      reporterCount: number;     // 신고한 횟수
    }
  }
}
```

---

## 3. 경고 발송

**Endpoint**: `POST /api/admin/users/:userId/warn`

**권한**: ADMIN, SYSTEM_ADMIN

**Request Body**:
```typescript
{
  reason: string;              // 경고 사유 (10-200자)
  relatedReportId?: string;    // 관련 신고 ID
  sendEmail: boolean;          // 이메일 발송 여부
}
```

**Response 200**:
```typescript
{
  success: true,
  message: "경고가 발송되었습니다",
  data: {
    sanction: {
      id: string;
      userId: string;
      type: 'WARNING';
      reason: string;
      relatedReportId?: string;
      adminId: string;
      createdAt: string;
    },
    warningCount: number;  // 누적 경고 횟수
  }
}
```

**Error 400**:
```typescript
{
  success: false,
  error: "경고 사유는 10-200자 사이여야 합니다"
}
```

---

## 4. 정지 실행

**Endpoint**: `POST /api/admin/users/:userId/suspend`

**권한**: ADMIN, SYSTEM_ADMIN

**Request Body**:
```typescript
{
  duration: '1일' | '3일' | '7일' | '30일' | '영구';
  reason: string;              // 정지 사유 (10-200자)
  relatedReportIds?: string[]; // 관련 신고 ID 배열
  sendEmail: boolean;          // 이메일 발송 여부
}
```

**Response 200**:
```typescript
{
  success: true,
  message: "사용자가 정지되었습니다",
  data: {
    user: {
      id: string;
      status: 'SUSPENDED';
      suspendedUntil: string | null;  // null이면 영구
      suspendReason: string;
    },
    sanction: {
      id: string;
      type: 'SUSPEND';
      duration: string;
      reason: string;
      createdAt: string;
    }
  }
}
```

**Error 409**:
```typescript
{
  success: false,
  error: "이미 정지된 사용자입니다"
}
```

---

## 5. 정지 해제

**Endpoint**: `POST /api/admin/users/:userId/unsuspend`

**권한**: ADMIN, SYSTEM_ADMIN

**Request Body**:
```typescript
{
  reason: string;              // 해제 사유 (10-200자)
  sendNotification: boolean;   // 알림 발송 여부
}
```

**Response 200**:
```typescript
{
  success: true,
  message: "정지가 해제되었습니다",
  data: {
    user: {
      id: string;
      status: 'ACTIVE';
      suspendedUntil: null;
      suspendReason: null;
    },
    sanction: {
      id: string;
      type: 'UNSUSPEND';
      reason: string;
      createdAt: string;
    }
  }
}
```

---

## 6. 기능 제한

**Endpoint**: `POST /api/admin/users/:userId/restrict`

**권한**: ADMIN, SYSTEM_ADMIN

**Request Body**:
```typescript
{
  functions: Array<'CHAT' | 'STUDY_CREATE' | 'FILE_UPLOAD' | 'NOTICE_CREATE'>;
  duration: '3일' | '7일' | '30일';
  reason: string;  // 제한 사유 (10-200자)
}
```

**Response 200**:
```typescript
{
  success: true,
  message: "기능이 제한되었습니다",
  data: {
    restriction: {
      id: string;
      userId: string;
      functions: string[];
      restrictedUntil: string;
      reason: string;
      createdAt: string;
    }
  }
}
```

---

## 7. 제재 이력 조회

**Endpoint**: `GET /api/admin/users/:userId/sanctions`

**권한**: ADMIN, SYSTEM_ADMIN

**Query Parameters**:
```typescript
{
  page?: number;
  limit?: number;
  type?: 'WARNING' | 'SUSPEND' | 'UNSUSPEND' | 'RESTRICT';
}
```

**Response 200**:
```typescript
{
  success: true,
  data: {
    sanctions: [
      {
        id: string;
        type: 'WARNING' | 'SUSPEND' | 'UNSUSPEND' | 'RESTRICT';
        reason: string;
        duration?: string;
        relatedReportId?: string;
        adminId: string;
        admin: {
          name: string;
          email: string;
        };
        unsuspendReason?: string;
        unsuspendAdminId?: string;
        unsuspendAt?: string;
        createdAt: string;
      }
    ],
    pagination: {
      total: number;
      page: number;
      limit: number;
    },
    summary: {
      warningCount: number;
      suspendCount: number;
      unsuspendCount: number;
      restrictCount: number;
    }
  }
}
```

---

## 8. 사용자 완전 삭제

**Endpoint**: `DELETE /api/admin/users/:userId`

**권한**: SYSTEM_ADMIN 전용

**Request Body**:
```typescript
{
  reason: string;  // 삭제 사유 (필수)
}
```

**Response 200**:
```typescript
{
  success: true,
  message: "사용자가 완전히 삭제되었습니다",
  data: {
    deletedUserId: string;
    deletedAt: string;
    reason: string;
  }
}
```

**Error 403**:
```typescript
{
  success: false,
  error: "SYSTEM_ADMIN 권한이 필요합니다"
}
```

---

## 9. 데이터 익스포트

**Endpoint**: `POST /api/admin/users/export`

**권한**: ADMIN (제한), SYSTEM_ADMIN (전체)

**Request Body**:
```typescript
{
  format: 'CSV' | 'EXCEL' | 'JSON';
  scope: 'CURRENT_PAGE' | 'FILTERED' | 'ALL';  // ALL은 SYSTEM_ADMIN만
  filters?: {
    status?: string[];
    role?: string[];
    startDate?: string;
    endDate?: string;
  };
  fields?: string[];  // 포함할 필드 (기본: 전체)
}
```

**Response 200**:
```typescript
{
  success: true,
  message: "익스포트가 완료되었습니다",
  data: {
    downloadUrl: string;
    filename: string;
    format: string;
    recordCount: number;
    expiresAt: string;  // 다운로드 링크 만료 시간
  }
}
```

**주의사항**:
- 개인정보는 자동으로 마스킹됩니다 (이메일, 이름)
- ADMIN은 최대 1,000건까지 익스포트 가능
- SYSTEM_ADMIN은 제한 없음
- 익스포트 로그가 기록됩니다

---

## 공통 에러 응답

**401 Unauthorized**:
```typescript
{
  success: false,
  error: "인증이 필요합니다"
}
```

**403 Forbidden**:
```typescript
{
  success: false,
  error: "권한이 없습니다"
}
```

**404 Not Found**:
```typescript
{
  success: false,
  error: "사용자를 찾을 수 없습니다"
}
```

**500 Internal Server Error**:
```typescript
{
  success: false,
  error: "서버 오류가 발생했습니다"
}
```

