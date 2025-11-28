# 신고 처리 시스템 완전 명세
- [ ] 문서화
- [ ] 테스트 작성
- [ ] 알림 시스템
- [ ] UI 컴포넌트
- [ ] 자동화 규칙 엔진
- [ ] 신고 처리 워크플로우
- [ ] 신고 조회 및 필터링 API
- [ ] 데이터베이스 마이그레이션

## ✅ 최종 체크리스트

```
})
  })
    expect(updatedReport.status).toBe('RESOLVED')
    const updatedReport = await getReport(report.id)
    // 신고 상태가 RESOLVED여야 함
    
    expect(user.status).toBe('SUSPENDED')
    const user = await getUser(report.targetId)
    // 사용자가 정지되어야 함
    
    })
      resolution: 'User suspended for spam'
      actionDetails: { duration: '7d', reason: 'Spam' },
      action: 'suspend',
    await processReport(report.id, {
    
    const report = await createReport({ targetType: 'USER' })
  it('should execute action when processing report', async () => {
  
  })
    expect(report.assignedTo).toBeDefined()
    // 자동으로 담당자가 배정되어야 함
    
    expect(report.priority).toBe('HIGH')
    // 우선순위가 HIGH로 자동 설정되어야 함
    
    })
      similarReportsCount: 3
      type: 'HARASSMENT',
    const report = await createReport({
  it('should auto-assign high priority reports', async () => {
describe('Report Processing', () => {
```javascript

## 테스트 시나리오

   - SLA 기한 알림
   - 처리 결과 통지
   - 긴급 신고 알림
2. **알림 시스템**

   - 자동 조치 규칙
   - 자동 담당자 배정
   - 우선순위 자동 설정
1. **자동화 엔진**

### Phase 3: 자동화 (Week 9)

   - 액션 모달들
   - 상세 페이지
   - 대시보드
2. **UI 구현**

   - 노트 및 타임라인
   - 조치 시행 API
   - 담당자 배정
1. **처리 워크플로우**

### Phase 2: 핵심 기능 (Week 8)

   - 상태/우선순위 변경
   - 신고 상세 조회
   - 신고 목록 및 필터링
2. **기본 API**

   ```
   npx prisma migrate dev --name extend_reports
   # ReportNote, ReportTimeline, AutomationRule 추가
   ```bash
1. **데이터베이스 확장**

### Phase 1: 기본 구조 (Week 7)

## 구현 가이드

```
}
  )
    </div>
      </div>
        <PriorityPanel report={report} />
        <AssignmentPanel report={report} />
        
        />
          onReject={() => openRejectModal(report)}
          onRemoveContent={() => openRemoveModal(report)}
          onSuspend={() => openSuspendModal(report)}
          onWarn={() => openWarnModal(report)}
          report={report}
        <QuickActions
      <div className="col-right">
      {/* 우: 액션 패널 */}
      
      </div>
        <Notes notes={report.notes} />
        <Timeline entries={report.timeline} />
      <div className="col-center">
      {/* 중앙: 타임라인 */}
      
      </div>
        <RelatedReports reports={report.relatedReports} />
        <TargetContext target={report.target} />
        <ReportInfo report={report} />
      <div className="col-left">
      {/* 좌: 신고 정보 */}
    <div className="layout-3col">
  return (
  
  const { data: report } = useAdminReport(params.reportId)
export default function ReportDetailPage({ params }) {
// app/admin/reports/[reportId]/page.jsx
```jsx

### 2. 신고 상세 페이지

```
}
  )
    </div>
      />
        onProcess={handleProcess}
        reports={data?.reports}
      <ReportList
      {/* 신고 목록 */}
      
      </QuickFilters>
        <FilterButton label="기한 임박" value={{ dueWithin: '24h' }} />
        <FilterButton label="오늘 접수" value={{ createdFrom: 'today' }} />
        <FilterButton label="긴급" value={{ priority: 'URGENT' }} />
        <FilterButton label="나한테 배정됨" value={{ assignedTo: 'me' }} />
      >
        onFilter={(filter) => setFilters({ ...filters, ...filter })}
      <QuickFilters
      {/* 빠른 필터 */}
      
      <ReportStats stats={data?.stats} />
      {/* 통계 카드 */}
    <div className="container">
  return (
  
  const { data } = useAdminReports(filters)
  
  })
    assignedTo: 'all'
    status: 'all',
  const [filters, setFilters] = useState({
export default function ReportsPage() {
// app/admin/reports/page.jsx
```jsx

### 1. 신고 대시보드

## UI 컴포넌트

