# Phase 5: 통계 분석 시스템 구현 프롬프트

> 다음 세션에서 이 프롬프트를 복사해서 사용하세요.

---

## 📋 프롬프트

```
CoUp 관리자 시스템 구현을 이어서 진행해.

먼저 다음 문서들을 읽어줘:

1. docs/admin/IMPLEMENTATION-PROGRESS-SESSION-2.md
   - 현재까지 완료된 항목
   - 다음 작업
   - 기술 스택 및 컨벤션

2. docs/admin/PHASE-4-COMPLETE-SUMMARY.md
   - Phase 4 완료 내용 (신고 처리)
   - 재사용할 컴포넌트 및 패턴

3. docs/admin/features/complete/04-analytics-dashboard-complete.md
   - 통계 분석 API 명세
   - 데이터 집계 쿼리
   - 구현 예시 코드

4. docs/screens/admin/04-dashboard.md
   - 통계 대시보드 UI 설계
   - 차트 컴포넌트 구조

그 다음 이 순서대로 구현해줘:

### Phase 5: 통계 분석

1단계: 통계 분석 API (3개)
- GET /api/admin/analytics/overview (전체 통계 - 사용자, 스터디, 신고 현황)
- GET /api/admin/analytics/users (사용자 분석 - 가입 추이, 활동 분석)
- GET /api/admin/analytics/studies (스터디 분석 - 생성 추이, 카테고리별 분포)

2단계: 통계 분석 UI
- src/app/admin/analytics/page.jsx (통계 대시보드 페이지)
- src/app/admin/analytics/_components/OverviewCharts.jsx (전체 통계 차트)
- src/app/admin/analytics/_components/UserAnalytics.jsx (사용자 분석)
- src/app/admin/analytics/_components/StudyAnalytics.jsx (스터디 분석)

3단계: 차트 라이브러리 통합
- recharts 설치 및 설정
- 기본 차트 컴포넌트 (LineChart, BarChart, PieChart)
- 반응형 차트 레이아웃

사용자 관리, 스터디 관리, 신고 처리와 동일한 패턴으로 구현하고,
기존에 만든 Button, Badge 컴포넌트를 재사용해.

모든 명령어는 포그라운드에서 실행하고,
파일 생성 후 에러 확인해줘.

구현 완료 후 다음 단계 (설정 및 감사 로그) 안내해줘.
```

---

## 📚 참고 문서 위치

구현 전 반드시 읽어야 할 문서들:

### 필수 문서
1. **진행 상황**
   - `docs/admin/IMPLEMENTATION-PROGRESS-SESSION-2.md`
   - 현재 상태, 완료 항목, 기술 스택

2. **Phase 4 완료 보고서**
   - `docs/admin/PHASE-4-COMPLETE-SUMMARY.md`
   - 신고 처리 구현 패턴 참고

3. **통계 분석 명세**
   - `docs/admin/features/complete/04-analytics-dashboard-complete.md`
   - API 명세, 데이터 집계, 예시 코드

4. **UI 설계**
   - `docs/screens/admin/04-dashboard.md`
   - 통계 대시보드 설계, 차트 구조

### 참고 문서
- `docs/admin/features/complete/01-user-management-complete.md`
- `docs/admin/features/complete/02-study-management-complete.md`
- `docs/admin/features/complete/03-report-handling-complete.md`

---

## 🎯 구현 목표

### API (3개 엔드포인트)
```
GET /api/admin/analytics/overview
GET /api/admin/analytics/users
GET /api/admin/analytics/studies
```

### UI (7개 파일)
```
src/app/admin/analytics/
├── page.jsx
├── page.module.css
└── _components/
    ├── OverviewCharts.jsx
    ├── OverviewCharts.module.css
    ├── UserAnalytics.jsx
    ├── UserAnalytics.module.css
    ├── StudyAnalytics.jsx
    └── StudyAnalytics.module.css
```

### 주요 기능
1. **전체 통계**
   - 사용자 수 (전체, 활성, 정지)
   - 스터디 수 (전체, 공개, 모집중)
   - 신고 수 (대기, 처리중, 해결)
   - 일일 가입자 수 추이 (최근 30일)

2. **사용자 분석**
   - 가입 추이 (월별/주별/일별)
   - 가입 방식 분포 (이메일/Google/GitHub)
   - 활동 사용자 수 (DAU/MAU)
   - 제재 현황

3. **스터디 분석**
   - 생성 추이 (월별/주별/일별)
   - 카테고리별 분포
   - 평균 멤버 수
   - 활성 스터디 비율

---

## 🔧 기술 요구사항

