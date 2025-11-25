# 관리자 API 명세 - README

> **작성일**: 2025-11-25  
> **목적**: CoUp 플랫폼 관리자 API 전체 개요  
> **권한**: SYSTEM_ADMIN 역할 필수

---

## 📋 개요

관리자 API는 플랫폼 전반을 관리하고 모니터링하기 위한 API입니다. 모든 엔드포인트는 **SYSTEM_ADMIN** 역할을 가진 사용자만 접근 가능합니다.

---

## 🔐 인증 및 권한

### 인증 방식
```http
Authorization: Bearer <JWT_TOKEN>
```

### 권한 확인
- **서버 사이드**: Middleware에서 `session.user.role === 'SYSTEM_ADMIN'` 확인
- **클라이언트 사이드**: 라우트 가드로 관리자 페이지 접근 제한

### 에러 응답
```json
{
  "error": "Forbidden",
  "message": "관리자 권한이 필요합니다",
  "statusCode": 403
}
```

---

## 📁 API 문서 구조

```
docs/backend/api/admin/
├── README.md                    # 📚 이 파일
├── 01-stats.md                  # 📊 통계 API
├── 02-users.md                  # 👥 사용자 관리 API
├── 03-studies.md                # 📚 스터디 관리 API
├── 04-reports.md                # ⚠️ 신고 관리 API
├── 05-analytics.md              # 📈 통계 분석 API
└── 06-settings.md               # ⚙️ 시스템 설정 API
```

---

## 🎯 API 영역별 요약

### 1. 통계 API (`01-stats.md`)
대시보드에 표시되는 실시간 통계 데이터

- `GET /api/admin/stats` - 전체 통계 (사용자, 스터디, 신고)
- `GET /api/admin/stats/realtime` - 실시간 현황
- `GET /api/admin/stats/user-growth` - 사용자 증가 추이
- `GET /api/admin/stats/study-by-category` - 카테고리별 스터디 통계
- `GET /api/admin/system/status` - 시스템 상태 (CPU, 메모리 등)

**총 5개 엔드포인트**

---

### 2. 사용자 관리 API (`02-users.md`)
사용자 조회, 검색, 관리 (정지, 삭제, 역할 변경)

- `GET /api/admin/users` - 사용자 목록 (필터링, 검색, 페이지네이션)
- `GET /api/admin/users/:userId` - 사용자 상세 정보
- `PATCH /api/admin/users/:userId` - 사용자 정보 수정
- `POST /api/admin/users/:userId/suspend` - 계정 정지
- `POST /api/admin/users/:userId/unsuspend` - 계정 정지 해제
- `DELETE /api/admin/users/:userId` - 계정 삭제 (강제)
- `POST /api/admin/users/:userId/send-email` - 개별 이메일 발송
- `POST /api/admin/users/bulk/send-email` - 일괄 이메일 발송
- `POST /api/admin/users/bulk/suspend` - 일괄 계정 정지
- `DELETE /api/admin/users/bulk/delete` - 일괄 계정 삭제
- `GET /api/admin/users/export` - Excel 추출

**총 11개 엔드포인트**

---

### 3. 스터디 관리 API (`03-studies.md`)
스터디 조회, 관리 (숨김, 삭제)

- `GET /api/admin/studies` - 스터디 목록 (필터링, 검색, 페이지네이션)
- `GET /api/admin/studies/:studyId` - 스터디 상세 정보
- `PATCH /api/admin/studies/:studyId` - 스터디 정보 수정
- `POST /api/admin/studies/:studyId/hide` - 스터디 숨김 처리
- `POST /api/admin/studies/:studyId/unhide` - 스터디 숨김 해제
- `DELETE /api/admin/studies/:studyId` - 스터디 삭제 (강제)
- `DELETE /api/admin/studies/:studyId/members/:userId` - 멤버 강제 퇴출
- `DELETE /api/admin/studies/:studyId/content/:contentType/:contentId` - 콘텐츠 삭제
- `POST /api/admin/studies/bulk/hide` - 일괄 숨김 처리
- `DELETE /api/admin/studies/bulk/delete` - 일괄 삭제
- `GET /api/admin/studies/export` - Excel 추출

**총 11개 엔드포인트**

---

### 4. 신고 관리 API (`04-reports.md`)
신고 조회, 처리 (경고, 정지, 삭제, 기각)

- `GET /api/admin/reports` - 신고 목록 (필터링, 검색, 페이지네이션)
- `GET /api/admin/reports/recent` - 최근 신고 (대시보드용)
- `GET /api/admin/reports/:reportId` - 신고 상세 정보
- `POST /api/admin/reports/:reportId/process` - 신고 처리
  - 경고, 정지, 삭제, 기각
- `GET /api/admin/reports/stats` - 신고 통계

**총 5개 엔드포인트**

---

### 5. 통계 분석 API (`05-analytics.md`)
데이터 시각화를 위한 분석 API

