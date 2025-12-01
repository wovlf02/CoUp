# Chat 영역 예외 처리 구현 - Phase 5: 서버 예외 처리 및 최종 검증

**작성일**: 2025-12-01  
**작업 시간**: 2시간 (완료)  
**상태**: ✅ 완료

---

## 📋 완료 항목

### 5.1 API 라우트 예외 처리 (4개 파일 개선) ✅

#### ✅ 1. 메시지 조회/생성 API (2시간)

**파일**: `coup/src/app/api/studies/[id]/chat/route.js`

**변경 사항**:
```javascript
// Before: 기본 에러 처리
catch (error) {
  console.error('Get messages error:', error)
  return NextResponse.json({ error: "..." }, { status: 500 })
}

// After: Chat 예외 처리
import { ChatMessageException } from "@/lib/exceptions/chat"
import { logChatError, logChatInfo, logChatWarning } from "@/lib/utils/chat/errorLogger"

catch (error) {
  logChatError(error, { studyId, action: 'fetch_messages' })
  
  if (error instanceof ChatMessageException) {
    return NextResponse.json({
      success: false,
      error: {
        code: error.code,
        message: error.userMessage
      }
    }, { status: error.statusCode || 500 })
  }
  
  return NextResponse.json({
    success: false,
    error: { code: 'FETCH_MESSAGES_FAILED', message: "..." }
  }, { status: 500 })
}
```

**GET 엔드포인트 개선**:
- ✅ 권한 검증 로깅
- ✅ limit 파라미터 검증 (1-100)
- ✅ 성공 로깅 (메시지 수, hasMore)
- ✅ ChatMessageException 처리
- ✅ 에러 응답 표준화 (success, error.code, error.message)

**POST 엔드포인트 개선**:
- ✅ `ChatMessageException.emptyContent()` 사용
- ✅ `ChatMessageException.xssDetected()` 사용
- ✅ `ChatMessageException.contentTooLong()` 사용
- ✅ `ChatMessageException.spamDetected()` 사용
- ✅ 모든 검증 단계 로깅 (info/warning)
- ✅ 성공 시 상세 로깅 (메시지ID, 파일 여부)

**추가된 기능**:
- 스팸 감지 컨텍스트 추가 (messageCount, timeWindow)
- 알림 생성 전 null 체크
- 에러 코드 체계 적용

---

#### ✅ 2. 메시지 수정/삭제 API

**파일**: `coup/src/app/api/studies/[id]/chat/[messageId]/route.js`

**PATCH 엔드포인트 개선**:
- ✅ `ChatMessageException.emptyContent()` 사용
- ✅ `ChatMessageException.notFound()` 사용
- ✅ `ChatMessageException.unauthorizedEdit()` 사용
- ✅ `ChatMessageException.contentTooLong()` 검증 추가
- ✅ 성공 로깅

**DELETE 엔드포인트 개선**:
- ✅ `ChatMessageException.notFound()` 사용
- ✅ `ChatMessageException.unauthorizedDelete()` 사용
- ✅ 삭제 주체 로깅 (owner/admin)
- ✅ 권한 정보 컨텍스트 추가

**권한 검증 강화**:
```javascript
// 수정: 작성자만
if (message.userId !== session.user.id) {
  throw ChatMessageException.unauthorizedEdit({
    studyId, messageId, userId, ownerId, userRole
  })
}

// 삭제: 작성자 또는 ADMIN/OWNER
const canDelete = message.userId === session.user.id ||
                  ['OWNER', 'ADMIN'].includes(member.role)

if (!canDelete) {
  throw ChatMessageException.unauthorizedDelete({ ... })
}
```

---

#### ✅ 3. 메시지 읽음 처리 API

**파일**: `coup/src/app/api/studies/[id]/chat/[messageId]/read/route.js`

**POST 엔드포인트 개선**:
- ✅ `ChatMessageException.notFound()` 사용
- ✅ `ChatSyncException` import 추가 (향후 사용)
- ✅ 이미 읽음 처리된 경우 로깅
- ✅ 성공 로깅

**추가 검증**:
```javascript
// studyId 일치 여부 확인
if (!message || message.studyId !== studyId) {
  throw ChatMessageException.notFound(messageId, { studyId, userId })
}

// 중복 읽음 처리 방지
if (message.readers.includes(session.user.id)) {
  logChatInfo('Message already marked as read', { ... })
  return NextResponse.json({ success: true, ... })
}
```

---

### 5.2 에러 응답 표준화 ✅

