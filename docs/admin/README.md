# CoUp 관리자 시스템 문서

> **작성일**: 2025-11-27  
> **목적**: CoUp 플랫폼의 관리자 시스템 전체 설계 문서 통합 인덱스

---

## 📚 문서 구조

```
docs/admin/
├── README.md                                   # 👈 현재 문서
├── IMPLEMENTATION-TODO.md                      # 🔥 구현 상세 TODO (10주 계획)
├── TODO-SIMPLE.md                              # 🔥 간단 TODO (빠른 체크리스트)
├── FINAL-COMPLETION-REPORT.md                  # 최종 완성 보고서
├── 01-user-features-analysis.md                # 일반 사용자 기능 분석
├── 02-admin-system-best-practices.md           # 관리자 시스템 모범 사례
├── 03-admin-system-integrated.md               # 통합 설계 문서
├── features/                                   # 기능별 상세 명세 (6개)
│   ├── 01-user-management.md                   # ✅ 사용자 관리
│   ├── 02-study-management.md                  # ✅ 스터디 관리
│   ├── 03-report-management.md                 # ✅ 신고 관리
│   ├── 04-content-moderation.md                # ✅ 콘텐츠 모더레이션
│   ├── 05-analytics.md                         # ✅ 분석 및 리포팅
│   └── 06-system-settings.md                   # ✅ 시스템 설정
├── screens/admin/                              # UI/UX 설계 (17개)
│   ├── README.md
│   ├── dashboard/ (2개)
│   ├── users/ (3개)
│   ├── studies/ (2개)
│   ├── reports/ (2개)
│   ├── moderation/ (3개)
│   ├── analytics/ (2개)
│   └── settings/ (3개)
└── optimize/                                   # Next.js 최적화 전략 (5개)
    ├── README.md
    ├── dashboard/overview.md
    ├── users/list-page.md
    ├── studies/list-page.md
    └── reports/realtime.md
## 🚀 빠른 시작

### 📝 문서 작성자라면?
1. **[TODO-DOCUMENT-SIMPLE.md](TODO-DOCUMENT-SIMPLE.md)** 읽고 남은 작업 확인
2. **[DOCUMENT-COMPLETION-TODO.md](DOCUMENT-COMPLETION-TODO.md)** 보고 상세 가이드라인 참고
3. 작성 템플릿 및 분량 기준 준수

### 💻 개발자라면?
1. **[TODO-SIMPLE.md](TODO-SIMPLE.md)** 읽고 체크리스트 확인
2. **[IMPLEMENTATION-TODO.md](IMPLEMENTATION-TODO.md)** 참고하여 구현 시작
3. 각 기능별 상세 명세는 `features/` 폴더 참고
4. UI/UX 설계는 `screens/admin/` 폴더 참고
5. 최적화 전략은 `optimize/` 폴더 참고

### 🎨 디자이너라면?
1. **[screens/admin/README.md](../screens/admin/README.md)** 읽고 디자인 시스템 확인
2. 각 영역별 폴더에서 레이아웃 및 컴포넌트 설계 참고

### 📊 PM이라면?
1. **[FINAL-COMPLETION-REPORT.md](FINAL-COMPLETION-REPORT.md)** 읽고 전체 현황 파악
2. **[03-admin-system-integrated.md](03-admin-system-integrated.md)** 읽고 10주 로드맵 확인
3. **[TODO-SIMPLE.md](TODO-SIMPLE.md)** 보고 진행률 추적

---

```

---

## 🎯 문서 진행 상황

### ✅ 완료된 문서

#### 1단계: 기반 분석
- [x] **01-user-features-analysis.md**: 일반 사용자 기능 전체 분석 및 관리자 역할 정의
  - 일반 사용자 기능 7개 영역 분석
  - 관리자 개입 필요 영역 도출
  - 역할별 권한 매트릭스
  - 관리자-사용자 상호작용 시나리오 5개

