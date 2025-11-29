# 검색/필터 (Search & Filter) 예외 처리 가이드

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 스터디 검색, 필터링, 정렬, 페이지네이션  
**관련 파일**:
- `src/app/studies/page.jsx` - 스터디 탐색 페이지
- `src/app/api/studies/route.js` - 스터디 검색 API
- `src/lib/hooks/useApi.js` - API 훅
- `src/components/studies/*` - 관련 컴포넌트

---

## 📋 목차

1. [개요](#개요)
2. [주요 기능](#주요-기능)
3. [예외 처리 영역](#예외-처리-영역)
4. [문서 구조](#문서-구조)
5. [빠른 참조](#빠른-참조)

---

## 🎯 개요

검색/필터 영역은 사용자가 원하는 스터디를 효율적으로 찾을 수 있도록 하는 핵심 기능입니다.  
키워드 검색, 카테고리 필터, 정렬 옵션, 페이지네이션 등 다양한 기능을 제공하며,  
사용자 경험을 최적화하기 위한 포괄적인 예외 처리가 필요합니다.

### 주요 특징
- ✅ **실시간 검색**: 키워드 입력 시 즉각적인 결과 반영
- ✅ **다중 필터**: 카테고리, 모집 상태, 정렬 옵션 조합
- ✅ **성능 최적화**: 디바운싱, 캐싱, 지연 로딩
- ✅ **사용자 경험**: 빈 상태, 로딩 상태, 오류 처리
- ✅ **확장성**: 새로운 필터 옵션 추가 용이

---

## 🚀 주요 기능

### 1. 검색 (Search)
```javascript
// 키워드 검색
- 스터디 이름 검색
- 설명 검색
- 태그 검색
- 대소문자 구분 없음 (case-insensitive)
- 특수문자 처리
```

### 2. 카테고리 필터
```javascript
// 7개 카테고리
- 전체 (all)
- 프로그래밍 (programming)
- 어학 (language)
- 자격증 (cert)
- 취미 (hobby)
- 독서 (book)
- 재테크 (finance)
```

### 3. 정렬 (Sort)
```javascript
// 3가지 정렬 옵션
- 최신순 (latest) - 기본값
- 인기순 (popular) - 멤버 수 기준
- 평점순 (rating) - 평점 높은 순
```

### 4. 페이지네이션
```javascript
// 페이지 기반 로딩
- 페이지당 10개 표시 (기본값)
- 총 페이지 수 계산
- 이전/다음 버튼
- 페이지 번호 직접 선택
```

### 5. 추가 필터
```javascript
// 옵션 필터
- 모집 중만 보기 (isRecruiting)
- 공개/비공개 (isPublic)
- 하위 카테고리 (subCategory)
```

---

## ⚠️ 예외 처리 영역

### 1. 검색 관련 예외 (01번 문서)
- **빈 검색어**: 공백, null, undefined
- **특수문자**: SQL Injection, XSS 방지
- **긴 검색어**: 최대 길이 제한
- **검색 결과 없음**: 빈 상태 UI
- **검색 API 오류**: 타임아웃, 서버 오류
- **동시 검색 요청**: 디바운싱 처리

### 2. 필터링 예외 (02번 문서)
- **잘못된 카테고리**: 존재하지 않는 카테고리
- **필터 조합 충돌**: 상호 배타적 옵션
- **필터 상태 동기화**: URL과 UI 불일치
- **필터 초기화**: 전체 조건 리셋
- **동적 필터 로딩**: 서버 기반 필터 옵션

### 3. 정렬 및 페이지네이션 (03번 문서)
- **잘못된 페이지 번호**: 음수, 0, 범위 초과
- **페이지 크기 변경**: 동적 limit 조정
- **총 개수 불일치**: 실시간 데이터 변경
- **무한 스크롤 전환**: 페이지네이션 → 무한 스크롤
- **정렬 기준 변경**: 상태 초기화

### 4. 성능 및 최적화 (04번 문서)
- **느린 검색 쿼리**: 인덱싱, 최적화
- **대량 데이터 로딩**: 가상 스크롤
- **캐시 관리**: React Query 캐싱
- **디바운싱/쓰로틀링**: 입력 최적화
- **메모리 누수**: 컴포넌트 언마운트

### 5. UI/UX 예외 (05번 문서)
- **로딩 상태**: 스켈레톤 UI
- **빈 상태**: 다양한 빈 상태 메시지
- **오류 상태**: 사용자 친화적 오류 메시지
- **반응형 디자인**: 모바일/데스크톱 대응
- **접근성**: 키보드 네비게이션, 스크린 리더

### 6. 통합 시나리오 (06번 문서)
- **북마크 연동**: 검색 결과에서 북마크
- **내 스터디 필터**: 가입한 스터디 제외
- **추천 알고리즘**: 개인화 검색
- **최근 검색어**: 검색 히스토리
- **인기 검색어**: 실시간 트렌드

### 7. 모범 사례 (99번 문서)
- **검색 UX 패턴**: 자동완성, 추천어
- **필터 UI 디자인**: 명확한 선택 상태
- **성능 모니터링**: 검색 속도 추적
- **A/B 테스트**: 검색 결과 최적화
- **SEO 최적화**: URL 파라미터 관리

---

## 📚 문서 구조

```
search/
├── README.md                           # 📖 본 문서 (개요 및 가이드)
├── INDEX.md                            # 📇 전체 색인 및 빠른 참조
├── 01-search-exceptions.md             # 🔍 검색 관련 예외 처리
├── 02-filter-exceptions.md             # 🎛️ 필터링 관련 예외 처리
├── 03-pagination-sort-exceptions.md    # 📄 페이지네이션 및 정렬 예외
├── 04-performance-optimization.md      # ⚡ 성능 최적화
├── 05-ui-ux-exceptions.md              # 🎨 UI/UX 예외 처리
├── 06-integration-scenarios.md         # 🔗 통합 시나리오
├── 99-best-practices.md                # ✨ 모범 사례 및 권장사항
└── COMPLETION-REPORT.md                # ✅ 완료 보고서
```

---

## 🔗 빠른 참조

### 긴급 문제 해결

#### 🆘 검색이 작동하지 않을 때
```javascript
// 1. API 엔드포인트 확인
GET /api/studies?search=keyword

// 2. 네트워크 탭 확인
// 3. 에러 로그 확인
console.error('Search error:', error)

// 4. 디버깅 스크립트
npm run test -- search-api.test.js
```

#### 🆘 필터가 적용되지 않을 때
```javascript
// 1. URL 파라미터 확인
console.log(window.location.search)

// 2. 상태 확인
console.log({ selectedCategory, searchKeyword })

// 3. React Query 캐시 초기화
queryClient.invalidateQueries(['studies'])
```

#### 🆘 페이지네이션 오류
```javascript
// 1. 페이지 범위 확인
if (page < 1 || page > totalPages) {
  setCurrentPage(1)
}

// 2. 총 개수 재계산
const total = await prisma.study.count({ where })
```

### 주요 API 엔드포인트

```javascript
// 기본 검색
GET /api/studies?search=keyword&page=1&limit=10

// 카테고리 필터
GET /api/studies?category=프로그래밍&page=1

// 복합 필터
GET /api/studies?search=React&category=프로그래밍&isRecruiting=true&sortBy=popular

// 정렬 옵션
GET /api/studies?sortBy=latest    // 최신순
GET /api/studies?sortBy=popular   // 인기순
GET /api/studies?sortBy=rating    // 평점순
```

### 주요 상태 관리

```javascript
// 검색 상태
const [searchKeyword, setSearchKeyword] = useState('')
const [selectedCategory, setSelectedCategory] = useState('전체')
const [currentPage, setCurrentPage] = useState(1)

// API 호출
const { data, isLoading, error } = useStudies({
  page: currentPage,
  limit: 10,
  category: selectedCategory !== '전체' ? selectedCategory : undefined,
  search: searchKeyword.trim() || undefined,
})
```

### 성능 최적화 팁

```javascript
// 1. 디바운싱 적용
import { useDebouncedValue } from '@/hooks/useDebounce'
const debouncedSearch = useDebouncedValue(searchKeyword, 300)

// 2. 메모이제이션
const filteredStudies = useMemo(() => {
  return studies.filter(/* ... */)
}, [studies, filters])

// 3. React Query 캐싱
queryClient.setQueryData(['studies', params], data)
```

---

## 📊 테스트 체크리스트

### 검색 기능 테스트
- [ ] 키워드 검색 정상 작동
- [ ] 검색 결과 없음 처리
- [ ] 특수문자 입력 처리
- [ ] 빈 검색어 처리
- [ ] 검색어 디바운싱

### 필터 기능 테스트
- [ ] 카테고리 필터 적용
- [ ] 모집 중 필터 적용
- [ ] 복합 필터 조합
- [ ] 필터 초기화
- [ ] URL 동기화

### 정렬/페이지네이션 테스트
- [ ] 최신순 정렬
- [ ] 인기순 정렬
- [ ] 평점순 정렬
- [ ] 페이지 이동
- [ ] 페이지 범위 검증

### 성능 테스트
- [ ] 초기 로딩 속도
- [ ] 검색 응답 시간
- [ ] 페이지 전환 속도
- [ ] 메모리 사용량
- [ ] 캐시 효율성

### UI/UX 테스트
- [ ] 로딩 상태 표시
- [ ] 빈 상태 메시지
- [ ] 오류 메시지
- [ ] 반응형 디자인
- [ ] 키보드 네비게이션

---

## 🔧 디버깅 도구

### 1. React Query Devtools
```javascript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<ReactQueryDevtools initialIsOpen={false} />
```

### 2. 검색 로그
```javascript
// 검색 요청 로깅
console.log('[SEARCH]', {
  keyword: searchKeyword,
  category: selectedCategory,
  page: currentPage,
  timestamp: new Date().toISOString()
})
```

### 3. 성능 측정
```javascript
// 검색 성능 측정
const startTime = performance.now()
const results = await searchStudies(params)
const endTime = performance.now()
console.log(`Search took ${endTime - startTime}ms`)
```

---

## 📞 지원 및 문의

### 관련 문서
- [인증 예외 처리](../auth/README.md)
- [대시보드 예외 처리](../dashboard/README.md)
- [스터디 관리 예외 처리](../studies/README.md)

### 추가 리소스
- API 문서: `docs/api/`
- 디자인 시스템: `docs/design/`
- 테스트 가이드: `docs/guides/testing.md`

### 이슈 보고
- GitHub Issues
- 개발팀 Slack 채널
- 기술 문서 Wiki

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0.0 | 2025-11-29 | 초기 문서 작성 | Copilot |

---

## ✅ 다음 단계

1. **01-search-exceptions.md** - 검색 예외 처리 상세 문서
2. **02-filter-exceptions.md** - 필터링 예외 처리
3. **03-pagination-sort-exceptions.md** - 페이지네이션 및 정렬
4. **04-performance-optimization.md** - 성능 최적화
5. **05-ui-ux-exceptions.md** - UI/UX 예외 처리
6. **06-integration-scenarios.md** - 통합 시나리오
7. **99-best-practices.md** - 모범 사례

각 문서는 실제 코드 예제와 함께 구체적인 예외 상황과 해결 방법을 제공합니다.

---

**문서 끝** - 검색/필터 예외 처리의 모든 것을 다루는 포괄적인 가이드입니다.

