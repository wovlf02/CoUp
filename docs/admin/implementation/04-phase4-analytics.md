# 구현 가이드 - Phase 4: 분석 & 로그 (Week 7-8)

> **파일**: 04-phase4-analytics.md  
> **분량**: ~1000줄
> **기간**: Week 7 ~ Week 8

---

## 1. Phase 4 목표

Phase 4는 데이터 기반 의사결정을 지원하고 시스템의 투명성과 안정성을 확보하는 단계입니다. **분석 대시보드**를 구축하여 서비스의 주요 지표를 시각화하고, **감사 로그** 및 **시스템 설정** 기능을 구현하여 관리 활동을 추적하고 제어할 수 있도록 합니다.

### 완료 기준
- ✅ **분석 대시보드**: 사용자, 스터디, 신고에 대한 주요 통계가 차트로 시각화된다.
- ✅ **일일 집계**: DAU, 신규 가입자 등 주요 지표가 매일 자정에 자동으로 집계되어 `DailyStats` 테이블에 저장된다.
- ✅ **감사 로그**: `SYSTEM_ADMIN`은 모든 관리자의 활동 기록을 조회하고 필터링할 수 있다.
- ✅ **시스템 설정**: `SYSTEM_ADMIN`은 서비스의 주요 동작(예: 가입 조건, 파일 업로드 용량)을 제어할 수 있다.
- ✅ **관리자 관리**: `SYSTEM_ADMIN`은 다른 관리자를 임명하거나 해임할 수 있다.
- ✅ **백업**: `SYSTEM_ADMIN`은 데이터베이스 백업을 생성하고 다운로드할 수 있다.

---

## 2. Week 7: 분석 대시보드 구현

### 2.1 체크리스트

- [ ] **데이터 모델**: `DailyStats` 모델을 Prisma 스키마에 정의.
- [ ] **크론 작업**: 매일 자정 `aggregateDailyStats` 함수를 실행하여 일일 통계를 집계.
- [ ] **API (Analytics)**:
  - [ ] `GET /api/admin/analytics/users`: 사용자 통계 (DAU/WAU/MAU, 코호트 분석) 데이터 제공
  - [ ] `GET /api/admin/analytics/studies`: 스터디 통계 데이터 제공
- [ ] **Frontend (Analytics Main Page)**: `app/admin/analytics/page.tsx`
  - [ ] 기간 선택 필터 (오늘, 이번 주, 이번 달 등)
  - [ ] Recharts 등을 이용한 차트 컴포넌트 구현
- [ ] **Frontend (User/Study Analytics Pages)**:
  - [ ] `.../analytics/users/page.tsx`
  - [ ] `.../analytics/studies/page.tsx`
- [ ] **리포트 생성**: `GET /api/admin/users/export` CSV 내보내기 기능 구현.

### 2.2 핵심 로직 구현 가이드

#### 일일 통계 집계 (`aggregateDailyStats`)

- **파일**: `scripts/aggregateDailyStats.ts` (또는 `lib/cron/jobs.ts`)
- **로직**:
  1. `node-cron` 또는 Vercel Cron에 의해 매일 00:01에 실행됩니다.
  2. **DAU (Daily Active Users)**: 어제 날짜를 기준으로 `User` 테이블의 `lastLoginAt`이 어제 범위 내에 있는 사용자 수를 계산합니다.
  3. **신규 가입자**: `User` 테이블의 `createdAt`이 어제인 사용자 수를 계산합니다.
  4. **신규 스터디/메시지 등**: 각 테이블에서 `createdAt`을 기준으로 어제 생성된 레코드 수를 계산합니다.
  5. 계산된 모든 지표를 `DailyStats` 테이블에 새로운 레코드로 저장합니다.

**코드 예시**:
```typescript
// scripts/aggregateDailyStats.ts
export async function aggregateDailyStats() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
  const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

  const [dau, newUsers] = await Promise.all([
    prisma.user.count({ where: { lastLoginAt: { gte: startOfYesterday, lte: endOfYesterday } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfYesterday, lte: endOfYesterday } } })
  ]);

  await prisma.dailyStats.create({
    data: {
      date: startOfYesterday,
      dau,
      newUsers,
      // ...
    }
  });
}
```

#### 코호트 분석 (Cohort Analysis)

- **개념**: 특정 기간에 가입한 사용자 그룹(코호트)이 시간이 지남에 따라 얼마나 서비스를 계속 사용하는지(리텐션) 추적하는 분석.
- **로직**:
  1. **코호트 정의**: '11월 1주차 가입자', '11월 2주차 가입자' 등 주별 또는 월별로 그룹을 나눕니다.
  2. **활동 추적**: 각 코호트에 속한 사용자들이 가입 후 1주차, 2주차, 3주차...에 `lastLoginAt` 기록이 있는지 확인합니다.
  3. **데이터 구조화**: 결과를 2차원 배열이나 객체 형태로 만듭니다. (행: 가입 주차, 열: 재방문 주차)
- **구현**: SQL `GROUP BY`와 `CASE` 문을 사용하거나, Prisma로 가져온 데이터를 서버에서 가공하여 구현. 다소 복잡하므로 초기에는 간단한 리텐션 지표(예: 1주차 리텐션, 4주차 리텐션)만 구현하는 것을 고려할 수 있습니다.

---

## 3. Week 8: 감사 로그 & 시스템 설정

