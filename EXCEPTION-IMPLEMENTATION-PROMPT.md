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

## 🎯 실행 명령

### ⚠️ 중요 안내

**이 프로젝트는 단계별로 순차 진행됩니다!**

1. **이전 완료**: my-studies 영역 100% 완료 ✅
2. **다음 단계**: chat 영역 Phase 1 - 분석 및 계획
3. **진행 추적**: `docs/exception/implement/PROGRESS-TRACKER.md` 확인

### 🎉 profile 영역 Phase 1 완료!

**완료 성과**:
- ✅ Phase 1 완료 (분석 및 계획)
- ✅ 5개 문서 작성 (~3,000줄)
  - README.md (프로필 개요, 90개 에러 시나리오)
  - CURRENT-STATE-ANALYSIS.md (현재 코드 분석)
  - EXCEPTION-DESIGN.md (Exception 클래스 설계)
  - PHASE-PLAN.md (Phase별 상세 계획)
  - REFERENCES.md (참조 문서 정리)
- ✅ 12개 파일 분석 완료
- ✅ 90개 에러 코드 정의
- ⏱️ 6시간 소요 (계획대로 완료)

**분석 결과**:
- 📊 현재 에러 처리 커버리지: ~35%
- 🎯 목표 개선: API 검증 80%, 보안 70%, 사용자 피드백 75%
- 🔧 주요 도전 과제: 이미지 처리, 비밀번호 보안, 계정 삭제 로직

---

### 다음 세션 프롬프트 (profile 영역 Phase 2)

**이 프롬프트로 새 세션을 시작하세요:**

