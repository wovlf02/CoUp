# CoUp 예외 처리 구현 - 단계별 프롬프트 참조

**프로젝트**: CoUp - 예외 처리 구현  
**목적**: 각 단계별 프롬프트 예시 및 참조 자료 제공  
**작성일**: 2025-11-30  
**버전**: 2.0.0

---

## ⚠️ 중요 안내

이 문서는 **참조용**입니다. 실제 세션 시작 시에는 `EXCEPTION-IMPLEMENTATION-PROMPT.md`의 "실행 명령" 섹션 프롬프트를 사용하세요.

### 프롬프트 자동 업데이트 시스템

**실제 작동 방식:**

1. **세션에서 Step 완료** → AI가 다음 Step 프롬프트 자동 생성
2. **AI가 업데이트 지시** → "EXCEPTION-IMPLEMENTATION-PROMPT.md 업데이트해주세요"
3. **사용자가 문서 업데이트** → "실행 명령" 섹션 프롬프트 교체
4. **새 세션 시작** → 업데이트된 프롬프트 사용

**이 문서의 역할:**
- ✅ 각 Step별 프롬프트 형식 참조
- ✅ 필요한 내용 요소 확인
- ✅ 예시 템플릿 제공
- ❌ 직접 복사해서 사용 (X)

### 올바른 사용 방법

```
❌ 잘못된 방법:
   NEXT-SESSION-PROMPT.md에서 프롬프트 복사 → 새 세션

✅ 올바른 방법:
   1. 현재 세션에서 Step 완료
   2. AI가 생성한 새 프롬프트 확인
   3. EXCEPTION-IMPLEMENTATION-PROMPT.md 업데이트
   4. 업데이트된 프롬프트로 새 세션 시작
```

---

## 🎯 프롬프트 품질 기준

AI가 생성하는 모든 프롬프트는 다음을 포함해야 합니다:

### 필수 요소
- 📋 **목표** - 명확한 작업 목표 설명
- ✅ **이전 완료** - 이전 Step 완료 확인 (예: "Step 1 완료 ✅")
- 🎯 **현재 작업** - 현재 Step 구체적 설명
- 📝 **상세 절차** - 1-5단계로 나눈 작업 지시
- 📁 **참조 문서** - 템플릿/예제 파일 경로
- ✅ **완료 조건** - 체크리스트 형태
- ➡️ **완료 후** - 다음 프롬프트 업데이트 지시

### 형식 예시

```
안녕하세요! CoUp 예외 처리 구현 Step [N]을 시작합니다.

**목표**: [명확한 목표]

**프로젝트 정보**:
- Next.js 16 App Router 기반
- JavaScript (ES6+) 전용
- Prisma ORM 사용
- NextAuth.js v5 인증

**이전 완료**: Step [N-1] ([작업명]) ✅
- [완료 항목 1]
- [완료 항목 2]
- [완료 항목 3]

**현재 작업**: Step [N] - [구체적 작업명]

다음을 수행해주세요:

1. [첫 번째 작업]
   - 상세 설명
   - 참조: [파일 경로]

2. [두 번째 작업]
   - 상세 설명
   - 참조: [파일 경로]

[... 나머지 작업들]

**완료 조건**:
- [ ] [체크 항목 1]
- [ ] [체크 항목 2]
- [ ] [체크 항목 3]

**완료 후**:
작업 완료 메시지와 함께 다음 단계 프롬프트를 생성하세요:

"✅ Step [N] 완료!

다음 단계를 위해 EXCEPTION-IMPLEMENTATION-PROMPT.md의 '실행 명령' 섹션을
아래 프롬프트로 업데이트해주세요:"

[Step N+1의 새 프롬프트 생성]

시작해주세요!
```

---

## 🎯 전체 로드맵

| 단계 | 작업 내용 | 예상 기간 | 산출물 |
|------|-----------|-----------|--------|
| Step 1 | 구현 문서 구조 생성 | 1-2 세션 | 기본 폴더 및 템플릿 문서 |
| Step 2 | 영역별 분석 (10개) | 10-15 세션 | ANALYSIS.md × 10 |
| Step 3 | Phase별 구현 계획 | 10-15 세션 | PHASE-XX.md × 40 |
| Step 4 | TODO 리스트 생성 | 2-3 세션 | TODO.md × 11 |
| Step 5 | 실제 코드 구현 | 50+ 세션 | 코드 + 테스트 |

---

---

# 📋 Step 1: 구현 문서 구조 생성

## 현재 상태 확인

이 단계를 시작하기 전에 확인:
- ✅ `EXCEPTION-IMPLEMENTATION-PROMPT.md` 검토 완료
- ✅ 프로젝트 전체 구조 이해
- ✅ `docs/exception/` 문서화 내용 확인

