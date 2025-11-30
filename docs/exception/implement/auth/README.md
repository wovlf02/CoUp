# auth 영역 구현 가이드

**영역**: 인증 (Authentication)  
**Phase**: 0  
**예외 개수**: ~80개  
**우선순위**: P1 (High)

---

## 📊 영역 개요

### 담당 기능

- 사용자 로그인/로그아웃
- 회원가입
- 비밀번호 재설정
- 이메일 인증
- 세션 관리
- JWT 토큰 관리
- OAuth 소셜 로그인 (Google, GitHub)

### 기술 스택

- **인증**: NextAuth.js v5
- **세션**: JWT
- **비밀번호 해싱**: bcrypt
- **이메일**: Nodemailer

---

## 📁 파일 구조

```
coup/src/
├── app/
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.js
│   │   ├── signup/
│   │   │   └── page.js
│   │   ├── verify/
│   │   │   └── page.js
│   │   └── reset-password/
│   │       └── page.js
│   │
│   └── api/
│       └── auth/
│           ├── [...nextauth]/
│           │   └── route.js
│           ├── signup/
│           │   └── route.js
│           ├── verify/
│           │   └── route.js
│           └── reset-password/
│               └── route.js
│
├── components/
│   └── auth/
│       ├── SignInForm.jsx
│       ├── SignUpForm.jsx
│       ├── ResetPasswordForm.jsx
│       └── ...
│
└── lib/
    ├── auth/
    │   ├── authOptions.js
    │   ├── session.js
    │   └── tokenRefresh.js
    │
    ├── exceptions/
    │   └── authErrors.js (신규 생성 필요)
    │
    └── validators/
        └── authValidation.js (신규 생성 필요)
```

---

## 📋 작업 현황

### 분석 상태
- [ ] 문서 분석 완료
- [ ] 코드 분석 완료
- [ ] Gap 분석 완료
- [ ] 우선순위 설정 완료

### 구현 계획
- [ ] PHASE-01-CRITICAL.md 작성
- [ ] PHASE-02-HIGH.md 작성
- [ ] PHASE-03-MEDIUM.md 작성
- [ ] PHASE-04-LOW.md 작성
- [ ] IMPLEMENTATION-PLAN.md 작성

### 구현 상태
- [ ] Critical 예외 구현 (0/~15)
- [ ] High 예외 구현 (0/~24)
- [ ] Medium 예외 구현 (0/~30)
- [ ] Low 예외 구현 (0/~11)

### 테스트 상태
- [ ] 유닛 테스트
- [ ] 통합 테스트
- [ ] E2E 테스트

---

## 📝 참조 문서

- [docs/exception/auth/](../../auth/) - 예외 처리 문서
- [ANALYSIS.md](./ANALYSIS.md) - 분석 보고서
- [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) - 구현 계획
- [TODO.md](./TODO.md) - 작업 목록

---

## 🎯 다음 단계

1. ANALYSIS.md 작성 (문서 및 코드 분석)
2. 4개 Phase 문서 작성
3. IMPLEMENTATION-PLAN.md 작성
4. 예외 구현 시작 (Critical부터)

---

**작성일**: 2025-11-30  
**최종 수정**: 2025-11-30  
**상태**: 초기 템플릿

