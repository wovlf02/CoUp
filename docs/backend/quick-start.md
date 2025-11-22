# 🚀 CoUp 백엔드 구현 - 빠른 시작 가이드

> **새로운 세션에서 이 파일을 먼저 읽으세요!**  
> **목적**: 5분 안에 현재 상태 파악 및 다음 작업 시작  
> **최종 업데이트**: 2025-11-18

---

## 📌 현재 상태 (한눈에 보기)

### ✅ 완료된 것
- **프론트엔드**: 27개 페이지 100% 완료
- **Mock 데이터**: 17개 파일 준비됨
- **문서**: 백엔드 설계 및 구현 가이드 완료

### 🏗️ 진행 중
- **백엔드 구현**: Phase 0 (환경 설정) 시작 대기

### 📊 전체 진행률
- **0% 완료** (0/120 체크 항목)
- **예상 완료**: 24일 (약 4-5주)

---

## 🎯 지금 바로 해야 할 일

### 1단계: 체크리스트 열기 ⭐
```
📄 docs/backend/backend-implementation-checklist.md
```
- 현재 Phase 확인
- 완료 항목 체크 상태 확인
- 다음 할 일 파악

### 2단계: Phase 문서 읽기
```
📄 docs/backend/phase-[현재 Phase 번호]-*.md
```
- 상세 구현 가이드
- 코드 예제
- 테스트 방법

### 3단계: 구현 시작
- 체크리스트 항목 하나씩 완료
- 완료 시 체크 표시 (`- [ ]` → `- [x]`)
- 테스트 수행

---

## 📚 핵심 문서 (순서대로 읽기)

### 🔴 필수 문서

1. **[backend-implementation-checklist.md](./backend-implementation-checklist.md)** ⭐⭐⭐
   - **가장 중요**: 120개 체크 항목
   - 진행 상황 추적
   - Phase별 완료 상태

2. **[00-backend-implementation-master-plan.md](./00-backend-implementation-master-plan.md)** ⭐⭐
   - 전체 로드맵
   - 기술 스택
   - 폴더 구조
   - Phase별 우선순위

3. **[phase-0-setup.md](./phase-0-setup.md)** ⭐
   - 환경 설정 가이드
   - PostgreSQL 설치
   - Prisma 설정
   - Seed 데이터

### 🟡 참고 문서

4. **[database-schema.md](./database-schema.md)**
   - Prisma 스키마 전체
   - 11개 모델
   - 관계 정의

5. **[api-specification.md](./api-specification.md)**
   - 80개 API 엔드포인트
   - 요청/응답 형식
   - 예제

6. **[auth-system.md](./auth-system.md)**
   - NextAuth.js 설정
   - 인증/인가 로직

7. **[verification-guide.md](./verification-guide.md)**
   - Phase별 완료 기준
   - 검증 방법

---

## 🏃 Phase 0: 환경 설정 (지금 시작)

### 예상 시간: 1-2시간

### 체크리스트 (간단 버전)
```
[ ] PostgreSQL 설치 및 실행
[ ] 데이터베이스 'coup' 생성
[ ] npm install prisma @prisma/client
[ ] npx prisma init
[ ] schema.prisma 작성 (11개 모델)
[ ] npx prisma migrate dev --name init
[ ] npx prisma generate
[ ] prisma/seed.js 작성
[ ] npm run db:seed
[ ] test-db.js 실행 → 성공
```

### 빠른 시작 명령어

#### Windows (CMD)
```cmd
REM PostgreSQL Docker로 시작
docker run --name coup-postgres -e POSTGRES_PASSWORD=coup123 -e POSTGRES_DB=coup -p 5432:5432 -d postgres:15

REM 프로젝트로 이동
cd C:\Project\CoUp\coup

REM Prisma 설치
npm install prisma @prisma/client bcryptjs

REM Prisma 초기화
npx prisma init
```

#### 다음 단계
- `docs/backend/phase-0-setup.md` 열기
- 상세 가이드 따라하기
- 체크리스트 항목 완료 표시

---

## 📂 문서 구조 (한눈에 보기)

```
docs/backend/
├── 🚀 QUICKSTART.md                    ← 지금 보는 파일
├── ⭐ backend-implementation-checklist.md  ← 가장 중요!
├── 00-backend-implementation-master-plan.md
├── phase-0-setup.md                   ← 지금 읽어야 할 파일
├── phase-1-auth.md                    ← 다음 단계
├── phase-2-user-features.md
├── database-schema.md
├── api-specification.md
├── auth-system.md
├── verification-guide.md
└── README.md
```

---

## 🎯 Phase별 로드맵 (요약)

