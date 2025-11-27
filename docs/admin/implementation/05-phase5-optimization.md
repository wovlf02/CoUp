# 구현 가이드 - Phase 5: 최적화 & 자동화 (Week 9-10)

> **파일**: 05-phase5-optimization.md  
> **분량**: ~1000줄
> **기간**: Week 9 ~ Week 10

---

## 1. Phase 5 목표

Phase 5는 관리자 시스템의 완성도를 높이는 마지막 단계입니다. 반복적인 작업을 **자동화**하여 관리 효율을 극대화하고, 애플리케이션 전반의 **성능을 최적화**하여 빠르고 쾌적한 사용자 경험을 제공하는 데 중점을 둡니다.

### 완료 기준
- ✅ **자동화 시스템**:
  - 혐오 발언, 스팸 등이 포함된 콘텐츠가 작성 시 실시간으로 감지되고 차단/플래그 처리된다.
  - 3-Strike 정책에 따라 반복 위반자에 대한 제재가 자동으로 적용된다.
  - 긴급 상황(예: URGENT 신고) 발생 시 관리자에게 실시간 알림(이메일, Slack 등)이 발송된다.
- ✅ **성능 최적화**:
  - Redis 캐싱이 주요 API에 적용되어 응답 시간을 단축시킨다.
  - 데이터베이스에 필요한 인덱스가 모두 추가되어 쿼리 속도가 향상된다.
  - Next.js의 기능을 활용(Server Components, Dynamic Imports)하여 프론트엔드 렌더링 성능을 최적화한다.
- ✅ **성능 측정**: Vercel Analytics, Lighthouse 등을 통해 Web Vitals 지표(LCP, FCP 등)를 측정하고 목표치를 달성한다.

---

## 2. Week 9: 자동화 시스템 구현

### 2.1 체크리스트

- [ ] **실시간 콘텐츠 검사**:
  - [ ] `checkMessageBeforePost()`와 같은 실시간 검사 함수 구현.
  - [ ] 메시지/게시글 작성 API에 적용하여 부적절한 콘텐츠 사전 차단.
- [ ] **자동 제재 시스템**:
  - [ ] `determineSanctionLevel()` 함수를 신고 처리 로직과 연동.
  - [ ] 특정 조건(예: 7일 내 경고 3회)을 만족하는 사용자를 자동으로 정지시키는 크론 작업 구현.
- [ ] **스마트 알림 시스템**:
  - [ ] Resend, Slack Webhook 등 외부 서비스 연동.
  - [ ] 긴급 신고, 시스템 오류 등 특정 이벤트 발생 시 알림을 발송하는 로직 구현.
- [ ] **이메일 템플릿**:
  - [ ] `react-email`을 사용하여 주요 알림(정지, 경고, 신고 처리 결과)에 대한 이메일 템플릿 작성.

### 2.2 핵심 로직 구현 가이드

#### 실시간 콘텐츠 검사 (`checkMessageBeforePost`)

- **파일**: `lib/moderation/realtimeCheck.ts`
- **로직**:
  - 이 함수는 여러 검사 로직을 순차적으로 또는 병렬로 실행하는 파이프라인 역할을 합니다.
  1.  **키워드 필터**: 가장 빠르므로 제일 먼저 실행합니다. 금지어가 포함되면 즉시 차단.
  2.  **스팸 패턴 분석**: 짧은 시간 내 동일/유사 메시지 반복, 비정상적인 링크 포함 여부 등을 검사합니다.
  3.  **혐오 발언 감지**: 외부 AI 모델 API를 호출합니다. 시간이 걸릴 수 있으므로 타임아웃을 설정하는 것이 좋습니다.
- **결과**: `{ allowed: boolean, action: 'ALLOW' | 'BLOCK' | 'FLAG_FOR_REVIEW', reason: string }` 형태의 객체를 반환하여 API 핸들러가 후속 조치를 취하도록 합니다.

**코드 예시**:
```typescript
// app/api/messages/route.ts (메시지 생성 API)
import { checkMessageBeforePost } from '@/lib/moderation/realtimeCheck';

export async function POST(request: Request) {
  // ...
  const checkResult = await checkMessageBeforePost(content, userId);
  
  if (!checkResult.allowed) {
    if (checkResult.action === 'BLOCK') {
      return new Response(`Message blocked: ${checkResult.reason}`, { status: 403 });
    }
  }
  
  // 메시지 생성 로직
  const newMessage = await prisma.message.create({ data: { content, userId } });

  if (checkResult.action === 'FLAG_FOR_REVIEW') {
    // 생성은 허용하되, 관리자 검토 목록에 추가
    await flagMessageForReview(newMessage.id, checkResult.reason);
  }
  // ...
}
```

#### Slack 알림 통합

