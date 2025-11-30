# CoUp 예외 처리 구현 프로젝트 시작 프롬프트

**프로젝트**: CoUp - 예외 처리 및 엣지 케이스 구현  
**작성일**: 2025-11-30  
**작업 단계**: Exception Documentation → Code Implementation  
**목표**: 문서화된 예외 처리를 실제 코드에 완벽하게 적용

---

## 🎯 프로젝트 개요

### 배경

`docs/exception/` 경로에 8개 영역(Phase 0-9)에 대한 예외 처리 및 엣지 케이스가 완벽하게 문서화되어 있습니다:
- **총 100개 문서**
- **1,020개 이상의 예외 코드**
- **영역**: auth, dashboard, studies, my-studies, chat, notifications, profile, settings, search, admin

### 목표

1. ✅ **분석**: 문서화된 예외 처리와 현재 코드 상태 비교 분석
2. ✅ **계획**: 영역별 Phase 기반 구현 계획 수립
3. ✅ **구현**: 모든 예외 처리 및 엣지 케이스 코드 적용
4. ✅ **검증**: 100% 예외 처리 커버리지 달성

### 🔄 프롬프트 자동 업데이트 시스템

**각 Step 완료 시 AI가 자동으로 수행하는 작업:**

#### 1. 완료 확인 및 요약
- ✅ 현재 Step의 모든 작업 완료 확인
- ✅ 생성된 파일/문서 목록 표시
- ✅ `docs/exception/implement/PROGRESS-TRACKER.md` 업데이트

#### 2. 다음 Step 프롬프트 생성
AI는 다음 단계를 위한 새 프롬프트를 **현재 프롬프트와 동일한 상세도**로 생성합니다:

**필수 포함 요소:**
- 📋 **목표** - 명확한 작업 목표
- ✅ **이전 완료** - "Step [N-1] 완료 ✅" 명시
- 🎯 **현재 작업** - "Step [N]" 구체적 설명
- 📝 **상세 절차** - 1-5단계 작업 지시
- 📁 **참조 문서** - 템플릿/예제 경로
- ✅ **완료 조건** - 체크리스트
- ➡️ **완료 후** - 다음 프롬프트 업데이트 지시

#### 3. 이 문서 업데이트 지시
AI가 다음과 같이 안내합니다:
```
✅ Step [N] 완료!

다음 단계를 위해 EXCEPTION-IMPLEMENTATION-PROMPT.md의 
'실행 명령' 섹션을 아래 프롬프트로 업데이트해주세요:

[새로 생성된 Step N+1 프롬프트 - 상세한 전체 내용]
```

#### 4. 사용자 작업
- 이 문서의 "실행 명령" 섹션 프롬프트 교체
- 새 세션 시작 시 업데이트된 프롬프트 사용

**중요:** `NEXT-SESSION-PROMPT.md`는 참조용이며, 실제 세션 시작은 항상 이 문서의 "실행 명령" 섹션 프롬프트를 사용합니다.

---

## 📂 프로젝트 구조

### 현재 문서화 구조

```
docs/exception/
├── auth/                    # Phase 0 - 인증 (9개 문서, ~80개 예외)
├── dashboard/               # Phase 1 - 대시보드 (9개 문서, ~100개 예외)
├── studies/                 # Phase 2 - 스터디 관리 (13개 문서, ~150개 예외)
├── my-studies/              # Phase 3 - 내 스터디 (11개 문서, ~120개 예외)
├── chat/                    # Phase 4 - 채팅 (11개 문서, ~100개 예외)
├── notifications/           # Phase 5 - 알림 (11개 문서, ~80개 예외)
├── profile/                 # Phase 6 - 프로필 (13개 문서, ~90개 예외)
├── settings/                # Phase 7 - 설정 (9개 문서, ~70개 예외)
├── search/                  # Phase 8 - 검색/필터 (9개 문서, ~80개 예외)
├── admin/                   # Phase 9 - 관리자 (5개 문서, ~150개 예외)
├── MASTER-INDEX.md          # 전체 예외 코드 색인
├── CROSS-REFERENCE.md       # 문서 간 참조 관계
├── QUICK-REFERENCE.md       # 빠른 찾기 가이드
├── FINAL-GUIDE.md           # 전체 사용 가이드
├── DEPLOYMENT-CHECKLIST.md  # 배포 체크리스트
└── TEAM-ONBOARDING.md       # 팀 온보딩 가이드
```

### 생성할 구현 문서 구조

