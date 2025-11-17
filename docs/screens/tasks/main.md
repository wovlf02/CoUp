# 할 일 메인 (Tasks Main)

> **화면 ID**: `TASKS-MAIN-01`  
> **라우트**: `/tasks`  
> **목적**: 모든 스터디의 할 일을 통합 관리  
> **사용자 상태**: 로그인 필수  
> **렌더링**: CSR (개인화된 데이터)

---

## 📝 화면 목적

**"모든 스터디의 할 일을 한 곳에서"**
- 참여 중인 모든 스터디의 할 일 통합 관리
- 마감일 기준 우선순위 자동 정렬
- 빠른 완료 체크 및 진행 상황 추적
- 스터디별 필터링 및 상태별 분류

---

## 🎨 레이아웃 구조 (FHD 최적화)

```
┌─────┬─────────────────────────────────────────────────────────────┬──────────────────┐
│     │ ✅ 내 할 일                                                 │                  │
│ Nav ├─────────────────────────────────────────────────────────────┤  우측 위젯       │
│ 12% │ [전체 스터디 ▼] [전체 상태 ▼] [마감일순 ▼]   📊 미완료 8건│  (280px)         │
│     ├─────────────────────────────────────────────────────────────┤                  │
│     │                                                             │  📅 오늘의 할 일 │
│     │ 🔴 긴급 (마감 24시간 이내) ────────────────────── 3건      │  • 알고리즘 풀이 │
│     │                                                             │    18:00 마감    │
│     │ ┌────────────────────────────────────────────────────┐     │  • 자소서 작성   │
│     │ │ [ ] 백준 1234번 풀이                              │     │    23:59 마감    │
│     │ │     💻 알고리즘 마스터 스터디                      │     │                  │
│     │ │     ⏰ 오늘 18:00 마감 (3시간 남음)                │     │  ⏰ 이번 주      │
│     │ │     👥 12명 중 8명 완료                            │     │  8건 중 5건 완료 │
│     │ │     📝 백준 1234번 문제를 풀고...                  │     │  ▓▓▓▓▓░░░ 62%   │
│     │ └────────────────────────────────────────────────────┘     │                  │
│     │                                                             │  📊 스터디별     │
│     │ ┌────────────────────────────────────────────────────┐     │  • 알고리즘: 3건 │
│     │ │ [ ] 자소서 1차 작성                               │     │  • 취업준비: 2건 │
│     │ │     📝 취업 준비 스터디                            │     │  • 영어회화: 1건 │
│     │ │     ⏰ 오늘 23:59 마감 (8시간 남음)                │     │                  │
│     │ │     👥 8명 중 5명 완료                             │     │  🏆 이번 주 달성 │
│     │ │     📝 자소서 1차 초안을 작성해주세요              │     │  알고리즘: 100%  │
│     │ └────────────────────────────────────────────────────┘     │  취업준비: 85%   │
│     │                                                             │                  │
│     │ ⏱️ 이번 주 (7일 이내) ──────────────────────────── 5건     │  💡 TIP         │
│     │                                                             │  할 일을 작게    │
│     │ ┌────────────────────────────────────────────────────┐     │  나눠서 관리하면 │
│     │ │ [✓] 코드 리뷰 준비                                │     │  달성감UP! 🎯   │
│     │ │     💻 알고리즘 마스터 스터디                      │     │                  │
│     │ │     ✅ 완료 (2시간 전)                            │     │                  │
│     │ │     👥 12명 중 10명 완료                           │     │                  │
│     │ └────────────────────────────────────────────────────┘     │                  │
│     │                                                             │                  │
│     │ 📋 나중에 (7일 이후) ────────────────────────────── 2건    │                  │
│     │                                                             │                  │
│     │ ┌────────────────────────────────────────────────────┐     │                  │
│     │ │ [ ] 모의 코딩테스트 준비                          │     │                  │
│     │ │     💻 알고리즘 마스터 스터디                      │     │                  │
│     │ │     ⏰ 11/13 20:00 마감 (4일 남음)                 │     │                  │
│     │ │     📝 상세 내용 보기                              │     │                  │
│     │ └────────────────────────────────────────────────────┘     │                  │
│     │                                                             │                  │
└─────┴─────────────────────────────────────────────────────────────┴──────────────────┘
```

