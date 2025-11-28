# 🎨 관리자 페이지 디자인 개선 - 다음 세션 프롬프트

**작성일**: 2025-11-29  
**목표**: Phase 1 (디자인 시스템 구축) 시작

---

## 📋 세션 시작 프롬프트

```
안녕! 관리자 페이지 디자인 개선 작업을 시작할게.

이전 세션에서 모든 기능 오류를 수정했고, 이제 디자인을 현대적으로 개선할 차례야.

다음 문서들을 먼저 확인해줘:
1. docs/admin/DESIGN-IMPROVEMENT-PLAN.md - 전체 설계
2. docs/admin/DESIGN-TODO.md - 상세 TODO 리스트

오늘은 Phase 1 (디자인 시스템 구축)을 진행할거야:

1. CSS 변수 정의 (색상, 타이포그래피, 간격, 그림자 등)
2. 기본 UI 컴포넌트 5개 구현:
   - Button (variants, sizes, states, icons)
   - Input (types, states, icons, validation)
   - Select (single/multi, searchable)
   - Badge (개선)
   - Card (header, content, footer)

작업 시작하자!
```

---

## 🎯 세션 목표

### Phase 1: 디자인 시스템 구축 (이번 세션)

#### 1단계: CSS 변수 정의 (30분)
**목표**: 일관된 디자인 토큰 구축

**작업**:
1. `coup/src/styles/admin-tokens.css` 생성
2. 색상 팔레트 정의
3. 타이포그래피 시스템
4. 간격/그림자/경계선/애니메이션
5. `globals.css`에 import

**결과물**: CSS 변수 파일 1개

---

#### 2단계: Button 컴포넌트 (45분)
**목표**: 재사용 가능한 버튼 시스템

**작업**:
1. `components/admin/ui/Button/Button.jsx` 생성
2. Variants 구현: primary, secondary, outline, ghost, danger
3. Sizes 구현: xs, sm, md, lg, xl
4. States: loading, disabled, active
5. 아이콘 지원 (left, right)
6. CSS 모듈 작성
7. 테스트 페이지 (`app/admin/design-test/page.jsx`)

**결과물**: 
- Button.jsx
- Button.module.css
- index.js
- 테스트 페이지

**참고 코드**:
```jsx
<Button variant="primary" size="md">저장</Button>
<Button variant="outline" size="sm" leftIcon={<PlusIcon />}>추가</Button>
<Button variant="danger" loading>삭제 중...</Button>
```

---

#### 3단계: Input 컴포넌트 (45분)
**목표**: 폼 입력 필드 표준화

**작업**:
1. `components/admin/ui/Input/Input.jsx` 생성
2. Types: text, email, password, number, tel, url
3. States: error, disabled, readonly
4. 아이콘 지원 (left, right)
5. Label, helper text, error message
6. CSS 모듈 작성
7. 테스트 페이지에 추가

**결과물**:
- Input.jsx
- Input.module.css
- index.js

**참고 코드**:
```jsx
<Input
  label="이메일"
  type="email"
  placeholder="email@example.com"
  error="유효하지 않은 이메일입니다"
  helperText="회사 이메일을 입력하세요"
  leftIcon={<EmailIcon />}
/>
```

---

#### 4단계: Select 컴포넌트 (45분)
**목표**: 선택 입력 표준화

**작업**:
1. `components/admin/ui/Select/Select.jsx` 생성
2. 단일/다중 선택
3. 검색 기능 (optional)
4. 그룹핑 지원
5. CSS 모듈
6. 테스트 페이지에 추가

**결과물**:
- Select.jsx
- Select.module.css
- index.js

**참고 코드**:
```jsx
<Select
  label="상태"
  options={[
    { value: 'active', label: '활성' },
    { value: 'inactive', label: '비활성' }
  ]}
  placeholder="선택하세요"
/>
```

---

#### 5단계: Badge 컴포넌트 개선 (30분)
**목표**: 상태 표시 개선

**작업**:
1. 기존 `Badge.jsx` 개선
2. Variants: default, primary, success, warning, danger, info
3. Sizes: sm, md, lg
4. Props: dot, removable
5. 애니메이션 추가

**결과물**: 개선된 Badge 컴포넌트

