# 데이터 모델

## 개요

PostgreSQL 데이터베이스와 Prisma ORM을 사용합니다.

## 핵심 엔티티

### User (사용자)

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String?
  name     String?
  avatar   String?
  bio      String?
  provider Provider @default(CREDENTIALS)  // CREDENTIALS, GOOGLE, GITHUB
  role     UserRole @default(USER)          // USER, ADMIN
  status   UserStatus @default(ACTIVE)      // ACTIVE, SUSPENDED, DELETED
  
  // 제한
  restrictedUntil   DateTime?
  restrictedActions String[]  @default([])
}
```

### Study (스터디)

```prisma
model Study {
  id          String  @id @default(cuid())
  ownerId     String
  name        String
  emoji       String  @default("📚")
  description String
  category    String
  
  // 설정
  maxMembers   Int     @default(20)
  isPublic     Boolean @default(true)
  autoApprove  Boolean @default(true)
  isRecruiting Boolean @default(true)
  
  tags       String[]
  inviteCode String   @unique
}
```

### StudyMember (스터디 멤버)

```prisma
model StudyMember {
  studyId String
  userId  String
  role    MemberRole   @default(MEMBER)  // OWNER, ADMIN, MEMBER
  status  MemberStatus @default(PENDING) // PENDING, ACTIVE, KICKED, LEFT
}
```

### Message (채팅 메시지)

```prisma
model Message {
  id      String   @id
  studyId String
  userId  String
  content String
  readers String[] // 읽은 사용자 ID 배열
}
```

### Notice (공지사항)

```prisma
model Notice {
  id       String  @id
  studyId  String
  authorId String
  title    String
  content  String
  isPinned    Boolean @default(false)
  isImportant Boolean @default(false)
}
```

### Task (개인 할일)

```prisma
model Task {
  id          String     @id
  userId      String
  studyId     String?
  title       String
  status      TaskStatus // TODO, IN_PROGRESS, REVIEW, DONE
  priority    Priority   // LOW, MEDIUM, HIGH, URGENT
  dueDate     DateTime?
}
```

### StudyTask (스터디 할일)

```prisma
model StudyTask {
  id          String     @id
  studyId     String
  createdById String
  title       String
  status      TaskStatus
  priority    Priority
  assignees   StudyTaskAssignee[]
}
```

### Notification (알림)

```prisma
model Notification {
  id      String           @id
  userId  String
  type    NotificationType // JOIN_APPROVED, NOTICE, FILE, EVENT, TASK, MEMBER, KICK, CHAT
  message String
  isRead  Boolean @default(false)
}
```

### Event (캘린더 일정)

```prisma
model Event {
  id        String   @id
  studyId   String
  title     String
  date      DateTime
  startTime String
  endTime   String
  location  String?
  color     String
}
```

### File (파일)

```prisma
model File {
  id         String @id
  studyId    String
  uploaderId String
  name       String
  size       Int
  type       String
  url        String
}
```

## 관리자 시스템 엔티티

### Report (신고)

```prisma
model Report {
  id         String     @id
  reporterId String
  targetType TargetType // USER, STUDY, MESSAGE
  targetId   String
  type       ReportType // SPAM, HARASSMENT, INAPPROPRIATE, COPYRIGHT, OTHER
  status     ReportStatus // PENDING, IN_PROGRESS, RESOLVED, REJECTED
}
```

### Warning (경고)

```prisma
model Warning {
  id       String          @id
  userId   String
  adminId  String
  reason   String
  severity WarningSeverity // MINOR, NORMAL, SERIOUS, CRITICAL
}
```

### Sanction (제재)

```prisma
model Sanction {
  id        String       @id
  userId    String
  adminId   String
  type      SanctionType // WARNING, CHAT_BAN, STUDY_CREATE_BAN, FILE_UPLOAD_BAN, RESTRICTION, SUSPENSION, PERMANENT_BAN
  duration  String?
  expiresAt DateTime?
  isActive  Boolean @default(true)
}
```

### AdminLog (관리자 로그)

```prisma
model AdminLog {
  id         String      @id
  adminId    String
  action     AdminAction
  targetType String?
  targetId   String?
  before     Json?
  after      Json?
}
```

## 그룹 시스템

### Group (그룹)

```prisma
model Group {
  id          String  @id
  name        String
  description String?
  category    String
  isPublic    Boolean @default(true)
  maxMembers  Int     @default(50)
}
```

### GroupMember (그룹 멤버)

```prisma
model GroupMember {
  groupId String
  userId  String
  role    GroupMemberRole   // OWNER, ADMIN, MEMBER
  status  GroupMemberStatus // PENDING, ACTIVE, LEFT, KICKED
}
```

## 시스템 설정

### SystemSetting

```prisma
model SystemSetting {
  id          String @id
  category    String // general, security, notification, feature
  key         String @unique
  value       String
  type        String // string, number, boolean, json
}
```

## 관계도

```
User ─┬─────────── Study (owner)
      ├─ StudyMember ─ Study
      ├─ Message
      ├─ Notification
      ├─ Task
      ├─ Report
      ├─ Warning
      ├─ Sanction
      ├─ AdminLog
      ├─ Group (creator)
      └─ GroupMember ─ Group

Study ─┬─ StudyMember
       ├─ Message
       ├─ Notice
       ├─ File
       ├─ Event
       ├─ Task
       └─ StudyTask ─ StudyTaskAssignee
```

