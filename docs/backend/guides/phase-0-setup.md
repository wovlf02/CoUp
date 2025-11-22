# Phase 0: 환경 설정 가이드

> **목표**: PostgreSQL + Prisma 개발 환경 완벽 구축  
> **예상 시간**: 1-2시간  
> **선행 조건**: Node.js 18+, npm 또는 yarn

---

## 📋 체크리스트

- [ ] PostgreSQL 설치 및 실행
- [ ] 데이터베이스 생성
- [ ] Prisma 패키지 설치
- [ ] Prisma 초기화
- [ ] 스키마 작성
- [ ] 마이그레이션 실행
- [ ] Prisma Client 생성
- [ ] Seed 데이터 작성
- [ ] 환경 변수 설정
- [ ] 연결 테스트

---

## 1. PostgreSQL 설치

### Windows

**Option 1: 공식 인스톨러**
```bash
# https://www.postgresql.org/download/windows/
# PostgreSQL 15 또는 16 다운로드 및 설치

# 설치 시 기본값:
# - Port: 5432
# - Username: postgres
# - Password: [설정한 비밀번호]
```

**Option 2: Chocolatey**
```bash
choco install postgresql
```

**Option 3: Docker** (추천)
```bash
docker run --name coup-postgres -e POSTGRES_PASSWORD=coup123 -e POSTGRES_DB=coup -p 5432:5432 -d postgres:15
```

### 설치 확인
```bash
psql --version
# PostgreSQL 15.x 이상 확인
```

---

## 2. 데이터베이스 생성

### Docker 사용 시 (이미 생성됨)
```bash
# 컨테이너 시작
docker start coup-postgres

# 연결 확인
docker exec -it coup-postgres psql -U postgres -d coup
```

### 로컬 설치 시
```bash
# PostgreSQL 접속 (Windows - PowerShell)
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE coup;

# 사용자 생성 (옵션)
CREATE USER coupuser WITH PASSWORD 'coup123';

# 권한 부여
GRANT ALL PRIVILEGES ON DATABASE coup TO coupuser;

# 종료
\q
```

---

## 3. Prisma 설치

### 프로젝트로 이동
```bash
cd C:\Project\CoUp\coup
```

### 패키지 설치
```bash
npm install prisma @prisma/client
npm install -D prisma
```

### Prisma 초기화
```bash
npx prisma init
```

**생성된 파일**:
- `prisma/schema.prisma` - 스키마 정의
- `.env` - 환경 변수 (이미 있으면 추가)

---

## 4. 환경 변수 설정

### `.env.local` 파일 생성 (또는 수정)

```env
# Database
DATABASE_URL="postgresql://postgres:coup123@localhost:5432/coup?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-characters-long-change-this-in-production"

# OAuth (나중에 추가)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800  # 50MB
```

### `DATABASE_URL` 형식
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=public

# 예시
postgresql://postgres:coup123@localhost:5432/coup?schema=public
postgresql://coupuser:coup123@localhost:5432/coup?schema=public
```

---

## 5. Prisma 스키마 작성

### `prisma/schema.prisma` 파일 작성

```prisma
// Prisma 설정
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// 사용자 (User)
// ============================================
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
  createdNotices Notice[]
  
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

