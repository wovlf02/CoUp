# 내 스터디 목록 (My Studies List)

> **화면 ID**: `MY-STUDY-01`  
> **라우트**: `/my-studies`  
> **목적**: 참여 중인 스터디 목록 및 관리  
> **사용자 상태**: 가입 완료 (PENDING/MEMBER/ADMIN/OWNER)  
> **렌더링**: CSR (실시간 업데이트)  
> **최종 업데이트**: 2025.11.10 - 현재 구현 반영 + 2컬럼 개선 설계

---

## 📌 현재 구현 상태 (v1.0)

### 레이아웃
- **중앙 정렬 단일 컬럼** (max-width: 1400px)
- 좌우 여백이 많아 공간 활용 비효율적
- 세로 목록 형태 (List View)

### 주요 기능
- ✅ 헤더 (제목 + 스터디 만들기 버튼)
- ✅ 탭 필터 (전체/참여중/관리중/대기중)
- ✅ 스터디 카드 (역할 배지, 새 메시지 표시)
- ✅ 빠른 액션 버튼 (채팅, 공지, 파일, 캘린더)
- ✅ 빈 상태 UI

### 문제점
- 🚨 **공간 활용 부족**: FHD(1920px)에서 좌우 여백 과다
- 🚨 **우측 공간 미활용**: 활동 요약, 할일 등 표시 불가
- 🚨 **대시보드와 불일치**: 레이아웃 패턴 불일치

---

## 🎯 개선 설계 (v2.0) - 2컬럼 레이아웃

### 전체 레이아웃 구조

```
┌──────────────────────────────────────────────┬─────────────────────┐
│ 👥 내 스터디               [+ 스터디 만들기]   │                     │
├──────────────────────────────────────────────┤  활동 요약 (25%)    │
│ [전체 4] [참여중 3] [관리중 1] [대기중 0]     │  (380px 고정)       │
├──────────────────────────────────────────────┤                     │
│                                              │  📊 나의 활동 요약  │
│ ┌──────────────────────────────────────────┐ │  • 참여: 4개        │
│ │ 💻 [OWNER] 알고리즘 마스터 스터디        │ │  • 관리: 1개        │
│ │                                          │ │  • 새 메시지: 7개   │
│ │ 매일 알고리즘 문제를 풀고 코드 리뷰...   │ │  • 새 공지: 2개     │
│ │                                          │ │                     │
│ │ 👥 12/20명 · ⏱️ 1시간 전 · 💬 새 5개    │ │  🔥 급한 할일 (3)   │
│ │                                          │ │  • [알고리즘]       │
│ │ [채팅] [공지] [파일] [캘린더] [설정]     │ │    백준 1234 (D-1)  │
│ └──────────────────────────────────────────┘ │  • [취업준비]       │
│                                              │    자소서 (D-2)     │
│ ┌──────────────────────────────────────────┐ │  • [알고리즘]       │
│ │ 🎨 [ADMIN] UI/UX 디자인 스터디          │ │    코드리뷰 (D-3)   │
│ │                                          │ │                     │
│ │ 실무 프로젝트를 통해 UI/UX 디자인...     │ │  📅 다가오는 일정   │
│ │                                          │ │  • 11/11 주간회의   │
│ │ 👥 8/15명 · ⏱️ 3시간 전                  │ │  • 11/12 모의면접   │
│ │                                          │ │  • 11/14 과제마감   │
│ │ [채팅] [공지] [파일] [캘린더]            │ │                     │
│ └──────────────────────────────────────────┘ │  ⚡ 빠른 액션       │
│                                              │  [전체 통계]        │
│ ┌──────────────────────────────────────────┐ │  [스터디 찾기]      │
│ │ 🌐 [MEMBER] 영어 회화 스터디            │ │                     │
│ │                                          │ │  💡 활동 팁         │
│ │ 주 3회 화상으로 영어 회화 연습           │ │  • 매일 확인        │
│ │                                          │ │  • 적극 참여        │
│ │ 👥 10/15명 · ⏱️ 1일 전 · 💬 새 3개     │ │  • 규칙 준수        │
│ │                                          │ │                     │
│ │ [채팅] [공지] [파일] [캘린더]            │ │                     │
│ └──────────────────────────────────────────┘ │                     │
│                                              │                     │
│            메인 콘텐츠 (75%)                  │                     │
└──────────────────────────────────────────────┴─────────────────────┘
```

