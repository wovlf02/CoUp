# 스터디 탐색 (Study Explore)

> **화면 ID**: `STUDY-EXPLORE-01`  
> **라우트**: `/studies`  
> **목적**: 공개 스터디 검색 및 탐색  
> **사용자 상태**: 미가입 (탐색 중)  
> **렌더링**: SSR (SEO 최적화)

---

## ? 화면 목적

**"내게 맞는 스터디 찾기"**
- 다양한 공개 스터디를 빠르게 탐색
- 카테고리/키워드로 효율적인 검색
- 스터디 정보를 한눈에 비교
- 관심 있는 스터디에 즉시 가입 신청

---

## ? 레이아웃 구조 (FHD 최적화)

```
┌─────┬─────────────────────────────────────────────────────────────┬──────────────────┐
│     │ ? 스터디 탐색                      [+ 스터디 만들기]         │                  │
│ Nav ├─────────────────────────────────────────────────────────────┤  우측 위젯       │
│ 12% │ [전체▼] [프로그래밍▼] [최신순▼]     ? [검색창]             │  (280px)         │
│     ├─────────────────────────────────────────────────────────────┤                  │
│     │                                                             │  ? 인기 카테고리 │
│     │  ┌──────────┐  ┌──────────┐  ┌──────────┐                │  ? 프로그래밍    │
│     │  │ ?       │  │ ?       │  │ ?       │                │  ? 취업준비      │
│     │  │ 알고리즘  │  │ 취업준비  │  │ 운동루틴  │                │  ? 어학         │
│     │  │          │  │          │  │          │                │                  │
│     │  │ 12/20명  │  │ 8/15명   │  │ 5/10명   │                │  ? 추천 스터디  │
│     │  │ [가입]   │  │ [가입]   │  │ [가입]   │                │  ? 코딩테스트    │
│     │  └──────────┘  └──────────┘  └──────────┘                │  ? AI 학습       │
│     │                                                             │                  │
│     │  ┌──────────┐  ┌──────────┐  ┌──────────┐                │  ? 스터디 팁    │
│     │  │ ?       │  │ ?       │  │ ?       │                │  성공적인 스터디  │
│     │  │ 영어회화  │  │ 디자인   │  │ 창업     │                │  운영 가이드     │
│     │  └──────────┘  └──────────┘  └──────────┘                │                  │
│     │                                                             │  ? 통계         │
│ ?  │                                                             │  활성 스터디:    │
│ ? ← [← 1 2 3 4 5 →]                                            │  1,234개        │
│ ?  │                                                             │                  │
│ ?  │                     메인 콘텐츠 (60%)                       │                  │
│ ?  │                                                             │                  │
│ ?  │                                                             │                  │
└─────┴─────────────────────────────────────────────────────────────┴──────────────────┘
```

**레이아웃 비율**:
- 좌측 네비게이션: 12% (240px)
- 메인 콘텐츠: 58% (1100px)
- 우측 위젯: 30% (280px)
- 총 여백: 최소화 (좌우 각 20px)

---

## ? 섹션별 상세 설계

### 1. 페이지 헤더

```
┌──────────────────────────────────────────────────────────┐
│ ? 스터디 탐색                       [+ 스터디 만들기]    │
└──────────────────────────────────────────────────────────┘
```

**좌측**: 제목 "? 스터디 탐색"
- 폰트: text-2xl, Bold, gray-900
- 아이콘으로 현재 모드 명확히 표시

**우측**: [+ 스터디 만들기] 버튼
- 스타일: Primary, Medium
- 클릭 → `/studies/create`
- 항상 접근 가능하여 즉시 생성 유도

---

### 2. 필터 및 검색 바

```
┌──────────────────────────────────────────────────────────────┐
│ [전체 ▼] [프로그래밍 ▼] [최신순 ▼]        ? [검색창]       │
└──────────────────────────────────────────────────────────────┘
```

**구성 요소**:

1. **메인 카테고리** (Dropdown)
   - 전체, 프로그래밍, 취업준비, 자격증, 어학, 운동, 독서, 기타
   - 기본값: "전체"
   - 너비: 120px

2. **서브 카테고리** (동적 Dropdown)
   - 메인 카테고리 선택 시 활성화
   - 예: 프로그래밍 → 웹개발, 앱개발, 알고리즘, AI/ML
   - 너비: 140px

3. **정렬 옵션** (Dropdown)
   - 최신순 (기본)
   - 인기순 (멤버 수)
   - 이름순
   - 곧 마감 (정원 기준)
   - 너비: 120px