// ============================================
// 스터디 (Study)
// ============================================
model Study {
  id            String   @id @default(cuid())
  name          String
  emoji         String   @default("📚")
  description   String   @db.Text
  category      String
  subCategory   String?
  
  // 설정
  maxMembers    Int      @default(20)
  isPublic      Boolean  @default(true)
  autoApprove   Boolean  @default(true)
  isRecruiting  Boolean  @default(true)
  
  // 메타
  tags          String[] // PostgreSQL array
  inviteCode    String   @unique @default(cuid())
  
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

// ============================================
// 스터디 멤버 (StudyMember)
// ============================================
model StudyMember {
  id            String      @id @default(cuid())
  studyId       String
  userId        String
  role          MemberRole  @default(MEMBER)
  status        MemberStatus @default(PENDING)
  
  // 가입 정보
  introduction  String?     @db.Text
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
  @@index([status])
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

// ============================================
// 채팅 메시지 (Message)
// ============================================
model Message {
  id            String   @id @default(cuid())
  studyId       String
  userId        String
  content       String   @db.Text
  fileId        String?
  
  // 읽음 처리
  readers       String[] // User IDs array
  
  // 타임스탬프
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // 관계
  study         Study    @relation(fields: [studyId], references: [id], onDelete: Cascade)
  user          User     @relation(fields: [userId], references: [id])
  file          File?    @relation(fields: [fileId], references: [id])
  
  @@index([studyId, createdAt])
}

// ============================================
// 공지사항 (Notice)
// ============================================
model Notice {
  id            String   @id @default(cuid())
  studyId       String
  authorId      String
  title         String
  content       String   @db.Text
  
  // 상태
  isPinned      Boolean  @default(false)
  isImportant   Boolean  @default(false)
  
  // 통계
  views         Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  study         Study    @relation(fields: [studyId], references: [id], onDelete: Cascade)
  author        User     @relation(fields: [authorId], references: [id])
  
  @@index([studyId, isPinned, createdAt])
}

// ============================================
// 파일 (File)
// ============================================
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

// ============================================
// 캘린더 일정 (Event)
// ============================================
model Event {
  id            String   @id @default(cuid())
  studyId       String
  title         String
  date          DateTime @db.Date
  startTime     String
  endTime       String
  location      String?
  color         String   @default("#6366F1")
  
  createdAt     DateTime @default(now())
  
  study         Study    @relation(fields: [studyId], references: [id], onDelete: Cascade)
  
  @@index([studyId, date])
}

// ============================================
// 할일 (Task)
// ============================================
model Task {
  id            String      @id @default(cuid())
  studyId       String?
  userId        String
  title         String
  description   String?     @db.Text
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

// ============================================
// 알림 (Notification)
// ============================================
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
  
  @@index([userId, isRead, createdAt])
}

enum NotificationType {
  JOIN_APPROVED
  NOTICE
  FILE
  EVENT
  TASK
  MEMBER
  KICK
  CHAT
}

// ============================================
// 신고 (Report)
// ============================================
model Report {
  id            String       @id @default(cuid())
  reporterId    String
  targetType    TargetType
  targetId      String
  type          ReportType
  reason        String       @db.Text
  evidence      Json?        // 증거 자료
  
  status        ReportStatus @default(PENDING)
  priority      Priority     @default(MEDIUM)
  
  // 처리
  processedBy   String?
  processedAt   DateTime?
  resolution    String?      @db.Text
  
  createdAt     DateTime     @default(now())
  
  reporter      User         @relation(fields: [reporterId], references: [id])
  
  @@index([status, priority, createdAt])
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
  OTHER
}

enum ReportStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  REJECTED
}
```

---

## 6. 마이그레이션 실행

### 마이그레이션 생성 및 적용
```bash
npx prisma migrate dev --name init
```

**결과**:
- `prisma/migrations/` 폴더 생성
- SQL 마이그레이션 파일 생성
- 데이터베이스에 테이블 생성
- Prisma Client 자동 생성

### 마이그레이션 확인
```bash
# 데이터베이스 연결 확인
npx prisma db pull

# 마이그레이션 상태 확인
npx prisma migrate status
```

---

## 7. Prisma Client 생성

```bash
npx prisma generate
```

**결과**:
- `node_modules/@prisma/client` 업데이트
- TypeScript 타입 생성

---

## 8. Prisma Client 설정

### `src/lib/prisma.js` 파일 생성

```javascript
// src/lib/prisma.js
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

**설명**:
- 개발 환경에서 Hot Reload 시 연결 재사용
- 프로덕션에서는 단일 인스턴스
- 로깅 레벨 환경별 설정

---

## 9. Seed 데이터 작성

### `prisma/seed.js` 파일 생성

```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 기존 데이터 삭제 (개발용)
  await prisma.notification.deleteMany()
  await prisma.task.deleteMany()
  await prisma.event.deleteMany()
  await prisma.file.deleteMany()
  await prisma.message.deleteMany()
  await prisma.notice.deleteMany()
  await prisma.studyMember.deleteMany()
  await prisma.study.deleteMany()
  await prisma.report.deleteMany()
  await prisma.user.deleteMany()

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 사용자 생성
  const user1 = await prisma.user.create({
    data: {
      email: 'kim@example.com',
      password: hashedPassword,
      name: '김민준',
      bio: '안녕하세요! 백엔드 개발자입니다.',
      role: 'USER',
      status: 'ACTIVE',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'lee@example.com',
      password: hashedPassword,
      name: '이서연',
      role: 'USER',
      status: 'ACTIVE',
    },
  })

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: '관리자',
      role: 'SYSTEM_ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Users created:', user1.email, user2.email, admin.email)

  // 스터디 생성
  const study1 = await prisma.study.create({
    data: {
      name: '알고리즘 마스터 스터디',
      emoji: '💻',
      description: '매일 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디입니다.',
      category: '프로그래밍',
      subCategory: '알고리즘/코테',
      maxMembers: 20,
      isPublic: true,
      autoApprove: false,
      isRecruiting: true,
      tags: ['알고리즘', '코딩테스트', '매일'],
    },
  })

  const study2 = await prisma.study.create({
    data: {
      name: '취업 준비 스터디',
      emoji: '💼',
      description: '함께 이력서와 면접을 준비하는 스터디',
      category: '취업',
      subCategory: '면접준비',
      maxMembers: 15,
      isPublic: true,
      autoApprove: true,
      isRecruiting: true,
      tags: ['취업', '면접', '자소서'],
    },
  })

  console.log('✅ Studies created:', study1.name, study2.name)

  // 스터디 멤버 생성
  await prisma.studyMember.create({
    data: {
      studyId: study1.id,
      userId: user1.id,
      role: 'OWNER',
      status: 'ACTIVE',
      approvedAt: new Date(),
    },
  })

  await prisma.studyMember.create({
    data: {
      studyId: study1.id,
      userId: user2.id,
      role: 'MEMBER',
      status: 'ACTIVE',
      approvedAt: new Date(),
    },
  })

  await prisma.studyMember.create({
    data: {
      studyId: study2.id,
      userId: user1.id,
      role: 'MEMBER',
      status: 'ACTIVE',
      approvedAt: new Date(),
    },
  })

  console.log('✅ Study members created')

  // 공지사항 생성
  await prisma.notice.create({
    data: {
      studyId: study1.id,
      authorId: user1.id,
      title: '스터디 규칙 안내',
      content: '매일 1문제씩 풀고 코드를 공유해주세요!',
      isPinned: true,
      isImportant: true,
    },
  })

  console.log('✅ Notices created')

  // 할일 생성
  await prisma.task.create({
    data: {
      studyId: study1.id,
      userId: user1.id,
      title: '백준 1234번 풀이',
      description: '백준 1234번 문제를 풀어주세요',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
      completed: false,
    },
  })

  console.log('✅ Tasks created')

  // 알림 생성
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'JOIN_APPROVED',
      studyId: study1.id,
      studyName: study1.name,
      studyEmoji: study1.emoji,
      message: '가입이 승인되었습니다',
      isRead: false,
    },
  })

  console.log('✅ Notifications created')

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### `package.json`에 Seed 스크립트 추가

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  },
  "scripts": {
    "db:seed": "node prisma/seed.js"
  }
}
```

### bcryptjs 설치 (Seed용)
```bash
npm install bcryptjs
```

### Seed 실행
```bash
npm run db:seed
```

---

## 10. 연결 테스트

### 테스트 스크립트 작성 (`test-db.js`)

```javascript
// test-db.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing database connection...')

  // 사용자 조회
  const users = await prisma.user.findMany()
  console.log('✅ Users:', users.length)

  // 스터디 조회
  const studies = await prisma.study.findMany()
  console.log('✅ Studies:', studies.length)

  // 스터디 멤버 조회
  const members = await prisma.studyMember.findMany({
    include: {
      user: true,
      study: true,
    },
  })
  console.log('✅ Study Members:', members.length)

  console.log('\n📊 Sample Data:')
  console.log('User:', users[0])
  console.log('Study:', studies[0])

  console.log('\n🎉 Database connection successful!')
}

main()
  .catch((e) => {
    console.error('❌ Connection error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 테스트 실행
```bash
node test-db.js
```

**예상 출력**:
```
🔍 Testing database connection...
✅ Users: 3
✅ Studies: 2
✅ Study Members: 3

📊 Sample Data:
User: {
  id: 'clx...',
  email: 'kim@example.com',
  name: '김민준',
  ...
}
Study: {
  id: 'clx...',
  name: '알고리즘 마스터 스터디',
  ...
}

🎉 Database connection successful!
```

---

## 11. Prisma Studio (선택)

### Prisma Studio 실행
```bash
npx prisma studio
```

**결과**:
- 브라우저에서 `http://localhost:5555` 열림
- GUI로 데이터 확인 및 수정 가능

---

## 🎯 완료 확인

### 체크리스트
- [x] PostgreSQL 실행 중
- [x] 데이터베이스 `coup` 생성됨
- [x] Prisma 설치 완료
- [x] `prisma/schema.prisma` 작성
- [x] 마이그레이션 실행 완료
- [x] Prisma Client 생성됨
- [x] Seed 데이터 삽입 완료
- [x] 연결 테스트 성공
- [x] `.env.local` 설정 완료

---

## 🐛 문제 해결

### 연결 오류
```
Error: P1001: Can't reach database server
```
**해결**:
- PostgreSQL이 실행 중인지 확인
- `DATABASE_URL`이 올바른지 확인
- 포트 5432가 열려있는지 확인

### 마이그레이션 오류
```
Error: P3018: Migration failed
```
**해결**:
```bash
# 마이그레이션 초기화
npx prisma migrate reset

# 다시 실행
npx prisma migrate dev --name init
```

### Seed 오류
```
Error: Module not found: bcryptjs
```
**해결**:
```bash
npm install bcryptjs
```

---

## 📚 다음 단계

**Phase 1: 인증 시스템**
- NextAuth.js 설정
- 회원가입/로그인 API
- 세션 관리

👉 **[phase-1-auth.md](./phase-1-auth.md)** 로 이동

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-18