```
docs/exception/implement/
├── README.md                      # 구현 프로젝트 개요
├── TODO.md                        # 전체 구현 TODO 리스트
├── IMPLEMENTATION-GUIDE.md        # 구현 가이드라인
├── PROGRESS-TRACKER.md            # 진행 상황 추적
│
├── auth/                          # Phase 0 구현 계획
│   ├── README.md                  # 영역 개요 및 현황
│   ├── ANALYSIS.md                # 현재 코드 vs 문서 분석
│   ├── PHASE-01-CRITICAL.md       # Phase 1: Critical 예외 구현
│   ├── PHASE-02-HIGH.md           # Phase 2: High 예외 구현
│   ├── PHASE-03-MEDIUM.md         # Phase 3: Medium 예외 구현
│   ├── PHASE-04-LOW.md            # Phase 4: Low 예외 구현
│   ├── IMPLEMENTATION-PLAN.md     # 상세 구현 계획
│   ├── CODE-CHANGES.md            # 코드 변경 사항 목록
│   └── TODO.md                    # 영역별 TODO
│
├── dashboard/                     # Phase 1 구현 계획
│   ├── README.md
│   ├── ANALYSIS.md
│   ├── PHASE-01-CRITICAL.md
│   ├── PHASE-02-HIGH.md
│   ├── PHASE-03-MEDIUM.md
│   ├── PHASE-04-LOW.md
│   ├── IMPLEMENTATION-PLAN.md
│   ├── CODE-CHANGES.md
│   └── TODO.md
│
├── studies/                       # Phase 2 구현 계획
│   └── ... (동일 구조)
│
├── my-studies/                    # Phase 3 구현 계획
│   └── ... (동일 구조)
│
├── chat/                          # Phase 4 구현 계획
│   └── ... (동일 구조)
│
├── notifications/                 # Phase 5 구현 계획
│   └── ... (동일 구조)
│
├── profile/                       # Phase 6 구현 계획
│   └── ... (동일 구조)
│
├── settings/                      # Phase 7 구현 계획
│   └── ... (동일 구조)
│
├── search/                        # Phase 8 구현 계획
│   └── ... (동일 구조)
│
└── admin/                         # Phase 9 구현 계획
    └── ... (동일 구조)
```

---

## 🚀 작업 프로세스

### Step 1: 구현 문서 구조 생성

#### 1.1 기본 폴더 생성

```bash
# docs/exception/implement 폴더 구조 생성
docs/exception/implement/
├── README.md
├── TODO.md
├── IMPLEMENTATION-GUIDE.md
├── PROGRESS-TRACKER.md
└── [10개 영역 폴더]
```

#### 1.2 각 영역별 기본 문서 템플릿 생성

**필수 문서** (각 영역당 8개):
1. `README.md` - 영역 개요
2. `ANALYSIS.md` - 현재 코드 분석
3. `PHASE-01-CRITICAL.md` - Critical 예외 구현
4. `PHASE-02-HIGH.md` - High 예외 구현
5. `PHASE-03-MEDIUM.md` - Medium 예외 구현
6. `PHASE-04-LOW.md` - Low 예외 구현
7. `IMPLEMENTATION-PLAN.md` - 구현 계획
8. `CODE-CHANGES.md` - 코드 변경사항
9. `TODO.md` - 영역별 TODO

---

### Step 2: 영역별 분석 작업

각 영역마다 다음 작업을 수행:

#### 2.1 문서 분석
- `docs/exception/[영역]/` 폴더의 모든 문서 읽기
- 정의된 모든 예외 코드 추출
- 심각도별, 빈도별 분류

#### 2.2 현재 코드 분석
- `coup/src/app/[영역]/` 폴더의 모든 코드 검토
- `coup/src/app/api/[영역]/` API 라우트 검토
- `coup/src/components/` 관련 컴포넌트 검토
- 현재 구현된 예외 처리 확인

#### 2.3 Gap 분석
- 문서화되었지만 미구현된 예외 처리
- 구현되었지만 문서와 다른 방식
- 추가 필요한 헬퍼 함수/유틸리티

#### 2.4 ANALYSIS.md 작성

