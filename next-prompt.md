# 다음 작업: Chat 도메인 Exception 구현

**작성일**: 2025-12-04  
**최종 업데이트**: 2025-12-04  
**현재 상태**: ✅ Notification 도메인 100% 완료!
**다음 작업**: Chat 도메인 시작

---

## 🎉 Notification 도메인 완료!

### 테스트 결과 (최종)
```
Test Suites: 6 passed, 6 total
Tests:       174 passed, 174 total
Time:        1.122 s
```

### 완료된 테스트 파일
- ✅ **notification-exception.test.js**: 27/27 (100%)
- ✅ **notification-validators.test.js**: 31/31 (100%)
- ✅ **notification-helpers.test.js**: 27/27 (100%)
- ✅ **notifications.test.js**: 33/33 (100%)
- ✅ **notification-actions.test.js**: 28/28 (100%)
- ✅ **notification-read.test.js**: 28/28 (100%)

### Notification 에러 코드 체계 (참고용)
- `NOTI-001` ~ `NOTI-040`: 기본 NotificationException
- `NOTI-VAL-xxx`: NotificationValidationException (유효성 검증)
- `NOTI-PERM-xxx`: NotificationPermissionException (권한)
- `NOTI-BIZ-xxx`: NotificationBusinessException (비즈니스 로직)

---

## 📊 전체 진행 상황

```
Phase A: 도메인별 예외 처리 시스템 구축
├─ A1. Profile 도메인 ✅ 100% (172 테스트)
├─ A2. Study 도메인 ✅ 100% (142 테스트)
├─ A3. Group 도메인 ✅ 100% (114 테스트)
├─ A4. Notification 도메인 ✅ 100% (174 테스트) 🎉
├─ A5. Chat 도메인 ⏳ 0% ← 다음 작업
├─ A6. Dashboard 도메인 ⏳ 0%
├─ A7. Search 도메인 ⏳ 0%
├─ A8. Settings 도메인 ⏳ 0%
├─ A9. Auth 도메인 ⏳ 0%
└─ A10. Admin 도메인 ✅ 100% (61 테스트)

Phase A 전체: 50% 완료 (5/10 도메인 완료, 총 663 테스트)
```

---

## 🎯 다음 작업: Chat 도메인

### Phase A5: Chat 도메인
**예상 시간**: 20-25시간  
**우선순위**: Medium

### 작업 범위
- 50-70개 Exception 메서드
- 8-10개 API 엔드포인트
- 120-140개 테스트 작성
- 100% 테스트 통과 목표

### 참고할 Notification 패턴
1. Helper 함수 mock 필수
2. `params: Promise.resolve({ id: '...' })` 패턴 (Next.js 15)
3. Logger 함수 개별 import
4. `jest.resetAllMocks()` 전역 beforeEach
5. `prisma.$transaction.mockImplementation` 패턴
6. 에러 코드 체계: `CHAT-VAL-xxx`, `CHAT-PERM-xxx`, `CHAT-BIZ-xxx`

---

## 📋 Chat 도메인 구현 순서

### Step 1: 도메인 분석 (2-3시간)
- Prisma 스키마의 Chat 관련 모델 분석 (ChatRoom, ChatMessage, ChatMember 등)
- 기존 채팅 관련 코드 분석
- API 엔드포인트 요구사항 정리
- 예외 케이스 식별 (50-70개)

### Step 2: Exception 클래스 생성 (3-4시간)
```
src/lib/exceptions/chat/
├── ChatException.js (Base)
├── ChatValidationException.js (CHAT-VAL-xxx)
├── ChatPermissionException.js (CHAT-PERM-xxx)
├── ChatBusinessException.js (CHAT-BIZ-xxx)
└── index.js
```

예상 에러 메서드:
- 채팅방 생성/수정/삭제 관련 (15개)
- 멤버 관리 관련 (15개)
- 메시지 송수신 관련 (15개)
- 권한 검증 관련 (15개)
- 기타 비즈니스 로직 (10개)

### Step 3: Validators 구현 (2-3시간)
```
src/lib/validators/chat-validators.js
- validateRoomName
- validateRoomDescription
- validateRoomType
- validateMessageContent
- validateMemberRole
- validateReadStatus
```

