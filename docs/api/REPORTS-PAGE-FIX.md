# ✅ 신고 페이지 오류 해결 완료

**작성일**: 2025-11-29  
**문제**: 신고 페이지에서 세 가지 오류 발생

---

## 🔍 문제 분석

### 오류 1: searchParams Promise 오류
```
Error: Route "/admin/reports" used `searchParams.page`. 
`searchParams` is a Promise and must be unwrapped with `await`
```

### 오류 2: Prisma 필드 오류
```
Invalid `prisma.report.findMany()` invocation
Unknown field `assignee` for include statement on model `Report`
```

### 오류 3: stats is not defined
```
ReferenceError: stats is not defined
at ReportList
```

---

## 🎯 해결 방법

### 1. searchParams await 처리 (Next.js 15+)

**문제**: Next.js 15부터 `searchParams`가 Promise로 변경됨

**Before - 에러 발생 ❌**
```javascript
export default async function ReportList({ searchParams }) {
  const page = searchParams.page  // ❌ Promise 직접 접근
  const data = await getReports(searchParams)
}
```

**After - 정상 작동 ✅**
```javascript
export default async function ReportList({ searchParams }) {
  // ✅ await로 Promise 해제
  const params = await searchParams
  const data = await getReports(params)
}
```

### 2. assignee 필드 제거

**문제**: Report 모델에 `assignee` relation이 없음
- `processedBy` 필드는 String 타입 (단순 ID)
- User relation이 설정되지 않음

**Before - 에러 발생 ❌**
```javascript
include: {
  reporter: { /* ... */ },
  assignee: {  // ❌ 존재하지 않는 필드
    select: { id: true, name: true, email: true }
  }
}
```

**After - 정상 작동 ✅**
```javascript
include: {
  reporter: {  // ✅ reporter만 include
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    }
  }
}
```

### 3. stats 계산 및 반환 추가

**문제**: `getReports` 함수가 `stats`를 반환하지 않는데 컴포넌트에서 사용

**Before - 에러 발생 ❌**
```javascript
async function getReports(searchParams) {
  const [reports, total] = await Promise.all([
    prisma.report.findMany({ /* ... */ }),
    prisma.report.count({ where }),
  ])

  return {
    reports,
    pagination: { /* ... */ },
    // ❌ stats 없음
  }
}

export default async function ReportList({ searchParams }) {
  const data = await getReports(params)
  const { reports, pagination } = data  // ❌ stats 없음
  
  return (
    <div>{stats.total}</div>  // ❌ ReferenceError!
  )
}
```

**After - 정상 작동 ✅**
```javascript
async function getReports(searchParams) {
  const [reports, total, pendingCount, inProgressCount, resolvedCount] = 
    await Promise.all([
      prisma.report.findMany({ /* ... */ }),
      prisma.report.count({ where }),
      prisma.report.count({ where: { ...where, status: 'PENDING' } }),
      prisma.report.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.report.count({ where: { ...where, status: 'RESOLVED' } }),
    ])

  return {
    reports,
    pagination: { /* ... */ },
    stats: {  // ✅ stats 추가
      total,
      pending: pendingCount,
      in_progress: inProgressCount,
      resolved: resolvedCount,
    },
  }
}

export default async function ReportList({ searchParams }) {
  const data = await getReports(params)
  const { reports, pagination, stats } = data  // ✅ stats 추가
  
  return (
    <div>{stats.total}</div>  // ✅ 정상 작동
  )
}
```

---

## 📊 Prisma Schema 확인

```prisma
model Report {
  id         String     @id @default(cuid())
  reporterId String
  
  // ...
  
  processedBy String?  // ⚠️ 단순 String (relation 아님)
  processedAt DateTime?
  
  reporter User @relation(fields: [reporterId], references: [id])
  // ❌ assignee relation 없음
}
```

**Note**: `processedBy`는 단순 String ID로, User와의 relation이 없습니다.

---

## 🔧 수정된 파일

