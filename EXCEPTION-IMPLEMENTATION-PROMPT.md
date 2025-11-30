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

1. **현재 단계**: Step 2-3 (study 영역 분석)
2. **각 단계 완료 후**: AI가 자동으로 이 섹션을 다음 단계 프롬프트로 업데이트
3. **진행 추적**: `docs/exception/implement/PROGRESS-TRACKER.md` 확인

### 현재 세션 프롬프트 (Step 2-4)

**이 프롬프트로 새 세션을 시작하세요:**

```
안녕하세요! CoUp 예외 처리 구현 Step 2-4를 시작합니다.

**목표**: study 영역의 Critical 예외 처리 구현

**프로젝트 정보**:
- Next.js 16 App Router 기반
- JavaScript (ES6+) 전용
- Prisma ORM 사용

**이전 완료**: 
- Step 1 (문서 구조 생성) ✅
- Step 2-1 (auth 영역 분석) ✅
- Step 2-2 (auth 영역 Critical 구현) ✅
  - 4개 유틸리티 파일 생성
  - 4개 핵심 파일 예외 처리 강화
  - 50개 예외 처리 항목 구현
- Step 2-3 (study 영역 분석) ✅
  - 28개 API 라우트 분석 완료
  - ANALYSIS.md 작성 완료
  - 35개 구현됨, 85개 미구현 확인
  - 구현률: 29%

**현재 작업**: Step 2-4 - study 영역 Critical 구현

**참조 문서**:
- `docs/exception/implement/study/ANALYSIS.md` - study 분석 보고서
- `docs/exception/implement/auth/CODE-CHANGES.md` - auth 구현 예제 (템플릿)
- `docs/exception/studies/` - study 영역 예외 문서 (13개)
- `EXCEPTION-IMPLEMENTATION-PROMPT.md` - 전체 가이드

다음을 수행해주세요:

## 1. 유틸리티 파일 생성 (26시간)

ANALYSIS.md에서 "필요한 유틸리티 - 생성 필요" 섹션을 참고하여 6개 파일을 생성하세요.

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
}

/**
 * 스터디 에러 응답 생성
 */
export function createStudyErrorResponse(errorKey, customMessage = null) {
  const error = STUDY_ERRORS[errorKey] || STUDY_ERRORS.UNKNOWN_ERROR
  
  return {
    code: error.code,
    message: customMessage || error.message,
    statusCode: error.statusCode
  }
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
  })
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
```

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

## 🎯 실행 명령

### ⚠️ 중요 안내

**이 프로젝트는 단계별로 진행됩니다!**

1. **현재 단계**: Step 2-4 (study 영역 Critical 구현)
2. **각 단계 완료 후**: AI가 자동으로 이 섹션을 다음 단계 프롬프트로 업데이트
3. **진행 추적**: `docs/exception/implement/PROGRESS-TRACKER.md` 확인

### 현재 세션 프롬프트 (Step 2-5)

**이 프롬프트로 새 세션을 시작하세요:**

```
안녕하세요! CoUp 예외 처리 구현 Step 2-5를 시작합니다.

**목표**: dashboard 영역의 예외 처리 분석 (다음 단계)

(Step 2-4 완료 후 자동으로 업데이트됩니다)

### 1.1 API 라우트 분석
다음 파일들의 예외 처리 현황을 분석하세요:

- `coup/src/app/api/studies/route.js`
  - GET: 스터디 목록 조회
  - POST: 스터디 생성
  
- `coup/src/app/api/studies/[id]/route.js`
  - GET: 스터디 상세 조회
  - PUT: 스터디 수정
  - DELETE: 스터디 삭제

- `coup/src/app/api/studies/[id]/join/route.js`
  - POST: 스터디 가입 신청

- `coup/src/app/api/studies/[id]/leave/route.js`
  - POST: 스터디 탈퇴

- `coup/src/app/api/studies/[id]/members/route.js`
  - GET: 멤버 목록 조회
  - PUT: 멤버 역할 변경
  - DELETE: 멤버 강제 퇴출

- 기타 study 관련 API 라우트

**분석 항목**:
- 현재 구현된 예외 처리
- 누락된 예외 처리
- 개선이 필요한 예외 처리
- 참조하는 예외 문서 매칭

### 1.2 라이브러리 및 헬퍼 분석
study 관련 유틸리티 파일 확인

### 1.3 컴포넌트 분석 (간략)
주요 study 페이지 및 컴포넌트의 에러 처리 확인

## 2. ANALYSIS.md 작성 (4시간)

`docs/exception/implement/study/ANALYSIS.md` 파일을 생성하세요.

**구조** (auth/ANALYSIS.md 템플릿 사용):

```markdown
# study 영역 분석 보고서

