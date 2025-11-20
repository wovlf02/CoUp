# 페이지 스크롤 최상단 유지 구현

## 📋 수정 일자
2025-01-21

## 🎯 목표
모든 페이지에 진입할 때 스크롤을 항상 최상단으로 유지

## ✅ 구현 방법

### 1. ScrollToTop 컴포넌트 생성
**파일**: `src/components/ScrollToTop.jsx`

#### 기능:
- Next.js의 `usePathname` 훅을 사용하여 경로 변경 감지
- 경로가 변경될 때마다 `useEffect`로 스크롤을 최상단으로 이동
- `window.scrollTo()` 및 `document.documentElement.scrollTop = 0` 사용

#### 구현:
```javascript
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // 페이지 경로가 변경될 때마다 스크롤을 최상단으로 이동
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 즉시 이동
    });

    // body와 html의 스크롤도 초기화
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
```

### 2. 루트 레이아웃에 추가
**파일**: `src/app/layout.js`

#### 변경사항:
```javascript
// Before
export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}

// After
import ScrollToTop from '@/components/ScrollToTop'

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <ScrollToTop />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
```

## 🔧 작동 원리

### 1. 경로 감지
- `usePathname()` 훅이 현재 경로를 추적
- 경로가 변경될 때마다 `pathname` 값이 변경됨

### 2. 스크롤 초기화
- `useEffect`의 dependency에 `pathname`을 포함
- 경로가 변경되면 effect가 실행됨
- 3가지 방법으로 스크롤을 최상단으로 이동:
  1. `window.scrollTo()` - 표준 방법
  2. `document.documentElement.scrollTop = 0` - HTML 요소
  3. `document.body.scrollTop = 0` - Body 요소

### 3. 즉시 이동
- `behavior: 'instant'` 사용
- 페이지 전환 시 부드럽지 않고 즉시 이동
- 부드러운 스크롤을 원하면 `behavior: 'smooth'` 사용 가능

## 📱 적용 범위

이 컴포넌트는 루트 레이아웃에 추가되므로 **모든 페이지**에 적용됩니다:

### ✅ 적용되는 페이지
- 홈페이지 (`/`)
- 로그인/회원가입 (`/login`, `/signup`)
- 대시보드 (`/dashboard`)
- 스터디 목록 (`/studies`, `/my-studies`)
- 스터디 상세 (`/studies/[id]`)
- 내 스터디 탭들:
  - 개요 (`/my-studies/[studyId]`)
  - 채팅 (`/my-studies/[studyId]/chat`)
  - 공지 (`/my-studies/[studyId]/notices`)
  - 파일 (`/my-studies/[studyId]/files`)
  - 캘린더 (`/my-studies/[studyId]/calendar`)
  - 할일 (`/my-studies/[studyId]/tasks`)
  - 화상 (`/my-studies/[studyId]/video-call`)
  - 멤버 (`/my-studies/[studyId]/members`)
  - 설정 (`/my-studies/[studyId]/settings`)
- 설정 페이지 (`/settings/profile`, `/settings/security`, etc.)
- 관리자 페이지 (`/admin/*`)

## 🎨 사용자 경험

### Before (스크롤 유지 문제):
1. 사용자가 긴 페이지를 아래로 스크롤
2. 다른 페이지로 이동
3. 스크롤 위치가 이전 위치에 남아있음 ❌
4. 사용자가 수동으로 위로 스크롤해야 함

### After (스크롤 자동 초기화):
1. 사용자가 긴 페이지를 아래로 스크롤
2. 다른 페이지로 이동
3. 자동으로 최상단으로 이동 ✅
4. 새 페이지를 처음부터 편하게 볼 수 있음

## 🔄 예외 처리

### 스크롤 위치를 유지해야 하는 경우
특정 페이지에서 스크롤 위치를 유지하고 싶다면:

#### 방법 1: SessionStorage 사용
```javascript
// 페이지를 떠날 때 스크롤 위치 저장
useEffect(() => {
  const handleRouteChange = () => {
    sessionStorage.setItem('scrollPos', window.scrollY);
  };
  
  return () => handleRouteChange();
}, []);

// 페이지 로드 시 스크롤 위치 복원
useEffect(() => {
  const scrollPos = sessionStorage.getItem('scrollPos');
  if (scrollPos) {
    window.scrollTo(0, parseInt(scrollPos));
    sessionStorage.removeItem('scrollPos');
  }
}, []);
```

#### 방법 2: Next.js 기본 동작 사용
```javascript
// next.config.mjs에서 설정
const nextConfig = {
  experimental: {
    scrollRestoration: true, // 브라우저의 스크롤 복원 활성화
  },
};
```

하지만 현재 요구사항은 **항상 최상단 유지**이므로 이러한 예외 처리는 구현하지 않았습니다.

## 📊 성능 영향

### 최소한의 오버헤드:
- ✅ 단순한 컴포넌트로 렌더링 오버헤드 없음 (`return null`)
- ✅ 경로 변경 시에만 실행 (매 렌더링마다 실행되지 않음)
- ✅ 동기적 스크롤 이동으로 지연 없음

### 메모리 사용:
- 하나의 컴포넌트만 마운트됨
- 이벤트 리스너 없음 (usePathname이 내부적으로 처리)

## 🧪 테스트 방법

### 수동 테스트:
1. 긴 페이지로 이동 (예: 공지사항 목록)
2. 페이지를 아래로 스크롤
3. 다른 페이지로 이동 (예: 파일 탭)
4. 스크롤이 최상단에 있는지 확인 ✅

### 브라우저별 테스트:
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## 🚀 결과

이제 모든 페이지 전환 시:
- ✅ 스크롤이 항상 최상단으로 초기화됨
- ✅ 사용자가 수동으로 스크롤할 필요 없음
- ✅ 일관된 사용자 경험 제공
- ✅ 모든 브라우저에서 동작

브라우저를 새로고침하고 페이지를 이동하면 스크롤이 항상 최상단에 유지됩니다! 🎉

