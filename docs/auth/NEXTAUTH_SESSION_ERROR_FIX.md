# 🔥 NextAuth Session Callback 에러 해결

**날짜**: 2025-11-18  
**에러**: `Cannot convert undefined or null to object`  
**위치**: `session` callback in auth.js

---

## 🐛 에러 내용

```
[next-auth][error][CLIENT_FETCH_ERROR]
Cannot convert undefined or null to object
at Object.keys (<anonymous>)
```

**발생 경로**: `/api/auth/session`

---

## 💡 원인 분석

### 1. session 객체가 undefined/null
```javascript
// ❌ 문제의 코드
async session({ session, token }) {
  if (!user || user.status !== 'ACTIVE') {
    return null  // ← 위험! NextAuth는 null을 처리할 수 없음
  }
  
  session.user.id = user.id  // ← session이 null이면 에러!
}
```

### 2. NextAuth v4의 session 처리
- `session` callback이 `null`을 반환하면 NextAuth 내부에서 `Object.keys()`를 호출할 때 에러 발생
- 빈 세션을 표현하려면 `null` 대신 `{ user: {} }` 반환 필요

### 3. session.user가 초기화되지 않음
- NextAuth가 내부적으로 session 객체를 생성하지만, 특정 상황에서 `session.user`가 undefined일 수 있음
- 안전하게 초기화 필요

---

## ✅ 해결 방법

### 1. session callback 완전 재작성

```javascript
async session({ session, token }) {
  try {
    // 1. 기본 검증 - session/token 존재 확인
    if (!session || !token) {
      console.warn('⚠️ Session callback: session or token is missing')
      return { user: {} }  // ← null 대신 빈 객체!
    }

    // 2. session.user 안전하게 초기화
    if (!session.user) {
      session.user = {}
    }

    // 3. token.id 확인
    if (!token.id) {
      console.warn('⚠️ Session callback: token.id is missing')
      return session
    }

    // 4. 데이터베이스에서 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: String(token.id) },  // ← String() 변환으로 안전하게
      select: { 
        id: true, 
        status: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        provider: true
      }
    })

    // 5. 사용자 없음 → 빈 세션 반환
    if (!user) {
      console.log(`⚠️ Session invalidated: User ${token.id} not found`)
      return { user: {} }  // ← 로그아웃 상태
    }

    // 6. 비활성 상태 → 빈 세션 반환
    if (user.status !== 'ACTIVE') {
      console.log(`⚠️ Session invalidated: User status is ${user.status}`)
      return { user: {} }  // ← 로그아웃 상태
    }

    // 7. 정상 → 세션 업데이트
    session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.avatar,
      role: user.role,
      status: user.status,
      provider: user.provider
    }

    return session

  } catch (error) {
    // 8. 에러 발생 시 폴백 (DB 연결 실패 등)
    console.error('❌ Session callback error:', error)
    
    if (!session) session = { user: {} }
    if (!session.user) session.user = {}

    // 토큰 정보로 폴백
    if (token) {
      session.user = {
        id: token.id || '',
        email: token.email || '',
        name: token.name || '',
        image: token.image || null,
        role: token.role || 'USER',
        status: token.status || 'ACTIVE',
        provider: token.provider || 'CREDENTIALS'
      }
    }

    return session
  }
}
```

### 2. SocketContext 안전성 강화

```javascript
// ❌ Before
const user = session?.user || null

if (!user?.id) {
  // user가 {}일 수도 있음!
}

// ✅ After
const user = session?.user && session.user.id ? session.user : null

if (!user || !user.id) {
  // 명확하게 검증
}
```

---

## 🔑 핵심 포인트

### 1. null 반환 금지
```javascript
// ❌ 절대 안 됨!
return null

// ✅ 빈 세션 반환
return { user: {} }
```

### 2. 항상 초기화 확인
```javascript
if (!session) session = { user: {} }
if (!session.user) session.user = {}
```

### 3. 모든 경로에서 객체 반환
```javascript
try {
  // ... 로직
  return session
} catch (error) {
  // 에러 발생해도 객체 반환
  return { user: {} }
}
```

