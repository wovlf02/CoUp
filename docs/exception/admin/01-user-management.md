# 관리자 - 사용자 관리 예외 처리

**작성일**: 2025-11-29  
**카테고리**: 관리자 > 사용자 관리  
**우선순위**: 🔴 최고  
**관련 API**: `/api/admin/users/**`

---

## 목차

1. [개요](#개요)
2. [권한 및 인증](#권한-및-인증)
3. [사용자 조회](#사용자-조회)
4. [사용자 상태 변경](#사용자-상태-변경)
5. [사용자 수정 및 삭제](#사용자-수정-및-삭제)
6. [성능 최적화](#성능-최적화)
7. [디버깅 가이드](#디버깅-가이드)

---

## 개요

### 사용자 관리 기능

관리자는 시스템의 모든 사용자를 관리할 수 있습니다:

- **목록 조회**: 필터링, 정렬, 검색
- **상세 조회**: 사용자 정보, 통계, 이력
- **상태 변경**: 정지, 활성화
- **수정**: 정보 업데이트
- **삭제**: Soft delete

### API 엔드포인트

```
GET    /api/admin/users              # 사용자 목록
GET    /api/admin/users/[id]         # 사용자 상세
PATCH  /api/admin/users/[id]         # 사용자 수정
DELETE /api/admin/users/[id]         # 사용자 삭제
POST   /api/admin/users/[id]/suspend # 사용자 정지
POST   /api/admin/users/[id]/activate# 사용자 활성화
```

---

## 권한 및 인증

### ADM-USR-001: 관리자 권한 없음 🔴

**상황**: 일반 사용자가 관리자 페이지 접근

**원인**:
- 관리자 역할이 없음
- 세션에 관리자 정보 누락

**에러 응답**:
```json
{
  "success": false,
  "error": "관리자 권한이 없습니다.",
  "status": 403
}
```

**해결 방법**:

```javascript
// API: src/app/api/admin/users/route.js
import { requireAdmin } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

export async function GET(request) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) return auth // 권한 없음 응답
  
  const { adminRole } = auth
  // ... 나머지 로직
}
```

```javascript
// 클라이언트: 에러 처리
async function fetchUsers() {
  try {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    
    if (!data.success) {
      if (res.status === 403) {
        toast.error('관리자 권한이 필요합니다')
        router.push('/')
      }
      throw new Error(data.error)
    }
    
    return data.data
  } catch (error) {
    console.error('[ADM-USR-001] 권한 없음:', error)
    throw error
  }
}
```

**예방**:
```javascript
// middleware.js - 관리자 페이지 접근 제한
export function middleware(request) {
  const { pathname } = request.nextUrl
  
  if (pathname.startsWith('/admin')) {
    const session = await getToken({ req: request })
    
    if (!session?.user?.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
}
```

---

### ADM-USR-002: 세션 만료 🟠

**상황**: 작업 중 세션 타임아웃

**원인**:
- NextAuth 세션 만료 (기본 30일)
- 장시간 미사용
- 강제 로그아웃

**에러 응답**:
```json
{
  "success": false,
  "error": "로그인이 필요합니다.",
  "status": 401
}
```

**해결 방법**:

```javascript
// API에서 세션 확인
export async function requireAdmin(request) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: '로그인이 필요합니다.' },
      { status: 401 }
    )
  }
  // ...
}
```

```javascript
// 클라이언트: 자동 재로그인
async function handleApiError(error, response) {
  if (response?.status === 401) {
    toast.error('세션이 만료되었습니다. 다시 로그인해주세요.')
    
    // 현재 페이지 저장
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
    
    // 로그인 페이지로 이동
    await signOut({ redirect: false })
    router.push('/login')
  }
}
```

**예방**:
```javascript
// 세션 자동 갱신 (클라이언트)
useEffect(() => {
  const interval = setInterval(async () => {
    const session = await getSession()
    if (!session) {
      // 세션 만료 처리
      handleSessionExpired()
    }
  }, 5 * 60 * 1000) // 5분마다 체크
  
  return () => clearInterval(interval)
}, [])
```

---

### ADM-USR-003: 자기 자신 수정 시도 🟡

**상황**: 관리자가 자신의 계정 정지/삭제 시도

**원인**:
- 비즈니스 로직 위반
- UI에서 방지하지 않음

**해결 방법**:

```javascript
// API: 자가 수정 방지
export async function POST(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_EDIT)
  if (auth instanceof NextResponse) return auth
  
  const { id: targetUserId } = await params
  
  // 자기 자신 체크
  if (targetUserId === auth.adminRole.userId) {
    return NextResponse.json(
      { 
        success: false, 
        error: '자기 자신을 정지할 수 없습니다.',
        code: 'ADM-USR-003'
      },
      { status: 400 }
    )
  }
  
  // ... 정지 로직
}
```

```javascript
// UI: 버튼 비활성화
function UserActions({ user, currentAdminId }) {
  const isSelf = user.id === currentAdminId
  
  return (
    <div>
      <button
        disabled={isSelf}
        onClick={() => handleSuspend(user.id)}
        title={isSelf ? '자기 자신을 정지할 수 없습니다' : ''}
      >
        정지
      </button>
      
      <button
        disabled={isSelf}
        onClick={() => handleDelete(user.id)}
        title={isSelf ? '자기 자신을 삭제할 수 없습니다' : ''}
      >
        삭제
      </button>
    </div>
  )
}
```

---

### ADM-USR-004: 다른 관리자 수정 권한 없음 🟠

**상황**: 낮은 등급 관리자가 높은 등급 관리자 수정 시도

**원인**:
- 권한 계층 확인 누락
- MODERATOR가 ADMIN 수정 시도

**해결 방법**:

```javascript
// lib/admin/permissions.js
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  MODERATOR: 1,
}

export function canModifyUser(adminRole, targetUser) {
  // 1. 자기 자신은 불가
  if (adminRole.userId === targetUser.id) {
    return { allowed: false, reason: '자기 자신을 수정할 수 없습니다' }
  }
  
  // 2. 대상이 관리자인 경우
  if (targetUser.adminRole) {
    const adminLevel = ROLE_HIERARCHY[adminRole.role] || 0
    const targetLevel = ROLE_HIERARCHY[targetUser.adminRole.role] || 0
    
    if (targetLevel >= adminLevel) {
      return { 
        allowed: false, 
        reason: '동일하거나 높은 등급의 관리자를 수정할 수 없습니다' 
      }
    }
  }
  
  return { allowed: true }
}
```

```javascript
// API에서 사용
export async function POST(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_EDIT)
  if (auth instanceof NextResponse) return auth
  
  const { id: targetUserId } = await params
  
  // 대상 사용자 조회 (관리자 역할 포함)
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { adminRole: true }
  })
  
  if (!targetUser) {
    return NextResponse.json(
      { success: false, error: '사용자를 찾을 수 없습니다' },
      { status: 404 }
    )
  }
  
  // 수정 권한 확인
  const { allowed, reason } = canModifyUser(auth.adminRole, targetUser)
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: reason, code: 'ADM-USR-004' },
      { status: 403 }
    )
  }
  
  // ... 수정 로직
}
```

---

## 사용자 조회

### ADM-USR-011: 사용자 목록 조회 실패 🟠

**상황**: 사용자 목록 API 호출 실패

**원인**:
- 데이터베이스 연결 오류
- 쿼리 타임아웃
- 잘못된 필터 조건

**해결 방법**:

```javascript
// API: 에러 핸들링
export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) return auth
  
  try {
    const { searchParams } = new URL(request.url)
    
    // 페이지네이션 (안전한 기본값)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit
    
    // Where 조건 구성
    const where = buildWhereCondition(searchParams)
    
    // 사용자 조회 (타임아웃 설정)
    const [users, total] = await Promise.race([
      Promise.all([
        prisma.user.findMany({ where, skip, take: limit }),
        prisma.user.count({ where })
      ]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      )
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
    console.error('[ADM-USR-011] 사용자 목록 조회 실패:', error)
    
    if (error.message === 'Query timeout') {
      return NextResponse.json(
        { 
          success: false, 
          error: '조회 시간이 초과되었습니다. 필터를 추가하거나 페이지당 항목 수를 줄여주세요.',
          code: 'ADM-USR-011'
        },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: '사용자 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

```javascript
// 클라이언트: 재시도 로직
async function fetchUsers(params, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`/api/admin/users?${new URLSearchParams(params)}`)
      const data = await res.json()
      
      if (!data.success) {
        if (res.status === 504) {
          // 타임아웃 - 조건 완화
          toast.warning('조회 시간 초과. 필터를 추가해주세요.')
        }
        throw new Error(data.error)
      }
      
      return data.data
    } catch (error) {
      if (i === retries - 1) throw error
      
      // 재시도 전 대기
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

---

### ADM-USR-013: 존재하지 않는 사용자 🟡

**상황**: 삭제되었거나 존재하지 않는 사용자 접근

**빈도**: 높음 (다른 관리자가 동시에 삭제)

**해결 방법**:

```javascript
// API: 404 응답
export async function GET(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) return auth
  
  try {
    const { id: userId } = await params
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            ownedStudies: true,
            studyMembers: true,
            messages: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: '사용자를 찾을 수 없습니다',
          code: 'ADM-USR-013'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: user
    })
    
  } catch (error) {
    console.error('[ADM-USR-013] 사용자 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '사용자 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
```

```javascript
// 클라이언트: 404 처리
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

### ADM-USR-016: 필터 조건 오류 🟡

**상황**: 잘못된 필터 값으로 인한 조회 오류

**원인**:
- 유효하지 않은 status 값
- 잘못된 날짜 형식
- SQL 인젝션 시도

**해결 방법**:

```javascript
// 필터 검증 함수
function buildWhereCondition(searchParams) {
  const where = {}
  
  // 1. 검색어 (안전하게 처리)
  const search = searchParams.get('search')
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { id: { contains: search } }
    ]
  }
  
  // 2. 상태 (화이트리스트)
  const statusParam = searchParams.get('status')
  const validStatuses = ['ACTIVE', 'SUSPENDED', 'DELETED', 'all']
  if (statusParam && validStatuses.includes(statusParam) && statusParam !== 'all') {
    where.status = statusParam
  }
  
  // 3. 제공자 (화이트리스트)
  const provider = searchParams.get('provider')
  const validProviders = ['email', 'google', 'kakao', 'all']
  if (provider && validProviders.includes(provider) && provider !== 'all') {
    where.provider = provider
  }
  
  // 4. 날짜 범위 (검증)
  const createdFrom = searchParams.get('createdFrom')
  const createdTo = searchParams.get('createdTo')
  
  if (createdFrom || createdTo) {
    where.createdAt = {}
    
    if (createdFrom) {
      const fromDate = new Date(createdFrom)
      if (isNaN(fromDate.getTime())) {
        throw new Error('Invalid createdFrom date')
      }
      where.createdAt.gte = fromDate
    }
    
    if (createdTo) {
      const toDate = new Date(createdTo)
      if (isNaN(toDate.getTime())) {
        throw new Error('Invalid createdTo date')
      }
      where.createdAt.lte = toDate
    }
  }
  
  return where
}

// API에서 사용
export async function GET(request) {
  // ...
  try {
    const where = buildWhereCondition(searchParams)
    // ...
  } catch (error) {
    if (error.message.includes('Invalid')) {
      return NextResponse.json(
        { 
          success: false, 
          error: '잘못된 필터 조건입니다',
          code: 'ADM-USR-016'
        },
        { status: 400 }
      )
    }
    throw error
  }
}
```

---

## 사용자 상태 변경

### ADM-USR-021: 사용자 정지 실패 🟠

**상황**: 사용자 정지 처리 중 오류

**원인**:
- 데이터베이스 오류
- 트랜잭션 실패
- 알림 전송 실패

**해결 방법**:

```javascript
// API: 트랜잭션으로 안전하게 처리
export async function POST(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_EDIT)
  if (auth instanceof NextResponse) return auth
  
  const { id: userId } = await params
  const body = await request.json()
  const { reason, duration } = body
  
  try {
    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 사용자 정지
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          status: 'SUSPENDED',
          suspendReason: reason || '관리자에 의한 정지',
          suspendedUntil: duration 
            ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
            : null
        }
      })
      
      // 2. 제재 이력 생성
      const sanction = await tx.sanction.create({
        data: {
          userId: userId,
          type: 'SUSPENSION',
          reason: reason || '관리자에 의한 정지',
          duration: duration,
          isActive: true,
          createdBy: auth.adminRole.userId
        }
      })
      
      // 3. 관리자 로그
      await logAdminAction({
        adminId: auth.adminRole.userId,
        action: 'USER_SUSPEND',
        targetType: 'USER',
        targetId: userId,
        details: { reason, duration }
      })
      
      return { user, sanction }
    })
    
    // 4. 알림 전송 (트랜잭션 외부 - 실패해도 롤백 안 함)
    try {
      await sendSuspensionNotification(userId, reason, duration)
    } catch (error) {
      console.error('알림 전송 실패 (무시):', error)
    }
    
    return NextResponse.json({
      success: true,
      message: '사용자가 정지되었습니다',
      data: result.user
    })
    
  } catch (error) {
    console.error('[ADM-USR-021] 사용자 정지 실패:', error)
    
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
  }
}
```

---

### ADM-USR-022: 이미 정지된 사용자 🟡

**상황**: 이미 정지된 사용자를 다시 정지 시도

**빈도**: 높음 (UI 상태 불일치)

**해결 방법**:

```javascript
// API: 현재 상태 확인 후 처리
export async function POST(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_EDIT)
  if (auth instanceof NextResponse) return auth
  
  const { id: userId } = await params
  
  try {
    // 현재 상태 확인
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, suspendedUntil: true }
    })
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    // 이미 정지된 경우
    if (currentUser.status === 'SUSPENDED') {
      return NextResponse.json(
        { 
          success: false, 
          error: '이미 정지된 사용자입니다',
          code: 'ADM-USR-022',
          data: {
            status: currentUser.status,
            suspendedUntil: currentUser.suspendedUntil
          }
        },
        { status: 409 } // Conflict
      )
    }
    
    // ... 정지 로직
  } catch (error) {
    console.error('[ADM-USR-022]:', error)
    throw error
  }
}
```

```javascript
// 클라이언트: 상태 확인 및 안내
async function handleSuspend(userId) {
  try {
    const res = await fetch(`/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, duration })
    })
    
    const data = await res.json()
    
    if (!data.success) {
      if (res.status === 409) {
        // 이미 정지됨
        toast.info(data.error)
        
        // 현재 상태로 UI 업데이트
        if (data.data) {
          updateUserState(userId, data.data)
        }
        
        // 사용자 정보 다시 가져오기
        await fetchUser(userId)
        return
      }
      throw new Error(data.error)
    }
    
    toast.success('사용자가 정지되었습니다')
    await fetchUsers() // 목록 갱신
    
  } catch (error) {
    console.error('[ADM-USR-022]:', error)
    toast.error(error.message)
  }
}
```

---

### ADM-USR-026: 마지막 관리자 삭제 시도 🔴

**상황**: 시스템의 유일한 SUPER_ADMIN 삭제 시도

**심각도**: Critical (시스템 복구 불가능)

**해결 방법**:

```javascript
// API: 마지막 관리자 체크
export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_DELETE)
  if (auth instanceof NextResponse) return auth
  
  const { id: userId } = await params
  
  try {
    // 대상 사용자가 관리자인지 확인
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { adminRole: true }
    })
    
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    // SUPER_ADMIN인 경우 추가 체크
    if (targetUser.adminRole?.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.adminRole.count({
        where: { 
          role: 'SUPER_ADMIN',
          expiresAt: null // 또는 만료되지 않은 것
        }
      })
      
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { 
            success: false, 
            error: '마지막 최고 관리자는 삭제할 수 없습니다. 다른 관리자를 먼저 추가해주세요.',
            code: 'ADM-USR-026'
          },
          { status: 400 }
        )
      }
    }
    
    // Soft delete
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        status: 'DELETED',
        deletedAt: new Date(),
        deletedBy: auth.adminRole.userId
      }
    })
    
    await logAdminAction({
      adminId: auth.adminRole.userId,
      action: 'USER_DELETE',
      targetType: 'USER',
      targetId: userId,
      details: { email: targetUser.email }
    })
    
    return NextResponse.json({
      success: true,
      message: '사용자가 삭제되었습니다'
    })
    
  } catch (error) {
    console.error('[ADM-USR-026] 사용자 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: '사용자 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
```

**복구 스크립트**:

```bash
# 긴급 SUPER_ADMIN 생성
node scripts/create-test-admin.js \
  --email emergency@coup.com \
  --password secure_password \
  --role SUPER_ADMIN
```

---

### ADM-USR-027: 외래 키 제약 위반 🟠

**상황**: 연관 데이터가 있는 사용자 삭제 시도

**원인**:
- 스터디 소유자
- 활성 멤버십
- 메시지 작성자

**해결 방법**:

```javascript
// API: Soft delete로 처리
export async function DELETE(request, { params }) {
  // ... 권한 체크
  
  try {
    // 연관 데이터 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            ownedStudies: true,
            studyMembers: { where: { status: 'ACTIVE' } },
            messages: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    // 활성 스터디 소유자인 경우
    if (user._count.ownedStudies > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `${user._count.ownedStudies}개의 스터디를 소유하고 있습니다. 먼저 스터디를 이전하거나 종료해주세요.`,
          code: 'ADM-USR-027',
          data: {
            ownedStudies: user._count.ownedStudies
          }
        },
        { status: 400 }
      )
    }
    
    // Soft delete (외래 키 제약 없음)
    const deleted = await prisma.$transaction(async (tx) => {
      // 1. 사용자 상태 변경
      const deletedUser = await tx.user.update({
        where: { id: userId },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
          deletedBy: auth.adminRole.userId,
          // 개인정보 익명화
          name: `삭제된 사용자`,
          email: `deleted_${userId}@coup.local`,
          avatar: null
        }
      })
      
      // 2. 활성 멤버십 종료
      await tx.studyMember.updateMany({
        where: { 
          userId: userId,
          status: 'ACTIVE'
        },
        data: {
          status: 'LEFT',
          leftAt: new Date()
        }
      })
      
      // 3. 세션 무효화
      await tx.session.deleteMany({
        where: { userId: userId }
      })
      
      return deletedUser
    })
    
    return NextResponse.json({
      success: true,
      message: '사용자가 삭제되었습니다'
    })
    
  } catch (error) {
    console.error('[ADM-USR-027] 외래 키 제약:', error)
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          success: false, 
          error: '연관된 데이터가 있어 삭제할 수 없습니다',
          code: 'ADM-USR-027'
        },
        { status: 400 }
      )
    }
    
    throw error
  }
}
```

---

## 성능 최적화

### ADM-USR-015: 대량 사용자 조회 타임아웃 🟠

**상황**: 사용자 수가 많을 때 목록 조회 느림

**해결 방법**:

```javascript
// 1. 인덱스 추가
// schema.prisma
model User {
  // ...
  
  @@index([status, createdAt])
  @@index([email])
  @@index([provider, status])
}
```

```javascript
// 2. 페이지네이션 강제
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  
  // 최대 100개로 제한
  const limit = Math.min(
    parseInt(searchParams.get('limit') || '20'),
    100
  )
  
  // ...
}
```

```javascript
// 3. Select 최적화 (필요한 필드만)
const users = await prisma.user.findMany({
  where,
  skip,
  take: limit,
  select: {
    id: true,
    email: true,
    name: true,
    avatar: true,
    status: true,
    provider: true,
    createdAt: true,
    lastLoginAt: true,
    // _count만 가져오기
    _count: {
      select: {
        ownedStudies: true,
        studyMembers: true
      }
    }
  }
})
```

```javascript
// 4. 캐시 사용 (통계)
const cacheKey = `admin:users:stats`
let stats = await redis.get(cacheKey)

if (!stats) {
  stats = await calculateUserStats()
  await redis.setex(cacheKey, 300, JSON.stringify(stats)) // 5분
}
```

---

## 디버깅 가이드

### 사용자 정보 확인

```bash
# 스크립트로 사용자 상태 확인
node scripts/check-user-status.js --email user@example.com
```

```javascript
// scripts/check-user-status.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUserStatus(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      adminRole: true,
      _count: {
        select: {
          ownedStudies: true,
          studyMembers: true,
          sanctions: { where: { isActive: true } }
        }
      }
    }
  })
  
  console.log('User Status:')
  console.log('- ID:', user.id)
  console.log('- Status:', user.status)
  console.log('- Admin Role:', user.adminRole?.role || 'None')
  console.log('- Owned Studies:', user._count.ownedStudies)
  console.log('- Active Sanctions:', user._count.sanctions)
  
  if (user.status === 'SUSPENDED') {
    console.log('- Suspended Until:', user.suspendedUntil)
    console.log('- Reason:', user.suspendReason)
  }
}
```

### 로그 확인

```javascript
// 특정 사용자에 대한 관리자 액션 로그
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

console.log('Admin Actions:', logs)
```

---

## 요약

### 주요 예외 코드

| 코드 | 설명 | 심각도 | 빈도 |
|------|------|--------|------|
| ADM-USR-001 | 관리자 권한 없음 | 🔴 | 높음 |
| ADM-USR-002 | 세션 만료 | 🟠 | 높음 |
| ADM-USR-003 | 자기 자신 수정 시도 | 🟡 | 중간 |
| ADM-USR-013 | 존재하지 않는 사용자 | 🟡 | 높음 |
| ADM-USR-022 | 이미 정지된 사용자 | 🟡 | 높음 |
| ADM-USR-026 | 마지막 관리자 삭제 시도 | 🔴 | 낮음 |
| ADM-USR-027 | 외래 키 제약 위반 | 🟠 | 중간 |

### 체크리스트

- [ ] 모든 API에 권한 검증 추가
- [ ] 자가 수정 방지 로직 구현
- [ ] 관리자 계층 권한 확인
- [ ] 트랜잭션으로 안전한 상태 변경
- [ ] 마지막 관리자 삭제 방지
- [ ] Soft delete로 외래 키 문제 해결
- [ ] 페이지네이션 및 인덱스 최적화
- [ ] 모든 액션 로깅
- [ ] 에러 코드 명확하게 반환

---

**다음 문서**: [스터디 관리 예외 처리](./02-study-management.md)
