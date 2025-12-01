# CoUp 예외 처리 구현 - Phase 5 계속 프롬프트

**프로젝트**: CoUp (스터디 관리 플랫폼)  
**현재 Phase**: Phase 5 - 테스트 및 문서화 (65% 완료)  
**영역**: profile  
**날짜**: 2025-12-01

---

## 📋 프로젝트 정보

### 기술 스택
- **프레임워크**: Next.js 16 App Router
- **언어**: JavaScript (ES6+) - TypeScript 사용 안 함
- **스타일**: Tailwind CSS + shadcn/ui
- **ORM**: Prisma
- **인증**: NextAuth v4
- **테스트**: Jest + React Testing Library

---

## ✅ 완료된 작업 (Phase 1-4)

### Phase 1: 분석 및 계획 ✅
- ✅ 현재 코드 분석 (12개 파일)
- ✅ 예외 설계 (90개 메서드, 7개 카테고리)
- ✅ Phase 계획 수립 (6개 Phase, 30시간)
- ✅ 문서화 완료

### Phase 2: 예외 클래스 및 유틸리티 구현 ✅
- ✅ **ProfileException.js** (90개 메서드)
- ✅ **validators.js** (13개 검증 함수)
- ✅ **profileLogger.js** (17개 로깅 함수)
- ✅ 테스트 66개 (100% 통과)

### Phase 3: API 라우트 강화 ✅
- ✅ **GET /api/users/me** - 프로필 조회 강화
- ✅ **PATCH /api/users/me** - 프로필 수정 강화
- ✅ **DELETE /api/users/me** - 계정 삭제 강화
- ✅ **POST /api/users/avatar** - 아바타 업로드 신규 생성
- ✅ **DELETE /api/users/avatar** - 아바타 삭제 신규 생성
- ✅ **PATCH /api/users/me/password** - 비밀번호 변경 강화

### Phase 4: 프론트엔드 통합 ✅
- ✅ **ProfileEdit.jsx** - 프로필 수정 폼 강화 (15개 에러 코드)
- ✅ **PasswordChange.jsx** - 비밀번호 변경 강화 (6개 에러 코드)
- ✅ **AccountDeletion.jsx** - 계정 삭제 컴포넌트 신규 생성 (4개 에러 코드)
- ✅ 토스트 메시지 시스템 구현
- ✅ 실시간 입력 검증
- ✅ 비밀번호 강도 표시기
- ✅ 요구사항 체크리스트
- ✅ 3개 CSS 파일 업데이트

**Phase 4 성과**:
- 25개 에러 코드 처리
- 7개 파일 수정/생성
- 사용자 경험 대폭 개선
- 보안 강화 (클라이언트/서버 이중 검증)

### Phase 5: 테스트 및 문서화 🔄 (65% 완료)

**완료된 작업**:
- ✅ Jest 및 Testing Library 설치 및 설정
- ✅ jest.config.js, jest.setup.js 생성
- ✅ API 테스트 3개 파일 작성 (37개 테스트 케이스)
  - `src/__tests__/api/users/me.test.js` (16개)
  - `src/__tests__/api/users/avatar.test.js` (11개)
  - `src/__tests__/api/users/password.test.js` (10개)
- ✅ 테스트 24개 통과 (65% 통과율)

**진행 중**:
- ⚠️ 13개 테스트 에러 코드 조정 필요
- ⚠️ 커버리지 70% → 목표 80%

**미완료**:
- ❌ 프론트엔드 컴포넌트 테스트
- ❌ 사용자 매뉴얼
- ❌ 개발자 문서

---

## 🎯 현재 작업: Phase 5 완료 - 테스트 및 문서화 (남은 4.5시간)

### 목표
구현된 기능들에 대한 테스트 작성을 완료하고, 사용자 및 개발자를 위한 문서를 작성합니다.

### 진행 상황
- ✅ **1단계 완료 (65%)**: Jest 설정 및 API 테스트 37개 작성 (24개 통과)
- 🔄 **다음 작업**: 에러 코드 조정 및 프론트엔드 테스트

---

## 📋 작업 순서

### 0단계: API 테스트 완료 ⚠️ (30분) - **우선 작업**