```
}
  }
    await notifyAdmin(assignTo.adminId, report)
    await assignReport(report.id, assignTo.adminId)
  if (assignTo) {
  
  const assignTo = workload.sort((a, b) => a.count - b.count)[0]
  // 가장 적게 처리중인 관리자에게 배정
  
  const workload = await getAdminWorkload(candidates)
  // 각 관리자의 현재 처리중인 신고 수 조회
  
  const candidates = specializations[report.type] || []
  
  }
    'HARASSMENT': ['moderator3', 'admin2']
    'COPYRIGHT': ['admin1'],
    'SPAM': ['moderator1', 'moderator2'],
  const specializations = {
  // 전문 영역별 배정
export async function autoAssignReport(report) {
// lib/admin/automation/assignment.js
```javascript

### 3. 담당자 자동 배정

```
]
  }
    ]
      { type: 'escalate_to_admin' }
      { type: 'warn_user' },
      { type: 'remove_content' },
    actions: [
    },
      ]
        { field: 'evidenceProvided', op: 'equals', value: true }
        { field: 'reportType', op: 'equals', value: 'ILLEGAL' },
      conditions: [
      type: 'report_created',
    trigger: {
    name: 'Auto-delete illegal content',
  {
  },
    ]
      { type: 'log_event' }
      { type: 'notify_admin', priority: 'high' },
      { type: 'suspend_user', duration: '3d' },
    actions: [
    },
      ]
        { field: 'timeWindow', op: 'within', value: '24h' }
        { field: 'similarReportsCount', op: 'gte', value: 3 },
        { field: 'reportType', op: 'equals', value: 'SPAM' },
      conditions: [
      type: 'report_created',
    trigger: {
    name: 'Auto-suspend spam users',
  {
export const autoActionRules = [
// lib/admin/automation/action-rules.js
```javascript

### 2. 자동 조치 규칙

```
}
  return 'LOW'
  if (score >= 40) return 'MEDIUM'
  if (score >= 70) return 'HIGH'
  if (score >= 100) return 'URGENT'
  if (score >= 150) return 'CRITICAL'
  // 점수에 따른 우선순위 결정
  
  if (context.reporterAccuracyRate < 0.3) score -= 30
  if (context.reporterAccuracyRate > 0.8) score += 20
  // 신고자 신뢰도
  
  if (context.targetWarningCount >= 3) score += 30
  if (context.targetHasSanctions) score += 40
  // 피신고자 이력
  
  else if (context.similarReportsCount >= 2) score += 15
  else if (context.similarReportsCount >= 3) score += 30
  if (context.similarReportsCount >= 5) score += 50
  // 동일 대상 중복 신고
  
  score += typeScores[report.type] || 0
  }
    'OTHER': 0
    'SPAM': 10,
    'COPYRIGHT': 20,
    'INAPPROPRIATE': 30,
    'HARASSMENT': 40,
    'ILLEGAL': 50,
  const typeScores = {
  // 신고 유형별 가중치
  
  let score = 50  // 기본 점수
export function calculatePriority(report, context) {
// lib/admin/automation/priority-rules.js
```javascript

### 1. 우선순위 자동 설정

## 자동화 규칙

```
필요시 즉각 조치
   ↓
우선 처리 (1시간 이내 응답)
   ↓
즉시 관리자에게 알림 (이메일 + 푸시)
   ↓
URGENT/CRITICAL 신고
```

### 긴급 신고 처리

```
7. 종료
   ↓
   - 피신고자에게 조치 통지 (해당시)
   - 신고자에게 결과 통지
6. 통지 발송
   ↓
   └─ 무혐의 → 기각 (REJECTED)
   ├─ 조치 필요 → 조치 시행 (RESOLVED)
5. 판단
   ↓
   - 증거 검증
   - 관련 이력 조사
   - 컨텍스트 확인
   - 신고 내용 검토
4. 조사 시작 (IN_PROGRESS)
   ↓
3. 자동/수동 담당자 배정
   ↓
2. 자동 우선순위 설정 (규칙 기반)
   ↓
1. 신고 접수 (PENDING)
```

### 기본 처리 워크플로우

## 워크플로우

```
}
  }
    errors: string[]
    failed: number,
    processed: number,
  data: {
  success: true,
Response: {

}
  }
    status?: ReportStatus
    priority?: Priority,
    adminId?: string,
  params: {
  action: 'assign' | 'change_priority' | 'change_status',
  reportIds: string[],
Body: {

POST /api/admin/reports/bulk
```typescript

### 3. 일괄 작업

