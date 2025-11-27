# CoUp 관리자 시스템 설계 문서

> **작성일**: 2025-11-27  
> **목적**: 관리자 페이지 UX 설계 및 구현 가이드

---

## 🚀 빠른 시작

### 관리자 계정 생성
```bash
cd coup
node scripts/create-admin.js admin@coup.com ADMIN
node scripts/create-admin.js superadmin@coup.com SYSTEM_ADMIN
```

### 데이터베이스 시드
```bash
node scripts/seed-system-admin-data.js
node scripts/check-admin-data.js
```

---

## 📋 문서 구조

### 1️⃣ 기초 분석
- [`01-user-features.md`](./01-user-features.md) - 일반 사용자 기능 파악
- [`02-admin-roles.md`](./02-admin-roles.md) - 관리자 역할 및 권한 정의

### 2️⃣ UX 설계 (사용자 중심)
- [`UX_DESIGN_00_SUMMARY.md`](./UX_DESIGN_00_SUMMARY.md) - UX 개선 전체 요약
- [`UX_DESIGN_01_DASHBOARD.md`](./UX_DESIGN_01_DASHBOARD.md) - 대시보드
- [`UX_DESIGN_02_USER_MANAGEMENT.md`](./UX_DESIGN_02_USER_MANAGEMENT.md) - 사용자 관리
- [`UX_DESIGN_03_REPORT_MANAGEMENT.md`](./UX_DESIGN_03_REPORT_MANAGEMENT.md) - 신고 관리
- [`UX_DESIGN_04_SYSTEM_SETTINGS.md`](./UX_DESIGN_04_SYSTEM_SETTINGS.md) - 시스템 설정

### 3️⃣ 기술 문서 (Next.js 15)
- [`NEXTJS_15_OPTIMIZATION.md`](./NEXTJS_15_OPTIMIZATION.md) - 최적화 전략
- [`NEXTJS_15_EXAMPLES_JS.md`](./NEXTJS_15_EXAMPLES_JS.md) - JavaScript 코드 예제

### 4️⃣ 기능 명세
- [`features/01-dashboard.md`](./features/01-dashboard.md) - 대시보드 및 통계
- [`features/02-user-management.md`](./features/02-user-management.md) - 사용자 관리
- [`features/03-study-management.md`](./features/03-study-management.md) - 스터디 관리
- [`features/04-report-management.md`](./features/04-report-management.md) - 신고 및 제재
- [`features/05-content-moderation.md`](./features/05-content-moderation.md) - 콘텐츠 검열
- [`features/06-system-settings.md`](./features/06-system-settings.md) - 시스템 설정
- [`features/07-analytics.md`](./features/07-analytics.md) - 분석 및 리포트


---

## 🎯 관리자 시스템의 목표

1. **플랫폼 건전성 유지**: 부적절한 콘텐츠 및 행위 차단
2. **사용자 보호**: 신고 처리 및 분쟁 조정
3. **서비스 품질 관리**: 스터디 품질 모니터링
4. **데이터 기반 의사결정**: 통계 및 분석을 통한 서비스 개선

---

## 📊 관리 영역

### 1. 대시보드
- 핵심 지표 한눈에 보기
- 최근 활동 모니터링
- 긴급 알림 확인

### 2. 사용자 관리
- 사용자 목록 조회
- 사용자 정지/경고
- 제재 이력 관리

### 3. 스터디 관리
- 스터디 목록 조회
- 스터디 종료/숨김
- 스터디 추천

### 4. 신고 관리
- 신고 접수 및 검토
- 조치 결정 및 실행
- 신고 통계

### 5. 콘텐츠 검열
- 부적절한 콘텐츠 삭제
- 자동 필터링 규칙 관리
- 검열 이력 조회

### 6. 시스템 설정
- 플랫폼 설정
- 이메일 템플릿
- 이용약관 관리

### 7. 분석 및 리포트
- 사용자 통계
- 스터디 통계
- 리포트 생성

---

## 🔐 권한 시스템

### USER (일반 사용자)
- 스터디 생성, 참여
- 콘텐츠 작성
- 신고 제출

### ADMIN (일반 관리자)
- 사용자/스터디 조회
- 신고 처리
- 콘텐츠 검열
- 통계 조회

### SYSTEM_ADMIN (시스템 관리자)
- ADMIN의 모든 권한
- 시스템 설정 변경
- 관리자 권한 관리
- 데이터베이스 관리

---

## 📝 문서 작성 규칙

### 1. 각 문서는 600라인 이내
- 긴 내용은 여러 파일로 분할
- 명확한 섹션 구분

### 2. 일관된 구조
```markdown
# 제목

> 메타 정보

## 개요
## 기능 상세
## 권한
## API 연동
## UI/UX
## 구현 체크리스트
```

### 3. 실제 구현 가능한 명세
- 모호한 표현 금지
- 구체적인 데이터 구조
- 명확한 플로우

---

## 🚀 개발 순서

### Phase 1: 핵심 기능 (1-2주)
1. 관리자 인증 및 권한 체계
2. 대시보드 (기본 통계)
3. 사용자 관리 (목록, 정지)
4. 스터디 관리 (목록, 종료)

### Phase 2: 신고 처리 (1주)
5. 신고 목록 및 검토
6. 조치 실행
7. 신고 통계

### Phase 3: 검열 및 분석 (1주)
8. 콘텐츠 검열
9. 통계 대시보드
10. 리포트 생성

### Phase 4: 고급 기능 (선택)
11. 시스템 설정 UI
12. 감사 로그 뷰어

---

## 📌 완료 현황

1. ✅ 일반 사용자 기능 파악 → `01-user-features.md` (527 라인)
2. ✅ 관리자 역할 정의 → `02-admin-roles.md` (596 라인)
3. ✅ 영역별 기능 명세 작성 → `features/` (7개 문서)
4. ✅ API 명세 작성 → `../../backend/api/admin/` (8개 문서)
5. ✅ 화면 설계 작성 → `../../screens/admin/` (1개 README)
6. ⏳ 개발 시작 준비 완료

### 📊 문서 통계
- **총 문서 수**: 19개
- **총 라인 수**: ~5,000 라인
- **모든 문서 600라인 이하** ✅
- **실제 구현 가능한 명세** ✅

---

**최종 업데이트**: 2025-11-26  
**작성자**: GitHub Copilot

