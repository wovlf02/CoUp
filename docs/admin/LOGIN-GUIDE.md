# 🔐 관리자 로그인 가이드

**최종 업데이트**: 2025-11-29

---

## ✅ 로그인 정보

### 기본 관리자 계정
```
이메일: admin@coup.com
비밀번호: Admin123!
권한: SUPER_ADMIN
```

---

## 🚀 로그인 방법

### 1. 개발 서버 실행
```bash
cd C:\Project\CoUp\coup
npm run dev
```

### 2. 로그인 페이지 접속
```
http://localhost:3000/sign-in
```

**중요**: 일반 사용자와 관리자 모두 동일한 로그인 페이지를 사용합니다.

### 3. 계정으로 로그인

#### 관리자 계정
- **이메일**: `admin@coup.com`
- **비밀번호**: `Admin123!`
- **로그인 후**: 자동으로 `/admin` (관리자 대시보드)로 이동

#### 일반 사용자 계정
- **로그인 후**: 자동으로 `/dashboard` (사용자 대시보드)로 이동

### 4. 자동 리다이렉션 동작

시스템은 로그인 성공 후 자동으로 사용자 권한을 확인합니다:

```
로그인 성공
    ↓
관리자 권한 확인 (AdminRole 체크)
    ↓
┌─────────────┬─────────────┐
│ 관리자 O    │ 관리자 X    │
│ /admin      │ /dashboard  │
└─────────────┴─────────────┘
```

**로그**:
- 관리자: `🔐 관리자 계정 확인, /admin으로 이동`
- 일반 사용자: `👤 일반 사용자 계정, /dashboard로 이동`

---

## 🔧 문제 해결

### 로그인 실패 시

#### 1. 관리자 계정 재생성
```bash
cd C:\Project\CoUp\coup
node scripts/create-test-admin.js
```

출력:
```
✅ 사용자 생성: admin@coup.com
✅ 관리자 역할 부여: SUPER_ADMIN

로그인 정보:
  이메일: admin@coup.com
  비밀번호: Admin123!
  역할: SUPER_ADMIN
```

#### 2. 관리자 계정 확인
```bash
node scripts/check-admin.js
```

출력:
```
✅ 관리자 계정 발견:
  ID: clx...
  이메일: admin@coup.com
  이름: 테스트 관리자
  상태: ACTIVE
  비밀번호 해시: 설정됨
  관리자 역할: SUPER_ADMIN
```

#### 3. 로그인 테스트
```bash
node scripts/test-login.js
```

출력:
```
🔐 로그인 테스트 시작...
✅ 사용자 발견: admin@coup.com
🔑 비밀번호 검증: ✅ 성공
✅ 계정 상태 정상
✅ 관리자 권한: SUPER_ADMIN
✅ 로그인 성공!
```

### 디버깅

#### 개발 서버 로그 확인
로그인 시도 시 터미널에 다음과 같은 로그가 출력됩니다:
```
🔐 [AUTH] authorize 시작
🔐 [AUTH] credentials: { email: 'admin@coup.com', hasPassword: true }
🔍 [AUTH] 사용자 조회 중: admin@coup.com
✅ [AUTH] 사용자 발견: { id: 'clx...', email: 'admin@coup.com', status: 'ACTIVE' }
🔑 [AUTH] 비밀번호 검증 중...
🔑 [AUTH] 비밀번호 검증 결과: true
✅ [AUTH] 로그인 성공, lastLoginAt 업데이트 중...
✅ [AUTH] authorize 완료
```

#### 401 에러 발생 시
터미널에서 정확한 에러 원인을 확인하세요:
```
❌ [AUTH] 이메일 또는 비밀번호 누락
❌ [AUTH] 사용자를 찾을 수 없음
❌ [AUTH] 비밀번호 불일치
❌ [AUTH] 삭제된 계정
❌ [AUTH] 정지된 계정
```

### 일반적인 문제

#### 문제 1: "이메일 또는 비밀번호가 일치하지 않습니다"
**원인**: 
- 잘못된 이메일 또는 비밀번호
- 관리자 계정이 생성되지 않음

**해결**:
```bash
node scripts/create-test-admin.js
```

#### 문제 2: 로그인 후 대시보드가 보이지 않음
**원인**: 
- 관리자 권한이 없음
- 세션이 올바르게 생성되지 않음

**해결**:
```bash
# 관리자 권한 확인
node scripts/check-admin.js

# 브라우저 쿠키 및 캐시 삭제
# 개발자 도구(F12) → Application → Storage → Clear site data
```