```
}
  isPublic?: boolean  // 신고자에게 보이는지
  content: string,
Body: {

POST /api/admin/reports/:reportId/notes
```typescript

#### 2.6 노트 추가

```
}
  notifyReporter?: boolean
  reason: string,
Body: {

POST /api/admin/reports/:reportId/reject
```typescript

#### 2.5 신고 기각

```
}
  }
      return null
    default:
    
      )
        adminId
        details,
        report.targetId,
        report.targetType,
        tx,
      return await removeContent(
    case 'remove_content':
    
      break
      }
        return await deleteStudy(tx, report.targetId, details, adminId)
      } else if (report.targetType === 'STUDY') {
        return await deleteUser(tx, report.targetId, details, adminId)
      if (report.targetType === 'USER') {
    case 'delete':
    
      return await suspendUser(tx, report.targetId, details, adminId)
    case 'suspend':
    
      return await issueWarning(tx, report.targetId, details, adminId)
    case 'warn':
  switch (action) {
async function executeReportAction(tx, report, action, details, adminId) {
// 조치 실행 함수

}
  })
    }
      notificationsSent
      actionTaken: result.actionResult,
      report: result.report,
    data: {
    success: true,
  return NextResponse.json({
  
  }
    notificationsSent++
    await sendActionNotification(result.report, body.action)
  if (body.notifyTarget && body.action !== 'none') {
  
  }
    notificationsSent++
    await sendReportResolvedNotification(result.report)
  if (body.notifyReporter !== false) {
  
  let notificationsSent = 0
  // 알림 발송
  
  })
    return { report: updatedReport, actionResult }
    
    })
      }
        reason: body.resolution
        targetId: reportId,
        targetType: 'Report',
        action: 'REPORT_RESOLVE',
        adminId: admin.user.id,
      data: {
    await tx.adminLog.create({
    // 관리자 로그
    
    })
      }
        }
          resolution: body.resolution
          actionTaken: body.action,
        details: {
        actorId: admin.user.id,
        action: 'RESOLVED',
        reportId,
      data: {
    await tx.reportTimeline.create({
    // 타임라인 추가
    
    })
      }
        action: body.action
        resolution: body.resolution,
        processedAt: new Date(),
        processedBy: admin.user.id,
        status: 'RESOLVED',
      data: {
      where: { id: reportId },
    const updatedReport = await tx.report.update({
    // 신고 상태 업데이트
    
    }
      )
        admin.user.id
        body.actionDetails,
        body.action,
        report,
        tx,
      actionResult = await executeReportAction(
    if (body.action !== 'none') {
    let actionResult = null
    // 조치 시행
    
    }
      throw new Error('신고를 찾을 수 없습니다')
    if (!report) {
    
    })
      include: { reporter: true }
      where: { id: reportId },
    const report = await tx.report.findUnique({
    // 신고 조회
  const result = await prisma.$transaction(async (tx) => {
  
  }
    }, { status: 403 })
      error: '권한이 없습니다'
      success: false,
    return NextResponse.json({
  if (!hasPermission(admin, 'resolve:reports')) {
  // 권한 확인
  
  const body = await request.json()
  const { reportId } = params
  
  if (admin instanceof NextResponse) return admin
  const admin = await requireAdmin(request)
export async function POST(request, { params }) {
```javascript
**구현 예시:**

```
}
  }
    notificationsSent: number
    },
      result: string
      targetId: string,
      type: string,
    actionTaken: {
    report: Report,
  data: {
  success: true,
Response: {

}
  notifyTarget?: boolean
  notifyReporter?: boolean,
  resolution: string,
  },
    reason: string
    duration?: string,
  actionDetails?: {
  action: 'warn' | 'suspend' | 'delete' | 'remove_content' | 'none',
Body: {

POST /api/admin/reports/:reportId/process
```typescript

#### 2.4 신고 처리 (조치 시행)

```
}
  reason?: string
  priority: Priority,
Body: {

PATCH /api/admin/reports/:reportId/priority
```typescript

#### 2.3 우선순위 변경

```
}
  }
    timeline: TimelineEntry
    report: Report,
  data: {
  success: true,
Response: {

}
  note?: string
  status: ReportStatus,
Body: {

PATCH /api/admin/reports/:reportId/status
```typescript

#### 2.2 상태 변경

```
}
  }
    }
      method: 'email' | 'push'
      sent: boolean,
    notification: {
    report: Report,
  data: {
  success: true,
Response: {

}
  note?: string
  adminId: string,
Body: {

POST /api/admin/reports/:reportId/assign
```typescript

