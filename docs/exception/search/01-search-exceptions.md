# 검색 예외 처리 (Search Exceptions)

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 키워드 검색, 검색 결과 처리, 자동완성, API 오류  
**관련 파일**:
- `src/app/studies/page.jsx`
- `src/app/api/studies/route.js`
- `src/lib/hooks/useApi.js`

---

## 📋 목차

1. [키워드 검색 예외](#1-키워드-검색-예외)
2. [검색 결과 처리](#2-검색-결과-처리)
3. [검색 API 오류](#3-검색-api-오류)
4. [입력 검증 및 정제](#4-입력-검증-및-정제)
5. [디버깅 가이드](#5-디버깅-가이드)

---

## 1. 키워드 검색 예외

### 1.1 빈 검색어 처리

#### ❌ 문제 상황
```javascript
// 사용자가 검색어를 입력하지 않고 검색
const [searchKeyword, setSearchKeyword] = useState('')

// 빈 문자열로 API 호출
const { data } = useStudies({ search: '' })
// → 모든 스터디 반환 (의도하지 않은 동작)
```

#### ✅ 해결 방법
```javascript
// src/app/studies/page.jsx
const queryParams = {
  page: currentPage,
  limit: itemsPerPage,
}

// 검색어가 있는 경우만 추가
if (searchKeyword && searchKeyword.trim()) {
  queryParams.search = searchKeyword.trim()
}

const { data, isLoading, error } = useStudies(queryParams)
```

#### 🎯 모범 사례
```javascript
// 검색 핸들러에서 검증
const handleSearch = () => {
  const trimmed = searchKeyword.trim()
  
  if (!trimmed) {
    // 빈 검색어면 초기화
    setSearchKeyword('')
    setCurrentPage(1)
    return
  }
  
  // 유효한 검색어만 검색
  setCurrentPage(1)
  // React Query가 자동으로 재요청
}

// Enter 키 처리
const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}
```

---

### 1.2 특수문자 처리

#### ❌ 문제 상황
```javascript
// 특수문자가 포함된 검색어
const specialChars = [
  'React & Vue',           // &
  'C++',                   // +
  '50% 할인',              // %
  'SQL Injection\'; DROP', // SQL 인젝션 시도
  '<script>alert(1)</script>', // XSS 시도
]
```

#### ✅ API 레벨 보호
```javascript
// src/app/api/studies/route.js
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    if (search) {
      // Prisma는 자동으로 SQL 인젝션 방어
      // contains 모드는 안전한 LIKE 검색
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }
    
    // ...
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

#### 🎯 클라이언트 레벨 검증
```javascript
// 검색어 정제 함수
function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return ''
  }
  
  // 1. 앞뒤 공백 제거
  let sanitized = query.trim()
  
  // 2. 연속된 공백을 하나로
  sanitized = sanitized.replace(/\s+/g, ' ')
  
  // 3. HTML 태그 제거 (XSS 방지)
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  
  // 4. 최대 길이 제한
  const MAX_LENGTH = 100
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
  }
  
  return sanitized
}

// 사용
const handleSearchInput = (e) => {
  const value = e.target.value
  const sanitized = sanitizeSearchQuery(value)
  setSearchKeyword(sanitized)
}
```

---

### 1.3 긴 검색어 처리

#### ❌ 문제 상황
```javascript
// 매우 긴 검색어
const longQuery = 'a'.repeat(1000) // 1000자
// → 성능 저하, UI 깨짐
```

#### ✅ 해결 방법
```javascript
// 검색어 길이 제한
const MAX_SEARCH_LENGTH = 100

const handleSearchInput = (e) => {
  let value = e.target.value
  
  // 길이 제한
  if (value.length > MAX_SEARCH_LENGTH) {
    value = value.substring(0, MAX_SEARCH_LENGTH)
    
    // 사용자에게 피드백
    showToast('검색어는 100자 이내로 입력해주세요', 'warning')
  }
  
  setSearchKeyword(value)
}
```

#### 🎯 UI 피드백
```javascript
// 검색 입력창에 문자 수 표시
<div className={styles.searchBox}>
  <input
    type="text"
    placeholder="스터디 이름, 키워드로 검색..."
    value={searchKeyword}
    onChange={handleSearchInput}
    onKeyPress={handleKeyPress}
    className={styles.searchInput}
    maxLength={MAX_SEARCH_LENGTH}
  />
  <span className={styles.charCount}>
    {searchKeyword.length}/{MAX_SEARCH_LENGTH}
  </span>
  <button className={styles.searchButton} onClick={handleSearch}>
    🔍 검색
  </button>
</div>
```

---

### 1.4 검색어 인코딩

#### ❌ 문제 상황
```javascript
// 한글, 이모지 등 URL 인코딩 필요
const queries = [
  '프로그래밍',    // 한글
  '📚 독서',       // 이모지
  'React/Vue',    // 특수문자
]
```

#### ✅ 자동 인코딩
```javascript
// src/lib/api.js
async get(endpoint, params = {}) {
  // URLSearchParams가 자동으로 인코딩
  const queryString = new URLSearchParams(params).toString()
  const url = queryString ? `${endpoint}?${queryString}` : endpoint
  
  const response = await fetch(url, {
    method: 'GET',
    headers: this.getHeaders(),
  })
  
  // ...
}

// 사용
api.get('/api/studies', { search: '프로그래밍' })
// → /api/studies?search=%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D
```

#### 🎯 서버 측 디코딩
```javascript
// src/app/api/studies/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  
  // 자동으로 디코딩됨
  const search = searchParams.get('search')
  // '프로그래밍' ✅
  
  // ...
}
```

---

## 2. 검색 결과 처리

### 2.1 검색 결과 없음

#### ❌ 문제 상황
```javascript
// 검색 결과가 없을 때 처리 부족
const studies = data?.data || []

return (
  <div>
    {studies.map(study => <StudyCard key={study.id} {...study} />)}
  </div>
)
// → 빈 화면, 사용자 혼란
```

#### ✅ 빈 상태 UI
```javascript
// src/app/studies/page.jsx
{studies.length === 0 ? (
  <div className={styles.emptyState}>
    {searchKeyword || selectedCategory !== '전체' ? (
      // 검색/필터 결과 없음
      <>
        <div className={styles.emptyIcon}>🔍</div>
        <h3>검색 결과가 없습니다</h3>
        <p>
          {searchKeyword && `"${searchKeyword}"에 대한 `}
          {selectedCategory !== '전체' && `${selectedCategory} 카테고리의 `}
          스터디를 찾을 수 없습니다.
        </p>
        <button 
          className={styles.resetButton}
          onClick={handleReset}
        >
          🔄 검색 초기화
        </button>
      </>
    ) : (
      // 전체 스터디 없음 (거의 발생 안 함)
      <>
        <div className={styles.emptyIcon}>📚</div>
        <h3>아직 생성된 스터디가 없습니다</h3>
        <p>첫 번째 스터디를 만들어보세요!</p>
        <Link href="/studies/create" className={styles.createButton}>
          + 스터디 만들기
        </Link>
      </>
    )}
  </div>
) : (
  <div className={styles.studiesGrid}>
    {studies.map(study => (
      <StudyCard key={study.id} {...study} />
    ))}
  </div>
)}
```

#### 🎯 검색 초기화
```javascript
const handleReset = () => {
  setSearchKeyword('')
  setSelectedCategory('전체')
  setCurrentPage(1)
  
  // 스크롤 상단으로
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

---

### 2.2 부분 일치 검색

#### ✅ 현재 구현
```javascript
// src/app/api/studies/route.js
// Prisma의 contains는 부분 일치 검색 (LIKE '%keyword%')
whereClause.OR = [
  { name: { contains: search, mode: 'insensitive' } },
  { description: { contains: search, mode: 'insensitive' } },
  { tags: { has: search } }
]

// 예시:
// search = "React"
// 일치: "React 스터디", "리액트 기초", "React Native"
// 불일치: "Vue.js 스터디"
```

#### 🎯 검색 정확도 향상
```javascript
// 전체 단어 일치 우선, 부분 일치는 보조
function rankSearchResults(results, keyword) {
  return results.sort((a, b) => {
    const keywordLower = keyword.toLowerCase()
    const aNameLower = a.name.toLowerCase()
    const bNameLower = b.name.toLowerCase()
    
    // 1. 정확히 일치
    if (aNameLower === keywordLower) return -1
    if (bNameLower === keywordLower) return 1
    
    // 2. 시작 부분 일치
    if (aNameLower.startsWith(keywordLower)) return -1
    if (bNameLower.startsWith(keywordLower)) return 1
    
    // 3. 포함 (기본 정렬 유지)
    return 0
  })
}

// 사용
const rankedStudies = rankSearchResults(studies, searchKeyword)
```

---

### 2.3 하이라이트 표시

#### 🎯 검색어 강조
```javascript
// 검색어 하이라이트 컴포넌트
function HighlightText({ text, keyword }) {
  if (!keyword || !text) {
    return <>{text}</>
  }
  
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'))
  
  return (
    <>
      {parts.map((part, index) => 
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={index} className={styles.highlight}>{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  )
}

// 사용
<h3 className={styles.studyName}>
  <HighlightText text={study.name} keyword={searchKeyword} />
</h3>
```

```css
/* styles */
.highlight {
  background-color: yellow;
  color: black;
  font-weight: bold;
  padding: 0 2px;
}
```

---

## 3. 검색 API 오류

### 3.1 네트워크 오류

#### ❌ 문제 상황
```javascript
// 네트워크 연결 끊김
// API 서버 다운
// 방화벽 차단
```

#### ✅ 오류 처리
```javascript
// src/lib/api.js
class ApiClient {
  async get(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `${endpoint}?${queryString}` : endpoint
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000), // 10초 타임아웃
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.json()
      
    } catch (error) {
      // 네트워크 오류 감지
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('네트워크 연결을 확인해주세요')
      }
      
      // 타임아웃
      if (error.name === 'TimeoutError') {
        throw new Error('요청 시간이 초과되었습니다')
      }
      
      throw error
    }
  }
}
```

#### 🎯 UI 오류 표시
```javascript
// src/app/studies/page.jsx
if (error) {
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>스터디를 불러올 수 없습니다</h3>
          <p>{error.message || '다시 시도해주세요'}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            🔄 다시 시도
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

### 3.2 API 타임아웃

#### ✅ 타임아웃 설정
```javascript
// 전역 타임아웃
const TIMEOUT_MS = 10000 // 10초

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다')
    }
    throw error
  }
}
```

#### 🎯 React Query 타임아웃
```javascript
// src/lib/hooks/useApi.js
export function useStudies(params = {}) {
  return useQuery({
    queryKey: ['studies', params],
    queryFn: () => api.get('/api/studies', params),
    retry: 2, // 2번 재시도
    retryDelay: 1000, // 1초 간격
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    gcTime: 1000 * 60 * 30, // 30분간 가비지 컬렉션 방지
  })
}
```

---

### 3.3 서버 오류 (500)

#### ✅ 에러 응답 처리
```javascript
// src/app/api/studies/route.js
export async function GET(request) {
  try {
    // ... 검색 로직
    
  } catch (error) {
    console.error('Get studies error:', error)
    
    // 에러 타입별 분류
    if (error.code === 'P2002') {
      // Prisma unique constraint
      return NextResponse.json(
        { error: "중복된 데이터가 있습니다" },
        { status: 409 }
      )
    }
    
    if (error.code === 'P2025') {
      // Record not found
      return NextResponse.json(
        { error: "데이터를 찾을 수 없습니다" },
        { status: 404 }
      )
    }
    
    // 일반 서버 오류
    return NextResponse.json(
      { 
        error: "검색 중 오류가 발생했습니다",
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
```

---

## 4. 입력 검증 및 정제

### 4.1 검색어 유효성 검증

```javascript
// 검증 유틸리티
function validateSearchQuery(query) {
  const errors = []
  
  // 1. 타입 검증
  if (typeof query !== 'string') {
    errors.push('검색어는 문자열이어야 합니다')
  }
  
  // 2. 길이 검증
  if (query.length > 100) {
    errors.push('검색어는 100자 이내로 입력해주세요')
  }
  
  // 3. 유효한 문자 검증
  const validPattern = /^[가-힣a-zA-Z0-9\s\-_]+$/
  if (query && !validPattern.test(query)) {
    errors.push('검색어에 특수문자를 사용할 수 없습니다')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// 사용
const handleSearch = () => {
  const trimmed = searchKeyword.trim()
  
  if (!trimmed) {
    return // 빈 검색어는 무시
  }
  
  const validation = validateSearchQuery(trimmed)
  
  if (!validation.valid) {
    showToast(validation.errors[0], 'error')
    return
  }
  
  // 검색 실행
  setCurrentPage(1)
}
```

---

### 4.2 SQL 인젝션 방어

#### ✅ Prisma 자동 방어
```javascript
// Prisma는 Prepared Statements 사용
// SQL 인젝션 자동 방어
whereClause.OR = [
  { name: { contains: search, mode: 'insensitive' } }
]

// 입력: "'; DROP TABLE studies; --"
// 실행되는 쿼리:
// SELECT * FROM Study WHERE name LIKE '%''; DROP TABLE studies; --%'
// → 단순 문자열로 처리, 안전함 ✅
```

#### 🎯 추가 보안 체크
```javascript
// 의심스러운 패턴 감지
function detectSqlInjection(query) {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /('|")(;|--)/,
  ]
  
  return sqlPatterns.some(pattern => pattern.test(query))
}

// 사용
if (detectSqlInjection(searchKeyword)) {
  console.warn('Potential SQL injection attempt:', searchKeyword)
  showToast('유효하지 않은 검색어입니다', 'error')
  return
}
```

---

### 4.3 XSS 방어

#### ✅ React 자동 이스케이핑
```javascript
// React는 자동으로 XSS 방어
<h3 className={styles.studyName}>
  {study.name}
  {/* <script>alert(1)</script> 입력 시 */}
  {/* → &lt;script&gt;alert(1)&lt;/script&gt; 로 렌더링 */}
</h3>
```

#### 🎯 dangerouslySetInnerHTML 사용 시 주의
```javascript
// ❌ 위험: 사용자 입력을 직접 HTML로
<div dangerouslySetInnerHTML={{ __html: study.description }} />

// ✅ 안전: HTML 정제 라이브러리 사용
import DOMPurify from 'isomorphic-dompurify'

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(study.description) 
}} />
```

---

## 5. 디버깅 가이드

### 5.1 검색 디버깅 체크리스트

```javascript
// 1. 검색어 확인
console.log('[DEBUG] Search keyword:', searchKeyword)

// 2. API 파라미터 확인
console.log('[DEBUG] Query params:', queryParams)

// 3. API 응답 확인
console.log('[DEBUG] API response:', data)

// 4. 필터링 결과 확인
console.log('[DEBUG] Filtered studies:', studies)

// 5. React Query 상태 확인
console.log('[DEBUG] Query state:', { isLoading, error })
```

### 5.2 일반적인 문제 해결

| 증상 | 원인 | 해결 방법 |
|------|------|-----------|
| 검색 결과 없음 | 빈 검색어 | `trim()` 추가 |
| 특수문자 오류 | 인코딩 문제 | URLSearchParams 사용 |
| 검색 느림 | 인덱스 부족 | DB 인덱스 추가 |
| 메모리 누수 | 캐시 미정리 | React Query gcTime 설정 |
| 검색 중복 요청 | 디바운싱 없음 | 디바운싱 훅 사용 |

### 5.3 테스트 케이스

```javascript
// 검색 기능 테스트
describe('Search functionality', () => {
  test('빈 검색어는 API 호출 안 함', () => {
    const params = buildQueryParams({ search: '' })
    expect(params.search).toBeUndefined()
  })
  
  test('공백만 있는 검색어 제거', () => {
    const params = buildQueryParams({ search: '   ' })
    expect(params.search).toBeUndefined()
  })
  
  test('특수문자 검색 가능', () => {
    const params = buildQueryParams({ search: 'C++' })
    expect(params.search).toBe('C++')
  })
  
  test('긴 검색어 자르기', () => {
    const long = 'a'.repeat(200)
    const sanitized = sanitizeSearchQuery(long)
    expect(sanitized.length).toBeLessThanOrEqual(100)
  })
})
```

---

## 📚 참고 자료

- [Prisma 검색 쿼리](https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting)
- [React Query 가이드](https://tanstack.com/query/latest/docs/react/guides/queries)
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [XSS 방어 가이드](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

**문서 끝** - 검색 기능의 모든 예외 상황을 다루는 완벽한 가이드