**레이아웃 비율**:
- 좌측 네비게이션: 12% (240px)
- 메인 콘텐츠: 58% (1100px)
- 우측 위젯: 30% (280px)

**레이아웃 비율** (해상도별 자동 조정):

### 🖥️ FHD (1920px) - 기본 기준
- 좌측 네비게이션: **12%** (min: 200px, max: 240px)
- 메인 콘텐츠: **58%** (min: 900px, max: 1200px)
- 우측 위젯: **30%** (min: 260px, max: 320px)
- 갭(여백): **2%**

### 🖥️ QHD (2560px) - 고해상도
- 좌측 네비게이션: **10%** (min: 240px, max: 280px)
- 메인 콘텐츠: **60%** (min: 1200px, max: 1600px)
- 우측 위젯: **28%** (min: 320px, max: 400px)
- 갭(여백): **2%**

### 🖥️ 4K (3840px) - 초고해상도
- 좌측 네비게이션: **8%** (min: 280px, max: 320px)
- 메인 콘텐츠: **62%** (min: 1600px, max: 2200px)
- 우측 위젯: **28%** (min: 400px, max: 500px)
- 갭(여백): **2%**

### 📱 반응형 브레이크포인트
- **Desktop Small (1440px)**: 15% / 55% / 28%
- **Tablet (1024px)**: 5% / 65% / 28%
- **Mobile (<768px)**: 100% 단일 컬럼

---

## 📋 섹션별 상세 설계

### 1. 페이지 헤더

```
┌──────────────────────────────────────────────────────────┐
│ ✅ 내 할 일                                               │
└──────────────────────────────────────────────────────────┘
```

**좌측**: 제목 "✅ 내 할 일"
- 폰트: text-2xl, Bold, gray-900
- 아이콘으로 할 일 컨텍스트 명확화

---

### 2. 필터 및 통계 바

```
┌──────────────────────────────────────────────────────────────┐
│ [전체 스터디 ▼] [전체 상태 ▼] [마감일순 ▼]   📊 미완료 8건 │
└──────────────────────────────────────────────────────────────┘
```

**필터 구성**:

1. **스터디 필터** (Dropdown)
   - 전체 스터디 (기본값)
   - 참여 중인 각 스터디 (이모지 + 이름)
   - 너비: 180px

2. **상태 필터** (Dropdown)
   - 전체 상태 (기본값)
   - 미완료만
   - 완료만
   - 너비: 140px

3. **정렬** (Dropdown)
   - 마감일순 (기본값)
   - 최신 등록순
   - 스터디별
   - 완료율순
   - 너비: 120px

4. **진행 현황** (우측 Badge)
   - 형식: "미완료 8건"
   - 색상: 미완료 수에 따라 동적
     - 5건 이상: red-100 / red-700
     - 3-4건: orange-100 / orange-700
     - 1-2건: blue-100 / blue-700
     - 0건: green-100 / green-700

---

### 3. 할 일 그룹 (마감 긴급도별)

#### 3-1. 🔴 긴급 (24시간 이내)

```
🔴 긴급 (마감 24시간 이내) ────────────────────── 3건

┌────────────────────────────────────────────────────┐
│ [ ] 백준 1234번 풀이                              │
│     💻 알고리즘 마스터 스터디                      │
│     ⏰ 오늘 18:00 마감 (3시간 남음)                │
│     👥 12명 중 8명 완료                            │
│     📝 백준 1234번 문제를 풀고 풀이를 공유해주세요 │
└────────────────────────────────────────────────────┘
```

**카드 스타일**:
- 배경: red-50
- 테두리: red-200, 2px
- 체크박스: 좌측 상단, 크기 20px
- 호버: shadow-lg, 살짝 상승 효과 (transform: translateY(-2px))

**카드 내용**:
1. **제목** (text-lg, font-semibold, gray-900)
2. **스터디 정보** (text-sm, 이모지 + 스터디명, gray-600)
3. **마감 시간** (⏰ + 남은 시간 강조)
   - 1시간 미만: red-600, font-bold, 깜빡임 애니메이션
   - 3시간 미만: orange-600, font-semibold
   - 24시간 미만: gray-700
4. **완료 현황** (👥 + 진행률, gray-600)
   - 형식: "12명 중 8명 완료 (67%)"
5. **설명 미리보기** (2줄 제한, text-sm, gray-600)
   - 초과 시 "..." 표시

