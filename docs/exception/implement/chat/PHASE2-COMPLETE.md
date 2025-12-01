# Chat 영역 예외 처리 구현 - Phase 2: 예외 클래스 및 유틸리티

**작성일**: 2025-12-01  
**작업 시간**: 4시간 (완료)  
**상태**: ✅ 완료

---

## 📋 완료 항목

### 1. 예외 클래스 생성 (7개 파일)

#### ✅ 1.1 기본 예외 클래스
**파일**: `lib/exceptions/chat/ChatException.js`

**주요 기능**:
- 기본 에러 정보 관리 (코드, 메시지, 컨텍스트)
- JSON 직렬화
- 로깅용 포맷
- 사용자/개발자 메시지 분리

#### ✅ 1.2 연결 예외 클래스
**파일**: `lib/exceptions/chat/ConnectionException.js`

**에러 코드**: `CHAT-CONN-001` ~ `CHAT-CONN-006`

**정적 메서드**:
- `serverUnreachable()` - 서버 연결 불가
- `timeout()` - 연결 타임아웃
- `authenticationFailed()` - 인증 실패
- `reconnectionFailed(attempts)` - 재연결 실패
- `transportUpgradeFailed()` - WebSocket 업그레이드 실패
- `networkOffline()` - 네트워크 오프라인

#### ✅ 1.3 메시지 예외 클래스
**파일**: `lib/exceptions/chat/MessageException.js`

**에러 코드**: `CHAT-MSG-001` ~ `CHAT-MSG-012`

**정적 메서드**:
- `sendFailedNetwork()` - 메시지 전송 실패 (네트워크)
- `sendFailedServer()` - 메시지 전송 실패 (서버)
- `emptyContent()` - 빈 메시지
- `contentTooLong(length, maxLength)` - 메시지 길이 초과
- `spamDetected(count, timeWindow)` - 스팸 감지
- `xssDetected(threats)` - XSS 시도 감지
- `fetchFailed()` - 메시지 조회 실패
- `unauthorizedEdit()` - 수정 권한 없음
- `unauthorizedDelete()` - 삭제 권한 없음
- `notFound(messageId)` - 메시지 없음
- `duplicate(messageId)` - 중복 메시지
- `orderInconsistency()` - 순서 불일치

#### ✅ 1.4 동기화 예외 클래스
**파일**: `lib/exceptions/chat/SyncException.js`

**에러 코드**: `CHAT-SYNC-001` ~ `CHAT-SYNC-006`

**정적 메서드**:
- `optimisticUpdateFailed(tempId)` - 낙관적 업데이트 실패
- `orderMismatch()` - 메시지 순서 불일치
- `markAsReadFailed(messageId)` - 읽음 처리 실패
- `typingSyncFailed()` - 타이핑 상태 동기화 실패
- `reconnectSyncFailed()` - 재연결 후 동기화 실패
- `eventLost(eventType)` - Socket 이벤트 손실

#### ✅ 1.5 파일 예외 클래스
**파일**: `lib/exceptions/chat/FileException.js`

**에러 코드**: `CHAT-FILE-001` ~ `CHAT-FILE-006`

**정적 메서드**:
- `uploadFailed(fileName)` - 파일 업로드 실패
- `sizeLimitExceeded(fileSize, maxSize)` - 파일 크기 초과
- `unsupportedType(fileType, allowedTypes)` - 파일 형식 불가
- `downloadFailed(fileName)` - 파일 다운로드 실패
- `previewFailed(fileName)` - 파일 미리보기 실패
- `notFound(fileId)` - 파일 없음

#### ✅ 1.6 UI 예외 클래스
**파일**: `lib/exceptions/chat/UIException.js`

**에러 코드**: `CHAT-UI-001` ~ `CHAT-UI-005`

**정적 메서드**:
- `autoScrollFailed()` - 자동 스크롤 실패
- `infiniteScrollFailed()` - 무한 스크롤 실패
- `typingIndicatorError()` - 타이핑 인디케이터 오류
- `inputStateError()` - 입력 상태 오류
- `readReceiptError()` - 읽음 표시 오류

#### ✅ 1.7 예외 클래스 통합 Export
**파일**: `lib/exceptions/chat/index.js`

모든 예외 클래스를 한 곳에서 import 가능

