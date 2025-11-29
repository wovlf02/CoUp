# 스터디 관리 모범 사례

**작성일**: 2025-11-29  
**카테고리**: 스터디 관리  
**우선순위**: ⭐ 필수

---

## 📋 목차

- [에러 핸들링 패턴](#에러-핸들링-패턴)
- [보안 고려사항](#보안-고려사항)
- [테스트 전략](#테스트-전략)
- [코드 리뷰 체크리스트](#코드-리뷰-체크리스트)

---

## 에러 핸들링 패턴

### ✅ API Route 표준 패턴

```javascript
export async function POST(request, { params }) {
  // 1. 인증 확인
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  // 2. 권한 확인
  const result = await requireStudyMember(params.id, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    // 3. 요청 파싱
    const body = await request.json()

    // 4. 유효성 검사
    if (!body.name || body.name.length < 2) {
      return NextResponse.json(
        { error: "유효하지 않은 입력입니다" },
        { status: 400 }
      )
    }

    // 5. 비즈니스 로직
    const data = await prisma.study.create({ data: body })

    // 6. 성공 응답
    return NextResponse.json({
      success: true,
      data
    }, { status: 201 })

  } catch (error) {
    // 7. 에러 로깅
    console.error('API Error:', error)

    // 8. Prisma 에러 처리
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "이미 존재합니다" },
        { status: 409 }
      )
    }

    // 9. 일반 에러
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

### ✅ 클라이언트 에러 핸들링

```javascript
function MyComponent() {
  const [error, setError] = useState(null)
  const mutation = useMutation()

  const handleSubmit = async (data) => {
    try {
      setError(null)
      await mutation.mutateAsync(data)
      toast.success('성공!')
    } catch (err) {
      // 에러 타입별 처리
      if (err.message.includes('권한')) {
        setError('권한이 없습니다')
        toast.error('권한이 없습니다')
      } else if (err.message.includes('정원')) {
        setError('정원이 마감되었습니다')
        toast.error('정원이 마감되었습니다')
      } else {
        setError('오류가 발생했습니다')
        toast.error('오류가 발생했습니다')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* ... */}
    </form>
  )
}
```

---

## 보안 고려사항

### 1. SQL Injection 방지

```javascript
// ✅ Prisma는 자동으로 방지
const studies = await prisma.study.findMany({
  where: {
    name: { contains: userInput } // 안전함
  }
})

// ❌ Raw Query 사용 시 주의
const studies = await prisma.$queryRaw`
  SELECT * FROM Study WHERE name LIKE ${userInput}
` // 위험!

// ✅ Raw Query 시 파라미터 사용
const studies = await prisma.$queryRaw`
  SELECT * FROM Study WHERE name LIKE ${'%' + userInput + '%'}
` // 안전함
```

### 2. XSS 방지

```javascript
// React는 자동으로 이스케이프
<div>{study.name}</div> // 안전

// dangerouslySetInnerHTML 사용 시 sanitize
import DOMPurify from 'isomorphic-dompurify'

<div 
  dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(study.description) 
  }} 
/>
```

### 3. CSRF 방지

```javascript
// Next.js는 자동으로 CSRF 토큰 검증
// 추가 설정 불필요
```

### 4. 파일 업로드 보안

```javascript
export async function POST(request) {
  const formData = await request.formData()
  const file = formData.get('file')

  // 1. 파일 크기 제한
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "파일 크기는 5MB 이하여야 합니다" },
      { status: 400 }
    )
  }

  // 2. 파일 타입 검증
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "허용되지 않는 파일 형식입니다" },
      { status: 400 }
    )
  }

  // 3. 파일명 sanitize
  const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')

  // 4. 랜덤 이름 생성
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${safeFilename}`

  // 저장...
}
```

---

## 테스트 전략

### 1. 단위 테스트

```javascript
// tests/lib/validators/study.test.js
import { validateStudyInput } from '@/lib/validators/study'

describe('validateStudyInput', () => {
  it('유효한 입력을 통과시킨다', () => {
    const result = validateStudyInput({
      name: '테스트 스터디',
      description: '이것은 테스트 스터디입니다',
      category: '프로그래밍'
    })
    
    expect(result.isValid).toBe(true)
  })

  it('이름이 너무 짧으면 실패한다', () => {
    const result = validateStudyInput({
      name: 'a',
      description: '설명...',
      category: '프로그래밍'
    })
    
    expect(result.isValid).toBe(false)
    expect(result.errors.name).toBeDefined()
  })
})
```

