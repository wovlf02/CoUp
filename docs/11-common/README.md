# 공통 컴포넌트 도메인 (Common)

## 개요

CoUp 프로젝트의 공통 컴포넌트 도메인은 애플리케이션 전반에서 재사용되는 UI 컴포넌트와 유틸리티를 제공합니다.
일관된 사용자 경험과 코드 재사용성을 위해 설계되었습니다.

### 주요 특징

- **재사용성**: 여러 페이지에서 공통으로 사용되는 컴포넌트
- **일관성**: 통일된 디자인 시스템 적용
- **접근성**: ARIA 레이블 및 키보드 네비게이션 지원
- **반응형**: 모바일/데스크톱 대응

---

## 컴포넌트 구조

```
src/components/
├── common/                    # 공통 컴포넌트
│   ├── RestrictionBanner.jsx  # 활동 제한 배너
│   └── RestrictionBanner.module.css
│
├── ui/                        # 기본 UI 컴포넌트
│   ├── index.js               # 통합 export
│   ├── ConnectionBanner.js    # 연결 상태 배너
│   ├── EmptyState.js          # 빈 상태 표시
│   ├── ErrorToast.js          # 에러 토스트
│   ├── LoadingSpinner.js      # 로딩 스피너
│   └── MessageError.js        # 메시지 에러
│
├── layout/                    # 레이아웃 컴포넌트
│   ├── Header.jsx             # 헤더
│   ├── Footer.jsx             # 푸터
│   ├── Sidebar.jsx            # 사이드바
│   └── Navigation.jsx         # 네비게이션
│
├── Providers.js               # 전역 Provider 래퍼
└── ScrollToTop.jsx            # 스크롤 상단 이동
```

---

## 공통 컴포넌트 (common/)

### 1. RestrictionBanner (활동 제한 배너)

**파일 위치:** `src/components/common/RestrictionBanner.jsx`

사용자 계정에 적용된 활동 제한을 알리는 배너입니다.

```javascript
interface RestrictionBannerProps {
  // Props 없음 - useRestriction 훅으로 상태 관리
}

// 내부 상태 (useRestriction 훅)
interface RestrictionState {
  isRestricted: boolean;
  restrictedActions: RestrictedAction[];
  restrictedUntil: DateTime | null;
}

type RestrictedAction = 
  | 'STUDY_CREATE'    // 스터디 생성 제한
  | 'STUDY_JOIN'      // 스터디 가입 제한
  | 'MESSAGE';        // 메시지 전송 제한
```

**사용 예시:**

```jsx
import RestrictionBanner from '@/components/common/RestrictionBanner';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <RestrictionBanner />
      {children}
    </div>
  );
}
```

**표시 정보:**

| 정보 | 설명 |
|------|------|
| 제한된 활동 | 스터디 생성, 스터디 가입, 메시지 전송 등 |
| 해제 예정일 | 제한 해제 날짜/시간 또는 "영구" |

**스타일링:**

```css
.banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
  border-left: 4px solid #ffc107;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.icon {
  flex-shrink: 0;
  color: #856404;
}

.title {
  font-weight: 600;
  color: #856404;
}

.details {
  font-size: 0.875rem;
  color: #856404;
}
```

---

## UI 컴포넌트 (ui/)

### 1. ConnectionBanner (연결 상태 배너)

**파일 위치:** `src/components/ui/ConnectionBanner.js`

실시간 연결 상태(소켓)를 표시하는 배너입니다.

```javascript
interface ConnectionBannerProps {
  isConnected: boolean;
  onReconnect?: () => void;
}
```

**상태별 표시:**

| 상태 | 색상 | 메시지 |
|------|------|--------|
| 연결됨 | 초록색 | "연결됨" |
| 연결 끊김 | 빨간색 | "연결이 끊어졌습니다. 재연결 중..." |
| 재연결 중 | 노란색 | "재연결 시도 중..." |

### 2. EmptyState (빈 상태 표시)

**파일 위치:** `src/components/ui/EmptyState.js`

데이터가 없을 때 표시하는 빈 상태 컴포넌트입니다.

```javascript
interface EmptyStateProps {
  icon?: ReactNode;           // 아이콘
  title: string;              // 제목
  description?: string;       // 설명
  action?: {                  // 액션 버튼
    label: string;
    onClick: () => void;
  };
}
```