```
안녕하세요! CoUp 예외 처리 구현 - profile 영역을 시작합니다.

**목표**: profile 영역 완전한 예외 처리 시스템 구축

**프로젝트 정보**:
- Next.js 16 App Router 기반
- JavaScript (ES6+) 전용
- Tailwind CSS + shadcn/ui
- Prisma ORM

**이전 완료**:
- ✅ study 영역 완료 (126개 예외 처리)
- ✅ dashboard 영역 완료 (106개 예외 처리)
- ✅ my-studies 영역 완료 (62개 에러 코드)
- ✅ chat 영역 완료 (18종류 Exception, 32시간, 100%)

**현재 작업**: profile 영역 Phase 1 - 분석 및 계획

**진행 순서**: profile → admin → notifications → search → settings (총 5개 남음)

**예상 난이도**: ⭐⭐⭐ (중간-높음)
- 프로필 정보 수정 (유효성 검증)
- 아바타 업로드 (이미지 처리, 크기 제한)
- 비밀번호 변경 (보안, 현재 비밀번호 확인)
- 계정 삭제 (확인 절차, 데이터 정리)
- 프라이버시 설정 (권한 관리)

**참조 문서**:
- `docs/exception/profile/` - profile 영역 예외 문서 (13개 파일)
- `docs/exception/implement/chat/CHAT-EXCEPTION-COMPLETE.md` - 참고용 완료 보고서
- `docs/exception/implement/chat/INTEGRATION-TEST-SCENARIOS.md` - 테스트 패턴 참고
- `docs/exception/implement/PROGRESS-TRACKER.md` - 전체 진행 상황

---

## 📋 작업 내용

### Phase 1: 분석 및 계획 (6시간)

profile 영역의 현재 코드를 분석하고, 예외 처리 구현 계획을 수립합니다.

---

### 1.1 폴더 구조 확인 및 생성 (30분)

**확인할 폴더**:
- `docs/exception/implement/profile/` - 이미 존재하는지 확인

**생성할 폴더** (없는 경우):
```bash
docs/exception/implement/profile/
```

---

### 1.2 README.md 작성 (2시간)

**파일**: `docs/exception/implement/profile/README.md`

**내용 구성**:

1. **profile 영역 개요**
   - 사용자 프로필 관리 시스템 설명
   - 주요 기능 (정보 수정, 아바타, 비밀번호, 계정 삭제)
   - 보안 고려사항

2. **현재 구현 상태**
   - 기존 프로필 기능 목록
   - 현재 에러 처리 수준 추정
   - 주요 문제점 파악

3. **예상 에러 시나리오** (~90개)
   
   **카테고리별 분류**:
   
   **A. PROFILE_INFO (프로필 정보) - 20개**
   - PROFILE-001: 필수 필드 누락
   - PROFILE-002: 이름 형식 오류
   - PROFILE-003: 이름 길이 초과
   - PROFILE-004: 바이오 길이 초과
   - PROFILE-005: 유효하지 않은 URL (소셜 미디어)
   - PROFILE-006: 중복 이메일
   - PROFILE-007: 중복 닉네임
   - PROFILE-008: 금지된 닉네임
   - PROFILE-009: 특수문자 오류
   - PROFILE-010: 생년월일 형식 오류
   - PROFILE-011: 미래 날짜 입력
   - PROFILE-012: 나이 제한 (13세 미만)
   - PROFILE-013: 전화번호 형식 오류
   - PROFILE-014: 주소 형식 오류
   - PROFILE-015: 국가/지역 선택 오류
   - PROFILE-016: 언어 설정 오류
   - PROFILE-017: 타임존 설정 오류
   - PROFILE-018: 프로필 업데이트 실패
   - PROFILE-019: 프로필 조회 실패
   - PROFILE-020: 권한 없음
   
   **B. AVATAR (아바타) - 15개**
   - PROFILE-021: 파일 형식 지원 안함 (jpg, png, webp만)
   - PROFILE-022: 파일 크기 초과 (5MB)
   - PROFILE-023: 이미지 차원 초과 (4000x4000)
   - PROFILE-024: 손상된 이미지 파일
   - PROFILE-025: 업로드 서버 오류
   - PROFILE-026: 업로드 타임아웃
   - PROFILE-027: 네트워크 오류
   - PROFILE-028: 저장 공간 부족
   - PROFILE-029: 이미지 처리 실패 (리사이징)
   - PROFILE-030: 썸네일 생성 실패
   - PROFILE-031: 기존 아바타 삭제 실패
   - PROFILE-032: CDN 업로드 실패
   - PROFILE-033: 파일 경로 오류
   - PROFILE-034: 업로드 권한 없음
   - PROFILE-035: 바이러스 검출
   
   **C. PASSWORD (비밀번호) - 15개**
   - PROFILE-036: 현재 비밀번호 불일치
   - PROFILE-037: 새 비밀번호 형식 오류 (8자 이상, 대소문자, 숫자, 특수문자)
   - PROFILE-038: 비밀번호 너무 약함
   - PROFILE-039: 이전 비밀번호와 동일
   - PROFILE-040: 비밀번호 확인 불일치
   - PROFILE-041: 비밀번호 변경 실패
   - PROFILE-042: 비밀번호 재설정 토큰 만료
   - PROFILE-043: 비밀번호 재설정 토큰 유효하지 않음
   - PROFILE-044: 이메일 전송 실패
   - PROFILE-045: 비밀번호 변경 빈도 제한 (1일 1회)
   - PROFILE-046: 세션 만료
   - PROFILE-047: 2FA 인증 필요
   - PROFILE-048: 2FA 코드 오류
   - PROFILE-049: 보안 질문 답변 오류
   - PROFILE-050: 계정 잠금 (5회 실패)
   
   **D. ACCOUNT_DELETE (계정 삭제) - 10개**
   - PROFILE-051: 확인 코드 불일치
   - PROFILE-052: 재확인 필요
   - PROFILE-053: 소유한 스터디 존재 (양도 필요)
   - PROFILE-054: 결제 미해결 건 존재
   - PROFILE-055: 계정 삭제 실패
   - PROFILE-056: 관련 데이터 정리 실패
   - PROFILE-057: 계정 복구 기간 (30일)
   - PROFILE-058: 이미 삭제된 계정
   - PROFILE-059: 관리자 계정 삭제 불가
   - PROFILE-060: 삭제 대기 중
   
   **E. PRIVACY (프라이버시) - 10개**
   - PROFILE-061: 프로필 공개 범위 설정 오류
   - PROFILE-062: 이메일 공개 설정 오류
   - PROFILE-063: 온라인 상태 표시 설정 오류
   - PROFILE-064: 활동 로그 공개 설정 오류
   - PROFILE-065: 검색 허용 설정 오류
   - PROFILE-066: 차단 목록 추가/삭제 실패
   - PROFILE-067: 차단 목록 최대 개수 초과 (100명)
   - PROFILE-068: 알림 설정 저장 실패
   - PROFILE-069: 이메일 수신 설정 저장 실패
   - PROFILE-070: 마케팅 동의 설정 저장 실패
   
   **F. VERIFICATION (인증) - 10개**
   - PROFILE-071: 이메일 인증 필요
   - PROFILE-072: 이메일 인증 코드 만료
   - PROFILE-073: 이메일 인증 코드 오류
   - PROFILE-074: 인증 메일 전송 실패
   - PROFILE-075: 인증 메일 재전송 빈도 제한 (3분)
   - PROFILE-076: 전화번호 인증 필요
   - PROFILE-077: SMS 전송 실패
   - PROFILE-078: SMS 인증 코드 오류
   - PROFILE-079: 신원 확인 서류 업로드 실패
   - PROFILE-080: 신원 확인 대기 중
   
   **G. SOCIAL (소셜 연동) - 10개**
   - PROFILE-081: 소셜 계정 연동 실패
   - PROFILE-082: 소셜 계정 연동 해제 실패
   - PROFILE-083: 이미 연동된 계정
   - PROFILE-084: OAuth 토큰 만료
   - PROFILE-085: OAuth 권한 거부
   - PROFILE-086: 소셜 프로필 불러오기 실패
   - PROFILE-087: 소셜 친구 불러오기 실패
   - PROFILE-088: 소셜 공유 실패
   - PROFILE-089: 소셜 로그인 실패
   - PROFILE-090: 마지막 로그인 방법 제거 불가

4. **Phase별 구현 계획** (4개 Phase, 총 24-30시간)
   
   **Phase 1: 분석 및 계획** (6시간) - 현재
   - README.md 작성
   - 현재 코드 분석
   - Exception 클래스 설계
   - Phase별 상세 계획
   
   **Phase 2: 예외 클래스 및 유틸리티** (6시간)
   - ProfileException 클래스 (90개 메서드)
   - 유효성 검증 함수 (15개)
   - 에러 로거 (구조화된 로깅)
   - 테스트 케이스 작성
   
   **Phase 3: API 라우트 예외 처리** (8시간)
   - 프로필 정보 API (4개 엔드포인트)
   - 아바타 API (3개 엔드포인트)
   - 비밀번호 API (4개 엔드포인트)
   - 계정 삭제 API (2개 엔드포인트)
   - 프라이버시 API (3개 엔드포인트)
   
   **Phase 4: UI 컴포넌트 예외 처리** (6-10시간)
   - 프로필 편집 폼 (유효성 검증, 에러 표시)
   - 아바타 업로드 (진행 표시, 에러 처리)
   - 비밀번호 변경 폼 (강도 표시, 에러 피드백)
   - 계정 삭제 확인 (다단계 확인)
   - 에러 토스트/배너

5. **예상 리소스**
   - 시간: 24-30시간
   - 파일: ~35개 (신규 + 수정)
   - 코드 줄 수: ~4,500줄
   - 문서: ~10개 (~3,500줄)

6. **주요 도전 과제**
   - 이미지 처리 에러 (크기, 형식, 처리)
   - 비밀번호 보안 (암호화, 정책)
   - 계정 삭제 로직 (데이터 정리)
   - 프라이버시 설정 복잡도
   - 소셜 OAuth 에러 처리

---

### 1.3 현재 코드 분석 (2시간)

**파일**: `docs/exception/implement/profile/CURRENT-STATE-ANALYSIS.md`

**분석 항목**:

1. **현재 파일 구조**
   ```
   coup/src/app/
   ├── profile/
   │   ├── page.js
   │   ├── edit/
   │   ├── settings/
   │   └── ...
   └── api/
       └── profile/
           ├── route.js
           ├── avatar/
           ├── password/
           └── delete/
   
   coup/src/components/
   └── profile/
       ├── ProfileForm.js
       ├── AvatarUpload.js
       ├── PasswordChange.js
       └── ...
   ```

2. **현재 에러 처리 패턴 분석**
   - try-catch 사용 현황
   - 에러 응답 형식
   - 유효성 검증 위치
   - 로깅 수준

3. **개선이 필요한 영역**
   - 에러 메시지 불명확
   - 유효성 검증 부족
   - 보안 취약점
   - 사용자 피드백 부족

4. **의존성 파악**
   - Prisma (DB 접근)
   - NextAuth (인증)
   - Sharp (이미지 처리)
   - bcrypt (비밀번호 암호화)

---

### 1.4 Exception 클래스 설계 (2시간)

**파일**: `docs/exception/implement/profile/EXCEPTION-DESIGN.md`

**설계 내용**:

1. **ProfileException 클래스 구조**
   ```javascript
   class ProfileException extends Error {
     constructor(code, message, statusCode = 400, context = {}) {
       super(message)
       this.name = 'ProfileException'
       this.code = code
       this.statusCode = statusCode
       this.context = context
       this.timestamp = new Date().toISOString()
     }
     
     // Static factory methods (90개)
     static invalidName(context) { ... }
     static nameTooLong(context) { ... }
     static duplicateEmail(context) { ... }
     // ... (계속)
   }
   ```

2. **카테고리별 메서드 목록** (90개)
   - Profile Info: 20개
   - Avatar: 15개
   - Password: 15개
   - Account Delete: 10개
   - Privacy: 10개
   - Verification: 10개
   - Social: 10개

3. **에러 응답 형식**
   ```javascript
   {
     success: false,
     error: {
       code: 'PROFILE-001',
       message: '사용자 친화적 메시지',
       field: '오류가 발생한 필드명' (선택적),
       details: { ... } (선택적)
     }
   }
   ```

4. **유효성 검증 함수** (15개)
   - validateName()
   - validateBio()
   - validateEmail()
   - validatePassword()
   - validateImageFile()
   - validateImageSize()
   - validateURL()
   - etc.

---

### 1.5 Phase별 상세 계획 (1.5시간)

**파일**: `docs/exception/implement/profile/PHASE-PLAN.md`

**각 Phase별 작업 계획**:

**Phase 2: 예외 클래스 및 유틸리티** (6시간)
- 작업 1: ProfileException 클래스 (3시간)
- 작업 2: 유효성 검증 함수 (2시간)
- 작업 3: 에러 로거 (1시간)

**Phase 3: API 라우트 예외 처리** (8시간)
- 작업 1: 프로필 정보 API (2시간)
- 작업 2: 아바타 API (2시간)
- 작업 3: 비밀번호 API (2시간)
- 작업 4: 계정 삭제/프라이버시 API (2시간)

**Phase 4: UI 컴포넌트 예외 처리** (6-10시간)
- 작업 1: 프로필 편집 폼 (2-3시간)
- 작업 2: 아바타 업로드 (2-3시간)
- 작업 3: 비밀번호 변경 (1-2시간)
- 작업 4: 계정 삭제/프라이버시 (1-2시간)

---

### 1.6 참조 문서 정리 (30분)

**파일**: `docs/exception/implement/profile/REFERENCES.md`

**포함 내용**:
- 기존 예외 문서 경로
- 참고할 완료 보고서 (chat 영역)
- 유사 패턴 (my-studies, dashboard)
- 외부 라이브러리 문서 (Sharp, bcrypt)

---

## ✅ 완료 조건

Phase 1 완료를 위한 체크리스트:

### 문서 작성
- [ ] README.md 작성 (~150줄, profile 개요, 에러 시나리오 90개)
- [ ] CURRENT-STATE-ANALYSIS.md 작성 (~100줄, 현재 코드 분석)
- [ ] EXCEPTION-DESIGN.md 작성 (~200줄, Exception 클래스 설계)
- [ ] PHASE-PLAN.md 작성 (~150줄, Phase별 계획)
- [ ] REFERENCES.md 작성 (~50줄, 참조 문서)

### 분석 완료
- [ ] 기존 profile 코드 구조 파악
- [ ] 에러 처리 현황 분석 (추정 ~30%)
- [ ] 개선 필요 영역 식별 (최소 5개)

### 설계 완료
- [ ] ProfileException 클래스 구조 확정
- [ ] 90개 Exception 메서드 목록 정리
- [ ] 유효성 검증 함수 15개 식별

### 계획 수립
- [ ] Phase 2-4 상세 계획 수립
- [ ] 예상 시간 산정 (24-30시간)
- [ ] 우선순위 결정

### 문서 품질
- [ ] 모든 문서 Markdown 형식
- [ ] 코드 예제 포함
- [ ] 체크리스트 작성
- [ ] 난이도 표시 (⭐)

---

## ➡️ 완료 후 작업

Phase 1 완료 후:

1. **PROGRESS-TRACKER.md 업데이트**
   - profile 영역 진행률 추가 (0% → 20%)
   - Phase 1 완료 체크
   - 예상 시간 vs 실제 시간 기록

2. **다음 Step 프롬프트 생성**
   - profile 영역 Phase 2 프롬프트 작성
   - 이 파일의 "실행 명령" 섹션 자동 업데이트

3. **최종 확인**
   - 5개 문서 작성 완료
   - 총 ~650줄 예상
   - 모든 체크리스트 ✅

---

## 📚 참고 자료

### 기존 예외 문서
- `docs/exception/profile/` - profile 영역 예외 문서 (13개 파일)
- `docs/exception/MASTER-INDEX.md` - 전체 에러 코드 색인

### 완료된 영역 참고
- `docs/exception/implement/chat/CHAT-EXCEPTION-COMPLETE.md` - chat 완료 보고서
- `docs/exception/implement/my-studies/MY-STUDIES-FINAL-REPORT.md` - my-studies 완료 보고서
- `docs/exception/implement/dashboard/` - dashboard 패턴 참고

### 기술 문서
- Next.js App Router 문서
- Sharp 이미지 처리 라이브러리
- bcrypt 비밀번호 암호화
- Prisma ORM

---

**profile 영역 특수성**:
- 민감한 개인 정보 처리 (보안 중요)
- 이미지 처리 복잡도 (크기, 형식, 리사이징)
- 비밀번호 정책 강화 필요
- 계정 삭제 로직 복잡 (데이터 정리)
- OAuth 연동 에러 처리

**예상 도전 과제**:
1. 이미지 업로드 에러 처리 (네트워크, 크기, 형식)
2. 비밀번호 보안 정책 (강도, 이력, 재사용 방지)
3. 계정 삭제 전 확인 절차 (다단계)
4. 프라이버시 설정 복잡도 (다양한 옵션)
5. 소셜 OAuth 에러 (토큰, 권한, 네트워크)

**AI 작업 지침**:
1. 5개 문서를 순차적으로 작성하세요
2. 각 문서는 template을 참고하되, profile 특성에 맞게 수정하세요
3. 에러 코드 90개를 명확히 정의하세요
4. Phase별 시간 산정을 현실적으로 하세요
5. 완료 후 PROGRESS-TRACKER.md를 업데이트하세요
6. 다음 Phase 2 프롬프트를 자동 생성하여 이 파일을 업데이트하세요
```

---

## 🔄 세션 관리

### 세션 간 연속성 유지

1. **완료 확인**: 각 Step 끝에 완료 체크리스트 확인
2. **문서 업데이트**: PROGRESS-TRACKER.md 자동 업데이트
3. **다음 프롬프트**: 위 "실행 명령" 섹션이 자동으로 다음 Step으로 업데이트됨
4. **새 세션 시작**: 업데이트된 "실행 명령" 복사 → 새 세션에 붙여넣기

**중요**: AI가 각 Step 완료 시 자동으로 이 파일을 업데이트하므로, 사용자는 별도 작업 불필요!

---

## 📝 진행 상황 추적

**전체 진행률**: `docs/exception/implement/PROGRESS-TRACKER.md` 참조

**현재 위치**: profile 영역 Phase 1 (분석 및 계획)

**완료된 영역**:
1. ✅ study (126개 예외)
2. ✅ dashboard (106개 예외)
3. ✅ my-studies (62개 에러 코드)
4. ✅ chat (18종류 Exception, 32시간, 100%)

