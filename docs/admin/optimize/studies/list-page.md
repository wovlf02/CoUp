# 최적화 - 스터디 목록 페이지

> **영역**: Studies List  
> **최적화 전략**: Parallel Routes + Prefetching

---

## 1. Parallel Routes (병렬 라우트)

```tsx
// app/admin/studies/layout.tsx
export default function StudiesLayout({
  children,
  stats,
  lowQuality
}: {
  children: React.ReactNode;
  stats: React.ReactNode;
  lowQuality: React.ReactNode;
}) {
  return (
    <div>
      {/* 메인 콘텐츠 */}
      {children}
      
      {/* 병렬로 로드되는 섹션들 */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <Suspense fallback={<StatsSkeleton />}>
          {stats}
        </Suspense>
        
        <Suspense fallback={<LowQualitySkeleton />}>
          {lowQuality}
        </Suspense>
      </div>
    </div>
  );
}

// app/admin/studies/@stats/page.tsx
export default async function StatsSlot() {
  const stats = await getStudyStats();
  return <StudyStatsWidget stats={stats} />;
}

// app/admin/studies/@lowQuality/page.tsx
export default async function LowQualitySlot() {
  const studies = await getLowQualityStudies();
  return <LowQualityList studies={studies} />;
}
```

**최적화 포인트**:
1. **병렬 로딩**: stats와 lowQuality 동시 로드
2. **독립적 캐싱**: 각 슬롯마다 다른 revalidate 시간
3. **Streaming**: 준비된 것부터 렌더링

---

## 2. 품질 점수 계산 최적화

```tsx
// 데이터베이스에 계산된 품질 점수 저장
// 실시간 계산 대신 주기적 업데이트

// cron job (매 시간)
async function updateStudyQualityScores() {
  const studies = await prisma.study.findMany({
    include: {
      _count: { select: { members: true, messages: true } }
    }
  });
  
  for (const study of studies) {
    const score = calculateQualityScore(study);
    
    await prisma.study.update({
      where: { id: study.id },
      data: { qualityScore: score }
    });
  }
}
```

**장점**:
- 목록 조회 시 계산 불필요
- 빠른 정렬 및 필터링
- DB 인덱스 활용 가능

---

## 3. Prefetching

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function StudyRow({ study }) {
  const router = useRouter();
  
  return (
    <tr
      onMouseEnter={() => {
        // ✅ 마우스 오버 시 상세 페이지 prefetch
        router.prefetch(`/admin/studies/${study.id}`);
      }}
      onClick={() => router.push(`/admin/studies/${study.id}`)}
    >
      {/* ... */}
    </tr>
  );
}
```

---

**작성 완료**: 2025-11-27

