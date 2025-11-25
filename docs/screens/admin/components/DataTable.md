# DataTable 컴포넌트

> **타입**: 🔵 Client Component  
> **파일**: `components/admin/shared/DataTable.js`  
> **분량**: 약 250줄

---

## 📋 설명

재사용 가능한 데이터 테이블 (정렬, 체크박스, 페이징)

---

## 💻 전체 코드

```jsx
'use client'

import { useState } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'

/**
 * @typedef {Object} Column
 * @property {string} key
 * @property {string} label
 * @property {boolean} [sortable]
 * @property {function(*): JSX.Element} [render]
 * @property {string} [width]
 */

/**
 * 데이터 테이블
 * @param {Object} props
 * @param {Column[]} props.columns
 * @param {Array} props.data
 * @param {function(*, number): void} [props.onRowClick]
 * @param {boolean} [props.selectable]
 * @param {string[]} [props.selectedIds]
 * @param {function(string): void} [props.onSelect]
 * @param {function(): void} [props.onSelectAll]
 * @param {boolean} [props.loading]
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
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {selectable && <th className="w-12 px-4 py-3" />}
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {selectable && <td className="px-4 py-4"><div className="w-4 h-4 bg-gray-200 rounded animate-pulse" /></td>}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
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
          {sortedData.length === 0 ? (
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

---

## 📝 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| columns | Column[] | ✅ | 컬럼 정의 |
| data | Array | ✅ | 데이터 배열 |
| onRowClick | function | ❌ | 행 클릭 핸들러 |
| selectable | boolean | ❌ | 체크박스 표시 |
| selectedIds | string[] | ❌ | 선택된 ID 배열 |
| onSelect | function | ❌ | 선택 핸들러 |
| onSelectAll | function | ❌ | 전체 선택 |
| loading | boolean | ❌ | 로딩 상태 |

---

## 🎯 사용 예시

```jsx
const columns = [
  { key: 'name', label: '이름', sortable: true },
  { key: 'email', label: '이메일', sortable: true },
  { 
    key: 'status', 
    label: '상태',
    render: (row) => <Badge color={row.status === 'ACTIVE' ? 'green' : 'red'}>{row.status}</Badge>
  }
]

<DataTable
  columns={columns}
  data={users}
  onRowClick={(user) => openModal(user)}
  selectable
  selectedIds={selectedUserIds}
  onSelect={toggleUser}
  onSelectAll={selectAll}
/>
```

