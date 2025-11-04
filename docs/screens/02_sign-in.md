# 02. 로그인 페이지 (Sign In)

> **화면 ID**: `AUTH-01`  
> **라우트**: `/sign-in`  
> **레이아웃**: 네비게이션 없음 (중앙 정렬)  
> **렌더링**: CSR

---

## 📐 화면 구조

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ← 뒤로가기                                                     │
│                                                                │
│                                                                │
│                       [Logo] CoUp                              │
│                     로그인하고 시작하기                          │
│                                                                │
│                                                                │
│              ┌──────────────────────────────┐                  │
│              │  Google로 계속하기            │                  │
│              └──────────────────────────────┘                  │
│                                                                │
│              ┌──────────────────────────────┐                  │
│              │  GitHub로 계속하기            │                  │
│              └──────────────────────────────┘                  │
│                                                                │
│                                                                │
│              아직 계정이 없으신가요? [회원가입]                  │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎨 상세 설계

### 전체 레이아웃
```
배경: gray-50 (전체)
중앙 카드: white, 그림자, 중앙 정렬
카드 크기: 480px × auto (Desktop), 100% (Mobile)
패딩: 48px (Desktop), 24px (Mobile)
둥근 모서리: 16px
```

### 1. 뒤로가기 버튼
```
위치: 좌측 상단 (카드 밖)
크기: 40px × 40px
아이콘: ← (좌측 화살표)
배경: white
테두리: 1px solid gray-200
Hover: gray-50

클릭 → 이전 페이지 또는 랜딩 페이지
```

### 2. 헤더 (카드 내부)
```
┌────────────────────────────┐
│                            │
│      [Logo - 64px]         │
│         CoUp               │
│                            │
│   로그인하고 시작하기        │
│                            │
└────────────────────────────┘
```

**로고**:
- 크기: 64px × 64px
- Primary-500 색상
- 중앙 정렬

**제목**:
- "로그인하고 시작하기" (text-2xl, 24px, Bold, gray-900)
- 중앙 정렬
- 로고 아래 16px 간격

---

### 3. 소셜 로그인 버튼
```
┌────────────────────────────────────┐
│  [G]  Google로 계속하기            │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  [GitHub]  GitHub로 계속하기       │
└────────────────────────────────────┘
```

**Google 버튼**:
- 배경: white
- 테두리: 1px solid gray-300
- 텍스트: gray-700 (text-base, 16px, Medium)
- 아이콘: Google 로고 (좌측, 24px)
- 높이: 48px
- 전체 너비
- Hover: gray-50 배경
- 클릭 → NextAuth Google OAuth

**GitHub 버튼**:
- 배경: #24292e (GitHub 블랙)
- 텍스트: white (text-base, 16px, Medium)
- 아이콘: GitHub 로고 (좌측, 24px, white)
- 높이: 48px
- 전체 너비
- Hover: #1b1f23 배경
- 클릭 → NextAuth GitHub OAuth

**간격**:
- 제목 아래 32px
- 버튼 사이 12px

---

### 4. 회원가입 링크
```
아직 계정이 없으신가요? [회원가입]
```

**스타일**:
- 텍스트: gray-600 (text-sm, 14px)
- 링크: primary-500, Underline on hover
- 중앙 정렬
- 버튼 아래 32px 간격

**클릭**:
- "회원가입" → `/sign-up`

---

### 5. 하단 (선택적)
```
이용약관  |  개인정보처리방침
```

**스타일**:
- 텍스트: gray-400 (text-xs, 12px)
- 링크: gray-500, Underline
- 중앙 정렬
- 회원가입 링크 아래 24px 간격

---

## 🎬 인터랙션

### 로딩 상태
```
버튼 클릭 시:
┌────────────────────────────────────┐
│  [Spinner]  로그인 중...           │
└────────────────────────────────────┘

- 버튼 비활성화
- 스피너 표시
- 텍스트: "로그인 중..."
```

### 성공
```
1. 로그인 성공
2. 대시보드로 리다이렉트 → `/dashboard`
3. Toast 알림: "환영합니다!"
```