**인터랙션**:
- 체크박스 클릭 → 즉시 완료 처리 + Toast 표시 + 완료 섹션으로 이동
- 카드 클릭 → 할 일 상세 모달 열기
- 스터디명 클릭 → 해당 스터디 할 일 페이지 (`/my-studies/[studyId]/tasks`)

---

#### 3-2. ⏱️ 이번 주 (7일 이내)

```
⏱️ 이번 주 (7일 이내) ──────────────────────────── 5건

┌────────────────────────────────────────────────────┐
│ [✓] 코드 리뷰 준비                                │
│     💻 알고리즘 마스터 스터디                      │
│     ✅ 완료 (2시간 전)                            │
│     👥 12명 중 10명 완료                           │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ [ ] 면접 스크립트 작성                            │
│     📝 취업 준비 스터디                            │
│     ⏰ 11/11 18:00 마감 (2일 남음)                 │
│     👥 8명 중 5명 완료                             │
└────────────────────────────────────────────────────┘
```

**카드 스타일**:
- 배경: white (미완료) / gray-50 (완료)
- 테두리: gray-200, 1px
- 완료 항목: 
  - 텍스트 line-through
  - opacity 60%
  - 체크박스에 체크 표시

**완료 시간 표시**:
- "✅ 완료 (2시간 전)"
- 색상: green-600

---

#### 3-3. 📋 나중에 (7일 이후)

```
📋 나중에 (7일 이후) ────────────────────────────── 2건

┌────────────────────────────────────────────────────┐
│ [ ] 모의 코딩테스트 준비                          │
│     💻 알고리즘 마스터 스터디                      │
│     ⏰ 11/13 20:00 마감 (4일 남음)                 │
│     📝 상세 내용 보기                              │
└────────────────────────────────────────────────────┘
```

**카드 스타일**:
- 배경: gray-50
- 테두리: gray-100, 1px
- 간소화된 정보 (완료 현황 생략 가능)

---

### 4. 우측 위젯

#### 4-1. 📅 오늘의 할 일

```
┌────────────────────┐
│ 📅 오늘의 할 일     │
├────────────────────┤
│ • 알고리즘 풀이    │
│   18:00 마감       │
│   (3시간 남음)     │
│                    │
│ • 자소서 작성      │
│   23:59 마감       │
│   (8시간 남음)     │
│                    │
│ • 면접 준비        │
│   오늘 중          │
│                    │
│ [전체 보기]        │
└────────────────────┘
```

**스타일**:
- 배경: blue-50
- 테두리: blue-200
- 최대 5개까지 표시
- 시간순 정렬
- 클릭 시 해당 할 일로 스크롤

---

#### 4-2. ⏰ 이번 주 진행률

```
┌────────────────────┐
│ ⏰ 이번 주          │
├────────────────────┤
│ 8건 중 5건 완료    │
│ ▓▓▓▓▓░░░ 62%      │
│                    │
│ ✅ 완료: 5건       │
│ ⏳ 진행중: 3건     │
│ 📅 전체: 8건       │
└────────────────────┘
```

**프로그레스 바**:
- 높이: 10px
- 색상: blue-500 (진행), gray-200 (배경)
- 애니메이션: 부드러운 증가 (transition: width 0.5s ease)
- 둥근 모서리: border-radius 5px

---

#### 4-3. 📊 스터디별 할 일

```
┌────────────────────┐
│ 📊 스터디별         │
├────────────────────┤
│ 💻 알고리즘: 3건   │
│   미완료 2 / 완료 1│
│                    │
│ 📝 취업준비: 2건   │
│   미완료 1 / 완료 1│
│                    │
│ 🌍 영어회화: 1건   │
│   미완료 1 / 완료 0│
│                    │
│ 📚 독서모임: 2건   │
│   미완료 0 / 완료 2│
│                    │
│ [전체 보기]        │
└────────────────────┘
```

**클릭 시**:
- 해당 스터디로 필터 자동 적용
- 메인 영역 스크롤 최상단으로 이동

**스타일**:
- 각 스터디 항목에 호버 효과
- 미완료 수가 있으면 bold 표시

---

#### 4-4. 🏆 이번 주 달성률

