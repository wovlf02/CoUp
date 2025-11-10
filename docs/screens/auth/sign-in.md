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
│                       [Logo] CoUp                              │
│                     로그인하고 시작하기                          │
│                                                                │
│              ┌──────────────────────────────┐                  │
│              │  이메일                      │                  │
│              └──────────────────────────────┘                  │
│              ┌──────────────────────────────┐                  │
│              │  비밀번호                    │                  │
│              └──────────────────────────────┘                  │
│                                                                │
│              ┌──────────────────────────────┐                  │
│              │      로그인                  │                  │
│              └──────────────────────────────┘                  │
│                                                                │
│                    ──── 또는 ────                              │
│                                                                │
│              ┌──────────────────────────────┐                  │
│              │  Google로 계속하기            │                  │
│              └──────────────────────────────┘                  │
│                                                                │
│              ┌──────────────────────────────┐                  │
│              │  GitHub로 계속하기            │                  │
│              └────────────────────────────────────────────────┘
│                                                                │
│              아직 계정이 없으신가요? [회원가입]                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**레이아웃 비율** (중앙 카드 레이아웃):

### 🖥️ FHD (1920px) - 기본 기준
- 카드 너비: **480px** (고정)
- 카드 위치: 화면 중앙 (상하좌우 auto)
- 배경: 전체 화면 (gray-50)

### 🖥️ QHD (2560px) - 고해상도
- 카드 너비: **520px** (고정)
- 카드 위치: 화면 중앙
- 배경: 전체 화면

### 🖥️ 4K (3840px) - 초고해상도
- 카드 너비: **560px** (고정)
- 카드 위치: 화면 중앙
- 배경: 전체 화면

### 📱 반응형 브레이크포인트
- **Desktop (1280px+)**: 카드 480px, 중앙 정렬
- **Tablet (768-1279px)**: 카드 420px, 중앙 정렬
- **Mobile (<768px)**: 카드 100% (좌우 여백 24px)

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

### 3. 이메일/비밀번호 로그인 폼 (추가)

```
┌────────────────────────────────────┐
│  이메일                            │
│  [example@email.com]              │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  비밀번호                          │
│  [••••••••]                       │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│         로그인                     │
└────────────────────────────────────┘
```

**이메일 입력**:
- Label: "이메일" (text-sm, gray-700, Medium)
- Input:
  - 배경: white
  - 테두리: 1px solid gray-300
  - 높이: 48px
  - 패딩: 12px 16px
  - 둥근 모서리: 8px
  - Placeholder: "example@email.com"
  - Focus: border primary-500, shadow
  - Type: email
  - Required

**비밀번호 입력**:
- Label: "비밀번호" (text-sm, gray-700, Medium)
- Input:
  - 배경: white
  - 테두리: 1px solid gray-300
  - 높이: 48px
  - 패딩: 12px 16px
  - 둥근 모서리: 8px
  - Placeholder: "8자 이상"
  - Focus: border primary-500, shadow
  - Type: password
  - Required
  - 우측 아이콘: 👁️ (표시/숨김 토글)

**로그인 버튼**:
- 배경: primary-600
- 텍스트: white (text-base, 16px, Semibold)
- 높이: 48px
- 전체 너비
- 둥근 모서리: 8px
- Hover: primary-700, 상승 효과
- Disabled: 입력값 없을 때 비활성화

**폼 검증**:
- 이메일: 유효한 이메일 형식 검증
- 비밀번호: 8자 이상
- 실시간 에러 메시지 (input 아래)

**간격**:
- 제목 아래 32px
- Input 사이 16px
- 로그인 버튼 위 24px

---

### 4. 구분선 (Divider)

```
──────── 또는 ────────
```

**스타일**:
- 텍스트: gray-400 (text-sm)
- 선: gray-200 (1px)
- 로그인 버튼 아래 32px
- 소셜 버튼 위 32px

---

### 5. 소셜 로그인 버튼

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
- 버튼 사이 12px

---

### 6. 회원가입 링크

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

### 7. 하단 (선택적)

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
1. 에러 메시지 표시 (폼 상단)
┌────────────────────────────────────┐
│  ⚠️  이메일 또는 비밀번호가         │
│     올바르지 않습니다.             │
└────────────────────────────────────┘

- 배경: danger-50
- 텍스트: danger-700
- 아이콘: ⚠️
- 패딩: 12px
- 둥근 모서리: 8px
```

### 입력 검증 에러

```
이메일 형식 오류:
"올바른 이메일 형식이 아닙니다"

