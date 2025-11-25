# 관리자 API - 나머지 영역 (간략 버전)

> **작성일**: 2025-11-25  
> **권한**: SYSTEM_ADMIN

---

## 3️⃣ 스터디 관리 API

### 주요 엔드포인트
- `GET /api/admin/studies` - 목록 (필터: visibility, category, search)
- `GET /api/admin/studies/:studyId` - 상세
- `PATCH /api/admin/studies/:studyId` - 수정
- `POST /api/admin/studies/:studyId/hide` - 숨김 처리
- `DELETE /api/admin/studies/:studyId` - 삭제
- `DELETE /api/admin/studies/:studyId/members/:userId` - 멤버 강제 퇴출
- `DELETE /api/admin/studies/:studyId/content/:contentType/:contentId` - 콘텐츠 삭제
- `POST /api/admin/studies/bulk/hide` - 일괄 숨김
- `DELETE /api/admin/studies/bulk/delete` - 일괄 삭제
- `GET /api/admin/studies/export` - Excel 추출

---

## 4️⃣ 신고 관리 API

### 주요 엔드포인트
- `GET /api/admin/reports` - 목록 (필터: status, priority, type)
- `GET /api/admin/reports/recent?limit=3` - 최근 신고
- `GET /api/admin/reports/:reportId` - 상세
- `POST /api/admin/reports/:reportId/process` - 처리
  - Body: `{ action: 'WARN' | 'SUSPEND' | 'DELETE' | 'REJECT', ... }`
- `GET /api/admin/reports/stats` - 신고 통계

---

## 5️⃣ 통계 분석 API

### 사용자 분석
- `GET /api/admin/analytics/user-growth?period=month`
- `GET /api/admin/analytics/user-by-provider`
- `GET /api/admin/analytics/user-active?period=month` (DAU/WAU/MAU)

### 스터디 분석
- `GET /api/admin/analytics/study-creation?period=month`
- `GET /api/admin/analytics/study-by-category`
- `GET /api/admin/analytics/study-avg-members?period=month`

### 활동 분석
- `GET /api/admin/analytics/activity-daily?days=30`
- `GET /api/admin/analytics/activity-by-type`

### 신고 분석
- `GET /api/admin/analytics/report-by-status`
- `GET /api/admin/analytics/report-by-type`

---

## 6️⃣ 시스템 설정 API

### 플랫폼 설정
- `GET /api/admin/settings/platform`
- `PATCH /api/admin/settings/platform`
  - Body: `{ announcement, showAnnouncement, maintenanceMode, ... }`

### 카테고리 관리
- `GET /api/admin/settings/categories`
- `POST /api/admin/settings/categories`
  - Body: `{ name, emoji, order }`
- `PATCH /api/admin/settings/categories/:categoryId`
- `DELETE /api/admin/settings/categories/:categoryId`
- `PATCH /api/admin/settings/categories/reorder`
  - Body: `{ orders: [{ id, order }] }`

### 시스템 설정
- `GET /api/admin/settings/system`
- `PATCH /api/admin/settings/system`
  - Body: `{ maxFileSize, maxStudyMembers, blockedIPs, bannedWords, ... }`

### 법적 문서
- `GET /api/admin/settings/legal/:type` (type: terms, privacy)
- `PATCH /api/admin/settings/legal/:type`
  - Body: `{ content, version }`

---

**전체 API 문서**: [README.md](./README.md)