**템플릿**:
```markdown
# [영역명] 현재 코드 분석 보고서

## 📊 분석 개요
- 분석 일자: YYYY-MM-DD
- 대상 파일: XX개
- 문서화된 예외: XX개
- 구현된 예외: XX개
- 구현률: XX%

## 📁 분석 대상 파일
### 페이지 컴포넌트
- coup/src/app/[영역]/page.js
- coup/src/app/[영역]/[하위]/page.js

### API 라우트
- coup/src/app/api/[영역]/route.js
- coup/src/app/api/[영역]/[하위]/route.js

### 컴포넌트
- coup/src/components/[영역]/ComponentA.jsx
- coup/src/components/[영역]/ComponentB.jsx

## 🔍 예외 처리 현황

### 구현됨 ✅ (XX개)
| 예외 코드 | 설명 | 파일 | 라인 |
|-----------|------|------|------|
| AUTH-001 | 세션 없음 | page.js | 45 |

### 미구현 ❌ (XX개)
| 예외 코드 | 설명 | 심각도 | 우선순위 |
|-----------|------|--------|----------|
| AUTH-002 | 토큰 만료 | Critical | 1 |

### 부분 구현 ⚠️ (XX개)
| 예외 코드 | 설명 | 구현 상태 | 보완 필요 사항 |
|-----------|------|-----------|----------------|
| AUTH-003 | 권한 없음 | 70% | 에러 메시지 개선 필요 |

## 📋 필요한 작업

### Critical (XX개)
1. [AUTH-002] 토큰 만료 처리
   - 파일: coup/src/app/api/auth/[...nextauth]/route.js
   - 작업: JWT 만료 감지 및 리프레시 로직 추가
   - 예상 소요: 2시간

### High (XX개)
...

### Medium (XX개)
...

### Low (XX개)
...

## 🛠️ 필요한 유틸리티

### 생성 필요
- [ ] `lib/exceptions/authErrors.js` - 인증 예외 헬퍼
- [ ] `lib/validators/authValidation.js` - 인증 유효성 검사

### 수정 필요
- [ ] `lib/auth/session.js` - 세션 관리 개선

## 📊 구현 우선순위
1. Critical (XX개) - 1주차
2. High (XX개) - 2주차
3. Medium (XX개) - 3-4주차
4. Low (XX개) - 5주차

## 📝 특이사항
- Next.js 16 App Router 사용
- Server Component와 Client Component 혼용
- Prisma ORM 사용
- NextAuth.js v5 사용
```

---

### Step 3: Phase별 구현 계획 수립

각 영역마다 4개의 Phase 문서 작성:

#### 3.1 PHASE-01-CRITICAL.md

**템플릿**:
```markdown
# [영역] Phase 1: Critical 예외 처리 구현

## 🎯 목표
- Critical 심각도 예외 XX개 구현
- 시스템 장애 방지
- 예상 기간: X일

## 📋 구현 목록

### AUTH-002: JWT 토큰 만료 처리

**문서 참조**: docs/exception/auth/02-token-management.md#AUTH-002

#### 현재 상태
```javascript
// 현재 코드 (미구현)
// coup/src/app/api/auth/[...nextauth]/route.js
export const authOptions = {
  // 토큰 만료 처리 없음
}
```

#### 구현 계획
```javascript
// 구현할 코드
import { JWT } from 'next-auth/jwt';

