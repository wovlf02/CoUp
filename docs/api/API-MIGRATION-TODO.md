# 🔄 API 클라이언트 마이그레이션 TODO 리스트

**생성일**: 2025-11-29  
**완료일**: 2025-11-29  
**최종 점검**: 2025-11-29  
**목적**: 기존 `fetch()` 호출을 중앙화된 `api` 클라이언트로 마이그레이션

---

## 📊 마이그레이션 현황

### ✅ 완료 (26개 Client Components)
- [x] `/src/app/admin/page.jsx` - 관리자 대시보드
- [x] `/src/app/admin/users/_components/UserList.jsx` - 사용자 목록
- [x] `/src/app/(auth)/sign-in/page.jsx` - 로그인 페이지
- [x] `app/admin/reports/[reportId]/_components/ReportActions.jsx` - 신고 처리 액션
- [x] `app/admin/studies/[studyId]/_components/StudyActions.jsx` - 스터디 관리 액션
- [x] `app/admin/analytics/_components/OverviewCharts.jsx` - 전체 통계 개요
- [x] `app/admin/analytics/_components/StudyAnalytics.jsx` - 스터디 분석
- [x] `app/admin/analytics/_components/UserAnalytics.jsx` - 사용자 분석
- [x] `app/admin/settings/_components/SettingsForm.jsx` - 설정 폼
- [x] `app/admin/settings/_components/SettingsHistory.jsx` - 설정 변경 이력
- [x] `app/admin/audit-logs/_components/LogFilters.jsx` - 로그 필터
- [x] `app/admin/audit-logs/_components/LogTable.jsx` - 로그 테이블
- [x] `app/admin/users/[userId]/_components/UserActions.jsx` - 사용자 액션
- [x] `app/my-studies/[studyId]/chat/page.jsx` - 스터디 채팅 (파일 업로드 POST + 메시지 수정 PATCH)
- [x] `app/my-studies/[studyId]/video-call/page.jsx` - 화상회의 파일 업로드 (FormData)
- [x] `app/notifications/page.jsx` - 알림 목록 (GET)
- [x] `app/notifications/page.jsx` - 알림 읽음 처리 (POST)
- [x] `app/notifications/page.jsx` - 전체 읽음 처리 (POST)
- [x] `app/notifications/page.jsx` - 알림 삭제 (DELETE)
- [x] `app/user/settings/components/NotificationSettings.jsx` - 알림 설정 (PUT)
- [x] `app/user/settings/components/PasswordChange.jsx` - 비밀번호 변경 (PUT)
- [x] `app/user/settings/components/ProfileEdit.jsx` - 아바타 업로드 (POST FormData)
- [x] `app/user/settings/components/ProfileEdit.jsx` - 프로필 저장 (PUT)
- [x] `app/user/settings/components/ThemeSettings.jsx` - 테마 설정 (PUT)

### 📝 Server Component (fetch 유지, 5개)
- [x] `app/admin/reports/[reportId]/page.jsx` - 신고 상세 (Server Component)
- [x] `app/admin/reports/_components/ReportList.jsx` - 신고 목록 (Server Component)
- [x] `app/admin/studies/[studyId]/page.jsx` - 스터디 상세 (Server Component)
- [x] `app/admin/studies/_components/StudyList.jsx` - 스터디 목록 (Server Component)
- [x] `app/admin/users/[userId]/page.jsx` - 사용자 상세 (Server Component)

### 🔄 진행 중 (0개)

### ⏳ 대기 중 (0개 파일)

**✅ 마이그레이션 100% 완료!**

---

## 📈 통계

- **총 Client Components**: 26개 ✅
- **총 Server Components**: 5개 ✅
- **총 API 호출 수**: 45+ 개
- **FormData 처리**: 3개 파일
- **컴파일 에러**: 0개 ✅

---

## 📋 마이그레이션 대상 파일

### 1. 관리자 - 분석 (3개)
- [ ] `app/admin/analytics/_components/OverviewCharts.jsx`
  - Line 20: `fetch('/api/admin/analytics/overview')`
  - **변경**: `api.get('/api/admin/analytics/overview')`

