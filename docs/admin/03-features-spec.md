# 관리자 기능 명세서

> **프로젝트**: CoUp 플랫폼 관리자 시스템  
> **작성일**: 2025-11-26  
> **버전**: 2.0  
> **이전 문서**: [02-admin-roles.md](./02-admin-roles.md)

---

## 📋 개요

관리자 시스템의 모든 기능을 영역별로 상세히 정의합니다. 각 기능은 권한, 입력/출력, 유효성 검증, 에러 처리를 포함합니다.

---

## 🎯 기능 영역 구분

### 1. 대시보드 (Dashboard)
### 2. 사용자 관리 (Users)
### 3. 스터디 관리 (Studies)
### 4. 신고 관리 (Reports)
### 5. 콘텐츠 모니터링 (Content)
### 6. 통계 분석 (Stats)
### 7. 시스템 설정 (Settings)

---

## 📊 1. 대시보드 (Dashboard)

### 1.1 핵심 통계 카드 조회
**기능**: 플랫폼의 핵심 지표를 한눈에 표시

**입력**: 없음 (자동 조회)

**출력**:
- 전체 사용자 수 + 증감 (이번 주)
- 활성 스터디 수 + 증감 (이번 주)
- 신규 가입자 수 (오늘) + 증감 (어제 대비)
- 미처리 신고 수 + 긴급 신고 수

**권한**: SYSTEM_ADMIN

**캐싱**: React Query, 30초

---

### 1.2 사용자 증가 추이 차트
**기능**: 기간별 사용자 증가 추이 시각화

**입력**:
- `period`: "week" | "month" | "year" (기본: "month")

**출력**:
- 날짜별 누적 사용자 수
- 날짜별 신규 가입자 수

**권한**: SYSTEM_ADMIN

**캐싱**: ISR, 1시간

---

### 1.3 스터디 활동 현황 차트
**기능**: 카테고리별 활성 스터디 분포

**입력**: 없음

**출력**:
- 카테고리명 + 활성 스터디 수 (6개)

**권한**: SYSTEM_ADMIN

**캐싱**: ISR, 30분

---

### 1.4 최근 신고 목록
**기능**: 최근 3개의 신고를 우선순위 순으로 표시

**입력**: 없음

**출력**:
- 신고 ID, 유형, 대상, 신고자, 시간, 우선순위

**권한**: SYSTEM_ADMIN

**실시간**: WebSocket 업데이트

---

### 1.5 실시간 시스템 상태
**기능**: 서버 리소스 사용률 모니터링

**입력**: 없음

**출력**:
- CPU 사용률 (%)
- 메모리 사용률 (%)
- 디스크 사용량 (GB / 전체GB)

**권한**: SYSTEM_ADMIN

**실시간**: 10초마다 갱신

---

## 👥 2. 사용자 관리 (Users)

### 2.1 사용자 목록 조회
**기능**: 전체 사용자를 필터링하여 조회

**입력**:
- `page`: 페이지 번호 (기본: 1)
- `limit`: 페이지당 항목 수 (기본: 20, 최대: 100)
- `status`: "active" | "suspended" | "deleted" | "all" (기본: "all")
- `search`: 검색어 (이름, 이메일)
- `provider`: "google" | "github" | "email" | "all" (기본: "all")
- `dateFrom`: 가입일 시작 (ISO 8601)
- `dateTo`: 가입일 종료 (ISO 8601)
- `role`: "USER" | "SYSTEM_ADMIN" | "all" (기본: "all")
- `sortBy`: "createdAt" | "name" | "email" (기본: "createdAt")
- `sortOrder`: "asc" | "desc" (기본: "desc")

**출력**:
```json
{
  "users": [
    {
      "id": "user-123",
      "name": "홍길동",
      "email": "hong@example.com",
      "avatar": "https://...",
      "provider": "google",
      "role": "USER",
      "status": "active",
      "createdAt": "2025-01-15T10:00:00Z",
      "lastLoginAt": "2025-11-26T14:30:00Z",
      "studyCount": 5,
      "isOnline": true
    }
  ],
  "pagination": {
    "total": 1234,
    "page": 1,
    "limit": 20,
    "totalPages": 62
  }
}
```

