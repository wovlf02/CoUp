# 채팅 페이지 높이 수정

## 📋 수정 일자
2025-01-21

## 🎯 목표
채팅 탭에서 페이지 전체 스크롤을 제거하고, 채팅 메시지 영역과 사이드바에서만 독립적으로 스크롤 발생하도록 수정

## ❌ 문제점

### Before:
- 채팅 섹션 높이: 고정값 부족으로 너무 큼
- 우측 사이드바: `position: sticky`, `max-height: calc(100vh - 100px)`
- 메인 콘텐츠 하단 여백: `margin-bottom: 40px`
- 채팅 컴포넌트가 너무 길어서 페이지 전체에 스크롤 발생
- 우측 사이드바의 높이가 달라 추가 스크롤 발생
- 사용자가 채팅 내부 스크롤과 페이지 전체 스크롤 둘 다 다뤄야 함
- 혼란스러운 스크롤 경험

## ✅ 해결 방법

### 수정된 파일:
**파일**: `coup/src/app/my-studies/[studyId]/chat/page.module.css`

### 변경사항:
```css
/* Before */
.chatSection {
  height: 자동 계산 (너무 높음);
}

.mainContent {
  margin-bottom: 40px;
}

.sidebar {
  position: sticky;
  top: 80px;
  height: fit-content;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

/* After */
.chatSection {
  height: calc(100vh - 360px); /* 적절한 높이로 제한 */
}

.mainContent {
  margin-bottom: 0; /* 하단 여백 제거 */
}

.sidebar {
  height: calc(100vh - 360px); /* 채팅 섹션과 동일한 높이 */
  overflow-y: auto;
}

/* 스크롤바 스타일링 추가 */
.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}
```

### 계산:
- **100vh**: 전체 뷰포트 높이
- **-360px**: 다음 요소들의 높이 합계
  - Container Padding Top: ~16px
  - Back Button: ~44px (padding + margin 포함)
  - Study Header: ~96px (padding 포함)
  - Tabs Navigation: ~76px (padding 포함)
  - Header Section Spacing: ~12px
  - Tabs Margin: ~16px
  - Main Content Top Space: ~16px
  - Container Padding Bottom: ~16px
  - Additional Buffer: ~68px (브라우저 UI 등)
  - **Total**: ~360px
- **margin-bottom: 0**: 하단 여백 제거로 페이지 스크롤 완전 제거
- **sidebar height**: 채팅 섹션과 동일한 높이로 설정하여 레이아웃 통일

## 📊 결과

### After:
- ✅ 채팅 섹션이 뷰포트에 적절하게 맞음
- ✅ 페이지 전체 스크롤 완전 제거
- ✅ 우측 사이드바가 채팅 섹션과 동일한 높이
- ✅ 우측 영역 전체 스크롤 제거
- ✅ 채팅 메시지 영역 내부에서만 스크롤 발생
- ✅ 우측 위젯이 많을 경우 사이드바 내부에서만 스크롤
- ✅ 하단 여백 제거로 깔끔한 레이아웃
- ✅ 직관적이고 명확한 독립적 스크롤 경험

## 🚀 결과

이제 채팅 페이지에서:
- ✅ 페이지 전체 스크롤 완전 제거
- ✅ 우측 영역 전체 스크롤 제거
- ✅ 채팅 영역만 독립적으로 스크롤
- ✅ 우측 사이드바만 독립적으로 스크롤 (위젯이 많을 경우)
- ✅ 채팅 섹션과 사이드바가 동일한 높이로 깔끔한 정렬
- ✅ 입력창이 항상 화면 하단에 고정
- ✅ 하단 여백 제거로 깔끔한 UI
- ✅ 직관적이고 편안한 사용자 경험

브라우저를 새로고침하면 채팅 페이지가 화면에 딱 맞게 표시되며, 페이지 전체 스크롤과 우측 영역 스크롤 없이 채팅 메시지 영역과 사이드바에서만 독립적으로 스크롤이 발생합니다! 🎉

## 🔍 주요 개선 사항

### 1. 높이 제한
- 채팅 섹션: `calc(100vh - 360px)`로 고정
- 사이드바: 채팅 섹션과 동일한 높이
- 결과: 뷰포트 내에 완벽하게 맞춤

### 2. 스크롤 영역 분리
- 페이지 레벨: 스크롤 없음
- 채팅 메시지 영역: 독립적 스크롤
- 우측 사이드바: 독립적 스크롤

### 3. 레이아웃 정리
- 불필요한 하단 여백 제거
- 좌우 컴포넌트 높이 통일
- 깔끔한 수평 정렬

### 4. 사용자 경험
- 혼란스러운 다중 스크롤 제거
- 명확한 콘텐츠 영역 구분
- 직관적인 인터페이스
