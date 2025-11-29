# 스터디 CRUD 예외 처리

**작성일**: 2025-11-29  
**카테고리**: 스터디 관리  
**우선순위**: 🔥 높음

---

## 📋 목차

- [개요](#개요)
- [스터디 생성 실패](#스터디-생성-실패)
- [스터디 조회 실패](#스터디-조회-실패)
- [스터디 수정 실패](#스터디-수정-실패)
- [스터디 삭제 실패](#스터디-삭제-실패)
- [유효성 검사 오류](#유효성-검사-오류)
- [목록 조회 실패](#목록-조회-실패)
- [디버깅 가이드](#디버깅-가이드)

---

## 개요

스터디 CRUD 작업 시 발생할 수 있는 모든 예외 상황과 해결 방법을 다룹니다.

### 관련 파일

- **API**: `src/app/api/studies/route.js`
- **API**: `src/app/api/studies/[id]/route.js`
- **페이지**: `src/app/studies/page.jsx`
- **페이지**: `src/app/studies/create/page.jsx`
- **Hooks**: `src/lib/hooks/useApi.js`

---

## 스터디 생성 실패

### 문제 1: 필수 필드 누락

#### ❌ 나쁜 예

```javascript
// src/app/api/studies/route.js
export async function POST(request) {
  const body = await request.json()
  
  // 필수 필드 검증 없이 바로 생성
  const study = await prisma.study.create({
    data: body
  })
  
  return NextResponse.json(study)
}
```

**문제점**:
- 필수 필드 검증 없음
- Prisma 에러가 클라이언트에 노출됨
- 의미 없는 에러 메시지

#### ✅ 좋은 예

```javascript
// src/app/api/studies/route.js
export async function POST(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const {
      name,
      emoji,
      description,
      category,
      subCategory,
      maxMembers,
      isPublic,
      autoApprove,
      tags
    } = body

    // 1. 필수 필드 검증
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: "필수 필드를 모두 입력해주세요" },
        { status: 400 }
      )
    }

    // 2. 필드 길이 검증
    if (name.trim().length < 2 || name.trim().length > 50) {
      return NextResponse.json(
        { error: "스터디 이름은 2자 이상 50자 이하여야 합니다" },
        { status: 400 }
      )
    }

    if (description.trim().length < 10 || description.trim().length > 500) {
      return NextResponse.json(
        { error: "스터디 설명은 10자 이상 500자 이하여야 합니다" },
        { status: 400 }
      )
    }

    // 3. maxMembers 검증
    if (maxMembers && (maxMembers < 2 || maxMembers > 100)) {
      return NextResponse.json(
        { error: "최대 인원은 2명에서 100명 사이여야 합니다" },
        { status: 400 }
      )
    }

    // 4. 카테고리 검증
    const validCategories = [
      '프로그래밍', '어학', '자격증', '취미', '독서', '재테크', '기타'
    ]
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "유효하지 않은 카테고리입니다" },
        { status: 400 }
      )
    }

    // 5. 스터디 생성
    const study = await prisma.study.create({
      data: {
        ownerId: session.user.id,
        name: name.trim(),
        emoji: emoji || '📚',
        description: description.trim(),
        category,
        subCategory,
        maxMembers: maxMembers || 20,
        isPublic: isPublic !== false,
        autoApprove: autoApprove !== false,
        isRecruiting: true,
        tags: tags || []
      }
    })

    // 6. 생성자를 OWNER로 자동 추가
    await prisma.studyMember.create({
      data: {
        studyId: study.id,
        userId: session.user.id,
        role: 'OWNER',
        status: 'ACTIVE',
        approvedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "스터디가 생성되었습니다",
      data: study
    }, { status: 201 })

  } catch (error) {
    console.error('Create study error:', error)
    
    // Prisma 고유 제약 조건 위반
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "이미 존재하는 스터디 이름입니다" },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "스터디 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ 단계별 필드 검증
- ✅ 명확한 에러 메시지
- ✅ 적절한 HTTP 상태 코드
- ✅ Prisma 에러 핸들링
- ✅ 트랜잭션 필요 시 고려

---

### 문제 2: OWNER 멤버 생성 실패

#### ❌ 나쁜 예

```javascript
// 스터디만 생성하고 멤버 추가 누락
const study = await prisma.study.create({ data })
return NextResponse.json(study)
```

**문제점**:
- 스터디는 생성되었지만 OWNER 멤버가 없음
- 이후 권한 체크에서 오류 발생
- 데이터 일관성 깨짐

#### ✅ 좋은 예 (트랜잭션 사용)

```javascript
export async function POST(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    // ... 검증 로직 ...

    // 트랜잭션으로 원자적 생성
    const result = await prisma.$transaction(async (tx) => {
      // 1. 스터디 생성
      const study = await tx.study.create({
        data: {
          ownerId: session.user.id,
          name,
          emoji: emoji || '📚',
          description,
          category,
          subCategory,
          maxMembers: maxMembers || 20,
          isPublic: isPublic !== false,
          autoApprove: autoApprove !== false,
          isRecruiting: true,
          tags: tags || []
        }
      })

      // 2. OWNER 멤버 추가
      const ownerMember = await tx.studyMember.create({
        data: {
          studyId: study.id,
          userId: session.user.id,
          role: 'OWNER',
          status: 'ACTIVE',
          approvedAt: new Date()
        }
      })

      // 3. 환영 공지 생성 (선택)
      await tx.notice.create({
        data: {
          studyId: study.id,
          authorId: session.user.id,
          title: '스터디에 오신 것을 환영합니다!',
          content: `${study.name} 스터디가 생성되었습니다.`,
          isPinned: true
        }
      })

      return { study, ownerMember }
    })

    return NextResponse.json({
      success: true,
      message: "스터디가 생성되었습니다",
      data: result.study
    }, { status: 201 })

  } catch (error) {
    console.error('Create study error:', error)
    return NextResponse.json(
      { error: "스터디 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ 트랜잭션으로 원자성 보장
- ✅ 스터디와 멤버가 함께 생성되거나 함께 실패
- ✅ 데이터 일관성 유지

---

### 문제 3: 클라이언트 사이드 검증 누락

#### ❌ 나쁜 예

```javascript
// src/app/studies/create/page.jsx
function CreateStudyPage() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 검증 없이 바로 전송
    const response = await fetch('/api/studies', {
      method: 'POST',
      body: JSON.stringify(formData)
    })
  }
}
```

#### ✅ 좋은 예

```javascript
// src/app/studies/create/page.jsx
'use client'

import { useState } from 'react'
import { useCreateStudy } from '@/lib/hooks/useApi'
import { toast } from 'react-hot-toast'

function CreateStudyPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    maxMembers: 20,
    isPublic: true,
    autoApprove: true,
    tags: []
  })
  const [errors, setErrors] = useState({})

  const createMutation = useCreateStudy()

  // 클라이언트 사이드 검증
  const validateForm = () => {
    const newErrors = {}

    // 이름 검증
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = '스터디 이름은 2자 이상이어야 합니다'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = '스터디 이름은 50자 이하여야 합니다'
    }

    // 설명 검증
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = '스터디 설명은 10자 이상이어야 합니다'
    } else if (formData.description.trim().length > 500) {
      newErrors.description = '스터디 설명은 500자 이하여야 합니다'
    }

    // 카테고리 검증
    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요'
    }

    // 최대 인원 검증
    if (formData.maxMembers < 2 || formData.maxMembers > 100) {
      newErrors.maxMembers = '최대 인원은 2명에서 100명 사이여야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1. 클라이언트 검증
    if (!validateForm()) {
      toast.error('입력 내용을 확인해주세요')
      return
    }

    try {
      // 2. API 호출
      const result = await createMutation.mutateAsync({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim()
      })

      // 3. 성공
      toast.success('스터디가 생성되었습니다')
      router.push(`/studies/${result.data.id}`)

    } catch (error) {
      // 4. 에러 처리
      console.error('Create study error:', error)
      
      if (error.message.includes('필수')) {
        toast.error('필수 항목을 모두 입력해주세요')
      } else if (error.message.includes('이미 존재')) {
        toast.error('이미 존재하는 스터디 이름입니다')
      } else {
        toast.error('스터디 생성에 실패했습니다')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 이름 */}
      <div>
        <label>스터디 이름 *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          maxLength={50}
        />
        {errors.name && <p className="error">{errors.name}</p>}
      </div>

      {/* 설명 */}
      <div>
        <label>스터디 설명 *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          maxLength={500}
        />
        {errors.description && <p className="error">{errors.description}</p>}
        <small>{formData.description.length}/500</small>
      </div>

      {/* 카테고리 */}
      <div>
        <label>카테고리 *</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="">선택하세요</option>
          <option value="프로그래밍">💻 프로그래밍</option>
          <option value="어학">🌍 어학</option>
          <option value="자격증">📝 자격증</option>
          <option value="취미">🎸 취미</option>
          <option value="독서">📖 독서</option>
          <option value="재테크">💰 재테크</option>
        </select>
        {errors.category && <p className="error">{errors.category}</p>}
      </div>

      {/* 최대 인원 */}
      <div>
        <label>최대 인원</label>
        <input
          type="number"
          value={formData.maxMembers}
          onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
          min={2}
          max={100}
        />
        {errors.maxMembers && <p className="error">{errors.maxMembers}</p>}
      </div>

      {/* 제출 버튼 */}
      <button type="submit" disabled={createMutation.isLoading}>
        {createMutation.isLoading ? '생성 중...' : '스터디 생성'}
      </button>
    </form>
  )
}
```

**개선 사항**:
- ✅ 실시간 검증 피드백
- ✅ 명확한 에러 메시지
- ✅ 로딩 상태 표시
- ✅ 문자 수 카운터
- ✅ 적절한 입력 제한

---

## 스터디 조회 실패

### 문제 1: 스터디를 찾을 수 없음

#### ❌ 나쁜 예

```javascript
// src/app/api/studies/[id]/route.js
export async function GET(request, { params }) {
  const { id } = await params
  
  // 존재하지 않는 경우 처리 없음
  const study = await prisma.study.findUnique({ where: { id } })
  
  return NextResponse.json(study)
}
```

**문제점**:
- `null` 반환 시 클라이언트에서 오류
- 404 상태 코드 없음

#### ✅ 좋은 예

```javascript
// src/app/api/studies/[id]/route.js
export async function GET(request, { params }) {
  try {
    const { id } = await params

    // 1. 스터디 조회
    const study = await prisma.study.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            },
            notices: true,
            files: true
          }
        }
      }
    })

    // 2. 존재 여부 확인
    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 3. 세션 확인 (선택)
    const session = await requireAuth()
    const isAuthenticated = !(session instanceof NextResponse)

    let isMember = false
    let myMembership = null

    if (isAuthenticated) {
      myMembership = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId: id,
            userId: session.user.id
          }
        }
      })

      isMember = myMembership?.status === 'ACTIVE'
    }

    // 4. 비공개 스터디 접근 제한
    if (!study.isPublic && !isMember) {
      return NextResponse.json(
        { error: "비공개 스터디입니다" },
        { status: 403 }
      )
    }

    // 5. 응답 데이터 (멤버 여부에 따라 다르게)
    const responseData = {
      id: study.id,
      name: study.name,
      emoji: study.emoji,
      description: study.description,
      category: study.category,
      subCategory: study.subCategory,
      tags: study.tags,
      maxMembers: study.maxMembers,
      currentMembers: study._count.members,
      isPublic: study.isPublic,
      isRecruiting: study.isRecruiting,
      rating: study.rating,
      reviewCount: study.reviewCount,
      owner: study.owner,
      createdAt: study.createdAt,
      isMember,
      myRole: myMembership?.role || null,
      
      // 멤버만 볼 수 있는 정보
      ...(isMember && {
        inviteCode: study.inviteCode,
        autoApprove: study.autoApprove,
        counts: {
          notices: study._count.notices,
          files: study._count.files
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Get study detail error:', error)
    
    // Prisma 에러 처리
    if (error.code === 'P2023') {
      return NextResponse.json(
        { error: "잘못된 스터디 ID 형식입니다" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "스터디 정보를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ 404 처리
- ✅ 비공개 스터디 접근 제한
- ✅ 멤버 여부에 따른 정보 차등 제공
- ✅ Prisma 에러 핸들링

---

### 문제 2: 클라이언트에서 조회 실패 처리

#### ❌ 나쁜 예

```javascript
// src/app/studies/[studyId]/page.jsx
function StudyDetailPage({ params }) {
  const { data } = useStudy(params.studyId)
  
  // 로딩/에러 처리 없음
  return <div>{data.name}</div>
}
```

#### ✅ 좋은 예

```javascript
// src/app/studies/[studyId]/page.jsx
'use client'

import { useStudy } from '@/lib/hooks/useApi'
import { useRouter } from 'next/navigation'
import StudySkeleton from '@/components/studies/StudiesSkeleton'

function StudyDetailPage({ params }) {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useStudy(params.studyId)

  // 1. 로딩 상태
  if (isLoading) {
    return <StudySkeleton />
  }

  // 2. 에러 상태
  if (error) {
    const is404 = error.message.includes('찾을 수 없')
    const is403 = error.message.includes('비공개')

    return (
      <div className="error-container">
        <h2>
          {is404 && '⚠️ 스터디를 찾을 수 없습니다'}
          {is403 && '🔒 비공개 스터디입니다'}
          {!is404 && !is403 && '❌ 오류가 발생했습니다'}
        </h2>
        <p>
          {is404 && '존재하지 않거나 삭제된 스터디입니다.'}
          {is403 && '이 스터디는 멤버만 볼 수 있습니다.'}
          {!is404 && !is403 && '스터디 정보를 불러올 수 없습니다.'}
        </p>
        <div className="actions">
          <button onClick={() => router.push('/studies')}>
            스터디 목록으로
          </button>
          {!is404 && !is403 && (
            <button onClick={() => refetch()}>
              다시 시도
            </button>
          )}
        </div>
      </div>
    )
  }

  // 3. 데이터 없음
  if (!data) {
    return (
      <div className="empty-state">
        <p>스터디 정보가 없습니다.</p>
        <button onClick={() => router.push('/studies')}>
          스터디 목록으로
        </button>
      </div>
    )
  }

  // 4. 정상 렌더링
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      {/* ... */}
    </div>
  )
}

export default StudyDetailPage
```

**개선 사항**:
- ✅ 로딩 스켈레톤
- ✅ 에러별 다른 메시지
- ✅ 재시도 기능
- ✅ 네비게이션 제공

---

## 스터디 수정 실패

### 문제 1: 권한 검증 누락

#### ❌ 나쁜 예

```javascript
// src/app/api/studies/[id]/route.js
export async function PATCH(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const { id } = await params
  const body = await request.json()
  
  // 권한 확인 없이 바로 수정
  const study = await prisma.study.update({
    where: { id },
    data: body
  })
  
  return NextResponse.json(study)
}
```

**문제점**:
- 누구나 수정 가능
- OWNER 확인 없음

#### ✅ 좋은 예

```javascript
// src/app/api/studies/[id]/route.js
export async function PATCH(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id } = await params
    const body = await request.json()

    // 1. 스터디 조회 및 소유자 확인
    const study = await prisma.study.findUnique({
      where: { id }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 2. OWNER 권한 확인
    if (study.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "스터디 소유자만 수정할 수 있습니다" },
        { status: 403 }
      )
    }

    // 3. 수정 가능한 필드만 추출
    const updateData = {}
    
    if (body.name !== undefined) {
      if (body.name.trim().length < 2 || body.name.trim().length > 50) {
        return NextResponse.json(
          { error: "스터디 이름은 2자 이상 50자 이하여야 합니다" },
          { status: 400 }
        )
      }
      updateData.name = body.name.trim()
    }

    if (body.description !== undefined) {
      if (body.description.trim().length < 10 || body.description.trim().length > 500) {
        return NextResponse.json(
          { error: "스터디 설명은 10자 이상 500자 이하여야 합니다" },
          { status: 400 }
        )
      }
      updateData.description = body.description.trim()
    }

    if (body.emoji !== undefined) updateData.emoji = body.emoji
    if (body.category !== undefined) updateData.category = body.category
    if (body.subCategory !== undefined) updateData.subCategory = body.subCategory
    if (body.maxMembers !== undefined) {
      // 현재 인원보다 적게 설정 불가
      const currentMembers = await prisma.studyMember.count({
        where: { studyId: id, status: 'ACTIVE' }
      })
      
      if (body.maxMembers < currentMembers) {
        return NextResponse.json(
          { error: `현재 멤버 수(${currentMembers}명)보다 적게 설정할 수 없습니다` },
          { status: 400 }
        )
      }
      
      updateData.maxMembers = body.maxMembers
    }
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic
    if (body.isRecruiting !== undefined) updateData.isRecruiting = body.isRecruiting
    if (body.autoApprove !== undefined) updateData.autoApprove = body.autoApprove
    if (body.tags !== undefined) updateData.tags = body.tags

    // 4. 변경사항이 없으면 리턴
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        message: "변경사항이 없습니다",
        data: study
      })
    }

    // 5. 업데이트 실행
    const updatedStudy = await prisma.study.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "스터디 정보가 수정되었습니다",
      data: updatedStudy
    })

  } catch (error) {
    console.error('Update study error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "스터디 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ OWNER 권한 확인
- ✅ 필드별 검증
- ✅ 현재 멤버 수 고려
- ✅ 수정 가능 필드만 허용
- ✅ 변경사항 없을 때 처리

---

## 스터디 삭제 실패

### 문제: 연관 데이터 정리 누락

#### ❌ 나쁜 예

```javascript
export async function DELETE(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const { id } = await params
  
  // 연관 데이터 정리 없이 삭제
  await prisma.study.delete({ where: { id } })
  
  return NextResponse.json({ success: true })
}
```

**문제점**:
- 외래 키 제약 조건 위반 가능
- 연관 데이터 미정리

#### ✅ 좋은 예

```javascript
export async function DELETE(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id } = await params

    // 1. 스터디 조회 및 소유자 확인
    const study = await prisma.study.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
            notices: true,
            files: true,
            tasks: true,
            calendar: true
          }
        }
      }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 2. OWNER 권한 확인
    if (study.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "스터디 소유자만 삭제할 수 있습니다" },
        { status: 403 }
      )
    }

    // 3. 삭제 확인 (멤버가 많은 경우)
    if (study._count.members > 5) {
      // 클라이언트에서 confirm=true 파라미터 전송 필요
      const { searchParams } = new URL(request.url)
      if (searchParams.get('confirm') !== 'true') {
        return NextResponse.json({
          error: `${study._count.members}명의 멤버가 있습니다. 정말 삭제하시겠습니까?`,
          requiresConfirmation: true
        }, { status: 400 })
      }
    }

    // 4. 트랜잭션으로 관련 데이터 모두 삭제
    await prisma.$transaction(async (tx) => {
      // 4-1. 알림 삭제
      await tx.notification.deleteMany({
        where: { studyId: id }
      })

      // 4-2. 댓글 삭제
      await tx.comment.deleteMany({
        where: { studyId: id }
      })

      // 4-3. 할일 삭제
      await tx.task.deleteMany({
        where: { studyId: id }
      })

      // 4-4. 파일 삭제
      await tx.file.deleteMany({
        where: { studyId: id }
      })

      // 4-5. 공지사항 삭제
      await tx.notice.deleteMany({
        where: { studyId: id }
      })

      // 4-6. 일정 삭제
      await tx.calendarEvent.deleteMany({
        where: { studyId: id }
      })

      // 4-7. 멤버 삭제
      await tx.studyMember.deleteMany({
        where: { studyId: id }
      })

      // 4-8. 스터디 삭제
      await tx.study.delete({
        where: { id }
      })
    })

    return NextResponse.json({
      success: true,
      message: "스터디가 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete study error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "스터디 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ 트랜잭션으로 원자성 보장
- ✅ 모든 연관 데이터 정리
- ✅ 멤버 수에 따른 확인 요청
- ✅ 단계별 삭제 (역순)

---

## 유효성 검사 오류

### 문제: 일관되지 않은 검증 로직

#### ✅ 통합 검증 함수

```javascript
// src/lib/validators/study.js

export function validateStudyInput(data, isUpdate = false) {
  const errors = {}

  // 이름 검증
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length < 2) {
      errors.name = '스터디 이름은 2자 이상이어야 합니다'
    } else if (data.name.trim().length > 50) {
      errors.name = '스터디 이름은 50자 이하여야 합니다'
    }
  } else if (!isUpdate) {
    // 생성 시에는 필수
    errors.name = '스터디 이름을 입력해주세요'
  }

  // 설명 검증
  if (data.description !== undefined) {
    if (!data.description || data.description.trim().length < 10) {
      errors.description = '스터디 설명은 10자 이상이어야 합니다'
    } else if (data.description.trim().length > 500) {
      errors.description = '스터디 설명은 500자 이하여야 합니다'
    }
  } else if (!isUpdate) {
    errors.description = '스터디 설명을 입력해주세요'
  }

  // 카테고리 검증
  if (data.category !== undefined) {
    const validCategories = [
      '프로그래밍', '어학', '자격증', '취미', '독서', '재테크', '기타'
    ]
    if (!validCategories.includes(data.category)) {
      errors.category = '유효하지 않은 카테고리입니다'
    }
  } else if (!isUpdate) {
    errors.category = '카테고리를 선택해주세요'
  }

  // 최대 인원 검증
  if (data.maxMembers !== undefined) {
    const num = parseInt(data.maxMembers)
    if (isNaN(num) || num < 2 || num > 100) {
      errors.maxMembers = '최대 인원은 2명에서 100명 사이여야 합니다'
    }
  }

  // 태그 검증
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.tags = '태그는 배열이어야 합니다'
    } else if (data.tags.length > 10) {
      errors.tags = '태그는 최대 10개까지 가능합니다'
    } else {
      const invalidTag = data.tags.find(tag => tag.length > 20)
      if (invalidTag) {
        errors.tags = '태그는 각각 20자 이하여야 합니다'
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// 사용 예제
export async function POST(request) {
  const body = await request.json()
  
  const validation = validateStudyInput(body, false)
  if (!validation.isValid) {
    return NextResponse.json(
      { errors: validation.errors },
      { status: 400 }
    )
  }
  
  // 생성 로직...
}
```

---

## 목록 조회 실패

### 문제: 잘못된 쿼리 파라미터 처리

#### ❌ 나쁜 예

```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  
  // 검증 없이 사용
  const page = parseInt(searchParams.get('page'))
  const limit = parseInt(searchParams.get('limit'))
  
  const studies = await prisma.study.findMany({
    skip: (page - 1) * limit,
    take: limit
  })
}
```

**문제점**:
- NaN 처리 없음
- 음수 허용
- 너무 큰 limit 허용

#### ✅ 좋은 예

```javascript
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 1. 페이지네이션 파라미터 검증
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const skip = (page - 1) * limit

    // 2. 필터 파라미터
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isRecruiting = searchParams.get('isRecruiting')
    const sortBy = searchParams.get('sortBy') || 'latest'

    // 3. where 조건 생성
    const whereClause = {
      isPublic: true // 기본: 공개 스터디만
    }

    if (category && category !== 'all' && category !== '전체') {
      whereClause.category = category
    }

    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { tags: { has: search.trim() } }
      ]
    }

    if (isRecruiting === 'true') {
      whereClause.isRecruiting = true
    }

    // 4. 정렬 조건
    let orderBy = {}
    switch (sortBy) {
      case 'popular':
        orderBy = { members: { _count: 'desc' } }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // 5. 총 개수
    const total = await prisma.study.count({ where: whereClause })

    // 6. 스터디 목록 조회
    const studies = await prisma.study.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: studies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get studies error:', error)
    return NextResponse.json(
      { error: "스터디 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ 파라미터 범위 제한
- ✅ 기본값 설정
- ✅ NaN 방지
- ✅ SQL Injection 방지

---

## 디버깅 가이드

### 디버깅 스크립트

```javascript
// scripts/check-study.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkStudy(studyId) {
  console.log('=== 스터디 정보 ===')
  
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    include: {
      owner: true,
      members: {
        include: { user: true }
      },
      _count: {
        select: {
          members: true,
          notices: true,
          files: true
        }
      }
    }
  })
  
  if (!study) {
    console.log('❌ 스터디를 찾을 수 없습니다')
    return
  }
  
  console.log('ID:', study.id)
  console.log('이름:', study.name)
  console.log('소유자:', study.owner.name)
  console.log('멤버 수:', study._count.members, '/', study.maxMembers)
  console.log('공개:', study.isPublic ? 'Y' : 'N')
  console.log('모집 중:', study.isRecruiting ? 'Y' : 'N')
  
  console.log('\n=== 멤버 목록 ===')
  study.members.forEach(member => {
    console.log(`- ${member.user.name} (${member.role}) [${member.status}]`)
  })
}

// 사용: node scripts/check-study.js <studyId>
const studyId = process.argv[2]
if (!studyId) {
  console.log('Usage: node scripts/check-study.js <studyId>')
  process.exit(1)
}

checkStudy(studyId).then(() => prisma.$disconnect())
```

### 일반적인 체크리스트

```bash
# 1. 스터디 존재 확인
node scripts/check-study.js <studyId>

# 2. Prisma Studio로 확인
npx prisma studio

# 3. 로그 확인
# API 콘솔에서 에러 로그 확인
```

---

## 관련 문서

- [INDEX](./INDEX.md) - 증상별 찾기
- [02-member-management-exceptions.md](./02-member-management-exceptions.md) - 멤버 관리
- [05-permissions-exceptions.md](./05-permissions-exceptions.md) - 권한 관리

---

**다음 문서**: [멤버 관리 예외 처리](./02-member-management-exceptions.md)

