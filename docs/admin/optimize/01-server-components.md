# 최적화 가이드 - 01: 서버 컴포넌트 활용

> **파일**: 01-server-components.md  
> **분량**: ~900줄

---

## 1. 개요

Next.js 앱 라우터의 기본 컴포넌트인 **서버 컴포넌트(React Server Components, RSC)**는 서버에서만 렌더링되는 특별한 유형의 컴포넌트입니다. 서버 컴포넌트를 올바르게 활용하는 것은 Next.js 애플리케이션의 성능을 최적화하는 가장 기본적이고 중요한 전략입니다.

### 서버 컴포넌트의 장점
- **제로 번들 사이즈**: 서버 컴포넌트의 코드는 클라이언트(브라우저)로 전송되지 않습니다. 이는 클라이언트가 다운로드해야 할 JavaScript의 양을 줄여 초기 페이지 로딩 속도를 크게 향상시킵니다.
- **직접적인 데이터 접근**: 서버 컴포넌트는 `async/await`를 사용하여 데이터베이스나 외부 API에 직접 접근할 수 있습니다. 이를 통해 별도의 API 레이어 없이 데이터를 가져와 렌더링할 수 있어 코드가 간결해지고 성능이 향상됩니다.
- **보안**: 데이터베이스 접근 키, API 키 등 민감한 정보가 서버에만 머무르므로 클라이언트에 노출될 위험이 없습니다.
- **캐싱**: 서버 컴포넌트의 렌더링 결과는 서버에서 쉽게 캐시될 수 있어 반복적인 요청에 대한 응답 속도를 높일 수 있습니다.

---

## 2. 서버 컴포넌트 vs. 클라이언트 컴포넌트

| 특징 | 서버 컴포넌트 (기본값) | 클라이언트 컴포넌트 (`'use client'`) |
|---|---|---|
| **실행 위치** | 서버 | 서버(초기 렌더링) + 클라이언트 |
| **JS 번들 포함** | ❌ | ✅ |
| **데이터 페칭** | `async/await` 직접 사용 | `useEffect`, `SWR`, `React Query` 등 사용 |
| **상태 및 생명주기** | ❌ ( `useState`, `useEffect` 사용 불가) | ✅ |
| **브라우저 API 접근**| ❌ ( `window`, `localStorage` 사용 불가) | ✅ |
| **이벤트 핸들러** | ❌ ( `onClick`, `onChange` 등 사용 불가) | ✅ |
| **주 사용 사례** | 데이터 표시, 서버 작업 수행 | 상호작용 UI, 상태 관리, 브라우저 API 사용 |

---

## 3. 언제 무엇을 사용해야 하는가? (분리 기준)

성능을 극대화하려면 **가능한 한 많은 부분을 서버 컴포넌트로 유지**하고, 인터랙션이 필요한 부분만 최소한의 클라이언트 컴포넌트로 분리하는 것이 핵심입니다.

### 서버 컴포넌트 사용 사례
- 데이터를 가져와서 보여주기만 하는 페이지 (예: 대시보드, 상세 정보 페이지)
- 서버의 파일 시스템에 접근하거나, 데이터베이스에 직접 쿼리해야 하는 경우
- `async/await`를 사용하여 데이터를 페칭하는 로직
- 민감한 정보를 다루는 부분

### 클라이언트 컴포넌트 사용 사례
- `onClick`, `onChange` 등 이벤트 리스너가 필요한 컴포넌트 (예: 버튼, 폼, 입력 필드)
- `useState`, `useReducer` 등 상태 관리가 필요한 컴포넌트 (예: 탭, 드롭다운 메뉴)
- `useEffect` 등 생명주기 훅이 필요한 컴포넌트 (예: 애니메이션)
- `window`, `localStorage` 등 브라우저 전용 API를 사용하는 컴포넌트
- `SWR`, `React Query` 등 데이터 페칭 라이브러리를 사용하는 부분

---

## 4. 구현 패턴 및 예시

### 패턴 1: 데이터 페칭은 서버에서, 인터랙션은 클라이언트로

가장 일반적인 패턴입니다. 페이지 전체는 서버 컴포넌트로 만들어 데이터를 가져오고, 그 안에 인터랙티브한 UI가 필요할 때만 클라이언트 컴포넌트를 삽입합니다.

**`app/admin/users/[userId]/page.tsx` (서버 컴포넌트)**
```tsx
import { SuspendButton } from './SuspendButton'; // 클라이언트 컴포넌트

// DB에서 직접 데이터를 가져옴
async function getUserData(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export default async function UserDetailPage({ params }) {
  const user = await getUserData(params.userId);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Status: {user.status}</p>
      
      {/* 상태 변경 버튼은 인터랙션이 필요하므로 클라이언트 컴포넌트로 분리 */}
      <SuspendButton userId={user.id} currentStatus={user.status} />
    </div>
  );
}
```

**`app/admin/users/[userId]/SuspendButton.tsx` (클라이언트 컴포넌트)**
```tsx
'use client';

import { useState } from 'react';

export function SuspendButton({ userId, currentStatus }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    // API 호출 로직
    await fetch(`/api/admin/users/${userId}/suspend`, { method: 'POST' });
    setIsLoading(false);
    // ...
  };

  return (
    <button onClick={handleClick} disabled={isLoading || currentStatus === 'SUSPENDED'}>
      {isLoading ? 'Processing...' : 'Suspend User'}
    </button>
  );
}
```

### 패턴 2: 클라이언트 컴포넌트에 서버 컴포넌트 전달하기 (Holes)

클라이언트 컴포넌트의 일부 영역을 정적인 서버 컴포넌트로 채울 수 있습니다. 이는 클라이언트 컴포넌트의 번들 사이즈를 줄이는 데 도움이 됩니다. `children` props를 활용하는 것이 대표적인 예입니다.

**`components/admin/layout/Sidebar.tsx` (클라이언트 컴포넌트)**
```tsx
'use client';

import { useState } from 'react';

// children은 서버 컴포넌트일 수 있다.
export function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && nav}
    </aside>
  );
}
```

**`app/admin/layout.tsx` (서버 컴포넌트)**
```tsx
import { Sidebar } from '@/components/admin/layout/Sidebar';
import { MainNav } from '@/components/admin/layout/MainNav'; // 서버 컴포넌트

export default function AdminLayout({ children }) {
  return (
    <div>
      {/* Sidebar는 클라이언트 컴포넌트지만, 그 자식인 MainNav는 서버 컴포넌트 */}
      <Sidebar>
        <MainNav />
      </Sidebar>
      <main>{children}</main>
    </div>
  );
}
```

---

## 5. 주의사항

- **`'use client'` 전파**: 부모가 클라이언트 컴포넌트이면, 그 자식 컴포넌트들은 별도 명시가 없어도 모두 클라이언트 컴포넌트로 취급됩니다. (단, `children` props는 예외)
- **서버 컴포넌트에서 클라이언트 컴포넌트 import**: 자유롭게 가능합니다.
- **클라이언트 컴포넌트에서 서버 컴포넌트 import**: **불가능합니다.** 이 제약이 서버 컴포넌트의 코드가 클라이언트로 전송되지 않도록 보장합니다. 클라이언트 컴포넌트 안에서 서버 컴포넌트의 렌더링 결과가 필요하다면, `children` props를 통해 전달받아야 합니다.

---

**이전**: [00-index.md](00-index.md)  
**다음**: [02-caching.md](02-caching.md)

**작성일**: 2025-11-28
