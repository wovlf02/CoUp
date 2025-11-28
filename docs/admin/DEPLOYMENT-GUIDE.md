# CoUp 관리자 시스템 배포 가이드

**버전**: 1.0.0  
**최종 업데이트**: 2025-11-29

---

## 📚 목차

1. [사전 준비](#사전-준비)
2. [환경 변수 설정](#환경-변수-설정)
3. [데이터베이스 설정](#데이터베이스-설정)
4. [로컬 개발 환경](#로컬-개발-환경)
5. [프로덕션 빌드](#프로덕션-빌드)
6. [배포 (Vercel)](#배포-vercel)
7. [배포 (Docker)](#배포-docker)
8. [배포 후 점검](#배포-후-점검)
9. [문제 해결](#문제-해결)

---

## 📋 사전 준비

### 시스템 요구사항

#### 개발 환경
- Node.js 18.x 이상
- npm 9.x 이상
- PostgreSQL 14.x 이상
- Git

#### 프로덕션 환경
- 최소 1GB RAM
- 10GB 디스크 공간
- HTTPS 지원 도메인

### 필수 계정
- [ ] GitHub 계정 (소스 코드 저장)
- [ ] Vercel 계정 (배포)
- [ ] PostgreSQL 데이터베이스 (Supabase, Railway 등)
- [ ] 이메일 서비스 (선택사항)

---

## 🔐 환경 변수 설정

### 개발 환경 (.env.local)

```bash
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/coup?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"

# OAuth (선택사항)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# 기타
NODE_ENV="development"
```

### 프로덕션 환경 (.env.production)

```bash
# 데이터베이스
DATABASE_URL="postgresql://user:password@production-host:5432/coup?schema=public"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth
GOOGLE_CLIENT_ID="production-google-client-id"
GOOGLE_CLIENT_SECRET="production-google-client-secret"
GITHUB_CLIENT_ID="production-github-client-id"
GITHUB_CLIENT_SECRET="production-github-client-secret"

# 기타
NODE_ENV="production"
```

### NEXTAUTH_SECRET 생성

```bash
# 방법 1: OpenSSL
openssl rand -base64 32

# 방법 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 결과 예시
# aBc123dEf456gHi789jKl012mNo345pQr==
```

---

## 🗄️ 데이터베이스 설정

### PostgreSQL 설치 (로컬)

#### Windows
```bash
# Chocolatey 사용
choco install postgresql

# 또는 공식 설치 파일
# https://www.postgresql.org/download/windows/
```

#### macOS
```bash
# Homebrew 사용
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE coup;

# 사용자 생성 (선택사항)
CREATE USER coup_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE coup TO coup_user;

# 종료
\q
```

### Prisma 마이그레이션

```bash
cd coup

# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate deploy

# 또는 개발 환경에서
npx prisma migrate dev
```

### 초기 데이터 시드

```bash
# 관리자 계정 생성
node scripts/create-test-admin.js

# 시스템 설정 초기화
node scripts/seed-settings.js

# 테스트 데이터 (선택사항)
node prisma/seed.js
```

---

## 💻 로컬 개발 환경

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/coup.git
cd coup/coup
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local

# 편집기로 열어서 값 수정
nano .env.local
```

### 4. 데이터베이스 설정

```bash
# Prisma 생성
npx prisma generate

# 마이그레이션
npx prisma migrate dev

# 시드 데이터
node scripts/create-test-admin.js
node scripts/seed-settings.js
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 6. 관리자 페이지 접속

```
URL: http://localhost:3000/sign-in
ID: admin@coup.com
PW: Admin123!
```

로그인 성공 시 자동으로 관리자 대시보드(`/admin`)로 이동합니다.

---

## 🏗️ 프로덕션 빌드

### 1. 빌드 전 점검

```bash
# 환경 변수 확인
cat .env.production

# 의존성 업데이트
npm update

# 린트 검사
npm run lint

# 타입 체크 (TypeScript 사용 시)
npm run type-check
```

### 2. 프로덕션 빌드

```bash
# 빌드
npm run build

# 결과 확인
ls -la .next
```

### 3. 로컬에서 프로덕션 테스트

```bash
# 프로덕션 모드 실행
npm run start

# 브라우저에서 테스트
# http://localhost:3000
```

### 4. 빌드 최적화 확인

```bash
# 번들 사이즈 분석
npm run analyze

# 또는 Next.js 빌드 출력 확인
Route (app)                              Size     First Load JS
┌ ○ /admin                               1.8 kB         88 kB
├ ○ /admin/analytics                     12.5 kB        158 kB
...
```

---

## 🚀 배포 (Vercel)

### 1. Vercel CLI 설치

```bash
npm install -g vercel
```

### 2. Vercel 로그인

```bash
vercel login
```

### 3. 프로젝트 연결

```bash
cd coup
vercel link
```

### 4. 환경 변수 설정

#### 방법 1: Vercel 대시보드
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. 환경 변수 추가:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - OAuth 키들

#### 방법 2: CLI
```bash
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
```

### 5. 배포

```bash
# 프리뷰 배포 (테스트)
vercel

# 프로덕션 배포
vercel --prod
```

### 6. 도메인 설정

#### Vercel 대시보드에서
1. Settings → Domains
2. 커스텀 도메인 추가
3. DNS 설정 (A 레코드 또는 CNAME)

#### DNS 설정 예시
```
Type: CNAME
Name: admin (또는 @)
Value: your-project.vercel.app
```

---

## 🐳 배포 (Docker)

### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 의존성 설치
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 프로덕션
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: coup
      POSTGRES_PASSWORD: coup_password
      POSTGRES_DB: coup
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://coup:coup_password@db:5432/coup
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: your-secret-here
    depends_on:
      - db

volumes:
  postgres_data:
```

### 빌드 및 실행

```bash
# 빌드
docker-compose build

# 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 중지
docker-compose down
```

---

## ✅ 배포 후 점검

### 1. 서비스 상태 확인

```bash
# 헬스 체크
curl https://your-domain.com/api/health

# 응답 예시
{"status": "ok", "timestamp": "2025-11-29T10:00:00.000Z"}
```

### 2. 데이터베이스 연결 확인

```bash
# Prisma Studio 실행 (로컬에서)
npx prisma studio

# 또는 직접 쿼리
npx prisma db seed
```

### 3. 관리자 로그인 테스트

1. https://your-domain.com/admin 접속
2. 관리자 계정으로 로그인
3. 대시보드 정상 표시 확인

### 4. API 엔드포인트 테스트

```bash
# 사용자 목록 API
curl -X GET https://your-domain.com/api/admin/users \
  -H "Cookie: session-token" \
  -H "Content-Type: application/json"

# 통계 API
curl -X GET https://your-domain.com/api/admin/analytics/overview
```

### 5. 성능 확인

```bash
# Lighthouse 점수
npx lighthouse https://your-domain.com/admin --view

# 목표
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90
```

---

## 🔧 문제 해결

### 데이터베이스 연결 실패

#### 증상
```
Error: Can't reach database server at `localhost:5432`
```

#### 해결
1. PostgreSQL 실행 확인
```bash
# Windows
services.msc에서 postgresql 확인

# Linux/Mac
sudo systemctl status postgresql
```

2. DATABASE_URL 확인
```bash
echo $DATABASE_URL
# 또는
cat .env.local
```

3. 방화벽 확인
```bash
# PostgreSQL 포트 열기
sudo ufw allow 5432
```

### 빌드 실패

#### 증상
```
Error: Cannot find module '@prisma/client'
```

#### 해결
```bash
# Prisma 재생성
npx prisma generate

# node_modules 재설치
rm -rf node_modules
rm package-lock.json
npm install
```

### 환경 변수 미적용

#### 증상
```
Error: NEXTAUTH_SECRET is not defined
```

#### 해결
1. Vercel: 대시보드에서 환경 변수 확인
2. 재배포: `vercel --prod --force`
3. 로컬: 서버 재시작

### CORS 에러

#### 증상
```
Access to fetch at 'https://api.example.com' from origin 'https://your-domain.com' has been blocked by CORS
```

#### 해결
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ]
      }
    ]
  }
}
```

### 세션 만료 문제

#### 증상
```
계속 로그아웃됨
```

#### 해결
1. NEXTAUTH_URL 확인 (프로토콜 포함)
```bash
NEXTAUTH_URL="https://your-domain.com"  # http:// 아님!
```

2. 쿠키 설정 확인
```javascript
// auth.config.js
cookies: {
  sessionToken: {
    name: '__Secure-next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true  // HTTPS에서만 true
    }
  }
}
```

---

## 📊 모니터링

### 로그 확인

#### Vercel
```bash
# 실시간 로그
vercel logs --follow

# 특정 배포 로그
vercel logs [deployment-url]
```

#### Docker
```bash
# 컨테이너 로그
docker-compose logs -f app

# 데이터베이스 로그
docker-compose logs -f db
```

### 성능 모니터링

#### Vercel Analytics
1. Vercel 대시보드 → Analytics
2. 페이지 로드 시간 확인
3. API 응답 시간 확인

#### 커스텀 모니터링
```javascript
// lib/logger.js
export function logPerformance(metric) {
  console.log({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
  })
}
```

---

## 🔄 업데이트 배포

### Git을 통한 자동 배포

```bash
# 코드 변경
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main

# Vercel이 자동으로 배포
# 대시보드에서 진행 상황 확인
```

### 수동 배포

```bash
# Vercel
vercel --prod

# Docker
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 📚 추가 리소스

### 공식 문서
- [Next.js 배포](https://nextjs.org/docs/deployment)
- [Vercel 배포](https://vercel.com/docs)
- [Prisma 배포](https://www.prisma.io/docs/guides/deployment)

### 추천 서비스
- **데이터베이스**: Supabase, Railway, Neon
- **배포**: Vercel, Netlify, AWS
- **모니터링**: Sentry, LogRocket
- **분석**: Google Analytics, Vercel Analytics

---

**문의**: admin@coup.com