**사용 예시:**

```jsx
import { EmptyState } from '@/components/ui';

function StudyList({ studies }) {
  if (studies.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="스터디가 없습니다"
        description="첫 번째 스터디를 만들어보세요!"
        action={{
          label: "스터디 만들기",
          onClick: () => router.push('/studies/create')
        }}
      />
    );
  }
  
  return <StudyGrid studies={studies} />;
}
```

### 3. ErrorToast (에러 토스트)

**파일 위치:** `src/components/ui/ErrorToast.js`

에러 발생 시 표시하는 토스트 알림입니다.

```javascript
interface ErrorToastProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  duration?: number;          // 자동 닫힘 시간 (ms)
  onClose?: () => void;
}
```

**타입별 스타일:**

| 타입 | 아이콘 | 색상 |
|------|--------|------|
| `error` | ❌ | 빨간색 (#EF4444) |
| `warning` | ⚠️ | 노란색 (#F59E0B) |
| `info` | ℹ️ | 파란색 (#3B82F6) |
| `success` | ✅ | 초록색 (#10B981) |

### 4. LoadingSpinner (로딩 스피너)

**파일 위치:** `src/components/ui/LoadingSpinner.js`

로딩 상태를 표시하는 스피너입니다.

```javascript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;              // 로딩 텍스트
  fullScreen?: boolean;       // 전체 화면 오버레이
}
```

**크기별 사이즈:**

| 크기 | 직경 |
|------|------|
| `small` | 16px |
| `medium` | 32px |
| `large` | 48px |

**사용 예시:**

```jsx
import { LoadingSpinner } from '@/components/ui';

function DataLoader({ isLoading, children }) {
  if (isLoading) {
    return <LoadingSpinner size="large" text="데이터를 불러오는 중..." />;
  }
  return children;
}
```

### 5. MessageError (메시지 에러)

**파일 위치:** `src/components/ui/MessageError.js`

인라인 에러 메시지 표시 컴포넌트입니다.

```javascript
interface MessageErrorProps {
  message: string;
  onRetry?: () => void;
}
```

---

## 레이아웃 컴포넌트 (layout/)

### 1. Header (헤더)

**파일 위치:** `src/components/layout/Header.jsx`

사이트 상단 헤더 컴포넌트입니다.

```javascript
interface HeaderProps {
  user?: User | null;
  showSearch?: boolean;
  transparent?: boolean;
}
```

**포함 요소:**

- 로고
- 네비게이션 메뉴
- 검색 바 (선택적)
- 알림 버튼
- 사용자 프로필 드롭다운

### 2. Sidebar (사이드바)

**파일 위치:** `src/components/layout/Sidebar.jsx`

페이지 사이드바 컴포넌트입니다.

```javascript
interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onCollapse?: () => void;
}

interface SidebarItem {
  icon: ReactNode;
  label: string;
  href: string;
  badge?: number;
  subItems?: SidebarItem[];
}
```

---

## 전역 Provider

### Providers.js

**파일 위치:** `src/components/Providers.js`

애플리케이션 전역 Provider를 래핑합니다.

```javascript
'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from '@/contexts/SocketContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5분
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
```

### Provider 구조

```
Providers
├── SessionProvider (NextAuth)
│   └── QueryClientProvider (TanStack Query)
│       └── ThemeProvider (테마)
│           └── SocketProvider (Socket.IO)
│               └── children
```

---

## ScrollToTop 컴포넌트

**파일 위치:** `src/components/ScrollToTop.jsx`

스크롤 상단 이동 버튼입니다.

```javascript
interface ScrollToTopProps {
  showAt?: number;            // 표시 임계값 (px)
  smooth?: boolean;           // 부드러운 스크롤
}
```

**동작:**

1. 스크롤이 임계값(기본 300px)을 넘으면 버튼 표시
2. 클릭 시 페이지 상단으로 스크롤
3. 부드러운 애니메이션 지원

---

## 커스텀 훅

### useRestriction

**파일 위치:** `src/hooks/useRestriction.js`

사용자의 활동 제한 상태를 관리하는 훅입니다.

```javascript
function useRestriction() {
  const { data: session } = useSession();
  
  const isRestricted = useMemo(() => {
    if (!session?.user) return false;
    return session.user.restrictedActions?.length > 0;
  }, [session]);

  const restrictedActions = session?.user?.restrictedActions || [];
  const restrictedUntil = session?.user?.restrictedUntil;

  return {
    isRestricted,
    restrictedActions,
    restrictedUntil,
    canPerformAction: (action) => !restrictedActions.includes(action)
  };
}
```

**사용 예시:**

```jsx
import { useRestriction } from '@/hooks/useRestriction';

function CreateStudyButton() {
  const { canPerformAction } = useRestriction();
  
  if (!canPerformAction('STUDY_CREATE')) {
    return (
      <Button disabled title="스터디 생성이 제한되었습니다">
        스터디 만들기
      </Button>
    );
  }
  
  return <Button onClick={handleCreate}>스터디 만들기</Button>;
}
```

---

## 스타일링 가이드

### CSS 모듈 사용

```jsx
import styles from './Component.module.css';

export default function Component() {
  return <div className={styles.container}>...</div>;
}
```

### 공통 변수 (CSS Variables)

```css
:root {
  /* 색상 */
  --color-primary: #6366F1;
  --color-secondary: #8B5CF6;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* 배경 */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  
  /* 텍스트 */
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  
  /* 간격 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* 반경 */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;
  
  /* 그림자 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* 트랜지션 */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}
```

### 반응형 브레이크포인트

```css
/* 모바일 우선 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## 접근성 (A11y)

### ARIA 레이블

```jsx
<button
  aria-label="메뉴 열기"
  aria-expanded={isOpen}
  aria-controls="menu-dropdown"
>
  <MenuIcon />
</button>

<div
  id="menu-dropdown"
  role="menu"
  aria-hidden={!isOpen}
>
  {/* 메뉴 항목 */}
</div>
```

### 키보드 네비게이션

```jsx
function DropdownMenu({ items }) {
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        focusNext();
        break;
      case 'ArrowUp':
        focusPrev();
        break;
      case 'Escape':
        closeMenu();
        break;
      case 'Enter':
      case ' ':
        selectItem();
        break;
    }
  };

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map(item => (
        <li key={item.id} role="menuitem" tabIndex={0}>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

### 포커스 관리

```jsx
import { useRef, useEffect } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // 모달 열릴 때 포커스 이동
      modalRef.current?.focus();
      
      // ESC 키로 닫기
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
```

---

## 에러 경계

### ErrorBoundary 컴포넌트

```jsx
'use client';

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // 에러 리포팅 서비스로 전송
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>문제가 발생했습니다</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 테스트

### 컴포넌트 테스트

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('제목을 표시한다', () => {
    render(<EmptyState title="데이터 없음" />);
    expect(screen.getByText('데이터 없음')).toBeInTheDocument();
  });

  it('액션 버튼 클릭 시 콜백을 호출한다', () => {
    const handleClick = jest.fn();
    render(
      <EmptyState
        title="테스트"
        action={{ label: '추가', onClick: handleClick }}
      />
    );
    
    fireEvent.click(screen.getByText('추가'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### 접근성 테스트

```javascript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('접근성 테스트', () => {
  it('EmptyState에 접근성 위반이 없어야 한다', async () => {
    const { container } = render(<EmptyState title="테스트" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## 사용 패턴

### 조건부 렌더링

```jsx
function DataView({ data, isLoading, error }) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <MessageError message={error.message} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="데이터가 없습니다" />;
  }

  return <DataList data={data} />;
}
```

### 복합 컴포넌트 패턴

```jsx
function Card({ children }) {
  return <div className={styles.card}>{children}</div>;
}

Card.Header = function CardHeader({ children }) {
  return <div className={styles.header}>{children}</div>;
};

Card.Body = function CardBody({ children }) {
  return <div className={styles.body}>{children}</div>;
};

Card.Footer = function CardFooter({ children }) {
  return <div className={styles.footer}>{children}</div>;
};

// 사용
<Card>
  <Card.Header>제목</Card.Header>
  <Card.Body>내용</Card.Body>
  <Card.Footer>푸터</Card.Footer>
</Card>
```

---

## 파일 명명 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `EmptyState.jsx` |
| 스타일 | kebab-case + .module | `empty-state.module.css` |
| 훅 | camelCase with use | `useRestriction.js` |
| 유틸리티 | camelCase | `formatDate.js` |
| 상수 | UPPER_SNAKE_CASE | `CONSTANTS.js` |

