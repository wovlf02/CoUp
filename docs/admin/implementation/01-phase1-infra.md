# Phase 1: 기본 인프라 (Week 1-2)

> **기간**: 2주  
> **목표**: 관리자 시스템의 기본 토대 구축

---

## Week 1: 기본 설정 및 인증

### 📦 환경 설정
- [ ] Redis 설정 (Upstash)
- [ ] 환경 변수 추가
  ```env
  REDIS_URL=<upstash-url>
  HATE_SPEECH_MODEL_URL=<model-url>
  VIRUSTOTAL_API_KEY=<optional>
  ```
- [ ] 필수 라이브러리 설치
  ```bash
  npm install ioredis recharts react-email resend lodash-es date-fns
  ```

### 🔐 인증 및 권한
- [ ] `middleware.js`에 관리자 권한 체크 추가
- [ ] `lib/adminAuth.js` 생성
  - [ ] `requireAdmin()` 함수
  - [ ] `requireSystemAdmin()` 함수
- [ ] 권한 체크 테스트

### 🗄️ 데이터베이스 스키마
- [ ] Prisma 스키마 업데이트
  - [ ] `AdminLog` 모델
  - [ ] `SystemSetting` 모델
  - [ ] `Sanction` 모델
  - [ ] `FunctionRestriction` 모델
- [ ] 마이그레이션 실행
  ```bash
  npx prisma migrate dev --name add_admin_tables
  ```

### 🎨 관리자 레이아웃
- [ ] `app/admin/layout.tsx` 생성
- [ ] `AdminSidebar` 컴포넌트
- [ ] `AdminHeader` 컴포넌트

---

## Week 2: 대시보드 MVP

### 📊 대시보드 페이지
- [ ] `app/admin/dashboard/page.tsx`
- [ ] 핵심 지표 계산 (`getDashboardStats()`)
- [ ] ISR 설정 (`revalidate = 60`)

### 🎴 통계 카드
- [ ] `StatCard` 컴포넌트
- [ ] 4개 카드 렌더링

### 📈 활동 그래프
- [ ] Recharts Dynamic Import
- [ ] `ActivityGraph` 컴포넌트

### 🔧 감사 로그 시스템
- [ ] `lib/admin/auditLog.ts`
- [ ] `logAdminAction()` 함수
- [ ] 모든 액션에 자동 로깅

---

## ✅ 완료 기준

- [ ] `/admin/dashboard` 접근 시 권한 체크 작동
- [ ] 대시보드에 4개 통계 카드 표시
- [ ] 관리자 액션 자동 로깅 확인
- [ ] 일반 사용자 접근 불가 확인

---

**다음**: [02-phase2-core.md](02-phase2-core.md)