**현재 문제**:
- 13개 테스트에서 에러 코드 불일치
- 프롬프트 예상 vs 실제 구현 차이

**작업 내용**:
1. ProfileException.js에서 실제 에러 코드 확인
2. 테스트 파일의 예상 에러 코드 수정:
   - `me.test.js`: 6개 수정
   - `avatar.test.js`: 1개 수정 (완료)
   - `password.test.js`: 7개 수정

**수정할 에러 코드**:
```javascript
// me.test.js
PROFILE-016 → PROFILE-019 (계정 삭제)
PROFILE-017 → PROFILE-018 (계정 정지)
PROFILE-012 → PROFILE-002 (XSS - 이름 형식에 포함)
PROFILE-013 → PROFILE-002 (SQL Injection - 이름 형식에 포함)
PROFILE-067 → PROFILE-054 (확인 불일치)
PROFILE-064 → PROFILE-051 (OWNER 스터디 존재)

// password.test.js
PROFILE-055 → PROFILE-036 (비밀번호 필수)
PROFILE-056 → PROFILE-039 (비밀번호 약함)
PROFILE-061 → PROFILE-050 (비밀번호 불일치)
PROFILE-057 → PROFILE-046 (현재 비밀번호 틀림)
PROFILE-060 → PROFILE-049 (새 비밀번호 = 기존)
OAuth 계정 처리 조정
```

**완료 기준**:
- [ ] 37개 테스트 100% 통과
- [ ] npm test 실행 성공

### 1단계: 프론트엔드 컴포넌트 테스트 작성 (2시간)

### 1단계: 프론트엔드 컴포넌트 테스트 작성 (2시간)

**작업 내용**:
- 컴포넌트 렌더링 테스트
- 사용자 상호작용 테스트
- 에러 처리 테스트
- 토스트 메시지 테스트

**테스트할 컴포넌트**:
```
1. ProfileEdit.jsx
   - 폼 렌더링
   - 입력 변경
   - 제출 처리
   - 에러 표시
   - 토스트 표시
   - 아바타 업로드/삭제

2. PasswordChange.jsx
   - 폼 렌더링
   - 비밀번호 강도 계산
   - 요구사항 체크리스트
   - 제출 처리
   - 에러 표시

3. AccountDeletion.jsx
   - 다이얼로그 열기/닫기
   - 확인 입력 검증
   - 삭제 처리
   - 에러 표시
```

**테스트 파일 구조**:
```
coup/src/__tests__/
├── components/
│   └── user/
│       └── settings/
│           ├── ProfileEdit.test.jsx
│           ├── PasswordChange.test.jsx
│           └── AccountDeletion.test.jsx
└── ...
```

### 2단계: 사용자 매뉴얼 작성 (1.5시간)

**작업 내용**:
- 프로필 관리 가이드 작성
- 스크린샷 캡처 및 설명 (선택)
- FAQ 작성
- 문제 해결 가이드

**문서 구조**:
```markdown
# 사용자 가이드

## 프로필 관리
### 프로필 수정
- 이름 변경 (2-50자)
- 소개 작성 (200자 이내)
- 주의사항

### 아바타 관리
- 아바타 업로드
- 아바타 삭제
- 지원 형식: JPG, PNG, GIF
- 최대 크기: 5MB

### 비밀번호 변경
- 비밀번호 요구사항
  * 8자 이상
  * 영문 대소문자
  * 숫자
  * 특수문자
- 변경 절차
- 주의사항

### 계정 삭제
- 삭제 전 확인사항
- 삭제 절차
- 데이터 보관 정책
```

**파일 위치**: `docs/user/PROFILE-USER-GUIDE.md`

### 3단계: 개발자 문서 작성 (1시간)

### 3단계: 개발자 문서 작성 (1시간)

**작업 내용**:
- 아키텍처 문서 작성
- API 통합 가이드 작성
- 에러 코드 레퍼런스 업데이트
- 코드 예제 추가

**문서 구조**:
```markdown
# 개발자 가이드

## 아키텍처
- 예외 처리 흐름
- 컴포넌트 구조
- 상태 관리

## API 통합
- 클라이언트 사용법
- 에러 처리 패턴
- 코드 예제

## 에러 코드
- 전체 에러 코드 목록
- 각 코드별 설명
- 처리 방법

## 확장 가이드
- 새로운 필드 추가
- 새로운 검증 규칙 추가
- 새로운 에러 코드 추가
```