### 2. API 테스트

```javascript
// tests/api/studies.test.js
import { POST } from '@/app/api/studies/route'

describe('POST /api/studies', () => {
  it('인증 없이 요청하면 401을 반환한다', async () => {
    const request = new Request('http://localhost/api/studies', {
      method: 'POST'
    })
    
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('유효한 데이터로 스터디를 생성한다', async () => {
    // Mock session
    jest.mock('@/lib/auth-helpers', () => ({
      requireAuth: () => ({ user: { id: 'user1' } })
    }))

    const request = new Request('http://localhost/api/studies', {
      method: 'POST',
      body: JSON.stringify({
        name: '테스트 스터디',
        description: '테스트입니다',
        category: '프로그래밍'
      })
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})
```

### 3. E2E 테스트

```javascript
// tests/e2e/studies.spec.js
import { test, expect } from '@playwright/test'

test('스터디 생성 플로우', async ({ page }) => {
  // 1. 로그인
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // 2. 스터디 생성 페이지
  await page.goto('/studies/create')

  // 3. 폼 작성
  await page.fill('[name="name"]', '테스트 스터디')
  await page.fill('[name="description"]', '이것은 E2E 테스트입니다')
  await page.selectOption('[name="category"]', '프로그래밍')

  // 4. 제출
  await page.click('button[type="submit"]')

  // 5. 성공 확인
  await expect(page).toHaveURL(/\/studies\/.+/)
  await expect(page.locator('h1')).toContainText('테스트 스터디')
})
```

---

## 코드 리뷰 체크리스트

### API Route

- [ ] 인증 확인 (`requireAuth`)
- [ ] 권한 확인 (`requireStudyMember`)
- [ ] 입력 유효성 검사
- [ ] 에러 핸들링 (try-catch)
- [ ] 적절한 HTTP 상태 코드
- [ ] 에러 메시지 명확성
- [ ] SQL Injection 방지
- [ ] 트랜잭션 필요 시 사용
- [ ] 로깅
- [ ] 테스트 코드

### React Component

- [ ] PropTypes 또는 TypeScript
- [ ] 로딩 상태 처리
- [ ] 에러 상태 처리
- [ ] 빈 상태 처리
- [ ] 접근성 (a11y)
- [ ] 성능 최적화 (memo, useMemo)
- [ ] 테스트 코드

### Database Query

- [ ] N+1 문제 확인
- [ ] 필요한 필드만 select
- [ ] 적절한 인덱스 사용
- [ ] 트랜잭션 필요 시 사용
- [ ] 성능 테스트

### 보안

- [ ] 인증/권한 확인
- [ ] SQL Injection 방지
- [ ] XSS 방지
- [ ] CSRF 방지
- [ ] 파일 업로드 검증
- [ ] Rate Limiting
- [ ] 민감 정보 로깅 방지

---

## 권장 사항

### 1. 일관된 에러 응답 형식

```javascript
// 성공
{
  success: true,
  data: { ... },
  message: "성공 메시지" (선택)
}

// 실패
{
  success: false,
  error: "에러 메시지",
  details: { ... } (선택)
}
```

### 2. 명확한 변수명

```javascript
// ❌
const s = await prisma.study.findUnique({ where: { id: id } })

// ✅
const study = await prisma.study.findUnique({ where: { id: studyId } })
```

### 3. 주석 작성

```javascript
// 복잡한 로직에 주석 추가
// ADMIN은 MEMBER만 강퇴할 수 있고, OWNER는 모든 멤버 강퇴 가능
if (currentMember.role === 'ADMIN' && targetMember.role === 'ADMIN') {
  return NextResponse.json(
    { error: "다른 관리자를 강퇴할 수 없습니다" },
    { status: 403 }
  )
}
```

### 4. 조기 반환 (Early Return)

```javascript
// ✅ 좋은 예
export async function POST(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  if (!body.name) {
    return NextResponse.json({ error: "이름 필수" }, { status: 400 })
  }

  // 메인 로직...
}

// ❌ 나쁜 예 (깊은 중첩)
export async function POST(request) {
  const session = await requireAuth()
  if (!(session instanceof NextResponse)) {
    const result = await requireStudyMember(studyId, 'ADMIN')
    if (!(result instanceof NextResponse)) {
      if (body.name) {
        // 메인 로직...
      }
    }
  }
}
```

---

## 관련 문서

- [INDEX](./INDEX.md)
- 모든 예외 처리 문서들

---

**다음 문서**: [완료 보고서](./COMPLETION-REPORT.md)