## 작업 목표

`docs/exception/implement/` 폴더 구조 생성 및 기본 문서 작성

### 생성할 파일

```
docs/exception/implement/
├── README.md                      # 프로젝트 개요 (300줄)
├── TODO.md                        # 전체 TODO 템플릿 (500줄)
├── IMPLEMENTATION-GUIDE.md        # 구현 가이드 (600줄)
├── PROGRESS-TRACKER.md            # 진행 상황 추적 (400줄)
│
└── [10개 영역 폴더]/
    ├── auth/
    ├── dashboard/
    ├── studies/
    ├── my-studies/
    ├── chat/
    ├── notifications/
    ├── profile/
    ├── settings/
    ├── search/
    └── admin/

각 영역별 기본 문서 (9개 × 10 = 90개):
├── README.md                  # 영역 개요
├── ANALYSIS.md               # 현재 코드 분석 (템플릿)
├── PHASE-01-CRITICAL.md      # Critical 구현 (템플릿)
├── PHASE-02-HIGH.md          # High 구현 (템플릿)
├── PHASE-03-MEDIUM.md        # Medium 구현 (템플릿)
├── PHASE-04-LOW.md           # Low 구현 (템플릿)
├── IMPLEMENTATION-PLAN.md    # 구현 계획 (템플릿)
├── CODE-CHANGES.md           # 코드 변경사항 (템플릿)
└── TODO.md                   # 영역별 TODO (템플릿)
```

## ✅ 완료 조건

- [ ] `docs/exception/implement/` 폴더 생성
- [ ] 4개 기본 문서 작성 완료
- [ ] 10개 영역 폴더 생성
- [ ] 각 영역별 9개 템플릿 문서 생성 (총 90개)
- [ ] PROGRESS-TRACKER.md에 Step 1 완료 체크

## 🚀 다음 세션 프롬프트 (Step 1)

```
안녕하세요! CoUp 예외 처리 구현 프로젝트를 시작합니다.

**현재 단계**: Step 1 - 구현 문서 구조 생성

**참조 문서**:
- C:\Project\CoUp\EXCEPTION-IMPLEMENTATION-PROMPT.md (전체 프로젝트 개요)
- C:\Project\CoUp\docs\exception\NEXT-SESSION-PROMPT.md (단계별 가이드)

**작업 목표**:
1. docs/exception/implement/ 폴더 생성
2. 기본 문서 4개 작성:
   - README.md (프로젝트 개요)
   - TODO.md (전체 TODO 템플릿)
   - IMPLEMENTATION-GUIDE.md (구현 가이드라인)
   - PROGRESS-TRACKER.md (진행 상황 추적)

3. 10개 영역 폴더 생성:
   - auth, dashboard, studies, my-studies, chat
   - notifications, profile, settings, search, admin

4. 각 영역별 9개 템플릿 문서 생성 (총 90개)

**템플릿 참조**:
EXCEPTION-IMPLEMENTATION-PROMPT.md의 Step 1, Step 2 섹션 참조

**중요**:
- 모든 문서는 템플릿 형태로 작성 (실제 내용은 Step 2에서 작성)
- README.md는 EXCEPTION-IMPLEMENTATION-PROMPT.md의 "프로젝트 개요" 섹션 기반
- IMPLEMENTATION-GUIDE.md는 "작업 가이드라인" 섹션 기반
- TODO.md는 "전체 TODO.md" 템플릿 기반

시작해주세요!
```

---

# 📋 Step 2: 영역별 분석 작업

## 현재 상태 확인

이 단계를 시작하기 전에 확인:
- ✅ Step 1 완료: 문서 구조 생성 완료
- ✅ `docs/exception/implement/` 폴더 및 기본 문서 존재
- ✅ 10개 영역별 폴더 및 템플릿 생성 완료

## 작업 목표

각 영역마다 현재 코드와 문서화된 예외를 비교 분석하여 ANALYSIS.md 작성

### 분석 순서 (우선순위)

1. **auth** (Phase 0) - 인증 기반, 최우선
2. **dashboard** (Phase 1) - 메인 화면
3. **admin** (Phase 9) - 관리자, Critical 많음
4. **studies** (Phase 2) - 핵심 기능
5. **my-studies** (Phase 3) - 핵심 기능
6. **chat** (Phase 4) - 실시간 기능
7. **notifications** (Phase 5) - 실시간 기능
8. **profile** (Phase 6) - 사용자 기능
9. **settings** (Phase 7) - 설정
10. **search** (Phase 8) - 검색/필터

### 각 영역별 분석 내용

