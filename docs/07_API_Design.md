# 07. API 설계 (RESTful API & WebSocket)

CoUp의 API는 **RESTful API(비즈니스 서버)**와 **WebSocket API(시그널링 서버)** 두 부분으로 구성됩니다. 본 문서는 두 API의 명세와 서버 간 내부 통신 방식을 정의합니다.

## 1. RESTful API (for Next.js API Routes)

- **설명**: 프론트엔드 클라이언트와 내부 시그널링 서버가 호출하는 표준 RESTful API입니다. Next.js API Routes를 통해 모든 핵심 비즈니스 로직과 데이터 처리를 담당합니다.
- **API 문서화**: Next.js API Routes는 별도의 Swagger UI를 제공하지 않으며, API 명세는 본 문서와 코드 레벨 주석을 통해 관리됩니다.

(Auth, Users, Study Groups 등 기존 RESTful API 명세는 이전과 동일...)

--- 

### 1.1. 내부 통신용 API (Internal API)

- **Base URL**: `/api/internal/v1`
- **설명**: 외부 클라이언트가 아닌, 시그널링 서버와 같은 내부 서비스만 Next.js API Routes를 호출할 수 있도록 방화벽 등 네트워크 레벨에서 접근을 제한해야 합니다.

| 기능 | HTTP Method | Endpoint | 설명 |
| :--- | :--- | :--- | :--- |
| **채팅 메시지 저장** | `POST` | `/messages` | 시그널링 서버가 클라이언트로부터 받은 채팅 메시지를 DB에 저장하기 위해 호출합니다. | 
| **사용자 접속 상태 변경** | `POST` | `/users/status` | 사용자의 WebSocket 연결/해제 상태를 기록하기 위해 호출합니다. | 


## 2. 실시간 통신 API (for Signaling Server - Node.js)

- **설명**: 모든 WebSocket 연결 및 실시간 메시지 처리는 Node.js 기반의 시그널링 서버가 전담합니다. 클라이언트는 이 서버에 WebSocket으로 연결하여 이벤트를 주고받습니다.

### 2.1. 클라이언트 -> 서버 (Client Emits)

- 클라이언트가 시그널링 서버로 보내는 이벤트입니다.

| 이벤트명 | 데이터 (Payload) | 설명 |
| :--- | :--- | :--- |
| `authenticate` | `{ token: string }` | WebSocket 연결 후, 자신의 JWT를 서버로 보내 인증을 요청합니다. | 
| `join_room` | `{ studyId: string }` | 특정 스터디 그룹의 채팅방(Room)에 참여합니다. | 
| `leave_room` | `{ studyId: string }` | 채팅방에서 나갑니다. | 
| `send_message` | `{ studyId: string, content: string }` | 채팅 메시지를 서버로 전송합니다. 시그널링 서버는 이 메시지를 받고 Next.js API Routes를 호출하여 DB에 저장한 후, 해당 룸의 다른 클라이언트들에게 브로드캐스트합니다. | 

### 2.2. 서버 -> 클라이언트 (Server Emits)

- 시그널링 서버가 특정 클라이언트 또는 룸 전체에 보내는 이벤트입니다.

| 이벤트명 | 데이터 (Payload) | 설명 |
| :--- | :--- | :--- |
| `auth_success` | `{}` | `authenticate` 이벤트에 대한 응답. 인증이 성공했음을 알립니다. | 
| `auth_error` | `{ message: string }` | 인증 실패 시 에러 메시지를 전송합니다. | 
| `new_message` | `{ userId: string, userName: string, content: string, sentAt: Date }` | 새로운 채팅 메시지를 해당 룸의 모든 클라이언트에게 브로드캐스트합니다. | 
| `notification` | `{ type: string, message: string, link: string }` | 개인에게 보내는 실시간 알림. (예: 스터디 가입 승인) | 

## 3. 서버 간 통신 (Inter-Service Communication)

- **목표**: Next.js API Routes와 시그널링 서버 간의 의존성을 낮추고, 확장성을 확보합니다.

### 3.1. 시그널링 서버 -> Next.js API Routes

- **방식**: **내부 REST API 호출**
- **흐름**: 시그널링 서버는 채팅 메시지 저장 등 비즈니스 로직 처리가 필요할 때, 위에 정의된 `/api/internal/v1` 엔드포인트를 동기적으로 호출합니다.

### 3.2. Next.js API Routes -> 시그널링 서버

- **방식**: **Redis Pub/Sub을 이용한 이벤트 발행**
- **흐름**:
  1.  Next.js API Routes에서 새로운 공지 등록, 스터디 멤버 강퇴 등 실시간 전파가 필요한 이벤트가 발생합니다.
  2.  Next.js API Routes는 해당 이벤트 데이터를 담아 Redis의 특정 채널(예: `notifications`, `study-events`)에 메시지를 **발행(Publish)**합니다.
  3.  시그널링 서버는 해당 채널들을 **구독(Subscribe)**하고 있다가, 메시지를 수신합니다.
  4.  시그널링 서버는 수신한 메시지를 파싱하여, 필요한 클라이언트(특정 사용자 또는 특정 룸)에게 WebSocket을 통해 `notification`과 같은 이벤트를 전송합니다.
- **장점**: 이 방식을 통해 Next.js API Routes는 시그널링 서버의 존재나 주소를 알 필요 없이, 오직 Redis에만 의존하게 되어 시스템 간 결합도가 크게 낮아집니다.