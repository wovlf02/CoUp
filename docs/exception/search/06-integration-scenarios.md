# 통합 시나리오 (Integration Scenarios)

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 북마크 연동, 내 스터디 필터, 추천 시스템, 검색 히스토리  

---

## 📋 목차

1. [내 스터디 필터](#1-내-스터디-필터)
2. [북마크 통합](#2-북마크-통합)
3. [검색 히스토리](#3-검색-히스토리)
4. [추천 시스템](#4-추천-시스템)

---

## 1. 내 스터디 필터

### 1.1 가입한 스터디 제외

#### ✅ 구현
```javascript
// src/app/studies/page.jsx
function StudiesExplorePage() {
  // 검색 파라미터
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: searchKeyword.trim() || undefined,
    category: selectedCategory !== '전체' ? selectedCategory : undefined,
  }
  
  const { data } = useStudies(queryParams)
  
  // 내 스터디 목록 가져오기
  const { data: myStudiesData } = useMyStudies({ limit: 100 })
  const myStudyIds = (myStudiesData?.data || []).map(s => s.study?.id || s.studyId)
  
  // 내 스터디를 제외한 목록
  const studies = (data?.data || []).filter(study => 
    !myStudyIds.includes(study.id)
  )
  
  // ...
}
```

---

### 1.2 내 스터디 포함 옵션

#### ✅ 토글 기능
```javascript
const [includeMyStudies, setIncludeMyStudies] = useState(false)

// 필터링
const filteredStudies = useMemo(() => {
  const allStudies = data?.data || []
  
  if (includeMyStudies) {
    return allStudies // 모든 스터디 표시
  }
  
  // 내 스터디 제외
  return allStudies.filter(study => !myStudyIds.includes(study.id))
}, [data, includeMyStudies, myStudyIds])

// UI
<label className={styles.filterToggle}>
  <input
    type="checkbox"
    checked={includeMyStudies}
    onChange={(e) => setIncludeMyStudies(e.target.checked)}
  />
  <span>내가 가입한 스터디 포함</span>
</label>
```

---

## 2. 북마크 통합

### 2.1 북마크 상태 표시

#### ✅ 구현
```javascript
function StudyCard({ study }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const bookmarkMutation = useBookmarkStudy()
  
  // 북마크 상태 로드
  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const response = await api.get(`/api/bookmarks/check/${study.id}`)
        setIsBookmarked(response.isBookmarked)
      } catch (error) {
        console.error('Failed to check bookmark:', error)
      }
    }
    
    checkBookmark()
  }, [study.id])
  
  const handleBookmark = async (e) => {
    e.preventDefault() // 링크 클릭 방지
    e.stopPropagation()
    
    try {
      if (isBookmarked) {
        await api.delete(`/api/bookmarks/${study.id}`)
      } else {
        await api.post('/api/bookmarks', { studyId: study.id })
      }
      
      setIsBookmarked(!isBookmarked)
      showToast(
        isBookmarked ? '북마크 해제' : '북마크 추가',
        'success'
      )
    } catch (error) {
      showToast('북마크 처리 실패', 'error')
    }
  }
  
  return (
    <div className={styles.studyCard}>
      <button
        className={styles.bookmarkButton}
        onClick={handleBookmark}
        aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
      >
        {isBookmarked ? '⭐' : '☆'}
      </button>
      {/* ... */}
    </div>
  )
}
```

---

### 2.2 북마크된 스터디만 보기

#### ✅ 필터 옵션
```javascript
const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
const { data: bookmarks } = useBookmarks()

const filteredStudies = useMemo(() => {
  let result = studies
  
  if (showBookmarkedOnly) {
    const bookmarkedIds = bookmarks?.map(b => b.studyId) || []
    result = result.filter(study => bookmarkedIds.includes(study.id))
  }
  
  return result
}, [studies, showBookmarkedOnly, bookmarks])

// UI
<label>
  <input
    type="checkbox"
    checked={showBookmarkedOnly}
    onChange={(e) => setShowBookmarkedOnly(e.target.checked)}
  />
  북마크한 스터디만
</label>
```

---

## 3. 검색 히스토리

### 3.1 최근 검색어 저장

#### ✅ 로컬스토리지 활용
```javascript
const MAX_HISTORY = 10

function saveSearchHistory(keyword) {
  if (!keyword || !keyword.trim()) return
  
  try {
    const history = getSearchHistory()
    
    // 중복 제거하고 최신 검색어를 맨 앞에
    const updated = [
      keyword.trim(),
      ...history.filter(k => k !== keyword.trim())
    ].slice(0, MAX_HISTORY)
    
    localStorage.setItem('search-history', JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save search history:', error)
  }
}

function getSearchHistory() {
  try {
    const saved = localStorage.getItem('search-history')
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    return []
  }
}

function clearSearchHistory() {
  localStorage.removeItem('search-history')
}

// 사용
const handleSearch = (keyword) => {
  if (keyword.trim()) {
    saveSearchHistory(keyword)
    // 검색 실행...
  }
}
```

---

### 3.2 최근 검색어 UI

#### ✅ 드롭다운 표시
```javascript
function SearchBar() {
  const [keyword, setKeyword] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  
  useEffect(() => {
    setHistory(getSearchHistory())
  }, [])
  
  const handleSelectHistory = (item) => {
    setKeyword(item)
    setShowHistory(false)
    handleSearch(item)
  }
  
  const handleDeleteHistory = (item) => {
    const updated = history.filter(h => h !== item)
    localStorage.setItem('search-history', JSON.stringify(updated))
    setHistory(updated)
  }
  
  return (
    <div className={styles.searchWrapper}>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setShowHistory(true)}
        onBlur={() => setTimeout(() => setShowHistory(false), 200)}
        placeholder="검색..."
      />
      
      {showHistory && history.length > 0 && (
        <div className={styles.searchHistory}>
          <div className={styles.historyHeader}>
            <span>최근 검색어</span>
            <button onClick={() => {
              clearSearchHistory()
              setHistory([])
            }}>
              전체 삭제
            </button>
          </div>
          
          {history.map((item, i) => (
            <div key={i} className={styles.historyItem}>
              <button 
                className={styles.historyKeyword}
                onClick={() => handleSelectHistory(item)}
              >
                🔍 {item}
              </button>
              <button
                className={styles.historyDelete}
                onClick={() => handleDeleteHistory(item)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 4. 추천 시스템

### 4.1 개인화 추천

#### ✅ 사용자 관심사 기반
```javascript
// 사용자 행동 분석
function analyzeUserInterests(user, history) {
  const interests = {
    categories: {},
    tags: {},
    studyTypes: {}
  }
  
  // 가입한 스터디 분석
  user.studies?.forEach(study => {
    interests.categories[study.category] = 
      (interests.categories[study.category] || 0) + 2
    
    study.tags?.forEach(tag => {
      interests.tags[tag] = (interests.tags[tag] || 0) + 1
    })
  })
  
  // 검색 히스토리 분석
  history.forEach(keyword => {
    interests.tags[keyword] = (interests.tags[keyword] || 0) + 0.5
  })
  
  return interests
}

// 추천 점수 계산
function calculateRecommendationScore(study, interests) {
  let score = 0
  
  // 카테고리 일치
  if (interests.categories[study.category]) {
    score += interests.categories[study.category] * 10
  }
  
  // 태그 일치
  study.tags?.forEach(tag => {
    if (interests.tags[tag]) {
      score += interests.tags[tag] * 5
    }
  })
  
  // 평점 가중치
  score += (study.rating || 0) * 2
  
  // 모집 중 가중치
  if (study.isRecruiting) {
    score += 5
  }
  
  return score
}

// 추천 스터디 가져오기
function RecommendedStudies() {
  const { data: userData } = useUser()
  const history = getSearchHistory()
  const { data: allStudies } = useStudies({ limit: 100 })
  
  const recommended = useMemo(() => {
    if (!allStudies || !userData) return []
    
    const interests = analyzeUserInterests(userData, history)
    
    return allStudies
      .map(study => ({
        ...study,
        score: calculateRecommendationScore(study, interests)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }, [allStudies, userData, history])
  
  return (
    <div className={styles.recommended}>
      <h3>🎯 추천 스터디</h3>
      {recommended.map(study => (
        <StudyCard key={study.id} study={study} />
      ))}
    </div>
  )
}
```

---

### 4.2 인기 검색어

#### ✅ 서버 기반 인기 검색어
```javascript
// API: 인기 검색어 집계
// src/app/api/search/trending/route.js
export async function GET() {
  try {
    // 최근 24시간 검색어 집계 (예시)
    const trending = await prisma.searchLog.groupBy({
      by: ['keyword'],
      _count: {
        keyword: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        _count: {
          keyword: 'desc'
        }
      },
      take: 10
    })
    
    return NextResponse.json({ data: trending })
  } catch (error) {
    return NextResponse.json({ error: '인기 검색어 조회 실패' }, { status: 500 })
  }
}

// 클라이언트
function TrendingKeywords() {
  const { data } = useQuery({
    queryKey: ['trending-keywords'],
    queryFn: () => api.get('/api/search/trending'),
    staleTime: 1000 * 60 * 10, // 10분간 캐시
  })
  
  const trending = data?.data || []
  
  return (
    <div className={styles.trending}>
      <h4>🔥 인기 검색어</h4>
      <div className={styles.trendingList}>
        {trending.map((item, i) => (
          <button
            key={i}
            className={styles.trendingItem}
            onClick={() => handleSearch(item.keyword)}
          >
            <span className={styles.rank}>{i + 1}</span>
            <span className={styles.keyword}>{item.keyword}</span>
            <span className={styles.count}>({item._count.keyword})</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

### 4.3 유사 스터디 추천

#### ✅ 콘텐츠 기반 필터링
```javascript
function SimilarStudies({ currentStudy }) {
  const { data } = useStudies({ 
    category: currentStudy.category,
    limit: 20 
  })
  
  const similar = useMemo(() => {
    if (!data) return []
    
    return data.data
      .filter(s => s.id !== currentStudy.id)
      .map(study => ({
        ...study,
        similarity: calculateSimilarity(currentStudy, study)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4)
  }, [data, currentStudy])
  
  return (
    <div className={styles.similar}>
      <h4>비슷한 스터디</h4>
      {similar.map(study => (
        <StudyCard key={study.id} study={study} compact />
      ))}
    </div>
  )
}

function calculateSimilarity(studyA, studyB) {
  let score = 0
  
  // 카테고리 일치
  if (studyA.category === studyB.category) score += 30
  
  // 하위 카테고리 일치
  if (studyA.subCategory === studyB.subCategory) score += 20
  
  // 공통 태그 수
  const commonTags = studyA.tags?.filter(tag => 
    studyB.tags?.includes(tag)
  ).length || 0
  score += commonTags * 10
  
  // 평점 유사도
  const ratingDiff = Math.abs((studyA.rating || 0) - (studyB.rating || 0))
  score += Math.max(0, 10 - ratingDiff * 2)
  
  return score
}
```

---

**문서 끝**