export const authOptions = {
  callbacks: {
    async jwt({ token, user }) {
      // 토큰 만료 확인
      if (token.exp && Date.now() >= token.exp * 1000) {
        throw new Error('AUTH-002: JWT 토큰이 만료되었습니다.');
      }
      
      // 토큰 갱신
      if (Date.now() >= token.refreshAt) {
        try {
          const newToken = await refreshAccessToken(token);
          return newToken;
        } catch (error) {
          console.error('AUTH-002: 토큰 갱신 실패', error);
          return { ...token, error: 'RefreshAccessTokenError' };
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token.error === 'RefreshAccessTokenError') {
        // 세션 무효화
        throw new Error('AUTH-002: 토큰 갱신 실패. 다시 로그인해주세요.');
      }
      
      session.user = token.user;
      return session;
    }
  }
}
```

#### 추가 파일
- `coup/src/lib/auth/tokenRefresh.js` (신규 생성)
  ```javascript
  export async function refreshAccessToken(token) {
    // 토큰 갱신 로직
  }
  ```

#### 테스트 계획
- [ ] 토큰 만료 시 리프레시 동작 확인
- [ ] 리프레시 실패 시 로그아웃 동작 확인
- [ ] 만료된 토큰으로 API 호출 시 401 응답 확인

#### 체크리스트
- [ ] 코드 구현
- [ ] 유닛 테스트 작성
- [ ] 통합 테스트
- [ ] 문서 업데이트
- [ ] 코드 리뷰
- [ ] 배포

---

### AUTH-005: 세션 검증 실패

... (동일 형식으로 모든 Critical 예외 나열)

## 📊 Phase 1 진행 상황

| 예외 코드 | 설명 | 상태 | 담당자 | 완료일 |
|-----------|------|------|--------|--------|
| AUTH-002 | JWT 토큰 만료 | ⏳ 진행중 | - | - |
| AUTH-005 | 세션 검증 실패 | ⏳ 대기 | - | - |

## ✅ Phase 1 완료 조건
- [ ] 모든 Critical 예외 구현
- [ ] 테스트 커버리지 90% 이상
- [ ] 코드 리뷰 완료
- [ ] 배포 및 모니터링
```

#### 3.2 PHASE-02-HIGH.md
(동일한 형식으로 High 심각도 예외 구현)

#### 3.3 PHASE-03-MEDIUM.md
(동일한 형식으로 Medium 심각도 예외 구현)

#### 3.4 PHASE-04-LOW.md
(동일한 형식으로 Low 심각도 예외 구현)

---

### Step 4: TODO 리스트 생성

#### 4.1 영역별 TODO.md

**템플릿**:
```markdown
# [영역] 구현 TODO

## 📊 전체 진행률
- 총 예외: XX개
- 완료: XX개 (XX%)
- 진행중: XX개 (XX%)
- 대기: XX개 (XX%)

## Phase 1: Critical (XX개)
- [ ] AUTH-002: JWT 토큰 만료 처리
- [ ] AUTH-005: 세션 검증 실패
- [ ] AUTH-007: 권한 없음

## Phase 2: High (XX개)
- [ ] AUTH-010: 비밀번호 재설정 실패
- [ ] AUTH-012: 이메일 인증 실패

## Phase 3: Medium (XX개)
- [ ] AUTH-020: 프로필 이미지 업로드 실패

## Phase 4: Low (XX개)
- [ ] AUTH-030: UI 개선 필요

## 🛠️ 필요한 작업
### 유틸리티 함수
- [ ] lib/exceptions/authErrors.js 생성
- [ ] lib/validators/authValidation.js 생성

### 테스트
- [ ] 유닛 테스트 작성
- [ ] 통합 테스트 작성
- [ ] E2E 테스트 작성

### 문서
- [ ] API 문서 업데이트
- [ ] 코드 주석 추가
- [ ] README 업데이트
```

#### 4.2 전체 TODO.md

**템플릿**:
```markdown
# CoUp 예외 처리 구현 전체 TODO

## 📊 전체 진행률
- 총 영역: 10개
- 총 예외: 1,020개
- 완료: 0개 (0%)
- 진행중: 0개 (0%)
- 대기: 1,020개 (100%)

## 영역별 진행 상황

| 영역 | 총 예외 | 완료 | 진행중 | 대기 | 진행률 | 상태 |
|------|---------|------|--------|------|--------|------|
| auth | 80 | 0 | 0 | 80 | 0% | ⏳ 대기 |
| dashboard | 100 | 0 | 0 | 100 | 0% | ⏳ 대기 |
| studies | 150 | 0 | 0 | 150 | 0% | ⏳ 대기 |
| my-studies | 120 | 0 | 0 | 120 | 0% | ⏳ 대기 |
| chat | 100 | 0 | 0 | 100 | 0% | ⏳ 대기 |
| notifications | 80 | 0 | 0 | 80 | 0% | ⏳ 대기 |
| profile | 90 | 0 | 0 | 90 | 0% | ⏳ 대기 |
| settings | 70 | 0 | 0 | 70 | 0% | ⏳ 대기 |
| search | 80 | 0 | 0 | 80 | 0% | ⏳ 대기 |
| admin | 150 | 0 | 0 | 150 | 0% | ⏳ 대기 |

## 우선순위별 작업

### Priority 1: Critical (전체 ~150개)
#### 이번 주 (Week 1)
- [ ] auth - Critical 예외 (15개)
- [ ] dashboard - Critical 예외 (15개)
- [ ] admin - Critical 예외 (20개)

#### 다음 주 (Week 2)
- [ ] studies - Critical 예외 (20개)
- [ ] my-studies - Critical 예외 (18개)
- [ ] chat - Critical 예외 (15개)

### Priority 2: High (전체 ~300개)
#### Week 3-4
- [ ] auth - High 예외 (24개)
- [ ] dashboard - High 예외 (30개)
- [ ] studies - High 예외 (45개)

### Priority 3: Medium (전체 ~400개)
#### Week 5-8
...

### Priority 4: Low (전체 ~170개)
#### Week 9-10
...

## 📅 마일스톤

### Milestone 1: Critical 완료 (Week 1-2)
- [ ] 모든 영역의 Critical 예외 구현
- [ ] 시스템 안정성 확보
- [ ] 기본 테스트 완료

### Milestone 2: High 완료 (Week 3-4)
- [ ] 모든 영역의 High 예외 구현
- [ ] 주요 기능 예외 처리 완료
- [ ] 통합 테스트 완료

### Milestone 3: Medium 완료 (Week 5-8)
- [ ] 모든 영역의 Medium 예외 구현
- [ ] 사용자 경험 개선
- [ ] 성능 테스트 완료

### Milestone 4: Low 완료 (Week 9-10)
- [ ] 모든 영역의 Low 예외 구현
- [ ] 100% 예외 처리 완료
- [ ] E2E 테스트 완료
- [ ] 배포 준비 완료

## 🎯 최종 목표
- [ ] 1,020개 예외 모두 구현
- [ ] 테스트 커버리지 90% 이상
- [ ] 문서 100% 업데이트
- [ ] 배포 및 모니터링 설정
```

---

### Step 5: 구현 작업

각 영역의 TODO를 기반으로 실제 코드 적용:

#### 5.1 구현 프로세스

1. **분석 문서 검토**
   - `docs/exception/implement/[영역]/ANALYSIS.md` 확인
   - 구현할 예외 목록 파악

2. **Phase 문서 확인**
   - `PHASE-01-CRITICAL.md` 부터 시작
   - 각 예외 코드의 구현 계획 확인

3. **코드 구현**
   - 계획된 코드 작성
   - 관련 유틸리티 함수 생성
   - 에러 핸들링 추가

4. **테스트 작성**
   - 유닛 테스트
   - 통합 테스트
   - 엣지 케이스 테스트

5. **문서 업데이트**
   - `CODE-CHANGES.md` 업데이트
   - TODO 체크
   - 진행률 업데이트

6. **코드 리뷰**
   - 코드 품질 검증
   - 베스트 프랙티스 준수 확인

7. **배포**
   - 스테이징 배포
   - 프로덕션 배포
   - 모니터링

---

## 📝 작업 가이드라인

### 코드 작성 규칙

#### 1. 예외 처리 패턴

**Server Component (RSC)**:
```javascript
// coup/src/app/[영역]/page.js
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  // AUTH-001: 세션 없음
  if (!session) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }
  
  try {
    const data = await fetchData(session.user.id);
    return <Component data={data} />;
  } catch (error) {
    // DASH-001: 데이터 로딩 실패
    if (error.code === 'DATA_FETCH_ERROR') {
      return <ErrorComponent message="데이터를 불러올 수 없습니다." />;
    }
    throw error;
  }
}
```

**API Route**:
```javascript
// coup/src/app/api/[영역]/route.js
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/exceptions/apiErrors';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // AUTH-001: 세션 없음
    if (!session) {
      return NextResponse.json(
        { 
          error: 'AUTH-001',
          message: '인증이 필요합니다.',
          details: '로그인 후 다시 시도해주세요.'
        },
        { status: 401 }
      );
    }
    
    // 데이터 조회
    const data = await prisma.study.findMany({
      where: { userId: session.user.id }
    });
    
    return NextResponse.json({ data });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Client Component**:
```javascript
// coup/src/components/[영역]/Component.jsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function Component() {
  const { data: session, status } = useSession();
  const [error, setError] = useState(null);
  
  // AUTH-001: 세션 로딩 중
  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  
  // AUTH-001: 세션 없음
  if (status === 'unauthenticated') {
    return <Redirect to="/auth/signin" />;
  }
  
  const handleSubmit = async (data) => {
    try {
      const response = await fetch('/api/studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        
        // STD-CRT-001: 스터디 생성 실패
        if (error.error === 'STD-CRT-001') {
          toast.error('스터디를 생성할 수 없습니다.');
          setError(error.message);
          return;
        }
        
        throw new Error(error.message);
      }
      
      const result = await response.json();
      toast.success('스터디가 생성되었습니다!');
      
    } catch (error) {
      console.error('STD-CRT-001:', error);
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
      setError(error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}
      {/* form fields */}
    </form>
  );
}
```

#### 2. 에러 핬퍼 함수

**coup/src/lib/exceptions/apiErrors.js** (생성):
```javascript
import { NextResponse } from 'next/server';

export const ErrorCodes = {
  // 인증 (AUTH)
  AUTH_001: { code: 'AUTH-001', message: '인증이 필요합니다.', status: 401 },
  AUTH_002: { code: 'AUTH-002', message: 'JWT 토큰이 만료되었습니다.', status: 401 },
  AUTH_003: { code: 'AUTH-003', message: '권한이 없습니다.', status: 403 },
  
  // 대시보드 (DASH)
  DASH_001: { code: 'DASH-001', message: '데이터를 불러올 수 없습니다.', status: 500 },
  
  // 스터디 (STD)
  STD_CRT_001: { code: 'STD-CRT-001', message: '스터디를 생성할 수 없습니다.', status: 400 },
  
  // ... 모든 예외 코드
};

export function handleApiError(error) {
  console.error('API Error:', error);
  
  // 알려진 예외 코드
  if (error.code && ErrorCodes[error.code.replace('-', '_')]) {
    const errorInfo = ErrorCodes[error.code.replace('-', '_')];
    return NextResponse.json(
      {
        error: errorInfo.code,
        message: errorInfo.message,
        details: error.message
      },
      { status: errorInfo.status }
    );
  }
  
  // 일반 에러
  return NextResponse.json(
    {
      error: 'INTERNAL_ERROR',
      message: '서버 오류가 발생했습니다.',
      details: error.message
    },
    { status: 500 }
  );
}

export function throwApiError(code, details) {
  const errorInfo = ErrorCodes[code.replace('-', '_')];
  if (!errorInfo) {
    throw new Error(`Unknown error code: ${code}`);
  }
  
  const error = new Error(details || errorInfo.message);
  error.code = errorInfo.code;
  error.status = errorInfo.status;
  throw error;
}
```

#### 3. 유효성 검사

**coup/src/lib/validators/commonValidation.js** (생성):
```javascript
/**
 * 세션 유효성 검사
 * @param {Object} session - NextAuth 세션 객체
 * @returns {boolean} 유효한 경우 true
 * @throws {Error} 세션이 없거나 유효하지 않은 경우
 */
export function validateSession(session) {
  if (!session) {
    throwApiError('AUTH-001', '세션이 없습니다.');
  }
  
  if (!session.user) {
    throwApiError('AUTH-001', '사용자 정보가 없습니다.');
  }
  
  return true;
}

/**
 * 권한 검사
 * @param {Object} session - NextAuth 세션 객체
 * @param {string} requiredRole - 필요한 역할 ('admin', 'user' 등)
 * @returns {boolean} 권한이 있는 경우 true
 * @throws {Error} 권한이 없는 경우
 */
export function validatePermission(session, requiredRole) {
  validateSession(session);
  
  if (session.user.role !== requiredRole && session.user.role !== 'admin') {
    throwApiError('AUTH-003', `${requiredRole} 권한이 필요합니다.`);
  }
  
  return true;
}

/**
 * 입력 데이터 유효성 검사 (Zod 사용)
 * @param {Object} data - 검증할 데이터
 * @param {Object} schema - Zod 스키마
 * @returns {Object} 검증된 데이터
 * @throws {Error} 유효성 검사 실패 시
 */

export function validateInput(data, schema) {
  // Zod 스키마 검증 (JavaScript)
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message).join(', ');
    throwApiError('VALIDATION_ERROR', errors);
  }
  
  return result.data;
}

