# Chat 영역 Phase 5 - API 테스트 가이드

**목적**: Phase 5에서 개선한 API 엔드포인트를 수동으로 테스트하는 가이드

---

## 🛠️ 준비사항

### 1. 서버 실행
```powershell
cd C:\Project\CoUp\coup
npm run dev
```

### 2. 테스트 도구
- **Postman** 또는 **cURL**
- **브라우저 개발자 도구** (쿠키 확인용)

### 3. 인증 토큰 획득
1. 브라우저에서 `http://localhost:3000` 접속
2. 로그인
3. 개발자 도구 > Application > Cookies
4. `next-auth.session-token` 복사

---

## 📋 테스트 시나리오

### 1. GET /api/studies/[id]/chat - 메시지 조회

#### ✅ 정상 조회
```bash
curl http://localhost:3000/api/studies/YOUR_STUDY_ID/chat?limit=20 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**예상 응답**:
```json
{
  "success": true,
  "data": [...],
  "hasMore": false,
  "nextCursor": null
}
```

**로그 확인**:
```
[Chat Info] Messages fetched successfully
{
  studyId: '...',
  count: 5,
  hasMore: false
}
```

---

#### ❌ 잘못된 limit 파라미터
```bash
curl http://localhost:3000/api/studies/YOUR_STUDY_ID/chat?limit=200 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**예상 응답**: `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_LIMIT",
    "message": "limit은 1-100 사이의 값이어야 합니다"
  }
}
```

**로그 확인**:
```
[Chat Warning] Invalid limit parameter
{
  studyId: '...',
  limit: 200
}
```

---

#### ❌ 권한 없음 (인증 없이)
```bash
curl http://localhost:3000/api/studies/YOUR_STUDY_ID/chat
```

**예상 응답**: `401 Unauthorized`

**로그 확인**:
```
[Chat Warning] Unauthorized access attempt
{
  studyId: '...'
}
```

---

### 2. POST /api/studies/[id]/chat - 메시지 생성

#### ✅ 정상 전송
```bash
curl -X POST http://localhost:3000/api/studies/YOUR_STUDY_ID/chat \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "안녕하세요!"}'
```

**예상 응답**: `201 Created`
```json
{
  "success": true,
  "message": "메시지가 전송되었습니다",
  "data": {
    "id": "...",
    "content": "안녕하세요!",
    "user": {...},
    "createdAt": "..."
  }
}
```

**로그 확인**:
```
[Chat Info] Message created successfully
{
  studyId: '...',
  messageId: '...',
  userId: '...',
  hasFile: false
}
```

---

#### ❌ 빈 메시지 (CHAT-MSG-003)
```bash
curl -X POST http://localhost:3000/api/studies/YOUR_STUDY_ID/chat \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": ""}'
```

**예상 응답**: `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "CHAT-MSG-003",
    "message": "메시지 내용을 입력해주세요"
  }
}
```

**로그 확인**:
```
[Chat Error] CHAT-MSG-003: Empty message content
{
  code: 'CHAT-MSG-003',
  category: 'message',
  studyId: '...',
  userId: '...',
  action: 'send_message',
  retryable: false
}
```

---

#### ❌ 메시지 길이 초과 (CHAT-MSG-004)
```powershell
# PowerShell에서
$longContent = "a" * 2001
curl -X POST http://localhost:3000/api/studies/YOUR_STUDY_ID/chat `
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{`"content`":`"$longContent`"}"
```

**예상 응답**: `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "CHAT-MSG-004",
    "message": "메시지는 2000자 이하여야 합니다"
  }
}
```

---

#### ❌ 스팸 감지 (CHAT-MSG-005)
```bash
# 10초 내 6번 전송
for ($i=1; $i -le 6; $i++) {
  curl -X POST http://localhost:3000/api/studies/YOUR_STUDY_ID/chat `
    -H "Cookie: next-auth.session-token=YOUR_TOKEN" `
    -H "Content-Type: application/json" `
    -d '{"content":"test"}'
}
```

**예상**: 6번째 요청에서 `429 Too Many Requests`
```json
{
  "success": false,
  "error": {
    "code": "CHAT-MSG-005",
    "message": "메시지를 너무 빠르게 전송하고 있습니다"
  }
}
```

**로그 확인**:
```
[Chat Error] CHAT-MSG-005: Spam detected
{
  messageCount: 5,
  timeWindow: 10
}
```

---

#### ❌ XSS 시도 (CHAT-MSG-006)
```bash
curl -X POST http://localhost:3000/api/studies/YOUR_STUDY_ID/chat \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"<script>alert(1)</script>"}'
```

**예상 응답**: `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "CHAT-MSG-006",
    "message": "메시지에 허용되지 않는 콘텐츠가 포함되어 있습니다"
  }
}
```

**추가 로그**:
```
[Security] XSS_ATTEMPT_DETECTED
{
  userId: '...',
  studyId: '...',
  field: 'chat_message',
  threats: ['<script>', '</script>']
}