```
┌────────────────────┐
│ 🏆 이번 주 달성률   │
├────────────────────┤
│ 💻 알고리즘        │
│ ▓▓▓▓▓▓▓▓▓▓ 100%   │
│                    │
│ 📝 취업준비        │
│ ▓▓▓▓▓▓▓▓░░ 85%    │
│                    │
│ 🌍 영어회화        │
│ ▓▓▓▓▓▓░░░░ 60%    │
│                    │
│ 평균: 82% 🎯      │
└────────────────────┘
```

**프로그레스 바 색상**:
- 90% 이상: green-500
- 70-89%: blue-500
- 50-69%: orange-500
- 50% 미만: red-500

---

#### 4-5. 💡 할 일 관리 팁

```
┌────────────────────┐
│ 💡 TIP             │
├────────────────────┤
│ 할 일을 작게       │
│ 나눠서 관리하면    │
│ 달성감이 높아요!   │
│ 🎯                │
│                    │
│ [더 많은 팁 보기]  │
└────────────────────┘
```

**팁 목록** (랜덤 표시):
1. "할 일을 작게 나눠서 관리하면 달성감이 높아요!"
2. "긴급한 일부터 처리하면 스트레스가 줄어들어요!"
3. "매일 3개씩 완료하는 습관을 만들어보세요!"
4. "완료한 할 일을 확인하며 성취감을 느껴보세요!"
5. "너무 많은 할 일은 스트레스! 적절히 조절하세요!"

---

## 🎭 할 일 상세 모달

카드 클릭 시 열리는 모달:

```
┌──────────────────────────────────────────────────────┐
│ 할 일 상세                                    [X]    │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 백준 1234번 풀이                                     │
│ 💻 알고리즘 마스터 스터디                            │
│                                                      │
│ ⏰ 마감일: 2024-11-09 18:00 (3시간 남음)             │
│ 👤 생성자: 김철수 (2024-11-05 09:00)                 │
│                                                      │
│ ──────────────────────────────────────────────      │
│                                                      │
│ 📝 상세 설명                                         │
│ 백준 1234번 문제를 풀고 풀이를 공유해주세요.         │
│ 목요일 저녁 8시에 코드 리뷰를 진행하겠습니다.        │
│ 가능한 한 여러 방법으로 풀어보세요!                  │
│                                                      │
│ 📎 첨부 파일 (1)                                     │
│ • 문제_설명.pdf (1.2MB) [다운로드]                   │
│                                                      │
│ 👥 완료 현황 (8/12명, 67%)                           │
│                                                      │
│ ▓▓▓▓▓▓░░░░░░ 67%                                    │
│                                                      │
│ [✓] 김철수    2시간 전                               │
│ [✓] 이영희    3시간 전                               │
│ [✓] 박민수    5시간 전                               │
│ [✓] 최지은    5시간 전                               │
│ [✓] 정소현    6시간 전                               │
│ [✓] 강민준    7시간 전                               │
│ [✓] 윤서현    8시간 전                               │
│ [✓] 장동현    10시간 전                              │
│ [ ] 홍지우    미완료                                 │
│ [ ] 송예은    미완료                                 │
│ ... 더보기 (2명)                                     │
│                                                      │
│ ──────────────────────────────────────────────      │
│                                                      │
│ 💬 댓글 (5)                                          │
│                                                      │
│ 김철수: "다들 화이팅! 💪" 1시간 전                   │
│ 이영희: "어려웠지만 풀었어요 😊" 2시간 전            │
│ 박민수: "힌트 좀 주실 수 있나요?" 3시간 전           │
│ 김철수: "@박민수 DFS로 접근해보세요!" 3시간 전       │
│ 박민수: "감사합니다!" 2시간 전                       │
│                                                      │
│ [댓글 입력창]                          [등록]        │
│                                                      │
├──────────────────────────────────────────────────────┤
│              [완료 처리]  [수정]  [삭제]  [닫기]     │
└──────────────────────────────────────────────────────┘
```

**모달 크기**: 
- 너비: 700px
- 최대 높이: 90vh (스크롤 가능)

**모달 기능**:

1. **완료 처리** (모든 멤버)
   - 현재 사용자의 완료 상태 토글
   - 완료 시 Toast: "할 일이 수정되었습니다"
   - 완료 취소 시 Toast: "완료를 취소했습니다"

2. **수정** (생성자 또는 관리자만)
   - 제목, 설명, 마감일, 첨부파일 수정
   - 저장 시 Toast: "할 일이 수정되었습니다"