**참고 코드**:
```jsx
<Badge variant="success" size="md" dot>활성</Badge>
<Badge variant="danger">정지</Badge>
```

---

#### 6단계: Card 컴포넌트 (45분)
**목표**: 컨텐츠 컨테이너 표준화

**작업**:
1. `components/admin/ui/Card/Card.jsx` 생성
2. CardHeader, CardContent, CardFooter 서브 컴포넌트
3. Variants: default, elevated, outlined
4. hoverable, clickable
5. CSS 모듈
6. 테스트 페이지에 추가

**결과물**:
- Card.jsx
- CardHeader.jsx
- CardContent.jsx
- CardFooter.jsx
- Card.module.css
- index.js

**참고 코드**:
```jsx
<Card variant="elevated" hoverable>
  <CardHeader>
    <h3>제목</h3>
  </CardHeader>
  <CardContent>
    내용...
  </CardContent>
  <CardFooter>
    <Button>액션</Button>
  </CardFooter>
</Card>
```

---

## 📁 생성될 파일 구조

```
coup/src/
├── styles/
│   ├── admin-tokens.css          # NEW
│   └── globals.css               # UPDATED
├── components/admin/ui/
│   ├── Button/                   # NEW
│   │   ├── Button.jsx
│   │   ├── Button.module.css
│   │   └── index.js
│   ├── Input/                    # NEW
│   │   ├── Input.jsx
│   │   ├── Input.module.css
│   │   └── index.js
│   ├── Select/                   # NEW
│   │   ├── Select.jsx
│   │   ├── Select.module.css
│   │   └── index.js
│   ├── Badge/                    # UPDATED
│   │   ├── Badge.jsx
│   │   └── Badge.module.css
│   └── Card/                     # NEW
│       ├── Card.jsx
│       ├── CardHeader.jsx
│       ├── CardContent.jsx
│       ├── CardFooter.jsx
│       ├── Card.module.css
│       └── index.js
└── app/admin/
    └── design-test/              # NEW (테스트 페이지)
        └── page.jsx
```

---

## 🎨 디자인 스펙 (빠른 참고)

### 색상
```css
/* Primary */
--primary-500: #3b82f6;
--primary-600: #2563eb;

/* Success */
--success-500: #22c55e;

/* Danger */
--danger-500: #ef4444;

/* Gray */
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-600: #4b5563;
--gray-900: #111827;
```

### 간격
```css
--space-1: 4px;
--space-2: 8px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

### 그림자
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

### 경계선
```css
--radius: 8px;
--radius-lg: 16px;
--border-1: 1px;
```

---

## ✅ 체크리스트

### CSS 변수
- [ ] admin-tokens.css 생성
- [ ] 색상 정의 (primary, semantic, neutral)
- [ ] 타이포그래피 정의
- [ ] 간격 정의
- [ ] 그림자 정의
- [ ] 경계선 정의
- [ ] 애니메이션 정의
- [ ] globals.css import

### Button
- [ ] Button.jsx 생성
- [ ] 5가지 variants
- [ ] 5가지 sizes
- [ ] loading/disabled states
- [ ] 아이콘 지원
- [ ] CSS 모듈
- [ ] 테스트 페이지

### Input
- [ ] Input.jsx 생성
- [ ] 6가지 types
- [ ] error/disabled states
- [ ] 아이콘 지원
- [ ] label/helper/error text
- [ ] CSS 모듈
- [ ] 테스트 페이지

### Select
- [ ] Select.jsx 생성
- [ ] 단일/다중 선택
- [ ] 검색 기능 (basic)
- [ ] CSS 모듈
- [ ] 테스트 페이지

### Badge
- [ ] Badge.jsx 개선
- [ ] 6가지 variants
- [ ] 3가지 sizes
- [ ] dot/removable props
- [ ] 애니메이션

### Card
- [ ] Card.jsx + 서브 컴포넌트
- [ ] 3가지 variants
- [ ] hoverable/clickable
- [ ] CSS 모듈
- [ ] 테스트 페이지

---

## 🚀 시작 전 확인사항

### 환경
- [ ] 개발 서버 실행 중 (`npm run dev`)
- [ ] 브라우저 DevTools 열림
- [ ] 에디터 준비

### 패키지 설치 (필요시)
```bash
npm install clsx
```

### 폴더 생성
```bash
# Windows (cmd)
mkdir coup\src\components\admin\ui\Button
mkdir coup\src\components\admin\ui\Input
mkdir coup\src\components\admin\ui\Select
mkdir coup\src\components\admin\ui\Card
mkdir coup\src\app\admin\design-test
```

---

## 📝 작업 진행 방법

1. **CSS 변수부터 시작** (기반)
2. **컴포넌트는 하나씩** (Button → Input → Select → Badge → Card)
3. **각 컴포넌트 완성 후 테스트 페이지에 추가**
4. **에러 발생 시 즉시 수정**
5. **커밋은 컴포넌트 단위로**

---

## 🎯 성공 기준

### 기능
- ✅ 모든 컴포넌트가 props에 따라 올바르게 렌더링
- ✅ 버튼 클릭 시 적절한 동작
- ✅ 입력 필드에 타이핑 가능
- ✅ Select 드롭다운 열림/닫힘
- ✅ 카드 hover 효과

### 스타일
- ✅ 일관된 색상 사용
- ✅ 적절한 간격
- ✅ 부드러운 애니메이션
- ✅ 반응형 (모바일 고려)

### 코드 품질
- ✅ PropTypes 정의
- ✅ 기본값 설정
- ✅ 주석 작성
- ✅ 모듈화

---

## 💡 팁

### CSS 변수 사용
```css
/* 좋은 예 */
.button {
  background: var(--primary-500);
  padding: var(--space-4);
  border-radius: var(--radius);
  transition: var(--transition-base);
}

