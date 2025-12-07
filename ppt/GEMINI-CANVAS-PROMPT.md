# CoUp PPT 제작 - Gemini Canvas용 프롬프트

아래 프롬프트를 **Gemini Canvas**에 한 번에 복사해서 붙여넣으세요.

---

## 🚀 사용 방법

1. **Gemini** (gemini.google.com) 접속
2. 아래 **전체 프롬프트**를 복사해서 붙여넣기
3. Gemini가 슬라이드를 생성함
4. **구글 슬라이드로 내보내기** (Export to Google Slides)
5. 구글 슬라이드에서 직접 스크린샷 삽입 및 수정
6. 완성된 PPT 다운로드

---

## 📋 전체 프롬프트 (복사용)

```
19장의 발표용 PPT 슬라이드를 생성해주세요.
생성 완료 후 구글 슬라이드로 내보내기할 수 있도록 해주세요.

[테마 & 스타일]
- 다크 테마 (어두운 네이비/차콜 배경 #0F172A)
- 밝은 텍스트 (흰색, 연한 회색)
- 메인 강조색: 밝은 보라색 (#818CF8)
- 보조 강조색: 시안(#22D3EE), 민트(#34D399), 주황(#FB923C)
- 문제/경고: 밝은 핑크 (#FB7185)
- 성공/긍정: 밝은 초록 (#4ADE80)
- 16:9 와이드스크린
- 모던하고 세련된 테크/비즈니스 스타일
- 이모지 아이콘 활용

[스크린샷 플레이스홀더]
슬라이드 5~12번에는 왼쪽에 스크린샷 영역이 필요합니다.
"[스크린샷]"이라고 표시된 플레이스홀더를 만들어주세요.
나중에 내가 직접 이미지를 삽입할 예정입니다.

---

## 슬라이드 1: 표지

- 로고: 보라색 원형 배경에 "CoUp" 텍스트
- 제목: CoUp (코업)
- 부제목: 스터디 협업 플랫폼
- 슬로건: "함께, 더 높이. 당신의 성장을 위한 스터디 허브"
- 하단 정보: 개발 기간 2025.10.28 ~ 12.07 (약 6주) | 1인 풀스택 개발

---

## 슬라이드 2: 목차

1. 프로젝트 소개
2. 문제 인식 & 해결 방안
3. 주요 기능 (8개)
4. 주요 코드 설명
5. 기술 스택 & 아키텍처
6. 개발 성과 & 마무리

---

## 슬라이드 3: 프로젝트 소개

- CoUp = Co(operate) + Up = 함께 성장
- 핵심 메시지: "스터디 탐색부터 협업까지, 올인원 스터디 플랫폼"
- 3개 정보 카드:
  - 개발 기간: 약 6주 (2025.10.28 ~ 12.07)
  - 인원: 1인 풀스택
  - 주요 기술: Next.js 16, React 19

---

## 슬라이드 4: 문제 인식 & 해결 방안

왼쪽 영역 - 문제점 (빨간/핑크 계열):
- 현재 방식: 카카오톡 오픈채팅방
- 🔍 비효율적 검색 - 필터링 불가
- 📊 관리 기능 부재 - 일정/출석 관리 X
- 🔧 도구 분산 - 채팅/Zoom/드라이브 분리
- 📉 동기부여 어려움 - 학습 통계 X

오른쪽 영역 - 해결 방안 (초록/민트 계열):
- CoUp 솔루션: 올인원 통합 플랫폼
- ✅ 카테고리/키워드 검색 & 필터
- ✅ 일정/출석/과제 통합 관리
- ✅ 채팅+화상+파일 All-in-One
- ✅ 출석률/완료율 통계 시각화

중앙에 화살표(→)로 문제에서 해결로 연결

---

## 슬라이드 5: 기능 - 스터디 탐색

[레이아웃: 왼쪽 스크린샷 플레이스홀더 + 오른쪽 설명]

- 📂 6개 카테고리: 프로그래밍, 어학, 자격증, 취미 등
- 🔎 키워드 검색: 스터디명, 설명, 태그 검색
- 🟢 모집 상태 필터: 모집중 / 모집마감

---

## 슬라이드 6: 기능 - 스터디 생성

[레이아웃: 왼쪽 스크린샷 플레이스홀더 + 오른쪽 설명]

- 📝 기본 정보: 이름, 설명, 이모지
- 👥 인원 설정: 최대 100명까지
- ✅ 가입 승인 방식: 자동 승인 / 수동 승인
- 🔒 공개 설정: 공개 / 비공개

---

## 슬라이드 7: 기능 - 멤버 관리 (RBAC)

[레이아웃: 왼쪽 스크린샷 플레이스홀더 + 오른쪽 설명]

역할 기반 접근 제어 (RBAC):
- 👑 OWNER (방장): 모든 권한, 스터디 삭제/위임
- ⭐ ADMIN (관리자): 멤버/공지/일정 관리, 가입 승인
- 👤 MEMBER (멤버): 기본 참여 권한, 채팅/파일 이용

---

## 슬라이드 8: 기능 - 실시간 채팅

[레이아웃: 왼쪽 스크린샷 플레이스홀더 + 오른쪽 설명]

Socket.IO 기반 실시간 통신:
- ⚡ 실시간 메시지 전송
- 📎 파일 첨부: 이미지, 문서 공유
- ✍️ 타이핑 표시: "OOO님이 입력 중..."
- 🟢 온라인 상태 표시

---

## 슬라이드 9: 기능 - 화상 통화

[레이아웃: 왼쪽 스크린샷 플레이스홀더 + 오른쪽 설명]

WebRTC 기반 P2P 연결:
- 🌐 서버 거치지 않고 직접 연결
- 👥 다중 참여자 동시 통화
- 🖥️ 화면 공유: 발표 자료, 코드 공유
- 🎤📹 카메라/마이크 ON/OFF 제어

---

## 슬라이드 10: 기능 - 대시보드

[레이아웃: 왼쪽 스크린샷 플레이스홀더 + 오른쪽 설명]

학습 현황 한눈에 확인:
- 📈 학습 통계: 출석률, 과제 완료율 시각화
- 📚 내 스터디 목록: 참여 중인 스터디 빠른 접근
- ⚠️ 긴급 할일: 마감 임박 과제 알림

---

## 슬라이드 11: 기능 - 학습 관리

[레이아웃: 왼쪽 스크린샷 플레이스홀더 + 오른쪽 설명]

4가지 관리 도구:
- 📅 캘린더: 일정 등록, 월/주 보기
- 📢 공지사항: 마크다운 지원, 고정/중요 표시
- 📁 파일 공유: 업로드/다운로드
- ✅ 할일 관리: 상태, 우선순위 설정

---

## 슬라이드 12: 기능 - 관리자 시스템

[레이아웃: 왼쪽 스크린샷 플레이스홀더 + 오른쪽 설명]

4가지 관리 기능:
- 👥 사용자 관리: 조회, 경고, 정지
- 📚 스터디 관리: 모니터링, 숨김/삭제
- ⚠️ 신고 처리: 접수, 검토, 제재
- 📋 감사 로그: 모든 활동 기록

관리자 역할 단계: VIEWER → MODERATOR → ADMIN → SUPER_ADMIN

---

## 슬라이드 13: 주요 코드 - 실시간 통신

[레이아웃: 왼쪽에 코드 스크린샷 플레이스홀더 + 오른쪽 설명]

Socket.IO + WebRTC 실시간 통신:

Socket.IO (채팅):
- 이벤트 기반 양방향 통신
- Redis Adapter로 다중 서버 동기화
- 이벤트: join_room, send_message, typing, online_status

WebRTC (화상통화):
- P2P 직접 연결 (서버 부하 감소)
- Signaling Server로 연결 중개
- ICE Candidate 교환, Offer/Answer 협상

---

## 슬라이드 14: 기술 스택

3개 영역으로 구분 (가로 배치, 각각 다른 색상 테두리):

Frontend (시안색 #22D3EE 테두리):
- Next.js 16, React 19, Tailwind CSS 4, TanStack Query 5, Socket.IO

Backend (민트색 #34D399 테두리):
- NextAuth.js, Prisma 6, Zod 4, WebRTC

Infrastructure (주황색 #FB923C 테두리):
- PostgreSQL 15, Redis 7, Docker Compose, Express Signaling Server

---

## 슬라이드 15: 시스템 아키텍처

[중요: 아래 구조대로 정확히 그려주세요]

다이어그램 구조 (위에서 아래로 3단 구성):

1단 (최상단, 중앙):
┌─────────────────────────────┐
│  💻 Client (SPA)            │
│  Next.js 16 + React 19      │
└─────────────────────────────┘

1단과 2단 사이:
- 왼쪽 화살표: "HTTPS / REST" 라벨 (시안색)
- 오른쪽 화살표: "WebSocket" 라벨 (주황색)

2단 (중간, 좌우 2개 박스):
왼쪽 박스:
┌─────────────────────────────┐
│  🌐 API Server              │
│  Next.js Route Handlers     │
│  :3000                      │
└─────────────────────────────┘

오른쪽 박스:
┌─────────────────────────────┐
│  📡 Signaling Server        │
│  Express + Socket.IO        │
│  :4000                      │
└─────────────────────────────┘

2단과 3단 사이:
- 왼쪽 박스 아래 화살표
- 오른쪽 박스 아래 화살표

3단 (최하단, 좌우 2개 박스):
왼쪽 박스 (초록색 테두리):
┌─────────────────────────────┐
│  🐘 PostgreSQL              │
│  :5432                      │
└─────────────────────────────┘

오른쪽 박스 (빨간색 테두리):
┌─────────────────────────────┐
│  🔴 Redis                   │
│  :6379                      │
└─────────────────────────────┘

최하단에 가로로 긴 박스:
━━━━━━━━ 🐳 Docker Compose ━━━━━━━━

스타일:
- 모든 박스는 어두운 회색(#1E293B) 배경
- 각 박스에 적절한 아이콘 포함
- 화살표는 밝은 색상으로 눈에 띄게
- 전체적으로 깔끔한 플로우차트 스타일

---

## 슬라이드 16: 개발 성과

기술적 성과 (4개):
- ✅ 분리형 마이크로서비스 (Next.js + Signaling)
- ✅ 실시간 통신 (WebRTC + Socket.IO)
- ✅ 다중 서버 지원 (Redis Pub/Sub)
- ✅ 역할 기반 접근 제어 (RBAC 3단계)

프로젝트 규모:
- 300+ 파일, 80+ 컴포넌트, 50+ API, 15+ Hooks, 15+ DB 모델

결론: 계획한 모든 주요 기능 구현 완료

---

## 슬라이드 17: 마무리

요약:
- 카카오톡 오픈채팅 → CoUp 올인원 스터디 플랫폼
- 스마트 검색으로 원하는 스터디 탐색
- 채팅 + 화상 통화 올인원 협업
- 일정, 과제, 출석 통합 관리

배운 점:
- Next.js 16, React 19 최신 기술 경험
- WebRTC, Socket.IO 실시간 통신 구현
- 풀스택 개발 역량 강화

슬로건: "함께, 더 높이. 당신의 성장을 위한 스터디 허브"
감사합니다 🙏

---

## 슬라이드 18: Q&A

- 중앙에 크게: "Q & A"
- 그 아래: "질문 있으신가요?"
- 하단: 로고 + "CoUp (코업)"

---

위 내용대로 18장의 슬라이드를 생성해주세요.
생성이 완료되면 구글 슬라이드로 내보내기할 수 있도록 해주세요.
```

