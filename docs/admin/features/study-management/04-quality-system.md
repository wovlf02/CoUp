# 스터디 관리 - 04: 품질 점수 시스템

> **파일**: 04-quality-system.md  
> **분량**: ~900줄

---

## 1. 시스템 개요

스터디 품질 점수(Quality Score) 시스템은 플랫폼 내 모든 스터디의 상대적인 '건강 상태'를 객관적인 수치로 나타내기 위한 자동화된 평가 시스템입니다. 이 점수는 관리자가 양질의 스터디를 발굴하거나, 방치되거나 문제가 있는 스터디를 식별하는 데 핵심적인 지표로 사용됩니다.

- **점수 범위**: 0점에서 100점 사이
- **평가 방식**: 스터디의 활동성, 인기도, 콘텐츠 품질 등 다양한 요소를 종합하여 점수를 계산합니다.
- **업데이트 주기**: 크론(Cron) 작업을 통해 주기적으로(예: 매시간 또는 매일) 모든 스터디의 점수를 다시 계산하여 최신 상태를 유지합니다.

---

## 2. 품질 점수 계산 알고리즘

품질 점수는 여러 평가 항목의 점수를 합산하여 계산됩니다. 각 항목의 가중치는 서비스 정책에 따라 조정될 수 있습니다.

### 2.1 평가 항목 및 가중치

| 항목 | 최대 점수 | 설명 |
|---|---|---|
| **1. 활동성** | 30점 | 최근 활동이 얼마나 활발했는가? |
| **2. 충원율** | 25점 | 정원 대비 현재 인원이 얼마나 되는가? |
| **3. 사용자 평점** | 25점 | 멤버들이 부여한 평점이 얼마나 높은가? |
| **4. 콘텐츠 기여도** | 20점 | 공지, 메시지 등 콘텐츠가 얼마나 풍부한가? |
| **5. 페널티** | (감점) | 신고받은 횟수 |

### 2.2 항목별 상세 계산 로직

#### 1. 활동성 (30점)
최근 활동(`lastActivityAt`)으로부터 경과된 시간을 기준으로 점수를 차등 부여합니다.
- 1일 이내: 30점
- 3일 이내: 25점
- 7일 이내: 20점
- 14일 이내: 10점
- 30일 이내: 5점
- 30일 초과: 0점

#### 2. 충원율 (25점)
`충원율 = (현재 멤버 수 / 최대 정원) * 100`
- 80% 이상: 25점
- 60% 이상: 20점
- 40% 이상: 15점
- 20% 이상: 10점
- 20% 미만: 5점

#### 3. 사용자 평점 (25점)
스터디의 평균 평점(`rating`)을 기준으로 점수를 부여합니다.
- 4.5 이상: 25점
- 4.0 이상: 20점
- 3.5 이상: 15점
- 3.0 이상: 10점
- 2.0 이상: 5점
- 2.0 미만: 0점
> 리뷰 수가 너무 적은(예: 3개 미만) 스터디는 평점의 신뢰도가 낮으므로, 이 경우 중간 점수(예: 15점)를 부여하는 보정 로직을 추가할 수 있습니다.

#### 4. 콘텐츠 기여도 (20점)
스터디 내에 생성된 콘텐츠의 양에 따라 점수를 부여합니다.
- 누적 메시지 수 (최대 8점)
- 누적 파일 업로드 수 (최대 6점)
- 누적 공지 수 (최대 6점)

#### 5. 페널티 (감점)
스터디가 신고된 횟수(`reportCount`)에 비례하여 총점에서 점수를 차감합니다.
- `감점 = 신고 횟수 * 10` (최대 감점 한도 설정 가능)

---

## 3. 구현 예시

### 3.1 Server-side: `calculateQualityScore` 함수

**`lib/admin/studyQuality.ts`**
```typescript
import { Study } from '@prisma/client';

// 실제로는 Study 모델에 통계 관련 필드가 포함된 타입을 사용해야 합니다.
type StudyWithStats = Study & {
  /* 통계 관련 필드들 */
};

export function calculateQualityScore(study: StudyWithStats): number {
  let score = 0;

  // 1. 활동성 점수
  const daysSinceActivity = (new Date().getTime() - new Date(study.lastActivityAt).getTime()) / (1000 * 3600 * 24);
  if (daysSinceActivity <= 1) score += 30;
  else if (daysSinceActivity <= 3) score += 25;
  // ...

  // 2. 충원율 점수
  const fillRate = study.memberCount / study.maxMembers;
  if (fillRate >= 0.8) score += 25;
  // ...

  // 3. 사용자 평점 점수 (리뷰 수 보정 포함)
  if (study.reviewCount < 3) {
    score += 15; // 신뢰도 낮으므로 중간 점수
  } else {
    if (study.rating >= 4.5) score += 25;
    // ...
  }

  // 4. 콘텐츠 기여도 점수 (생략)
  // ...

  // 5. 페널티
  score -= study.reportCount * 10;
  
  // 최종 점수는 0점에서 100점 사이로 제한
  return Math.max(0, Math.min(Math.round(score), 100));
}
```

### 3.2 Server-side: 주기적 업데이트를 위한 크론 작업

Vercel을 사용하는 경우, `vercel.json`에 크론 작업을 등록하여 특정 API 엔드포인트를 주기적으로 호출할 수 있습니다.

**`vercel.json`**
```json
{
  "crons": [
    {
      "path": "/api/cron/update-quality-scores",
      "schedule": "0 * * * *" 
    }
  ]
}
```
> `0 * * * *`: 매시간 0분에 실행

**`app/api/cron/update-quality-scores/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateQualityScore } from '@/lib/admin/studyQuality';

export async function GET(request: Request) {
  // Vercel Cron의 보안을 위해 헤더나 토큰을 검증하는 로직이 필요합니다.
  // ...

  try {
    const studies = await prisma.study.findMany({
        // 필요한 모든 통계 정보를 include 합니다.
    });

    const updates = studies.map(study => {
      const newScore = calculateQualityScore(study);
      return prisma.study.update({
        where: { id: study.id },
        data: { qualityScore: newScore },
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, message: `${studies.length} studies updated.` });

  } catch (error) {
    console.error("Failed to update quality scores:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
```

---

## 4. 테스트 시나리오

- **단위 테스트 (`calculateQualityScore`)**:
  - 각 평가 항목의 경계값(boundary value)에 해당하는 스터디 데이터를 생성하여, 점수가 정확하게 계산되는지 검증합니다.
    - 예: `lastActivityAt`이 정확히 3일 전일 때, 활동성 점수가 25점이 되는가?
    - 예: `reportCount`가 1일 때, 총점에서 10점이 감점되는가?
  - 최종 점수가 0 미만이나 100을 초과하지 않고 0~100 사이로 클램핑되는지 확인합니다.
- **통합 테스트 (크론 작업)**:
  1. 테스트 DB에 여러 종류의 스터디(활성/비활성, 인기/비인기)를 준비합니다.
  2. `/api/cron/update-quality-scores` 엔드포인트를 수동으로 호출합니다.
  3. API가 성공적으로 응답하는지 확인합니다.
  4. DB에서 각 스터디의 `qualityScore` 필드가 예상된 값으로 업데이트되었는지 검증합니다.

---

**이전**: [03-detail-api.md](03-detail-api.md)  
**다음**: [05-featured-system.md](05-featured-system.md)

**작성일**: 2025-11-28
