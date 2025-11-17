# CoUp 프로젝트 문서 📚

> **최종 업데이트**: 2025-11-17  
> **목적**: 프로젝트의 모든 설계 및 구현 문서 통합 관리

---

## 📋 문서 구조

### 🎯 핵심 문서

#### 1. **project_init.md** ⭐⭐⭐
- 프로젝트 종합 가이드
- 기술 스택, 아키텍처, 개발 로드맵
- **새 세션 시작 시 반드시 읽어야 할 문서**

#### 2. **IMPLEMENTATION_STATUS.md** ⭐⭐⭐
- 전체 구현 상태 점검 보고서
- 완료된 화면 21개 / 전체 27개
- 구현 완료율: 95%

#### 3. **FRONTEND_MISSING_FEATURES.md** ⭐⭐⭐
- 미구현 기능 상세 분석
- WebSocket, API 연동, WebRTC 등
- 작업 우선순위 및 예상 시간

#### 4. **STUDY_IMPLEMENTATION_GUIDE.md** ⭐⭐
- 스터디 기능 구현 가이드
- Mock 데이터 사용법
- 파일 구조 및 우선순위

---

### 🏗️ 아키텍처 및 설계

#### 데이터베이스
- **database.md**: 데이터베이스 스키마 설계 (Prisma)
- **database_sql.md**: SQL 스키마 및 쿼리

#### API
- **api.md**: API 엔드포인트 설계

#### 파일 구조
- **file-structure.md**: 프로젝트 파일 구조 및 명명 규칙

---

### 🎨 UI/UX 설계

#### 네비게이션
- **navigation-guide.md**: 네비게이션 바 전역 적용 가이드
- **study-navigation-and-access-design.md**: 스터디 네비게이션 및 접근 제어 종합 설계

#### 디자인 시스템
- **CSS_IMPROVEMENT_DESIGN.md**: CSS 개선 설계
- **pastel-color-implementation-summary.md**: 파스텔 톤 색상 UX 개선 완료 보고서
- **ui-improvement-card-backgrounds.md**: 카드 배경색 변경을 통한 시각적 위계 강화

#### 위젯
- **design-right-sidebar-widgets.md**: 우측 사이드바 위젯 설계

---

### 🔐 보안 및 접근 제어

- **access-control-policy.md**: 접근 제어 정책 (역할 기반 권한)

---

### 🚀 구현 가이드

- **feature-implement.md**: 기능 구현 가이드

---

### 📂 화면 설계 (screens/)

상세한 화면별 설계 문서는 `screens/` 폴더 참조:
- `landing/`: 랜딩 페이지
- `auth/`: 로그인/회원가입
- `dashboard/`: 대시보드
- `study/`: 스터디 관련 (탐색, 내 스터디)
- `my-page/`: 마이페이지
- `notifications/`: 알림
- `tasks/`: 할일
- `legal/`: 법적 문서

---

## 🗂️ 폴더 구조

```
docs/
├── README.md                              # 이 파일
├── project_init.md                        # ⭐ 프로젝트 종합 가이드
├── IMPLEMENTATION_STATUS.md               # ⭐ 구현 상태
├── STUDY_IMPLEMENTATION_GUIDE.md          # ⭐ 스터디 기능 가이드
│
├── 📊 아키텍처
│   ├── database.md
│   ├── database_sql.md
│   ├── api.md
│   └── file-structure.md
│
├── 🎨 UI/UX
│   ├── navigation-guide.md
│   ├── study-navigation-and-access-design.md
│   ├── CSS_IMPROVEMENT_DESIGN.md
│   ├── pastel-color-implementation-summary.md
│   ├── ui-improvement-card-backgrounds.md
│   └── design-right-sidebar-widgets.md
│
├── 🔐 보안
│   └── access-control-policy.md
│
├── 🚀 구현
│   └── feature-implement.md
│
├── 📂 screens/                            # 화면별 상세 설계
│   ├── README.md
│   ├── landing/
│   ├── auth/
│   ├── dashboard/
│   ├── study/
│   ├── my-page/
│   ├── notifications/
│   ├── tasks/
│   └── legal/
│
├── 📋 legal/                              # 법적 문서
│   ├── privacy-policy.md
│   └── terms-of-service.md
│
└── 📝 todo/                               # 할일 및 체크리스트
    └── study/
```