4. **검색 입력**
   - Placeholder: "스터디 이름, 설명으로 검색..."
   - 실시간 검색 (디바운스 500ms)
   - 엔터 키 또는 돋보기 아이콘 클릭
   - 너비: 나머지 공간 전체 활용

**스타일**:
- 배경: white
- 테두리: 1px solid gray-200
- 높이: 48px
- 둥근 모서리: 8px
- 그림자: shadow-sm
- 간격: 12px

**인터랙션**:
- 필터 변경 시 URL 쿼리 업데이트
- SSR 재렌더링으로 SEO 유지
- 로딩 스피너 표시

---

### 3. 스터디 카드 그리드

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ?           │  │ ?           │  │ ?           │
│ 알고리즘     │  │ 취업 준비    │  │ 운동 루틴    │
│ 마스터       │  │ 스터디       │  │ 모임         │
│              │  │              │  │              │
│ 매일 아침... │  │ 함께 준비... │  │ 아침 러닝... │
│              │  │              │  │              │
│ #알고리즘    │  │ #취업 #면접  │  │ #건강 #루틴  │
│              │  │              │  │              │
│ ? 12/20명   │  │ ? 8/15명    │  │ ? 5/10명    │
│ ? 김철수    │  │ ? 이영희    │  │ ? 박민수    │
│              │  │              │  │              │
│ [가입하기]   │  │ [가입하기]   │  │ [가입하기]   │
└──────────────┘  └──────────────┘  └──────────────┘
```

**그리드 레이아웃**:
- Desktop (1920px): 3컬럼 (갭 24px)
- Desktop (1440px): 3컬럼 (갭 20px)
- Tablet (1024px): 2컬럼 (갭 16px)
- Mobile (<768px): 1컬럼 (갭 12px)

**카드 스타일**:
```css
.study-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  cursor: pointer;
}

.study-card:hover {
  border-color: #6366F1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  transform: translateY(-4px);
}
```

**카드 내용** (위→아래 순서):

1. **카테고리 이모지** (상단 좌측)
   - 크기: 48px
   - 마진: 0 0 12px 0

2. **스터디명** (2줄 제한)
   - 폰트: text-lg, Bold, gray-900
   - 높이: 56px (고정)
   - 말줄임: ellipsis
   - 마진: 0 0 8px 0

3. **설명** (2줄 제한)
   - 폰트: text-sm, gray-600
   - 높이: 40px (고정)
   - 말줄임: ellipsis
   - 마진: 0 0 12px 0

4. **태그** (최대 3개)
   - 배경: gray-100
   - 텍스트: gray-700, text-xs
   - 패딩: 4px 8px
   - 둥근 모서리: 4px
   - 마진: 0 0 12px 0

5. **메타 정보** (flex로 배치)
   - ? 멤버 수: "12/20명"
   - ? 그룹장: "김철수"
   - 폰트: text-sm, gray-600
   - 마진: auto 0 12px 0 (하단으로 밀기)

6. **[가입하기] 버튼** (하단 고정)
   - 스타일: Primary
   - 너비: 100%
   - 높이: 40px
   - 둥근 모서리: 8px
   - 폰트: text-sm, Bold

**상태별 버튼**:
- 정원 여유: "가입하기" (Primary)
- 정원 마감: "대기 중" (Secondary, disabled)
- 비공개: "비공개" (gray, disabled)

---

### 4. 페이지네이션

```
                  ← [1] 2 3 4 5 →