3. **삭제** (생성자 또는 관리자만)
   - 확인 다이얼로그: "정말 삭제하시겠습니까?"
   - 삭제 시 Toast: "할 일이 삭제되었습니다"

4. **댓글** (모든 멤버)
   - 실시간 댓글 추가/수정/삭제
   - @ 멘션 기능 (자동완성)
   - 이모지 입력 지원

5. **파일 다운로드**
   - 첨부 파일 다운로드
   - 파일 아이콘: PDF, DOCX, XLSX, ZIP 등

---

## 🎯 빈 상태 처리

### 할 일이 없을 때

```
┌──────────────────────────────────────┐
│                                      │
│            ✅                        │
│                                      │
│      아직 할 일이 없어요!            │
│                                      │
│   스터디에 참여하고 할 일을          │
│   함께 달성해보세요!                 │
│                                      │
│      [스터디 탐색하기]               │
│                                      │
└──────────────────────────────────────┘
```

**스타일**:
- 중앙 정렬
- 아이콘 크기: 80px
- 회색 텍스트
- 버튼: Primary 색상

---

### 모든 할 일 완료 시

```
┌──────────────────────────────────────┐
│                                      │
│            🎉                        │
│                                      │
│    모든 할 일을 완료했어요!          │
│                                      │
│   정말 멋져요! 계속해서              │
│   달성해나가보세요! 💪               │
│                                      │
│      [내 스터디 보기]                │
│                                      │
└──────────────────────────────────────┘
```

**스타일**:
- 축하 애니메이션 (confetti 효과)
- 밝은 색상
- 긍정적인 메시지

---

### 필터 결과가 없을 때

```
┌──────────────────────────────────────┐
│                                      │
│            🔍                        │
│                                      │
│      검색 결과가 없습니다            │
│                                      │
│   다른 필터를 선택해보세요           │
│                                      │
│      [필터 초기화]                   │
└──────────────────────────────────────┘
```

---

## 🎨 CSS 구조 (tasks.module.css)

