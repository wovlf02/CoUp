# 스터디 핵심 API 명세 - Part 2: 멤버 관리

## 📋 개요
- **Base URL**: `/api/studies/[studyId]`
- **총 엔드포인트**: 8개
- **권한**: MEMBER, ADMIN, OWNER 단계별

---

## 🚪 1. 스터디 가입 신청
**POST** `/api/studies/[studyId]/join`

🔒 **인증 필요**

### Request Body
```json
{
  "introduction": "안녕하세요! 알고리즘을 열심히 공부하고 싶습니다",
  "motivation": "코딩테스트 준비를 위해",
  "level": "중급"
}
```

### Validation
- `introduction`: 10-200자 (선택)
- `motivation`: 10-200자 (선택)
- `level`: "초급", "중급", "상급" (선택)

### Response (201) - 자동 승인
```json
{
  "success": true,
  "message": "스터디에 가입되었습니다",
  "data": {
    "id": "member-id",
    "studyId": "study-1",
    "userId": "user-1",
    "role": "MEMBER",
    "status": "ACTIVE",
    "approvedAt": "2025-11-18T10:00:00.000Z"
  }
}
```

### Response (201) - 수동 승인
```json
{
  "success": true,
  "message": "가입 신청이 완료되었습니다. 승인을 기다려주세요",
  "data": {
    "id": "member-id",
    "studyId": "study-1",
    "userId": "user-1",
    "role": "MEMBER",
    "status": "PENDING",
    "approvedAt": null
  }
}
```

### Error Responses
- **400**: 이미 가입된 스터디
- **400**: 가입 대기 중
- **400**: 모집 중이 아님
- **400**: 정원 마감

### 자동 승인 조건
```javascript
if (study.autoApprove) {
  status = 'ACTIVE'
  approvedAt = new Date()
  // 알림 생성
}
```

---

## 📋 2. 가입 신청 목록
**GET** `/api/studies/[studyId]/join-requests`

🔒 **ADMIN+ 권한 필요**

### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "member-id",
      "user": {
        "id": "user-1",
        "name": "박준혁",
        "email": "park@example.com",
        "avatar": "https://...",
        "bio": "풀스택 개발자 지망생입니다"
      },
      "introduction": "열심히 하겠습니다!",
      "motivation": "취업 준비",
      "level": "초급",
      "joinedAt": "2025-11-18T09:00:00.000Z"
    }
  ]
}
```

### 정렬
- 신청일 역순 (최신순)

---

## ✅ 3. 가입 승인
**POST** `/api/studies/[studyId]/members/[userId]/approve`

🔒 **ADMIN+ 권한 필요**

### Response (200)
```json
{
  "success": true,
  "message": "가입 신청을 승인했습니다",
  "data": {
    "id": "member-id",
    "status": "ACTIVE",
    "approvedAt": "2025-11-18T10:30:00.000Z"
  }
}
```

### 자동 처리
1. `status` → `ACTIVE`
2. `approvedAt` 설정
3. 승인 알림 생성

### 알림 생성
```javascript
{
  type: 'JOIN_APPROVED',
  message: '${studyName} 가입이 승인되었습니다'
}
```

---

## ❌ 4. 가입 거절
**POST** `/api/studies/[studyId]/members/[userId]/reject`

🔒 **ADMIN+ 권한 필요**

### Response (200)
```json
{
  "success": true,
  "message": "가입 신청을 거절했습니다"
}
```

### 처리 방식
- StudyMember 레코드 **삭제** (거절 이력 남기지 않음)

---

## 👥 5. 멤버 목록 조회
**GET** `/api/studies/[studyId]/members`

🔒 **MEMBER+ 권한 필요**

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `role` | string | - | `OWNER`, `ADMIN`, `MEMBER` |
| `status` | string | `ACTIVE` | `ACTIVE`, `PENDING` |

### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "member-1",
      "role": "OWNER",
      "status": "ACTIVE",
      "user": {
        "id": "user-1",
        "name": "김민준",
        "email": "kim@example.com",
        "avatar": "https://...",
        "bio": "백엔드 개발자입니다"
      },
      "joinedAt": "2025-10-01T10:00:00.000Z",
      "approvedAt": "2025-10-01T10:00:00.000Z"
    }
  ]
}
```

### 정렬
1. 역할 순 (OWNER > ADMIN > MEMBER)
2. 가입일 순 (빠른 순)

---

## 👑 6. 역할 변경
**PATCH** `/api/studies/[studyId]/members/[userId]/role`

🔒 **OWNER만 가능**