비밀번호 길이 부족:
"비밀번호는 8자 이상이어야 합니다"

- 텍스트: danger-600 (text-sm)
- Input 아래 4px 간격
```

---

## 🔐 보안

### Credentials 로그인 (이메일/비밀번호)

1. 폼 제출
2. NextAuth.js Credentials Provider 호출
3. 서버에서 이메일 검증
4. bcrypt로 비밀번호 해시 비교
5. 일치 시 세션 생성 (JWT)
6. 대시보드로 리다이렉트

### OAuth 흐름 (Google/GitHub)

1. 버튼 클릭
2. NextAuth.js Provider 호출
3. OAuth 동의 화면
4. 코드 교환 → 토큰 받기
5. 사용자 정보 조회
6. DB에 저장 (첫 로그인 시)
7. 세션 생성 (JWT)
8. 대시보드로 리다이렉트

### CSRF 방어

- NextAuth.js 내장 CSRF 토큰 사용
- state 파라미터 검증

### 비밀번호 보안

- bcrypt 해싱 (salt rounds: 10)
- 평문 비밀번호 저장 금지
- 로그인 실패 시 구체적 오류 메시지 제공하지 않음
  (이메일/비밀번호 중 어느 것이 틀렸는지 노출 X)

---

## 📱 반응형 설계

### Desktop (1280px+)

```
카드 크기: 480px × auto
중앙 정렬 (화면 중앙)
Input 높이: 48px
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
Input 높이: 48px 유지
버튼 높이: 48px 유지
```

---

## 🎨 스타일 코드

```css
/* Form Group */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  font-size: 16px;
  color: var(--gray-900);
  background: white;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input.error {
  border-color: var(--danger-500);
}

.form-error {
  font-size: 12px;
  color: var(--danger-600);
  margin-top: 4px;
}

/* Password Toggle */
.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--gray-400);
}

/* Primary Button (로그인) */
.primary-button {
  width: 100%;
  height: 48px;
  background: var(--primary-600);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-button:hover:not(:disabled) {
  background: var(--primary-700);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  margin: 32px 0;
  color: var(--gray-400);
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--gray-200);
}

.divider::before {
  margin-right: 16px;
}

.divider::after {
  margin-left: 16px;
}
```

---

## 📐 ASCII 스케치

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ← 뒤로                                                  │
│                                                         │
│                    ┌─────────────┐                      │
│                    │   [LOGO]    │                      │
│                    │    CoUp     │                      │
│                    └─────────────┘                      │
│                                                         │
│                 로그인하고 시작하기                       │
│                                                         │
│         ┌───────────────────────────────────┐           │
│         │  이메일                           │           │
│         │  [example@email.com]             │           │
│         └───────────────────────────────────┘           │
│                                                         │
│         ┌───────────────────────────────────┐           │
│         │  비밀번호                         │           │
│         │  [••••••••]                  [👁️]│           │
│         └───────────────────────────────────┘           │
│                                                         │
│         ┌───────────────────────────────────┐           │
│         │          로그인                   │           │
│         └───────────────────────────────────┘           │
│                                                         │
│                   ──── 또는 ────                        │
│                                                         │
│         ┌───────────────────────────────────┐           │
│         │  [G]  Google로 계속하기           │           │
│         └───────────────────────────────────┘           │
│                                                         │
│         ┌───────────────────────────────────┐           │
│         │  [GH]  GitHub로 계속하기          │           │
│         └───────────────────────────────────┘           │
│                                                         │
│         아직 계정이 없으신가요? [회원가입]                │
│                                                         │
│              이용약관  |  개인정보처리방침                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ 완료 체크리스트

- [ ] 카드 레이아웃 구현
- [ ] 이메일/비밀번호 입력 폼
- [ ] 폼 검증 (이메일 형식, 비밀번호 길이)
- [ ] 로그인 버튼 (Credentials)
- [ ] 구분선 (또는)
- [ ] Google 소셜 로그인 버튼
- [ ] GitHub 소셜 로그인 버튼
- [ ] NextAuth.js Credentials Provider 연동
- [ ] NextAuth.js OAuth 연동
- [ ] 로딩 상태 UI
- [ ] 에러 처리 (Toast 또는 인라인 메시지)
- [ ] 비밀번호 표시/숨김 토글
- [ ] 회원가입 페이지 링크
- [ ] 반응형 테스트
- [ ] 키보드 접근성 (Tab 순서)
- [ ] CSRF 토큰 검증

---

**다음 화면**: `03_sign-up.md` (회원가입 페이지)