**상태**: ✅ 완료  
**분석자**: GitHub Copilot  
**분석일**: 2025-11-30  
**영역**: 스터디 관리 (Study Management)

---

## 📊 분석 개요

- **분석 일자**: 2025-11-30
- **대상 파일**: [N]개
- **문서화된 예외**: 약 [N]개 (13개 문서)
- **구현된 예외**: 약 [N]개
- **구현률**: 약 [N]%

### 분석 범위
- ✅ 스터디 생성/수정/삭제
- ✅ 스터디 가입/탈퇴
- ✅ 멤버 관리
- ✅ 권한 관리
- ✅ 상태 관리

---

## 📁 분석 대상 파일

### API 라우트 ([N]개)
- `coup/src/app/api/studies/route.js` - 스터디 CRUD
- ...

### 라이브러리 ([N]개)
- ...

---

## 🔍 예외 처리 현황

### 구현됨 ✅ ([N]개)

| 번호 | 예외 상황 | 파일 | 구현 위치 | 품질 |
|------|---------|------|----------|------|
| 1 | ... | ... | ... | ⭐⭐⭐ |

### 미구현 ❌ ([N]개)

#### Critical - 즉시 구현 필요 ([N]개)

| 번호 | 예외 상황 | 영향도 | 우선순위 | 예상 시간 |
|------|---------|--------|---------|----------|
| 1 | ... | HIGH | P0 | 2시간 |

#### Important - 조만간 구현 필요 ([N]개)
#### Nice-to-Have - 추후 구현 고려 ([N]개)
#### Edge Cases - 희귀 케이스 ([N]개)

---

## 📋 구현 계획

### Phase 1: Critical (Week [N])
...

---

**작성자**: GitHub Copilot
```

**상세 분석 내용**:
- 각 예외 항목마다 현재 구현 상태
- 참조 문서 매칭
- 품질 평가 (⭐⭐⭐ 우수 / ⭐⭐ 양호 / ⭐ 미흡)
- 개선 방향
- 예상 소요 시간

## 3. 우선순위 분류 기준

### Critical (P0)
- 보안 취약점
- 데이터 손실 가능성
- 시스템 장애 가능성

### Important (P1)
- 사용자 경험 저하
- 빈번한 오류

### Nice-to-Have (P2)
- 기능 향상
- 일반적 엣지 케이스

### Edge Cases (P3)
- 매우 드문 상황

## 4. 통계 및 요약 작성

분석 완료 후 다음 통계를 작성하세요:

- 총 파일 수
- 총 예외 수 (문서화 vs 구현)
- 구현률 (%)
- Phase별 예상 소요 시간
- 우선순위별 분포

## ✅ 완료 조건

- [ ] study 관련 모든 API 라우트 파일 분석 완료
- [ ] 구현된 예외 목록 작성 (표 형식)
- [ ] 미구현 예외 목록 작성 (4단계 우선순위 분류)
- [ ] 각 예외 항목에 참조 문서 매칭
- [ ] Phase별 구현 계획 작성
- [ ] 통계 및 요약 작성
- [ ] ANALYSIS.md 파일 생성 완료 (1,500줄 이상)

## ➡️ 완료 후

작업 완료 시 AI가 자동으로:
1. 분석 완료 메시지 표시
2. 통계 요약 표시
3. Step 2-4 프롬프트 생성 (study 영역 Critical 구현)
4. 이 파일의 "실행 명령" 섹션을 Step 2-4 프롬프트로 자동 업데이트

**중요**: 
- auth/ANALYSIS.md를 템플릿으로 사용하세요
- 동일한 품질과 상세도를 유지하세요
- 모든 예외 항목에 시간 산정을 포함하세요

시작해주세요!
```
  - Critical 12개 항목 식별

**현재 작업**: Step 2-2 - auth 영역 Critical 예외 처리 구현

**참조 문서**:
- `docs/exception/implement/auth/ANALYSIS.md` - 분석 보고서
- `docs/exception/auth/01-credentials-login-exceptions.md` - 로그인 예외
- `docs/exception/auth/03-session-management-exceptions.md` - 세션 예외
- `EXCEPTION-IMPLEMENTATION-PROMPT.md` - 코드 작성 가이드

다음을 수행해주세요:

## 1. 필수 유틸리티 생성 (18시간)