**남은 영역**: profile → admin → notifications → search → settings (총 5개)

   - CHAT-017: 메시지 순서 오류
   - CHAT-018: 메시지 암호화 실패
   - CHAT-019: 메시지 복호화 실패
   - CHAT-020: XSS 공격 감지
   - CHAT-021: 금지어 포함
   - CHAT-022: 스팸 메시지 감지
   - CHAT-023: 메시지 삭제 실패
   - CHAT-024: 메시지 수정 실패
   - CHAT-025: 메시지 ID 중복
   
   **C. FILE (파일) - 12개**
   - CHAT-026: 파일 업로드 실패
   - CHAT-027: 파일 다운로드 실패
   - CHAT-028: 파일 크기 초과
   - CHAT-029: 잘못된 파일 형식
   - CHAT-030: 파일 압축 실패
   - CHAT-031: 파일 압축 해제 실패
   - CHAT-032: 바이러스 검사 실패
   - CHAT-033: 파일 저장 공간 부족
   - CHAT-034: 파일 이름 중복
   - CHAT-035: 파일 전송 타임아웃
   - CHAT-036: 파일 메타데이터 오류
   - CHAT-037: 파일 접근 권한 없음
   
   **D. SYNC (동기화) - 10개**
   - CHAT-038: 읽음 상태 동기화 실패
   - CHAT-039: 메시지 순서 동기화 실패
   - CHAT-040: 중복 메시지 감지
   - CHAT-041: 누락된 메시지 감지
   - CHAT-042: 타임스탬프 불일치
   - CHAT-043: 읽음 카운트 오류
   - CHAT-044: 최신 메시지 불일치
   - CHAT-045: 오프라인 메시지 동기화 실패
   - CHAT-046: 멀티 디바이스 동기화 실패
   - CHAT-047: 상태 충돌 감지
   
   **E. ROOM (채팅방) - 8개**
   - CHAT-048: 채팅방 생성 실패
   - CHAT-049: 채팅방 삭제 실패
   - CHAT-050: 채팅방 입장 실패
   - CHAT-051: 채팅방 퇴장 실패
   - CHAT-052: 채팅방 권한 부족
   - CHAT-053: 채팅방 정원 초과
   - CHAT-054: 채팅방을 찾을 수 없음
   - CHAT-055: 채팅방 설정 변경 실패
   
   **F. NOTIFICATION (알림) - 8개**
   - CHAT-056: 푸시 알림 전송 실패
   - CHAT-057: 데스크톱 알림 권한 거부
   - CHAT-058: 알림 음소거 설정 오류
   - CHAT-059: 알림 토큰 만료
   - CHAT-060: 알림 전송 한도 초과
   - CHAT-061: 알림 형식 오류
   - CHAT-062: 알림 배지 업데이트 실패
   - CHAT-063: 알림 우선순위 오류
   
   **G. TYPING (입력 중) - 5개**
   - CHAT-064: 입력 상태 전송 실패
   - CHAT-065: 입력 상태 수신 실패
   - CHAT-066: 입력 타임아웃
   - CHAT-067: 입력 상태 초기화 실패
   - CHAT-068: 다중 사용자 입력 충돌
   
   **H. GENERAL (일반) - 12개**
   - CHAT-069: 인증 실패
   - CHAT-070: 세션 만료
   - CHAT-071: 네트워크 오류
   - CHAT-072: 서버 오류
   - CHAT-073: DB 오류
   - CHAT-074: 타임아웃
   - CHAT-075: 요청 한도 초과
   - CHAT-076: 잘못된 요청
   - CHAT-077: 리소스를 찾을 수 없음
   - CHAT-078: 서비스 사용 불가
   - CHAT-079: 버전 호환성 오류
   - CHAT-080: 알 수 없는 오류

4. **Phase별 작업 계획 개요**
   - Phase 1: 분석 및 계획 (8시간)
   - Phase 2: 유틸리티 생성 (10시간)
   - Phase 3: WebSocket 강화 (12시간)
   - Phase 4: UI 개선 (8시간)
   - Phase 5: 최종 검증 (2시간)
   - **총 예상**: 40시간

---

### 1.3 ANALYSIS.md 작성 (3시간)

**파일**: `docs/exception/implement/chat/ANALYSIS.md`

**내용 구성**:

1. **현재 코드 구조 분석**
   
   **분석 대상 파일**:
   - `coup/src/app/my-studies/[studyId]/chat/page.jsx` - 메인 채팅 페이지
   - `signaling-server/server.js` - WebSocket 서버
   - `signaling-server/handlers/` - 이벤트 핸들러
   - `signaling-server/middleware/` - 미들웨어
   - 기타 채팅 관련 컴포넌트
   
   **각 파일별 분석 항목**:
   - 현재 에러 처리 현황
   - 누락된 에러 처리
   - 개선 필요 사항
   - 코드 라인 수

2. **WebSocket 연결 관리 분석**
   - 연결 설정 방식
   - 재연결 로직 유무
   - 타임아웃 설정
   - 에러 핸들링 현황

3. **메시지 전송 로직 분석**
   - 메시지 전송 플로우
   - 전송 실패 처리
   - 재시도 메커니즘 유무
   - 로컬 큐 관리

4. **파일 업로드 분석**
   - 파일 업로드 방식
   - 크기 제한 검증
   - 형식 검증
   - 에러 처리

5. **읽음 상태 동기화 분석**
   - 읽음 상태 관리 방식
   - 동기화 로직
   - 충돌 해결 방식

6. **구현률 추정**
   - 현재 구현된 예외 처리: ~XX개 / 80개
   - 구현률: ~XX%
   - 우선순위별 미구현 항목

---

### 1.4 IMPLEMENTATION-PLAN.md 작성 (2.5시간)

**파일**: `docs/exception/implement/chat/IMPLEMENTATION-PLAN.md`

**내용 구성**:

1. **전체 개요**
   - 목표: chat 영역 100% 예외 처리
   - 총 예상 시간: 40시간
   - Phase 수: 5개

2. **Phase 2: 유틸리티 생성 (10시간)**
   
   **2.1 chat-errors.js (4시간)**
   - 80개 에러 코드 정의
   - 8개 카테고리 분류
   - 헬퍼 함수 10개
     - createChatError()
     - logChatError()
     - logChatWarning()
     - logChatInfo()
     - handleSocketError()
     - handleMessageError()
     - handleFileUploadError()
     - toSocketResponse()
     - getUserFriendlyError()
     - getErrorSeverity()
   
   **2.2 chat-validation.js (3시간)**
   - 15개 유효성 검사 함수
     - validateMessage()
     - validateFileUpload()
     - validateRoomData()
     - validateTypingStatus()
     - validateReadStatus()
     - validateNotificationSettings()
     - validateMessageFormat()
     - validateMessageLength()
     - validateFileType()
     - validateFileSize()
     - validateRoomMember()
     - validateMessageId()
     - validateTimestamp()
     - sanitizeMessage()
     - detectXSS()
   
   **2.3 chat-helpers.js (2시간)**
   - 20개 헬퍼 함수
     - formatMessage()
     - formatTimestamp()
     - groupMessagesByDate()
     - calculateUnreadCount()
     - sortMessagesByTime()
     - filterDeletedMessages()
     - findMessageById()
     - updateReadStatus()
     - markAsRead()
     - canSendMessage()
     - canUploadFile()
     - canDeleteMessage()
     - canEditMessage()
     - isRoomMember()
     - getRoomMembers()
     - getLastMessage()
     - getUnreadMessages()
     - encryptMessage()
     - decryptMessage()
     - sanitizeHTML()
   
   **2.4 socket-manager.js (1시간)**
   - WebSocket 연결 관리
     - connect()
     - disconnect()
     - reconnect()
     - emit()
     - on()
     - off()
     - getConnectionStatus()
     - handleConnectionError()

3. **Phase 3: WebSocket 서버 강화 (12시간)**
   
   **3.1 서버 에러 처리 (4시간)**
   - signaling-server/server.js 개선
   - 연결 에러 처리
   - 인증 에러 처리
   - 글로벌 에러 핸들러
   
   **3.2 핸들러 개선 (6시간)**
   - message 핸들러 강화
   - file-upload 핸들러 강화
   - typing 핸들러 강화
   - read-status 핸들러 강화
   - room 핸들러 강화
   
   **3.3 재연결 로직 (2시간)**
   - 자동 재연결 구현
   - 재연결 지연 전략 (exponential backoff)
   - 재연결 실패 처리

4. **Phase 4: UI 개선 (8시간)**
   
   **4.1 연결 상태 표시 (2시간)**
   - 연결 상태 인디케이터
   - 재연결 중 UI
   - 오프라인 모드 UI
   
   **4.2 메시지 전송 실패 UI (3시간)**
   - 전송 실패 표시
   - 재시도 버튼
   - 로컬 큐 표시
   - 메시지 상태 (전송 중, 성공, 실패)
   
   **4.3 파일 업로드 UI (2시간)**
   - 업로드 진행률 표시
   - 업로드 실패 UI
   - 재시도 기능
   
   **4.4 에러 Toast/모달 (1시간)**
   - 에러 타입별 Toast
   - 재연결 모달
   - 권한 요청 모달

5. **Phase 5: 최종 검증 (2시간)**
   
   **5.1 테스트 시나리오 (1시간)**
   - 연결 테스트 (10개)
   - 메시지 테스트 (15개)
   - 파일 테스트 (8개)
   - 동기화 테스트 (10개)
   
   **5.2 문서화 (1시간)**
   - CHAT-FINAL-REPORT.md 작성
   - USAGE-GUIDE.md 작성
   - PROGRESS-TRACKER.md 업데이트

---

### 1.5 PROGRESS-TRACKER.md 업데이트 (30분)

**파일**: `docs/exception/implement/PROGRESS-TRACKER.md`

**업데이트 내용**:
- Step 9 (chat Phase 1) 시작 기록
- chat 영역 진행률 추가 (0% → XX%)
- 전체 프로젝트 진행률 업데이트
- 예상 완료 날짜 추가

**기록 형식**:
```markdown
### Step 9: chat 영역 Phase 1 - 분석 및 계획 ✅
**기간**: 2025-12-01  
**상태**: 완료 ✅  
**진행률**: 100%  
**담당자**: AI Assistant

#### 작업 내용
1. **문서 생성** (3개)
   - [x] README.md - chat 영역 개요 (~XXX줄)
   - [x] ANALYSIS.md - 현재 코드 분석 (~XXX줄)
   - [x] IMPLEMENTATION-PLAN.md - 구현 계획 (~XXX줄)

2. **분석 완료**
   - [x] 현재 코드 구조 파악
   - [x] 80개 에러 시나리오 정의
   - [x] Phase별 작업 계획 수립
   - [x] 구현률 추정: ~XX%

#### 구현 계획
- **Phase 2**: 유틸리티 생성 (10시간)
- **Phase 3**: WebSocket 강화 (12시간)
- **Phase 4**: UI 개선 (8시간)
- **Phase 5**: 최종 검증 (2시간)

**총 예상 시간**: 40시간

**완료일**: 2025-12-01  
**실제 소요**: XX시간  
**예상 소요**: 8시간  
**누적 진행**: XXh/YYh (ZZ%)
```