| Phase | 이름 | 시간 | 핵심 작업 |
|-------|------|------|-----------|
| **0** | **환경 설정** | **1-2h** | **PostgreSQL + Prisma 설정** |
| 1 | 인증 시스템 | 4-6h | NextAuth.js, 회원가입/로그인 |
| 2 | 사용자 기능 | 4-6h | 프로필, 대시보드, 통계 |
| 3 | 스터디 핵심 | 8-10h | 스터디 CRUD, 멤버 관리 |
| 4 | 스터디 콘텐츠 | 6-8h | 공지, 캘린더, 할일 |
| 5 | 채팅 | 4-6h | REST 채팅, WebSocket(옵션) |
| 6 | 파일 | 4-6h | 업로드/다운로드 |
| 7 | 알림 | 3-4h | 알림 생성/관리 |
| 8 | 관리자 | 6-8h | 관리자 기능 |
| 9 | 최적화 | 4-6h | 에러 핸들링, 로깅 |

**총 예상 시간**: 44-62시간 (약 4-5주)

---

## 🔧 개발 환경

### 기술 스택
```javascript
{
  // Frontend (기존)
  "next": "16.0.1",
  "react": "19.2.0",
  
  // Backend (추가 예정)
  "next-auth": "^5.0.0-beta",
  "@prisma/client": "^5.0.0",
  "bcryptjs": "^2.4.3",
  "zod": "^3.22.0"
}
```

### 데이터베이스
- **PostgreSQL 15+**
- **Docker 추천**
```bash
docker run --name coup-postgres \
  -e POSTGRES_PASSWORD=coup123 \
  -e POSTGRES_DB=coup \
  -p 5432:5432 \
  -d postgres:15
```

---

## ✅ 완료 확인 방법

### Phase 0 완료 시
```bash
# 테스트 스크립트 실행
node test-db.js

# 예상 출력
✅ Users: 3
✅ Studies: 2
✅ Study Members: 3
```

### Phase 1 완료 시
- 회원가입 → 로그인 → 대시보드 이동
- 보호된 라우트 리다이렉트 동작

### Phase 2 완료 시
- `/dashboard` 페이지에서 API 데이터 표시
- Mock 데이터 아닌 실제 DB 데이터

---

## 🐛 문제 해결 (빠른 참조)

### PostgreSQL 연결 오류
```
Error: P1001: Can't reach database server
```
**해결**: PostgreSQL 서비스 실행 확인
```bash
docker ps | grep coup-postgres
docker start coup-postgres
```

### Prisma Client 오류
```
Error: Prisma Client not generated
```
**해결**:
```bash
npx prisma generate
```

### 세션 오류
```
Error: Invalid session
```
**해결**: 브라우저 쿠키 삭제 후 재로그인

---

## 📞 도움말

### 문서 찾기
```
문제 발생 시:
1. verification-guide.md의 "문제 해결" 섹션
2. 해당 Phase 문서의 "🐛 문제 해결" 섹션
3. README.md의 관련 링크
```

### 체크리스트 사용법
```markdown
# 완료 전
- [ ] 작업 항목

# 완료 후
- [x] 작업 항목
```

---

## 🎉 다음 단계

### 지금 바로 시작
1. ✅ 이 파일 읽기 완료
2. 📄 `backend-implementation-checklist.md` 열기
3. 📄 `phase-0-setup.md` 읽고 시작
4. ⏰ 1-2시간 후 Phase 0 완료!

### Phase 0 완료 후
1. Phase 1로 이동
2. 체크리스트 업데이트
3. 계속 진행

---

## 📊 진행률 추적

### 매일 업데이트
```markdown
# 체크리스트 파일에서
- [x] 완료한 항목 체크
- [ ] 남은 항목 확인

# 진행률 계산
완료 항목 / 120 * 100 = 진행률 %
```

### 완료 예상일
```
시작일: 2025-11-18
예상 완료: 2025-12-12 (24일 후)
```

---

## 💡 팁

### 효율적인 작업 방법
1. **하루 2-3 Phase 진행** (집중력 유지)
2. **체크리스트 먼저 확인** (목표 명확히)
3. **테스트 먼저 작성** (TDD 방식)
4. **완료 후 바로 체크** (진행 상황 추적)

### 막힐 때
1. 해당 Phase 문서 다시 읽기
2. `verification-guide.md` 확인
3. 예제 코드 참고
4. 데이터베이스 직접 확인 (`npx prisma studio`)

---

## 🚀 시작하기

```bash
# 1. 체크리스트 열기
code docs/backend/backend-implementation-checklist.md

# 2. Phase 0 문서 열기
code docs/backend/phase-0-setup.md

# 3. 터미널에서 시작
cd C:\Project\CoUp\coup
docker run --name coup-postgres -e POSTGRES_PASSWORD=coup123 -e POSTGRES_DB=coup -p 5432:5432 -d postgres:15
npm install prisma @prisma/client bcryptjs
npx prisma init
```

---

**좋은 코딩 되세요! 🎯**

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-18  
**버전**: 1.0