```

**스타일**:
- 중앙 정렬
- 현재 페이지: Primary-500 배경, white 텍스트
- 다른 페이지: gray-100 배경, gray-700 텍스트
- Hover: gray-200 배경
- 버튼 크기: 40px × 40px (정사각형)
- 간격: 8px

**기능**:
- 한 페이지당 12개 카드 표시
- URL 쿼리로 페이지 관리 (`?page=2`)
- 무한 스크롤 고려 (Post-MVP)

---

## ? 우측 위젯 (280px 고정)

### 위젯 구성 (위→아래 순서)

#### 1?? 인기 카테고리

```
┌─────────────────────────────────┐
│ ? 인기 카테고리                 │
│                                 │
│ ? 프로그래밍      (234개)       │
│ ? 취업 준비      (189개)       │
│ ? 어학          (156개)       │
│ ? 자격증         (123개)       │
│ ? 운동          (98개)        │
│                                 │
│ [전체 카테고리 보기 →]          │
└─────────────────────────────────┘
```

**기능**:
- 클릭 시 해당 카테고리 필터 적용
- 스터디 개수 실시간 표시
- 상위 5개만 표시

---

#### 2?? 추천 스터디

```
┌─────────────────────────────────┐
│ ? 지금 핫한 스터디              │
│                                 │
│ ? 알고리즘 정복                 │
│    15/20명 · 프로그래밍          │
│    [미리보기]                   │
│                                 │
│ ? 면접 대비 스터디              │
│    18/20명 · 취업준비            │
│    [미리보기]                   │
│                                 │
│ ? 영어 회화 모임                │
│    12/15명 · 어학                │
│    [미리보기]                   │
│                                 │
│ [더 많은 추천 →]                │
└─────────────────────────────────┘
```

**추천 로직**:
- 최근 7일 가입자 수 증가율
- 활동 빈도 (공지, 채팅)
- 멤버 평점 (Post-MVP)

---

#### 3?? 스터디 생성 팁

```
┌─────────────────────────────────┐
│ ? 성공적인 스터디 운영 팁       │
│                                 │
│ 1. 명확한 목표 설정              │
│    "3개월 안에 알고리즘 100문제"│
│                                 │
│ 2. 정기적인 모임                 │
│    주 2-3회 고정 일정           │
│                                 │
│ 3. 작은 그룹 유지                │
│    5-10명이 가장 효과적         │
│                                 │
│ [스터디 만들기 가이드 →]        │
└─────────────────────────────────┘
```

---

#### 4?? 플랫폼 통계

```
┌─────────────────────────────────┐
│ ? CoUp 통계                    │
│                                 │
│ 활성 스터디    1,234개          │
│ 전체 멤버      5,678명          │
│ 오늘 생성      12개             │
│                                 │
│ ? 함께 성장하는 커뮤니티       │
└─────────────────────────────────┘
```

---

### 위젯 공통 스타일

```css
.widget {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.widget-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.widget-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
}

.widget-link {
  color: #6366F1;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.widget-link:hover {
  color: #4F46E5;
}
```

---

## ? 사용자 인터랙션

### 1. 카드 클릭

```javascript
const handleCardClick = (studyId) => {
  // 프리뷰 페이지로 이동
  router.push(`/studies/${studyId}`)
}
```

### 2. 가입하기 버튼 클릭

```javascript
const handleJoinClick = async (e, studyId) => {
  e.stopPropagation() // 카드 클릭 이벤트 방지
  
  if (!session) {
    // 미로그인 → 로그인 페이지
    router.push('/sign-in?redirect=/studies')
    return
  }
  
  try {
    setIsJoining(true)
    
    // API 호출
    await api.post(`/api/v1/studies/${studyId}/join`)
    
    // 성공 Toast
    toast.success('가입이 완료되었습니다!')
    
    // 내 스터디로 자동 이동
    router.push(`/my-studies/${studyId}`)
    
  } catch (error) {
    if (error.code === 'ALREADY_JOINED') {
      toast.info('이미 가입된 스터디입니다')
      router.push(`/my-studies/${studyId}`)
    } else if (error.code === 'STUDY_FULL') {
      toast.error('정원이 마감되었습니다')
    } else {
      toast.error('가입 신청 중 오류가 발생했습니다')
    }
  } finally {
    setIsJoining(false)
  }
}
```

### 3. 필터 변경

```javascript
const handleFilterChange = (filterType, value) => {
  const newParams = new URLSearchParams(searchParams)
  newParams.set(filterType, value)
  
  // URL 업데이트 (SSR 트리거)
  router.push(`/studies?${newParams.toString()}`)
}
```

### 4. 검색

```javascript
const [searchKeyword, setSearchKeyword] = useState('')

// 디바운스 처리
const debouncedSearch = useDebounce(searchKeyword, 500)

useEffect(() => {
  if (debouncedSearch) {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('keyword', debouncedSearch)
    router.push(`/studies?${newParams.toString()}`)
  }
}, [debouncedSearch])
```

---

## ? 로딩 및 빈 상태

### 로딩 상태 (Skeleton)

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ??????????   │  │ ??????????   │  │ ??????????   │
│ ??????       │  │ ??????       │  │ ??????       │
│ ????????     │  │ ????????     │  │ ????????     │
│              │  │              │  │              │
│ ??? ??? ???  │  │ ??? ??? ???  │  │ ??? ??? ???  │
│              │  │              │  │              │
│ ???? ????    │  │ ???? ????    │  │ ???? ????    │
│              │  │              │  │              │
│ ??????????   │  │ ??????????   │  │ ??????????   │
└──────────────┘  └──────────────┘  └──────────────┘
```

