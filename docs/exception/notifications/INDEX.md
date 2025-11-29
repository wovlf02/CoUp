# 알림 예외 처리 색인 (INDEX)

**작성일**: 2025-11-29  
**목적**: 알림 관련 예외 상황을 증상별, 카테고리별로 빠르게 찾기

---

## 📋 목차

1. [증상별 찾기](#증상별-찾기)
2. [카테고리별 찾기](#카테고리별-찾기)
3. [에러 코드별 찾기](#에러-코드별-찾기)

---

## 증상별 찾기

### 🔔 알림 생성

| 증상 | 가능한 원인 | 해결 문서 | 페이지 |
|------|-------------|-----------|--------|
| "알림이 생성되지 않음" | API 오류, 권한 문제 | [01-notification-creation.md](./01-notification-creation.md) | §1.1 |
| "중복 알림 발생" | 중복 방지 로직 누락 | [01-notification-creation.md](./01-notification-creation.md) | §1.2 |
| "대량 알림 전송 실패" | 배치 처리 오류 | [01-notification-creation.md](./01-notification-creation.md) | §1.3 |

### 📤 알림 전송

| 증상 | 가능한 원인 | 해결 문서 | 페이지 |
|------|-------------|-----------|--------|
| "알림이 전송되지 않음" | 전송 로직 오류 | [02-notification-delivery.md](./02-notification-delivery.md) | §2.1 |
| "알림이 지연됨" | 큐 처리 지연 | [02-notification-delivery.md](./02-notification-delivery.md) | §2.2 |

### 🎨 UI 문제

| 증상 | 가능한 원인 | 해결 문서 | 페이지 |
|------|-------------|-----------|--------|
| "알림 목록이 로딩되지 않음" | API 오류 | [03-notification-ui.md](./03-notification-ui.md) | §3.1 |
| "읽음 표시가 업데이트 안 됨" | 상태 동기화 오류 | [03-notification-ui.md](./03-notification-ui.md) | §3.2 |
| "필터가 작동하지 않음" | 필터링 로직 오류 | [03-notification-ui.md](./03-notification-ui.md) | §3.3 |

---

## 카테고리별 찾기

### 1️⃣ 알림 생성
**문서**: [01-notification-creation.md](./01-notification-creation.md)

- 알림 생성 실패
- 중복 알림 방지
- 대량 알림 처리
- 우선순위 관리

### 2️⃣ 알림 전송
**문서**: [02-notification-delivery.md](./02-notification-delivery.md)

- 전송 실패 처리
- 재시도 로직
- 배치 전송
- 실시간 전송

### 3️⃣ UI/UX
**문서**: [03-notification-ui.md](./03-notification-ui.md)

- 목록 표시
- 필터링
- 읽음 처리
- 삭제 처리

### 4️⃣ 모범 사례
**문서**: [99-best-practices.md](./99-best-practices.md)

- 알림 전략
- 성능 최적화
- 사용자 경험
- 테스트

---

## 에러 코드별 찾기

### HTTP 에러

| 코드 | 의미 | 해결 방법 | 문서 |
|------|------|-----------|------|
| 400 | Bad Request | 요청 데이터 검증 | [01-notification-creation.md](./01-notification-creation.md) |
| 401 | Unauthorized | 로그인 확인 | 모든 문서 |
| 403 | Forbidden | 권한 확인 | [01-notification-creation.md](./01-notification-creation.md) |
| 404 | Not Found | 알림 존재 확인 | [03-notification-ui.md](./03-notification-ui.md) |
| 500 | Server Error | 서버 로그 확인 | 모든 문서 |

---

**마지막 업데이트**: 2025-11-29