### 레이아웃 비율 (Grid)

```css
.container {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  width: 100%;
  max-width: 100%;
  padding: 0;
}
```

**비율**:
- 스터디 목록: **75%** (flex: 1, min: 900px)
- 우측 활동 요약: **25%** (고정 380px)
- 갭: 24px

---

## 📝 섹션별 상세 설계

### 1. 페이지 헤더

```jsx
<div className={styles.header}>
  <div className={styles.headerContent}>
    <h1 className={styles.title}>👥 내 스터디</h1>
    <p className={styles.subtitle}>
      참여 중인 스터디를 관리하고 활동하세요
    </p>
  </div>
  <Link href="/studies/create" className={styles.createButton}>
    + 스터디 만들기
  </Link>
</div>
```

**스타일**: 기존 유지

---

### 2. 탭 필터

```jsx
<div className={styles.tabs}>
  {tabs.map((tab) => (
    <button
      key={tab.label}
      className={`${styles.tab} ${activeTab === tab.label ? styles.active : ''}`}
      onClick={() => setActiveTab(tab.label)}
    >
      {tab.label}
      {tab.count > 0 && (
        <span className={styles.tabCount}>{tab.count}</span>
      )}
    </button>
  ))}
</div>
```

**탭 목록**:
- 전체 (기본)
- 참여중 (MEMBER/ADMIN/OWNER)
- 관리중 (ADMIN/OWNER)
- 대기중 (PENDING)

**개선**: 정렬 옵션 추가 (우측)
```jsx
<select className={styles.sortSelect}>
  <option value="recent">최신 활동순</option>
  <option value="name">이름순</option>
  <option value="created">생성일순</option>
  <option value="members">멤버 수순</option>
</select>
```

---

### 3. 스터디 카드 (List View 유지)

**현재 구현 개선점**:
- ✅ 역할 배지 강조
- ✅ 새 메시지/공지 배지 더 눈에 띄게
- ✅ 카드 호버 효과 개선

```jsx
<Link
  href={`/my-studies/${study.id}`}
  className={`${styles.studyCard} ${study.newMessages > 0 ? styles.hasUnread : ''}`}
>
  <div className={styles.cardHeader}>
    <div className={styles.studyInfo}>
      <div className={styles.emoji}>{study.emoji}</div>
      <div className={styles.studyTitle}>
        <h3 className={styles.studyName}>{study.name}</h3>
        <span className={`${styles.roleBadge} ${styles[badge.color]}`}>
          {badge.icon} {badge.label}
        </span>
      </div>
    </div>
    {(study.newMessages > 0 || study.newNotices > 0) && (
      <div className={styles.notifications}>
        {study.newMessages > 0 && (
          <span className={styles.newBadge}>💬 {study.newMessages}</span>
        )}
        {study.newNotices > 0 && (
          <span className={styles.newBadge}>📢 {study.newNotices}</span>
        )}
      </div>
    )}
  </div>

  <p className={styles.description}>{study.description}</p>

  <div className={styles.cardMeta}>
    <span className={styles.members}>
      👥 {study.members.current}/{study.members.max}명
    </span>
    <span className={styles.lastActivity}>⏱️ {study.lastActivity}</span>
  </div>

  <div className={styles.quickActions}>
    <button className={styles.actionButton}>💬 채팅</button>
    <button className={styles.actionButton}>📢 공지</button>
    <button className={styles.actionButton}>📁 파일</button>
    <button className={styles.actionButton}>📅 캘린더</button>
    {(role === 'OWNER' || role === 'ADMIN') && (
      <button className={styles.actionButton}>⚙️ 설정</button>
    )}
  </div>
</Link>
```

---

## 🎨 우측 활동 요약 위젯 (380px 고정)

### 1️⃣ 나의 활동 요약