#### 2단계: 모범 사례 조사
- [x] **02-admin-system-best-practices.md**: 국내외 주요 플랫폼 벤치마킹
  - Discord, Reddit, Facebook, Slack, Notion, GitHub, WordPress 분석
  - 관리자 시스템 핵심 구성 요소 7개
  - 기능별 모범 사례 (3-Strike 시스템, 신고 처리 등)
  - 보안 및 권한 관리 전략
  - UX 원칙 5가지

#### 3단계: 통합 설계
- [x] **03-admin-system-integrated.md**: CoUp 최적화 통합 설계
  - 시스템 개요 및 관리 대상 범위
  - 역할 및 권한 체계 (ADMIN, SYSTEM_ADMIN)
  - 핵심 기능 영역 6개
  - 기술 아키텍처 (프론트엔드/백엔드)
  - 구현 로드맵 (10주, 5단계)

#### 4단계: 기능별 상세 명세
- [x] **features/01-user-management.md**: 사용자 관리 상세 명세
  - 사용자 목록/검색/필터링
  - 사용자 상세 조회
  - 제재 시스템 (3-Strike)
  - 기능 제한 시스템
  - 역할 관리
  - API 명세 7개

- [x] **features/02-study-management.md**: 스터디 관리 상세 명세
  - 스터디 목록/검색/필터링
  - 스터디 상세 조회
  - 품질 관리 (품질 점수 계산 알고리즘)
  - 추천 스터디 시스템
  - OWNER 권한 위임
  - API 명세 7개

### 🚧 작성 예정

#### 4단계: 기능별 상세 명세 (계속)
- [ ] **features/03-report-management.md**: 신고 관리 상세 명세
- [ ] **features/04-content-moderation.md**: 콘텐츠 모더레이션 상세 명세
- [ ] **features/05-analytics.md**: 분석 및 리포팅 상세 명세
- [ ] **features/06-system-settings.md**: 시스템 설정 상세 명세 (SYSTEM_ADMIN)

