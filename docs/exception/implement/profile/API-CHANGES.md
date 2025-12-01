# API 변경 사항 요약 (Phase 3)

**프로젝트**: CoUp Profile API  
**업데이트 날짜**: 2025-12-01  
**버전**: 2.0 (Exception Handling Enhanced)

---

## 🎯 변경 개요

Profile 관련 모든 API 엔드포인트에 표준화된 예외 처리, 검증, 로깅 시스템을 적용했습니다.

---

## 📋 API 엔드포인트 목록

### 1. 프로필 조회
```
GET /api/users/me
```

**변경 사항**:
- ✅ 계정 상태 검증 추가 (DELETED, SUSPENDED)
- ✅ 표준화된 에러 응답
- ✅ 로깅 추가

**응답**:
```json
// 성공
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar": "string | null",
    "bio": "string | null",
    "role": "USER | ADMIN",
    "status": "ACTIVE | DELETED | SUSPENDED",
    "createdAt": "datetime",
    "lastLoginAt": "datetime",
    "stats": {
      "studyCount": 0,
      "taskCount": 0,
      "unreadNotifications": 0
    }
  }
}

// 에러
{
  "success": false,
  "error": {
    "code": "PROFILE-015",
    "message": "프로필을 찾을 수 없습니다",
    "retryable": false,
    "timestamp": "2025-12-01T10:00:00.000Z"
  }
}
```

**가능한 에러 코드**:
- `PROFILE-015`: 프로필을 찾을 수 없습니다 (404)
- `PROFILE-019`: 삭제된 계정입니다 (410)
- `PROFILE-018`: 정지된 계정입니다 (403)
- `PROFILE-020`: 프로필 조회에 실패했습니다 (500)

---

### 2. 프로필 수정
```
PATCH /api/users/me
```

**변경 사항**:
- ✅ 이름 검증 강화 (2-50자, 특수문자 제한)
- ✅ 바이오 검증 추가 (최대 200자)
- ✅ XSS/SQL Injection 검사 추가
- ✅ 보안 이벤트 로깅
- ✅ 업데이트 로깅

**요청 본문**:
```json
{
  "name": "string (optional, 2-50자)",
  "bio": "string | null (optional, 최대 200자)",
  "avatar": "string | null (optional, URL 형식)"
}
```

**응답**:
```json
// 성공
{
  "success": true,
  "message": "프로필이 업데이트되었습니다",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar": "string | null",
    "bio": "string | null"
  }
}
```

**가능한 에러 코드**:
- `PROFILE-001`: 필수 항목이 누락되었습니다 (400)
- `PROFILE-002`: 이름 형식이 올바르지 않습니다 (400)
- `PROFILE-003`: 이름은 2자 이상이어야 합니다 (400)
- `PROFILE-004`: 이름은 50자 이하여야 합니다 (400)
- `PROFILE-005`: 자기소개는 200자 이하여야 합니다 (400)
- `PROFILE-012`: 보안상 문제가 있는 입력입니다 (XSS) (400)
- `PROFILE-013`: 보안상 문제가 있는 입력입니다 (SQL Injection) (400)
- `PROFILE-034`: 아바타 URL이 올바르지 않습니다 (400)
- `PROFILE-014`: 프로필 업데이트에 실패했습니다 (500)

**검증 규칙**:
```javascript
name:
  - 2-50자
  - 한글, 영문, 숫자, 공백만 허용
  - 특수문자 일부 허용: .-_
  - XSS/SQL Injection 패턴 차단

bio:
  - 최대 200자
  - XSS/SQL Injection 패턴 차단
  - null 또는 빈 문자열 허용

avatar:
  - 유효한 URL 형식
  - null 허용
```

---

### 3. 아바타 업로드
```
POST /api/users/avatar
```

**변경 사항**:
- ✅ 신규 API 생성
- ✅ 파일 검증 (크기, 형식)
- ✅ 이전 아바타 자동 삭제
- ✅ 업로드 로깅

**요청 본문** (multipart/form-data):
```
file: File (이미지 파일)
```

**응답**:
```json
{
  "success": true,
  "message": "아바타가 업로드되었습니다",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar": "/uploads/avatars/{userId}_{timestamp}_{filename}",
    "bio": "string | null"
  }
}
```

**가능한 에러 코드**:
- `PROFILE-021`: 파일이 제공되지 않았습니다 (400)
- `PROFILE-022`: 파일 크기는 5MB 이하여야 합니다 (413)
- `PROFILE-023`: JPG, PNG, GIF, WebP 형식만 지원합니다 (400)
- `PROFILE-024`: 올바른 이미지 형식이 아닙니다 (400)
- `PROFILE-026`: 파일 업로드에 실패했습니다 (500)

**파일 요구사항**:
```
크기: 최대 5MB
형식: image/jpeg, image/png, image/gif, image/webp
저장 위치: /public/uploads/avatars/
```

---

### 4. 아바타 삭제
```
DELETE /api/users/avatar
```

