# Postman API 테스트 가이드

## 📋 개요

**Postman Collection**: 6개 파일  
**총 API**: 60+ 엔드포인트  
**베이스 URL**: `http://localhost:3000`

---

## 🚀 시작하기

### 1. 개발 서버 실행

```powershell
cd C:\Project\CoUp\coup
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 2. Seed 데이터 실행

```powershell
npm run db:seed
```

**생성되는 데이터:**
- 사용자 10명
- 스터디 8개
- 공지사항, 일정, 할일 등

### 3. Postman에서 Collection Import

1. Postman 실행
2. **Import** 버튼 클릭
3. 파일 선택:
   - `01-auth.postman_collection.json`
   - `02-users-dashboard.postman_collection.json`
   - `03-study-crud.postman_collection.json`
   - `04-study-members.postman_collection.json`
   - `05-study-content.postman_collection.json`
   - `06-admin.postman_collection.json`

---

## 🔐 인증 방법

### JWT 기반 커스텀 로그인 ✅

CoUp은 **JWT (JSON Web Token) 기반 인증**을 사용합니다. 로그인 후 쿠키에 저장된 JWT 토큰으로 인증됩니다.

#### Step 1: 로그인

**Collection**: `01-auth.postman_collection.json`  
**요청**: `2. 로그인 (커스텀 API)`

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "kim@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "success": true,
  "message": "로그인 성공",
  "user": {
    "id": "...",
    "email": "kim@example.com",
    "name": "김민준",
    "role": "USER",
    "avatar": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Step 2: 쿠키 자동 저장

Postman이 자동으로 `auth-token` 쿠키를 저장합니다 (HttpOnly).

#### Step 3: 이후 모든 요청에 쿠키 자동 포함

로그인 후 같은 도메인(`localhost:3000`)의 모든 요청에 JWT 쿠키가 자동으로 포함됩니다.

#### Step 4: 세션 확인

```http
GET http://localhost:3000/api/auth/me
```

현재 로그인된 사용자 정보를 반환합니다.

---

## 👤 테스트 계정

### Seed 데이터 계정

#### 일반 사용자
```
Email: kim@example.com
Password: password123
역할: USER
참여 스터디: 6개
```

#### 관리자
```
Email: admin@example.com
Password: password123
역할: SYSTEM_ADMIN
```

#### 기타 사용자
```
lee@example.com, park@example.com, choi@example.com 등
모두 Password: password123
```

---

## 📂 Collection 구조

### 1. 인증 API (01-auth)
```
✅ 회원가입
✅ 로그인
✅ 세션 확인
✅ 로그아웃
```

**테스트 순서:**
1. 회원가입 (새 계정)
2. 로그인 (kim@example.com)
3. 세션 확인
4. 로그아웃

---

### 2. 사용자 & 대시보드 (02-users-dashboard)
```
사용자 API:
  ✅ 내 정보 조회
  ✅ 프로필 수정
  ✅ 비밀번호 변경

대시보드 API:
  ✅ 대시보드 데이터
  ✅ 내 스터디 목록

알림 API:
  ✅ 알림 목록
  ✅ 알림 읽음 처리
  ✅ 모든 알림 읽음
