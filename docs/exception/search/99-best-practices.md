# 모범 사례 및 권장사항 (Best Practices)

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 검색/필터 시스템 설계 및 구현 권장사항  

---

## 📋 목차

1. [검색 UX 패턴](#1-검색-ux-패턴)
2. [필터 UI 디자인](#2-필터-ui-디자인)
3. [성능 최적화 전략](#3-성능-최적화-전략)
4. [보안 및 검증](#4-보안-및-검증)
5. [테스트 전략](#5-테스트-전략)
6. [모니터링 및 분석](#6-모니터링-및-분석)

---

## 1. 검색 UX 패턴

### 1.1 즉시 검색 vs 명시적 검색

#### ✅ 하이브리드 접근
```javascript
function SearchBar() {
  const [keyword, setKeyword] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // 즉시 검색 (타이핑 중 - 자동완성용)
  const debouncedKeyword = useDebounce(keyword, 300)
  const { data: suggestions } = useSuggestions(debouncedKeyword)
  
  // 명시적 검색 (Enter 또는 버튼 클릭)
  const handleExplicitSearch = () => {
    if (keyword.trim()) {
      onSearch(keyword.trim())
      saveSearchHistory(keyword)
      setShowSuggestions(false)
    }
  }
  
  return (
    <div className={styles.searchBar}>
      <input
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value)
          setShowSuggestions(true)
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleExplicitSearch()
        }}
        placeholder="검색..."
      />
      
      <button onClick={handleExplicitSearch}>
        🔍 검색
      </button>
      
      {/* 자동완성 드롭다운 */}
      {showSuggestions && suggestions?.length > 0 && (
        <SuggestionDropdown 
          suggestions={suggestions}
          onSelect={(item) => {
            setKeyword(item)
            handleExplicitSearch()
          }}
        />
      )}
    </div>
  )
}
```

---

### 1.2 검색 결과 프리뷰

#### 🎯 호버 시 미리보기
```javascript
function StudyCard({ study }) {
  const [showPreview, setShowPreview] = useState(false)
  
  return (
    <div 
      className={styles.studyCard}
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      {/* 기본 카드 내용 */}
      <h3>{study.name}</h3>
      <p>{study.description}</p>
      
      {/* 호버 시 상세 정보 */}
      {showPreview && (
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <img src={study.owner.avatar} alt="" />
            <span>{study.owner.name}</span>
          </div>
          
          <div className={styles.previewStats}>
            <div>📅 {formatDate(study.createdAt)}</div>
            <div>👥 {study.currentMembers}명 참여 중</div>
            <div>⭐ {study.rating} ({study.reviewCount}개 리뷰)</div>
          </div>
          
          <div className={styles.previewTags}>
            {study.tags?.map(tag => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
          
          <Link 
            href={`/studies/${study.id}`}
            className={styles.previewButton}
          >
            자세히 보기 →
          </Link>
        </div>
      )}
    </div>
  )
}
```

---

### 1.3 검색 결과 개수 표시

#### ✅ 명확한 피드백
```javascript
function SearchResults({ keyword, studies, pagination }) {
  return (
    <div className={styles.results}>
      <div className={styles.resultHeader}>
        {keyword ? (
          <h2>
            "<strong>{keyword}</strong>" 검색 결과 
            <span className={styles.count}>
              ({pagination.total.toLocaleString()}개)
            </span>
          </h2>
        ) : (
          <h2>
            전체 스터디 
            <span className={styles.count}>
              ({pagination.total.toLocaleString()}개)
            </span>
          </h2>
        )}
        
        <div className={styles.resultMeta}>
          {pagination.page}페이지 / 총 {pagination.totalPages}페이지
        </div>
      </div>
      
      {studies.map(study => (
        <StudyCard key={study.id} study={study} />
      ))}
    </div>
  )
}
```

---

## 2. 필터 UI 디자인

### 2.1 필터 상태 시각화

#### ✅ 활성 필터 뱃지
```javascript
function ActiveFilters({ filters, onRemove, onReset }) {
  const activeFilters = []
  
  if (filters.search) {
    activeFilters.push({ 
      type: 'search', 
      label: `검색: ${filters.search}`,
      value: filters.search 
    })
  }
  
  if (filters.category && filters.category !== '전체') {
    activeFilters.push({ 
      type: 'category', 
      label: filters.category,
      value: filters.category 
    })
  }
  
  if (filters.isRecruiting) {
    activeFilters.push({ 
      type: 'recruiting', 
      label: '모집중',
      value: true 
    })
  }
  
  if (activeFilters.length === 0) return null
  
  return (
    <div className={styles.activeFilters}>
      <span className={styles.label}>활성 필터:</span>
      
      {activeFilters.map((filter, i) => (
        <button
          key={i}
          className={styles.filterBadge}
          onClick={() => onRemove(filter.type)}
        >
          {filter.label}
          <span className={styles.remove}>✕</span>
        </button>
      ))}
      
      <button 
        className={styles.resetAll}
        onClick={onReset}
      >
        🔄 전체 초기화
      </button>
    </div>
  )
}
```

---

### 2.2 필터 그룹화

#### ✅ 논리적 그룹핑
```javascript
function FilterPanel() {
  return (
    <aside className={styles.filterPanel}>
      {/* 그룹 1: 카테고리 */}
      <div className={styles.filterGroup}>
        <h3 className={styles.groupTitle}>
          📚 카테고리
        </h3>
        <CategoryFilter />
      </div>
      
      {/* 그룹 2: 모집 상태 */}
      <div className={styles.filterGroup}>
        <h3 className={styles.groupTitle}>
          📝 모집 상태
        </h3>
        <RecruitingFilter />
      </div>
      
      {/* 그룹 3: 멤버 수 */}
      <div className={styles.filterGroup}>
        <h3 className={styles.groupTitle}>
          👥 참여 인원
        </h3>
        <MemberCountFilter />
      </div>
      
      {/* 그룹 4: 평점 */}
      <div className={styles.filterGroup}>
        <h3 className={styles.groupTitle}>
          ⭐ 평점
        </h3>
        <RatingFilter />
      </div>
    </aside>
  )
}
```

---

### 2.3 필터 개수 표시

#### ✅ 각 옵션별 개수
```javascript
function CategoryFilter({ onSelect, counts }) {
  const categories = [
    { id: 'all', label: '전체', icon: '📚' },
    { id: 'programming', label: '프로그래밍', icon: '💻' },
    { id: 'language', label: '어학', icon: '🌍' },
    // ...
  ]
  
  return (
    <div className={styles.categoryFilter}>
      {categories.map(category => (
        <button
          key={category.id}
          className={styles.categoryOption}
          onClick={() => onSelect(category.label)}
        >
          <span className={styles.icon}>{category.icon}</span>
          <span className={styles.label}>{category.label}</span>
          <span className={styles.count}>
            ({counts[category.label] || 0})
          </span>
        </button>
      ))}
    </div>
  )
}
```

---

## 3. 성능 최적화 전략

### 3.1 검색 쿼리 최적화 체크리스트

```javascript
// ✅ DO: 필요한 필드만 select
const studies = await prisma.study.findMany({
  select: {
    id: true,
    name: true,
    description: true,
    // 필요한 필드만...
  }
})

// ❌ DON'T: 모든 필드 가져오기
const studies = await prisma.study.findMany()

// ✅ DO: 인덱스 활용
@@index([category])
@@index([isRecruiting])
@@index([category, isRecruiting]) // 복합 인덱스

// ✅ DO: 페이지네이션 필수
const studies = await prisma.study.findMany({
  skip: (page - 1) * limit,
  take: limit,
})

// ❌ DON'T: 무제한 조회
const studies = await prisma.study.findMany()

// ✅ DO: 카운트와 데이터를 병렬로
const [total, studies] = await Promise.all([
  prisma.study.count({ where }),
  prisma.study.findMany({ where, skip, take })
])

// ❌ DON'T: 순차 조회
const total = await prisma.study.count({ where })
const studies = await prisma.study.findMany({ where, skip, take })
```

---

### 3.2 프론트엔드 최적화 체크리스트

```javascript
// ✅ DO: 디바운싱
const debouncedSearch = useDebounce(keyword, 300)

// ❌ DON'T: 즉시 API 호출
onChange={(e) => fetchResults(e.target.value)}

// ✅ DO: 메모이제이션
const filtered = useMemo(() => 
  studies.filter(/* ... */),
  [studies, filters]
)

// ❌ DON'T: 매 렌더마다 계산
const filtered = studies.filter(/* ... */)

// ✅ DO: React Query 캐싱
const { data } = useQuery({
  queryKey: ['studies', params],
  staleTime: 5 * 60 * 1000,
})

// ❌ DON'T: 매번 새로 fetch
useEffect(() => {
  fetchStudies()
}, [])

// ✅ DO: 가상화 (대량 데이터)
<VirtualList items={studies} height={600} itemHeight={100} />

// ❌ DON'T: 모든 항목 렌더링
{studies.map(study => <StudyCard />)}
```

---

## 4. 보안 및 검증

### 4.1 입력 검증 체크리스트

```javascript
// ✅ 클라이언트 검증
function validateSearchInput(input) {
  // 1. 타입 검증
  if (typeof input !== 'string') return false
  
  // 2. 길이 제한
  if (input.length > 100) return false
  
  // 3. 유효한 문자
  const validPattern = /^[가-힣a-zA-Z0-9\s\-_]+$/
  if (!validPattern.test(input)) return false
  
  return true
}

// ✅ 서버 검증
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  
  // 검증
  if (search) {
    if (search.length > 100) {
      return NextResponse.json(
        { error: '검색어가 너무 깁니다' },
        { status: 400 }
      )
    }
  }
  
  // Prisma는 자동으로 SQL Injection 방어
  const studies = await prisma.study.findMany({
    where: {
      name: { contains: search, mode: 'insensitive' }
    }
  })
  
  return NextResponse.json({ data: studies })
}
```

---

### 4.2 Rate Limiting

#### ✅ 검색 요청 제한
```javascript
// src/middleware.js
import { RateLimiter } from '@/lib/rate-limiter'

const searchLimiter = new RateLimiter({
  interval: 60 * 1000, // 1분
  maxRequests: 30, // 최대 30회
})

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/api/studies')) {
    const ip = request.ip || 'unknown'
    
    if (!searchLimiter.check(ip)) {
      return new Response('Too many requests', { status: 429 })
    }
  }
  
  return NextResponse.next()
}
```

---

## 5. 테스트 전략

### 5.1 단위 테스트

```javascript
// tests/search.test.js
describe('Search functionality', () => {
  test('검색어 검증', () => {
    expect(validateSearchInput('React')).toBe(true)
    expect(validateSearchInput('')).toBe(false)
    expect(validateSearchInput('a'.repeat(101))).toBe(false)
  })
  
  test('필터 조합', () => {
    const params = buildQueryParams({
      search: 'React',
      category: '프로그래밍',
      isRecruiting: true
    })
    
    expect(params).toHaveProperty('search', 'React')
    expect(params).toHaveProperty('category', '프로그래밍')
  })
  
  test('페이지 검증', () => {
    expect(validatePageNumber(0, 10)).toBe(1)
    expect(validatePageNumber(999, 10)).toBe(10)
  })
})
```

---

### 5.2 통합 테스트

```javascript
// tests/integration/search-api.test.js
describe('Search API', () => {
  test('GET /api/studies - 기본 검색', async () => {
    const response = await fetch('/api/studies?search=React')
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('pagination')
  })
  
  test('GET /api/studies - 복합 필터', async () => {
    const response = await fetch(
      '/api/studies?search=React&category=프로그래밍&isRecruiting=true'
    )
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.data).toBeInstanceOf(Array)
  })
  
  test('GET /api/studies - 잘못된 페이지', async () => {
    const response = await fetch('/api/studies?page=-1')
    // 서버가 적절히 처리하는지 확인
    expect(response.status).toBe(200)
  })
})
```

---

### 5.3 E2E 테스트

```javascript
// tests/e2e/search.spec.js
import { test, expect } from '@playwright/test'

test('검색 플로우', async ({ page }) => {
  await page.goto('/studies')
  
  // 검색어 입력
  await page.fill('[placeholder*="검색"]', 'React')
  await page.click('button:has-text("검색")')
  
  // 결과 확인
  await expect(page.locator('.studyCard')).toHaveCount(10)
  
  // 필터 적용
  await page.click('button:has-text("프로그래밍")')
  
  // 필터된 결과 확인
  await expect(page.locator('.category')).toContainText('프로그래밍')
  
  // 페이지 이동
  await page.click('button:has-text("2")')
  
  // URL 확인
  expect(page.url()).toContain('page=2')
})
```

---

## 6. 모니터링 및 분석

### 6.1 검색 로깅

```javascript
// 검색 로그 저장
async function logSearch(searchData) {
  try {
    await prisma.searchLog.create({
      data: {
        keyword: searchData.keyword,
        category: searchData.category,
        filters: searchData.filters,
        resultCount: searchData.resultCount,
        userId: searchData.userId,
        timestamp: new Date(),
      }
    })
  } catch (error) {
    console.error('Failed to log search:', error)
  }
}

// 사용
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  
  const studies = await prisma.study.findMany({ /* ... */ })
  
  // 검색 로그
  await logSearch({
    keyword: search,
    category: category,
    resultCount: studies.length,
    userId: session?.user?.id,
  })
  
  return NextResponse.json({ data: studies })
}
```

---

### 6.2 성능 메트릭

```javascript
// 검색 성능 추적
function trackSearchPerformance(metrics) {
  // 분석 서비스로 전송
  if (window.gtag) {
    window.gtag('event', 'search_performance', {
      search_duration: metrics.duration,
      result_count: metrics.resultCount,
      has_filters: metrics.hasFilters,
    })
  }
}

// 사용
const startTime = performance.now()
const { data } = await searchStudies(params)
const endTime = performance.now()

trackSearchPerformance({
  duration: endTime - startTime,
  resultCount: data.length,
  hasFilters: Object.keys(params).length > 0,
})
```

---

### 6.3 에러 추적

```javascript
// 에러 로깅 서비스
function logError(error, context) {
  // Sentry, LogRocket 등
  console.error('Search error:', {
    message: error.message,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString(),
  })
}

// 사용
try {
  const results = await searchStudies(keyword)
} catch (error) {
  logError(error, {
    action: 'search',
    keyword: keyword,
    filters: filters,
  })
  
  showToast('검색 중 오류가 발생했습니다', 'error')
}
```

---

## 📚 체크리스트

### 기능 완성도
- [ ] 키워드 검색
- [ ] 카테고리 필터
- [ ] 복합 필터 조합
- [ ] 정렬 기능
- [ ] 페이지네이션
- [ ] 빈 상태 처리
- [ ] 오류 처리
- [ ] 로딩 상태

### 성능
- [ ] 디바운싱 적용
- [ ] React Query 캐싱
- [ ] DB 인덱스 생성
- [ ] 쿼리 최적화
- [ ] 번들 크기 최적화

### UX
- [ ] 검색 결과 개수 표시
- [ ] 활성 필터 표시
- [ ] 필터 초기화 기능
- [ ] 반응형 디자인
- [ ] 키보드 네비게이션

### 보안
- [ ] 입력 검증
- [ ] SQL Injection 방어
- [ ] XSS 방어
- [ ] Rate Limiting

### 테스트
- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] E2E 테스트

---

**문서 끝** - 검색/필터 시스템의 완벽한 구현을 위한 모범 사례

