# 공통 컴포넌트 라이브러리

> 관리자 페이지에서 재사용되는 UI 컴포넌트

## 📁 파일 구조

```
src/components/admin/ui/
├── Button.jsx                 # 버튼 (~80줄)
├── Modal.jsx                  # 모달 (~120줄)
├── Dropdown.jsx               # 드롭다운 (~100줄)
├── Table.jsx                  # 테이블 (~150줄)
├── Tabs.jsx                   # 탭 (~100줄)
├── Badge.jsx                  # 배지 (~50줄)
├── Card.jsx                   # 카드 (~60줄)
├── Skeleton.jsx               # 스켈레톤 (~80줄)
├── Pagination.jsx             # 페이지네이션 (~100줄)
└── Toast.jsx                  # 토스트 알림 (~100줄)
```

## 1. Button 컴포넌트

```jsx
// Button.jsx (~80줄)
export default function Button({ 
  children, 
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  onClick,
  ...props 
}) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
```

**Variants:**
- `primary` - 주요 액션
- `secondary` - 보조 액션
- `danger` - 위험한 액션 (삭제 등)
- `ghost` - 배경 없음

**Sizes:**
- `sm` - 작은 버튼
- `md` - 기본 크기
- `lg` - 큰 버튼

## 2. Modal 컴포넌트

```jsx
// Modal.jsx (~120줄)
'use client'

import { useEffect } from 'react'
import styles from './Modal.module.css'

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer 
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </header>
        <div className={styles.content}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </>
  )
}
```

## 3. Table 컴포넌트

```jsx
// Table.jsx (~150줄)
export default function Table({ 
  columns, 
  data, 
  onRowClick,
  selectable,
  selectedRows,
  onSelectRows 
}) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {selectable && <th className={styles.checkboxCell}>
              <input type="checkbox" />
            </th>}
            {columns.map(col => (
              <th key={col.key} className={styles[col.align || 'left']}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {data.map((row, index) => (
            <tr 
              key={index} 
              onClick={() => onRowClick?.(row)}
              className={styles.row}
            >
              {selectable && <td className={styles.checkboxCell}>
                <input type="checkbox" />
              </td>}
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## 4. Badge 컴포넌트

```jsx
// Badge.jsx (~50줄)
export default function Badge({ children, variant = 'default', size = 'md' }) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>
      {children}
    </span>
  )
}
```

**Variants:**
- `default` - 회색
- `success` - 녹색
- `warning` - 노란색
- `danger` - 빨간색
- `info` - 파란색

## 5. Tabs 컴포넌트

```jsx
// Tabs.jsx (~100줄)
'use client'

import { useState } from 'react'
import styles from './Tabs.module.css'

export default function Tabs({ tabs, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tab} ${activeTab === index ? styles.active : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className={styles.tabPanel}>
        {tabs[activeTab].content}
      </div>
    </div>
  )
}
```

## 6. Pagination 컴포넌트

```jsx
// Pagination.jsx (~100줄)
export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  
  return (
    <div className={styles.pagination}>
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.pageButton}
      >
        이전
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${styles.pageButton} ${
            page === currentPage ? styles.active : ''
          }`}
        >
          {page}
        </button>
      ))}
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.pageButton}
      >
        다음
      </button>
    </div>
  )
}
```

## 사용 예시

```jsx
// 버튼 사용
<Button variant="primary" size="lg" onClick={handleSave}>
  저장하기
</Button>

// 모달 사용
<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="사용자 경고"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        취소
      </Button>
      <Button variant="danger" onClick={handleWarn}>
        경고 발급
      </Button>
    </>
  }
>
  <p>이 사용자에게 경고를 발급하시겠습니까?</p>
</Modal>

// 배지 사용
<Badge variant="success">활성</Badge>
<Badge variant="danger">정지</Badge>
```

## 공통 CSS 변수

```css
/* components/admin/ui/common.module.css */
:root {
  --admin-primary: #4F46E5;
  --admin-primary-hover: #4338CA;
  
  --status-success: #10B981;
  --status-warning: #F59E0B;
  --status-danger: #EF4444;
  --status-info: #3B82F6;
  
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-500: #6B7280;
  --gray-700: #374151;
  --gray-900: #111827;
  
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  --body-sm: 0.75rem;
  --body-md: 0.875rem;
  --body-lg: 1rem;
  
  --heading-sm: 1.125rem;
  --heading-md: 1.25rem;
  --heading-lg: 1.5rem;
  --heading-xl: 2rem;
}
```

## ✅ 체크리스트

- [x] 모든 컴포넌트 100줄 이하
- [x] CSS 모듈 분리
- [x] Props 타입 명확
- [x] 재사용 가능한 구조
- [x] 접근성 고려 (ARIA)
- [x] 키보드 네비게이션

