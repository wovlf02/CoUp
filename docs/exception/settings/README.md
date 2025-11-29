# 설정 예외 처리 가이드

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**카테고리**: Settings Management  
**난이도**: ⭐⭐⭐ (중급)

---

## 📋 목차

1. [개요](#개요)
2. [설정 카테고리](#설정-카테고리)
3. [아키텍처](#아키텍처)
4. [예외 상황 분류](#예외-상황-분류)
5. [문서 구조](#문서-구조)
6. [빠른 참조](#빠른-참조)

---

## 개요

### 설정 관리란?

설정 관리는 사용자가 계정 정보, 알림, 테마, 개인정보 등을 관리하는 기능입니다. CoUp은 다음 설정을 제공합니다:

- **계정 설정**: 비밀번호 변경, 이메일 변경
- **알림 설정**: 알림 종류별 on/off
- **테마 설정**: 다크 모드, 폰트 크기
- **개인정보 설정**: 공개 범위, 검색 허용

---

## 설정 카테고리

### 1. 계정 설정 (Account Settings)

**기능**:
- 비밀번호 변경
- 이메일 변경 (인증 필요)
- 2단계 인증 설정

**파일**:
- `src/app/user/settings/components/PasswordChange.jsx`
- `src/app/api/users/me/password/route.js`

### 2. 알림 설정 (Notification Settings)

**기능**:
- 스터디 알림 on/off
- 할일 알림 on/off
- 채팅 알림 on/off
- 이메일 알림 on/off

**파일**:
- `src/app/user/settings/components/NotificationSettings.jsx`

### 3. 테마 설정 (Theme Settings)

**기능**:
- 다크/라이트 모드
- 폰트 크기 조절
- 컬러 테마 선택

**파일**:
- `src/app/user/settings/components/ThemeSettings.jsx`
- `src/contexts/ThemeContext.jsx`

---

## 아키텍처

### 컴포넌트 구조

```
src/app/user/settings/
├── page.jsx                      # 메인 설정 페이지
└── components/
    ├── ProfileEdit.jsx           # 프로필 수정
    ├── PasswordChange.jsx        # 비밀번호 변경
    ├── NotificationSettings.jsx  # 알림 설정
    └── ThemeSettings.jsx         # 테마 설정
```

### API 구조

```
src/app/api/
├── users/me/
│   └── password/
│       └── route.js             # 비밀번호 변경 API
└── user/settings/
    ├── notifications/
    │   └── route.js             # 알림 설정 API
    └── theme/
        └── route.js             # 테마 설정 API
```

---

## 예외 상황 분류

### 1. 비밀번호 변경 예외
- 최소 길이 미달
- 비밀번호 강도 부족
- 비밀번호 확인 불일치
- 현재 비밀번호 확인 실패
- OAuth 사용자 제한
- Rate Limiting

### 2. 알림 설정 예외
- 필수 알림 비활성화 방지
- 브라우저 권한 거부
- FCM 토큰 등록 실패
- Service Worker 등록 실패
- 멀티 디바이스 동기화

### 3. 테마 설정 예외
- 시스템 테마 감지 실패
- 테마 전환 깜빡임
- 폰트 크기 레이아웃 깨짐
- 대비율 부족
- LocalStorage 오류

---

## 문서 구조

```
settings/
├── README.md                               # 📖 본 문서
├── INDEX.md                                # 📇 전체 색인
├── 01-password-change-exceptions.md        # 🔒 비밀번호 변경
├── 02-notification-settings-exceptions.md  # 🔔 알림 설정
├── 03-theme-settings-exceptions.md         # 🎨 테마 설정
├── 99-best-practices.md                    # ✨ 모범 사례
└── COMPLETION-REPORT.md                    # ✅ 완료 보고서
```

---

## 빠른 참조

### 긴급 문제 해결

#### 🆘 비밀번호 변경 실패
```javascript
// 1. 현재 비밀번호 확인
const isValid = await bcrypt.compare(currentPassword, user.password)

// 2. 새 비밀번호 검증
if (newPassword.length < 8) {
  throw new Error('비밀번호는 최소 8자 이상')
}

// 3. OAuth 사용자 체크
if (!user.password) {
  throw new Error('소셜 로그인 사용자는 비밀번호 변경 불가')
}
```

#### 🆘 푸시 알림 안 됨
```javascript
// 1. 브라우저 권한 확인
console.log(Notification.permission) // 'granted' 여야 함

// 2. Service Worker 확인
navigator.serviceWorker.ready.then(reg => {
  console.log('SW ready:', reg)
})

// 3. FCM 토큰 확인
const token = await getToken(messaging)
console.log('FCM token:', token)
```

#### 🆘 테마가 적용 안 됨
```javascript
// 1. localStorage 확인
console.log(localStorage.getItem('theme'))

// 2. data-theme 속성 확인
console.log(document.documentElement.getAttribute('data-theme'))

// 3. CSS 변수 확인
getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
```

---

## 📚 추가 리소스

- [비밀번호 보안 가이드](01-password-change-exceptions.md)
- [알림 시스템 가이드](02-notification-settings-exceptions.md)
- [테마 구현 가이드](03-theme-settings-exceptions.md)
- [설정 관리 모범 사례](99-best-practices.md)

---

**문서 완료!**
```

### API 라우트

```
src/app/api/
├── users/me/
│   ├── password/route.js             # 비밀번호 변경
│   └── settings/route.js             # 사용자 설정
│
└── settings/
    └── route.js                      # 시스템 설정
```

---

## API 엔드포인트

### 1. 비밀번호 변경

```http
PATCH /api/users/me/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "old123456",
  "newPassword": "new123456"
}
```

**응답**:
```json
{
  "success": true,
  "message": "비밀번호가 변경되었습니다"
}
```

### 2. 알림 설정 저장

```http
POST /api/users/me/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "notifications": {
    "study": true,
    "task": true,
    "chat": false,
    "email": true
  }
}
```

---

## 예외 상황 분류

### 1. 비밀번호 변경 예외

| 예외 | 원인 | 영향도 | 문서 |
|------|------|--------|------|
| 현재 비밀번호 불일치 | 잘못된 입력 | 🟡 중간 | [01-account-settings-exceptions.md](./01-account-settings-exceptions.md#비밀번호-변경) |
| 새 비밀번호 검증 실패 | 약한 비밀번호 | 🟢 낮음 | [01-account-settings-exceptions.md](./01-account-settings-exceptions.md#비밀번호-검증) |
| 변경 실패 | DB 오류 | 🔴 높음 | [01-account-settings-exceptions.md](./01-account-settings-exceptions.md#변경-실패) |

### 2. 알림 설정 예외

| 예외 | 원인 | 영향도 | 문서 |
|------|------|--------|------|
| 저장 실패 | 네트워크 오류 | 🟡 중간 | [02-notification-settings-exceptions.md](./02-notification-settings-exceptions.md#저장-실패) |
| 권한 오류 | 푸시 권한 없음 | 🟢 낮음 | [02-notification-settings-exceptions.md](./02-notification-settings-exceptions.md#권한-오류) |

### 3. 테마 설정 예외

| 예외 | 원인 | 영향도 | 문서 |
|------|------|--------|------|
| 테마 적용 실패 | CSS 로드 오류 | 🟢 낮음 | [03-theme-settings-exceptions.md](./03-theme-settings-exceptions.md#테마-적용) |
| LocalStorage 오류 | 브라우저 제한 | 🟡 중간 | [03-theme-settings-exceptions.md](./03-theme-settings-exceptions.md#저장-오류) |

---

## 문서 구조

### 설정 문서 (docs/exception/settings/)

1. **[README.md](./README.md)** (현재 문서)
   - 설정 시스템 개요
   - 아키텍처 및 API
   - 빠른 참조

2. **[INDEX.md](./INDEX.md)**
   - 증상별 찾기
   - 카테고리별 색인

3. **[01-account-settings-exceptions.md](./01-account-settings-exceptions.md)**
   - 비밀번호 변경
   - 이메일 변경
   - 2단계 인증

4. **[02-notification-settings-exceptions.md](./02-notification-settings-exceptions.md)**
   - 알림 설정 저장
   - 푸시 권한 관리

5. **[03-theme-settings-exceptions.md](./03-theme-settings-exceptions.md)**
   - 테마 적용
   - LocalStorage 관리

6. **[04-privacy-settings-exceptions.md](./04-privacy-settings-exceptions.md)**
   - 공개 범위 설정
   - 검색 허용

7. **[99-best-practices.md](./99-best-practices.md)**
   - 설정 관리 모범 사례

---

## 빠른 참조

### 자주 발생하는 문제

#### 1. "현재 비밀번호가 일치하지 않습니다"

**원인**: 잘못된 현재 비밀번호 입력

**해결**:
```javascript
// 서버에서 bcrypt로 비밀번호 확인
const isValid = await bcrypt.compare(currentPassword, user.password)

if (!isValid) {
  return NextResponse.json(
    { error: "현재 비밀번호가 일치하지 않습니다" },
    { status: 400 }
  )
}
```

#### 2. "알림 설정을 저장할 수 없습니다"

**원인**: 네트워크 오류 또는 권한 문제

**해결**:
```javascript
try {
  await saveNotificationSettings(settings)
  toast.success('설정이 저장되었습니다')
} catch (error) {
  toast.error('설정 저장에 실패했습니다')
  // 이전 설정으로 롤백
}
```

---

## 관련 문서

### 프로필 관련
- [프로필 예외 처리](../profile/README.md)
- [계정 삭제](../profile/03-account-deletion-exceptions.md)

### 인증 관련
- [인증 예외 처리](../auth/README.md)
- [세션 관리](../auth/03-session-management-exceptions.md)

---

## 버전 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0.0 | 2025-11-29 | 초기 문서 작성 | CoUp Team |

---

**다음 문서**: [설정 색인 (INDEX.md)](./INDEX.md)  
**이전 문서**: [프로필 모범 사례](../profile/99-best-practices.md)  
**상위 문서**: [예외 처리 메인](../README.md)