**변경 사항**:
- ✅ 신규 API 생성
- ✅ 파일 시스템에서 삭제
- ✅ 기본 아바타로 복구

**응답**:
```json
{
  "success": true,
  "message": "아바타가 삭제되었습니다",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar": null,
    "bio": "string | null"
  }
}
```

**가능한 에러 코드**:
- `PROFILE-015`: 프로필을 찾을 수 없습니다 (404)
- `PROFILE-032`: 아바타를 찾을 수 없습니다 (404)
- `PROFILE-030`: 아바타 삭제에 실패했습니다 (500)

**참고**:
- 기본 아바타 (null)인 경우 삭제 불가
- `/uploads/avatars/` 경로의 커스텀 업로드만 삭제 가능

---

### 5. 비밀번호 변경
```
PATCH /api/users/me/password
```

**변경 사항**:
- ✅ 비밀번호 강도 검증 강화
- ✅ 이전 비밀번호와 동일 여부 확인
- ✅ 비밀번호 일치 확인
- ✅ bcrypt 라운드 증가 (10 → 12)
- ✅ 변경 로깅 (IP 포함)

**요청 본문**:
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, 8자 이상)",
  "confirmPassword": "string (optional)"
}
```

**응답**:
```json
{
  "success": true,
  "message": "비밀번호가 변경되었습니다"
}
```

**가능한 에러 코드**:
- `PROFILE-055`: 비밀번호를 입력해주세요 (400)
- `PROFILE-056`: 비밀번호가 너무 약합니다 (400)
- `PROFILE-057`: 현재 비밀번호가 일치하지 않습니다 (400)
- `PROFILE-060`: 새 비밀번호가 현재 비밀번호와 같습니다 (400)
- `PROFILE-061`: 비밀번호가 일치하지 않습니다 (400)
- `PROFILE-059`: 비밀번호 변경에 실패했습니다 (500)

**비밀번호 요구사항**:
```
최소 8자 이상
대문자 1개 이상
소문자 1개 이상
숫자 1개 이상
특수문자 1개 이상 (!@#$%^&*()_+-=[]{}|;:,.<>?)
```

**보안 강화**:
- bcrypt 해싱 (라운드 12)
- 현재 비밀번호 확인 필수
- 이전 비밀번호 재사용 방지
- IP 주소 로깅

---

### 6. 계정 삭제
```
DELETE /api/users/me
```

**변경 사항**:
- ✅ 삭제 확인 검증 추가
- ✅ OWNER 스터디 확인
- ✅ 소프트 삭제 구현
- ✅ 이메일 중복 방지

**요청 본문**:
```json
{
  "confirmation": "string (사용자 이메일 또는 'DELETE')"
}
```

**응답**:
```json
{
  "success": true,
  "message": "계정이 삭제되었습니다"
}
```

**가능한 에러 코드**:
- `PROFILE-001`: 필수 항목이 누락되었습니다 (400)
- `PROFILE-067`: 삭제 확인이 일치하지 않습니다 (400)
- `PROFILE-064`: OWNER 권한의 스터디가 있습니다 (403)
- `PROFILE-069`: 계정 삭제에 실패했습니다 (500)

**삭제 프로세스**:
1. 삭제 확인 입력 검증
2. OWNER 스터디 존재 여부 확인
3. 소프트 삭제 실행:
   ```javascript
   {
     status: 'DELETED',
     email: `deleted_{userId}_{timestamp}@deleted.com`,
     name: '[삭제된 사용자]',
     bio: null,
     avatar: null
   }
   ```

**안전장치**:
- OWNER인 스터디가 하나라도 있으면 삭제 불가
- 명시적인 확인 입력 필요
- 실제 데이터는 삭제하지 않음 (복구 가능)

---

## 🔒 공통 보안 기능

### 1. 인증 확인
모든 API는 `requireAuth` 미들웨어를 통해 인증 확인:
```javascript
const session = await requireAuth()
if (session instanceof NextResponse) return session
```

### 2. XSS 방어
```javascript
// 입력 필드 검사
checkXSS(input) // <script>, onerror 등 차단
```

### 3. SQL Injection 방어
```javascript
// 입력 필드 검사
checkSQLInjection(input) // SELECT, DROP 등 차단
```

### 4. 로깅
모든 중요 작업과 에러가 로깅됨:
- 프로필 조회/수정
- 아바타 업로드/삭제
- 비밀번호 변경
- 계정 삭제
- 보안 이벤트

---

## 📊 에러 코드 전체 목록

### 인증/권한 (PROFILE-015 ~ PROFILE-020)
- `PROFILE-015`: 프로필을 찾을 수 없습니다 (404)
- `PROFILE-016`: 프로필에 접근할 권한이 없습니다 (403)
- `PROFILE-018`: 정지된 계정입니다 (403)
- `PROFILE-019`: 삭제된 계정입니다 (410)
- `PROFILE-020`: 프로필 조회에 실패했습니다 (500)

### 프로필 정보 (PROFILE-001 ~ PROFILE-014)
- `PROFILE-001`: 필수 항목이 누락되었습니다 (400)
- `PROFILE-002`: 이름 형식이 올바르지 않습니다 (400)
- `PROFILE-003`: 이름은 2자 이상이어야 합니다 (400)
- `PROFILE-004`: 이름은 50자 이하여야 합니다 (400)
- `PROFILE-005`: 자기소개는 200자 이하여야 합니다 (400)
- `PROFILE-012`: 보안상 문제가 있는 입력입니다 (XSS) (400)
- `PROFILE-013`: 보안상 문제가 있는 입력입니다 (SQL Injection) (400)
- `PROFILE-014`: 프로필 업데이트에 실패했습니다 (500)

### 아바타 (PROFILE-021 ~ PROFILE-034)
- `PROFILE-021`: 파일이 제공되지 않았습니다 (400)
- `PROFILE-022`: 파일 크기는 5MB 이하여야 합니다 (413)
- `PROFILE-023`: JPG, PNG, GIF, WebP 형식만 지원합니다 (400)
- `PROFILE-024`: 올바른 이미지 형식이 아닙니다 (400)
- `PROFILE-026`: 파일 업로드에 실패했습니다 (500)
- `PROFILE-030`: 아바타 삭제에 실패했습니다 (500)
- `PROFILE-032`: 아바타를 찾을 수 없습니다 (404)
- `PROFILE-034`: 아바타 URL이 올바르지 않습니다 (400)

### 비밀번호 (PROFILE-055 ~ PROFILE-061)
- `PROFILE-055`: 비밀번호를 입력해주세요 (400)
- `PROFILE-056`: 비밀번호가 너무 약합니다 (400)
- `PROFILE-057`: 현재 비밀번호가 일치하지 않습니다 (400)
- `PROFILE-059`: 비밀번호 변경에 실패했습니다 (500)
- `PROFILE-060`: 새 비밀번호가 현재 비밀번호와 같습니다 (400)
- `PROFILE-061`: 비밀번호가 일치하지 않습니다 (400)

### 계정 삭제 (PROFILE-064, PROFILE-067, PROFILE-069)
- `PROFILE-064`: OWNER 권한의 스터디가 있습니다 (403)
- `PROFILE-067`: 삭제 확인이 일치하지 않습니다 (400)
- `PROFILE-069`: 계정 삭제에 실패했습니다 (500)

---

## 🎨 프론트엔드 통합 가이드

### 1. 에러 처리
```javascript
try {
  const response = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '홍길동' })
  })
  
  const data = await response.json()
  
  if (!data.success) {
    // 에러 처리
    switch (data.error.code) {
      case 'PROFILE-003':
        // 이름이 너무 짧음
        break
      case 'PROFILE-012':
        // XSS 감지
        break
      // ...
    }
  }
} catch (error) {
  // 네트워크 에러
}
```

### 2. 아바타 업로드
```javascript
const formData = new FormData()
formData.append('file', file)