모든 API 응답이 다음 형식을 따름:

**성공 응답**:
```json
{
  "success": true,
  "data": { ... },
  "message": "..."  // optional
}
```

**에러 응답**:
```json
{
  "success": false,
  "error": {
    "code": "CHAT-MSG-001",
    "message": "사용자 친화적 메시지"
  }
}
```

---

## 📊 개선된 파일 통계

| 파일 | 변경 전 | 변경 후 | 증가 | 주요 개선 |
|------|---------|---------|------|----------|
| `chat/route.js` | 231줄 | 304줄 | +73줄 (+31%) | Exception 사용, 로깅 추가 |
| `[messageId]/route.js` | 143줄 | 204줄 | +61줄 (+42%) | Exception 사용, 권한 강화 |
| `read/route.js` | 55줄 | 88줄 | +33줄 (+60%) | Exception 사용, 중복 방지 |
| **합계** | **429줄** | **596줄** | **+167줄** | **(+39%)** |

---

## 🎯 적용된 예외 처리 패턴

### 1. ChatMessageException 사용

| 메서드 | 사용 위치 | 목적 |
|--------|----------|------|
| `emptyContent()` | POST, PATCH | 빈 메시지 검증 |
| `contentTooLong()` | POST, PATCH | 길이 제한 |
| `spamDetected()` | POST | 스팸 방지 |
| `xssDetected()` | POST | XSS 방지 |
| `notFound()` | PATCH, DELETE, READ | 메시지 존재 확인 |
| `unauthorizedEdit()` | PATCH | 수정 권한 |
| `unauthorizedDelete()` | DELETE | 삭제 권한 |

### 2. 로깅 전략

| 로그 레벨 | 사용 사례 | 예시 |
|-----------|----------|------|
| `logChatInfo` | 성공 작업 | 메시지 생성, 수정, 삭제, 조회 |
| `logChatWarning` | 권한 없음, 잘못된 입력 | Unauthorized, Invalid limit |
| `logChatError` | 예외 발생 | catch 블록 |

**로그 컨텍스트**:
```javascript
logChatInfo('Message created successfully', {
  studyId,
  messageId: message.id,
  userId: session.user.id,
  hasFile: !!sanitizedData.fileId
})

logChatError(error, {
  studyId,
  messageId,
  action: 'update_message'  // 작업 식별
})
```

### 3. 에러 핸들링 계층

```
1. 입력 검증 → ChatMessageException
2. 권한 검증 → ChatMessageException
3. 비즈니스 로직 → ChatMessageException
4. DB 오류 → 일반 에러 (catch)
5. 알 수 없는 에러 → 일반 에러 (catch)
```

---

## 🔍 테스트 시나리오

### API 테스트 (수동)

#### 1. GET /api/studies/[id]/chat
```bash
# 정상 조회
curl http://localhost:3000/api/studies/study1/chat?limit=20

# 잘못된 limit (경고)
curl http://localhost:3000/api/studies/study1/chat?limit=200
# → 400: INVALID_LIMIT

# 권한 없음 (경고)
curl http://localhost:3000/api/studies/study1/chat
# → 401/403
```

#### 2. POST /api/studies/[id]/chat
```bash
# 빈 메시지
curl -X POST ... -d '{"content": ""}'
# → 400: CHAT-MSG-003

# 너무 긴 메시지
curl -X POST ... -d '{"content": "a".repeat(2001)}'
# → 400: CHAT-MSG-004

# 스팸 (10초에 5개 이상)
for i in {1..6}; do curl -X POST ... -d '{"content": "test"}'; done
# → 429: CHAT-MSG-005

# XSS 시도
curl -X POST ... -d '{"content": "<script>alert(1)</script>"}'
# → 400: CHAT-MSG-006
```

#### 3. PATCH /api/studies/[id]/chat/[messageId]
```bash
# 다른 사용자 메시지 수정
curl -X PATCH .../message1 -d '{"content": "hack"}'
# → 403: CHAT-MSG-008

# 없는 메시지
curl -X PATCH .../invalid-id -d '{"content": "test"}'
# → 404: CHAT-MSG-010
```

#### 4. DELETE /api/studies/[id]/chat/[messageId]
```bash
# 권한 없음 (일반 멤버가 남의 메시지 삭제)
curl -X DELETE .../message1
# → 403: CHAT-MSG-009

# 관리자 삭제 (성공)
curl -X DELETE .../message1
# → 200: success (로그에 deletedBy: 'admin')
```