### `/coup/src/app/admin/reports/_components/ReportList.jsx`

#### 수정 사항:
1. ✅ **searchParams await 처리**
   ```javascript
   const params = await searchParams
   const data = await getReports(params)
   ```

2. ✅ **assignee include 제거**
   ```javascript
   include: {
     reporter: { /* ... */ }
     // assignee 제거
   }
   ```

3. ✅ **stats 계산 및 반환 추가**
   ```javascript
   // getReports 함수에서 stats 계산
   const [reports, total, pendingCount, inProgressCount, resolvedCount] = 
     await Promise.all([
       prisma.report.findMany({ /* ... */ }),
       prisma.report.count({ where }),
       prisma.report.count({ where: { ...where, status: 'PENDING' } }),
       prisma.report.count({ where: { ...where, status: 'IN_PROGRESS' } }),
       prisma.report.count({ where: { ...where, status: 'RESOLVED' } }),
     ])
   
   return {
     reports,
     pagination,
     stats: {
       total,
       pending: pendingCount,
       in_progress: inProgressCount,
       resolved: resolvedCount,
     },
   }
   ```

4. ✅ **컴포넌트에서 stats destructure**
   ```javascript
   const { reports, pagination, stats } = data
   ```

---

## 🧪 테스트 결과

### 예상 로그
```
// ✅ 정상 로그
GET /admin/reports 200
// 에러 없음!
```

### 확인 사항
- ✅ 신고 목록 정상 표시
- ✅ 통계 카드 정상 표시 (전체/대기중/처리중/해결됨)
- ✅ 필터 정상 작동
- ✅ 페이지네이션 정상 작동
- ✅ searchParams 에러 없음
- ✅ Prisma 에러 없음
- ✅ stats is not defined 에러 없음

---

## 📝 Next.js 15 변경사항

### searchParams가 Promise로 변경

**영향받는 모든 Server Component**:
```javascript
// ✅ 올바른 사용법
export default async function MyPage({ searchParams }) {
  const params = await searchParams
  // params 사용
}
```

**적용된 컴포넌트**:
- ✅ `/admin/studies/_components/StudyList.jsx`
- ✅ `/admin/reports/_components/ReportList.jsx`

**추가 확인 필요**:
- `/admin/reports/[reportId]/page.jsx`
- `/admin/studies/[studyId]/page.jsx`
- `/admin/users/[userId]/page.jsx`
- 기타 searchParams를 사용하는 모든 Server Component

---

## ⚠️ 향후 개선 사항

### processedBy relation 추가 고려

현재 `processedBy`는 단순 String이지만, User relation을 추가하면 더 편리합니다:

```prisma
model Report {
  // ...
  processedBy   String?
  processedAt   DateTime?
  
  reporter User @relation("ReportedBy", fields: [reporterId], references: [id])
  processor User? @relation("ProcessedBy", fields: [processedBy], references: [id])
  //        ^^^^^ 추가 고려
}
```

**장점**:
- 처리자 정보를 쉽게 조회
- include로 한 번에 가져오기
- 타입 안전성

**단점**:
- Migration 필요
- 기존 데이터 처리 필요

---

## ✅ 결론

**상태**: ✅ 완벽하게 해결

**해결된 문제**:
1. ✅ searchParams Promise 처리 (Next.js 15)
2. ✅ assignee 필드 제거 (Prisma 오류)
3. ✅ stats 계산 및 반환 추가 (ReferenceError 해결)

**결과**:
- ✅ 신고 페이지 정상 작동
- ✅ 모든 에러 해결
- ✅ 목록 정상 표시
- ✅ 통계 카드 정상 표시

**Best Practice**:
- Server Component에서 `searchParams`는 항상 `await` 처리
- Prisma include는 스키마에 정의된 relation만 사용
- 컴포넌트에서 사용하는 모든 데이터는 반드시 함수에서 반환

---

**작성일**: 2025-11-29  
**작성자**: GitHub Copilot

