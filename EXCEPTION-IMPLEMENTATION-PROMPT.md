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

### 🔄 프롬프트 자동 업데이트 시스템 (중요!)

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

#### 3. 이 문서 자동 업데이트 ⭐ NEW!
**AI가 직접 이 문서를 업데이트합니다:**

```
✅ Step [N] 완료!

이제 EXCEPTION-IMPLEMENTATION-PROMPT.md 파일의 '실행 명령' 섹션을 
Step [N+1] 프롬프트로 자동 업데이트합니다...

[replace_string_in_file 도구를 사용하여 프롬프트 교체]

✅ 업데이트 완료! 
새 세션에서 이 파일의 "실행 명령" 섹션을 복사하여 사용하세요.
```

**자동화된 프로세스:**
1. Step 완료 확인
2. 다음 Step 프롬프트 생성 (상세한 전체 내용)
3. `replace_string_in_file` 도구로 "실행 명령" 섹션 교체
4. 사용자에게 완료 알림

**사용자는 추가 작업 불필요!**
- ❌ 수동으로 프롬프트 복사/붙여넣기 불필요
- ✅ 파일을 열어서 "실행 명령" 섹션만 복사
- ✅ 새 세션 시작

**중요:** 각 Step이 완료되면 AI가 자동으로 이 파일을 업데이트하므로, 사용자는 별도의 지시 없이도 항상 최신 프롬프트를 사용할 수 있습니다.

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

1. **현재 단계**: Step 6 (my-studies Phase 2 - API 강화)
2. **각 단계 완료 후**: AI가 자동으로 이 섹션을 다음 단계 프롬프트로 업데이트
3. **진행 추적**: `docs/exception/implement/PROGRESS-TRACKER.md` 확인

### 현재 세션 프롬프트 (Step 6 - my-studies Phase 2: API 강화)

**이 프롬프트로 새 세션을 시작하세요:**

```
안녕하세요! CoUp 예외 처리 구현 Step 6을 시작합니다.

**목표**: my-studies 영역 Phase 2 - API 강화

**프로젝트 정보**:
- Next.js 16 App Router 기반
- JavaScript (ES6+) 전용
- React Query (TanStack Query) 사용

**이전 완료**:
- Step 1 (문서 구조 생성) ✅
- Step 2 (study 영역 완료) ✅ - 126개 예외 처리
- Step 3 (dashboard 영역 완료) ✅
  - Phase 1~5 전체 완료
  - 30개 파일, 4,736줄, 100% 완료
  - 성능: 리렌더링 86%↓, 객체 생성 70%↓
- Step 4 (my-studies 분석) ✅
  - 13개 페이지, 2개 API 분석
  - 구현률 ~25%, 32시간 예상
- **Step 5 (my-studies Phase 1 완료) ✅**
  - ✅ my-studies-errors.js (62개 에러 코드)
  - ✅ my-studies-validation.js (11개 함수)
  - ✅ my-studies-helpers.js (15개 함수)
  - **총 88개 함수, ~1,800줄, 3시간 소요**

**현재 작업**: Step 6 - my-studies Phase 2: API 강화 (8시간)

**현재 진행률**: 73.3% (33h/45h)

**참조 문서**:
- `docs/exception/implement/my-studies/STEP-6-PROMPT.md` - 상세 작업 지침
- `docs/exception/implement/my-studies/STEP-5-COMPLETE-REPORT.md` - Phase 1 완료 보고
- `coup/src/lib/exceptions/my-studies-errors.js` - 생성된 에러 코드
- `coup/src/lib/validators/my-studies-validation.js` - 유효성 검사 함수
- `coup/src/lib/my-studies-helpers.js` - 헬퍼 함수

---

## 작업 내용

### Phase 2: API 강화 (8시간)

기존 my-studies API에 예외 처리를 강화하여 안정성과 사용자 경험을 개선합니다.

### 2.1 목록 API 개선 (3시간)

**파일**: `coup/src/app/api/my-studies/route.js`

**개선 사항**:
1. ✅ 타임아웃 처리 (10초)
2. ✅ 삭제된 스터디 필터링 (deletedAt: null)
3. ✅ 입력값 검증 (filter, page, limit)
4. ✅ 에러 메시지 한글화
5. ✅ 구조화된 로깅 (성공/실패 모두)
6. ✅ 성능 측정 (duration)

**사용할 유틸리티**:
```javascript
import { 
  MY_STUDIES_ERRORS, 
  createMyStudiesError, 
  logMyStudiesError, 
  handlePrismaError 
} from '@/lib/exceptions/my-studies-errors'
import { validateFilter, validatePagination } from '@/lib/validators/my-studies-validation'
import { getFilteredStudies } from '@/lib/my-studies-helpers'
```

**핵심 변경 사항**:
- Prisma 쿼리에 `study: { deletedAt: null }` 조건 추가
- AbortController로 타임아웃 구현
- 모든 에러 케이스별 한글 메시지
- 성능 메트릭 포함한 응답

### 2.2 스터디 상세 API 개선 (3시간)

**파일**: `coup/src/app/api/studies/[id]/route.js` (GET 메서드만)

**개선 사항**:
1. ✅ studyId 검증 (validateStudyId)
2. ✅ 삭제된 스터디 확인 (study.deletedAt 체크)
3. ✅ PENDING 상태 처리 (별도 에러 응답)
4. ✅ 멤버십 정보 추가 (myRole, myMembershipId, joinedAt)
5. ✅ 에러 메시지 개선
6. ✅ 로깅 강화 (경고/정보 레벨 구분)

**핵심 변경 사항**:
- 8단계 검증 프로세스 (인증 → studyId → 존재 → 삭제 → 멤버십 → PENDING → 응답)
- myMembership 정보를 응답에 포함
- 각 단계별 적절한 로깅

### 2.3 공통 미들웨어 생성 (2시간)

**파일**: `coup/src/lib/middleware/my-studies-middleware.js` (신규)

**함수**:
1. `requireAuth(request)` - 인증 확인
2. `requireStudyMember(studyId, userId, minRole)` - 스터디 멤버 확인 + 역할 검증
3. `withTimeout(promise, ms)` - Promise 타임아웃 래퍼

**사용 예시**:
```javascript
// API 라우트에서
const auth = await requireAuth(request)
if (auth.error) {
  return NextResponse.json(auth.error, { status: auth.statusCode })
}

const member = await requireStudyMember(studyId, auth.userId, 'ADMIN')
if (member.error) {
  return NextResponse.json(member.error, { status: member.statusCode })
}

// member.study, member.membership, member.role 사용 가능
```

---

## 완료 조건

- [ ] my-studies/route.js GET 메서드 개선 완료
- [ ] studies/[id]/route.js GET 메서드 개선 완료
- [ ] my-studies-middleware.js 생성 완료
- [ ] 모든 에러 메시지 한글화 확인
- [ ] 로깅 테스트 (개발 환경에서 확인)
- [ ] STEP-6-COMPLETE-REPORT.md 작성
- [ ] PROGRESS-TRACKER.md 업데이트
- [ ] 이 파일의 "실행 명령" 섹션을 Step 7로 업데이트

---

## 📝 구현 가이드

### 타임아웃 구현 패턴
```javascript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 10000)

try {
  // 쿼리 실행
  const result = await prisma.xxx.findMany(...)
  clearTimeout(timeoutId)
  // 처리
} catch (error) {
  if (error.name === 'AbortError') {
    // 타임아웃 처리
  }
}
```

### 삭제된 스터디 필터링
```javascript
where: {
  userId,
  study: {
    deletedAt: null  // 필수!
  }
}
```

### PENDING 처리
```javascript
if (myMembership.role === 'PENDING') {
  const error = createMyStudiesError('STUDY_PENDING_APPROVAL')
  return NextResponse.json(error, { status: error.statusCode })
}
```

---

## 참조

상세한 코드 예시는 `docs/exception/implement/my-studies/STEP-6-PROMPT.md`를 확인하세요.

**시작해주세요!**
```
    message: '참여 중인 스터디가 없습니다',
    statusCode: 404,
    userMessage: '아직 참여 중인 스터디가 없어요. 지금 바로 관심있는 스터디를 찾아보세요!'
  },
  STUDY_DELETED: {
    code: 'MY_STUDIES_002',
    message: '삭제된 스터디입니다',
    statusCode: 404,
    userMessage: '이 스터디는 삭제되었습니다'
  },
  // ... 총 20개 에러 코드
}

/**
 * my-studies 에러 응답 생성
 */
export function createMyStudiesError(errorKey, customMessage = null) {
  // ...구현
}

/**
 * my-studies 에러 로깅
 */
