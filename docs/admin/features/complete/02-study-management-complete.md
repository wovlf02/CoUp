# 스터디 관리 완전 명세

> 이 문서는 `/features/02-study-management.md`와 `/examples/01-best-practices.md`를 통합하여 CoUp 플랫폼에 최적화된 최종 스터디 관리 시스템 명세입니다.

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
CoUp 플랫폼의 스터디를 효율적으로 관리하고, 부적절한 스터디를 모니터링하며, 양질의 스터디를 큐레이션하는 시스템을 구축합니다.

### 핵심 기능
1. **스터디 조회 및 검색**: 다양한 필터와 정렬
2. **스터디 상태 관리**: 숨김, 종료, 삭제
3. **콘텐츠 모더레이션**: 메시지, 파일, 공지사항 관리
4. **멤버 관리**: 강제 퇴출, 스터디장 변경
5. **추천 시스템**: 우수 스터디 큐레이션
6. **통계 및 분석**: 활동 추이 및 트렌드 분석

## 데이터 모델

### 1. Study 모델 (기존)

```prisma
model Study {
  id          String  @id @default(cuid())
  ownerId     String
  name        String
  emoji       String  @default("📚")
  description String  @db.Text
  category    String
  subCategory String?
  
  maxMembers   Int     @default(20)
  isPublic     Boolean @default(true)
  autoApprove  Boolean @default(true)
  isRecruiting Boolean @default(true)
  
  rating      Float? @default(0)
  reviewCount Int?   @default(0)
  tags        String[]
  inviteCode  String   @unique @default(cuid())
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // 관계
  owner      User          @relation("StudyOwner", fields: [ownerId], references: [id])
  members    StudyMember[]
  messages   Message[]
  notices    Notice[]
  files      File[]
  events     Event[]
  tasks      Task[]
  studyTasks StudyTask[]
  
  // 관리자 관련 (추가)
  moderationStatus StudyModerationStatus @default(ACTIVE)
  hiddenAt         DateTime?
  hiddenReason     String?
  hiddenBy         String?
  closedAt         DateTime?
  closedReason     String?
  closedBy         String?
  
  recommendations  StudyRecommendation[]
  moderationLogs   StudyModerationLog[]
  
  @@index([category])
  @@index([isPublic, isRecruiting])
  @@index([moderationStatus])
  @@index([rating])
}

enum StudyModerationStatus {
  ACTIVE      // 정상
  HIDDEN      // 숨김 (검색 제외)
  CLOSED      // 종료 (읽기 전용)
  DELETED     // 삭제됨
}
```

### 2. 새로운 모델

#### 2.1 스터디 추천 시스템

```prisma
model StudyRecommendation {
  id        String   @id @default(cuid())
  studyId   String
  adminId   String
  reason    String   @db.Text
  category  RecommendCategory
  priority  Int      @default(0)
  
  // 노출 기간
  startDate DateTime
  endDate   DateTime?
  isActive  Boolean  @default(true)
  
  // 통계
  impressions Int @default(0)  // 노출 수
  clicks      Int @default(0)  // 클릭 수
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  study Study @relation(fields: [studyId], references: [id], onDelete: Cascade)
  
  @@unique([studyId, isActive])
  @@index([isActive, priority, startDate])
  @@index([category, isActive])
}

enum RecommendCategory {
  FEATURED     // 메인 추천
  TRENDING     // 인기 급상승
  QUALITY      // 우수 스터디
  NEW_AND_HOT  // 신규 주목
}
```

#### 2.2 스터디 모더레이션 로그

