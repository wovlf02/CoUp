# 관리자 - 스터디 관리 예외 처리

**작성일**: 2025-11-30  
**최종 업데이트**: 현재 구현 기준  
**카테고리**: 관리자 > 스터디 관리  
**우선순위**: 🔴 최고  

---

## 📋 목차

1. [개요](#개요)
2. [권한 및 인증 예외](#권한-및-인증-예외)
3. [스터디 조회 예외](#스터디-조회-예외)
4. [스터디 상태 변경 예외](#스터디-상태-변경-예외)
5. [디버깅 가이드](#디버깅-가이드)

---

## 개요

### 현재 구현된 API 엔드포인트

```
GET    /api/admin/studies                      # 스터디 목록
GET    /api/admin/studies/[studyId]            # 스터디 상세
POST   /api/admin/studies/[studyId]/hide       # 스터디 숨김
DELETE /api/admin/studies/[studyId]/hide       # 스터디 숨김 해제
POST   /api/admin/studies/[studyId]/close      # 스터디 강제 종료
DELETE /api/admin/studies/[studyId]/close      # 스터디 재개
DELETE /api/admin/studies/[studyId]/delete     # 스터디 삭제
```

### 권한 시스템

```javascript
// lib/admin/permissions.js
PERMISSIONS = {
  STUDY_VIEW: 'study:view',          // 스터디 조회
  STUDY_HIDE: 'study:hide',          // 스터디 숨김
  STUDY_CLOSE: 'study:close',        // 스터디 종료
  STUDY_DELETE: 'study:delete',      // 스터디 삭제
  STUDY_RECOMMEND: 'study:recommend', // 추천 설정
  STUDY_UPDATE: 'study:update',      // 스터디 수정
}
```

### 스터디 상태

```javascript
// Prisma Schema - Study 모델
{
  isPublic: Boolean     // true: 공개, false: 비공개
  isRecruiting: Boolean // true: 모집중, false: 모집마감
}

// 상태 조합
{
  isPublic: true,  isRecruiting: true   // 정상 (공개 + 모집중)
  isPublic: true,  isRecruiting: false  // 모집마감
  isPublic: false, isRecruiting: false  // 숨김/종료
}
```

---

## 권한 및 인증 예외

### ADM-STU-001: 권한 부족 (조회) 🟠

**발생 위치**: `api/admin/studies/route.js - GET`

**현재 구현**:

```javascript
// 목록 조회는 USER_VIEW 권한 사용 (STUDY_VIEW 아님!)
const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
```

**문제점**: ⚠️ **잘못된 권한 사용**

- 스터디 조회인데 `USER_VIEW` 권한 체크
- `STUDY_VIEW` 권한이 존재하지만 사용되지 않음

**증상**:
```json
{
  "success": false,
  "error": "해당 작업을 수행할 권한이 없습니다.",
  "status": 403
}
```

**개선 제안**:

```javascript
// ❌ 현재 (잘못됨)
const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)

// ✅ 개선 후
const auth = await requireAdmin(request, PERMISSIONS.STUDY_VIEW)
```

---

### ADM-STU-002: 권한 부족 (숨김/종료) 🟠

**발생 위치**: 
- `api/admin/studies/[studyId]/hide/route.js - POST/DELETE`
- `api/admin/studies/[studyId]/close/route.js - POST/DELETE`

**현재 구현**:

```javascript
// 숨김 처리에 USER_SUSPEND 권한 사용
const auth = await requireAdmin(request, PERMISSIONS.USER_SUSPEND)

// 종료에 USER_DELETE 권한 사용
const auth = await requireAdmin(request, PERMISSIONS.USER_DELETE)
```

**문제점**: ⚠️ **잘못된 권한 사용**

- 스터디 관련 작업인데 USER 권한 체크
- `STUDY_HIDE`, `STUDY_CLOSE` 권한 미사용

**개선 제안**:

```javascript
// 숨김 처리
const auth = await requireAdmin(request, PERMISSIONS.STUDY_HIDE)

// 종료 처리
const auth = await requireAdmin(request, PERMISSIONS.STUDY_CLOSE)

// 삭제 처리
const auth = await requireAdmin(request, PERMISSIONS.STUDY_DELETE)
```

---

## 스터디 조회 예외

### ADM-STU-011: 스터디 목록 조회 실패 🟠

**발생 위치**: `api/admin/studies/route.js - GET`

**현재 구현**:

```javascript
export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) return auth

  try {
    // 페이지네이션 (최대 100개 제한)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    // 스터디 조회
    const [studies, total] = await Promise.all([
      prisma.study.findMany({ where, skip, take: limit }),
      prisma.study.count({ where })
    ])
    
    // 각 스터디마다 lastMessage 조회 (N+1 문제!)
    const transformedStudies = await Promise.all(
      filteredStudies.map(async (study) => {
        const lastMessage = await prisma.message.findFirst({
          where: { studyId: study.id },
          orderBy: { createdAt: 'desc' }
        })
        // ...
      })
    )
    
    return NextResponse.json({ success: true, data: {...} })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: '스터디 목록 조회에 실패했습니다',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
```

**문제점**:

1. ❌ **N+1 쿼리 문제**: 스터디 20개 = 21번 쿼리
2. ❌ **타임아웃 없음**: 대량 데이터 시 느림
3. ⚠️ **잘못된 필터 처리**: 멤버 수 필터가 후처리 (비효율)

**개선 제안**:

```javascript
// 1. N+1 문제 해결
const studies = await prisma.study.findMany({
  where,
  include: {
    messages: {
      take: 1,
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    }
  }
})

// 또는 별도 쿼리로 일괄 조회
const studyIds = studies.map(s => s.id)
const lastMessages = await prisma.message.groupBy({
  by: ['studyId'],
  where: { studyId: { in: studyIds } },
  _max: { createdAt: true }
})

// 2. 타임아웃 추가
const QUERY_TIMEOUT = 10000

const result = await Promise.race([
  Promise.all([...]),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT)
  )
])

// 3. 에러 처리
if (error.message === 'Query timeout') {
  return NextResponse.json(
    { 
      success: false, 
      error: '조회 시간이 초과되었습니다. 필터를 추가해주세요.',
      code: 'ADM-STU-011'
    },
    { status: 504 }
  )
}
```

---

### ADM-STU-012: 존재하지 않는 스터디 🟡

**발생 위치**: `api/admin/studies/[studyId]/route.js - GET`

**현재 구현**:

```javascript
const study = await prisma.study.findUnique({
  where: { id: studyId }
})

if (!study) {
  return NextResponse.json(
    { success: false, error: '스터디를 찾을 수 없습니다' },
    { status: 404 }
  )
}
```

**증상**:
```json
{
  "success": false,
  "error": "스터디를 찾을 수 없습니다",
  "status": 404
}
```

**원인**:
- 잘못된 스터디 ID
- 스터디가 이미 삭제됨
- 다른 관리자가 동시에 삭제

**클라이언트 처리**:

```javascript
async function fetchStudy(studyId) {
  try {
    const res = await fetch(`/api/admin/studies/${studyId}`)
    const data = await res.json()
    
    if (!data.success) {
      if (res.status === 404) {
        toast.error('스터디를 찾을 수 없습니다')
        router.push('/admin/studies') // 목록으로 이동
        return null
      }
      throw new Error(data.error)
    }
    
    return data.data
  } catch (error) {
    console.error('[ADM-STU-012]:', error)
    throw error
  }
}
```

---

## 스터디 상태 변경 예외

### ADM-STU-021: 스터디 숨김 처리 🟠

**발생 위치**: `api/admin/studies/[studyId]/hide/route.js - POST`

**현재 구현**:

```javascript
export async function POST(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_SUSPEND)
  if (auth instanceof NextResponse) return auth

  try {
    const { studyId } = params
    const body = await request.json()

    // 유효성 검사
    if (!body.reason || body.reason.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: '숨김 사유는 최소 10자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    // 스터디 존재 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        owner: true,
        members: { where: { status: 'ACTIVE' } }
      }
    })

    if (!study) {
      return NextResponse.json(
        { success: false, error: '스터디를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 이미 숨김 처리된 스터디인지 확인
    if (!study.isPublic && study.isRecruiting === false) {
      return NextResponse.json(
        { success: false, error: '이미 숨김 처리된 스터디입니다' },
        { status: 400 }
      )
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      const updatedStudy = await tx.study.update({
        where: { id: studyId },
        data: {
          isPublic: false,
          isRecruiting: false,
        },
      })

      await tx.adminLog.create({
        data: {
          adminId: adminRole.userId,
          action: 'STUDY_HIDE',
          targetType: 'Study',
          targetId: studyId,
          reason: body.reason,
          metadata: {...}
        },
      })

      return updatedStudy
    })

    return NextResponse.json({
      success: true,
      message: '스터디가 숨김 처리되었습니다',
      data: { study: result }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '스터디 숨김 처리에 실패했습니다' },
      { status: 500 }
    )
  }
}
```

**장점**: ✅
- 유효성 검사 완벽
- 중복 처리 방지
- 트랜잭션 사용

**문제점**: ⚠️
- 권한 체크가 `USER_SUSPEND` (잘못됨)
- Prisma P2025 에러 처리 없음

**개선 제안**:

```javascript
export async function POST(request, { params }) {
  // ✅ 올바른 권한 사용
  const auth = await requireAdmin(request, PERMISSIONS.STUDY_HIDE)
  if (auth instanceof NextResponse) return auth

  try {
    const { studyId } = params
    const body = await request.json()

    // 유효성 검사
    if (!body.reason || body.reason.trim().length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: '숨김 사유는 최소 10자 이상이어야 합니다',
          code: 'ADM-STU-021-INVALID-REASON'
        },
        { status: 400 }
      )
    }

    // 스터디 존재 및 상태 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        owner: true,
        members: { where: { status: 'ACTIVE' }, include: { user: true } },
        _count: {
          select: {
            messages: true,
            members: { where: { status: 'ACTIVE' } }
          }
        }
      }
    })

    if (!study) {
      return NextResponse.json(
        { success: false, error: '스터디를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 이미 숨김 처리 확인
    if (!study.isPublic && !study.isRecruiting) {
      return NextResponse.json(
        { 
          success: false, 
          error: '이미 숨김 처리된 스터디입니다',
          code: 'ADM-STU-021-ALREADY-HIDDEN',
          data: {
            isPublic: study.isPublic,
            isRecruiting: study.isRecruiting
          }
        },
        { status: 409 } // Conflict
      )
    }

    // 트랜잭션으로 안전하게 처리
    const result = await prisma.$transaction(async (tx) => {
      // 스터디 상태 업데이트
      const updatedStudy = await tx.study.update({
        where: { id: studyId },
        data: {
          isPublic: false,
          isRecruiting: false,
        },
      })

      // 관리자 로그 기록
      await tx.adminLog.create({
        data: {
          adminId: auth.adminRole.userId,
          action: 'STUDY_HIDE',
          targetType: 'Study',
          targetId: studyId,
          reason: body.reason,
          metadata: {
            studyName: study.name,
            ownerId: study.ownerId,
            ownerEmail: study.owner.email,
            memberCount: study._count.members,
            messageCount: study._count.messages,
            notifyOwner: body.notifyOwner !== false,
            notifyMembers: body.notifyMembers === true,
          },
        },
      })

      return updatedStudy
    })

    // 알림 발송 (트랜잭션 외부)
    let notificationsSent = 0

    if (body.notifyOwner !== false) {
      // TODO: 알림 시스템 구현
      notificationsSent++
    }

    if (body.notifyMembers === true) {
      notificationsSent += study.members.length
    }

    return NextResponse.json({
      success: true,
      message: '스터디가 숨김 처리되었습니다',
      data: {
        study: result,
        notificationsSent,
        affectedUsers: {
          owner: study.owner.email,
          members: study.members.length
        }
      },
    })
  } catch (error) {
    console.error('스터디 숨김 처리 실패:', error)
    
    // Prisma 에러 코드 처리
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false, 
          error: '스터디를 찾을 수 없습니다',
          code: 'ADM-STU-021-NOT-FOUND'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: '스터디 숨김 처리에 실패했습니다',
        code: 'ADM-STU-021-UNKNOWN'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

---

### ADM-STU-022: 스터디 삭제 🔴

**발생 위치**: `api/admin/studies/[studyId]/delete/route.js - DELETE`

**현재 구현**:

```javascript
export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_DELETE)
  if (auth instanceof NextResponse) return auth

  try {
    const { studyId } = params
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason')

    // 유효성 검사
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: '삭제 사유는 최소 10자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    // 스터디 존재 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        owner: true,
        members: { where: { status: 'ACTIVE' } },
        _count: {
          select: {
            messages: true,
            files: true,
            notices: true,
            events: true,
            tasks: true,
          },
        },
      },
    })

    if (!study) {
      return NextResponse.json(
        { success: false, error: '스터디를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 스냅샷 저장
    const studySnapshot = {
      id: study.id,
      name: study.name,
      ownerId: study.ownerId,
      ownerEmail: study.owner.email,
      memberCount: study.members.length,
      stats: study._count,
      createdAt: study.createdAt,
    }

    // 트랜잭션으로 처리
    await prisma.$transaction(async (tx) => {
      // 로그 기록 (삭제 전에)
      await tx.adminLog.create({
        data: {
          adminId: adminRole.userId,
          action: 'STUDY_DELETE',
          targetType: 'Study',
          targetId: studyId,
          reason,
          metadata: {
            ...studySnapshot,
            deletedBy: adminRole.userId,
            deletedAt: new Date(),
          },
        },
      })

      // 스터디 삭제 (CASCADE로 관련 데이터 자동 삭제)
      await tx.study.delete({
        where: { id: studyId },
      })
    })

    return NextResponse.json({
      success: true,
      message: '스터디가 삭제되었습니다',
      data: { deletedStudy: studySnapshot },
    })
  } catch (error) {
    console.error('스터디 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: '스터디 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
```

**장점**: ✅
- 삭제 전 스냅샷 저장
- 트랜잭션 사용
- CASCADE 삭제

**문제점**: ⚠️
- 권한이 `USER_DELETE` (잘못됨)
- 복구 불가능한 하드 삭제
- 파일 삭제 처리 없음 (데이터만 삭제)

**개선 제안**:

```javascript
export async function DELETE(request, { params }) {
  // ✅ 올바른 권한
  const auth = await requireAdmin(request, PERMISSIONS.STUDY_DELETE)
  if (auth instanceof NextResponse) return auth

  // ✅ SUPER_ADMIN만 삭제 가능하도록
  if (auth.adminRole.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { 
        success: false, 
        error: '스터디 삭제는 슈퍼 관리자만 가능합니다',
        code: 'ADM-STU-022-INSUFFICIENT-ROLE'
      },
      { status: 403 }
    )
  }

  try {
    const { studyId } = params
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason')
    const hardDelete = searchParams.get('hardDelete') === 'true'

    // 유효성 검사
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: '삭제 사유는 최소 10자 이상이어야 합니다',
          code: 'ADM-STU-022-INVALID-REASON'
        },
        { status: 400 }
      )
    }

    // 스터디 존재 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        owner: true,
        members: { where: { status: 'ACTIVE' } },
        files: true, // 파일 목록도 가져오기
        _count: {
          select: {
            messages: true,
            files: true,
            notices: true,
            events: true,
            tasks: true,
          },
        },
      },
    })

    if (!study) {
      return NextResponse.json(
        { success: false, error: '스터디를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 스냅샷 저장
    const studySnapshot = {
      id: study.id,
      name: study.name,
      ownerId: study.ownerId,
      ownerEmail: study.owner.email,
      memberCount: study.members.length,
      stats: study._count,
      files: study.files.map(f => ({ id: f.id, path: f.path, name: f.name })),
      createdAt: study.createdAt,
    }

    // 트랜잭션으로 처리
    await prisma.$transaction(async (tx) => {
      // 로그 기록 (삭제 전에)
      await tx.adminLog.create({
        data: {
          adminId: auth.adminRole.userId,
          action: hardDelete ? 'STUDY_HARD_DELETE' : 'STUDY_SOFT_DELETE',
          targetType: 'Study',
          targetId: studyId,
          reason,
          metadata: {
            ...studySnapshot,
            deletedBy: auth.adminRole.userId,
            deletedAt: new Date(),
            hardDelete,
          },
        },
      })

      if (hardDelete) {
        // 하드 삭제 (복구 불가)
        await tx.study.delete({
          where: { id: studyId },
        })
      } else {
        // 소프트 삭제 (복구 가능) - 추천
        await tx.study.update({
          where: { id: studyId },
          data: {
            isPublic: false,
            isRecruiting: false,
            name: `[삭제됨] ${study.name}`,
            description: `삭제 사유: ${reason}\\n원본: ${study.description}`,
          }
        })
      }
    })

    // 파일 삭제 처리 (트랜잭션 외부)
    if (hardDelete && study.files.length > 0) {
      // TODO: 실제 파일 시스템에서 삭제
      // await deleteFiles(study.files.map(f => f.path))
    }

    return NextResponse.json({
      success: true,
      message: hardDelete ? '스터디가 완전히 삭제되었습니다' : '스터디가 삭제되었습니다 (복구 가능)',
      data: { 
        deletedStudy: studySnapshot,
        hardDelete,
        filesDeleted: hardDelete ? study.files.length : 0
      },
    })
  } catch (error) {
    console.error('스터디 삭제 실패:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: '스터디를 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: '스터디 삭제에 실패했습니다',
        code: 'ADM-STU-022-UNKNOWN'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

---

### ADM-STU-023: 스터디 종료와 숨김의 차이 🟡

**현재 문제**: 종료와 숨김이 동일한 동작

**현재 구현**:

```javascript
// hide/route.js
data: {
  isPublic: false,
  isRecruiting: false,
}

// close/route.js
data: {
  isPublic: false,
  isRecruiting: false,
}

// 동일한 동작! 차이 없음
```

**개선 제안**: 별도 필드 추가

```prisma
// Prisma Schema 추가
model Study {
  // ...existing fields...
  
  // 상태 필드 추가
  status StudyStatus @default(ACTIVE)
  
  hiddenAt DateTime?
  hiddenBy String? // Admin ID
  hiddenReason String?
  
  closedAt DateTime?
  closedBy String? // Admin ID
  closedReason String?
}

enum StudyStatus {
  ACTIVE   // 정상
  HIDDEN   // 숨김 (관리자)
  CLOSED   // 종료 (관리자)
  DELETED  // 삭제됨
}
```

---

## 디버깅 가이드

### 스터디 상태 확인

```javascript
// scripts/check-study-status.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkStudy(studyId) {
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    include: {
      owner: { select: { email: true } },
      _count: {
        select: {
          members: { where: { status: 'ACTIVE' } },
          messages: true,
          files: true
        }
      }
    }
  })
  
  if (!study) {
    console.log('❌ 스터디를 찾을 수 없습니다')
    return
  }
  
  console.log('📚 스터디 정보:')
  console.log('- ID:', study.id)
  console.log('- 이름:', study.name)
  console.log('- 소유자:', study.owner.email)
  console.log('- 공개:', study.isPublic ? '✅ 공개' : '❌ 비공개')
  console.log('- 모집:', study.isRecruiting ? '✅ 모집중' : '❌ 마감')
  console.log('- 멤버 수:', study._count.members)
  console.log('- 메시지 수:', study._count.messages)
  console.log('- 생성일:', study.createdAt)
}

const studyId = process.argv[2]
checkStudy(studyId).then(() => process.exit(0))
```

**사용법**:
```bash
node coup/scripts/check-study-status.js clu1abc2def
```

### 관리자 액션 로그 조회

```javascript
// 특정 스터디에 대한 관리자 액션
const logs = await prisma.adminLog.findMany({
  where: {
    targetType: 'Study',
    targetId: studyId
  },
  include: {
    admin: {
      select: { name: true, email: true }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 20
})

logs.forEach(log => {
  console.log(`${log.createdAt} - ${log.admin.email}: ${log.action}`)
  if (log.reason) console.log(`  사유: ${log.reason}`)
})
```

---

## 요약

### 현재 구현 상태

| 기능 | 상태 | 권한 | 비고 |
|------|------|------|------|
| 목록 조회 | ⚠️ 부분 | ❌ USER_VIEW (잘못됨) | N+1 문제, 권한 수정 필요 |
| 상세 조회 | ✅ 완료 | ❌ USER_VIEW (잘못됨) | 권한만 수정 필요 |
| 숨김 처리 | ✅ 양호 | ❌ USER_SUSPEND (잘못됨) | 권한 수정 필요 |
| 숨김 해제 | ✅ 양호 | ❌ USER_SUSPEND (잘못됨) | 권한 수정 필요 |
| 강제 종료 | ⚠️ 부분 | ❌ USER_DELETE (잘못됨) | 숨김과 동일 동작 |
| 종료 해제 | ⚠️ 부분 | ❌ USER_DELETE (잘못됨) | 숨김 해제와 동일 |
| 삭제 | ⚠️ 부분 | ❌ USER_DELETE (잘못됨) | 하드 삭제만 가능 |

### 주요 문제점

#### 1. 권한 체계 혼란 🔴

**현재**: USER 권한으로 STUDY 작업 수행
```javascript
requireAdmin(request, PERMISSIONS.USER_VIEW)     // 스터디 조회
requireAdmin(request, PERMISSIONS.USER_SUSPEND)  // 스터디 숨김
requireAdmin(request, PERMISSIONS.USER_DELETE)   // 스터디 삭제
```

**개선**: 적절한 STUDY 권한 사용
```javascript
requireAdmin(request, PERMISSIONS.STUDY_VIEW)    // 스터디 조회
requireAdmin(request, PERMISSIONS.STUDY_HIDE)    // 스터디 숨김
requireAdmin(request, PERMISSIONS.STUDY_DELETE)  // 스터디 삭제
```

#### 2. N+1 쿼리 문제 🟠

**목록 조회 시 각 스터디마다 lastMessage 조회**:
- 스터디 20개 = 21번 DB 쿼리
- 스터디 100개 = 101번 DB 쿼리

**해결 방법**: include 또는 groupBy 사용

#### 3. 상태 구분 불명확 🟡

**현재**: 숨김 = 종료 = `{isPublic: false, isRecruiting: false}`

**개선**: 별도 status 필드 추가
```
ACTIVE → HIDDEN → CLOSED → DELETED
```

#### 4. 하드 삭제만 가능 🟠

**현재**: 복구 불가능한 DELETE
**개선**: 소프트 삭제 옵션 추가

---

### 개선 우선순위

| 순위 | 항목 | 난이도 | 예상 시간 |
|------|------|--------|----------|
| 🔴 1 | 권한 체계 수정 | 하 | 30분 |
| 🟠 2 | N+1 쿼리 해결 | 중 | 1시간 |
| 🟠 3 | 소프트 삭제 추가 | 중 | 1시간 |
| 🟡 4 | 상태 필드 추가 | 중상 | 2시간 |

**총 예상 시간**: 4.5시간

---

**다음 문서**: [03-report-management.md](./03-report-management.md)

