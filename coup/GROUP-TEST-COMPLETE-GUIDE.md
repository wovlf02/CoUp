# Group 도메인 테스트 완료 가이드

**작성일**: 2025-12-03
**상태**: API 라우트 및 테스트 파일 수정 완료
**다음 작업**: 테스트 실행 및 검증

---

## 📋 완료된 수정 사항

### 1. API 라우트 수정

#### ✅ `/api/groups/[id]/members/route.js`
- **수정 내용**: GET 메서드에 `role` 필터링 추가
- **변경 사항**:
  ```javascript
  // Before
  const where = {
    groupId,
    ...(status && { status })
  };
  
  // After
  const where = {
    groupId,
    ...(status && { status }),
    ...(role && { role })
  };
  ```

### 2. 테스트 파일 수정

#### ✅ `group-members.test.js` (12개 테스트)
- helper mock 추가: `checkGroupMembership`, `checkGroupPermission`
- 모든 API 호출에 `params: Promise.resolve({ id: '...' })` 패턴 적용
- **예상 결과**: 12/12 통과 (100%)

#### ✅ `group-invites.test.js` (8개 테스트)
- helper mock 추가: `checkGroupMembership`, `checkGroupPermission`, `checkKickedHistory`
- 모든 API 호출에 `params: Promise.resolve({ id: '...' })` 패턴 적용
- kicked user 초대 방지 테스트에 에러 mock 추가
- **예상 결과**: 8/8 통과 (100%)

#### ✅ `group-actions.test.js` (5개 테스트)
- helper mock 추가: `checkGroupExists`, `checkKickedHistory`, `checkGroupCapacity`, `checkGroupMembership`
- `prisma.$transaction` mock 추가
- 모든 API 호출에 `params: Promise.resolve({ id: '...' })` 패턴 적용
- **예상 결과**: 5/5 통과 (100%)

#### ⏳ `group-flow.test.js` (15개 Integration 테스트)
- helper mock 부분적으로 추가
- `$transaction` mock 추가
- **남은 작업**: 모든 `params: { id:` 를 `params: Promise.resolve({ id:` 로 변경
- **예상 결과**: 수정 후 15/15 통과 (100%)

---

## 🔧 테스트 실행 명령어

### Windows PowerShell

```powershell
# 작업 디렉토리로 이동
cd C:\Project\CoUp\coup

# 1. Validator 테스트 (29개)
npx jest src/__tests__/lib/validators/group-validators.test.js --no-coverage

# 2. Helper 테스트 (30개)
npx jest src/__tests__/lib/helpers/group-helpers.test.js --no-coverage

# 3. groups.test.js (15개)
npx jest src/__tests__/api/groups/groups.test.js --no-coverage

# 4. group-members.test.js (12개)
npx jest src/__tests__/api/groups/group-members.test.js --no-coverage

# 5. group-invites.test.js (8개)
npx jest src/__tests__/api/groups/group-invites.test.js --no-coverage

# 6. group-actions.test.js (5개)
npx jest src/__tests__/api/groups/group-actions.test.js --no-coverage

# 7. group-flow.test.js (15개) - Integration
npx jest src/__tests__/integration/group-flow.test.js --no-coverage

# 전체 Group 테스트 (114개)
npx jest --testMatch="**/*group*.test.js" --no-coverage
```

---

## 🎯 예상 테스트 결과

### 현재 상태 (수정 완료 후)
```
✅ Validator 테스트: 29/29 통과 (100%)
✅ Helper 테스트: 30/30 통과 (100%)
✅ groups.test.js: 15/15 통과 (100%)
🔄 group-members.test.js: 12/12 예상 (100%)
🔄 group-invites.test.js: 8/8 예상 (100%)
🔄 group-actions.test.js: 5/5 예상 (100%)
⏳ group-flow.test.js: 15/15 예상 (수정 필요)

전체: 114/114 예상 (100%)
```

### 남은 작업

#### group-flow.test.js 수정
다음 패턴을 찾아서 교체:
```javascript
// Before
{ params: { id: 'group-1' } }

// After
{ params: Promise.resolve({ id: 'group-1' }) }
```

