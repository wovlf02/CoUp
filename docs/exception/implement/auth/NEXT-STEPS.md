# Step 2-3: 다음 단계 가이드

**현재 완료**: Step 2-2 (auth 영역 Critical 예외 처리 구현)  
**다음 작업**: Step 2-3 (다른 영역 분석 또는 추가 구현)  
**작성일**: 2025-11-30

---

## ✅ Step 2-2 완료 요약

### 구현 완료
- ✅ 4개 예외 처리 유틸리티 생성
- ✅ auth.js 예외 처리 강화 (authorize, jwt, session)
- ✅ signup API 예외 처리 강화
- ✅ validate-session API 예외 처리 강화
- ✅ auth-helpers.js (requireAuth) 예외 처리 강화
- ✅ 구현 문서 작성 (IMPLEMENTATION.md)
- ✅ 테스트 가이드 작성 (TEST-GUIDE.md)

### 구현 통계
- **생성 파일**: 6개
- **수정 파일**: 4개
- **예외 처리 항목**: 50개
- **코드 라인 증가**: ~800줄

---

## 🎯 다음 단계 옵션

### Option 1: auth 영역 Phase 2 구현 (추천)

**목표**: auth 영역 Important 항목 구현

**작업 내용**:
1. **Rate Limiting 실제 적용** (6시간)
   - 로그인 API에 Rate Limiter 적용
   - IP 기반 제한
   - 이메일 기반 제한
   - Redis 연동 (선택)

2. **비밀번호 재설정 예외 처리** (4시간)
   - 비밀번호 찾기 API
   - 이메일 발송 에러 처리
   - 토큰 검증 에러 처리

3. **프로필 업데이트 예외 처리** (3시간)
   - 이미지 업로드 에러
   - 파일 크기 제한
   - 형식 검증

**예상 소요 시간**: 13시간

**우선순위**: ⭐⭐⭐⭐ (높음)

---

### Option 2: study 영역 분석 시작

**목표**: study 영역 예외 처리 분석

**작업 내용**:
1. **study 영역 파일 분석**
   - API 라우트 분석 (10개)
   - 라이브러리 분석 (3개)
   - 현재 예외 처리 현황 파악

2. **ANALYSIS.md 작성**
   - 구현/미구현 항목 분류
   - Critical/Important/Nice-to-Have 분류
   - 예상 소요 시간 산정

**예상 소요 시간**: 12시간

**우선순위**: ⭐⭐⭐⭐⭐ (매우 높음)

---

### Option 3: 공통 유틸리티 확장

**목표**: 범용 예외 처리 유틸리티 생성

**작업 내용**:
1. **API 에러 핸들러** (3시간)
   - `coup/src/lib/exceptions/api-error-handler.js`
   - 통합 에러 핸들러
   - 자동 로깅
   - 클라이언트 응답 포맷팅

2. **DB 에러 핸들러** (2시간)
   - `coup/src/lib/exceptions/db-error-handler.js`
   - Prisma 에러 변환
   - 사용자 친화적 메시지

3. **파일 업로드 헬퍼** (2시간)
   - `coup/src/lib/exceptions/upload-helpers.js`
   - 파일 크기 검증
   - 형식 검증
   - 악성 파일 방지

**예상 소요 시간**: 7시간

**우선순위**: ⭐⭐⭐ (중간)

---

### Option 4: 테스트 작성

**목표**: 예외 처리 자동 테스트 작성

**작업 내용**:
1. **Unit Test** (4시간)
   - validation-helpers 테스트
   - auth-errors 테스트
   - rate-limiter 테스트

2. **Integration Test** (6시간)
   - 로그인 흐름 테스트
   - 회원가입 흐름 테스트
   - 세션 관리 테스트

3. **E2E Test** (선택, 8시간)
   - Playwright 설정
   - 사용자 시나리오 테스트

**예상 소요 시간**: 10-18시간

**우선순위**: ⭐⭐ (낮음, 추후 진행)

---

## 📋 추천 작업 순서

### 즉시 시작 (필수)

**1단계: study 영역 분석 (12시간)**
```
Step 2-3: study 영역 분석
- study 파일 분석
- ANALYSIS.md 작성
- 우선순위 결정
```

**2단계: study 영역 Critical 구현 (예상 15-20시간)**
```
Step 2-4: study 영역 Critical 구현
- 스터디 생성 예외 처리
- 스터디 가입 예외 처리
- 스터디 멤버 관리 예외 처리
```

### 중기 계획

**3단계: auth 영역 Phase 2 (13시간)**
```
Step 3-1: auth 영역 Important 구현
- Rate Limiting 적용
- 비밀번호 재설정
- 프로필 업데이트
```

**4단계: 공통 유틸리티 확장 (7시간)**
```
Step 3-2: 공통 유틸리티 구현
- API 에러 핸들러
- DB 에러 핸들러
- 파일 업로드 헬퍼
```

### 장기 계획

**5단계: 나머지 영역 분석 및 구현**
```
- post 영역 (게시글)
- comment 영역 (댓글)
- notification 영역 (알림)
- analytics 영역 (분석)
```

**6단계: 테스트 작성**
```
- Unit Test
- Integration Test
- E2E Test (선택)
```

---