/**
 * 데이터 유효성 검사 (수동)
 * @param {Object} data - 검증할 데이터
 * @param {Object} rules - 검증 규칙
 * @returns {boolean}
 */
export function validateManual(data, rules) {
  const errors = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    if (rule.required && !data[field]) {
      errors.push(`${field}는 필수 항목입니다.`);
    }
    if (rule.minLength && data[field]?.length < rule.minLength) {
      errors.push(`${field}는 최소 ${rule.minLength}자 이상이어야 합니다.`);
    }
    if (rule.pattern && !rule.pattern.test(data[field])) {
      errors.push(`${field} 형식이 올바르지 않습니다.`);
    }
  }
  
  if (errors.length > 0) {
    throwApiError('VALIDATION_ERROR', errors.join(', '));
  }
  
  return true;
}
```

---

## 🎯 실행 명령

### ⚠️ 중요 안내

**이 프로젝트는 단계별로 진행됩니다!**

1. **첫 시작** (현재): 아래 "프로젝트 시작 프롬프트" 사용
2. **각 단계 완료 후**: `docs/exception/NEXT-SESSION-PROMPT.md`에서 다음 단계 프롬프트 사용
3. **진행 추적**: `docs/exception/implement/PROGRESS-TRACKER.md` 확인

### 프로젝트 시작 프롬프트 (Step 1)

**이 프롬프트로 첫 세션을 시작하세요:**

```
안녕하세요! CoUp 예외 처리 구현 프로젝트를 시작하겠습니다.

