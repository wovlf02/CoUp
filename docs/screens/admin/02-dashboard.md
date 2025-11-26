# 관리자 대시보드 화면
**다음 문서**: [03-users.md](./03-users.md)

---

- **Red**: 신고/경고
- **Purple**: 신규 가입
- **Green**: 스터디 관련
- **Blue**: 사용자 관련

## 🎨 색상 테마

---

```
}, [])
  return () => socket.disconnect()
  
  })
    setSystemStatus(status)
    // 시스템 상태 업데이트
  socket.on('system-status', (status) => {
  
  })
    queryClient.invalidateQueries(['admin', 'reports'])
    toast.error(`새로운 신고: ${report.type}`)
    // 새 신고 알림
  socket.on('new-report', (report) => {
  
  const socket = io('/admin')
useEffect(() => {
```javascript
### WebSocket 연결

## 🔄 실시간 업데이트

---

```
</div>
  </div>
    </div>
      <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}} />
    <div className="w-full bg-gray-200 rounded-full h-2">
    </div>
      <span className="text-green-500">45%</span>
      <span>디스크 사용량</span>
    <div className="flex justify-between mb-1">
  <div>
  
  </div>
    </div>
      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}} />
    <div className="w-full bg-gray-200 rounded-full h-2">
    </div>
      <span className="text-yellow-500">60%</span>
      <span>메모리 사용률</span>
    <div className="flex justify-between mb-1">
  <div>
  
  </div>
    </div>
      <div className="bg-red-500 h-2 rounded-full" style={{width: '80%'}} />
    <div className="w-full bg-gray-200 rounded-full h-2">
    </div>
      <span className="text-red-500">80%</span>
      <span>CPU 사용률</span>
    <div className="flex justify-between mb-1">
  <div>
<div className="space-y-4">
```jsx
### 프로그레스 바

## 🖥️ 시스템 상태

---

```
└────────────────────────────────────────┘
│      → 정수진 신고 | [처리하기]        │
│ 🟢 [보통] 기타 | 최지훈 | 1시간 전     │
├────────────────────────────────────────┤
│      → 박민수 신고 | [처리하기]        │
│ 🟡 [높음] 욕설 | 이영희 | 30분 전      │
├────────────────────────────────────────┤
│      → 김철수 신고 | [처리하기]        │
│ 🔴 [긴급] 스팸 | 홍길동 | 10분 전      │
├────────────────────────────────────────┤
│ 📋 최근 신고                            │
┌────────────────────────────────────────┐
```
### 구조

## 🚨 최근 신고 (3개)

---

```
</BarChart>
  <Tooltip />
  <YAxis />
  <XAxis dataKey="category" />
  <Bar dataKey="count" fill="#6366F1" />
<BarChart data={categoryData} width={600} height={300}>
```jsx
### 바 차트 (카테고리별)

## 📊 스터디 활동 현황 차트

---

```
</LineChart>
  <Legend />
  <Tooltip />
  <YAxis />
  <XAxis dataKey="date" />
  <Line type="monotone" dataKey="new" stroke="#10B981" />
  <Line type="monotone" dataKey="total" stroke="#4F46E5" />
<LineChart data={data} width={600} height={300}>
```jsx
### Recharts 라인 차트

```
]
  // ...
  { date: '11/02', total: 1215, new: 18 },
  { date: '11/01', total: 1200, new: 15 },
const data = [
```javascript
### 데이터

## 📈 사용자 증가 추이 차트

---

```
└───────────────────┘
│ +12 (이번 주) 🔺 │ ← 변화량
│ 1,234           │ ← 숫자 (크게)
│ 전체 사용자       │ ← 제목
│ 👥               │ ← 아이콘
┌───────────────────┐
```
### StatCard 컴포넌트

```
</div>
  />
    color="red"
    icon="🚨"
    urgent={3}
    value={12}
    title="미처리 신고"
  <StatCard
  />
    color="purple"
    icon="✨"
    change={+5}
    value={45}
    title="신규 가입"
  <StatCard
  />
    color="green"
    icon="📚"
    change={+8}
    value={156}
    title="활성 스터디"
  <StatCard
  />
    color="blue"
    icon="👥"
    change={+12}
    value={1234}
    title="전체 사용자"
  <StatCard
<div className="grid grid-cols-4 gap-4">
```javascript
### 구조

## 📊 통계 카드 (4개)

---

```
└──────────────────────────────────────────┘
│  메모리: ██████░░░░ 60%                  │                │
│  CPU: ████████░░ 80%                     │                │
│ 시스템 상태                              │                │
├──────────────────────────────────────────┤                │
│ 최근 신고 (3개)                          │                │
├──────────────────┴──────────────────────┤                │
│  (라인 차트)     │   (바 차트)         │                │
│ 사용자 증가 추이  │  스터디 활동 현황    │ ← 차트 2개   │
├──────────────────┬──────────────────────┤                │
│ 사용자  │ 스터디  │ 가입    │ 신고    │                │
│ 전체    │ 활성    │ 신규    │ 미처리  │ ← 통계 카드 4개│
├─────────┬─────────┬─────────┬─────────┐                │
│ 🏠 대시보드                                              │
┌─────────────────────────────────────────────────────────┐
```

## 🎨 레이아웃

---

관리자가 가장 먼저 보는 메인 대시보드 화면입니다.

## 📋 개요

---

> **작성일**: 2025-11-26