/* 나쁜 예 */
.button {
  background: #3b82f6;
  padding: 16px;
  border-radius: 8px;
  transition: 250ms;
}
```

### clsx 사용
```jsx
import clsx from 'clsx'

const buttonClass = clsx(
  styles.button,
  styles[`button--${variant}`],
  styles[`button--${size}`],
  {
    [styles['button--loading']]: loading,
    [styles['button--disabled']]: disabled
  }
)
```

### 컴포넌트 구조
```jsx
export default function Component({
  variant = 'default',
  size = 'md',
  disabled = false,
  ...props
}) {
  // 로직
  
  return (
    <element className={classes} {...props}>
      {children}
    </element>
  )
}

Component.propTypes = { ... }
```

---

## 🔗 참고 링크

### 디자인 시스템 예시
- [Radix UI](https://www.radix-ui.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Chakra UI](https://chakra-ui.com/)

### CSS 모듈
- [Next.js CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)

### 접근성
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)

---

## 📊 예상 소요 시간

| 작업 | 시간 | 누적 |
|------|------|------|
| CSS 변수 | 30분 | 30분 |
| Button | 45분 | 1시간 15분 |
| Input | 45분 | 2시간 |
| Select | 45분 | 2시간 45분 |
| Badge | 30분 | 3시간 15분 |
| Card | 45분 | 4시간 |
| 테스트/정리 | 30분 | 4시간 30분 |

**총 예상 시간**: 4-5시간

---

## 🎬 세션 종료 시

### 완료 확인
- [ ] 모든 컴포넌트 동작 확인
- [ ] 테스트 페이지 스크린샷
- [ ] 에러 없음 확인
- [ ] TODO 체크

### 다음 세션 준비
- [ ] Phase 2 문서 읽기
- [ ] 필요한 패키지 확인
- [ ] 작업 계획 수립

### 문서 업데이트
- [ ] DESIGN-TODO.md 체크박스 업데이트
- [ ] 스크린샷 저장 (docs/admin/screenshots/)
- [ ] 진행 상황 기록

---

**작성일**: 2025-11-29  
**예상 완료일**: 2025-11-30  
**난이도**: ⭐⭐⭐ (중)

---

## 🔥 시작하자!

준비되면 다음과 같이 시작해:

```
Phase 1 시작! 먼저 coup/src/styles/admin-tokens.css 파일을 생성하고 
CSS 변수를 정의하자. 색상, 타이포그래피, 간격, 그림자, 경계선, 애니메이션 
토큰을 모두 포함해야 해.
```

**화이팅! 🚀**

