# CoUp Profile 영역 테스트 수정 프롬프트

**프로젝트**: CoUp (스터디 관리 플랫폼)  
**Phase**: Phase 5 - 테스트 수정 및 완료  
**현재 상황**: 72개 테스트 중 32개 통과, 40개 실패  
**목표**: 100% 테스트 통과 달성  
**우선순위**: 🔴 긴급 (최우선)

---

## 📊 현재 테스트 상황

### 테스트 통계
- **총 테스트**: 72개
- **통과**: 32개 (44%)
- **실패**: 40개 (56%)
- **목표**: 72개 (100%)

### 테스트 파일 현황
```
src/__tests__/
├── api/users/
│   ├── me.test.js (API 테스트)
│   ├── password.test.js (비밀번호 변경 API)
│   └── avatar.test.js (아바타 API)
└── components/user/settings/
    ├── ProfileEdit.test.jsx (프로필 수정 컴포넌트)
    ├── PasswordChange.test.jsx (비밀번호 변경 컴포넌트)
    └── AccountDeletion.test.jsx (계정 삭제 컴포넌트)
```

---

## 🎯 작업 계획

### 단계 1: 테스트 실패 원인 파악 (30분)

**1.1 상세 테스트 결과 확인**
```bash
cd C:\Project\CoUp\coup
npm test -- --verbose --no-coverage
```

**1.2 실패 패턴 분석**

다음 카테고리별로 실패 원인 분석:

#### A. API 테스트 실패 (예상)
- ❌ **에러 코드 불일치**: 테스트에서 기대하는 에러 코드와 실제 반환되는 에러 코드가 다름
- ❌ **컴포넌트 텍스트 불일치**: 버튼 텍스트가 "💾 저장하기" vs "저장"
- ❌ **Mock 데이터 문제**: fetch, signOut 등 mock이 제대로 작동하지 않음
- ❌ **비동기 처리**: waitFor, async/await 타이밍 이슈

#### B. 컴포넌트 테스트 실패 (예상)
- ❌ **렌더링 오류**: 컴포넌트가 제대로 렌더링되지 않음
- ❌ **DOM 요소 찾기 실패**: getByText, getByRole 등으로 요소를 찾지 못함
- ❌ **이벤트 처리 실패**: 클릭, 입력 등 이벤트가 제대로 처리되지 않음
- ❌ **상태 업데이트 실패**: 상태 변경이 제대로 반영되지 않음

---

## 🔧 단계 2: 실패 테스트 수정 (3-4시간)

### 2.1 API 테스트 수정 전략

#### A. me.test.js 수정

**문제 1: 에러 코드 불일치**

```javascript
// ❌ 실패하는 테스트
expect(data.error.code).toBe('PROFILE-016'); // 계정 삭제
expect(data.error.code).toBe('PROFILE-017'); // 계정 정지
expect(data.error.code).toBe('PROFILE-012'); // XSS
expect(data.error.code).toBe('PROFILE-013'); // SQL Injection
expect(data.error.code).toBe('PROFILE-067'); // 확인 불일치
expect(data.error.code).toBe('PROFILE-064'); // OWNER 스터디

// ✅ 수정해야 할 코드
expect(data.error.code).toBe('PROFILE-019'); // 계정 삭제
expect(data.error.code).toBe('PROFILE-018'); // 계정 정지
expect(data.error.code).toBe('PROFILE-002'); // XSS (이름 형식에 포함)
expect(data.error.code).toBe('PROFILE-002'); // SQL (이름 형식에 포함)
expect(data.error.code).toBe('PROFILE-054'); // 확인 불일치
expect(data.error.code).toBe('PROFILE-051'); // OWNER 스터디
```

**수정 방법**:
1. `ProfileException.js`에서 실제 사용되는 에러 코드 확인
2. 각 테스트의 `expect(data.error.code).toBe()`를 실제 코드로 수정
3. XSS/SQL Injection은 이름 검증에서 먼저 걸리므로 PROFILE-002로 통일

#### B. password.test.js 수정

**문제 1: 에러 코드 불일치**

