# 관리자 공통 컴포넌트 상세 설계

> **작성일**: 2025-11-25  
> **언어**: JavaScript + JSDoc  
> **목적**: 재사용 가능한 관리자 컴포넌트 명세

---

## 📦 컴포넌트 목록

### 레이아웃 (4개)
1. AdminNav - 좌측 네비게이션
2. AdminHeader - 상단 헤더
3. AdminSidebar - 우측 위젯
4. AdminBreadcrumb - 경로 표시

### 데이터 표시 (5개)
5. DataTable - 데이터 테이블
6. StatCard - 통계 카드
7. Badge - 배지
8. ProgressBar - 프로그레스 바
9. EmptyState - 빈 상태

### 인터랙션 (5개)
10. Modal - 기본 모달
11. ConfirmDialog - 확인 다이얼로그
12. FilterBar - 필터 바
13. Pagination - 페이지네이션
14. Chart - 차트 래퍼

### 폼 (3개)
15. FormField - 폼 필드
16. Select - 선택 박스
17. SearchInput - 검색 입력

---

## 1️⃣ AdminNav (Server Component)

### 파일 경로
`components/admin/layout/AdminNav.js`

### 목적
좌측 고정 네비게이션 (12% 너비)

### 코드
```jsx
import Link from 'next/link'
import { HomeIcon, UsersIcon, BookOpenIcon, ExclamationTriangleIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

const navItems = [
  { icon: HomeIcon, label: '대시보드', href: '/admin', badge: null },
  { icon: UsersIcon, label: '사용자', href: '/admin/users', badge: null },
  { icon: BookOpenIcon, label: '스터디', href: '/admin/studies', badge: null },
  { icon: ExclamationTriangleIcon, label: '신고', href: '/admin/reports', badge: 12 },
  { icon: ChartBarIcon, label: '통계', href: '/admin/analytics', badge: null },
  { icon: Cog6ToothIcon, label: '설정', href: '/admin/settings', badge: null }
]

/**
 * 관리자 네비게이션 (Server Component)
 * @returns {JSX.Element}
 */
export default function AdminNav() {
  return (
    <nav className="w-[12%] min-w-[200px] max-w-[240px] bg-gray-900 text-white flex flex-col">
      {/* 로고 */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">CoUp Admin</h1>
      </div>
      
      {/* 메뉴 */}
      <div className="flex-1 py-6 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-colors relative"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className="absolute right-4 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
      
      {/* 하단 */}
      <div className="border-t border-gray-800 p-4">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <HomeIcon className="w-4 h-4" />
          메인으로
        </Link>
      </div>
    </nav>
  )
}
```

### Props
없음 (Server Component, 직접 데이터 페칭 가능)

### 스타일
- 너비: 12% (min: 200px, max: 240px)
- 배경: gray-900
- 높이: 100vh (고정)
- z-index: 10

---

## 2️⃣ AdminHeader (Client Component)

### 파일 경로
`components/admin/layout/AdminHeader.js`

### 목적
상단 헤더 (실시간 알림, 프로필)

### 코드
```jsx
'use client'

import { useState } from 'react'
import { BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAdminStore } from '@/lib/admin/store'
import { signOut } from 'next-auth/react'

/**
 * 관리자 헤더 (Client Component)
 * @param {Object} props
 * @param {Object} props.user - 사용자 정보
 * @param {string} props.user.name
 * @param {string} props.user.email
 * @param {string} [props.user.imageUrl]
 * @returns {JSX.Element}
 */
export default function AdminHeader({ user }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/sign-in' })
  }
  
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* 좌측 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">관리자 대시보드</h2>
      </div>
      
      {/* 우측 */}
      <div className="flex items-center gap-4">
        {/* 알림 */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <BellIcon className="w-6 h-6 text-gray-600" />
            {/* 배지 */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* 알림 드롭다운 */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold">알림</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {/* 알림 목록 */}
                <div className="p-4 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium">새 신고가 접수되었습니다</p>
                  <p className="text-xs text-gray-500 mt-1">5분 전</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 프로필 */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
          >
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.name} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                {user.name[0]}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
          </button>
          
          {/* 프로필 드롭다운 */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| user | Object | ✅ | 사용자 정보 |
| user.name | string | ✅ | 사용자 이름 |
| user.email | string | ✅ | 이메일 |
| user.imageUrl | string | ❌ | 프로필 이미지 URL |

---

## 5️⃣ DataTable (Client Component)

### 파일 경로
`components/admin/shared/DataTable.js`

### 목적
재사용 가능한 데이터 테이블

### 코드
```jsx
'use client'

import { useState } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'

/**
 * @typedef {Object} Column
 * @property {string} key - 데이터 키
 * @property {string} label - 컬럼 제목
 * @property {boolean} [sortable] - 정렬 가능 여부
 * @property {function(*): JSX.Element} [render] - 커스텀 렌더 함수
 * @property {string} [width] - 컬럼 너비
 */