- `GET /api/admin/analytics/user-growth` - 사용자 증가 추이
- `GET /api/admin/analytics/user-by-provider` - 가입 방법별 분포
- `GET /api/admin/analytics/user-active` - 활성 사용자 추이 (DAU, WAU, MAU)
- `GET /api/admin/analytics/study-creation` - 스터디 생성 추이
- `GET /api/admin/analytics/study-by-category` - 카테고리별 분포
- `GET /api/admin/analytics/study-avg-members` - 평균 멤버 수 추이
- `GET /api/admin/analytics/activity-daily` - 일별 활동 추이
- `GET /api/admin/analytics/activity-by-type` - 활동 유형별 분포
- `GET /api/admin/analytics/report-by-status` - 신고 처리 현황
- `GET /api/admin/analytics/report-by-type` - 신고 유형별 분포

**총 10개 엔드포인트**

---

### 6. 시스템 설정 API (`06-settings.md`)
플랫폼 설정, 카테고리, 법적 문서 관리

- `GET /api/admin/settings/platform` - 플랫폼 설정 조회
- `PATCH /api/admin/settings/platform` - 플랫폼 설정 수정
- `GET /api/admin/settings/categories` - 카테고리 목록
- `POST /api/admin/settings/categories` - 카테고리 생성
- `PATCH /api/admin/settings/categories/:categoryId` - 카테고리 수정
- `DELETE /api/admin/settings/categories/:categoryId` - 카테고리 삭제
- `PATCH /api/admin/settings/categories/reorder` - 카테고리 순서 변경
- `GET /api/admin/settings/system` - 시스템 설정 조회
- `PATCH /api/admin/settings/system` - 시스템 설정 수정
- `GET /api/admin/settings/legal/:type` - 법적 문서 조회 (terms, privacy)
- `PATCH /api/admin/settings/legal/:type` - 법적 문서 수정

**총 11개 엔드포인트**

---

## 📊 전체 API 개수
- **통계**: 5개
- **사용자 관리**: 11개
- **스터디 관리**: 11개
- **신고 관리**: 5개
- **통계 분석**: 10개
- **시스템 설정**: 11개

**총 53개 엔드포인트**

---

## 🔄 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "작업이 완료되었습니다" // 선택
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "에러 메시지",
  "statusCode": 400
}
```

### 페이지네이션 응답
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 1234,
    "page": 1,
    "limit": 10,
    "totalPages": 124
  }
}
```

---

## 🚨 에러 코드

### 인증 에러
- `401 Unauthorized`: 인증 토큰 없음 또는 만료
- `403 Forbidden`: 관리자 권한 없음

### 요청 에러
- `400 Bad Request`: 잘못된 요청 (필수 파라미터 누락, 유효성 검증 실패)
- `404 Not Found`: 리소스를 찾을 수 없음

### 서버 에러
- `500 Internal Server Error`: 서버 내부 오류
- `503 Service Unavailable`: 서비스 점검 중

---

## 📝 요청 예시

### GET 요청 (쿼리 파라미터)
```http
GET /api/admin/users?status=active&search=kim&page=1&limit=10
Authorization: Bearer <JWT_TOKEN>
```

### POST 요청 (JSON Body)
```http
POST /api/admin/users/:userId/suspend
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "duration": 7,
  "reason": "SPAM",
  "details": "스팸 게시물 반복 작성",
  "sendEmail": true
}
```

### PATCH 요청 (부분 업데이트)
```http
PATCH /api/admin/users/:userId
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "김철수",
  "role": "SYSTEM_ADMIN"
}
```

### DELETE 요청
```http
DELETE /api/admin/users/:userId
Authorization: Bearer <JWT_TOKEN>
```

---


## 🌐 WebSocket 이벤트

### 연결
```javascript
const socket = io('/admin', {
  auth: {
    token: jwt_token
  }
})
```

### 이벤트

#### 1. 통계 업데이트
```javascript
socket.on('admin:stats:update', (data) => {
  // { users: { total: 1234, change: 12 }, ... }
})
```

#### 2. 새 신고 접수
```javascript
socket.on('admin:report:new', (report) => {
  // { id, type, target, reporter, priority, ... }
})
```

#### 3. 시스템 상태 변경
```javascript
socket.on('admin:system:status', (status) => {
  // { cpu: 45, memory: 62, disk: 35, status: 'HEALTHY' }
})
```

---

## 📚 다음 문서

각 영역별 상세 API 명세:

1. **[01-stats.md](./01-stats.md)** - 통계 API
2. **[02-users.md](./02-users.md)** - 사용자 관리 API
3. **[03-studies.md](./03-studies.md)** - 스터디 관리 API
4. **[04-reports.md](./04-reports.md)** - 신고 관리 API
5. **[05-analytics.md](./05-analytics.md)** - 통계 분석 API
6. **[06-settings.md](./06-settings.md)** - 시스템 설정 API

---

**작성일**: 2025-11-25  
**작성자**: GitHub Copilot  
**버전**: 1.0

