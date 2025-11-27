# 관리자 기능 - 신고 관리 상세 명세 (요약본)

> **작성일**: 2025-11-27  
> **영역**: Report Management  
> **우선순위**: P0 (최우선)

---

## 1. 기능 개요

### 핵심 기능
1. **신고 접수 및 분류**: 자동 우선순위 계산
2. **신고 처리 워크플로우**: 검토 → 판단 → 조치 → 완료
3. **담당자 할당**: 자동/수동 할당
4. **제재 조치 실행**: 경고, 정지, 삭제, 기능 제한
5. **신고 통계**: 유형별, 처리 현황 분석

---

## 2. 신고 목록 페이지

### 필터 옵션
```typescript
{
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED",
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  type: "SPAM" | "HARASSMENT" | "INAPPROPRIATE" | "COPYRIGHT" | "OTHER",
  targetType: "USER" | "STUDY" | "MESSAGE",
  assignedTo: string,  // 담당자 ID
  dateFrom: string,
  dateTo: string
}
```

### 신고 카드 UI
```
🔴 URGENT | #12345 | 2시간 전
유형: HARASSMENT (괴롭힘)
대상: 사용자 user123
신고자: reporter456
내용: "반복적인 욕설 및 협박 메시지 발송..."
[상세보기] [빠른 처리: 승인 | 거절]
```

---

## 3. 신고 상세 페이지 (3단 레이아웃)

### 왼쪽: 신고 정보 + 대상 정보
### 중앙: 증거 자료 + 피신고자 이력
### 우측: 처리 액션

---

## 4. 신고 처리 워크플로우

```
[신고 접수]
    ↓
[자동 우선순위 계산] (AI 기반)
    ↓
[담당자 할당] (Round-robin 또는 수동)
    ↓
[검토] (증거 확인, 이력 조회)
    ↓
[판단] (승인/거절/보류)
    ↓
[조치 실행] (제재 적용)
    ↓
[관련자 통보] (신고자, 피신고자)
    ↓
[완료 및 로그]
```

### 우선순위 자동 계산
```javascript
function calculateReportPriority(report) {
  let score = 0;
  
  // 신고 유형 (0-30점)
  if (report.type === 'HARASSMENT') score += 30;
  if (report.type === 'INAPPROPRIATE') score += 20;
  if (report.type === 'SPAM') score += 10;
  
  // 피신고자 이력 (0-40점)
  score += report.target.warningCount * 15;
  score += report.target.suspensionCount * 25;
  
  // 신고 빈도 (0-20점)
  const recentReports = getRecentReports(report.targetId, 7);
  score += recentReports.length * 10;
  
  // 증거 품질 (0-10점)
  if (report.evidence?.screenshots?.length > 0) score += 5;
  if (report.evidence?.description?.length > 100) score += 5;
  
  // 우선순위 결정
  if (score >= 70) return 'URGENT';
  if (score >= 50) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}
```

---

## 5. 제재 조치

### 제재 옵션
1. **경고 (WARNING)**: 경고 메시지 발송
2. **계정 정지 (SUSPEND)**: 1일/3일/7일/30일/영구
3. **기능 제한 (RESTRICT)**: 특정 기능만 차단
4. **콘텐츠 삭제 (DELETE)**: 메시지, 파일, 스터디 삭제
5. **신고 기각 (REJECT)**: 신고 내용 부적절

### 신고 처리 모달
```tsx
<ProcessReportModal report={report}>
  <h2>신고 처리</h2>
  
  {/* 추천 조치 (AI 기반) */}
  <RecommendedAction>
    💡 추천: 7일 정지 (이전 제재 2회)
  </RecommendedAction>
  
  {/* 처리 결정 */}
  <RadioGroup value={decision}>
    <Radio value="approve">✅ 승인 (제재 조치 실행)</Radio>
    <Radio value="reject">❌ 거절 (신고 기각)</Radio>
    <Radio value="hold">⏸ 보류 (추가 조사 필요)</Radio>
  </RadioGroup>
  
  {/* 제재 유형 선택 (승인 시) */}
  {decision === 'approve' && (
    <Select value={sanctionType}>
      <option value="WARNING">경고 발송</option>
      <option value="SUSPEND_3D">3일 정지</option>
      <option value="SUSPEND_7D">7일 정지 (권장)</option>
      <option value="SUSPEND_30D">30일 정지</option>
      <option value="RESTRICT">기능 제한</option>
      <option value="DELETE">콘텐츠 삭제</option>
    </Select>
  )}
  
  {/* 처리 사유 */}
  <Textarea 
    placeholder="처리 사유를 입력하세요"
    value={resolution}
  />
  
  {/* 알림 옵션 */}
  <Checkbox>신고자에게 처리 결과 통보</Checkbox>
  <Checkbox>피신고자에게 제재 통보</Checkbox>
  
  <Button onClick={submitProcess}>처리 완료</Button>
</ProcessReportModal>
```

---

## 6. 신고 통계

### 대시보드 위젯
```tsx
<ReportStatsWidget>
  <StatCard title="총 신고" value={totalReports} />
  <StatCard title="처리 대기" value={pendingReports} trend="up" />
  <StatCard title="평균 처리 시간" value="4.5시간" trend="down" />
  <StatCard title="처리율" value="95%" />
  
  <Chart title="신고 유형별 분포">
    SPAM: 40%
    HARASSMENT: 30%
    INAPPROPRIATE: 20%
    OTHER: 10%
  </Chart>
  
  <Chart title="주간 신고 추이">
    [7일간 신고 건수 그래프]
  </Chart>
</ReportStatsWidget>
```

---

## 7. API 명세

```http
GET    /api/admin/reports                   # 신고 목록
GET    /api/admin/reports/:id               # 신고 상세
POST   /api/admin/reports/:id/assign        # 담당자 할당
POST   /api/admin/reports/:id/process       # 신고 처리
GET    /api/admin/reports/statistics        # 신고 통계
```

---

**문서 버전**: 1.0 (요약본)  
**작성 완료일**: 2025-11-27