```prisma
model StudyModerationLog {
  id        String   @id @default(cuid())
  studyId   String
  adminId   String
  action    StudyModerationAction
  reason    String?  @db.Text
  
  // 변경 내용
  before    Json?
  after     Json?
  
  // 메타 정보
  duration  String?  // 숨김 기간 등
  
  createdAt DateTime @default(now())
  
  study Study @relation(fields: [studyId], references: [id], onDelete: Cascade)
  
  @@index([studyId, createdAt])
  @@index([action, createdAt])
}

enum StudyModerationAction {
  HIDE              // 숨김
  UNHIDE            // 숨김 해제
  CLOSE             // 종료
  REOPEN            // 재개
  DELETE            // 삭제
  RESTORE           // 복구
  CHANGE_OWNER      // 스터디장 변경
  FORCE_UPDATE      // 강제 정보 수정
  MEMBER_KICK       // 멤버 강제 퇴출
  CONTENT_DELETE    // 콘텐츠 삭제
  RECOMMEND         // 추천 등록
  UNRECOMMEND       // 추천 해제
  CATEGORY_CHANGE   // 카테고리 변경
}
```

#### 2.3 스터디 품질 지표

```prisma
model StudyQualityMetrics {
  id        String   @id @default(cuid())
  studyId   String   @unique
  
  // 활동 지표
  activeMembers     Int @default(0)
  avgMessagesPerDay Float @default(0)
  avgFilesPerWeek   Float @default(0)
  noticeCount       Int @default(0)
  
  // 참여도 지표
  memberRetention   Float @default(0)  // 멤버 유지율
  avgSessionLength  Int @default(0)    // 평균 세션 길이 (분)
  
  // 품질 지표
  reportCount       Int @default(0)    // 신고 받은 수
  warningCount      Int @default(0)    // 경고 받은 수
  qualityScore      Float @default(50) // 품질 점수 (0-100)
  
  lastCalculated DateTime @default(now())
  
  study Study @relation(fields: [studyId], references: [id], onDelete: Cascade)
  
  @@index([qualityScore])
  @@index([lastCalculated])
}
```

#### 2.4 콘텐츠 모더레이션 큐

```prisma
model ContentModerationQueue {
  id          String   @id @default(cuid())
  studyId     String
  contentType ContentType
  contentId   String
  
  reason      String   @db.Text
  reportedBy  String?  // 신고자 (있는 경우)
  priority    Priority @default(MEDIUM)
  status      ModerationQueueStatus @default(PENDING)
  
  // 처리 정보
  assignedTo  String?
  reviewedBy  String?
  reviewedAt  DateTime?
  decision    String?  @db.Text
  
  createdAt DateTime @default(now())
  
  @@index([studyId, status])
  @@index([priority, status, createdAt])
  @@index([assignedTo, status])
}

enum ContentType {
  MESSAGE
  FILE
  NOTICE
  TASK
}

enum ModerationQueueStatus {
  PENDING
  IN_REVIEW
  APPROVED
  REMOVED
  REJECTED
}
```

## API 명세

### 1. 스터디 조회

#### 1.1 스터디 목록

```typescript
GET /api/admin/studies

Query Parameters:
{
  page?: number
  limit?: number
  search?: string           // 이름, 설명 검색
  category?: string
  status?: StudyModerationStatus
  
  // 필터
  isPublic?: boolean
  isRecruiting?: boolean
  hasReports?: boolean      // 신고 있는 스터디만
  
  // 멤버 수 범위
  minMembers?: number
  maxMembers?: number
  
  // 날짜 범위
  createdFrom?: string
  createdTo?: string
  
  // 품질 필터
  minQualityScore?: number
  maxQualityScore?: number
  
  // 정렬
  sortBy?: 'createdAt' | 'memberCount' | 'activityScore' | 'reportCount' | 'qualityScore'
  sortOrder?: 'asc' | 'desc'
}

Response: {
  success: true,
  data: {
    studies: Study[],
    pagination: Pagination,
    stats: {
      total: number,
      active: number,
      hidden: number,
      closed: number
    }
  }
}

Study Type:
{
  id: string,
  name: string,
  emoji: string,
  description: string,
  category: string,
  owner: {
    id: string,
    name: string,
    email: string
  },
  
  status: StudyModerationStatus,
  memberCount: number,
  activityScore: number,
  qualityScore: number,
  
  stats: {
    messages: number,
    files: number,
    notices: number,
    reports: number,
    warnings: number
  },
  
  isRecommended: boolean,
  createdAt: string,
  lastActivityAt: string,
  
  // 빠른 액션 가능 여부
  canHide: boolean,
  canClose: boolean,
  canDelete: boolean,
  canRecommend: boolean
}
```