**파일 위치**: 
- `docs/exception/implement/profile/DEVELOPER-GUIDE.md`
- `docs/exception/implement/profile/ERROR-CODES.md` (업데이트)

---

## 📚 참조 문서

### Phase 5 진행 문서
- **docs/exception/implement/profile/PHASE-5-PROGRESS.md** - 현재 진행 상황 및 통계

### Phase 4 완료 문서
- **docs/exception/implement/profile/PHASE-4-COMPLETE.md** - 프론트엔드 통합 완료 보고서

### 기존 문서
- **docs/exception/implement/profile/API-CHANGES.md** - API 변경 사항
- **docs/exception/implement/profile/PHASE-3-COMPLETE.md** - API 강화 완료
- **docs/exception/implement/profile/PHASE-2-COMPLETE.md** - 예외 클래스 완료

---

## ✅ 완료 기준

### API 테스트
- [ ] 모든 엔드포인트 테스트 작성
- [ ] 정상 케이스 테스트 (100% 통과)
- [ ] 에러 케이스 테스트 (100% 통과)
- [ ] 보안 테스트 (XSS, SQL Injection)
- [ ] 커버리지 80% 이상

### 컴포넌트 테스트
- [ ] 모든 컴포넌트 테스트 작성
- [ ] 렌더링 테스트 (100% 통과)
- [ ] 사용자 상호작용 테스트
- [ ] 에러 처리 테스트
- [ ] 커버리지 70% 이상

### 사용자 문서
- [ ] 프로필 관리 가이드
- [ ] 스크린샷 포함
- [ ] FAQ 작성
- [ ] 문제 해결 가이드

### 개발자 문서
- [ ] 아키텍처 문서
- [ ] API 통합 가이드
- [ ] 에러 코드 레퍼런스
- [ ] 코드 예제 포함

---

## 🧪 테스트 예제

### API 테스트 예제
```javascript
// coup/src/__tests__/api/users/me.test.js
import { GET, PATCH } from '@/app/api/users/me/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mock
jest.mock('next-auth');
jest.mock('@/lib/prisma');

describe('GET /api/users/me', () => {
  it('should return user profile', async () => {
    // Setup
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' }
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      status: 'ACTIVE'
    });

    // Execute
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.email).toBe('test@test.com');
  });

  it('should return 404 if user not found', async () => {
    // Setup
    getServerSession.mockResolvedValue({
      user: { id: '999', email: 'test@test.com' }
    });

    prisma.user.findUnique.mockResolvedValue(null);

    // Execute
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-015');
  });
});
```

### 컴포넌트 테스트 예제
```javascript
// coup/src/__tests__/components/user/settings/ProfileEdit.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileEdit from '@/app/user/settings/components/ProfileEdit';

describe('ProfileEdit', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@test.com',
    bio: 'Test bio',
    image: null
  };

  it('should render profile form', () => {
    render(<ProfileEdit user={mockUser} />);

    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/소개/i)).toBeInTheDocument();
    expect(screen.getByText(/프로필 편집/i)).toBeInTheDocument();
  });

  it('should show error for short name', async () => {
    render(<ProfileEdit user={mockUser} />);

    const nameInput = screen.getByLabelText(/이름/i);
    fireEvent.change(nameInput, { target: { value: 'A' } });

    const submitButton = screen.getByText(/저장/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/이름은 2자 이상/i)).toBeInTheDocument();
    });
  });

  it('should show character counter for bio', () => {
    render(<ProfileEdit user={mockUser} />);

    const bioInput = screen.getByLabelText(/소개/i);
    fireEvent.change(bioInput, { target: { value: 'Test bio text' } });

    expect(screen.getByText(/13\/200자/i)).toBeInTheDocument();
  });
});
```

---

## 🚀 작업 지시

**이 파일을 읽은 후, Phase 5 작업을 즉시 시작하세요.**

### 작업 절차