### 실패
```
1. 에러 메시지 표시 (버튼 위)
┌────────────────────────────────────┐
│  ⚠️  로그인에 실패했습니다.         │
│     다시 시도해 주세요.             │
└────────────────────────────────────┘

- 배경: danger-50
- 텍스트: danger-700
- 아이콘: ⚠️
- 패딩: 12px
- 둥근 모서리: 8px
```

---

## 🔐 보안

### OAuth 흐름
1. 버튼 클릭
2. NextAuth.js Google/GitHub Provider 호출
3. OAuth 동의 화면 (팝업 또는 리다이렉트)
4. 코드 교환 → 토큰 받기
5. 사용자 정보 조회
6. DB에 저장 (첫 로그인 시)
7. 세션 생성 (JWT)
8. 대시보드로 리다이렉트

### CSRF 방어
- NextAuth.js 내장 CSRF 토큰 사용
- state 파라미터 검증

---

## 📱 반응형 설계

### Desktop (1280px+)
```
카드 크기: 480px × auto
중앙 정렬 (화면 중앙)
```

### Tablet (768-1279px)
```
카드 크기: 420px × auto
중앙 정렬
```

### Mobile (<768px)
```
카드 크기: 100% (좌우 여백 24px)
패딩: 24px
버튼 높이: 48px 유지
```

---

## 🎨 스타일 코드

```css
/* Container */
.sign-in-container {
  min-height: 100vh;
  background: var(--gray-50);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* Card */
.sign-in-card {
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  padding: 48px;
  width: 100%;
  max-width: 480px;
}

/* Logo */
.sign-in-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: var(--primary-500);
}

/* Title */
.sign-in-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-900);
  text-align: center;
  margin-bottom: 32px;
}

/* Social Button */
.social-button {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.social-button.google {
  background: white;
  border: 1px solid var(--gray-300);
  color: var(--gray-700);
}

.social-button.google:hover {
  background: var(--gray-50);
}

.social-button.github {
  background: #24292e;
  color: white;
  border: none;
}

.social-button.github:hover {
  background: #1b1f23;
}

/* Sign Up Link */
.sign-up-link {
  text-align: center;
  margin-top: 32px;
  font-size: 14px;
  color: var(--gray-600);
}

.sign-up-link a {
  color: var(--primary-500);
  text-decoration: none;
}

.sign-up-link a:hover {
  text-decoration: underline;
}
```

---

## 📐 ASCII 스케치

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ← 뒤로                                                  │
│                                                         │
│                                                         │
│                    ┌─────────────┐                      │
│                    │             │                      │
│                    │   [LOGO]    │                      │
│                    │    CoUp     │                      │
│                    │             │                      │
│                    └─────────────┘                      │
│                                                         │
│                 로그인하고 시작하기                       │
│                                                         │
│                                                         │
│         ┌───────────────────────────────────┐           │
│         │                                   │           │
│         │  [G]  Google로 계속하기           │           │
│         │                                   │           │
│         └───────────────────────────────────┘           │
│                                                         │
│         ┌───────────────────────────────────┐           │
│         │                                   │           │
│         │  [GH]  GitHub로 계속하기          │           │
│         │                                   │           │
│         └───────────────────────────────────┘           │
│                                                         │
│                                                         │
│         아직 계정이 없으신가요? [회원가입]                │
│                                                         │
│                                                         │
│              이용약관  |  개인정보처리방침                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ 완료 체크리스트

- [ ] 카드 레이아웃 구현
- [ ] Google 소셜 로그인 버튼
- [ ] GitHub 소셜 로그인 버튼
- [ ] NextAuth.js OAuth 연동
- [ ] 로딩 상태 UI
- [ ] 에러 처리 (Toast 또는 인라인 메시지)
- [ ] 회원가입 페이지 링크
- [ ] 반응형 테스트
- [ ] 키보드 접근성 (Tab 순서)
- [ ] CSRF 토큰 검증

---

**다음 화면**: `03_sign-up.md` (회원가입 페이지)
