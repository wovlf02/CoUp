# 비밀번호 변경 예외 처리

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 비밀번호 변경 기능  
**관련 파일**:
- `src/app/user/settings/components/PasswordChange.jsx`
- `src/app/api/users/me/password/route.js`

---

## 📋 목차

1. [기능 개요](#1-기능-개요)
2. [비밀번호 검증 예외](#2-비밀번호-검증-예외)
3. [보안 예외](#3-보안-예외)
4. [UI 예외](#4-ui-예외)
5. [API 예외](#5-api-예외)

---

## 1. 기능 개요

### 비밀번호 변경 프로세스
```
사용자 입력
  ↓
현재 비밀번호 확인
  ↓
새 비밀번호 검증
  ↓
비밀번호 확인 일치 검증
  ↓
해싱 및 저장
  ↓
성공 메시지
```

---

## 2. 비밀번호 검증 예외

### 2.1 최소 길이 미달

#### ❌ 문제 상황
```javascript
// 8자 미만 비밀번호
const passwords = [
  'short',      // 5자
  '1234567',    // 7자
  '',           // 빈 문자열
]
```

#### ✅ 해결 방법
```javascript
// 클라이언트 검증
const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.newPassword.length < 8) {
    alert('비밀번호는 최소 8자 이상이어야 합니다.');
    return;
  }
  
  // ...
}

// 서버 검증 (Zod)
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
  newPassword: z.string().min(8, "새 비밀번호는 최소 8자 이상이어야 합니다"),
})
```

---

### 2.2 비밀번호 강도 부족

#### ✅ 강도 계산 함수
```javascript
const calculatePasswordStrength = (password) => {
  let strength = 0;
  
  // 길이 체크
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // 대소문자 체크
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  
  // 숫자 체크
  if (/\d/.test(password)) strength++;
  
  // 특수문자 체크
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  
  return strength; // 0-5
}

// 강도 레이블
const getStrengthLabel = (strength) => {
  if (strength === 0) return '';
  if (strength <= 2) return '약함';
  if (strength <= 3) return '보통';
  return '강함';
}

// 강도 색상
const getStrengthColor = (strength) => {
  if (strength <= 2) return '#ef4444'; // 빨강
  if (strength <= 3) return '#f59e0b'; // 주황
  return '#10b981'; // 초록
}
```

#### 🎯 UI 표시
```javascript
{formData.newPassword && (
  <>
    <div className={styles.strengthMeter}>
      <div
        className={styles.strengthBar}
        style={{
          width: `${(passwordStrength / 5) * 100}%`,
          backgroundColor: getStrengthColor(passwordStrength)
        }}
      />
    </div>
    <div 
      className={styles.strengthLabel} 
      style={{ color: getStrengthColor(passwordStrength) }}
    >
      강도: {getStrengthLabel(passwordStrength)}
    </div>
  </>
)}
```

---

### 2.3 비밀번호 확인 불일치

#### ❌ 문제 상황
```javascript
// 새 비밀번호와 확인 비밀번호가 다름
newPassword: 'MyPassword123!'
confirmPassword: 'MyPassword123' // 마지막 느낌표 누락
```

#### ✅ 실시간 검증
```javascript
// 입력 시 즉시 피드백
{formData.confirmPassword && 
 formData.newPassword !== formData.confirmPassword && (
  <p className={styles.error}>
    ❌ 비밀번호가 일치하지 않습니다.
  </p>
)}

// 제출 시 최종 검증
const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.newPassword !== formData.confirmPassword) {
    alert('새 비밀번호가 일치하지 않습니다.');
    return;
  }
  
  // ...
}
```

---

### 2.4 현재 비밀번호와 동일

#### ✅ 서버 검증
```javascript
// API에서 검증
export async function PATCH(request) {
  // ...
  
  // 새 비밀번호가 현재 비밀번호와 같은지 확인
  const isSameAsOld = await bcrypt.compare(
    validatedData.newPassword,
    user.password
  )
  
  if (isSameAsOld) {
    return NextResponse.json(
      { error: "새 비밀번호는 현재 비밀번호와 달라야 합니다" },
      { status: 400 }
    )
  }
  
  // ...
}
```

---

## 3. 보안 예외

### 3.1 현재 비밀번호 확인 실패

#### ❌ 문제 상황
```javascript
// 잘못된 현재 비밀번호 입력
currentPassword: 'wrong-password'
```

#### ✅ API 검증
```javascript
// src/app/api/users/me/password/route.js
export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const validatedData = passwordSchema.parse(body)

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "비밀번호를 변경할 수 없습니다" },
        { status: 400 }
      )
    }

    // 현재 비밀번호 확인
    const isValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    )

    if (!isValid) {
      return NextResponse.json(
        { error: "현재 비밀번호가 일치하지 않습니다" },
        { status: 400 }
      )
    }

    // 새 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: "비밀번호가 변경되었습니다"
    })

  } catch (error) {
    console.error('Change password error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "비밀번호 변경 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

### 3.2 Rate Limiting

#### 🎯 비밀번호 변경 시도 제한
```javascript
// 메모리 또는 Redis 기반 rate limiter
const passwordChangeAttempts = new Map()

export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session
  
  const userId = session.user.id
  const now = Date.now()
  
  // 시도 횟수 확인
  const attempts = passwordChangeAttempts.get(userId) || []
  const recentAttempts = attempts.filter(time => now - time < 3600000) // 1시간
  
  if (recentAttempts.length >= 5) {
    return NextResponse.json(
      { error: "비밀번호 변경 시도 횟수를 초과했습니다. 1시간 후 다시 시도해주세요." },
      { status: 429 }
    )
  }
  
  // 시도 기록
  recentAttempts.push(now)
  passwordChangeAttempts.set(userId, recentAttempts)
  
  // ...
}
```

---

### 3.3 세션 만료

#### ✅ 처리
```javascript
// 클라이언트
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsChanging(true);

  try {
    await api.put('/api/user/settings/password', {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });

    alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
    
    // 로그아웃 및 로그인 페이지로 이동
    await signOut({ redirect: true, callbackUrl: '/auth/signin' })
    
  } catch (error) {
    if (error.status === 401) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      router.push('/auth/signin');
      return;
    }
    
    alert(error.message || '비밀번호 변경에 실패했습니다.');
  } finally {
    setIsChanging(false);
  }
}
```

---

## 4. UI 예외

### 4.1 비밀번호 입력 필드 보안

#### ✅ 입력 마스킹 토글
```javascript
const [showPassword, setShowPassword] = useState({
  current: false,
  new: false,
  confirm: false,
})

// 현재 비밀번호
<div className={styles.field}>
  <label className={styles.label}>현재 비밀번호</label>
  <div className={styles.inputWrapper}>
    <input
      type={showPassword.current ? 'text' : 'password'}
      value={formData.currentPassword}
      onChange={(e) => setFormData({ 
        ...formData, 
        currentPassword: e.target.value 
      })}
      className={styles.input}
      required
    />
    <button
      type="button"
      onClick={() => setShowPassword({ 
        ...showPassword, 
        current: !showPassword.current 
      })}
      className={styles.toggleButton}
    >
      {showPassword.current ? '🙈' : '👁️'}
    </button>
  </div>
</div>
```

---

### 4.2 비밀번호 복사 방지

#### 🎯 보안 강화
```javascript
<input
  type="password"
  value={formData.currentPassword}
  onChange={(e) => setFormData({ 
    ...formData, 
    currentPassword: e.target.value 
  })}
  onCopy={(e) => e.preventDefault()}
  onPaste={(e) => e.preventDefault()}
  onCut={(e) => e.preventDefault()}
  className={styles.input}
  autoComplete="current-password"
  required
/>
```

---

### 4.3 폼 초기화

#### ✅ 취소 버튼
```javascript
const handleCancel = () => {
  setFormData({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  setPasswordStrength(0)
}

<button
  type="button"
  onClick={handleCancel}
  className={styles.cancelButton}
>
  취소
</button>
```

---

## 5. API 예외

### 5.1 OAuth 사용자

#### ❌ 문제 상황
```javascript
// Google/GitHub로 가입한 사용자는 비밀번호가 없음
user.password === null
```

#### ✅ 처리
```javascript
// API
const user = await prisma.user.findUnique({
  where: { id: userId }
})

if (!user || !user.password) {
  return NextResponse.json(
    { 
      error: "소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다",
      provider: user?.provider 
    },
    { status: 400 }
  )
}

// UI에서 숨기기
{session?.user?.provider === 'credentials' ? (
  <PasswordChange />
) : (
  <div className={styles.notice}>
    <p>소셜 로그인({session.user.provider}) 사용자는</p>
    <p>비밀번호 변경이 불가능합니다.</p>
  </div>
)}
```

---

### 5.2 데이터베이스 오류

#### ✅ 트랜잭션 처리
```javascript
export async function PATCH(request) {
  // ...
  
  try {
    // 트랜잭션으로 원자적 업데이트
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 비밀번호 업데이트
      const user = await tx.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      })
      
      // 비밀번호 변경 로그 기록
      await tx.passwordChangeLog.create({
        data: {
          userId: userId,
          changedAt: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
      
      return user
    })
    
    return NextResponse.json({
      success: true,
      message: "비밀번호가 변경되었습니다"
    })
    
  } catch (error) {
    console.error('Change password error:', error)
    
    return NextResponse.json(
      { error: "비밀번호 변경 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

## 📚 테스트 케이스

```javascript
describe('Password Change', () => {
  test('최소 길이 검증', () => {
    expect(validatePassword('short')).toBe(false)
    expect(validatePassword('longenough1')).toBe(true)
  })
  
  test('비밀번호 확인 일치', () => {
    expect(passwordsMatch('pass123', 'pass123')).toBe(true)
    expect(passwordsMatch('pass123', 'pass124')).toBe(false)
  })
  
  test('강도 계산', () => {
    expect(calculatePasswordStrength('simple')).toBe(1)
    expect(calculatePasswordStrength('Simple123')).toBe(3)
    expect(calculatePasswordStrength('Simple123!')).toBe(5)
  })
  
  test('API - 잘못된 현재 비밀번호', async () => {
    const response = await fetch('/api/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify({
        currentPassword: 'wrong',
        newPassword: 'NewPassword123!'
      })
    })
    
    expect(response.status).toBe(400)
    expect(await response.json()).toHaveProperty('error')
  })
})
```

---

**문서 끝** - 비밀번호 변경의 모든 예외 상황 커버

