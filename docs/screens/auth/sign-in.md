# 로그인 (Sign In)

> **화면 ID**: `AUTH-01`  
> **라우트**: `/sign-in`  
> **파일**: `app/(auth)/sign-in/page.jsx` ✅  
> **레이아웃**: 카드 중앙 정렬  
> **렌더링**: CSR ('use client')  
> **권한**: 비로그인 사용자  
> **상태관리**: useState (email, password, loading, error)  

---

## ✅ 구현 완료 상태

### 2025-11-17 기준 - 100% 완료

**페이지 구조** (100% 완료)
- ✅ Client Component ('use client') - 완료
- ✅ 카드 레이아웃 (480px 고정, 중앙 정렬) - 완료
- ✅ useRouter 사용 - 완료

**UI 요소** (100% 완료)
- ✅ 뒤로가기 버튼 (SVG 아이콘) - 완료
- ✅ 로고 + 브랜드명 (🚀 CoUp) - 완료
- ✅ 페이지 타이틀 "로그인하고 시작하기" - 완료
- ✅ 에러 메시지 영역 (조건부) - 완료

**이메일/비밀번호 폼** (100% 완료)
- ✅ 이메일 입력 필드 - 완료
  - ✅ label, placeholder
  - ✅ 폼 검증 에러 표시
- ✅ 비밀번호 입력 필드 - 완료
  - ✅ label, placeholder
  - ✅ type 토글 (password/text)
  - ✅ 표시/숨김 버튼 (SVG 아이콘)
  - ✅ 폼 검증 에러 표시
- ✅ 로그인 버튼 - 완료
  - ✅ disabled 상태 (유효성 검증)
  - ✅ 로딩 상태 UI (스피너 + 텍스트)

**폼 검증** (100% 완료)
- ✅ validateEmail 함수 (정규식) - 완료
- ✅ validateForm 함수 - 완료
  - ✅ 이메일 필수 + 형식 체크
  - ✅ 비밀번호 필수 + 8자 이상
- ✅ formErrors 상태 관리 - 완료
- ✅ isFormValid 계산 - 완료

**소셜 로그인** (100% 완료)
- ✅ 구분선 ("또는") - 완료
- ✅ Google 로그인 버튼 - 완료
  - ✅ Google SVG 아이콘 (멀티컬러)
  - ✅ 로딩 상태 UI
- ✅ GitHub 로그인 버튼 - 완료
  - ✅ GitHub SVG 아이콘
  - ✅ 로딩 상태 UI

**기능** (100% 완료)
- ✅ Credentials 로그인 (handleCredentialsLogin) - 완료
  - ✅ 폼 검증
  - ✅ Mock 로그인 (1.5초 딜레이)
  - ✅ 성공 시 /dashboard 리다이렉트
  - ✅ 실패 시 에러 메시지
- ✅ 소셜 로그인 (handleSocialLogin) - 완료
  - ✅ provider 파라미터 (google/github)
  - ✅ Mock 로그인 (2초 딜레이)
  - ✅ 성공 시 /dashboard 리다이렉트
  - ✅ 실패 시 에러 메시지
- ✅ 뒤로가기 (handleBack) - 완료
- ✅ loading 상태 관리 (credentials/google/github/null) - 완료

**링크** (100% 완료)
- ✅ 회원가입 링크 (/sign-up) - 완료
- ✅ 이용약관 링크 (/terms) - 완료
- ✅ 개인정보처리방침 링크 (/privacy) - 완료

**스타일링** (100% 완료)
- ✅ sign-in.module.css 분리 - 완료
- ✅ 카드 그림자 효과 - 완료
- ✅ 호버/포커스 효과 - 완료
- ✅ 반응형 디자인 - 완료

## 📊 구현 체크리스트

### Phase 1: 기본 UI (100% 완료)
- ✅ 카드 레이아웃
- ✅ 로고 + 타이틀
- ✅ 뒤로가기 버튼

### Phase 2: 폼 구현 (100% 완료)
- ✅ 이메일 입력
- ✅ 비밀번호 입력
- ✅ 비밀번호 표시/숨김
- ✅ 로그인 버튼

### Phase 3: 폼 검증 (100% 완료)
- ✅ 이메일 검증
- ✅ 비밀번호 검증
- ✅ 에러 메시지 표시
- ✅ 버튼 disabled 처리

### Phase 4: 소셜 로그인 (100% 완료)
- ✅ Google 버튼 (SVG)
- ✅ GitHub 버튼 (SVG)
- ✅ 로딩 상태 UI

### Phase 5: 로그인 처리 (100% 완료)
- ✅ Mock 로그인 함수
- ✅ 에러 처리
- ✅ 리다이렉트

### Phase 6: NextAuth 연동 (대기)
- ⏳ NextAuth.js Credentials Provider
- ⏳ NextAuth.js OAuth (Google, GitHub)
- ⏳ API 엔드포인트 연결
- ⏳ CSRF 토큰 검증
- ⏳ 세션 관리

---

**다음 화면**: `03_sign-up.md` (회원가입 페이지)