1. **문서 분석**
   - `docs/exception/[영역]/` 폴더의 모든 문서 읽기
   - 정의된 모든 예외 코드 추출
   - 심각도별, 빈도별 분류

2. **현재 코드 분석**
   - `coup/src/app/[영역]/` 페이지 컴포넌트
   - `coup/src/app/api/[영역]/` API 라우트
   - `coup/src/components/[영역]/` 컴포넌트
   - 현재 구현된 예외 처리 확인

3. **Gap 분석**
   - 문서화 vs 구현 비교
   - 미구현 예외 목록
   - 필요한 유틸리티 파일

## ✅ 완료 조건 (영역당)

- [ ] docs/exception/[영역]/ 문서 전체 분석
- [ ] coup/src/app/[영역]/ 코드 전체 검토
- [ ] ANALYSIS.md 작성 완료
- [ ] 구현/미구현/부분구현 분류
- [ ] 필요한 작업 목록 작성

## 🚀 다음 세션 프롬프트 (Step 2-1: auth 분석)

```
안녕하세요! CoUp 예외 처리 구현 Step 2를 시작합니다.

**현재 단계**: Step 2-1 - auth 영역 분석

**이전 완료**: Step 1 (문서 구조 생성) ✅

**작업 목표**:
docs/exception/implement/auth/ANALYSIS.md 작성

**분석 절차**:

1. 문서 분석
   - docs/exception/auth/ 폴더의 모든 문서 읽기
   - INDEX.md에서 예외 코드 전체 추출
   - 각 문서에서 상세 내용 확인

2. 현재 코드 분석
   다음 파일들 검토:
   - coup/src/app/(auth)/ (로그인/회원가입)
   - coup/src/app/api/auth/ (NextAuth API)
   - coup/src/lib/auth/ (인증 관련 유틸)
   - coup/src/components/ 중 auth 관련 컴포넌트

3. ANALYSIS.md 작성
   템플릿: EXCEPTION-IMPLEMENTATION-PROMPT.md의 "2.4 ANALYSIS.md 작성" 참조
   
   포함 내용:
   - 📊 분석 개요 (파일 수, 예외 수, 구현률)
   - 📁 분석 대상 파일 목록
   - 🔍 예외 처리 현황 (구현됨/미구현/부분구현)
   - 📋 필요한 작업 (Critical → Low)
   - 🛠️ 필요한 유틸리티
   - 📊 구현 우선순위
   - 📝 특이사항

**참조 문서**:
- docs/exception/auth/README.md
- docs/exception/auth/INDEX.md
- EXCEPTION-IMPLEMENTATION-PROMPT.md (Step 2 섹션)

**완료 후**:
- implement/auth/ANALYSIS.md 생성 확인
- PROGRESS-TRACKER.md 업데이트
- 다음: Step 2-2 (dashboard 분석) 프롬프트 사용

시작해주세요!
```

## 🚀 다음 세션 프롬프트 (Step 2-2 ~ 2-10: 나머지 영역)

각 영역 완료 후 다음 프롬프트 사용 (영역명만 변경):

```
안녕하세요! Step 2-[N] - [영역명] 영역 분석을 시작합니다.

**이전 완료**: Step 2-[N-1] ([이전영역]) 분석 ✅

**현재 작업**: docs/exception/implement/[영역]/ANALYSIS.md 작성

**분석 대상**:
- 문서: docs/exception/[영역]/
- 코드: coup/src/app/[영역]/, coup/src/app/api/[영역]/

**절차**:
1. 문서 분석 (예외 코드 추출)
2. 코드 분석 (현재 구현 확인)
3. Gap 분석 (미구현 목록)
4. ANALYSIS.md 작성

템플릿은 implement/auth/ANALYSIS.md 참조

시작해주세요!
```

---

# 📋 Step 3: Phase별 구현 계획 수립

## 현재 상태 확인

이 단계를 시작하기 전에 확인:
- ✅ Step 2 완료: 10개 영역 ANALYSIS.md 작성 완료
- ✅ 모든 예외 코드의 구현/미구현 상태 파악
- ✅ 필요한 작업 목록 작성 완료

## 작업 목표

각 영역마다 4개의 Phase 문서 작성 (심각도별 구현 계획)

### Phase 구조

각 영역당 4개 문서:
1. **PHASE-01-CRITICAL.md** - Critical 심각도 예외 구현
2. **PHASE-02-HIGH.md** - High 심각도 예외 구현
3. **PHASE-03-MEDIUM.md** - Medium 심각도 예외 구현
4. **PHASE-04-LOW.md** - Low 심각도 예외 구현

총: 10개 영역 × 4개 Phase = 40개 문서

### 각 Phase 문서 내용

