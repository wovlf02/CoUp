# 최적화 가이드 - 05: 종합 성능 측정 및 개선

> **파일**: 05-performance.md  
> **분량**: ~700줄

---

## 1. 개요

이전 단계들에서 다룬 최적화 기법들(서버 컴포넌트, 캐싱, DB, 코드 분할)을 적용한 후, 실제 성능이 얼마나 개선되었는지 객관적인 지표를 통해 측정하고 추가적인 개선점을 찾는 과정이 필요합니다. 이 문서에서는 **코어 웹 바이탈(Core Web Vitals)**을 중심으로 프론트엔드 성능을 측정하고 개선하는 종합적인 방법을 다룹니다.

---

## 2. 코어 웹 바이탈 (Core Web Vitals)

코어 웹 바이탈은 실제 사용자 경험을 측정하기 위해 구글이 제안한 세 가지 핵심 성능 지표입니다. 이 지표들은 검색 엔진 순위에도 영향을 미칩니다.

1.  **LCP (Largest Contentful Paint)**: **로딩 성능**
    - 뷰포트(사용자에게 보이는 화면) 내에서 가장 큰 이미지 또는 텍스트 블록이 렌더링되기까지 걸리는 시간.
    - **목표**: 2.5초 미만

2.  **FID (First Input Delay) / INP (Interaction to Next Paint)**: **상호작용성**
    - 사용자가 페이지와 처음 상호작용(예: 버튼 클릭, 입력)했을 때, 브라우저가 해당 상호작용에 대한 처리를 시작하기까지 걸리는 시간. (FID는 INP로 대체될 예정)
    - **목표**: 100밀리초 미만 (INP는 200밀리초 미만)

3.  **CLS (Cumulative Layout Shift)**: **시각적 안정성**
    - 페이지가 로드되는 동안 발생하는 예기치 않은 레이아웃 이동(예: 이미지가 늦게 로드되면서 텍스트가 밀리는 현상)의 총합.
    - **목표**: 0.1 미만

---

## 3. 성능 측정 도구

### 3.1 Lighthouse

- **개요**: Chrome 개발자 도구에 내장된 웹사이트 품질 측정 도구. 성능, 접근성, SEO 등 다양한 항목을 검사하고 점수를 매겨줍니다.
- **사용법**:
  1.  Chrome에서 검사하고 싶은 페이지를 엽니다.
  2.  개발자 도구(F12)를 열고 'Lighthouse' 탭으로 이동합니다.
  3.  'Analyze page load' 버튼을 클릭합니다.
- **분석**: 리포트에서 Performance 점수와 함께 LCP, CLS 등의 지표를 확인하고, 'Opportunities' 섹션에 제시된 개선 사항(예: 'Properly size images', 'Eliminate render-blocking resources')을 참고하여 최적화를 진행합니다.

### 3.2 Vercel Speed Insights & Analytics

- **개요**: Vercel에 배포된 Next.js 프로젝트의 실제 사용자 성능 데이터를 수집하고 분석해주는 서비스.
- **설정**:
  1. `npm install @vercel/speed-insights @vercel/analytics`
  2. `app/layout.tsx`에 컴포넌트 추가:
     ```tsx
     import { SpeedInsights } from '@vercel/speed-insights/next';
     import { Analytics } from '@vercel/analytics/react';
     
     export default function RootLayout({ children }) {
       return (
         <html>
           <body>
             {children}
             <SpeedInsights />
             <Analytics />
           </body>
         </html>
       );
     }
     ```
- **활용**: Vercel 대시보드에서 실제 사용자들이 경험하는 LCP, FID, CLS 점수를 확인하고, 어떤 페이지에서 성능 저하가 발생하는지 파악할 수 있습니다. 실험실 환경(Lighthouse)에서는 발견하기 어려운 실제 네트워크 환경의 문제를 진단하는 데 유용합니다.

---

## 4. 주요 성능 개선 기법

### 4.1 이미지 최적화

이미지는 LCP 지표에 가장 큰 영향을 미치는 요소 중 하나입니다.

- **`next/image` 사용**: 모든 `<img>` 태그를 Next.js의 `<Image>` 컴포넌트로 교체합니다.
  - **자동 리사이징**: 원본 이미지 크기와 상관없이, 디바이스 크기에 맞는 최적화된 크기의 이미지를 자동으로 제공합니다.
  - **포맷 최적화**: 브라우저가 지원하는 경우, JPEG/PNG 대신 용량이 더 작은 WebP와 같은 최신 포맷으로 이미지를 자동 변환합니다.
  - **지연 로딩 (Lazy Loading)**: 기본적으로 뷰포트 밖에 있는 이미지는 사용자가 스크롤하여 가까워질 때까지 로딩하지 않습니다.
  - **`priority` 속성**: LCP에 해당하는 페이지 상단의 주요 이미지에는 `priority` 속성을 추가하여 다른 이미지보다 먼저 로드되도록 할 수 있습니다.

### 4.2 폰트 최적화

`next/font`를 사용하여 폰트 파일을 최적화하고, 폰트 로딩으로 인한 CLS를 방지할 수 있습니다.

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      {/* ... */}
    </html>
  );
}
```
`next/font`는 빌드 시점에 폰트 파일을 다운로드하여 다른 정적 에셋과 함께 호스팅하고, 폰트 관련 CSS를 자동으로 인라인 처리하여 폰트 로딩 시간을 최소화합니다.

### 4.3 렌더링 차단 리소스 제거

- **CSS**: `@import` 대신 `<link>` 태그를 사용하고, 페이지별로 필요한 최소한의 CSS만 로드되도록 합니다. (Next.js의 CSS Modules, Tailwind CSS 등은 이를 자동으로 처리)
- **JavaScript**: `<script>` 태그에 `async` 또는 `defer` 속성을 사용하여, 스크립트가 HTML 파싱을 차단하지 않도록 합니다. 서버 컴포넌트를 최대한 활용하고, 불필요한 클라이언트 컴포넌트를 줄이는 것이 근본적인 해결책입니다.

---

**이전**: [04-code-splitting.md](04-code-splitting.md)

**작성일**: 2025-11-28