export function logMyStudiesError(context, error, metadata = {}) {
  // ...구현
}
```

**예상 라인 수**: ~250줄  
**예상 에러 코드**: ~20개

### 2. my-studies-validation.js 생성 (2시간)

**파일**: `coup/src/lib/validators/my-studies-validation.js`

**목적**: my-studies 데이터 유효성 검사

**주요 함수**:
- `validateStudyId(studyId)` - 스터디 ID 검증
- `validateFilter(filter)` - 필터 파라미터 검증
- `validateTab(tab)` - 탭 이름 검증
- `validateRole(role)` - 역할 검증
- `validatePagination(page, limit)` - 페이지네이션 검증
- `validateStudyData(study)` - 스터디 데이터 검증
- `validateMembershipData(membership)` - 멤버십 데이터 검증

**예상 라인 수**: ~200줄

### 3. my-studies-helpers.js 생성 (3시간)

**파일**: `coup/src/lib/my-studies-helpers.js`

**목적**: my-studies 공통 유틸리티 함수

**주요 함수**:
- `checkStudyAccess(study, userId, membership)` - 스터디 접근 권한 확인
- `checkTabPermission(tab, role)` - 탭 접근 권한 확인
- `getFilteredStudies(studies, filter)` - 안전한 스터디 필터링
- `getRoleBadge(role)` - 역할 배지 정보 생성
- `formatStudyStats(stats)` - 스터디 통계 포맷팅
- `getStudyTabs(studyId, role)` - 탭 정보 생성
- `getEmptyStateMessage(tab, filter)` - 빈 상태 메시지 생성

**예상 라인 수**: ~350줄

---

## ✅ 완료 조건

Phase 1 완료를 위한 체크리스트:

### 파일 생성
- [ ] `my-studies-errors.js` (~250줄, ~20개 에러 코드)
- [ ] `my-studies-validation.js` (~200줄, 7-8개 함수)
- [ ] `my-studies-helpers.js` (~350줄, 7-10개 함수)

### 검증
- [ ] 모든 함수에 JSDoc 주석 추가
- [ ] 에러 없이 컴파일
- [ ] ESLint 경고 0개
- [ ] 사용 예시 주석 추가

### 문서화
- [ ] PHASE-1-COMPLETE.md 작성
- [ ] PROGRESS-TRACKER.md 업데이트 (70% → 75%)

### 총 예상 산출물
- **파일**: 3개
- **라인 수**: ~800줄
- **함수**: ~30-35개
- **에러 코드**: ~20개

---

## 📝 완료 후 작업

Phase 1 완료 시 AI가 자동으로:
1. ✅ PHASE-1-COMPLETE.md 작성
2. ✅ PROGRESS-TRACKER.md 업데이트
3. ✅ Step 5 Phase 2 프롬프트 생성
4. ✅ EXCEPTION-IMPLEMENTATION-PROMPT.md 업데이트

**사용자는 추가 작업 불필요!**  
새 세션에서 EXCEPTION-IMPLEMENTATION-PROMPT.md를 열어 업데이트된 프롬프트를 복사하세요.

---

## 🎯 다음 단계

Phase 1 완료 후:
- **Step 5 Phase 2**: my-studies Critical 예외 구현 (8시간)
  - 목록 페이지 개선 (3h)
  - 대시보드 개선 (3h)
  - API 개선 (2h)

---

**예상 소요 시간**: 8시간  
**핵심 목표**:
- ✅ 재사용 가능한 유틸리티 생성
- ✅ 일관된 에러 처리 시스템
- ✅ 안전한 데이터 검증
- ✅ 명확한 사용자 메시지

**시작해주세요!** 🚀
```

시작하시면 됩니다!


#### 1.2 분석 작업

**1단계: 문서 검토**
```
1. docs/exception/my-studies/ 폴더의 모든 문서 읽기 (11개)
2. 각 Phase별 예외 분류
3. 우선순위 파악
```

**2단계: 코드 분석**
```
1. coup/src/app/my-studies/ 페이지 분석
2. coup/src/app/api/studies/[id]/ API 분석
3. coup/src/components/my-studies/ 컴포넌트 분석
4. 현재 구현된 예외 처리 파악
```

**3단계: Gap 분석**
```
1. 문서화된 예외 vs 현재 코드 비교
2. 미구현 예외 목록 작성
3. 구현 필요한 파일 식별
```

### 2. 구현 계획 수립 (3시간)

#### 2.1 Phase별 작업 계획

**Phase 1: 유틸리티 생성** (8시간)
- my-studies-errors.js (3h)
- my-studies-validation.js (3h)
- my-studies-helpers.js (2h)

**Phase 2: Critical 예외 구현** (6시간)
- API 라우트 강화 (4h)
- 컴포넌트 에러 처리 (2h)

**Phase 3: High 예외 구현** (8시간)
- 멤버 관리 (3h)
- 일정/할일 (3h)
- 채팅 연동 (2h)

**Phase 4: Medium/Low 예외** (4-8시간)
- 성능 최적화 (2h)
- 사용자 경험 개선 (2-6h)

#### 2.2 우선순위 설정

**Critical (즉시 구현)**:
1. 스터디 접근 권한 확인
2. API 에러 처리
3. 세션 만료 처리
4. 데이터 검증

**Important (1-2주 내)**:
1. 멤버 역할 검증
2. 일정 충돌 확인
3. 파일 업로드 검증
4. 채팅 메시지 검증

**Nice-to-Have (여유 있을 때)**:
1. 성능 최적화
2. UI/UX 개선
3. 고급 필터링
4. 통계 및 분석

### 3. Dashboard 패턴 적용 계획 (2시간)

#### 3.1 재사용 가능한 패턴

**Dashboard에서 학습한 베스트 프랙티스**:

1. **계층적 ErrorBoundary**
   ```
   MyStudiesPage
   └─ MyStudiesErrorBoundary
      └─ MyStudiesClient
         ├─ StudyDetailErrorBoundary
         │  └─ StudyDetail
         ├─ MembersErrorBoundary
         │  └─ MembersList
         └─ ActivitiesErrorBoundary
            └─ ActivitiesList
   ```

2. **Skeleton 로딩 패턴**
   ```javascript
   // 로딩 중
   <MyStudiesSkeleton />
   
   // 로딩 완료
   <MyStudiesClient data={data} />
   ```

3. **React Query 패턴**
   ```javascript
   useQuery({
     queryKey: ['my-studies', studyId],
     queryFn: () => fetchMyStudy(studyId),
     staleTime: 30000,
     refetchInterval: 60000,
     retry: 3
   })
   ```

4. **성능 최적화 패턴**
   ```javascript
   // React.memo
   const MemberCard = memo(function MemberCard({ member }) {
     // ...
   }, arePropsEqual)
   
   // useMemo
   const filteredMembers = useMemo(() => {
     return members.filter(m => m.status === 'ACTIVE')
   }, [members])
   ```

#### 3.2 새로 필요한 패턴

**my-studies 특화 패턴**:

1. **실시간 채팅 동기화**
   ```javascript
   // WebSocket 또는 Polling
   useEffect(() => {
     const interval = setInterval(() => {
       refetchMessages()
     }, 5000)
     
     return () => clearInterval(interval)
   }, [refetchMessages])
   ```

2. **멤버 권한 확인**
   ```javascript
   // HOC 또는 Hook
   function useStudyPermission(studyId, requiredRole) {
     const { data: member } = useStudyMember(studyId)
     
     return useMemo(() => {
       return hasPermission(member?.role, requiredRole)
     }, [member?.role, requiredRole])
   }
   ```

3. **Optimistic Update (할일/일정)**
   ```javascript
   const { mutate } = useMutation({
     mutationFn: updateTask,
     onMutate: async (variables) => {
       // 즉시 UI 업데이트
       queryClient.setQueryData(['tasks', studyId], (old) => {
         return updateTaskInList(old, variables)
       })
     },
     onError: (err, variables, context) => {
       // 롤백
       queryClient.setQueryData(['tasks', studyId], context.previousData)
     }
   })
   ```

### 4. 파일 구조 계획 (1시간)

#### 4.1 생성 필요한 파일

**유틸리티** (3개):
```
coup/src/lib/exceptions/my-studies-errors.js
coup/src/lib/validators/my-studies-validation.js
coup/src/lib/helpers/my-studies-helpers.js
```

**ErrorBoundary** (4개):
```
coup/src/components/my-studies/MyStudiesErrorBoundary.jsx
coup/src/components/my-studies/StudyDetailErrorBoundary.jsx
coup/src/components/my-studies/MembersErrorBoundary.jsx
coup/src/components/my-studies/ActivitiesErrorBoundary.jsx
```

**Skeleton** (5개):
```
coup/src/components/my-studies/MyStudiesSkeleton.jsx
coup/src/components/my-studies/StudyDetailSkeleton.jsx
coup/src/components/my-studies/MembersListSkeleton.jsx
coup/src/components/my-studies/TaskListSkeleton.jsx
coup/src/components/my-studies/CalendarSkeleton.jsx
```

**Hooks** (5개):
```
coup/src/lib/hooks/useMyStudies.js
coup/src/lib/hooks/useStudyDetail.js
coup/src/lib/hooks/useStudyMembers.js
coup/src/lib/hooks/useStudyTasks.js
coup/src/lib/hooks/useStudyEvents.js
```

#### 4.2 수정 필요한 파일

**API 라우트** (예상 10개):
```
coup/src/app/api/studies/[id]/route.js (GET 개선)
coup/src/app/api/studies/[id]/members/route.js (GET 개선)
coup/src/app/api/studies/[id]/tasks/route.js (GET, POST 개선)
coup/src/app/api/studies/[id]/calendar/route.js (GET, POST 개선)
coup/src/app/api/studies/[id]/messages/route.js (GET, POST 개선)
... 등
```