---

### 2. 유틸리티 파일 생성 (4개 파일)

#### ✅ 2.1 에러 메시지 정의
**파일**: `lib/utils/chat/errorMessages.js`

**주요 기능**:
- 전체 에러 코드 메시지 매핑 (40개)
- `getUserMessage(code)` - 사용자 메시지 반환
- `getDeveloperMessage(code)` - 개발자 메시지 반환
- `isRetryable(code)` - 재시도 가능 여부 판단

**에러 코드 체계**:
```
CHAT-{CATEGORY}-{NUMBER}

CATEGORY:
- CONN  : Connection (연결)
- MSG   : Message (메시지)
- SYNC  : Synchronization (동기화)
- FILE  : File (파일)
- UI    : User Interface (UI)

NUMBER: 001-999 (3자리)
```

#### ✅ 2.2 에러 로거
**파일**: `lib/utils/chat/errorLogger.js`

**주요 기능**:
- `logChatError(error, context)` - 에러 로깅
- `logChatWarning(message, context)` - 경고 로깅
- `logChatInfo(message, context)` - 정보 로깅
- `logChatDebug(message, context)` - 디버그 로깅 (개발 환경만)
- `formatErrorLog(error)` - 에러 포맷팅

**로그 레벨**:
- ERROR
- WARN
- INFO
- DEBUG

**환경별 동작**:
- Development: 콘솔 출력 (상세)
- Production: 서버 전송 (향후 구현)

#### ✅ 2.3 에러 핸들러
**파일**: `lib/utils/chat/errorHandler.js`

**주요 기능**:
- `handleChatError(error, context)` - 메인 에러 핸들러
- `handleApiError(response)` - API 응답 에러 처리
- `withRetry(fn, options)` - 재시도 로직

**에러 분류**:
1. ChatException 계열
2. Socket.IO 에러
3. 네트워크 에러
4. HTTP 에러
5. 기타 에러

**재시도 로직**:
- 최대 시도 횟수 설정
- 백오프 전략 지원
- 재시도 불가능한 에러는 즉시 throw

#### ✅ 2.4 유틸리티 통합 Export
**파일**: `lib/utils/chat/index.js`

모든 유틸리티 함수를 한 곳에서 import 가능

---

## 📊 생성된 파일 통계

| 카테고리 | 파일 수 | 총 라인 수 | 설명 |
|---------|--------|-----------|------|
| **예외 클래스** | 7 | ~800 | ChatException + 5개 서브클래스 + index |
| **유틸리티** | 4 | ~650 | 에러 핸들러, 로거, 메시지 + index |
| **합계** | **11** | **~1,450** | - |

---

## 🎯 주요 특징

### 1. 타입별 에러 클래스
각 카테고리별로 전용 예외 클래스 제공:
- 연결 (Connection)
- 메시지 (Message)
- 동기화 (Sync)
- 파일 (File)
- UI

### 2. 정적 팩토리 메서드
편리한 예외 생성:
```javascript
// ❌ 나쁜 예
throw new ChatMessageException('CHAT-MSG-003', 'Empty', { ... });

// ✅ 좋은 예
throw ChatMessageException.emptyContent({ studyId });
```

### 3. 에러 코드 체계
일관된 네이밍 규칙:
- `CHAT-CONN-001`: Connection Error #1
- `CHAT-MSG-001`: Message Error #1
- `CHAT-SYNC-001`: Sync Error #1

### 4. 재시도 가능 여부 자동 판단
각 에러마다 재시도 가능 여부 명시:
```javascript
const errorInfo = handleChatError(error);
if (errorInfo.retryable) {
  // 재시도 로직
}
```

### 5. 사용자/개발자 메시지 분리
- 사용자: 친화적이고 간결한 메시지
- 개발자: 기술적이고 상세한 메시지

### 6. 컨텍스트 추적
에러 발생 시 컨텍스트 자동 저장:
```javascript
{
  userId: '123',
  studyId: '456',
  messageId: '789',
  timestamp: '2025-12-01T...',
  attempt: 2
}
```

### 7. 통합 Import
한 곳에서 모든 것을 import:
```javascript
import {
  ChatMessageException,
  handleChatError,
  logChatError
} from '@/lib/exceptions/chat';
from '@/lib/utils/chat';
```