---

## 🎯 빠른 시작 가이드

### 🎯 빠른 시작 가이드

### 새 세션 시작 시
1. **project_init.md** 읽기 (전체 프로젝트 이해)
2. **IMPLEMENTATION_STATUS.md** 확인 (현재 구현 상태)
3. **FRONTEND_MISSING_FEATURES.md** 확인 (미구현 기능 파악)
4. 구현할 기능에 따라 해당 문서 참조

### 스터디 기능 개발 시
1. **STUDY_IMPLEMENTATION_GUIDE.md** 읽기
2. `screens/study/` 폴더의 상세 설계 확인
3. Mock 데이터 사용하여 UI 구현

### UI/UX 개선 시
1. **CSS_IMPROVEMENT_DESIGN.md** 참조
2. **pastel-color-implementation-summary.md** 확인
3. 디자인 시스템 일관성 유지

---

## 📊 문서 상태

| 문서 | 상태 | 최종 업데이트 |
|------|------|--------------|
| project_init.md | ✅ 최신 | 2025-11-05 |
| IMPLEMENTATION_STATUS.md | ✅ 최신 | 2025-11-16 |
| FRONTEND_MISSING_FEATURES.md | ✅ 최신 | 2025-11-17 |
| STUDY_IMPLEMENTATION_GUIDE.md | ✅ 최신 | 2025-11-07 |
| database.md | ✅ 완료 | - |
| api.md | ✅ 완료 | - |
| navigation-guide.md | ✅ 완료 | 2025-11-05 |
| study-navigation-and-access-design.md | ✅ 최신 | 2025-11-07 |
| CSS_IMPROVEMENT_DESIGN.md | ✅ 완료 | - |
| pastel-color-implementation-summary.md | ✅ 완료 | 2025-11-10 |

---

## 🗑️ 삭제된 문서 (중복/불필요)

다음 문서들은 중복 또는 불필요하여 삭제되었습니다:
- `implementation-plan-layout-fix.md` - 이미 구현 완료
- `IMPLEMENTATION_PLAN_USER_PAGES.md` - 인코딩 깨짐, STATUS에 통합
- `routing-redesign.md` - navigation-study-separation-design.md와 중복
- `optimization.md` - 인코딩 깨짐, 내용 일반적
- `navigation-study-separation-design-SUPPLEMENT.md` - 통합됨
- `navigation-study-separation-design.md` - study-navigation-and-access-design.md로 통합
- `study-separation-detailed-design.md` - 중복
- `ui-improvement-background-colors.md` - ui-improvement-card-backgrounds.md와 중복
- `pastel-color-ux-improvement.md` - implementation-summary에 포함

---

## 💡 문서 관리 규칙

### 새 문서 추가 시
1. 적절한 카테고리 폴더에 배치
2. README.md 업데이트
3. 명확한 파일명 사용 (kebab-case)

### 문서 수정 시
1. 최종 업데이트 날짜 기록
2. 변경 이력 문서 내 명시
3. 관련 문서들과 일관성 유지

### 문서 삭제 시
1. 중복 내용 확인
2. 다른 문서에 정보 통합
3. README.md에서 삭제 이력 기록

---

## 🔗 유용한 링크

- 프로젝트 저장소: [GitHub](링크 추가)
- 디자인 시스템: Figma (링크 추가)
- 배포 URL: Vercel (링크 추가)

---

**관리자**: CoUp 개발팀  
**문서 버전**: 2.0  
**정리 완료일**: 2025-11-17