/**
 * 데이터 테이블 (Client Component)
 * @param {Object} props
 * @param {Column[]} props.columns - 컬럼 정의
 * @param {Array} props.data - 데이터 배열
 * @param {function(*, number): void} [props.onRowClick] - 행 클릭 핸들러
 * @param {boolean} [props.selectable] - 체크박스 표시 여부
 * @param {string[]} [props.selectedIds] - 선택된 ID 배열
 * @param {function(string): void} [props.onSelect] - 선택 핸들러
 * @param {function(): void} [props.onSelectAll] - 전체 선택 핸들러
 * @param {boolean} [props.loading] - 로딩 상태
 * @returns {JSX.Element}
 */
export default function DataTable({
  columns,
  data,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelect,
  onSelectAll,
  loading = false
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }
  
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })
  
  const allSelected = selectedIds.length === data.length && data.length > 0
  
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {selectable && (
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                style={{ width: column.width }}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    {column.label}
                    <ChevronUpDownIcon className="w-4 h-4" />
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            // 로딩 스켈레톤
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {selectable && <td className="px-4 py-4"><div className="w-4 h-4 bg-gray-200 rounded animate-pulse" /></td>}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                데이터가 없습니다
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={row.id || index}
                onClick={() => onRowClick?.(row, index)}
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {selectable && (
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => onSelect?.(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm text-gray-900">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| columns | Column[] | ✅ | 컬럼 정의 배열 |
| data | Array | ✅ | 데이터 배열 |
| onRowClick | function | ❌ | 행 클릭 핸들러 |
| selectable | boolean | ❌ | 체크박스 표시 |
| selectedIds | string[] | ❌ | 선택된 ID 배열 |
| onSelect | function | ❌ | 체크박스 선택 핸들러 |
| onSelectAll | function | ❌ | 전체 선택 핸들러 |
| loading | boolean | ❌ | 로딩 상태 |

### 사용 예시
```jsx
const columns = [
  { key: 'name', label: '이름', sortable: true },
  { key: 'email', label: '이메일', sortable: true },
  { 
    key: 'status', 
    label: '상태',
    render: (row) => <Badge color={row.status === 'ACTIVE' ? 'green' : 'red'}>{row.status}</Badge>
  },
  { key: 'createdAt', label: '가입일', sortable: true }
]

<DataTable
  columns={columns}
  data={users}
  onRowClick={(user) => console.log(user)}
  selectable
  selectedIds={selectedUserIds}
  onSelect={toggleUser}
  onSelectAll={selectAllUsers}
/>
```

---

## 6️⃣ StatCard (Server Component)

### 파일 경로
`components/admin/shared/StatCard.js`

### 목적
통계 카드 표시

### 코드
```jsx
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid'

/**
 * 통계 카드 (Server Component)
 * @param {Object} props
 * @param {JSX.Element} props.icon - 아이콘
 * @param {string} props.label - 라벨
 * @param {number} props.value - 값
 * @param {number} [props.change] - 변화량
 * @param {string} [props.changeLabel] - 변화 라벨 (기본: "이번 주")
 * @param {string} [props.color] - 색상 (blue, green, purple, orange, red)
 * @param {function} [props.onClick] - 클릭 핸들러
 * @returns {JSX.Element}
 */
export default function StatCard({
  icon,
  label,
  value,
  change,
  changeLabel = '이번 주',
  color = 'blue',
  onClick
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  }
  
  const getTrendIcon = () => {
    if (!change) return null
    if (change > 0) return <ArrowUpIcon className="w-3 h-3 text-green-600" />
    if (change < 0) return <ArrowDownIcon className="w-3 h-3 text-red-600" />
    return <MinusIcon className="w-3 h-3 text-gray-400" />
  }
  
  const getTrendColor = () => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-400'
  }
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300 transition-all' : ''}`}
    >
      {/* 아이콘 */}
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      
      {/* 라벨 */}
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      
      {/* 값 */}
      <p className="text-3xl font-bold text-gray-900 mb-2">
        {value.toLocaleString()}
      </p>
      
      {/* 변화량 */}
      {change !== undefined && (
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={`text-xs font-medium ${getTrendColor()}`}>
            {change > 0 ? '+' : ''}{change}
          </span>
          <span className="text-xs text-gray-500">({changeLabel})</span>
        </div>
      )}
    </div>
  )
}
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| icon | JSX.Element | ✅ | 아이콘 컴포넌트 |
| label | string | ✅ | 라벨 텍스트 |
| value | number | ✅ | 표시할 값 |
| change | number | ❌ | 변화량 |
| changeLabel | string | ❌ | 변화 라벨 (기본: "이번 주") |
| color | string | ❌ | 색상 (blue, green, purple, orange, red) |
| onClick | function | ❌ | 클릭 핸들러 |

---

## 10️⃣ Modal (Client Component)

### 파일 경로
`components/admin/shared/Modal.js`

### 목적
기본 모달 컴포넌트

### 코드
```jsx
'use client'

import { useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

/**
 * 기본 모달 (Client Component)
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 열림 상태
 * @param {function(): void} props.onClose - 닫기 핸들러
 * @param {string} props.title - 모달 제목
 * @param {React.ReactNode} props.children - 모달 본문
 * @param {React.ReactNode} [props.footer] - 모달 하단 (버튼 등)
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [props.size] - 모달 크기
 * @param {boolean} [props.closeOnOverlay] - 오버레이 클릭 시 닫기 (기본: true)
 * @returns {JSX.Element|null}
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
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
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

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | ✅ | 모달 열림 상태 |
| onClose | function | ✅ | 닫기 핸들러 |
| title | string | ✅ | 모달 제목 |
| children | ReactNode | ✅ | 모달 본문 |
| footer | ReactNode | ❌ | 모달 하단 |
| size | string | ❌ | 크기 (sm, md, lg, xl, full) |
| closeOnOverlay | boolean | ❌ | 오버레이 클릭 시 닫기 |

### 사용 예시
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

---

## 11️⃣ ConfirmDialog (Client Component)

### 파일 경로
`components/admin/shared/ConfirmDialog.js`

### 목적
확인 다이얼로그 (위험한 액션)

### 코드
```jsx
'use client'

import { useState } from 'react'
import Modal from './Modal'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

/**
 * 확인 다이얼로그 (Client Component)
 * @param {Object} props
 * @param {boolean} props.isOpen - 다이얼로그 열림 상태
 * @param {function(): void} props.onClose - 닫기 핸들러
 * @param {function(): void} props.onConfirm - 확인 핸들러
 * @param {string} props.title - 제목
 * @param {React.ReactNode} props.message - 메시지
 * @param {string} [props.confirmText] - 확인 버튼 텍스트 (기본: "확인")
 * @param {string} [props.cancelText] - 취소 버튼 텍스트 (기본: "취소")
 * @param {'danger'|'warning'|'info'} [props.type] - 타입 (기본: "warning")
 * @param {boolean} [props.requireInput] - 입력 확인 필요 여부
 * @param {string} [props.requireInputText] - 입력해야 할 텍스트 (기본: "삭제")
 * @returns {JSX.Element}
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  type = 'warning',
  requireInput = false,
  requireInputText = '삭제'
}) {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleConfirm = async () => {
    if (requireInput && inputValue !== requireInputText) {
      return
    }
    
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
      setInputValue('')
    }
  }
  
  const handleClose = () => {
    setInputValue('')
    onClose()
  }
  
  const iconClasses = {
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600'
  }
  
  const buttonClasses = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  }
  
  const canConfirm = !requireInput || inputValue === requireInputText
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[type]}`}
          >
            {isLoading ? '처리 중...' : confirmText}
          </button>
        </>
      }
    >
      <div className="text-center">
        {/* 아이콘 */}
        <div className={`mx-auto w-12 h-12 rounded-full ${iconClasses[type]} flex items-center justify-center mb-4`}>
          <ExclamationTriangleIcon className="w-6 h-6" />
        </div>
        
        {/* 메시지 */}
        <div className="text-sm text-gray-600 mb-6">
          {message}
        </div>
        
        {/* 입력 확인 */}
        {requireInput && (
          <div className="text-left">
            <p className="text-sm text-gray-700 mb-2">
              계속하려면 <span className="font-semibold text-red-600">"{requireInputText}"</span>를 입력하세요:
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder={requireInputText}
              autoFocus
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | ✅ | 열림 상태 |
| onClose | function | ✅ | 닫기 핸들러 |
| onConfirm | function | ✅ | 확인 핸들러 (async 가능) |
| title | string | ✅ | 제목 |
| message | ReactNode | ✅ | 메시지 |
| confirmText | string | ❌ | 확인 버튼 텍스트 |
| cancelText | string | ❌ | 취소 버튼 텍스트 |
| type | string | ❌ | 타입 (danger, warning, info) |
| requireInput | boolean | ❌ | 입력 확인 필요 |
| requireInputText | string | ❌ | 입력할 텍스트 (기본: "삭제") |

### 사용 예시
```jsx
<ConfirmDialog
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={async () => {
    await deleteUser(userId)
  }}
  title="계정 삭제"
  message="정말로 이 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
  confirmText="삭제"
  type="danger"
  requireInput
  requireInputText="삭제"
/>
```

---

**다음 문서**: 
- `02-users.md` - 사용자 관리 화면 상세 설계
- `08-modals.md` - 모달 컴포넌트 상세 설계

