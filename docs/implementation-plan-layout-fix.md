# 스터디 상세 페이지 레이아웃 개선 구현 계획

## 📋 문제 정의
- **현상**: 캘린더, 채팅, 공지 등 모든 탭에서 좌우 여백이 과도하게 발생
- **원인**: 
  1. 컨테이너 `max-width: 1440px` 제한
  2. 콘텐츠가 중앙 정렬되어 있어 실제 활용 너비가 좁음
  3. 사이드바 없이 전체 너비를 활용하지 못함

## 🎯 해결 방안 (문서 기반)

### 방안 1: 탭별 레이아웃 차별화
```
2컬럼 레이아웃 (메인 70% + 사이드바 30%):
- ✅ 개요
- ✅ 공지  
- ✅ 캘린더
- ✅ 할일

전체 너비 레이아웃:
- ✅ 채팅
- ✅ 파일
- ✅ 설정
```

### 방안 2: 컨테이너 최대 너비 확장
```css
/* 기존 */
.container {
  max-width: 1440px;
}

/* 개선 */
.withSidebar {
  max-width: 1400px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.fullWidth {
  max-width: 1400px;
}
```

### 방안 3: 반응형 최적화
```css
/* Desktop (1280px+) */
.withSidebar {
  grid-template-columns: 1fr 320px;
}

/* Tablet (768-1279px) */
.withSidebar {
  grid-template-columns: 1fr 280px;
}

/* Mobile (<768px) */
.withSidebar {
  grid-template-columns: 1fr;
}
```

## 📐 구현 단계

### Phase 1: 기본 레이아웃 구조
1. `studies/[studyId]/layout.jsx` 생성
2. 탭별 사이드바 표시 로직 구현
3. CSS Grid 레이아웃 적용

### Phase 2: 개별 탭 CSS 수정
1. **캘린더** (`calendar.module.css`)
   - `.calendarContainer`: `max-width: 1400px` + `margin: 0 auto`
   
2. **채팅** (`chat.module.css`)
   - `.chatContainer`: `max-width: 1200px` + `margin: 0 auto`
   
3. **공지** (`notices.module.css`)
   - `.noticesContainer`: `max-width: 1400px` + `margin: 0 auto`
   
4. **파일** (`files.module.css`)
   - `.filesContainer`: `max-width: 1400px` + `margin: 0 auto`
   
5. **할일** (`tasks.module.css`)
   - `.tasksContainer`: `max-width: 1400px` + `margin: 0 auto`

### Phase 3: 사이드바 컴포넌트 생성 (향후)
```
/components/study/sidebar/
  ├─ StudySidebar.jsx
  ├─ StatsWidget.jsx
  ├─ MembersWidget.jsx
  ├─ QuickAccessWidget.jsx
  └─ InfoWidget.jsx
```

## 🎨 CSS 변경 사항

### 1. 공통 스터디 레이아웃 스타일
```css
/* study-layout.module.css (신규) */
.studyContainer {
  width: 100%;
}

.withSidebar {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.fullWidth {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.mainContent {
  min-width: 0; /* Grid overflow 방지 */
}

.sidebar {
  position: sticky;
  top: 80px;
  height: fit-content;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

@media (max-width: 1279px) {
  .withSidebar {
    grid-template-columns: 1fr 280px;
    gap: 20px;
  }
}

@media (max-width: 767px) {
  .withSidebar {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: static;
  }
}
```

### 2. 개별 탭 스타일 수정

#### calendar.module.css
```css
.calendarContainer {
  padding: 0; /* 부모에서 이미 padding 있음 */
  max-width: 100%;
  width: 100%;
}

.calendar {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 24px;
}
```

#### chat.module.css
```css
.chatContainer {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 48px - 80px);
  max-width: 100%; /* 부모 제약 받음 */
  width: 100%;
}
```

#### notices.module.css
```css
.noticesContainer {
  padding: 0;
  max-width: 100%;
  width: 100%;
}
```

#### files.module.css
```css
.filesContainer {
  padding: 0;
  max-width: 100%;
  width: 100%;
}
```

#### tasks.module.css
```css
.tasksContainer {
  padding: 0;
  max-width: 100%;
  width: 100%;
}
```

## ✅ 체크리스트

### 즉시 적용 (Quick Win)
- [ ] calendar.module.css 수정
- [ ] chat.module.css 수정
- [ ] notices.module.css 수정
- [ ] files.module.css 수정
- [ ] tasks.module.css 수정
- [ ] settings.module.css 수정 (이미 900px로 설정됨 ✅)

### Phase 2 (레이아웃 구조 개선)
- [ ] studies/[studyId]/layout.jsx 생성
- [ ] study-layout.module.css 생성
- [ ] 탭별 사이드바 표시 로직
- [ ] CSS Grid 레이아웃 적용

### Phase 3 (사이드바 위젯)
- [ ] StudySidebar 컴포넌트
- [ ] StatsWidget (통계)
- [ ] MembersWidget (멤버)
- [ ] QuickAccessWidget (빠른 액세스)
- [ ] InfoWidget (정보)

## 📊 예상 효과

### Before (현재)
```
|<--- 여백 --->|<-- 콘텐츠 (좁음) -->|<--- 여백 --->|
     30%              40%                  30%
```

### After (개선)
```
|<---- 메인 콘텐츠 ---->|<-- 사이드바 -->|
         70%                   30%
```

또는

```
|<----------- 전체 너비 활용 ----------->|
              100% (최대 1400px)
```

## 🎯 우선순위

1. **High**: 개별 탭 CSS 수정 (즉시 효과)
2. **Medium**: 레이아웃 구조 개선
3. **Low**: 사이드바 위젯 구현

## 📝 참고사항

- 문서: `docs/screens/07_study-detail.md` 참조
- 기존 `detail.module.css`의 `max-width: 1440px`는 유지
- 각 탭이 부모 레이아웃의 너비를 100% 활용하도록 수정
- 사이드바는 선택적 구현 (Phase 3)