---

## ✅ 완료 조건

### 체크리스트

**문서 작성**:
- [ ] chat 폴더 생성 확인/생성
- [ ] README.md 작성 (~500줄, 80개 에러 시나리오 포함)
- [ ] ANALYSIS.md 작성 (~600줄, 현재 코드 분석)
- [ ] IMPLEMENTATION-PLAN.md 작성 (~700줄, Phase별 계획)
- [ ] PROGRESS-TRACKER.md 업데이트

**분석 완료**:
- [ ] 모든 chat 관련 파일 파악
- [ ] 현재 에러 처리 현황 분석
- [ ] 80개 에러 시나리오 정의
- [ ] 8개 카테고리 분류
- [ ] 구현률 추정 완료

**계획 수립**:
- [ ] Phase 2~5 상세 계획
- [ ] 파일별 작업 내용 정의
- [ ] 함수별 작업 내용 정의
- [ ] 시간 예상 완료

---

## 🎯 예상 성과

**chat 영역 Phase 1 완료 후**:
- ✅ 3개 문서 생성 (~1,800줄)
- ✅ 80개 에러 시나리오 정의
- ✅ Phase별 작업 계획 수립
- ✅ 구현 로드맵 완성

**다음 단계**:
- ➡️ Phase 2: 유틸리티 생성 (10시간)
- 📁 4개 파일 생성 예정
- 🔧 80개 에러 코드 + 45개 함수 구현

---

## 📝 참고사항

**chat 영역 특수성**:
- 실시간 통신으로 에러 처리 복잡도 매우 높음
- 네트워크 불안정성 필수 고려
- 메시지 손실 방지가 최우선
- 사용자 경험 우선 (연결 끊김 시 혼란 최소화)
- 오프라인 지원 필요 (로컬 큐, 재전송)

**my-studies 패턴 재사용**:
- ✅ 에러 코드 구조 (CHAT-XXX)
- ✅ 카테고리 기반 분류
- ✅ 유효성 검사 패턴
- ✅ 로깅 패턴 (logChatError, logChatInfo)
- ✅ 사용자 친화적 메시지 (userMessage)

**WebSocket 에러 처리 고려사항**:
- 연결/재연결 로직
- 메시지 큐 관리
- 타임아웃 설정
- 에러 복구 전략
- 상태 동기화

**완료 후 액션**:
- AI가 자동으로 EXCEPTION-IMPLEMENTATION-PROMPT.md를 Phase 2 프롬프트로 업데이트
- PROGRESS-TRACKER.md에 진행 상황 기록
- 다음 세션에서 Phase 2 시작
```

---

## 📊 진행 로드맵

**전체 영역 순서** (총 6개 영역):

1. ✅ **study** - 완료
2. ✅ **dashboard** - 완료
3. ✅ **my-studies** - 완료 (7시간)
4. 🔄 **chat** - 진행 중 (Phase 1) ← **현재**
5. ⏳ **profile** - 대기 (20시간 예상)
6. ⏳ **admin** - 대기 (30시간 예상)
7. ⏳ **notifications** - 대기 (25시간 예상)
8. ⏳ **search** - 대기 (20시간 예상)
9. ⏳ **settings** - 대기 (15시간 예상)

**총 예상 시간**: 약 157시간  
**완료된 시간**: 7시간 (my-studies)  
**남은 시간**: 약 150시간

---

## 📚 참고 문서

**이전 영역 완료 보고서**:
- `docs/exception/implement/my-studies/MY-STUDIES-FINAL-REPORT.md` - 패턴 참고
- `docs/exception/implement/my-studies/USAGE-GUIDE.md` - 사용법 참고

**chat 영역 예외 문서**:
- `docs/exception/chat/` - 11개 파일 (참조용)

**전체 프로젝트**:
- `docs/exception/implement/PROGRESS-TRACKER.md` - 진행 상황
- `docs/exception/MASTER-INDEX.md` - 전체 에러 코드

---

**작성일**: 2025-12-01  
**my-studies 완료일**: 2025-12-01  
**chat 시작일**: 2025-12-01 (예정)

## 🎯 권장 순서

**AI 추천 순서** (비즈니스 우선순위 기준):

1. **chat** (40h) - 핵심 기능, 사용자 engagement 높음
2. **profile** (20h) - 사용자 데이터 무결성 중요
3. **admin** (30h) - 관리 효율성 향상
4. **notifications** (25h) - 사용자 재방문 유도
5. **search** (20h) - 발견 기능 개선
6. **settings** (15h) - 사용자 경험 개선

**총 예상 시간**: 150시간 (약 19일)

---

## 📝 참고 문서

**완료된 영역**:
- `docs/exception/implement/my-studies/MY-STUDIES-FINAL-REPORT.md` - my-studies 완료 보고서
- `docs/exception/implement/my-studies/USAGE-GUIDE.md` - 사용 가이드
- `docs/exception/implement/PROGRESS-TRACKER.md` - 전체 진행 상황

**다음 영역 문서**:
- `docs/exception/chat/` - chat 영역 예외 문서
- `docs/exception/profile/` - profile 영역 예외 문서
- `docs/exception/admin/` - admin 영역 예외 문서

---

**작성일**: 2025-12-01  
**my-studies 완료일**: 2025-12-01  
**다음 시작 권장**: chat 영역 ⭐
const { data, isLoading, error } = useQuery({
  queryKey: ['my-studies', filter],
  queryFn: () => fetchMyStudies(filter),
  onError: (error) => {
    const myStudiesError = handleReactQueryError(error)
    const friendlyError = getUserFriendlyError(myStudiesError.error.code)
    
    toast.error(friendlyError.userMessage)
    logMyStudiesError('스터디 목록 로드 실패', error, { filter })
  },
  retry: (failureCount, error) => {
    // 인증 에러는 재시도 X
    if (error.response?.status === 401) return false
    // 3회까지만 재시도
    return failureCount < 3
  },
  staleTime: 5 * 60 * 1000, // 5분
  cacheTime: 10 * 60 * 1000 // 10분
})
```

### 로딩 상태 패턴

```javascript
if (isLoading) {
  return <MyStudiesLoadingFallback type="list" />
}

if (error) {
  const friendlyError = getUserFriendlyError(error.code)
  return (
    <ErrorState
      title={friendlyError.title}
      message={friendlyError.userMessage}
      onRetry={() => refetch()}
    />
  )
}

if (!data || data.count === 0) {
  return (
    <MyStudiesEmptyState
      filter={filter}
      onAction={() => router.push('/studies')}
    />
  )
}
```

### 권한별 UI 분기

```javascript
// PENDING 상태
if (study.myRole === 'PENDING') {
  return (
    <div className="pending-notice">
      <h3>⏳ 가입 승인 대기 중</h3>
      <p>스터디 관리자가 승인하면 참여할 수 있어요</p>
    </div>
  )
}

// 비멤버
if (!study.myRole) {
  return (
    <div className="access-denied">
      <h3>🔒 접근 권한이 없습니다</h3>
      <p>이 스터디의 멤버가 아닙니다</p>
      <button onClick={() => router.push('/my-studies')}>
        내 스터디로 이동
      </button>
    </div>
  )
}

// 정상 멤버
return <StudyDetailContent study={study} />
```

---

## 🎯 예상 성과

### 사용자 경험

- ✅ 로딩 중: 스켈레톤 UI로 자연스러운 대기
- ✅ 에러 발생: 명확한 메시지 + 재시도 버튼
- ✅ 빈 상태: 다음 액션 유도 (CTA)
- ✅ 권한 없음: 친절한 안내 + 대안 제시

### 안정성

- ✅ React Error Boundary로 전체 앱 크래시 방지
- ✅ 탭별 에러 격리 (한 탭 실패가 전체에 영향 X)
- ✅ WebSocket 실패 시 폴백 (폴링)

### 모니터링

- ✅ 모든 에러 자동 로깅
- ✅ 에러 발생 위치 추적 (componentStack)
- ✅ 사용자 액션 로깅 (재시도, 이탈)

---

## 📊 작업 분량

| 항목 | 파일 수 | 예상 시간 |
|------|--------|----------|
| STEP-7-PROMPT.md | 1 | 30분 |
| 메인 페이지 | 1 | 2.5시간 |
| 상세 페이지 | 1 | 3시간 |
| 공통 컴포넌트 | 3 | 2시간 |
| **합계** | **6** | **8시간** |

---

## 🔗 관련 문서

- `docs/exception/implement/my-studies/STEP-5-COMPLETE-REPORT.md` - Phase 1 완료
- `docs/exception/implement/my-studies/STEP-6-COMPLETE-REPORT.md` - Phase 2 완료
- `docs/exception/my-studies/PAGES-GUIDE.md` - 페이지별 예외 가이드
- `docs/exception/my-studies/COMPONENTS-GUIDE.md` - 컴포넌트 예외 가이드
```

**완료 후**:
1. 작업 완료 확인
2. STEP-7-COMPLETE-REPORT.md 작성
3. PROGRESS-TRACKER.md 업데이트 (진행률 83.3% → 91.1%)
4. 이 파일의 "실행 명령" 섹션을 Step 8 프롬프트로 자동 업데이트

---
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
**최종 업데이트**: 2025-12-01 (Chat 영역 Phase 2 완료)  
**버전**: 6.0.0  
**상태**: Chat 영역 Phase 3 준비 완료 ✅

---

## 🎯 실행 명령 - Chat 영역 Phase 6: 통합 테스트 및 최종 검증

**새 채팅 세션에서 아래 프롬프트를 복사하여 사용하세요:**

```
안녕하세요! CoUp 예외 처리 구현 - chat 영역 Phase 6를 시작합니다.

**목표**: 통합 테스트 및 최종 검증

**프로젝트 정보**:
- Next.js 16 App Router 기반
- JavaScript (ES6+) 전용
- Socket.IO 기반 실시간 통신
- Tailwind CSS + shadcn/ui

