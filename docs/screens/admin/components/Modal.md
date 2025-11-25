# Modal 컴포넌트

> **타입**: 🔵 Client Component  
> **파일**: `components/admin/shared/Modal.js`  
> **분량**: 약 150줄

---

## 📋 설명

기본 모달 컴포넌트 (5가지 크기, ESC 닫기, 오버레이)

---

## 💻 전체 코드

```jsx
'use client'

import { useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

/**
 * 기본 모달
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {function(): void} props.onClose
 * @param {string} props.title
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.footer]
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [props.size]
 * @param {boolean} [props.closeOnOverlay]
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true
}) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])
  
  // body 스크롤 방지
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
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl'
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      
      {/* 모달 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          
          {/* 본문 */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
          
          {/* 하단 */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 📝 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | ✅ | 열림 상태 |
| onClose | function | ✅ | 닫기 핸들러 |
| title | string | ✅ | 제목 |
| children | ReactNode | ✅ | 본문 |
| footer | ReactNode | ❌ | 하단 버튼 |
| size | string | ❌ | 크기 (sm~full) |
| closeOnOverlay | boolean | ❌ | 오버레이 클릭 닫기 |

---

## 🎯 사용 예시

```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="사용자 상세"
  size="lg"
  footer={
    <>
      <button onClick={() => setIsOpen(false)}>취소</button>
      <button onClick={handleSave}>저장</button>
    </>
  }
>
  <div>모달 본문</div>
</Modal>
```

