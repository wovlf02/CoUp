# 관리자 기능 - 분석 및 리포팅 상세 명세

> **작성일**: 2025-11-27  
> **영역**: Analytics & Reporting  
> **우선순위**: P1 (중요)

---

## 1. 기능 개요

### 핵심 지표
1. **사용자 통계**: DAU, MAU, 신규 가입자, 이탈률
2. **스터디 통계**: 활성 스터디, 카테고리 분포, 평균 멤버 수
3. **활동 통계**: 메시지, 파일, 할일 완료율
4. **신고 통계**: 유형별 분포, 처리 시간, 처리율

---

## 2. 사용자 통계

### 2.1 핵심 지표

```typescript
interface UserAnalytics {
  // 활성 사용자
  dau: number;              // Daily Active Users
  wau: number;              // Weekly Active Users
  mau: number;              // Monthly Active Users
  
  // 신규 가입자
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  
  // 리텐션
  retention7d: number;      // 7일 리텐션 (%)
  retention30d: number;     // 30일 리텐션 (%)
  
  // 이탈
  churnRate: number;        // 이탈률 (%)
  
  // 성장
  growthRate: number;       // 전월 대비 성장률 (%)
}
```

### 2.2 사용자 코호트 분석

```tsx
// 가입 월별 리텐션
interface CohortAnalysis {
  cohort: string;           // "2025-10"
  users: number;            // 가입자 수
  retention: {
    week1: number;          // 1주 후 리텐션 (%)
    week2: number;
    week4: number;
    week8: number;
  };
}
```

---

## 3. 스터디 통계

### 3.1 핵심 지표

```typescript
interface StudyAnalytics {
  // 전체 통계
  totalStudies: number;
  activeStudies: number;    // 지난 7일 활동
  
  // 카테고리 분포
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  
  // 품질 분포
  qualityDistribution: {
    excellent: number;      // 80+ 점
    good: number;           // 50-80 점
    poor: number;           // 0-50 점
  };
  
  // 평균 지표
  avgMembers: number;
  avgRating: number;
  avgLifespan: number;      // 평균 수명 (일)
}
```

### 3.2 스터디 성장 추이

```tsx
// 일/주/월별 스터디 생성 수
interface StudyGrowth {
  date: string;
  created: number;
  deleted: number;
  net: number;              // created - deleted
}
```

---

## 4. 대시보드 구성

### 4.1 메인 대시보드

```
┌─────────────────────────────────────────────────────────────┐
│ 분석 대시보드                                                │
├─────────────────────────────────────────────────────────────┤
│ [4개 핵심 지표 카드]                                         │
│ DAU: 456 | MAU: 12,345 | 신규: 89 | 이탈률: 5.2%           │
├─────────────────────────────────────────────────────────────┤
│ [2단 레이아웃]                                               │
│ ┌────────────────────────┬────────────────────────┐         │
│ │ 사용자 성장 추이       │ 스터디 카테고리 분포   │         │
│ │ [LineChart]            │ [PieChart]             │         │
│ └────────────────────────┴────────────────────────┘         │
├─────────────────────────────────────────────────────────────┤
│ [리텐션 히트맵]                                              │
│ 가입 코호트별 리텐션                                         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 차트 라이브러리

```tsx
// Recharts 사용
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export function UserGrowthChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="users" stroke="#6366F1" />
    </LineChart>
  );
}
```

---

## 5. 리포트 생성

### 5.1 일일 리포트

```typescript
interface DailyReport {
  date: string;
  
  users: {
    dau: number;
    newSignups: number;
    suspensions: number;
  };
  
  studies: {
    created: number;
    deleted: number;
    active: number;
  };
  
  reports: {
    received: number;
    processed: number;
    avgProcessTime: number;  // 시간
  };
  
  highlights: string[];      // 주요 이슈
}
```

### 5.2 주간 리포트

```typescript
interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  
  summary: {
    wau: number;
    weeklyGrowth: number;    // %
    topStudies: Study[];     // TOP 5
    topCategories: string[];
  };
  
  trends: {
    userGrowth: number;      // 전주 대비 %
    studyGrowth: number;
    reportIncrease: number;
  };
  
  recommendations: string[]; // 개선 제안
}
```

---

## 6. 데이터 계산 최적화

### 6.1 집계 테이블

```prisma
// 일일 집계 테이블
model DailyStats {
  id        String   @id @default(cuid())
  date      DateTime @db.Date
  
  // 사용자
  dau       Int
  newUsers  Int
  
  // 스터디
  activeStudies Int
  newStudies    Int
  
  // 활동
  messages      Int
  filesUploaded Int
  
  createdAt DateTime @default(now())
  
  @@unique([date])
  @@index([date])
}
```

### 6.2 크론 작업

```typescript
// 매일 자정 실행
async function aggregateDailyStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dau = await calculateDAU(today);
  const newUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });
  
  await prisma.dailyStats.create({
    data: {
      date: today,
      dau,
      newUsers,
      // ... 기타 지표
    }
  });
}
```

---

## 7. API 명세

```http
# 사용자 통계
GET /api/admin/analytics/users
GET /api/admin/analytics/users/cohort
GET /api/admin/analytics/users/retention

# 스터디 통계
GET /api/admin/analytics/studies
GET /api/admin/analytics/studies/categories
GET /api/admin/analytics/studies/quality

# 신고 통계
GET /api/admin/analytics/reports
GET /api/admin/analytics/reports/types
GET /api/admin/analytics/reports/processing-time

# 리포트
GET /api/admin/analytics/reports/daily?date=2025-11-27
GET /api/admin/analytics/reports/weekly?week=2025-W48
GET /api/admin/analytics/reports/monthly?month=2025-11
```

---

**작성 완료**: 2025-11-27