**이전 완료**:
- ✅ study 영역 완료 (126개 예외 처리)
- ✅ dashboard 영역 완료 (106개 예외 처리)
- ✅ my-studies 영역 완료 (62개 에러 코드, 100%)
- ✅ chat Phase 1 완료 (분석 및 계획, 8시간)
- ✅ chat Phase 2 완료 (예외 클래스/유틸리티, 4시간)
- ✅ chat Phase 3 완료 (Socket 연결 예외 처리, 6시간)
- ✅ chat Phase 4 완료 (컴포넌트 레벨 예외 처리, 8시간)
- ✅ chat Phase 5 완료 (서버 예외 처리, 2시간) ✅
  - ✅ 3개 API 파일 개선 (+167줄)
  - ✅ 7종류 11회 Exception 사용
  - ✅ 14회 로깅 추가
  - ✅ 에러 응답 표준화 (100%)

**현재 작업**: Chat 영역 Phase 6 - 통합 테스트 및 최종 검증

**예상 난이도**: ⭐⭐ (쉬움-중간)
- 통합 테스트 시나리오
- E2E 테스트 (선택적)
- 최종 문서화
- 완료 보고서

**참조 문서**:
- `docs/exception/implement/chat/PHASE5-COMPLETE.md` - Phase 5 완료
- `docs/exception/implement/chat/PHASE5-TEST-GUIDE.md` - API 테스트 가이드
- `docs/exception/implement/chat/IMPLEMENTATION-STATUS.md` - 구현 현황 (94%)

---

## 📋 작업 내용

### Phase 6: 통합 테스트 및 최종 검증 (4시간)

전체 시스템의 통합 테스트를 진행하고 최종 문서화를 완료합니다.

---

### 6.1 통합 테스트 시나리오 작성 (2시간)

#### 작업 1: Socket + API 통합 테스트 (1시간)

**파일**: `docs/exception/implement/chat/INTEGRATION-TEST-SCENARIOS.md`

**시나리오**:

1. **메시지 송수신 플로우**
   ```
   1. 사용자 A 로그인
   2. 스터디 입장 → Socket 연결
   3. 메시지 입력 → 낙관적 업데이트
   4. API POST /chat → 서버 전송
   5. Socket 'message:new' → 사용자 B 수신
   6. 메시지 목록 업데이트
   
   검증:
   - [ ] 낙관적 UI 표시
   - [ ] API 성공 후 실제 메시지로 교체
   - [ ] 다른 사용자에게 실시간 전송
   - [ ] 에러 발생 시 롤백
   ```

2. **재연결 시나리오**
   ```
   1. 사용자 채팅 중
   2. 네트워크 연결 끊김 → disconnected 상태
   3. ConnectionBanner 표시
   4. 자동 재연결 시도 → reconnecting 상태
   5. 재연결 성공 → connected 상태
   6. 메시지 동기화 (누락된 메시지 조회)
   
   검증:
   - [ ] 각 연결 상태 UI 표시
   - [ ] 재연결 시도 횟수 표시
   - [ ] 재연결 후 메시지 동기화
   - [ ] 로그 기록 (reconnect, sync)
   ```

3. **에러 복구 플로우**
   ```
   1. 메시지 전송 → 네트워크 에러
   2. 메시지에 인라인 에러 표시
   3. 재시도 버튼 클릭
   4. 재전송 성공 → 에러 표시 제거
   
   검증:
   - [ ] 인라인 에러 표시
   - [ ] 재시도 버튼 동작
   - [ ] 성공 시 UI 정리
   - [ ] 에러 로깅
   ```

4. **권한 검증 플로우**
   ```
   1. 사용자 B가 사용자 A의 메시지 수정 시도
   2. API PATCH → 403 에러
   3. ErrorToast 표시
   4. 로그 기록 (unauthorized)
   
   검증:
   - [ ] API 에러 응답
   - [ ] ErrorToast 표시
   - [ ] 에러 코드 (CHAT-MSG-008)
   - [ ] 로그 기록
   ```

5. **동시성 테스트**
   ```
   1. 사용자 A, B 동시에 메시지 전송
   2. 양쪽 모두 낙관적 업데이트
   3. 서버 처리 → Socket 전송
   4. 메시지 순서 정렬 (createdAt)
   
   검증:
   - [ ] 메시지 순서 일관성
   - [ ] 중복 메시지 없음
   - [ ] 두 사용자 모두 동기화
   ```

#### 작업 2: 에러 케이스 통합 테스트 (1시간)

**파일**: `docs/exception/implement/chat/ERROR-CASE-TEST.md`

**테스트 케이스**:

1. **CHAT-MSG-003: 빈 메시지**
   - 입력: 공백만 입력
   - 예상: 전송 버튼 비활성화 또는 경고
   
2. **CHAT-MSG-004: 메시지 길이 초과**
   - 입력: 2001자 입력
   - 예상: 입력 제한 또는 에러 토스트

3. **CHAT-MSG-005: 스팸 감지**
   - 입력: 10초에 6번 전송
   - 예상: 429 에러, ErrorToast

4. **CHAT-MSG-006: XSS 시도**
   - 입력: `<script>alert(1)</script>`
   - 예상: 400 에러, 보안 로그

5. **CHAT-CONN-001: 서버 연결 불가**
   - 시뮬레이션: 서버 중단
   - 예상: ConnectionBanner, 재연결 시도

---

### 6.2 E2E 테스트 (1시간) - 선택적

#### Playwright 또는 Cypress 테스트

**파일**: `coup/tests/e2e/chat.spec.js` (선택적)

```javascript
describe('Chat Exception Handling', () => {
  it('should show error toast on message send failure', async () => {
    // 1. 로그인
    await loginAs('user1')
    
    // 2. 스터디 입장
    await page.goto('/studies/study1')
    
    // 3. 네트워크 차단
    await page.route('**/api/studies/*/chat', route => route.abort())
    
    // 4. 메시지 전송
    await page.fill('[data-testid="message-input"]', 'Test')
    await page.click('[data-testid="send-button"]')
    
    // 5. 에러 토스트 확인
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-toast"]'))
      .toContainText('메시지 전송에 실패했습니다')
  })
  
  it('should retry message send on retry button click', async () => {
    // 테스트 구현...
  })
})
```

---

### 6.3 최종 문서화 (1시간)

#### 작업 1: 에러 코드 완전 가이드

**파일**: `docs/exception/implement/chat/ERROR-CODE-GUIDE.md`

**내용**:
```markdown
# Chat 영역 에러 코드 완전 가이드

## 연결 예외 (CHAT-CONN-XXX)

### CHAT-CONN-001: 서버 연결 불가
- **원인**: Socket 서버에 연결할 수 없음
- **사용자 메시지**: "서버에 연결할 수 없습니다"
- **개발자 메시지**: "Failed to connect to socket server"
- **재시도 가능**: ✅ Yes
- **복구 방법**: 
  1. 네트워크 연결 확인
  2. 자동 재연결 대기
  3. 수동 재연결 버튼 클릭

### CHAT-CONN-002: 연결 타임아웃
...

## 메시지 예외 (CHAT-MSG-XXX)
...
```

#### 작업 2: 트러블슈팅 가이드

**파일**: `docs/exception/implement/chat/TROUBLESHOOTING.md`

**내용**:
- 자주 발생하는 문제와 해결 방법
- 로그 분석 방법
- 디버깅 팁

#### 작업 3: Chat 영역 완료 보고서

**파일**: `docs/exception/implement/chat/FINAL-REPORT.md`

**내용**:
- 전체 Phase 요약
- 최종 통계
- 주요 성과
- 교훈
- 남은 개선 사항

---

## ✅ 완료 조건

### 문서
- [ ] INTEGRATION-TEST-SCENARIOS.md (통합 테스트 시나리오)
- [ ] ERROR-CASE-TEST.md (에러 케이스 테스트)
- [ ] ERROR-CODE-GUIDE.md (에러 코드 완전 가이드)
- [ ] TROUBLESHOOTING.md (트러블슈팅 가이드)
- [ ] FINAL-REPORT.md (최종 보고서)
- [ ] IMPLEMENTATION-STATUS.md 업데이트 (100%)

### 테스트
- [ ] 5개 통합 시나리오 작성
- [ ] 5개 에러 케이스 테스트
- [ ] (선택) E2E 테스트 1개 이상

### 검증
- [ ] 모든 에러 코드 문서화
- [ ] 모든 API 테스트 가이드
- [ ] Phase 1-5 완료 확인

---

## ➡️ 완료 후

작업 완료 시 AI가 자동으로:
1. ✅ 작업 완료 메시지 표시
2. ✅ Chat 영역 100% 완료 선언
3. ✅ 다음 영역 (notifications) 프롬프트 생성
4. ✅ 이 파일(EXCEPTION-IMPLEMENTATION-PROMPT.md)의 "실행 명령" 섹션을 notifications Phase 1 프롬프트로 자동 업데이트

**다음 영역**: notifications 영역 Phase 1 - 분석 및 계획

