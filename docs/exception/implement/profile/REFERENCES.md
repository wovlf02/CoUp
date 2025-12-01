# Profile 영역 참조 문서

**작성일**: 2025-12-01  
**Phase**: 1 - 분석 및 계획

---

## 📋 기존 예외 문서

### Profile 예외 문서 (docs/exception/profile/)
1. **README.md** - Profile 예외 가이드
2. **01-profile-edit-exceptions.md** - 프로필 수정 예외 (상세)
3. **02-avatar-exceptions.md** - 아바타 예외
4. **03-account-deletion-exceptions.md** - 계정 삭제 예외
5. **99-best-practices.md** - 모범 사례
6. **INDEX.md** - 예외 색인
7. **COMPLETION-REPORT.md** - 문서화 완료 보고서

---

## 📚 완료된 영역 참고

### Chat 영역 (가장 최근, 참고 우선)
- `docs/exception/implement/chat/CHAT-EXCEPTION-COMPLETE.md` - 최종 완료 보고서
- `docs/exception/implement/chat/INTEGRATION-TEST-SCENARIOS.md` - 통합 테스트 시나리오
- `docs/exception/implement/chat/E2E-TEST-GUIDE.md` - E2E 테스트
- `docs/exception/implement/chat/PHASE*-COMPLETE.md` - Phase별 보고서

**참고 포인트**:
- Exception 클래스 설계 패턴
- Socket 에러 처리 (Profile은 HTTP만)
- 낙관적 업데이트 (Profile은 미적용)
- 자동 재연결 (Profile은 미적용)

### My-Studies 영역
- `docs/exception/implement/my-studies/MY-STUDIES-FINAL-REPORT.md` - 완료 보고서
- `docs/exception/implement/my-studies/USAGE-GUIDE.md` - 사용 가이드
- `docs/exception/implement/my-studies/VALIDATION-FUNCTIONS.md` - 검증 함수 예제

**참고 포인트**:
- 유효성 검증 함수 패턴
- API 라우트 에러 처리
- 컴포넌트 inline 에러 표시

### Dashboard 영역
- `docs/exception/implement/dashboard/` - 30개 파일
- Dashboard 예외 처리 패턴

**참고 포인트**:
- 대시보드 위젯 에러 처리
- 데이터 로딩 상태 관리

---

## 🛠️ 기술 문서

### Next.js
- **App Router**: https://nextjs.org/docs/app
- **API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Error Handling**: https://nextjs.org/docs/app/building-your-application/routing/error-handling

### 인증
- **NextAuth.js**: https://next-auth.js.org/
- **Session Management**: https://next-auth.js.org/configuration/options#session

### 데이터베이스
- **Prisma ORM**: https://www.prisma.io/docs
- **Prisma Client**: https://www.prisma.io/docs/concepts/components/prisma-client
- **Transactions**: https://www.prisma.io/docs/concepts/components/prisma-client/transactions

### 검증 라이브러리
- **Zod**: https://zod.dev/ (스키마 검증)
- **validator.js**: https://github.com/validatorjs/validator.js (문자열 검증)
- **zxcvbn**: https://github.com/dropbox/zxcvbn (비밀번호 강도)

### 이미지 처리
- **Sharp**: https://sharp.pixelplumbing.com/ (이미지 리사이징, 변환)
- **Sharp 예제**: https://sharp.pixelplumbing.com/api-resize

### 보안
- **bcryptjs**: https://github.com/dcodeIO/bcrypt.js (비밀번호 해싱)
- **OWASP XSS Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **OWASP SQL Injection Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

### Rate Limiting (선택적)
- **ioredis**: https://github.com/luin/ioredis (Redis 클라이언트)
- **Rate Limiting Strategies**: https://redis.io/docs/manual/patterns/distributed-locks/

---

## 📖 유사 패턴 참조