### Request Body
```json
{
  "role": "ADMIN"
}
```

### 가능한 역할
- `MEMBER` ↔ `ADMIN`
- `OWNER`는 변경 불가

### Response (200)
```json
{
  "success": true,
  "message": "역할이 변경되었습니다",
  "data": {
    "id": "member-id",
    "role": "ADMIN"
  }
}
```

### Error Responses
- **400**: OWNER 역할 변경 시도
- **403**: OWNER가 아닌 경우

---

## 🚫 7. 멤버 강퇴
**DELETE** `/api/studies/[studyId]/members/[userId]`

🔒 **ADMIN+ 권한 필요**

### Response (200)
```json
{
  "success": true,
  "message": "멤버를 강퇴했습니다"
}
```

### 제약 조건
- 자기 자신 강퇴 불가
- OWNER 강퇴 불가

### 처리 방식
- `status` → `KICKED` (삭제하지 않음)
- 강퇴 알림 생성

### 알림 생성
```javascript
{
  type: 'KICK',
  message: '${studyName}에서 강퇴되었습니다'
}
```

---

## 🚪 8. 스터디 탈퇴
**DELETE** `/api/studies/[studyId]/leave`

🔒 **인증 필요**

### Response (200)
```json
{
  "success": true,
  "message": "스터디를 탈퇴했습니다"
}
```

### 제약 조건
- **OWNER는 탈퇴 불가**
  - 스터디를 삭제하거나
  - 소유권을 이전해야 함

### 처리 방식
- `status` → `LEFT`

---

## 🎭 권한 계층

### 역할별 권한
```
OWNER (스터디장)
├─ 스터디 수정/삭제
├─ 역할 변경 (ADMIN ↔ MEMBER)
├─ 강퇴
├─ 가입 승인/거절
└─ 멤버 목록 조회

ADMIN (관리자)
├─ 강퇴 (OWNER 제외)
├─ 가입 승인/거절
└─ 멤버 목록 조회

MEMBER (일반 멤버)
└─ 멤버 목록 조회
```

### 권한 확인 헬퍼
```javascript
// src/lib/auth-helpers.js
export async function requireStudyMember(studyId, minRole = 'MEMBER') {
  const session = await requireAuth()
  
  const member = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: { studyId, userId: session.user.id }
    }
  })

  if (!member || member.status !== 'ACTIVE') {
    return NextResponse.json({ error: "스터디 멤버가 아닙니다" }, { status: 403 })
  }

  const roleHierarchy = { MEMBER: 0, ADMIN: 1, OWNER: 2 }
  if (roleHierarchy[member.role] < roleHierarchy[minRole]) {
    return NextResponse.json({ error: "권한이 부족합니다" }, { status: 403 })
  }

  return { session, member }
}
```

---

## 📊 멤버 상태 관리

### 상태 전이도
```
       [가입 신청]
            ↓
      ┌─ PENDING ─┐
      │            │
   [승인]       [거절]
      ↓            ↓
   ACTIVE       DELETE
      │
   [강퇴]
      ↓
   KICKED

   ACTIVE
      │
   [탈퇴]
      ↓
    LEFT
```

### 상태별 설명
- **PENDING**: 가입 대기 (autoApprove=false)
- **ACTIVE**: 활성 멤버
- **KICKED**: 강퇴됨
- **LEFT**: 자진 탈퇴
- **DELETE**: 거절됨 (레코드 삭제)

---

## 📝 Client Usage 예시

### 가입 신청
```javascript
import { useJoinStudy } from '@/lib/hooks/useApi'

function StudyDetailPage({ studyId }) {
  const joinStudy = useJoinStudy(studyId)

  const handleJoin = async () => {
    try {
      await joinStudy.mutateAsync({
        introduction: '열심히 하겠습니다',
        level: '중급'
      })
      toast.success('가입 신청 완료!')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return <button onClick={handleJoin}>가입 신청</button>
}
```

### 가입 신청 관리
```javascript
function JoinRequestsPage({ studyId }) {
  const { data } = useJoinRequests(studyId)
  const approve = useApproveMember(studyId)
  const reject = useRejectMember(studyId)

  return (
    <div>
      {data.map(request => (
        <RequestCard
          key={request.id}
          request={request}
          onApprove={() => approve.mutate(request.user.id)}
          onReject={() => reject.mutate(request.user.id)}
        />
      ))}
    </div>
  )
}
```

---

**최종 업데이트**: 2025-11-18  
**다음 파일**: [05-study-content.md](./05-study-content.md) (공지/일정/할일)