1. **1단계 (3시간)**: API 라우트 테스트 작성
   - Jest 설정
   - 6개 API 엔드포인트 테스트
   - 정상/에러 케이스 모두 포함

2. **2단계 (2시간)**: 프론트엔드 컴포넌트 테스트 작성
   - React Testing Library 사용
   - 3개 컴포넌트 테스트
   - 렌더링 및 상호작용 테스트

3. **3단계 (1.5시간)**: 사용자 매뉴얼 작성
   - Markdown 형식
   - 스크린샷 포함
   - FAQ 작성

4. **4단계 (1.5시간)**: 개발자 문서 작성
   - 아키텍처 설명
   - API 통합 가이드
   - 코드 예제

### 중요 사항

- **테스트 커버리지 목표**: API 80%, 컴포넌트 70%
- **문서 품질**: 명확하고 상세한 설명
- **코드 예제**: 실행 가능한 예제 제공

---

**즉시 1단계부터 시작하세요!**

---

**작성일**: 2025-12-01  
**Phase**: 5 - 테스트 및 문서화  
**예상 시간**: 8시간  
**우선순위**: 🔴 높음

- ✅ 문서화 완료

### Phase 2: 예외 클래스 및 유틸리티 구현 ✅
- ✅ **ProfileException.js** (90개 메서드)
- ✅ **validators.js** (13개 검증 함수)
- ✅ **profileLogger.js** (17개 로깅 함수)
- ✅ 테스트 66개 (100% 통과)

### Phase 3: API 라우트 강화 ✅
- ✅ **GET /api/users/me** - 프로필 조회 강화
- ✅ **PATCH /api/users/me** - 프로필 수정 강화
- ✅ **DELETE /api/users/me** - 계정 삭제 강화
- ✅ **POST /api/users/avatar** - 아바타 업로드 신규 생성
- ✅ **DELETE /api/users/avatar** - 아바타 삭제 신규 생성
- ✅ **PATCH /api/users/me/password** - 비밀번호 변경 강화

**Phase 3 성과**:
- ProfileException 25개 메서드 적용
- Validators 8개 함수 적용
- Loggers 7개 함수 적용
- 보안 검사 (XSS, SQL Injection) 추가
- 예상 6시간 → 실제 1시간 완료

---

## 🎯 현재 작업: Phase 4 - 프론트엔드 통합

### 목표
사용자 프로필 페이지와 설정 페이지에서 강화된 API를 사용하도록 프론트엔드를 업데이트하고, 에러 처리를 구현합니다.

### 예상 시간
8시간

---

## 📋 작업 순서

### 1단계: 현재 구조 파악 (1시간)
```bash
# 프로필 관련 페이지/컴포넌트 찾기
- coup/src/app/ 디렉토리 탐색
- coup/src/components/ 디렉토리 탐색
- 현재 구현 상태 확인
```

### 2단계: 프로필 수정 폼 업데이트 (2시간)
- API 호출 수정
- 검증 로직 추가
- 에러 처리 구현
- 성공 토스트 추가

### 3단계: 아바타 업로드 UI 구현 (2시간)
- 파일 선택 UI
- 미리보기 기능
- 업로드/삭제 처리
- 에러 처리

### 4단계: 비밀번호 변경 폼 구현 (1.5시간)
- 비밀번호 강도 표시기
- 요구사항 체크리스트
- 에러 처리

### 5단계: 계정 삭제 다이얼로그 구현 (1.5시간)
- 확인 다이얼로그
- 삭제 후 로그아웃 처리

---

## ✅ 완료 기준

### 프로필 수정 폼
- [ ] 이름 입력 실시간 검증 (2-50자)
- [ ] 바이오 글자 수 카운터 (200자)
- [ ] 에러 메시지 표시
- [ ] 성공 토스트 표시
- [ ] 로딩 상태 표시

### 아바타 업로드
- [ ] 파일 선택 버튼
- [ ] 이미지 미리보기
- [ ] 파일 크기/형식 검증
- [ ] 업로드 진행률 표시 (선택)
- [ ] 아바타 삭제 기능
- [ ] 에러 처리

### 비밀번호 변경
- [ ] 비밀번호 강도 표시기
- [ ] 요구사항 체크리스트
- [ ] 현재 비밀번호 확인
- [ ] 에러 처리
- [ ] 성공 후 폼 초기화