#### 2.1 담당자 배정

### 2. 신고 처리

```
}
  }
    }
      updatedAt: string
      createdAt: string,
      
      isOverdue: boolean,
      respondedAt?: string,
      dueDate?: string,
      // SLA
      
      relatedReports: Report[],
      // 관련 신고
      
      notes: Note[],
      // 노트
      
      timeline: Timeline[],
      // 타임라인
      
      action?: string,
      resolution?: string,
      processedAt?: string,
      processedBy?: Admin,
      // 처리 정보
      
      assignedAt?: string,
      assignedTo?: Admin,
      // 담당자
      
      },
        context: any   // 컨텍스트 (메시지의 경우 전후 메시지 등)
        details: any,  // 대상별 상세 정보
        name: string,
        id: string,
        type: TargetType,
      target: {
      // 대상
      
      reporter: User,
      // 신고자
      
      priority: Priority,
      status: ReportStatus,
      evidence: any,
      reason: string,
      type: ReportType,
      id: string,
      // 기본 정보
    report: {
  data: {
  success: true,
Response: {

GET /api/admin/reports/:reportId
```typescript

#### 1.2 신고 상세

```
}
  })
    }
      stats
      pagination: calculatePagination(total, filters),
      reports: transformedReports,
    data: {
    success: true,
  return NextResponse.json({
  
  )
    })
      }
          : null
          ? Math.floor((report.respondedAt - report.createdAt) / 60000)
        responseTime: report.respondedAt 
        isOverdue,
        target,
        ...report,
      return {
      
      const isOverdue = report.dueDate && new Date() > report.dueDate
      const target = await getReportTarget(report.targetType, report.targetId)
    reports.map(async (report) => {
  const transformedReports = await Promise.all(
  // 대상 정보 가져오기 (비동기 병렬)
  
  ])
    getReportStats(filters.where)
    prisma.report.count({ where: filters.where }),
    }),
      }
        }
          select: { notes: true }
        _count: {
        },
          select: { id: true, name: true, email: true }
        reporter: {
      include: {
      orderBy: filters.orderBy,
      take: filters.take,
      skip: filters.skip,
      where: filters.where,
    prisma.report.findMany({
  const [reports, total, stats] = await Promise.all([
  
  }
    filters.where.assignedTo = null
  } else if (filters.assignedTo === 'unassigned') {
    filters.where.assignedTo = admin.user.id
  if (filters.assignedTo === 'me') {
  // "나한테 배정된 것" 처리
  
  const filters = parseReportFilters(searchParams)
  const { searchParams } = new URL(request.url)
  
  if (admin instanceof NextResponse) return admin
  const admin = await requireAdmin(request)
export async function GET(request) {
// app/api/admin/reports/route.js
```javascript
**구현 예시:**

```
}
  updatedAt: string
  createdAt: string,
  
  responseTime?: number,  // 분 단위
  isOverdue: boolean,
  dueDate?: string,
  
  },
    name: string
    id: string,
  assignedTo?: {
  
  priority: Priority,
  status: ReportStatus,
  reason: string,
  type: ReportType,
  },
    url: string
    name: string,
    id: string,
    type: TargetType,
  target: {
  },
    email: string
    name: string,
    id: string,
  reporter: {
  id: string,
{
Report Type:

}
  }
    }
      overdue: number
      resolved: number,
      inProgress: number,
      pending: number,
      total: number,
    stats: {
    pagination: Pagination,
    reports: Report[],
  data: {
  success: true,
Response: {

}
  sortOrder?: 'asc' | 'desc'
  sortBy?: 'createdAt' | 'priority' | 'dueDate' | 'status'
  // 정렬
  
  search?: string  // 신고자, 대상 이름, 내용
  // 검색
  
  dueTo?: string
  dueFrom?: string
  createdTo?: string
  createdFrom?: string
  // 날짜 필터
  
  assignedTo?: 'me' | 'unassigned' | string  // adminId
  // 담당자 필터
  
  targetType?: TargetType
  type?: ReportType
  priority?: Priority | Priority[]
  status?: ReportStatus | ReportStatus[]
  // 필터
  
  limit?: number
  page?: number
{
Query Parameters:

GET /api/admin/reports
```typescript

#### 1.1 신고 목록

### 1. 신고 조회

## API 명세

```
}
  @@index([userId, expiresAt])
  @@unique([userId])
  
  createdAt   DateTime @default(now())
  createdBy   String
  
  expiresAt   DateTime?
  
  isBanned          Boolean  @default(false)
  requiresApproval  Boolean  @default(false)
  dailyLimit        Int      @default(5)
  // 제한 설정
  
  reason      String   @db.Text
  userId      String
  id          String   @id @default(cuid())
model ReporterRestriction {
```prisma