**구현 예시:**
```javascript
// app/api/admin/studies/route.js
export async function GET(request) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  
  const { searchParams } = new URL(request.url)
  const filters = parseStudyFilters(searchParams)
  
  // 로그 기록
  await logAdminAction({
    adminId: admin.user.id,
    action: 'STUDY_SEARCH',
    details: { filters }
  })
  
  const [studies, total] = await Promise.all([
    prisma.study.findMany({
      where: filters.where,
      skip: filters.skip,
      take: filters.take,
      orderBy: filters.orderBy,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            members: { where: { status: 'ACTIVE' } },
            messages: true,
            files: true,
            notices: true
          }
        },
        qualityMetrics: true,
        recommendations: {
          where: { isActive: true },
          take: 1
        }
      }
    }),
    prisma.study.count({ where: filters.where })
  ])
  
  // 데이터 변환
  const transformedStudies = studies.map(study => ({
    ...study,
    memberCount: study._count.members,
    activityScore: calculateActivityScore(study),
    qualityScore: study.qualityMetrics?.qualityScore || 50,
    stats: {
      messages: study._count.messages,
      files: study._count.files,
      notices: study._count.notices,
      reports: 0, // TODO: 신고 수 조회
      warnings: 0
    },
    isRecommended: study.recommendations.length > 0,
    canHide: hasPermission(admin, 'hide:studies'),
    canClose: hasPermission(admin, 'close:studies'),
    canDelete: hasPermission(admin, 'delete:studies'),
    canRecommend: hasPermission(admin, 'recommend:studies')
  }))
  
  return NextResponse.json({
    success: true,
    data: {
      studies: transformedStudies,
      pagination: calculatePagination(total, filters),
      stats: await getStudyStats(filters.where)
    }
  })
}
```

#### 1.2 스터디 상세 정보

```typescript
GET /api/admin/studies/:studyId

Response: {
  success: true,
  data: {
    study: {
      // 기본 정보
      id: string,
      name: string,
      emoji: string,
      description: string,
      category: string,
      subCategory: string,
      tags: string[],
      
      // 설정
      maxMembers: number,
      isPublic: boolean,
      autoApprove: boolean,
      isRecruiting: boolean,
      
      // 스터디장
      owner: User,
      
      // 상태
      moderationStatus: StudyModerationStatus,
      hiddenAt?: string,
      hiddenReason?: string,
      closedAt?: string,
      closedReason?: string,
      
      // 멤버
      members: Member[],
      memberStats: {
        total: number,
        active: number,
        pending: number,
        kicked: number
      },
      
      // 활동 통계
      activityStats: {
        messages: number,
        files: number,
        notices: number,
        events: number,
        tasks: number,
        avgMessagesPerDay: number,
        lastActivityAt: string
      },
      
      // 품질 지표
      qualityMetrics: QualityMetrics,
      
      // 신고 이력
      reports: Report[],
      
      // 모더레이션 이력
      moderationLogs: ModerationLog[],
      
      // 추천 정보
      recommendation?: Recommendation,
      
      createdAt: string,
      updatedAt: string
    }
  }
}
```

### 2. 스터디 상태 관리

#### 2.1 스터디 숨김

```typescript
POST /api/admin/studies/:studyId/hide

Body: {
  reason: string,          // 숨김 사유 (필수)
  duration?: string,       // "1d", "3d", "7d", "permanent"
  notifyOwner?: boolean,   // 스터디장에게 알림
  notifyMembers?: boolean  // 멤버들에게 알림
}

Response: {
  success: true,
  data: {
    study: Study,
    log: ModerationLog,
    notificationsSent: number
  }
}
```