### 계정 삭제
- [ ] 삭제 확인 다이얼로그
- [ ] 이메일 입력 검증
- [ ] OWNER 스터디 경고
- [ ] 삭제 후 로그아웃
- [ ] 에러 처리

---

## 📚 참조 문서

### Phase 3 완료 문서
- **docs/exception/implement/profile/PHASE-3-COMPLETE.md** - API 강화 완료 보고서
- **docs/exception/implement/profile/API-CHANGES.md** - API 변경 사항 상세 가이드

### 구현 예제
**NEXT-PHASE-PROMPT.md** 파일에 상세한 구현 예제 포함:
- ProfileForm.jsx - 프로필 수정 폼
- AvatarUpload.jsx - 아바타 업로드 UI
- PasswordChangeForm.jsx - 비밀번호 변경 폼
- AccountDeletion.jsx - 계정 삭제 다이얼로그

---

## 🚀 작업 지시

**이 파일을 읽은 후, Phase 4 작업을 즉시 시작하세요.**

### 작업 절차

1. **1단계 (1시간)**: 현재 프로필 관련 파일 구조 파악
   - app/ 디렉토리 탐색
   - components/ 디렉토리 탐색
   - 현재 구현 확인

2. **2단계 (2시간)**: 프로필 수정 폼 업데이트
   - API 호출 수정
   - 검증 로직 추가
   - 에러 처리 구현

3. **3단계 (2시간)**: 아바타 업로드 UI 구현
   - 파일 선택/미리보기
   - 업로드/삭제 처리

4. **4단계 (1.5시간)**: 비밀번호 변경 폼 구현
   - 비밀번호 강도 표시기
   - 에러 처리

5. **5단계 (1.5시간)**: 계정 삭제 다이얼로그 구현
   - 확인 다이얼로그
   - 로그아웃 처리

### 중요 사항

- **NEXT-PHASE-PROMPT.md의 구현 예제 참고**
- **에러 코드별 메시지 매핑** 필수
- **shadcn/ui 컴포넌트 활용**
- **사용자 경험(UX) 중시**

### 에러 코드 매핑 예시

```javascript
// 프로필 수정 에러
switch (errorCode) {
  case 'PROFILE-001': // 필수 항목 누락
  case 'PROFILE-002': // 이름 형식 오류
  case 'PROFILE-003': // 이름 너무 짧음 (2자 미만)
  case 'PROFILE-004': // 이름 너무 김 (50자 초과)
  case 'PROFILE-005': // 바이오 너무 김 (200자 초과)
  case 'PROFILE-012': // XSS 감지
  case 'PROFILE-013': // SQL Injection 감지
  case 'PROFILE-034': // 아바타 URL 오류
  // ...
}

// 아바타 업로드 에러
switch (errorCode) {
  case 'PROFILE-021': // 파일 미제공
  case 'PROFILE-022': // 파일 크기 초과 (5MB)
  case 'PROFILE-023': // 파일 형식 오류
  case 'PROFILE-024': // 이미지 형식 오류
  case 'PROFILE-026': // 업로드 실패
  case 'PROFILE-030': // 삭제 실패
  case 'PROFILE-032': // 아바타 없음
  // ...
}

// 비밀번호 변경 에러
switch (errorCode) {
  case 'PROFILE-055': // 비밀번호 필수
  case 'PROFILE-056': // 비밀번호 너무 약함
  case 'PROFILE-057': // 현재 비밀번호 틀림
  case 'PROFILE-060': // 새 비밀번호가 기존과 같음
  case 'PROFILE-061': // 비밀번호 불일치
  // ...
}

// 계정 삭제 에러
switch (errorCode) {
  case 'PROFILE-001': // 확인 입력 누락
  case 'PROFILE-064': // OWNER 스터디 존재
  case 'PROFILE-067': // 확인 입력 불일치
  case 'PROFILE-069': // 삭제 실패
  // ...
}
```

---

**즉시 1단계부터 시작하세요!**

---

**작성일**: 2025-12-01  
**Phase**: 4 - 프론트엔드 통합  
**예상 시간**: 8시간  
**우선순위**: 🔴 높음

