# 신고 목록 페이지

> 신고 접수, 처리 및 모니터링

## 📁 파일 구조

```
src/app/admin/reports/
├── page.jsx
└── _components/
    ├── ReportQueue.jsx        # 신고 큐 (~200줄)
    ├── ReportFilters.jsx      # 필터 (~150줄)
    ├── PriorityBadge.jsx      # 우선순위 배지 (~50줄)
    └── QuickProcess.jsx       # 빠른 처리 (~120줄)
```

## 주요 기능

### 1. 신고 큐
- 우선순위별 정렬 (CRITICAL > URGENT > HIGH > MEDIUM > LOW)
- 상태별 필터 (대기/처리중/완료/기각)
- 담당자 배정
- 처리 기한 표시

### 2. 신고 카드
- 신고 유형 아이콘
- 신고자/피신고자 정보
- 신고 사유 요약
- 우선순위 배지
- 경과 시간
- 빠른 액션 버튼

### 3. 필터링
- 상태: PENDING / IN_PROGRESS / RESOLVED / REJECTED
- 우선순위: LOW / MEDIUM / HIGH / URGENT / CRITICAL
- 신고 유형: SPAM / HARASSMENT / INAPPROPRIATE
- 대상 유형: USER / STUDY / MESSAGE
- 담당자: 나 / 미배정 / 전체

### 4. 빠른 처리
- 담당자 배정
- 우선순위 변경
- 상태 변경
- 바로 처리 (경고/정지/삭제)

## 구현 특징

```jsx
// 우선순위 색상 구분
const priorityColors = {
  CRITICAL: 'red',
  URGENT: 'orange',
  HIGH: 'yellow',
  MEDIUM: 'blue',
  LOW: 'gray'
}

// 실시간 업데이트 (선택사항)
useEffect(() => {
  const interval = setInterval(() => {
    revalidate()
  }, 30000) // 30초마다
  
  return () => clearInterval(interval)
}, [])
```

## UI 최적화

- 카드 레이아웃 (목록보다 정보 시각화 좋음)
- 우선순위별 색상 구분
- 긴급 신고는 상단 고정
- 필터 프리셋 (내 담당 / 긴급 / 오늘 접수)