1. **목표** (예상 기간, 예외 개수)
2. **구현 목록** (각 예외별):
   - 문서 참조
   - 현재 상태 (코드)
   - 구현 계획 (코드)
   - 추가 파일
   - 테스트 계획
   - 체크리스트
3. **진행 상황 표**
4. **완료 조건**

## ✅ 완료 조건 (영역당)

- [ ] ANALYSIS.md 기반으로 예외 분류
- [ ] 4개 Phase 문서 작성
- [ ] 각 예외별 상세 구현 계획 작성
- [ ] 필요한 파일 목록 작성
- [ ] 테스트 계획 수립

## 🚀 다음 세션 프롬프트 (Step 3-1: auth Phase 작성)

```
안녕하세요! Step 3-1 - auth 영역 Phase별 구현 계획을 작성합니다.

**현재 단계**: Step 3-1 - auth Phase 문서 작성

**이전 완료**: Step 2 (10개 영역 분석) ✅

**작업 목표**:
implement/auth/ 폴더에 4개 Phase 문서 작성

**참조 문서**:
- implement/auth/ANALYSIS.md (분석 결과)
- docs/exception/auth/ (예외 상세 문서)
- EXCEPTION-IMPLEMENTATION-PROMPT.md (Step 3 섹션, 템플릿)

**작성할 문서**:

1. PHASE-01-CRITICAL.md
   - ANALYSIS.md의 "Critical" 예외 목록 확인
   - 각 예외별 상세 구현 계획 작성
   - 템플릿: EXCEPTION-IMPLEMENTATION-PROMPT.md의 "3.1" 참조

2. PHASE-02-HIGH.md
   - High 심각도 예외 구현 계획

3. PHASE-03-MEDIUM.md
   - Medium 심각도 예외 구현 계획

4. PHASE-04-LOW.md
   - Low 심각도 예외 구현 계획

**각 예외별 포함 내용**:
- 예외 코드 및 설명
- 문서 참조 링크
- 현재 상태 (코드 스니펫)
- 구현 계획 (코드 스니펫)
- 추가 파일 목록
- 테스트 계획
- 체크리스트

**완료 후**:
- 4개 Phase 문서 생성 확인
- PROGRESS-TRACKER.md 업데이트
- 다음: Step 3-2 (dashboard) 프롬프트 사용

시작해주세요!
```

## 🚀 다음 세션 프롬프트 (Step 3-2 ~ 3-10: 나머지 영역)

```
안녕하세요! Step 3-[N] - [영역명] Phase별 구현 계획을 작성합니다.

**이전 완료**: Step 3-[N-1] ([이전영역] Phase 문서) ✅

**현재 작업**: implement/[영역]/PHASE-01~04.md (4개) 작성

**참조**:
- implement/[영역]/ANALYSIS.md
- docs/exception/[영역]/
- implement/auth/PHASE-01-CRITICAL.md (템플릿 참조)

**절차**:
1. ANALYSIS.md에서 심각도별 예외 확인
2. 각 Phase 문서 작성 (Critical → Low)
3. 예외별 상세 구현 계획 작성

시작해주세요!
```

---

# 📋 Step 4: TODO 리스트 생성

## 현재 상태 확인

이 단계를 시작하기 전에 확인:
- ✅ Step 3 완료: 40개 Phase 문서 작성 완료
- ✅ 모든 예외의 구현 계획 수립 완료
- ✅ 필요한 파일 및 테스트 목록 작성 완료

## 작업 목표

Phase 문서를 기반으로 실행 가능한 TODO 리스트 생성

### 생성할 TODO

1. **영역별 TODO** (10개)
   - `implement/[영역]/TODO.md`
   - Phase별 예외 체크리스트
   - 필요한 유틸리티/테스트 목록

2. **전체 통합 TODO** (1개)
   - `implement/TODO.md`
   - 10개 영역 통합
   - 우선순위별 작업
   - 마일스톤 설정

## ✅ 완료 조건

- [ ] 10개 영역별 TODO.md 작성
- [ ] implement/TODO.md 통합
- [ ] 우선순위 설정 (Critical → Low)
- [ ] 마일스톤 4개 설정
- [ ] 진행률 추적 표 작성

## 🚀 다음 세션 프롬프트 (Step 4)