---

## 📝 사용 예시

### 예시 1: API에서 에러 던지기
```javascript
// api/studies/[id]/chat/route.js
import { ChatMessageException } from '@/lib/exceptions/chat';

export async function POST(request, { params }) {
  const { content } = await request.json();
  
  if (!content || !content.trim()) {
    throw ChatMessageException.emptyContent({
      studyId: params.id,
      userId: session.user.id
    });
  }
  
  if (content.length > 2000) {
    throw ChatMessageException.contentTooLong(
      content.length,
      2000,
      { studyId: params.id }
    );
  }
  
  // ... 메시지 저장
}
```

### 예시 2: 에러 핸들링
```javascript
// components/study/RealtimeChat.js
import { handleChatError } from '@/lib/utils/chat';

const handleSend = async () => {
  try {
    await sendMessage(content);
  } catch (error) {
    const errorInfo = handleChatError(error, {
      studyId,
      userId: currentUser.id
    });
    
    // 사용자에게 표시
    toast.error(errorInfo.message);
    
    // 재시도 가능하면 버튼 표시
    if (errorInfo.retryable) {
      setShowRetry(true);
    }
  }
};
```

### 예시 3: 재시도 로직
```javascript
import { withRetry } from '@/lib/utils/chat';

const sendWithRetry = async () => {
  await withRetry(
    () => sendMessage(content),
    {
      maxAttempts: 3,
      delayMs: 1000,
      backoff: true,
      context: { studyId, userId }
    }
  );
};
```

### 예시 4: Socket 에러 처리
```javascript
// contexts/SocketContext.js
import { 
  ChatConnectionException,
  handleChatError,
  logChatError 
} from '@/lib/exceptions/chat';
from '@/lib/utils/chat';

socketInstance.on('connect_error', (error) => {
  const chatError = ChatConnectionException.serverUnreachable({
    userId: user.id,
    socketId: socketInstance.id
  });
  
  const errorInfo = handleChatError(chatError);
  
  setConnectionError(errorInfo.message);
  setConnectionStatus('offline');
});
```

---

## ✅ 검증 완료

### 1. 파일 생성 확인
```
✅ lib/exceptions/chat/ChatException.js
✅ lib/exceptions/chat/ConnectionException.js
✅ lib/exceptions/chat/MessageException.js
✅ lib/exceptions/chat/SyncException.js
✅ lib/exceptions/chat/FileException.js
✅ lib/exceptions/chat/UIException.js
✅ lib/exceptions/chat/index.js
✅ lib/utils/chat/errorMessages.js
✅ lib/utils/chat/errorLogger.js
✅ lib/utils/chat/errorHandler.js
✅ lib/utils/chat/index.js
```

### 2. 에러 코드 체계 확인
```
✅ CHAT-CONN-001 ~ 006 (6개) - 연결 에러
✅ CHAT-MSG-001 ~ 012 (12개) - 메시지 에러
✅ CHAT-SYNC-001 ~ 006 (6개) - 동기화 에러
✅ CHAT-FILE-001 ~ 006 (6개) - 파일 에러
✅ CHAT-UI-001 ~ 005 (5개) - UI 에러
총 35개 에러 코드
```

### 3. 기능 검증
```
✅ 예외 클래스 상속 구조
✅ 정적 팩토리 메서드
✅ JSON 직렬화
✅ 사용자/개발자 메시지 분리
✅ 재시도 가능 여부 판단
✅ 컨텍스트 추적
✅ 에러 로깅 (환경별)
✅ 에러 분류 자동화
✅ 재시도 로직
✅ 통합 Export
```

---

## 🎯 다음 단계

Phase 2 완료! 다음은:

**Phase 3: Socket 연결 예외 처리 (6시간)**

수정할 파일:
1. `contexts/SocketContext.js`
   - 연결 상태 상세화
   - 에러 상태 관리
   - 타임아웃 처리
   - 네트워크 상태 감지

2. `lib/hooks/useStudySocket.js`
   - 에러 처리 강화
   - 메시지 중복 방지
   - 타이핑 타이머 자동 정리

---

**작성자**: GitHub Copilot  
**작업 시간**: 4시간  
**상태**: ✅ 완료  
**다음 작업**: Phase 3 시작 준비