### 3.1 체크리스트

- [ ] **권한 제어**: 모든 `SYSTEM_ADMIN` 전용 API와 페이지에 `requireSystemAdmin()` 미들웨어/헬퍼 적용.
- [ ] **API (Audit Logs)**: `GET /api/admin/settings/logs`
  - [ ] 필터 (관리자, 액션 유형, 날짜) 및 검색 기능
- [ ] **API (System Settings)**: `GET /api/admin/settings`, `PUT /api/admin/settings`
- [ ] **API (Admin Management)**:
  - [ ] `GET /api/admin/settings/admins` (관리자 목록)
  - [ ] `POST /api/admin/settings/admins` (관리자 임명)
  - [ ] `DELETE /api/admin/settings/admins/[userId]` (관리자 해임)
- [ ] **API (Backup)**: `POST /api/admin/settings/backup`
- [ ] **Frontend (Audit Log Page)**: `app/admin/settings/logs/page.tsx`
  - [ ] 로그 목록 테이블, 필터링/검색 UI
- [ ] **Frontend (System Settings Page)**: `app/admin/settings/page.tsx`
  - [ ] 기능별로 그룹화된 설정 폼
- [ ] **Frontend (Admin Management Page)**: `app/admin/settings/admins/page.tsx`

### 3.2 핵심 로직 구현 가이드

#### 감사 로그 시스템 (`AdminLog`)

- **`logAdminAction`**: 이전 Phase에서 구현한 `logAdminAction` 함수가 모든 관리자 API에서 일관되게 호출되고 있는지 다시 한번 확인합니다. `before`, `after` 필드를 활용하여 변경 전후 데이터를 JSON 형태로 저장하면, 변경 내역을 추적하기 용이합니다.
- **로그 조회 API**: `GET /api/admin/settings/logs`는 `AdminLog` 테이블을 조회하며, `SYSTEM_ADMIN`만 접근 가능해야 합니다. 다양한 필터 조건을 조합할 수 있도록 Prisma `where` 절을 동적으로 구성합니다.

#### 시스템 설정 (`SystemSetting`)

- **설정 모델**: `SystemSetting` 모델을 Key-Value 형태로 설계합니다.
  ```prisma
  model SystemSetting {
    id          String @id
    value       Json
    description String?
    // ...
  }
  ```
  (예: `id: 'signup.allowNewUsers', value: { "enabled": true }`)
- **설정 캐싱**: 시스템 설정은 자주 바뀌지 않지만 여러 곳에서 조회될 수 있으므로, Redis나 메모리 캐시를 적용하여 DB 부하를 줄이는 것이 매우 효과적입니다. 설정을 업데이트하는 `PUT` API에서는 관련 캐시를 반드시 무효화해야 합니다.

#### 데이터베이스 백업

- **보안**: 백업 API는 `SYSTEM_ADMIN` 중에서도 최상위 권한을 가진 소수의 관리자만 접근할 수 있도록 엄격하게 제어해야 합니다.
- **구현**:
  - `child_process` 모듈의 `exec` 또는 `spawn`을 사용하여 `pg_dump` (PostgreSQL) 또는 `mysqldump` (MySQL) 같은 데이터베이스 CLI 도구를 실행합니다.
  - 생성된 덤프 파일은 보안이 확보된 스토리지(예: Private S3 bucket)에 저장하거나, 직접 스트리밍하여 사용자에게 다운로드시킵니다.
  - **주의**: `DATABASE_URL`과 같은 민감한 정보가 명령어에 포함될 수 있으므로, 에러 로그 등에 노출되지 않도록 주의해야 합니다.

**코드 예시 (`pg_dump` 사용)**:
```typescript
// app/api/admin/settings/backup/route.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  await requireSystemAdmin();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `coup-backup-${timestamp}.sql.gz`;
  const filepath = `/tmp/${filename}`; // 임시 디렉토리 사용

  const command = `pg_dump ${process.env.DATABASE_URL} | gzip > ${filepath}`;

  try {
    await execAsync(command);
    // 생성된 파일을 읽어 스트림으로 반환하거나, S3에 업로드
    // ...
    // 임시 파일 삭제
  } catch (error) {
    console.error("Backup failed:", error);
    return new Response("Backup creation failed", { status: 500 });
  }
}
```

---

## 4. 테스트 시나리오

- **일일 집계 크론**: `aggregateDailyStats` 함수를 수동으로 실행하고, `DailyStats` 테이블에 정확한 데이터가 기록되었는지 확인.
- **감사 로그 조회**:
  1. 임의의 관리자 계정으로 사용자 정지 액션을 수행.
  2. `SYSTEM_ADMIN` 계정으로 감사 로그 페이지에 접속하여 해당 액션 로그가 기록되었는지 확인.
- **시스템 설정 변경**:
  1. `SYSTEM_ADMIN`으로 '신규 사용자 가입 허용' 설정을 `false`로 변경.
  2. 로그아웃 후 신규 가입 페이지에 접속했을 때, 가입이 차단되는지 확인.
- **백업 생성**: 백업 API를 호출하여 백업 파일이 정상적으로 생성되고 다운로드되는지 확인.

---

**이전**: [03-phase3-extended.md](03-phase3-extended.md)  
**다음**: [05-phase5-optimization.md](05-phase5-optimization.md)

**작성일**: 2025-11-28
