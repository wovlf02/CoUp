# 관리자 공통 컴포넌트

> **작성일**: 2025-11-26

---

## 📋 개요

관리자 시스템에서 재사용되는 공통 컴포넌트를 정의합니다.

---

## 🎨 UI 컴포넌트

### 1. StatCard (통계 카드)

#### Props
```typescript
interface StatCardProps {
  title: string
  value: number
  change?: number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'red'
  urgent?: number
}
```

#### 렌더링
```jsx
<div className={`stat-card bg-${color}-50 border-${color}-200`}>
  <div className="icon">{icon}</div>
  <h3>{title}</h3>
  <p className="value">{value.toLocaleString()}</p>
  {change && (
    <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
      {change > 0 ? '+' : ''}{change}
    </span>
  )}
</div>
```

---

### 2. DataTable (데이터 테이블)

#### Props
```typescript
interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  selectable?: boolean
  onSelect?: (ids: string[]) => void
}
```

#### 기능
- 정렬
- 페이지네이션
- 체크박스 선택
- 로딩 상태
- 빈 상태

---

### 3. Modal (모달)

#### Props
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}
```

#### 구조
```jsx
<div className="modal-overlay">
  <div className="modal-content">
    <div className="modal-header">
      <h2>{title}</h2>
      <button onClick={onClose}>✕</button>
    </div>
    <div className="modal-body">
      {children}
    </div>
    {footer && (
      <div className="modal-footer">
        {footer}
      </div>
    )}
  </div>
</div>
```

---

### 4. ConfirmDialog (확인 다이얼로그)

#### Props
```typescript
interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}
```

---

### 5. Toast (토스트 알림)

#### 타입
- success (녹색)
- error (빨간색)
- info (파란색)
- warning (노란색)

#### 사용
```javascript
toast.success('성공적으로 저장되었습니다.')
toast.error('오류가 발생했습니다.')
```

---

### 6. EmptyState (빈 상태)

#### Props
```typescript
interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

#### 렌더링
```jsx
<div className="empty-state">
  <div className="icon">{icon}</div>
  <h3>{title}</h3>
  <p>{description}</p>
  {action && (
    <button onClick={action.onClick}>
      {action.label}
    </button>
  )}
</div>
```

---

## 📊 차트 컴포넌트

### 1. LineChart (라인 차트)
- Recharts 기반
- 반응형

### 2. BarChart (바 차트)
- 카테고리별 데이터 표시

### 3. PieChart (파이 차트)
- 비율 표시

---

## 🎨 폼 컴포넌트

### 1. Input
### 2. Select
### 3. Textarea
### 4. Checkbox
### 5. Radio
### 6. DatePicker

---

## 🔧 유틸리티 컴포넌트

### 1. Badge (배지)
```jsx
<Badge color="green">활성</Badge>
<Badge color="red">정지</Badge>
```

### 2. Skeleton (로딩 스켈레톤)
```jsx
<Skeleton width="100%" height="20px" />
```

### 3. Pagination (페이지네이션)
```jsx
<Pagination
  current={page}
  total={totalPages}
  onChange={setPage}
/>
```

---

**다음 문서**: [10-modals.md](./10-modals.md)