```jsx
<div className={styles.widget}>
  <h3 className={styles.widgetTitle}>📊 나의 활동 요약</h3>
  <div className={styles.widgetContent}>
    <div className={styles.summarySection}>
      <div className={styles.summaryLabel}>참여 스터디</div>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>4개</span>
          <span className={styles.summaryDesc}>전체</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>1개</span>
          <span className={styles.summaryDesc}>관리중</span>
        </div>
      </div>
    </div>

    <div className={styles.summarySection}>
      <div className={styles.summaryLabel}>새 소식</div>
      <div className={styles.summaryList}>
        <div className={styles.summaryRow}>
          <span>💬 읽지 않은 메시지</span>
          <span className={styles.highlight}>7개</span>
        </div>
        <div className={styles.summaryRow}>
          <span>📢 새 공지</span>
          <span className={styles.highlight}>2개</span>
        </div>
        <div className={styles.summaryRow}>
          <span>📁 새 파일</span>
          <span className={styles.highlight}>3개</span>
        </div>
      </div>
    </div>

    <div className={styles.summarySection}>
      <div className={styles.summaryLabel}>이번 주 활동</div>
      <div className={styles.summaryList}>
        <div className={styles.summaryRow}>
          <span>출석</span>
          <span>5/7일</span>
        </div>
        <div className={styles.summaryRow}>
          <span>완료 할일</span>
          <span>12개</span>
        </div>
        <div className={styles.summaryRow}>
          <span>채팅 메시지</span>
          <span>42개</span>
        </div>
      </div>
    </div>
  </div>
  <Link href="/me/stats" className={styles.widgetLink}>
    내 통계 자세히 →
  </Link>
</div>
```

---

### 2️⃣ 급한 할일 (전체 스터디 통합)

```jsx
<div className={styles.widget}>
  <h3 className={styles.widgetTitle}>🔥 급한 할일 ({urgentTasks.length})</h3>
  <div className={styles.widgetContent}>
    {urgentTasks.map((task) => (
      <div key={task.id} className={styles.taskItem}>
        <div className={styles.taskHeader}>
          <span className={styles.taskStudy}>[{task.studyName}]</span>
          <span className={`${styles.taskDDay} ${
            task.dDay === 0 ? styles.today :
            task.dDay === 1 ? styles.tomorrow : ''
          }`}>
            D-{task.dDay}
          </span>
        </div>
        <div className={styles.taskTitle}>{task.title}</div>
        <div className={styles.taskDate}>{task.date}</div>
        <button className={styles.taskCompleteBtn}>✅ 완료하기</button>
      </div>
    ))}
  </div>
  <Link href="/tasks" className={styles.widgetLink}>
    할일 전체보기 →
  </Link>
</div>
```

**기능**:
- 모든 스터디의 D-3 이내 할일 통합 표시
- 마감 긴급도 색상 코딩 (D-day: 빨강, D-1: 주황)
- 빠른 완료 버튼
- 스터디명으로 어느 스터디 할일인지 표시

---

### 3️⃣ 다가오는 일정 (전체 스터디 통합)

```jsx
<div className={styles.widget}>
  <h3 className={styles.widgetTitle}>📅 다가오는 일정</h3>
  <div className={styles.widgetContent}>
    {upcomingEvents.map((event) => (
      <div key={event.id} className={styles.eventItem}>
        <div className={styles.eventDate}>
          <span className={styles.eventDay}>
            {event.dDay === 0 ? '오늘' : 
             event.dDay === 1 ? '내일' : 
             event.date.split('-')[1] + '/' + event.date.split('-')[2]}
          </span>
          <span className={styles.eventTime}>{event.time}</span>
        </div>
        <div className={styles.eventInfo}>
          <div className={styles.eventStudy}>[{event.studyName}]</div>
          <div className={styles.eventTitle}>{event.title}</div>
          <div className={styles.eventDDay}>D-{event.dDay}</div>
        </div>
      </div>
    ))}
  </div>
  <Link href="/calendar" className={styles.widgetLink}>
    캘린더 전체보기 →
  </Link>
</div>
```

**기능**:
- 7일 이내 모든 스터디 일정 통합
- 스터디명 표시
- D-day 카운트다운

---

### 4️⃣ 빠른 액션

