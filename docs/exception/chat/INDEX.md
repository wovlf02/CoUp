# 채팅 예외 처리 색인 (INDEX)

**작성일**: 2025-11-29  
**목적**: 채팅 관련 예외 상황을 증상별, 카테고리별로 빠르게 찾기

---

## 📋 목차

1. [증상별 찾기](#증상별-찾기)
2. [카테고리별 찾기](#카테고리별-찾기)
3. [에러 코드별 찾기](#에러-코드별-찾기)
4. [빠른 해결 가이드](#빠른-해결-가이드)

---

## 증상별 찾기

### 🔌 연결 문제

| 증상 | 가능한 원인 | 해결 문서 | 페이지 |
|------|-------------|-----------|--------|
| "Socket 연결 실패" | 서버 미실행, 네트워크 오류 | [01-connection-exceptions.md](./01-connection-exceptions.md#socket-연결-실패) | §1.1 |
| "연결이 계속 끊깁니다" | 재연결 설정 오류 | [01-connection-exceptions.md](./01-connection-exceptions.md#재연결-실패) | §1.2 |
| "타임아웃 오류" | 서버 응답 지연 | [01-connection-exceptions.md](./01-connection-exceptions.md#연결-타임아웃) | §1.3 |
| "인증 실패" | 토큰/세션 만료 | [01-connection-exceptions.md](./01-connection-exceptions.md#인증-오류) | §1.4 |
| "Transport 업그레이드 실패" | WebSocket 지원 안됨 | [01-connection-exceptions.md](./01-connection-exceptions.md#transport-문제) | §1.5 |

### 💬 메시지 전송/수신

| 증상 | 가능한 원인 | 해결 문서 | 페이지 |
|------|-------------|-----------|--------|
| "메시지가 전송되지 않습니다" | API 오류, 네트워크 문제 | [02-message-exceptions.md](./02-message-exceptions.md#메시지-전송-실패) | §2.1 |
| "메시지가 중복으로 보입니다" | 이벤트 중복 처리 | [02-message-exceptions.md](./02-message-exceptions.md#중복-메시지) | §2.2 |
| "전송 실패 메시지가 남아있음" | 재시도 로직 오류 | [02-message-exceptions.md](./02-message-exceptions.md#실패-메시지-처리) | §2.3 |
| "빈 메시지가 전송됨" | 유효성 검사 누락 | [02-message-exceptions.md](./02-message-exceptions.md#빈-메시지-방지) | §2.4 |
| "메시지가 수신되지 않음" | 이벤트 리스너 오류 | [02-message-exceptions.md](./02-message-exceptions.md#메시지-수신-실패) | §2.5 |

### ⚡ 실시간 동기화

| 증상 | 가능한 원인 | 해결 문서 | 페이지 |
|------|-------------|-----------|--------|
| "메시지 순서가 뒤바뀜" | 타임스탬프 처리 오류 | [03-realtime-sync-exceptions.md](./03-realtime-sync-exceptions.md#메시지-순서-문제) | §3.1 |
| "낙관적 업데이트 실패" | 상태 관리 오류 | [03-realtime-sync-exceptions.md](./03-realtime-sync-exceptions.md#낙관적-업데이트-실패) | §3.2 |
| "임시 메시지가 사라지지 않음" | 롤백 로직 오류 | [03-realtime-sync-exceptions.md](./03-realtime-sync-exceptions.md#임시-메시지-정리) | §3.3 |
| "이벤트가 손실됨" | 네트워크 불안정 | [03-realtime-sync-exceptions.md](./03-realtime-sync-exceptions.md#이벤트-손실) | §3.4 |
| "동시 전송 시 충돌" | 동시성 처리 오류 | [03-realtime-sync-exceptions.md](./03-realtime-sync-exceptions.md#동시성-문제) | §3.5 |

### 📎 파일 첨부

| 증상 | 가능한 원인 | 해결 문서 | 페이지 |
|------|-------------|-----------|--------|
| "파일 업로드 실패" | 용량/타입 제한 | [04-file-exceptions.md](./04-file-exceptions.md#업로드-실패) | §4.1 |
| "업로드가 너무 느림" | 큰 파일 크기 | [04-file-exceptions.md](./04-file-exceptions.md#업로드-성능) | §4.2 |
| "미리보기가 안 나옴" | 파일 타입 미지원 | [04-file-exceptions.md](./04-file-exceptions.md#미리보기-오류) | §4.3 |
| "파일 다운로드 실패" | 권한 또는 경로 오류 | [04-file-exceptions.md](./04-file-exceptions.md#다운로드-실패) | §4.4 |
| "이미지가 깨짐" | 인코딩 오류 | [04-file-exceptions.md](./04-file-exceptions.md#이미지-렌더링) | §4.5 |

### 🎨 UI/UX

| 증상 | 가능한 원인 | 해결 문서 | 페이지 |
|------|-------------|-----------|--------|
| "자동 스크롤이 안 됨" | ref 문제 | [05-ui-exceptions.md](./05-ui-exceptions.md#자동-스크롤-실패) | §5.1 |
| "무한 스크롤이 작동 안 함" | intersection observer 오류 | [05-ui-exceptions.md](./05-ui-exceptions.md#무한-스크롤-문제) | §5.2 |
| "타이핑 인디케이터가 안 사라짐" | 타이머 정리 오류 | [05-ui-exceptions.md](./05-ui-exceptions.md#타이핑-인디케이터) | §5.3 |
| "입력창이 초기화 안 됨" | 상태 관리 오류 | [05-ui-exceptions.md](./05-ui-exceptions.md#입력-상태-문제) | §5.4 |
| "읽음 표시가 업데이트 안 됨" | 상태 동기화 오류 | [05-ui-exceptions.md](./05-ui-exceptions.md#읽음-표시-문제) | §5.5 |

---

## 카테고리별 찾기

### 1️⃣ 연결 관리
**문서**: [01-connection-exceptions.md](./01-connection-exceptions.md)

- Socket.IO 연결 실패
- 재연결 로직
- 연결 타임아웃
- 인증 오류
- Transport 문제
- 연결 상태 관리

### 2️⃣ 메시지 처리
**문서**: [02-message-exceptions.md](./02-message-exceptions.md)

- 메시지 전송 실패
- 메시지 수신 오류
- 중복 메시지 방지
- 빈 메시지 검증
- 메시지 삭제 실패
- 메시지 편집 오류

### 3️⃣ 실시간 동기화
**문서**: [03-realtime-sync-exceptions.md](./03-realtime-sync-exceptions.md)

- 메시지 순서 보장
- 낙관적 업데이트
- 임시 메시지 처리
- 이벤트 손실 복구
- 동시성 제어
- 캐시 무효화

### 4️⃣ 파일 관리
**문서**: [04-file-exceptions.md](./04-file-exceptions.md)

- 파일 업로드 실패
- 용량 제한 처리
- 파일 타입 검증
- 미리보기 생성
- 파일 다운로드
- 이미지 최적화

### 5️⃣ UI/UX
**문서**: [05-ui-exceptions.md](./05-ui-exceptions.md)

- 자동 스크롤
- 무한 스크롤
- 타이핑 인디케이터
- 입력 상태 관리
- 읽음 표시
- 온라인 상태 표시

### 6️⃣ 모범 사례
**문서**: [99-best-practices.md](./99-best-practices.md)

- 에러 처리 패턴
- 성능 최적화
- 보안 고려사항
- 테스트 전략
- 모니터링
- 디버깅 팁

---

## 에러 코드별 찾기

### HTTP 에러

| 코드 | 의미 | 해결 방법 | 문서 |
|------|------|-----------|------|
| 400 | Bad Request | 요청 데이터 검증 | [02-message-exceptions.md](./02-message-exceptions.md) |
| 401 | Unauthorized | 로그인 확인 | [01-connection-exceptions.md](./01-connection-exceptions.md) |
| 403 | Forbidden | 권한 확인 | [02-message-exceptions.md](./02-message-exceptions.md) |
| 404 | Not Found | 스터디/메시지 존재 확인 | [02-message-exceptions.md](./02-message-exceptions.md) |
| 413 | Payload Too Large | 파일 크기 확인 | [04-file-exceptions.md](./04-file-exceptions.md) |
| 500 | Server Error | 서버 로그 확인 | 모든 문서 |

### Socket.IO 에러

| 에러 | 의미 | 해결 방법 | 문서 |
|------|------|-----------|------|
| `connect_error` | 연결 실패 | 서버 URL 확인 | [01-connection-exceptions.md](./01-connection-exceptions.md#socket-연결-실패) |
| `connect_timeout` | 연결 타임아웃 | 네트워크 확인 | [01-connection-exceptions.md](./01-connection-exceptions.md#연결-타임아웃) |
| `disconnect` | 연결 끊김 | 재연결 로직 확인 | [01-connection-exceptions.md](./01-connection-exceptions.md#재연결-실패) |
| `error` | 일반 에러 | 에러 메시지 확인 | [01-connection-exceptions.md](./01-connection-exceptions.md) |

### Prisma 에러

| 에러 | 의미 | 해결 방법 | 문서 |
|------|------|-----------|------|
| `P2002` | Unique 제약 위반 | 중복 데이터 확인 | [02-message-exceptions.md](./02-message-exceptions.md) |
| `P2003` | Foreign Key 제약 위반 | 관계 데이터 확인 | [02-message-exceptions.md](./02-message-exceptions.md) |
| `P2025` | Record Not Found | 데이터 존재 확인 | [02-message-exceptions.md](./02-message-exceptions.md) |

---

## 빠른 해결 가이드

### 🚨 긴급 상황

#### 메시지가 전혀 전송되지 않을 때

```javascript
// 1. Socket 연결 상태 확인
const { socket, isConnected } = useSocket();
console.log('Socket connected:', isConnected);

// 2. 스터디 멤버십 확인
const { data: studyData } = useStudy(studyId);
console.log('Study data:', studyData);

// 3. API 엔드포인트 테스트
const response = await fetch(`/api/studies/${studyId}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: 'test' })
});
console.log('API response:', await response.json());

// 해결 문서: 01-connection-exceptions.md, 02-message-exceptions.md
```

#### 메시지가 중복으로 표시될 때

```javascript
// 중복 메시지 필터링
const uniqueMessages = allMessages.filter((msg, index, self) =>
  index === self.findIndex((m) => m.id === msg.id)
);

// 해결 문서: 02-message-exceptions.md#중복-메시지
```

#### 스크롤이 작동하지 않을 때

```javascript
// ref 확인
const messagesEndRef = useRef(null);

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

useEffect(() => {
  scrollToBottom();
}, [messages]);

// JSX
<div ref={messagesEndRef} />

// 해결 문서: 05-ui-exceptions.md#자동-스크롤-실패
```

### 🔍 디버깅 체크리스트

#### Socket 연결 문제
```bash
# 1. 서버 실행 확인
curl http://localhost:4000/health

# 2. 환경 변수 확인
echo $NEXT_PUBLIC_SOCKET_URL

# 3. 브라우저 콘솔에서 확인
socket.connected  // true/false
socket.id         // socket id
```

#### API 요청 문제
```bash
# 1. API 직접 호출
curl -X POST http://localhost:3000/api/studies/{studyId}/chat \
  -H "Content-Type: application/json" \
  -d '{"content":"test"}'

# 2. 네트워크 탭 확인
- Status: 200?
- Response: success?
- Headers: Authorization?
```

#### 메시지 동기화 문제
```javascript
// 1. 메시지 ID 중복 확인
console.log('Message IDs:', messages.map(m => m.id));

// 2. 타임스탬프 확인
console.log('Timestamps:', messages.map(m => m.createdAt));

// 3. 이벤트 리스너 확인
socket.listeners('study:message'); // 리스너 목록
```

### 📊 모니터링

#### 성능 메트릭
```javascript
// 메시지 전송 시간 측정
const startTime = Date.now();
await sendMessage(content);
const endTime = Date.now();
console.log('Send time:', endTime - startTime, 'ms');

// 메모리 사용량
console.log('Messages count:', messages.length);
console.log('Memory usage:', performance.memory?.usedJSHeapSize);
```

#### 에러 로깅
```javascript
// 전역 에러 핸들러
socket.on('error', (error) => {
  console.error('[Socket Error]', {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack
  });
});

// API 에러 로깅
try {
  await sendMessage(content);
} catch (error) {
  console.error('[API Error]', {
    timestamp: new Date().toISOString(),
    endpoint: `/api/studies/${studyId}/chat`,
    error: error.message
  });
}
```

---

## 🔗 관련 링크

### 내부 문서
- [채팅 README](./README.md) - 전체 개요
- [연결 예외](./01-connection-exceptions.md)
- [메시지 예외](./02-message-exceptions.md)
- [실시간 동기화](./03-realtime-sync-exceptions.md)
- [파일 예외](./04-file-exceptions.md)
- [UI 예외](./05-ui-exceptions.md)
- [모범 사례](./99-best-practices.md)

### 외부 자료
- [Socket.IO Troubleshooting](https://socket.io/docs/v4/troubleshooting-connection-issues/)
- [React Query Error Handling](https://tanstack.com/query/latest/docs/react/guides/query-functions#handling-and-throwing-errors)
- [Next.js API Routes Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

---

## 💡 팁

### 빠른 검색 방법

1. **Ctrl+F로 증상 검색**: 에러 메시지나 증상을 직접 검색
2. **카테고리별 탐색**: 대략적인 영역을 알면 카테고리에서 찾기
3. **에러 코드 확인**: HTTP/Socket 에러 코드로 빠르게 찾기

### 효과적인 디버깅

1. **콘솔 로그 활용**: `console.log('[Chat]', ...)` 형식으로 로깅
2. **네트워크 탭 확인**: API 요청/응답 상세 확인
3. **React DevTools**: 컴포넌트 상태 확인
4. **Socket.IO Monitor**: 이벤트 흐름 확인

---

**마지막 업데이트**: 2025-11-29  
**다음 리뷰 예정일**: 2025-12-06