**목표**: docs/exception/에 문서화된 1,020개 예외 처리를 실제 코드에 완벽하게 적용

**프로젝트 정보**:
- Next.js 16 App Router 기반
- JavaScript (ES6+) 전용
- Prisma ORM 사용
- NextAuth.js v5 인증

**중요**: 이 프로젝트는 단계별로 진행됩니다.
- 각 단계 완료 후: docs/exception/NEXT-SESSION-PROMPT.md에서 다음 프롬프트 사용
- 진행 추적: docs/exception/implement/PROGRESS-TRACKER.md

**현재 작업**: Step 1 - 구현 문서 구조 생성

다음을 수행해주세요:

1. docs/exception/implement/ 폴더 생성

2. 기본 문서 4개 작성:
   - README.md (프로젝트 개요, 300줄)
     * 전체 프로젝트 목표 및 배경
     * 작업 프로세스 설명
     * 폴더 구조
     * 참조: EXCEPTION-IMPLEMENTATION-PROMPT.md의 "프로젝트 개요" 섹션
   
   - TODO.md (전체 TODO 템플릿, 500줄)
     * 10개 영역별 진행 상황 표
     * 우선순위별 작업 (Critical → Low)
     * 마일스톤 4개
     * 참조: EXCEPTION-IMPLEMENTATION-PROMPT.md의 "4.2 전체 TODO.md" 템플릿
   
   - IMPLEMENTATION-GUIDE.md (구현 가이드, 600줄)
     * 코드 작성 규칙
     * 예외 처리 패턴 (Server/API/Client)
     * 에러 헬퍼 함수 예제
     * 유효성 검사 예제
     * 참조: EXCEPTION-IMPLEMENTATION-PROMPT.md의 "작업 가이드라인" 섹션
   
   - PROGRESS-TRACKER.md (진행 추적, 400줄)
     * Step 0-7 진행 상황 표
     * 현재 단계 표시
     * 다음 단계 안내
     * 완료율 계산