**구현 예시:**
```javascript
export async function POST(request, { params }) {
  const admin = await requireAdmin(request)
  if (admin instanceof NextResponse) return admin
  
  if (!hasPermission(admin, 'hide:studies')) {
    return NextResponse.json({
      success: false,
      error: '권한이 없습니다'
    }, { status: 403 })
  }
  
  const { studyId } = params
  const body = await request.json()
  
  if (!body.reason || body.reason.length < 10) {
    return NextResponse.json({
      success: false,
      error: '숨김 사유는 최소 10자 이상이어야 합니다'
    }, { status: 400 })
  }
  
  const result = await prisma.$transaction(async (tx) => {
    // 스터디 상태 업데이트
    const study = await tx.study.update({
      where: { id: studyId },
      data: {
        moderationStatus: 'HIDDEN',
        hiddenAt: new Date(),
        hiddenReason: body.reason,
        hiddenBy: admin.user.id,
        isPublic: false,  // 검색에서 제외
        isRecruiting: false  // 모집 중지
      },
      include: {
        owner: true,
        members: {
          where: { status: 'ACTIVE' },
          include: { user: true }
        }
      }
    })
    
    // 모더레이션 로그 생성
    const log = await tx.studyModerationLog.create({
      data: {
        studyId,
        adminId: admin.user.id,
        action: 'HIDE',
        reason: body.reason,
        duration: body.duration,
        before: { moderationStatus: 'ACTIVE' },
        after: { moderationStatus: 'HIDDEN' }
      }
    })
    
    // 관리자 활동 로그
    await tx.adminLog.create({
      data: {
        adminId: admin.user.id,
        action: 'STUDY_HIDE',
        targetType: 'Study',
        targetId: studyId,
        reason: body.reason
      }
    })
    
    return { study, log }
  })
  
  // 알림 발송
  let notificationsSent = 0
  
  if (body.notifyOwner !== false) {
    await sendStudyHiddenNotification(
      result.study.owner,
      result.study,
      body.reason
    )
    notificationsSent++
  }
  
  if (body.notifyMembers) {
    await sendBulkNotifications(
      result.study.members.map(m => m.user),
      'study_hidden',
      { studyName: result.study.name }
    )
    notificationsSent += result.study.members.length
  }
  
  return NextResponse.json({
    success: true,
    data: {
      study: result.study,
      log: result.log,
      notificationsSent
    }
  })
}
```

#### 2.2 스터디 종료

```typescript
POST /api/admin/studies/:studyId/close

Body: {
  reason: string,
  allowReadOnly?: boolean,  // 읽기 전용 모드 허용
  notifyMembers?: boolean
}

Response: {
  success: true,
  data: {
    study: Study,
    log: ModerationLog
  }
}
```

#### 2.3 스터디 삭제

```typescript
DELETE /api/admin/studies/:studyId

Body: {
  reason: string,
  hardDelete?: boolean,     // 하드 삭제 (완전 삭제)
  deleteContent?: boolean,  // 콘텐츠도 삭제
  notifyMembers?: boolean
}

Response: {
  success: true,
  data: {
    deletedStudy: {
      id: string,
      name: string,
      memberCount: number,
      deletedAt: string
    },
    contentDeleted: {
      messages: number,
      files: number,
      notices: number,
      tasks: number
    }
  }
}
```

#### 2.4 스터디장 변경

```typescript
POST /api/admin/studies/:studyId/change-owner

Body: {
  newOwnerId: string,
  reason: string,
  notifyOldOwner?: boolean,
  notifyNewOwner?: boolean
}

Response: {
  success: true,
  data: {
    study: Study,
    oldOwner: User,
    newOwner: User
  }
}
```

### 3. 콘텐츠 모더레이션

#### 3.1 콘텐츠 목록 조회

```typescript
GET /api/admin/studies/:studyId/content

Query: {
  type?: 'message' | 'file' | 'notice'
  reported?: boolean
  page?: number
  limit?: number
}

Response: {
  success: true,
  data: {
    content: Content[],
    pagination: Pagination
  }
}
```

#### 3.2 콘텐츠 삭제