**컴포넌트** (예상 15개):

  describe('성능', () => {
    test('React.memo 동작 확인', async () => {
      // props 변경 없을 때 리렌더링 안 함
    })

    test('useMemo 캐싱 확인', async () => {
      // 의존성 변경 없을 때 재계산 안 함
    })
  })
})
```

**실행 명령**:
```bash
npm test -- dashboard/integration.test.js
```

---

## ✅ 완료 조건 (Phase 5)

- [ ] 모든 기능 테스트 통과
- [ ] 성능 벤치마크 목표 달성
- [ ] 에러 시나리오 모두 검증
- [ ] 통합 테스트 작성 및 통과
- [ ] 성능 보고서 작성
- [ ] PHASE-5-COMPLETE.md 작성
- [ ] **Dashboard 전체 완료!** 🎉

---

## 📝 완료 후 작업

Phase 5 완료 시:
1. ✅ **PHASE-5-COMPLETE.md** 작성
   - 모든 테스트 결과 정리
   - 성능 측정 결과 문서화
   - Before/After 비교
   
2. ✅ **DASHBOARD-FINAL-REPORT.md** 작성
   - Step 3-2 전체 요약
   - Phase 1-5 성과 정리
   - 총 구현 통계
   - 다음 영역 준비사항

3. ✅ **PROGRESS-TRACKER.md** 업데이트
   - Step 3-2 완료 표시
   - 전체 진행률 업데이트
   - 다음 영역 (my-studies) 준비

4. ✅ **이 파일의 "실행 명령" 섹션 업데이트**
   - 다음 영역 (Step 4: my-studies) 프롬프트로 교체

---

## 🎯 예상 결과

### Dashboard 영역 완료 통계

**총 작업 시간**: 31h (예상)

| Phase | 작업 | 시간 | 상태 |
|-------|------|------|------|
| Phase 1 | 유틸리티 생성 | 16h | ✅ |
| Phase 2.1 | API 강화 | 2h | ✅ |
| Phase 3.1 | ErrorBoundary | 2h | ✅ |
| Phase 3.2 | 로딩 개선 | 2h | ✅ |
| Phase 4.1 | 실시간 업데이트 | 2h | ✅ |
| Phase 4.2 | 성능 최적화 | 2h | ✅ |
| **Phase 5** | **통합 테스트** | **2h** | **⏳** |
| **총계** | - | **28h/45h** | **62.2%** |

### 구현 완료 항목

- ✅ 106개 유틸리티 함수
- ✅ 15개 API 엔드포인트 강화
- ✅ 7개 ErrorBoundary 컴포넌트
- ✅ 6개 스켈레톤 컴포넌트
- ✅ 10개 React Query Hook
- ✅ 17개 성능 최적화 (memo, useMemo, useCallback)
- ✅ 92개 자동화 테스트
- ⏳ 통합 테스트 (진행 예정)

### 성능 개선

- ✅ 리렌더링 86% 감소
- ✅ 객체 생성 70% 감소
- ✅ UI 깜빡임 80% 감소
- ⏳ 번들 크기 측정 (진행 예정)
- ⏳ Lighthouse 점수 (진행 예정)

---

## 🚀 다음 단계

**Phase 5 완료 후**:

### Step 4: my-studies 영역 구현 (예정)

**예상 소요 시간**: 25-30시간

**구현 범위**:
- 내 스터디 목록
- 스터디 상세 정보
- 멤버 관리
- 일정 관리
- 할일 관리
- 채팅 연동

**참조 문서**:
- `docs/exception/my-studies/` (11개 문서, ~120개 예외)

---

## 📋 체크리스트

### Phase 5 진행 체크리스트

- [ ] **1단계: 기능 테스트**
  - [ ] Dashboard 전체 기능 확인
  - [ ] 통계 카드 동작 확인
  - [ ] 5개 위젯 동작 확인
  - [ ] ErrorBoundary 동작 확인
  - [ ] Optimistic Update 확인
  
- [ ] **2단계: 성능 벤치마크**
  - [ ] React DevTools Profiler 측정
  - [ ] 초기 렌더링 시간 측정
  - [ ] 리렌더링 성능 측정
  - [ ] 메모리 사용량 측정
  - [ ] 번들 크기 확인
  - [ ] Lighthouse 점수 측정
  
- [ ] **3단계: 에러 시나리오**
  - [ ] API 에러 테스트
  - [ ] Invalid 데이터 테스트
  - [ ] 경계 조건 테스트
  - [ ] 동시성 문제 테스트
  - [ ] 통합 테스트 작성
  
- [ ] **4단계: 문서화**
  - [ ] PHASE-5-COMPLETE.md 작성
  - [ ] DASHBOARD-FINAL-REPORT.md 작성
  - [ ] 성능 보고서 작성
  - [ ] PROGRESS-TRACKER.md 업데이트

### 완료 확인

Phase 5 완료 시 다음을 확인하세요:

✅ **모든 기능 정상 작동**
- Dashboard 페이지 접속 가능
- 모든 위젯 정상 표시
- 실시간 업데이트 동작
- 에러 처리 완벽

✅ **성능 목표 달성**
- 초기 렌더링 < 500ms
- 리렌더링 < 100ms
- 번들 크기 < 500KB
- Lighthouse > 90

✅ **테스트 완료**
- 유닛 테스트 통과
- 통합 테스트 통과
- 에러 시나리오 검증

✅ **문서화 완료**
- 모든 Phase 완료 보고서 작성
- 최종 보고서 작성
- 다음 단계 준비

---

**작업 시작 전 확인사항**:
1. 이전 Phase (4.2) 완료 확인
2. 참조 문서 위치 확인
3. 개발 환경 준비 (React DevTools, Lighthouse)
4. 테스트 환경 설정

#### 2.2 커스텀 Hook 메모이제이션

**파일**: `coup/src/lib/hooks/useDashboardStats.js` (신규)

```javascript
import { useMemo } from 'react'
import { useDashboard } from './useApi'

/**
 * 대시보드 통계 계산 Hook
 */
export function useDashboardStats() {
  const { data, isLoading, error } = useDashboard()

  const stats = useMemo(() => {
    if (!data?.data?.stats) {
      return {
        activeStudies: 0,
        pendingTasks: 0,
        completionRate: 0,
        attendanceRate: 0
      }
    }

    const { stats: rawStats } = data.data

    return {
      activeStudies: rawStats.activeStudies || 0,
      pendingTasks: rawStats.pendingTasks || 0,
      completionRate: calculatePercentage(
        rawStats.completedTasks,
        rawStats.totalTasks
      ),
      attendanceRate: calculatePercentage(
        rawStats.attendedCount,
        rawStats.totalAttendance
      )
    }
  }, [data?.data?.stats])

  return { stats, isLoading, error }
}
```

### 3. 코드 스플리팅 (45분)

#### 3.1 동적 import로 위젯 로딩

**파일**: `coup/src/components/dashboard/DashboardClient.jsx` (수정)

```javascript
'use client'

import dynamic from 'next/dynamic'
import { useDashboard } from '@/lib/hooks/useApi'

// 위젯 동적 import (Lazy Loading)
const StudyStatus = dynamic(() => import('./widgets/StudyStatus'), {
  loading: () => <StudyStatusSkeleton />,
  ssr: false // Client-side만 렌더링
})

const UrgentTasks = dynamic(() => import('./widgets/UrgentTasks'), {
  loading: () => <UrgentTasksSkeleton />
})

const OnlineMembers = dynamic(() => import('./widgets/OnlineMembers'), {
  loading: () => <OnlineMembersSkeleton />
})

const PinnedNotice = dynamic(() => import('./widgets/PinnedNotice'), {
  loading: () => <PinnedNoticeSkeleton />
})

const QuickActions = dynamic(() => import('./widgets/QuickActions'), {
  loading: () => <QuickActionsSkeleton />
})

export default function DashboardClient({ user }) {
  const { data, isLoading } = useDashboard()

  return (
    <div className={styles.container}>
      {/* 위젯들은 필요할 때만 로드 */}
      <StudyStatus stats={data?.stats} />
      <UrgentTasks tasks={data?.urgentTasks} />
      <OnlineMembers members={data?.onlineMembers} />
      <PinnedNotice notice={data?.pinnedNotice} />
      <QuickActions isAdmin={user?.role === 'ADMIN'} />
    </div>
  )
}
```

**효과**:
- ✅ 초기 번들 크기 감소
- ✅ 페이지 로딩 속도 향상
- ✅ Time to Interactive (TTI) 개선

#### 3.2 Chart 라이브러리 동적 로딩

**파일**: `coup/src/components/dashboard/widgets/ActivityChart.jsx` (신규)

```javascript
'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Chart.js는 용량이 크므로 동적 로딩
const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  loading: () => <div>차트 로딩 중...</div>,
  ssr: false
})

export default function ActivityChart({ data }) {
  return (
    <Suspense fallback={<div>차트 로딩 중...</div>}>
      <Chart data={data} options={chartOptions} />
    </Suspense>
  )
}
```

### 4. 성능 측정 및 문서화 (추가 작업)

#### 4.1 성능 측정 도구 추가

**파일**: `coup/src/lib/performance/measurePerformance.js` (신규)

```javascript
/**
 * 컴포넌트 렌더링 시간 측정
 */
export function measureRenderTime(componentName, fn) {
  if (process.env.NODE_ENV !== 'development') {
    return fn()
  }

  const startTime = performance.now()
  const result = fn()
  const endTime = performance.now()

  console.log(`[Performance] ${componentName}: ${(endTime - startTime).toFixed(2)}ms`)

  return result
}

/**
 * React Profiler 콜백
 */
export function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log({
    id,
    phase,
    actualDuration: `${actualDuration.toFixed(2)}ms`,
    baseDuration: `${baseDuration.toFixed(2)}ms`
  })
}
```

**사용 예시**:
```javascript
import { Profiler } from 'react'
import { onRenderCallback } from '@/lib/performance/measurePerformance'

<Profiler id="DashboardClient" onRender={onRenderCallback}>
  <DashboardClient user={user} />
</Profiler>
```

---

## ✅ 완료 조건 (Phase 4.2)

- [ ] 5개 위젯에 React.memo 적용
- [ ] DashboardClient에 useMemo/useCallback 적용
- [ ] 위젯 동적 import 구현
- [ ] Chart 라이브러리 동적 로딩
- [ ] 성능 측정 도구 추가
- [ ] Before/After 성능 비교
- [ ] PHASE-4-2-COMPLETE.md 작성

---

## 📝 완료 후 작업

Phase 4.2 완료 시:
1. ✅ Phase 4.2 완료 보고서 작성
2. ✅ 성능 개선 수치 문서화 (번들 크기, 렌더링 시간)
3. ✅ PROGRESS-TRACKER.md 업데이트
4. ✅ 다음 단계 (Phase 5 - 통합 테스트) 프롬프트 생성
5. ✅ 이 파일의 "실행 명령" 섹션 업데이트

---

## 📊 예상 성능 개선

### 번들 크기
- Before: ~500KB
- After: ~350KB (-30%)

### 초기 렌더링
- Before: ~300ms
- After: ~150ms (-50%)

### 리렌더링
- Before: 모든 위젯 리렌더링
- After: 변경된 위젯만 리렌더링

### Time to Interactive
- Before: ~2초
- After: ~1초 (-50%)

---

**예상 소요 시간**: 2시간

**핵심 목표**:
- ✅ React.memo로 불필요한 리렌더링 방지
- ✅ useMemo/useCallback으로 계산 최적화
- ✅ 동적 import로 초기 로딩 속도 개선
- ✅ 성능 측정 도구로 지속적 모니터링

화이팅! 🚀
```

---

## 📊 진행 상황 추적

### 현재까지 완료된 작업