- **설정**: Slack 앱을 생성하고 'Incoming Webhooks'를 활성화하여 웹훅 URL을 발급받아 `.env`에 저장합니다.
- **헬퍼 함수**:
  ```typescript
  // lib/notifications/slack.ts
  export async function sendSlackNotification(message: string, channel: string = 'admin-alerts') {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `#${channel}`,
        text: message,
      }),
    });
  }
  ```
- **사용**: 긴급 신고 발생 시 `sendSlackNotification('긴급 신고 발생: [신고 내용]', 'admin-urgent')`와 같이 호출합니다.

---

## 3. Week 10: 성능 최적화

### 3.1 체크리스트

- [ ] **Redis 캐싱**:
  - [ ] `ioredis` 라이브러리 설치 및 Redis 클라이언트 설정.
  - [ ] `getCachedData` 헬퍼 함수 구현.
  - [ ] 적용 대상 선정 및 TTL 설정: 대시보드 통계(1분), 사용자/스터디 목록(5분), 시스템 설정(10분) 등.
- [ ] **데이터베이스 최적화**:
  - [ ] 자주 조회되는 컬럼, `where` 절에 사용되는 컬럼에 인덱스 추가.
  - [ ] Prisma 마이그레이션 실행 (`npx prisma migrate dev --name add_perf_indexes`).
  - [ ] 복잡한 쿼리(특히 통계/분석)에 대해 `EXPLAIN`을 사용하여 실행 계획 분석 및 최적화.
- [ ] **Next.js 최적화**:
  - [ ] 모든 페이지와 컴포넌트를 검토하여 Server Component와 Client Component를 명확히 분리.
  - [ ] `recharts`, `react-table` 등 무거운 라이브러리는 `next/dynamic`으로 지연 로딩.
  - [ ] 모든 `<img>` 태그를 `next/image`로 교체.
- [ ] **성능 측정**:
  - [ ] Vercel Speed Insights 및 Analytics 활성화.
  - [ ] Chrome Lighthouse를 사용하여 Web Vitals(LCP, FCP, CLS) 측정 및 개선.

### 3.2 핵심 로직 구현 가이드

#### Redis 캐싱 헬퍼 (`getCachedData`)

- **파일**: `lib/cache/redis.ts`
- **로직**:
  - Generic 함수로 구현하여 어떤 종류의 데이터든 캐싱할 수 있도록 합니다.
  - **흐름**:
    1.  주어진 `key`로 Redis에 데이터가 있는지 조회 (`redis.get`).
    2.  데이터가 있으면 파싱하여 즉시 반환.
    3.  데이터가 없으면, 인자로 받은 `fetcher` 함수를 실행하여 DB 등에서 데이터를 가져온다.
    4.  가져온 데이터를 `JSON.stringify`로 직렬화하여 Redis에 저장 (`redis.setex` - TTL과 함께 저장).
    5.  데이터를 반환.

**코드 예시**:
```typescript
// lib/cache/redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const freshData = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
  
  return freshData;
}
```
**사용 예시 (대시보드 API)**:
```typescript
// app/api/admin/dashboard/stats/route.ts
export async function GET() {
  const stats = await getCachedData(
    'admin:dashboard:stats',
    async () => {
      // 실제 DB 쿼리 로직
      const [totalUsers, activeStudies] = await Promise.all([...]);
      return { totalUsers, activeStudies };
    },
    60 // 1분 캐시
  );
  return NextResponse.json(stats);
}
```

#### 데이터베이스 인덱스 추가

- **대상**:
  - `User`: `email`, `status`, `role`, `lastLoginAt`
  - `Study`: `category`, `isPublic`, `qualityScore`, `isFeatured`
  - `Report`: `status`, `priority`, `targetId`
  - `AdminLog`: `adminId`, `action`, `targetId`
- **방법**: `prisma/schema.prisma` 파일의 각 모델 하단에 `@@index`를 추가합니다.
  ```prisma
  model User {
    // ... 필드
    @@index([status, role])
    @@index([lastLoginAt])
  }
  ```
- **실행**: `npx prisma migrate dev --name add_perf_indexes` 명령어로 마이그레이션을 생성하고 적용합니다.

---

## 4. 테스트 시나리오

- **자동화 테스트**:
  - **차단**: 금지어가 포함된 메시지 작성 시도 시 403 에러가 반환되는지 확인.
  - **자동 제재**: 경고 2회 상태인 사용자가 신고를 받아 '승인' 처리될 때, 자동으로 '7일 정지'가 적용되는지 통합 테스트로 검증.
- **캐싱 테스트**:
  1. 캐시가 적용된 API(예: 대시보드 통계)를 처음 호출하고 응답 시간을 측정.
  2. TTL 내에 동일 API를 다시 호출하여 응답 시간이 현저히 짧아졌는지 확인.
  3. Redis CLI로 해당 `key`가 존재하는지 확인.
- **성능 측정**:
  - **Lighthouse**: 프로덕션 빌드 후, 관리자 시스템의 주요 페이지(대시보드, 사용자 목록)에 대해 Lighthouse 점수를 측정. Performance 점수가 90점 이상인지 확인.
  - **Web Vitals**: Vercel Speed Insights 대시보드에서 LCP가 2.5초 미만, FCP가 1.8초 미만인지 확인.

---

**이전**: [04-phase4-analytics.md](04-phase4-analytics.md)

**작성일**: 2025-11-28