#### 문제 3: "권한이 없습니다" 오류
**원인**: 
- SUPER_ADMIN 권한이 없음
- AdminRole이 설정되지 않음

**해결**:
```bash
# 관리자 계정 재생성 (권한 자동 부여)
node scripts/create-test-admin.js
```

#### 문제 4: "Failed to fetch stats" 또는 대시보드 로딩 오류
**원인**: 
- API 서버 응답 실패
- 세션 정보가 전달되지 않음
- 데이터베이스 연결 오류

**해결**:
```bash
# 1. 개발 서버 재시작
# Ctrl+C로 중지 후
npm run dev

# 2. 데이터베이스 연결 확인
npx prisma db push

# 3. 브라우저 콘솔(F12) 확인
# Network 탭에서 /api/admin/stats 요청 확인
# Console 탭에서 에러 메시지 확인
```

---

## 📋 관리자 계정 관리

### 새 관리자 계정 생성

#### 스크립트 사용 (권장)
```bash
node scripts/create-test-admin.js
```

#### 수동 생성
```javascript
// scripts/create-custom-admin.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  const email = 'your-email@example.com'
  const password = 'YourPassword123!'
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Your Name',
      role: 'USER',
      status: 'ACTIVE',
      provider: 'CREDENTIALS',
    },
  })

  await prisma.adminRole.create({
    data: {
      userId: user.id,
      role: 'SUPER_ADMIN',
      permissions: { all: true },
      grantedBy: user.id,
    },
  })

  console.log('✅ 관리자 생성 완료')
  console.log('이메일:', email)
  console.log('비밀번호:', password)
  
  await prisma.$disconnect()
}

createAdmin()
```

### 관리자 권한 변경

```javascript
// scripts/update-admin-role.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateRole() {
  const email = 'user@example.com'
  const newRole = 'ADMIN' // SUPER_ADMIN, ADMIN, MODERATOR, VIEWER

  const user = await prisma.user.findUnique({ where: { email } })
  
  await prisma.adminRole.update({
    where: { userId: user.id },
    data: { role: newRole }
  })

  console.log('✅ 권한 변경 완료:', newRole)
  await prisma.$disconnect()
}

updateRole()
```

---

## 🔐 보안 고려사항

### 프로덕션 환경

#### 1. 기본 관리자 계정 변경
```
⚠️ 프로덕션에서는 반드시 기본 계정을 변경하세요!
- 이메일 변경
- 강력한 비밀번호 설정
- 2단계 인증 추가 (향후)
```

#### 2. 환경 변수 보안
```bash
# .env.production
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="strong-random-secret-here"  # 필수!
NEXTAUTH_URL="https://your-domain.com"
```

NEXTAUTH_SECRET 생성:
```bash
openssl rand -base64 32
```

#### 3. HTTPS 사용
```
프로덕션에서는 반드시 HTTPS를 사용하세요.
- Let's Encrypt 무료 SSL 인증서
- Vercel/Netlify 자동 HTTPS
```

---

## 📱 관리자 페이지 목록

로그인 후 접근 가능한 페이지:

### 메인
- **대시보드**: `/admin`

### 관리
- **사용자 관리**: `/admin/users`
- **스터디 관리**: `/admin/studies`
- **신고 처리**: `/admin/reports`

### 분석
- **통계 분석**: `/admin/analytics`

### 설정
- **시스템 설정**: `/admin/settings`
- **감사 로그**: `/admin/audit-logs`

---

## 🎯 권한 레벨

### SUPER_ADMIN (최고 관리자)
- ✅ 모든 기능 접근 가능
- ✅ 시스템 설정 변경
- ✅ 관리자 계정 관리
- ✅ 모든 데이터 조회/수정/삭제

### ADMIN (관리자)
- ✅ 사용자 관리
- ✅ 스터디 관리
- ✅ 신고 처리
- ✅ 통계 조회
- ❌ 시스템 설정 변경 (조회만)
- ❌ 관리자 계정 관리

### MODERATOR (운영자)
- ✅ 신고 처리
- ✅ 콘텐츠 관리 (숨김, 삭제)
- ✅ 사용자 경고 부여
- ❌ 사용자 정지
- ❌ 시스템 설정

### VIEWER (조회자)
- ✅ 대시보드 조회
- ✅ 통계 조회
- ❌ 모든 변경 작업

---

## 📞 지원

### 문제가 계속 발생하는 경우

1. **GitHub Issues**: https://github.com/your-repo/issues
2. **이메일**: dev@coup.com
3. **문서**: [트러블슈팅 가이드](./TROUBLESHOOTING-GUIDE.md)

---

**마지막 업데이트**: 2025-11-29