### 1. Exception 클래스 패턴 (Chat 참조)
```javascript
// chat/ChatMessageException.js
class ChatMessageException extends Error {
  constructor(code, message, statusCode, context) {
    // ...
  }
  
  static emptyContent(context) {
    return new ChatMessageException(
      'CHAT_MESSAGE_EMPTY_CONTENT',
      '메시지를 입력해주세요',
      400,
      context
    )
  }
}

// 👉 Profile에 적용
class ProfileException extends Error {
  static requiredFieldMissing(context) {
    return new ProfileException(
      'PROFILE-001',
      `${context.field}는 필수 항목입니다`,
      400,
      context
    )
  }
}
```

### 2. 유효성 검증 패턴 (My-Studies 참조)
```javascript
// my-studies/validators.js
export function validateStudyTitle(title) {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'TITLE_REQUIRED' }
  }
  
  if (title.length < 2 || title.length > 100) {
    return { valid: false, error: 'TITLE_LENGTH_INVALID' }
  }
  
  return { valid: true, error: null }
}

// 👉 Profile에 적용
export function validateName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'NAME_REQUIRED' }
  }
  
  if (name.length < 2 || name.length > 50) {
    return { valid: false, error: 'NAME_LENGTH_INVALID' }
  }
  
  return { valid: true, error: null }
}
```

### 3. API 에러 처리 패턴 (Chat 참조)
```javascript
// chat/route.js
export async function POST(request) {
  try {
    const body = await request.json()
    
    // 검증
    if (!body.content) {
      throw ChatMessageException.emptyContent({ studyId })
    }
    
    // 작업 수행
    const message = await createMessage(body)
    
    logChatInfo('Message sent successfully', {
      studyId,
      messageId: message.id
    })
    
    return NextResponse.json({
      success: true,
      data: message
    })
    
  } catch (error) {
    logChatError(error, { studyId, action: 'send_message' })
    
    if (error instanceof ChatMessageException) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json({
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '...' }
    }, { status: 500 })
  }
}

// 👉 Profile에 적용 (동일 패턴)
```

### 4. 컴포넌트 에러 표시 패턴 (My-Studies 참조)
```javascript
// my-studies/StudyForm.jsx
const [errors, setErrors] = useState({})

const validate = () => {
  const newErrors = {}
  
  if (!formData.title) {
    newErrors.title = '제목은 필수입니다'
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

// JSX
{errors.title && (
  <span className={styles.error}>{errors.title}</span>
)}

// 👉 Profile에 적용 (동일 패턴)
```

---

## 🔗 외부 리소스

### 비밀번호 보안
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

### 이미지 최적화
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Next.js Image Component](https://nextjs.org/docs/pages/api-reference/components/image)

### GDPR 및 개인정보
- [GDPR Right to Erasure (Article 17)](https://gdpr-info.eu/art-17-gdpr/)
- [GDPR Data Portability (Article 20)](https://gdpr-info.eu/art-20-gdpr/)

---

## 📝 참조 코드 예제

### Zod 스키마 (Password API 현재 사용 중)
```javascript
import { z } from "zod"

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

const validatedData = passwordSchema.parse(body)
```

### bcrypt 사용 (Password API 현재 사용 중)
```javascript
import bcrypt from "bcryptjs"

// 해싱
const hashedPassword = await bcrypt.hash(password, 10)

// 비교
const isValid = await bcrypt.compare(inputPassword, storedHash)
```

### Prisma 트랜잭션 (계정 삭제 시 필요)
```javascript
await prisma.$transaction([
  prisma.user.update({
    where: { id: userId },
    data: { status: 'DELETED', accountDeletedAt: new Date() }
  }),
  prisma.studyMember.deleteMany({
    where: { userId, role: { not: 'OWNER' } }
  }),
  prisma.notification.deleteMany({
    where: { userId }
  })
])
```

---

## 🎯 다음 작업

Phase 2 시작 시 참조할 파일:
1. `EXCEPTION-DESIGN.md` - Exception 클래스 구조
2. `PHASE-PLAN.md` - Phase 2 상세 계획
3. Chat 영역 완료 보고서 - 패턴 참조

---

**작성자**: GitHub Copilot  
**버전**: 1.0.0