[Chat Error] CHAT-MSG-006: XSS attack detected
```

---

### 3. PATCH /api/studies/[id]/chat/[messageId] - 메시지 수정

#### ✅ 정상 수정 (본인 메시지)
```bash
curl -X PATCH http://localhost:3000/api/studies/YOUR_STUDY_ID/chat/YOUR_MESSAGE_ID \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"수정된 내용"}'
```

**예상 응답**: `200 OK`
```json
{
  "success": true,
  "message": "메시지가 수정되었습니다",
  "data": {
    "id": "...",
    "content": "수정된 내용",
    "updatedAt": "..."
  }
}
```

**로그 확인**:
```
[Chat Info] Message updated successfully
{
  studyId: '...',
  messageId: '...',
  userId: '...'
}
```

---

#### ❌ 권한 없음 - 다른 사용자 메시지 (CHAT-MSG-008)
```bash
# User B의 토큰으로 User A의 메시지 수정 시도
curl -X PATCH http://localhost:3000/api/studies/YOUR_STUDY_ID/chat/OTHER_USER_MESSAGE_ID \
  -H "Cookie: next-auth.session-token=USER_B_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"해킹 시도"}'
```

**예상 응답**: `403 Forbidden`
```json
{
  "success": false,
  "error": {
    "code": "CHAT-MSG-008",
    "message": "메시지를 수정할 권한이 없습니다"
  }
}
```

**로그 확인**:
```
[Chat Error] CHAT-MSG-008: Unauthorized edit attempt
{
  studyId: '...',
  messageId: '...',
  userId: 'userB',
  ownerId: 'userA'
}
```

---

#### ❌ 존재하지 않는 메시지 (CHAT-MSG-010)
```bash
curl -X PATCH http://localhost:3000/api/studies/YOUR_STUDY_ID/chat/invalid-id \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"test"}'
```

**예상 응답**: `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "CHAT-MSG-010",
    "message": "메시지를 찾을 수 없습니다"
  }
}
```

---

### 4. DELETE /api/studies/[id]/chat/[messageId] - 메시지 삭제

#### ✅ 정상 삭제 (본인 메시지)
```bash
curl -X DELETE http://localhost:3000/api/studies/YOUR_STUDY_ID/chat/YOUR_MESSAGE_ID \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**예상 응답**: `200 OK`
```json
{
  "success": true,
  "message": "메시지가 삭제되었습니다"
}
```

**로그 확인**:
```
[Chat Info] Message deleted successfully
{
  studyId: '...',
  messageId: '...',
  userId: '...',
  deletedBy: 'owner'
}
```

---

#### ✅ 관리자 삭제 (ADMIN/OWNER)
```bash
# 관리자가 다른 사용자 메시지 삭제
curl -X DELETE http://localhost:3000/api/studies/YOUR_STUDY_ID/chat/OTHER_USER_MESSAGE_ID \
  -H "Cookie: next-auth.session-token=ADMIN_TOKEN"
```

**예상 응답**: `200 OK`

**로그 확인**:
```
[Chat Info] Message deleted successfully
{
  studyId: '...',
  messageId: '...',
  userId: 'admin',
  deletedBy: 'admin'  // ← 관리자가 삭제
}
```

---

