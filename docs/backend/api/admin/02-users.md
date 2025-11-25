# 관리자 API - 사용자 관리 (Users)
**다음 문서**: [03-studies.md](./03-studies.md)

---

**응답**: Excel 파일 (`users_20251125.xlsx`)
**쿼리 파라미터**: 목록 API와 동일  
#### 11. `GET /api/admin/users/export` - Excel 추출

### 내보내기

---

```
}
  "userIds": ["user-1", "user-2"]
{
```json
**요청 Body**:
#### 10. `DELETE /api/admin/users/bulk/delete` - 일괄 삭제

```
}
  "sendEmail": true
  "details": "스팸 활동",
  "reason": "SPAM",
  "duration": 7,
  "userIds": ["user-1", "user-2"],
{
```json
**요청 Body**:
#### 9. `POST /api/admin/users/bulk/suspend` - 일괄 정지

### 일괄 작업

---

```
}
  "body": "내용"
  "subject": "제목",
  "userIds": ["user-1", "user-2"],
{
```json
**요청 Body**:
#### 8. `POST /api/admin/users/bulk/send-email` - 일괄 이메일

```
}
  "body": "내용"
  "subject": "제목",
{
```json
**요청 Body**:
#### 7. `POST /api/admin/users/:userId/send-email` - 개별 이메일

### 이메일 발송

---

**요청 Body**: 없음
#### 6. `DELETE /api/admin/users/:userId` - 계정 삭제

**요청 Body**: 없음
#### 5. `POST /api/admin/users/:userId/unsuspend` - 정지 해제

```
}
  "sendEmail": true
  "details": "스팸 게시물 반복 작성",
  "reason": "SPAM",
  "duration": 7,
{
```json
**요청 Body**:
#### 4. `POST /api/admin/users/:userId/suspend` - 계정 정지

```
}
  "role": "SYSTEM_ADMIN"
  "name": "김철수",
{
```json
**요청 Body**:
#### 3. `PATCH /api/admin/users/:userId` - 사용자 정보 수정

### 수정

---

```
}
  }
    ]
      }
        "status": "RESOLVED"
        "reportedAt": "2024-11-20T10:00:00Z",
        "type": "SPAM",
        "id": "report-1",
      {
    "reports": [
    ],
      }
        "memberCount": 12
        "role": "OWNER",
        "emoji": "💻",
        "name": "코딩테스트 마스터",
        "id": "study-1",
      {
    "studies": [
    },
      "uploadedFiles": 20
      "createdNotices": 12,
      "completedTasks": 48,
      "adminCount": 1,
      "ownerCount": 2,
      "studyCount": 4,
    "stats": {
    "lastLoginAt": "2024-11-25T08:30:00Z",
    "createdAt": "2024-11-01T09:00:00Z",
    "status": "ACTIVE",
    "role": "USER",
    "provider": "GOOGLE",
    "imageUrl": "/avatars/1.png",
    "email": "kim@example.com",
    "name": "김철수",
    "id": "user-1",
  "data": {
  "success": true,
{
```json
**응답 예시**:
#### 2. `GET /api/admin/users/:userId` - 사용자 상세

```
}
  }
    "totalPages": 124
    "limit": 10,
    "page": 1,
    "total": 1234,
  "pagination": {
  ],
    }
      "isOnline": true
      "lastLoginAt": "2024-11-25T08:30:00Z",
      "createdAt": "2024-11-01T09:00:00Z",
      "status": "ACTIVE",
      "role": "USER",
      "provider": "GOOGLE",
      "imageUrl": "/avatars/1.png",
      "email": "kim@example.com",
      "name": "김철수",
      "id": "user-1",
    {
  "data": [
  "success": true,
{
```json
**응답 예시**:

- `limit`: 페이지당 항목 수 (기본 10)
- `page`: 페이지 번호 (기본 1)
- `role`: USER / SYSTEM_ADMIN
- `provider`: google / github / email
- `search`: 이름 또는 이메일 검색
- `status`: all / active / suspended / deleted
**쿼리 파라미터**:
#### 1. `GET /api/admin/users` - 사용자 목록

### 조회

## API 목록

---

**총 11개 엔드포인트**

사용자 조회, 검색, 관리 (정지, 삭제, 역할 변경) API

## 📊 개요

---

> **권한**: SYSTEM_ADMIN
> **작성일**: 2025-11-25  


