# 🎨 관리자 페이지 디자인 개선 - 빠른 체크리스트

**작성일**: 2025-11-29  
**진행률**: 0% (0/82)

---

## 📅 일별 목표

### ✅ Day 0: 오류 수정 (완료)
- [x] API 클라이언트 오류 수정
- [x] 스터디 목록 로딩 실패 해결
- [x] 신고 페이지 오류 해결
- [x] 분석 페이지 오류 해결
- [x] Import 경로 오류 해결
- [x] 문서 작성 (설계, TODO, 프롬프트)

---

### ⬜ Day 1: 디자인 시스템 (Phase 1)
**목표**: CSS 변수 + 기본 컴포넌트 5개

- [ ] CSS 변수 정의 (admin-tokens.css)
  - [ ] 색상 팔레트
  - [ ] 타이포그래피
  - [ ] 간격 시스템
  - [ ] 그림자/경계선
  - [ ] 애니메이션

- [ ] Button 컴포넌트
  - [ ] 5가지 variants
  - [ ] 5가지 sizes
  - [ ] loading/disabled states
  - [ ] 아이콘 지원

- [ ] Input 컴포넌트
  - [ ] 6가지 types
  - [ ] 상태 관리
  - [ ] 아이콘 지원
  - [ ] validation UI

- [ ] Select 컴포넌트
  - [ ] 기본 기능
  - [ ] 검색 (basic)

- [ ] Badge 컴포넌트 개선
  - [ ] variants 추가
  - [ ] 애니메이션

- [ ] Card 컴포넌트
  - [ ] 서브 컴포넌트
  - [ ] variants

- [ ] 테스트 페이지 (`/admin/design-test`)

**예상 시간**: 4-5시간

---

### ⬜ Day 2: 공통 컴포넌트 (Phase 2)
**목표**: Navigation + Data Display + Feedback

- [ ] AdminNavbar 개선
- [ ] Breadcrumb 개선
- [ ] Sidebar 생성
- [ ] Table 컴포넌트
- [ ] Stats 컴포넌트
- [ ] Modal 개선
- [ ] Toast 시스템
- [ ] Alert 컴포넌트
- [ ] Loading 컴포넌트
- [ ] Dropdown 컴포넌트
- [ ] Tabs 컴포넌트
- [ ] Checkbox/Radio/Switch

**예상 시간**: 6-7시간

---

### ⬜ Day 3: 대시보드 + 사용자 관리 (Phase 3-1)
**목표**: 주요 페이지 2개

#### 대시보드
- [ ] StatsCards 개선
- [ ] 차트 추가 (Recharts)
- [ ] RecentActivity 개선
- [ ] QuickActions 개선

#### 사용자 관리
- [ ] SearchBar + FilterPanel
- [ ] UserTable (Table 컴포넌트 사용)
- [ ] BulkActions
- [ ] UserModal

**예상 시간**: 6-7시간

---

### ⬜ Day 4: 스터디 관리 (Phase 3-2)
**목표**: 스터디 페이지 완성

- [ ] ViewToggle (카드/리스트/그리드)
- [ ] StudyCard
- [ ] StudyList
- [ ] StudyGrid
- [ ] 필터 & 정렬

**예상 시간**: 5-6시간

---

### ⬜ Day 5: 신고 + 분석 (Phase 4-1)
**목표**: 부가 기능 2개

#### 신고 관리
- [ ] ReportCard 개선
- [ ] QuickAction 드롭다운
- [ ] 필터 개선

#### 분석
- [ ] DateRangePicker
- [ ] 차트 개선 (3개)
- [ ] 데이터 테이블

**예상 시간**: 5-6시간

---

### ⬜ Day 6: 설정 + 감사로그 (Phase 4-2)
**목표**: 나머지 페이지 완성

#### 설정
- [ ] SettingsSidebar
- [ ] SettingsForm 개선
- [ ] SaveBar

#### 감사로그
- [ ] LogTable 개선
- [ ] TimelineView

**예상 시간**: 4-5시간

---

### ⬜ Day 7: 반응형 & 접근성 (Phase 5)
**목표**: 모바일 + 접근성

- [ ] 브레이크포인트 정의
- [ ] 모바일 레이아웃 (5개 페이지)
- [ ] 터치 최적화
- [ ] ARIA 속성 추가
- [ ] 키보드 네비게이션
- [ ] 대비 비율 확인
- [ ] 스크린 리더 테스트

**예상 시간**: 6-7시간

---

### ⬜ Day 8: 최종 검수 & 문서화 (Phase 6)
**목표**: 품질 보증

- [ ] 시각적 테스트 (모든 페이지)
- [ ] 기능 테스트
- [ ] 성능 테스트 (Lighthouse)
- [ ] 브라우저 호환성
- [ ] 컴포넌트 문서 작성
- [ ] 스타일 가이드 작성
- [ ] 변경 사항 요약 문서
- [ ] 스크린샷 촬영

**예상 시간**: 5-6시간

---

## 🎯 Phase별 빠른 요약

### Phase 1: 디자인 시스템 (Day 1)
- CSS 변수 + 기본 컴포넌트 5개
- **진행률**: 0/15

### Phase 2: 공통 컴포넌트 (Day 2)
- Navigation + Data + Feedback 컴포넌트
- **진행률**: 0/18

### Phase 3: 주요 페이지 (Day 3-4)
- 대시보드, 사용자, 스터디 관리
- **진행률**: 0/21

### Phase 4: 부가 기능 (Day 5-6)
- 신고, 분석, 설정, 감사로그
- **진행률**: 0/12

### Phase 5: 반응형 & 접근성 (Day 7)
- 모바일 + ARIA + 키보드
- **진행률**: 0/10

### Phase 6: 최종 검수 (Day 8)
- 테스트 + 문서화
- **진행률**: 0/6

---

## 📊 전체 진행률

```
진행률: ████░░░░░░░░░░░░░░░░ 0% (0/82)

오류 수정:  ████████████████████ 100% ✅
디자인 개선: ░░░░░░░░░░░░░░░░░░░░   0% ⬜
```

---

## 🚀 다음 할 일

### 즉시
```
다음 세션에서:
docs/admin/NEXT-SESSION-DESIGN-PHASE-1-PROMPT.md 파일 열기
→ Phase 1 시작!
```

### 준비물
- [ ] 패키지 설치 (`clsx`, `recharts` 등)
- [ ] 폴더 생성 (Button, Input, Select, Card)
- [ ] 개발 서버 실행

---

## 📁 관련 문서

1. **설계 문서**: `docs/admin/DESIGN-IMPROVEMENT-PLAN.md`
   - 전체 디자인 시스템 설계
   - 페이지별 개선 계획
   - 컴포넌트 스펙

2. **상세 TODO**: `docs/admin/DESIGN-TODO.md`
   - 82개 작업 항목
   - 파일별 체크리스트
   - 예상 소요 시간

3. **다음 세션 프롬프트**: `docs/admin/NEXT-SESSION-DESIGN-PHASE-1-PROMPT.md`
   - Phase 1 시작 가이드
   - 단계별 작업 설명
   - 예시 코드

4. **오류 수정 보고서**: `docs/admin/ERROR-FIX-REPORT.md`
   - 수정된 오류 목록
   - 해결 방법
   - 테스트 결과

---

**마지막 업데이트**: 2025-11-29  
**다음 업데이트**: Phase 1 완료 후

