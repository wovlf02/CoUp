# 데이터베이스 스키마

> **ORM**: Prisma 5+  
> **DB**: PostgreSQL 15+  
> **작성일**: 2025-11-17

---

## 📊 ERD 개요

```
User (사용자)
  ↓ 1:N
Study (스터디)
  ↓ 1:N
├── StudyMember (멤버)
├── Message (채팅)
├── Notice (공지)
├── File (파일)
├── Event (일정)
└── Task (할일)
```

---

## 🗂️ Prisma Schema

### User (사용자)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?   // null for OAuth users
  name          String?
  avatar        String?
  bio           String?
  provider      Provider  @default(CREDENTIALS)
  role          UserRole  @default(USER)
  
  // 소셜 로그인
  googleId      String?   @unique
  githubId      String?   @unique
  
  // 상태
  status        UserStatus @default(ACTIVE)
  suspendedUntil DateTime?
  suspendReason  String?
  
  // 타임스탬프
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // 관계
  studyMembers  StudyMember[]
  messages      Message[]
  notifications Notification[]
  tasks         Task[]
  reports       Report[]
  
  @@index([email])
  @@index([status])
}

enum Provider {
  CREDENTIALS
  GOOGLE
  GITHUB
}

enum UserRole {
  USER
  ADMIN
  SYSTEM_ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

### Study (스터디)

```prisma
model Study {
  id            String   @id @default(cuid())
  name          String
  emoji         String   @default("📚")
  description   String
  category      String
  subCategory   String?
  
  // 설정
  maxMembers    Int      @default(20)
  isPublic      Boolean  @default(true)
  autoApprove   Boolean  @default(true)
  isRecruiting  Boolean  @default(true)
  
  // 메타
  tags          String[] // PostgreSQL array
  inviteCode    String   @unique
  
  // 타임스탬프
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // 관계
  members       StudyMember[]
  messages      Message[]
  notices       Notice[]
  files         File[]
  events        Event[]
  tasks         Task[]
  
  @@index([category])
  @@index([isPublic, isRecruiting])
}
```

### StudyMember (스터디 멤버)

```prisma
model StudyMember {
  id            String      @id @default(cuid())
  studyId       String
  userId        String
  role          MemberRole  @default(MEMBER)
  status        MemberStatus @default(PENDING)
  
  // 가입 정보
  introduction  String?
  motivation    String?
  level         String?
  
  // 타임스탬프
  joinedAt      DateTime    @default(now())
  approvedAt    DateTime?
  
  // 관계
  study         Study       @relation(fields: [studyId], references: [id], onDelete: Cascade)
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([studyId, userId])
  @@index([userId])
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
}

enum MemberStatus {
  PENDING
  ACTIVE
  KICKED
  LEFT
}
```

### Message (채팅)

```prisma
model Message {
  id            String   @id @default(cuid())
  studyId       String
  userId        String
  content       String
  fileId        String?
  
  // 읽음 처리
  readers       String[] // User IDs
  
  // 타임스탬프
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // 관계
  study         Study    @relation(fields: [studyId], references: [id], onDelete: Cascade)
  user          User     @relation(fields: [userId], references: [id])
  file          File?    @relation(fields: [fileId], references: [id])
  
  @@index([studyId, createdAt])
}
```

### Notice (공지)

```prisma
model Notice {
  id            String   @id @default(cuid())
  studyId       String
  authorId      String
  title         String
  content       String
  
  // 상태
  isPinned      Boolean  @default(false)
  isImportant   Boolean  @default(false)
  
  // 통계
  views         Int      @default(0)
  comments      Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  study         Study    @relation(fields: [studyId], references: [id], onDelete: Cascade)
  
  @@index([studyId, isPinned])
}
```

### File (파일)

```prisma
model File {
  id            String   @id @default(cuid())
  studyId       String
  uploaderId    String
  name          String
  size          Int
  type          String
  url           String
  folderId      String?
  
  downloads     Int      @default(0)
  
  createdAt     DateTime @default(now())
  
  study         Study    @relation(fields: [studyId], references: [id], onDelete: Cascade)
  messages      Message[]
  
  @@index([studyId, folderId])
}
```

### Event (일정)

```prisma
model Event {
  id            String   @id @default(cuid())
  studyId       String
  title         String
  date          DateTime
  startTime     String
  endTime       String
  location      String?
  color         String   @default("#6366F1")
  
  createdAt     DateTime @default(now())
  
  study         Study    @relation(fields: [studyId], references: [id], onDelete: Cascade)
  
  @@index([studyId, date])
}
```

### Task (할일)

```prisma
model Task {
  id            String      @id @default(cuid())
  studyId       String?
  userId        String
  title         String
  description   String?
  status        TaskStatus  @default(TODO)
  priority      Priority    @default(MEDIUM)
  dueDate       DateTime?
  
  completed     Boolean     @default(false)
  completedAt   DateTime?
  
  createdAt     DateTime    @default(now())
  
  user          User        @relation(fields: [userId], references: [id])
  study         Study?      @relation(fields: [studyId], references: [id], onDelete: Cascade)
  
  @@index([userId, completed])
  @@index([studyId, status])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### Notification (알림)

```prisma
model Notification {
  id            String          @id @default(cuid())
  userId        String
  type          NotificationType
  studyId       String?
  studyName     String?
  studyEmoji    String?
  message       String
  data          Json?           // 추가 데이터
  
  isRead        Boolean         @default(false)
  createdAt     DateTime        @default(now())
  
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
}

enum NotificationType {
  JOIN_APPROVED
  NOTICE
  FILE
  EVENT
  TASK
  MEMBER
  KICK
}
```

### Report (신고)

```prisma
model Report {
  id            String       @id @default(cuid())
  reporterId    String
  targetType    TargetType
  targetId      String
  type          ReportType
  reason        String
  evidence      Json?        // 증거 자료
  
  status        ReportStatus @default(PENDING)
  priority      Priority     @default(MEDIUM)
  
  // 처리
  processedBy   String?
  processedAt   DateTime?
  resolution    String?
  
  createdAt     DateTime     @default(now())
  
  reporter      User         @relation(fields: [reporterId], references: [id])
  
  @@index([status, priority])
}

enum TargetType {
  USER
  STUDY
  MESSAGE
}

enum ReportType {
  SPAM
  HARASSMENT
  INAPPROPRIATE
  COPYRIGHT
}

enum ReportStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  REJECTED
}
```

---

## 🔧 인덱스 전략

**성능 최적화를 위한 복합 인덱스**:

```prisma
// 자주 함께 쿼리되는 필드
@@index([studyId, createdAt])      // 메시지 목록
@@index([userId, isRead])          // 읽지 않은 알림
@@index([studyId, isPinned])       // 고정 공지
@@index([status, priority])        // 신고 필터링
```

---

## 📈 마이그레이션 명령어

```bash
# 마이그레이션 생성
npx prisma migrate dev --name init

# DB 푸시 (개발)
npx prisma db push

# 프리즈마 클라이언트 생성
npx prisma generate

# DB 시드
npx prisma db seed
```