---

## 📎 스크린샷 삽입 안내

구글 슬라이드로 내보내기 후, 아래 화면들을 캡처해서 삽입하세요:

### 기능 슬라이드 스크린샷 (5~12번)

| 슬라이드 | 화면 | URL |
|:--------:|------|-----|
| 5 | 스터디 탐색 | `/studies` |
| 6 | 스터디 생성 모달 | `/studies` 에서 생성 버튼 클릭 |
| 7 | 멤버 관리 | `/my-studies/[id]/members` |
| 8 | 채팅 | `/my-studies/[id]/chat` |
| 9 | 화상 통화 | `/my-studies/[id]/video-call` |
| 10 | 대시보드 | `/dashboard` |
| 11 | 학습 관리 | `/my-studies/[id]/calendar` |
| 12 | 관리자 | `/admin` |

---

### 📝 주요 코드 슬라이드 스크린샷 (13번)

슬라이드 13번에는 실제 코드를 스크린샷으로 넣어야 합니다.
아래 파일들의 해당 라인을 VS Code에서 캡처하세요:

#### 옵션 1: Socket.IO 채팅 - 클라이언트 (추천)
**파일**: `coup/src/lib/hooks/useSocket.js`  
**라인**: 216-238

```javascript
// 메시지 전송 함수
const sendMessage = useCallback((content, fileId = null) => {
  if (!socket || !isConnected) return

  socket.emit('chat:message', {
    studyId,
    content,
    fileId
  })
}, [socket, isConnected, studyId])

// 타이핑 상태 전송
const setTyping = useCallback((isTyping) => {
  if (!socket || !isConnected) return

  socket.emit('chat:typing', {
    studyId,
    isTyping
  })
}, [socket, isConnected, studyId])
```

