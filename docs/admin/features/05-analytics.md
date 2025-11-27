# 관리자 기능 - 05: 분석 및 리포팅

> **파일**: 05-analytics.md
> **상태**: 작성 중

---

## 1. 개요

분석 및 리포팅 기능은 CoUp 플랫폼의 운영 현황과 사용자 활동 데이터를 수집, 집계, 시각화하여 데이터 기반의 의사결정을 지원하는 핵심 도구입니다. 관리자는 이 기능을 통해 서비스의 성장 추이, 사용자 행동 패턴, 콘텐츠 현황 등을 한눈에 파악할 수 있습니다.

### 주요 기능
- **핵심 지표 대시보드**: DAU, WAU, MAU, 신규 가입자, 활성 스터디 등 서비스의 건강 상태를 나타내는 핵심 지표(KPI)를 제공합니다.
- **사용자 분석**: 가입 추이, 재방문율(Retention), 코호트 분석 등 사용자 그룹의 행동 패턴을 심층적으로 분석합니다.
- **스터디 분석**: 카테고리별 분포, 품질 분포 등 스터디 생태계의 동향을 분석합니다.
- **신고 분석**: 신고 유형, 처리율, 평균 처리 시간 등 모더레이션 팀의 효율성을 측정합니다.
- **데이터 내보내기**: 분석된 데이터를 CSV 파일 등으로 내보내 외부 도구에서 활용할 수 있도록 합니다.

---

## 2. 시스템 설계

### 2.1 데이터 집계 아키텍처

실시간으로 모든 통계를 계산하는 것은 데이터베이스에 큰 부하를 주므로, **일일 집계(Daily Aggregation)** 방식을 사용합니다.

```mermaid
graph TD
    A[운영 DB<br/>(User, Study, Message...)] --> B(Vercel Cron / Scheduler<br/>매일 자정 실행);
    B --> C[일일 집계 스크립트<br/>aggregateDailyStats.ts];
    C --> D[분석용 집계 DB<br/>(DailyStats 테이블)];
    D --> E[분석 API<br/>/api/admin/analytics/...];
    E --> F[관리자 대시보드<br/>(차트, 그래프)];
```

- **`DailyStats` 모델**: 매일의 핵심 지표를 저장하는 별도의 테이블을 운영합니다. 이를 통해 기간별 통계 조회 시 무거운 `COUNT` 쿼리 대신, 이미 계산된 값을 빠르게 조회할 수 있습니다.

**`prisma/schema.prisma` (일부)**
```prisma
model DailyStats {
  id            String   @id @default(cuid())
  date          DateTime @unique @db.Date
  
  dau           Int // 일일 활성 사용자
  newUsers      Int // 신규 가입자
  newStudies    Int // 신규 생성 스터디
  activeStudies Int // 활성 스터디 수
  messages      Int // 일일 메시지 수
  // ... 기타 필요한 지표

  createdAt     DateTime @default(now())
}
```

---

## 3. 세부 기능 명세

### 3.1 사용자 분석

- **UI**: `app/admin/analytics/users/page.tsx`
- **주요 지표**:
  - **DAU/WAU/MAU**: 일/주/월간 순수 활성 사용자 수. `DailyStats` 테이블과 `User` 테이블의 `lastLoginAt`을 조합하여 계산합니다.
  - **신규 가입자 추이**: `DailyStats`의 `newUsers` 필드를 기반으로 시계열 그래프를 생성합니다.
  - **재방문율 (Retention)**: 특정 주차에 가입한 사용자가 N주 후에 다시 방문하는 비율을 나타내는 코호트 차트를 제공합니다. 이는 서비스의 만족도와 직결되는 중요한 지표입니다.

### 3.2 스터디 분석

- **UI**: `app/admin/analytics/studies/page.tsx`
- **주요 지표**:
  - **카테고리별 분포**: 각 카테고리에 속한 스터디의 비율을 파이 차트로 보여줍니다.
  - **품질 분포**: 전체 스터디를 품질 점수(excellent, good, poor)에 따라 나누어 분포를 보여줍니다.
  - **스터디 성장 추이**: `DailyStats`의 `newStudies`를 기반으로 신규 스터디 생성 추이를 보여줍니다.

### 3.3 신고 분석

- **UI**: `app/admin/analytics/reports/page.tsx` (가칭)
- **주요 지표**:
  - **유형별 분포**: 스팸, 괴롭힘 등 신고 유형별 비중을 보여줍니다.
  - **평균 처리 시간 (Time to Resolution)**: 신고가 접수된 후 '완료(RESOLVED)' 또는 '거절(REJECTED)' 상태가 되기까지 걸린 평균 시간. 모더레이션 팀의 업무 효율성을 나타냅니다.
  - **처리율**: 특정 기간 동안 접수된 신고 중 처리된 신고의 비율.

### 3.4 데이터 내보내기 (CSV)

- **기능**: 관리자가 사용자 목록, 스터디 목록 등을 필터링하여 CSV 파일로 다운로드할 수 있는 기능입니다.
- **구현**:
  - `GET /api/admin/users/export` 와 같은 API 엔드포인트를 만듭니다.
  - 서버에서 `ReadableStream`을 사용하여 대용량 데이터도 메모리 문제 없이 스트리밍 방식으로 클라이언트에 전송합니다.
  - `Content-Type` 헤더를 `text/csv`로, `Content-Disposition` 헤더를 `attachment; filename="export.csv"`로 설정하여 브라우저가 파일을 다운로드하도록 합니다.

---

## 4. API 명세

```http
# 기간별 주요 통계 (DailyStats 기반)
GET /api/admin/analytics/kpi?from=...&to=...

# 사용자 코호트 분석 데이터
GET /api/admin/analytics/users/retention

# 스터디 카테고리 분포
GET /api/admin/analytics/studies/category-distribution

# 스터디 품질 분포
GET /api/admin/analytics/studies/quality-distribution

# 사용자 목록 CSV 내보내기
GET /api/admin/users/export?status=ACTIVE&...
```

---

**이전**: [04-content-moderation.md](04-content-moderation.md)
**다음**: [06-system-settings.md](06-system-settings.md)

**작성일**: 2025-11-28