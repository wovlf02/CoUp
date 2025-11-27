# 최적화 가이드 - 04: 코드 분할 (Code Splitting)

> **파일**: 04-code-splitting.md  
> **분량**: ~800줄

---

## 1. 개요

코드 분할(Code Splitting)은 JavaScript 번들을 여러 개의 작은 청크(chunk)로 나누는 기술입니다. 이를 통해 사용자가 특정 페이지에 처음 접속했을 때, 해당 페이지를 렌더링하는 데 **필요한 최소한의 코드**만 다운로드하도록 할 수 있습니다. 나머지 코드는 사용자가 다른 페이지로 이동하거나 특정 기능이 필요해지는 시점에 동적으로 로드됩니다.

코드 분할의 주된 목표는 초기 페이지 로딩 속도를 개선하여 사용자 경험을 향상시키는 것입니다.

Next.js는 코드 분할을 자동으로 지원하며, 개발자는 `next/dynamic`을 통해 이를 더 세밀하게 제어할 수 있습니다.

### Next.js의 자동 코드 분할
- **페이지 기반 분할**: Next.js는 기본적으로 `app/` 또는 `pages/` 디렉토리의 각 페이지를 별도의 JavaScript 청크로 분할합니다. 사용자가 `/admin/dashboard` 페이지에 접속하면, `/admin/users` 페이지의 코드는 로드되지 않습니다.
- **공유 모듈 분할**: 여러 페이지에서 공통으로 사용되는 라이브러리(예: `react`, `lodash`)는 `vendors` 청크로 분리되어, 한 번 다운로드되면 브라우저 캐시를 통해 재사용됩니다.

---

## 2. 동적 임포트 (Dynamic Import)

`next/dynamic`은 React 컴포넌트를 동적으로, 즉 필요할 때만 로드할 수 있게 해주는 기능입니다. 일반적인 `import` 문은 정적으로, 파일 상단에서 사용되며 해당 모듈은 부모 청크에 포함됩니다. 반면, 동적 임포트는 클라이언트 측에서 특정 조건이 만족되었을 때만 컴포넌트의 코드를 로드합니다.

### 2.1 사용 사례

- **무거운 라이브러리를 사용하는 컴포넌트**: 차트 라이브러리(`recharts`), WYSIWYG 에디터, 코드 하이라이터 등 크기가 큰 외부 라이브러리를 포함하는 컴포넌트.
- **사용자 인터랙션에 의해 표시되는 컴포넌트**: 모달(Modal), 팝업, 드롭다운 메뉴 등 버튼 클릭과 같은 특정 이벤트에 의해서만 렌더링되는 컴포넌트.
- **특정 사용자에게만 보이는 컴포넌트**: 관리자 전용 기능이나 특정 권한을 가진 사용자에게만 보이는 컴포넌트.

### 2.2 구현 예시: 차트 라이브러리 지연 로딩

관리자 대시보드에 사용되는 활동 그래프는 `recharts`라는 무거운 라이브러리를 사용합니다. 이 컴포넌트를 동적으로 임포트하면 초기 로딩 성능을 개선할 수 있습니다.

**`components/admin/dashboard/ActivityGraph.tsx` (지연 로딩 대상)**
```tsx
'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export default function ActivityGraph({ data }) {
  // ... 차트 렌더링 로직
  return (
    <LineChart data={data}>
      {/* ... */}
    </LineChart>
  );
}
```

**`app/admin/dashboard/page.tsx` (사용하는 곳)**
```tsx
import dynamic from 'next/dynamic';

// ActivityGraph 컴포넌트를 동적으로 임포트
const DynamicActivityGraph = dynamic(
  () => import('@/components/admin/dashboard/ActivityGraph'),
  { 
    // 로딩 중에 보여줄 UI
    loading: () => <p>Loading chart...</p>,
    // 서버 사이드 렌더링(SSR) 비활성화
    // 이 컴포넌트가 window 객체 등 브라우저 API에 의존할 경우 필요
    ssr: false 
  }
);

export default function DashboardPage() {
  const chartData = [ ... ]; // 데이터

  return (
    <div>
      <h1>Dashboard</h1>
      {/* ... 다른 컴포넌트들 */}
      
      {/* DynamicActivityGraph는 필요 시점에 코드를 로드하여 렌더링 */}
      <DynamicActivityGraph data={chartData} />
    </div>
  );
}
```
- **`loading` 옵션**: 동적 컴포넌트가 로드되는 동안 사용자에게 보여줄 폴백(fallback) UI(예: 스켈레톤, 로딩 스피너)를 지정할 수 있습니다.
- **`ssr: false` 옵션**: 컴포넌트가 `window`나 `document`와 같은 브라우저 전용 API를 사용하는 경우, 서버 사이드 렌더링 시 에러가 발생할 수 있습니다. 이 옵션은 해당 컴포넌트의 서버 렌더링을 비활성화하고 클라이언트에서만 렌더링되도록 합니다. 차트 라이브러리는 내부적으로 브라우저 API를 사용하는 경우가 많아 이 옵션이 자주 필요합니다.

---

## 3. 번들 크기 분석

코드 분할을 효과적으로 적용하려면, 먼저 애플리케이션의 어느 부분이 무거운지 알아야 합니다. `@next/bundle-analyzer`는 각 JavaScript 번들과 청크의 크기, 그리고 어떤 라이브러리가 포함되어 있는지 시각적으로 분석해주는 도구입니다.

### 3.1 설정 방법

1.  **패키지 설치**:
    ```bash
    npm install --save-dev @next/bundle-analyzer
    ```
2.  **`next.config.mjs` 설정**:
    ```javascript
    import bundleAnalyzer from '@next/bundle-analyzer';

    const withBundleAnalyzer = bundleAnalyzer({
      enabled: process.env.ANALYZE === 'true',
    });

    /** @type {import('next').NextConfig} */
    const nextConfig = {
      // ... 기타 설정
    };

    export default withBundleAnalyzer(nextConfig);
    ```
3.  **분석 스크립트 실행**:
    ```bash
    # package.json의 scripts에 추가
    "scripts": {
      "analyze": "cross-env ANALYZE=true next build"
    }
    ```
    `npm run analyze` 명령어를 실행하면 빌드 과정이 끝난 후, 브라우저에 번들 분석 리포트가 자동으로 열립니다. 이 리포트를 통해 예상치 못하게 크기가 큰 라이브러리를 찾아내고, 해당 부분을 동적 임포트 대상으로 고려할 수 있습니다.

---

## 4. Tree Shaking

Tree Shaking은 모던 JavaScript 번들러(Webpack, Rollup 등)의 기능으로, 실제로 사용되지 않는 코드를 최종 번들에서 제거하는 프로세스를 말합니다.

- **ESM(ES Modules) 사용**: Tree Shaking은 `import`/`export` 구문을 사용하는 ES 모듈에서 가장 잘 동작합니다. `require`를 사용하는 CommonJS 모듈은 정적 분석이 어려워 Tree Shaking이 제한될 수 있습니다.
- **라이브러리 선택**: `lodash` 대신 `lodash-es`를 사용하거나, 라이브러리에서 필요한 함수만 개별적으로 임포트하면(예: `import { debounce } from 'lodash-es'`), 번들 크기를 줄이는 데 도움이 됩니다.

---

**이전**: [03-database.md](03-database.md)  
**다음**: [05-performance.md](05-performance.md)

**작성일**: 2025-11-28