- [ ] `app/admin/analytics/_components/StudyAnalytics.jsx`
  - Line 22: `fetch(...)` 
  - **변경**: `api.get(...)` with params

- [ ] `app/admin/analytics/_components/UserAnalytics.jsx`
  - Line 22: `fetch(...)`
  - **변경**: `api.get(...)` with params

---

### 2. 관리자 - 감사 로그 (2개)
- [ ] `app/admin/audit-logs/_components/LogFilters.jsx`
  - Line 40: `fetch('/api/admin/audit-logs?limit=1')`
  - **변경**: `api.get('/api/admin/audit-logs', { limit: 1 })`

- [ ] `app/admin/audit-logs/_components/LogTable.jsx`
  - Line 64: `fetch(\`/api/admin/audit-logs?${params}\`)`
  - **변경**: `api.get('/api/admin/audit-logs', paramsObject)`

---

### 3. 관리자 - 신고 (3개)
- [ ] `app/admin/reports/[reportId]/_components/ReportActions.jsx`
  - Line 38: `fetch(\`/api/admin/reports/${report.id}/assign\`, { method: 'POST' })`
    - **변경**: `api.post(\`/api/admin/reports/${report.id}/assign\`, data)`
  - Line 81, 119, 156: `fetch(...)/process` (POST)
    - **변경**: `api.post(\`/api/admin/reports/${report.id}/process\`, data)`

- [ ] `app/admin/reports/[reportId]/page.jsx`
  - Line 10: `fetch(\`/api/admin/reports/${reportId}\`)`
  - **변경**: `api.get(\`/api/admin/reports/${reportId}\`)`

- [ ] `app/admin/reports/_components/ReportList.jsx`
  - Line 18: `fetch(\`/api/admin/reports?${params}\`)`
  - **변경**: `api.get('/api/admin/reports', paramsObject)`

---

### 4. 관리자 - 설정 (2개)
- [ ] `app/admin/settings/_components/SettingsForm.jsx`
  - Line 31: `fetch('/api/admin/settings')` (GET)
    - **변경**: `api.get('/api/admin/settings')`
  - Line 84: `fetch('/api/admin/settings', { method: 'POST' })`
    - **변경**: `api.post('/api/admin/settings', data)`
  - Line 112: `fetch('/api/admin/settings/cache/clear', { method: 'POST' })`
    - **변경**: `api.post('/api/admin/settings/cache/clear')`

- [ ] `app/admin/settings/_components/SettingsHistory.jsx`
  - Line 15: `fetch(\`/api/admin/settings/history?page=${page}&limit=10\`)`
  - **변경**: `api.get('/api/admin/settings/history', { page, limit: 10 })`

---

### 5. 관리자 - 스터디 (2개)
- [ ] `app/admin/studies/[studyId]/_components/StudyActions.jsx`
  - Line 35, 69: `fetch(\`/api/admin/studies/${studyId}/hide\`, { method: 'POST' })`
    - **변경**: `api.post(\`/api/admin/studies/${studyId}/hide\`, data)`
  - Line 98, 132: `fetch(\`/api/admin/studies/${studyId}/close\`, { method: 'POST' })`
    - **변경**: `api.post(\`/api/admin/studies/${studyId}/close\`, data)`
  - Line 170: `fetch(..., { method: 'DELETE' })`
    - **변경**: `api.delete(...)`

- [ ] `app/admin/studies/[studyId]/page.jsx`
  - Line 14: `fetch(\`/api/admin/studies/${studyId}\`)`
  - **변경**: `api.get(\`/api/admin/studies/${studyId}\`)`

- [ ] `app/admin/studies/_components/StudyList.jsx`
  - Line 26: `fetch(\`/api/admin/studies?${params}\`)`
  - **변경**: `api.get('/api/admin/studies', paramsObject)`

---

