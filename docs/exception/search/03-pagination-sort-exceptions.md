# 페이지네이션 및 정렬 예외 처리

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 페이지네이션, 정렬, 무한 스크롤  

---

## 📋 목차

1. [페이지네이션 예외](#1-페이지네이션-예외)
2. [정렬 기능 예외](#2-정렬-기능-예외)
3. [무한 스크롤](#3-무한-스크롤)
4. [하이브리드 방식](#4-하이브리드-방식)

---

## 1. 페이지네이션 예외

### 1.1 페이지 범위 검증

#### ❌ 문제 상황
```javascript
// 잘못된 페이지 번호
const invalidPages = [
  0,      // 페이지는 1부터 시작
  -1,     // 음수
  999999, // 총 페이지 수 초과
  'abc',  // 숫자가 아님
  null,
  undefined
]
```

#### ✅ 해결 방법
```javascript
// 페이지 번호 검증
function validatePageNumber(page, totalPages) {
  const parsed = parseInt(page)
  
  if (isNaN(parsed) || parsed < 1) {
    return 1 // 기본값
  }
  
  if (parsed > totalPages) {
    return totalPages || 1
  }
  
  return parsed
}

// 사용
const handlePageChange = (newPage) => {
  const validated = validatePageNumber(newPage, pagination.totalPages)
  setCurrentPage(validated)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

#### 🎯 URL에서 페이지 로드
```javascript
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const urlPage = params.get('page')
  
  if (urlPage) {
    const validated = validatePageNumber(urlPage, 1) // 초기 로드 시
    setCurrentPage(validated)
  }
}, [])

// 데이터 로드 후 재검증
useEffect(() => {
  if (pagination && currentPage > pagination.totalPages) {
    setCurrentPage(pagination.totalPages || 1)
  }
}, [pagination])
```

---

### 1.2 페이지 크기 (Limit) 변경

#### ✅ 동적 페이지 크기
```javascript
const [itemsPerPage, setItemsPerPage] = useState(10)

const pageSizeOptions = [10, 20, 50, 100]

const handlePageSizeChange = (newSize) => {
  setItemsPerPage(newSize)
  setCurrentPage(1) // 페이지 크기 변경 시 첫 페이지로
}

// UI
<select 
  value={itemsPerPage}
  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
>
  {pageSizeOptions.map(size => (
    <option key={size} value={size}>
      {size}개씩 보기
    </option>
  ))}
</select>
```

---

### 1.3 총 개수 불일치

#### ❌ 문제 상황
```javascript
// 실시간으로 스터디가 추가/삭제되는 경우
// 페이지 이동 중 총 개수가 변경될 수 있음

// 상황 1: 마지막 페이지에서 항목 삭제
// 10개씩, 총 25개 (3페이지) → 3페이지 보는 중
// → 1개 삭제되어 24개 (3페이지) → 여전히 3페이지 OK
// → 5개 삭제되어 20개 (2페이지) → 3페이지 존재하지 않음!

// 상황 2: 필터 변경으로 개수 급격히 감소
```

#### ✅ 해결 방법
```javascript
// API 응답 검증
const { data, isLoading, error } = useStudies(queryParams)

useEffect(() => {
  if (data?.pagination) {
    const { totalPages } = data.pagination
    
    // 현재 페이지가 총 페이지를 초과하면 조정
    if (currentPage > totalPages && totalPages > 0) {
      console.log('Current page exceeds total pages, redirecting...')
      setCurrentPage(totalPages)
    }
  }
}, [data, currentPage])

// 빈 페이지 감지 및 처리
useEffect(() => {
  const studies = data?.data || []
  const pagination = data?.pagination
  
  if (studies.length === 0 && pagination && currentPage > 1) {
    // 현재 페이지에 데이터가 없고, 첫 페이지가 아니면
    console.log('Empty page detected, going to previous page')
    setCurrentPage(prev => Math.max(1, prev - 1))
  }
}, [data])
```

---

### 1.4 페이지네이션 UI

#### ✅ 완전한 페이지네이션 컴포넌트
```javascript
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  
  // 표시할 페이지 범위 계산
  const getPageNumbers = () => {
    const delta = 2 // 현재 페이지 양옆에 보여줄 페이지 수
    const range = []
    const rangeWithDots = []
    
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }
    
    rangeWithDots.push(...range)
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }
    
    return rangeWithDots
  }
  
  const pages = getPageNumbers()
  
  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.paginationArrow}
      >
        ←
      </button>
      
      {pages.map((page, index) => (
        page === '...' ? (
          <span key={`dots-${index}`} className={styles.dots}>
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${styles.paginationButton} ${
              currentPage === page ? styles.active : ''
            }`}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.paginationArrow}
      >
        →
      </button>
    </div>
  )
}
```

---

## 2. 정렬 기능 예외

### 2.1 정렬 옵션

#### ✅ 구현
```javascript
const [sortBy, setSortBy] = useState('latest') // latest | popular | rating

const sortOptions = [
  { value: 'latest', label: '최신순', icon: '🆕' },
  { value: 'popular', label: '인기순', icon: '🔥' },
  { value: 'rating', label: '평점순', icon: '⭐' },
]

// API 파라미터
const queryParams = {
  page: currentPage,
  limit: itemsPerPage,
  sortBy: sortBy,
  // ...
}

const { data } = useStudies(queryParams)
```

#### 🎯 정렬 UI
```javascript
<div className={styles.sortOptions}>
  <label>정렬:</label>
  <select 
    value={sortBy}
    onChange={(e) => {
      setSortBy(e.target.value)
      setCurrentPage(1) // 정렬 변경 시 첫 페이지로
    }}
  >
    {sortOptions.map(option => (
      <option key={option.value} value={option.value}>
        {option.icon} {option.label}
      </option>
    ))}
  </select>
</div>
```

---

### 2.2 정렬 변경 시 처리

#### ✅ 정렬 변경 시 상태 초기화
```javascript
const handleSortChange = (newSort) => {
  setSortBy(newSort)
  setCurrentPage(1) // 첫 페이지로
  
  // 스크롤 상단으로
  window.scrollTo({ top: 0, behavior: 'smooth' })
  
  // React Query가 자동으로 refetch
}
```

---

### 2.3 API 정렬 구현

#### ✅ Prisma 정렬
```javascript
// src/app/api/studies/route.js
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'latest'
    
    // 정렬 조건
    let orderBy = {}
    
    switch (sortBy) {
      case 'popular':
        // 멤버 수 많은 순
        orderBy = { members: { _count: 'desc' } }
        break
        
      case 'rating':
        // 평점 높은 순
        orderBy = { rating: 'desc' }
        break
        
      case 'latest':
      default:
        // 최신순
        orderBy = { createdAt: 'desc' }
        break
    }
    
    const studies = await prisma.study.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      // ...
    })
    
    // ...
  } catch (error) {
    // ...
  }
}
```

---

## 3. 무한 스크롤

### 3.1 Intersection Observer

#### ✅ 무한 스크롤 구현
```javascript
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

function StudiesInfiniteScroll() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['studies-infinite', filters],
    queryFn: ({ pageParam = 1 }) => 
      api.get('/api/studies', { ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
  })
  
  // 하단 감지
  const { ref, inView } = useInView()
  
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage])
  
  // 모든 페이지의 데이터 합치기
  const allStudies = data?.pages.flatMap(page => page.data) || []
  
  return (
    <>
      <div className={styles.studiesGrid}>
        {allStudies.map(study => (
          <StudyCard key={study.id} {...study} />
        ))}
      </div>
      
      {/* 무한 스크롤 트리거 */}
      <div ref={ref} className={styles.scrollTrigger}>
        {isFetchingNextPage && <LoadingSpinner />}
        {!hasNextPage && <div>모든 스터디를 불러왔습니다</div>}
      </div>
    </>
  )
}
```

---

### 3.2 중복 데이터 방지

#### ✅ 고유 ID 확인
```javascript
// 중복 제거
const uniqueStudies = useMemo(() => {
  const seen = new Set()
  return allStudies.filter(study => {
    if (seen.has(study.id)) {
      console.warn('Duplicate study detected:', study.id)
      return false
    }
    seen.add(study.id)
    return true
  })
}, [allStudies])
```

---

## 4. 하이브리드 방식

### 4.1 페이지네이션 + 무한 스크롤 선택

#### 🎯 사용자 선택 옵션
```javascript
const [viewMode, setViewMode] = useState('pagination') // 'pagination' | 'infinite'

return (
  <>
    <div className={styles.viewModeToggle}>
      <button
        onClick={() => setViewMode('pagination')}
        className={viewMode === 'pagination' ? styles.active : ''}
      >
        📄 페이지 방식
      </button>
      <button
        onClick={() => setViewMode('infinite')}
        className={viewMode === 'infinite' ? styles.active : ''}
      >
        ∞ 무한 스크롤
      </button>
    </div>
    
    {viewMode === 'pagination' ? (
      <StudiesWithPagination />
    ) : (
      <StudiesInfiniteScroll />
    )}
  </>
)
```

---

## 📚 테스트 케이스

```javascript
describe('Pagination', () => {
  test('페이지 0은 1로 조정', () => {
    expect(validatePageNumber(0, 10)).toBe(1)
  })
  
  test('음수 페이지는 1로 조정', () => {
    expect(validatePageNumber(-5, 10)).toBe(1)
  })
  
  test('총 페이지 초과 시 마지막 페이지로', () => {
    expect(validatePageNumber(999, 10)).toBe(10)
  })
})

describe('Sorting', () => {
  test('잘못된 정렬 옵션은 latest로', () => {
    expect(validateSortOption('invalid')).toBe('latest')
  })
})
```

---

**문서 끝**

