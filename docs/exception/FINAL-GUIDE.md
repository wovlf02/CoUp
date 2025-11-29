# CoUp 예외 처리 최종 사용 가이드 (Final Guide)

**작성일**: 2025-11-29  
**Phase**: 8 - 통합 및 마무리  
**버전**: 1.0.0  
**목적**: 예외 처리 문서의 전체 활용 방법

---

## 📋 목차

1. [시작하기](#시작하기)
2. [문서 구조 이해하기](#문서-구조-이해하기)
3. [문제 해결 프로세스](#문제-해결-프로세스)
4. [개발 워크플로우](#개발-워크플로우)
5. [팀 협업 가이드](#팀-협업-가이드)
6. [문서 유지보수](#문서-유지보수)
7. [Best Practices](#best-practices)

---

## 시작하기

### 이 문서는 누구를 위한 것인가?

- ✅ **신규 개발자**: CoUp 프로젝트에 처음 참여하는 분
- ✅ **기존 개발자**: 예외 처리 문서를 효과적으로 활용하고 싶은 분
- ✅ **QA 엔지니어**: 테스트 케이스를 작성하는 분
- ✅ **프로젝트 매니저**: 이슈 트래킹 및 우선순위 결정하는 분

### 5분 빠른 시작

#### 1단계: 전체 구조 파악 (2분)

```
docs/exception/
├── MASTER-INDEX.md          ← 여기서 시작! 전체 색인
├── QUICK-REFERENCE.md       ← 자주 발생하는 문제 Top 20
├── CROSS-REFERENCE.md       ← 문서 간 참조 관계
├── FINAL-GUIDE.md           ← 지금 보고 있는 문서
├── DEPLOYMENT-CHECKLIST.md  ← 배포 전 체크리스트
├── TEAM-ONBOARDING.md       ← 신규 팀원 온보딩
│
├── auth/                    ← Phase 0: 인증
├── dashboard/               ← Phase 1: 대시보드
├── studies/                 ← Phase 2: 스터디 관리
├── my-studies/              ← Phase 3: 내 스터디
├── chat/                    ← Phase 4: 채팅
├── notifications/           ← Phase 5: 알림
├── profile/                 ← Phase 6: 프로필
├── settings/                ← Phase 7: 설정
├── search/                  ← Phase 8: 검색/필터
└── admin/                   ← Phase 9: 관리자
```

#### 2단계: 필요한 문서 찾기 (2분)

**방법 1: 증상으로 찾기**
```
"로그인이 안 돼요" 
  → QUICK-REFERENCE.md > "로그인이 필요합니다" 섹션
  → auth/01-credentials-login-exceptions.md
```

**방법 2: 예외 코드로 찾기**
```
"AUTH-003 에러 발생"
  → MASTER-INDEX.md 에서 AUTH-003 검색
  → auth/03-session-management-exceptions.md#jwt-토큰-만료
```

**방법 3: 기능별로 찾기**
```
"스터디 생성 기능 개발 중"
  → MASTER-INDEX.md > Phase 2: 스터디 관리
  → studies/README.md
  → studies/01-study-crud-exceptions.md
```

#### 3단계: 문제 해결 (1분)

1. 해당 문서 열기
2. 목차에서 관련 섹션 찾기
3. "원인", "해결 방법", "코드 예제" 확인
4. 코드 적용 및 테스트

---

## 문서 구조 이해하기

### 각 Phase의 문서 구조

모든 Phase는 동일한 구조를 따릅니다:

```
{area}/
├── README.md              # 📖 개요 및 시작 가이드
├── INDEX.md               # 🔍 상세 색인 (증상별, 카테고리별)
├── 01-*.md                # 📝 핵심 기능 예외
├── 02-*.md                # 📝 데이터 작업 예외
├── 03-*.md                # 📝 실시간 기능 예외
├── 04-*.md                # 📝 UI/UX 예외
├── 05-*.md                # 📝 엣지 케이스
├── 06-*.md                # 📝 성능 문제
└── 99-best-practices.md   # ✨ 모범 사례
```

### 문서 읽는 순서

#### 신규 개발자

```
1. README.md          → 전체 개요 파악
2. INDEX.md           → 어떤 예외가 있는지 확인
3. 01-*.md            → 핵심 기능부터 학습
4. 99-best-practices  → 권장 사항 학습
```

#### 버그 수정

```
1. INDEX.md           → 증상으로 빠르게 찾기
2. 해당 상세 문서      → 원인 및 해결 방법 확인
3. 99-best-practices  → 재발 방지 체크
```

#### 새 기능 개발

```
1. README.md          → 관련 기능 이해
2. CROSS-REFERENCE.md → 의존성 확인
3. 99-best-practices  → 설계 원칙 적용
4. 01-*.md            → 유사 기능 참조
```

---

## 문제 해결 프로세스

### Step 1: 문제 식별

#### 에러 메시지가 있는 경우

```javascript
// 브라우저 콘솔에서
Error: AUTH-003: JWT 토큰이 만료되었습니다
```

**해결**:
1. MASTER-INDEX.md에서 "AUTH-003" 검색
2. 링크 따라가기: `auth/03-session-management-exceptions.md#jwt-토큰-만료`
3. 해결 방법 적용

#### 에러 메시지가 없는 경우

```
증상: 로그인 후 대시보드가 안 보임
```

**해결**:
1. QUICK-REFERENCE.md > "데이터 안 보일 때" 체크리스트
2. 브라우저 콘솔 확인
3. Network 탭에서 API 응답 확인
4. 상태 코드에 따라 해당 문서 참조

### Step 2: 원인 분석

각 예외 문서는 다음 정보를 제공합니다:

```markdown
## 예외 상황 제목

### 개요
- **심각도**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
- **빈도**: 높음 / 중간 / 낮음
- **영향 범위**: 어떤 기능에 영향을 주는지

### 원인
1. 원인 1 (가장 일반적)
2. 원인 2
3. 원인 3

### 해결 방법
단계별 해결 방법

### 코드 예제
실제 적용 가능한 코드

### 테스트
테스트 방법

### 예방
재발 방지 방법
```

### Step 3: 해결 방법 적용

#### 프론트엔드

```javascript
// 문제: JWT 토큰 만료
// 문서: auth/03-session-management-exceptions.md

// 해결: Axios 인터셉터로 자동 갱신
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { accessToken } = await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // 갱신 실패 시 로그인 페이지로
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### 백엔드

```javascript
// 문제: 권한 검증
// 문서: studies/05-permissions-exceptions.md

// 해결: 미들웨어 구현
const checkStudyPermission = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { studyId } = req.params;
      const userId = req.user.id;
      
      const membership = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: { studyId, userId }
        }
      });
      
      if (!membership) {
        return res.status(403).json({
          error: 'STD-002: 스터디 멤버가 아닙니다'
        });
      }
      
      const roleHierarchy = { OWNER: 3, ADMIN: 2, MEMBER: 1 };
      
      if (roleHierarchy[membership.role] < roleHierarchy[requiredRole]) {
        return res.status(403).json({
          error: `STD-PRM-001: ${requiredRole} 권한이 필요합니다`
        });
      }
      
      req.membership = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// 사용
router.delete('/studies/:studyId', 
  authenticate,
  checkStudyPermission('OWNER'),
  deleteStudy
);
```

### Step 4: 테스트

#### 단위 테스트

```javascript
// 문서의 테스트 섹션 참조
describe('JWT 토큰 갱신', () => {
  it('토큰 만료 시 자동으로 갱신해야 함', async () => {
    // 만료된 토큰으로 요청
    const response = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${expiredToken}`);
    
    // 자동으로 갱신되어 200 응답
    expect(response.status).toBe(200);
  });
  
  it('갱신 실패 시 로그인 페이지로 리다이렉트', async () => {
    // refresh token도 만료된 경우
    const response = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${expiredToken}`);
    
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('AUTH-003');
  });
});
```

#### 통합 테스트

```javascript
// E2E 테스트
describe('사용자 흐름', () => {
  it('로그인 → 대시보드 → 스터디 생성', async () => {
    // 1. 로그인
    await page.goto('/login');
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('[type=submit]');
    
    // 2. 대시보드 로딩 확인
    await page.waitForSelector('.dashboard');
    
    // 3. 스터디 생성
    await page.click('[data-testid=create-study]');
    // ... 
  });
});
```

### Step 5: 문서화 (선택)

새로운 해결 방법을 발견했다면:

1. 해당 문서에 추가
2. Pull Request 생성
3. 팀원들과 공유

---

## 개발 워크플로우

### 새 기능 개발

#### 1. 기획 단계

**체크리스트**:
- [ ] 유사 기능 찾기 (MASTER-INDEX.md)
- [ ] 필요한 권한 확인 (*/05-permissions-*.md)
- [ ] 예상 예외 상황 나열
- [ ] 의존성 확인 (CROSS-REFERENCE.md)

**예제**:
```
기능: 스터디 일정 추가
유사 기능: 스터디 공지 작성 (my-studies/03-notices-exceptions.md)
권한: ADMIN 이상
예외 상황:
  - 필수 필드 누락
  - 과거 날짜 입력
  - 권한 부족
  - 중복 일정
의존성: 스터디 멤버십 확인 (studies/05-permissions-exceptions.md)
```

#### 2. 설계 단계

**API 설계**:
```javascript
// POST /api/studies/:studyId/events

// 요청
{
  "title": "첫 모임",
  "date": "2025-12-01T14:00:00Z",
  "location": "강남역 스터디카페"
}

// 성공 응답 (201)
{
  "event": {
    "id": "event_123",
    "title": "첫 모임",
    // ...
  }
}

// 에러 응답들
// 400: 유효성 검사 실패
// 401: 인증 필요
// 403: 권한 부족 (ADMIN 이상 필요)
// 409: 중복 일정
// 500: 서버 오류
```

**예외 처리 설계**:
```javascript
// 참고 문서: my-studies/03-notices-exceptions.md

const createEvent = async (studyId, eventData) => {
  // 1. 권한 확인 (403)
  const membership = await checkMembership(studyId);
  if (membership.role === 'MEMBER') {
    throw new ForbiddenError('MYSTD-EVENT-001: ADMIN 권한이 필요합니다');
  }
  
  // 2. 유효성 검사 (400)
  if (!eventData.title || !eventData.date) {
    throw new ValidationError('MYSTD-EVENT-002: 필수 필드 누락');
  }
  
  // 3. 과거 날짜 확인 (400)
  if (new Date(eventData.date) < new Date()) {
    throw new ValidationError('MYSTD-EVENT-003: 과거 날짜는 입력할 수 없습니다');
  }
  
  // 4. 중복 확인 (409)
  const existing = await checkDuplicate(studyId, eventData.date);
  if (existing) {
    throw new ConflictError('MYSTD-EVENT-004: 동일한 시간에 일정이 있습니다');
  }
  
  // 5. 생성
  return await prisma.studyEvent.create({
    data: {
      ...eventData,
      studyId,
      creatorId: membership.userId
    }
  });
};
```

#### 3. 구현 단계

**코드 작성 팁**:

1. **공통 패턴 재사용**
```javascript
// auth/06-common-edge-cases.md의 재시도 로직
import { fetchWithRetry } from '@/lib/fetch';

const createEvent = async (data) => {
  return fetchWithRetry('/api/events', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};
```

2. **에러 처리 표준화**
```javascript
// 전역 에러 핸들러
const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        toast.error(data.error || '입력값을 확인해주세요');
        break;
      case 401:
        redirectToLogin();
        break;
      case 403:
        toast.error('권한이 없습니다');
        break;
      case 500:
        toast.error('서버 오류가 발생했습니다');
        reportError(error); // 에러 리포팅
        break;
    }
  }
};
```

3. **로깅 추가**
```javascript
const createEvent = async (studyId, eventData) => {
  logger.info('일정 생성 시도', { studyId, eventData });
  
  try {
    const event = await prisma.studyEvent.create({...});
    logger.info('일정 생성 성공', { eventId: event.id });
    return event;
  } catch (error) {
    logger.error('일정 생성 실패', { error, studyId });
    throw error;
  }
};
```

#### 4. 테스트 단계

**테스트 케이스 작성**:
```javascript
// 각 영역의 05-edge-cases.md 참조

describe('스터디 일정 생성', () => {
  // 정상 케이스
  it('모든 필드 입력 시 성공', async () => {
    const event = await createEvent(studyId, validData);
    expect(event).toBeDefined();
  });
  
  // 오류 케이스
  it('제목 누락 시 400 에러', async () => {
    await expect(createEvent(studyId, { date: '2025-12-01' }))
      .rejects.toThrow('MYSTD-EVENT-002');
  });
  
  it('MEMBER 역할은 403 에러', async () => {
    // membership.role = 'MEMBER'
    await expect(createEvent(studyId, validData))
      .rejects.toThrow('MYSTD-EVENT-001');
  });
  
  // 엣지 케이스
  it('과거 날짜는 400 에러', async () => {
    const pastData = { ...validData, date: '2020-01-01' };
    await expect(createEvent(studyId, pastData))
      .rejects.toThrow('MYSTD-EVENT-003');
  });
  
  it('동시 생성 시 하나만 성공', async () => {
    const promises = [
      createEvent(studyId, validData),
      createEvent(studyId, validData)
    ];
    
    const results = await Promise.allSettled(promises);
    const succeeded = results.filter(r => r.status === 'fulfilled');
    expect(succeeded).toHaveLength(1);
  });
});
```

#### 5. 문서화 단계

**예외 문서 작성**:
```markdown
## 일정 생성 예외

### MYSTD-EVENT-001: 권한 부족

**개요**:
- **심각도**: 🟡 Medium
- **빈도**: 중간
- **영향**: 일정 생성 불가

**원인**:
MEMBER 역할이 일정 생성 시도

**해결**:
ADMIN 이상 권한 필요

**코드 예제**:
\`\`\`javascript
// 권한 확인
if (membership.role === 'MEMBER') {
  throw new Error('MYSTD-EVENT-001: ADMIN 권한이 필요합니다');
}
\`\`\`
```

---

### 버그 수정

#### 1. 버그 리포트 분석

```
제목: 스터디 삭제 시 채팅방이 남아있음
재현: 
  1. 스터디 생성
  2. 채팅방 개설
  3. 스터디 삭제
  4. 채팅 목록에 여전히 표시됨
```

#### 2. 관련 문서 찾기

```
1. MASTER-INDEX.md에서 "스터디 삭제" 검색
   → studies/01-study-crud-exceptions.md#스터디-삭제

2. CROSS-REFERENCE.md에서 의존성 확인
   → Studies → Chat 관계 확인

3. chat/ 문서에서 스터디 삭제 시 처리 확인
   → chat/01-connection-exceptions.md#스터디-종료-시
```

#### 3. 원인 파악

```javascript
// 문제: 스터디 삭제 시 채팅방 미삭제

// 현재 코드 (studies/api/route.js)
const deleteStudy = async (studyId) => {
  // 스터디만 삭제
  await prisma.study.delete({
    where: { id: studyId }
  });
};

// 문제: 연관 채팅방이 삭제되지 않음
// 참조: studies/01-study-crud-exceptions.md#외래-키-제약
```

#### 4. 수정

```javascript
// 수정된 코드
const deleteStudy = async (studyId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. 채팅방 삭제
    await tx.chatRoom.deleteMany({
      where: { studyId }
    });
    
    // 2. 멤버십 삭제
    await tx.studyMember.deleteMany({
      where: { studyId }
    });
    
    // 3. 스터디 삭제
    await tx.study.delete({
      where: { id: studyId }
    });
  });
};
```

#### 5. 테스트 및 문서 업데이트

```javascript
// 테스트 추가
it('스터디 삭제 시 채팅방도 삭제되어야 함', async () => {
  const study = await createStudy();
  const chatRoom = await createChatRoom(study.id);
  
  await deleteStudy(study.id);
  
  const remainingRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoom.id }
  });
  
  expect(remainingRoom).toBeNull();
});
```

```markdown
<!-- studies/01-study-crud-exceptions.md 업데이트 -->

## 스터디 삭제

### 연관 데이터 처리

스터디 삭제 시 다음 데이터도 함께 삭제되어야 합니다:
- 멤버십
- 채팅방 ← 추가됨
- 파일
- 공지사항
```

---

### 코드 리뷰

#### 리뷰어 체크리스트

```markdown
## 예외 처리 리뷰

### 기본 체크
- [ ] 모든 API 호출에 try-catch
- [ ] 에러 메시지가 사용자 친화적
- [ ] 적절한 HTTP 상태 코드 사용
- [ ] 로깅 추가

### 보안 체크 (admin/99-best-practices.md 참조)
- [ ] 권한 검증
- [ ] 입력값 검증
- [ ] SQL 인젝션 방지
- [ ] XSS 방지

### 성능 체크 (*/06-performance-*.md 참조)
- [ ] N+1 쿼리 없음
- [ ] 적절한 인덱스 사용
- [ ] 불필요한 데이터 로딩 없음

### 문서 체크
- [ ] 새로운 예외 상황 문서화
- [ ] 코드 예제 추가
- [ ] INDEX.md 업데이트
```

#### 리뷰 코멘트 예시

```javascript
// ❌ 나쁜 예
const getStudy = async (id) => {
  return await prisma.study.findUnique({ where: { id } });
};

// 💬 리뷰 코멘트:
// 1. 에러 처리 누락 (studies/01-study-crud-exceptions.md#스터디-조회-실패)
// 2. 권한 검증 누락 (studies/05-permissions-exceptions.md)
// 3. 존재하지 않는 스터디 처리 필요

// ✅ 개선된 코드
const getStudy = async (id, userId) => {
  try {
    const study = await prisma.study.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId }
        }
      }
    });
    
    if (!study) {
      throw new NotFoundError('STD-001: 스터디를 찾을 수 없습니다');
    }
    
    // 비공개 스터디는 멤버만 접근
    if (!study.isPublic && study.members.length === 0) {
      throw new ForbiddenError('STD-002: 권한이 없습니다');
    }
    
    return study;
  } catch (error) {
    logger.error('스터디 조회 실패', { id, error });
    throw error;
  }
};
```

---

## 팀 협업 가이드

### 문서 활용 방법

#### 스탠드업 미팅

```
Q: "어제 무엇을 했나요?"
A: "auth/03-session-management의 JWT 갱신 로직 구현했습니다"

Q: "어떤 문제가 있나요?"
A: "studies/02-member-management의 초대 기능에서
    동시성 문제가 발생합니다. 
    05-edge-cases 문서를 보니 트랜잭션으로 처리해야 할 것 같습니다"
```

#### 이슈 트래킹

```markdown
## Issue #123: 로그인 후 대시보드 로딩 실패

### 재현 방법
1. 로그인
2. 대시보드 접근
3. "데이터를 불러올 수 없습니다" 표시

### 관련 문서
- dashboard/01-data-loading-exceptions.md#api-요청-실패
- auth/03-session-management-exceptions.md#jwt-토큰-만료

### 원인
JWT 토큰 갱신 로직 누락

### 해결 방법
auth/03-session-management-exceptions.md의 
"자동 갱신 구현" 섹션 참조하여 Axios 인터셉터 추가

### 우선순위
🔴 Critical (사용자가 대시보드에 접근할 수 없음)
```

#### Pull Request

```markdown
## PR #456: JWT 자동 갱신 구현

### 변경 내용
- Axios 인터셉터 추가
- 토큰 갱신 API 구현
- 테스트 케이스 추가

### 참고 문서
- auth/03-session-management-exceptions.md#자동-갱신
- dashboard/01-data-loading-exceptions.md#401-처리

### 테스트
- [x] 단위 테스트 통과
- [x] E2E 테스트 통과
- [x] 수동 테스트 완료

### 체크리스트
- [x] 코드 리뷰 완료
- [x] 문서 업데이트 완료
- [x] 배포 준비 완료
```

---

## 문서 유지보수

### 문서 업데이트 시점

#### 1. 새로운 예외 발견

```markdown
<!-- my-studies/03-notices-exceptions.md에 추가 -->

## MYSTD-NOT-010: 공지 삭제 시 댓글 미삭제

**개요**:
- **심각도**: 🟡 Medium
- **빈도**: 낮음
- **영향**: 고아 댓글 발생

**원인**:
공지 삭제 시 트랜잭션 누락

**해결**:
\`\`\`javascript
await prisma.$transaction([
  prisma.noticeComment.deleteMany({ where: { noticeId } }),
  prisma.notice.delete({ where: { id: noticeId } })
]);
\`\`\`
```

#### 2. 해결 방법 개선

```markdown
<!-- 기존 -->
## 해결 방법
try-catch 사용

<!-- 개선됨 -->
## 해결 방법

### 방법 1: 전역 에러 핸들러 (권장)
\`\`\`javascript
app.use((error, req, res, next) => {
  // ...
});
\`\`\`

### 방법 2: 라우트별 처리
\`\`\`javascript
router.get('/api/studies', asyncHandler(async (req, res) => {
  // ...
}));
\`\`\`

### 장단점 비교
| 방법 | 장점 | 단점 |
|------|------|------|
| 전역 | 일관성, 간결 | 세밀한 제어 어려움 |
| 라우트별 | 세밀한 제어 | 코드 중복 |
```

#### 3. 새로운 패턴 추가

```markdown
<!-- 99-best-practices.md에 추가 -->

## 낙관적 업데이트 패턴

React Query를 사용한 낙관적 업데이트:

\`\`\`javascript
const { mutate } = useMutation({
  mutationFn: updateStudy,
  onMutate: async (newData) => {
    // 이전 데이터 백업
    await queryClient.cancelQueries(['study', studyId]);
    const previous = queryClient.getQueryData(['study', studyId]);
    
    // 낙관적 업데이트
    queryClient.setQueryData(['study', studyId], newData);
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // 롤백
    queryClient.setQueryData(['study', studyId], context.previous);
  },
  onSettled: () => {
    // 재검증
    queryClient.invalidateQueries(['study', studyId]);
  }
});
\`\`\`

**참고**:
- dashboard/03-real-time-sync-exceptions.md#낙관적-업데이트
- chat/03-realtime-sync-exceptions.md#임시-메시지
```

### 문서 업데이트 절차

```bash
# 1. 브랜치 생성
git checkout -b docs/update-auth-exceptions

# 2. 문서 수정
# - 해당 영역 문서 수정
# - INDEX.md 업데이트
# - 필요 시 MASTER-INDEX.md 업데이트

# 3. 커밋
git add docs/exception/auth/
git commit -m "docs: AUTH-003 해결 방법 개선"

# 4. PR 생성
gh pr create --title "docs: AUTH-003 해결 방법 개선" \
  --body "Axios 인터셉터 패턴 추가"

# 5. 리뷰 및 머지
```

---

## Best Practices

### 1. 에러 메시지 작성

#### ❌ 나쁜 예
```
"에러 발생"
"실패했습니다"
"오류"
```

#### ✅ 좋은 예
```
"STD-001: 스터디를 찾을 수 없습니다. 스터디 ID를 확인해주세요."
"AUTH-003: 세션이 만료되었습니다. 다시 로그인해주세요."
"PROF-002: 이름은 2-50자여야 합니다."
```

**규칙**:
1. 예외 코드 포함
2. 구체적인 원인 설명
3. 해결 방법 제시 (가능한 경우)

### 2. 로깅

```javascript
// 구조화된 로깅
logger.error('스터디 생성 실패', {
  error: error.message,
  stack: error.stack,
  userId: req.user.id,
  studyData: req.body,
  timestamp: new Date().toISOString()
});

// 민감 정보 제외
logger.info('로그인 성공', {
  userId: user.id,
  email: maskEmail(user.email), // test@example.com → t***@example.com
  ip: req.ip
});
```

### 3. 에러 리포팅

```javascript
// Sentry 연동 예시
import * as Sentry from '@sentry/node';

app.use((error, req, res, next) => {
  // 에러 정보 수집
  Sentry.captureException(error, {
    tags: {
      route: req.path,
      method: req.method
    },
    user: {
      id: req.user?.id,
      email: req.user?.email
    },
    extra: {
      body: req.body,
      query: req.query
    }
  });
  
  // 응답
  res.status(error.statusCode || 500).json({
    error: error.message
  });
});
```

### 4. 테스트 커버리지

**목표**: 모든 예외 상황 80% 이상 커버

```javascript
// 예외 케이스 테스트
describe('예외 처리', () => {
  it('AUTH-001: 이메일 불일치', async () => {
    await expect(login('wrong@email.com', 'password'))
      .rejects.toThrow('AUTH-001');
  });
  
  it('AUTH-002: 정지된 계정', async () => {
    await expect(login('suspended@email.com', 'password'))
      .rejects.toThrow('AUTH-002');
  });
  
  // ... 모든 예외 코드에 대한 테스트
});
```

### 5. 모니터링

**설정**:
```javascript
// API 응답 시간 모니터링
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    metrics.recordApiResponseTime(req.path, duration);
    
    // 느린 요청 경고
    if (duration > 1000) {
      logger.warn('느린 API 응답', {
        path: req.path,
        duration,
        method: req.method
      });
    }
  });
  
  next();
});

// 에러 빈도 추적
app.use((error, req, res, next) => {
  metrics.incrementErrorCount(error.code);
  
  // 특정 에러가 급증하면 알림
  if (metrics.getErrorCount('AUTH-003') > 100) {
    alertTeam('AUTH-003 에러 급증');
  }
  
  next(error);
});
```

---

## 다음 단계

### 신규 팀원

1. ✅ 이 가이드 읽기 완료
2. → [TEAM-ONBOARDING.md](TEAM-ONBOARDING.md) - 온보딩 프로세스
3. → [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - 자주 쓰는 참조

### 개발 시작

1. ✅ 이 가이드 읽기 완료
2. → [MASTER-INDEX.md](MASTER-INDEX.md) - 관련 영역 찾기
3. → 해당 영역 README.md - 상세 학습

### 배포 준비

1. ✅ 이 가이드 읽기 완료
2. → [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - 배포 전 체크

---

## 도움말

### 자주 묻는 질문

**Q: 어떤 문서부터 읽어야 하나요?**
A: QUICK-REFERENCE.md → 관심 영역의 README.md 순서로 읽으세요.

**Q: 문서에서 답을 찾을 수 없어요**
A: 
1. MASTER-INDEX.md에서 검색
2. CROSS-REFERENCE.md에서 관련 문서 확인
3. 팀원에게 문의

**Q: 문서를 어떻게 업데이트하나요?**
A: 이 가이드의 "문서 유지보수" 섹션 참조

**Q: 새로운 영역을 추가하려면?**
A: 기존 영역과 동일한 구조로 작성 (README → INDEX → 상세 문서)

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-29  
**버전**: 1.0.0  
**이전 문서**: [QUICK-REFERENCE.md](QUICK-REFERENCE.md)  
**다음 문서**: [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)