#### 5단계: UI/UX 설계
- [ ] **screens/**: 영역별 UI 컴포넌트 상세 설계

#### 6단계: 최적화 전략
- [ ] **optimize/**: 각 컴포넌트별 Next.js 15/16 최적화 전략

---

## 📖 문서별 주요 내용

### 01-user-features-analysis.md
**목적**: 일반 사용자가 사용할 수 있는 기능을 분석하고 관리자가 해야 할 일을 명확히 정의

**주요 내용**:
1. 일반 사용자 기능 7개 영역 분석
   - 인증 및 계정 관리
   - 스터디 관리
   - 커뮤니케이션 (채팅, 화상통화)
   - 콘텐츠 관리 (공지, 파일)
   - 일정 관리 (캘린더, 할일)
   - 신고 및 모더레이션
   - 알림 시스템

2. 관리자 개입 필요 영역 6개
   - 사용자 관리
   - 스터디 관리
   - 신고 관리
   - 콘텐츠 모더레이션
   - 시스템 설정 및 운영
   - 분석 및 리포팅

3. 역할별 권한 정의
   - SYSTEM_ADMIN: 최고 권한 (시스템 설정, 관리자 임명 등)
   - ADMIN: 일상 운영 (사용자/신고 관리, 콘텐츠 모더레이션)
   - 권한 비교표 (22개 기능)

4. 상호작용 시나리오 5개
   - 신고 접수 및 처리
   - 악성 스터디 발견 및 제재
   - 계정 정지 및 복구
   - 시스템 전체 공지
   - 신규 관리자 임명

---

### 02-admin-system-best-practices.md
**목적**: 국내외 주요 플랫폼의 관리자 시스템을 분석하고 CoUp에 적용 가능한 모범 사례 도출

**주요 내용**:
1. 주요 플랫폼 7개 분석
   - Discord: AI 기반 스팸 탐지, 실시간 모니터링
   - Reddit: 모더레이션 큐, AutoModerator
   - Facebook: 3-strike 시스템, AI 사전 탐지
   - Slack: 워크스페이스 관리, 사용량 통계
   - Notion: 세분화된 권한, 활동 로그
   - GitHub: 조직 관리, 감사 로그
   - WordPress: 5단계 역할 시스템

2. 핵심 구성 요소 7개
   - 대시보드 (핵심 지표, 실시간 그래프)
   - 사용자 관리 (검색, 제재, 일괄 작업)
   - 콘텐츠 관리 (모더레이션 큐, 자동 필터)
   - 신고 관리 (처리 워크플로우)
   - 분석 및 리포팅 (DAU, MAU, 신고 통계)
   - 시스템 설정 (전역 설정, 기능 토글)
   - 감사 로그 (모든 관리자 행동 기록)

3. 모범 사례
   - 3-Strike 제재 시스템
   - 신고 우선순위 자동 계산
   - 콘텐츠 자동 필터링 (욕설, 스팸)
   - 성능 최적화 (캐싱, 인덱싱, 페이지네이션)

4. 보안 및 모니터링
   - 2단계 인증 (SYSTEM_ADMIN 필수)
   - IP 화이트리스트
   - 세션 관리 (30분 타임아웃)
   - 의심 활동 자동 감지

---

### 03-admin-system-integrated.md
**목적**: 1, 2번 문서를 통합하여 CoUp에 최적화된 관리자 시스템 설계

**주요 내용**:
1. 시스템 개요
   - 관리자 시스템의 5가지 목적
   - 관리 대상 범위 (사용자, 스터디, 콘텐츠, 신고, 시스템)

2. 역할 및 권한 체계
   - SYSTEM_ADMIN: 1-3명 (창업자, CTO)
   - ADMIN: 5-10명 (커뮤니티 매니저)
   - 권한 매트릭스 (31개 기능)
   - 권한 검사 시스템 (미들웨어)

3. 핵심 기능 영역 3개 (대시보드, 사용자 관리, 스터디 관리)
   - 각 기능의 UI 레이아웃
   - 데이터 구조
   - 주요 기능

4. 기술 아키텍처
   - 프론트엔드 구조 (폴더, 컴포넌트)
   - 백엔드 API 구조 (30+ 엔드포인트)
   - 데이터베이스 스키마 (4개 모델)
   - 캐싱 전략 (Redis)

5. 구현 로드맵
   - Phase 1 (4주): 핵심 기능
   - Phase 2 (4주): 고급 기능
   - Phase 3 (2주): 최적화 & 자동화
   - 5개 마일스톤

---

### features/01-user-management.md
**목적**: 사용자 관리 기능의 모든 세부 사항을 상세하게 문서화

**주요 내용**:
1. 사용자 목록 관리
   - 검색 (기본/고급)
   - 필터 (역할, 상태, 가입일, 활동도, 제재 이력)
   - 테이블 (9개 컬럼)
   - 일괄 작업 (선택, 메시지 발송, CSV 내보내기)

2. 사용자 상세 조회
   - 2단 레이아웃 (정보 패널 + 빠른 액션)
   - 기본 정보, 활동 통계, 제재 이력, 신고 이력
   - 데이터 구조 (TypeScript 인터페이스)

3. 제재 시스템
   - 3-Strike 시스템 (경고 → 3일 → 7일 → 30일 → 영구)
   - 계정 정지 모달 (추천 조치, 사유 입력, 알림 옵션)
   - 정지 해제

4. 기능 제한 시스템
   - 7가지 제한 가능 기능
   - 다중 선택, 기간 설정

5. 역할 관리 (SYSTEM_ADMIN 전용)
   - USER ↔ ADMIN ↔ SYSTEM_ADMIN
   - 변경 사유 기록

6. API 명세
   - 7개 엔드포인트 (목록, 상세, 정지, 해제, 제한, 역할, 삭제)
   - Request/Response 예시

---

### features/02-study-management.md
**목적**: 스터디 관리 기능의 모든 세부 사항을 상세하게 문서화

**주요 내용**:
1. 스터디 목록 관리
   - 검색 및 필터 (카테고리, 상태, 품질, 멤버 수, 평점)
   - 테이블 (10개 컬럼)
   - 탭 (전체, 활성, 저품질, 추천, 신고됨)

2. 스터디 상세 조회
   - 2단 레이아웃
   - 기본 정보, 활동 통계, 품질 점수, 멤버 목록

3. 스터디 품질 관리
   - 품질 점수 계산 알고리즘 (0-100점)
     - 활동도 (30점)
     - 멤버 충족률 (25점)
     - 평점 (25점)
     - 콘텐츠 활동 (20점)
   - 저품질 스터디 자동 감지
   - OWNER에게 개선 요청

4. 추천 스터디 시스템
   - 자동 추천 자격 검증 (6가지 조건)
   - 추천 우선순위 계산
   - 추천 기간 설정 (7/14/30일, 무기한)

5. OWNER 권한 위임
   - 위임 사유 (장기 부재, 계정 정지, 분쟁 중재)
   - 새 OWNER 선택 (ADMIN 또는 활동도 높은 MEMBER)
   - 이전 OWNER는 ADMIN으로 강등

6. API 명세
   - 7개 엔드포인트 (목록, 상세, 삭제, 공개/비공개, 추천, 권한위임, 저품질)

---

## 🚀 다음 단계

### 1. 기능 문서 완성 (4개)
나머지 기능 영역별 상세 문서 작성:
- features/03-report-management.md
- features/04-content-moderation.md
- features/05-analytics.md
- features/06-system-settings.md

### 2. UI/UX 설계 (screens/)
각 영역별로 폴더를 나눠서 모든 UI 요소 설계:
- 페이지 레이아웃
- 모달/다이얼로그
- 컴포넌트
- 상태 관리
- 사용자 플로우

### 3. 최적화 전략 (optimize/)
각 컴포넌트별 Next.js 15/16 최적화:
- Server Components vs Client Components
- 데이터 fetching 전략 (SSR, SSG, ISR)
- 캐싱 전략 (React Cache, fetch cache)
- 스트리밍 및 Suspense
- 이미지 최적화
- 코드 스플리팅
- 성능 모니터링

---

## 📊 전체 진행률

```
전체 작업: 15개 문서
완료: 5개 (33%)
진행 중: 0개
대기 중: 10개 (67%)

[████████░░░░░░░░░░░░░░░░░░░░] 33%
```

### 단계별 진행률

| 단계 | 문서 수 | 완료 | 진행률 |
|-----|--------|------|-------|
| 1. 기반 분석 | 1 | 1 | 100% |
| 2. 모범 사례 | 1 | 1 | 100% |
| 3. 통합 설계 | 1 | 1 | 100% |
| 4. 기능 명세 | 6 | 2 | 33% |
| 5. UI/UX 설계 | 1 | 0 | 0% |
| 6. 최적화 전략 | 1 | 0 | 0% |
| **전체** | **11** | **5** | **45%** |

---

## 💡 문서 사용 가이드

### 개발자용
1. **시작**: `03-admin-system-integrated.md`에서 전체 구조 파악
2. **상세 기능**: `features/` 폴더에서 구현할 기능 확인
3. **UI 설계**: `screens/` 폴더에서 화면별 요구사항 확인
4. **최적화**: `optimize/` 폴더에서 성능 개선 방법 확인

### 기획자/디자이너용
1. **요구사항**: `01-user-features-analysis.md`에서 필요한 기능 파악
2. **벤치마킹**: `02-admin-system-best-practices.md`에서 타 플랫폼 사례 확인
3. **UI/UX**: `screens/` 폴더에서 화면 설계 참고

### PM용
1. **전체 개요**: `03-admin-system-integrated.md`에서 프로젝트 범위 확인
2. **로드맵**: 구현 로드맵 (10주, 5단계) 확인
3. **마일스톤**: 5개 마일스톤 및 완료 기준 확인

---

## 📝 문서 업데이트 로그

| 날짜 | 버전 | 변경 내용 | 작성자 |
|-----|------|----------|-------|
| 2025-11-27 | 1.0 | 초기 문서 작성 (5개 문서) | CoUp Team |

---

## 📞 문의

문서 관련 문의사항은 프로젝트 관리자에게 연락 바랍니다.

---

**작성 완료일**: 2025-11-27  
**버전**: 1.0  
**작성자**: CoUp Admin System Design Team

