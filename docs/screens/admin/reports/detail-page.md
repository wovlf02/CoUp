# 신고 관리 - 신고 상세 페이지

> **페이지 경로**: `/admin/reports/:reportId`

---

## 1. 레이아웃 (3단)

```
┌─────────────────────────────────────────────────────────────┐
│ ← 신고 목록으로     신고 #12345 처리                         │
├──────────────────────┬──────────────────────┬───────────────┤
│ [신고 정보]          │ [증거 & 이력]        │ [처리 액션]   │
│                      │                      │               │
│ 🚨 신고 정보         │ 📸 증거 자료         │ 🛠 처리       │
│ ───────────────      │ ───────────────      │───────────    │
│ ID: #12345           │ [스크린샷1.png]      │ 우선순위:     │
│ 신고자: reporter456  │ [스크린샷2.png]      │ [HIGH]        │
│ 생성일: 2시간 전     │ [증거문서.pdf]       │               │
│ 우선순위: HIGH       │                      │ 담당자:       │
│ 상태: PENDING        │ [증거 추가]          │ [나에게 할당] │
│                      │                      │               │
│ ─────────────────    │ ───────────────      │───────────    │
│ 📋 대상 정보         │ 📊 피신고자 이력     │ 💡 추천 조치: │
│ ───────────────      │ ───────────────      │   ⚠️ 7일 정지 │
│ 유형: USER           │ 경고: 2회            │               │
│ 대상: user123        │ 정지: 1회 (3일)      │ 처리 사유:    │
│ 이메일: user@...     │ 신고당함: 5회        │ [입력창]      │
│                      │                      │               │
│ 신고 내용:           │ 마지막 제재:         │ [승인]        │
│ "반복적인 욕설 및    │ 2025-10-15           │ [거절]        │
│  협박 메시지 발송"   │ (스팸 발송)          │ [보류]        │
└──────────────────────┴──────────────────────┴───────────────┘
```

---

## 2. 신고 정보 섹션

```tsx
<ReportInfoSection report={report}>
  <InfoGrid>
    <InfoItem label="신고 ID" value={report.id} />
    <InfoItem label="신고자" value={report.reporter.name} />
    <InfoItem 
      label="생성일" 
      value={formatRelativeTime(report.createdAt)} 
    />
    <InfoItem 
      label="우선순위" 
      value={
        <Badge variant={getPriorityVariant(report.priority)}>
          {report.priority}
        </Badge>
      }
    />
    <InfoItem 
      label="상태" 
      value={
        <Badge variant={getStatusVariant(report.status)}>
          {getStatusLabel(report.status)}
        </Badge>
      }
    />
  </InfoGrid>
  
  <Divider />
  
  <div>
    <Label>대상 정보</Label>
    <TargetInfoCard target={report.target} />
  </div>
  
  <Divider />
  
  <div>
    <Label>신고 내용</Label>
    <div className="report-reason">
      <Badge variant="danger">{getReportTypeLabel(report.type)}</Badge>
      <p>{report.reason}</p>
    </div>
  </div>
</ReportInfoSection>
```

---

## 3. 증거 자료 섹션

```tsx
<EvidenceSection evidence={report.evidence}>
  <h4>📸 증거 자료</h4>
  
  <div className="evidence-grid">
    {evidence.screenshots.map(screenshot => (
      <ImagePreview
        key={screenshot.id}
        src={screenshot.url}
        alt="증거 스크린샷"
        onClick={() => openLightbox(screenshot)}
      />
    ))}
    
    {evidence.files.map(file => (
      <FileCard
        key={file.id}
        file={file}
        onDownload={() => downloadFile(file)}
      />
    ))}
  </div>
  
  <Button
    variant="outline"
    icon="upload"
    onClick={uploadAdditionalEvidence}
  >
    추가 증거 업로드
  </Button>
</EvidenceSection>
```

---

## 4. 처리 액션 섹션

