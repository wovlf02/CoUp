# 관리자 - 사용자 관리 예외 처리

**작성일**: 2025-11-30  
**최종 업데이트**: 현재 구현 기준  
**카테고리**: 관리자 > 사용자 관리  
**우선순위**: 🔴 최고  

---

## 📋 목차

1. [개요](#개요)
2. [권한 및 인증 예외](#권한-및-인증-예외)
3. [사용자 조회 예외](#사용자-조회-예외)
4. [사용자 상태 변경 예외](#사용자-상태-변경-예외)
5. [디버깅 가이드](#디버깅-가이드)

---

## 개요

### 현재 구현된 API 엔드포인트

```
GET    /api/admin/users              # 사용자 목록
GET    /api/admin/users/[id]         # 사용자 상세
PATCH  /api/admin/users/[id]         # 사용자 수정
POST   /api/admin/users/[id]/suspend # 사용자 정지
POST   /api/admin/users/[id]/activate# 사용자 활성화
```

### 권한 시스템

```javascript
// lib/admin/permissions.js
PERMISSIONS = {
  USER_VIEW: 'user:view',        // 사용자 조회
  USER_SEARCH: 'user:search',    // 사용자 검색
  USER_WARN: 'user:warn',        // 경고
  USER_SUSPEND: 'user:suspend',  // 정지
  USER_UNSUSPEND: 'user:unsuspend', // 정지 해제
  USER_DELETE: 'user:delete',    // 삭제
  USER_UPDATE: 'user:update',    // 수정
}
```

### 역할 계층 구조

```
SUPER_ADMIN (레벨 4) - 모든 권한
    ↓
ADMIN (레벨 3) - 사용자/스터디 관리
    ↓  
MODERATOR (레벨 2) - 콘텐츠 모더레이션
    ↓
VIEWER (레벨 1) - 조회만 가능
```

---

## 권한 및 인증 예외

### ADM-USR-001: 로그인되지 않은 상태 🔴

**발생 위치**: `lib/admin/auth.js - requireAdmin()`

```javascript
// src/lib/admin/auth.js
if (!session || !session.user) {
  return NextResponse.json(
    { success: false, error: '로그인이 필요합니다.' },
    { status: 401 }
  )
}
```

**증상**:
```json
{
  "success": false,
  "error": "로그인이 필요합니다.",
  "status": 401
}
```

**원인**:
- NextAuth 세션 만료
- 쿠키 삭제됨
- 로그아웃 상태

**해결 방법**:

```javascript
// 클라이언트: 401 에러 처리
async function handleApiRequest(url, options) {
  try {
    const res = await fetch(url, options)
    const data = await res.json()
    
    if (!data.success && res.status === 401) {
      // 로그인 페이지로 리다이렉트
      window.location.href = '/sign-in?error=session-expired'
      return null
    }
    
    return data
  } catch (error) {
    console.error('API 요청 실패:', error)
    throw error
  }
}
```

---

### ADM-USR-002: 관리자 권한 없음 🔴

**발생 위치**: `lib/admin/auth.js - requireAdmin()`

```javascript
const adminRole = await prisma.adminRole.findUnique({
  where: { userId: session.user.id }
})

if (!adminRole) {
  return NextResponse.json(
    { success: false, error: '관리자 권한이 없습니다.' },
    { status: 403 }
  )
}
```

**증상**:
```json
{
  "success": false,
  "error": "관리자 권한이 없습니다.",
  "status": 403
}
```

**원인**:
- AdminRole 테이블에 레코드 없음
- 일반 사용자가 관리자 페이지 접근

**디버깅**:

```bash
# 사용자의 관리자 권한 확인
node scripts/check-admin.js --email user@example.com
```

**해결 방법**:

```bash
# 관리자 권한 부여
node scripts/create-test-admin.js \
  --email user@example.com \
  --role ADMIN
```

---

### ADM-USR-003: 관리자 권한 만료 🟠

**발생 위치**: `lib/admin/auth.js - requireAdmin()`

```javascript
if (adminRole.expiresAt && new Date(adminRole.expiresAt) < new Date()) {
  return NextResponse.json(
    { success: false, error: '관리자 권한이 만료되었습니다.' },
    { status: 403 }
  )
}
```

**증상**:
```json
{
  "success": false,
  "error": "관리자 권한이 만료되었습니다.",
  "status": 403
}
```

**원인**:
- `expiresAt` 날짜가 현재 시간보다 과거
- 임시 관리자 권한 기간 종료

**확인 방법**:

```sql
-- 만료된 관리자 조회
SELECT userId, role, expiresAt 
FROM AdminRole 
WHERE expiresAt < NOW();
```

**해결 방법**:

```javascript
// 권한 연장 스크립트
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function extendAdminRole(userId, days = 30) {
  const newExpiry = new Date()
  newExpiry.setDate(newExpiry.getDate() + days)
  
  await prisma.adminRole.update({
    where: { userId },
    data: { expiresAt: newExpiry }
  })
  
  console.log(`✅ 권한 연장: ${days}일 (${newExpiry.toISOString()})`)
}
```

---

### ADM-USR-004: 권한 부족 🟠

**발생 위치**: `lib/admin/auth.js - requireAdmin()`

```javascript
if (requiredPermissions) {
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions]

  const hasRequiredPermissions = permissions.every(permission =>
    hasPermission(adminRole.role, permission)
  )

  if (!hasRequiredPermissions) {
    return NextResponse.json(
      { success: false, error: '해당 작업을 수행할 권한이 없습니다.' },
      { status: 403 }
    )
  }
}
```

**증상**:
```json
{
  "success": false,
  "error": "해당 작업을 수행할 권한이 없습니다.",
  "status": 403
}
```

**원인**:
- VIEWER가 USER_SUSPEND 권한 필요 작업 시도
- MODERATOR가 USER_DELETE 권한 필요 작업 시도
- 역할에 해당 권한이 없음

**권한 매핑**:

```javascript
// VIEWER: 조회만 가능
['user:view', 'user:search', 'study:view', 'report:view']

// MODERATOR: + 콘텐츠 관리
['user:warn', 'report:assign', 'report:process', 'content:delete']

// ADMIN: + 사용자/스터디 관리
['user:suspend', 'user:unsuspend', 'user:update', 'study:delete']

// SUPER_ADMIN: 모든 권한
```

**해결 방법**:

```javascript
// UI에서 권한 체크
import { hasPermission } from '@/lib/admin/permissions'

function UserActions({ user, adminRole }) {
  const canSuspend = hasPermission(adminRole.role, 'user:suspend')
  const canDelete = hasPermission(adminRole.role, 'user:delete')
  
  return (
    <div>
      {canSuspend && (
        <button onClick={() => handleSuspend(user.id)}>
          정지
        </button>
      )}
      
      {canDelete && (
        <button onClick={() => handleDelete(user.id)}>
          삭제
        </button>
      )}
    </div>
  )
}
```

---

## 사용자 조회 예외

### ADM-USR-011: 사용자 목록 조회 실패 🟠

**발생 위치**: `api/admin/users/route.js - GET`

**원인**:
- 데이터베이스 연결 오류
- Prisma 쿼리 타임아웃
- 잘못된 필터 파라미터

**현재 구현**:

```javascript
// api/admin/users/route.js
export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) return auth
  
  try {
    const { searchParams } = new URL(request.url)
    
    // 페이지네이션 (최대 100개 제한)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit
    
    // 필터 (화이트리스트 검증)
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'DELETED', 'all']
    const status = validStatuses.includes(statusParam) ? statusParam : null
    
    // ... where 조건 구성
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit }),
      prisma.user.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '사용자 목록 조회 실패' },
      { status: 500 }
    )
  }
}
```

**개선 제안**:

```javascript
// 타임아웃 추가
const [users, total] = await Promise.race([
  Promise.all([
    prisma.user.findMany({ where, skip, take: limit }),
    prisma.user.count({ where })
  ]),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Query timeout')), 10000)
  )
])

// 타임아웃 에러 처리
if (error.message === 'Query timeout') {
  return NextResponse.json(
    { 
      success: false, 
      error: '조회 시간이 초과되었습니다. 필터를 추가해주세요.',
      code: 'ADM-USR-011'
    },
    { status: 504 }
  )
}
```

---

### ADM-USR-012: 잘못된 필터 파라미터 🟡

**현재 구현**: 화이트리스트 검증

```javascript
// api/admin/users/route.js
const validStatuses = ['ACTIVE', 'SUSPENDED', 'DELETED', 'all']
const status = validStatuses.includes(statusParam) ? statusParam : null

// status가 유효하지 않으면 null로 처리 (에러 없이 무시)
if (status && status !== 'all') {
  where.status = status
}
```

**문제점**: 잘못된 값을 조용히 무시함

**개선 제안**:

```javascript
// 명시적 에러 반환
if (statusParam && !validStatuses.includes(statusParam)) {
  return NextResponse.json(
    { 
      success: false, 
      error: `잘못된 status 값: ${statusParam}. 유효한 값: ${validStatuses.join(', ')}`,
      code: 'ADM-USR-012'
    },
    { status: 400 }
  )
}
```

---

### ADM-USR-013: 존재하지 않는 사용자 🟡

**발생 위치**: `api/admin/users/[id]/route.js - GET`

**현재 구현**:

```javascript
const user = await prisma.user.findUnique({
  where: { id: userId }
})

if (!user) {
  return NextResponse.json(
    { success: false, error: '사용자를 찾을 수 없습니다' },
    { status: 404 }
  )
}
```

**증상**:
```json
{
  "success": false,
  "error": "사용자를 찾을 수 없습니다",
  "status": 404
}
```

**원인**:
- 잘못된 사용자 ID
- 사용자가 삭제됨
- 다른 관리자가 동시에 삭제

**클라이언트 처리**:

```javascript
async function fetchUser(userId) {
  try {
    const res = await fetch(`/api/admin/users/${userId}`)
    const data = await res.json()
    
    if (!data.success) {
      if (res.status === 404) {
        toast.error('사용자를 찾을 수 없습니다')
        router.push('/admin/users') // 목록으로 이동
        return null
      }
      throw new Error(data.error)
    }
    
    return data.data
  } catch (error) {
    console.error('[ADM-USR-013]:', error)
    throw error
  }
}
```

---

## 사용자 상태 변경 예외

### ADM-USR-021: 사용자 정지 실패 🟠

**발생 위치**: `api/admin/users/[id]/suspend/route.js - POST`

**현재 구현**:

```javascript
export async function POST(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_EDIT)
  if (auth instanceof NextResponse) return auth

  try {
    const { id: userId } = await params
    const body = await request.json()
    const { reason, duration } = body

    // 사용자 정지
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
        suspendReason: reason || '관리자에 의한 정지',
        ...(duration && { 
          suspendedUntil: new Date(Date.now() + duration * 24 * 60 * 60 * 1000) 
        }),
      },
    })

    // 관리자 로그
    await logAdminAction({
      adminId: auth.adminRole.userId,
      action: 'USER_SUSPEND',
      targetType: 'USER',
      targetId: userId,
      details: { userId, reason, duration },
    })

    return NextResponse.json({
      success: true,
      message: '사용자가 정지되었습니다',
      data: user,
    })
  } catch (error) {
    console.error('사용자 정지 실패:', error)
    return NextResponse.json(
      { success: false, error: '사용자 정지 실패' },
      { status: 500 }
    )
  }
}
```

**문제점**:
1. ❌ 이미 정지된 사용자 체크 없음
2. ❌ 자기 자신 정지 방지 없음
3. ❌ 트랜잭션 없음 (로그 실패 시 롤백 안 됨)
4. ❌ Prisma P2025 에러 (존재하지 않는 사용자) 처리 없음

**개선 제안**:

```javascript
export async function POST(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_EDIT)
  if (auth instanceof NextResponse) return auth

  try {
    const { id: userId } = await params
    const body = await request.json()
    const { reason, duration } = body
    
    // 1. 자기 자신 정지 방지
    if (userId === auth.adminRole.userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '자기 자신을 정지할 수 없습니다.',
          code: 'ADM-USR-022'
        },
        { status: 400 }
      )
    }
    
    // 2. 사용자 존재 및 현재 상태 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { adminRole: true }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    // 3. 이미 정지된 경우
    if (existingUser.status === 'SUSPENDED') {
      return NextResponse.json(
        { 
          success: false, 
          error: '이미 정지된 사용자입니다',
          code: 'ADM-USR-023',
          data: {
            status: existingUser.status,
            suspendedUntil: existingUser.suspendedUntil
          }
        },
        { status: 409 }
      )
    }
    
    // 4. 관리자 계층 확인 (낮은 등급이 높은 등급 정지 불가)
    if (existingUser.adminRole) {
      const { compareRoleLevel } = await import('@/lib/admin/roles')
      if (compareRoleLevel(auth.adminRole.role, existingUser.adminRole.role) <= 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: '동일하거나 높은 등급의 관리자를 정지할 수 없습니다',
            code: 'ADM-USR-024'
          },
          { status: 403 }
        )
      }
    }
    
    // 5. 트랜잭션으로 안전하게 처리
    const result = await prisma.$transaction(async (tx) => {
      // 사용자 정지
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          status: 'SUSPENDED',
          suspendReason: reason || '관리자에 의한 정지',
          ...(duration && { 
            suspendedUntil: new Date(Date.now() + duration * 24 * 60 * 60 * 1000) 
          }),
        },
      })
      
      // Sanction 레코드 생성 (제재 이력)
      await tx.sanction.create({
        data: {
          userId,
          type: 'SUSPENSION',
          reason: reason || '관리자에 의한 정지',
          duration,
          isActive: true,
          createdBy: auth.adminRole.userId,
        }
      })
      
      return user
    })
    
    // 6. 관리자 로그 (트랜잭션 외부)
    await logAdminAction({
      adminId: auth.adminRole.userId,
      action: 'USER_SUSPEND',
      targetType: 'USER',
      targetId: userId,
      before: { status: existingUser.status },
      after: { status: 'SUSPENDED', reason, duration },
      request,
    })

    return NextResponse.json({
      success: true,
      message: '사용자가 정지되었습니다',
      data: result,
    })
    
  } catch (error) {
    console.error('사용자 정지 실패:', error)
    
    // Prisma 에러 코드 확인
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: '사용자 정지 처리 중 오류가 발생했습니다',
        code: 'ADM-USR-021'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

---

### ADM-USR-025: logAdminAction 실패 시 처리 🟡

**문제**: 현재 `logAdminAction`은 실패 시 에러를 던지지 않음

```javascript
// lib/admin/auth.js
export async function logAdminAction({...}) {
  try {
    await prisma.adminLog.create({...})
  } catch (error) {
    console.error('Failed to log admin action:', error)
    // 로그 실패는 주요 작업에 영향을 주지 않도록 에러를 던지지 않음
  }
}
```

**장점**: 로그 실패가 주요 작업을 방해하지 않음  
**단점**: 로그 누락 가능

**권장사항**: 현재 구현 유지 (로그는 best-effort)

---

## 디버깅 가이드

### 관리자 권한 확인

```bash
# 사용자의 관리자 권한 확인
node coup/scripts/check-admin.js --email admin@example.com
```

```javascript
// scripts/check-admin.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdmin(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { adminRole: true }
  })
  
  if (!user) {
    console.log('❌ 사용자를 찾을 수 없습니다')
    return
  }
  
  console.log('👤 사용자 정보:')
  console.log('- ID:', user.id)
  console.log('- 이메일:', user.email)
  console.log('- 상태:', user.status)
  
  if (user.adminRole) {
    console.log('\n🔐 관리자 권한:')
    console.log('- 역할:', user.adminRole.role)
    console.log('- 부여일:', user.adminRole.grantedAt)
    console.log('- 만료일:', user.adminRole.expiresAt || '없음')
    console.log('- 상태:', user.adminRole.expiresAt && new Date(user.adminRole.expiresAt) < new Date() 
      ? '❌ 만료됨' 
      : '✅ 활성')
  } else {
    console.log('\n❌ 관리자 권한 없음')
  }
}

const email = process.argv[2]
checkAdmin(email).then(() => process.exit(0))
```

### 관리자 로그 조회

```javascript
// 특정 사용자에 대한 관리자 액션 조회
const logs = await prisma.adminLog.findMany({
  where: {
    targetType: 'USER',
    targetId: userId
  },
  include: {
    admin: {
      select: {
        name: true,
        email: true
      }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 20
})

console.log('📋 관리자 액션 이력:', logs)
```

---

## 요약

### 현재 구현 상태

| 기능 | 상태 | 비고 |
|------|------|------|
| 권한 확인 | ✅ 완료 | requireAdmin 함수 |
| 사용자 목록 | ✅ 완료 | 필터, 페이지네이션 |
| 사용자 상세 | ✅ 완료 | include 최적화 필요 |
| 사용자 정지 | ⚠️ 부분 | 검증 로직 부족 |
| 사용자 활성화 | ✅ 완료 | - |
| 관리자 로그 | ✅ 완료 | best-effort |

### 개선 필요 사항

1. **사용자 정지 API**:
   - [ ] 자기 자신 정지 방지
   - [ ] 이미 정지된 사용자 체크
   - [ ] 관리자 계층 확인
   - [ ] 트랜잭션 처리

2. **필터 검증**:
   - [ ] 잘못된 파라미터 명시적 에러
   - [ ] 날짜 형식 검증

3. **성능 최적화**:
   - [ ] 쿼리 타임아웃 추가
   - [ ] 인덱스 최적화

---

**다음 문서**: [02-study-management.md](./02-study-management.md)