### 1.1 coup/src/lib/exceptions/auth-errors.js (4시간)
```javascript
/**
 * 인증 예외 처리 헬퍼
 * @module lib/exceptions/auth-errors
 */

export class AuthError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.statusCode = statusCode
  }
}

export const AUTH_ERRORS = {
  // 인증 실패
  INVALID_CREDENTIALS: {
    code: 'AUTH_001',
    message: '이메일 또는 비밀번호가 일치하지 않습니다',
    statusCode: 401
  },
  MISSING_CREDENTIALS: {
    code: 'AUTH_002',
    message: '이메일과 비밀번호를 입력해주세요',
    statusCode: 400
  },
  SOCIAL_ACCOUNT: {
    code: 'AUTH_003',
    message: '소셜 로그인 계정입니다. 해당 방법으로 로그인해주세요',
    statusCode: 400
  },
  
  // 계정 상태
  ACCOUNT_DELETED: {
    code: 'AUTH_004',
    message: '삭제된 계정입니다',
    statusCode: 403
  },
  ACCOUNT_SUSPENDED: {
    code: 'AUTH_005',
    message: '정지된 계정입니다',
    statusCode: 403
  },
  
  // 세션
  NO_SESSION: {
    code: 'AUTH_006',
    message: '로그인이 필요합니다',
    statusCode: 401
  },
  SESSION_EXPIRED: {
    code: 'AUTH_007',
    message: '세션이 만료되었습니다',
    statusCode: 401
  },
  INVALID_SESSION: {
    code: 'AUTH_008',
    message: '유효하지 않은 세션입니다',
    statusCode: 401
  },
  
  // 권한
  INSUFFICIENT_PERMISSION: {
    code: 'AUTH_009',
    message: '권한이 없습니다',
    statusCode: 403
  },
  
  // Rate Limiting
  TOO_MANY_ATTEMPTS: {
    code: 'AUTH_010',
    message: '로그인 시도 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요',
    statusCode: 429
  },
}

/**
 * API 에러 응답 생성
 */
export function createAuthErrorResponse(errorCode, details = null) {
  const error = AUTH_ERRORS[errorCode]
  if (!error) {
    return {
      error: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다',
      statusCode: 500
    }
  }
  
  return {
    error: error.code,
    message: error.message,
    details,
    statusCode: error.statusCode
  }
}
```

### 1.2 coup/src/lib/validators/auth-validation.js (3시간)
```javascript
import { z } from 'zod'

/**
 * 이메일 검증 스키마
 */
export const emailSchema = z.string()
  .trim()
  .toLowerCase()
  .email('올바른 이메일 형식이 아닙니다')
  .min(5, '이메일은 최소 5자 이상이어야 합니다')
  .max(100, '이메일은 최대 100자까지 가능합니다')

/**
 * 비밀번호 검증 스키마 (기본)
 */
export const passwordSchema = z.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .max(100, '비밀번호는 최대 100자까지 가능합니다')

/**
 * 비밀번호 검증 스키마 (강화)
 */
export const strongPasswordSchema = z.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .max(100, '비밀번호는 최대 100자까지 가능합니다')
  .regex(/[a-z]/, '소문자를 최소 1개 포함해야 합니다')
  .regex(/[A-Z]/, '대문자를 최소 1개 포함해야 합니다')
  .regex(/[0-9]/, '숫자를 최소 1개 포함해야 합니다')
  .regex(/[^a-zA-Z0-9]/, '특수문자를 최소 1개 포함해야 합니다')

/**
 * 이름 검증 스키마
 */
export const nameSchema = z.string()
  .trim()
  .min(2, '이름은 최소 2자 이상이어야 합니다')
  .max(50, '이름은 최대 50자까지 가능합니다')
  .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글 또는 영문만 사용 가능합니다')

/**
 * 로그인 데이터 검증
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

/**
 * 회원가입 데이터 검증
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  avatar: z.string().url().optional().nullable()
})

/**
 * 이메일 정규화
 */
export function normalizeEmail(email) {
  if (!email) return null
  return email.trim().toLowerCase()
}

/**
 * 세션 검증
 */
export function validateSession(session) {
  if (!session) {
    throw new Error('AUTH_006') // NO_SESSION
  }
  
  if (!session.user || !session.user.id) {
    throw new Error('AUTH_008') // INVALID_SESSION
  }
  
  return true
}
```