## 🚀 Step 2-3 시작하기

### 방법 1: study 영역 분석 (추천)

```bash
# 프롬프트
안녕하세요! CoUp 예외 처리 구현 Step 2-3을 시작합니다.

**목표**: study 영역의 예외 처리 분석

**프로젝트 정보**:
- Next.js 16 App Router 기반
- JavaScript (ES6+) 전용
- Prisma ORM 사용

**이전 완료**: 
- Step 2-2 (auth 영역 Critical 구현) ✅

**현재 작업**: Step 2-3 - study 영역 분석

**참조 문서**:
- `docs/exception/implement/auth/ANALYSIS.md` - auth 분석 예제
- `docs/exception/implement/auth/IMPLEMENTATION.md` - 구현 예제
- `EXCEPTION-IMPLEMENTATION-PROMPT.md` - 가이드

다음을 수행해주세요:

## 1. study 영역 파일 분석

다음 파일들의 예외 처리 현황을 분석해주세요:

### API 라우트
- `coup/src/app/api/studies/route.js` - 스터디 목록/생성
- `coup/src/app/api/studies/[id]/route.js` - 스터디 상세/수정/삭제
- `coup/src/app/api/studies/[id]/join/route.js` - 스터디 가입
- `coup/src/app/api/studies/[id]/leave/route.js` - 스터디 탈퇴
- `coup/src/app/api/studies/[id]/members/route.js` - 멤버 관리
- 기타 study 관련 API

### 라이브러리
- `coup/src/lib/studies.js` - 스터디 헬퍼 (있다면)

## 2. ANALYSIS.md 작성

`docs/exception/implement/study/ANALYSIS.md` 파일을 생성하고:
- 구현된 예외 처리 (현황)
- 미구현 예외 처리 (필요한 항목)
- Critical/Important/Nice-to-Have 분류
- 각 항목별 예상 소요 시간

auth 분석 보고서 형식을 참고하세요.
```

### 방법 2: auth 영역 Phase 2 구현

```bash
# 프롬프트
안녕하세요! CoUp 예외 처리 구현 Step 2-3을 시작합니다.

**목표**: auth 영역 Phase 2 (Important) 구현

**현재 작업**: Rate Limiting 실제 적용

**참조 문서**:
- `coup/src/lib/exceptions/rate-limiter.js` - 기존 구현
- `docs/exception/auth/01-credentials-login-exceptions.md` - Rate Limit 문서

다음을 수행해주세요:

## 1. 로그인 API에 Rate Limiting 적용

### 1.1 auth.js에 Rate Limiter 통합
- authorize 함수에서 checkRateLimit 호출
- IP 기반 제한
- 로그인 성공 시 resetRateLimit 호출

### 1.2 에러 응답 개선
- TOO_MANY_ATTEMPTS 에러 반환
- retryAfter 정보 포함
- 클라이언트 UI 개선

### 1.3 테스트
- 5회 실패 시나리오
- 15분 대기 시나리오
- 성공 시 초기화 시나리오
```

### 방법 3: 공통 유틸리티 확장

```bash
# 프롬프트
안녕하세요! CoUp 예외 처리 구현 Step 2-3을 시작합니다.

**목표**: 공통 예외 처리 유틸리티 생성

**현재 작업**: API 에러 핸들러 생성

다음을 수행해주세요:

## 1. API 에러 핸들러 생성

### 1.1 coup/src/lib/exceptions/api-error-handler.js
- withErrorHandler() HOC
- 자동 에러 로깅
- 통합 에러 응답
- NextResponse 생성

### 1.2 사용 예제
```javascript
import { withErrorHandler } from '@/lib/exceptions/api-error-handler'

export const POST = withErrorHandler(async (request) => {
  // 비즈니스 로직
  // 에러는 자동 처리됨
})
```

---

## 📊 전체 진행 상황

### 완료
- ✅ Step 1: 문서 구조 생성
- ✅ Step 2-1: auth 영역 분석
- ✅ Step 2-2: auth 영역 Critical 구현

### 진행 중
- 🔄 Step 2-3: (선택 필요)

### 계획
- ⏳ Step 2-4: study 영역 분석 및 구현
- ⏳ Step 3: auth 영역 Phase 2
- ⏳ Step 4: 공통 유틸리티
- ⏳ Step 5: 나머지 영역
- ⏳ Step 6: 테스트

### 전체 진행률
```
████████░░░░░░░░░░░░░░ 30%
```

---

## 🎯 추천 다음 작업

**최우선**: study 영역 분석 (Step 2-3)

**이유**:
1. study는 auth 다음으로 핵심 기능
2. 사용자가 가장 많이 사용하는 기능
3. 예외 처리가 사용자 경험에 직접 영향
4. auth와 밀접하게 연결됨

**시작 방법**: 위의 "방법 1: study 영역 분석" 프롬프트 사용

---

## 📝 참고 문서

- `docs/exception/implement/auth/ANALYSIS.md` - auth 분석 예제
- `docs/exception/implement/auth/IMPLEMENTATION.md` - 구현 예제
- `docs/exception/implement/auth/TEST-GUIDE.md` - 테스트 가이드
- `EXCEPTION-IMPLEMENTATION-PROMPT.md` - 전체 가이드

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-30

