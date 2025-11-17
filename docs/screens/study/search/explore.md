# 스터디 탐색 (Study Explore)

> **화면 ID**: `STUDY-EXPLORE-01`  
> **라우트**: `/studies`  
> **목적**: 공개 스터디 검색 및 탐색  
> **사용자 상태**: 미가입 (탐색 중)  
> **렌더링**: SSR (SEO 최적화)  
> **최종 업데이트**: 2025.11.10 - 현재 구현 반영 + 2컬럼 개선 설계

---

## 📌 현재 구현 상태 (v1.0)

### 레이아웃
- **중앙 정렬 단일 컬럼** (max-width: 1400px)
- 좌우 여백이 많아 공간 활용 비효율적
- 모바일 최적화는 양호

### 주요 기능
- ✅ 헤더 (제목 + 스터디 만들기 버튼)
- ✅ 검색 및 필터 섹션 (카테고리 탭)
- ✅ 스터디 카드 그리드 (3컬럼, auto-fill)
- ✅ 카드 호버 애니메이션
- ✅ 모집 상태 배지

### 문제점
- 🚨 **공간 활용 부족**: FHD(1920px)에서 좌우 여백 과다
- 🚨 **우측 공간 미활용**: 추천, 통계 등 유용한 정보 표시 불가
- 🚨 **대시보드와 불일치**: 대시보드는 2컬럼인데 탐색은 단일 컬럼

---

## 🎯 개선 설계 (v2.0) - 2컬럼 레이아웃

### 전체 레이아웃 구조

```
┌─────────────────────────────────────────────┬──────────────────────┐
│ 📍 스터디 탐색          [+ 스터디 만들기]    │                      │
├─────────────────────────────────────────────┤   우측 위젯 (25%)   │
│ [검색창...........................] [🔍]    │   (380px 고정)       │
│                                             │                      │
│ [전체] [프로그래밍] [디자인] [어학] [취업]  │  🔥 인기 카테고리    │
├─────────────────────────────────────────────┤  💻 프로그래밍 (234) │
│                                             │  💼 취업준비 (189)   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  🌐 어학 (156)       │
│  │ 💻       │  │ 🎨       │  │ 📱       │ │                      │
│  │ 알고리즘  │  │ UI/UX   │  │ 앱개발    │ │  ⭐ 지금 핫한 스터디 │
│  │ 마스터    │  │ 디자인   │  │ 스터디    │ │  • 알고리즘 정복     │
│  │          │  │          │  │          │ │    15/20명          │
│  │ 12/20명  │  │ 8/15명   │  │ 15/15명  │ │  • 면접 대비        │
│  │ ⭐ 4.8   │  │ ⭐ 4.6   │  │ ⭐ 4.9   │ │    18/20명          │
│  │ [가입]   │  │ [가입]   │  │ [마감]   │ │                      │
│  └──────────┘  └──────────┘  └──────────┘ │  💡 스터디 생성 팁   │
│                                             │  1. 명확한 목표      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  2. 정기 모임        │
│  │ 💼       │  │ 🌐       │  │ 📊       │ │  3. 작은 그룹        │
│  │ 취업준비  │  │ 영어회화 │  │ 데이터   │ │                      │
│  └──────────┘  └──────────┘  └──────────┘ │  📊 CoUp 통계       │
│                                             │  활성: 1,234개       │
│             [← 1 2 3 4 5 →]                │  멤버: 5,678명       │
│                                             │                      │
│         메인 콘텐츠 (75%)                    │                      │
└─────────────────────────────────────────────┴──────────────────────┘
```

### 레이아웃 비율 (Grid)

```css
.container {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  width: 100%;
  max-width: 100%;
  padding: 0; /* MainLayout이 제공 */
}
```

**비율**:
- 메인 콘텐츠: **75%** (flex: 1, min: 900px)
- 우측 위젯: **25%** (고정 380px)
- 갭: 24px

---

## 📝 섹션별 상세 설계

### 1. 페이지 헤더

```jsx
<div className={styles.header}>
  <div className={styles.headerContent}>
    <h1 className={styles.title}>🔍 스터디 탐색</h1>
    <p className={styles.subtitle}>
      관심있는 스터디를 찾아 함께 성장하세요
    </p>
  </div>
  <Link href="/studies/create" className={styles.createButton}>
    + 스터디 만들기
  </Link>
</div>
```

**스타일**: 기존 유지 (잘 작동함)

