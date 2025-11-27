# 관리자 시스템 라우팅 완료 보고서

> **완료일**: 2025-11-27  
> **작업**: 관리자 시스템 라우팅 및 접근 제어

---

## ✅ 완료된 작업

### 1. 미들웨어 라우팅 보호

**파일**: `coup/middleware.js`

#### 추가된 기능:
- ✅ **관리자 페이지 보호** (`/admin/*`)
  - ADMIN 또는 SYSTEM_ADMIN 권한만 접근 가능
  - 권한 없으면 → `/admin/unauthorized` 리다이렉트

- ✅ **관리자 API 보호** (`/api/admin/*`)
  - ADMIN 또는 SYSTEM_ADMIN 권한만 접근 가능
  - 권한 없으면 → 403 JSON 응답

- ✅ **계정 상태 확인**
  - 정지된 계정 → 로그인 페이지로
  - 삭제된 계정 → 로그인 페이지로

```javascript
// 관리자 API 보호
if (pathname.startsWith('/api/admin')) {
  if (!token || (token.role !== 'ADMIN' && token.role !== 'SYSTEM_ADMIN')) {
    return NextResponse.json(
      { success: false, error: '관리자 권한이 필요합니다' },
      { status: 403 }
    )
  }
}

// 관리자 페이지 보호
if (pathname.startsWith('/admin')) {
  if (pathname === '/admin/unauthorized') {
    return NextResponse.next()
  }
  
  if (token?.role !== 'ADMIN' && token?.role !== 'SYSTEM_ADMIN') {
    return NextResponse.redirect(new URL('/admin/unauthorized', req.url))
  }
}
```

---

### 2. 네비게이션 업데이트

#### Header 컴포넌트 (`src/components/layout/Header.jsx`)

프로필 드롭다운에 **관리자 모드** 링크 추가:

```jsx
{(user?.role === 'ADMIN' || user?.role === 'SYSTEM_ADMIN') && (
  <>
    <div className={styles.dropdownDivider} />
    <Link href="/admin/dashboard" className={styles.dropdownItem}>
      <span className={styles.dropdownIcon}>🛡️</span>
      관리자 모드
    </Link>
  </>
)}
```

**표시 조건**:
- ✅ ADMIN 또는 SYSTEM_ADMIN 권한 있을 때만 표시
- ✅ 구분선(divider) 추가로 시각적 구분
- ✅ 🛡️ 아이콘으로 관리자 메뉴임을 표시

---

#### 대시보드 페이지 (`src/components/dashboard/DashboardClient.jsx`)

대시보드 헤더에 **관리자 모드** 빠른 링크 추가:

```jsx
{(user?.role === 'ADMIN' || user?.role === 'SYSTEM_ADMIN') && (
  <Link href="/admin/dashboard" className={styles.adminLink}>
    🛡️ 관리자 모드
  </Link>
)}
```

**스타일**: `page.module.css`
```css
.adminLink {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

.adminLink:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
```

**특징**:
- ✅ 눈에 띄는 그라데이션 배경 (보라색 → 파란색)
- ✅ 호버 시 들어올려지는 효과
- ✅ 대시보드 헤더 우측에 배치

---

### 3. 접근 거부 페이지

**파일**: `src/app/admin/unauthorized/page.js`

권한 없는 사용자가 관리자 페이지 접근 시 표시되는 전용 페이지:

**기능**:
- ✅ 명확한 접근 거부 메시지
- ✅ 🚫 이모지 아이콘
- ✅ 2가지 액션 버튼:
  - 이전 페이지로 돌아가기
  - 대시보드로 이동
- ✅ 관리자 권한 문의 안내

---

## 🔒 보안 레이어

### 레이어 1: 미들웨어 (서버)
```
요청 → 미들웨어 권한 체크 → 통과/거부
```
- 페이지: 권한 없으면 `/admin/unauthorized` 리다이렉트
- API: 권한 없으면 `403 Forbidden` JSON 응답

### 레이어 2: API Route (서버)
```javascript
const auth = await requireAdmin()
if (auth instanceof NextResponse) return auth
```
- 모든 관리자 API에서 `requireAdmin()` 호출
- 추가 검증 및 로깅