```
안녕하세요! Step 4 - TODO 리스트 생성을 시작합니다.

**현재 단계**: Step 4 - TODO 리스트 생성

**이전 완료**: Step 3 (40개 Phase 문서) ✅

**작업 목표**:
1. 10개 영역별 TODO.md 작성
2. implement/TODO.md 통합

**작업 절차**:

Phase 1: 영역별 TODO 작성 (10개)
각 영역마다:
- implement/[영역]/PHASE-01~04.md 확인
- 모든 예외를 체크리스트로 변환
- 필요한 유틸리티/테스트 추가
- TODO.md 작성

템플릿: EXCEPTION-IMPLEMENTATION-PROMPT.md의 "4.1 영역별 TODO.md"

Phase 2: 전체 TODO 통합
- 10개 영역 TODO 통합
- 영역별 진행 상황 표 작성
- 우선순위별 작업 분류
- 마일스톤 4개 설정
  - Milestone 1: Critical 완료
  - Milestone 2: High 완료
  - Milestone 3: Medium 완료
  - Milestone 4: Low 완료

템플릿: EXCEPTION-IMPLEMENTATION-PROMPT.md의 "4.2 전체 TODO.md"

**완료 후**:
- 11개 TODO.md 생성 확인
- PROGRESS-TRACKER.md 업데이트
- 다음: Step 5 (실제 코드 구현) 프롬프트 사용

시작해주세요!
```

---

# 📋 Step 5: 실제 코드 구현

## 현재 상태 확인

이 단계를 시작하기 전에 확인:
- ✅ Step 4 완료: TODO 리스트 생성 완료
- ✅ 구현 우선순위 설정 완료
- ✅ 필요한 파일 및 테스트 목록 확인

## 작업 목표

TODO 리스트에 따라 실제 코드에 예외 처리 적용

### 구현 순서

#### Phase 1: Critical 예외 구현 (Week 1-2, ~150개)
- auth - Critical
- dashboard - Critical
- admin - Critical
- 나머지 영역 - Critical

#### Phase 2: High 예외 구현 (Week 3-4, ~300개)
- 모든 영역 - High

#### Phase 3: Medium 예외 구현 (Week 5-8, ~400개)
- 모든 영역 - Medium

#### Phase 4: Low 예외 구현 (Week 9-10, ~170개)
- 모든 영역 - Low

### 영역별 구현 순서 (Critical 기준)

1. **auth** → 2. **admin** → 3. **dashboard** → 4. **studies** → 5. **my-studies**
6. **chat** → 7. **notifications** → 8. **profile** → 9. **settings** → 10. **search**

## 구현 프로세스

1. **Phase 문서 확인**
   - 구현할 예외 확인
   - 코드 계획 검토

2. **코드 작성**
   - 페이지 컴포넌트 수정
   - API 라우트 수정
   - 유틸리티 함수 생성

3. **테스트 작성**
   - 유닛 테스트
   - 통합 테스트

4. **문서 업데이트**
   - CODE-CHANGES.md 업데이트
   - TODO 체크
   - 진행률 업데이트

## 🚀 다음 세션 프롬프트 (Step 5-1: auth Critical)

```
안녕하세요! Step 5 - 실제 코드 구현을 시작합니다.

**현재 단계**: Step 5-1 - auth Critical 예외 구현

**이전 완료**: Step 4 (TODO 리스트) ✅

**작업 목표**:
implement/auth/PHASE-01-CRITICAL.md의 예외 코드 구현

**참조 문서**:
- implement/auth/PHASE-01-CRITICAL.md (구현 계획)
- implement/auth/TODO.md (체크리스트)
- docs/exception/auth/ (예외 상세)
- EXCEPTION-IMPLEMENTATION-PROMPT.md (코드 패턴)

**구현 절차**:

1. 유틸리티 함수 생성 (필요시)
   - coup/src/lib/exceptions/authErrors.js
   - coup/src/lib/validators/authValidation.js

2. 각 예외별 코드 구현
   PHASE-01-CRITICAL.md의 순서대로:
   - 현재 상태 확인
   - 구현 계획의 코드 적용
   - 추가 파일 생성

3. 에러 처리 추가
   - Server Component: redirect, 에러 컴포넌트
   - API Route: NextResponse with error code
   - Client Component: try-catch, toast

4. 테스트 작성
   - 각 예외별 테스트 케이스
   - 엣지 케이스 테스트

5. 문서 업데이트
   - implement/auth/CODE-CHANGES.md 업데이트
   - implement/auth/TODO.md 체크
   - PROGRESS-TRACKER.md 업데이트

**코드 패턴 참조**:
EXCEPTION-IMPLEMENTATION-PROMPT.md의 "코드 작성 규칙" 섹션

**완료 조건**:
- [ ] auth Critical 예외 전체 구현
- [ ] 유틸리티 함수 생성
- [ ] 테스트 작성
- [ ] 문서 업데이트
- [ ] TODO 체크

**완료 후**:
다음: Step 5-2 (admin Critical) 프롬프트 사용

시작해주세요!
```

## 🚀 다음 세션 프롬프트 (Step 5-2 ~ 5-40: 나머지 구현)

