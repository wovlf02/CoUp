# 🎉 모든 logAdminAction 오류 완전 해결!

**작성일**: 2025-11-29  
**최종 수정**: 2025-11-29  
**상태**: ✅ **완전 해결**

---

## 🚨 문제 상황

### 신고 페이지 및 여러 API에서 발생한 오류

```
Error [PrismaClientValidationError]: Invalid `prisma.adminLog.create()` invocation
Argument `action` is missing.
adminId: undefined
```

**원인**: 
- `logAdminAction` 함수가 객체 파라미터를 받는데 잘못된 형식으로 호출
- 일부 API에서 구 형식 (개별 파라미터) 사용

---

## ✅ logAdminAction 올바른 사용법

### 함수 시그니처
```javascript
export async function logAdminAction({
  adminId,        // 필수
  action,         // 필수
  targetType = null,
  targetId = null,
  before = null,
  after = null,
  reason = null,
  request = null, // IP, User-Agent 추출용
}) {
  // ...
}
```

### 올바른 호출 방식 ✅
```javascript
await logAdminAction({
  adminId: adminRole.userId,
  action: 'REPORT_VIEW',
  targetType: 'Report',
  targetId: reportId,
  request,
})
```

### 잘못된 호출 방식 ❌
```javascript
// 개별 파라미터 전달 (구 형식)
await logAdminAction(
  adminRole.userId,
  'REPORT_VIEW',
  'Report',
  reportId,
  { details: '...' }
)
```

---

## 🔧 수정한 파일들

### 0. Prisma Schema ⭐
**파일**: `prisma/schema.prisma`
- `ANALYTICS_VIEW` 액션 추가
- `ANALYTICS_EXPORT` 액션 추가

### 1. 신고 목록 조회 API
**파일**: `src/app/api/admin/reports/route.js`

```javascript
// Before ❌
await logAdminAction(adminRole.userId, 'REPORT_VIEW', null, null, {
  filters: { status, type, priority, targetType, assignedTo },
})

// After ✅
await logAdminAction({
  adminId: adminRole.userId,
  action: 'REPORT_VIEW',
  targetType: null,
  targetId: null,
  request,
})
```

---

### 2. 신고 상세 조회 API
**파일**: `src/app/api/admin/reports/[reportId]/route.js`

```javascript
// Before ❌
await logAdminAction(adminRole.userId, 'REPORT_VIEW', 'Report', reportId, {
  status: report.status,
  type: report.type,
})

// After ✅
await logAdminAction({
  adminId: adminRole.userId,
  action: 'REPORT_VIEW',
  targetType: 'Report',
  targetId: reportId,
  request,
})
```

---

### 3. 신고 처리 API (핵심 수정)
**파일**: `src/app/api/admin/reports/[reportId]/process/route.js`

#### (1) 콘텐츠 삭제 로그
```javascript
// Before ❌
await logAdminAction(
  adminRole.userId,
  'CONTENT_DELETE',
  report.targetType,
  report.targetId,
  {
    reason: resolution,
    reportId,
  },
  tx  // ❌ 불필요한 파라미터
)

// After ✅
await logAdminAction({
  adminId: adminRole.userId,
  action: 'CONTENT_DELETE',
  targetType: report.targetType,
  targetId: report.targetId,
  reason: resolution,
  request,
})
```

#### (2) 신고 처리 로그 + 불필요한 코드 제거
```javascript
// Before ❌
await logAdminAction(
  adminRole.userId,
  action === 'approve' ? 'REPORT_RESOLVE' : 'REPORT_REJECT',
  'Report',
  reportId,
  {
    before: { status: report.status },
    after: { status: newStatus },
    action,
    resolution,
    linkedAction,
    linkedActionDetails,  // ❌ 너무 많은 데이터
  },
  tx  // ❌ 불필요한 파라미터
)

return { report: updatedReport, actionResult }

// After ✅
await logAdminAction({
  adminId: adminRole.userId,
  action: action === 'approve' ? 'REPORT_RESOLVE' : 'REPORT_REJECT',
  targetType: 'Report',
  targetId: reportId,
  before: { status: report.status },
  after: { status: newStatus },
  reason: resolution,
  request,
})

return { report: updatedReport, actionResult }
```

---

### 4. 신고 배정 API
**파일**: `src/app/api/admin/reports/[reportId]/assign/route.js`

```javascript
// Before ❌
await logAdminAction(
  adminRole.userId,
  'REPORT_ASSIGN',
  'Report',
  reportId,
  {
    before: { processedBy: report.processedBy },
    after: { processedBy: targetAdminId },
    autoAssign,
  },
  tx
)

// After ✅
await logAdminAction({
  adminId: adminRole.userId,
  action: 'REPORT_ASSIGN',
  targetType: 'Report',
  targetId: reportId,
  before: { processedBy: report.processedBy },
  after: { processedBy: targetAdminId },
  request,
})
```

---

### 5. 분석 개요 API ⭐ 신규 추가
**파일**: `src/app/api/admin/analytics/overview/route.js`

```javascript
// logAdminAction import 추가
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'

// 로그 기록 추가
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'ANALYTICS_VIEW',
  targetType: 'Analytics',
  targetId: 'overview',
  request,
})
```

---

### 6. 사용자 분석 API ⭐ 신규 추가
**파일**: `src/app/api/admin/analytics/users/route.js`

```javascript
// logAdminAction import 추가
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'

// 로그 기록 추가
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'ANALYTICS_VIEW',
  targetType: 'Analytics',
  targetId: 'users',
  request,
})
```

---

### 7. 스터디 분석 API ⭐ 신규 추가
**파일**: `src/app/api/admin/analytics/studies/route.js`

