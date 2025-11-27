# 최적화 - 신고 목록 페이지

> **영역**: Reports List  
> **최적화 전략**: Server-Sent Events + Optimistic Updates

---

## 1. Server-Sent Events (실시간 신고)

```tsx
// app/api/admin/reports/stream/route.ts
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Redis Pub/Sub 구독
      const subscriber = redis.duplicate();
      await subscriber.subscribe('new-reports');
      
      subscriber.on('message', (channel, message) => {
        const data = `data: ${message}\n\n`;
        controller.enqueue(encoder.encode(data));
      });
      
      // 연결 종료 처리
      request.signal.addEventListener('abort', () => {
        subscriber.unsubscribe();
        subscriber.quit();
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

---

## 2. 신고 접수 시 브로드캐스트

```tsx
// app/api/reports/route.ts
export async function POST(request: Request) {
  const report = await prisma.report.create({
    data: { /* ... */ }
  });
  
  // ✅ Redis Pub/Sub로 브로드캐스트
  await redis.publish('new-reports', JSON.stringify(report));
  
  return NextResponse.json(report);
}
```

---

## 3. Optimistic Updates (신고 처리)

```tsx
'use client';
import { useOptimistic } from 'react';

export function ReportCard({ report }) {
  const [optimisticReport, processReport] = useOptimistic(
    report,
    (state, newStatus: 'RESOLVED' | 'REJECTED') => ({
      ...state,
      status: newStatus
    })
  );
  
  async function handleProcess(action: 'approve' | 'reject') {
    // ✅ 즉시 UI 업데이트
    processReport(action === 'approve' ? 'RESOLVED' : 'REJECTED');
    
    // ✅ 백그라운드 API 호출
    await fetch(`/api/admin/reports/${report.id}/process`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  }
  
  return (
    <div className={`report-card status-${optimisticReport.status}`}>
      {/* ... */}
      <Button onClick={() => handleProcess('approve')}>승인</Button>
      <Button onClick={() => handleProcess('reject')}>거절</Button>
    </div>
  );
}
```

**최적화 포인트**:
1. **즉각적 피드백**: 처리 버튼 클릭 즉시 UI 변경
2. **백그라운드 처리**: 실제 API는 비동기로 처리
3. **낙관적 업데이트**: 성공을 가정하고 UI 먼저 업데이트

---

## 4. 우선순위 큐 최적화

```tsx
// Redis Sorted Set으로 우선순위 큐 구현
async function addReportToQueue(report: Report) {
  const score = calculatePriorityScore(report);
  
  await redis.zadd(
    'reports:queue',
    score,
    report.id
  );
}

// 우선순위 높은 순으로 조회
async function getTopPriorityReports(limit = 10) {
  const reportIds = await redis.zrevrange('reports:queue', 0, limit - 1);
  
  return await prisma.report.findMany({
    where: { id: { in: reportIds } },
    orderBy: { priority: 'desc' }
  });
}
```

---

**작성 완료**: 2025-11-27
# 스터디 관리 - 목록 페이지 UI

> **페이지 경로**: `/admin/studies`  
> **컴포넌트**: Server + Client Hybrid

---

## 1. 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 스터디 관리                                                  │
├─────────────────────────────────────────────────────────────┤
│ [검색] [카테고리▼] [품질분석▼]                              │
├─────────────────────────────────────────────────────────────┤
│ [탭] [전체] [활성] [저품질] [추천] [신고됨]                 │
├─────────────────────────────────────────────────────────────┤
│ 총 850개 | 활성: 720 | 모집완료: 80                         │
├─────────────────────────────────────────────────────────────┤
│ ┌───┬──────┬────────┬────────┬──────┬────────┬─────────┐   │
│ │□  │이모지│스터디명│ OWNER  │ 멤버 │ 품질   │  액션   │   │
│ ├───┼──────┼────────┼────────┼──────┼────────┼─────────┤   │
│ │□  │💻    │자바    │홍길동  │15/20 │  92점  │[상세]   │   │
│ └───┴──────┴────────┴────────┴──────┴────────┴─────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 탭별 필터링

```tsx
'use client';
import { useSearchParams, useRouter } from 'next/navigation';

const tabs = [
  { id: 'all', label: '전체', filter: {} },
  { id: 'active', label: '활성', filter: { isActive: true } },
  { id: 'low-quality', label: '저품질', filter: { qualityScore: { lt: 50 } } },
  { id: 'featured', label: '추천', filter: { isFeatured: true } },
  { id: 'reported', label: '신고됨', filter: { reportCount: { gt: 0 } } }
];

export function StudyTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'all';
  
  return (
    <div className="tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.set('tab', tab.id);
            router.push(`/admin/studies?${params}`);
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

---

## 3. 품질 점수 표시

```tsx
export function QualityBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };
  
  const getLabel = () => {
    if (score >= 80) return '우수';
    if (score >= 50) return '보통';
    return '저품질';
  };
  
  return (
    <div className={`quality-badge ${getColor()}`}>
      <span className="score">{score}</span>
      <span className="label">{getLabel()}</span>
    </div>
  );
}
```

---

**작성 완료**: 2025-11-27