3. 10개 영역 폴더 생성:
   - auth, dashboard, studies, my-studies, chat
   - notifications, profile, settings, search, admin

4. 각 영역별 9개 템플릿 문서 생성 (총 90개):
   - README.md (영역 개요 템플릿)
   - ANALYSIS.md (분석 보고서 템플릿)
   - PHASE-01-CRITICAL.md (Critical 예외 구현 템플릿)
   - PHASE-02-HIGH.md (High 예외 구현 템플릿)
   - PHASE-03-MEDIUM.md (Medium 예외 구현 템플릿)
   - PHASE-04-LOW.md (Low 예외 구현 템플릿)
   - IMPLEMENTATION-PLAN.md (구현 계획 템플릿)
   - CODE-CHANGES.md (코드 변경사항 템플릿)
   - TODO.md (영역별 TODO 템플릿)
   
   템플릿 참조: EXCEPTION-IMPLEMENTATION-PROMPT.md의 Step 2, 3, 4 섹션

5. PROGRESS-TRACKER.md 업데이트:
   - Step 1 상태를 "✅ 완료"로 변경
   - 완료 날짜 기록
   - 다음 단계 안내 추가

**완료 조건**:
- [ ] implement/ 폴더 및 4개 기본 문서 생성
- [ ] 10개 영역 폴더 생성
- [ ] 90개 템플릿 문서 생성
- [ ] PROGRESS-TRACKER.md 업데이트

**완료 후**:
작업 완료 메시지와 함께 다음 단계 프롬프트를 생성하세요:

"✅ Step 1 완료!

다음 단계를 위해 EXCEPTION-IMPLEMENTATION-PROMPT.md 파일의 '실행 명령' 섹션을 다음과 같이 업데이트해주세요:"

그리고 Step 2-1 (auth 분석)을 위한 새로운 프롬프트를 생성하여 보여주세요.
새 프롬프트는 현재 Step 1 프롬프트와 동일한 상세도와 형식으로 작성되어야 하며, 다음 내용을 포함해야 합니다:
- 목표 및 프로젝트 정보
- 이전 완료 단계 (Step 1 ✅)
- 현재 작업: Step 2-1 - auth 영역 분석
- 상세한 작업 절차 (1-5단계)
- 완료 조건 체크리스트
- 완료 후 안내 (Step 2-2로 업데이트 지시)

시작해주세요!
```

---

### 📌 중요: 단계별 프롬프트 업데이트 방식

**각 Step 완료 시 다음 작업을 자동으로 수행:**

1. **완료 확인 및 요약**
   - 현재 Step의 완료 상태 확인
   - 생성된 파일/문서 목록 표시
   - `PROGRESS-TRACKER.md` 업데이트

2. **다음 Step 프롬프트 생성**
   - 현재 프롬프트와 동일한 상세도로 작성
   - 이전 단계 완료 표시 (✅)
   - 현재 단계의 구체적인 작업 지시
   - 참조 문서 및 템플릿 경로 명시
   - 완료 조건 체크리스트 포함

3. **EXCEPTION-IMPLEMENTATION-PROMPT.md 업데이트 지시**
   - "실행 명령" 섹션의 프롬프트를 새로 생성한 프롬프트로 교체
   - 사용자가 새 세션에서 바로 사용할 수 있도록 준비

### 프롬프트 업데이트 예시

**Step 1 완료 후 → Step 2-1 프롬프트 생성:**
```
EXCEPTION-IMPLEMENTATION-PROMPT.md의 "실행 명령" 섹션을 다음 프롬프트로 업데이트:

안녕하세요! CoUp 예외 처리 구현 Step 2를 시작합니다.

**목표**: auth 영역의 예외 처리 분석

**프로젝트 정보**:
- Next.js 16 App Router 기반
- JavaScript (ES6+) 전용
- Prisma ORM 사용
- NextAuth.js v5 인증

**이전 완료**: Step 1 (문서 구조 생성) ✅
- docs/exception/implement/ 폴더 생성 완료
- 4개 기본 문서 작성 완료
- 10개 영역별 폴더 및 90개 템플릿 생성 완료

**현재 작업**: Step 2-1 - auth 영역 분석

다음을 수행해주세요:

1. 문서 분석
   - docs/exception/auth/ 폴더의 모든 문서 읽기
   ... (상세 지시사항)