시작해주세요!
      messages,
      hasMore: messages.length === limit
    })
  } catch (error) {
    logChatError('Failed to fetch messages', error, { studyId: params.studyId })
    
    return NextResponse.json({
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || '메시지를 불러오는데 실패했습니다'
      }
    }, { status: error.statusCode || 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { studyId } = params
    const body = await request.json()
    const { content } = body

    // 권한 검증
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw ChatMessageException.unauthorized({ studyId })
    }

    // 내용 검증
    if (!content?.trim()) {
      throw ChatMessageException.emptyMessage({ studyId })
    }

    if (content.length > 1000) {
      throw ChatMessageException.messageTooLong(content.length, 1000, { studyId })
    }

    // 메시지 생성
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        studyId,
        userId: session.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    })

    logChatInfo('Message created', { messageId: message.id, studyId })

    return NextResponse.json({
      success: true,
      message
    }, { status: 201 })
  } catch (error) {
    logChatError('Failed to create message', error, { studyId: params.studyId })
    
    return NextResponse.json({
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || '메시지 전송에 실패했습니다'
      }
    }, { status: error.statusCode || 500 })
  }
}
```

---

### 5.2 통합 테스트 (2시간)

**목표**: 전체 채팅 플로우 테스트

#### 테스트 시나리오

**1. 연결 테스트** (30분):
- [x] 정상 연결
- [x] 연결 실패 (인증 없음)
- [x] 네트워크 오프라인
- [x] 재연결 시도
- [x] 재연결 성공

**2. 메시지 테스트** (45분):
- [x] 메시지 전송 (정상)
- [x] 메시지 전송 (연결 끊김)
- [x] 메시지 재시도
- [x] 긴 메시지 (1000자 초과)
- [x] 빈 메시지
- [x] 메시지 수신
- [x] 낙관적 업데이트 확인

**3. UI 테스트** (30분):
- [x] 에러 토스트 표시
- [x] 연결 상태 배너
- [x] 실패 메시지 인라인 에러
- [x] 재시도 버튼 동작
- [x] 자동 스크롤
- [x] 타이핑 인디케이터

**4. 엣지 케이스** (15분):
- [x] 동시에 여러 메시지 전송
- [x] 빠른 연결 끊김/재연결
- [x] 페이지 새로고침
- [x] 브라우저 창 최소화

---

### 5.3 최종 문서화 (2시간)

#### 문서 1: PHASE5-COMPLETE.md (1시간)

**파일**: `docs/exception/implement/chat/PHASE5-COMPLETE.md`

**내용**:
- Phase 5 작업 내용
- API 라우트 개선 사항
- 테스트 결과
- 최종 통계

#### 문서 2: CHAT-FINAL-REPORT.md (30분)

**파일**: `docs/exception/implement/chat/CHAT-FINAL-REPORT.md`

**내용**:
- 전체 Phase 요약 (Phase 1~5)
- 총 구현 통계
  - 신규 코드: ~2,000줄
  - 수정 코드: ~500줄
  - 신규 파일: ~20개
- 개선 효과
- 사용 가이드 링크

#### 문서 3: PROGRESS-TRACKER.md 최종 업데이트 (30분)

**파일**: `docs/exception/implement/PROGRESS-TRACKER.md`

**업데이트 내용**:
- Chat 영역 100% 완료 기록
- 전체 프로젝트 진행률 업데이트
- 다음 영역 (notifications, profile 등) 계획

---

## ✅ 완료 조건

### 체크리스트

**서버 개선**:
- [ ] 메시지 API 예외 처리 (선택적)
- [ ] 읽음 처리 API 예외 처리 (선택적)
- [ ] 에러 응답 표준화

**테스트**:
- [ ] 연결 테스트 (5개 시나리오)
- [ ] 메시지 테스트 (7개 시나리오)
- [ ] UI 테스트 (6개 시나리오)
- [ ] 엣지 케이스 (4개 시나리오)

**문서화**:
- [ ] PHASE5-COMPLETE.md 작성
- [ ] CHAT-FINAL-REPORT.md 작성
- [ ] PROGRESS-TRACKER.md 최종 업데이트
- [ ] README.md 업데이트

**최종 확인**:
- [ ] 모든 에러 코드 정의 완료
- [ ] 에러 로깅 동작 확인
- [ ] 사용자 친화적 메시지 확인
- [ ] 재시도 기능 동작 확인

---

## 📊 Phase 5 예상 성과

**완료 항목**:
- ✅ API 라우트 예외 처리 (선택적, 2개)
- ✅ 통합 테스트 (22개 시나리오)
- ✅ 최종 문서화 (3개 문서)

**Chat 영역 전체 통계** (Phase 1~5):
- 📁 신규 파일: ~20개
- 📝 신규 코드: ~2,000줄
- ✏️ 수정 코드: ~500줄
- 📚 문서: ~10개 (약 5,000줄)
- ⏱️ 총 소요: 26시간 (예상 32시간)

---

## 🎯 Chat 영역 완료 후

**달성 사항**:
- ✅ 100% 예외 처리 커버리지
- ✅ 낙관적 업데이트로 체감 속도 향상
- ✅ 3단계 에러 표시 (명확한 피드백)
- ✅ 6가지 연결 상태 관리
- ✅ 자동 재연결 (5회 시도)
- ✅ 재시도 기능 (원클릭)

**다음 영역**: 
- ⏳ notifications 영역 (알림 시스템)
- ⏳ profile 영역 (프로필 관리)
- ⏳ admin 영역 (관리자 기능)

---

## 📝 참고사항

**Chat 영역 특징**:
- 실시간 통신으로 복잡도 높음
- 네트워크 불안정성 필수 고려
- 사용자 경험 우선 (즉각적 피드백)
- 오프라인 지원 (낙관적 업데이트)

**완료 후 액션**:
1. ✅ Chat 영역 완료 기록
2. ✅ PROGRESS-TRACKER.md 업데이트
3. ✅ 이 파일의 "실행 명령" 섹션을 다음 영역으로 업데이트
4. ✅ 다음 영역 선택 (notifications 추천)

시작해주세요!
```

---

## 🚀 지금 바로 시작하세요!

위의 "🎯 실행 명령" 섹션의 프롬프트를 복사하여 새 세션에서 사용하시면 됩니다.

**순차적 진행 경로**:
- ✅ Step 1 (문서 구조 생성)
- ✅ Step 2 (study 영역 완료)
- ✅ Step 3 (dashboard 영역 완료)
- ✅ Step 4 (my-studies 영역 완료 - 100%)
- ✅ Chat Phase 1 (분석 및 계획 - 8시간)
- ✅ Chat Phase 2 (예외 클래스/유틸리티 - 4시간)
- ✅ Chat Phase 3 (Socket 연결 예외 처리 - 6시간)
- ✅ Chat Phase 4 (컴포넌트 레벨 예외 처리 - 8시간)
- 🚧 **Chat Phase 5 (서버 예외 처리 및 완료 - 6시간)** ← 현재
- ⏳ notifications 영역 (예정)
- ⏳ profile 영역 (예정)

**Chat 영역 진행률**: 81.3% (26h/32h)

