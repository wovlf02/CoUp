# 사용자 관리 완전 명세

> 이 문서는 `/features/01-user-management.md`와 `/examples/01-best-practices.md`를 통합하여 CoUp 플랫폼에 최적화된 최종 사용자 관리 시스템 명세입니다.

## 📋 목차

1. [개요](#개요)
2. [데이터 모델](#데이터-모델)
3. [API 명세](#api-명세)
4. [권한 시스템](#권한-시스템)
5. [UI 컴포넌트](#ui-컴포넌트)
6. [구현 가이드](#구현-가이드)
7. [테스트 시나리오](#테스트-시나리오)

## 개요

### 목적
CoUp 플랫폼의 사용자를 효율적으로 관리하고, 부적절한 사용자 활동을 모니터링하며, 필요 시 적절한 제재를 가할 수 있는 시스템을 구축합니다.

### 핵심 기능
1. **사용자 조회 및 검색**: 다양한 필터와 정렬 옵션
2. **사용자 상태 관리**: 정지, 해제, 삭제
3. **경고 시스템**: 누적 경고 및 자동 제재
4. **통계 및 분석**: 대시보드 지표 및 추세 분석
5. **감사 로그**: 모든 관리자 활동 기록

## 데이터 모델

### 1. User 모델 (기존)

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String?
  name     String?
  avatar   String?
  bio      String?
  provider Provider @default(CREDENTIALS)
  role     UserRole @default(USER)
  
  // 소셜 로그인
  googleId String? @unique
  githubId String? @unique
  
  // 상태
  status         UserStatus @default(ACTIVE)
  suspendedUntil DateTime?
  suspendReason  String?
  
  // 타임스탬프
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastLoginAt DateTime?
  
  // 관계
  ownedStudies       Study[]
  studyMembers       StudyMember[]
  messages           Message[]
  notifications      Notification[]
  tasks              Task[]
  reports            Report[]
  createdNotices     Notice[]
  uploadedFiles      File[]
  createdEvents      Event[]
  createdStudyTasks  StudyTask[]
  assignedStudyTasks StudyTaskAssignee[]
  
  // 관리자 관련 (추가)
  sanctions          Sanction[]          @relation("UserSanctions")
  receivedWarnings   Warning[]
  adminLogs          AdminLog[]          @relation("AdminActions")
  
  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@index([lastLoginAt])
}

enum UserRole {
  USER
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

### 2. 새로운 모델

#### 2.1 경고 시스템

```prisma
model Warning {
  id        String   @id @default(cuid())
  userId    String
  adminId   String
  reason    String   @db.Text
  severity  WarningSeverity @default(NORMAL)
  relatedContent String? // URL or ID
  expiresAt DateTime? // 경고 유효 기간
  createdAt DateTime @default(now())
  
  user  User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])
  @@index([severity, createdAt])
}

enum WarningSeverity {
  MINOR    // 경미한 위반
  NORMAL   // 일반 위반
  SERIOUS  // 심각한 위반
  CRITICAL // 치명적 위반
}
```

#### 2.2 제재 이력

```prisma
model Sanction {
  id              String       @id @default(cuid())
  userId          String
  adminId         String
  type            SanctionType
  reason          String       @db.Text
  duration        String?      // "1d", "3d", "7d", "30d", "permanent"
  expiresAt       DateTime?
  relatedReportId String?
  
  // 해제 정보
  isActive         Boolean  @default(true)
  unsuspendedBy    String?
  unsuspendReason  String?
  unsuspendedAt    DateTime?
  
  createdAt DateTime @default(now())
  
  user User @relation("UserSanctions", fields: [userId], references: [id])
  
  @@index([userId, type, createdAt])
  @@index([isActive, expiresAt])
}

enum SanctionType {
  WARNING         // 경고
  CHAT_BAN        // 채팅 금지
  STUDY_CREATE_BAN // 스터디 생성 금지
  FILE_UPLOAD_BAN  // 파일 업로드 금지
  SUSPENSION      // 계정 정지
  PERMANENT_BAN   // 영구 정지
}
```

#### 2.3 관리자 활동 로그

```prisma
model AdminLog {
  id         String      @id @default(cuid())
  adminId    String
  action     AdminAction
  targetType String?     // "User", "Study", "Report"
  targetId   String?
  
  // 변경 내용
  before     Json?
  after      Json?
  reason     String?     @db.Text
  
  // 메타 정보
  ipAddress  String?
  userAgent  String?
  
  createdAt DateTime @default(now())
  
  admin User @relation("AdminActions", fields: [adminId], references: [id])
  
  @@index([adminId, createdAt])
  @@index([action, createdAt])
  @@index([targetType, targetId])
}

enum AdminAction {
  // 사용자 관리
  USER_VIEW
  USER_SEARCH
  USER_WARN
  USER_SUSPEND
  USER_UNSUSPEND
  USER_DELETE
  USER_RESTORE
  USER_UPDATE
  
  // 스터디 관리
  STUDY_VIEW
  STUDY_HIDE
  STUDY_CLOSE
  STUDY_DELETE
  STUDY_RECOMMEND
  
  // 신고 처리
  REPORT_VIEW
  REPORT_ASSIGN
  REPORT_RESOLVE
  REPORT_REJECT
  
  // 콘텐츠 관리
  CONTENT_DELETE
  CONTENT_RESTORE
  
  // 시스템 설정
  SETTINGS_VIEW
  SETTINGS_UPDATE
}
```

#### 2.4 관리자 역할 및 권한

```prisma
model AdminRole {
  id          String   @id @default(cuid())
  userId      String   @unique
  role        AdminRoleType
  permissions Json     // 세부 권한 JSON
  grantedBy   String
  grantedAt   DateTime @default(now())
  expiresAt   DateTime?
  
  @@index([role])
}

enum AdminRoleType {
  VIEWER      // 조회만 가능
  MODERATOR   // 콘텐츠 모더레이션
  ADMIN       // 사용자/스터디 관리
  SUPER_ADMIN // 모든 권한
}
```

## API 명세

### 1. 사용자 조회

#### 1.1 사용자 목록

```typescript
GET /api/admin/users

Query Parameters:
{
  page?: number             // 페이지 번호 (default: 1)
  limit?: number            // 페이지 크기 (default: 20, max: 100)
  search?: string           // 검색어 (이메일, 이름, ID)
  status?: UserStatus       // 상태 필터
  provider?: Provider       // 가입 방식 필터
  sortBy?: string           // 정렬 기준 (createdAt, lastLoginAt, warningCount)
  sortOrder?: 'asc' | 'desc'
  
  // 날짜 필터
  createdFrom?: string      // ISO 8601
  createdTo?: string
  lastLoginFrom?: string
  lastLoginTo?: string
  
  // 활동 필터
  minStudies?: number       // 최소 참여 스터디 수
  maxStudies?: number
  minMessages?: number      // 최소 메시지 수
  
  // 제재 필터
  hasWarnings?: boolean     // 경고 있는 사용자만
  isSuspended?: boolean     // 정지된 사용자만
}

Response: {
  success: true,
  data: {
    users: User[],
    pagination: {
      total: number,
      page: number,
      limit: number,
      totalPages: number
    },
    filters: {
      applied: string[],
      available: Filter[]
    }
  }
}

User Type:
{
  id: string,
  email: string,
  name: string,
  avatar: string,
  status: UserStatus,
  provider: Provider,
  createdAt: string,
  lastLoginAt: string,
  
  // 통계
  stats: {
    studiesOwned: number,
    studiesJoined: number,
    messagesCount: number,
    warningCount: number,
    activeSanctions: number
  },
  
  // 마스킹된 민감 정보
  maskedEmail?: string,     // u***@example.com
  
  // 빠른 액션 가능 여부
  canWarn: boolean,
  canSuspend: boolean,
  canDelete: boolean
}
```

**구현 예시:**
```javascript
// app/api/admin/users/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  
  // 권한 확인
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  
  // 로그 기록
  await logAdminAction({
    adminId: admin.user.id,
    action: 'USER_SEARCH',
    details: { query: Object.fromEntries(searchParams) }
  })
  
  // 쿼리 파싱
  const filters = parseUserFilters(searchParams)
  
  // 데이터 조회
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: filters.where,
      skip: filters.skip,
      take: filters.take,
      orderBy: filters.orderBy,
      include: {
        _count: {
          select: {
            ownedStudies: true,
            studyMembers: { where: { status: 'ACTIVE' } },
            messages: true,
            receivedWarnings: true
          }
        },
        sanctions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    }),
    prisma.user.count({ where: filters.where })
  ])
  
  // 데이터 변환
  const transformedUsers = users.map(user => ({
    ...user,
    maskedEmail: maskEmail(user.email),
    stats: {
      studiesOwned: user._count.ownedStudies,
      studiesJoined: user._count.studyMembers,
      messagesCount: user._count.messages,
      warningCount: user._count.receivedWarnings,
      activeSanctions: user.sanctions.length
    },
    canWarn: hasPermission(admin, 'warn:users'),
    canSuspend: hasPermission(admin, 'suspend:users'),
    canDelete: hasPermission(admin, 'delete:users')
  }))
  
  return NextResponse.json({
    success: true,
    data: {
      users: transformedUsers,
      pagination: calculatePagination(total, filters),
      filters: getAvailableFilters()
    }
  })
}
```

#### 1.2 사용자 상세 정보

```typescript
GET /api/admin/users/:userId

Response: {
  success: true,
  data: {
    user: {
      // 기본 정보
      id: string,
      email: string,
      name: string,
      avatar: string,
      bio: string,
      status: UserStatus,
      provider: Provider,
      createdAt: string,
      updatedAt: string,
      lastLoginAt: string,
      
      // 상태 상세
      suspendedUntil?: string,
      suspendReason?: string,
      
      // 통계
      stats: {
        studiesOwned: number,
        studiesJoined: number,
        messagesCount: number,
        filesUploaded: number,
        tasksCompleted: number
      },
      
      // 활동 히스토리
      recentActivity: Activity[],
      
      // 제재 이력
      sanctions: Sanction[],
      warnings: Warning[],
      
      // 신고 이력
      reportsReceived: Report[],
      reportsMade: Report[]
    }
  }
}
```

### 2. 사용자 상태 관리

#### 2.1 경고 발급

```typescript
POST /api/admin/users/:userId/warn

Body: {
  reason: string,           // 경고 사유 (필수)
  severity: WarningSeverity, // 경고 심각도
  relatedContent?: string,  // 관련 콘텐츠 URL/ID
  expiresAt?: string,       // 경고 만료일
  notifyUser?: boolean      // 사용자에게 알림 (default: true)
}

Response: {
  success: true,
  data: {
    warning: Warning,
    totalWarnings: number,
    autoSanction?: {
      applied: boolean,
      type: SanctionType,
      reason: string
    }
  }
}
```

**구현 예시:**
```javascript
export async function POST(request, { params }) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  
  const { userId } = params
  const body = await request.json()
  
  // 유효성 검사
  if (!body.reason || body.reason.length < 10) {
    return NextResponse.json({
      success: false,
      error: '경고 사유는 최소 10자 이상이어야 합니다.'
    }, { status: 400 })
  }
  
  // 트랜잭션 시작
  const result = await prisma.$transaction(async (tx) => {
    // 경고 생성
    const warning = await tx.warning.create({
      data: {
        userId,
        adminId: admin.user.id,
        reason: body.reason,
        severity: body.severity || 'NORMAL',
        relatedContent: body.relatedContent,
        expiresAt: body.expiresAt
      }
    })
    
    // 총 경고 수 조회
    const totalWarnings = await tx.warning.count({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })
    
    // 자동 제재 규칙 적용
    let autoSanction = null
    if (totalWarnings >= 5) {
      // 5회 경고 → 영구 정지
      autoSanction = await tx.sanction.create({
        data: {
          userId,
          adminId: admin.user.id,
          type: 'PERMANENT_BAN',
          reason: `${totalWarnings}회 경고 누적으로 인한 자동 영구 정지`,
          duration: 'permanent'
        }
      })
      
      await tx.user.update({
        where: { id: userId },
        data: { status: 'SUSPENDED' }
      })
    } else if (totalWarnings >= 3) {
      // 3회 경고 → 7일 정지
      const expiresAt = addDays(new Date(), 7)
      autoSanction = await tx.sanction.create({
        data: {
          userId,
          adminId: admin.user.id,
          type: 'SUSPENSION',
          reason: `${totalWarnings}회 경고 누적으로 인한 자동 7일 정지`,
          duration: '7d',
          expiresAt
        }
      })
      
      await tx.user.update({
        where: { id: userId },
        data: {
          status: 'SUSPENDED',
          suspendedUntil: expiresAt,
          suspendReason: autoSanction.reason
        }
      })
    }
    
    // 로그 기록
    await tx.adminLog.create({
      data: {
        adminId: admin.user.id,
        action: 'USER_WARN',
        targetType: 'User',
        targetId: userId,
        reason: body.reason,
        after: { warningId: warning.id, totalWarnings }
      }
    })
    
    return { warning, totalWarnings, autoSanction }
  })
  
  // 사용자에게 알림
  if (body.notifyUser !== false) {
    await sendWarningNotification(userId, result.warning)
  }
  
  return NextResponse.json({
    success: true,
    data: result
  })
}
```

#### 2.2 계정 정지

```typescript
POST /api/admin/users/:userId/suspend

Body: {
  reason: string,          // 정지 사유 (필수)
  duration: string,        // "1d", "3d", "7d", "30d", "permanent"
  type: SanctionType,      // 정지 유형
  relatedReportId?: string,
  notifyUser?: boolean
}

Response: {
  success: true,
  data: {
    sanction: Sanction,
    user: {
      id: string,
      status: UserStatus,
      suspendedUntil: string
    }
  }
}
```

#### 2.3 계정 정지 해제

```typescript
POST /api/admin/users/:userId/unsuspend

Body: {
  reason: string,          // 해제 사유
  notifyUser?: boolean
}

Response: {
  success: true,
  data: {
    user: User,
    sanction: Sanction
  }
}
```

#### 2.4 계정 삭제

```typescript
DELETE /api/admin/users/:userId

Body: {
  reason: string,
  hardDelete?: boolean,    // 하드 삭제 여부 (default: false)
  deleteContent?: boolean  // 콘텐츠도 삭제 (default: false)
}

Response: {
  success: true,
  data: {
    deletedUser: {
      id: string,
      email: string,
      deletedAt: string
    },
    contentHandling: {
      studiesDeleted: number,
      messagesAnonymized: number,
      filesDeleted: number
    }
  }
}
```

## 권한 시스템

### 권한 정의

```javascript
// lib/admin/permissions.js
export const PERMISSIONS = {
  // 조회 권한
  'read:users': 'VIEWER',
  'read:studies': 'VIEWER',
  'read:reports': 'VIEWER',
  'read:logs': 'ADMIN',
  
  // 사용자 관리
  'warn:users': 'MODERATOR',
  'suspend:users:short': 'MODERATOR',  // 7일 이하
  'suspend:users:long': 'ADMIN',       // 7일 초과
  'suspend:users:permanent': 'ADMIN',
  'delete:users:soft': 'ADMIN',
  'delete:users:hard': 'SUPER_ADMIN',
  'restore:users': 'ADMIN',
  
  // 콘텐츠 관리
  'delete:content': 'MODERATOR',
  'restore:content': 'ADMIN',
  
  // 신고 처리
  'assign:reports': 'MODERATOR',
  'resolve:reports': 'MODERATOR',
  'reject:reports': 'ADMIN',
  
  // 스터디 관리
  'hide:studies': 'MODERATOR',
  'close:studies': 'ADMIN',
  'delete:studies': 'ADMIN',
  
  // 시스템 설정
  'update:settings': 'SUPER_ADMIN',
  'manage:admins': 'SUPER_ADMIN'
}

export function hasPermission(admin, permission) {
  const requiredRole = PERMISSIONS[permission]
  if (!requiredRole) return false
  
  const roleHierarchy = {
    'VIEWER': 1,
    'MODERATOR': 2,
    'ADMIN': 3,
    'SUPER_ADMIN': 4
  }
  
  return roleHierarchy[admin.role] >= roleHierarchy[requiredRole]
}
```

## UI 컴포넌트

### 1. 사용자 목록 페이지

**파일 구조:**
```
app/admin/users/
├── page.jsx              # 메인 페이지
├── components/
│   ├── UserTable.jsx     # 사용자 테이블
│   ├── UserCard.jsx      # 카드 뷰
│   ├── UserFilters.jsx   # 필터 패널
│   ├── QuickActions.jsx  # 빠른 액션 메뉴
│   └── BulkActions.jsx   # 일괄 작업 바
└── modals/
    ├── WarnModal.jsx     # 경고 모달
    ├── SuspendModal.jsx  # 정지 모달
    └── DeleteModal.jsx   # 삭제 확인 모달
```

**구현 예시 (UserTable.jsx):**
```jsx
'use client'

import { useState } from 'react'
import { useAdminUsers } from '@/lib/hooks/useAdminApi'
import styles from './UserTable.module.css'

export default function UserTable({ filters }) {
  const [selectedUsers, setSelectedUsers] = useState([])
  const { data, isLoading } = useAdminUsers(filters)
  
  if (isLoading) return <TableSkeleton />
  
  return (
    <div className={styles.container}>
      {/* 일괄 작업 바 */}
      {selectedUsers.length > 0 && (
        <BulkActions 
          selectedCount={selectedUsers.length}
          onWarn={() => handleBulkWarn(selectedUsers)}
          onSuspend={() => handleBulkSuspend(selectedUsers)}
        />
      )}
      
      {/* 테이블 */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox"
                onChange={handleSelectAll}
              />
            </th>
            <th>사용자</th>
            <th>이메일</th>
            <th>상태</th>
            <th>가입일</th>
            <th>활동</th>
            <th>경고</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map(user => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleSelect(user.id)}
                />
              </td>
              <td>
                <div className={styles.userInfo}>
                  <img src={user.avatar} alt="" />
                  <span>{user.name}</span>
                </div>
              </td>
              <td>
                <span className={styles.email}>
                  {user.maskedEmail}
                </span>
              </td>
              <td>
                <StatusBadge status={user.status} />
              </td>
              <td>
                <RelativeTime date={user.createdAt} />
              </td>
              <td>
                <ActivityStats stats={user.stats} />
              </td>
              <td>
                <WarningBadge count={user.stats.warningCount} />
              </td>
              <td>
                <QuickActions
                  user={user}
                  onWarn={() => openWarnModal(user)}
                  onSuspend={() => openSuspendModal(user)}
                  onView={() => router.push(`/admin/users/${user.id}`)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* 페이지네이션 */}
      <Pagination pagination={data.pagination} />
    </div>
  )
}
```

### 2. 사용자 상세 페이지

**구현 예시:**
```jsx
// app/admin/users/[userId]/page.jsx
'use client'

import { useAdminUser } from '@/lib/hooks/useAdminApi'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@/components/ui/Tabs'

export default function UserDetailPage({ params }) {
  const { data: user, isLoading } = useAdminUser(params.userId)
  
  if (isLoading) return <PageSkeleton />
  
  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <UserDetailHeader user={user} />
      
      {/* 빠른 액션 */}
      <ActionBar user={user} />
      
      {/* 탭 */}
      <Tabs>
        <TabList>
          <Tab>기본 정보</Tab>
          <Tab>활동 내역</Tab>
          <Tab>참여 스터디</Tab>
          <Tab>제재 이력</Tab>
          <Tab>신고 이력</Tab>
          <Tab>로그</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <UserBasicInfo user={user} />
          </TabPanel>
          
          <TabPanel>
            <UserActivity userId={user.id} />
          </TabPanel>
          
          <TabPanel>
            <UserStudies userId={user.id} />
          </TabPanel>
          
          <TabPanel>
            <SanctionHistory sanctions={user.sanctions} />
          </TabPanel>
          
          <TabPanel>
            <ReportHistory
              received={user.reportsReceived}
              made={user.reportsMade}
            />
          </TabPanel>
          
          <TabPanel>
            <AdminLogs targetId={user.id} targetType="User" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}
```

## 구현 가이드

### Phase 1: 기본 구조 (Week 1-2)

1. **데이터베이스 마이그레이션**
   ```bash
   # Prisma 스키마 업데이트
   # Warning, Sanction, AdminLog, AdminRole 모델 추가
   npx prisma migrate dev --name add_admin_models
   ```

2. **권한 시스템 구현**
   - `/lib/admin/permissions.js` 생성
   - `/lib/admin/auth.js` - requireAdmin 미들웨어

3. **기본 API 라우트**
   - `GET /api/admin/users` - 목록
   - `GET /api/admin/users/:id` - 상세

### Phase 2: 핵심 기능 (Week 3-4)

1. **사용자 관리 액션**
   - 경고 발급 API
   - 정지 API
   - 정지 해제 API

2. **감사 로그**
   - AdminLog 생성 헬퍼 함수
   - 모든 관리자 액션에 로그 추가

3. **UI 컴포넌트**
   - 사용자 목록 테이블
   - 필터 및 검색
   - 빠른 액션 메뉴

### Phase 3: 고급 기능 (Week 5-6)

1. **자동화 규칙**
   - 경고 누적 시 자동 제재
   - 의심스러운 활동 탐지

2. **통계 대시보드**
   - 사용자 통계 API
   - 차트 및 그래프

3. **알림 시스템**
   - 제재 통지 이메일
   - 관리자 알림

## 테스트 시나리오

### 단위 테스트

```javascript
// __tests__/admin/users/warn.test.js
describe('POST /api/admin/users/:userId/warn', () => {
  it('should create a warning', async () => {
    const response = await fetch('/api/admin/users/user123/warn', {
      method: 'POST',
      headers: authHeaders(adminUser),
      body: JSON.stringify({
        reason: 'Spam messages',
        severity: 'NORMAL'
      })
    })
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.warning).toBeDefined()
  })
  
  it('should auto-suspend after 3 warnings', async () => {
    // 이미 2개의 경고가 있는 사용자
    const user = await createUserWithWarnings(2)
    
    // 3번째 경고 발급
    const response = await warnUser(user.id, {
      reason: 'Third warning'
    })
    
    const data = await response.json()
    expect(data.data.autoSanction).toBeDefined()
    expect(data.data.autoSanction.type).toBe('SUSPENSION')
    
    // 사용자 상태 확인
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    })
    expect(updatedUser.status).toBe('SUSPENDED')
  })
  
  it('should require reason', async () => {
    const response = await warnUser('user123', {})
    expect(response.status).toBe(400)
  })
})
```

### 통합 테스트

```javascript
describe('User Management Workflow', () => {
  it('should complete full warning to suspension flow', async () => {
    const user = await createTestUser()
    
    // 1. 첫 번째 경고
    await warnUser(user.id, { reason: 'Warning 1' })
    let userData = await getUser(user.id)
    expect(userData.stats.warningCount).toBe(1)
    
    // 2. 두 번째 경고
    await warnUser(user.id, { reason: 'Warning 2' })
    userData = await getUser(user.id)
    expect(userData.stats.warningCount).toBe(2)
    
    // 3. 세 번째 경고 → 자동 정지
    await warnUser(user.id, { reason: 'Warning 3' })
    userData = await getUser(user.id)
    expect(userData.status).toBe('SUSPENDED')
    
    // 4. 정지 해제
    await unsuspendUser(user.id, { reason: 'Appealed' })
    userData = await getUser(user.id)
    expect(userData.status).toBe('ACTIVE')
  })
})
```

## ✅ 최종 체크리스트

### 백엔드
- [ ] Prisma 스키마 업데이트
- [ ] 데이터베이스 마이그레이션
- [ ] API 라우트 구현 (목록, 상세, 경고, 정지, 해제, 삭제)
- [ ] 권한 시스템 구현
- [ ] 감사 로그 시스템
- [ ] 자동화 규칙 엔진
- [ ] 단위 테스트 작성

### 프론트엔드
- [ ] 사용자 목록 페이지
- [ ] 사용자 상세 페이지
- [ ] 필터 및 검색 UI
- [ ] 경고 모달
- [ ] 정지 모달
- [ ] 일괄 작업 UI
- [ ] 통계 대시보드

### 보안
- [ ] 관리자 인증 구현
- [ ] 권한 체크 미들웨어
- [ ] 민감 정보 마스킹
- [ ] Rate Limiting
- [ ] CSRF 보호

### 문서화
- [ ] API 문서 작성
- [ ] 관리자 가이드 작성
- [ ] 개발자 문서 작성