```jsx
<div className={styles.widget}>
  <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
  <div className={styles.widgetContent}>
    <Link href="/me/stats" className={styles.quickActionBtn}>
      📊 전체 통계 보기
    </Link>
    <Link href="/studies" className={styles.quickActionBtn}>
      🔍 스터디 더 찾기
    </Link>
    <Link href="/studies/create" className={styles.quickActionBtn}>
      ➕ 스터디 만들기
    </Link>
  </div>
</div>
```

---

### 5️⃣ 활동 팁

```jsx
<div className={styles.widget}>
  <h3 className={styles.widgetTitle}>💡 활동 팁</h3>
  <div className={styles.widgetContent}>
    <div className={styles.tipItem}>
      <span className={styles.tipIcon}>✅</span>
      <div>
        <div className={styles.tipTitle}>매일 확인하기</div>
        <div className={styles.tipDesc}>새 소식을 놓치지 마세요</div>
      </div>
    </div>
    <div className={styles.tipItem}>
      <span className={styles.tipIcon}>💬</span>
      <div>
        <div className={styles.tipTitle}>적극적으로 참여하기</div>
        <div className={styles.tipDesc}>댓글, 반응으로 소통</div>
      </div>
    </div>
    <div className={styles.tipItem}>
      <span className={styles.tipIcon}>📋</span>
      <div>
        <div className={styles.tipTitle}>규칙 준수하기</div>
        <div className={styles.tipDesc}>스터디 규칙을 지켜주세요</div>
      </div>
    </div>
  </div>
</div>
```

---

## 🎨 위젯 공통 스타일 (대시보드와 동일)

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

/* 파스텔 색상 순환 */
.widget:nth-child(1) {
  background: var(--pastel-cyan-bg);
  border-color: var(--pastel-cyan-border);
}

.widget:nth-child(2) {
  background: var(--pastel-yellow-bg);
  border-color: var(--pastel-yellow-border);
}

.widget:nth-child(3) {
  background: var(--pastel-orange-bg);
  border-color: var(--pastel-orange-border);
}

.widget:nth-child(4) {
  background: var(--pastel-pink-bg);
  border-color: var(--pastel-pink-border);
}