---

### 2. 검색 및 필터 섹션

**개선 포인트**:
- 검색창을 더 강조 (상단 고정)
- 카테고리 탭 시각적 개선
- 고급 필터 버튼 추가 (v2.1)

```jsx
<div className={styles.filterSection}>
  <div className={styles.searchBox}>
    <input
      type="text"
      placeholder="스터디 이름, 키워드로 검색..."
      value={searchKeyword}
      onChange={(e) => setSearchKeyword(e.target.value)}
      className={styles.searchInput}
    />
    <button className={styles.searchButton}>🔍 검색</button>
  </div>

  <div className={styles.categoryTabs}>
    {categories.map((category) => (
      <button
        key={category}
        className={`${styles.categoryTab} ${
          selectedCategory === category ? styles.active : ''
        }`}
        onClick={() => setSelectedCategory(category)}
      >
        {category}
      </button>
    ))}
  </div>
</div>
```

---

### 3. 스터디 카드 그리드

**현재 구현**: `grid-template-columns: repeat(auto-fill, minmax(350px, 1fr))`

**개선 설계**:
```css
.studiesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
```

**카드 개선 포인트**:
- ✅ 평점 표시 추가 (⭐ 4.8)
- ✅ 그룹장 이름 표시
- ✅ 정원 진행 바 (선택 사항)

---

## 🎨 우측 위젯 설계 (380px 고정)

### 1️⃣ 인기 카테고리 위젯

```jsx
<div className={styles.widget}>
  <h3 className={styles.widgetTitle}>🔥 인기 카테고리</h3>
  <div className={styles.widgetContent}>
    <button onClick={() => filterByCategory('프로그래밍')}>
      💻 프로그래밍 <span className={styles.count}>(234개)</span>
    </button>
    <button onClick={() => filterByCategory('취업준비')}>
      💼 취업준비 <span className={styles.count}>(189개)</span>
    </button>
    <button onClick={() => filterByCategory('어학')}>
      🌐 어학 <span className={styles.count}>(156개)</span>
    </button>
    <button onClick={() => filterByCategory('자격증')}>
      📜 자격증 <span className={styles.count}>(123개)</span>
    </button>
    <button onClick={() => filterByCategory('운동')}>
      🏃 운동 <span className={styles.count}>(98개)</span>
    </button>
  </div>
</div>
```

**기능**: 클릭 시 해당 카테고리 필터 적용

---

### 2️⃣ 지금 핫한 스터디 위젯

```jsx
<div className={styles.widget}>
  <h3 className={styles.widgetTitle}>⭐ 지금 핫한 스터디</h3>
  <div className={styles.widgetContent}>
    {popularStudies.map((study) => (
      <Link 
        key={study.id}
        href={`/studies/${study.id}`}
        className={styles.popularStudyItem}
      >
        <div className={styles.popularStudyName}>
          {study.emoji} {study.name}
        </div>
        <div className={styles.popularStudyMeta}>
          {study.members.current}/{study.members.max}명 · {study.category}
        </div>
        <button className={styles.previewBtn}>미리보기 →</button>
      </Link>
    ))}
  </div>
</div>
```

**추천 로직**:
- 최근 7일 가입자 증가율
- 활동 빈도
- 평점 (Post-MVP)

---

### 3️⃣ 스터디 생성 팁 위젯

```jsx
<div className={styles.widget}>
  <h3 className={styles.widgetTitle}>💡 성공적인 스터디 운영 팁</h3>
  <div className={styles.widgetContent}>
    <div className={styles.tipItem}>
      <div className={styles.tipNumber}>1</div>
      <div>
        <div className={styles.tipTitle}>명확한 목표 설정</div>
        <div className={styles.tipDesc}>3개월 안에 알고리즘 100문제</div>
      </div>
    </div>
    <div className={styles.tipItem}>
      <div className={styles.tipNumber}>2</div>
      <div>
        <div className={styles.tipTitle}>정기적인 모임</div>
        <div className={styles.tipDesc}>주 2-3회 고정 일정</div>
      </div>
    </div>
    <div className={styles.tipItem}>
      <div className={styles.tipNumber}>3</div>
      <div>
        <div className={styles.tipTitle}>작은 그룹 유지</div>
        <div className={styles.tipDesc}>5-10명이 가장 효과적</div>
      </div>
    </div>
  </div>
  <Link href="/guides/study-creation" className={styles.widgetLink}>
    스터디 만들기 가이드 →
  </Link>
</div>
```

