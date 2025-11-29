# 검색/필터 예외 처리

**작성일**: 2025-11-29  
**카테고리**: 스터디 관리  
**우선순위**: 🟡 중간

---

## 📋 목차

- [개요](#개요)
- [검색 실패](#검색-실패)
- [필터링 오류](#필터링-오류)
- [정렬 문제](#정렬-문제)
- [페이지네이션 오류](#페이지네이션-오류)
- [쿼리 파라미터 검증](#쿼리-파라미터-검증)

---

## 개요

스터디 검색 및 필터링 시 발생하는 예외를 다룹니다.

---

## 검색 실패

### ✅ 검색 API

```javascript
// src/app/api/studies/route.js
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 페이지네이션
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const skip = (page - 1) * limit

    // 검색어
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const isRecruiting = searchParams.get('isRecruiting')
    const sortBy = searchParams.get('sortBy') || 'latest'

    // where 조건
    const where = {
      isPublic: true
    }

    // 카테고리 필터
    if (category && category !== 'all' && category !== '전체') {
      where.category = category
    }

    // 검색어 (OR 조건)
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { tags: { has: search.trim() } }
      ]
    }

    // 모집 중
    if (isRecruiting === 'true') {
      where.isRecruiting = true
    }

    // 정렬
    let orderBy = {}
    switch (sortBy) {
      case 'popular':
        orderBy = { members: { _count: 'desc' } }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // 조회
    const [studies, total] = await Promise.all([
      prisma.study.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: {
              members: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        }
      }),
      prisma.study.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: studies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get studies error:', error)
    return NextResponse.json(
      { error: "스터디 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

## 필터링 오류

### 클라이언트 필터

```javascript
// src/app/studies/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useStudies } from '@/lib/hooks/useApi'

function StudiesExplorePage() {
  const [filters, setFilters] = useState({
    search: '',
    category: '전체',
    isRecruiting: false,
    sortBy: 'latest',
    page: 1
  })

  // 쿼리 파라미터 생성
  const queryParams = {
    page: filters.page,
    limit: 12
  }

  if (filters.category && filters.category !== '전체') {
    queryParams.category = filters.category
  }

  if (filters.search.trim()) {
    queryParams.search = filters.search.trim()
  }

  if (filters.isRecruiting) {
    queryParams.isRecruiting = 'true'
  }

  if (filters.sortBy) {
    queryParams.sortBy = filters.sortBy
  }

  const { data, isLoading, error } = useStudies(queryParams)

  // 필터 변경 시 1페이지로
  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 1 }))
  }, [filters.search, filters.category, filters.isRecruiting, filters.sortBy])

  return (
    <div>
      {/* 검색 */}
      <input
        type="text"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder="스터디 검색..."
      />

      {/* 카테고리 */}
      <select
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="전체">전체</option>
        <option value="프로그래밍">💻 프로그래밍</option>
        <option value="어학">🌍 어학</option>
        <option value="자격증">📝 자격증</option>
        <option value="취미">🎸 취미</option>
        <option value="독서">📖 독서</option>
        <option value="재테크">💰 재테크</option>
      </select>

      {/* 모집 중만 */}
      <label>
        <input
          type="checkbox"
          checked={filters.isRecruiting}
          onChange={(e) => setFilters({ ...filters, isRecruiting: e.target.checked })}
        />
        모집 중만 보기
      </label>

      {/* 정렬 */}
      <select
        value={filters.sortBy}
        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
      >
        <option value="latest">최신순</option>
        <option value="popular">인기순</option>
        <option value="rating">평점순</option>
      </select>

      {/* 결과 */}
      {isLoading && <p>로딩 중...</p>}
      {error && <p>오류 발생</p>}
      {data && (
        <>
          <p>총 {data.pagination.total}개</p>
          <StudyList studies={data.data} />
          <Pagination 
            current={filters.page}
            total={data.pagination.totalPages}
            onChange={(page) => setFilters({ ...filters, page })}
          />
        </>
      )}
    </div>
  )
}
```

---

## 정렬 문제

### 정렬 옵션

```javascript
// 정렬 조건 매핑
function getOrderBy(sortBy) {
  switch (sortBy) {
    case 'latest':
      return { createdAt: 'desc' }
    
    case 'oldest':
      return { createdAt: 'asc' }
    
    case 'popular':
      return { members: { _count: 'desc' } }
    
    case 'rating':
      return [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ]
    
    case 'name':
      return { name: 'asc' }
    
    default:
      return { createdAt: 'desc' }
  }
}
```

---

## 페이지네이션 오류

### ✅ 페이지네이션 컴포넌트

```javascript
// src/components/common/Pagination.jsx
function Pagination({ current, total, onChange }) {
  const maxPages = 5
  
  const getPages = () => {
    const pages = []
    let start = Math.max(1, current - Math.floor(maxPages / 2))
    let end = Math.min(total, start + maxPages - 1)
    
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  return (
    <div className="pagination">
      <button
        onClick={() => onChange(1)}
        disabled={current === 1}
      >
        처음
      </button>

      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
      >
        이전
      </button>

      {getPages().map(page => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={page === current ? 'active' : ''}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
      >
        다음
      </button>

      <button
        onClick={() => onChange(total)}
        disabled={current === total}
      >
        마지막
      </button>
    </div>
  )
}

export default Pagination
```

---

## 쿼리 파라미터 검증

### 검증 함수

```javascript
// src/lib/validators/query.js

export function validatePaginationParams(params) {
  const page = parseInt(params.page) || 1
  const limit = parseInt(params.limit) || 12

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit))
  }
}

export function validateSortParam(sortBy) {
  const validSorts = ['latest', 'oldest', 'popular', 'rating', 'name']
  return validSorts.includes(sortBy) ? sortBy : 'latest'
}

export function validateCategoryParam(category) {
  const validCategories = [
    '전체', 'all', '프로그래밍', '어학', '자격증', '취미', '독서', '재테크'
  ]
  return validCategories.includes(category) ? category : '전체'
}

// 사용 예
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  
  const { page, limit } = validatePaginationParams({
    page: searchParams.get('page'),
    limit: searchParams.get('limit')
  })
  
  const sortBy = validateSortParam(searchParams.get('sortBy'))
  const category = validateCategoryParam(searchParams.get('category'))
  
  // ...
}
```

---

## 관련 문서

- [INDEX](./INDEX.md)
- [01-study-crud-exceptions.md](./01-study-crud-exceptions.md)

---

**다음 문서**: [실시간 동기화 예외 처리](./07-real-time-sync-exceptions.md)