**권한**: SYSTEM_ADMIN

**유효성 검증**:
- `limit`: 1-100 범위
- `dateFrom`, `dateTo`: 유효한 날짜

---

### 2.2 사용자 상세 조회
**기능**: 특정 사용자의 상세 정보 및 활동 통계

**입력**:
- `userId`: 사용자 ID (필수)

**출력**:
```json
{
  "id": "user-123",
  "name": "홍길동",
  "email": "hong@example.com",
  "avatar": "https://...",
  "provider": "google",
  "role": "USER",
  "status": "active",
  "createdAt": "2025-01-15T10:00:00Z",
  "lastLoginAt": "2025-11-26T14:30:00Z",
  "bio": "안녕하세요",
  "stats": {
    "studyCount": 5,
    "completedTasksCount": 45,
    "noticesCount": 12,
    "filesCount": 8,
    "chatMessagesCount": 234
  },
  "studies": [
    {
      "id": "study-1",
      "name": "알고리즘 스터디",
      "role": "OWNER",
      "joinedAt": "2025-01-20T10:00:00Z"
    }
  ],
  "reports": {
    "asReporter": 2,
    "asTarget": 0
  },
  "suspensions": [
    {
      "id": "susp-1",
      "reason": "욕설 사용",
      "startDate": "2025-10-01T00:00:00Z",
      "endDate": "2025-10-08T00:00:00Z",
      "adminId": "admin-1"
    }
  ]
}
```

**권한**: SYSTEM_ADMIN

**에러**:
- 404: 사용자를 찾을 수 없음

---

### 2.3 사용자 정지
**기능**: 사용자 계정을 일시 정지

**입력**:
- `userId`: 사용자 ID (필수)
- `duration`: 정지 기간 (일) (필수, 1-365 또는 -1=영구)
- `reason`: 정지 사유 (필수, 10-500자)
- `notifyUser`: 이메일 통보 여부 (기본: true)

**출력**:
```json
{
  "success": true,
  "suspension": {
    "id": "susp-123",
    "userId": "user-123",
    "startDate": "2025-11-26T15:00:00Z",
    "endDate": "2025-12-03T15:00:00Z",
    "reason": "부적절한 행동",
    "adminId": "admin-1"
  }
}
```

**권한**: SYSTEM_ADMIN

**유효성 검증**:
- `duration`: 1-365 또는 -1
- `reason`: 10-500자

**부작용**:
- 사용자의 모든 세션 종료
- 사용자에게 정지 알림 발송 (이메일)
- 감사 로그 기록

---

### 2.4 사용자 정지 해제
**기능**: 정지된 사용자 계정을 복구

**입력**:
- `userId`: 사용자 ID (필수)
- `reason`: 해제 사유 (선택, 최대 500자)

**출력**:
```json
{
  "success": true,
  "message": "사용자 정지가 해제되었습니다."
}
```

**권한**: SYSTEM_ADMIN

**에러**:
- 400: 정지 상태가 아님

---

### 2.5 사용자 삭제
**기능**: 사용자 계정을 영구 삭제

**입력**:
- `userId`: 사용자 ID (필수)
- `reason`: 삭제 사유 (필수, 10-500자)
- `deleteContent`: 콘텐츠도 삭제 여부 (기본: false)

**출력**:
```json
{
  "success": true,
  "message": "사용자가 삭제되었습니다.",
  "deletedContent": {
    "notices": 5,
    "files": 3,
    "chatMessages": 100
  }
}
```

**권한**: SYSTEM_ADMIN

**확인 절차**: 2단계 확인 필요

**부작용**:
- 사용자의 모든 스터디 멤버십 삭제
- 선택 시 작성한 콘텐츠 삭제
- 감사 로그 기록

---

### 2.6 사용자 역할 변경
**기능**: 사용자 역할 변경 (USER ↔ SYSTEM_ADMIN)