#### 옵션 2: Socket.IO 채팅 - 서버
**파일**: `signaling-server/handlers/chat.js`  
**라인**: 10-40

```javascript
// 스터디 채팅 메시지 전송
socket.on('chat:send-message', async ({ studyId, message, type = 'text' }) => {
  // 메시지 객체 생성
  const chatMessage = {
    id: `msg_${Date.now()}_${socket.id}`,
    studyId,
    userId: socket.userId,
    user: socket.user,
    message,
    type,
    timestamp: new Date()
  };

  // 스터디 룸의 모든 참여자에게 전송
  io.to(`study:${studyId}`).emit('chat:message-received', chatMessage);
});
```

#### 옵션 3: WebRTC 화상통화 - Offer/Answer
**파일**: `coup/src/lib/hooks/useVideoCall.js`  
**라인**: 133-147

```javascript
// Offer 생성 및 전송
const createOffer = useCallback(async (socketId, peer) => {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  if (socket) {
    socket.emit('video:offer', {
      to: socketId,
      offer
    });
  }
}, [socket]);
```

#### 옵션 4: WebRTC 화상통화 - ICE Candidate
**파일**: `coup/src/lib/hooks/useVideoCall.js`  
**라인**: 169-178

```javascript
// ICE Candidate 전송
peer.onicecandidate = (event) => {
  if (event.candidate && socket) {
    socket.emit('video:ice-candidate', {
      to: socketId,
      candidate: event.candidate
    });
  }
};
```

#### 옵션 5: WebRTC - 서버 시그널링
**파일**: `signaling-server/handlers/video.js`  
**라인**: 91-120

```javascript
// WebRTC Offer 전달
socket.on('video:offer', ({ to, offer }) => {
  io.to(to).emit('video:offer', {
    from: socket.id,
    offer
  });
});

// WebRTC Answer 전달
socket.on('video:answer', ({ to, answer }) => {
  io.to(to).emit('video:answer', {
    from: socket.id,
    answer
  });
});

// ICE Candidate 전달
socket.on('video:ice-candidate', ({ to, candidate }) => {
  io.to(to).emit('video:ice-candidate', {
    from: socket.id,
    candidate
  });
});
```

💡 **권장**: 옵션 1 또는 옵션 3을 선택해서 1개만 넣으세요. (슬라이드에 너무 많은 코드는 X)

---

## 🖼️ 필요한 이미지

| 파일 | 경로 | 용도 |
|------|------|------|
| mainlogo.png | `C:\Project\CoUp\mainlogo.png` | 표지, Q&A 로고 |

---

**CoUp - 함께, 더 높이. 당신의 성장을 위한 스터디 허브.** 🚀