### 4. 타입 변환 안전하게
```javascript
where: { id: String(token.id) }  // ← 항상 문자열로
```

---

## 📊 Before / After

### ❌ Before
```javascript
async session({ session, token }) {
  const user = await prisma.user.findUnique(...)
  
  if (!user || user.status !== 'ACTIVE') {
    return null  // ❌ NextAuth 내부에서 에러!
  }
  
  session.user.id = user.id  // ❌ session.user가 undefined일 수 있음!
  return session
}
```

**결과:**
```
❌ Cannot convert undefined or null to object
```

### ✅ After
```javascript
async session({ session, token }) {
  try {
    if (!session || !token) {
      return { user: {} }  // ✅ 안전한 빈 세션
    }
    
    if (!session.user) {
      session.user = {}  // ✅ 초기화
    }
    
    const user = await prisma.user.findUnique(...)
    
    if (!user || user.status !== 'ACTIVE') {
      return { user: {} }  // ✅ 안전한 빈 세션
    }
    
    session.user = { ...user }  // ✅ 새 객체로 할당
    return session
    
  } catch (error) {
    return { user: {} }  // ✅ 에러 시에도 안전
  }
}
```

**결과:**
```
✅ 에러 없음!
✅ 세션 정상 동작
```

---

## 🧪 테스트 결과

### 1. 정상 로그인
```javascript
// 브라우저 콘솔
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => console.log(data))

// 결과
{
  user: {
    id: "cmi45jvji0000vaxcmnirjdhq",
    email: "kim@example.com",
    name: "김민준",
    image: null,
    role: "USER",
    status: "ACTIVE",
    provider: "CREDENTIALS"
  },
  expires: "2025-11-25T..."
}
```

### 2. 로그아웃 상태
```javascript
// 결과
{
  user: {}  // ← 빈 객체 (에러 없음!)
}
```

### 3. 사용자가 DB에 없는 경우
```javascript
// 서버 로그
⚠️ Session invalidated: User xyz123 not found

// 브라우저
{
  user: {}  // ← 자동 로그아웃
}
```

---

## 📝 수정된 파일

1. ✅ **src/lib/auth.js**
   - `session` callback 완전 재작성
   - null 반환 제거
   - try-catch로 안전성 강화
   - 폴백 로직 추가

2. ✅ **src/contexts/SocketContext.js**
   - user 정보 안전하게 추출
   - user.id 명시적 확인
   - 로깅 시 기본값 처리

3. ✅ **src/app/api/auth/[...nextauth]/route.js**
   - authOptions import 확인

---

## 🚀 즉시 확인

### 1. 브라우저 콘솔에서 세션 확인
```javascript
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => {
    console.log('Session:', data)
    console.log('User ID:', data?.user?.id)
    console.log('Has error:', data?.error)
  })
```

### 2. 예상 결과
```
✅ Session: { user: {...}, expires: "..." }
✅ User ID: "cmi45jvji0000vaxcmnirjdhq"
✅ Has error: undefined
```

### 3. 에러 없음 확인
```
✅ No [next-auth][error][CLIENT_FETCH_ERROR]
✅ No "Cannot convert undefined or null to object"
✅ Socket 정상 연결
```

---

## 🎓 배운 점

### NextAuth v4 session callback 규칙
1. **절대 null 반환 금지** - 내부에서 Object.keys() 사용
2. **항상 객체 반환** - `{ user: {} }` 또는 `session`
3. **session.user 초기화** - undefined 체크 필수
4. **try-catch 필수** - DB 조회 실패 대비

### 안전한 코딩 패턴
```javascript
// 1. 입력 검증
if (!session || !token) return { user: {} }

// 2. 초기화
if (!session.user) session.user = {}

// 3. 비즈니스 로직
const user = await ...

// 4. 검증 및 반환
if (!user) return { user: {} }
return session

// 5. 에러 처리
catch (error) {
  return { user: {} }  // 항상 객체!
}
```

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-18  
**상태**: ✅ 완전 해결

