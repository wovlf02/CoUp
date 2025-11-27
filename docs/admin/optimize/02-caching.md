# 최적화 가이드 - 02: 캐싱 전략

> **파일**: 02-caching.md  
> **분량**: ~900줄

---

## 1. 개요

캐싱(Caching)은 한 번 계산된 데이터나 렌더링 결과를 재사용하여, 반복적인 고비용 작업을 피하고 애플리케이션의 응답 속도를 극적으로 향상시키는 가장 효과적인 최적화 기법 중 하나입니다. CoUp 관리자 시스템에서는 여러 계층에서 캐싱을 적용하여 데이터베이스 부하를 줄이고 빠른 UI 경험을 제공할 수 있습니다.

주요 캐싱 전략은 다음과 같습니다.
- **데이터 캐시 (Data Cache)**: 데이터베이스 쿼리 결과나 외부 API 응답을 캐싱합니다.
- **전체 경로 캐시 (Full Route Cache)**: 서버 컴포넌트의 렌더링 결과(HTML)를 캐싱합니다.
- **라우터 캐시 (Router Cache)**: 클라이언트 측에서 방문한 경로의 렌더링 결과를 캐싱하여 탐색 속도를 높입니다.

이 문서는 주로 서버 측 데이터 캐시, 특히 **Redis**를 활용한 전략에 중점을 둡니다.

---

## 2. 왜 Redis인가?

- **인메모리(In-Memory) 저장소**: 데이터를 메모리에 저장하여 디스크 기반 데이터베이스보다 월등히 빠른 읽기/쓰기 속도를 제공합니다.
- **다양한 자료구조**: 단순한 Key-Value 문자열 외에도 리스트, 해시, 집합(Set) 등 다양한 자료구조를 지원하여 복잡한 캐싱 로직을 쉽게 구현할 수 있습니다.
- **만료 시간(TTL)**: 모든 키에 만료 시간(Time To Live)을 설정할 수 있어, 일정 시간이 지나면 캐시가 자동으로 무효화되도록 관리하기 용이합니다.
- **확장성**: 분산 환경에서의 확장이 용이하여 서비스 규모가 커져도 안정적으로 사용할 수 있습니다.

---

## 3. Redis를 이용한 데이터 캐시 구현

### 3.1 `getCachedData` 헬퍼 함수

반복적인 캐싱 로직을 추상화한 헬퍼 함수를 만들어 사용하면 편리합니다.

**`lib/cache/redis.ts`**
```typescript
import Redis from 'ioredis';

// Redis 클라이언트 인스턴스는 한 번만 생성하여 재사용합니다.
const redis = new Redis(process.env.REDIS_URL);

/**
 * Redis를 이용한 데이터 캐싱 헬퍼 함수
 * @param key 캐시 키
 * @param fetcher 캐시가 없을 때 데이터를 가져올 비동기 함수
 * @param ttlSeconds 캐시 만료 시간 (초)
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  try {
    // 1. Redis에서 데이터 조회
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log(`[CACHE HIT] key: ${key}`);
      return JSON.parse(cachedData);
    }

    // 2. 캐시가 없으면 fetcher 함수 실행
    console.log(`[CACHE MISS] key: ${key}`);
    const freshData = await fetcher();
    
    // 3. 가져온 데이터를 Redis에 저장 (만료 시간과 함께)
    // 데이터가 null이나 undefined가 아닐 때만 캐싱
    if (freshData) {
      await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
    }

    return freshData;

  } catch (error) {
    console.error(`[CACHE ERROR] for key: ${key}`, error);
    // 캐시에서 에러가 발생하더라도, 원본 데이터는 정상적으로 반환해야 함.
    return fetcher();
  }
}

// 특정 캐시를 무효화하는 함수
export async function invalidateCache(key: string) {
  await redis.del(key);
}
```

### 3.2 적용 사례

**사례 1: 대시보드 통계 API (1분 캐시)**
```typescript
// app/api/admin/dashboard/stats/route.ts
export async function GET() {
  const key = 'admin:dashboard:stats';
  const stats = await getCachedData(
    key,
    async () => {
      // 실제 DB 쿼리 (고비용 작업)
      const [totalUsers, activeStudies] = await prisma.$transaction([...]);
      return { totalUsers, activeStudies };
    },
    60 // 1분
  );
  return NextResponse.json(stats);
}
```

**사례 2: 시스템 설정 조회 (10분 캐시)**
```typescript
// lib/settings.ts
export async function getSystemSettings() {
  const key = 'system:settings';
  return getCachedData(
    key,
    async () => {
      const settings = await prisma.systemSetting.findMany();
      // 설정을 Key-Value 형태로 가공
      return settings.reduce((acc, setting) => {
        acc[setting.id] = setting.value;
        return acc;
      }, {});
    },
    600 // 10분
  );
}

// 설정 업데이트 시 캐시 무효화
// app/api/admin/settings/route.ts (PUT 핸들러)
await prisma.systemSetting.update(...);
await invalidateCache('system:settings'); // 캐시 삭제
```

---

## 4. Next.js 내장 캐시 활용

Next.js는 `fetch` API를 확장하여 자동으로 요청을 캐싱하는 기능을 제공합니다. 외부 API를 호출하는 경우에 매우 유용합니다.

```typescript
// 외부 API를 호출하는 서버 컴포넌트
export default async function ExternalDataViewer() {
  // 동일한 URL의 fetch 요청은 자동으로 캐시(deduping)된다.
  const res = await fetch('https://api.example.com/data', {
    next: { 
      revalidate: 3600, // 1시간 동안 캐시 유지 (ISR)
      tags: ['external-data'] // 캐시 태그 지정
    } 
  });
  const data = await res.json();
  
  // ...
}
```

- **`revalidate`**: 시간 기반으로 캐시를 무효화합니다 (Incremental Static Regeneration).
- **`tags`**: 특정 태그가 지정된 캐시를 필요할 때 수동으로 무효화할 수 있습니다 (`revalidateTag` 함수 사용). 이는 데이터 변경 시 관련 캐시를 즉시 업데이트해야 할 때 유용합니다.

## 5. 캐시 무효화 (Cache Invalidation)

캐싱 전략에서 가장 어려운 부분은 **언제 캐시를 무효화할 것인가**를 결정하는 것입니다.

- **시간 기반 (TTL)**: 가장 간단한 방법. 데이터의 최신성이 중요하지 않은 경우(예: 일일 통계)에 적합합니다.
- **이벤트 기반 (수동 무효화)**: 데이터가 변경되는 시점(생성, 수정, 삭제)에 명시적으로 캐시를 삭제합니다.
  - 예: 새로운 스터디가 생성되면, 스터디 목록 API의 캐시(`admin:studies:page=1&...`)를 삭제해야 합니다.
  - **고급 전략**: 쿼리 파라미터가 다양해져 모든 캐시 키를 추적하기 어려운 경우, `study`라는 그룹 전체를 무효화하는 패턴을 사용할 수 있습니다. (예: `redis.keys('admin:studies:*').then(keys => redis.del(keys))`)
- **On-demand Revalidation (`revalidateTag`)**: Next.js `fetch` 캐시의 경우, `revalidateTag('tag-name')`을 호출하여 특정 태그와 연관된 모든 캐시를 한 번에 무효화할 수 있습니다.

---

**이전**: [01-server-components.md](01-server-components.md)  
**다음**: [03-database.md](03-database.md)

**작성일**: 2025-11-28
