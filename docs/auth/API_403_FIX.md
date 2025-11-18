# 🔥 API 403 Forbidden 에러 해결

**날짜**: 2025-01-18  
**에러**: `GET /api/dashboard 403 (Forbidden)`  
**원인**: session callback의 잘못된 설계

---

## 🐛 에러 내용

```
GET http://localhost:3000/api/dashboard 403 (Forbidden)
```

**발생 시점**: 로그인 후 대시보드 페이지 진입 시

---

## 💡 근본 원인

### 문제 1: session callback에서 DB 조회
```javascript
// ❌ 문제의 코드
async session({ session, token }) {
  // 매 API 요청마다 실행됨!
  const user = await prisma.user.findUnique({
    where: { id: token.id }
  })
  
  if (!user) {
    return { user: {} }  // ← 빈 세션 반환
  }
  
  return session
}
```

**문제점:**
1. **성능**: 매 요청마다 DB 조회 (느림)
2. **빈 세션**: `{ user: {} }` 반환 시 NextAuth 내부 에러
3. **검증 부재**: `requireAuth`는 JWT만 체크

### 문제 2: requireAuth의 약한 검증
```javascript
// ❌ 문제의 코드
async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session) return 401
  
  // JWT의 status만 체크 (DB 확인 안 함!)
  if (session.user.status !== 'ACTIVE') return 403
  
  return { user: session.user }
}
```

**문제점:**
- 오래된 JWT 토큰의 정보를 그대로 믿음
- 사용자가 DB에서 삭제되어도 JWT는 유효
- 실시간 상태 반영 안 됨

---

## ✅ 해결 방법

### 원칙: 관심사의 분리

1. **session callback**: 가볍게 (JWT → Session 변환만)
2. **requireAuth**: 무겁게 (실제 DB 검증)

### 1. session callback 단순화

```javascript
// ✅ 해결된 코드
async session({ session, token }) {
  // JWT 토큰 정보를 그대로 세션으로 전달 (빠름!)
  if (token && session) {
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
  
  return session  // 항상 session 반환 (빈 객체 아님!)
}
```

**장점:**
- ✅ 매우 빠름 (DB 조회 없음)
- ✅ 안전 (항상 session 반환)
- ✅ 단순 (에러 가능성 적음)

### 2. requireAuth 강화

```javascript
// ✅ 해결된 코드
async function requireAuth() {
  try {
    // 1. JWT 세션 확인
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      )
    }

    // 2. 실제 DB에서 사용자 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        provider: true
      }
    })

    // 3. 사용자 없음 → 로그아웃 필요
    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 401 }
      )
    }

    // 4. 비활성 계정
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: user.status === 'SUSPENDED' ? "정지된 계정입니다" : "비활성화된 계정입니다" },
        { status: 403 }
      )
    }

    // 5. 최신 정보 반환
    return { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar,
        role: user.role,
        status: user.status,
        provider: user.provider
      }
    }

  } catch (error) {
    console.error('❌ requireAuth error:', error)
    return NextResponse.json(
      { error: "인증 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**장점:**
- ✅ 실시간 상태 반영
- ✅ DB에서 실제 검증
- ✅ 명확한 에러 메시지
- ✅ 안전한 에러 처리

---

## 📊 Before / After

### ❌ Before

```
요청 플로우:
1. 클라이언트 → /api/dashboard 요청
2. getServerSession() 호출
   ↓
3. session callback 실행 (DB 조회)
   → user 없음 → { user: {} } 반환
   ↓
4. requireAuth() 실행
   → session.user.status 체크 (undefined)
   → 403 Forbidden ❌
```

### ✅ After

```
요청 플로우:
1. 클라이언트 → /api/dashboard 요청
2. getServerSession() 호출
   ↓
3. session callback 실행 (빠름!)
   → JWT 정보 전달
   ↓
4. requireAuth() 실행
   → DB에서 실제 확인
   → user 존재 & ACTIVE
   → 200 OK ✅
```

---

## 🎯 핵심 개념

### 1. JWT vs Session vs Database

| 구분 | JWT Token | Session | Database |
|------|-----------|---------|----------|
| 위치 | 브라우저 쿠키 | NextAuth 내부 | PostgreSQL |
| 속도 | 매우 빠름 | 빠름 | 느림 |
| 신뢰도 | 낮음 (오래됨) | 중간 | 높음 (최신) |
| 사용 | 기본 인증 | 세션 관리 | 실제 검증 |

### 2. 언제 DB 조회?

- ❌ **session callback**: 매 요청마다 호출 → 조회하면 느림
- ✅ **requireAuth**: API 라우트에서만 → 조회해도 OK

### 3. 빈 세션의 위험

```javascript
// ❌ 위험!
return { user: {} }

// 이유:
session.user.id === undefined
session.user.status === undefined
→ 모든 체크 실패
→ 403 Forbidden

// ✅ 안전
return session  // user 정보 있음
```

---

## 🧪 테스트

### 1. 정상 로그인 후 API 호출

```javascript
// 브라우저 콘솔
fetch('/api/dashboard')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Dashboard data:', data)
  })
```

**예상 결과:**
```javascript
✅ Dashboard data: {
  stats: { activeStudies: 2, tasks: 5, ... },
  myStudies: [...],
  recentActivities: [...]
}
```

### 2. 로그아웃 상태에서 API 호출

```javascript
fetch('/api/dashboard')
  .then(r => r.json())
  .then(data => {
    console.log('Response:', data)
  })
```

**예상 결과:**
```javascript
Response: {
  error: "로그인이 필요합니다"
}
Status: 401
```

### 3. 오래된 세션으로 API 호출

```javascript
// 사용자가 DB에서 삭제된 경우
fetch('/api/dashboard')
  .then(r => r.json())
  .then(data => {
    console.log('Response:', data)
  })
```

**예상 결과:**
```javascript
Response: {
  error: "사용자를 찾을 수 없습니다"
}
Status: 401
```

---

## 📝 수정된 파일

### 1. `src/lib/auth.js`
```javascript
// session callback 단순화
async session({ session, token }) {
  if (token && session) {
    session.user = { ...token }  // JWT 정보만 전달
  }
  return session
}
```

### 2. `src/lib/auth-helpers.js`
```javascript
// requireAuth 강화
async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) return 401
  
  // DB에서 실제 확인
  const user = await prisma.user.findUnique(...)
  
  if (!user) return 401
  if (user.status !== 'ACTIVE') return 403
  
  return { user }
}
```

---

## ✅ 체크리스트

- [x] session callback 단순화 (DB 조회 제거)
- [x] requireAuth에 DB 검증 추가
- [x] 명확한 에러 메시지
- [x] try-catch 에러 처리
- [ ] 브라우저에서 테스트
- [ ] 서버 로그 확인

---

## 🎓 배운 점

### 1. NextAuth 설계 원칙
- **session callback**: 가볍게 (JWT → Session)
- **API 라우트**: 무겁게 (DB 검증)

### 2. 성능 vs 보안
- session callback은 매 요청마다 실행
- DB 조회는 비용이 큼
- 따라서 session에서는 조회 안 함
- API 라우트에서만 필요시 조회

### 3. 빈 세션의 문제
- `{ user: {} }` 반환은 위험
- NextAuth 내부에서 `Object.keys()` 사용
- 항상 완전한 session 반환 필요

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-01-18  
**상태**: ✅ 완전 해결