[나머지 상세한 프롬프트 내용]
```

---

## 📋 체크리스트

### Phase 0: 준비 (Week 0)
- [ ] 프로젝트 구조 이해
- [ ] 문서 검토 (docs/exception/)
- [ ] 현재 코드 구조 파악
- [ ] 개발 환경 설정

### Phase 1: 문서 구조 생성 (Week 1)
- [ ] implement/ 폴더 생성
- [ ] 기본 문서 작성 (README, TODO, GUIDE)
- [ ] 10개 영역 폴더 생성
- [ ] 영역별 템플릿 문서 생성

### Phase 2: 분석 (Week 1-2)
- [ ] auth 영역 분석
- [ ] dashboard 영역 분석
- [ ] studies 영역 분석
- [ ] my-studies 영역 분석
- [ ] chat 영역 분석
- [ ] notifications 영역 분석
- [ ] profile 영역 분석
- [ ] settings 영역 분석
- [ ] search 영역 분석
- [ ] admin 영역 분석

### Phase 3: 구현 계획 (Week 2-3)
- [ ] 10개 영역 × 4개 Phase 문서 작성 (40개)
- [ ] 영역별 TODO 작성 (10개)
- [ ] 전체 TODO 통합 (1개)
- [ ] 우선순위 설정

### Phase 4: Critical 구현 (Week 3-4)
- [ ] auth - Critical (15개)
- [ ] dashboard - Critical (15개)
- [ ] admin - Critical (20개)
- [ ] 나머지 영역 Critical (~100개)

### Phase 5: High 구현 (Week 5-6)
- [ ] 모든 영역 High 예외 (~300개)

### Phase 6: Medium 구현 (Week 7-10)
- [ ] 모든 영역 Medium 예외 (~400개)

### Phase 7: Low 구현 (Week 11-12)
- [ ] 모든 영역 Low 예외 (~170개)

### Phase 8: 테스트 및 검증 (Week 13)
- [ ] 유닛 테스트 (90% 커버리지)
- [ ] 통합 테스트
- [ ] E2E 테스트
- [ ] 성능 테스트

### Phase 9: 문서화 및 배포 (Week 14)
- [ ] API 문서 업데이트
- [ ] README 업데이트
- [ ] 배포 가이드 작성
- [ ] 프로덕션 배포

### Phase 10: 완료 (Week 14)
- [ ] 최종 보고서 작성
- [ ] 코드 리뷰 완료
- [ ] 100% 예외 처리 완료 확인
- [ ] 프로젝트 종료

---

## 📊 예상 산출물

### 문서
- **implement/README.md**: 프로젝트 개요 (300줄)
- **implement/TODO.md**: 전체 TODO (500줄)
- **implement/IMPLEMENTATION-GUIDE.md**: 구현 가이드 (600줄)
- **implement/PROGRESS-TRACKER.md**: 진행 추적 (400줄)
- **10개 영역 × 8개 문서 = 80개 문서** (평균 400줄/문서 = 32,000줄)
- **총 문서**: 84개, 약 33,800줄

### 코드
- **예외 헬퍼 함수**: ~10개 파일 (lib/exceptions/)
- **유효성 검사**: ~10개 파일 (lib/validators/)
- **수정된 페이지 컴포넌트**: ~50개
- **수정된 API 라우트**: ~100개
- **수정된 컴포넌트**: ~200개
- **테스트 파일**: ~300개

### 테스트
- **유닛 테스트**: 1,000+ 테스트 케이스
- **통합 테스트**: 500+ 테스트 케이스
- **E2E 테스트**: 200+ 시나리오
- **커버리지**: 90% 이상

---

## 🎯 성공 기준

### 완료 조건
1. ✅ **1,020개 예외 모두 구현**
2. ✅ **테스트 커버리지 90% 이상**
3. ✅ **모든 문서 업데이트**
4. ✅ **코드 리뷰 100% 완료**
5. ✅ **프로덕션 배포 완료**
6. ✅ **모니터링 설정 완료**

### 품질 기준
- ✅ ESLint/Prettier 규칙 준수
- ✅ JavaScript 코드 품질 (ES6+ 문법)
- ✅ JSDoc 주석 작성 (타입 힌트)
- ✅ 성능 저하 없음
- ✅ 보안 취약점 없음
- ✅ 접근성(a11y) 준수

---

## 📞 연락 및 지원

**질문이 있으시면**:
- 문서 참조: docs/exception/FINAL-GUIDE.md
- 빠른 검색: docs/exception/QUICK-REFERENCE.md
- 전체 색인: docs/exception/MASTER-INDEX.md

**긴급 상황**:
- Critical 예외는 즉시 처리
- 시스템 장애는 최우선 대응

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-30  
**버전**: 1.0.0  
**상태**: 시작 준비 완료 ✅

---

## 🚀 지금 바로 시작하세요!

위의 "실행 명령" 섹션의 프롬프트를 복사하여 새 세션에서 사용하시면 됩니다.

**Happy Coding! 🎉**

