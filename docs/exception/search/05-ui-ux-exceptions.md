# UI/UX 예외 처리

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 로딩 상태, 빈 상태, 오류 상태, 반응형, 접근성  

---

## 📋 목차

1. [로딩 상태](#1-로딩-상태)
2. [빈 상태](#2-빈-상태)
3. [오류 상태](#3-오류-상태)
4. [반응형 디자인](#4-반응형-디자인)
5. [접근성](#5-접근성)

---

## 1. 로딩 상태

### 1.1 스켈레톤 UI

#### ✅ 구현
```javascript
// src/components/studies/StudiesSkeleton.jsx
export default function StudiesSkeleton({ count = 9 }) {
  return (
    <div className={styles.studiesGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonEmoji} />
            <div className={styles.skeletonBadge} />
          </div>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonDescription} />
          <div className={styles.skeletonMeta} />
        </div>
      ))}
    </div>
  )
}

// 사용
function StudiesPage() {
  const { data, isLoading } = useStudies(queryParams)
  
  if (isLoading) {
    return <StudiesSkeleton count={9} />
  }
  
  // ...
}
```

---

### 1.2 프로그레스 바

#### ✅ 검색 진행률 표시
```javascript
function SearchProgress({ isLoading }) {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    if (isLoading) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      
      return () => clearInterval(interval)
    } else {
      setProgress(100)
      setTimeout(() => setProgress(0), 500)
    }
  }, [isLoading])
  
  if (progress === 0) return null
  
  return (
    <div className={styles.progressBar}>
      <div 
        className={styles.progressFill}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
```

---

## 2. 빈 상태

### 2.1 검색 결과 없음

#### ✅ 컨텍스트별 빈 상태
```javascript
// src/components/studies/StudiesEmptyState.jsx
export default function StudiesEmptyState({ 
  type, 
  keyword, 
  category,
  onReset 
}) {
  const emptyStates = {
    'no-results': {
      icon: '🔍',
      title: '검색 결과가 없습니다',
      description: `"${keyword}"에 대한 스터디를 찾을 수 없습니다.`,
      action: { label: '검색 초기화', onClick: onReset }
    },
    'no-category': {
      icon: '📚',
      title: `${category} 스터디가 없습니다`,
      description: '다른 카테고리를 선택해보세요.',
      action: { label: '전체 보기', onClick: onReset }
    },
    'no-recruiting': {
      icon: '📝',
      title: '모집 중인 스터디가 없습니다',
      description: '모든 스터디를 확인해보세요.',
      action: { label: '전체 보기', onClick: onReset }
    },
    'no-studies': {
      icon: '🎓',
      title: '첫 스터디를 만들어보세요!',
      description: '함께 성장할 스터디 멤버를 찾아보세요.',
      action: { label: '스터디 만들기', href: '/studies/create' }
    }
  }
  
  const state = emptyStates[type] || emptyStates['no-results']
  
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{state.icon}</div>
      <h3>{state.title}</h3>
      <p>{state.description}</p>
      
      {state.action && (
        state.action.href ? (
          <Link href={state.action.href} className={styles.actionButton}>
            {state.action.label}
          </Link>
        ) : (
          <button 
            className={styles.actionButton}
            onClick={state.action.onClick}
          >
            {state.action.label}
          </button>
        )
      )}
      
      {/* 추천 행동 */}
      <div className={styles.suggestions}>
        <h4>이런 시도는 어떨까요?</h4>
        <ul>
          <li>다른 키워드로 검색해보세요</li>
          <li>필터를 조정해보세요</li>
          <li>새로운 스터디를 만들어보세요</li>
        </ul>
      </div>
    </div>
  )
}
```

---

## 3. 오류 상태

### 3.1 오류 유형별 처리

#### ✅ 상세한 오류 메시지
```javascript
function StudiesErrorState({ error, onRetry }) {
  const getErrorInfo = (error) => {
    // 네트워크 오류
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        icon: '📡',
        title: '네트워크 연결 오류',
        description: '인터넷 연결을 확인해주세요.',
        actions: [
          { label: '다시 시도', onClick: onRetry, primary: true },
          { label: '오프라인 보기', onClick: showCached }
        ]
      }
    }
    
    // 타임아웃
    if (error.message.includes('timeout')) {
      return {
        icon: '⏱️',
        title: '요청 시간 초과',
        description: '서버 응답이 지연되고 있습니다.',
        actions: [
          { label: '다시 시도', onClick: onRetry, primary: true }
        ]
      }
    }
    
    // 서버 오류
    if (error.status >= 500) {
      return {
        icon: '🔧',
        title: '서버 오류',
        description: '일시적인 서버 문제가 발생했습니다.',
        actions: [
          { label: '다시 시도', onClick: onRetry, primary: true },
          { label: '상태 페이지 확인', href: '/status' }
        ]
      }
    }
    
    // 기본 오류
    return {
      icon: '⚠️',
      title: '오류가 발생했습니다',
      description: error.message || '알 수 없는 오류입니다.',
      actions: [
        { label: '다시 시도', onClick: onRetry, primary: true },
        { label: '홈으로', href: '/' }
      ]
    }
  }
  
  const errorInfo = getErrorInfo(error)
  
  return (
    <div className={styles.errorState}>
      <div className={styles.errorIcon}>{errorInfo.icon}</div>
      <h3>{errorInfo.title}</h3>
      <p>{errorInfo.description}</p>
      
      <div className={styles.errorActions}>
        {errorInfo.actions.map((action, i) => (
          action.href ? (
            <Link 
              key={i}
              href={action.href} 
              className={action.primary ? styles.primaryButton : styles.secondaryButton}
            >
              {action.label}
            </Link>
          ) : (
            <button
              key={i}
              onClick={action.onClick}
              className={action.primary ? styles.primaryButton : styles.secondaryButton}
            >
              {action.label}
            </button>
          )
        ))}
      </div>
      
      {/* 기술 정보 (개발 모드) */}
      {process.env.NODE_ENV === 'development' && (
        <details className={styles.errorDetails}>
          <summary>기술 정보</summary>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </details>
      )}
    </div>
  )
}
```

---

### 3.2 Error Boundary

#### ✅ React Error Boundary
```javascript
// src/components/ErrorBoundary.jsx
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // 에러 로깅 서비스에 전송
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>문제가 발생했습니다</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            다시 시도
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}

// 사용
<ErrorBoundary>
  <StudiesPage />
</ErrorBoundary>
```

---

## 4. 반응형 디자인

### 4.1 모바일 최적화

#### ✅ 반응형 그리드
```css
/* styles/studies.module.css */
.studiesGrid {
  display: grid;
  gap: 20px;
  
  /* 데스크톱: 3열 */
  grid-template-columns: repeat(3, 1fr);
}

/* 태블릿: 2열 */
@media (max-width: 1024px) {
  .studiesGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 모바일: 1열 */
@media (max-width: 640px) {
  .studiesGrid {
    grid-template-columns: 1fr;
  }
}
```

---

### 4.2 터치 최적화

#### ✅ 모바일 필터 UI
```javascript
function MobileFilters({ filters, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      {/* 모바일: 하단 시트 */}
      <button 
        className={styles.mobileFilterButton}
        onClick={() => setIsOpen(true)}
      >
        🎛️ 필터 ({activeFilterCount})
      </button>
      
      {isOpen && (
        <div className={styles.bottomSheet}>
          <div className={styles.sheetHeader}>
            <h3>필터</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          
          <div className={styles.sheetContent}>
            {/* 필터 옵션 */}
          </div>
          
          <div className={styles.sheetActions}>
            <button onClick={handleReset}>초기화</button>
            <button onClick={() => {
              onChange(filters)
              setIsOpen(false)
            }}>
              적용
            </button>
          </div>
        </div>
      )}
    </>
  )
}
```

---

## 5. 접근성

### 5.1 키보드 네비게이션

#### ✅ 키보드 지원
```javascript
function SearchBar({ onSearch }) {
  const inputRef = useRef(null)
  
  // Ctrl+K로 검색창 포커스
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return (
    <input
      ref={inputRef}
      type="search"
      placeholder="검색... (Ctrl+K)"
      aria-label="스터디 검색"
      // ...
    />
  )
}
```

---

### 5.2 스크린 리더

#### ✅ ARIA 속성
```javascript
function StudyCard({ study }) {
  return (
    <article 
      className={styles.studyCard}
      aria-label={`${study.name} 스터디`}
    >
      <header>
        <h3>{study.name}</h3>
        {study.isRecruiting && (
          <span 
            className={styles.badge}
            aria-label="모집 중"
          >
            모집중
          </span>
        )}
      </header>
      
      <p aria-label="스터디 설명">
        {study.description}
      </p>
      
      <div 
        className={styles.meta}
        aria-label="스터디 정보"
      >
        <span aria-label={`카테고리: ${study.category}`}>
          {study.category}
        </span>
        <span aria-label={`현재 멤버 수: ${study.currentMembers}명, 최대 ${study.maxMembers}명`}>
          👥 {study.currentMembers}/{study.maxMembers}명
        </span>
      </div>
    </article>
  )
}
```

---

### 5.3 포커스 관리

#### ✅ 모달 포커스 트랩
```javascript
function FilterModal({ isOpen, onClose }) {
  const modalRef = useRef(null)
  
  useEffect(() => {
    if (isOpen) {
      // 모달 열릴 때 첫 번째 포커스 가능한 요소에 포커스
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
      
      // Esc 키로 닫기
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handleEscape)
      
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div 
      className={styles.modal}
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-title"
    >
      <h2 id="filter-title">필터</h2>
      {/* ... */}
    </div>
  )
}
```

---

**문서 끝**

