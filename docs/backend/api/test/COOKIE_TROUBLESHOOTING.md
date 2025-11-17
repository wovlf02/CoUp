# Postman 쿠키 문제 해결 가이드

## 🔍 문제 증상

로그인 후에도 다른 API 호출 시:
```json
{
  "error": "로그인이 필요합니다"
}
```

---

## ✅ 해결 방법

### 1. Postman 쿠키 설정 확인

#### Step 1: Cookies 관리 열기
```
1. Postman 우측 상단 "Cookies" 버튼 클릭
2. "Manage Cookies" 창 열림
```

#### Step 2: localhost 쿠키 확인
```
Domain: localhost:3000
찾기: auth-token

있어야 함:
┌────────────────────────────────────────┐
│ Domain: localhost:3000                 │
│ Name: auth-token                       │
│ Value: eyJhbGciOiJIUzI1NiIsInR5cCI... │
│ Path: /                                │
│ HttpOnly: ✓                            │
└────────────────────────────────────────┘
```

### 2. 쿠키가 없다면?

#### 다시 로그인
```http
POST http://localhost:3000/api/auth/login

{
  "email": "kim@example.com",
  "password": "password123"
}
```

**응답 확인:**
```json
{
  "success": true,
  "message": "로그인 성공",
  "user": { ... },
  "token": "eyJhbGci..."  // ← 토큰이 있어야 함
}
```

#### 쿠키가 자동으로 저장됨
Postman이 자동으로 `auth-token` 쿠키를 저장합니다.

### 3. 쿠키 수동 설정 (필요한 경우)

만약 자동 저장이 안 되면:

```
1. Postman 로그인 요청 응답에서 token 복사
2. Cookies 관리 열기
3. Add Cookie 클릭
4. 다음 형식으로 입력:

auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI...; Path=/; Domain=localhost
```

---

## 🧪 테스트

### 1. 로그인 확인
```http
GET http://localhost:3000/api/auth/me
```

**성공 응답:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "kim@example.com",
    "name": "김민준"
  }
}
```

**실패 시:**
```json
{
  "error": "로그인이 필요합니다"
}
```
→ 다시 로그인 필요

### 2. 스터디 생성 테스트
```http
POST http://localhost:3000/api/studies

{
  "name": "테스트 스터디",
  "description": "Postman 테스트용 스터디입니다",
  "category": "프로그래밍",
  "emoji": "🧪"
}
```

**성공 응답:**
```json
{
  "success": true,
  "message": "스터디가 생성되었습니다",
  "data": {
    "id": "new-study-id",
    ...
  }
}
```

---

## 🔧 Postman 설정

### Cookie 자동 관리 활성화

```
Settings (⚙️) → General
→ ✓ Automatically follow redirects
→ ✓ Send cookies with requests
```

### Same-Site 쿠키 허용

```
Settings (⚙️) → Cookies
→ Cookie handling: ✓ Allow all cookies
```

---

## 🐛 여전히 안 되면?

### 방법 1: Collection 변수로 토큰 저장

#### 로그인 요청의 Tests 탭에 추가:
```javascript
const jsonData = pm.response.json();
if (jsonData.token) {
    pm.collectionVariables.set('authToken', jsonData.token);
}
```

#### 다른 요청의 Headers에 추가:
```
Key: Cookie
Value: auth-token={{authToken}}
```

### 방법 2: Authorization 헤더 사용

#### 로그인 API 수정 필요 (Bearer 토큰)

현재는 쿠키 방식이므로 이 방법은 나중에 필요할 때 구현

---

## 📝 체크리스트

로그인 후 API 호출이 안 되면:

- [ ] 로그인 응답에서 `token` 있는지 확인
- [ ] Postman Cookies에서 `auth-token` 쿠키 있는지 확인
- [ ] `/api/auth/me` 요청으로 세션 확인
- [ ] Postman 설정에서 "Send cookies with requests" 체크
- [ ] 같은 도메인(`localhost:3000`) 사용하는지 확인
- [ ] 브라우저 대신 Postman 사용 확인

---

**작성일**: 2025-11-18

