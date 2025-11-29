# CoUp 배포 체크리스트 (Deployment Checklist)

**작성일**: 2025-11-29  
**Phase**: 8 - 통합 및 마무리  
**버전**: 1.0.0  
**목적**: 안전한 배포를 위한 완전한 체크리스트

---

## 📋 목차

1. [배포 전 체크리스트](#배포-전-체크리스트)
2. [배포 중 체크리스트](#배포-중-체크리스트)
3. [배포 후 체크리스트](#배포-후-체크리스트)
4. [롤백 절차](#롤백-절차)
5. [긴급 배포 (Hotfix)](#긴급-배포-hotfix)

---

## 배포 전 체크리스트

### 1단계: 코드 품질 확인

#### 린트 및 포맷팅 ✅
```bash
# 프론트엔드
cd coup
npm run lint
npm run format:check

# 백엔드 (필요 시)
npm run lint:backend
```

**체크리스트**:
- [ ] 린트 에러 0개
- [ ] 포맷팅 통과
- [ ] TypeScript 에러 0개

---

#### 테스트 실행 ✅
```bash
# 단위 테스트
npm run test

# 통합 테스트
npm run test:integration

# E2E 테스트
npm run test:e2e

# 커버리지 확인
npm run test:coverage
```

**체크리스트**:
- [ ] 모든 테스트 통과
- [ ] 커버리지 80% 이상
- [ ] 새로 추가된 기능에 테스트 있음
- [ ] 예외 케이스 테스트 포함

**참고 문서**:
- 각 영역의 `99-best-practices.md#테스트` 섹션

---

### 2단계: 예외 처리 검증

#### 인증 (Auth) 🔐
```bash
# 스크립트 실행
cd coup/scripts
node test-login.js
```

**체크리스트**:
- [ ] 로그인/로그아웃 정상 작동
- [ ] 세션 만료 시 자동 갱신 작동
- [ ] 권한 검증 작동
- [ ] 비밀번호 변경 정상 작동

**참고 문서**:
- [auth/README.md](auth/README.md)
- [auth/99-exception-handling-best-practices.md](auth/99-exception-handling-best-practices.md)

---

#### 스터디 (Studies) 📚
**체크리스트**:
- [ ] 스터디 생성/수정/삭제 정상 작동
- [ ] 멤버 초대/승인/강퇴 정상 작동
- [ ] 가입/탈퇴 정상 작동
- [ ] OWNER 탈퇴 방지 작동
- [ ] 정원 초과 방지 작동
- [ ] 중복 가입 방지 작동

**참고 문서**:
- [studies/README.md](studies/README.md)
- [studies/99-best-practices.md](studies/99-best-practices.md)

---

#### 대시보드 (Dashboard) 📊
**체크리스트**:
- [ ] 데이터 로딩 정상
- [ ] 위젯 모두 표시
- [ ] 빈 상태 정상 표시
- [ ] 에러 상태 처리
- [ ] 실시간 업데이트 작동

**참고 문서**:
- [dashboard/README.md](dashboard/README.md)
- [dashboard/99-best-practices.md](dashboard/99-best-practices.md)

---

#### 채팅 (Chat) 💬
**체크리스트**:
- [ ] Socket.IO 연결 정상
- [ ] 메시지 전송/수신 정상
- [ ] 파일 첨부 정상
- [ ] 재연결 로직 작동
- [ ] 메시지 순서 보장

**참고 문서**:
- [chat/README.md](chat/README.md)
- [chat/99-best-practices.md](chat/99-best-practices.md)

---

#### 프로필 (Profile) 👤
**체크리스트**:
- [ ] 프로필 조회/수정 정상
- [ ] 아바타 업로드 정상 (5MB 제한)
- [ ] 계정 삭제 정상 (연관 데이터 삭제)
- [ ] 유효성 검사 작동

**참고 문서**:
- [profile/README.md](profile/README.md)
- [profile/99-best-practices.md](profile/99-best-practices.md)

---

#### 설정 (Settings) ⚙️
**체크리스트**:
- [ ] 비밀번호 변경 정상
- [ ] 알림 설정 저장
- [ ] 테마 변경 정상
- [ ] FCM 토큰 등록 정상

**참고 문서**:
- [settings/README.md](settings/README.md)
- [settings/99-best-practices.md](settings/99-best-practices.md)

---

#### 검색/필터 (Search) 🔍
**체크리스트**:
- [ ] 키워드 검색 정상
- [ ] 필터 작동
- [ ] 페이지네이션 정상
- [ ] 정렬 작동
- [ ] 빈 결과 처리

**참고 문서**:
- [search/README.md](search/README.md)
- [search/99-best-practices.md](search/99-best-practices.md)

---

#### 관리자 (Admin) 👨‍💼
**체크리스트**:
- [ ] 관리자 권한 검증
- [ ] 사용자 관리 정상
- [ ] 스터디 모니터링 정상
- [ ] 로그 기록 정상
- [ ] 통계 표시 정상

**참고 문서**:
- [admin/README.md](admin/README.md)
- [admin/99-best-practices.md](admin/99-best-practices.md)

---

### 3단계: 보안 검증

#### 인증 및 권한 🔒
**체크리스트**:
- [ ] JWT 서명 검증 작동
- [ ] CSRF 토큰 검증 작동
- [ ] XSS 방지 작동
- [ ] SQL 인젝션 방지 작동
- [ ] Rate Limiting 작동
- [ ] CORS 설정 확인

**테스트**:
```bash
# JWT 검증
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:3000/api/dashboard

# 예상: 401 Unauthorized

# Rate Limiting
for i in {1..100}; do
  curl http://localhost:3000/api/login
done

# 예상: 429 Too Many Requests
```

**참고 문서**:
- [admin/99-best-practices.md#보안](admin/99-best-practices.md#보안)

---

#### 민감 정보 보호 🔐
**체크리스트**:
- [ ] 비밀번호 해싱 (bcrypt)
- [ ] 환경 변수 암호화
- [ ] API 키 보호
- [ ] 로그에 민감 정보 없음
- [ ] 에러 메시지에 스택 트레이스 노출 안 됨 (프로덕션)

**확인**:
```bash
# 로그 확인
grep -r "password" logs/
grep -r "secret" logs/
grep -r "token" logs/

# 환경 변수 확인
cat .env
# 프로덕션에는 .env.production 사용
```

---

### 4단계: 성능 검증

#### 프론트엔드 ⚡
**체크리스트**:
- [ ] Lighthouse 점수 80점 이상
- [ ] First Contentful Paint < 1.8초
- [ ] Largest Contentful Paint < 2.5초
- [ ] Time to Interactive < 3.8초
- [ ] Cumulative Layout Shift < 0.1
- [ ] 번들 크기 < 250KB (gzipped)

**측정**:
```bash
# Lighthouse
npm run lighthouse

# 번들 분석
npm run build
npm run analyze
```

**참고 문서**:
- [dashboard/05-performance-optimization.md](dashboard/05-performance-optimization.md)

---

#### 백엔드 🚀
**체크리스트**:
- [ ] API 응답 시간 < 200ms (평균)
- [ ] 데이터베이스 쿼리 < 100ms (평균)
- [ ] 동시 사용자 1000명 지원
- [ ] 메모리 사용량 < 512MB
- [ ] CPU 사용량 < 70%

**측정**:
```bash
# 부하 테스트
npm run load-test

# 또는 k6
k6 run load-test.js
```

**참고 문서**:
- [search/04-performance-optimization.md](search/04-performance-optimization.md)

---

### 5단계: 데이터베이스 검증

#### 마이그레이션 🗄️
**체크리스트**:
- [ ] 마이그레이션 파일 생성
- [ ] 롤백 스크립트 준비
- [ ] 마이그레이션 테스트 (dev 환경)
- [ ] 데이터 백업 완료

**실행**:
```bash
# 마이그레이션 확인
npx prisma migrate status

# 마이그레이션 실행 (주의!)
npx prisma migrate deploy

# 롤백 (필요 시)
npx prisma migrate rollback
```

---

#### 데이터 무결성 🔍
**체크리스트**:
- [ ] 외래 키 제약 조건 확인
- [ ] 인덱스 생성 확인
- [ ] NOT NULL 제약 확인
- [ ] UNIQUE 제약 확인

**확인**:
```sql
-- PostgreSQL
-- 외래 키 확인
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- 인덱스 확인
SELECT * FROM pg_indexes WHERE schemaname = 'public';
```

---

### 6단계: 환경 설정 검증

#### 환경 변수 🌍
**체크리스트**:
- [ ] `.env.production` 파일 존재
- [ ] 모든 필수 환경 변수 설정
- [ ] 데이터베이스 URL 확인
- [ ] API 키 확인
- [ ] 외부 서비스 URL 확인

**확인**:
```bash
# 필수 환경 변수
cat .env.production

# 필수 항목:
# DATABASE_URL=
# JWT_SECRET=
# NEXTAUTH_SECRET=
# NEXTAUTH_URL=
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# FCM_SERVER_KEY=
```

---

#### 서버 설정 ⚙️
**체크리스트**:
- [ ] Node.js 버전 확인 (>= 18)
- [ ] PostgreSQL 버전 확인 (>= 14)
- [ ] Redis 설정 확인 (캐싱/세션)
- [ ] Nginx/Apache 설정 확인
- [ ] SSL 인증서 유효 확인

**확인**:
```bash
# Node.js
node --version

# PostgreSQL
psql --version

# Redis
redis-cli ping
# 예상: PONG

# SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

---

### 7단계: 모니터링 설정

#### 로깅 📝
**체크리스트**:
- [ ] Winston/Pino 로거 설정
- [ ] 로그 레벨 설정 (프로덕션: info)
- [ ] 로그 로테이션 설정
- [ ] 에러 로그 알림 설정

**설정 예**:
```javascript
// logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});
```

---

#### 에러 추적 🐛
**체크리스트**:
- [ ] Sentry 연동 완료
- [ ] 소스맵 업로드 설정
- [ ] 에러 알림 채널 설정
- [ ] 사용자 정보 수집 설정

**설정**:
```javascript
// sentry.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // 민감 정보 제거
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  }
});
```

---

#### 메트릭 수집 📊
**체크리스트**:
- [ ] Prometheus/Grafana 설정
- [ ] API 응답 시간 추적
- [ ] 에러 발생 빈도 추적
- [ ] 데이터베이스 쿼리 시간 추적
- [ ] 메모리/CPU 사용량 추적

---

### 8단계: 문서 확인

#### 배포 문서 📚
**체크리스트**:
- [ ] 배포 절차 문서 최신화
- [ ] API 문서 최신화 (Swagger/OpenAPI)
- [ ] 예외 처리 문서 최신화
- [ ] README.md 업데이트
- [ ] CHANGELOG.md 작성

**확인**:
```bash
# 예외 처리 문서
ls docs/exception/*/

# 변경 사항이 있으면 업데이트
# - 새로운 예외 코드 추가
# - 해결 방법 개선
# - 예제 코드 업데이트
```

---

## 배포 중 체크리스트

### 1단계: 알림 📢
**체크리스트**:
- [ ] 팀원에게 배포 시작 알림
- [ ] 예상 다운타임 공지 (필요 시)
- [ ] 백업 완료 확인

---

### 2단계: 데이터베이스 백업 💾
```bash
# PostgreSQL 백업
pg_dump -U postgres coup > backup_$(date +%Y%m%d_%H%M%S).sql

# 백업 확인
ls -lh backup_*.sql

# S3에 업로드 (권장)
aws s3 cp backup_*.sql s3://coup-backups/
```

**체크리스트**:
- [ ] 데이터베이스 백업 완료
- [ ] 백업 파일 크기 확인
- [ ] 백업 파일 압축 및 업로드

---

### 3단계: 배포 실행 🚀
```bash
# 1. 코드 가져오기
git fetch origin
git checkout main
git pull origin main

# 2. 의존성 설치
npm ci --production

# 3. 빌드
npm run build

# 4. 마이그레이션
npx prisma migrate deploy

# 5. 서버 재시작
pm2 restart coup
# 또는
systemctl restart coup

# 6. 상태 확인
pm2 status
```

**체크리스트**:
- [ ] 코드 배포 완료
- [ ] 빌드 성공
- [ ] 마이그레이션 성공
- [ ] 서버 재시작 성공
- [ ] 프로세스 실행 중

---

### 4단계: 헬스 체크 🏥
```bash
# API 헬스 체크
curl http://localhost:3000/api/health
# 예상: {"status": "ok"}

# 데이터베이스 연결 확인
curl http://localhost:3000/api/health/db
# 예상: {"status": "ok", "latency": 5}

# Redis 연결 확인
curl http://localhost:3000/api/health/redis
# 예상: {"status": "ok"}
```

**체크리스트**:
- [ ] API 응답 정상
- [ ] 데이터베이스 연결 정상
- [ ] Redis 연결 정상
- [ ] 외부 서비스 연결 정상

---

## 배포 후 체크리스트

### 1단계: 기능 테스트 (Smoke Test) 🔥

#### 핵심 기능 확인 (5분)
**체크리스트**:
- [ ] 홈페이지 로딩
- [ ] 로그인/로그아웃
- [ ] 대시보드 표시
- [ ] 스터디 조회
- [ ] 채팅 연결

**테스트 스크립트**:
```bash
# 홈페이지
curl -I https://coup.example.com
# 예상: HTTP/2 200

# 로그인
curl -X POST https://coup.example.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
# 예상: 200 OK, token 반환

# 대시보드
curl -H "Authorization: Bearer $TOKEN" \
  https://coup.example.com/api/dashboard
# 예상: 200 OK, 데이터 반환
```

---

### 2단계: 모니터링 확인 📊

#### 에러 로그 확인
```bash
# 최근 에러 로그
tail -100 logs/error.log

# 에러 발생 빈도
grep "ERROR" logs/combined.log | wc -l

# 특정 에러 코드 확인
grep "AUTH-003" logs/combined.log
```

**체크리스트**:
- [ ] 에러 로그 없음 또는 예상된 에러만 있음
- [ ] 치명적 에러 (Critical) 0건
- [ ] 높음 (High) 에러 < 10건/시간

---

#### 메트릭 확인
**체크리스트**:
- [ ] API 응답 시간 정상 (< 200ms 평균)
- [ ] 에러율 < 1%
- [ ] CPU 사용량 < 70%
- [ ] 메모리 사용량 < 80%
- [ ] 데이터베이스 연결 풀 여유분 있음

---

### 3단계: 사용자 피드백 수집 💬

**체크리스트**:
- [ ] Sentry에서 새로운 에러 없음
- [ ] 사용자 제보 없음 (1시간 이내)
- [ ] 응답 시간 정상
- [ ] 서버 부하 정상

---

### 4단계: 배포 완료 알림 ✅

**체크리스트**:
- [ ] 팀원에게 배포 완료 알림
- [ ] 배포 노트 공유
- [ ] 변경 사항 요약
- [ ] 알려진 이슈 공유 (있다면)

**배포 노트 템플릿**:
```markdown
# 배포 완료: v1.2.0

**배포 일시**: 2025-11-29 14:00 KST  
**배포자**: GitHub Copilot  
**다운타임**: 0분

## 주요 변경사항
- JWT 자동 갱신 기능 추가
- 스터디 삭제 시 채팅방 함께 삭제 버그 수정
- 대시보드 로딩 속도 개선 (3초 → 1초)

## 예외 처리 개선
- AUTH-003: JWT 만료 처리 개선
- STD-001: 스터디 삭제 시 트랜잭션 추가
- DASH-001: 에러 재시도 로직 개선

## 알려진 이슈
- 없음

## 롤백 방법
\`\`\`bash
git checkout v1.1.0
npm ci
npm run build
pm2 restart coup
\`\`\`

## 참고 문서
- [CHANGELOG.md](CHANGELOG.md)
- [예외 처리 문서](docs/exception/README.md)
```

---

## 롤백 절차

### 언제 롤백해야 하는가?

**즉시 롤백**:
- 🔴 전체 서비스 다운
- 🔴 데이터 손실 발생
- 🔴 보안 취약점 발견
- 🔴 치명적 버그 발견

**검토 후 롤백**:
- 🟠 주요 기능 장애
- 🟠 성능 심각한 저하 (> 50%)
- 🟠 에러율 급증 (> 5%)

**롤백 불필요** (수정 배포):
- 🟡 UI 버그
- 🟡 경미한 기능 오류
- 🟢 문서 오류

---

### 롤백 실행

```bash
# 1. 알림
echo "긴급 롤백 시작" | notify-team

# 2. 이전 버전으로 코드 복구
git checkout <previous-tag>
# 예: git checkout v1.1.0

# 3. 의존성 설치
npm ci --production

# 4. 빌드
npm run build

# 5. 데이터베이스 롤백 (필요 시)
npx prisma migrate rollback

# 또는 백업에서 복구
psql -U postgres coup < backup_YYYYMMDD_HHMMSS.sql

# 6. 서버 재시작
pm2 restart coup

# 7. 헬스 체크
curl http://localhost:3000/api/health

# 8. 롤백 완료 알림
echo "롤백 완료" | notify-team
```

**체크리스트**:
- [ ] 팀원에게 롤백 시작 알림
- [ ] 이전 버전 태그 확인
- [ ] 코드 롤백 완료
- [ ] 데이터베이스 롤백 완료 (필요 시)
- [ ] 서버 재시작 완료
- [ ] 기능 정상 작동 확인
- [ ] 롤백 완료 알림

---

### 롤백 후 조치

**체크리스트**:
- [ ] 롤백 원인 분석
- [ ] 버그 리포트 작성
- [ ] 수정 계획 수립
- [ ] 재배포 일정 결정

---

## 긴급 배포 (Hotfix)

### Hotfix 프로세스

```bash
# 1. Hotfix 브랜치 생성
git checkout -b hotfix/auth-token-fix main

# 2. 버그 수정
# ... 코드 수정 ...

# 3. 테스트 (최소한의 테스트)
npm test -- auth

# 4. 커밋
git add .
git commit -m "hotfix: AUTH-003 토큰 갱신 버그 수정"

# 5. 메인에 머지
git checkout main
git merge hotfix/auth-token-fix

# 6. 태그 생성
git tag -a v1.2.1 -m "Hotfix: AUTH-003 수정"

# 7. 배포
git push origin main --tags
npm run deploy
```

**체크리스트**:
- [ ] 긴급성 확인 (즉시 배포 필요)
- [ ] 영향 범위 최소화
- [ ] 최소한의 테스트 실행
- [ ] 배포 후 즉시 모니터링
- [ ] 다음 정규 배포에 포함

---

## 배포 자동화

### GitHub Actions 예시

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        run: |
          # SSH로 서버 접속 및 배포
          ssh user@server 'bash deploy.sh'
      
      - name: Smoke test
        run: |
          curl -f https://coup.example.com/api/health
      
      - name: Notify
        if: success()
        run: echo "배포 성공" | notify-team
      
      - name: Rollback
        if: failure()
        run: |
          ssh user@server 'bash rollback.sh'
          echo "배포 실패, 롤백 완료" | notify-team
```

---

## 참고 문서

### 예외 처리
- [MASTER-INDEX.md](MASTER-INDEX.md) - 전체 예외 색인
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - 빠른 참조
- [FINAL-GUIDE.md](FINAL-GUIDE.md) - 사용 가이드

### 각 영역 Best Practices
- [auth/99-exception-handling-best-practices.md](auth/99-exception-handling-best-practices.md)
- [dashboard/99-best-practices.md](dashboard/99-best-practices.md)
- [studies/99-best-practices.md](studies/99-best-practices.md)
- [chat/99-best-practices.md](chat/99-best-practices.md)
- [admin/99-best-practices.md](admin/99-best-practices.md)

---

## 배포 이력 관리

### CHANGELOG.md 작성

```markdown
# Changelog

## [1.2.0] - 2025-11-29

### Added
- JWT 자동 갱신 기능 (AUTH-003 개선)
- 스터디 일정 기능

### Changed
- 대시보드 로딩 속도 개선 (3초 → 1초)
- 파일 업로드 크기 제한 변경 (5MB → 10MB)

### Fixed
- 스터디 삭제 시 채팅방 미삭제 버그 (STD-001)
- 프로필 이미지 미리보기 오류 (PROF-003)

### Security
- XSS 취약점 수정
- SQL 인젝션 방지 강화

## [1.1.0] - 2025-11-20
...
```

---

## 최종 확인

배포 전 이 체크리스트를 모두 확인하셨나요?

### 필수 항목 ✅
- [ ] 모든 테스트 통과
- [ ] 보안 검증 완료
- [ ] 성능 검증 완료
- [ ] 데이터베이스 백업 완료
- [ ] 배포 문서 최신화
- [ ] 롤백 계획 수립

### 권장 항목 ⭐
- [ ] 코드 리뷰 완료
- [ ] QA 테스트 완료
- [ ] 부하 테스트 완료
- [ ] 모니터링 대시보드 설정
- [ ] 팀원 교육 완료

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-29  
**버전**: 1.0.0  
**이전 문서**: [FINAL-GUIDE.md](FINAL-GUIDE.md)  
**다음 문서**: [TEAM-ONBOARDING.md](TEAM-ONBOARDING.md)