✅ **Step 1**: 구현 문서 구조 생성  
✅ **Step 2**: Study 영역 구현 (80% 완료, 126개 예외 처리)  
✅ **Step 3-1**: Dashboard 분석 완료  
✅ **Step 3-2**: Dashboard 구현 완료 🎉
  - Phase 1: 유틸리티 생성 ✅ (106개)
  - Phase 2.1: API 강화 ✅
  - Phase 3.1: 위젯 ErrorBoundary ✅
  - Phase 3.2: 로딩 상태 개선 ✅
  - Phase 4.1: 실시간 데이터 업데이트 ✅
  - Phase 4.2: 성능 최적화 ✅
  - Phase 5: 통합 테스트 및 검증 ✅
  - **총 성과**: 30개 파일, 4,736줄, 100% 완료
⏳ **Step 4**: my-studies 영역 준비 ← 현재

### 전체 진행률

```
전체 프로젝트: 68.9% 완료 (31h/45h)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
████████████████████████████████████████████████████████░░░░░░░░░░░░░░░░ 68.9%

Dashboard 영역: 100% 완료 (31h/45h) ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
████████████████████████████████████████████████████████████████████████ 100% ✅

my-studies 영역: 0% 준비 중 (0h/30h) ⏳
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%
```

---

## 📚 관련 문서

- `docs/exception/implement/PROGRESS-TRACKER.md` - 전체 진행 상황
- `docs/exception/implement/dashboard/DASHBOARD-FINAL-REPORT.md` - Dashboard 완료 보고서
- `docs/exception/implement/dashboard/PHASE-5-COMPLETE.md` - Phase 5 완료 보고서
- `docs/exception/my-studies/` - my-studies 예외 문서 (11개)
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

**CSS 파일**: `coup/src/components/dashboard/ErrorBoundary.module.css`
```css
.errorContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.errorContent {
  max-width: 500px;
  text-align: center;
}

.errorIcon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.errorTitle {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.errorMessage {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.errorDetails {
  text-align: left;
  margin: 1rem 0;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.errorStack {
  margin-top: 0.5rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.errorActions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.retryButton,
.homeButton {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retryButton {
  background: var(--primary);
  color: white;
  border: none;
}

.retryButton:hover {
  background: var(--primary-dark);
}

.homeButton {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.homeButton:hover {
  background: var(--bg-secondary);
}
```

**사용 예시**:
```jsx
// coup/src/app/dashboard/page.jsx
import ErrorBoundary from '@/components/dashboard/ErrorBoundary'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default function DashboardPage() {
  return (
    <ErrorBoundary
      fallbackTitle="대시보드 로딩 실패"
      fallbackMessage="대시보드를 불러오는 중 문제가 발생했습니다."
      showHomeButton={true}
      resetOnRetry={false}
    >
      <DashboardClient />
    </ErrorBoundary>
  )
}
```

#### 1.5 api-retry.js 생성 (3시간)

**파일**: `coup/src/lib/utils/api-retry.js`

**내용**:
- fetchWithRetry() - 재시도 가능한 fetch
- 지수 백오프 (Exponential Backoff)
- 최대 재시도 횟수 제한
- 재시도 가능한 에러 판별
- 타임아웃 처리

**참조**: `study-errors.js` 에러 처리 패턴

**구현 가이드**:
```javascript
import { logDashboardError, logDashboardWarning } from '@/lib/exceptions/dashboard-errors'

/**
 * 재시도 가능한 fetch 함수
 * 
 * @param {string} url - 요청 URL
 * @param {Object} options - fetch 옵션
 * @param {Object} retryConfig - 재시도 설정
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(
  url, 
  options = {}, 
  retryConfig = {}
) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    timeout = 30000,
    onRetry = null
  } = retryConfig

  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 타임아웃 설정
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // 성공
      if (response.ok) {
        if (attempt > 0) {
          logDashboardWarning('API 재시도 성공', {
            url,
            attempt,
            totalAttempts: attempt + 1
          })
        }
        return response
      }

      // 4xx 에러는 재시도하지 않음 (클라이언트 오류)
      if (response.status >= 400 && response.status < 500) {
        const error = new Error(`Client error: ${response.status}`)
        error.response = response
        error.retryable = false
        throw error
      }

      // 5xx 에러는 재시도 가능 (서버 오류)
      lastError = new Error(`Server error: ${response.status}`)
      lastError.response = response
      lastError.retryable = true

    } catch (error) {
      lastError = error

      // AbortError (타임아웃)
      if (error.name === 'AbortError') {
        lastError.retryable = true
        lastError.message = 'Request timeout'
      }

      // NetworkError
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        lastError.retryable = true
        lastError.message = 'Network error'
      }

      // 재시도 불가능한 에러
      if (lastError.retryable === false) {
        logDashboardError('API 요청 실패 (재시도 불가)', lastError, {
          url,
          attempt
        })
        throw lastError
      }
    }

    // 마지막 시도가 아니면 재시도
    if (attempt < maxRetries) {
      // 지수 백오프 계산
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt),
        maxDelay
      )

      logDashboardWarning('API 재시도 중', {
        url,
        attempt: attempt + 1,
        maxRetries,
        nextRetryIn: `${delay}ms`,
        error: lastError.message
      })

      // 재시도 콜백
      if (onRetry) {
        onRetry(attempt + 1, delay, lastError)
      }

      // 대기
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // 모든 재시도 실패
  logDashboardError('API 요청 실패 (모든 재시도 소진)', lastError, {
    url,
    totalAttempts: maxRetries + 1
  })

  throw lastError
}

/**
 * 에러가 재시도 가능한지 판별
 * 
 * @param {Error} error - 에러 객체
 * @returns {boolean}
 */
export function isRetryableError(error) {
  // 명시적으로 재시도 불가능
  if (error.retryable === false) {
    return false
  }

  // 타임아웃
  if (error.name === 'AbortError') {
    return true
  }

  // 네트워크 에러
  if (error.name === 'TypeError' || error.name === 'NetworkError') {
    return true
  }

  // 5xx 서버 에러
  if (error.response?.status >= 500 && error.response?.status < 600) {
    return true
  }

  // 429 Too Many Requests
  if (error.response?.status === 429) {
    return true
  }

  // 503 Service Unavailable
  if (error.response?.status === 503) {
    return true
  }

  return false
}

/**
 * React Query용 재시도 설정
 */
export const reactQueryRetryConfig = {
  retry: (failureCount, error) => {
    // 최대 3번까지만 재시도
    if (failureCount >= 3) return false
    
    // 재시도 가능한 에러만 재시도
    return isRetryableError(error)
  },
  retryDelay: (attemptIndex) => {
    // 지수 백오프: 1초, 2초, 4초
    return Math.min(1000 * Math.pow(2, attemptIndex), 10000)
  }
}

/**
 * API 요청 헬퍼 (재시도 포함)
 * 
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - 옵션
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    ...retryConfig
  } = options

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...(body && { body: JSON.stringify(body) })
  }

  const response = await fetchWithRetry(url, fetchOptions, retryConfig)

  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`)
    error.response = response
    throw error
  }

  return response.json()
}
```

**사용 예시**:

1. **직접 사용**:
```javascript
import { fetchWithRetry } from '@/lib/utils/api-retry'

// 기본 사용
const response = await fetchWithRetry('/api/dashboard')
const data = await response.json()

// 커스텀 설정
const response = await fetchWithRetry('/api/dashboard', {}, {
  maxRetries: 5,
  baseDelay: 2000,
  timeout: 60000,
  onRetry: (attempt, delay, error) => {
    console.log(`재시도 ${attempt}번째... ${delay}ms 후`)
  }
})
```

2. **React Query와 함께**:
```javascript
import { useQuery } from '@tanstack/react-query'
import { reactQueryRetryConfig, apiRequest } from '@/lib/utils/api-retry'

function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiRequest('/dashboard'),
    ...reactQueryRetryConfig
  })
}
```

3. **수동 재시도 판별**:
```javascript
import { isRetryableError } from '@/lib/utils/api-retry'

try {
  const response = await fetch('/api/data')
} catch (error) {
  if (isRetryableError(error)) {
    // 재시도 로직
  } else {
    // 사용자에게 에러 표시
  }
}
```

---

## ✅ Phase 1 완료 조건

### 파일 생성
- [x] dashboard-errors.js (완료)
- [x] dashboard-validation.js (완료)
- [x] dashboard-helpers.js (완료)
- [ ] ErrorBoundary.jsx
- [ ] api-retry.js

### 검증
- [ ] 모든 함수에 JSDoc 주석 추가
- [ ] 에러 없이 컴파일
- [ ] ESLint 경고 0개
- [ ] 사용 예시 작성

### 문서화
- [ ] STEP-3-2-PROGRESS.md 업데이트
- [ ] README.md 진행 상황 반영
- [ ] 다음 프롬프트 준비

---

## 🎯 완료 후 작업

1. ✅ **검증**: 모든 파일 컴파일 확인
2. ✅ **문서화**: STEP-3-2-PROGRESS.md 업데이트
3. ✅ **프롬프트 업데이트**: 이 문서의 "실행 명령" 섹션을 Phase 2 프롬프트로 교체

**Phase 1 완료 후 Phase 2 시작**:
- Phase 2: API 라우트 및 컴포넌트 Critical 예외 처리 구현

```

## ➡️ 완료 후

Step 3-2 완료 시 AI가 자동으로 수행:
1. ✅ STEP-3-2-COMPLETE-REPORT.md 작성
2. ✅ Step 3-3 프롬프트 생성
3. ✅ 이 문서의 "실행 명령" 섹션을 Step 3-3로 자동 업데이트

**사용자는 추가 작업 불필요!** 다음 세션에서 이 파일을 열어 업데이트된 프롬프트를 복사하세요
- ✅ 대시보드 메인 페이지
- ✅ 스터디 목록/카드
- ✅ 최근 활동
- ✅ 통계 위젯
- ✅ 추천 스터디
- ✅ 알림 요약

---

## 📁 분석 대상 파일

### 페이지 컴포넌트 (X개)
- coup/src/app/dashboard/page.js