#### ❌ 권한 없음 - 일반 멤버가 남의 메시지 삭제 (CHAT-MSG-009)
```bash
# 일반 멤버가 다른 사용자 메시지 삭제 시도
curl -X DELETE http://localhost:3000/api/studies/YOUR_STUDY_ID/chat/OTHER_USER_MESSAGE_ID \
  -H "Cookie: next-auth.session-token=MEMBER_TOKEN"
```

**예상 응답**: `403 Forbidden`
```json
{
  "success": false,
  "error": {
    "code": "CHAT-MSG-009",
    "message": "메시지를 삭제할 권한이 없습니다"
  }
}
```

**로그 확인**:
```
[Chat Error] CHAT-MSG-009: Unauthorized delete attempt
{
  studyId: '...',
  messageId: '...',
  userId: 'memberB',
  ownerId: 'memberA',
  userRole: 'MEMBER'
}
```

---

### 5. POST /api/studies/[id]/chat/[messageId]/read - 읽음 처리

#### ✅ 정상 읽음 처리
```bash
curl -X POST http://localhost:3000/api/studies/YOUR_STUDY_ID/chat/MESSAGE_ID/read \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**예상 응답**: `200 OK`
```json
{
  "success": true,
  "message": "메시지를 읽음 처리했습니다",
  "data": {
    "id": "...",
    "readers": ["user1", "user2"]
  }
}
```

**로그 확인**:
```
[Chat Info] Message marked as read
{
  studyId: '...',
  messageId: '...',
  userId: '...'
}
```

---

#### ✅ 중복 읽음 처리 (이미 읽음)
```bash
# 같은 메시지 두 번 읽음 처리
curl -X POST http://localhost:3000/api/studies/YOUR_STUDY_ID/chat/MESSAGE_ID/read \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**예상 응답**: `200 OK`
```json
{
  "success": true,
  "message": "이미 읽음 처리되었습니다"
}
```

**로그 확인**:
```
[Chat Info] Message already marked as read
{
  studyId: '...',
  messageId: '...',
  userId: '...'
}
```

---

## 📊 테스트 체크리스트

### GET /api/studies/[id]/chat
- [ ] ✅ 정상 조회 (limit=20)
- [ ] ❌ 잘못된 limit (200)
- [ ] ❌ 권한 없음 (인증 없이)

### POST /api/studies/[id]/chat
- [ ] ✅ 정상 전송
- [ ] ❌ 빈 메시지 (CHAT-MSG-003)
- [ ] ❌ 길이 초과 (CHAT-MSG-004)
- [ ] ❌ 스팸 감지 (CHAT-MSG-005)
- [ ] ❌ XSS 시도 (CHAT-MSG-006)

### PATCH /api/studies/[id]/chat/[messageId]
- [ ] ✅ 정상 수정 (본인)
- [ ] ❌ 권한 없음 (CHAT-MSG-008)
- [ ] ❌ 메시지 없음 (CHAT-MSG-010)

### DELETE /api/studies/[id]/chat/[messageId]
- [ ] ✅ 정상 삭제 (본인)
- [ ] ✅ 관리자 삭제
- [ ] ❌ 권한 없음 (CHAT-MSG-009)

### POST /api/studies/[id]/chat/[messageId]/read
- [ ] ✅ 정상 읽음 처리
- [ ] ✅ 중복 읽음 처리

**전체**: 15개 시나리오

---

## 🔍 로그 확인 방법

### 개발 모드 (콘솔)
```powershell
# 서버 콘솔에서 실시간 확인
npm run dev
```

**로그 형식**:
```
[Chat Info] ...
[Chat Warning] ...
[Chat Error] CHAT-MSG-XXX: ...
```

### 프로덕션 모드
- 향후 로그 서버로 전송 예정
- 현재는 개발 모드에서만 콘솔 출력

---

## 💡 팁

### 1. Postman Collection 생성
위 시나리오를 Postman Collection으로 저장하면 반복 테스트 편리

### 2. 환경 변수 활용
```
BASE_URL = http://localhost:3000
STUDY_ID = your-study-id
SESSION_TOKEN = your-session-token
```

### 3. 스팸 테스트 주의
스팸 감지 테스트 후 10초 대기 필요 (rate limit 해제)

---

**다음**: [Phase 6 - 통합 테스트](./PHASE6-PLAN.md)

**작성일**: 2025-12-01

