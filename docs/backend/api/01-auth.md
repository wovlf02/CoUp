# 인증 API 명세

## 📋 개요
- **Base URL**: `/api/auth`
- **인증 방식**: JWT (NextAuth.js)
- **총 엔드포인트**: 3개

---

## 🔐 API 목록

### 1. 회원가입
**POST** `/api/auth/signup`

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동" // 선택
}
```

#### Validation
- `email`: 이메일 형식 검증
- `password`: 최소 8자 이상
- `name`: 최소 2자 이상 (선택)

#### Response (201)
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "user": {
    "id": "clxx123...",
    "email": "user@example.com",
    "name": "홍길동",
    "createdAt": "2025-11-18T10:00:00.000Z"
  }
}
```

#### Error Responses
- **400**: 유효성 검사 실패
  ```json
  {
    "error": "이메일 형식이 올바르지 않습니다"
  }
  ```
- **400**: 이메일 중복
  ```json
  {
    "error": "이미 사용 중인 이메일입니다"
  }
  ```

---

### 2. 로그인
**POST** `/api/auth/[...nextauth]`

NextAuth.js의 `signIn()` 함수 사용

#### Client Usage
```javascript
import { signIn } from 'next-auth/react'

const result = await signIn('credentials', {
  email: 'user@example.com',
  password: 'password123',
  redirect: false
})

if (result?.ok) {
  // 로그인 성공
  router.push('/dashboard')
}
```

#### Response
- 성공 시: 세션 쿠키 설정 후 리다이렉트
- 실패 시: `result.error` 메시지 반환

#### Error Messages
- `"이메일과 비밀번호를 입력해주세요"`
- `"가입되지 않은 이메일입니다"`
- `"비밀번호가 일치하지 않습니다"`
- `"정지된 계정입니다 (YYYY-MM-DD까지)"`
- `"삭제된 계정입니다"`

---

### 3. 로그아웃
**GET** `/api/auth/signout`

NextAuth.js의 `signOut()` 함수 사용

#### Client Usage
```javascript
import { signOut } from 'next-auth/react'

await signOut({ callbackUrl: '/' })
```

---

## 🔒 세션 정보

### 세션 객체 구조
```javascript
{
  user: {
    id: "clxx123...",
    email: "user@example.com",
    name: "홍길동",
    role: "USER", // USER | ADMIN | SYSTEM_ADMIN
    avatar: "https://..."
  },
  expires: "2025-11-19T10:00:00.000Z"
}
```

### 세션 확인
```javascript
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()

if (status === 'authenticated') {
  console.log(session.user)
}
```

---

## 🛡️ 보호된 라우트

### 미들웨어 (middleware.js)
```javascript
// 공개 경로
const publicPaths = ['/', '/sign-in', '/sign-up', '/privacy', '/terms']

// 보호된 경로 (로그인 필요)
- /dashboard
- /my-studies
- /studies/[id] (멤버만)
- /tasks
- /notifications
- /me

// 관리자 경로 (ADMIN+ 필요)
- /admin/*
```

---

## 📝 Notes

### 비밀번호 보안
- bcrypt 해싱 사용 (rounds: 10)
- 저장: 해시된 비밀번호만 DB에 저장
- 검증: bcrypt.compare() 사용

### 세션 관리
- 전략: JWT (서버리스 환경)
- 만료: 24시간
- 갱신: 자동 (페이지 이동 시)

### 로그인 시 업데이트
```javascript
// lastLoginAt 자동 업데이트
await prisma.user.update({
  where: { id: user.id },
  data: { lastLoginAt: new Date() }
})
```

---

**최종 업데이트**: 2025-11-18

