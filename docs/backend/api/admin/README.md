# 관리자 API 명세 - 개요

> **버전**: 2.0  
> **Base URL**: `/api/admin`  
> **인증**: NextAuth.js Session (role: ADMIN or SYSTEM_ADMIN)

---

## 📋 API 목록

### 1. 인증 (Authentication)
- `POST /api/admin/auth/verify` - 관리자 권한 확인

### 2. 대시보드 (Dashboard)
- `GET /api/admin/dashboard/stats` - 핵심 지표
- `GET /api/admin/dashboard/recent-users` - 최근 가입 사용자
- `GET /api/admin/dashboard/recent-studies` - 최근 생성 스터디
- `GET /api/admin/dashboard/recent-reports` - 최근 신고
- `GET /api/admin/dashboard/chart-data` - 차트 데이터

### 3. 사용자 관리 (Users)
- `GET /api/admin/users` - 사용자 목록
- `GET /api/admin/users/:id` - 사용자 상세
- `PATCH /api/admin/users/:id/suspend` - 사용자 정지
- `PATCH /api/admin/users/:id/unsuspend` - 정지 해제
- `PATCH /api/admin/users/:id/role` - 역할 변경 (SYSTEM_ADMIN)
- `DELETE /api/admin/users/:id` - 사용자 삭제 (SYSTEM_ADMIN)

### 4. 스터디 관리 (Studies)
- `GET /api/admin/studies` - 스터디 목록
- `GET /api/admin/studies/:id` - 스터디 상세
- `PATCH /api/admin/studies/:id/hide` - 스터디 숨김
- `PATCH /api/admin/studies/:id/close` - 스터디 종료
- `PATCH /api/admin/studies/:id/recommend` - 추천 설정
- `DELETE /api/admin/studies/:id/messages/:messageId` - 메시지 삭제
- `DELETE /api/admin/studies/:id/files/:fileId` - 파일 삭제

### 5. 신고 관리 (Reports)
- `GET /api/admin/reports` - 신고 목록
- `GET /api/admin/reports/:id` - 신고 상세
- `PATCH /api/admin/reports/:id/status` - 상태 변경
- `PATCH /api/admin/reports/:id/assign` - 담당자 배정
- `POST /api/admin/reports/:id/action` - 조치 실행
- `POST /api/admin/reports/:id/comment` - 코멘트 추가

### 6. 콘텐츠 관리 (Content)
- `GET /api/admin/content/filter-words` - 금지어 목록
- `POST /api/admin/content/filter-words` - 금지어 추가 (SYSTEM_ADMIN)
- `DELETE /api/admin/content/filter-words/:id` - 금지어 삭제 (SYSTEM_ADMIN)

### 7. 통계 (Stats)
- `GET /api/admin/stats/users` - 사용자 통계
- `GET /api/admin/stats/studies` - 스터디 통계
- `GET /api/admin/stats/reports` - 신고 통계
- `POST /api/admin/stats/report` - 리포트 생성

### 8. 설정 (Settings)
- `GET /api/admin/settings` - 시스템 설정 조회 (SYSTEM_ADMIN)
- `PATCH /api/admin/settings` - 시스템 설정 변경 (SYSTEM_ADMIN)
- `GET /api/admin/settings/email-templates` - 이메일 템플릿 목록
- `PATCH /api/admin/settings/email-templates/:id` - 템플릿 수정

---

## 🔐 인증 및 권한

### 인증 방식
- **NextAuth.js Session** 기반
- 모든 요청에 세션 쿠키 필요

### 권한 체크
```javascript
// Middleware
export async function middleware(request) {
  const session = await getServerSession(authOptions)
  
  if (!session || !['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // SYSTEM_ADMIN 전용 API 체크
  if (request.url.includes('/settings') && session.user.role !== 'SYSTEM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  return NextResponse.next()
}
```

---

## 📝 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "작업이 완료되었습니다."
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "권한이 없습니다."
  }
}
```

### 페이징 응답
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## 🛠️ 에러 코드

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| `UNAUTHORIZED` | 401 | 인증되지 않은 사용자 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스를 찾을 수 없음 |
| `VALIDATION_ERROR` | 400 | 입력 데이터 유효성 검사 실패 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

---

## 📚 다음 문서

- **[01-auth.md](./01-auth.md)** - 관리자 인증 API
- **[02-dashboard.md](./02-dashboard.md)** - 대시보드 API
- **[03-users.md](./03-users.md)** - 사용자 관리 API
- **[04-studies.md](./04-studies.md)** - 스터디 관리 API
- **[05-reports.md](./05-reports.md)** - 신고 관리 API
- **[06-content.md](./06-content.md)** - 콘텐츠 관리 API
- **[07-stats.md](./07-stats.md)** - 통계 API
- **[08-settings.md](./08-settings.md)** - 설정 API