```css
/* 컨테이너 */
.container {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1920px;
  margin: 0 auto;
}

.mainContent {
  flex: 1;
  min-width: 0;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

/* 헤더 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 필터 바 */
.filterBar {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 24px;
}

.select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.select:hover {
  border-color: #3b82f6;
}

.select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.progressBadge {
  margin-left: auto;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.progressBadge.urgent {
  background: #fee2e2;
  color: #dc2626;
}

.progressBadge.warning {
  background: #fed7aa;
  color: #ea580c;
}

.progressBadge.normal {
  background: #dbeafe;
  color: #2563eb;
}

.progressBadge.success {
  background: #d1fae5;
  color: #059669;
}

/* 할 일 그룹 */
.taskGroup {
  margin-bottom: 32px;
}

.groupHeader {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.groupTitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.groupCount {
  font-size: 0.875rem;
  color: #6b7280;
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 12px;
}

/* 할 일 카드 */
.taskCard {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
}

.taskCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.taskCard.urgent {
  background: #fef2f2;
  border: 2px solid #fca5a5;
}

.taskCard.urgent:hover {
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.15);
}

.taskCard.completed {
  background: #f9fafb;
  opacity: 0.6;
}

.taskCard.completed .taskTitle {
  text-decoration: line-through;
  color: #9ca3af;
}

.taskHeader {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.checkbox:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.checkbox.checked {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox.checked::after {
  content: '✓';
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.taskTitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  flex: 1;
  line-height: 1.4;
}

.taskMeta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.875rem;
  color: #6b7280;
  margin-left: 32px;
}

.studyInfo {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
}

.studyInfo:hover {
  color: #3b82f6;
}

.deadline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.deadline.urgent {
  color: #dc2626;
  animation: pulse 1.5s ease-in-out infinite;
}

.deadline.warning {
  color: #ea580c;
}

.deadline.normal {
  color: #6b7280;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.progress {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
}

.completedTime {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #059669;
  font-weight: 500;
}

.description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 8px;
  margin-left: 32px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 우측 위젯 */
.widget {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.widget.highlighted {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
}

.widgetHeader {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.widgetContent {
  font-size: 0.875rem;
  color: #6b7280;
}

.todayTask {
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.todayTask:hover {
  background: #f9fafb;
  padding-left: 8px;
}

.todayTask:last-child {
  border-bottom: none;
}

.todayTaskTitle {
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.todayTaskTime {
  font-size: 0.75rem;
  color: #6b7280;
}

.todayTaskTimeLeft {
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 500;
}

.progressBar {
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 5px;
  overflow: hidden;
  margin: 12px 0;
}

.progressFill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  transition: width 0.5s ease;
  border-radius: 5px;
}

.progressStats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  font-size: 0.875rem;
}

.progressStatItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.studyList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.studyItem {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f3f4f6;
}

.studyItem:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.studyItemHeader {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.studyItemStats {
  font-size: 0.75rem;
  color: #6b7280;
}

.achievementList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievementItem {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.achievementHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.achievementName {
  font-weight: 500;
  color: #374151;
}

.achievementPercent {
  font-weight: 600;
  color: #059669;
}

.achievementBar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.achievementBarFill {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 3px;
}

.achievementBarFill.high {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.achievementBarFill.medium {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.achievementBarFill.low {
  background: linear-gradient(90deg, #f59e0b 0%, #ea580c 100%);
}

.achievementBarFill.veryLow {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.tipContent {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #374151;
  text-align: center;
  padding: 12px 0;
}

.widgetButton {
  width: 100%;
  padding: 8px;
  margin-top: 12px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.widgetButton:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

/* 빈 상태 */
.emptyState {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.emptyIcon {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.emptyTitle {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.emptyDescription {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.6;
}

.emptyButton {
  display: inline-block;
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.emptyButton:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 로딩 스켈레톤 */
.skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 반응형 */
@media (max-width: 1440px) {
  .sidebar {
    width: 240px;
  }
}

@media (max-width: 1024px) {
  .container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .filterBar {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .select {
    flex: 1;
    min-width: 100px;
  }
  
  .progressBadge {
    width: 100%;
    margin-left: 0;
    justify-content: center;
  }
  
  .taskCard {
    padding: 16px;
  }
  
  .taskTitle {
    font-size: 1rem;
  }
  
  .taskMeta {
    margin-left: 0;
  }
  
  .description {
    margin-left: 0;
  }
  
  .sidebar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.25rem;
  }
  
  .filterBar {
    padding: 12px;
  }
  
  .taskCard {
    padding: 12px;
  }
  
  .groupTitle {
    font-size: 1rem;
  }
}
```

---

## 🔄 상태 관리

### 할 일 상태

```javascript
const [tasks, setTasks] = useState([])
const [filter, setFilter] = useState({
  studyId: null, // null = 전체
  status: 'all', // all, incomplete, completed
  sortBy: 'deadline', // deadline, created, study, completion
})
const [loading, setLoading] = useState(true)
const [selectedTask, setSelectedTask] = useState(null)
const [isModalOpen, setIsModalOpen] = useState(false)
```

### 완료 처리

```javascript
const handleToggleComplete = async (taskId) => {
  // 낙관적 UI 업데이트
  setTasks(prev => prev.map(task => 
    task.id === taskId 
      ? { ...task, completed: !task.completed, completedAt: new Date() }
      : task
  ))
  
  // API 호출
  try {
    await api.toggleTaskComplete(taskId)
    
    // Toast 표시
    const task = tasks.find(t => t.id === taskId)
    if (!task.completed) {
      showToast('할 일을 완료했습니다! 🎉', 'success')
    } else {
      showToast('완료를 취소했습니다', 'info')
    }
    
    // 통계 재계산
    refetchStats()
  } catch (error) {
    // 롤백
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, completedAt: null }
        : task
    ))
    showToast('오류가 발생했습니다', 'error')
  }
}
```

### 필터링 로직

```javascript
const filteredTasks = useMemo(() => {
  let result = tasks
  
  // 스터디 필터
  if (filter.studyId) {
    result = result.filter(task => task.studyId === filter.studyId)
  }
  
  // 상태 필터
  if (filter.status === 'incomplete') {
    result = result.filter(task => !task.completed)
  } else if (filter.status === 'completed') {
    result = result.filter(task => task.completed)
  }
  
  // 정렬
  switch (filter.sortBy) {
    case 'deadline':
      result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      break
    case 'created':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'study':
      result.sort((a, b) => a.studyName.localeCompare(b.studyName))
      break
    case 'completion':
      result.sort((a, b) => {
        const aPercent = a.completedCount / a.totalCount
        const bPercent = b.completedCount / b.totalCount
        return bPercent - aPercent
      })
      break
  }
  
  return result
}, [tasks, filter])
```

