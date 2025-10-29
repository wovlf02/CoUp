# 12. 코딩 컨벤션

일관성 있는 코드는 가독성을 높이고, 협업을 원활하게 하며, 장기적인 유지보수를 용이하게 만듭니다. CoUp 프로젝트의 모든 코드는 아래에 정의된 컨벤션을 따르는 것을 원칙으로 합니다.

## 1. 공통 원칙

- **언어별 표준을 따르세요**: 각 언어(TypeScript, JavaScript)와 프레임워크의 표준적인 컨벤션을 존중하고 따릅니다.
- **의미 있는 이름을 사용하세요**: 변수, 함수, 클래스의 이름은 그 역할과 의도를 명확히 드러내야 합니다. 축약어 사용은 지양하고, 명확성을 최우선으로 합니다.
- **커밋 메시지**: [Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/) 형식을 따릅니다.
  - **형식**: `<type>(<scope>): <subject>`
  - **예시**: `feat(auth): implement github social login`, `fix(study): correct member count logic`

--- 

## 2. TypeScript/JavaScript 코드 (Next.js 풀스택 & 시그널링 서버)

- **적용 대상**: `frontend` (Next.js 풀스택), `signaling` (Node.js) 프로젝트
- **코드 포맷팅**: **Prettier**를 사용하여 코드 스타일을 통일합니다.
- **정적 분석**: **ESLint**를 사용하여 잠재적인 버그와 안티 패턴을 방지합니다.
- **타입 검사**: **TypeScript**를 사용하여 컴파일 시점에 타입 오류를 방지하고 코드의 안정성을 높입니다.

### 2.1. 네이밍 컨벤션

- **`camelCase`**: 변수, 함수, 인스턴스
- **`PascalCase`**: React 컴포넌트, 클래스, 인터페이스, 타입
- **`UPPER_SNAKE_CASE`**: 상수, 환경 변수
- **파일 이름**:
  - **React 컴포넌트**: `PascalCase.tsx` (예: `UserProfile.tsx`)
  - **Next.js API Routes**: `route.ts`
  - **그 외 모든 파일**: `kebab-case.ts` 또는 `kebab-case.js` (예: `user-store.ts`, `socket-handler.ts`)

### 2.2. React / Next.js 관련

- **컴포넌트 선언**: `function` 키워드를 사용한 함수 선언 방식을 사용합니다.
- **Props 검증**: TypeScript 인터페이스 또는 타입을 사용하여 컴포넌트의 props를 검증합니다. (`prop-types` 대신 TypeScript 사용)
- **이벤트 핸들러**: `handle` 접두사로 시작합니다. (예: `handleUserClick`)
- **Hooks**: `use` 접두사로 시작합니다. (예: `useUserData.ts`)