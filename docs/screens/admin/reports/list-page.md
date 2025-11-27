# 신고 관리 - 목록 페이지 UI

> **페이지 경로**: `/admin/reports`  
> **컴포넌트**: Real-time updates with SSE/WebSocket

---

## 1. 레이아웃 (카드 형식)

```
┌─────────────────────────────────────────────────────────────┐
│ 신고 관리                                                    │
├─────────────────────────────────────────────────────────────┤
│ [필터] PENDING | HIGH | HARASSMENT                          │
├─────────────────────────────────────────────────────────────┤
│ 🔴 URGENT | #12345 | 2시간 전                              │
│ 유형: HARASSMENT (괴롭힘)                                   │
│ 대상: 사용자 user123                                        │
│ 신고자: reporter456                                         │
│ 내용: "반복적인 욕설 및 협박..."                            │
│ [상세보기] [승인] [거절]                                    │
├─────────────────────────────────────────────────────────────┤
│ 🟠 HIGH | #12344 | 5시간 전                                │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 실시간 업데이트

```tsx
'use client';
import { useEffect, useState } from 'react';

export function ReportsList({ initialReports }) {
  const [reports, setReports] = useState(initialReports);
  
  useEffect(() => {
    // Server-Sent Events
    const eventSource = new EventSource('/api/admin/reports/stream');
    
    eventSource.onmessage = (event) => {
      const newReport = JSON.parse(event.data);
      setReports(prev => [newReport, ...prev]);
      
      // 알림
      if (newReport.priority === 'URGENT') {
        showNotification('긴급 신고 접수!', newReport);
      }
    };
    
    return () => eventSource.close();
  }, []);
  
  return (
    <div>
      {reports.map(report => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
```

---

## 3. 우선순위 표시

```tsx
export function PriorityBadge({ priority }) {
  const config = {
    URGENT: { icon: '🔴', color: 'red', label: '긴급' },
    HIGH: { icon: '🟠', color: 'orange', label: '높음' },
    MEDIUM: { icon: '🟡', color: 'yellow', label: '보통' },
    LOW: { icon: '⚪', color: 'gray', label: '낮음' }
  };
  
  const { icon, color, label } = config[priority];
  
  return (
    <span className={`priority-${color}`}>
      {icon} {label}
    </span>
  );
}
```

---

**작성 완료**: 2025-11-27

