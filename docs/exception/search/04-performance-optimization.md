# 성능 최적화 (Performance Optimization)

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 디바운싱, 캐싱, 쿼리 최적화, 메모리 관리  

---

## 📋 목차

1. [디바운싱 및 쓰로틀링](#1-디바운싱-및-쓰로틀링)
2. [React Query 캐싱](#2-react-query-캐싱)
3. [데이터베이스 최적화](#3-데이터베이스-최적화)
4. [번들 최적화](#4-번들-최적화)
5. [메모리 관리](#5-메모리-관리)

---

## 1. 디바운싱 및 쓰로틀링

### 1.1 검색 입력 디바운싱

#### ✅ 커스텀 디바운스 훅
```javascript
// src/hooks/useDebounce.js
import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// 사용
const [searchKeyword, setSearchKeyword] = useState('')
const debouncedSearch = useDebounce(searchKeyword, 300)

const { data } = useStudies({
  search: debouncedSearch.trim() || undefined,
  // ...
})

// 입력할 때마다 API 호출하지 않고, 300ms 대기 후 한 번만 호출
```

---

### 1.2 스크롤 이벤트 쓰로틀링

#### ✅ 쓰로틀링 구현
```javascript
import { useThrottle } from '@/hooks/useThrottle'

function InfiniteScroll() {
  const [scrollY, setScrollY] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    // 쓰로틀링: 100ms마다 한 번씩만 실행
    const throttled = throttle(handleScroll, 100)
    
    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [])
  
  // ...
}

// 유틸리티 함수
function throttle(func, delay) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, delay)
    }
  }
}
```

---

## 2. React Query 캐싱

### 2.1 캐시 전략

#### ✅ 최적 캐시 설정
```javascript
// src/lib/hooks/useApi.js
export function useStudies(params = {}) {
  return useQuery({
    queryKey: ['studies', params],
    queryFn: () => api.get('/api/studies', params),
    
    // 5분간 데이터를 fresh로 간주
    staleTime: 1000 * 60 * 5,
    
    // 30분간 캐시 유지
    gcTime: 1000 * 60 * 30,
    
    // 백그라운드에서 자동 refetch
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    
    // 실패 시 재시도
    retry: 2,
    retryDelay: 1000,
  })
}
```

---

### 2.2 캐시 무효화

#### ✅ 수동 캐시 무효화
```javascript
import { useQueryClient } from '@tanstack/react-query'

function StudyActions() {
  const queryClient = useQueryClient()
  
  const handleStudyCreated = () => {
    // 모든 스터디 쿼리 무효화
    queryClient.invalidateQueries({ queryKey: ['studies'] })
    
    // 특정 쿼리만 무효화
    queryClient.invalidateQueries({ 
      queryKey: ['studies', { category: '프로그래밍' }] 
    })
  }
  
  const handleStudyDeleted = (studyId) => {
    // 특정 스터디 쿼리 제거
    queryClient.removeQueries({ 
      queryKey: ['studies', studyId] 
    })
    
    // 목록 쿼리 무효화
    queryClient.invalidateQueries({ queryKey: ['studies'] })
  }
  
  // ...
}
```

---

### 2.3 Prefetching

#### 🎯 다음 페이지 미리 로드
```javascript
function StudiesList() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  
  const { data } = useStudies({ page: currentPage })
  
  useEffect(() => {
    // 다음 페이지 prefetch
    const nextPage = currentPage + 1
    const totalPages = data?.pagination?.totalPages
    
    if (nextPage <= totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['studies', { page: nextPage }],
        queryFn: () => api.get('/api/studies', { page: nextPage }),
      })
    }
  }, [currentPage, data, queryClient])
  
  // ...
}
```

---

## 3. 데이터베이스 최적화

### 3.1 인덱스 추가

#### ✅ Prisma 스키마 인덱스
```prisma
// prisma/schema.prisma
model Study {
  id          String   @id @default(cuid())
  name        String
  description String
  category    String
  isPublic    Boolean  @default(true)
  isRecruiting Boolean @default(true)
  rating      Float?
  createdAt   DateTime @default(now())
  
  // 인덱스 추가
  @@index([category])           // 카테고리 필터
  @@index([isPublic])           // 공개 여부
  @@index([isRecruiting])       // 모집 상태
  @@index([createdAt])          // 최신순 정렬
  @@index([rating])             // 평점순 정렬
  @@index([category, isRecruiting]) // 복합 인덱스
  
  // Full-text 검색 인덱스 (PostgreSQL)
  @@index([name(ops: raw("gin_trgm_ops"))], type: Gin)
}
```

#### 🎯 마이그레이션 실행
```bash
npx prisma migrate dev --name add_search_indexes
```

---

### 3.2 쿼리 최적화

#### ✅ Select 필드 제한
```javascript
// src/app/api/studies/route.js
const studies = await prisma.study.findMany({
  where: whereClause,
  select: {
    // 필요한 필드만 선택
    id: true,
    name: true,
    emoji: true,
    description: true,
    category: true,
    subCategory: true,
    tags: true,
    maxMembers: true,
    isRecruiting: true,
    rating: true,
    reviewCount: true,
    createdAt: true,
    
    owner: {
      select: {
        id: true,
        name: true,
        avatar: true,
      }
    },
    
    _count: {
      select: {
        members: {
          where: { status: 'ACTIVE' }
        }
      }
    }
  },
  skip,
  take: limit,
  orderBy,
})

// ❌ 나쁜 예: 모든 필드 가져오기
// const studies = await prisma.study.findMany({ ... })
```

---

### 3.3 카운트 최적화

#### ✅ 병렬 쿼리
```javascript
// 총 개수와 데이터를 병렬로 조회
const [total, studies] = await Promise.all([
  prisma.study.count({ where: whereClause }),
  prisma.study.findMany({
    where: whereClause,
    skip,
    take: limit,
    orderBy,
    // ...
  })
])

// ✅ 빠름: 두 쿼리가 동시에 실행
// ❌ 느림: await를 두 번 순차적으로 실행
```

---

## 4. 번들 최적화

### 4.1 코드 스플리팅

#### ✅ Dynamic Import
```javascript
// 무한 스크롤 컴포넌트를 lazy load
import dynamic from 'next/dynamic'

const InfiniteScrollStudies = dynamic(
  () => import('@/components/studies/InfiniteScrollStudies'),
  { 
    loading: () => <LoadingSkeleton />,
    ssr: false // 클라이언트 전용
  }
)

function StudiesPage() {
  const [viewMode, setViewMode] = useState('pagination')
  
  return (
    <>
      {viewMode === 'pagination' ? (
        <PaginationStudies />
      ) : (
        <InfiniteScrollStudies />
      )}
    </>
  )
}
```

---

### 4.2 이미지 최적화

#### ✅ Next.js Image 컴포넌트
```javascript
import Image from 'next/image'

function StudyCard({ study }) {
  return (
    <div className={styles.studyCard}>
      {study.thumbnail && (
        <Image
          src={study.thumbnail}
          alt={study.name}
          width={300}
          height={200}
          loading="lazy" // 지연 로딩
          placeholder="blur" // 블러 효과
          blurDataURL={study.thumbnailBlur}
        />
      )}
      {/* ... */}
    </div>
  )
}
```

---

## 5. 메모리 관리

### 5.1 메모이제이션

#### ✅ useMemo 활용
```javascript
function StudiesList({ studies, filters }) {
  // 무거운 계산은 메모이제이션
  const filteredStudies = useMemo(() => {
    return studies.filter(study => {
      // 복잡한 필터링 로직
      return (
        study.category === filters.category &&
        study.isRecruiting === filters.isRecruiting
      )
    }).sort((a, b) => {
      // 복잡한 정렬 로직
      return b.rating - a.rating
    })
  }, [studies, filters])
  
  // ...
}
```

#### ✅ useCallback 활용
```javascript
function SearchBar({ onSearch }) {
  const [keyword, setKeyword] = useState('')
  
  // 함수 메모이제이션
  const handleSearch = useCallback(() => {
    onSearch(keyword.trim())
  }, [keyword, onSearch])
  
  // ...
}
```

---

### 5.2 컴포넌트 언마운트 정리

#### ✅ Cleanup 함수
```javascript
function StudiesWithPolling() {
  useEffect(() => {
    // 폴링 시작
    const interval = setInterval(() => {
      refetch()
    }, 30000) // 30초마다
    
    // ✅ Cleanup: 언마운트 시 인터벌 제거
    return () => {
      clearInterval(interval)
    }
  }, [refetch])
  
  // ...
}
```

---

### 5.3 대량 데이터 가상화

#### 🎯 React Virtual 사용
```javascript
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualizedStudiesList({ studies }) {
  const parentRef = useRef(null)
  
  const virtualizer = useVirtualizer({
    count: studies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // 각 항목 높이
    overscan: 5, // 버퍼 항목 수
  })
  
  return (
    <div ref={parentRef} style={{ height: '800px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <StudyCard study={studies[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 📊 성능 측정

### 측정 도구
```javascript
// 검색 성능 측정
console.time('search-query')
const results = await searchStudies(keyword)
console.timeEnd('search-query')

// React DevTools Profiler
import { Profiler } from 'react'

function onRenderCallback(id, phase, actualDuration) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`)
}

<Profiler id="StudiesList" onRender={onRenderCallback}>
  <StudiesList />
</Profiler>
```

---

**문서 끝**

