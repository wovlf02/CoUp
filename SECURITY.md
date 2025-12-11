# 보안 가이드 (Security Guide)

## ⚠️ 중요 보안 공지

이 저장소는 **public** 상태입니다. 모든 민감한 정보는 제거되었습니다.

## 🔐 환경 변수 보안

### .env 파일

저장소의 `.env` 파일들은 **예시 값만** 포함합니다:

- `coup/.env` - 메인 애플리케이션 환경 변수
- `signaling-server/.env` - 시그널링 서버 환경 변수

### 실제 운영 시 필수 변경 사항

#### 1. Database URL
```env
# ❌ 절대 사용하지 마세요
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/coup"

# ✅ 강력한 비밀번호 사용
DATABASE_URL="postgresql://postgres:SecureP@ssw0rd!2024@localhost:5432/coup"
```

#### 2. NextAuth Secret
```bash
# 랜덤 32자 이상 문자열 생성
openssl rand -base64 32
```

```env
# ❌ 절대 사용하지 마세요
NEXTAUTH_SECRET="generate-a-secure-32-char-secret-here"

# ✅ 생성된 랜덤 문자열 사용
NEXTAUTH_SECRET="실제로_생성된_랜덤_문자열을_여기에"
```

#### 3. Email SMTP 설정
```env
# ❌ 절대 사용하지 마세요
NAVER_SMTP_USER="your-email@naver.com"
NAVER_SMTP_PASSWORD="your-app-password"

# ✅ 실제 계정 정보 사용
NAVER_SMTP_USER="actual-email@naver.com"
NAVER_SMTP_PASSWORD="actual-app-password"
```

## 🛡️ 보안 체크리스트

프로덕션 배포 전 확인사항:

- [ ] `.env` 파일들의 모든 예시 값을 실제 값으로 변경
- [ ] `NEXTAUTH_SECRET` 랜덤 문자열 생성 및 설정
- [ ] 데이터베이스 비밀번호 변경
- [ ] SMTP 계정 정보 설정
- [ ] OAuth 클라이언트 ID/Secret 발급 및 설정
- [ ] `.gitignore`에 `.env` 파일 추가 확인
- [ ] 프로덕션 환경에서 `NODE_ENV=production` 설정
- [ ] HTTPS 사용 (프로덕션)
- [ ] CORS 설정 검토

## 📋 .gitignore 확인

다음 파일/폴더들이 `.gitignore`에 포함되어 있는지 확인:

```gitignore
# Environment Variables
.env
.env.local
.env.development
.env.production
.env*.local

# Backup (민감 정보)
backup/

# User Uploads
**/uploads/

# Logs
*.log
logs/
```

## 🔑 민감 정보 관리

### 개발 환경

1. `.env` 파일을 절대 Git에 커밋하지 마세요
2. `.env.example`만 커밋하세요
3. 팀원과 공유 시 암호화된 채널 사용

### 프로덕션 환경

1. 환경 변수는 배포 플랫폼의 환경 변수 설정 기능 사용:
   - Vercel: Environment Variables
   - Heroku: Config Vars
   - AWS: Secrets Manager
   - Docker: docker-compose secrets

2. 절대 하드코딩하지 마세요

## 🚨 보안 이슈 발견 시

보안 취약점을 발견하신 경우:

1. **공개 이슈에 작성하지 마세요**
2. 개발자에게 직접 연락: [이메일 주소]
3. 상세 정보 제공:
   - 취약점 설명
   - 재현 방법
   - 영향 범위

## 📚 추가 보안 권장사항

### 1. 비밀번호 정책
- 최소 8자 이상
- 영문, 숫자, 특수문자 조합
- 정기적인 변경

### 2. 세션 관리
- JWT 토큰 만료 시간 설정
- Refresh Token 사용
- 세션 무효화 기능

### 3. 데이터베이스
- 정기적인 백업
- 접근 권한 최소화
- SQL Injection 방지 (Prisma ORM 사용)

### 4. API 보안
- Rate Limiting 설정
- CSRF 토큰 사용
- Input Validation

### 5. 파일 업로드
- 파일 타입 검증
- 파일 크기 제한
- 바이러스 스캔 (프로덕션)

## 🔗 관련 문서

- [환경 변수 백업 가이드](./backup/env-backup/README.md)
- [배포 가이드](./docs/deployment.md)
- [보안 체크 리포트](./SECURITY-CHECK-REPORT.md)

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