#### 2.4 신고자 제한

```
}
  @@index([isActive])
  
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
  
  lastExecutedAt DateTime?
  executionCount Int      @default(0)
  // 통계
  
  actions     Json[]   // [{ type, params }]
  // 실행 액션
  
  trigger     Json     // { type, conditions }
  // 트리거 조건
  
  isActive    Boolean  @default(true)
  description String?  @db.Text
  name        String
  id          String   @id @default(cuid())
model AutomationRule {
```prisma

#### 2.3 자동화 규칙

```
}
  REOPENED
  REJECTED
  RESOLVED
  ACTION_TAKEN
  NOTE_ADDED
  PRIORITY_CHANGED
  STATUS_CHANGED
  ASSIGNED
  CREATED
enum ReportTimelineAction {

}
  @@index([reportId, createdAt])
  
  report Report @relation(fields: [reportId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  details   Json?
  actorId   String?
  action    ReportTimelineAction
  reportId  String
  id        String   @id @default(cuid())
model ReportTimeline {
```prisma

#### 2.2 신고 타임라인

```
}
  @@index([reportId, createdAt])
  
  report Report @relation(fields: [reportId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  isPublic  Boolean  @default(false)  // 신고자에게 보이는지
  content   String   @db.Text
  authorId  String
  reportId  String
  id        String   @id @default(cuid())
model ReportNote {
```prisma

#### 2.1 신고 처리 노트

### 2. 새로운 모델

```
}
  CRITICAL
  URGENT
  HIGH
  MEDIUM
  LOW
enum Priority {

}
  DUPLICATE     // 중복
  REJECTED      // 기각됨
  RESOLVED      // 해결됨
  IN_PROGRESS   // 처리중
  PENDING       // 대기중
enum ReportStatus {

}
  OTHER
  SCAM
  ILLEGAL
  COPYRIGHT
  INAPPROPRIATE
  HARASSMENT
  SPAM
enum ReportType {

}
  NOTICE
  FILE
  MESSAGE
  STUDY
  USER
enum TargetType {

}
  @@index([dueDate])
  @@index([assignedTo, status])
  @@index([targetType, targetId])
  @@index([status, priority, createdAt])
  
  relatedReports String[]  // 관련 신고 ID 배열
  timeline    ReportTimeline[]
  notes       ReportNote[]
  // 관계
  
  reporter User @relation(fields: [reporterId], references: [id])
  
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
  
  respondedAt DateTime?  // 첫 응답 시간
  dueDate     DateTime?
  // SLA (Service Level Agreement)
  
  action      String?   // 취한 조치
  resolution  String?   @db.Text
  processedAt DateTime?
  processedBy String?
  // 처리 정보
  
  assignedAt DateTime?
  assignedTo String?
  // 담당자
  
  priority Priority     @default(MEDIUM)
  status   ReportStatus @default(PENDING)
  // 상태 관리
  
  evidence   Json?      // 증거 자료
  reason     String     @db.Text
  type       ReportType
  targetName String?    // 캐시된 대상 이름
  targetId   String
  targetType TargetType
  reporterId String
  id         String     @id @default(cuid())
model Report {
```prisma

### 1. Report 모델 (확장)

## 데이터 모델

6. **통계 및 분석**: 신고 추이 및 처리 효율성
5. **자동화 규칙**: 패턴 기반 자동 조치
4. **처리 워크플로우**: PENDING → IN_PROGRESS → RESOLVED/REJECTED
3. **담당자 배정**: 자동/수동 배정 시스템
2. **우선순위 관리**: 자동/수동 우선순위 설정
1. **신고 접수 및 관리**: 다양한 대상에 대한 신고 처리
### 핵심 기능

사용자 신고를 효율적으로 처리하고, 빠른 대응과 공정한 판단을 통해 플랫폼의 건전성을 유지합니다.
### 목적

## 개요

7. [구현 가이드](#구현-가이드)
6. [UI 컴포넌트](#ui-컴포넌트)
5. [자동화 규칙](#자동화-규칙)
4. [워크플로우](#워크플로우)
3. [API 명세](#api-명세)
2. [데이터 모델](#데이터-모델)
1. [개요](#개요)

## 📋 목차

> 이 문서는 `/features/03-report-system.md`와 `/examples/01-best-practices.md`를 통합하여 CoUp 플랫폼에 최적화된 최종 신고 처리 시스템 명세입니다.