### API 라우트 (X개)
- coup/src/app/api/dashboard/...

### 컴포넌트 (X개)
- coup/src/components/dashboard/...

---

## 🔍 예외 처리 현황

### 구현됨 ✅ (XX개)

| 번호 | 예외 상황 | 파일 | 구현 위치 | 품질 |
|------|---------|------|----------|------|
| 1 | 세션 확인 | page.js | L10 | ⭐⭐⭐ 양호 |
| 2 | 스터디 목록 로딩 | page.js | L25 | ⭐⭐ 보통 |

### 미구현 ❌ (XX개)

#### Critical - 즉시 구현 필요 (X개)

| 번호 | 예외 상황 | 영향도 | 우선순위 | 예상 시간 |
|------|---------|--------|---------|----------|
| 1 | API 에러 처리 | HIGH | P0 | 2h |
| 2 | 빈 데이터 처리 | MEDIUM | P1 | 1h |

---

## 📋 필요한 작업

### Critical (X개)
1. [DASH-001] API 에러 처리
   - 파일: coup/src/app/dashboard/page.js
   - 작업: try-catch 추가, 에러 메시지 표시
   - 예상 소요: 2시간

### Important (X개)
...

### Medium (X개)
...

### Low (X개)
...

---

## 🛠️ 필요한 유틸리티

### 생성 필요
- [ ] `lib/exceptions/dashboard-errors.js` - 대시보드 예외 헬퍼
- [ ] `lib/validators/dashboard-validation.js` - 입력 검증

### 수정 필요
- [ ] 기존 파일 개선 사항

---

## 📊 구현 우선순위

1. Critical (X개) - 1주차
2. Important (X개) - 2주차
3. Medium (X개) - 3주차
4. Low (X개) - 4주차

---

## 📝 특이사항

### 기술 스택
- Server Component 사용
- API 라우트 패턴
- 컴포넌트 구조