### Step 4: Helpers 구현 (2-3시간)
```
src/lib/helpers/chat-helpers.js
- checkRoomMembership
- checkRoomOwnership
- checkRoomPermission
- formatRoomResponse
- formatMessageResponse
- createChatRoom
- addRoomMember
```

### Step 5: API 라우트 구현 (6-8시간)
```
src/app/api/chat/
├── rooms/route.js                    - GET/POST (채팅방 목록, 생성)
├── rooms/[id]/route.js               - GET/PATCH/DELETE (채팅방 상세, 수정, 삭제)
├── rooms/[id]/messages/route.js      - GET/POST (메시지 조회, 전송)
├── rooms/[id]/messages/[msgId]/route.js - DELETE (메시지 삭제)
├── rooms/[id]/members/route.js       - GET/POST/DELETE (멤버 관리)
├── rooms/[id]/read/route.js          - PATCH (읽음 처리)
└── rooms/[id]/leave/route.js         - POST (채팅방 나가기)
```

### Step 6: 테스트 작성 (6-8시간)
```
src/__tests__/exceptions/chat-exception.test.js
src/__tests__/validators/chat-validators.test.js
src/__tests__/helpers/chat-helpers.test.js
src/__tests__/api/chat/
├── chat-rooms.test.js
├── chat-messages.test.js
├── chat-members.test.js
└── chat-actions.test.js
```

목표:
- Exception 테스트 (25-30개)
- Validator 테스트 (20-25개)
- Helper 테스트 (20-25개)
- API 테스트 (50-60개)
- **총 120-140개 테스트, 100% 통과**

---

## 🚀 세션 시작 명령어

```powershell
# 작업 디렉토리
cd C:\Project\CoUp\coup

# Prisma 스키마에서 Chat 관련 모델 확인
Get-Content prisma/schema.prisma | Select-String -Pattern "model (Chat|Message)" -Context 0,20

# 기존 채팅 코드 확인
Get-ChildItem -Recurse -Filter "*chat*" | Select-Object FullName

# 기존 메시지 코드 확인
Get-ChildItem -Recurse -Filter "*message*" | Select-Object FullName
```

---

## 📚 참고 문서

### 완료된 도메인 문서
- `docs/group/GROUP-EXCEPTION-COMPLETE.md`
- `docs/group/GROUP-VALIDATORS-COMPLETE.md`
- `docs/group/GROUP-API-ROUTES-COMPLETE.md`
- `docs/group/GROUP-TEST-COMPLETE-GUIDE.md`

### 참고할 파일 패턴
```
src/lib/exceptions/notification/NotificationException.js      → ChatException.js
src/lib/validators/notification-validators.js                 → chat-validators.js
src/lib/helpers/notification-helpers.js                       → chat-helpers.js
src/__tests__/api/notifications/notifications.test.js         → chat-rooms.test.js
```

---

## 💡 Chat 도메인 특이사항

### 실시간 기능 고려
- WebSocket 연동 고려 (signaling-server 참고)
- 메시지 전송 시 실시간 업데이트
- 읽음 상태 실시간 반영

### 멤버 역할 체계
```javascript
const CHAT_ROLES = {
  OWNER: 'OWNER',      // 채팅방 생성자
  ADMIN: 'ADMIN',      // 관리자 권한
  MEMBER: 'MEMBER'     // 일반 멤버
};
```

### 채팅방 유형
```javascript
const ROOM_TYPES = {
  DIRECT: 'DIRECT',    // 1:1 채팅
  GROUP: 'GROUP',      // 그룹 채팅
  STUDY: 'STUDY'       // 스터디 채팅방
};
```

---

**프롬프트 예시**:
```
Chat 도메인 구현을 시작해줘.

Notification 도메인이 100% 완료되었고 (174/174 테스트 통과), 
이제 Chat 도메인을 같은 패턴으로 구현해야 해.

작업 순서:
1. Prisma 스키마의 Chat 관련 모델 분석
2. ChatException 클래스 생성 (ChatValidationException, ChatPermissionException, ChatBusinessException)
3. chat-validators.js 구현
4. chat-helpers.js 구현
5. API 라우트 구현
6. 테스트 작성

Step 1부터 시작해줘!
```

---

**작성일**: 2025-12-04  
**상태**: Chat 도메인 준비 완료