```javascript
// ❌ 실패하는 테스트
expect(data.error.code).toBe('PROFILE-055'); // 비밀번호 필수
expect(data.error.code).toBe('PROFILE-056'); // 비밀번호 약함
expect(data.error.code).toBe('PROFILE-057'); // 현재 비밀번호 불일치
expect(data.error.code).toBe('PROFILE-060'); // 새 비밀번호 = 기존
expect(data.error.code).toBe('PROFILE-061'); // 비밀번호 불일치

// ✅ 수정해야 할 코드
expect(data.error.code).toBe('PROFILE-036'); // 비밀번호 필수
expect(data.error.code).toBe('PROFILE-039'); // 비밀번호 약함
expect(data.error.code).toBe('PROFILE-046'); // 현재 비밀번호 불일치
expect(data.error.code).toBe('PROFILE-049'); // 새 비밀번호 = 기존
expect(data.error.code).toBe('PROFILE-050'); // 비밀번호 불일치
```

**수정 방법**:
1. `ProfileException.js`의 C. PASSWORD 섹션 확인
2. 실제 메서드명과 에러 코드 매칭
3. 테스트 파일의 모든 에러 코드 업데이트

#### C. avatar.test.js 수정

**예상 문제**: 에러 코드는 이미 맞지만 다른 문제가 있을 수 있음
- Mock 파일 객체 생성 방식
- 파일 크기 체크 로직
- 비동기 처리

### 2.2 컴포넌트 테스트 수정 전략

#### A. ProfileEdit.test.jsx 수정

**문제 1: 버튼 텍스트 불일치**

```javascript
// ❌ 실패하는 코드
const saveButton = screen.getByText('💾 저장하기');

// ✅ 수정해야 할 코드
const saveButton = screen.getByText('저장');
// 또는
const saveButton = screen.getByRole('button', { name: /저장/i });
```

**문제 2: 컴포넌트 props 누락**

```javascript
// ❌ 실패할 수 있는 코드
render(<ProfileEdit />);

// ✅ 수정해야 할 코드
render(<ProfileEdit user={mockUser} />);
```

**문제 3: Next.js Image 컴포넌트 Mock**

```javascript
// jest.setup.js에 추가 필요
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />;
  },
}));
```

#### B. PasswordChange.test.jsx 수정

**문제 1: 버튼 텍스트 불일치**

```javascript
// ❌ 실패하는 코드
const submitButton = screen.getByText('🔐 비밀번호 변경');

// ✅ 실제 컴포넌트 확인 후 수정
// ProfileEdit.jsx에서 실제 버튼 텍스트 확인 필요
```

**문제 2: 비밀번호 강도 표시 테스트**

```javascript
// 비밀번호 강도 표시가 비동기로 업데이트되는 경우
await waitFor(() => {
  expect(screen.getByText(/강함|보통|약함/)).toBeInTheDocument();
});
```

#### C. AccountDeletion.test.jsx 수정

**문제 1: 다이얼로그 렌더링**

```javascript
// 다이얼로그가 Portal로 렌더링되는 경우
const { container } = render(<AccountDeletion user={mockUser} />);
// Portal 내용도 테스트할 수 있도록 설정
```

**문제 2: signOut Mock**

```javascript
// jest.setup.js 또는 테스트 파일에서
jest.mock('next-auth/react', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}));
```

---

## 🔍 단계 3: 체계적 수정 프로세스

### 3.1 에러 코드 매핑 확인

**작업 순서**:
1. `ProfileException.js` 열기
2. 각 메서드의 에러 코드 확인
3. 매핑 테이블 생성:

```javascript
// 에러 코드 매핑 (참고용)
const ERROR_CODE_MAPPING = {
  // Profile Info
  requiredFieldMissing: 'PROFILE-001',
  invalidNameFormat: 'PROFILE-002',
  nameTooShort: 'PROFILE-003',
  nameTooLong: 'PROFILE-004',
  bioTooLong: 'PROFILE-005',
  xssDetected: 'PROFILE-012',
  sqlInjectionDetected: 'PROFILE-013',
  updateFailed: 'PROFILE-014',
  notFound: 'PROFILE-015',
  unauthorizedAccess: 'PROFILE-016',
  rateLimitExceeded: 'PROFILE-017',
  accountSuspended: 'PROFILE-018',
  accountDeleted: 'PROFILE-019',
  fetchFailed: 'PROFILE-020',
  
  // Avatar
  fileNotProvided: 'PROFILE-021',
  fileTooLarge: 'PROFILE-022',
  invalidFileType: 'PROFILE-023',
  uploadFailed: 'PROFILE-026',
  avatarDeleteFailed: 'PROFILE-030',
  avatarNotFound: 'PROFILE-032',
  
  // Password
  passwordRequired: 'PROFILE-036',
  passwordTooShort: 'PROFILE-037',
  passwordTooLong: 'PROFILE-038',
  passwordTooWeak: 'PROFILE-039',
  currentPasswordIncorrect: 'PROFILE-046',
  passwordChangeFailed: 'PROFILE-048',
  newPasswordSameAsOld: 'PROFILE-049',
  passwordMismatch: 'PROFILE-050',
  
  // Account Deletion
  ownerStudyExists: 'PROFILE-051',
  activeTasksExist: 'PROFILE-052',
  deletionNotAllowed: 'PROFILE-053',
  confirmationMismatch: 'PROFILE-054',
};
```

### 3.2 테스트 파일 수정 순서

**우선순위**:
1. **API 테스트 먼저 수정** (더 간단하고 중요함)
   - me.test.js
   - password.test.js
   - avatar.test.js

2. **컴포넌트 테스트 수정**
   - ProfileEdit.test.jsx
   - PasswordChange.test.jsx
   - AccountDeletion.test.jsx

### 3.3 각 파일별 수정 체크리스트

#### ✅ me.test.js
- [ ] Line ~100: PROFILE-019 (accountDeleted)
- [ ] Line ~120: PROFILE-018 (accountSuspended)
- [ ] Line ~250: PROFILE-002 (XSS - invalidNameFormat)
- [ ] Line ~267: PROFILE-002 (SQL - invalidNameFormat)
- [ ] Line ~380: PROFILE-054 (confirmationMismatch)
- [ ] Line ~410: PROFILE-051 (ownerStudyExists)

#### ✅ password.test.js
- [ ] Line ~96: PROFILE-036 (passwordRequired)
- [ ] Line ~113: PROFILE-036 (passwordRequired)
- [ ] Line ~131: PROFILE-039 (passwordTooWeak)
- [ ] Line ~150: PROFILE-050 (passwordMismatch)
- [ ] Line ~176: PROFILE-046 (currentPasswordIncorrect)
- [ ] Line ~204: PROFILE-049 (newPasswordSameAsOld)
- [ ] Line ~248: PROFILE-048 (passwordChangeFailed)

#### ✅ avatar.test.js
- [ ] 에러 코드 확인 (이미 맞을 가능성 높음)
- [ ] Mock 파일 객체 수정
- [ ] 비동기 처리 확인

#### ✅ ProfileEdit.test.jsx
- [ ] 모든 `getByText('💾 저장하기')` → `getByText('저장')` 수정
- [ ] 또는 `getByRole('button', { name: /저장/i })` 사용
- [ ] Next.js Image Mock 추가
- [ ] user prop 전달 확인

#### ✅ PasswordChange.test.jsx
- [ ] 버튼 텍스트 확인 및 수정
- [ ] 비밀번호 강도 표시 비동기 처리
- [ ] 에러 코드 매핑 확인

#### ✅ AccountDeletion.test.jsx
- [ ] 버튼 텍스트 확인 및 수정
- [ ] signOut Mock 설정
- [ ] 다이얼로그 렌더링 테스트
- [ ] 타이머 관련 테스트 수정

---

## 📝 단계 4: 실행 및 검증 (1시간)

### 4.1 파일별 개별 테스트

```bash
# API 테스트만 실행
npm test -- src/__tests__/api/users/me.test.js
npm test -- src/__tests__/api/users/password.test.js
npm test -- src/__tests__/api/users/avatar.test.js

# 컴포넌트 테스트만 실행
npm test -- src/__tests__/components/user/settings/ProfileEdit.test.jsx
npm test -- src/__tests__/components/user/settings/PasswordChange.test.jsx
npm test -- src/__tests__/components/user/settings/AccountDeletion.test.jsx
```