```typescript
DELETE /api/admin/studies/:studyId/content/:contentId

Body: {
  contentType: 'message' | 'file' | 'notice',
  reason: string,
  warnAuthor?: boolean
}

Response: {
  success: true,
  data: {
    deleted: boolean,
    contentId: string,
    warningIssued: boolean
  }
}
```

### 4. 추천 시스템

#### 4.1 스터디 추천 등록

```typescript
POST /api/admin/studies/:studyId/recommend

Body: {
  category: RecommendCategory,
  reason: string,
  priority: number,        // 0-100
  startDate: string,
  endDate?: string
}

Response: {
  success: true,
  data: {
    recommendation: Recommendation
  }
}
```

#### 4.2 추천 해제

```typescript
DELETE /api/admin/studies/:studyId/recommend/:recommendId

Body: {
  reason: string
}
```

#### 4.3 추천 스터디 목록

```typescript
GET /api/admin/studies/recommendations

Query: {
  category?: RecommendCategory,
  isActive?: boolean
}

Response: {
  success: true,
  data: {
    recommendations: Recommendation[]
  }
}
```

## 권한 시스템

### 스터디 관리 권한

```javascript
export const STUDY_PERMISSIONS = {
  // 조회
  'read:studies': 'VIEWER',
  'read:study-details': 'VIEWER',
  'read:study-content': 'MODERATOR',
  
  // 상태 관리
  'hide:studies:short': 'MODERATOR',      // 7일 이하
  'hide:studies:long': 'ADMIN',           // 7일 초과
  'unhide:studies': 'ADMIN',
  'close:studies': 'ADMIN',
  'reopen:studies': 'SUPER_ADMIN',
  'delete:studies:soft': 'ADMIN',
  'delete:studies:hard': 'SUPER_ADMIN',
  
  // 콘텐츠 관리
  'delete:content': 'MODERATOR',
  'restore:content': 'ADMIN',
  
  // 멤버 관리
  'kick:members': 'MODERATOR',
  'change:owner': 'ADMIN',
  
  // 추천 시스템
  'recommend:studies': 'ADMIN',
  'unrecommend:studies': 'ADMIN',
  
  // 설정 변경
  'update:study-settings': 'ADMIN'
}
```

## UI 컴포넌트

### 1. 스터디 목록 페이지

```jsx
// app/admin/studies/page.jsx
'use client'

import { useState } from 'react'
import { useAdminStudies } from '@/lib/hooks/useAdminApi'
import StudyTable from './components/StudyTable'
import StudyFilters from './components/StudyFilters'
import StudyStats from './components/StudyStats'

export default function AdminStudiesPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: 'all'
  })
  
  const { data, isLoading } = useAdminStudies(filters)
  
  return (
    <div className="container">
      <header>
        <h1>스터디 관리</h1>
      </header>
      
      {/* 통계 카드 */}
      <StudyStats stats={data?.stats} />
      
      {/* 필터 */}
      <StudyFilters 
        filters={filters}
        onChange={setFilters}
      />
      
      {/* 스터디 목록 */}
      <StudyTable 
        studies={data?.studies}
        pagination={data?.pagination}
        isLoading={isLoading}
      />
    </div>
  )
}
```

### 2. 스터디 상세 페이지

```jsx
// app/admin/studies/[studyId]/page.jsx
export default function StudyDetailPage({ params }) {
  const { data: study } = useAdminStudy(params.studyId)
  
  return (
    <div className="container">
      <StudyDetailHeader study={study} />
      
      <Tabs>
        <TabList>
          <Tab>기본 정보</Tab>
          <Tab>멤버</Tab>
          <Tab>콘텐츠</Tab>
          <Tab>활동 통계</Tab>
          <Tab>모더레이션 이력</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <StudyBasicInfo study={study} />
          </TabPanel>
          
          <TabPanel>
            <StudyMembers studyId={study.id} />
          </TabPanel>
          
          <TabPanel>
            <StudyContent studyId={study.id} />
          </TabPanel>
          
          <TabPanel>
            <StudyAnalytics studyId={study.id} />
          </TabPanel>
          
          <TabPanel>
            <ModerationHistory studyId={study.id} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}
```