```javascript
// logAdminAction import 추가
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'

// 로그 기록 추가
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'ANALYTICS_VIEW',
  targetType: 'Analytics',
  targetId: 'studies',
  request,
})
```

---

### 8. 설정 조회 API ⭐ 신규 추가
**파일**: `src/app/api/admin/settings/route.js`

```javascript
// logAdminAction import 추가
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'

// GET API에 로그 기록 추가
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'SETTINGS_VIEW',
  targetType: 'Settings',
  targetId: 'all',
  request,
})
```

**Note**: `PUT /api/admin/settings`는 이미 `SETTINGS_UPDATE` 로그를 기록하고 있음

---

## 📋 수정 완료 현황

### Prisma Schema 업데이트 ✅
**파일**: `prisma/schema.prisma`

```prisma
enum AdminAction {
  // ...기존 액션들...
  
  // 시스템 설정
  SETTINGS_VIEW
  SETTINGS_UPDATE
  SETTINGS_CACHE_CLEAR

  // 분석 및 통계 ⭐ 신규 추가
  ANALYTICS_VIEW
  ANALYTICS_EXPORT

  // 감사 로그
  AUDIT_VIEW
  AUDIT_EXPORT
}
```

### 사용자 관리 API ✅
- `GET /api/admin/users` - USER_SEARCH
- `GET /api/admin/users/[id]` - USER_VIEW
- `PATCH /api/admin/users/[id]` - USER_UPDATE
- `DELETE /api/admin/users/[id]` - USER_DELETE
- `POST /api/admin/users/[id]/suspend` - USER_SUSPEND
- `POST /api/admin/users/[id]/activate` - USER_UNSUSPEND

### 신고 관리 API ✅
- `GET /api/admin/reports` - REPORT_VIEW
- `GET /api/admin/reports/[id]` - REPORT_VIEW
- `POST /api/admin/reports/[id]/process` - REPORT_RESOLVE / REPORT_REJECT
- `POST /api/admin/reports/[id]/process` (콘텐츠 삭제) - CONTENT_DELETE
- `POST /api/admin/reports/[id]/assign` - REPORT_ASSIGN

### 스터디 관리 API ✅
- `GET /api/admin/studies` - STUDY_VIEW
- `GET /api/admin/studies/[id]` - STUDY_VIEW
- 기타 hide, close, delete 등

### 분석(Analytics) API ✅ ⭐ 신규 추가
- `GET /api/admin/analytics/overview` - ANALYTICS_VIEW
- `GET /api/admin/analytics/users` - ANALYTICS_VIEW
- `GET /api/admin/analytics/studies` - ANALYTICS_VIEW

### 설정(Settings) API ✅ ⭐ 신규 추가
- `GET /api/admin/settings` - SETTINGS_VIEW
- `PUT /api/admin/settings` - SETTINGS_UPDATE (이미 존재)

---

## 🎯 핵심 포인트

### 1. 항상 객체 파라미터 사용
```javascript
// ✅ 올바른 방식
await logAdminAction({
  adminId: adminRole.userId,
  action: 'REPORT_VIEW',
  targetType: 'Report',
  targetId: reportId,
  request,
})
```

### 2. request 객체 전달 (선택)
- IP 주소와 User-Agent를 자동으로 추출
- 로그 추적에 유용

### 3. before/after 사용 (선택)
- 상태 변경 시 이전/이후 값 기록
- JSON 형식으로 저장

### 4. reason 사용 (선택)
- 액션의 사유를 명확히 기록
- 문자열 형식

---

## 🧪 테스트 방법

### 1. 신고 페이지 접속
```
http://localhost:3000/admin/reports
```

### 2. 각 기능 테스트
- ✅ 신고 목록 조회
- ✅ 신고 상세 조회
- ✅ 신고 처리 (승인/거부)
- ✅ 신고 배정

### 3. 로그 확인
```sql
SELECT * FROM "AdminLog" 
WHERE action IN ('REPORT_VIEW', 'REPORT_RESOLVE', 'REPORT_REJECT', 'REPORT_ASSIGN', 'CONTENT_DELETE')
ORDER BY "createdAt" DESC;
```

### 4. 브라우저 콘솔 확인
- ❌ 오류 없음
- ✅ 모든 API 정상 동작

---

## 📊 결과

### Before (오류 발생)
```
❌ Failed to log admin action: Argument `action` is missing
❌ adminId: undefined
❌ targetType: null
❌ targetId: null
```

### After (완전 해결)
```
✅ 모든 로그 정상 기록
✅ adminId 정상 전달
✅ action 정상 전달
✅ targetType, targetId 정상 전달
✅ IP, User-Agent 자동 추출
```

---

## 🏆 최종 체크리스트

- ✅ 신고 목록 API 수정
- ✅ 신고 상세 API 수정
- ✅ 신고 처리 API 수정 (콘텐츠 삭제 로그 포함)
- ✅ 신고 배정 API 수정
- ✅ 불필요한 코드 제거
- ✅ 0개 Prisma 에러
- ✅ 0개 런타임 에러
- ✅ 모든 관리자 로그 정상 기록
- ✅ 서버 재시작 완료

---

## 📚 관련 문서

1. **USER-DETAIL-ERROR-FIXED.md** - 사용자 상세 페이지 오류 해결
2. **ADMIN-ACTION-ENUM-FIXED.md** - AdminAction Enum 오류 해결
3. **ADMIN-LOG-ACTION-COMPLETE.md** - 본 문서 (logAdminAction 완전 해결)

---

**모든 logAdminAction 오류가 완전히 해결되었습니다! 🎊**

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-29  
**문서 버전**: 1.0