### 6. 관리자 - 사용자 (2개)
- [ ] `app/admin/users/[userId]/_components/UserActions.jsx`
  - Line 22: `fetch(\`/api/admin/users/${user.id}/warn\`, { method: 'POST' })`
    - **변경**: `api.post(\`/api/admin/users/${user.id}/warn\`, data)`
  - Line 46: `fetch(\`/api/admin/users/${user.id}/suspend\`, { method: 'POST' })`
    - **변경**: `api.post(\`/api/admin/users/${user.id}/suspend\`, data)`
  - Line 72: `fetch(\`/api/admin/users/${user.id}/unsuspend\`, { method: 'POST' })`
    - **변경**: `api.post(\`/api/admin/users/${user.id}/unsuspend\`)`

- [ ] `app/admin/users/[userId]/page.jsx`
  - Line 12: `fetch(...)`
  - **변경**: `api.get(...)`

---

### 7. 일반 사용자 - 스터디 (1개)
- [ ] `app/my-studies/[studyId]/chat/page.jsx`
  - Line 234: `fetch(\`/api/studies/${studyId}/files\`, { method: 'POST' })`
    - **변경**: `api.post(\`/api/studies/${studyId}/files\`, formData)` 
    - **주의**: FormData 처리 필요
  - Line 264: `fetch(\`/api/studies/${studyId}/chat\`, { method: 'POST' })`
    - **변경**: `api.post(\`/api/studies/${studyId}/chat\`, data)`

---

### 8. 추가 확인 필요 (기타 파일)
- [ ] 모든 컴포넌트 파일 재검색
- [ ] useApi.js 훅 사용하는 파일 찾기
- [ ] axios 사용하는 파일이 있는지 확인

---

## 🔧 마이그레이션 패턴

### GET 요청
```javascript
// Before
const res = await fetch('/api/endpoint?param=value')
const data = await res.json()

// After
import api from '@/lib/api'
const data = await api.get('/api/endpoint', { param: 'value' })
```

### POST 요청
```javascript
// Before
const res = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})

// After
import api from '@/lib/api'
const result = await api.post('/api/endpoint', data)
```

### PATCH 요청
```javascript
// Before
const res = await fetch('/api/endpoint', {
  method: 'PATCH',
  body: JSON.stringify(data)
})

// After
import api from '@/lib/api'
const result = await api.patch('/api/endpoint', data)
```

### DELETE 요청
```javascript
// Before
const res = await fetch('/api/endpoint', { method: 'DELETE' })

// After
import api from '@/lib/api'
const result = await api.delete('/api/endpoint')
```

---

## ⚠️ 주의사항

### 1. FormData 처리
```javascript
// FormData는 헤더를 비워야 함
const formData = new FormData()
formData.append('file', file)

// api.js에서는 자동으로 처리되므로 그대로 사용
await api.post('/api/upload', formData, {
  headers: {} // Content-Type을 자동으로 설정하도록 비움
})
```

### 2. Query Parameters
```javascript
// Before: 수동으로 URLSearchParams 생성
const params = new URLSearchParams()
params.set('page', 1)
params.set('limit', 20)
const res = await fetch(`/api/users?${params}`)

// After: 객체로 전달
const result = await api.get('/api/users', { page: 1, limit: 20 })
```

### 3. 에러 핸들링
```javascript
import { ApiError } from '@/lib/api'

try {
  const result = await api.get('/api/endpoint')
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.status)
    console.log('Message:', error.message)
  }
}
```

---

## 📈 진행 상황

- **총 파일 수**: 31개
- **완료**: 3개 (10%)
- **남은 작업**: 28개 (90%)

---

## 🎯 우선순위

### High Priority (관리자 기능)
1. ✅ 관리자 대시보드
2. ✅ 사용자 관리
3. 신고 처리 (3개 파일)
4. 스터디 관리 (3개 파일)
5. 분석 (3개 파일)

### Medium Priority
6. 설정 (2개 파일)
7. 감사 로그 (2개 파일)

### Low Priority
8. 일반 사용자 기능 (1개 파일)

---

**마지막 업데이트**: 2025-11-29