각 영역/심각도 조합마다:

```
안녕하세요! Step 5-[N] - [영역] [심각도] 예외 구현을 시작합니다.

**이전 완료**: Step 5-[N-1] ✅

**현재 작업**: implement/[영역]/PHASE-0[X]-[심각도].md 구현

**참조**:
- implement/[영역]/PHASE-0[X]-[심각도].md
- implement/[영역]/TODO.md
- 이전 구현 파일 (패턴 참조)

**절차**:
1. Phase 문서의 예외 순서대로 구현
2. 필요시 유틸리티 함수 생성
3. 테스트 작성
4. 문서 업데이트 (CODE-CHANGES, TODO, PROGRESS)

**코드 패턴**:
이전 구현된 영역 참조 (implement/auth/CODE-CHANGES.md)

시작해주세요!
```

---

# 📋 Step 6: 테스트 및 검증

## 🚀 다음 세션 프롬프트 (Step 6)

```
안녕하세요! Step 6 - 테스트 및 검증을 시작합니다.

**이전 완료**: Step 5 (1,020개 예외 구현) ✅

**작업 목표**:
1. 통합 테스트 작성
2. E2E 테스트 작성
3. 테스트 커버리지 확인 (목표: 90%)
4. 성능 테스트
5. 보안 테스트

**검증 항목**:
- [ ] 모든 예외 코드 동작 확인
- [ ] 에러 메시지 일관성 확인
- [ ] HTTP 상태 코드 정확성
- [ ] 사용자 경험 테스트
- [ ] 성능 영향 최소화 확인

시작해주세요!
```

---

# 📋 Step 7: 문서화 및 배포

## 🚀 다음 세션 프롬프트 (Step 7)

```
안녕하세요! Step 7 - 문서화 및 배포를 시작합니다.

**이전 완료**: Step 6 (테스트 및 검증) ✅

**작업 목표**:
1. API 문서 업데이트
2. README 업데이트
3. 배포 가이드 작성
4. 최종 보고서 작성

**최종 문서**:
- implement/FINAL-REPORT.md
- implement/DEPLOYMENT-GUIDE.md
- 전체 README 업데이트

시작해주세요!
```

---

# 📊 진행 상황 추적

## 현재 진행 상태

| Step | 작업 | 상태 | 완료일 |
|------|------|------|--------|
| 0 | 프로젝트 시작 | ⏳ | - |
| 1 | 문서 구조 생성 | ⏳ | - |
| 2 | 영역별 분석 (10개) | ⏳ | - |
| 3 | Phase 문서 작성 (40개) | ⏳ | - |
| 4 | TODO 생성 | ⏳ | - |
| 5 | 코드 구현 (1,020개) | ⏳ | - |
| 6 | 테스트 및 검증 | ⏳ | - |
| 7 | 문서화 및 배포 | ⏳ | - |

## 다음 단계

**현재**: 프로젝트 시작 준비  
**다음**: Step 1 - 구현 문서 구조 생성

---

## 📞 지원

**문서 참조**:
- 전체 가이드: EXCEPTION-IMPLEMENTATION-PROMPT.md
- 단계별 가이드: 이 문서 (NEXT-SESSION-PROMPT.md)
- 예외 문서: docs/exception/

**작성자**: GitHub Copilot  
**최종 수정**: 2025-11-30  
**버전**: 2.0.0

---

# 🎯 구버전 내용 (Phase 8 - 참고용)

<details>
<summary>Phase 8 (예외 문서화 통합) 내용 보기</summary>

## 📋 Phase 7 완료 내역

### 완성된 문서 (5개)

1. **README.md** (450줄, 17KB)
   - 관리자 기능 전체 개요
   - 7개 주요 기능 설명
   - 보안 및 권한 체계
   - 빠른 참조 가이드

2. **INDEX.md** (450줄, 21KB)
   - 160+ 예외 코드 색인
   - 카테고리별/심각도별 분류
   - 빈도별 우선순위
   - 사용 예제

3. **01-user-management.md** (750줄, 28KB)
   - 권한 및 인증 (5개 예외)
   - 사용자 조회 (8개 예외)
   - 상태 변경 (8개 예외)
   - 성능 최적화
   - 디버깅 스크립트

4. **99-best-practices.md** (500줄, 18KB)
   - 보안 체크리스트
   - 코드 리뷰 가이드
   - 테스트 전략
   - 모니터링 설정
   - 운영 가이드
   - 장애 대응 플레이북

5. **COMPLETION-REPORT.md** (300줄, 12KB)
   - Phase 7 완료 보고서
   - 통계 및 성과
   - Next session prompt

### 주요 성과