const response = await fetch('/api/users/avatar', {
  method: 'POST',
  body: formData
})
```

### 3. 비밀번호 변경
```javascript
const response = await fetch('/api/users/me/password', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    currentPassword: 'oldPass123!',
    newPassword: 'NewPass123!',
    confirmPassword: 'NewPass123!'
  })
})
```

### 4. 계정 삭제
```javascript
const response = await fetch('/api/users/me', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    confirmation: userEmail
  })
})
```

---

## 🔄 마이그레이션 가이드

### 기존 코드에서 변경 필요 사항

#### 1. 에러 응답 형식 변경
```javascript
// 이전
{
  "error": "사용자를 찾을 수 없습니다"
}

// 현재
{
  "success": false,
  "error": {
    "code": "PROFILE-015",
    "message": "프로필을 찾을 수 없습니다",
    "retryable": false,
    "timestamp": "2025-12-01T10:00:00.000Z"
  }
}
```

#### 2. 성공 응답 형식 변경
```javascript
// 이전
{
  "user": { ... }
}

// 현재
{
  "success": true,
  "user": { ... }
}
```

#### 3. 아바타 API 경로 변경
```javascript
// 이전: 없음 (구현되지 않음)
// 현재
POST /api/users/avatar
DELETE /api/users/avatar
```

---

## 📝 참고 사항

### 1. 재시도 가능 여부
모든 에러 응답에 `retryable` 필드 포함:
- `true`: 일시적 문제, 재시도 가능 (500번대 에러)
- `false`: 영구적 문제, 입력 수정 필요 (400번대 에러)

### 2. 타임스탬프
모든 에러에 서버 타임스탬프 포함 (디버깅 및 로그 추적용)

### 3. 로깅
모든 요청이 서버 로그에 기록됨:
- 성공: INFO 레벨
- 에러: ERROR 레벨
- 보안 이벤트: SECURITY 레벨

---

**문서 버전**: 2.0  
**최종 업데이트**: 2025-12-01  
**작성자**: CoUp Team