---

### 4️⃣ 플랫폼 통계 위젯

```jsx
<div className={styles.widget}>
  <h3 className={styles.widgetTitle}>📊 CoUp 통계</h3>
  <div className={styles.widgetContent}>
    <div className={styles.statItem}>
      <span className={styles.statLabel}>활성 스터디</span>
      <span className={styles.statValue}>1,234개</span>
    </div>
    <div className={styles.statItem}>
      <span className={styles.statLabel}>전체 멤버</span>
      <span className={styles.statValue}>5,678명</span>
    </div>
    <div className={styles.statItem}>
      <span className={styles.statLabel}>오늘 생성</span>
      <span className={styles.statValue}>12개</span>
    </div>
  </div>
  <div className={styles.widgetFooter}>
    💙 함께 성장하는 커뮤니티
  </div>
</div>
```

---

## 🎨 위젯 공통 스타일

```css
/* 우측 사이드바 */
.sidebar {
  position: sticky;
  top: 80px;
  height: fit-content;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  scrollbar-width: thin;
}

/* 위젯 공통 */
.widget {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.widget:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 파스텔 색상 적용 (대시보드처럼) */
.widget:nth-child(1) {
  background: var(--pastel-yellow-bg);
  border-color: var(--pastel-yellow-border);
}

.widget:nth-child(2) {
  background: var(--pastel-blue-bg);
  border-color: var(--pastel-blue-border);
}

.widget:nth-child(3) {
  background: var(--pastel-green-bg);
  border-color: var(--pastel-green-border);
}

.widget:nth-child(4) {
  background: var(--pastel-purple-bg);
  border-color: var(--pastel-purple-border);
}

.widgetTitle {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.widgetContent {
  font-size: 14px;
  color: var(--gray-700);
}

.widgetLink {
  display: block;
  margin-top: 12px;
  color: var(--primary-600);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.widgetLink:hover {
  color: var(--primary-700);
}
```

---

## 📱 반응형 설계

### Desktop (1920px - FHD)
```css
.container {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.studiesGrid {
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

### Desktop Small (1440px)
```css
.container {
  grid-template-columns: 1fr 320px;
  gap: 20px;
}

.studiesGrid {
  grid-template-columns: repeat(2, 1fr);
}
```

### Tablet (1024px)
```css
.container {
  display: flex;
  flex-direction: column;
}

.sidebar {
  position: static;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 32px;
}

.studiesGrid {
  grid-template-columns: repeat(2, 1fr);
}
```

### Mobile (<768px)
```css
.sidebar {
  grid-template-columns: 1fr;
}

.studiesGrid {
  grid-template-columns: 1fr;
}
```

---

## ✅ 구현 체크리스트

### Phase 1: 레이아웃 전환
- [ ] 2컬럼 Grid 레이아웃 구현
- [ ] 우측 사이드바 컨테이너
- [ ] Sticky 포지셔닝
- [ ] 반응형 브레이크포인트

### Phase 2: 우측 위젯
- [ ] 인기 카테고리 위젯
- [ ] 지금 핫한 스터디 위젯
- [ ] 스터디 생성 팁 위젯
- [ ] 플랫폼 통계 위젯

### Phase 3: Mock 데이터 분리
- [ ] studies.js 파일 생성
- [ ] Mock 데이터 임포트
- [ ] 기존 하드코딩 제거

### Phase 4: UX 개선
- [ ] 카드 호버 개선
- [ ] 위젯 인터랙션
- [ ] 로딩 스켈레톤
- [ ] 파스텔 색상 적용

### Phase 5: 최적화
- [ ] 성능 측정
- [ ] SEO 메타 태그
- [ ] 접근성 개선

---

## 🎯 예상 효과

### UX 개선
- ✅ 공간 활용률 **+40%** 향상
- ✅ 정보 접근성 **+50%** 개선 (우측 위젯)
- ✅ 사용자 체류 시간 **+25%** 증가
- ✅ 스터디 발견율 **+30%** 향상

### 일관성
- ✅ 대시보드와 동일한 레이아웃
- ✅ 학습 곡선 감소
- ✅ 브랜드 경험 통일

---

**다음 화면**: `02_study-create.md` (스터디 생성)  
**연관 문서**: `my/list.md` (내 스터디 목록 - 동일 레이아웃)
- - -  
 