## 구현 가이드

### Phase 1: 기본 구조 (Week 5-6)

1. **데이터베이스 마이그레이션**
   ```bash
   # Prisma 스키마에 추가
   # StudyRecommendation, StudyModerationLog, 
   # StudyQualityMetrics, ContentModerationQueue
   npx prisma migrate dev --name add_study_admin
   ```

2. **기본 API 구현**
   - 스터디 목록 조회
   - 스터디 상세 조회
   - 필터링 및 검색

3. **UI 컴포넌트**
   - 스터디 테이블
   - 필터 패널
   - 통계 카드

### Phase 2: 핵심 기능 (Week 7-8)

1. **상태 관리 API**
   - 숨김/해제
   - 종료/재개
   - 삭제

2. **콘텐츠 모더레이션**
   - 콘텐츠 조회 API
   - 콘텐츠 삭제 API
   - 모더레이션 큐

3. **UI 업데이트**
   - 액션 모달들
   - 상세 페이지
   - 타임라인

### Phase 3: 고급 기능 (Week 9-10)

1. **추천 시스템**
   - 추천 등록/해제 API
   - 추천 알고리즘
   - 추천 관리 대시보드

2. **품질 지표 계산**
   - 정기 계산 작업 (Cron)
   - 실시간 업데이트
   - 품질 스코어 알고리즘

3. **고급 분석**
   - 트렌드 분석
   - 예측 모델
   - 리포트 생성

## 테스트 시나리오

### 단위 테스트

```javascript
describe('POST /api/admin/studies/:studyId/hide', () => {
  it('should hide a study', async () => {
    const study = await createTestStudy()
    
    const response = await hideStudy(study.id, {
      reason: 'Spam content',
      duration: '7d'
    })
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.study.moderationStatus).toBe('HIDDEN')
  })
  
  it('should require reason', async () => {
    const response = await hideStudy('study123', {})
    expect(response.status).toBe(400)
  })
  
  it('should check permissions', async () => {
    const viewer = await createAdminUser('VIEWER')
    const response = await hideStudy('study123', {
      reason: 'Test'
    }, { user: viewer })
    
    expect(response.status).toBe(403)
  })
})
```

### 통합 테스트

```javascript
describe('Study Moderation Workflow', () => {
  it('should complete hide to reopen flow', async () => {
    const study = await createTestStudy()
    
    // 1. 숨김
    await hideStudy(study.id, { reason: 'Testing' })
    let updatedStudy = await getStudy(study.id)
    expect(updatedStudy.moderationStatus).toBe('HIDDEN')
    
    // 2. 로그 확인
    const logs = await getModerationLogs(study.id)
    expect(logs[0].action).toBe('HIDE')
    
    // 3. 숨김 해제
    await unhideStudy(study.id, { reason: 'Resolved' })
    updatedStudy = await getStudy(study.id)
    expect(updatedStudy.moderationStatus).toBe('ACTIVE')
  })
})
```

## ✅ 최종 체크리스트

### 백엔드
- [ ] Prisma 스키마 업데이트
- [ ] 데이터베이스 마이그레이션
- [ ] 스터디 관리 API (목록, 상세, 숨김, 종료, 삭제)
- [ ] 콘텐츠 모더레이션 API
- [ ] 추천 시스템 API
- [ ] 권한 체크 미들웨어
- [ ] 단위 테스트

### 프론트엔드
- [ ] 스터디 목록 페이지
- [ ] 스터디 상세 페이지
- [ ] 필터 및 검색 UI
- [ ] 액션 모달들 (숨김, 종료, 삭제)
- [ ] 추천 관리 UI
- [ ] 콘텐츠 모더레이션 인터페이스

### 기능
- [ ] 자동 품질 지표 계산
- [ ] 알림 시스템
- [ ] 일괄 작업
- [ ] 모더레이션 큐

### 문서화
- [ ] API 문서
- [ ] 관리자 가이드
- [ ] 모더레이션 정책