✅ **160+ 예외 코드 정의**  
✅ **실전 가이드 완성**  
✅ **보안 최우선 접근**  
✅ **운영 플레이북 제공**

---

## 🎯 Phase 8 목표

### 전체 문서 통합 및 마무리

Phase 8은 모든 Phase (0-7)의 문서를 통합하고 최종 완성하는 단계입니다.

#### 주요 작업

1. **전체 통합 색인 생성** (3개 문서)
   - `docs/exception/MASTER-INDEX.md`: 모든 예외 코드 통합
   - `docs/exception/CROSS-REFERENCE.md`: 문서 간 참조 관계
   - `docs/exception/QUICK-REFERENCE.md`: 빠른 찾기 가이드

2. **최종 가이드 작성** (3개 문서)
   - `docs/exception/FINAL-GUIDE.md`: 전체 사용 가이드
   - `docs/exception/DEPLOYMENT-CHECKLIST.md`: 배포 체크리스트
   - `docs/exception/TEAM-ONBOARDING.md`: 팀 온보딩 가이드

3. **일관성 검증 및 정리**
   - 모든 예외 코드 중복 확인
   - 문서 링크 검증
   - 코드 예제 일관성
   - 용어 통일

4. **최종 통계 및 보고서**
   - 전체 완료 보고서
   - 통계 대시보드
   - 활용 가이드

---

## 📁 Phase 8 산출물

### 예상 문서 구조

```
docs/exception/
├── README.md (Phase 8에서 최종 업데이트)
├── TODO.md (Phase 8에서 완료 처리)
│
├── MASTER-INDEX.md           # 🆕 모든 예외 코드 통합 색인
├── CROSS-REFERENCE.md        # 🆕 문서 간 참조 맵
├── QUICK-REFERENCE.md        # 🆕 빠른 찾기 (카테고리/키워드)
├── FINAL-GUIDE.md            # 🆕 전체 사용 가이드
├── DEPLOYMENT-CHECKLIST.md   # 🆕 배포 전 체크리스트
├── TEAM-ONBOARDING.md        # 🆕 신규 팀원 온보딩
├── FINAL-REPORT.md           # 🆕 최종 완료 보고서
│
├── auth/ (Phase 0 - 9개 문서)
├── dashboard/ (Phase 1 - 9개 문서)
├── studies/ (Phase 2 - 13개 문서)
├── my-studies/ (Phase 3 - 11개 문서)
├── chat-notifications/ (Phase 4 - 11개 문서)
├── profile-settings/ (Phase 5 - 13개 문서)
├── search-filter/ (Phase 6 - 9개 문서)
└── admin/ (Phase 7 - 5개 문서)
```

---

## 🚀 Phase 8 시작 방법

### 단계별 진행

#### Step 1: MASTER-INDEX.md 생성

**목표**: 모든 Phase의 예외 코드를 하나의 색인으로 통합

**내용**:
```markdown
# CoUp 전체 예외 코드 마스터 색인

## 전체 통계
- 총 예외 코드: 1,000+ 개
- 영역: 8개
- 문서: 80개

## 카테고리별 색인
### AUTH (인증)
- AUTH-001: 세션 없음
- AUTH-002: 토큰 만료
...

### DASH (대시보드)
- DASH-001: 통계 조회 실패
...

### ADM (관리자)
- ADM-USR-001: 관리자 권한 없음
...

## 심각도별 색인
### 🔴 Critical (150개)
### 🟠 High (300개)
### 🟡 Medium (400개)
### 🟢 Low (150개)

## 빈도별 색인
### 높음 (200개)
### 중간 (500개)
### 낮음 (300개)
```

#### Step 2: CROSS-REFERENCE.md 생성

**목표**: 문서 간 참조 관계 시각화

**내용**:
```markdown
# 문서 간 참조 관계

## 인증 → 다른 영역
- auth/02-token-management.md → dashboard/01-data-loading.md
- auth/03-session-management.md → admin/07-permissions-rbac.md

## 관리자 → 다른 영역
- admin/01-user-management.md → auth/04-user-operations.md
- admin/02-study-management.md → studies/01-study-creation.md

## 공통 패턴
- 모든 API → auth/01-authentication.md
- 모든 실시간 → chat-notifications/03-real-time.md
```

#### Step 3: QUICK-REFERENCE.md 생성

**목표**: 상황별 빠른 찾기 가이드