### 차트 라이브러리
```bash
npm install recharts
```

### API 응답 형식
```typescript
// 전체 통계
{
  success: true,
  data: {
    summary: {
      users: { total, active, suspended },
      studies: { total, public, recruiting },
      reports: { pending, in_progress, resolved }
    },
    trends: {
      dailySignups: [{ date, count }],
      dailyStudies: [{ date, count }],
      dailyReports: [{ date, count }]
    }
  }
}

// 사용자 분석
{
  success: true,
  data: {
    signupTrend: [{ period, count }],
    providerDistribution: [{ provider, count }],
    activityMetrics: { dau, mau, wau },
    sanctions: { warnings, suspensions, bans }
  }
}

// 스터디 분석
{
  success: true,
  data: {
    creationTrend: [{ period, count }],
    categoryDistribution: [{ category, count }],
    membershipStats: { avg, min, max },
    activeRatio: number
  }
}
```

---

## ✅ 체크리스트

### API 구현
- [ ] GET /api/admin/analytics/overview
  - [ ] 사용자 요약 통계
  - [ ] 스터디 요약 통계
  - [ ] 신고 요약 통계
  - [ ] 일일 추이 데이터

- [ ] GET /api/admin/analytics/users
  - [ ] 가입 추이
  - [ ] 가입 방식 분포
  - [ ] 활동 메트릭
  - [ ] 제재 현황

- [ ] GET /api/admin/analytics/studies
  - [ ] 생성 추이
  - [ ] 카테고리 분포
  - [ ] 멤버십 통계
  - [ ] 활성 비율

### UI 구현
- [ ] 통계 대시보드 페이지
  - [ ] 요약 카드 (사용자, 스터디, 신고)
  - [ ] 전체 추이 차트
  - [ ] 탭 네비게이션

- [ ] 사용자 분석 컴포넌트
  - [ ] 가입 추이 차트
  - [ ] 가입 방식 파이 차트
  - [ ] 활동 메트릭 카드
  - [ ] 제재 현황 바 차트

- [ ] 스터디 분석 컴포넌트
  - [ ] 생성 추이 차트
  - [ ] 카테고리 분포 바 차트
  - [ ] 멤버십 통계 카드
  - [ ] 활성 비율 게이지

### 차트 구현
- [ ] recharts 설치
- [ ] LineChart 컴포넌트
- [ ] BarChart 컴포넌트
- [ ] PieChart 컴포넌트
- [ ] 반응형 레이아웃
- [ ] 툴팁 커스터마이징
- [ ] 색상 테마 적용

---

## 💡 구현 팁

### 1. Prisma 집계 쿼리
```javascript
// 일별 가입자 수
const signups = await prisma.user.groupBy({
  by: ['createdAt'],
  _count: true,
  where: {
    createdAt: {
      gte: thirtyDaysAgo
    }
  }
})

// 카테고리별 스터디 수
const categories = await prisma.study.groupBy({
  by: ['category'],
  _count: true,
  orderBy: {
    _count: {
      category: 'desc'
    }
  }
})
```

### 2. 날짜 그룹화
```javascript
// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDate = (date) => {
  return date.toISOString().split('T')[0]
}

// 최근 30일 배열 생성
const getLast30Days = () => {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(formatDate(date))
  }
  return days
}
```

### 3. recharts 기본 사용법
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

<LineChart data={data} width={600} height={300}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="count" stroke="#6366f1" />
</LineChart>
```

### 4. 반응형 차트
```jsx
import { ResponsiveContainer } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    {/* ... */}
  </LineChart>
</ResponsiveContainer>
```

---

## 📊 예상 결과

### 완료 시
- ✅ 3개 API 엔드포인트
- ✅ 7개 UI 파일
- ✅ recharts 통합
- ✅ 약 1,800줄 코드
- ✅ 완전한 통계 분석 시스템

### 전체 진행률
```
Phase 1: 백엔드      95% ██████████
Phase 2: 프론트엔드   90% █████████░
전체                85% █████████░
```

---

## 🚀 다음 단계

Phase 5 완료 후:
- Phase 6: 설정 및 감사 로그
- Phase 7: 최종 테스트 및 배포

---

## 📞 참고사항

- 모든 API는 관리자 권한 필요
- 통계 데이터는 캐싱 고려 (추후)
- 차트는 반응형으로 구현
- 에러 처리 및 로딩 상태 필수

---

**예상 소요 시간**: 4-5시간

**시작 전 확인**:
1. recharts 설치 완료
2. 개발 서버 실행 중
3. 관리자 계정으로 로그인
4. 충분한 테스트 데이터 존재

행운을 빕니다! 🚀

