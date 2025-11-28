# CoUp 관리자 시스템 트러블슈팅 가이드

**버전**: 1.0.0  
**최종 업데이트**: 2025-11-29

---

## 📚 목차

1. [인증 문제](#인증-문제)
2. [데이터베이스 문제](#데이터베이스-문제)
3. [API 오류](#api-오류)
4. [UI 문제](#ui-문제)
5. [성능 문제](#성능-문제)
6. [배포 문제](#배포-문제)
7. [일반적인 에러](#일반적인-에러)

---

## 🔐 인증 문제

### 로그인 실패

#### 증상
```
로그인 버튼 클릭 시 "잘못된 이메일 또는 비밀번호" 오류
```

#### 원인
1. 잘못된 비밀번호
2. 관리자 권한 없음
3. 계정 정지 상태

#### 해결방법

**1. 비밀번호 확인**
```sql
-- 사용자 상태 확인
SELECT id, email, status, "hashedPassword" IS NOT NULL as has_password
FROM "User" 
WHERE email = 'admin@example.com';
```

**2. 비밀번호 재설정**
```javascript
// scripts/reset-password.js
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetPassword(email, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  })
  
  console.log(`비밀번호가 재설정되었습니다: ${email}`)
}

resetPassword('admin@example.com', 'newpassword123')
```

**3. 관리자 권한 확인**
```sql
-- 관리자 권한 확인
SELECT u.email, ar.role
FROM "User" u
LEFT JOIN "AdminRole" ar ON u.id = ar."userId"
WHERE u.email = 'admin@example.com';

-- 권한 없으면 부여
INSERT INTO "AdminRole" ("id", "userId", "role", "permissions", "grantedBy")
VALUES (
  gen_random_uuid()::text,
  (SELECT id FROM "User" WHERE email = 'admin@example.com'),
  'SUPER_ADMIN',
  '{}',
  'system'
);
```

---

### 세션 만료

#### 증상
```
로그인 후 몇 분만에 다시 로그인 화면으로 이동
```

#### 원인
1. NEXTAUTH_URL 잘못 설정
2. 쿠키 설정 문제
3. HTTPS/HTTP 불일치

#### 해결방법

**1. 환경 변수 확인**
```bash
# .env.local 확인
cat .env.local

# NEXTAUTH_URL 확인
NEXTAUTH_URL=http://localhost:3000  # 프로토콜 확인!
NEXTAUTH_SECRET=your-secret-here
```

**2. next-auth 설정 확인**
```javascript
// auth.config.js
export default {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}
```

**3. 쿠키 확인**
```javascript
// 브라우저 콘솔
document.cookie
// __Secure-next-auth.session-token 확인
```

---

### 권한 오류

#### 증상
```
403 Forbidden: 권한이 없습니다
```

#### 원인
1. 관리자 권한 없음
2. 잘못된 권한 레벨
3. 세션 만료

#### 해결방법

**1. 권한 확인**
```sql
-- 사용자 권한 조회
SELECT u.email, ar.role, ar.permissions
FROM "User" u
JOIN "AdminRole" ar ON u.id = ar."userId"
WHERE u.email = 'user@example.com';
```

**2. 권한 업그레이드**
```sql
-- MODERATOR → ADMIN
UPDATE "AdminRole" 
SET "role" = 'ADMIN' 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@example.com');
```

**3. 페이지별 권한 확인**
| 페이지 | VIEWER | MODERATOR | ADMIN | SUPER_ADMIN |
|--------|--------|-----------|-------|-------------|
| 대시보드 | ✅ | ✅ | ✅ | ✅ |
| 사용자 목록 | ✅ | ✅ | ✅ | ✅ |
| 사용자 정지 | ❌ | ❌ | ✅ | ✅ |
| 설정 변경 | ❌ | ❌ | ❌ | ✅ |

---

## 🗄️ 데이터베이스 문제

### 연결 실패

#### 증상
```
Error: Can't reach database server at `localhost:5432`
```

#### 원인
1. PostgreSQL 실행 안 됨
2. 잘못된 DATABASE_URL
3. 방화벽 차단
4. 네트워크 문제

#### 해결방법

**1. PostgreSQL 상태 확인**
```bash
# Windows
services.msc
# PostgreSQL 서비스 확인

# Linux/Mac
sudo systemctl status postgresql
# 또는
pg_isready
```

**2. PostgreSQL 시작**
```bash
# Windows
net start postgresql-x64-14

# Linux/Mac
sudo systemctl start postgresql
```

**3. 연결 테스트**
```bash
# psql로 직접 연결
psql -U coup -d coup -h localhost -p 5432

# 성공하면 DATABASE_URL 수정
DATABASE_URL="postgresql://coup:password@localhost:5432/coup"
```

**4. 방화벽 확인**
```bash
# Linux
sudo ufw allow 5432/tcp

# Windows
# 제어판 → Windows Defender 방화벽 → 인바운드 규칙
# 5432 포트 허용
```

---

### 마이그레이션 실패

#### 증상
```
Error: P3009: migrate found failed migrations
```

#### 원인
1. 이전 마이그레이션 실패
2. 스키마 불일치
3. 데이터 무결성 문제

#### 해결방법

**1. 마이그레이션 상태 확인**
```bash
npx prisma migrate status
```

**2. 실패한 마이그레이션 복구**
```bash
# 실패한 마이그레이션 확인
ls prisma/migrations/

# 해결 방법 1: 마이그레이션 재실행
npx prisma migrate resolve --applied "migration-name"

# 해결 방법 2: 마이그레이션 초기화 (개발 환경만!)
npx prisma migrate reset

# 해결 방법 3: 수동 수정
# 1. 데이터베이스 백업
pg_dump coup > backup.sql
# 2. 마이그레이션 수동 적용
psql -U coup -d coup -f prisma/migrations/xxx/migration.sql
# 3. Prisma에 기록
npx prisma migrate resolve --applied "migration-name"
```

**3. 프로덕션 환경**
```bash
# 프로덕션에서는 절대 reset 사용 금지!
# 대신 새 마이그레이션 생성
npx prisma migrate dev --name fix_migration_issue
npx prisma migrate deploy
```

---

### 느린 쿼리

#### 증상
```
API 응답 시간 > 2초
```

#### 원인
1. 인덱스 없음
2. N+1 쿼리
3. 대량 데이터
4. 비효율적인 쿼리

#### 해결방법

**1. 느린 쿼리 찾기**
```sql
-- PostgreSQL 느린 쿼리 로그 활성화
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1초 이상
SELECT pg_reload_conf();

-- 실행 중인 쿼리 확인
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;
```

**2. EXPLAIN ANALYZE**
```sql
EXPLAIN ANALYZE
SELECT * FROM "User"
WHERE "status" = 'ACTIVE'
ORDER BY "createdAt" DESC
LIMIT 20;

-- 결과 분석
-- Seq Scan → 인덱스 필요
-- Index Scan → 정상
```

**3. 인덱스 추가**
```sql
-- 자주 검색하는 컬럼에 인덱스
CREATE INDEX idx_user_status ON "User"("status");
CREATE INDEX idx_user_created ON "User"("createdAt");

-- 복합 인덱스
CREATE INDEX idx_user_status_created 
ON "User"("status", "createdAt");
```

**4. Prisma 쿼리 최적화**
```javascript
// ❌ 나쁜 예: N+1 쿼리
const users = await prisma.user.findMany()
for (const user of users) {
  const studies = await prisma.study.findMany({
    where: { ownerId: user.id }
  })
}

// ✅ 좋은 예: include 사용
const users = await prisma.user.findMany({
  include: {
    ownedStudies: true
  }
})

// ✅ 더 좋은 예: select로 필요한 것만
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    _count: {
      select: { ownedStudies: true }
    }
  }
})
```

---

## 🔌 API 오류

### 500 Internal Server Error

#### 증상
```json
{
  "error": "요청 처리 중 오류가 발생했습니다"
}
```

#### 원인
1. 코드 에러
2. 데이터베이스 에러
3. 환경 변수 누락
4. 타입 에러

#### 해결방법

**1. 로그 확인**
```bash
# 개발 환경
# 터미널 콘솔 확인

# 프로덕션 (Vercel)
vercel logs --follow

# 프로덕션 (Docker)
docker-compose logs -f app
```

**2. 에러 디버깅**
```javascript
// API route에 에러 핸들링 추가
export async function GET(request) {
  try {
    // ... 코드 ...
  } catch (error) {
    console.error('API Error:', error)
    console.error('Stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
```

**3. 일반적인 원인**
```javascript
// Prisma 클라이언트 초기화 안 됨
// 해결: npx prisma generate

// 환경 변수 없음
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

// 타입 에러
// 해결: TypeScript 사용 또는 런타임 검증
if (typeof userId !== 'string') {
  return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
}
```

---

### 404 Not Found

#### 증상
```
API route not found
```

#### 원인
1. 잘못된 경로
2. 파일 이름 오타
3. 라우팅 규칙 오류

#### 해결방법

**1. 파일 구조 확인**
```
src/app/api/admin/users/
├── route.js          ← GET /api/admin/users
└── [userId]/
    ├── route.js      ← GET /api/admin/users/[userId]
    └── warn/
        └── route.js  ← POST /api/admin/users/[userId]/warn
```

**2. route.js 확인**
```javascript
// ❌ 잘못된 export
export default async function GET() { }

// ✅ 올바른 export
export async function GET(request) { }
export async function POST(request) { }
```

**3. 경로 확인**
```javascript
// 클라이언트에서 호출
// ❌ 잘못된 경로
fetch('/api/admin/user/123/warn')  // users가 아니라 user

// ✅ 올바른 경로
fetch('/api/admin/users/123/warn')
```

---

### CORS 에러

#### 증상
```
Access to fetch at '...' has been blocked by CORS policy
```

#### 원인
1. 다른 도메인에서 요청
2. CORS 헤더 미설정
3. 프리플라이트 요청 실패

#### 해결방법

**1. next.config.js 설정**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // 또는 특정 도메인
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
```

**2. API route에서 처리**
```javascript
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
```

---

## 🎨 UI 문제

### 페이지 로딩 안 됨

#### 증상
```
흰 화면만 표시되거나 무한 로딩
```

#### 원인
1. JavaScript 에러
2. API 호출 실패
3. 컴포넌트 에러

#### 해결방법

**1. 브라우저 콘솔 확인**
```
F12 → Console 탭
에러 메시지 확인
```

**2. 네트워크 탭 확인**
```
F12 → Network 탭
실패한 요청 확인
```

**3. React DevTools**
```
React DevTools 설치
컴포넌트 트리 확인
props/state 확인
```

**4. 일반적인 원인**
```javascript
// 1. useEffect 무한 루프
useEffect(() => {
  fetchData()  // fetchData가 state를 변경하면 무한 루프
}, [])  // 의존성 배열 확인!

// 2. 조건부 렌더링 에러
if (!data) return null  // 또는 <Loading />
return <div>{data.name}</div>

// 3. API 에러 처리
const [error, setError] = useState(null)
if (error) return <div>에러: {error.message}</div>
```

---

### 스타일 깨짐

#### 증상
```
CSS가 적용되지 않거나 레이아웃 깨짐
```

#### 원인
1. CSS Module import 오류
2. 클래스명 오타
3. CSS 우선순위 문제

#### 해결방법

**1. CSS Module 확인**
```javascript
// ❌ 잘못된 import
import './styles.css'

// ✅ 올바른 import
import styles from './styles.module.css'

// 사용
<div className={styles.container}>
```

**2. 클래스명 확인**
```javascript
// CSS Module은 자동으로 클래스명 변환
// styles.container → Button_container__abc123

// 브라우저 검사 도구로 실제 클래스명 확인
```

**3. 전역 스타일 충돌**
```css
/* globals.css에서 */
/* ❌ 너무 광범위한 선택자 */
div {
  margin: 0;
}

/* ✅ 구체적인 선택자 */
.admin-layout div {
  margin: 0;
}
```

---

### 모달 동작 안 함

#### 증상
```
모달이 열리지 않거나 닫히지 않음
```

#### 원인
1. state 업데이트 안 됨
2. 이벤트 버블링
3. z-index 문제

#### 해결방법

**1. state 확인**
```javascript
const [isOpen, setIsOpen] = useState(false)

// 열기
<button onClick={() => setIsOpen(true)}>열기</button>

// 닫기
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
```

**2. 이벤트 버블링 방지**
```javascript
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
```

**3. z-index 설정**
```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  position: relative;
  z-index: 1001;
}
```

---

## ⚡ 성능 문제

### 페이지 로딩 느림

#### 증상
```
페이지 로드 시간 > 3초
```

#### 원인
1. 큰 번들 사이즈
2. 불필요한 데이터 로드
3. 최적화 안 된 이미지
4. 너무 많은 API 호출

#### 해결방법

**1. 번들 사이즈 분석**
```bash
npm run build

# 출력 확인
Route (app)                              Size     First Load JS
┌ ○ /admin/analytics                     12.5 kB        158 kB  ← 큼!
```

**2. 동적 임포트**
```javascript
// ❌ 정적 import (번들에 포함)
import { LineChart } from 'recharts'

// ✅ 동적 import (필요할 때만 로드)
import dynamic from 'next/dynamic'
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart))
```

**3. 이미지 최적화**
```javascript
// ❌ img 태그
<img src="/large-image.jpg" />

// ✅ Next.js Image
import Image from 'next/image'
<Image 
  src="/large-image.jpg" 
  width={500} 
  height={300} 
  alt="..."
/>
```

**4. API 호출 최적화**
```javascript
// ❌ 여러 번 호출
useEffect(() => {
  fetchUsers()
  fetchStudies()
  fetchReports()
}, [])

// ✅ 한 번에 호출
useEffect(() => {
  Promise.all([
    fetchUsers(),
    fetchStudies(),
    fetchReports()
  ])
}, [])
```

---

### 메모리 누수

#### 증상
```
시간이 지날수록 페이지가 느려짐
브라우저 탭 멈춤
```

#### 원인
1. useEffect cleanup 안 함
2. 이벤트 리스너 제거 안 함
3. setInterval/setTimeout 정리 안 함

#### 해결방법

**1. useEffect cleanup**
```javascript
// ❌ cleanup 없음
useEffect(() => {
  const interval = setInterval(() => {
    fetchData()
  }, 5000)
}, [])

// ✅ cleanup 있음
useEffect(() => {
  const interval = setInterval(() => {
    fetchData()
  }, 5000)
  
  return () => clearInterval(interval)  // cleanup!
}, [])
```

**2. 이벤트 리스너**
```javascript
useEffect(() => {
  function handleResize() {
    setWindowWidth(window.innerWidth)
  }
  
  window.addEventListener('resize', handleResize)
  
  return () => {
    window.removeEventListener('resize', handleResize)  // cleanup!
  }
}, [])
```

**3. 비동기 작업**
```javascript
useEffect(() => {
  let cancelled = false
  
  async function fetchData() {
    const data = await api.getUsers()
    if (!cancelled) {  // 컴포넌트 언마운트 체크
      setUsers(data)
    }
  }
  
  fetchData()
  
  return () => {
    cancelled = true  // cleanup!
  }
}, [])
```

---

## 🚀 배포 문제

### Vercel 배포 실패

#### 증상
```
Build Error: Command failed with exit code 1
```

#### 원인
1. 빌드 에러
2. 환경 변수 누락
3. 의존성 문제

#### 해결방법

**1. 로컬에서 빌드 테스트**
```bash
npm run build

# 에러 발생 시 수정 후 다시 테스트
```

**2. 환경 변수 확인**
```bash
# Vercel 대시보드
Settings → Environment Variables

# 필수 변수
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
```

**3. 의존성 확인**
```bash
# package.json 확인
# devDependencies vs dependencies

# 빌드에 필요한 패키지는 dependencies에
npm install --save package-name
```

**4. Vercel 로그 확인**
```bash
vercel logs [deployment-url]
```

---

### 환경 변수 미적용

#### 증상
```
프로덕션에서 환경 변수가 undefined
```

#### 원인
1. Vercel에 환경 변수 미설정
2. 잘못된 환경 (Production vs Preview)
3. 재배포 필요

#### 해결방법

**1. 환경 변수 설정 확인**
```
Vercel Dashboard
→ Project Settings
→ Environment Variables
→ Production 탭 확인
```

**2. 환경 구분**
```
Production: 프로덕션 배포
Preview: PR, 브랜치 배포
Development: vercel dev
```

**3. 재배포**
```bash
# 환경 변수 변경 후 재배포
vercel --prod --force
```

---

## 🐛 일반적인 에러

### "Module not found"

#### 해결
```bash
# 1. node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 2. 캐시 정리
npm cache clean --force

# 3. Prisma 재생성
npx prisma generate
```

---

### "Cannot find module '@prisma/client'"

#### 해결
```bash
npx prisma generate
npm install @prisma/client
```

---

### "NEXTAUTH_SECRET must be provided"

#### 해결
```bash
# .env.local에 추가
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# 또는 수동으로
NEXTAUTH_SECRET="your-generated-secret-here"
```

---

### "Port 3000 is already in use"

#### 해결
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# 또는 다른 포트 사용
PORT=3001 npm run dev
```

---

## 📞 추가 도움이 필요한 경우

### 1. 로그 수집
```bash
# 시스템 정보
node --version
npm --version
npx prisma --version

# 에러 로그
cat logs/error.log

# 환경 변수 (민감 정보 제외)
echo $NODE_ENV
```

### 2. 재현 단계 문서화
```markdown
1. 페이지 접속: /admin/users
2. 버튼 클릭: "정지"
3. 에러 발생: 500 Internal Server Error
```

### 3. 스크린샷
- 에러 메시지
- 브라우저 콘솔
- 네트워크 탭

### 4. 연락처
- GitHub Issues: https://github.com/your-repo/issues
- 이메일: dev@coup.com
- Discord: https://discord.gg/coup

---

**마지막 업데이트**: 2025-11-29  
**다음 업데이트**: 매월 1일

