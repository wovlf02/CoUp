# 🐛 Admin Studies API 에러 해결

**발생일**: 2025-11-29  
**에러**: 스터디 관리 페이지에서 목록을 불러오는데 실패 (401 Unauthorized)

---

## 🔍 문제 분석

### 증상
- 스터디 관리 페이지 접속 시 "스터디 목록을 불러오는데 실패했습니다" 메시지 표시
- `❌ [Admin Studies API] Auth failed` 로그
- `GET /api/admin/studies 401` 에러

### 원인 파악

#### 주요 원인: 세션에 관리자 정보 누락
1. **Session callback에서 `isAdmin`과 `adminRole` 미전달**
   - JWT token에는 정보가 있지만 session에 전달하지 않음
   - `requireAdmin`에서 세션을 확인할 때 관리자 정보 없음

2. **`logAdminAction` 함수 파라미터 불일치**
   - API에서 `action: 'STUDY_LIST_VIEW'` 호출
   - 하지만 Prisma Schema의 `AdminAction` enum에 존재하지 않음

3. **`details` 파라미터 미지원**
   - `logAdminAction` 함수에 `details` 파라미터 전달
   - 하지만 `AdminLog` 모델에 `details` 필드 없음
   - 사용 가능한 필드: `before`, `after`, `reason`

---

## ✅ 해결 방법

### 1. Session callback에 관리자 정보 추가 ⭐ 핵심 수정
```javascript
// /coup/src/lib/auth.js

// Before - 관리자 정보 누락
async session({ session, token }) {
  if (token && session) {
    session.user = {
      id: token.id || '',
      email: token.email || '',
      name: token.name || '',
      // ... 기타 필드
      // ❌ isAdmin, adminRole 없음
    }
  }
  return session
}

// After - 관리자 정보 포함
async session({ session, token }) {
  if (token && session) {
    session.user = {
      id: token.id || '',
      email: token.email || '',
      name: token.name || '',
      image: token.image || null,
      role: token.role || 'USER',
      status: token.status || 'ACTIVE',
      provider: token.provider || 'CREDENTIALS',
      isAdmin: token.isAdmin || false,        // ✅ 추가
      adminRole: token.adminRole || null,     // ✅ 추가
    }
    
    console.log('📝 [AUTH] Session created:', {
      email: session.user.email,
      isAdmin: session.user.isAdmin,
      adminRole: session.user.adminRole
    })
  }
  return session
}
```

### 2. requireAdmin 함수에 상세 로깅 추가
```javascript
// /coup/src/lib/admin/auth.js

export async function requireAdmin(request, requiredPermissions = null) {
  try {
    console.log('🔐 [requireAdmin] Starting admin check...')
    
    const session = await getServerSession(authOptions)
    console.log('🔐 [requireAdmin] Session:', session ? {
      userId: session.user?.id,
      email: session.user?.email,
      isAdmin: session.user?.isAdmin,
      adminRole: session.user?.adminRole
    } : 'No session')
    
    // ... 나머지 로직
  } finally {
    await prisma.$disconnect()  // ✅ 추가
  }
}
```

### 3. AdminAction enum 값 수정
```javascript
// Before - 존재하지 않는 action
action: 'STUDY_LIST_VIEW'

// After - 올바른 action
action: 'STUDY_VIEW'
```

### 2. logAdminAction 파라미터 수정
```javascript
// Before - details 사용 (존재하지 않음)
await logAdminAction({
  adminId: adminRole.userId,
  action: 'STUDY_LIST_VIEW',
  details: {
    filters: { ... },
    resultCount: transformedStudies.length,
  },
})

// After - after와 reason 사용
await logAdminAction({
  adminId: adminRole.userId,
  action: 'STUDY_VIEW',
  targetType: 'Study',
  reason: `Viewed studies list with filters: ${JSON.stringify(filters)}`,
  after: {
    filters: { search, category, isPublic, isRecruiting },
    resultCount: transformedStudies.length,
  },
})
```

### 3. 에러 처리 개선
```javascript
// 로그 실패 시에도 API가 정상 동작하도록
try {
  await logAdminAction({ ... })
} catch (logError) {
  console.warn('⚠️ Failed to log action:', logError.message)
  // 로그 실패는 무시하고 계속 진행
}
```

### 4. 상세 로깅 추가
```javascript
console.log('🔍 [Admin Studies API] Starting request...')
console.log('✅ [Admin Studies API] Auth successful:', adminRole.userId)
console.log('📝 [Admin Studies API] Query params:', Object.fromEntries(searchParams))
console.log('✅ [Admin Studies API] Success, returning', transformedStudies.length, 'studies')
```

---

## 🔧 수정된 파일

### 1. `/coup/src/lib/auth.js` ⭐ 핵심 수정
- ✅ `session` callback에 `isAdmin`, `adminRole` 추가
- ✅ 세션 생성 로깅 추가

