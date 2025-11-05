# CoUp 데이터베이스 SQL 스크립트

> **작성일**: 2025년 11월 5일  
> **DBMS**: PostgreSQL 15  
> **실행 순서**: 순서대로 실행 필요

---

## 📋 목차

1. [데이터베이스 생성](#데이터베이스-생성)
2. [확장 기능 설치](#확장-기능-설치)
3. [테이블 생성](#테이블-생성)
4. [인덱스 생성](#인덱스-생성)
5. [트리거 생성](#트리거-생성)
6. [뷰 생성](#뷰-생성)
7. [초기 데이터 삽입](#초기-데이터-삽입)
8. [권한 설정](#권한-설정)

---

## 데이터베이스 생성

```sql
-- ==============================================
-- 데이터베이스 및 사용자 생성
-- ==============================================

-- 데이터베이스 생성
CREATE DATABASE coup_db
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- 데이터베이스 연결
\c coup_db;

-- 애플리케이션 사용자 생성
CREATE USER coup_app WITH PASSWORD 'your_secure_password_here';

-- 읽기 전용 사용자 (분석/모니터링용)
CREATE USER coup_readonly WITH PASSWORD 'readonly_password_here';

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE coup_db TO coup_app;
GRANT CONNECT ON DATABASE coup_db TO coup_readonly;
```

---

## 확장 기능 설치

```sql
-- ==============================================
-- PostgreSQL 확장 기능
-- ==============================================

-- UUID 생성 함수 (선택적)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 암호화 함수 (선택적)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 전문 검색 (선택적)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 통계 함수
CREATE EXTENSION IF NOT EXISTS "tablefunc";
```

---

## 테이블 생성

### 1. User (사용자)

```sql
-- ==============================================
-- User 테이블
-- ==============================================

CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    imageUrl TEXT,
    bio TEXT,
    provider VARCHAR(20) NOT NULL,
    providerId VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- 제약조건
    CONSTRAINT check_user_provider CHECK (provider IN ('google', 'github')),
    CONSTRAINT check_user_status CHECK (status IN ('active', 'suspended', 'deleted')),
    CONSTRAINT check_user_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100),
    CONSTRAINT check_user_bio_length CHECK (bio IS NULL OR LENGTH(bio) <= 500)
);

-- 코멘트 추가
COMMENT ON TABLE "User" IS '사용자 계정 정보';
COMMENT ON COLUMN "User".id IS '사용자 고유 ID';
COMMENT ON COLUMN "User".email IS '이메일 (로그인 ID)';
COMMENT ON COLUMN "User".provider IS 'OAuth 제공자 (google, github)';
COMMENT ON COLUMN "User".status IS '계정 상태 (active, suspended, deleted)';
```

### 2. StudyGroup (스터디 그룹)

```sql
-- ==============================================
-- StudyGroup 테이블
-- ==============================================

CREATE TABLE "StudyGroup" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    maxMembers INTEGER NOT NULL DEFAULT 10,
    imageUrl TEXT,
    ownerId INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- 외래키
    CONSTRAINT fk_studygroup_owner 
        FOREIGN KEY (ownerId) 
        REFERENCES "User"(id) 
        ON DELETE CASCADE,
    
    -- 제약조건
    CONSTRAINT check_studygroup_visibility 
        CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
    CONSTRAINT check_studygroup_status 
        CHECK (status IN ('active', 'inactive', 'deleted')),
    CONSTRAINT check_studygroup_maxmembers 
        CHECK (maxMembers >= 2 AND maxMembers <= 100),
    CONSTRAINT check_studygroup_name_length 
        CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100),
    CONSTRAINT check_studygroup_description_length 
        CHECK (LENGTH(description) >= 10 AND LENGTH(description) <= 1000)
);

-- 코멘트
COMMENT ON TABLE "StudyGroup" IS '스터디 그룹 정보';
COMMENT ON COLUMN "StudyGroup".visibility IS '공개 여부 (PUBLIC, PRIVATE)';
COMMENT ON COLUMN "StudyGroup".maxMembers IS '최대 멤버 수 (2-100)';
```

### 3. StudyMember (스터디 멤버)

```sql
-- ==============================================
-- StudyMember 테이블
-- ==============================================

CREATE TABLE "StudyMember" (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    groupId INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- 외래키
    CONSTRAINT fk_studymember_user 
        FOREIGN KEY (userId) 
        REFERENCES "User"(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_studymember_group 
        FOREIGN KEY (groupId) 
        REFERENCES "StudyGroup"(id) 
        ON DELETE CASCADE,
    
    -- 제약조건
    CONSTRAINT check_studymember_role 
        CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
    CONSTRAINT check_studymember_status 
        CHECK (status IN ('active', 'kicked')),
    
    -- 유니크 제약 (한 사용자는 같은 스터디에 한 번만 가입)
    CONSTRAINT unique_user_group UNIQUE (userId, groupId)
);

-- 코멘트
COMMENT ON TABLE "StudyMember" IS '스터디 멤버십 관계';
COMMENT ON COLUMN "StudyMember".role IS '역할 (OWNER, ADMIN, MEMBER)';
```

### 4. Message (채팅 메시지)

```sql
-- ==============================================
-- Message 테이블
-- ==============================================

CREATE TABLE "Message" (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    userId INTEGER NOT NULL,
    groupId INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    metadata JSONB,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- 외래키
    CONSTRAINT fk_message_user 
        FOREIGN KEY (userId) 
        REFERENCES "User"(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_message_group 
        FOREIGN KEY (groupId) 
        REFERENCES "StudyGroup"(id) 
        ON DELETE CASCADE,
    
    -- 제약조건
    CONSTRAINT check_message_type 
        CHECK (type IN ('TEXT', 'SYSTEM', 'IMAGE')),
    CONSTRAINT check_message_content_length 
        CHECK (LENGTH(content) <= 2000)
);

-- 코멘트
COMMENT ON TABLE "Message" IS '스터디 그룹 채팅 메시지';
COMMENT ON COLUMN "Message".type IS '메시지 타입 (TEXT, SYSTEM, IMAGE)';
COMMENT ON COLUMN "Message".metadata IS '추가 메타데이터 (JSON)';
```

### 5. Notice (공지사항)

```sql
-- ==============================================
-- Notice 테이블
-- ==============================================

CREATE TABLE "Notice" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    isPinned BOOLEAN NOT NULL DEFAULT FALSE,
    authorId INTEGER,
    groupId INTEGER NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- 외래키
    CONSTRAINT fk_notice_author 
        FOREIGN KEY (authorId) 
        REFERENCES "User"(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_notice_group 
        FOREIGN KEY (groupId) 
        REFERENCES "StudyGroup"(id) 
        ON DELETE CASCADE,
    
    -- 제약조건
    CONSTRAINT check_notice_title_length 
        CHECK (LENGTH(title) >= 2 AND LENGTH(title) <= 200),
    CONSTRAINT check_notice_content_length 
        CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 10000)
);

-- 코멘트
COMMENT ON TABLE "Notice" IS '스터디 그룹 공지사항';
COMMENT ON COLUMN "Notice".isPinned IS '상단 고정 여부';
COMMENT ON COLUMN "Notice".content IS 'Markdown 형식';
```

### 6. File (파일)

```sql
-- ==============================================
-- File 테이블
-- ==============================================

CREATE TABLE "File" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    size BIGINT NOT NULL,
    mimeType VARCHAR(100) NOT NULL,
    key TEXT NOT NULL,
    uploaderId INTEGER,
    groupId INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- 외래키
    CONSTRAINT fk_file_uploader 
        FOREIGN KEY (uploaderId) 
        REFERENCES "User"(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_file_group 
        FOREIGN KEY (groupId) 
        REFERENCES "StudyGroup"(id) 
        ON DELETE CASCADE,
    
    -- 제약조건
    CONSTRAINT check_file_status 
        CHECK (status IN ('active', 'deleted')),
    CONSTRAINT check_file_size 
        CHECK (size > 0 AND size <= 52428800) -- 최대 50MB
);

-- 코멘트
COMMENT ON TABLE "File" IS '스터디 그룹 파일 메타데이터';
COMMENT ON COLUMN "File".key IS 'S3 객체 키';
COMMENT ON COLUMN "File".size IS '파일 크기 (bytes)';
```

### 7. Event (일정)

```sql
-- ==============================================
-- Event 테이블
-- ==============================================

CREATE TABLE "Event" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'EVENT',
    location VARCHAR(255),
    groupId INTEGER NOT NULL,
    createdBy INTEGER,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- 외래키
    CONSTRAINT fk_event_group 
        FOREIGN KEY (groupId) 
        REFERENCES "StudyGroup"(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_event_creator 
        FOREIGN KEY (createdBy) 
        REFERENCES "User"(id) 
        ON DELETE SET NULL,
    
    -- 제약조건
    CONSTRAINT check_event_type 
        CHECK (type IN ('EVENT', 'MEETING', 'DEADLINE')),
    CONSTRAINT check_event_date_range 
        CHECK (endDate >= startDate),
    CONSTRAINT check_event_title_length 
        CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200)
);

-- 코멘트
COMMENT ON TABLE "Event" IS '스터디 그룹 일정';
COMMENT ON COLUMN "Event".type IS '일정 유형 (EVENT, MEETING, DEADLINE)';
```

### 8. Task (할 일)

```sql
-- ==============================================
-- Task 테이블
-- ==============================================

CREATE TABLE "Task" (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    isCompleted BOOLEAN NOT NULL DEFAULT FALSE,
    assigneeId INTEGER,
    dueDate TIMESTAMP,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    groupId INTEGER NOT NULL,
    createdBy INTEGER,
    completedAt TIMESTAMP,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- 외래키
    CONSTRAINT fk_task_assignee 
        FOREIGN KEY (assigneeId) 
        REFERENCES "User"(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_task_group 
        FOREIGN KEY (groupId) 
        REFERENCES "StudyGroup"(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_task_creator 
        FOREIGN KEY (createdBy) 
        REFERENCES "User"(id) 
        ON DELETE SET NULL,
    
    -- 제약조건
    CONSTRAINT check_task_priority 
        CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    CONSTRAINT check_task_content_length 
        CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 1000)
);

-- 코멘트
COMMENT ON TABLE "Task" IS '스터디 그룹 할 일';
COMMENT ON COLUMN "Task".priority IS '우선순위 (HIGH, MEDIUM, LOW)';
COMMENT ON COLUMN "Task".completedAt IS '완료일시';
```

### 9. Notification (알림)

```sql
-- ==============================================
-- Notification 테이블
-- ==============================================

CREATE TABLE "Notification" (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    isRead BOOLEAN NOT NULL DEFAULT FALSE,
    userId INTEGER NOT NULL,
    relatedId INTEGER,
    relatedType VARCHAR(50),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    readAt TIMESTAMP,
    
    -- 외래키
    CONSTRAINT fk_notification_user 
        FOREIGN KEY (userId) 
        REFERENCES "User"(id) 
        ON DELETE CASCADE,
    
    -- 제약조건
    CONSTRAINT check_notification_type 
        CHECK (type IN (
            'STUDY_JOIN', 'NEW_NOTICE', 'NEW_MESSAGE', 'MEMBER_KICKED',
            'EVENT_CREATED', 'TASK_ASSIGNED', 'TASK_COMPLETED'
        )),
    CONSTRAINT check_notification_message_length 
        CHECK (LENGTH(message) <= 500)
);

-- 코멘트
COMMENT ON TABLE "Notification" IS '사용자 알림';
COMMENT ON COLUMN "Notification".type IS '알림 유형';
COMMENT ON COLUMN "Notification".relatedId IS '관련 리소스 ID';
COMMENT ON COLUMN "Notification".relatedType IS '관련 리소스 타입';
```

### 10. Session (NextAuth.js 세션)

```sql
-- ==============================================
-- Session 테이블 (NextAuth.js)
-- ==============================================

CREATE TABLE "Session" (
    id VARCHAR(255) PRIMARY KEY,
    sessionToken VARCHAR(255) NOT NULL UNIQUE,
    userId INTEGER NOT NULL,
    expires TIMESTAMP NOT NULL,
    
    -- 외래키
    CONSTRAINT fk_session_user 
        FOREIGN KEY (userId) 
        REFERENCES "User"(id) 
        ON DELETE CASCADE
);

-- 코멘트
COMMENT ON TABLE "Session" IS 'NextAuth.js 세션 (JWT 사용 시 불필요)';
```

### 11. Account (OAuth 계정)

```sql
-- ==============================================
-- Account 테이블 (NextAuth.js OAuth)
-- ==============================================

CREATE TABLE "Account" (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    providerAccountId VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(50),
    scope TEXT,
    id_token TEXT,
    session_state VARCHAR(255),
    
    -- 외래키
    CONSTRAINT fk_account_user 
        FOREIGN KEY (userId) 
        REFERENCES "User"(id) 
        ON DELETE CASCADE,
    
    -- 유니크 제약
    CONSTRAINT unique_provider_account 
        UNIQUE (provider, providerAccountId)
);

-- 코멘트
COMMENT ON TABLE "Account" IS 'NextAuth.js OAuth 계정 연동';
```

---

## 인덱스 생성

```sql
-- ==============================================
-- 인덱스 생성
-- ==============================================

-- User 인덱스
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_provider ON "User"(provider, providerId);
CREATE INDEX idx_user_status ON "User"(status) WHERE status != 'active';

-- StudyGroup 인덱스
CREATE INDEX idx_studygroup_category ON "StudyGroup"(category);
CREATE INDEX idx_studygroup_visibility ON "StudyGroup"(visibility) WHERE visibility = 'PUBLIC';
CREATE INDEX idx_studygroup_created ON "StudyGroup"(createdAt DESC);
CREATE INDEX idx_studygroup_owner ON "StudyGroup"(ownerId);
CREATE INDEX idx_studygroup_status ON "StudyGroup"(status) WHERE status = 'active';

-- 공개 활성 스터디 복합 인덱스
CREATE INDEX idx_studygroup_public_active ON "StudyGroup"(category, createdAt DESC)
WHERE visibility = 'PUBLIC' AND status = 'active';

-- StudyMember 인덱스
CREATE INDEX idx_studymember_user ON "StudyMember"(userId);
CREATE INDEX idx_studymember_group ON "StudyMember"(groupId);
CREATE INDEX idx_studymember_role ON "StudyMember"(role);
CREATE INDEX idx_studymember_composite ON "StudyMember"(groupId, role);
CREATE INDEX idx_studymember_created ON "StudyMember"(createdAt DESC);

-- Message 인덱스
CREATE INDEX idx_message_group_created ON "Message"(groupId, createdAt DESC);
CREATE INDEX idx_message_user ON "Message"(userId);
-- 커서 기반 페이지네이션용
CREATE INDEX idx_message_cursor ON "Message"(groupId, id DESC);

-- Notice 인덱스
CREATE INDEX idx_notice_group_pinned ON "Notice"(groupId, isPinned DESC, createdAt DESC);
CREATE INDEX idx_notice_author ON "Notice"(authorId);

-- File 인덱스
CREATE INDEX idx_file_group_created ON "File"(groupId, createdAt DESC);
CREATE INDEX idx_file_uploader ON "File"(uploaderId);
CREATE INDEX idx_file_status ON "File"(status) WHERE status = 'active';

-- Event 인덱스
CREATE INDEX idx_event_group_start ON "Event"(groupId, startDate ASC);
CREATE INDEX idx_event_type ON "Event"(type);
CREATE INDEX idx_event_date_range ON "Event"(startDate, endDate);

-- Task 인덱스
CREATE INDEX idx_task_group_status ON "Task"(groupId, isCompleted, priority DESC, dueDate ASC);
CREATE INDEX idx_task_assignee ON "Task"(assigneeId) WHERE assigneeId IS NOT NULL;
CREATE INDEX idx_task_duedate ON "Task"(dueDate ASC) WHERE dueDate IS NOT NULL;
-- 미완료 할 일만
CREATE INDEX idx_task_pending ON "Task"(groupId, priority DESC, dueDate ASC)
WHERE isCompleted = FALSE;

-- Notification 인덱스
CREATE INDEX idx_notification_user_read ON "Notification"(userId, isRead, createdAt DESC);
CREATE INDEX idx_notification_created ON "Notification"(createdAt DESC);
-- 읽지 않은 알림만
CREATE INDEX idx_notification_unread ON "Notification"(userId, createdAt DESC)
WHERE isRead = FALSE;

-- Session 인덱스
CREATE INDEX idx_session_token ON "Session"(sessionToken);
CREATE INDEX idx_session_user ON "Session"(userId);

-- Account 인덱스
CREATE INDEX idx_account_user ON "Account"(userId);
CREATE INDEX idx_account_provider ON "Account"(provider, providerAccountId);
```

---

## 트리거 생성

### 1. updatedAt 자동 업데이트

```sql
-- ==============================================
-- updatedAt 자동 업데이트 트리거
-- ==============================================

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User 테이블에 적용
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- StudyGroup 테이블에 적용
CREATE TRIGGER update_studygroup_updated_at
    BEFORE UPDATE ON "StudyGroup"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- StudyMember 테이블에 적용
CREATE TRIGGER update_studymember_updated_at
    BEFORE UPDATE ON "StudyMember"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Notice 테이블에 적용
CREATE TRIGGER update_notice_updated_at
    BEFORE UPDATE ON "Notice"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Event 테이블에 적용
CREATE TRIGGER update_event_updated_at
    BEFORE UPDATE ON "Event"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Task 테이블에 적용
CREATE TRIGGER update_task_updated_at
    BEFORE UPDATE ON "Task"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. Task 완료 시 completedAt 자동 설정

```sql
-- ==============================================
-- Task 완료일시 자동 업데이트 트리거
-- ==============================================

CREATE OR REPLACE FUNCTION update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.isCompleted = TRUE AND (OLD.isCompleted = FALSE OR OLD.isCompleted IS NULL) THEN
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

### 3. Notification 읽음 시 readAt 자동 설정

```sql
-- ==============================================
-- Notification 읽음일시 자동 업데이트 트리거
-- ==============================================

CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.isRead = TRUE AND (OLD.isRead = FALSE OR OLD.isRead IS NULL) THEN
        NEW.readAt = NOW();
    ELSIF NEW.isRead = FALSE THEN
        NEW.readAt = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_read_at_trigger
    BEFORE UPDATE ON "Notification"
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_read_at();
```

### 4. 스터디 정원 검증 트리거

```sql
-- ==============================================
-- 스터디 정원 검증 트리거
-- ==============================================

CREATE OR REPLACE FUNCTION check_study_capacity()
RETURNS TRIGGER AS $$
DECLARE
    member_count INTEGER;
    max_members INTEGER;
BEGIN
    -- 현재 멤버 수와 최대 멤버 수 조회
    SELECT COUNT(*), sg.maxMembers
    INTO member_count, max_members
    FROM "StudyMember" sm
    JOIN "StudyGroup" sg ON sm.groupId = sg.id
    WHERE sm.groupId = NEW.groupId AND sm.status = 'active'
    GROUP BY sg.maxMembers;
    
    -- 정원 초과 체크
    IF member_count >= max_members THEN
        RAISE EXCEPTION 'Study group is full (current: %, max: %)', member_count, max_members;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_study_capacity_trigger
    BEFORE INSERT ON "StudyMember"
    FOR EACH ROW
    EXECUTE FUNCTION check_study_capacity();
```

---

## 뷰 생성

### 1. 활성 스터디 목록 뷰

```sql
-- ==============================================
-- 활성 스터디 목록 뷰
-- ==============================================

CREATE OR REPLACE VIEW active_studies AS
SELECT
    sg.id,
    sg.name,
    sg.description,
    sg.category,
    sg.subcategory,
    sg.visibility,
    sg.maxMembers,
    sg.imageUrl,
    COUNT(sm.id) as currentMembers,
    u.id as ownerId,
    u.name as ownerName,
    u.imageUrl as ownerImage,
    sg.createdAt,
    sg.updatedAt
FROM "StudyGroup" sg
LEFT JOIN "StudyMember" sm ON sg.id = sm.groupId AND sm.status = 'active'
LEFT JOIN "User" u ON sg.ownerId = u.id
WHERE sg.status = 'active'
GROUP BY sg.id, u.id, u.name, u.imageUrl
ORDER BY sg.createdAt DESC;

-- 코멘트
COMMENT ON VIEW active_studies IS '활성 스터디 목록 (멤버 수 포함)';
```

### 2. 사용자 대시보드 통계 뷰

```sql
-- ==============================================
-- 사용자 대시보드 통계 뷰
-- ==============================================

CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT
    u.id as userId,
    u.name as userName,
    u.email,
    u.imageUrl,
    COUNT(DISTINCT sm.groupId) as studyCount,
    COUNT(DISTINCT CASE WHEN n.isRead = FALSE THEN n.id END) as unreadNotifications,
    COUNT(DISTINCT CASE WHEN t.isCompleted = FALSE AND t.assigneeId = u.id THEN t.id END) as pendingTasks,
    COUNT(DISTINCT CASE WHEN e.startDate >= NOW() AND e.startDate <= NOW() + INTERVAL '7 days' THEN e.id END) as upcomingEvents
FROM "User" u
LEFT JOIN "StudyMember" sm ON u.id = sm.userId AND sm.status = 'active'
LEFT JOIN "Notification" n ON u.id = n.userId
LEFT JOIN "Task" t ON u.id = t.assigneeId
LEFT JOIN "Event" e ON sm.groupId = e.groupId
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.email, u.imageUrl;

-- 코멘트
COMMENT ON VIEW user_dashboard_stats IS '사용자 대시보드 통계';
```

### 3. 스터디별 활동 통계 뷰

```sql
-- ==============================================
-- 스터디별 활동 통계 뷰
-- ==============================================

CREATE OR REPLACE VIEW study_activity_stats AS
SELECT
    sg.id as studyId,
    sg.name as studyName,
    COUNT(DISTINCT sm.id) as memberCount,
    COUNT(DISTINCT m.id) as messageCount,
    COUNT(DISTINCT n.id) as noticeCount,
    COUNT(DISTINCT f.id) as fileCount,
    COUNT(DISTINCT e.id) as eventCount,
    COUNT(DISTINCT t.id) as taskCount,
    MAX(m.createdAt) as lastMessageAt,
    MAX(n.createdAt) as lastNoticeAt
FROM "StudyGroup" sg
LEFT JOIN "StudyMember" sm ON sg.id = sm.groupId AND sm.status = 'active'
LEFT JOIN "Message" m ON sg.id = m.groupId
LEFT JOIN "Notice" n ON sg.id = n.groupId
LEFT JOIN "File" f ON sg.id = f.groupId AND f.status = 'active'
LEFT JOIN "Event" e ON sg.id = e.groupId
LEFT JOIN "Task" t ON sg.id = t.groupId
WHERE sg.status = 'active'
GROUP BY sg.id, sg.name;

-- 코멘트
COMMENT ON VIEW study_activity_stats IS '스터디별 활동 통계';
```

---

## 초기 데이터 삽입

```sql
-- ==============================================
-- 초기 데이터 (테스트용)
-- ==============================================

-- 시스템 사용자 (선택적)
INSERT INTO "User" (email, name, provider, providerId, status)
VALUES ('system@coup.app', 'System', 'google', 'system-001', 'active');

-- 카테고리 기본값 (애플리케이션에서 관리하는 경우 불필요)
-- 별도 Category 테이블을 만들지 않고 애플리케이션에서 관리

-- 샘플 데이터 (개발 환경용)
-- 실제 프로덕션에서는 제거
/*
INSERT INTO "User" (email, name, imageUrl, provider, providerId)
VALUES 
('test1@example.com', '김철수', 'https://via.placeholder.com/150', 'google', 'google-test-001'),
('test2@example.com', '이영희', 'https://via.placeholder.com/150', 'github', 'github-test-001');

INSERT INTO "StudyGroup" (name, description, category, visibility, maxMembers, ownerId)
VALUES 
('코딩테스트 스터디', '매일 알고리즘 1문제 풀이', '프로그래밍', 'PUBLIC', 20, 1),
('취업 준비 스터디', '함께 취업 준비하는 모임', '취업준비', 'PUBLIC', 15, 2);
*/
```

---

## 권한 설정

```sql
-- ==============================================
-- 권한 설정
-- ==============================================

-- 애플리케이션 사용자 권한
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO coup_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO coup_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO coup_app;

-- 읽기 전용 사용자 권한
GRANT USAGE ON SCHEMA public TO coup_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO coup_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO coup_readonly;

-- 기본 권한 설정 (향후 생성되는 테이블에도 적용)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO coup_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO coup_readonly;
```

---

## 유지보수 스크립트

### 1. 통계 정보 업데이트

```sql
-- ==============================================
-- 통계 정보 업데이트 (주기적 실행 권장)
-- ==============================================

-- 모든 테이블 분석
ANALYZE;

-- 특정 테이블만 분석
ANALYZE "User";
ANALYZE "StudyGroup";
ANALYZE "Message";
```

### 2. 불필요한 데이터 정리

```sql
-- ==============================================
-- 데이터 정리 (Cron Job으로 실행)
-- ==============================================

-- 30일 이상 읽은 알림 삭제
DELETE FROM "Notification"
WHERE isRead = TRUE
  AND readAt < NOW() - INTERVAL '30 days';

-- 삭제된 파일 메타데이터 정리 (90일 후)
DELETE FROM "File"
WHERE status = 'deleted'
  AND createdAt < NOW() - INTERVAL '90 days';

-- 오래된 세션 정리
DELETE FROM "Session"
WHERE expires < NOW();

-- VACUUM 실행 (저장 공간 회수)
VACUUM ANALYZE;
```

### 3. 백업 스크립트

```bash
#!/bin/bash
# ==============================================
# 데이터베이스 백업 스크립트
# ==============================================

# 환경 변수
DB_NAME="coup_db"
DB_USER="coup_app"
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/coup_db_$DATE.dump"

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# 전체 백업
pg_dump -h localhost -U $DB_USER -d $DB_NAME -F c -f $BACKUP_FILE

# 압축
gzip $BACKUP_FILE

# 7일 이상 된 백업 파일 삭제
find $BACKUP_DIR -name "coup_db_*.dump.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### 4. 성능 모니터링 쿼리

```sql
-- ==============================================
-- 성능 모니터링 쿼리
-- ==============================================

-- 테이블 크기 조회
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- 인덱스 사용 통계
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 슬로우 쿼리 확인 (pg_stat_statements 확장 필요)
-- CREATE EXTENSION pg_stat_statements;
SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- 락 대기 확인
SELECT
    pid,
    usename,
    pg_blocking_pids(pid) as blocked_by,
    query as blocked_query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;
```

---

## 실행 순서

### 전체 설치 (순서대로 실행)

```bash
# 1. 데이터베이스 생성 및 연결
psql -U postgres -f 01_create_database.sql

# 2. 확장 기능 설치
psql -U postgres -d coup_db -f 02_extensions.sql

# 3. 테이블 생성
psql -U postgres -d coup_db -f 03_create_tables.sql

# 4. 인덱스 생성
psql -U postgres -d coup_db -f 04_create_indexes.sql

# 5. 트리거 생성
psql -U postgres -d coup_db -f 05_create_triggers.sql

# 6. 뷰 생성
psql -U postgres -d coup_db -f 06_create_views.sql

# 7. 초기 데이터 (선택적)
psql -U postgres -d coup_db -f 07_seed_data.sql

# 8. 권한 설정
psql -U postgres -d coup_db -f 08_grant_permissions.sql
```

### 전체 스크립트 통합 실행

```bash
# 위의 모든 SQL을 하나의 파일로 실행
psql -U postgres -f coup_database_complete.sql
```

---

## 검증 스크립트

```sql
-- ==============================================
-- 설치 검증
-- ==============================================

-- 1. 테이블 개수 확인
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- 예상 결과: 11개

-- 2. 인덱스 개수 확인
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public';
-- 예상 결과: 50개 이상

-- 3. 트리거 개수 확인
SELECT COUNT(*) as trigger_count
FROM pg_trigger
WHERE tgrelid IN (
    SELECT oid FROM pg_class WHERE relnamespace = (
        SELECT oid FROM pg_namespace WHERE nspname = 'public'
    )
);
-- 예상 결과: 10개 이상

-- 4. 뷰 개수 확인
SELECT COUNT(*) as view_count
FROM information_schema.views
WHERE table_schema = 'public';
-- 예상 결과: 3개

-- 5. 외래키 제약조건 확인
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';

-- 6. 각 테이블의 제약조건 확인
SELECT
    conrelid::regclass AS table_name,
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid IN (
    SELECT oid FROM pg_class WHERE relnamespace = (
        SELECT oid FROM pg_namespace WHERE nspname = 'public'
    )
)
ORDER BY table_name, constraint_type;

-- 7. 설치 완료 메시지
SELECT 'Database installation completed successfully!' AS status;
```

---

**문서 작성 완료**: 2025년 1월 5일  
**버전**: 1.0.0  
**총 SQL 라인 수**: 약 1,000 라인  

**실행 전 주의사항**:
1. 비밀번호를 실제 보안 비밀번호로 변경하세요
2. 프로덕션 환경에서는 샘플 데이터를 삽입하지 마세요
3. 백업 스크립트의 경로를 실제 환경에 맞게 수정하세요
4. SSL 설정 및 방화벽 규칙을 확인하세요
