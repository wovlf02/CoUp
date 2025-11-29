# 설정 예외 처리 전체 색인

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**문서 수**: 6개  

---

## 📑 빠른 네비게이션

| 문서 | 설명 | 주요 내용 |
|------|------|-----------|
| [README.md](README.md) | 개요 및 가이드 | 전체 구조, 빠른 참조 |
| [INDEX.md](INDEX.md) | 📖 본 문서 | 전체 색인 |
| [01-password-change-exceptions.md](01-password-change-exceptions.md) | 🔒 비밀번호 변경 | 검증, 보안, UI/UX |
| [02-notification-settings-exceptions.md](02-notification-settings-exceptions.md) | 🔔 알림 설정 | 푸시, 이메일, FCM |
| [03-theme-settings-exceptions.md](03-theme-settings-exceptions.md) | 🎨 테마 설정 | 다크모드, 접근성 |
| [99-best-practices.md](99-best-practices.md) | ✨ 모범 사례 | 설계, 최적화 |

---

## 🔍 키워드별 색인

### A-F
- **접근성 (Accessibility)** → [03-theme-settings-exceptions.md](03-theme-settings-exceptions.md#접근성-고려)
- **bcrypt** → [01-password-change-exceptions.md](01-password-change-exceptions.md#현재-비밀번호-확인-실패)
- **대비율 (Contrast Ratio)** → [03-theme-settings-exceptions.md](03-theme-settings-exceptions.md#대비율-검증)
- **Debouncing** → [99-best-practices.md](99-best-practices.md#debouncing)
- **FCM** → [02-notification-settings-exceptions.md](02-notification-settings-exceptions.md#fcm-토큰-등록-실패)

### L-P
- **LocalStorage** → [99-best-practices.md](99-best-practices.md#3-tier-저장-전략)
- **낙관적 업데이트 (Optimistic Update)** → [99-best-practices.md](99-best-practices.md#낙관적-업데이트)
- **비밀번호 (Password)** → [01-password-change-exceptions.md](01-password-change-exceptions.md)
- **푸시 알림 (Push Notification)** → [02-notification-settings-exceptions.md](02-notification-settings-exceptions.md#푸시-알림-예외)

### R-Z
- **Rate Limiting** → [01-password-change-exceptions.md](01-password-change-exceptions.md#rate-limiting)
- **Service Worker** → [02-notification-settings-exceptions.md](02-notification-settings-exceptions.md#service-worker-등록-실패)
- **테마 (Theme)** → [03-theme-settings-exceptions.md](03-theme-settings-exceptions.md)
- **검증 (Validation)** → [99-best-practices.md](99-best-practices.md#설정-값-검증)
- **Zod** → [99-best-practices.md](99-best-practices.md#zod-스키마)

---

## 📋 예외 상황별 색인

### 🔴 Critical (치명적)

| 예외 상황 | 문서 | 우선순위 |
|-----------|------|----------|
| 현재 비밀번호 확인 실패 | [01-password-change-exceptions.md](01-password-change-exceptions.md#현재-비밀번호-확인-실패) | 🔥 최고 |
| 데이터베이스 오류 | [01-password-change-exceptions.md](01-password-change-exceptions.md#데이터베이스-오류) | 🔥 최고 |
| FCM 토큰 등록 실패 | [02-notification-settings-exceptions.md](02-notification-settings-exceptions.md#fcm-토큰-등록-실패) | 🔥 최고 |

### 🟡 High (높음)

| 예외 상황 | 문서 | 우선순위 |
|-----------|------|----------|
| 비밀번호 강도 부족 | [01-password-change-exceptions.md](01-password-change-exceptions.md#비밀번호-강도-부족) | ⚠️ 높음 |
| 브라우저 권한 거부 | [02-notification-settings-exceptions.md](02-notification-settings-exceptions.md#브라우저-권한-요청) | ⚠️ 높음 |
| 테마 전환 깜빡임 | [03-theme-settings-exceptions.md](03-theme-settings-exceptions.md#테마-전환-깜빡임-방지) | ⚠️ 높음 |

### 🟢 Medium (중간)

| 예외 상황 | 문서 | 우선순위 |
|-----------|------|----------|
| OAuth 사용자 제한 | [01-password-change-exceptions.md](01-password-change-exceptions.md#oauth-사용자) | ℹ️ 중간 |
| 멀티 디바이스 동기화 | [02-notification-settings-exceptions.md](02-notification-settings-exceptions.md#여러-디바이스-동기화) | ℹ️ 중간 |
| 폰트 크기 레이아웃 | [03-theme-settings-exceptions.md](03-theme-settings-exceptions.md#레이아웃-깨짐-방지) | ℹ️ 중간 |

---

## 🎯 기능별 색인

### 비밀번호 변경

```
01-password-change-exceptions.md
├── 1. 비밀번호 검증
│   ├── 최소 길이 미달
│   ├── 강도 부족
│   ├── 확인 불일치
│   └── 현재 비밀번호와 동일
├── 2. 보안
│   ├── 현재 비밀번호 확인
│   ├── Rate Limiting
│   └── 세션 만료
├── 3. UI
│   ├── 입력 마스킹
│   ├── 복사 방지
│   └── 폼 초기화
└── 4. API
    ├── OAuth 사용자
    └── 데이터베이스 오류
```

### 알림 설정

```
02-notification-settings-exceptions.md
├── 1. 알림 타입
│   ├── 필수 알림 보호
│   └── 알림 설정 검증
├── 2. 저장/동기화
│   ├── 자동 vs 명시적 저장
│   ├── 낙관적 업데이트
│   └── 멀티 디바이스 동기화
├── 3. 브라우저 권한
│   ├── 권한 요청
│   └── Safari 제한
└── 4. 푸시 알림
    ├── FCM 토큰
    ├── Service Worker
    └── 알림 전송 실패
```

### 테마 설정

```
03-theme-settings-exceptions.md
├── 1. 다크/라이트 모드
│   ├── 시스템 설정 감지
│   ├── 깜빡임 방지
│   └── 전환 애니메이션
├── 2. 폰트 크기
│   ├── CSS 변수 기반
│   ├── 레이아웃 깨짐 방지
│   └── 접근성 고려
├── 3. 컬러 테마
│   ├── 강조색 변경
│   ├── 대비율 검증
│   └── 색각 이상 지원
└── 4. 시스템 동기화
    ├── OS 테마 변경 감지
    ├── 저장 및 복원
    └── 초기 로딩 최적화
```

---

## 📊 통계

### 문서 통계
- **총 문서 수**: 6개
- **총 라인 수**: ~2,500줄
- **코드 예제**: 80개+
- **테스트 케이스**: 30개+

### 예외 상황 커버리지
- **비밀번호 변경**: 15개
- **알림 설정**: 20개
- **테마 설정**: 18개
- **총 예외 상황**: 53개

---

## 🔗 관련 문서

### 내부 문서
- [프로필 예외 처리](../profile/INDEX.md)
- [인증 예외 처리](../auth/INDEX.md)
- [알림 예외 처리](../notifications/INDEX.md)

### 외부 리소스
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [WCAG 접근성 가이드](https://www.w3.org/WAI/WCAG21/quickref/)

---

**색인 끝** - 설정 예외 처리 완전 가이드
