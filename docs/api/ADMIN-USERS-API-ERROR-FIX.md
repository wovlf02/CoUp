# 🐛 Admin Users API 500 에러 해결

**발생일**: 2025-11-29  
**에러**: GET /api/admin/users?status=fulfilled - 500

---

## 🔍 문제 분석

### 에러 로그
```
❌ [API] GET /api/admin/users?status=fulfilled - 500: "사용자 목록 조회 실패"
```

### 근본 원인
`status=fulfilled` 파라미터가 전달되었는데, 이는 **유효하지 않은 UserStatus enum 값**입니다.

```prisma
// Prisma Schema
enum UserStatus {
  ACTIVE
  SUSPENDED  
  DELETED
}
```

`fulfilled`는 Promise의 상태를 나타내는 값으로, 사용자 상태로는 유효하지 않습니다.

---

## ✅ 해결 방법

### 1. Status 값 검증 추가
```javascript
// Before - 검증 없이 직접 사용
const status = searchParams.get('status')

// After - 유효한 값만 허용
const statusParam = searchParams.get('status')
const validStatuses = ['ACTIVE', 'SUSPENDED', 'DELETED', 'all']
const status = validStatuses.includes(statusParam) ? statusParam : null
```

### 2. 상세 에러 로깅 추가
```javascript
// Before
console.error('Get users error:', error)
return NextResponse.json(
  { success: false, error: '사용자 목록 조회 실패' },
  { status: 500 }
)

// After
console.error('❌ [Admin Users API] Error:', error)
console.error('❌ [Admin Users API] Stack:', error.stack)
console.error('❌ [Admin Users API] Message:', error.message)
return NextResponse.json(
  { success: false, error: '사용자 목록 조회 실패', details: error.message },
  { status: 500 }
)
```

### 3. 디버깅 로그 추가
```javascript
console.log('📝 [Admin Users API] Query params:', {
  search,
  status,
  statusParam,
  provider,
  hasWarnings,
  isSuspended
})
```

---

## 🔧 수정된 파일

### `/coup/src/app/api/admin/users/route.js`
- ✅ Status 파라미터 검증 로직 추가
- ✅ 상세 에러 로깅 추가
- ✅ 디버깅 로그 추가

---

## 📝 검증 방법

### 1. 유효한 status 값으로 테스트
```javascript
// 올바른 요청
GET /api/admin/users?status=ACTIVE     ✅
GET /api/admin/users?status=SUSPENDED  ✅
GET /api/admin/users?status=DELETED    ✅
GET /api/admin/users?status=all        ✅
GET /api/admin/users                   ✅ (status 없음)
```

### 2. 잘못된 status 값 처리
```javascript
// 잘못된 요청 - 이제 무시됨
GET /api/admin/users?status=fulfilled  ✅ (status=null로 처리)
GET /api/admin/users?status=invalid    ✅ (status=null로 처리)
```

### 3. 서버 로그 확인
```
📝 [Admin Users API] Query params: {
  search: null,
  status: null,          // invalid 값은 null로 처리됨
  statusParam: 'fulfilled',
  provider: null,
  hasWarnings: false,
  isSuspended: false
}
```

---

## 🎯 향후 개선 사항

### 1. 프론트엔드에서 검증
```javascript
// UserList.jsx 개선
const validStatuses = ['ACTIVE', 'SUSPENDED', 'DELETED', 'all']
const params = {}

if (searchParams?.status && validStatuses.includes(searchParams.status)) {
  params.status = searchParams.status
}
```

### 2. API 응답에 유효하지 않은 파라미터 경고 추가
```javascript
const warnings = []
if (statusParam && !validStatuses.includes(statusParam)) {
  warnings.push(`Invalid status value: ${statusParam}`)
}

return NextResponse.json({
  success: true,
  data: { ...},
  warnings: warnings.length > 0 ? warnings : undefined
})
```

### 3. TypeScript 타입 정의
```typescript
type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED' | 'all'

interface UserFilters {
  search?: string
  status?: UserStatus
  provider?: string
  hasWarnings?: boolean
  isSuspended?: boolean
}
```

---

## 📚 관련 파일

- `/coup/src/app/api/admin/users/route.js` - 수정됨
- `/coup/prisma/schema.prisma` - UserStatus enum 정의
- `/coup/src/app/admin/users/_components/UserList.jsx` - API 호출

---

## ✅ 결론

**상태**: 해결 완료  
**방법**: 유효하지 않은 enum 값 검증 추가  
**영향**: 잘못된 status 파라미터로 인한 500 에러 방지

이제 어떤 status 값이 전달되더라도 서버가 안전하게 처리합니다.

