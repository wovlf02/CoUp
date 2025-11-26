# CoUp 관리자 시스템 - README

> **버전**: 2.0  
> **최종 업데이트**: 2025-11-26  
> **상태**: ✅ 설계 완료 → 개발 대기

---

## 📚 문서 구조

### 📖 기본 문서
- **[00-overview.md](./00-overview.md)** - 관리자 시스템 전체 개요
- **[01-user-features-analysis.md](./01-user-features-analysis.md)** - 일반 사용자 기능 분석
- **[02-admin-roles.md](./02-admin-roles.md)** - 관리자 역할 및 권한 정의
- **[03-functional-requirements.md](./03-functional-requirements.md)** - 기능 요구사항 상세

### 🎯 영역별 기능 명세
`features/` 폴더:
- **[01-dashboard.md](./features/01-dashboard.md)** - 대시보드 및 통계
- **02-user-management.md** - 사용자 관리
- **03-study-management.md** - 스터디 관리
- **04-report-management.md** - 신고 및 제재 관리
- **05-content-moderation.md** - 콘텐츠 검열
- **06-system-settings.md** - 시스템 설정
- **07-analytics.md** - 분석 및 리포트
- **08-notification-management.md** - 공지 및 알림

### 🔌 API 명세서
`../backend/api/admin/` 폴더 (생성 예정):
- **01-auth.md** - 관리자 인증
- **02-dashboard.md** - 대시보드 API
- **03-users.md** - 사용자 관리 API
- **04-studies.md** - 스터디 관리 API
- **05-reports.md** - 신고 관리 API
- **06-content.md** - 콘텐츠 관리 API
- **07-stats.md** - 통계 API
- **08-settings.md** - 설정 API

### 🎨 화면 설계
`../screens/admin/` 폴더 (생성 예정):
- **01-layout.md** - 관리자 레이아웃
- **02-dashboard.md** - 대시보드 화면
- **03-users-list.md** - 사용자 목록
- **04-users-detail.md** - 사용자 상세
- **05-studies-list.md** - 스터디 목록
- **06-studies-detail.md** - 스터디 상세
- **07-reports-list.md** - 신고 목록
- **08-reports-detail.md** - 신고 상세
- **09-settings.md** - 시스템 설정

---

## 🚀 빠른 시작

### 신규 개발자 온보딩
1. **[00-overview.md](./00-overview.md)** 읽기 → 전체 시스템 이해
2. **[01-user-features-analysis.md](./01-user-features-analysis.md)** 읽기 → 일반 사용자 기능 파악
3. **[02-admin-roles.md](./02-admin-roles.md)** 읽기 → 관리자 권한 체계 이해
4. **[03-functional-requirements.md](./03-functional-requirements.md)** 읽기 → 기능 요구사항 파악

### 개발 시작 전
1. **features/** 폴더에서 개발할 영역 선택
2. 해당 영역의 기능 명세 상세 읽기
3. API 명세서 확인
4. 화면 설계 확인
5. 개발 시작

---

## 🎯 핵심 개념

### 관리자 역할
- **ADMIN**: 일반 관리 작업 (사용자, 스터디, 신고 관리)
- **SYSTEM_ADMIN**: 시스템 설정 변경 및 관리자 권한 관리

### 주요 기능
1. **모니터링**: 실시간 플랫폼 현황 파악
2. **사용자 관리**: 회원 정보, 정지, 탈퇴 처리
3. **스터디 관리**: 스터디 검열, 종료, 추천
4. **신고 처리**: 신고 검토 및 조치
5. **콘텐츠 검열**: 부적절한 콘텐츠 삭제
6. **통계 분석**: 가입, 활동, 유지율 분석
7. **시스템 설정**: 정책, 공지, 설정 관리

---

## 📊 개발 우선순위

### Phase 1: 핵심 기능 (2주)
- [x] 문서 작성 완료
- [ ] 관리자 인증 및 권한 체계
- [ ] 대시보드 (기본 통계)
- [ ] 사용자 관리 (목록, 검색, 정지)
- [ ] 스터디 관리 (목록, 검색, 종료)

### Phase 2: 신고 및 검열 (2주)
- [ ] 신고 관리 시스템
- [ ] 콘텐츠 검열 도구
- [ ] 제재 이력 관리
- [ ] 자동 필터링 규칙

### Phase 3: 통계 및 분석 (1주)
- [ ] 종합 통계 대시보드
- [ ] 사용자 활동 분석
- [ ] 스터디 품질 분석
- [ ] 리포트 생성 및 익스포트

### Phase 4: 시스템 관리 (1주)
- [ ] 시스템 설정 UI
- [ ] 공지사항 발송
- [ ] 이메일 템플릿 관리
- [ ] 로그 뷰어

---

## 🔗 관련 문서 링크

### 프로젝트 문서
- [프로젝트 개요](../project-init/overview.md)
- [데이터베이스 스키마](../backend/database-schema.md)
- [인증 시스템](../auth/README.md)

### 일반 사용자 화면 설계
- [화면 설계 개요](../screens/overview.md)
- [대시보드](../screens/dashboard/)
- [스터디](../screens/study/)

---

## 🛠️ 기술 스택

### 프론트엔드
- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript/React
- **Styling**: CSS Modules
- **Charts**: Chart.js / Recharts
- **Data Fetching**: SWR / React Query

### 백엔드
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js

### 인프라
- **Hosting**: Vercel
- **Database**: Supabase / Railway
- **File Storage**: AWS S3 / Cloudinary
- **Monitoring**: Sentry

---

## 📝 문서 작성 규칙

### 파일명
- 소문자 + 하이픈 사용: `user-management.md`
- 번호 prefix: `01-`, `02-` (순서가 있는 경우)

### 구조
```markdown
# 제목

> **메타데이터**

---

## 목차

---

## 내용

---

**다음 문서**: 링크
```

### 코드 블록
- API 예시: `json` 또는 `typescript`
- UI 레이아웃: 아스키 아트
- SQL: `sql`

---

## 🎉 완료 현황

### ✅ 완료
- [x] 관리자 시스템 개요 문서
- [x] 사용자 기능 분석
- [x] 관리자 역할 및 권한 정의
- [x] 기능 요구사항 상세
- [x] 대시보드 기능 명세

### 🔄 진행 중
- [ ] 나머지 영역별 기능 명세 (7개)
- [ ] API 명세서 작성 (8개)
- [ ] 화면 설계 작성 (9개)

### 📅 예정
- [ ] 코드 구현
- [ ] 테스트
- [ ] 배포

---

## 💬 문의 및 피드백

문서에 대한 질문이나 개선 제안이 있으시면:
1. 이슈 생성
2. PR 제출
3. 팀 채널에서 논의

---

**작성자**: GitHub Copilot  
**문서 버전**: 2.0  
**최종 업데이트**: 2025-11-26

