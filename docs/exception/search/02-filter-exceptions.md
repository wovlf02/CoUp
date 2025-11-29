# 필터 예외 처리 (Filter Exceptions)

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 카테고리 필터, 상태 필터, 복합 필터, URL 동기화  
**관련 파일**:
- `src/app/studies/page.jsx`
- `src/app/api/studies/route.js`

---

## 📋 목차

1. [카테고리 필터 예외](#1-카테고리-필터-예외)
2. [상태 필터 예외](#2-상태-필터-예외)
3. [복합 필터 조합](#3-복합-필터-조합)
4. [URL 파라미터 동기화](#4-url-파라미터-동기화)
5. [필터 상태 관리](#5-필터-상태-관리)

---

## 1. 카테고리 필터 예외

### 1.1 카테고리 정의

```javascript
// src/app/studies/page.jsx
const categories = [
  { id: 'all', label: '전체', value: null, icon: '📚' },
  { id: 'programming', label: '프로그래밍', value: '프로그래밍', icon: '💻' },
  { id: 'language', label: '어학', value: '어학', icon: '🌍' },
  { id: 'cert', label: '자격증', value: '자격증', icon: '📝' },
  { id: 'hobby', label: '취미', value: '취미', icon: '🎸' },
  { id: 'book', label: '독서', value: '독서', icon: '📖' },
  { id: 'finance', label: '재테크', value: '재테크', icon: '💰' },
]
```

---

### 1.2 잘못된 카테고리 처리

#### ❌ 문제 상황
```javascript
// URL에서 잘못된 카테고리 전달
// /studies?category=존재하지않는카테고리
// /studies?category=<script>alert(1)</script>

const [selectedCategory, setSelectedCategory] = useState('전체')

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const urlCategory = params.get('category')
  
  // 검증 없이 바로 설정
  setSelectedCategory(urlCategory) // ❌ 위험
}, [])
```

#### ✅ 해결 방법
```javascript
// 카테고리 검증 함수
function validateCategory(category) {
  const validCategories = categories.map(c => c.label)
  return validCategories.includes(category) ? category : '전체'
}

// URL에서 카테고리 로드
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const urlCategory = params.get('category')
  
  if (urlCategory) {
    const validated = validateCategory(urlCategory)
    setSelectedCategory(validated)
    
    if (validated !== urlCategory) {
      console.warn('Invalid category from URL:', urlCategory)
    }
  }
}, [])
```

#### 🎯 API 레벨 검증
```javascript
// src/app/api/studies/route.js
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    // 유효한 카테고리 목록
    const VALID_CATEGORIES = [
      '프로그래밍', '어학', '자격증', '취미', '독서', '재테크'
    ]
    
    let whereClause = {}
    
    // 카테고리 검증
    if (category && category !== 'all') {
      if (VALID_CATEGORIES.includes(category)) {
        whereClause.category = category
      } else {
        // 잘못된 카테고리는 무시 (전체로 처리)
        console.warn('Invalid category parameter:', category)
      }
    }
    
    // ...
  } catch (error) {
    // ...
  }
}
```

---

### 1.3 '전체' 카테고리 처리

#### ✅ 올바른 구현
```javascript
// src/app/studies/page.jsx
const queryParams = {
  page: currentPage,
  limit: itemsPerPage,
}

// '전체'가 아닌 경우만 카테고리 파라미터 추가
if (selectedCategory && selectedCategory !== '전체') {
  queryParams.category = selectedCategory
}
// '전체'일 때는 category 파라미터를 보내지 않음
// → API에서 모든 카테고리 반환

const { data } = useStudies(queryParams)
```

#### 🎯 카테고리 버튼 상태
```javascript
// 활성 카테고리 스타일 적용
<div className={styles.categoryTabs}>
  {categories.map((category) => (
    <button
      key={category.id}
      className={`${styles.categoryTab} ${
        selectedCategory === category.label ? styles.active : ''
      }`}
      onClick={() => handleCategoryChange(category.label)}
    >
      {category.icon} {category.label}
    </button>
  ))}
</div>
```

---

### 1.4 하위 카테고리 (SubCategory)

#### 🎯 하위 카테고리 추가
```javascript
// 확장 가능한 카테고리 구조
const categoryTree = {
  '프로그래밍': ['웹 개발', '앱 개발', 'AI/ML', '알고리즘'],
  '어학': ['영어', '일본어', '중국어', '기타'],
  '자격증': ['IT', '금융', '공무원', '기타'],
  // ...
}

// 하위 카테고리 선택
const [subCategory, setSubCategory] = useState(null)

// API 호출 시 포함
const queryParams = {
  page: currentPage,
  limit: itemsPerPage,
}

if (selectedCategory !== '전체') {
  queryParams.category = selectedCategory
  
  if (subCategory) {
    queryParams.subCategory = subCategory
  }
}
```

#### ✅ API 지원
```javascript
// src/app/api/studies/route.js
const category = searchParams.get('category')
const subCategory = searchParams.get('subCategory')

if (category && category !== 'all') {
  whereClause.category = category
  
  if (subCategory) {
    whereClause.subCategory = subCategory
  }
}
```

---

## 2. 상태 필터 예외

### 2.1 모집 중 필터

#### ✅ 구현
```javascript
// 모집 중만 보기 토글
const [showRecruitingOnly, setShowRecruitingOnly] = useState(false)

// API 파라미터 구성
const queryParams = {
  page: currentPage,
  limit: itemsPerPage,
}

if (showRecruitingOnly) {
  queryParams.isRecruiting = true
}

const { data } = useStudies(queryParams)
```

#### 🎯 UI 토글
```javascript
<label className={styles.filterToggle}>
  <input
    type="checkbox"
    checked={showRecruitingOnly}
    onChange={(e) => {
      setShowRecruitingOnly(e.target.checked)
      setCurrentPage(1) // 필터 변경 시 첫 페이지로
    }}
  />
  <span>모집 중만 보기</span>
</label>
```

---

### 2.2 공개/비공개 필터

#### ✅ 관리자용 필터
```javascript
// 일반 사용자: 공개 스터디만
// 관리자: 모든 스터디

const [includePrivate, setIncludePrivate] = useState(false)

const queryParams = {
  page: currentPage,
  limit: itemsPerPage,
}

// 기본적으로 공개만 (isPublic !== 'false')
// 비공개 포함 시 isPublic: 'false' 전달
if (includePrivate && isAdmin) {
  queryParams.isPublic = 'false'
}
```

#### 🎯 API 구현
```javascript
// src/app/api/studies/route.js
// 기본적으로 공개 스터디만 표시
const isPublic = searchParams.get('isPublic')

if (isPublic !== 'false') {
  whereClause.isPublic = true
}
// 관리자가 isPublic=false를 요청하면 모든 스터디 반환
```

---

### 2.3 멤버 수 필터

#### 🎯 고급 필터 옵션
```javascript
// 멤버 수 범위 필터
const [memberRange, setMemberRange] = useState('all')

const memberRanges = [
  { id: 'all', label: '전체', min: 0, max: Infinity },
  { id: 'small', label: '소규모 (1-5명)', min: 1, max: 5 },
  { id: 'medium', label: '중규모 (6-15명)', min: 6, max: 15 },
  { id: 'large', label: '대규모 (16명+)', min: 16, max: Infinity },
]

// 클라이언트 필터링 (이미 불러온 데이터)
const filteredByMembers = useMemo(() => {
  if (memberRange === 'all') return studies
  
  const range = memberRanges.find(r => r.id === memberRange)
  return studies.filter(study => 
    study.currentMembers >= range.min && 
    study.currentMembers <= range.max
  )
}, [studies, memberRange])
```

---

## 3. 복합 필터 조합

### 3.1 AND 조건 필터

#### ✅ 구현
```javascript
// 모든 조건을 동시에 만족하는 스터디
const queryParams = {
  page: currentPage,
  limit: itemsPerPage,
}

// 검색어 AND 카테고리 AND 모집중
if (searchKeyword.trim()) {
  queryParams.search = searchKeyword.trim()
}

if (selectedCategory !== '전체') {
  queryParams.category = selectedCategory
}

if (showRecruitingOnly) {
  queryParams.isRecruiting = true
}

// API: 모든 조건을 AND로 결합
const { data } = useStudies(queryParams)
```

#### 🎯 API AND 조건
```javascript
// src/app/api/studies/route.js
let whereClause = {}

// 1. 공개 스터디만
whereClause.isPublic = true

// 2. 카테고리 필터 (있으면 추가)
if (category && category !== 'all') {
  whereClause.category = category
}

// 3. 검색어 필터 (있으면 추가)
if (search) {
  whereClause.OR = [ // 검색은 OR 조건
    { name: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
  ]
}

// 4. 모집 중 필터 (있으면 추가)
if (isRecruiting === 'true') {
  whereClause.isRecruiting = true
}

// 모든 조건이 AND로 결합됨
const studies = await prisma.study.findMany({ where: whereClause })
```

---

### 3.2 필터 충돌 처리

#### ❌ 문제 상황
```javascript
// 상호 배타적인 필터 선택
// 예: "모집중" + "모집완료"는 동시에 불가능

const [recruitingStatus, setRecruitingStatus] = useState('all')
// 'all' | 'recruiting' | 'closed'
```

#### ✅ 해결 방법
```javascript
// 라디오 버튼으로 단일 선택
<div className={styles.statusFilter}>
  <label>
    <input
      type="radio"
      name="recruiting"
      value="all"
      checked={recruitingStatus === 'all'}
      onChange={(e) => {
        setRecruitingStatus(e.target.value)
        setCurrentPage(1)
      }}
    />
    전체
  </label>
  
  <label>
    <input
      type="radio"
      name="recruiting"
      value="recruiting"
      checked={recruitingStatus === 'recruiting'}
      onChange={(e) => {
        setRecruitingStatus(e.target.value)
        setCurrentPage(1)
      }}
    />
    모집중
  </label>
  
  <label>
    <input
      type="radio"
      name="recruiting"
      value="closed"
      checked={recruitingStatus === 'closed'}
      onChange={(e) => {
        setRecruitingStatus(e.target.value)
        setCurrentPage(1)
      }}
    />
    모집완료
  </label>
</div>

// API 파라미터
const queryParams = { /* ... */ }

if (recruitingStatus === 'recruiting') {
  queryParams.isRecruiting = true
} else if (recruitingStatus === 'closed') {
  queryParams.isRecruiting = false
}
// 'all'이면 파라미터 추가하지 않음
```

---

### 3.3 필터 초기화

#### ✅ 전체 초기화 기능
```javascript
const handleResetFilters = () => {
  setSearchKeyword('')
  setSelectedCategory('전체')
  setShowRecruitingOnly(false)
  setRecruitingStatus('all')
  setMemberRange('all')
  setCurrentPage(1)
  
  // URL도 초기화
  const url = new URL(window.location)
  url.search = ''
  window.history.pushState({}, '', url)
  
  showToast('필터가 초기화되었습니다', 'success')
}

// UI 버튼
<button 
  className={styles.resetButton}
  onClick={handleResetFilters}
  disabled={isDefaultFilter()} // 이미 기본 상태면 비활성화
>
  🔄 필터 초기화
</button>

// 기본 필터 상태 확인
function isDefaultFilter() {
  return (
    !searchKeyword.trim() &&
    selectedCategory === '전체' &&
    !showRecruitingOnly &&
    recruitingStatus === 'all' &&
    memberRange === 'all'
  )
}
```

---

## 4. URL 파라미터 동기화

### 4.1 URL에서 필터 로드

#### ✅ 초기 로드 시 URL 파싱
```javascript
// src/app/studies/page.jsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  
  // 검색어
  const urlSearch = params.get('search')
  if (urlSearch) {
    setSearchKeyword(urlSearch)
  }
  
  // 카테고리
  const urlCategory = params.get('category')
  if (urlCategory) {
    const validated = validateCategory(urlCategory)
    setSelectedCategory(validated)
  }
  
  // 페이지
  const urlPage = parseInt(params.get('page'))
  if (urlPage && urlPage > 0) {
    setCurrentPage(urlPage)
  }
  
  // 모집 중
  const urlRecruiting = params.get('isRecruiting')
  if (urlRecruiting === 'true') {
    setShowRecruitingOnly(true)
  }
  
  // 정렬
  const urlSort = params.get('sortBy')
  if (urlSort && ['latest', 'popular', 'rating'].includes(urlSort)) {
    setSortBy(urlSort)
  }
}, []) // 마운트 시 한 번만
```

---

### 4.2 필터 변경 시 URL 업데이트

#### ✅ URL 동기화 훅
```javascript
// URL 동기화 커스텀 훅
function useSyncUrlParams(filters) {
  useEffect(() => {
    const params = new URLSearchParams()
    
    // 검색어
    if (filters.search && filters.search.trim()) {
      params.set('search', filters.search.trim())
    }
    
    // 카테고리
    if (filters.category && filters.category !== '전체') {
      params.set('category', filters.category)
    }
    
    // 페이지
    if (filters.page > 1) {
      params.set('page', filters.page.toString())
    }
    
    // 모집 중
    if (filters.isRecruiting) {
      params.set('isRecruiting', 'true')
    }
    
    // 정렬
    if (filters.sortBy && filters.sortBy !== 'latest') {
      params.set('sortBy', filters.sortBy)
    }
    
    // URL 업데이트 (페이지 리로드 없이)
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params}`
      : window.location.pathname
    
    window.history.pushState({}, '', newUrl)
    
  }, [filters])
}

// 사용
useSyncUrlParams({
  search: searchKeyword,
  category: selectedCategory,
  page: currentPage,
  isRecruiting: showRecruitingOnly,
  sortBy: sortBy,
})
```

---

### 4.3 공유 가능한 URL

#### 🎯 필터 상태를 URL에 완전히 반영
```javascript
// 현재 필터 상태의 URL 생성
function getShareableUrl() {
  const params = new URLSearchParams()
  
  if (searchKeyword.trim()) {
    params.set('search', searchKeyword.trim())
  }
  
  if (selectedCategory !== '전체') {
    params.set('category', selectedCategory)
  }
  
  if (showRecruitingOnly) {
    params.set('isRecruiting', 'true')
  }
  
  if (sortBy !== 'latest') {
    params.set('sortBy', sortBy)
  }
  
  const baseUrl = window.location.origin + window.location.pathname
  return params.toString() ? `${baseUrl}?${params}` : baseUrl
}

// 복사 기능
const handleCopyLink = () => {
  const url = getShareableUrl()
  
  navigator.clipboard.writeText(url)
    .then(() => {
      showToast('링크가 복사되었습니다', 'success')
    })
    .catch(() => {
      showToast('링크 복사에 실패했습니다', 'error')
    })
}

// UI
<button 
  className={styles.shareButton}
  onClick={handleCopyLink}
>
  🔗 현재 검색 결과 공유
</button>
```

---

## 5. 필터 상태 관리

### 5.1 React Query와 필터 통합

#### ✅ 필터를 Query Key에 포함
```javascript
// src/lib/hooks/useApi.js
export function useStudies(params = {}) {
  return useQuery({
    queryKey: ['studies', params], // params 전체가 key
    queryFn: () => api.get('/api/studies', params),
    staleTime: 1000 * 60 * 5, // 5분
  })
}

// 사용
const queryParams = {
  page: currentPage,
  limit: 10,
  search: searchKeyword.trim() || undefined,
  category: selectedCategory !== '전체' ? selectedCategory : undefined,
  isRecruiting: showRecruitingOnly || undefined,
  sortBy: sortBy,
}

const { data, isLoading } = useStudies(queryParams)

// 필터 변경 시 자동으로 새로운 queryKey 생성 → 자동 refetch
```

---

### 5.2 필터 상태 Persistence

#### 🎯 로컬스토리지에 필터 저장
```javascript
// 필터 저장
const saveFiltersToStorage = (filters) => {
  try {
    localStorage.setItem('study-filters', JSON.stringify(filters))
  } catch (error) {
    console.error('Failed to save filters:', error)
  }
}

// 필터 로드
const loadFiltersFromStorage = () => {
  try {
    const saved = localStorage.getItem('study-filters')
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to load filters:', error)
    return null
  }
}

// 초기화 시 로드
useEffect(() => {
  const savedFilters = loadFiltersFromStorage()
  
  if (savedFilters) {
    setSearchKeyword(savedFilters.search || '')
    setSelectedCategory(savedFilters.category || '전체')
    setShowRecruitingOnly(savedFilters.isRecruiting || false)
    setSortBy(savedFilters.sortBy || 'latest')
  }
}, [])

// 필터 변경 시 저장
useEffect(() => {
  const filters = {
    search: searchKeyword,
    category: selectedCategory,
    isRecruiting: showRecruitingOnly,
    sortBy: sortBy,
  }
  
  saveFiltersToStorage(filters)
}, [searchKeyword, selectedCategory, showRecruitingOnly, sortBy])
```

---

### 5.3 필터 프리셋

#### 🎯 자주 사용하는 필터 조합 저장
```javascript
// 필터 프리셋 정의
const filterPresets = [
  {
    id: 'recruiting-programming',
    name: '모집중인 프로그래밍',
    icon: '💻',
    filters: {
      category: '프로그래밍',
      isRecruiting: true,
      sortBy: 'latest',
    }
  },
  {
    id: 'popular-studies',
    name: '인기 스터디',
    icon: '🔥',
    filters: {
      category: '전체',
      sortBy: 'popular',
    }
  },
  {
    id: 'high-rated',
    name: '평점 높은 스터디',
    icon: '⭐',
    filters: {
      category: '전체',
      sortBy: 'rating',
    }
  },
]

// 프리셋 적용
const applyPreset = (preset) => {
  setSearchKeyword('')
  setSelectedCategory(preset.filters.category || '전체')
  setShowRecruitingOnly(preset.filters.isRecruiting || false)
  setSortBy(preset.filters.sortBy || 'latest')
  setCurrentPage(1)
  
  showToast(`"${preset.name}" 필터 적용`, 'success')
}

// UI
<div className={styles.presets}>
  <h4>빠른 필터</h4>
  {filterPresets.map(preset => (
    <button
      key={preset.id}
      className={styles.presetButton}
      onClick={() => applyPreset(preset)}
    >
      {preset.icon} {preset.name}
    </button>
  ))}
</div>
```

---

## 📚 테스트 케이스

```javascript
describe('Filter functionality', () => {
  test('잘못된 카테고리는 "전체"로 대체', () => {
    const validated = validateCategory('존재하지않는카테고리')
    expect(validated).toBe('전체')
  })
  
  test('필터 조합이 올바르게 API 파라미터로 변환', () => {
    const params = buildQueryParams({
      search: 'React',
      category: '프로그래밍',
      isRecruiting: true,
      page: 2,
    })
    
    expect(params).toEqual({
      search: 'React',
      category: '프로그래밍',
      isRecruiting: true,
      page: 2,
      limit: 10,
    })
  })
  
  test('URL 파라미터가 올바르게 파싱', () => {
    const url = '/studies?search=React&category=프로그래밍&page=2'
    const params = parseUrlParams(url)
    
    expect(params.search).toBe('React')
    expect(params.category).toBe('프로그래밍')
    expect(params.page).toBe(2)
  })
})
```

---

**문서 끝** - 필터 시스템의 모든 예외 상황을 다루는 완벽한 가이드