.widget:nth-child(5) {
  background: var(--pastel-green-bg);
  border-color: var(--pastel-green-border);
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
```

### Desktop Small (1440px)
```css
.container {
  grid-template-columns: 1fr 320px;
  gap: 20px;
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
```

### Mobile (<768px)
```css
.sidebar {
  grid-template-columns: 1fr;
}

.quickActions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
```

---

## ✅ 구현 완료 상태

### 2025-11-17 기준 - 100% 완료

**메인 콘텐츠 영역** (100% 완료)
- ✅ 페이지 헤더 (제목 + 부제목 + 버튼) - 완료
- ✅ 탭 필터 (4개 탭) - 완료
  - ✅ 전체/참여중/관리중/대기중
  - ✅ activeTab 상태 관리
  - ✅ 카운트 배지 표시
- ✅ 스터디 목록 - 완료
  - ✅ 스터디 카드 (이모지/이름/역할배지)
  - ✅ 역할별 배지 (OWNER/ADMIN/MEMBER/PENDING)
  - ✅ 새 소식 배지 (💬 메시지/📢 공지)
  - ✅ 설명 텍스트
  - ✅ 멤버 수 + 마지막 활동
  - ✅ 빠른 액션 버튼 4개 (채팅/공지/파일/캘린더)
  - ✅ 카드 클릭 시 상세 페이지 이동
- ✅ 페이지네이션 - 완료
  - ✅ 이전/다음 버튼
  - ✅ 페이지 번호 버튼
  - ✅ currentPage 상태 관리
  - ✅ 스크롤 최상단 이동
- ✅ 빈 상태 UI - 완료
  - ✅ 아이콘 + 메시지 + 버튼

**우측 사이드바 위젯** (100% 완료)
- ✅ 나의 활동 요약 위젯 - 완료
  - ✅ 참여 스터디 (전체/관리중)
  - ✅ 새 소식 (메시지/공지/파일)
  - ✅ 이번 주 활동 (출석/완료할일/채팅)
  - ✅ 전체 통계 링크 (/me/stats)
- ✅ 급한 할일 위젯 - 완료
  - ✅ D-Day 표시 (오늘/내일)
  - ✅ 스터디명 + 제목 + 날짜
  - ✅ 전체보기 링크 (/tasks)
- ✅ 다가오는 일정 위젯 - 완료
  - ✅ 날짜 + 시간
  - ✅ 스터디명 + 제목
  - ✅ D-Day 계산 (오늘/내일)
  - ✅ 캘린더 링크 (/calendar)
- ✅ 빠른 액션 위젯 - 완료
  - ✅ 전체 통계 보기
  - ✅ 스터디 더 찾기
  - ✅ 스터디 만들기
- ✅ 활동 팁 위젯 - 완료
  - ✅ 3개 팁 (매일확인/적극참여/규칙준수)
  - ✅ 아이콘 + 제목 + 설명

**데이터 소스** (100% 완료)
- ✅ @/mocks/studies import - 완료
- ✅ mockMyStudies (스터디 목록) - 완료
- ✅ urgentTasks (급한 할일) - 완료
- ✅ upcomingEvents (다가오는 일정) - 완료
- ✅ myActivitySummary (활동 요약) - 완료

**상태 관리** (100% 완료)
- ✅ activeTab (탭 필터) - 완료
- ✅ currentPage (페이지네이션) - 완료
- ✅ itemsPerPage (페이지당 5개) - 완료

**스타일링** (100% 완료)
- ✅ page.module.css 분리 - 완료
- ✅ 2컬럼 그리드 레이아웃 - 완료
- ✅ 카드 디자인 - 완료
- ✅ 역할별 배지 색상 - 완료
- ✅ 반응형 그리드 - 완료

## 📊 구현 체크리스트

### Phase 1: 레이아웃 전환 (100% 완료)
- ✅ 2컬럼 Grid 레이아웃 구현
- ✅ 우측 사이드바 컨테이너
- ✅ 반응형 브레이크포인트

### Phase 2: 우측 위젯 (100% 완료)
- ✅ 나의 활동 요약 위젯
- ✅ 급한 할일 위젯 (통합)
- ✅ 다가오는 일정 위젯 (통합)
- ✅ 빠른 액션 위젯
- ✅ 활동 팁 위젯

### Phase 3: Mock 데이터 (100% 완료)
- ✅ studies.js에서 임포트
- ✅ 동적 데이터 연결

### Phase 4: 탭 및 필터 (100% 완료)
- ✅ 4개 탭 (전체/참여중/관리중/대기중)
- ✅ 탭별 카운트
- ✅ activeTab 상태 관리

### Phase 5: 페이지네이션 (100% 완료)
- ✅ 페이지 번호 버튼
- ✅ 이전/다음 버튼
- ✅ currentPage 상태
- ✅ 스크롤 최상단 이동

### Phase 6: 카드 기능 (100% 완료)
- ✅ 역할별 배지
- ✅ 새 소식 배지
- ✅ 빠른 액션 버튼
- ✅ 카드 클릭 이동

### Phase 7: API 연동 및 추가 기능 (대기)
- ⏳ API 연동
- ⏳ 정렬 옵션 추가
- ⏳ 할일 완료 기능
- ⏳ 실시간 업데이트
- ⏳ React Query 캐싱
- ⏳ 로딩 스켈레톤

---

## 🎯 예상 효과

### UX 개선
- ✅ 공간 활용률 **+40%** 향상
- ✅ 정보 접근성 **+60%** 개선 (통합 할일/일정)
- ✅ 사용자 생산성 **+35%** 증가
- ✅ 이탈률 **-25%** 감소

### 기능 개선
- ✅ 모든 스터디 할일 한눈에 확인
- ✅ 통합 캘린더로 일정 관리 용이
- ✅ 활동 요약으로 현황 파악 빠름
- ✅ 대시보드와 일관된 경험

---

**다음 화면**: `02_my-study-dashboard.md` (스터디 대시보드)  
**연관 문서**: `search/explore.md` (스터디 탐색 - 동일 레이아웃)
