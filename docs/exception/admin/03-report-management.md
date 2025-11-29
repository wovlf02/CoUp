# 관리자 - 신고 관리 예외 처리

**작성일**: 2025-11-30  
**최종 업데이트**: 현재 구현 기준  
**카테고리**: 관리자 > 신고 관리  
**우선순위**: 🔴 최고  

---

## 📋 요약

**Phase 3 핵심 발견**: ✅ **권한 체계 정확함!**

Phase 2의 문제(USER 권한 오용)가 Phase 3에서는 발견되지 않음.
모든 API가 적절한 REPORT 권한을 사용하고 있음.

---

## 개요

### 현재 구현된 API 엔드포인트

```
GET    /api/admin/reports                      # 신고 목록
GET    /api/admin/reports/[reportId]           # 신고 상세
POST   /api/admin/reports/[reportId]/assign    # 담당자 배정
```

### 권한 시스템 ✅

```javascript
// ✅ 올바르게 사용됨!
PERMISSIONS.REPORT_VIEW      // 신고 조회
PERMISSIONS.REPORT_ASSIGN    // 담당자 배정
PERMISSIONS.REPORT_PROCESS   // 신고 처리
PERMISSIONS.REPORT_RESOLVE   // 신고 해결
PERMISSIONS.REPORT_REJECT    // 신고 거부
```

**Phase 2와 다른 점**: 
- ✅ `REPORT_VIEW` 사용 (올바름)
- ✅ `REPORT_ASSIGN` 사용 (올바름)
- ❌ Phase 2는 `USER_VIEW`, `USER_SUSPEND` 사용 (잘못됨)

---

## 신고 상태 워크플로우

```
PENDING (대기)
    ↓ (담당자 배정)
IN_PROGRESS (처리중)
    ↓
RESOLVED (해결) or REJECTED (거부)
```

**Prisma Enum**:
```prisma
enum ReportStatus {
  PENDING       # 신고 접수
  IN_PROGRESS   # 처리 중
  RESOLVED      # 해결됨
  REJECTED      # 거부됨
}
```

---

## 주요 예외 처리

### ADM-RPT-001: 신고 없음 🟡

```javascript
const report = await prisma.report.findUnique({
  where: { id: reportId }
})

if (!report) {
  return NextResponse.json(
    { success: false, message: '신고를 찾을 수 없습니다.' },
    { status: 404 }
  )
}
```

### ADM-RPT-002: 담당자 배정 - 자동 배정 ✅

**특징**: 업무 분산 로직 구현됨

```javascript
if (autoAssign) {
  // 모든 관리자 조회
  const admins = await prisma.adminRole.findMany({
    where: { role: { in: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] } }
  })

  // 각 관리자의 현재 작업량 조회
  const workloads = await Promise.all(
    admins.map(async (admin) => {
      const count = await prisma.report.count({
        where: {
          processedBy: admin.userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
      })
      return { adminId: admin.userId, count }
    })
  )

  // 가장 적게 처리 중인 관리자 선택
  workloads.sort((a, b) => a.count - b.count)
  targetAdminId = workloads[0].adminId
}
```

**장점**: ✅
- 공정한 업무 분배
- 로드 밸런싱

**문제점**: ⚠️
- N+1 쿼리 (관리자 수만큼 쿼리)

---

## 코드 품질 평가

### API별 평가

| API | 파일 | 권한 | 기능 | 성능 | 종합 |
|-----|------|------|------|------|------|
| 목록 | `route.js` | ✅ REPORT_VIEW | ✅ | ✅ | 95% |
| 상세 | `[reportId]/route.js` | ✅ REPORT_VIEW | ✅ | ⚠️ | 90% |
| 배정 | `assign/route.js` | ✅ REPORT_ASSIGN | ✅ | ⚠️ | 90% |

**평균 점수**: 92%

**Phase 비교**:
- Phase 1 (사용자): 77%
- Phase 2 (스터디): 77%
- **Phase 3 (신고): 92%** ✅ 최고!

---

## 문제점

### 1. N+1 쿼리 (신고 상세) ⚠️

**위치**: `reports/[reportId]/route.js`

```javascript
// 신고 조회 (1번)
const report = await prisma.report.findUnique({...})

// 신고 대상 조회 (1번)
const target = await prisma.user.findUnique({...})

// 처리자 조회 (1번)
const processedAdmin = await prisma.user.findUnique({...})

// 관련 신고 조회 (1번)
const relatedReports = await prisma.report.findMany({...})

// 신고자 이력 (1번)
const reporterHistory = await prisma.report.aggregate({...})

// 대상 신고 받은 횟수 (1번)
const targetReportCount = await prisma.report.count({...})

// 총 6번 쿼리!
```

**개선**:
```javascript
// include로 한 번에 조회
const report = await prisma.report.findUnique({
  where: { id: reportId },
  include: {
    reporter: {...},
    // target은 polymorphic이라 불가능
  }
})
```

### 2. 자동 배정 N+1 쿼리 ⚠️

**위치**: `assign/route.js`

```javascript
// 관리자 목록 (1번)
const admins = await prisma.adminRole.findMany({...})

// 각 관리자의 작업량 (N번)
const workloads = await Promise.all(
  admins.map(async (admin) => {
    const count = await prisma.report.count({...})  // N번!
  })
)
```

**개선**:
```javascript
// groupBy로 한 번에 조회
const workloads = await prisma.report.groupBy({
  by: ['processedBy'],
  where: {
    status: { in: ['PENDING', 'IN_PROGRESS'] },
    processedBy: { in: adminIds }
  },
  _count: true
})
```

---

## 개선 권장사항

### 우선순위 1: 자동 배정 최적화 🟠

**난이도**: 중간  
**예상 시간**: 30분  
**효과**: N번 → 1번 쿼리

### 우선순위 2: 신고 상세 최적화 🟡

**난이도**: 중간  
**예상 시간**: 30분  
**효과**: 6번 → 3-4번 쿼리 (polymorphic 관계 때문에 완전 제거 불가)

---

## 종합 평가

### Phase 3 = 가장 잘 작성된 코드 ✅

**이유**:
1. ✅ 권한 체계 정확 (REPORT 권한 사용)
2. ✅ 트랜잭션 사용
3. ✅ 검증 로직 완벽
4. ✅ 자동 배정 로직 (업무 분산)
5. ✅ 관련 데이터 조회 (이력, 통계)

**소소한 개선점**:
- ⚠️ N+1 쿼리 (2곳)

---

## Phase 1-2-3 비교

| 항목 | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| 권한 | ✅ 정확 | ❌ 오용 | ✅ 정확 |
| 트랜잭션 | ⚠️ 부분 | ✅ 완벽 | ✅ 완벽 |
| N+1 | ✅ 없음 | ⚠️ 있음 | ⚠️ 있음 |
| 검증 | ⚠️ 부족 | ✅ 완벽 | ✅ 완벽 |
| 로직 | 기본 | 기본 | ✅ 고급 |
| 점수 | 77% | 77% | 92% |

**승자**: Phase 3 🏆

---

**작성 시간**: 40분  
**다음**: Admin 영역 나머지 (통계, 설정) 또는 다른 영역

