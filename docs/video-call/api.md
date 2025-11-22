# 화상회의 API 명세서

> **버전**: 1.0.0  
> **작성일**: 2025-11-19  
> **Base URL**: `/api/my-studies/[studyId]/video-call`

---

## 📋 목차

1. [인증](#1-인증)
2. [세션 관리](#2-세션-관리)
3. [참여자 관리](#3-참여자-관리)
4. [통계 및 히스토리](#4-통계-및-히스토리)
5. [에러 코드](#5-에러-코드)

---

## 1. 인증

모든 API는 NextAuth 세션 기반 인증이 필요합니다.

```javascript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
}
```

---

## 2. 세션 관리

### 2.1 화상회의 시작

새로운 화상회의 세션을 시작합니다.

**Endpoint**: `POST /api/my-studies/[studyId]/video-call/start`

**권한**: 스터디 멤버 (ACTIVE)

**Request Body**: 없음

**Response**:
```json
{
  "session": {
    "id": "clxxx...",
    "studyId": "study-123",
    "roomId": "study-study-123-main",
    "startedBy": "user-456",
    "startedAt": "2025-11-19T10:30:00.000Z",
    "endedAt": null,
    "duration": null,
    "starter": {
      "id": "user-456",
      "name": "김철수",
      "avatar": "https://..."
    }
  }
}
```

**이미 진행 중인 세션이 있는 경우**:
```json
{
  "session": {
    "id": "clxxx...",
    // ...existing session
  },
  "message": "이미 진행 중인 화상회의가 있습니다."
}
```

**에러**:
- `401`: 인증 필요
- `403`: 접근 권한 없음 (스터디 멤버 아님)
- `500`: 서버 오류

---

### 2.2 현재 상태 조회

진행 중인 화상회의 세션 정보를 조회합니다.

**Endpoint**: `GET /api/my-studies/[studyId]/video-call/status`

**권한**: 스터디 멤버

**Response**:
```json
{
  "session": {
    "id": "clxxx...",
    "studyId": "study-123",
    "roomId": "study-study-123-main",
    "startedBy": "user-456",
    "startedAt": "2025-11-19T10:30:00.000Z",
    "endedAt": null,
    "duration": null,
    "onlineCount": 3,
    "starter": {
      "id": "user-456",
      "name": "김철수",
      "avatar": "https://..."
    },
    "participants": [
      {
        "id": "part-1",
        "sessionId": "clxxx...",
        "userId": "user-456",
        "joinedAt": "2025-11-19T10:30:00.000Z",
        "leftAt": null,
        "user": {
          "id": "user-456",
          "name": "김철수",
          "avatar": "https://..."
        }
      }
    ]
  }
}
```

**진행 중인 세션이 없는 경우**:
```json
{
  "session": null
}
```

**에러**:
- `401`: 인증 필요
- `500`: 서버 오류

---

## 3. 참여자 관리

### 3.1 화상회의 참여

화상회의에 참여하고 참여 기록을 생성합니다.

**Endpoint**: `POST /api/my-studies/[studyId]/video-call/join`

**권한**: 스터디 멤버

**Request Body**:
```json
{
  "sessionId": "clxxx..."
}
```

**Response**:
```json
{
  "participant": {
    "id": "part-2",
    "sessionId": "clxxx...",
    "userId": "user-789",
    "joinedAt": "2025-11-19T10:35:00.000Z",
    "leftAt": null,
    "duration": null,
    "audioMutedTime": 0,
    "videoOffTime": 0,
    "screenSharedTime": 0,
    "user": {
      "id": "user-789",
      "name": "이영희",
      "avatar": "https://..."
    }
  }
}
```

**에러**:
- `401`: 인증 필요
- `403`: 접근 권한 없음
- `400`: 유효하지 않은 세션 (종료된 세션)
- `500`: 서버 오류

---

### 3.2 화상회의 퇴장

화상회의에서 퇴장하고 참여 기록을 업데이트합니다.

**Endpoint**: `POST /api/my-studies/[studyId]/video-call/leave`

**권한**: 본인

**Request Body**:
```json
{
  "sessionId": "clxxx..."
}
```

**Response**:
```json
{
  "success": true
}
```

**부가 동작**:
- 참여자의 `leftAt`과 `duration` 업데이트
- 모든 참여자가 나가면 세션도 자동 종료

**에러**:
- `401`: 인증 필요
- `404`: 참여 기록 없음
- `500`: 서버 오류

---

## 4. 통계 및 히스토리

### 4.1 세션 히스토리 조회

과거 화상회의 세션 목록을 조회합니다.

**Endpoint**: `GET /api/my-studies/[studyId]/video-call/history`

**권한**: 스터디 멤버

**Query Parameters**:
- `page` (optional): 페이지 번호 (default: 1)
- `limit` (optional): 페이지당 항목 수 (default: 20)
- `startDate` (optional): 시작 날짜 (ISO 8601)
- `endDate` (optional): 종료 날짜 (ISO 8601)

**Response**:
```json
{
  "sessions": [
    {
      "id": "clxxx...",
      "studyId": "study-123",
      "roomId": "study-study-123-main",
      "startedBy": "user-456",
      "startedAt": "2025-11-19T10:00:00.000Z",
      "endedAt": "2025-11-19T11:30:00.000Z",
      "duration": 5400,
      "starter": {
        "id": "user-456",
        "name": "김철수",
        "avatar": "https://..."
      },
      "participants": [
        {
          "id": "part-1",
          "userId": "user-456",
          "duration": 5400,
          "user": {
            "name": "김철수"
          }
        },
        {
          "id": "part-2",
          "userId": "user-789",
          "duration": 3600,
          "user": {
            "name": "이영희"
          }
        }
      ],
      "participantCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**에러**:
- `401`: 인증 필요
- `403`: 접근 권한 없음
- `500`: 서버 오류

---

### 4.2 세션 상세 정보

특정 세션의 상세 정보를 조회합니다.

**Endpoint**: `GET /api/my-studies/[studyId]/video-call/sessions/[sessionId]`

**권한**: 스터디 멤버

**Response**:
```json
{
  "session": {
    "id": "clxxx...",
    "studyId": "study-123",
    "roomId": "study-study-123-main",
    "startedBy": "user-456",
    "startedAt": "2025-11-19T10:00:00.000Z",
    "endedAt": "2025-11-19T11:30:00.000Z",
    "duration": 5400,
    "starter": {
      "id": "user-456",
      "name": "김철수",
      "avatar": "https://..."
    },
    "participants": [
      {
        "id": "part-1",
        "sessionId": "clxxx...",
        "userId": "user-456",
        "joinedAt": "2025-11-19T10:00:00.000Z",
        "leftAt": "2025-11-19T11:30:00.000Z",
        "duration": 5400,
        "audioMutedTime": 300,
        "videoOffTime": 600,
        "screenSharedTime": 1200,
        "user": {
          "id": "user-456",
          "name": "김철수",
          "avatar": "https://..."
        }
      }
    ]
  }
}
```

**에러**:
- `401`: 인증 필요
- `403`: 접근 권한 없음
- `404`: 세션 없음
- `500`: 서버 오류

---

### 4.3 사용자 통계

특정 사용자의 화상회의 참여 통계를 조회합니다.

**Endpoint**: `GET /api/my-studies/[studyId]/video-call/stats/users/[userId]`

**권한**: 본인 또는 스터디 OWNER/ADMIN

**Response**:
```json
{
  "stats": {
    "userId": "user-456",
    "totalSessions": 45,
    "totalDuration": 162000,
    "averageDuration": 3600,
    "totalAudioMutedTime": 12000,
    "totalVideoOffTime": 8000,
    "totalScreenSharedTime": 24000,
    "firstSession": "2025-10-01T10:00:00.000Z",
    "lastSession": "2025-11-19T11:30:00.000Z"
  }
}
```

**에러**:
- `401`: 인증 필요
- `403`: 접근 권한 없음
- `404`: 사용자 없음
- `500`: 서버 오류

---

### 4.4 스터디 통계

스터디 전체의 화상회의 통계를 조회합니다.

**Endpoint**: `GET /api/my-studies/[studyId]/video-call/stats`

**권한**: 스터디 멤버

**Query Parameters**:
- `period` (optional): `week` | `month` | `year` | `all` (default: `week`)

**Response**:
```json
{
  "stats": {
    "period": "week",
    "totalSessions": 12,
    "totalParticipants": 38,
    "averageParticipants": 3.2,
    "totalDuration": 43200,
    "averageDuration": 3600,
    "mostActiveUser": {
      "userId": "user-456",
      "name": "김철수",
      "sessionCount": 10
    },
    "sessionsPerDay": [
      { "date": "2025-11-13", "count": 2 },
      { "date": "2025-11-14", "count": 1 },
      { "date": "2025-11-15", "count": 3 },
      // ...
    ]
  }
}
```

**에러**:
- `401`: 인증 필요
- `403`: 접근 권한 없음
- `500`: 서버 오류

---

## 5. 에러 코드

### 5.1 HTTP 상태 코드

| 코드 | 의미 | 설명 |
|-----|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 400 | Bad Request | 잘못된 요청 (유효성 검증 실패) |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 500 | Internal Server Error | 서버 오류 |

### 5.2 에러 응답 형식

```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "details": {
    // 추가 정보 (선택)
  }
}
```

### 5.3 에러 코드 목록

| 코드 | 설명 |
|-----|------|
| `AUTH_REQUIRED` | 인증 필요 |
| `PERMISSION_DENIED` | 권한 없음 |
| `NOT_STUDY_MEMBER` | 스터디 멤버 아님 |
| `SESSION_NOT_FOUND` | 세션 없음 |
| `SESSION_ENDED` | 종료된 세션 |
| `PARTICIPANT_NOT_FOUND` | 참여 기록 없음 |
| `INVALID_REQUEST` | 잘못된 요청 |
| `SERVER_ERROR` | 서버 오류 |

---

## 6. Socket.io 이벤트

화상회의의 실시간 기능은 Socket.io를 통해 구현됩니다.

### 6.1 클라이언트 → 서버

| 이벤트 | 설명 | Payload |
|--------|------|---------|
| `video:join-room` | 방 입장 | `{ studyId, roomId }` |
| `video:leave-room` | 방 퇴장 | `{ roomId }` |
| `video:offer` | WebRTC Offer 전송 | `{ to, offer }` |
| `video:answer` | WebRTC Answer 전송 | `{ to, answer }` |
| `video:ice-candidate` | ICE Candidate 전송 | `{ to, candidate }` |
| `video:toggle-audio` | 오디오 상태 변경 | `{ roomId, isMuted }` |
| `video:toggle-video` | 비디오 상태 변경 | `{ roomId, isVideoOff }` |
| `video:screen-share-start` | 화면 공유 시작 | `{ roomId }` |
| `video:screen-share-stop` | 화면 공유 종료 | `{ roomId }` |

### 6.2 서버 → 클라이언트

| 이벤트 | 설명 | Payload |
|--------|------|---------|
| `video:room-state` | 방 상태 (참여자 목록) | `{ participants: [...] }` |
| `video:user-joined` | 새 참여자 입장 | `{ socketId, userId, user }` |
| `video:user-left` | 참여자 퇴장 | `{ socketId, userId }` |
| `video:offer` | Offer 전달 | `{ from, offer }` |
| `video:answer` | Answer 전달 | `{ from, answer }` |
| `video:ice-candidate` | ICE Candidate 전달 | `{ from, candidate }` |
| `video:peer-audio-changed` | 상대방 오디오 변경 | `{ socketId, userId, isMuted }` |
| `video:peer-video-changed` | 상대방 비디오 변경 | `{ socketId, userId, isVideoOff }` |
| `video:peer-screen-share` | 상대방 화면 공유 변경 | `{ socketId, userId, isSharing }` |

---

## 7. 사용 예제

### 7.1 화상회의 시작 및 참여

```javascript
// 1. 현재 상태 확인
const statusRes = await fetch(`/api/my-studies/${studyId}/video-call/status`);
const { session } = await statusRes.json();

let currentSession;

if (!session) {
  // 2. 세션 없으면 시작
  const startRes = await fetch(`/api/my-studies/${studyId}/video-call/start`, {
    method: 'POST'
  });
  const { session: newSession } = await startRes.json();
  currentSession = newSession;
} else {
  // 기존 세션 사용
  currentSession = session;
}

// 3. 참여 기록
const joinRes = await fetch(`/api/my-studies/${studyId}/video-call/join`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId: currentSession.id })
});

// 4. WebRTC 연결 시작
await joinRoom(true, true);
```

### 7.2 화상회의 퇴장

```javascript
// 1. WebRTC 연결 종료
leaveRoom();

// 2. 퇴장 기록
await fetch(`/api/my-studies/${studyId}/video-call/leave`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId: currentSession.id })
});

// 3. 페이지 이동
router.push(`/my-studies/${studyId}`);
```

---

**다음 문서**: [WebRTC 가이드](./05-webrtc-guide.md)

