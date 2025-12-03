# 다음 작업: Search 도메인 Exception 구현

**작성일**: 2025-12-04  
**최종 업데이트**: 2025-12-04  
**현재 상태**: ✅ Dashboard 도메인 100% 완료!
**다음 작업**: Search 도메인 시작

---

## 🎉 Dashboard 도메인 완료!

### 테스트 결과 (최종)
```
Test Suites: 4 passed, 4 total
Tests:       280 passed, 280 total
```

### 완료된 테스트 파일
- ✅ **dashboard-exception.test.js**: 74/74 (100%)
- ✅ **dashboard-validators.test.js**: 103/103 (100%)
- ✅ **dashboard-helpers.test.js**: 생성됨
- ✅ **dashboard-api.test.js**: 생성됨

### Dashboard 에러 코드 체계 (참고용)
- `DASH-001` ~ `DASH-040`: 기본 DashboardException
- `DASH-VAL-xxx`: DashboardValidationException (유효성 검증)
- `DASH-PERM-xxx`: DashboardPermissionException (권한)
- `DASH-BIZ-xxx`: DashboardBusinessException (비즈니스 로직)

### 주요 파일
- `src/lib/exceptions/dashboard/DashboardException.js` (40개 메서드)
- `src/lib/exceptions/dashboard/DashboardValidationException.js` (15개 메서드)
- `src/lib/exceptions/dashboard/DashboardPermissionException.js` (12개 메서드)
- `src/lib/exceptions/dashboard/DashboardBusinessException.js` (20개 메서드)
- `src/lib/validators/dashboard-validators.js` (12개 함수)
- `src/lib/helpers/dashboard-helpers.js` (20개 함수)

---

## 📊 전체 진행 상황

```
Phase A: 도메인별 예외 처리 시스템 구축
├─ A1. Profile 도메인 ✅ 100% (172 테스트)
├─ A2. Study 도메인 ✅ 100% (142 테스트)
├─ A3. Group 도메인 ✅ 100% (114 테스트)
├─ A4. Notification 도메인 ✅ 100% (174 테스트)
├─ A5. Chat 도메인 ✅ 100% (219 테스트)
├─ A6. Dashboard 도메인 ✅ 100% (280 테스트) 🎉
├─ A7. Search 도메인 ⏳ 0% ← 다음 작업
├─ A8. Settings 도메인 ⏳ 0%
├─ A9. Auth 도메인 ⏳ 0%
└─ A10. Admin 도메인 ✅ 100% (61 테스트)

Phase A 전체: 70% 완료 (7/10 도메인 완료, 총 1162 테스트)
```

---

## 🎯 다음 작업: Search 도메인

### Phase A7: Search 도메인
**예상 시간**: 12-15시간  
**우선순위**: Medium

### 작업 범위
- 통합 검색 기능
- 스터디, 그룹, 사용자 검색
- 필터링 (카테고리, 태그, 상태)
- 정렬 (최신순, 인기순, 관련도순)
- 페이지네이션
- 검색 히스토리/추천
- 30-40개 Exception 메서드
- 60-80개 테스트 작성
- 100% 테스트 통과 목표

### 참고할 기존 패턴
1. Helper 함수 mock 필수
2. `params: Promise.resolve({ id: '...' })` 패턴 (Next.js 15)
3. Logger 함수 개별 import
4. `jest.resetAllMocks()` 전역 beforeEach
5. `prisma.$transaction.mockImplementation` 패턴
6. 에러 코드 체계: `SRCH-VAL-xxx`, `SRCH-PERM-xxx`, `SRCH-BIZ-xxx`

---

## 📋 Search 도메인 구현 순서

### Step 1: 도메인 분석 (2시간)
- 기존 검색 관련 코드 분석
- API 엔드포인트 요구사항 정리
- 검색 대상 모델 분석 (Study, Group, User)
- 예외 케이스 식별 (30-40개)

### Step 2: Exception 클래스 생성 (2-3시간)
```
src/lib/exceptions/search/
├── SearchException.js (Base)
├── SearchValidationException.js (SRCH-VAL-xxx)
├── SearchPermissionException.js (SRCH-PERM-xxx)
├── SearchBusinessException.js (SRCH-BIZ-xxx)
└── index.js
```

