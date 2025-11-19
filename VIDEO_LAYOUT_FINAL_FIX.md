# ✅ 화상 통화 레이아웃 최종 수정 완료

> **작업일**: 2025-11-19  
> **요청**: 하단 바 침범 방지 + 스크롤 제거  
> **상태**: ✅ 완료

---

## 🎯 수정 내용

### 1. 화상 회의 화면 스크롤 완전 제거 ✅

**문제**: `padding-bottom: 80px`로 인해 전체 높이가 100vh 초과하여 스크롤 발생

**파일**: `/coup/src/app/my-studies/[studyId]/video-call/page.module.css`

**수정**:
```css
/* 상단 헤더 */
.videoHeader {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid var(--gray-200);
  flex-shrink: 0; /* ← 추가: 헤더 크기 고정 */
  height: 64px; /* ← 추가: 명시적 높이 */
}

/* 메인 컨텐츠 */
.mainContent {
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
  height: calc(100vh - 64px - 80px); /* ← 변경: 전체 - 헤더 - 컨트롤바 */
  min-height: 0; /* ← 추가: flex 자식의 overflow 작동을 위해 필요 */
}
```

**효과**:
- ✅ 정확한 높이 계산으로 스크롤 완전 제거
- ✅ 헤더(64px) + 메인콘텐츠(자동) + 컨트롤바(80px) = 100vh
- ✅ 컨텐츠가 컨트롤 바에 가려지지 않음

---

### 2. 컨트롤 바 전체 너비 적용 ✅

**파일**: `/coup/src/components/video-call/ControlBar.module.css`

**수정**:
```css
.controlBar {
  position: fixed;
  bottom: 0;
  left: 0; /* ← 변경: 전체 너비 사용 */
  right: 0;
  height: 80px;
  background: rgb(0, 0, 0);
  /* ...existing code... */
}
```

**효과**:
- ✅ 컨트롤 바가 화면 전체 너비를 차지
- ✅ 좌측 사이드바와 관계없이 일관된 UI

---

## 📊 Before vs After

### 하단 바 침범 문제

#### Before ❌
```
┌─────────┬──────────────┬─────────┐
│ 참여자  │   비디오     │  채팅   │
│ 목록    │   영역       │         │
│         │              │         │
│ [항목]  │              │ [메시지]│
│ [항목]  │              │ [메시지]│
│ [가려짐]│  [가려짐]    │[입력창] │ ← 하단 80px가
├─────────┴──────────────┴─────────┤   컨트롤 바에
│ [🎤] [📹] [🖥️] [나가기]         │   가려짐
└──────────────────────────────────┘
```

#### After ✅
```
┌─────────┬──────────────┬─────────┐
│ 참여자  │   비디오     │  채팅   │
│ 목록    │   영역       │         │
│         │              │         │
│ [항목]  │              │ [메시지]│
│ [항목]  │              │ [메시지]│
│ [여백]  │   [여백]     │[입력창] │ ← 80px 여백
├─────────┴──────────────┴─────────┤   추가됨
│ [🎤] [📹] [🖥️] [나가기]         │ ← 가리지 않음
└──────────────────────────────────┘
```

### 스크롤 문제

#### Before ❌
```
화상 회의 화면
  ↓
min-height: 100vh (최소 높이)
  ↓
콘텐츠가 넘치면 페이지 스크롤 발생
  ↓
[스크롤바 표시] ← 불필요
```

#### After ✅
```
화상 회의 화면
  ↓
height: 100vh (고정 높이)
overflow: hidden (스크롤 차단)
  ↓
스크롤 완전 제거
  ↓
[깔끔한 전체 화면] ✅
```

---

## 🧪 테스트 방법

1. **브라우저 새로고침**
2. **화상 탭 접속 → 참여하기 클릭**
3. **확인사항**:
   - ✅ 페이지에 스크롤바가 없음
   - ✅ 참여자 목록 하단이 보임 (컨트롤 바에 가려지지 않음)
   - ✅ 채팅 입력창이 컨트롤 바 위에 표시됨
   - ✅ 비디오 영역이 적절한 크기로 중앙에 배치
   - ✅ 하단 컨트롤 바가 완전 불투명 (검은색)

---

## 📁 수정된 파일

### 1. `/coup/src/app/my-studies/[studyId]/video-call/page.module.css`
- ✅ `.container`: `height: 100vh` + `overflow: hidden` (스크롤 제거)
- ✅ `.videoHeader`: `flex-shrink: 0` + `height: 64px` (고정 높이)
- ✅ `.mainContent`: `height: calc(100vh - 64px - 80px)` + `min-height: 0` (정확한 높이 계산)

### 2. `/coup/src/components/video-call/ControlBar.module.css`
- ✅ `.controlBar`: `left: 0` (전체 너비 사용)

---

## 🎉 완료

### 핵심 개선사항
1. ✅ **정확한 높이 계산**: `100vh = 64px(헤더) + calc(자동) + 80px(컨트롤바)`
2. ✅ **스크롤 완전 제거**: padding 대신 calc()로 정확한 높이 지정
3. ✅ **레이아웃 최적화**: 모든 콘텐츠가 보이는 영역 내에 배치
4. ✅ **UX 개선**: 스크롤 없이 깔끔한 전체 화면 경험

### 기술적 포인트
```css
/* 전체 화면 고정 + 스크롤 차단 */
.container {
  height: 100vh;
  overflow: hidden;
}

/* 헤더 고정 높이 */
.videoHeader {
  flex-shrink: 0;
  height: 64px;
}

/* 정확한 높이 계산 */
.mainContent {
  height: calc(100vh - 64px - 80px);
  min-height: 0; /* flex 자식의 overflow를 위해 필수 */
}

/* 컨트롤 바는 fixed로 공간 차지 안 함 */
.controlBar {
  position: fixed;
  bottom: 0;
  height: 80px;
}
```

### 높이 계산 구조
```
100vh (전체 화면 높이)
├─ 64px   : 상단 헤더 (고정)
├─ calc() : 메인 컨텐츠 (자동 = 100vh - 64px - 80px)
│   ├─ 좌측: 참여자 목록
│   ├─ 중앙: 비디오 영역
│   └─ 우측: 채팅
└─ 80px   : 하단 컨트롤 바 (fixed, 공간 차지 안 함)
```

---

**작성자**: AI Assistant (Claude)  
**작업 시간**: 5분  
**상태**: 2가지 문제 해결 완료 ✅