### 현재 구현 현황
- 잘 구현된 부분
- 개선 필요한 부분
- 미구현 부분
```

---

## ✅ 완료 조건

Step 3-1이 완료되려면 다음 항목이 모두 체크되어야 합니다:

- [ ] dashboard 영역 모든 파일 조사 완료
- [ ] 현재 예외 처리 현황 파악 (구현/부분/미구현 분류)
- [ ] 문서와 코드 Gap 분석
- [ ] 우선순위별 분류 (Critical/Important/Medium/Low)
- [ ] ANALYSIS.md 작성 완료
- [ ] 필요한 유틸리티 목록 작성
- [ ] 구현 우선순위 수립

---

## ➡️ 완료 후 작업

Step 3-1 완료 시 AI가 자동으로:

1. ✅ 완료 확인 및 분석 결과 검토
2. ✅ 다음 Step (3-2: dashboard Critical 구현) 프롬프트 생성
3. ✅ 이 파일의 "실행 명령" 섹션 업데이트

**사용자는 추가 작업 불필요!**  
새 세션에서 이 파일을 열어 업데이트된 프롬프트를 복사하여 사용하세요.

---

**예상 소요 시간**: 약 4시간

**우선순위**:
1. 파일 조사 (필수)
2. 현황 파악 (필수)
3. Gap 분석 (필수)
4. ANALYSIS.md 작성 (필수)

화이팅! 🚀
```export function getCachedNotices(studyId) {
  const cached = noticeCache.get(studyId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

export function setCachedNotices(studyId, data) {
  noticeCache.set(studyId, {
    data,
    timestamp: Date.now()
  })
}

export function invalidateNoticesCache(studyId) {
  noticeCache.delete(studyId)
}
```

#### 1.2 타겟 파일
```
coup/src/app/api/studies/[id]/notices/route.js
```

#### 1.3 적용
- GET: 캐시 확인 → 캐시 히트 시 반환 → 캐시 미스 시 DB 조회 후 캐싱
- POST/PATCH/DELETE: 캐시 무효화

### 2. 파일 다운로드 보안 강화 (3시간)

#### 2.1 타겟 파일
```
coup/src/app/api/studies/[id]/files/[fileId]/download/route.js
```

#### 2.2 구현할 예외 처리 (3개)

1. 다운로드 권한 확인 (멤버만)
2. 파일 존재 확인 (상세 에러)
3. 다운로드 로그 기록

### 3. 스터디 활동 로그 (선택, 3시간)

#### 3.1 활동 로그 테이블 생성
```prisma
model StudyActivityLog {
  id        String   @id @default(cuid())
  studyId   String
  userId    String
  action    String   // JOIN, LEAVE, KICK, ROLE_CHANGE, etc.
  details   Json?
  createdAt DateTime @default(now())

  study Study @relation(fields: [studyId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 3.2 로그 기록 함수
```javascript
// coup/src/lib/activity-log-helpers.js
export async function logStudyActivity(prisma, studyId, userId, action, details = null) {
  try {
    await prisma.studyActivityLog.create({
      data: {
        studyId,
        userId,
        action,
        details
      }
    })
  } catch (error) {
    console.error('Activity log error:', error)
    // 로그 실패해도 주요 작업은 계속
  }
}
```

### 4. 완료 보고서 작성 (30분)

- `docs/exception/implement/study/STEP-2-8-COMPLETE-REPORT.md` 생성
- 성능 최적화 및 관측성 개선 사항 기록
- 구현률: 75% → 80%

### 5. 진행 상황 업데이트 (10분)

- `docs/exception/implement/PROGRESS-TRACKER.md` 업데이트
- Step 2-8 완료 표시
- 전체 진행률 업데이트 (75% → 80%)

---

## ✅ 완료 조건

Step 2-8이 완료되려면 다음 항목이 모두 체크되어야 합니다:

- [ ] 공지 목록 캐싱 구현 (선택)
- [ ] 파일 다운로드 보안 강화 3개 예외 처리
- [ ] 스터디 활동 로그 시스템 구현 (선택)
- [ ] 컴파일 에러 없음
- [ ] API 라우트 동작 검증
- [ ] STEP-2-8-COMPLETE-REPORT.md 작성
- [ ] PROGRESS-TRACKER.md 업데이트

---

## ➡️ 완료 후 작업

Step 2-8 완료 시 AI가 자동으로:

1. ✅ 완료 확인 및 체크리스트 검증
2. ✅ 완료 보고서 검토
3. ✅ 다음 Step (3-1: dashboard 분석) 프롬프트 생성
4. ✅ 이 파일의 "실행 명령" 섹션 업데이트

**사용자는 추가 작업 불필요!**  
새 세션에서 이 파일을 열어 업데이트된 프롬프트를 복사하여 사용하세요.
```

#### 1.1 타겟 파일
```
coup/src/app/api/studies/[id]/tasks/route.js         (GET, POST)
coup/src/app/api/studies/[id]/tasks/[taskId]/route.js (GET, PATCH, DELETE)
```

#### 1.2 구현할 예외 처리 (8개)

**입력값 검증**:
1. 제목 길이 검증 (1-200자)
2. 설명 길이 검증 (0-2000자)
3. 상태 전환 규칙 검증 (TODO → IN_PROGRESS → DONE)
4. 우선순위 검증 (LOW, MEDIUM, HIGH, URGENT)

**관계 검증**:
5. 담당자 멤버 확인 (assigneeId)
6. 마감일 과거 검증 (미래 날짜만 허용)
7. 수정 권한 확인 (작성자, ADMIN만)
8. 삭제 권한 확인 (작성자, ADMIN만)

#### 1.3 코드 예시

**POST /api/studies/[id]/tasks**:
```javascript
import { validateAndSanitize } from "@/lib/utils/input-sanitizer";

export async function POST(request, { params }) {
  const { id: studyId } = await params;
  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  try {
    const body = await request.json();
    
    // 1. 입력값 검증 및 정제
    const validation = validateAndSanitize(body, 'TASK');
    if (!validation.valid) {
      return NextResponse.json({ 
        error: "입력값이 유효하지 않습니다", 
        details: validation.errors 
      }, { status: 400 });
    }

    const sanitizedData = validation.sanitized;

    // 2. 담당자 멤버 확인
    if (sanitizedData.assigneeId) {
      const member = await prisma.studyMember.findFirst({
        where: {
          studyId,
          userId: sanitizedData.assigneeId,
          status: 'ACTIVE',
        },
      });

      if (!member) {
        return NextResponse.json({ 
          error: "담당자가 스터디 멤버가 아닙니다" 
        }, { status: 400 });
      }
    }

    // 3. 마감일 검증
    if (sanitizedData.dueDate) {
      const dueDate = new Date(sanitizedData.dueDate);
      if (dueDate < new Date()) {
        return NextResponse.json({ 
          error: "마감일은 현재보다 미래여야 합니다" 
        }, { status: 400 });
      }
    }

    // 4. 할일 생성
    const task = await prisma.task.create({
      data: {
        studyId,
        authorId: session.user.id,
        title: sanitizedData.title,
        description: sanitizedData.description,
        status: sanitizedData.status || 'TODO',
        priority: sanitizedData.priority || 'MEDIUM',
        dueDate: sanitizedData.dueDate,
        assigneeId: sanitizedData.assigneeId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
      },
    });

    // 5. 담당자에게 알림
    if (sanitizedData.assigneeId && sanitizedData.assigneeId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: sanitizedData.assigneeId,
          type: 'TASK_ASSIGNED',
          studyId,
          message: `새 할일이 배정되었습니다: ${sanitizedData.title}`,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "할일이 생성되었습니다",
      data: task 
    }, { status: 201 });

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ 
      error: "할일 생성 중 오류가 발생했습니다" 
    }, { status: 500 });
  }
}
```

**PATCH /api/studies/[id]/tasks/[taskId]**:
```javascript
// 상태 전환 규칙 검증
const validTransitions = {
  TODO: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['DONE', 'TODO', 'CANCELLED'],
  DONE: ['TODO'], // 재오픈
  CANCELLED: ['TODO'], // 재활성화
};

if (sanitizedData.status) {
  const currentTask = await prisma.task.findUnique({
    where: { id: taskId },
    select: { status: true },
  });

  const allowedTransitions = validTransitions[currentTask.status] || [];
  if (!allowedTransitions.includes(sanitizedData.status)) {
    return NextResponse.json({ 
      error: `상태를 ${currentTask.status}에서 ${sanitizedData.status}(으)로 변경할 수 없습니다` 
    }, { status: 400 });
  }
}
```

---

### 2. 일정(Calendar) API 예외 처리 강화 (3시간)

#### 2.1 타겟 파일
```
coup/src/app/api/studies/[id]/calendar/route.js           (GET, POST)
coup/src/app/api/studies/[id]/calendar/[eventId]/route.js (GET, PATCH, DELETE)
```

#### 2.2 구현할 예외 처리 (7개)

**입력값 검증**:
1. 제목 필수 및 길이 검증 (1-100자)
2. 날짜 형식 검증 (ISO 8601)
3. 시간 순서 검증 (시작 < 종료)
4. 설명 길이 검증 (0-1000자)

**비즈니스 규칙**:
5. 일정 중복 확인 (같은 시간대에 여러 일정)
6. 과거 일정 생성 방지
7. 수정/삭제 권한 확인

#### 2.3 코드 예시

**POST /api/studies/[id]/calendar**:
```javascript
export async function POST(request, { params }) {
  const { id: studyId } = await params;
  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  try {
    const body = await request.json();
    
    // 1. 입력값 검증
    const validation = validateAndSanitize(body, 'CALENDAR_EVENT');
    if (!validation.valid) {
      return NextResponse.json({ 
        error: "입력값이 유효하지 않습니다", 
        details: validation.errors 
      }, { status: 400 });
    }

    const sanitizedData = validation.sanitized;

    // 2. 날짜 순서 검증
    if (sanitizedData.endTime <= sanitizedData.startTime) {
      return NextResponse.json({ 
        error: "종료 시간은 시작 시간보다 이후여야 합니다" 
      }, { status: 400 });
    }

    // 3. 과거 일정 방지
    if (new Date(sanitizedData.startTime) < new Date()) {
      return NextResponse.json({ 
        error: "과거 일정은 생성할 수 없습니다" 
      }, { status: 400 });
    }

    // 4. 일정 중복 확인 (선택적 - 경고만)
    const overlapping = await prisma.calendarEvent.findFirst({
      where: {
        studyId,
        OR: [
          {
            startTime: { lte: sanitizedData.startTime },
            endTime: { gte: sanitizedData.startTime },
          },
          {
            startTime: { lte: sanitizedData.endTime },
            endTime: { gte: sanitizedData.endTime },
          },
        ],
      },
    });

    let warning = null;
    if (overlapping) {
      warning = "같은 시간대에 다른 일정이 있습니다";
    }

    // 5. 일정 생성
    const event = await prisma.calendarEvent.create({
      data: {
        studyId,
        creatorId: session.user.id,
        title: sanitizedData.title,
        description: sanitizedData.description,
        startTime: sanitizedData.startTime,
        endTime: sanitizedData.endTime,
        location: sanitizedData.location,
        isRecurring: sanitizedData.isRecurring || false,
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "일정이 생성되었습니다",
      warning,
      data: event 
    }, { status: 201 });

  } catch (error) {
    console.error('Create calendar event error:', error);
    return NextResponse.json({ 
      error: "일정 생성 중 오류가 발생했습니다" 
    }, { status: 500 });
  }
}
```

---

### 3. 초대 코드 API 예외 처리 강화 (2시간)

#### 3.1 타겟 파일
```
coup/src/app/api/studies/[id]/invite/route.js          (POST)
coup/src/app/api/studies/invite/[code]/route.js        (GET, POST)
```

#### 3.2 구현할 예외 처리 (5개)

1. 초대 코드 생성 권한 확인 (ADMIN만)
2. 초대 코드 유효성 확인
3. 초대 코드 만료 처리 (7일)
4. 중복 초대 코드 방지
5. 초대 링크 보안 강화 (UUID 사용)

#### 3.3 코드 예시

**POST /api/studies/[id]/invite** (초대 코드 생성):
```javascript
import { randomUUID } from 'crypto';

export async function POST(request, { params }) {
  const { id: studyId } = await params;
  
  // ADMIN 권한 확인
  const result = await requireStudyMember(studyId, 'ADMIN');
  if (result instanceof NextResponse) return result;
  const { session } = result;

  try {
    const body = await request.json();
    const { expiresInDays = 7, maxUses = 10 } = body;

    // 1. 만료일 검증
    if (expiresInDays < 1 || expiresInDays > 30) {
      return NextResponse.json({ 
        error: "만료 기간은 1-30일 사이여야 합니다" 
      }, { status: 400 });
    }

    // 2. 최대 사용 횟수 검증
    if (maxUses < 1 || maxUses > 100) {
      return NextResponse.json({ 
        error: "최대 사용 횟수는 1-100 사이여야 합니다" 
      }, { status: 400 });
    }

    // 3. 기존 활성 초대 코드 확인
    const activeInvite = await prisma.studyInvite.findFirst({
      where: {
        studyId,
        expiresAt: { gt: new Date() },
        used: { lt: prisma.studyInvite.fields.maxUses },
      },
    });

    if (activeInvite) {
      return NextResponse.json({ 
        success: true,
        message: "활성 초대 코드가 이미 있습니다",
        data: activeInvite,
      });
    }

    // 4. 초대 코드 생성 (UUID)
    const code = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invite = await prisma.studyInvite.create({
      data: {
        studyId,
        code,
        creatorId: session.user.id,
        expiresAt,
        maxUses,
        used: 0,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "초대 코드가 생성되었습니다",
      data: {
        ...invite,
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/studies/invite/${code}`,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create invite code error:', error);
    return NextResponse.json({ 
      error: "초대 코드 생성 중 오류가 발생했습니다" 
    }, { status: 500 });
  }
}
```

**POST /api/studies/invite/[code]** (초대 코드로 가입):
```javascript
export async function POST(request, { params }) {
  const { code } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ 
      error: "로그인이 필요합니다" 
    }, { status: 401 });
  }

  try {
    // 1. 초대 코드 조회
    const invite = await prisma.studyInvite.findUnique({
      where: { code },
      include: {
        study: {
          select: {
            id: true,
            name: true,
            maxMembers: true,
            _count: { select: { members: { where: { status: 'ACTIVE' } } } },
          },
        },
      },
    });

    // 2. 초대 코드 검증
    if (!invite) {
      return NextResponse.json({ 
        error: "유효하지 않은 초대 코드입니다" 
      }, { status: 404 });
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ 
        error: "만료된 초대 코드입니다" 
      }, { status: 400 });
    }

    if (invite.used >= invite.maxUses) {
      return NextResponse.json({ 
        error: "초대 코드 사용 횟수가 초과되었습니다" 
      }, { status: 400 });
    }

    // 3. 정원 확인
    if (invite.study._count.members >= invite.study.maxMembers) {
      return NextResponse.json({ 
        error: "스터디 정원이 마감되었습니다" 
      }, { status: 400 });
    }

    // 4. 중복 가입 확인
    const existingMember = await prisma.studyMember.findFirst({
      where: {
        studyId: invite.studyId,
        userId: session.user.id,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    if (existingMember) {
      return NextResponse.json({ 
        error: "이미 스터디에 가입되어 있습니다" 
      }, { status: 400 });
    }

    // 5. 트랜잭션으로 멤버 추가 + 초대 코드 사용 횟수 증가
    const [member] = await prisma.$transaction([
      prisma.studyMember.create({
        data: {
          studyId: invite.studyId,
          userId: session.user.id,
          role: 'MEMBER',
          status: 'ACTIVE', // 초대 코드는 자동 승인
        },
      }),
      prisma.studyInvite.update({
        where: { id: invite.id },
        data: { used: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "스터디에 가입되었습니다",
      data: { studyId: invite.studyId },
    }, { status: 200 });

  } catch (error) {
    console.error('Join with invite code error:', error);
    return NextResponse.json({ 
      error: "초대 코드 사용 중 오류가 발생했습니다" 
    }, { status: 500 });
  }
}
```

---

### 4. 완료 보고서 작성 (30분)

#### 4.1 파일 생성
```
docs/exception/implement/study/STEP-2-6-COMPLETE-REPORT.md
```

#### 4.2 내용 구조
```markdown
# CoUp 예외 처리 구현 - Step 2-6 완료 보고서

## 🎯 목표 및 달성
- 할일 API 예외 처리 (8개)
- 일정 API 예외 처리 (7개)
- 초대 기능 예외 처리 (5개)
- 구현률: 60% → 70%

## 📊 통계 요약
- 수정된 API: 6개
- 추가된 예외 처리: 20개
- 코드 증가: +800줄

## 🎯 핵심 개선 사항
1. 할일 상태 전환 규칙
2. 일정 시간 순서 검증
3. 초대 코드 보안 강화

## 📈 Before vs After
... (예외 처리 비교)

## 🚀 다음 단계 (Step 2-7)
...
```

---

### 5. 진행 상황 업데이트 (10분)

#### 5.1 업데이트할 파일
```
docs/exception/implement/PROGRESS-TRACKER.md
```

#### 5.2 업데이트 내용
- Step 2-6 완료 표시
- 전체 진행률 업데이트 (60% → 70%)
- 다음 단계 정보

---

## ✅ 완료 조건

Step 2-6가 완료되려면 다음 항목이 모두 체크되어야 합니다:

- [ ] 할일 API 8개 예외 처리 구현
- [ ] 일정 API 7개 예외 처리 구현
- [ ] 초대 기능 5개 예외 처리 구현
- [ ] 컴파일 에러 없음
- [ ] API 라우트 동작 검증
- [ ] STEP-2-6-COMPLETE-REPORT.md 작성
- [ ] PROGRESS-TRACKER.md 업데이트

---

## ➡️ 완료 후 작업

Step 2-6 완료 시 AI가 자동으로:

1. ✅ 완료 확인 및 체크리스트 검증
2. ✅ 완료 보고서 검토
3. ✅ 다음 Step (2-7) 프롬프트 생성
4. ✅ 이 파일의 "실행 명령" 섹션 업데이트

**사용자는 추가 작업 불필요!**  
새 세션에서 이 파일을 열어 업데이트된 프롬프트를 복사하여 사용하세요.
```
- Step 2-3 (study 영역 분석) ✅
  - 28개 API 라우트 분석 완료
  - 구현률: 29%
- Step 2-4 (study 영역 Critical 구현) ✅ ⭐ 완료!
  - Part 1: 6개 유틸리티 파일 생성 (4,516줄)
  - Part 2: 7개 API 라우트 예외 처리 적용
  - 25개 Critical 예외 처리 구현
  - 트랜잭션 5개 적용
  - 구현률: 29% → 50%

**현재 작업**: Step 2-5 - 파일 보안 및 XSS 방어

**참조 문서**:
- `docs/exception/implement/study/STEP-2-4-COMPLETE-REPORT.md` - Step 2-4 완료 보고서
- `docs/exception/implement/study/ANALYSIS.md` - study 분석 보고서

---

## 작업 내용

### 1. sanitize-html 패키지 설치 (5분)

```bash
cd coup
npm install sanitize-html
```

### 2. 파일 업로드 보안 강화

**파일**: `coup/src/lib/file-upload-helpers.js`

이미 생성된 파일에서 다음 함수들을 개선:

**validateFileSafety 함수 강화**:
```javascript
export function validateFileSafety(file) {
  const fileName = file.name
  
  // 1. 위험한 확장자 차단 확장
  const DANGEROUS_EXTENSIONS = [
    'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 
    'jar', 'dll', 'msi', 'app', 'deb', 'rpm', 'sh', 'ps1',
    'php', 'asp', 'aspx', 'jsp', 'cgi', 'pl'  // 추가
  ]
  
  const ext = getFileExtension(fileName).toLowerCase()
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return { 
      success: false, 
      error: `${ext} 파일은 보안상의 이유로 업로드할 수 없습니다` 
    }
  }
  
  // 2. 이중 확장자 검사 (file.jpg.exe 차단)
  const parts = fileName.split('.')
  if (parts.length > 2) {
    const secondExt = parts[parts.length - 2].toLowerCase()
    if (DANGEROUS_EXTENSIONS.includes(secondExt)) {
      return { 
        success: false, 
        error: '의심스러운 파일 이름입니다' 
      }
    }
  }
  
  // 3. NULL 바이트 검사
  if (fileName.includes('\0')) {
    return { 
      success: false, 
      error: '유효하지 않은 파일 이름입니다' 
    }
  }
  
  // 4. 경로 순회 공격 방지
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return { 
      success: false, 
      error: '유효하지 않은 파일 이름입니다' 
    }
  }
  
  return { success: true }
}
```

### 3. 공지 XSS 방어 추가

**파일**: `coup/src/lib/validators/study-validation.js`

validateNotice 함수에 XSS 검증 추가:

```javascript
export function validateNotice(data) {
  const errors = []
  
  // 제목 검증 (2-100자)
  if (!data.title || typeof data.title !== 'string') {
    errors.push({ field: 'title', message: '제목은 필수입니다' })
  } else if (data.title.length < 2 || data.title.length > 100) {
    errors.push({ field: 'title', message: '제목은 2-100자여야 합니다' })
  }
  
  // 내용 검증 (10-10000자)
  if (!data.content || typeof data.content !== 'string') {
    errors.push({ field: 'content', message: '내용은 필수입니다' })
  } else if (data.content.length < 10) {
    errors.push({ field: 'content', message: '내용은 최소 10자 이상이어야 합니다' })
  } else if (data.content.length > 10000) {
    errors.push({ field: 'content', message: '내용은 최대 10,000자까지 가능합니다' })
  }
  
  // XSS 위험 태그 검사 추가
  const dangerousTags = /<script|<iframe|<object|<embed|javascript:/i
  if (dangerousTags.test(data.content)) {
    errors.push({ 
      field: 'content', 
      message: '허용되지 않는 HTML 태그가 포함되어 있습니다' 
    })
  }
  
  if (errors.length > 0) {
    return { success: false, errors }
  }
  
  return { success: true, data }
}
```

### 4. 공지 API에 sanitize 적용

**파일**: `coup/src/app/api/studies/[id]/notices/route.js`

POST 핸들러에 sanitize-html 적용:

```javascript
import sanitizeHtml from 'sanitize-html'
import { validateNotice } from '@/lib/validators/study-validation'
// ...existing imports...

export async function POST(request, { params }) {
  try {
    // ...existing code...
    
    // 공지 내용 검증
    const validation = validateNotice(data)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }
    
    // XSS 방어 - content sanitize
    const sanitizedContent = sanitizeHtml(validation.data.content, {
      allowedTags: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h3', 'h4', 'blockquote'],
      allowedAttributes: {
        'a': ['href', 'target']
      },
      allowedSchemes: ['http', 'https']
    })
    
    // 공지 생성
    const notice = await prisma.studyNotice.create({
      data: {
        studyId,
        authorId: session.user.id,
        title: validation.data.title,
        content: sanitizedContent,  // sanitized content 사용
        isPinned: validation.data.isPinned || false
      }
    })
    
    return NextResponse.json({
      success: true,
      notice
    }, { status: 201 })
    
  } catch (error) {
    // ...existing error handling...
  }
}
```

### 5. 검색어 sanitization 추가

**파일**: `coup/src/app/api/studies/route.js`

GET 핸들러에 검색어 특수문자 제거:

```javascript
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // ...existing code for pagination...
    
    // 검색어 sanitization
    const search = searchParams.get('search')
    let sanitizedSearch = null
    
    if (search) {
      // 특수문자 제거 (SQL Injection 방어)
      sanitizedSearch = search.replace(/[^\w\sㄱ-ㅎ가-힣]/g, '').trim()
      
      // 길이 검증
      if (sanitizedSearch.length < 2) {
        return NextResponse.json(
          { 
            success: false, 
            error: '검색어는 최소 2자 이상이어야 합니다' 
          },
          { status: 400 }
        )
      }
      
      if (sanitizedSearch.length > 100) {
        return NextResponse.json(
          { 
            success: false, 
            error: '검색어는 최대 100자까지 가능합니다' 
          },
          { status: 400 }
        )
      }
    }
    
    // where 조건 생성
    const whereClause = {}
    whereClause.isPublic = true
    
    // ...existing code for category...
    
    // sanitized 검색어 사용
    if (sanitizedSearch) {
      whereClause.OR = [
        { name: { contains: sanitizedSearch, mode: 'insensitive' } },
        { description: { contains: sanitizedSearch, mode: 'insensitive' } }
      ]
    }
    
    // ...rest of the code...
  } catch (error) {
    // ...existing error handling...
  }
}
```

---

## 완료 조건

- [ ] sanitize-html 패키지 설치 완료
- [ ] file-upload-helpers.js 보안 강화
  - [ ] 위험한 확장자 목록 확장
  - [ ] 이중 확장자 검증
  - [ ] NULL 바이트 검증
  - [ ] 경로 순회 공격 방어
- [ ] validateNotice에 XSS 검증 추가
- [ ] notices API에 sanitize-html 적용
- [ ] 검색어 sanitization 추가
- [ ] 컴파일 에러 없음
- [ ] STEP-2-5-REPORT.md 작성
- [ ] EXCEPTION-IMPLEMENTATION-PROMPT.md 업데이트 (Step 2-6 프롬프트로)

---

## 완료 후 작업

1. `docs/exception/implement/study/STEP-2-5-REPORT.md` 생성
   - 구현 내용 상세 기록
   - 테스트 결과
   - 보안 개선 사항

2. 이 파일의 "실행 명령" 섹션을 Step 2-6 프롬프트로 자동 업데이트

---

**예상 소요 시간**: 약 4시간

**우선순위**:
1. 파일 보안 강화 (Critical)
2. XSS 방어 (High)
3. 검색어 sanitization (Medium)

화이팅! 🚀
```

### 1.1 coup/src/lib/exceptions/study-errors.js (4시간)

**목적**: 통일된 스터디 에러 처리

**구현 내용**:

```javascript
// coup/src/lib/exceptions/study-errors.js

/**
 * 스터디 관련 에러 코드 정의
 */
export const STUDY_ERRORS = {
  // 스터디 CRUD
  STUDY_NOT_FOUND: {
    code: 'STUDY_NOT_FOUND',
    message: '스터디를 찾을 수 없습니다',
    statusCode: 404
  },
  INVALID_STUDY_NAME: {
    code: 'INVALID_STUDY_NAME',
    message: '스터디 이름은 2자 이상 50자 이하여야 합니다',
    statusCode: 400
  },
  INVALID_DESCRIPTION: {
    code: 'INVALID_DESCRIPTION',
    message: '스터디 설명은 10자 이상 500자 이하여야 합니다',
    statusCode: 400
  },
  INVALID_MAX_MEMBERS: {
    code: 'INVALID_MAX_MEMBERS',
    message: '최대 인원은 2명에서 100명 사이여야 합니다',
    statusCode: 400
  },
  INVALID_CATEGORY: {
    code: 'INVALID_CATEGORY',
    message: '유효하지 않은 카테고리입니다',
    statusCode: 400
  },
  DUPLICATE_STUDY_NAME: {
    code: 'DUPLICATE_STUDY_NAME',
    message: '이미 존재하는 스터디 이름입니다',
    statusCode: 409
  },
  
  // 권한
  NOT_STUDY_MEMBER: {
    code: 'NOT_STUDY_MEMBER',
    message: '스터디 멤버가 아닙니다',
    statusCode: 403
  },
  INSUFFICIENT_PERMISSION: {
    code: 'INSUFFICIENT_PERMISSION',
    message: '권한이 부족합니다',
    statusCode: 403
  },
  NOT_STUDY_OWNER: {
    code: 'NOT_STUDY_OWNER',
    message: '스터디 소유자만 수행할 수 있습니다',
    statusCode: 403
  },
  
  // 가입/탈퇴
  STUDY_NOT_RECRUITING: {
    code: 'STUDY_NOT_RECRUITING',
    message: '현재 모집 중이 아닙니다',
    statusCode: 400
  },
  STUDY_FULL: {
    code: 'STUDY_FULL',
    message: '정원이 마감되었습니다',
    statusCode: 400
  },
  ALREADY_MEMBER: {
    code: 'ALREADY_MEMBER',
    message: '이미 가입된 스터디입니다',
    statusCode: 400
  },
  PENDING_APPROVAL: {
    code: 'PENDING_APPROVAL',
    message: '가입 승인 대기 중입니다',
    statusCode: 400
  },
  KICKED_MEMBER: {
    code: 'KICKED_MEMBER',
    message: '강퇴된 스터디입니다. 스터디장에게 문의하세요',
    statusCode: 403
  },
  OWNER_CANNOT_LEAVE: {
    code: 'OWNER_CANNOT_LEAVE',
    message: '스터디장은 탈퇴할 수 없습니다. 스터디를 삭제하거나 소유권을 이전하세요',
    statusCode: 400
  },
  
  // 멤버 관리
  MEMBER_NOT_FOUND: {
    code: 'MEMBER_NOT_FOUND',
    message: '멤버를 찾을 수 없습니다',
    statusCode: 404
  },
  CANNOT_KICK_SELF: {
    code: 'CANNOT_KICK_SELF',
    message: '자기 자신을 강퇴할 수 없습니다',
    statusCode: 400
  },
  CANNOT_KICK_OWNER: {
    code: 'CANNOT_KICK_OWNER',
    message: '스터디장을 강퇴할 수 없습니다',
    statusCode: 400
  },
  INVALID_ROLE: {
    code: 'INVALID_ROLE',
    message: '유효하지 않은 역할입니다',
    statusCode: 400
  },
  CANNOT_CHANGE_OWNER_ROLE: {
    code: 'CANNOT_CHANGE_OWNER_ROLE',
    message: '스터디장의 역할은 변경할 수 없습니다',
    statusCode: 400
  },
  
  // 파일
  FILE_NOT_PROVIDED: {
    code: 'FILE_NOT_PROVIDED',
    message: '파일을 선택해주세요',
    statusCode: 400
  },
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    message: '파일 크기는 50MB를 초과할 수 없습니다',
    statusCode: 400
  },
  INVALID_FILE_TYPE: {
    code: 'INVALID_FILE_TYPE',
    message: '허용되지 않은 파일 형식입니다',
    statusCode: 400
  },
  
  // 일반
  DB_ERROR: {
    code: 'DB_ERROR',
    message: '데이터베이스 오류가 발생했습니다',
    statusCode: 500
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: '알 수 없는 오류가 발생했습니다',
    statusCode: 500
  }
};

/**
 * 스터디 에러 응답 생성
 */
export function createStudyErrorResponse(errorKey, customMessage = null) {
  const error = STUDY_ERRORS[errorKey] || STUDY_ERRORS.UNKNOWN_ERROR;
  
  return {
    code: error.code,
    message: customMessage || error.message,
    statusCode: error.statusCode
  };
}

/**
 * 스터디 에러 로깅
 */
export function logStudyError(context, error, metadata = {}) {
  console.error(`[STUDY ERROR] ${context}:`, {
    error: error.message,
    stack: error.stack,
    ...metadata,
    timestamp: new Date().toISOString()
  });
}
```

### 1.2 coup/src/lib/validators/study-validation.js (4시간)

**목적**: 재사용 가능한 Zod 스키마

**구현 내용**: auth-validation.js와 유사하게 스터디 관련 스키마 정의

### 1.3 coup/src/lib/study-helpers.js (6시간)

**목적**: 스터디 관련 유틸리티 함수

**주요 함수**:
- checkStudyCapacity() - 정원 확인
- canModifyMember() - 멤버 수정 권한
- isValidRole() - 역할 검증
- getRoleHierarchy() - 역할 계층 반환

### 1.4 coup/src/lib/file-upload-helpers.js (5시간)

**목적**: 파일 업로드 유틸리티

**주요 함수**:
- validateFileType() - 파일 타입 검증
- validateFileSize() - 파일 크기 검증
- checkStorageSpace() - 저장 공간 확인

### 1.5 coup/src/lib/notification-helpers.js (3시간)

**목적**: 알림 생성 유틸리티

**주요 함수**:
- createBulkNotifications() - 일괄 알림 생성
- getNotificationTemplate() - 알림 템플릿

### 1.6 coup/src/lib/transaction-helpers.js (4시간)

**목적**: 트랜잭션 헬퍼 함수

**주요 함수**:
- createStudyWithOwner() - 스터디 생성 + OWNER 멤버
- approveJoinRequest() - 가입 승인 트랜잭션
- deleteStudyWithCleanup() - 스터디 삭제 + 관련 데이터 정리

## 2. 핵심 파일 개선 (30시간)

ANALYSIS.md의 "필요한 유틸리티 - 수정 필요" 섹션을 참고하여 10개 파일을 수정하세요.

### 2.1 coup/src/lib/auth-helpers.js 수정 (3시간)

**개선 사항**:
1. requireStudyMember 에러 응답 통일 (study-errors.js 사용)
2. 역할 계층 검증 강화
3. ADMIN vs ADMIN 권한 체크 추가

### 2.2 coup/src/app/api/studies/route.js 수정 (4시간)

**개선 사항**:
1. 필드 길이 검증 강화 (study-validation.js 사용)
2. Prisma P2002 에러 처리 (중복 이름)
3. 트랜잭션으로 OWNER 멤버 생성 (transaction-helpers.js 사용)

### 2.3 coup/src/app/api/studies/[id]/route.js 수정 (4시간)

**개선 사항**:
1. 수정 시 필드 검증 강화
2. 삭제 시 트랜잭션으로 관련 데이터 정리

### 2.4 coup/src/app/api/studies/[id]/join/route.js 수정 (3시간)

**개선 사항**:
1. KICKED 상태 확인 추가
2. LEFT 상태 재가입 처리
3. 알림 생성 오류 처리 개선

### 2.5 ~ 2.10 나머지 파일 수정

ANALYSIS.md 참조하여 각 파일 개선

## 3. 문서 작성

### 3.1 CODE-CHANGES.md 작성

`docs/exception/implement/study/CODE-CHANGES.md` 파일 생성

**구조** (auth/CODE-CHANGES.md 템플릿 사용):

```markdown
# study 영역 코드 변경 사항

**단계**: Step 2-4 - Critical 구현  
**작성일**: 2025-11-30  
**작성자**: GitHub Copilot

---

## 📊 변경 개요

- **생성된 파일**: 6개
- **수정된 파일**: 10개
- **구현된 예외**: 25개
- **소요 시간**: 56시간 (예상)

---

## 📁 생성된 파일

### 1. coup/src/lib/exceptions/study-errors.js

**목적**: 통일된 스터디 에러 처리

**주요 내용**:
- STUDY_ERRORS 상수 (30개 에러)
- createStudyErrorResponse()
- logStudyError()

...

---

## 📝 수정된 파일

### 1. coup/src/lib/auth-helpers.js

**변경 사항**:
1. requireStudyMember 개선
2. 에러 응답 통일
3. 역할 계층 검증

...
```

### 3.2 PROGRESS-TRACKER.md 업데이트

Step 2-4 완료 상태 업데이트

## ✅ 완료 조건

- [ ] 6개 유틸리티 파일 생성 완료
- [ ] 10개 기존 파일 개선 완료
- [ ] 모든 파일에 JSDoc 주석 추가
- [ ] 25개 Critical 예외 처리 구현
- [ ] CODE-CHANGES.md 작성
- [ ] PROGRESS-TRACKER.md 업데이트
- [ ] 구현률 29% → 50%+ 달성

## ➡️ 완료 후

작업 완료 시 AI가 자동으로:
1. 작업 완료 메시지 표시
2. Step 2-5 프롬프트 생성 (dashboard 분석)
3. 이 파일의 "실행 명령" 섹션을 Step 2-5 프롬프트로 자동 업데이트

시작해주세요!

---

## 📌 중요 참고사항

### auth 영역 구현 예제 활용

Step 2-2에서 완료된 auth 영역 구현을 참고하세요:
- `coup/src/lib/exceptions/auth-errors.js` - 에러 처리 패턴
- `coup/src/lib/validators/auth-validation.js` - Zod 스키마 패턴
- `docs/exception/implement/auth/CODE-CHANGES.md` - 문서 작성 패턴

### 구현 우선순위

1. **데이터 무결성** (가장 중요)
   - 트랜잭션으로 OWNER 생성
   - 스터디 삭제 시 관련 데이터 정리

2. **보안**
   - 권한 검증 강화
   - 파일 업로드 검증

3. **사용자 경험**
   - 명확한 에러 메시지
   - 적절한 상태 코드

### JavaScript 코딩 스타일

- ES6+ 문법 사용
- async/await 선호
- JSDoc 주석 필수
- 명확한 변수명
- 에러 처리 철저히

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-30  
**최종 업데이트**: 2025-12-01 (Step 5 - my-studies Phase 1)  
**버전**: 5.0.0  
**상태**: Step 5 Phase 1 준비 완료 ✅

---

## 🚀 지금 바로 시작하세요!

위의 "🎯 실행 명령" 섹션의 프롬프트를 복사하여 새 세션에서 사용하시면 됩니다.

**순차적 진행 경로**:
- ✅ Step 1 (문서 구조 생성)
- ✅ Step 2 (study 영역 완료)
- ✅ Step 3-1 (dashboard 분석)
- ✅ Step 3-2 (dashboard 구현 - 100% 완료)
- ✅ Step 4 (my-studies 분석)
- 🚧 **Step 5 Phase 1 (my-studies 유틸리티)** ← 현재
- ⏳ Step 5 Phase 2 (Critical 예외 구현)
- ⏳ Step 5 Phase 3 (High 예외 구현)
- ⏳ Step 5 Phase 4 (Medium/Low 예외 구현)

**전체 진행률**: 70.0% (31.5h/45h)

**Happy Coding! 🎉**