```

**테스트 순서:**
1. 대시보드 데이터 (로그인 필요)
2. 내 정보 조회
3. 프로필 수정
4. 내 스터디 목록 (filter: all/owner/admin)
5. 알림 목록

---

### 3. 스터디 CRUD (03-study-crud)
```
✅ 스터디 목록 조회 (공개, 인증 불필요)
✅ 스터디 검색
✅ 스터디 생성 (자동으로 studyId 저장)
✅ 스터디 상세 조회
✅ 스터디 수정 (OWNER만)
✅ 스터디 삭제 (OWNER만)
```

**테스트 순서:**
1. 스터디 목록 조회 (인증 불필요)
2. 스터디 검색 ("알고리즘")
3. **로그인 후:**
4. 스터디 생성 → `studyId` 자동 저장
5. 스터디 상세 조회
6. 스터디 수정
7. 스터디 삭제 (선택)

**변수 사용:**
- `{{studyId}}`: 스터디 생성 시 자동 저장됨

---

### 4. 스터디 멤버 관리 (04-study-members)
```
✅ 스터디 가입 신청
✅ 가입 신청 목록 (ADMIN+)
✅ 가입 승인 (ADMIN+)
✅ 가입 거절 (ADMIN+)
✅ 멤버 목록
✅ 역할 변경 (OWNER만)
✅ 멤버 강퇴 (ADMIN+)
✅ 스터디 탈퇴
```

**테스트 순서:**
1. Seed 데이터 스터디 사용: `studyId = study-1`
2. 스터디 가입 신청
3. **다른 계정으로 로그인** (OWNER/ADMIN)
4. 가입 신청 목록 확인
5. 가입 승인
6. 멤버 목록 조회

**변수:**
- `{{studyId}}`: `study-1` (Seed 데이터)
- `{{targetUserId}}`: 승인/강퇴할 사용자 ID

---

### 5. 스터디 콘텐츠 (05-study-content)
```
공지사항:
  ✅ 목록, 작성 (ADMIN+), 상세, 수정, 고정, 삭제

캘린더:
  ✅ 월별 일정, 생성 (ADMIN+), 수정, 삭제

할일:
  ✅ 목록, 생성, 완료 토글, 수정, 삭제
```

**테스트 순서:**
1. **공지사항**
   - 목록 조회
   - 작성 (ADMIN+) → `noticeId` 저장
   - 상세 조회 (조회수 +1)
   - 고정 토글
   - 삭제

2. **캘린더**
   - 월별 일정 조회 (`?month=2025-11`)
   - 일정 생성 → `eventId` 저장
   - 수정
   - 삭제

3. **할일**
   - 내 할일 목록
   - 할일 생성 → `taskId` 저장
   - 완료 토글
   - 수정
   - 삭제

---

### 6. 관리자 API (06-admin)
```
통계:
  ✅ 관리자 대시보드 통계

사용자 관리:
  ✅ 목록, 상세, 정지, 복구

스터디 관리:
  ✅ 목록, 상세, 삭제

신고 관리:
  ✅ 목록, 상세, 처리
```

**테스트 순서:**
1. **관리자로 로그인** (admin@example.com)
2. 통계 조회
3. 사용자 목록
4. 사용자 정지 (test 계정)
5. 정지 해제
6. 스터디 목록

---

## 🔧 변수 사용법

### Collection 변수

각 Collection에는 자동으로 저장되는 변수가 있습니다:

```javascript
{{baseUrl}}        // http://localhost:3000
{{studyId}}        // 스터디 생성 시 자동 저장
{{noticeId}}       // 공지 작성 시 자동 저장
{{eventId}}        // 일정 생성 시 자동 저장
{{taskId}}         // 할일 생성 시 자동 저장
{{targetUserId}}   // 수동 설정
```

### ⚠️ 동적 파라미터 사용법

일부 API는 URL에 동적 ID가 필요합니다.

#### 방법 1: 수동으로 ID 복사 (권장)

```
1. 먼저 목록 조회 API 실행 (예: GET /api/notifications)
2. 응답에서 실제 ID 복사 (예: clxx123...)
3. URL의 :notificationId를 실제 ID로 교체
4. 전송

예시:
/api/notifications/:notificationId/read
→ /api/notifications/clxx12345abcde/read
```

#### 방법 2: Postman 변수 사용

**Step 1: 목록 조회 후 ID 복사**
```http
GET /api/notifications