**Happy Coding! 🎉**

  if (!error) return null

  // 에러 유형별 아이콘
  const getIcon = () => {
    if (error.code?.startsWith('CHAT-CONN-')) {
      return <Wifi className="h-5 w-5" />
    }
    return <AlertCircle className="h-5 w-5" />
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-red-500">
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {error.message}
            </p>
            
            {error.code && (
              <p className="text-xs text-red-600 mt-1">
                코드: {error.code}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {error.retryable && onRetry && (
              <button
                onClick={onRetry}
                className="text-red-700 hover:text-red-900 p-1 rounded hover:bg-red-100"
                title="재시도"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-700 hover:text-red-900 p-1 rounded hover:bg-red-100"
                title="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 작업 2: ErrorBanner 컴포넌트 (0.5시간)

**파일**: `coup/src/components/ui/ErrorBanner.js`

**기능**:
- 인라인 에러 배너
- 경고/에러 레벨
- 닫기 가능
- 재시도 버튼

**구현**:
```javascript
'use client'

import { AlertCircle, AlertTriangle, X, RefreshCw } from 'lucide-react'

/**
 * 인라인 에러 배너
 * 
 * @param {Object} error - 에러 객체
 * @param {string} severity - 'error' | 'warning'
 * @param {Function} onRetry - 재시도 콜백
 * @param {Function} onDismiss - 닫기 콜백
 */
export function ErrorBanner({ error, severity = 'error', onRetry, onDismiss }) {
  if (!error) return null

  const isError = severity === 'error'
  const bgColor = isError ? 'bg-red-50' : 'bg-yellow-50'
  const borderColor = isError ? 'border-red-200' : 'border-yellow-200'
  const textColor = isError ? 'text-red-800' : 'text-yellow-800'
  const iconColor = isError ? 'text-red-500' : 'text-yellow-500'
  const buttonColor = isError ? 'hover:bg-red-100' : 'hover:bg-yellow-100'

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColor}`}>
          {isError ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>
        
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {error.message}
          </p>
          
          {error.code && (
            <p className={`text-xs ${textColor} opacity-75 mt-1`}>
              에러 코드: {error.code}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className={`${textColor} ${buttonColor} p-1.5 rounded-md transition-colors`}
              title="재시도"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`${textColor} ${buttonColor} p-1.5 rounded-md transition-colors`}
              title="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### 작업 3: ConnectionStatus 컴포넌트 (0.5시간)

**파일**: `coup/src/components/chat/ConnectionStatus.js`

**기능**:
- 연결 상태 표시
- 재연결 진행 상황
- 수동 재연결 버튼

**구현**:
```javascript
'use client'

import { useSocket, ConnectionState } from '@/contexts/SocketContext'
import { Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react'

/**
 * 연결 상태 표시 컴포넌트
 */
export function ConnectionStatus() {
  const { 
    connectionState, 
    connectionError, 
    reconnectAttempt, 
    reconnect 
  } = useSocket()

  // 연결됨 상태면 표시 안 함
  if (connectionState === ConnectionState.CONNECTED) {
    return null
  }

  const getStatusConfig = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTING:
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: '연결 중...',
          color: 'bg-blue-50 text-blue-700 border-blue-200'
        }
      
      case ConnectionState.RECONNECTING:
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: `재연결 중... (${reconnectAttempt}/5)`,
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        }
      
      case ConnectionState.OFFLINE:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: '오프라인',
          color: 'bg-red-50 text-red-700 border-red-200'
        }
      
      case ConnectionState.FAILED:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: '연결 실패',
          color: 'bg-red-50 text-red-700 border-red-200',
          showRetry: true
        }
      
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: '연결 안 됨',
          color: 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`fixed top-4 right-4 z-40 ${config.color} border rounded-lg px-4 py-2 shadow-lg`}>
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="text-sm font-medium">{config.text}</span>
        
        {config.showRetry && (
          <button
            onClick={reconnect}
            className="ml-2 p-1 hover:bg-opacity-10 hover:bg-black rounded"
            title="다시 연결"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {connectionError && (
        <p className="text-xs mt-1 opacity-75">
          {connectionError.message}
        </p>
      )}
    </div>
  )
}
```

#### 작업 4: LoadingSpinner 컴포넌트 (0.5시간)

**파일**: `coup/src/components/ui/LoadingSpinner.js`

**기능**:
- 로딩 스피너
- 메시지 표시
- 크기 조절 가능

**구현**:
```javascript
'use client'

import { Loader2 } from 'lucide-react'

/**
 * 로딩 스피너 컴포넌트
 * 
 * @param {string} message - 로딩 메시지
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export function LoadingSpinner({ message, size = 'md' }) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }[size]

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <Loader2 className={`${sizeClass} animate-spin text-blue-500`} />
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  )
}
```

---

### 4.2 ChatInput 컴포넌트 개선 (2시간)

**목표**: 메시지 입력 컴포넌트에 예외 처리 적용

#### 작업 1: 입력 검증 (0.5시간)

**파일**: `coup/src/components/chat/ChatInput.js`

**개선 사항**:
1. 빈 메시지 검증
2. 길이 제한 (2000자)
3. 스팸 방지
4. 에러 표시

**구현 예시**:
```javascript
'use client'

import { useState, useRef, useEffect } from 'react'
import { useChatSocket } from '@/lib/hooks/useStudySocket'
import { ChatMessageException } from '@/lib/exceptions/chat'
import { handleChatError } from '@/lib/utils/chat'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Send, Loader2 } from 'lucide-react'

export function ChatInput({ studyId }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)
  const [validationError, setValidationError] = useState(null)
  
  const { 
    sendMessage, 
    setTyping, 
    isConnected, 
    isSending,
    error: socketError 
  } = useChatSocket(studyId)
  
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const lastMessageTimeRef = useRef(0)
  const messageCountRef = useRef([])

  // 로컬 검증
  const validateMessage = (text) => {
    setValidationError(null)
    
    // 빈 메시지
    if (!text || text.trim().length === 0) {
      const error = ChatMessageException.emptyContent({ studyId })
      const errorInfo = handleChatError(error)
      setValidationError(errorInfo)
      return false
    }
    
    // 길이 초과
    if (text.length > 2000) {
      const error = ChatMessageException.contentTooLong(text.length, 2000, { studyId })
      const errorInfo = handleChatError(error)
      setValidationError(errorInfo)
      return false
    }
    
    // 스팸 검사 (10초 내 5개 이상)
    const now = Date.now()
    messageCountRef.current = messageCountRef.current.filter(time => now - time < 10000)
    
    if (messageCountRef.current.length >= 5) {
      const error = ChatMessageException.spamDetected(
        messageCountRef.current.length,
        10,
        { studyId }
      )
      const errorInfo = handleChatError(error)
      setValidationError(errorInfo)
      return false
    }
    
    return true
  }

  // 메시지 전송
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateMessage(content)) {
      return
    }
    
    try {
      setError(null)
      
      const result = await sendMessage(content)
      
      if (result.success) {
        // 성공: 입력 초기화
        setContent('')
        messageCountRef.current.push(Date.now())
        inputRef.current?.focus()
      } else {
        // 실패: 에러 표시
        setError(result.error)
      }
    } catch (err) {
      const errorInfo = handleChatError(err)
      setError(errorInfo)
    }
  }

  // 타이핑 상태 전송
  const handleChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
    setValidationError(null)
    
    // 타이핑 시작
    setTyping(true)
    
    // 타이머 취소 및 재설정
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false)
    }, 1000)
  }

  // cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      setTyping(false)
    }
  }, [setTyping])

  const displayError = validationError || error || socketError
  const canSend = isConnected && !isSending && content.trim().length > 0

  return (
    <div className="border-t bg-white p-4">
      {displayError && (
        <ErrorBanner
          error={displayError}
          onRetry={displayError.retryable ? handleSubmit : undefined}
          onDismiss={() => {
            setError(null)
            setValidationError(null)
          }}
        />
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={content}
            onChange={handleChange}
            placeholder={isConnected ? "메시지를 입력하세요..." : "연결 대기 중..."}
            disabled={!isConnected || isSending}
            className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={3}
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
            <span>
              {content.length}/2000
            </span>
            {!isConnected && (
              <span className="text-red-500">
                연결 안 됨
              </span>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!canSend}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 h-fit"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              전송 중
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              전송
            </>
          )}
        </button>
      </form>
    </div>
  )
}
```

---

### 4.3 MessageList 컴포넌트 개선 (2시간)

**목표**: 메시지 목록 컴포넌트에 예외 처리 및 낙관적 업데이트 적용

#### 작업 1: 낙관적 업데이트 (1시간)

**개선 사항**:
1. 메시지 임시 표시
2. 전송 실패 시 롤백
3. 재전송 기능

**구현 예시**:
```javascript
'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatSocket } from '@/lib/hooks/useStudySocket'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorBanner } from '@/components/ui/ErrorBanner'

export function MessageList({ studyId, userId }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { newMessage } = useChatSocket(studyId)
  const messagesEndRef = useRef(null)

  // 메시지 로딩
  useEffect(() => {
    loadMessages()
  }, [studyId])

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/chat/${studyId}/messages`)
      
      if (!response.ok) {
        throw new Error('메시지를 불러올 수 없습니다')
      }
      
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err) {
      setError({
        message: err.message,
        retryable: true
      })
    } finally {
      setLoading(false)
    }
  }

  // 새 메시지 수신
  useEffect(() => {
    if (newMessage) {
      setMessages(prev => {
        // 중복 방지
        if (prev.find(m => m.id === newMessage.id)) {
          return prev
        }
        return [...prev, newMessage]
      })
      
      // 스크롤 하단으로
      scrollToBottom()
    }
  }, [newMessage])

  // 낙관적 업데이트: 메시지 추가
  const addOptimisticMessage = (content) => {
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content,
      userId,
      createdAt: new Date().toISOString(),
      status: 'sending',
      isOptimistic: true
    }
    
    setMessages(prev => [...prev, tempMessage])
    scrollToBottom()
    
    return tempMessage.id
  }

  // 낙관적 업데이트: 성공 시 실제 메시지로 교체
  const confirmOptimisticMessage = (tempId, realMessage) => {
    setMessages(prev => prev.map(msg => 
      msg.id === tempId ? { ...realMessage, isOptimistic: false } : msg
    ))
  }

  // 낙관적 업데이트: 실패 시 제거
  const removeOptimisticMessage = (tempId) => {
    setMessages(prev => prev.filter(msg => msg.id !== tempId))
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner message="메시지를 불러오는 중..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <ErrorBanner
          error={error}
          onRetry={loadMessages}
          onDismiss={() => setError(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.userId === userId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

function MessageItem({ message, isOwn }) {
  const isOptimistic = message.isOptimistic
  const isFailed = message.status === 'failed'

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwn
            ? isOptimistic
              ? 'bg-blue-400 text-white opacity-60'
              : isFailed
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs opacity-75">
            {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          
          {isOptimistic && (
            <span className="text-xs">전송 중...</span>
          )}
          
          {isFailed && (
            <span className="text-xs">전송 실패</span>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### 4.4 ChatRoom 통합 (2시간)

**목표**: 전체 채팅방 컴포넌트에서 예외 처리 통합

**파일**: `coup/src/app/studies/[id]/chat/page.js` 또는 `coup/src/components/chat/ChatRoom.js`

**개선 사항**:
1. 연결 상태 표시
2. 에러 토스트
3. 전역 에러 처리
4. 사용자 경험 최적화

---

## ✅ 완료 조건

- [ ] 에러 UI 컴포넌트 생성 완료
  - [ ] ErrorToast.js
  - [ ] ErrorBanner.js
  - [ ] ConnectionStatus.js
  - [ ] LoadingSpinner.js

- [ ] ChatInput 개선 완료
  - [ ] 입력 검증 (3가지)
  - [ ] 에러 표시
  - [ ] 타이핑 상태
  - [ ] 전송 중 상태

- [ ] MessageList 개선 완료
  - [ ] 낙관적 업데이트
  - [ ] 메시지 로딩
  - [ ] 에러 처리
  - [ ] 스크롤 관리

- [ ] ChatRoom 통합 완료
  - [ ] 연결 상태 표시
  - [ ] 전역 에러 처리
  - [ ] 사용자 경험 최적화

- [ ] 코드 검증
  - [ ] 에러 없음
  - [ ] JSDoc 주석
  - [ ] 접근성 (a11y)

- [ ] 문서 작성
  - [ ] PHASE4-COMPLETE.md
  - [ ] PROGRESS-TRACKER.md 업데이트

---

## ➡️ 완료 후

작업 완료 시 AI가 자동으로:
1. ✅ 작업 완료 메시지 표시
2. ✅ Phase 5 프롬프트 생성 (테스트 및 검증)
3. ✅ 이 파일(EXCEPTION-IMPLEMENTATION-PROMPT.md)의 "실행 명령" 섹션을 Phase 5 프롬프트로 자동 업데이트

**다음 Phase**: Phase 5 - 테스트 및 검증 (6시간)

시작해주세요!
```

---

## 🚀 지금 바로 시작하세요!

위의 "🎯 실행 명령" 섹션의 프롬프트를 복사하여 새 세션에서 사용하시면 됩니다.

**순차적 진행 경로**:
- ✅ Step 1 (문서 구조 생성)
- ✅ Step 2 (study 영역 완료)
- ✅ Step 3 (dashboard 영역 완료)
- ✅ Step 4 (my-studies 영역 완료 - 100%)
- ✅ Chat Phase 1 (분석 및 계획 - 8시간)
- ✅ Chat Phase 2 (예외 클래스/유틸리티 - 4시간)
- ✅ Chat Phase 3 (Socket 연결 예외 처리 - 6시간)
- 🚧 **Chat Phase 4 (컴포넌트 레벨 예외 처리 - 8시간)** ← 현재
- ⏳ Chat Phase 5 (테스트 및 검증 - 6시간)
- ⏳ Chat Phase 6 (문서화 및 최종 점검 - 2시간)

**Chat 영역 진행률**: 40.9% (18h/44h)

**Happy Coding! 🎉**
```

**개선**:
```javascript
// 상세한 연결 상태
const [connectionStatus, setConnectionStatus] = useState('disconnected');
// 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'offline'

const [connectionError, setConnectionError] = useState(null);
// { code, message, retryable, timestamp }

const [reconnectAttempt, setReconnectAttempt] = useState(0);
// 현재 재연결 시도 횟수
```

**구현할 내용**:
1. ✅ connectionStatus 상태 추가
2. ✅ connectionError 상태 추가
3. ✅ reconnectAttempt 상태 추가
4. ✅ 상태 변화 시 적절한 업데이트

#### 작업 2: 에러 처리 강화 (1.5시간)

**현재 문제**:
```javascript
socketInstance.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
  setIsConnected(false);
  // 에러 정보가 사용자에게 전달되지 않음
});
```

**개선**:
```javascript
import { 
  ChatConnectionException,
  handleChatError,
  logChatError 
} from '@/lib/exceptions/chat';
from '@/lib/utils/chat';

socketInstance.on('connect_error', (error) => {
  // 1. 에러 분류
  let chatError;
  
  if (error.message.includes('User not found')) {
    chatError = ChatConnectionException.authenticationFailed({
      userId: user.id,
      reason: 'User not found in database'
    });
  } else if (error.message.includes('timeout')) {
    chatError = ChatConnectionException.timeout({
      userId: user.id,
      socketId: socketInstance.id
    });
  } else if (error.message.includes('refused')) {
    chatError = ChatConnectionException.serverUnreachable({
      userId: user.id,
      url: process.env.NEXT_PUBLIC_SOCKET_URL
    });
  } else {
    chatError = new ChatConnectionException(
      'CHAT-CONN-001',
      error.message,
      {
        userMessage: '채팅 서버에 연결할 수 없습니다',
        devMessage: error.message,
        retryable: true,
        context: { userId: user.id }
      }
    );
  }
  
  // 2. 에러 처리 및 로깅
  const errorInfo = handleChatError(chatError);
  
  // 3. 상태 업데이트
  setConnectionStatus('offline');
  setConnectionError(errorInfo);
  setIsConnected(false);
  
  // 4. 재시도 불가능한 에러면 소켓 정리
  if (!errorInfo.retryable) {
    socketInstance.disconnect();
  }
});
```

**구현할 내용**:
1. ✅ connect_error 이벤트 개선
2. ✅ disconnect 이벤트 개선
3. ✅ connect 이벤트에 성공 로깅 추가
4. ✅ reconnect_attempt 이벤트 추가
5. ✅ reconnect_failed 이벤트 추가

#### 작업 3: 타임아웃 처리 (1시간)

**추가할 기능**:
```javascript
// 연결 타임아웃 (30초)
const CONNECTION_TIMEOUT = 30000;
let connectionTimer = null;

// 연결 시도 시 타이머 시작
const startConnectionTimeout = () => {
  connectionTimer = setTimeout(() => {
    if (connectionStatus === 'connecting') {
      const error = ChatConnectionException.timeout({
        userId: user.id,
        timeout: CONNECTION_TIMEOUT
      });
      
      const errorInfo = handleChatError(error);
      
      setConnectionStatus('offline');
      setConnectionError(errorInfo);
      
      socketInstance.disconnect();
    }
  }, CONNECTION_TIMEOUT);
};

// 연결 성공 시 타이머 취소
const clearConnectionTimeout = () => {
  if (connectionTimer) {
    clearTimeout(connectionTimer);
    connectionTimer = null;
  }
};

// connect 이벤트
socketInstance.on('connect', () => {
  clearConnectionTimeout();
  setConnectionStatus('connected');
  setConnectionError(null);
  setReconnectAttempt(0);
  setIsConnected(true);
});
```

**구현할 내용**:
1. ✅ 연결 타임아웃 로직 추가
2. ✅ 타이머 정리 함수 추가
3. ✅ 적절한 에러 메시지

#### 작업 4: 네트워크 상태 감지 (0.5시간)

**추가할 기능**:
```javascript
useEffect(() => {
  // 온라인/오프라인 감지
  const handleOnline = () => {
    logChatInfo('Network online, attempting to reconnect', { userId: user.id });
    
    if (socket && !socket.connected) {
      setConnectionStatus('connecting');
      socket.connect();
    }
  };
  
  const handleOffline = () => {
    const error = ChatConnectionException.networkOffline({
      userId: user.id
    });
    
    const errorInfo = handleChatError(error);
    
    setConnectionStatus('offline');
    setConnectionError(errorInfo);
    logChatWarning('Network offline detected', { userId: user.id });
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, [socket, user?.id]);
```

**구현할 내용**:
1. ✅ online 이벤트 리스너
2. ✅ offline 이벤트 리스너
3. ✅ 자동 재연결 시도

#### 작업 5: Context 값 확장

**현재**:
```javascript
const value = {
  socket,
  isConnected,
  user,
};
```

**개선**:
```javascript
const value = {
  socket,
  isConnected,
  user,
  connectionStatus, // 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'offline'
  connectionError,  // { code, message, retryable, timestamp } | null
  reconnectAttempt, // number
  manualReconnect, // () => void - 수동 재연결 함수
};
```

**구현할 내용**:
1. ✅ 새로운 상태들을 Context value에 추가
2. ✅ manualReconnect 함수 구현

---

### 3.2 useStudySocket.js 개선 (2시간)

**목표**: 채팅 소켓 훅 에러 처리 강화

#### 작업 1: sendMessage 에러 처리 (1시간)

**현재 문제**:
```javascript
const sendMessage = useCallback((content, fileId = null) => {
  if (!socket || !isConnected) return;
  
  socket.emit('chat:message', {
    studyId,
    content,
    fileId
  });
}, [socket, isConnected, studyId]);
```

**개선**:
```javascript
const sendMessage = useCallback(async (content, fileId = null) => {
  // 1. 연결 확인
  if (!socket || !isConnected) {
    const error = ChatConnectionException.serverUnreachable({
      studyId,
      action: 'sendMessage'
    });
    throw error;
  }
  
  // 2. 메시지 전송 (Promise 기반)
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(ChatMessageException.sendFailedNetwork({
        studyId,
        reason: 'Socket emit timeout'
      }));
    }, 5000);
    
    socket.emit('chat:message', {
      studyId,
      content,
      fileId
    }, (response) => {
      clearTimeout(timeout);
      
      if (response.error) {
        reject(ChatMessageException.sendFailedServer({
          studyId,
          error: response.error
        }));
      } else {
        resolve(response);
      }
    });
  });
}, [socket, isConnected, studyId]);
```

**구현할 내용**:
1. ✅ Promise 기반으로 변경
2. ✅ 타임아웃 처리 (5초)
3. ✅ 응답 에러 처리
4. ✅ 적절한 예외 throw

#### 작업 2: 메시지 중복 방지 (0.5시간)

**현재 문제**:
```javascript
socket.on('chat:new-message', (message) => {
  setNewMessage(message); // 중복 가능
});
```

**개선**:
```javascript
const [receivedMessageIds, setReceivedMessageIds] = useState(new Set());

socket.on('chat:new-message', (message) => {
  // 중복 확인
  if (receivedMessageIds.has(message.id)) {
    logChatWarning('Duplicate message ignored', {
      messageId: message.id,
      studyId
    });
    return;
  }
  
  // 새 메시지 처리
  setReceivedMessageIds(prev => new Set([...prev, message.id]));
  setNewMessage(message);
  
  // 메모리 관리: 최근 100개만 유지
  if (receivedMessageIds.size > 100) {
    const idsArray = Array.from(receivedMessageIds);
    setReceivedMessageIds(new Set(idsArray.slice(-100)));
  }
});
```

**구현할 내용**:
1. ✅ Set을 사용한 중복 감지
2. ✅ 메모리 관리 (최근 100개)
3. ✅ 중복 시 로깅

#### 작업 3: 타이핑 타이머 자동 정리 (0.5시간)

**개선**:
```javascript
// 타이핑 타이머 관리
const typingTimers = useRef(new Map());

socket.on('chat:user-typing', (data) => {
  if (data.isTyping) {
    // 타이핑 시작
    setTypingUsers(prev => {
      if (prev.find(u => u.userId === data.userId)) return prev;
      return [...prev, data];
    });
    
    // 기존 타이머 취소
    if (typingTimers.current.has(data.userId)) {
      clearTimeout(typingTimers.current.get(data.userId));
    }
    
    // 3초 후 자동 제거
    const timer = setTimeout(() => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      typingTimers.current.delete(data.userId);
    }, 3000);
    
    typingTimers.current.set(data.userId, timer);
  } else {
    // 타이핑 종료
    setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    
    if (typingTimers.current.has(data.userId)) {
      clearTimeout(typingTimers.current.get(data.userId));
      typingTimers.current.delete(data.userId);
    }
  }
});

// cleanup
return () => {
  typingTimers.current.forEach(timer => clearTimeout(timer));
  typingTimers.current.clear();
};
```

**구현할 내용**:
1. ✅ Map을 사용한 타이머 관리
2. ✅ 3초 후 자동 제거
3. ✅ cleanup 함수에서 모든 타이머 정리

---

## ✅ 완료 조건

- [ ] SocketContext.js 개선 완료
  - [ ] 연결 상태 상세화 (5가지 상태)
  - [ ] 에러 처리 강화 (5개 이벤트)
  - [ ] 타임아웃 처리 (30초)
  - [ ] 네트워크 상태 감지
  - [ ] Context 값 확장
  
- [ ] useStudySocket.js 개선 완료
  - [ ] sendMessage Promise 기반
  - [ ] 메시지 중복 방지
  - [ ] 타이핑 타이머 자동 정리
  
- [ ] 코드 검증
  - [ ] 에러 없음
  - [ ] JSDoc 주석 완비
  - [ ] 로깅 추가
  
- [ ] 문서 작성
  - [ ] PHASE3-COMPLETE.md 작성
  - [ ] PROGRESS-TRACKER.md 업데이트

---

## ➡️ 완료 후

작업 완료 시 AI가 자동으로:
1. ✅ 작업 완료 메시지 표시
2. ✅ Phase 4 프롬프트 생성 (API Routes 예외 처리)
3. ✅ 이 파일(EXCEPTION-IMPLEMENTATION-PROMPT.md)의 "실행 명령" 섹션을 Phase 4 프롬프트로 자동 업데이트

**다음 Phase**: Phase 4 - API Routes 예외 처리 (8시간)

시작해주세요!
```

---

## 🚀 지금 바로 시작하세요!

위의 "🎯 실행 명령" 섹션의 프롬프트를 복사하여 새 세션에서 사용하시면 됩니다.

**순차적 진행 경로**:
- ✅ Step 1 (문서 구조 생성)
- ✅ Step 2 (study 영역 완료)
- ✅ Step 3 (dashboard 영역 완료)
- ✅ Step 4 (my-studies 영역 완료 - 100%)
- ✅ Chat Phase 1 (분석 및 계획 - 8시간)
- ✅ Chat Phase 2 (예외 클래스/유틸리티 - 4시간)
- ✅ Chat Phase 3 (Socket 연결 예외 처리 - 6시간)
- ✅ Chat Phase 4 (컴포넌트 레벨 예외 처리 - 8시간)
- ✅ **Chat Phase 5 (서버 예외 처리 - 2시간)** ✅ **완료!**
- ⏳ Chat Phase 6 (통합 테스트 및 최종 검증 - 4시간) ← **다음**
- ⏳ notifications 영역 (예정)
- ⏳ profile 영역 (예정)

**Chat 영역 진행률**: 94% (28h/32h)

**Happy Coding! 🎉**