**변경 필요 위치** (10곳):
- Line 131, 232, 269, 320, 354, 390, 479, 514, 544, 576

---

## 🔑 핵심 수정 패턴 요약

### 1. API 라우트 params 처리
```javascript
export async function GET(request, context) {
  const { params } = context;
  const { id: groupId } = await params;  // await 필수!
  // ...
}
```

### 2. 테스트 params 전달
```javascript
const response = await GET(request, { 
  params: Promise.resolve({ id: 'group-1' })  // Promise.resolve 필수!
});
```

### 3. Helper Mock 설정
```javascript
// 테스트 파일 상단
jest.mock('@/lib/helpers/group-helpers', () => ({
  ...jest.requireActual('@/lib/helpers/group-helpers'),
  checkGroupPermission: jest.fn(),
  checkGroupExists: jest.fn(),
  checkGroupMembership: jest.fn(),
  checkKickedHistory: jest.fn(),
  checkGroupCapacity: jest.fn(),
}));

// 테스트 내부
groupHelpers.checkGroupPermission.mockResolvedValue({
  id: 'member-1',
  role: 'ADMIN',
  status: 'ACTIVE'
});
```

### 4. Exception Error Mock
```javascript
const error = new Error('권한 없음');
error.code = 'GROUP-023';
error.statusCode = 403;
error.toJSON = () => ({ 
  code: 'GROUP-023', 
  message: '권한 없음' 
});
groupHelpers.checkGroupPermission.mockRejectedValue(error);
```

### 5. Transaction Mock (Integration 테스트)
```javascript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(prisma)),
    // ... 다른 모델들
  },
}));

// 테스트 내부
prisma.$transaction.mockImplementation(async (callback) => {
  return await callback(prisma);
});
```

---

## 📝 다음 단계

### Step 1: group-flow.test.js 수정 (15분)
1. 파일 열기: `C:\Project\CoUp\coup\src\__tests__\integration\group-flow.test.js`
2. 찾기/바꾸기:
   - 찾기: `params: { id:`
   - 바꾸기: `params: Promise.resolve({ id:`
3. 10곳 모두 변경
4. 파일 저장

### Step 2: 전체 테스트 실행 (5분)
```powershell
cd C:\Project\CoUp\coup
npx jest --testMatch="**/*group*.test.js" --no-coverage
```

### Step 3: 결과 확인 (5분)
- 114/114 통과 확인
- 실패한 테스트가 있다면 에러 메시지 확인
- Mock 설정 또는 API 로직 재확인

### Step 4: 문서 업데이트 (10분)
- `next-prompt.md` 업데이트
- Step 6 완료 상태로 변경
- Step 7 (프론트엔드 통합) 준비

---

## 🐛 트러블슈팅

### 문제 1: "Cannot read property 'id' of undefined"
**원인**: params를 await하지 않음
**해결**: API 라우트에서 `const { id } = await params;` 사용

### 문제 2: "checkGroupPermission is not a function"
**원인**: Helper mock이 설정되지 않음
**해결**: 테스트 파일에 `jest.mock('@/lib/helpers/group-helpers')` 추가

### 문제 3: "Expected 403, received 200"
**원인**: Mock이 에러를 throw하지 않음
**해결**: `mockRejectedValue`로 에러 객체 전달 (code, statusCode, toJSON 포함)

### 문제 4: "$transaction is not a function"
**원인**: $transaction mock 누락
**해결**: prisma mock에 `$transaction: jest.fn()` 추가

---

## ✅ 완료 체크리스트

- [x] API 라우트 params await 처리
- [x] API 라우트 role 필터링 추가
- [x] group-members.test.js helper mock 추가
- [x] group-invites.test.js helper mock 추가
- [x] group-actions.test.js helper mock + $transaction 추가
- [ ] group-flow.test.js params Promise 패턴 완전 적용
- [ ] 전체 테스트 114/114 통과 확인
- [ ] next-prompt.md 업데이트

---

**작성자**: GitHub Copilot
**문서 버전**: 1.0
**최종 수정**: 2025-12-03