**입력**:
- `userId`: 사용자 ID (필수)
- `newRole`: "USER" | "SYSTEM_ADMIN" (필수)
- `reason`: 변경 사유 (필수, 10-500자)

**출력**:
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "name": "홍길동",
    "role": "SYSTEM_ADMIN"
  }
}
```

**권한**: SYSTEM_ADMIN

**유효성 검증**:
- 본인의 역할은 변경 불가

---

## 📚 3. 스터디 관리 (Studies)

### 3.1 스터디 목록 조회
**기능**: 전체 스터디를 필터링하여 조회

**입력**:
- `page`: 페이지 번호 (기본: 1)
- `limit`: 페이지당 항목 수 (기본: 20)
- `visibility`: "public" | "private" | "all" (기본: "all")
- `category`: 카테고리 ID 또는 "all" (기본: "all")
- `search`: 검색어 (스터디명)
- `dateFrom`: 생성일 시작
- `dateTo`: 생성일 종료
- `hasReports`: true | false | null (신고된 스터디만)
- `sortBy`: "createdAt" | "memberCount" | "name"
- `sortOrder`: "asc" | "desc"

**출력**:
```json
{
  "studies": [
    {
      "id": "study-123",
      "name": "알고리즘 스터디",
      "emoji": "💻",
      "category": {
        "id": "cat-1",
        "name": "프로그래밍"
      },
      "owner": {
        "id": "user-1",
        "name": "홍길동",
        "avatar": "https://..."
      },
      "memberCount": 12,
      "maxMembers": 20,
      "isPublic": true,
      "status": "active",
      "createdAt": "2025-01-15T10:00:00Z",
      "reportCount": 0
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**권한**: SYSTEM_ADMIN

---

### 3.2 스터디 상세 조회
**기능**: 특정 스터디의 상세 정보 및 활동 통계

**입력**:
- `studyId`: 스터디 ID (필수)

**출력**:
```json
{
  "id": "study-123",
  "name": "알고리즘 스터디",
  "emoji": "💻",
  "description": "...",
  "category": {...},
  "owner": {...},
  "memberCount": 12,
  "maxMembers": 20,
  "isPublic": true,
  "status": "active",
  "createdAt": "2025-01-15T10:00:00Z",
  "stats": {
    "noticesCount": 25,
    "filesCount": 18,
    "chatMessagesCount": 1234,
    "tasksCount": 45,
    "eventsCount": 12
  },
  "members": [...],
  "reports": [...]
}
```

**권한**: SYSTEM_ADMIN

---

### 3.3 스터디 숨김 처리
**기능**: 검색 결과에서 스터디를 제외

**입력**:
- `studyId`: 스터디 ID (필수)
- `reason`: 숨김 사유 (필수, 10-500자)
- `notifyOwner`: 그룹장에게 통보 (기본: true)

**출력**:
```json
{
  "success": true,
  "message": "스터디가 숨김 처리되었습니다."
}
```

**권한**: SYSTEM_ADMIN

**부작용**:
- 스터디 상태를 "hidden"으로 변경
- 검색 결과에서 제외
- 그룹장에게 알림 발송

---

### 3.4 스터디 삭제
**기능**: 스터디를 영구 삭제

**입력**:
- `studyId`: 스터디 ID (필수)
- `reason`: 삭제 사유 (필수, 10-500자)
- `notifyMembers`: 멤버들에게 통보 (기본: true)

**출력**:
```json
{
  "success": true,
  "message": "스터디가 삭제되었습니다.",
  "deletedContent": {
    "notices": 25,
    "files": 18,
    "chatMessages": 1234
  }
}
```

**권한**: SYSTEM_ADMIN

**확인 절차**: 2단계 확인 필요

---

## 🚨 4. 신고 관리 (Reports)

### 4.1 신고 목록 조회
**기능**: 전체 신고를 필터링하여 조회

**입력**:
- `page`, `limit` (페이지네이션)
- `status`: "pending" | "resolved" | "dismissed" | "all"
- `priority`: "urgent" | "high" | "normal" | "low" | "all"
- `type`: "spam" | "abuse" | "harassment" | "fraud" | "copyright" | "other" | "all"
- `search`: 검색어
- `dateFrom`, `dateTo`: 신고일 범위

**출력**: 신고 목록 + 페이지네이션

**권한**: SYSTEM_ADMIN

---

### 4.2 신고 상세 조회
**기능**: 특정 신고의 상세 정보

**입력**:
- `reportId`: 신고 ID (필수)

**출력**:
```json
{
  "id": "report-123",
  "type": "spam",
  "target": {
    "type": "user" | "study" | "content",
    "id": "...",
    "name": "..."
  },
  "reporter": {...},
  "reason": "스팸 행위",
  "evidence": ["url1", "url2"],
  "priority": "high",
  "status": "pending",
  "createdAt": "2025-11-26T10:00:00Z",
  "resolution": null
}
```

**권한**: SYSTEM_ADMIN

---

### 4.3 신고 처리
**기능**: 신고를 검토하고 조치

**입력**:
- `reportId`: 신고 ID (필수)
- `action`: "warn" | "suspend" | "delete" | "dismiss" (필수)
- `reason`: 처리 사유 (필수, 10-500자)
- `suspensionDays`: 정지 기간 (action=suspend 시 필수)
- `notifyReporter`: 신고자에게 통보 (기본: true)
- `notifyTarget`: 대상에게 통보 (기본: true)

**출력**:
```json
{
  "success": true,
  "resolution": {
    "action": "suspend",
    "reason": "부적절한 행동",
    "executedAt": "2025-11-26T15:00:00Z"
  }
}
```

**권한**: SYSTEM_ADMIN

**부작용**:
- 신고 상태를 "resolved"로 변경
- 해당 조치 실행 (경고/정지/삭제)
- 신고자 및 대상에게 알림

---

## 📝 5. 콘텐츠 모니터링 (Content)

### 5.1 공지사항 모니터링
**기능**: 전체 공지사항 검색 및 조회

**입력**:
- `search`: 검색어 (제목, 내용)
- `studyId`: 특정 스터디 (선택)
- `dateFrom`, `dateTo`: 작성일 범위

**출력**: 공지사항 목록

**권한**: SYSTEM_ADMIN

---

### 5.2 공지사항 삭제
**기능**: 부적절한 공지사항 삭제

**입력**:
- `noticeId`: 공지사항 ID (필수)
- `reason`: 삭제 사유 (필수)

**권한**: SYSTEM_ADMIN

---

### 5.3 파일 모니터링
**기능**: 전체 파일 검색 및 조회

**입력**: 검색 조건

**출력**: 파일 목록

**권한**: SYSTEM_ADMIN

---

### 5.4 채팅 메시지 모니터링
**기능**: 전체 채팅 메시지 검색

**입력**:
- `search`: 검색어
- `studyId`: 특정 스터디

**출력**: 채팅 메시지 목록

**권한**: SYSTEM_ADMIN

---

## 📈 6. 통계 분석 (Stats)

### 6.1 플랫폼 통계
**기능**: 전체 플랫폼 통계

**출력**:
- 전체 사용자 수
- 활성 사용자 수 (7일, 30일)
- 전체 스터디 수
- 활성 스터디 수
- 총 콘텐츠 수

**권한**: SYSTEM_ADMIN

**캐싱**: ISR, 1시간

---

## ⚙️ 7. 시스템 설정 (Settings)

### 7.1 카테고리 관리
**기능**: CRUD + 순서 변경

**입력**: 카테고리 정보

**권한**: SYSTEM_ADMIN

---

### 7.2 시스템 설정 변경
**기능**: 플랫폼 설정 수정

**입력**: 설정 키-값

**권한**: SYSTEM_ADMIN

---

## 🔗 관련 문서

- [관리자 역할](./02-admin-roles.md)
- [시스템 아키텍처](./04-architecture.md)
- [API 명세](../backend/api/admin/01-overview.md)

---

**작성일**: 2025-11-26  
**다음 문서**: [04-architecture.md](./04-architecture.md)

