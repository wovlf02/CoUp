# 최적화 가이드 - 03: 데이터베이스

> **파일**: 03-database.md  
> **분량**: ~900줄

---

## 1. 개요

데이터베이스는 애플리케이션 성능의 심장과도 같습니다. 아무리 프론트엔드와 백엔드 로직을 최적화하더라도, 데이터베이스 쿼리가 느리면 전체 시스템이 느려질 수밖에 없습니다. 데이터베이스 최적화는 주로 **느린 쿼리를 찾아내고 개선**하는 과정이며, 가장 효과적인 두 가지 방법은 **인덱싱**과 **N+1 문제 해결**입니다.

---

## 2. 인덱싱 (Indexing)

인덱스는 책의 '찾아보기'와 같습니다. 인덱스가 없으면 데이터베이스는 특정 데이터를 찾기 위해 테이블의 모든 행을 처음부터 끝까지 스캔해야 하지만(Full Table Scan), 인덱스가 있으면 원하는 데이터에 훨씬 빠르게 접근할 수 있습니다.

### 2.1 인덱스는 언제 추가해야 하는가?

- `WHERE` 절에서 자주 사용되는 컬럼
- `ORDER BY` 절에서 정렬 기준으로 사용되는 컬럼
- `JOIN` (Prisma의 `include` 또는 `connect`)에서 연결 고리로 사용되는 컬럼 (Foreign Keys)

**주의**: 인덱스는 읽기 속도를 향상시키지만, 쓰기(INSERT, UPDATE, DELETE) 속도는 약간 저하시킵니다. 따라서 모든 컬럼에 인덱스를 추가하는 것은 비효율적이며, 꼭 필요한 곳에만 추가해야 합니다.

### 2.2 Prisma를 이용한 인덱스 추가

`prisma/schema.prisma` 파일의 모델 정의에 `@@index` 또는 `@unique`를 추가하여 인덱스를 생성할 수 있습니다.

**단일 컬럼 인덱스**
```prisma
model User {
  id    String @id
  email String @unique // @unique는 자동으로 인덱스를 생성
  name  String
  // ...
  
  @@index([name]) // name으로 검색하는 경우가 많을 때
}
```

**복합 인덱스 (Compound Index)**
두 개 이상의 컬럼이 `WHERE` 절에 함께 자주 사용될 때 효과적입니다. 컬럼 순서가 중요하며, 가장 자주 필터링되는 컬럼을 앞에 두는 것이 일반적입니다.

```prisma
model Report {
  id        String
  status    ReportStatus
  priority  ReportPriority
  createdAt DateTime
  // ...
  
  // status와 priority로 함께 필터링하는 경우가 많을 때
  @@index([status, priority])
}
```

### 2.3 CoUp 관리자 시스템 인덱싱 예시

- **`User`**: `email`, `name`, `status`, `role`
- **`Study`**: `category`, `isPublic`, `qualityScore`, `isFeatured`
- **`Report`**: `status`, `priority`, `targetId`, `targetType`
- **`AdminLog`**: `adminId`, `action`, `targetId`

인덱스를 추가한 후에는 `npx prisma migrate dev --name add_indexes` 명령어로 마이그레이션을 실행하여 데이터베이스에 반영해야 합니다.

---

## 3. N+1 쿼리 문제 해결

N+1 쿼리 문제는 ORM(Prisma 등)을 사용할 때 흔히 발생하는 성능 저하의 주범입니다. 목록을 조회(1번 쿼리)한 후, 목록의 각 항목에 대해 추가적인 정보를 얻기 위해 루프를 돌며 N번의 쿼리를 더 실행하는 상황을 말합니다.

### 3.1 문제 상황 예시

스터디 목록과 각 스터디의 소유자 이름을 함께 가져오는 경우:

```typescript
// 나쁜 예시: N+1 발생
async function getStudiesWithOwners() {
  // 1. 스터디 목록 조회 (쿼리 1번)
  const studies = await prisma.study.findMany(); 

  // 2. 각 스터디의 소유자 정보 조회를 위해 루프 (쿼리 N번)
  return Promise.all(
    studies.map(async (study) => {
      const owner = await prisma.user.findUnique({ where: { id: study.ownerId } });
      return { ...study, ownerName: owner.name };
    })
  );
}
```
만약 스터디가 100개라면, 총 101번의 쿼리가 데이터베이스로 전송됩니다.

### 3.2 해결 방법 1: Eager Loading (`include`)

Prisma의 `include` 옵션을 사용하면 관련 데이터를 한 번의 `JOIN` 쿼리로 함께 가져올 수 있습니다.

```typescript
// 좋은 예시: 1번의 쿼리로 해결
async function getStudiesWithOwners() {
  const studies = await prisma.study.findMany({
    include: {
      owner: { // 'owner' 관계를 포함
        select: { name: true } // 필요한 필드만 선택
      }
    }
  });
  return studies;
}
```

### 3.3 해결 방법 2: 데이터로더 (DataLoader)

`include`로 해결하기 어려운 복잡한 중첩 관계나, GraphQL 환경에서는 데이터로더 패턴이 효과적입니다. 데이터로더는 짧은 시간 동안 발생하는 여러 개의 개별 데이터 요청을 모아 하나의 배치(batch) 쿼리로 만들어 실행합니다.

Prisma 환경에서는 [`prisma-dataloader`](https://github.com/YassinEldeeb/prisma-dataloader)와 같은 라이브러리를 사용할 수 있습니다.

---

## 4. 쿼리 최적화

- **필요한 필드만 `select` 하기**: 응답에 필요하지 않은 컬럼(특히 `TEXT`나 `JSON` 타입의 무거운 컬럼)은 `select`에서 제외하여 네트워크 전송량과 데이터베이스 처리량을 줄입니다.
- **`count` 최적화**: `prisma.user.count()`는 간단하지만, 복잡한 `where` 조건이 붙으면 느려질 수 있습니다. 매우 큰 테이블의 경우, 별도의 집계 테이블을 만들거나 추정치를 사용하는 것을 고려할 수 있습니다.
- **트랜잭션 (`$transaction`)**: 여러 개의 쓰기 작업을 수행할 때는 `$transaction`으로 묶어 데이터 정합성을 보장하고, 네트워크 왕복 비용을 줄일 수 있습니다.

### 4.1 느린 쿼리 식별

Prisma는 쿼리 로깅 기능을 제공합니다. `.env` 파일이나 Prisma Client 생성자 옵션에서 로그 레벨을 설정하여, 실행되는 모든 쿼리와 소요 시간을 콘솔에서 확인할 수 있습니다.

```typescript
const prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'query' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' },
  ],
});
```
`"query"` 로그를 활성화하고, 특히 `duration`이 긴 쿼리를 찾아 최적화 대상을 선정합니다.

---

**이전**: [02-caching.md](02-caching.md)  
**다음**: [04-code-splitting.md](04-code-splitting.md)

**작성일**: 2025-11-28