예상 에러 메서드:
- 검색어 검증 관련 (8-10개)
- 필터 검증 관련 (8-10개)
- 권한 검증 관련 (5-8개)
- 비즈니스 로직 관련 (10-12개)

### Step 3: Validators 구현 (2시간)
```
src/lib/validators/search-validators.js
- validateSearchQuery
- validateSearchFilters
- validateSortOption
- validatePageParams
- validateSearchType
- validateSearchScope
```

### Step 4: Helpers 구현 (2시간)
```
src/lib/helpers/search-helpers.js
- buildSearchQuery
- applyFilters
- applySorting
- formatSearchResults
- getSearchHistory
- getSuggestions
- highlightMatches
```

### Step 5: API 라우트 구현 (3-4시간)
```
src/app/api/search/
├── route.js                  - GET (통합 검색)
├── studies/route.js          - GET (스터디 검색)
├── groups/route.js           - GET (그룹 검색)
├── users/route.js            - GET (사용자 검색)
├── history/route.js          - GET/DELETE (검색 히스토리)
└── suggestions/route.js      - GET (검색어 추천)
```

### Step 6: 테스트 작성 (3-4시간)
```
src/__tests__/exceptions/search-exception.test.js
src/__tests__/validators/search-validators.test.js
src/__tests__/helpers/search-helpers.test.js
src/__tests__/api/search/
├── search.test.js
├── search-studies.test.js
├── search-groups.test.js
└── search-users.test.js
```

목표:
- Exception 테스트 (15-20개)
- Validator 테스트 (15-20개)
- Helper 테스트 (15-20개)
- API 테스트 (20-25개)
- **총 65-85개 테스트, 100% 통과**

---

## 🚀 세션 시작 명령어

```powershell
# 작업 디렉토리
cd C:\Project\CoUp\coup

# 기존 검색 관련 코드 확인
Get-ChildItem -Recurse -Filter "*search*" | Select-Object FullName

# Prisma 스키마에서 검색 대상 모델 확인
Get-Content prisma/schema.prisma | Select-String -Pattern "model (Study|Group|User)"
```

---

## 📚 참고 문서

### 완료된 도메인 패턴 참고
- `src/lib/exceptions/dashboard/DashboardException.js`
- `src/lib/exceptions/chat/ChatException.js`
- `src/lib/validators/dashboard-validators.js`
- `src/lib/helpers/dashboard-helpers.js`

---

## 💡 Search 도메인 특이사항

### 검색 타입
```javascript
const SEARCH_TYPES = {
  ALL: 'ALL',           // 통합 검색
  STUDY: 'STUDY',       // 스터디 검색
  GROUP: 'GROUP',       // 그룹 검색
  USER: 'USER'          // 사용자 검색
};
```

### 필터 옵션
```javascript
const FILTER_OPTIONS = {
  category: ['개발', '어학', '취업', '자격증', '기타'],
  status: ['RECRUITING', 'IN_PROGRESS', 'COMPLETED'],
  isPublic: [true, false],
  memberCount: { min: 1, max: 50 }
};
```

### 정렬 옵션
```javascript
const SORT_OPTIONS = {
  RELEVANCE: 'RELEVANCE',      // 관련도순
  LATEST: 'LATEST',            // 최신순
  POPULAR: 'POPULAR',          // 인기순 (멤버수)
  NAME: 'NAME'                 // 이름순
};
```

### 검색 결과 구조
```javascript
{
  results: {
    studies: [...],
    groups: [...],
    users: [...]
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  },
  meta: {
    query: '검색어',
    filters: {...},
    sort: 'RELEVANCE',
    executionTime: 120
  }
}
```

---

**프롬프트 예시**:
```
Search 도메인 구현을 시작해줘.

Dashboard 도메인이 100% 완료되었고 (280/280 테스트 통과), 
이제 Search 도메인을 같은 패턴으로 구현해야 해.

작업 순서:
1. 기존 검색 관련 코드 분석
2. SearchException 클래스 생성 (SearchValidationException, SearchPermissionException, SearchBusinessException)
3. search-validators.js 구현
4. search-helpers.js 구현
5. API 라우트 구현
6. 테스트 작성

Step 1부터 시작해줘!
```

---

**작성일**: 2025-12-04  
**상태**: Search 도메인 준비 완료