## ✅ 구현 완료 상태

### 2025-11-17 기준 - 100% 완료

**메인 콘텐츠 영역** (100% 완료)
- ✅ 페이지 헤더 (제목 + 부제목 + 버튼) - 완료
- ✅ TaskFilters 컴포넌트 - 완료
  - ✅ 스터디 선택 필터
  - ✅ 상태 필터 (전체/미완료/완료)
  - ✅ 정렬 옵션 (마감일순)
  - ✅ 미완료 카운트 표시
- ✅ 할 일 그룹화 - 완료
  - ✅ 긴급 (24시간 이내) - TaskGroup
  - ✅ 이번 주 (7일 이내) - TaskGroup
  - ✅ 나중에 (7일 이후) - TaskGroup
  - ✅ getUrgencyLevel 유틸리티 사용
- ✅ TaskGroup 컴포넌트 - 완료
  - ✅ 그룹 제목
  - ✅ 할 일 카드 리스트
  - ✅ 체크박스 토글 (handleToggleComplete)
  - ✅ 삭제 기능 (handleDeleteTask)
- ✅ 빈 상태 UI (TaskEmpty) - 완료
- ✅ 할 일 추가 모달 (TaskCreateModal) - 완료

**우측 사이드바 위젯** (100% 완료)
- ✅ TodayTasksWidget (오늘의 할 일) - 완료
- ✅ TaskProgressWidget (진행 상황) - 완료
- ✅ TaskByStudyWidget (스터디별 할 일) - 완료

**데이터 소스** (100% 완료)
- ✅ @/mocks/tasks import - 완료
- ✅ userTasks (할 일 목록) - 완료
- ✅ taskStats (통계 데이터) - 완료

**상태 관리** (100% 완료)
- ✅ tasks (할 일 리스트) - 완료
- ✅ filter (studyId/status/sortBy) - 완료
- ✅ showCreateModal (모달 표시) - 완료
- ✅ filteredTasks (useMemo) - 완료
- ✅ groupedTasks (useMemo) - 완료

**기능** (100% 완료)
- ✅ 할 일 완료 토글 - 완료
- ✅ 할 일 추가 - 완료
- ✅ 할 일 삭제 (확인 다이얼로그) - 완료
- ✅ 필터링 로직 - 완료
- ✅ 그룹화 로직 (urgent/thisWeek/later) - 완료

**유틸리티** (100% 완료)
- ✅ getUrgencyLevel (@/utils/time) - 완료

**스타일링** (100% 완료)
- ✅ page.module.css 분리 - 완료
- ✅ 2컬럼 그리드 레이아웃 - 완료

## 📊 구현 체크리스트

### Phase 1: 기본 레이아웃 (100% 완료)
- ✅ 2컬럼 컨테이너
- ✅ 페이지 헤더
- ✅ 할 일 추가 버튼

### Phase 2: 필터링 (100% 완료)
- ✅ TaskFilters 컴포넌트
- ✅ 스터디 필터
- ✅ 상태 필터
- ✅ 정렬 옵션

### Phase 3: 할 일 표시 (100% 완료)
- ✅ TaskGroup 컴포넌트
- ✅ 그룹화 로직 (urgent/thisWeek/later)
- ✅ getUrgencyLevel 유틸리티
- ✅ 체크박스 토글

### Phase 4: CRUD 기능 (100% 완료)
- ✅ 할 일 완료 토글
- ✅ 할 일 추가 (TaskCreateModal)
- ✅ 할 일 삭제

### Phase 5: 우측 위젯 (100% 완료)
- ✅ TodayTasksWidget
- ✅ TaskProgressWidget
- ✅ TaskByStudyWidget

### Phase 6: 빈 상태 (100% 완료)
- ✅ TaskEmpty 컴포넌트
- ✅ 조건부 렌더링

### Phase 7: API 연동 및 추가 기능 (대기)
- ⏳ API 연동
- ⏳ 할 일 수정 기능
- ⏳ 드래그앤드롭 정렬
- ⏳ 반복 할 일
- ⏳ 알림 설정
- ⏳ React Query 캐싱
- ⏳ 반응형 최적화
