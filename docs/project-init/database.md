# CoUp 데이터베이스 설계 (Database Design)

> **작성일**: 2025년 11월 5일  
> **DBMS**: PostgreSQL 15  
> **ORM**: Prisma 5.x  
> **인코딩**: UTF-8

---

## 📋 목차

1. [개요](#개요)
2. [데이터베이스 아키텍처](#데이터베이스-아키텍처)
3. [테이블 설계](#테이블-설계)
4. [관계 (Relationships)](#관계-relationships)
5. [인덱스 전략](#인덱스-전략)
6. [제약조건 (Constraints)](#제약조건-constraints)
7. [데이터 무결성](#데이터-무결성)
8. [성능 최적화](#성능-최적화)
9. [백업 및 복구](#백업-및-복구)
10. [마이그레이션 전략](#마이그레이션-전략)

---

## 개요

### 설계 원칙

1. **정규화**: 3NF (Third Normal Form) 준수
2. **확장성**: 수평 확장 가능한 구조
3. **성능**: 적절한 인덱싱과 쿼리 최적화
4. **보안**: 민감 데이터 암호화, 접근 제어
5. **유지보수성**: 명확한 네이밍, 주석, 문서화

### 주요 특징

- **CASCADE 삭제**: 부모 삭제 시 자식 자동 삭제
- **Soft Delete**: 실제 삭제 대신 상태 변경 (선택적)
- **타임스탬프**: 모든 테이블에 createdAt, updatedAt
- **UUID vs Auto Increment**: Auto Increment 사용 (성능 우선)

---

## 데이터베이스 아키텍처

### 스키마 구조

```
coup_db (Database)
├── public (Schema)
│   ├── User (사용자)
│   ├── StudyGroup (스터디 그룹)
│   ├── StudyMember (스터디 멤버)
│   ├── Message (채팅 메시지)
│   ├── Notice (공지사항)
│   ├── File (파일)
│   ├── Event (일정)
│   ├── Task (할 일)
│   └── Notification (알림)
```

### ERD 다이어그램

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│     User     │────1:N──│  StudyMember     │──N:1────│  StudyGroup  │
│              │         │                  │         │              │
│  id          │         │  id              │         │  id          │
│  email       │         │  userId (FK)     │         │  name        │
│  name        │         │  groupId (FK)    │         │  ownerId(FK) │
│  imageUrl    │         │  role            │         │  category    │
│  provider    │         │  createdAt       │         │  maxMembers  │
│  createdAt   │         └──────────────────┘         │  createdAt   │
└──────────────┘                                      └──────────────┘
       │                                                     │
       │                                                     │
       │                                              ┌──────┴──────┐
       │                                              │             │
       │                                         1:N  │        1:N  │
       │                                              │             │
       │                                      ┌───────▼─────┐  ┌────▼──────┐
       │                                      │   Notice    │  │   File    │
       │                                      │             │  │           │
       │                                      │  id         │  │  id       │
       │                                      │  title      │  │  name     │
       │                                      │  content    │  │  url      │
       │                                      │  groupId(FK)│  │  groupId  │
       │                                      │  authorId   │  │  uploader │
       │                                      └─────────────┘  └───────────┘
       │                                              │
       │                                         1:N  │
       │                                              │
       │                                      ┌───────▼─────┐
       │                                      │   Message   │
       │                                      │             │
       │                                      │  id         │
       │                                      │  content    │
       │                                      │  userId(FK) │
       │                                      │  groupId(FK)│
       │                                      └─────────────┘
       │
       │                                      ┌──────────────┐
       │                                      │    Event     │
       │                                      │              │
       │                                      │  id          │
       │                                      │  title       │
       │                                      │  startDate   │
       │                                      │  groupId(FK) │
       │                                      └──────────────┘
       │
       │                                      ┌──────────────┐
       │                                      │     Task     │
       │                                      │              │
       │                                      │  id          │
       │                                      │  content     │
       │                                      │  assigneeId  │
       │                                      │  groupId(FK) │
       │                                      └──────────────┘
       │
       └─────────1:N───────────────┐
                                   │
                           ┌───────▼──────────┐
                           │  Notification    │
                           │                  │
                           │  id              │
                           │  type            │
                           │  message         │
                           │  userId (FK)     │
                           │  isRead          │
                           └──────────────────┘
```

---

## 테이블 설계

### 1. User (사용자)

**목적**: 사용자 계정 정보 관리

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| id | SERIAL | PRIMARY KEY | 사용자 고유 ID (자동 증가) |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| name | VARCHAR(100) | NOT NULL | 사용자 이름 |
| imageUrl | TEXT | NULL | 프로필 이미지 URL |
| bio | TEXT | NULL | 자기소개 (최대 500자) |
| provider | VARCHAR(20) | NOT NULL | OAuth 제공자 (google, github) |
| providerId | VARCHAR(255) | UNIQUE, NOT NULL | OAuth 제공자의 사용자 ID |
| status | VARCHAR(20) | DEFAULT 'active' | 계정 상태 (active, suspended, deleted) |
| createdAt | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updatedAt | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**인덱스**:
- `idx_user_email` (email)
- `idx_user_provider_id` (provider, providerId)
- `idx_user_status` (status)

**제약조건**:
```sql
CHECK (provider IN ('google', 'github'))
CHECK (status IN ('active', 'suspended', 'deleted'))
CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100)
CHECK (LENGTH(bio) <= 500)
```

---

### 2. StudyGroup (스터디 그룹)

**목적**: 스터디 그룹 정보 관리

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| id | SERIAL | PRIMARY KEY | 스터디 고유 ID |
| name | VARCHAR(100) | NOT NULL | 스터디 이름 |
| description | TEXT | NOT NULL | 스터디 소개 (최대 1000자) |
| category | VARCHAR(50) | NOT NULL | 카테고리 (프로그래밍, 취업준비 등) |
| subcategory | VARCHAR(50) | NULL | 서브카테고리 (웹개발, 알고리즘 등) |
| visibility | VARCHAR(20) | DEFAULT 'PUBLIC' | 공개 여부 (PUBLIC, PRIVATE) |
| maxMembers | INTEGER | DEFAULT 10 | 최대 멤버 수 (2-100) |
| imageUrl | TEXT | NULL | 스터디 대표 이미지 URL |
| ownerId | INTEGER | NOT NULL, FK | 스터디 소유자 (User.id) |
| status | VARCHAR(20) | DEFAULT 'active' | 스터디 상태 (active, inactive, deleted) |
| createdAt | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updatedAt | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**외래키**:
- `ownerId` → User(id) ON DELETE CASCADE

**인덱스**:
- `idx_studygroup_category` (category)
- `idx_studygroup_visibility` (visibility)
- `idx_studygroup_owner` (ownerId)
- `idx_studygroup_status` (status)
- `idx_studygroup_created` (createdAt DESC)

**제약조건**:
```sql
CHECK (visibility IN ('PUBLIC', 'PRIVATE'))
CHECK (status IN ('active', 'inactive', 'deleted'))
CHECK (maxMembers >= 2 AND maxMembers <= 100)
CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100)
CHECK (LENGTH(description) >= 10 AND LENGTH(description) <= 1000)
```

---

### 3. StudyMember (스터디 멤버)

**목적**: 사용자와 스터디 그룹 간의 다대다 관계 관리

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| id | SERIAL | PRIMARY KEY | 멤버십 고유 ID |
| userId | INTEGER | NOT NULL, FK | 사용자 ID |
| groupId | INTEGER | NOT NULL, FK | 스터디 그룹 ID |
| role | VARCHAR(20) | DEFAULT 'MEMBER' | 역할 (OWNER, ADMIN, MEMBER) |
| status | VARCHAR(20) | DEFAULT 'active' | 멤버 상태 (active, kicked) |
| createdAt | TIMESTAMP | DEFAULT NOW() | 가입일시 |
| updatedAt | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**외래키**:
- `userId` → User(id) ON DELETE CASCADE
- `groupId` → StudyGroup(id) ON DELETE CASCADE

**인덱스**:
- `idx_studymember_user` (userId)
- `idx_studymember_group` (groupId)
- `idx_studymember_role` (role)
- `idx_studymember_created` (createdAt DESC)

**유니크 제약조건**:
- `unique_user_group` (userId, groupId) - 한 사용자는 같은 스터디에 한 번만 가입

**제약조건**:
```sql
CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER'))
CHECK (status IN ('active', 'kicked'))
```

---

### 4. Message (채팅 메시지)

**목적**: 스터디 그룹 내 채팅 메시지 저장

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| id | SERIAL | PRIMARY KEY | 메시지 고유 ID |
| content | TEXT | NOT NULL | 메시지 내용 (최대 2000자) |
| userId | INTEGER | NOT NULL, FK | 작성자 ID |
| groupId | INTEGER | NOT NULL, FK | 스터디 그룹 ID |
| type | VARCHAR(20) | DEFAULT 'TEXT' | 메시지 타입 (TEXT, SYSTEM, IMAGE) |
| metadata | JSONB | NULL | 추가 메타데이터 (이미지 URL 등) |
| createdAt | TIMESTAMP | DEFAULT NOW() | 전송일시 |

**외래키**:
- `userId` → User(id) ON DELETE CASCADE
- `groupId` → StudyGroup(id) ON DELETE CASCADE

**인덱스**:
- `idx_message_group_created` (groupId, createdAt DESC) - 채팅 히스토리 조회 최적화
- `idx_message_user` (userId)

**제약조건**:
```sql
CHECK (type IN ('TEXT', 'SYSTEM', 'IMAGE'))
CHECK (LENGTH(content) <= 2000)
```

**파티셔닝 전략** (선택적, 대용량 메시지 처리 시):
```sql
-- 월별 파티셔닝 (시계열 데이터 최적화)
CREATE TABLE message_2025_01 PARTITION OF message
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

---

### 5. Notice (공지사항)

**목적**: 스터디 그룹 공지사항 관리

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| id | SERIAL | PRIMARY KEY | 공지사항 고유 ID |
| title | VARCHAR(200) | NOT NULL | 제목 |
| content | TEXT | NOT NULL | 내용 (Markdown, 최대 10000자) |
| isPinned | BOOLEAN | DEFAULT FALSE | 상단 고정 여부 |
| authorId | INTEGER | NOT NULL, FK | 작성자 ID |
| groupId | INTEGER | NOT NULL, FK | 스터디 그룹 ID |
| createdAt | TIMESTAMP | DEFAULT NOW() | 작성일시 |
| updatedAt | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**외래키**:
- `authorId` → User(id) ON DELETE SET NULL (작성자 탈퇴 시 NULL)
- `groupId` → StudyGroup(id) ON DELETE CASCADE

**인덱스**:
- `idx_notice_group_pinned` (groupId, isPinned DESC, createdAt DESC)
- `idx_notice_author` (authorId)

**제약조건**:
```sql
CHECK (LENGTH(title) >= 2 AND LENGTH(title) <= 200)
CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 10000)
```

---

### 6. File (파일)

**목적**: 스터디 그룹 내 공유 파일 메타데이터 관리

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| id | SERIAL | PRIMARY KEY | 파일 고유 ID |
| name | VARCHAR(255) | NOT NULL | 원본 파일명 |
| url | TEXT | NOT NULL | S3 파일 URL |
| size | BIGINT | NOT NULL | 파일 크기 (bytes) |
| mimeType | VARCHAR(100) | NOT NULL | MIME 타입 (application/pdf 등) |
| key | TEXT | NOT NULL | S3 객체 키 (삭제용) |
| uploaderId | INTEGER | NOT NULL, FK | 업로더 ID |
| groupId | INTEGER | NOT NULL, FK | 스터디 그룹 ID |
| status | VARCHAR(20) | DEFAULT 'active' | 파일 상태 (active, deleted) |
| createdAt | TIMESTAMP | DEFAULT NOW() | 업로드일시 |

**외래키**:
- `uploaderId` → User(id) ON DELETE SET NULL
- `groupId` → StudyGroup(id) ON DELETE CASCADE

**인덱스**:
- `idx_file_group_created` (groupId, createdAt DESC)
- `idx_file_uploader` (uploaderId)
- `idx_file_status` (status)

**제약조건**:
```sql
CHECK (status IN ('active', 'deleted'))
CHECK (size > 0 AND size <= 52428800) -- 최대 50MB
```

---

### 7. Event (일정)

**목적**: 스터디 그룹 일정 관리

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| id | SERIAL | PRIMARY KEY | 일정 고유 ID |
| title | VARCHAR(200) | NOT NULL | 일정 제목 |
| description | TEXT | NULL | 일정 설명 (최대 1000자) |
| startDate | TIMESTAMP | NOT NULL | 시작 일시 |
| endDate | TIMESTAMP | NOT NULL | 종료 일시 |
| type | VARCHAR(20) | DEFAULT 'EVENT' | 일정 유형 (EVENT, MEETING, DEADLINE) |
| location | VARCHAR(255) | NULL | 장소 (온라인/오프라인) |
| groupId | INTEGER | NOT NULL, FK | 스터디 그룹 ID |
| createdBy | INTEGER | NOT NULL, FK | 생성자 ID |
| createdAt | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updatedAt | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**외래키**:
- `groupId` → StudyGroup(id) ON DELETE CASCADE
- `createdBy` → User(id) ON DELETE SET NULL

**인덱스**:
- `idx_event_group_start` (groupId, startDate ASC) - 캘린더 조회 최적화
- `idx_event_type` (type)
- `idx_event_date_range` (startDate, endDate)

**제약조건**:
```sql
CHECK (type IN ('EVENT', 'MEETING', 'DEADLINE'))
CHECK (endDate >= startDate)
CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200)
```

---

### 8. Task (할 일)

**목적**: 스터디 그룹 할 일 관리

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| id | SERIAL | PRIMARY KEY | 할 일 고유 ID |
| content | TEXT | NOT NULL | 할 일 내용 (최대 1000자) |
| isCompleted | BOOLEAN | DEFAULT FALSE | 완료 여부 |
| assigneeId | INTEGER | NULL, FK | 담당자 ID (NULL 가능) |
| dueDate | TIMESTAMP | NULL | 마감일 (NULL 가능) |
| priority | VARCHAR(20) | DEFAULT 'MEDIUM' | 우선순위 (HIGH, MEDIUM, LOW) |
| groupId | INTEGER | NOT NULL, FK | 스터디 그룹 ID |
| createdBy | INTEGER | NOT NULL, FK | 생성자 ID |
| completedAt | TIMESTAMP | NULL | 완료일시 |
| createdAt | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updatedAt | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**외래키**:
- `assigneeId` → User(id) ON DELETE SET NULL
- `groupId` → StudyGroup(id) ON DELETE CASCADE
- `createdBy` → User(id) ON DELETE SET NULL

**인덱스**:
- `idx_task_group_status` (groupId, isCompleted, priority DESC, dueDate ASC)
- `idx_task_assignee` (assigneeId, isCompleted)
- `idx_task_duedate` (dueDate ASC) WHERE dueDate IS NOT NULL

**제약조건**:
```sql
CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW'))
CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 1000)
```

**트리거** (완료 시 completedAt 자동 업데이트):
```sql
CREATE OR REPLACE FUNCTION update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.isCompleted = TRUE AND OLD.isCompleted = FALSE THEN
    NEW.completedAt = NOW();
  ELSIF NEW.isCompleted = FALSE THEN
    NEW.completedAt = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_completed_at_trigger
BEFORE UPDATE ON "Task"
FOR EACH ROW
EXECUTE FUNCTION update_task_completed_at();
```

---

### 9. Notification (알림)

**목적**: 사용자 알림 관리

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| id | SERIAL | PRIMARY KEY | 알림 고유 ID |
| type | VARCHAR(50) | NOT NULL | 알림 유형 (NEW_NOTICE, NEW_MESSAGE 등) |
| title | VARCHAR(200) | NOT NULL | 알림 제목 |
| message | TEXT | NOT NULL | 알림 내용 (최대 500자) |
| link | TEXT | NULL | 관련 페이지 링크 |
| isRead | BOOLEAN | DEFAULT FALSE | 읽음 여부 |
| userId | INTEGER | NOT NULL, FK | 수신자 ID |
| relatedId | INTEGER | NULL | 관련 리소스 ID (스터디 ID, 공지 ID 등) |
| relatedType | VARCHAR(50) | NULL | 관련 리소스 타입 (STUDY, NOTICE 등) |
| createdAt | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| readAt | TIMESTAMP | NULL | 읽은 일시 |

**외래키**:
- `userId` → User(id) ON DELETE CASCADE

**인덱스**:
- `idx_notification_user_read` (userId, isRead, createdAt DESC) - 알림 목록 조회 최적화
- `idx_notification_created` (createdAt DESC)

**제약조건**:
```sql
CHECK (type IN (
  'STUDY_JOIN', 'NEW_NOTICE', 'NEW_MESSAGE', 'MEMBER_KICKED',
  'EVENT_CREATED', 'TASK_ASSIGNED', 'TASK_COMPLETED'
))
CHECK (LENGTH(message) <= 500)
```

**트리거** (읽음 처리 시 readAt 자동 업데이트):
```sql
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.isRead = TRUE AND OLD.isRead = FALSE THEN
    NEW.readAt = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_read_at_trigger
BEFORE UPDATE ON "Notification"
FOR EACH ROW
EXECUTE FUNCTION update_notification_read_at();
```

**데이터 정리** (30일 이상 읽은 알림 자동 삭제):
```sql
-- Cron Job으로 주기적 실행
DELETE FROM "Notification"
WHERE isRead = TRUE
  AND readAt < NOW() - INTERVAL '30 days';
```

---

### 10. Session (NextAuth.js 세션)

**목적**: NextAuth.js 세션 관리 (선택적, JWT 사용 시 불필요)

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| id | VARCHAR(255) | PRIMARY KEY | 세션 ID |
| sessionToken | VARCHAR(255) | UNIQUE, NOT NULL | 세션 토큰 |
| userId | INTEGER | NOT NULL, FK | 사용자 ID |
| expires | TIMESTAMP | NOT NULL | 만료 일시 |

**외래키**:
- `userId` → User(id) ON DELETE CASCADE

**인덱스**:
- `idx_session_token` (sessionToken)
- `idx_session_user` (userId)

---

### 11. Account (OAuth 계정 연동)

**목적**: NextAuth.js OAuth 계정 정보 관리

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| id | SERIAL | PRIMARY KEY | 계정 고유 ID |
| userId | INTEGER | NOT NULL, FK | 사용자 ID |
| type | VARCHAR(50) | NOT NULL | 계정 타입 (oauth) |
| provider | VARCHAR(50) | NOT NULL | 제공자 (google, github) |
| providerAccountId | VARCHAR(255) | NOT NULL | 제공자의 계정 ID |
| refresh_token | TEXT | NULL | 갱신 토큰 |
| access_token | TEXT | NULL | 액세스 토큰 |
| expires_at | INTEGER | NULL | 만료 시간 (Unix timestamp) |
| token_type | VARCHAR(50) | NULL | 토큰 타입 (Bearer) |
| scope | TEXT | NULL | 권한 범위 |
| id_token | TEXT | NULL | ID 토큰 |
| session_state | VARCHAR(255) | NULL | 세션 상태 |

**외래키**:
- `userId` → User(id) ON DELETE CASCADE

**인덱스**:
- `idx_account_user` (userId)
- `idx_account_provider` (provider, providerAccountId)

**유니크 제약조건**:
- `unique_provider_account` (provider, providerAccountId)

---

## 관계 (Relationships)

### 주요 관계 다이어그램

#### 1. User ↔ StudyGroup (다대다)
```
User ──1:N── StudyMember ──N:1── StudyGroup
```
- 한 사용자는 여러 스터디에 가입 가능
- 한 스터디는 여러 멤버 보유
- StudyMember 테이블로 관계 관리 (role 포함)

#### 2. StudyGroup ↔ Content (일대다)
```
StudyGroup ──1:N── Notice
           ──1:N── File
           ──1:N── Event
           ──1:N── Task
           ──1:N── Message
```
- 한 스터디는 여러 콘텐츠 보유
- 모든 콘텐츠는 하나의 스터디에만 속함
- CASCADE 삭제: 스터디 삭제 시 모든 콘텐츠 삭제

#### 3. User ↔ Notification (일대다)
```
User ──1:N── Notification
```
- 한 사용자는 여러 알림 수신
- CASCADE 삭제: 사용자 삭제 시 알림도 삭제

### 관계 매트릭스

| 테이블 | User | StudyGroup | StudyMember | Message | Notice | File | Event | Task | Notification |
|--------|------|------------|-------------|---------|--------|------|-------|------|--------------|
| User | - | 1:N (소유) | 1:N | 1:N | 1:N | 1:N | 1:N | 1:N (담당) | 1:N |
| StudyGroup | N:1 | - | 1:N | 1:N | 1:N | 1:N | 1:N | 1:N | - |
| StudyMember | N:1 | N:1 | - | - | - | - | - | - | - |

---

## 인덱스 전략

### 인덱스 설계 원칙

1. **WHERE 절 컬럼**: 자주 필터링되는 컬럼
2. **JOIN 컬럼**: 외래키는 기본 인덱스
3. **ORDER BY 컬럼**: 정렬에 사용되는 컬럼
4. **복합 인덱스**: 함께 사용되는 컬럼들

### 주요 인덱스 목록

#### 사용자 관련
```sql
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_provider ON "User"(provider, providerId);
CREATE INDEX idx_user_status ON "User"(status) WHERE status != 'active';
```

#### 스터디 관련
```sql
CREATE INDEX idx_studygroup_category ON "StudyGroup"(category);
CREATE INDEX idx_studygroup_visibility ON "StudyGroup"(visibility) WHERE visibility = 'PUBLIC';
CREATE INDEX idx_studygroup_created ON "StudyGroup"(createdAt DESC);
CREATE INDEX idx_studygroup_owner ON "StudyGroup"(ownerId);
```

#### 멤버 관련
```sql
CREATE INDEX idx_studymember_user ON "StudyMember"(userId);
CREATE INDEX idx_studymember_group ON "StudyMember"(groupId);
CREATE INDEX idx_studymember_composite ON "StudyMember"(groupId, role);
```

#### 채팅 관련
```sql
CREATE INDEX idx_message_group_created ON "Message"(groupId, createdAt DESC);
-- 커서 기반 페이지네이션 최적화
CREATE INDEX idx_message_cursor ON "Message"(groupId, id DESC);
```

#### 공지사항 관련
```sql
CREATE INDEX idx_notice_group_pinned ON "Notice"(groupId, isPinned DESC, createdAt DESC);
```

#### 파일 관련
```sql
CREATE INDEX idx_file_group_created ON "File"(groupId, createdAt DESC);
```

#### 일정 관련
```sql
CREATE INDEX idx_event_group_start ON "Event"(groupId, startDate ASC);
CREATE INDEX idx_event_date_range ON "Event"(startDate, endDate);
```

#### 할 일 관련
```sql
CREATE INDEX idx_task_group_status ON "Task"(groupId, isCompleted, priority DESC);
CREATE INDEX idx_task_assignee ON "Task"(assigneeId) WHERE assigneeId IS NOT NULL;
CREATE INDEX idx_task_duedate ON "Task"(dueDate ASC) WHERE dueDate IS NOT NULL;
```

#### 알림 관련
```sql
CREATE INDEX idx_notification_user_read ON "Notification"(userId, isRead, createdAt DESC);
```

### 부분 인덱스 (Partial Index)

```sql
-- 공개 스터디만 인덱싱
CREATE INDEX idx_studygroup_public ON "StudyGroup"(category, createdAt DESC)
WHERE visibility = 'PUBLIC' AND status = 'active';

-- 읽지 않은 알림만 인덱싱
CREATE INDEX idx_notification_unread ON "Notification"(userId, createdAt DESC)
WHERE isRead = FALSE;

-- 미완료 할 일만 인덱싱
CREATE INDEX idx_task_pending ON "Task"(groupId, priority DESC, dueDate ASC)
WHERE isCompleted = FALSE;
```

---

## 제약조건 (Constraints)

### PRIMARY KEY

모든 테이블에 SERIAL 타입의 자동 증가 기본 키 사용

```sql
id SERIAL PRIMARY KEY
```

### FOREIGN KEY

```sql
-- CASCADE: 부모 삭제 시 자식도 삭제
ALTER TABLE "StudyMember"
ADD CONSTRAINT fk_studymember_group
FOREIGN KEY (groupId) REFERENCES "StudyGroup"(id)
ON DELETE CASCADE;

-- SET NULL: 부모 삭제 시 NULL로 설정
ALTER TABLE "Notice"
ADD CONSTRAINT fk_notice_author
FOREIGN KEY (authorId) REFERENCES "User"(id)
ON DELETE SET NULL;
```

### UNIQUE

```sql
-- 단일 컬럼
ALTER TABLE "User" ADD CONSTRAINT unique_user_email UNIQUE (email);

-- 복합 유니크 (한 사용자는 같은 스터디에 한 번만 가입)
ALTER TABLE "StudyMember"
ADD CONSTRAINT unique_user_group UNIQUE (userId, groupId);
```

### CHECK

```sql
-- 열거형 값 검증
ALTER TABLE "StudyGroup"
ADD CONSTRAINT check_visibility
CHECK (visibility IN ('PUBLIC', 'PRIVATE'));

-- 범위 검증
ALTER TABLE "StudyGroup"
ADD CONSTRAINT check_max_members
CHECK (maxMembers >= 2 AND maxMembers <= 100);

-- 날짜 검증
ALTER TABLE "Event"
ADD CONSTRAINT check_date_range
CHECK (endDate >= startDate);

-- 문자열 길이 검증
ALTER TABLE "Task"
ADD CONSTRAINT check_content_length
CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 1000);
```

### NOT NULL

```sql
ALTER TABLE "StudyGroup" ALTER COLUMN name SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN email SET NOT NULL;
```

---

## 데이터 무결성

### 트리거 (Triggers)

#### 1. updatedAt 자동 업데이트

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 적용
CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studygroup_updated_at
BEFORE UPDATE ON "StudyGroup"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ... 다른 테이블들도 동일
```

#### 2. 스터디 정원 검증

```sql
CREATE OR REPLACE FUNCTION check_study_capacity()
RETURNS TRIGGER AS $$
DECLARE
  member_count INTEGER;
  max_members INTEGER;
BEGIN
  SELECT COUNT(*), sg.maxMembers
  INTO member_count, max_members
  FROM "StudyMember" sm
  JOIN "StudyGroup" sg ON sm.groupId = sg.id
  WHERE sm.groupId = NEW.groupId AND sm.status = 'active'
  GROUP BY sg.maxMembers;

  IF member_count >= max_members THEN
    RAISE EXCEPTION '스터디 정원이 초과되었습니다 (현재: %, 최대: %)', member_count, max_members;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_study_capacity_trigger
BEFORE INSERT ON "StudyMember"
FOR EACH ROW
EXECUTE FUNCTION check_study_capacity();
```

#### 3. 스터디 소유자는 탈퇴 불가

```sql
CREATE OR REPLACE FUNCTION prevent_owner_leave()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'OWNER' THEN
    RAISE EXCEPTION '스터디 소유자는 탈퇴할 수 없습니다. 스터디를 삭제하거나 소유권을 이양하세요.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_owner_leave_trigger
BEFORE DELETE ON "StudyMember"
FOR EACH ROW
EXECUTE FUNCTION prevent_owner_leave();
```

### 뷰 (Views)

#### 1. 활성 스터디 목록 뷰

```sql
CREATE VIEW active_studies AS
SELECT
  sg.id,
  sg.name,
  sg.description,
  sg.category,
  sg.visibility,
  sg.maxMembers,
  COUNT(sm.id) as currentMembers,
  u.name as ownerName,
  sg.createdAt
FROM "StudyGroup" sg
LEFT JOIN "StudyMember" sm ON sg.id = sm.groupId AND sm.status = 'active'
LEFT JOIN "User" u ON sg.ownerId = u.id
WHERE sg.status = 'active' AND sg.visibility = 'PUBLIC'
GROUP BY sg.id, u.name
ORDER BY sg.createdAt DESC;
```

#### 2. 사용자 대시보드 뷰

```sql
CREATE VIEW user_dashboard AS
SELECT
  u.id as userId,
  u.name as userName,
  COUNT(DISTINCT sm.groupId) as studyCount,
  COUNT(DISTINCT CASE WHEN n.isRead = FALSE THEN n.id END) as unreadNotifications,
  COUNT(DISTINCT CASE WHEN t.isCompleted = FALSE AND t.assigneeId = u.id THEN t.id END) as pendingTasks
FROM "User" u
LEFT JOIN "StudyMember" sm ON u.id = sm.userId AND sm.status = 'active'
LEFT JOIN "Notification" n ON u.id = n.userId
LEFT JOIN "Task" t ON u.id = t.assigneeId
WHERE u.status = 'active'
GROUP BY u.id, u.name;
```

---

## 성능 최적화

### 1. 쿼리 최적화

#### EXPLAIN ANALYZE 사용
```sql
EXPLAIN ANALYZE
SELECT sg.*, COUNT(sm.id) as memberCount
FROM "StudyGroup" sg
LEFT JOIN "StudyMember" sm ON sg.id = sm.groupId
WHERE sg.visibility = 'PUBLIC' AND sg.status = 'active'
GROUP BY sg.id
ORDER BY sg.createdAt DESC
LIMIT 12;
```

#### 인덱스 힌트
```sql
-- PostgreSQL은 자동으로 최적의 인덱스 선택
-- 필요 시 통계 업데이트
ANALYZE "StudyGroup";
VACUUM ANALYZE "StudyGroup";
```

### 2. 파티셔닝

#### 메시지 테이블 월별 파티셔닝

```sql
-- 부모 테이블
CREATE TABLE "Message" (
  id SERIAL,
  content TEXT NOT NULL,
  userId INTEGER NOT NULL,
  groupId INTEGER NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id, createdAt)
) PARTITION BY RANGE (createdAt);

-- 파티션 생성 (월별)
CREATE TABLE message_2025_01 PARTITION OF "Message"
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE message_2025_02 PARTITION OF "Message"
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- 자동 파티션 생성 함수
CREATE OR REPLACE FUNCTION create_monthly_message_partition()
RETURNS void AS $$
DECLARE
  partition_date DATE;
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  partition_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
  partition_name := 'message_' || TO_CHAR(partition_date, 'YYYY_MM');
  start_date := partition_date;
  end_date := partition_date + INTERVAL '1 month';

  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I PARTITION OF "Message"
    FOR VALUES FROM (%L) TO (%L)
  ', partition_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

### 3. 캐싱 전략

#### Redis 캐싱 대상
- 스터디 목록 (5분)
- 사용자 프로필 (10분)
- 대시보드 통계 (1분)
- 읽지 않은 알림 개수 (30초)

#### 예시 (Redis 키 구조)
```
study:list:public:{category}:{page}
user:profile:{userId}
dashboard:stats:{userId}
notification:unread:{userId}
```

### 4. 연결 풀링

```javascript
// Prisma 연결 풀 설정
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // 연결 풀 크기
  connection_limit: 10,
})
```

### 5. 쿼리 배치

```javascript
// N+1 문제 방지: include 사용
const studies = await prisma.studyGroup.findMany({
  include: {
    owner: {
      select: { id: true, name: true, imageUrl: true },
    },
    _count: {
      select: { members: true },
    },
  },
})

// 대신
const studies = await prisma.studyGroup.findMany()
for (const study of studies) {
  study.owner = await prisma.user.findUnique({ where: { id: study.ownerId } })
  // N+1 쿼리 발생!
}
```

---

## 백업 및 복구

### 1. 백업 전략

#### 전체 백업 (Daily)
```bash
pg_dump -h localhost -U coup_user -d coup_db -F c -f backup_$(date +%Y%m%d).dump
```

#### 증분 백업 (WAL)
```bash
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /path/to/archive/%f'
```

### 2. 복구 전략

#### 전체 복구
```bash
pg_restore -h localhost -U coup_user -d coup_db backup_20250105.dump
```

#### Point-in-Time Recovery (PITR)
```bash
# WAL 아카이브 복원
restore_command = 'cp /path/to/archive/%f %p'
recovery_target_time = '2025-01-05 14:30:00'
```

### 3. 복제 (Replication)

#### Master-Slave 복제
```sql
-- Master
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'password';

-- Slave
primary_conninfo = 'host=master_ip port=5432 user=replicator password=password'
```

---

## 마이그레이션 전략

### 1. Prisma Migrations

#### 초기 마이그레이션
```bash
npx prisma migrate dev --name init
```

#### 스키마 변경 후
```bash
npx prisma migrate dev --name add_task_priority
```

#### 프로덕션 배포
```bash
npx prisma migrate deploy
```

### 2. 무중단 마이그레이션

#### 컬럼 추가 (안전)
```sql
-- 1단계: 컬럼 추가 (NULL 허용)
ALTER TABLE "StudyGroup" ADD COLUMN tags TEXT[];

-- 2단계: 기본값 설정
UPDATE "StudyGroup" SET tags = '{}' WHERE tags IS NULL;

-- 3단계: NOT NULL 제약 추가
ALTER TABLE "StudyGroup" ALTER COLUMN tags SET NOT NULL;
```

#### 컬럼 삭제 (주의)
```sql
-- 1단계: 애플리케이션 코드에서 사용 중지
-- 2단계: 컬럼 삭제
ALTER TABLE "StudyGroup" DROP COLUMN oldColumn;
```

### 3. 데이터 마이그레이션

```sql
-- 예: priority 컬럼 추가 후 기존 데이터 마이그레이션
ALTER TABLE "Task" ADD COLUMN priority VARCHAR(20) DEFAULT 'MEDIUM';

UPDATE "Task"
SET priority = CASE
  WHEN dueDate < NOW() + INTERVAL '3 days' THEN 'HIGH'
  WHEN dueDate < NOW() + INTERVAL '7 days' THEN 'MEDIUM'
  ELSE 'LOW'
END
WHERE dueDate IS NOT NULL;
```

---

## 모니터링 및 유지보수

### 1. 성능 모니터링

#### 슬로우 쿼리 로그
```sql
-- postgresql.conf
log_min_duration_statement = 1000  -- 1초 이상 쿼리 로그
```

#### 테이블 통계
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_tup_ins AS inserts,
  n_tup_upd AS updates,
  n_tup_del AS deletes
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. 정기 유지보수

#### VACUUM (주간)
```sql
VACUUM ANALYZE;
```

#### REINDEX (월간)
```sql
REINDEX DATABASE coup_db;
```

#### 통계 업데이트
```sql
ANALYZE;
```

### 3. 용량 관리

#### 불필요한 데이터 정리
```sql
-- 30일 이상 읽은 알림 삭제
DELETE FROM "Notification"
WHERE isRead = TRUE AND readAt < NOW() - INTERVAL '30 days';

-- 삭제된 파일 메타데이터 정리 (90일 후)
DELETE FROM "File"
WHERE status = 'deleted' AND createdAt < NOW() - INTERVAL '90 days';
```

---

## 보안

### 1. 접근 제어

```sql
-- 읽기 전용 사용자
CREATE USER coup_readonly WITH PASSWORD 'password';
GRANT CONNECT ON DATABASE coup_db TO coup_readonly;
GRANT USAGE ON SCHEMA public TO coup_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO coup_readonly;

-- 애플리케이션 사용자
CREATE USER coup_app WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE coup_db TO coup_app;
```

### 2. 암호화

#### 전송 중 암호화 (SSL)
```sql
-- postgresql.conf
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'
```

#### 저장 중 암호화
```sql
-- pgcrypto 확장 사용
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 민감 정보 암호화 (선택적)
UPDATE "User"
SET email = pgp_sym_encrypt(email, 'encryption_key');
```

### 3. 감사 로그

```sql
CREATE TABLE "AuditLog" (
  id SERIAL PRIMARY KEY,
  tableName VARCHAR(50) NOT NULL,
  operation VARCHAR(10) NOT NULL,
  userId INTEGER,
  oldData JSONB,
  newData JSONB,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- 트리거로 자동 기록
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "AuditLog" (tableName, operation, oldData, newData)
  VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 부록

### A. 데이터 타입 가이드

| 목적 | PostgreSQL 타입 | Prisma 타입 |
|------|----------------|-------------|
| 정수 ID | SERIAL | Int @id @default(autoincrement()) |
| 문자열 (짧음) | VARCHAR(n) | String |
| 문자열 (긴) | TEXT | String @db.Text |
| 불리언 | BOOLEAN | Boolean |
| 날짜/시간 | TIMESTAMP | DateTime |
| JSON | JSONB | Json |
| 배열 | TEXT[] | String[] |
| 대용량 정수 | BIGINT | BigInt |

### B. 네이밍 컨벤션

- **테이블**: PascalCase (User, StudyGroup)
- **컬럼**: camelCase (createdAt, maxMembers)
- **인덱스**: idx_{table}_{columns} (idx_user_email)
- **제약조건**: {type}_{table}_{column} (fk_studymember_user)
- **트리거**: {table}_{action}_trigger (user_updated_at_trigger)

### C. 데이터베이스 크기 예측

| 테이블 | 예상 행 수 (1년) | 평균 행 크기 | 예상 크기 |
|--------|-----------------|-------------|----------|
| User | 10,000 | 500 bytes | 5 MB |
| StudyGroup | 1,000 | 1 KB | 1 MB |
| StudyMember | 30,000 | 200 bytes | 6 MB |
| Message | 1,000,000 | 500 bytes | 500 MB |
| Notification | 500,000 | 300 bytes | 150 MB |
| **총계** | - | - | **~700 MB** |

---

**문서 작성 완료**: 2025년 1월 5일  
**버전**: 1.0.0  
**다음 단계**: SQL 스크립트 생성 및 Prisma 스키마 작성