**내용**:
```markdown
# 빠른 참조 가이드

## 자주 발생하는 문제

### "로그인이 필요합니다" (401)
→ auth/02-token-management.md#AUTH-002

### "권한이 없습니다" (403)
→ admin/07-permissions-rbac.md#ADM-PRM-002

### 데이터를 불러올 수 없습니다
→ dashboard/01-data-loading.md#DASH-001

## 상황별 가이드

### 신규 개발자
1. auth/README.md 읽기
2. MASTER-INDEX.md에서 관련 코드 찾기
3. 해당 상세 문서 참조

### 버그 수정
1. 에러 메시지에서 예외 코드 확인
2. MASTER-INDEX.md에서 코드 검색
3. 상세 문서의 해결 방법 적용

### 코드 리뷰
1. 체크리스트: */99-best-practices.md
2. 보안: admin/99-best-practices.md#보안
3. 성능: */06-performance-issues.md
```

#### Step 4: FINAL-GUIDE.md 생성

**목표**: 전체 문서 사용 가이드

#### Step 5: DEPLOYMENT-CHECKLIST.md 생성

**목표**: 배포 전 최종 점검

#### Step 6: TEAM-ONBOARDING.md 생성

**목표**: 신규 팀원 학습 경로

#### Step 7: FINAL-REPORT.md 생성

**목표**: 전체 프로젝트 완료 보고서

---

## ✅ Phase 8 체크리스트

### 문서 작성 (7개)
- [ ] MASTER-INDEX.md
- [ ] CROSS-REFERENCE.md
- [ ] QUICK-REFERENCE.md
- [ ] FINAL-GUIDE.md
- [ ] DEPLOYMENT-CHECKLIST.md
- [ ] TEAM-ONBOARDING.md
- [ ] FINAL-REPORT.md

### 검증 작업
- [ ] 모든 예외 코드 중복 확인
- [ ] 문서 링크 검증
- [ ] 코드 예제 테스트
- [ ] 용어 일관성 확인
- [ ] 파일 경로 검증

### 최종 정리
- [ ] README.md 업데이트
- [ ] TODO.md 완료 처리
- [ ] 통계 업데이트
- [ ] 버전 태깅 (v1.0.0)

---

## 📊 예상 산출물

| 문서 | 라인 수 | 주요 내용 |
|------|---------|-----------|
| MASTER-INDEX.md | ~600줄 | 전체 예외 코드 색인 |
| CROSS-REFERENCE.md | ~400줄 | 문서 간 참조 맵 |
| QUICK-REFERENCE.md | ~300줄 | 빠른 찾기 가이드 |
| FINAL-GUIDE.md | ~500줄 | 전체 사용 가이드 |
| DEPLOYMENT-CHECKLIST.md | ~300줄 | 배포 체크리스트 |
| TEAM-ONBOARDING.md | ~400줄 | 온보딩 가이드 |
| FINAL-REPORT.md | ~500줄 | 최종 보고서 |
| **합계** | **~3,000줄** | **7개 문서** |

---

## 🎯 성공 기준

Phase 8 완료 시:

1. ✅ 모든 예외 코드가 하나의 색인에서 검색 가능
2. ✅ 어떤 문제든 3번의 클릭 내에 해결 방법 찾기
3. ✅ 신규 개발자가 1일 내에 문서 활용 가능
4. ✅ 배포 전 모든 항목 체크 가능
5. ✅ 문서 유지보수 프로세스 확립

---

## 🚀 시작 명령

```
안녕하세요! CoUp 예외 처리 문서화 Phase 8을 시작하겠습니다.

Phase 7 (관리자) 완료 확인:
- ✅ README.md
- ✅ INDEX.md  
- ✅ 01-user-management.md
- ✅ 99-best-practices.md
- ✅ COMPLETION-REPORT.md

Phase 8 목표:
- 전체 문서 통합 색인
- 크로스 레퍼런스
- 최종 가이드 작성
- 배포 체크리스트

docs/exception/TODO.md를 참고하여 Phase 8을 시작해주세요.

구체적으로:
1. MASTER-INDEX.md 작성 (모든 Phase의 예외 코드 통합)
2. CROSS-REFERENCE.md 작성 (문서 간 참조 관계)
3. QUICK-REFERENCE.md 작성 (빠른 찾기 가이드)
4. FINAL-GUIDE.md 작성 (전체 사용 가이드)
5. DEPLOYMENT-CHECKLIST.md 작성
6. TEAM-ONBOARDING.md 작성
7. FINAL-REPORT.md 작성

시작해주세요!
```

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-29 23:30  
**이전 Phase**: [Phase 7 완료 보고서](../admin/COMPLETION-REPORT.md)
</details>
---
**�� ������ CoUp ���� ó�� ���� ������Ʈ�� �ܰ躰 ���̵��Դϴ�.**  
**�� �ܰ� �Ϸ� �� �ش� ������ '���� ���� ������Ʈ'�� �� ���ǿ��� ����ϼ���.**
---
**Happy Coding! ??**