**구현**:
- 12개 스켈레톤 카드 표시
- 카드 레이아웃 유지
- 애니메이션: pulse

---

### 빈 상태 (검색 결과 없음)

```
┌────────────────────────────────────────────┐
│                                            │
│                                            │
│              [일러스트 - 빈 폴더]            │
│                                            │
│          검색 결과가 없습니다                │
│       다른 키워드로 검색해보세요              │
│                                            │
│         [필터 초기화]  [스터디 만들기]       │
│                                            │
│                                            │
└────────────────────────────────────────────┘
```

---

## ? 반응형 설계

### Desktop (1920px - FHD)
```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr 280px;
  gap: 20px;
  max-width: 1920px;
  padding: 0 20px;
}

.study-grid {
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

### Desktop Small (1440px)
```css
.layout {
  grid-template-columns: 200px 1fr 260px;
  gap: 16px;
}

.study-grid {
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

### Tablet (1024px)
```css
.layout {
  grid-template-columns: 60px 1fr 240px;
  gap: 12px;
}

.study-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* 네비게이션 축소 (아이콘만) */
```

### Mobile (<768px)
```css
.layout {
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}

.study-grid {
  grid-template-columns: 1fr;
  gap: 12px;
}

/* 우측 위젯 하단으로 이동 */
.widgets {
  order: 3;
  margin-top: 24px;
}
```

---

## ? SEO 최적화

### 메타 태그

```html
<head>
  <title>스터디 탐색 - CoUp | 함께 성장하는 학습 커뮤니티</title>
  <meta name="description" content="다양한 분야의 스터디를 찾아보세요. 프로그래밍, 취업준비, 어학 등 1,000개 이상의 활성 스터디가 기다립니다." />
  <meta property="og:title" content="스터디 탐색 - CoUp" />
  <meta property="og:description" content="함께 성장하는 스터디를 찾아보세요" />
  <meta property="og:type" content="website" />
  <meta name="keywords" content="스터디, 스터디그룹, 온라인스터디, 알고리즘, 취업준비" />
</head>
```

### 구조화된 데이터 (Schema.org)

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "Course",
      "name": "알고리즘 마스터 스터디",
      "description": "매일 아침 알고리즘 문제를 풀고...",
      "provider": {
        "@type": "Organization",
        "name": "CoUp"
      }
    }
  ]
}
```

---

## ? 구현 체크리스트

### Phase 1: UI 레이아웃
- [ ] 3컬럼 레이아웃 (Nav 12% + Content 58% + Widget 30%)
- [ ] 스터디 카드 그리드 (3컬럼)
- [ ] 우측 위젯 영역 (고정 280px)
- [ ] 페이지 헤더

### Phase 2: 필터 및 검색
- [ ] 카테고리 필터 (메인 + 서브)
- [ ] 정렬 옵션
- [ ] 검색 입력 (디바운스)
- [ ] URL 쿼리 파라미터 처리

### Phase 3: 스터디 카드
- [ ] 카드 컴포넌트
- [ ] Hover 애니메이션
- [ ] [가입하기] 버튼
- [ ] 상태별 버튼 (정원 마감, 비공개)

### Phase 4: 우측 위젯
- [ ] 인기 카테고리
- [ ] 추천 스터디
- [ ] 스터디 생성 팁
- [ ] 플랫폼 통계

### Phase 5: 상태 관리
- [ ] SSR 데이터 페칭
- [ ] 로딩 스켈레톤
- [ ] 빈 상태 UI
- [ ] 에러 처리

### Phase 6: 최적화
- [ ] 이미지 최적화 (Next.js Image)
- [ ] SEO 메타 태그
- [ ] 반응형 테스트
- [ ] 성능 측정

---

## ? 사용자 경험 최적화 포인트

1. **빠른 탐색**: 필터와 검색이 상단에 항상 고정
2. **명확한 정보**: 카드에 핵심 정보만 표시 (이모지, 이름, 멤버 수)
3. **즉시 액션**: [가입하기] 버튼이 카드마다 바로 노출
4. **컨텍스트 유지**: 우측 위젯으로 관련 정보 제공
5. **부드러운 전환**: Hover, 클릭 시 시각적 피드백
6. **공간 활용**: 좌우 여백 최소화, 콘텐츠 최대화

---

**다음 화면**: `02_study-create.md` (스터디 생성)