응답:
{
  "data": [
    {
      "id": "clxx12345abcde",  // ← 이 ID 복사
      "message": "..."
    }
  ]
}
```

**Step 2: Collection Variables 설정**
1. Collection 클릭
2. Variables 탭
3. `notificationId` 변수에 복사한 ID 입력
4. Save

**Step 3: URL에서 변수 사용**
```
{{baseUrl}}/api/notifications/{{notificationId}}/read
```

### 주의사항

❌ **잘못된 사용:**
```
/api/notifications/알림ID/read  // ← 한글 그대로 사용하면 404 에러!
/api/notifications/:notificationId/read  // ← :notificationId 그대로 사용하면 404!
```

✅ **올바른 사용:**
```
/api/notifications/clxx12345abcde/read  // ← 실제 ID 사용
/api/notifications/{{notificationId}}/read  // ← 변수 사용
```

### 변수 확인 방법

1. Collection 클릭
2. **Variables** 탭
3. Current Value 확인

### 수동으로 변수 설정

Seed 데이터의 ID를 사용하려면:

```javascript
// Variables 탭에서 설정
studyId = study-1
targetUserId = (사용자 ID)
```

---

## 📊 응답 확인

### 성공 응답
```json
{
  "success": true,
  "message": "성공 메시지",
  "data": { /* 데이터 */ }
}
```

### 에러 응답
```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE"
}
```

### 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 필요
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 오류

---

## 🧪 테스트 시나리오

### 시나리오 1: 신규 사용자 플로우
```
1. 회원가입 (Postman 테스터)
2. 로그인
3. 대시보드 확인
4. 스터디 검색
5. 스터디 가입 신청
6. 내 스터디 목록 확인 (PENDING)
```

### 시나리오 2: 스터디 생성 및 관리
```
1. 로그인 (kim@example.com)
2. 스터디 생성
3. 공지 작성
4. 일정 생성
5. 다른 사용자 가입 승인
6. 멤버 역할 변경
```

### 시나리오 3: 관리자 작업
```
1. 로그인 (admin@example.com)
2. 관리자 통계 확인
3. 사용자 목록 조회
4. 문제 사용자 정지
5. 스터디 관리
6. 신고 처리
```

---

## 🐛 트러블슈팅

### 1. 401 Unauthorized
**원인**: 로그인하지 않음  
**해결**: `01-auth` Collection에서 로그인 후 재시도

### 2. 403 Forbidden
**원인**: 권한 부족 (ADMIN+ 필요)  
**해결**: 
- 스터디 OWNER/ADMIN 계정으로 로그인
- 또는 관리자 계정 (admin@example.com) 사용

### 3. 404 Not Found - "알림을 찾을 수 없습니다" / "리소스를 찾을 수 없습니다"
**원인**: 잘못된 ID 또는 리소스 없음  
**해결**:
1. **먼저 목록 조회**: `GET /api/notifications` 실행
2. **실제 ID 복사**: 응답에서 ID 복사 (예: `clxx123...`)
3. **URL 수정**: `:notificationId`를 실제 ID로 교체
4. **재시도**

**잘못된 예:**
```
/api/notifications/알림ID/read  ❌
/api/notifications/:notificationId/read  ❌
```

**올바른 예:**
```
/api/notifications/clxx12345abcde/read  ✅
```

### 4. 404 Not Found (일반)
**원인**: 잘못된 ID 또는 리소스 없음  
**해결**:
- `{{studyId}}` 등 변수 값 확인
- Seed 데이터 재실행 (`npm run db:seed`)
- Prisma Studio로 실제 데이터 확인 (`npm run db:studio`)

### 5. 세션 쿠키 없음
**원인**: 로그아웃 또는 세션 만료  
**해결**: 다시 로그인

### 6. 변수가 undefined
**원인**: 자동 저장 스크립트 미실행  
**해결**: 
- Tests 탭 확인
- 수동으로 Variables 탭에서 설정

---

## 📝 Tips

### 1. Collection Runner 사용
전체 시나리오 자동 테스트:
1. Collection 우클릭
2. **Run collection**
3. 순서대로 실행

### 2. Environment 사용
여러 환경 관리:
```
Dev: http://localhost:3000
Staging: https://staging.coup.com
Prod: https://coup.com
```

### 3. Pre-request Script
자동 로그인:
```javascript
// Collection의 Pre-request Script
if (!pm.cookies.has('next-auth.session-token')) {
  // 자동 로그인 로직
}
```

---

## 📞 문제 해결

1. **서버 로그 확인**: `logs/combined.log`
2. **Prisma Studio**: `npm run db:studio`
3. **데이터베이스 리셋**: `npx prisma migrate reset`

---

**작성일**: 2025-11-18  
**버전**: 1.0.0