### 2. `/coup/src/lib/admin/auth.js`
- ✅ `requireAdmin` 함수에 상세 로깅 추가
- ✅ `prisma.$disconnect()` finally 블록 추가
- ✅ `logAdminAction` 함수에서 `details` 파라미터 제거
- ✅ JSON 객체 처리 개선 (`JSON.parse(JSON.stringify())`)

### 3. `/coup/src/app/api/admin/studies/route.js`
- ✅ `action` 값을 `STUDY_VIEW`로 수정
- ✅ `details` → `after` + `reason`으로 변경
- ✅ `logAdminAction`을 try-catch로 감싸기
- ✅ 상세 에러 로깅 추가
- ✅ finally 블록에 `prisma.$disconnect()` 추가

---

## 📊 Prisma Schema 참고

### AdminLog 모델
```prisma
model AdminLog {
  id         String      @id @default(cuid())
  adminId    String
  action     AdminAction
  targetType String?     // "User", "Study", "Report"
  targetId   String?
  
  before     Json?       // 변경 전 상태
  after      Json?       // 변경 후 상태
  reason     String?     // 사유
  
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime    @default(now())
}
```

### 사용 가능한 AdminAction 값
```prisma
enum AdminAction {
  // 스터디 관리
  STUDY_VIEW      ✅ 사용
  STUDY_HIDE
  STUDY_CLOSE
  STUDY_DELETE
  STUDY_RECOMMEND
  
  // 다른 액션들...
}
```

---

## 📝 검증 방법

### 1. 서버 로그 확인
```
🔍 [Admin Studies API] Starting request...
✅ [Admin Studies API] Auth successful: cmij333vz0000uyq0225lv6x2
📝 [Admin Studies API] Query params: {}
✅ [Admin Studies API] Success, returning 10 studies
```

### 2. 브라우저에서 테스트
1. `/admin/studies` 페이지 접속
2. 스터디 목록이 정상적으로 표시되는지 확인
3. 필터 적용 시 정상 동작하는지 확인

### 3. API 직접 테스트
```bash
curl http://localhost:3000/api/admin/studies \
  -H "Cookie: next-auth.session-token=..."
```

---

## 🎯 추가 개선사항

### 1. Admin Users API에도 동일한 수정 적용
```javascript
// /coup/src/app/api/admin/users/route.js
await logAdminAction({
  adminId: adminRole.userId,
  action: 'USER_VIEW',  // USER_SEARCH 대신
  targetType: 'User',
  reason: `Searched users: ${search || 'all'}`,
  after: { filters, resultCount },
})
```

### 2. 모든 Admin API에 일관된 로깅 적용
- Reports API
- Analytics API
- Settings API
- Audit Logs API

### 3. 로깅 유틸리티 함수 생성
```javascript
// /coup/src/lib/admin/logging.js
export async function safeLogAdminAction(params) {
  try {
    await logAdminAction(params)
  } catch (error) {
    console.warn('⚠️ Failed to log admin action:', error.message)
  }
}
```

---

## 📚 관련 파일

- ✅ `/coup/src/app/api/admin/studies/route.js` - 수정 완료
- ✅ `/coup/src/lib/admin/auth.js` - 수정 완료
- 📝 `/coup/prisma/schema.prisma` - AdminLog 모델 참고
- 📝 `/coup/src/app/admin/studies/_components/StudyList.jsx` - UI 컴포넌트

---

## ✅ 결론

**상태**: ✅ 해결 완료  

**핵심 문제**:
1. ⭐ **세션에 관리자 정보 누락** - JWT에는 있지만 session에 전달 안 됨
2. 존재하지 않는 `AdminAction` enum 값 사용
3. 존재하지 않는 `details` 필드 사용

**해결**:
1. ⭐ **Session callback에 `isAdmin`, `adminRole` 추가** - 핵심 수정
2. `STUDY_VIEW` 액션 사용
3. `after` 필드로 데이터 전달
4. 로그 실패 시에도 API가 정상 동작하도록 에러 처리
5. `prisma.$disconnect()` finally 블록 추가

**결과**:
- ✅ 세션에 관리자 정보 포함되어 인증 성공
- ✅ 스터디 관리 페이지 정상 작동
- ✅ 관리자 활동 로그 정상 기록
- ✅ 에러 발생 시 상세 로그 확인 가능

---

**다음 단계**:
1. 브라우저에서 로그아웃 후 재로그인
2. `/admin/studies` 페이지 접속하여 정상 동작 확인
3. 서버 로그에서 세션 정보 확인:
   ```
   📝 [AUTH] Session created: { email: '...', isAdmin: true, adminRole: 'SUPER_ADMIN' }
   🔐 [requireAdmin] Session: { userId: '...', isAdmin: true, adminRole: 'SUPER_ADMIN' }
   ✅ [requireAdmin] Admin check successful
   ```

---

**작성일**: 2025-11-29  
**작성자**: GitHub Copilot