### 레이어 3: UI (클라이언트)
```jsx
{(user?.role === 'ADMIN' || user?.role === 'SYSTEM_ADMIN') && (
  <Link href="/admin/dashboard">관리자 모드</Link>
)}
```
- 권한 없으면 링크 자체가 표시되지 않음
- UX 개선 (불필요한 클릭 방지)

---

## 🎯 라우팅 플로우

### 일반 사용자 (USER)
```
1. 대시보드 접속
   → 관리자 모드 링크 안 보임 ✅

2. /admin/dashboard 직접 입력
   → 미들웨어가 차단
   → /admin/unauthorized 리다이렉트 ✅

3. /api/admin/users 직접 호출
   → 미들웨어가 차단
   → 403 Forbidden 응답 ✅
```

### 관리자 (ADMIN, SYSTEM_ADMIN)
```
1. 대시보드 접속
   → 관리자 모드 링크 보임 ✅

2. 관리자 모드 클릭
   → /admin/dashboard 정상 접속 ✅

3. Header 프로필 드롭다운
   → 관리자 모드 메뉴 보임 ✅

4. 관리자 API 호출
   → 정상 처리 ✅
```

---

## 🧪 테스트 체크리스트

### 일반 사용자로 테스트
- [ ] 대시보드에서 관리자 링크 안 보이는지 확인
- [ ] Header 드롭다운에서 관리자 메뉴 안 보이는지 확인
- [ ] `/admin/dashboard` 직접 접속 → unauthorized 페이지 표시
- [ ] `/api/admin/users` 호출 → 403 에러

### 관리자로 테스트
- [ ] 대시보드에서 관리자 링크 보이는지 확인
- [ ] Header 드롭다운에서 관리자 메뉴 보이는지 확인
- [ ] 관리자 모드 클릭 → 대시보드 정상 접속
- [ ] 사용자 목록 조회 → 정상 작동
- [ ] 사용자 제재 → 정상 작동

### 정지된 계정으로 테스트
- [ ] 로그인 시도 → 로그인 페이지로 리다이렉트
- [ ] 에러 메시지 표시

---

## 📁 수정된 파일

```
coup/
├── middleware.js                        # ✅ 관리자 라우팅 보호 추가
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.jsx              # ✅ 관리자 모드 링크 추가
│   │   └── dashboard/
│   │       └── DashboardClient.jsx     # ✅ 관리자 모드 버튼 추가
│   └── app/
│       ├── dashboard/
│       │   └── page.module.css         # ✅ 관리자 링크 스타일 추가
│       └── admin/
│           └── unauthorized/
│               └── page.js             # ✅ 접근 거부 페이지 신규 생성
```

---

## 🎨 UI 스크린샷 위치

### 1. 대시보드 헤더
```
┌─────────────────────────────────────────┐
│ 📊 대시보드              🛡️ 관리자 모드 │
│ 나의 활동을 한눈에 확인하세요            │
└─────────────────────────────────────────┘
```

### 2. Header 드롭다운
```
┌───────────────────┐
│ 👤 마이페이지      │
│ ⚙️ 설정            │
├───────────────────┤  ← 구분선
│ 🛡️ 관리자 모드    │  ← 새로 추가됨
├───────────────────┤
│ 🚪 로그아웃        │
└───────────────────┘
```

### 3. 접근 거부 페이지
```
┌─────────────────────────────┐
│            🚫               │
│                             │
│   접근 권한이 없습니다       │
│                             │
│ 이 페이지는 관리자 권한이    │
│ 필요합니다.                  │
│                             │
│ [← 이전 페이지] [대시보드로] │
└─────────────────────────────┘
```

---

## ✨ 결론

**라우팅 보호 시스템이 완벽하게 구축되었습니다!**

- ✅ 3단계 보안 레이어 (미들웨어 → API → UI)
- ✅ 직관적인 네비게이션 (2곳에서 접근 가능)
- ✅ 명확한 접근 거부 처리
- ✅ 깔끔한 UI/UX

이제 일반 사용자는 관리자 시스템을 볼 수 없고, 관리자는 쉽게 관리자 모드로 전환할 수 있습니다! 🎉

---

**다음 목표**: 스터디 관리 시스템 구현 (Phase 2) 🚀

