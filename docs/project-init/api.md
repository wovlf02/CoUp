# CoUp API 명세서 (API Specification)

> **작성일**: 2025년 11월 5일  
> **버전**: 1.0.0  
> **Base URL**: `https://coup.vercel.app/api/v1`  
> **인증 방식**: NextAuth.js (JWT Session)

---

## ? 목차

1. [개요](#개요)
2. [인증 (Authentication)](#인증-authentication)
3. [사용자 (Users)](#사용자-users)
4. [스터디 그룹 (Studies)](#스터디-그룹-studies)
5. [멤버 관리 (Members)](#멤버-관리-members)
6. [채팅 (Chat)](#채팅-chat)
7. [공지사항 (Notices)](#공지사항-notices)
8. [파일 공유 (Files)](#파일-공유-files)
9. [캘린더 (Calendar)](#캘린더-calendar)
10. [할 일 관리 (Tasks)](#할-일-관리-tasks)
11. [알림 (Notifications)](#알림-notifications)
12. [대시보드 (Dashboard)](#대시보드-dashboard)
13. [관리자 (Admin)](#관리자-admin)
14. [내부 API (Internal)](#내부-api-internal)
15. [에러 코드](#에러-코드)

---

## 개요

### API 설계 원칙

1. **RESTful 설계**: HTTP 메서드와 리소스 중심
2. **일관된 응답 구조**: 모든 API가 동일한 포맷 사용
3. **명확한 에러 처리**: HTTP 상태 코드 + 상세 메시지
4. **보안 우선**: 인증/인가 철저히 검증
5. **성능 최적화**: 페이지네이션, 캐싱, 인덱싱

### 공통 응답 구조

#### 성공 응답 (2xx)
```json
{
  "data": { /* 실제 데이터 */ },
  "message": "Success" // 선택적
}
```

#### 에러 응답 (4xx, 5xx)
```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE", // 선택적
  "details": { /* 추가 정보 */ } // 선택적
}
```

#### 페이지네이션 응답
```json
{
  "data": [ /* 아이템 배열 */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 인증 헤더
```
Cookie: next-auth.session-token=<JWT_TOKEN>
또는
Authorization: Bearer <JWT_TOKEN>
```

---

## 인증 (Authentication)

### NextAuth.js 소셜 로그인

#### 엔드포인트
```
POST /api/auth/callback/google
POST /api/auth/callback/github
```

#### 프로세스
1. 클라이언트에서 `signIn('google')` 또는 `signIn('github')` 호출
2. NextAuth.js가 OAuth 흐름 처리
3. 사용자 정보 DB 저장 (첫 로그인 시)
4. 세션 쿠키 생성 (JWT)
5. 콜백 URL로 리다이렉트 (기본: `/dashboard`)

#### 세션 확인
```
GET /api/auth/session
```

**응답 (로그인 상태)**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "김민준",
    "image": "https://...",
    "provider": "google"
  },
  "expires": "2025-12-05T00:00:00.000Z"
}
```

**응답 (비로그인)**:
```json
null
```

#### 로그아웃
```
POST /api/auth/signout
```

**응답**:
```json
{
  "url": "/sign-in"
}
```

---

## 사용자 (Users)

### 내 정보 조회

```
GET /api/v1/users/me
```

**인증**: 필수

**응답**:
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "김민준",
    "imageUrl": "https://...",
    "bio": "개발자를 꿈꾸는 취준생입니다.",
    "provider": "google",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-05T00:00:00.000Z"
  }
}
```

### 프로필 수정

```
PATCH /api/v1/users/me
```

**인증**: 필수

**요청 바디**:
```json
{
  "name": "김민준",
  "bio": "풀스택 개발자 지망생",
  "imageUrl": "https://..."
}
```

**응답**:
```json
{
  "data": {
    "id": 1,
    "name": "김민준",
    "bio": "풀스택 개발자 지망생",
    "imageUrl": "https://...",
    "updatedAt": "2025-01-05T12:30:00.000Z"
  }
}
```

### 계정 삭제

```
DELETE /api/v1/users/me
```

**인증**: 필수

**응답**:
```json
{
  "message": "계정이 삭제되었습니다."
}
```

**연관 데이터 처리**:
- 스터디 소유자인 경우: 스터디도 함께 삭제 (CASCADE)
- 멤버로만 참여: StudyMember 레코드 삭제
- 알림, 파일 업로드 기록 등 모두 삭제

---

## 스터디 그룹 (Studies)

### 스터디 목록 조회

```
GET /api/v1/studies
```

**인증**: 선택 (비로그인도 공개 스터디 조회 가능)

**쿼리 파라미터**:
```
?category=programming        // 카테고리 필터 (선택)
&subcategory=web            // 서브카테고리 (선택)
&keyword=react              // 검색 키워드 (선택)
&sort=popular               // 정렬: latest(기본), popular, name
&page=1                     // 페이지 번호 (기본: 1)
&limit=12                   // 페이지 크기 (기본: 12)
&visibility=PUBLIC          // 공개 여부 (기본: PUBLIC)
&filter=my                  // 내 스터디만 (로그인 시)
```

**응답**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "코딩테스트 스터디",
      "description": "매일 알고리즘 1문제 풀이",
      "category": "프로그래밍",
      "subcategory": "알고리즘",
      "visibility": "PUBLIC",
      "maxMembers": 20,
      "imageUrl": "https://...",
      "owner": {
        "id": 1,
        "name": "김철수",
        "imageUrl": "https://..."
      },
      "_count": {
        "members": 12
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-05T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

### 스터디 생성

```
POST /api/v1/studies
```

**인증**: 필수

**요청 바디**:
```json
{
  "name": "코딩테스트 마스터",
  "description": "매일 아침 9시 알고리즘 1문제",
  "category": "프로그래밍",
  "subcategory": "알고리즘",
  "visibility": "PUBLIC",
  "maxMembers": 20,
  "imageUrl": "https://...",
  "tags": ["알고리즘", "코테", "매일"]
}
```

**검증 규칙**:
- name: 2-50자
- description: 10-500자
- category: 필수
- maxMembers: 2-100

**응답** (201 Created):
```json
{
  "data": {
    "id": 1,
    "name": "코딩테스트 마스터",
    "description": "매일 아침 9시 알고리즘 1문제",
    "category": "프로그래밍",
    "visibility": "PUBLIC",
    "maxMembers": 20,
    "ownerId": 1,
    "createdAt": "2025-01-05T10:00:00.000Z"
  }
}
```

**자동 처리**:
- 생성자를 OWNER 역할로 멤버 자동 추가
- Prisma 트랜잭션으로 원자적 처리

### 스터디 상세 조회

```
GET /api/v1/studies/:studyId
```

**인증**: 선택 (공개 스터디는 비로그인도 가능)

**응답**:
```json
{
  "data": {
    "id": 1,
    "name": "코딩테스트 스터디",
    "description": "매일 알고리즘 1문제 풀이",
    "category": "프로그래밍",
    "subcategory": "알고리즘",
    "visibility": "PUBLIC",
    "maxMembers": 20,
    "imageUrl": "https://...",
    "owner": {
      "id": 1,
      "name": "김철수",
      "imageUrl": "https://..."
    },
    "members": [
      {
        "id": 1,
        "role": "OWNER",
        "user": {
          "id": 1,
          "name": "김철수",
          "imageUrl": "https://..."
        },
        "createdAt": "2025-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "role": "MEMBER",
        "user": {
          "id": 2,
          "name": "이영희",
          "imageUrl": "https://..."
        },
        "createdAt": "2025-01-02T00:00:00.000Z"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-05T00:00:00.000Z"
  }
}
```

### 스터디 수정

```
PATCH /api/v1/studies/:studyId
```

**인증**: 필수  
**권한**: OWNER 또는 ADMIN

**요청 바디** (부분 수정 가능):
```json
{
  "name": "코딩테스트 마스터 V2",
  "description": "업그레이드된 커리큘럼",
  "maxMembers": 25,
  "imageUrl": "https://..."
}
```

**응답**:
```json
{
  "data": {
    "id": 1,
    "name": "코딩테스트 마스터 V2",
    "description": "업그레이드된 커리큘럼",
    "maxMembers": 25,
    "updatedAt": "2025-01-05T14:00:00.000Z"
  }
}
```

### 스터디 삭제

```
DELETE /api/v1/studies/:studyId
```

**인증**: 필수  
**권한**: OWNER만

**응답**:
```json
{
  "message": "스터디가 삭제되었습니다."
}
```

**CASCADE 삭제**:
- 모든 멤버
- 모든 공지사항
- 모든 파일
- 모든 일정
- 모든 할 일
- 모든 채팅 메시지

---

## 멤버 관리 (Members)

### 스터디 가입

```
POST /api/v1/studies/:studyId/join
```

**인증**: 필수

**요청 바디**: 없음

**응답** (201 Created):
```json
{
  "data": {
    "id": 5,
    "userId": 3,
    "groupId": 1,
    "role": "MEMBER",
    "createdAt": "2025-01-05T15:00:00.000Z"
  },
  "message": "스터디에 가입되었습니다."
}
```

**에러 케이스**:
- 400: 이미 가입한 스터디
- 400: 정원 초과
- 403: 비공개 스터디 (초대 필요)
- 404: 스터디 없음

### 스터디 탈퇴

```
POST /api/v1/studies/:studyId/leave
```

**인증**: 필수

**응답**:
```json
{
  "message": "스터디에서 탈퇴했습니다."
}
```

**제약 조건**:
- OWNER는 탈퇴 불가 (스터디 삭제 필요)

### 멤버 목록 조회

```
GET /api/v1/studies/:studyId/members
```

**인증**: 필수  
**권한**: 멤버만

**응답**:
```json
{
  "data": [
    {
      "id": 1,
      "role": "OWNER",
      "user": {
        "id": 1,
        "name": "김철수",
        "imageUrl": "https://...",
        "email": "kim@example.com"
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "role": "ADMIN",
      "user": {
        "id": 2,
        "name": "이영희",
        "imageUrl": "https://..."
      },
      "createdAt": "2025-01-02T00:00:00.000Z"
    }
  ]
}
```

### 멤버 역할 변경

```
PATCH /api/v1/studies/:studyId/members/:memberId/role
```

**인증**: 필수  
**권한**: OWNER만

**요청 바디**:
```json
{
  "role": "ADMIN"
}
```

**가능한 역할**:
- MEMBER (일반 멤버)
- ADMIN (관리자)
- OWNER (소유자, 양도 시)

**응답**:
```json
{
  "data": {
    "id": 2,
    "role": "ADMIN",
    "updatedAt": "2025-01-05T16:00:00.000Z"
  }
}
```

### 멤버 강퇴

```
DELETE /api/v1/studies/:studyId/members/:memberId
```

**인증**: 필수  
**권한**: OWNER 또는 ADMIN

**응답**:
```json
{
  "message": "멤버가 강퇴되었습니다."
}
```

**자동 알림**:
- 강퇴된 사용자에게 알림 전송

---

## 채팅 (Chat)

### 채팅 히스토리 조회

```
GET /api/v1/studies/:studyId/messages
```

**인증**: 필수  
**권한**: 멤버만

**쿼리 파라미터**:
```
?cursor=123        // 커서 기반 페이지네이션 (메시지 ID)
&limit=50          // 한 번에 가져올 메시지 수 (기본: 50)
```

**응답**:
```json
{
  "data": [
    {
      "id": 123,
      "content": "안녕하세요!",
      "userId": 1,
      "groupId": 1,
      "user": {
        "id": 1,
        "name": "김철수",
        "imageUrl": "https://..."
      },
      "createdAt": "2025-01-05T10:00:00.000Z"
    },
    {
      "id": 122,
      "content": "오늘 공부 시작합니다",
      "userId": 2,
      "groupId": 1,
      "user": {
        "id": 2,
        "name": "이영희",
        "imageUrl": "https://..."
      },
      "createdAt": "2025-01-05T09:50:00.000Z"
    }
  ],
  "nextCursor": 100
}
```

**무한 스크롤**:
- 최신 50개 먼저 로드
- 스크롤 업 시 `cursor` 파라미터로 이전 메시지 로드
- `nextCursor`가 null이면 더 이상 메시지 없음

### WebSocket 실시간 채팅

**연결**:
```javascript
// 클라이언트
const socket = io('wss://signaling.coup.app', {
  auth: { token: session.accessToken }
})

// 방 입장
socket.emit('join_study', { studyId: 1 })

// 메시지 전송
socket.emit('send_message', {
  studyId: 1,
  content: '안녕하세요!'
})

// 메시지 수신
socket.on('new_message', (message) => {
  console.log(message)
})
```

**이벤트 구조**:

#### `join_study` (Client → Server)
```json
{
  "studyId": 1
}
```

#### `send_message` (Client → Server)
```json
{
  "studyId": 1,
  "content": "안녕하세요!"
}
```

#### `new_message` (Server → Client)
```json
{
  "id": 124,
  "content": "안녕하세요!",
  "userId": 1,
  "groupId": 1,
  "user": {
    "id": 1,
    "name": "김철수",
    "imageUrl": "https://..."
  },
  "createdAt": "2025-01-05T10:05:00.000Z"
}
```

---

## 공지사항 (Notices)

### 공지사항 목록 조회

```
GET /api/v1/studies/:studyId/notices
```

**인증**: 필수  
**권한**: 멤버만

**응답**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "이번 주 일정 공지",
      "content": "# 이번 주 일정\n\n- 월: 알고리즘\n- 화: 자료구조",
      "isPinned": true,
      "authorId": 1,
      "groupId": 1,
      "author": {
        "id": 1,
        "name": "김철수",
        "imageUrl": "https://..."
      },
      "createdAt": "2025-01-05T09:00:00.000Z",
      "updatedAt": "2025-01-05T09:00:00.000Z"
    }
  ]
}
```

**정렬**:
- 고정된 공지 (`isPinned: true`) 먼저
- 그 다음 최신순 (`createdAt DESC`)

### 공지사항 상세 조회

```
GET /api/v1/studies/:studyId/notices/:noticeId
```

**인증**: 필수  
**권한**: 멤버만

**응답**:
```json
{
  "data": {
    "id": 1,
    "title": "이번 주 일정 공지",
    "content": "# 이번 주 일정\n\n- 월: 알고리즘\n- 화: 자료구조",
    "isPinned": true,
    "authorId": 1,
    "groupId": 1,
    "author": {
      "id": 1,
      "name": "김철수",
      "imageUrl": "https://..."
    },
    "createdAt": "2025-01-05T09:00:00.000Z",
    "updatedAt": "2025-01-05T09:00:00.000Z"
  }
}
```

### 공지사항 작성

```
POST /api/v1/studies/:studyId/notices
```

**인증**: 필수  
**권한**: OWNER 또는 ADMIN

**요청 바디**:
```json
{
  "title": "이번 주 일정 공지",
  "content": "# 이번 주 일정\n\n- 월: 알고리즘\n- 화: 자료구조",
  "isPinned": false
}
```

**검증**:
- title: 2-100자
- content: 1-5000자 (Markdown)

**응답** (201 Created):
```json
{
  "data": {
    "id": 1,
    "title": "이번 주 일정 공지",
    "content": "# 이번 주 일정\n\n...",
    "isPinned": false,
    "authorId": 1,
    "groupId": 1,
    "createdAt": "2025-01-05T10:00:00.000Z"
  }
}
```

**자동 처리**:
- 모든 멤버에게 알림 전송 (WebSocket)

### 공지사항 수정

```
PATCH /api/v1/studies/:studyId/notices/:noticeId
```

**인증**: 필수  
**권한**: OWNER, ADMIN, 또는 작성자

**요청 바디**:
```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "isPinned": true
}
```

**응답**:
```json
{
  "data": {
    "id": 1,
    "title": "수정된 제목",
    "content": "수정된 내용",
    "isPinned": true,
    "updatedAt": "2025-01-05T11:00:00.000Z"
  }
}
```

### 공지사항 삭제

```
DELETE /api/v1/studies/:studyId/notices/:noticeId
```

**인증**: 필수  
**권한**: OWNER, ADMIN, 또는 작성자

**응답**:
```json
{
  "message": "공지사항이 삭제되었습니다."
}
```

---

## 파일 공유 (Files)

### 파일 목록 조회

```
GET /api/v1/studies/:studyId/files
```

**인증**: 필수  
**권한**: 멤버만

**응답**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "알고리즘_정리.pdf",
      "url": "https://s3.amazonaws.com/.../file.pdf",
      "size": 1048576,
      "mimeType": "application/pdf",
      "uploaderId": 1,
      "groupId": 1,
      "uploader": {
        "id": 1,
        "name": "김철수",
        "imageUrl": "https://..."
      },
      "createdAt": "2025-01-05T10:00:00.000Z"
    }
  ]
}
```

### Pre-signed URL 생성 (업로드용)

```
POST /api/v1/studies/:studyId/files/upload
```

**인증**: 필수  
**권한**: 멤버만

**요청 바디**:
```json
{
  "fileName": "알고리즘_정리.pdf",
  "fileType": "application/pdf",
  "fileSize": 1048576
}
```

**검증**:
- fileSize: 최대 50MB (52,428,800 bytes)
- fileType: 허용된 MIME 타입만

**응답**:
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...?signature=...",
  "fileUrl": "https://s3.amazonaws.com/.../file.pdf",
  "key": "studies/1/1234567890-file.pdf"
}
```

**업로드 프로세스**:
1. 클라이언트가 Pre-signed URL 요청
2. 서버가 S3 Pre-signed URL 생성 (15분 유효)
3. 클라이언트가 S3에 직접 업로드 (`PUT uploadUrl`)
4. 업로드 완료 후 메타데이터 저장 API 호출

### 파일 메타데이터 저장

```
POST /api/v1/studies/:studyId/files
```

**인증**: 필수  
**권한**: 멤버만

**요청 바디**:
```json
{
  "name": "알고리즘_정리.pdf",
  "url": "https://s3.amazonaws.com/.../file.pdf",
  "size": 1048576,
  "mimeType": "application/pdf"
}
```

**응답** (201 Created):
```json
{
  "data": {
    "id": 1,
    "name": "알고리즘_정리.pdf",
    "url": "https://s3.amazonaws.com/.../file.pdf",
    "size": 1048576,
    "mimeType": "application/pdf",
    "uploaderId": 1,
    "groupId": 1,
    "createdAt": "2025-01-05T10:05:00.000Z"
  }
}
```

### 파일 삭제

```
DELETE /api/v1/studies/:studyId/files/:fileId
```

**인증**: 필수  
**권한**: OWNER, ADMIN, 또는 업로더

**응답**:
```json
{
  "message": "파일이 삭제되었습니다."
}
```

**자동 처리**:
- S3에서 파일 삭제
- DB 메타데이터 삭제

---

## 캘린더 (Calendar)

### 일정 목록 조회

```
GET /api/v1/studies/:studyId/events
```

**인증**: 필수  
**권한**: 멤버만

**쿼리 파라미터**:
```
?start=2025-01-01      // 시작 날짜 (YYYY-MM-DD)
&end=2025-01-31        // 종료 날짜 (YYYY-MM-DD)
```

**응답**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "주간 모임",
      "description": "이번 주 진행 상황 공유",
      "startDate": "2025-01-10T14:00:00.000Z",
      "endDate": "2025-01-10T16:00:00.000Z",
      "type": "MEETING",
      "groupId": 1,
      "createdBy": 1,
      "createdAt": "2025-01-05T10:00:00.000Z",
      "updatedAt": "2025-01-05T10:00:00.000Z"
    }
  ]
}
```

**일정 유형 (type)**:
- EVENT: 일반 이벤트
- MEETING: 모임
- DEADLINE: 마감일

### 일정 생성

```
POST /api/v1/studies/:studyId/events
```

**인증**: 필수  
**권한**: OWNER 또는 ADMIN

**요청 바디**:
```json
{
  "title": "주간 모임",
  "description": "이번 주 진행 상황 공유",
  "startDate": "2025-01-10T14:00:00.000Z",
  "endDate": "2025-01-10T16:00:00.000Z",
  "type": "MEETING"
}
```

**검증**:
- title: 1-100자
- startDate < endDate
- type: EVENT | MEETING | DEADLINE

**응답** (201 Created):
```json
{
  "data": {
    "id": 1,
    "title": "주간 모임",
    "description": "이번 주 진행 상황 공유",
    "startDate": "2025-01-10T14:00:00.000Z",
    "endDate": "2025-01-10T16:00:00.000Z",
    "type": "MEETING",
    "groupId": 1,
    "createdBy": 1,
    "createdAt": "2025-01-05T10:00:00.000Z"
  }
}
```

### 일정 수정

```
PATCH /api/v1/studies/:studyId/events/:eventId
```

**인증**: 필수  
**권한**: OWNER 또는 ADMIN

**요청 바디**:
```json
{
  "title": "수정된 제목",
  "startDate": "2025-01-11T14:00:00.000Z",
  "endDate": "2025-01-11T16:00:00.000Z"
}
```

**응답**:
```json
{
  "data": {
    "id": 1,
    "title": "수정된 제목",
    "startDate": "2025-01-11T14:00:00.000Z",
    "endDate": "2025-01-11T16:00:00.000Z",
    "updatedAt": "2025-01-05T11:00:00.000Z"
  }
}
```

### 일정 삭제

```
DELETE /api/v1/studies/:studyId/events/:eventId
```

**인증**: 필수  
**권한**: OWNER 또는 ADMIN

**응답**:
```json
{
  "message": "일정이 삭제되었습니다."
}
```

---

## 할 일 관리 (Tasks)

### 할 일 목록 조회

```
GET /api/v1/studies/:studyId/tasks
```

**인증**: 필수  
**권한**: 멤버만

**쿼리 파라미터**:
```
?filter=all            // all(기본), completed, pending
&assigneeId=1          // 특정 담당자 필터 (선택)
```

**응답**:
```json
{
  "data": [
    {
      "id": 1,
      "content": "자소서 1차 작성",
      "isCompleted": false,
      "assigneeId": 2,
      "dueDate": "2025-01-10T23:59:59.000Z",
      "priority": "HIGH",
      "groupId": 1,
      "createdBy": 1,
      "assignee": {
        "id": 2,
        "name": "이영희",
        "imageUrl": "https://..."
      },
      "createdAt": "2025-01-05T10:00:00.000Z",
      "updatedAt": "2025-01-05T10:00:00.000Z"
    }
  ]
}
```

**우선순위 (priority)**:
- HIGH: 높음
- MEDIUM: 보통 (기본)
- LOW: 낮음

**정렬**:
1. 완료 여부 (미완료 먼저)
2. 우선순위 (높음 → 낮음)
3. 마감일 (빠른 순)

### 할 일 생성

```
POST /api/v1/studies/:studyId/tasks
```

**인증**: 필수  
**권한**: 멤버

**요청 바디**:
```json
{
  "content": "자소서 1차 작성",
  "assigneeId": 2,
  "dueDate": "2025-01-10T23:59:59.000Z",
  "priority": "HIGH"
}
```

**검증**:
- content: 1-500자
- assigneeId: 스터디 멤버여야 함 (선택)
- priority: HIGH | MEDIUM | LOW (기본: MEDIUM)

**응답** (201 Created):
```json
{
  "data": {
    "id": 1,
    "content": "자소서 1차 작성",
    "isCompleted": false,
    "assigneeId": 2,
    "dueDate": "2025-01-10T23:59:59.000Z",
    "priority": "HIGH",
    "groupId": 1,
    "createdBy": 1,
    "createdAt": "2025-01-05T10:00:00.000Z"
  }
}
```

### 할 일 수정 (완료 토글 포함)

```
PATCH /api/v1/studies/:studyId/tasks/:taskId
```

**인증**: 필수  
**권한**: 멤버

**요청 바디** (부분 수정 가능):
```json
{
  "content": "수정된 내용",
  "isCompleted": true,
  "assigneeId": 3,
  "dueDate": "2025-01-12T23:59:59.000Z",
  "priority": "MEDIUM"
}
```

**응답**:
```json
{
  "data": {
    "id": 1,
    "content": "수정된 내용",
    "isCompleted": true,
    "updatedAt": "2025-01-05T11:00:00.000Z"
  }
}
```

### 할 일 삭제

```
DELETE /api/v1/studies/:studyId/tasks/:taskId
```

**인증**: 필수  
**권한**: OWNER, ADMIN, 또는 작성자

**응답**:
```json
{
  "message": "할 일이 삭제되었습니다."
}
```

---

## 알림 (Notifications)

### 알림 목록 조회

```
GET /api/v1/notifications
```

**인증**: 필수

**쿼리 파라미터**:
```
?page=1            // 페이지 번호 (기본: 1)
&limit=20          // 페이지 크기 (기본: 20)
&isRead=false      // 읽음 여부 필터 (선택)
```

**응답**:
```json
{
  "data": [
    {
      "id": 1,
      "type": "NEW_NOTICE",
      "title": "새 공지사항",
      "message": "코딩테스트 스터디에 새 공지사항이 등록되었습니다.",
      "link": "/studies/1/notices/5",
      "isRead": false,
      "userId": 2,
      "createdAt": "2025-01-05T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  },
  "unreadCount": 15
}
```

**알림 유형 (type)**:
- STUDY_JOIN: 스터디 가입 승인
- NEW_NOTICE: 새 공지사항
- NEW_MESSAGE: 새 메시지 (멘션)
- MEMBER_KICKED: 스터디 강퇴
- EVENT_CREATED: 새 일정 추가
- TASK_ASSIGNED: 할 일 배정됨

### 알림 읽음 처리

```
PATCH /api/v1/notifications/:notificationId/read
```

**인증**: 필수

**응답**:
```json
{
  "data": {
    "id": 1,
    "isRead": true,
    "updatedAt": "2025-01-05T11:00:00.000Z"
  }
}
```

### 모든 알림 읽음 처리

```
PATCH /api/v1/notifications/mark-all-read
```

**인증**: 필수

**응답**:
```json
{
  "message": "모든 알림을 읽음 처리했습니다.",
  "count": 15
}
```

### WebSocket 실시간 알림

**연결**:
```javascript
const socket = io('wss://signaling.coup.app', {
  auth: { token: session.accessToken }
})

// 사용자별 룸 자동 입장 (서버 처리)

// 알림 수신
socket.on('notification', (notification) => {
  console.log(notification)
  // Toast 표시
  // 헤더 배지 업데이트
})
```

**알림 이벤트 구조**:
```json
{
  "id": 1,
  "type": "NEW_NOTICE",
  "title": "새 공지사항",
  "message": "코딩테스트 스터디에 새 공지사항이 등록되었습니다.",
  "link": "/studies/1/notices/5",
  "isRead": false,
  "createdAt": "2025-01-05T10:00:00.000Z"
}
```

---

## 대시보드 (Dashboard)

### 대시보드 데이터 조회

```
GET /api/v1/dashboard
```

**인증**: 필수

**응답**:
```json
{
  "data": {
    "myStudies": [
      {
        "id": 1,
        "name": "코딩테스트 스터디",
        "category": "프로그래밍",
        "role": "OWNER",
        "_count": {
          "members": 12
        },
        "lastActivity": "2025-01-05T09:30:00.000Z"
      }
    ],
    "recentNotices": [
      {
        "id": 1,
        "title": "이번 주 일정 공지",
        "groupName": "코딩테스트 스터디",
        "createdAt": "2025-01-05T09:00:00.000Z"
      }
    ],
    "upcomingEvents": [
      {
        "id": 1,
        "title": "주간 모임",
        "groupName": "코딩테스트 스터디",
        "startDate": "2025-01-10T14:00:00.000Z"
      }
    ],
    "pendingTasks": [
      {
        "id": 1,
        "content": "자소서 1차 작성",
        "groupName": "취업 준비 스터디",
        "dueDate": "2025-01-10T23:59:59.000Z",
        "priority": "HIGH"
      }
    ],
    "stats": {
      "studyCount": 4,
      "newNoticeCount": 3,
      "taskCount": 5,
      "upcomingEventCount": 2
    }
  }
}
```

**데이터 범위**:
- myStudies: 최대 6개 (최근 활동 순)
- recentNotices: 최대 5개 (최신순)
- upcomingEvents: 7일 이내, 최대 5개
- pendingTasks: 미완료, 최대 5개

---

## 관리자 (Admin)

### 관리자 대시보드

```
GET /api/v1/admin/dashboard
```

**인증**: 필수  
**권한**: SYSTEM_ADMIN

**응답**:
```json
{
  "data": {
    "stats": {
      "totalUsers": 1523,
      "totalStudies": 342,
      "activeStudies": 287,
      "totalReports": 12,
      "pendingReports": 3
    },
    "recentUsers": [
      {
        "id": 100,
        "name": "홍길동",
        "email": "hong@example.com",
        "createdAt": "2025-01-05T10:00:00.000Z"
      }
    ],
    "recentReports": [
      {
        "id": 5,
        "type": "SPAM",
        "targetType": "STUDY",
        "targetId": 10,
        "status": "PENDING",
        "createdAt": "2025-01-05T09:00:00.000Z"
      }
    ],
    "userGrowth": [
      {
        "date": "2025-01-01",
        "count": 50
      },
      {
        "date": "2025-01-02",
        "count": 60
      }
    ]
  }
}
```

### 사용자 목록 조회

```
GET /api/v1/admin/users
```

**인증**: 필수  
**권한**: SYSTEM_ADMIN

**쿼리 파라미터**:
```
?page=1
&limit=20
&keyword=홍길동       // 검색
&status=active       // active, suspended
&sort=createdAt      // createdAt, name
```

**응답**:
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "provider": "google",
      "status": "active",
      "_count": {
        "studyGroups": 2,
        "memberships": 5
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1523,
    "totalPages": 77
  }
}
```

### 사용자 정지

```
PATCH /api/v1/admin/users/:userId/suspend
```

**인증**: 필수  
**권한**: SYSTEM_ADMIN

**요청 바디**:
```json
{
  "reason": "스팸 행위",
  "duration": 7
}
```

**응답**:
```json
{
  "data": {
    "id": 1,
    "status": "suspended",
    "suspendedUntil": "2025-01-12T00:00:00.000Z",
    "suspendReason": "스팸 행위"
  }
}
```

### 스터디 목록 조회 (관리자)

```
GET /api/v1/admin/studies
```

**인증**: 필수  
**권한**: SYSTEM_ADMIN

**쿼리 파라미터**:
```
?page=1
&limit=20
&keyword=코딩
&visibility=PUBLIC    // PUBLIC, PRIVATE
&status=active       // active, deleted
```

**응답**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "코딩테스트 스터디",
      "category": "프로그래밍",
      "visibility": "PUBLIC",
      "owner": {
        "id": 1,
        "name": "김철수"
      },
      "_count": {
        "members": 12
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 342,
    "totalPages": 18
  }
}
```

### 스터디 강제 삭제

```
DELETE /api/v1/admin/studies/:studyId
```

**인증**: 필수  
**권한**: SYSTEM_ADMIN

**요청 바디**:
```json
{
  "reason": "스팸 스터디"
}
```

**응답**:
```json
{
  "message": "스터디가 삭제되었습니다.",
  "reason": "스팸 스터디"
}
```

**자동 처리**:
- 스터디 소유자에게 알림 전송
- 모든 멤버에게 알림 전송

---

## 내부 API (Internal)

> 시그널링 서버 → Next.js API 통신 전용

### 메시지 저장 (내부 전용)

```
POST /api/v1/internal/messages
```

**인증**: X-Internal-Key 헤더

**헤더**:
```
X-Internal-Key: <INTERNAL_API_KEY>
```

**요청 바디**:
```json
{
  "content": "안녕하세요!",
  "userId": 1,
  "groupId": 1
}
```

**응답**:
```json
{
  "data": {
    "id": 124,
    "content": "안녕하세요!",
    "userId": 1,
    "groupId": 1,
    "user": {
      "id": 1,
      "name": "김철수",
      "imageUrl": "https://..."
    },
    "createdAt": "2025-01-05T10:05:00.000Z"
  }
}
```

### 알림 전송 (내부 전용)

```
POST /api/v1/internal/notifications
```

**인증**: X-Internal-Key 헤더

**요청 바디**:
```json
{
  "userId": 2,
  "type": "NEW_NOTICE",
  "title": "새 공지사항",
  "message": "코딩테스트 스터디에 새 공지사항이 등록되었습니다.",
  "link": "/studies/1/notices/5"
}
```

**응답**:
```json
{
  "data": {
    "id": 1,
    "type": "NEW_NOTICE",
    "title": "새 공지사항",
    "message": "코딩테스트 스터디에 새 공지사항이 등록되었습니다.",
    "link": "/studies/1/notices/5",
    "isRead": false,
    "userId": 2,
    "createdAt": "2025-01-05T10:00:00.000Z"
  }
}
```

**자동 처리**:
- Redis Pub으로 WebSocket에 전송

---

## 에러 코드

### HTTP 상태 코드

| 코드 | 의미 | 사용 예시 |
|------|------|-----------|
| 200 | OK | 성공적인 GET, PATCH |
| 201 | Created | 성공적인 POST (리소스 생성) |
| 204 | No Content | 성공적인 DELETE |
| 400 | Bad Request | 잘못된 요청 (검증 실패) |
| 401 | Unauthorized | 인증 실패 (로그인 필요) |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 중복 (이미 가입한 스터디 등) |
| 422 | Unprocessable Entity | 비즈니스 로직 오류 |
| 429 | Too Many Requests | Rate Limit 초과 |
| 500 | Internal Server Error | 서버 오류 |

### 커스텀 에러 코드

```json
{
  "error": "정원이 초과되었습니다.",
  "code": "STUDY_FULL",
  "details": {
    "currentMembers": 20,
    "maxMembers": 20
  }
}
```

**주요 에러 코드**:
- `UNAUTHORIZED`: 인증 필요
- `FORBIDDEN`: 권한 없음
- `NOT_FOUND`: 리소스 없음
- `ALREADY_JOINED`: 이미 가입한 스터디
- `STUDY_FULL`: 정원 초과
- `OWNER_CANNOT_LEAVE`: 소유자는 탈퇴 불가
- `FILE_TOO_LARGE`: 파일 크기 초과
- `INVALID_FILE_TYPE`: 허용되지 않는 파일 형식

---

## ? 보안

### 인증 방식
- **NextAuth.js**: JWT 기반 세션
- **Cookie**: `next-auth.session-token` (httpOnly, secure, sameSite)
- **만료 시간**: 30일

### CORS 설정
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://coup.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
```

### Rate Limiting
- **기본**: 100 requests/min per IP
- **인증 API**: 10 requests/min per IP
- **파일 업로드**: 5 requests/min per user

### 입력 검증
- **Zod**: 스키마 기반 검증
- **DOMPurify**: XSS 방어 (Markdown 등)
- **SQL Injection**: Prisma가 자동 방어

---

## ? 성능 최적화

### 캐싱 전략
- **React Query**: 클라이언트 캐싱 (5분 stale time)
- **Redis**: 서버 사이드 캐싱 (선택적)
- **Next.js ISR**: 스터디 목록 페이지 (1분 revalidate)

### 페이지네이션
- **Offset-based**: 기본 (page, limit)
- **Cursor-based**: 채팅 메시지 (무한 스크롤)

### 인덱싱
```sql
-- Prisma 스키마
@@index([userId, groupId])
@@index([groupId, createdAt])
@@index([userId, isRead, createdAt])
```

---

## ? 변경 이력

### v1.0.0 (2025-01-05)
- 초기 API 설계 완료
- 모든 핵심 엔드포인트 정의
- WebSocket 이벤트 구조 정의

---

**문서 작성 완료**: 2025년 11월 5일  
**버전**: 1.0.0  
**다음 단계**: API 구현 시작!