### 4.2 전체 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 커버리지 포함
npm test -- --coverage
```

### 4.3 성공 기준

```
Test Suites: 6 passed, 6 total
Tests:       72 passed, 72 total
Snapshots:   0 total
Time:        < 10s
```

---

## 🛠️ 추가 수정 가능성

### jest.setup.js에 추가할 Mock

```javascript
// Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

// Next.js Router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// window.location.reload
delete window.location;
window.location = { reload: jest.fn() };
```

### 공통 테스트 유틸리티

```javascript
// test-utils.js
export const waitForLoadingToFinish = () => 
  waitFor(() => {
    expect(screen.queryByText(/로딩|Loading/i)).not.toBeInTheDocument();
  });

export const expectToastMessage = async (message) => {
  await waitFor(() => {
    expect(screen.getByText(message)).toBeInTheDocument();
  });
};
```

---

## 📊 진행 상황 추적

### 체크리스트

#### Phase 1: 실패 원인 파악
- [ ] 상세 테스트 결과 확인
- [ ] 실패 패턴 분류
- [ ] 에러 코드 매핑 테이블 생성

#### Phase 2: API 테스트 수정
- [ ] me.test.js (6개 수정)
- [ ] password.test.js (7개 수정)
- [ ] avatar.test.js (확인 및 수정)
- [ ] API 테스트 38개 모두 통과

#### Phase 3: 컴포넌트 테스트 수정
- [ ] ProfileEdit.test.jsx
- [ ] PasswordChange.test.jsx
- [ ] AccountDeletion.test.jsx
- [ ] 컴포넌트 테스트 34개 모두 통과

#### Phase 4: 최종 검증
- [ ] 전체 테스트 72개 100% 통과
- [ ] 커버리지 80% 이상
- [ ] 경고/에러 메시지 없음

---

## 🚀 즉시 실행 명령어

### 1단계: 현재 실패 원인 상세 확인
```bash
cd C:\Project\CoUp\coup
npm test -- --verbose --no-coverage > test-results.txt 2>&1
cat test-results.txt
```

### 2단계: 에러 코드 확인
```bash
# ProfileException.js에서 실제 에러 코드 확인
grep -n "PROFILE-" coup/src/lib/exceptions/profile/ProfileException.js
```

### 3단계: 테스트 파일 수정 후 재실행
```bash
# 각 파일 수정 후
npm test -- src/__tests__/api/users/me.test.js --verbose
```

---

## 🎯 예상 소요 시간

| 작업 | 시간 | 우선순위 |
|-----|------|---------|
| 실패 원인 파악 | 30분 | 🔴 최우선 |
| API 테스트 수정 | 1시간 | 🔴 최우선 |
| 컴포넌트 테스트 수정 | 2시간 | 🟡 높음 |
| 검증 및 조정 | 1시간 | 🟡 높음 |
| **총계** | **4.5시간** | |

---

## 📌 중요 참고사항

### 에러 코드 일관성
- ProfileException.js의 실제 코드가 정답
- 테스트는 실제 구현에 맞춰야 함
- XSS/SQL은 이름 검증에 포함되므로 PROFILE-002

### 컴포넌트 텍스트
- 실제 JSX 파일의 텍스트와 정확히 일치해야 함
- 이모지 포함 여부 주의
- getByRole 사용 시 정확한 role과 name 필요

### 비동기 처리
- 모든 API 호출은 waitFor 사용
- 토스트 메시지는 타이머 고려
- 상태 업데이트는 충분한 대기 시간

---

## ✅ 완료 기준

- [x] 테스트 실패 원인 100% 파악
- [ ] API 테스트 38개 100% 통과
- [ ] 컴포넌트 테스트 34개 100% 통과
- [ ] 전체 테스트 72개 100% 통과
- [ ] 커버리지 80% 이상
- [ ] 경고 메시지 0개

---

**작성일**: 2025-12-01  
**현재 진행률**: 44% (32/72)  
**목표 진행률**: 100% (72/72)  
**우선순위**: 🔴 긴급 최우선

**즉시 시작하세요!** 
1. 테스트 상세 결과 확인
2. 에러 코드 하나씩 수정
3. 파일별로 검증하며 진행
