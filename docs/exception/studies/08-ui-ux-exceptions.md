# UI/UX 예외 처리
**다음 문서**: [성능 최적화](./09-performance-optimization.md)

---

```
}
  return <button onClick={handleJoin}>가입하기</button>

  }
    }
      toast.error(error.message || '가입에 실패했습니다')
    } catch (error) {
      toast.success('가입이 완료되었습니다')
      await joinMutation.mutateAsync()
    try {
  const handleJoin = async () => {

  const joinMutation = useJoinStudy(studyId)
function JoinButton({ studyId }) {

import { toast } from 'react-hot-toast'
// 사용 예

}
  )
    </html>
      </body>
        />
          }}
            },
              },
                secondary: '#fff',
                primary: '#ef4444',
              iconTheme: {
            error: {
            },
              },
                secondary: '#fff',
                primary: '#10b981',
              iconTheme: {
            success: {
            },
              color: '#fff',
              background: '#363636',
            style: {
            duration: 3000,
          toastOptions={{
          position="top-right"
        <Toaster
        {children}
      <body>
    <html>
  return (
export default function RootLayout({ children }) {

import { Toaster } from 'react-hot-toast'
// src/app/layout.js
```javascript

### ✅ Toast 설정

## 토스트 알림

---

```
}
  )
    </div>
      )}
        </Link>
          <button className="btn-primary">{action.text}</button>
        <Link href={action.href}>
      {action && (
      <p>{description}</p>
      <h3>{title}</h3>
      <div className="icon">{icon}</div>
    <div className="empty-state">
  return (

  const { icon, title, description, action } = content[type]

  }
    }
      action: null
      description: '이 스터디에 가입하면 내용을 볼 수 있습니다',
      title: '멤버만 볼 수 있습니다',
      icon: '🔒',
    'not-member': {
    },
      }
        href: '/studies/create'
        text: '스터디 만들기',
      action: {
      description: '첫 번째 스터디를 만들어보세요!',
      title: '아직 스터디가 없습니다',
      icon: '📚',
    'no-studies': {
    },
      action: null
      description: '다른 키워드로 검색해보세요',
      title: '검색 결과가 없습니다',
      icon: '🔍',
    'no-results': {
  const content = {
function StudiesEmptyState({ type = 'no-results' }) {
// src/components/studies/StudiesEmptyState.jsx
```javascript

### ✅ EmptyState 컴포넌트

## 빈 상태

---

```
export default ErrorBoundary

}
  }
    return this.props.children

    }
      )
        </div>
          </button>
            새로고침
          <button onClick={() => window.location.reload()}>
          <p>페이지를 새로고침 해주세요</p>
          <h2>⚠️ 오류가 발생했습니다</h2>
        <div className="error-boundary">
      return (
    if (this.state.hasError) {
  render() {

  }
    console.error('Error caught:', error, errorInfo)
  componentDidCatch(error, errorInfo) {

  }
    return { hasError: true, error }
  static getDerivedStateFromError(error) {

  }
    this.state = { hasError: false, error: null }
    super(props)
  constructor(props) {
class ErrorBoundary extends Component {

import { Component } from 'react'

'use client'
// src/components/ErrorBoundary.jsx
```javascript

### ✅ 에러 바운더리

## 에러 상태

---

```
}
  50% { opacity: 0.5; }
  0%, 100% { opacity: 1; }
@keyframes pulse {

}
  animation: pulse 1.5s ease-in-out infinite;
.skeleton {
// CSS

}
  )
    </div>
      ))}
        </div>
          <div className="skeleton-text short" />
          <div className="skeleton-text" />
          <div className="skeleton-image" />
        <div key={i} className="study-card skeleton">
      {[1, 2, 3, 4, 5, 6].map(i => (
    <div className="studies-grid">
  return (
function StudiesSkeleton() {
// src/components/studies/StudiesSkeleton.jsx
```javascript

### ✅ 스켈레톤 UI

## 로딩 상태

---

- [토스트 알림](#토스트-알림)
- [빈 상태](#빈-상태)
- [에러 상태](#에러-상태)
- [로딩 상태](#로딩-상태)

## 📋 목차

---

**우선순위**: 🟡 중간
**카테고리**: 스터디 관리  
**작성일**: 2025-11-29  