### 1.3 coup/src/lib/rate-limit.js (4시간)
```javascript
/**
 * Rate Limiting 구현
 * IP 기반 요청 제한
 */

const attempts = new Map()

/**
 * Rate limit 확인
 * @param {string} key - 식별 키 (IP, 이메일 등)
 * @param {number} maxAttempts - 최대 시도 횟수
 * @param {number} windowMs - 시간 윈도우 (밀리초)
 * @returns {boolean} 제한 초과 여부
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 5 * 60 * 1000) {
  const now = Date.now()
  const userAttempts = attempts.get(key) || []
  
  // 시간 윈도우 내 시도만 필터링
  const recentAttempts = userAttempts.filter(time => now - time < windowMs)
  
  // 제한 초과 확인
  if (recentAttempts.length >= maxAttempts) {
    return true // 제한 초과
  }
  
  // 새 시도 추가
  recentAttempts.push(now)
  attempts.set(key, recentAttempts)
  
  return false // 정상
}

/**
 * Rate limit 초기화
 */
export function resetRateLimit(key) {
  attempts.delete(key)
}

/**
 * 남은 시도 횟수 조회
 */
export function getRemainingAttempts(key, maxAttempts = 5, windowMs = 5 * 60 * 1000) {
  const now = Date.now()
  const userAttempts = attempts.get(key) || []
  const recentAttempts = userAttempts.filter(time => now - time < windowMs)
  
  return Math.max(0, maxAttempts - recentAttempts.length)
}

/**
 * 다음 시도 가능 시간 (밀리초)
 */
export function getRetryAfter(key, windowMs = 5 * 60 * 1000) {
  const now = Date.now()
  const userAttempts = attempts.get(key) || []
  
  if (userAttempts.length === 0) return 0
  
  const oldestAttempt = Math.min(...userAttempts)
  const retryAfter = (oldestAttempt + windowMs) - now
  
  return Math.max(0, retryAfter)
}

/**
 * 주기적으로 오래된 데이터 정리 (메모리 관리)
 */
setInterval(() => {
  const now = Date.now()
  const maxAge = 60 * 60 * 1000 // 1시간
  
  for (const [key, times] of attempts.entries()) {
    const recentTimes = times.filter(time => now - time < maxAge)
    if (recentTimes.length === 0) {
      attempts.delete(key)
    } else {
      attempts.set(key, recentTimes)
    }
  }
}, 15 * 60 * 1000) // 15분마다 실행
```

### 1.4 coup/src/lib/logger.js (3시간)
```javascript
/**
 * 구조화된 로깅 및 민감 정보 마스킹
 */

const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken']

/**
 * 민감 정보 마스킹
 */
function maskSensitiveData(data) {
  if (!data || typeof data !== 'object') return data
  
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item))
  }
  
  const masked = { ...data }
  
  for (const key in masked) {
    const lowerKey = key.toLowerCase()
    
    // 민감 필드 마스킹
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      masked[key] = '***MASKED***'
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key])
    }
  }
  
  return masked
}

/**
 * 로거
 */
export const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data ? maskSensitiveData(data) : '')
  },
  
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data ? maskSensitiveData(data) : '')
  },
  
  error: (message, error, data) => {
    console.error(`[ERROR] ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      data: data ? maskSensitiveData(data) : undefined
    })
  },
  
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data ? maskSensitiveData(data) : '')
    }
  }
}
```

### 1.5 coup/src/utils/crypto-helpers.js (2시간)
```javascript
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

/**
 * 비밀번호 해싱
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

/**
 * 비밀번호 비교
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

/**
 * 랜덤 토큰 생성
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * UUID 생성
 */
export function generateUUID() {
  return crypto.randomUUID()
}
```

### 1.6 coup/src/middleware/auth-middleware.js (2시간)
```javascript
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { createAuthErrorResponse } from '@/lib/exceptions/auth-errors'

/**
 * API 라우트 인증 미들웨어
 */
export function withAuth(handler) {
  return async (request, context) => {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      const error = createAuthErrorResponse('NO_SESSION')
      return NextResponse.json(
        { error: error.error, message: error.message },
        { status: error.statusCode }
      )
    }
    
    // 세션을 context에 추가
    return handler(request, { ...context, session })
  }
}

/**
 * 관리자 권한 확인 미들웨어
 */