#### 5. POST /api/studies/[id]/chat/[messageId]/read
```bash
# 정상 읽음 처리
curl -X POST .../message1/read
# → 200: success

# 중복 읽음 처리
curl -X POST .../message1/read
# → 200: "이미 읽음 처리되었습니다" (로그만)
```

---

## 📝 로그 예시

### 성공 로그
```
[Chat Info] Messages fetched successfully
{
  timestamp: '2025-12-01T10:30:00.000Z',
  level: 'INFO',
  category: 'chat',
  studyId: 'study1',
  count: 20,
  hasMore: true
}

[Chat Info] Message created successfully
{
  timestamp: '2025-12-01T10:31:00.000Z',
  level: 'INFO',
  category: 'chat',
  studyId: 'study1',
  messageId: 'msg1',
  userId: 'user1',
  hasFile: false
}
```

### 경고 로그
```
[Chat Warning] Unauthorized access attempt
{
  timestamp: '2025-12-01T10:32:00.000Z',
  level: 'WARN',
  category: 'chat',
  studyId: 'study1'
}

[Chat Warning] Invalid limit parameter
{
  timestamp: '2025-12-01T10:33:00.000Z',
  level: 'WARN',
  category: 'chat',
  studyId: 'study1',
  limit: 200
}
```

### 에러 로그
```
[Chat Error] CHAT-MSG-003: Empty message content
{
  timestamp: '2025-12-01T10:34:00.000Z',
  level: 'ERROR',
  code: 'CHAT-MSG-003',
  category: 'message',
  message: 'Message content is empty or whitespace only',
  context: {
    studyId: 'study1',
    userId: 'user1',
    action: 'send_message'
  },
  retryable: false
}
```

---

## ✅ 검증 체크리스트

### API 라우트
- [x] ChatMessageException import
- [x] logChatError, logChatInfo, logChatWarning import
- [x] 모든 검증에 예외 사용
- [x] try-catch 블록에서 예외 처리
- [x] 에러 응답 표준화
- [x] 성공 로깅
- [x] 에러 로깅 (컨텍스트 포함)

### 에러 코드 사용
- [x] CHAT-MSG-003: emptyContent
- [x] CHAT-MSG-004: contentTooLong
- [x] CHAT-MSG-005: spamDetected
- [x] CHAT-MSG-006: xssDetected
- [x] CHAT-MSG-008: unauthorizedEdit
- [x] CHAT-MSG-009: unauthorizedDelete
- [x] CHAT-MSG-010: notFound

### 로깅
- [x] GET: 성공 로깅 (count, hasMore)
- [x] POST: 성공 로깅 (messageId, hasFile)
- [x] PATCH: 성공 로깅
- [x] DELETE: 성공 로깅 (deletedBy)
- [x] READ: 성공 로깅, 중복 로깅
- [x] 모든 catch: 에러 로깅 (action)

### 응답 형식
- [x] 성공: `{ success: true, data, message }`
- [x] 에러: `{ success: false, error: { code, message } }`
- [x] HTTP 상태 코드 일관성
- [x] ChatException statusCode 반영

---

## 🚀 다음 단계

### Phase 6: 통합 테스트 및 문서화 (4시간)

1. **통합 테스트** (2시간)
   - [ ] Socket + API 통합 테스트
   - [ ] 낙관적 업데이트 테스트
   - [ ] 재연결 시나리오 테스트
   - [ ] 에러 복구 테스트

2. **성능 테스트** (1시간)
   - [ ] 동시 메시지 전송
   - [ ] 대량 메시지 조회
   - [ ] 메모리 누수 확인

3. **최종 문서화** (1시간)
   - [ ] API 문서 업데이트
   - [ ] 에러 코드 가이드
   - [ ] 트러블슈팅 가이드
   - [ ] Phase 5 완료 보고서

---

## 📚 참조

- Phase 1: [PHASE1-COMPLETE.md](./PHASE1-COMPLETE.md) - 분석 및 계획
- Phase 2: [PHASE2-COMPLETE.md](./PHASE2-COMPLETE.md) - 예외 클래스/유틸리티
- Phase 3: [PHASE3-COMPLETE.md](./PHASE3-COMPLETE.md) - Socket 연결 예외 처리
- Phase 4: [PHASE4-COMPLETE.md](./PHASE4-COMPLETE.md) - 컴포넌트 레벨 예외 처리
- 예외 문서: [02-message-exceptions.md](../../chat/02-message-exceptions.md)

---

**작성자**: GitHub Copilot  
**완료일**: 2025-12-01