```tsx
<ProcessActionSection report={report}>
  <h4>🛠 신고 처리</h4>
  
  {/* 우선순위 변경 */}
  <FormGroup>
    <Label>우선순위</Label>
    <Select value={priority} onChange={setPriority}>
      <option value="LOW">낮음</option>
      <option value="MEDIUM">보통</option>
      <option value="HIGH">높음</option>
      <option value="URGENT">긴급</option>
    </Select>
  </FormGroup>
  
  {/* 담당자 할당 */}
  <FormGroup>
    <Label>담당자</Label>
    <div className="assign-actions">
      <Button size="sm" onClick={assignToMe}>
        나에게 할당
      </Button>
      <Select value={assignee} onChange={setAssignee}>
        <option value="">선택...</option>
        {admins.map(admin => (
          <option key={admin.id} value={admin.id}>
            {admin.name}
          </option>
        ))}
      </Select>
    </div>
  </FormGroup>
  
  <Divider />
  
  {/* AI 추천 조치 */}
  <RecommendedAction>
    <Icon name="lightbulb" />
    <div>
      <strong>추천 조치: 7일 정지</strong>
      <small>이전 제재 이력을 바탕으로 추천됩니다</small>
    </div>
  </RecommendedAction>
  
  {/* 처리 결정 */}
  <FormGroup>
    <Label>처리 결정</Label>
    <RadioGroup value={decision} onChange={setDecision}>
      <Radio value="approve">
        <strong>✅ 승인</strong>
        <p>신고가 정당하며 제재 조치를 실행합니다</p>
      </Radio>
      <Radio value="reject">
        <strong>❌ 거절</strong>
        <p>신고 내용이 부적절하거나 증거가 불충분합니다</p>
      </Radio>
      <Radio value="hold">
        <strong>⏸ 보류</strong>
        <p>추가 조사가 필요합니다</p>
      </Radio>
    </RadioGroup>
  </FormGroup>
  
  {/* 제재 조치 선택 (승인 시) */}
  {decision === 'approve' && (
    <FormGroup>
      <Label>제재 조치</Label>
      <Select value={sanction} onChange={setSanction}>
        <option value="WARNING">경고 발송</option>
        <option value="SUSPEND_3D">3일 정지</option>
        <option value="SUSPEND_7D">7일 정지 (권장)</option>
        <option value="SUSPEND_30D">30일 정지</option>
        <option value="RESTRICT">기능 제한</option>
        <option value="DELETE_CONTENT">콘텐츠 삭제</option>
      </Select>
    </FormGroup>
  )}
  
  {/* 처리 사유 */}
  <FormGroup>
    <Label>처리 사유 *</Label>
    <Textarea
      placeholder="처리 결과에 대한 상세 사유를 입력하세요"
      value={resolution}
      onChange={setResolution}
      rows={4}
      required
    />
  </FormGroup>
  
  {/* 알림 옵션 */}
  <FormGroup>
    <Checkbox checked={notifyReporter}>
      신고자에게 처리 결과 통보
    </Checkbox>
    <Checkbox checked={notifyTarget}>
      피신고자에게 제재 통보
    </Checkbox>
  </FormGroup>
  
  <Divider />
  
  {/* 제출 */}
  <ButtonGroup>
    <Button
      variant="primary"
      onClick={submitProcess}
      disabled={!resolution.trim()}
    >
      처리 완료
    </Button>
    <Button variant="ghost" onClick={saveDraft}>
      임시 저장
    </Button>
  </ButtonGroup>
</ProcessActionSection>
```

---

**작성 완료**: 2025-11-27
# 분석 대시보드 - 전체 개요

> **페이지 경로**: `/admin/analytics`  
> **컴포넌트**: Server Component + Client Charts

---

## 1. 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 분석 대시보드                                                │
├─────────────────────────────────────────────────────────────┤
│ [기간 선택] 오늘 | 이번 주 | 이번 달 | 사용자 정의          │
├─────────────────────────────────────────────────────────────┤
│ [4개 핵심 지표 카드]                                         │
│ ┌──────────┬──────────┬──────────┬──────────┐               │
│ │   DAU    │   MAU    │  신규    │ 이탈률   │               │
│ │   456    │ 12,345   │   89     │  5.2%    │               │
│ └──────────┴──────────┴──────────┴──────────┘               │
├─────────────────────────────────────────────────────────────┤
│ [2단 레이아웃]                                               │
│ ┌────────────────────────┬────────────────────────┐         │
│ │ 사용자 성장 추이       │ 스터디 카테고리 분포   │         │
│ │ [LineChart]            │ [PieChart]             │         │
│ └────────────────────────┴────────────────────────┘         │
├─────────────────────────────────────────────────────────────┤
│ [3단 레이아웃]                                               │
│ ┌──────────┬──────────┬──────────┐                         │
│ │활동 히트맵│신고 통계 │리텐션    │                         │
│ └──────────┴──────────┴──────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 핵심 지표 카드

```tsx
interface AnalyticsMetrics {
  dau: {
    value: number;
    change: number;  // %
    trend: 'up' | 'down';
  };
  mau: {
    value: number;
    change: number;
  };
  newUsers: {
    value: number;
    change: number;
  };
  churnRate: {
    value: number;  // %
    change: number;
  };
}
```

---

## 3. 차트 컴포넌트

### 3.1 사용자 성장 차트

```tsx
'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export function UserGrowthChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="users" stroke="#6366F1" />
    </LineChart>
  );
}
```

### 3.2 카테고리 분포 차트

```tsx
import { PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];

export function CategoryPieChart({ data }) {
  return (
    <PieChart width={400} height={300}>
      <Pie
        data={data}
        cx={200}
        cy={150}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
}
```

---

**작성 완료**: 2025-11-27