export function withAdminAuth(handler) {
  return async (request, context) => {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      const error = createAuthErrorResponse('NO_SESSION')
      return NextResponse.json(
        { error: error.error, message: error.message },
        { status: error.statusCode }
      )
    }
    
    if (!session.user.isAdmin) {
      const error = createAuthErrorResponse('INSUFFICIENT_PERMISSION')
      return NextResponse.json(
        { error: error.error, message: error.message },
        { status: error.statusCode }
      )
    }
    
    return handler(request, { ...context, session })
  }
}
```

## 2. 기존 파일 개선 (12시간)

### 2.1 coup/src/lib/auth.js 수정 (4시간)

**개선 사항**:
1. 이메일 정규화 (trim, toLowerCase)
2. 민감 정보 로깅 제거 (비밀번호 마스킹)
3. Rate limiting 적용
4. 에러 처리 통일
5. 로거 사용

**수정할 부분**:
```javascript
// Before
async authorize(credentials) {
  console.log('🔐 [AUTH] credentials:', { email: credentials?.email, hasPassword: !!credentials?.password })
  
  if (!credentials?.email || !credentials?.password) {
    throw new Error("이메일과 비밀번호를 입력해주세요.")
  }

// After
import { normalizeEmail } from '@/lib/validators/auth-validation'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { AUTH_ERRORS } from '@/lib/exceptions/auth-errors'

async authorize(credentials) {
  logger.info('로그인 시도', { email: credentials?.email, hasPassword: !!credentials?.password })
  
  // 입력 검증
  if (!credentials?.email || !credentials?.password) {
    logger.warn('로그인 실패: 입력 누락')
    throw new Error(AUTH_ERRORS.MISSING_CREDENTIALS.message)
  }
  
  // 이메일 정규화
  const email = normalizeEmail(credentials.email)
  
  // Rate Limiting 체크
  const ipKey = `login:${email}`
  if (checkRateLimit(ipKey, 5, 5 * 60 * 1000)) {
    logger.warn('Rate limit 초과', { email })
    throw new Error(AUTH_ERRORS.TOO_MANY_ATTEMPTS.message)
  }
  
  // ... 나머지 로직
}
```

### 2.2 coup/src/app/api/auth/signup/route.js 수정 (3시간)

**개선 사항**:
1. 유효성 검사 분리 (auth-validation.js 사용)
2. Rate limiting 추가
3. 에러 처리 개선
4. 이메일 정규화

### 2.3 coup/src/lib/auth-helpers.js 수정 (2시간)

**개선 사항**:
1. 에러 응답 통일 (auth-errors.js 사용)
2. 로깅 개선
3. JSDoc 추가

### 2.4 coup/middleware.js 수정 (3시간)

**개선 사항**:
1. JWT 토큰 만료 감지
2. 사용자 상태 실시간 확인
3. 보호된 경로 세분화

## 3. 테스트 작성 (선택사항, 추후)

각 유틸리티에 대한 단위 테스트 작성

## 4. 문서 업데이트

### 4.1 CODE-CHANGES.md 작성
생성/수정된 모든 파일 목록과 변경 내용 기록

### 4.2 TODO.md 업데이트
완료된 항목 체크

### 4.3 PROGRESS-TRACKER.md 업데이트
Step 2-2 완료 상태 업데이트

## ✅ 완료 조건

- [ ] 6개 유틸리티 파일 생성 완료
- [ ] 4개 기존 파일 개선 완료
- [ ] 모든 파일에 JSDoc 주석 추가
- [ ] logger를 사용하여 민감 정보 마스킹
- [ ] Rate limiting 적용
- [ ] CODE-CHANGES.md 작성
- [ ] TODO.md 업데이트
- [ ] PROGRESS-TRACKER.md 업데이트

## ➡️ 완료 후

작업 완료 시 AI가 자동으로:
1. 작업 완료 메시지 표시
2. Step 2-3 프롬프트 생성 (dashboard 분석)
3. 이 파일의 "실행 명령" 섹션을 Step 2-3 프롬프트로 자동 업데이트

**중요**: AI가 `replace_string_in_file` 도구를 사용하여 이 파일을 자동으로 업데이트하므로, 사용자는 별도의 작업이 필요 없습니다!

시작해주세요!
```

---

### 📌 중요: 단계별 프롬프트 자동 업데이트

**각 Step 완료 시 AI가 자동으로 수행:**

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

3. **이 문서 자동 업데이트**
   - `replace_string_in_file` 도구 사용
   - "실행 명령" 섹션을 새 프롬프트로 교체
   - 사용자에게 완료 알림

### 자동 업데이트 프로세스

```
✅ Step N 완료!

이제 EXCEPTION-IMPLEMENTATION-PROMPT.md의 '실행 명령' 섹션을 
Step N+1 프롬프트로 자동 업데이트합니다...

[replace_string_in_file 실행]

✅ 업데이트 완료!
새 세션에서 이 파일을 열어 "실행 명령" 섹션의 프롬프트를 사용하세요.
```

**사용자 작업:**
1. 새 세션 시작
2. 이 파일 열기
3. "실행 명령" 섹션의 프롬프트 복사
4. 세션에 붙여넣기

**추가 작업 불필요:**
- ❌ 프롬프트 수동 작성
- ❌ 파일 수동 수정
- ✅ AI가 모두 자동 처리

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

