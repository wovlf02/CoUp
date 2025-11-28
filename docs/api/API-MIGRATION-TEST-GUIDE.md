# 🧪 API 클라이언트 마이그레이션 테스트 가이드

**작성일**: 2025-11-29  
**목적**: 마이그레이션된 API 클라이언트 검증

---

## 📋 테스트 체크리스트

### ✅ Phase 1: 관리자 - 신고 처리

#### ReportActions.jsx
- [ ] 담당자 배정 (POST)
  ```
  경로: /admin/reports/[reportId]
  동작: "담당자 배정" 버튼 클릭
  확인: 성공 메시지, 페이지 새로고침
  로그: 🌐 [API] POST /api/admin/reports/{id}/assign
  ```

- [ ] 신고 승인 (POST)
  ```
  경로: /admin/reports/[reportId]
  동작: "승인" 버튼 → 모달 입력 → 제출
  확인: 성공 메시지, 상태 변경
  로그: 🌐 [API] POST /api/admin/reports/{id}/process
  ```

- [ ] 신고 거부 (POST)
  ```
  경로: /admin/reports/[reportId]
  동작: "거부" 버튼 → 모달 입력 → 제출
  확인: 성공 메시지, 상태 변경
  로그: 🌐 [API] POST /api/admin/reports/{id}/process
  ```

- [ ] 신고 보류 (POST)
  ```
  경로: /admin/reports/[reportId]
  동작: "보류" 버튼 → 모달 입력 → 제출
  확인: 성공 메시지, 상태 변경
  로그: 🌐 [API] POST /api/admin/reports/{id}/process
  ```

---

### ✅ Phase 2: 관리자 - 스터디 관리

#### StudyActions.jsx
- [ ] 스터디 숨김 (POST)
  ```
  경로: /admin/studies/[studyId]
  동작: "숨김 처리" 버튼 → 모달 입력 → 제출
  확인: 성공 메시지, 버튼 변경
  로그: 🌐 [API] POST /api/admin/studies/{id}/hide
  ```

- [ ] 스터디 숨김 해제 (DELETE)
  ```
  경로: /admin/studies/[studyId]
  동작: "숨김 해제" 버튼 → 확인
  확인: 성공 메시지, 버튼 변경
  로그: 🌐 [API] DELETE /api/admin/studies/{id}/hide
  ```

- [ ] 스터디 종료 (POST)
  ```
  경로: /admin/studies/[studyId]
  동작: "종료" 버튼 → 모달 입력 → 제출
  확인: 성공 메시지, 버튼 변경
  로그: 🌐 [API] POST /api/admin/studies/{id}/close
  ```

- [ ] 스터디 재개 (DELETE)
  ```
  경로: /admin/studies/[studyId]
  동작: "재개" 버튼 → 확인
  확인: 성공 메시지, 버튼 변경
  로그: 🌐 [API] DELETE /api/admin/studies/{id}/close
  ```

- [ ] 스터디 삭제 (DELETE)
  ```
  경로: /admin/studies/[studyId]
  동작: "삭제" 버튼 → 모달 입력 → "DELETE" 입력 → 제출
  확인: 성공 메시지, 목록 페이지로 리다이렉트
  로그: 🌐 [API] DELETE /api/admin/studies/{id}/delete
  ```

---

### ✅ Phase 3: 관리자 - 분석

#### OverviewCharts.jsx
- [ ] 전체 통계 개요 (GET)
  ```
  경로: /admin/analytics
  동작: 페이지 로드
  확인: 통계 카드 표시, 차트 렌더링
  로그: 🌐 [API] GET /api/admin/analytics/overview
  ```

#### StudyAnalytics.jsx
- [ ] 스터디 분석 (GET with params)
  ```
  경로: /admin/analytics
  동작: 스터디 분석 탭 → 기간 변경 (일별/주별/월별)
  확인: 차트 업데이트, 통계 카드 변경
  로그: 🌐 [API] GET /api/admin/analytics/studies?period=daily&range=30
  ```

#### UserAnalytics.jsx
- [ ] 사용자 분석 (GET with params)
  ```
  경로: /admin/analytics
  동작: 사용자 분석 탭 → 기간 변경
  확인: 차트 업데이트, 메트릭 카드 변경
  로그: 🌐 [API] GET /api/admin/analytics/users?period=daily&range=30
  ```

---

### ✅ Phase 4: 관리자 - 설정

#### SettingsForm.jsx
- [ ] 설정 불러오기 (GET)
  ```
  경로: /admin/settings
  동작: 페이지 로드
  확인: 설정 폼 표시
  로그: 🌐 [API] GET /api/admin/settings
  ```

- [ ] 설정 저장 (PUT)
  ```
  경로: /admin/settings
  동작: 설정 값 변경 → "저장" 버튼 클릭
  확인: 성공 메시지, 업데이트 개수 표시
  로그: 🌐 [API] PUT /api/admin/settings
  ```

- [ ] 캐시 초기화 (POST)
  ```
  경로: /admin/settings
  동작: "캐시 초기화" 버튼 → 확인
  확인: 성공 메시지, 설정 재조회
  로그: 🌐 [API] POST /api/admin/settings/cache/clear
  ```

#### SettingsHistory.jsx
- [ ] 변경 이력 (GET with params)
  ```
  경로: /admin/settings
  동작: 페이지 로드, 페이지네이션 변경
  확인: 이력 타임라인 표시
  로그: 🌐 [API] GET /api/admin/settings/history?page=1&limit=10
  ```

---

### ✅ Phase 5: 관리자 - 감사 로그

#### LogFilters.jsx
- [ ] 관리자 목록 (GET)
  ```
  경로: /admin/audit-logs
  동작: 페이지 로드
  확인: 필터 드롭다운에 관리자 목록 표시
  로그: 🌐 [API] GET /api/admin/audit-logs?limit=1
  ```

#### LogTable.jsx
- [ ] 로그 목록 (GET with params)
  ```
  경로: /admin/audit-logs
  동작: 페이지 로드, 필터 변경, 페이지네이션
  확인: 로그 테이블 표시, 페이지네이션 동작
  로그: 🌐 [API] GET /api/admin/audit-logs?page=1&limit=20
  ```

---

### ✅ Phase 6: 관리자 - 사용자 상세

#### UserActions.jsx
- [ ] 경고 부여 (POST)
  ```
  경로: /admin/users/[userId]
  동작: "경고 부여" 버튼 → 모달 입력 → 제출
  확인: 성공 메시지, 페이지 새로고침
  로그: 🌐 [API] POST /api/admin/users/{id}/warn
  ```

- [ ] 사용자 정지 (POST)
  ```
  경로: /admin/users/[userId]
  동작: "정지" 버튼 → 모달 입력 → 제출
  확인: 성공 메시지, 상태 변경
  로그: 🌐 [API] POST /api/admin/users/{id}/suspend
  ```

- [ ] 정지 해제 (POST)
  ```
  경로: /admin/users/[userId]
  동작: "정지 해제" 버튼 → 확인
  확인: 성공 메시지, 상태 변경
  로그: 🌐 [API] POST /api/admin/users/{id}/unsuspend
  ```

---

### ✅ Phase 7: 일반 사용자 - 스터디 채팅

#### chat/page.jsx (FormData 포함)
- [ ] 파일 업로드 (POST - FormData)
  ```
  경로: /my-studies/[studyId]/chat
  동작: 파일 첨부 아이콘 → 파일 선택 → 전송
  확인: 파일 업로드 성공, 채팅에 파일 표시
  로그: 
    🌐 [API] POST /api/studies/{id}/files
    ✅ [API] POST /api/studies/{id}/files - Success
  ```

- [ ] 채팅 메시지 생성 (POST)
  ```
  경로: /my-studies/[studyId]/chat
  동작: 파일 업로드 후 자동 실행
  확인: 채팅 메시지 생성, Socket.io로 실시간 전송
  로그: 
    🌐 [API] POST /api/studies/{id}/chat
    ✅ [API] POST /api/studies/{id}/chat - Success
  ```

---

## 🔍 로그 확인 방법

### 브라우저 콘솔
1. F12 또는 Cmd+Option+I로 개발자 도구 열기
2. Console 탭 선택
3. API 요청 시 자동 로그 확인:

#### 성공 케이스
```
🌐 [API] GET /api/admin/analytics/overview
✅ [API] GET /api/admin/analytics/overview - Success
```

#### 실패 케이스
```
🌐 [API] POST /api/admin/users/123/warn
❌ [API] POST /api/admin/users/123/warn - 404: 사용자를 찾을 수 없습니다
```

### Network 탭 확인
1. Network 탭 선택
2. Fetch/XHR 필터 적용
3. 요청/응답 상세 확인:
   - Request Headers: `Content-Type`, `Cookie` 등
   - Request Payload: 전송된 데이터
   - Response: 응답 데이터

---

## 🐛 문제 해결

### 1. API 호출이 실패하는 경우
```javascript
// 콘솔 확인
❌ [API] POST /api/endpoint - 401: Unauthorized

// 해결:
1. 로그인 상태 확인
2. 세션 만료 여부 확인
3. 권한 확인
```

### 2. FormData 업로드 실패
```javascript
// 문제: Content-Type이 자동 설정되지 않음
// 해결: headers: {} 설정 확인

await api.post('/api/upload', formData, {
  headers: {} // 필수!
})
```

### 3. Query Parameters가 전달되지 않는 경우
```javascript
// 잘못된 방법
await api.get('/api/endpoint?page=1&limit=20')

// 올바른 방법
await api.get('/api/endpoint', { page: 1, limit: 20 })
```

---

## ✅ 최종 검증

### 모든 Phase 테스트 완료 후
- [ ] 모든 API 호출이 성공하는가?
- [ ] 콘솔에 에러가 없는가?
- [ ] 로그가 정상적으로 출력되는가?
- [ ] 페이지 새로고침 후에도 정상 동작하는가?
- [ ] 권한이 없는 사용자는 접근이 차단되는가?

---

## 📊 테스트 결과 기록

| Phase | 파일 | API | 상태 | 비고 |
|-------|------|-----|------|------|
| 1 | ReportActions.jsx | POST /assign | ⏳ | |
| 1 | ReportActions.jsx | POST /process (approve) | ⏳ | |
| 1 | ReportActions.jsx | POST /process (reject) | ⏳ | |
| 1 | ReportActions.jsx | POST /process (hold) | ⏳ | |
| 2 | StudyActions.jsx | POST /hide | ⏳ | |
| 2 | StudyActions.jsx | DELETE /hide | ⏳ | |
| 2 | StudyActions.jsx | POST /close | ⏳ | |
| 2 | StudyActions.jsx | DELETE /close | ⏳ | |
| 2 | StudyActions.jsx | DELETE /delete | ⏳ | |
| 3 | OverviewCharts.jsx | GET /overview | ⏳ | |
| 3 | StudyAnalytics.jsx | GET /studies | ⏳ | |
| 3 | UserAnalytics.jsx | GET /users | ⏳ | |
| 4 | SettingsForm.jsx | GET /settings | ⏳ | |
| 4 | SettingsForm.jsx | PUT /settings | ⏳ | |
| 4 | SettingsForm.jsx | POST /cache/clear | ⏳ | |
| 4 | SettingsHistory.jsx | GET /history | ⏳ | |
| 5 | LogFilters.jsx | GET /audit-logs | ⏳ | |
| 5 | LogTable.jsx | GET /audit-logs | ⏳ | |
| 6 | UserActions.jsx | POST /warn | ⏳ | |
| 6 | UserActions.jsx | POST /suspend | ⏳ | |
| 6 | UserActions.jsx | POST /unsuspend | ⏳ | |
| 7 | chat/page.jsx | POST /files | ⏳ | FormData |
| 7 | chat/page.jsx | POST /chat | ⏳ | |

**범례**:
- ⏳ 대기
- ✅ 성공
- ❌ 실패

---

## 🚀 자동화 테스트 (추후 작성)

### E2E 테스트 (Playwright)
```javascript
// tests/admin/reports.spec.js
test('관리자가 신고를 승인할 수 있다', async ({ page }) => {
  await page.goto('/admin/reports')
  await page.click('text=신고 #123')
  await page.click('text=승인')
  await page.fill('textarea[name="reason"]', '적절한 신고입니다')
  await page.click('button:has-text("제출")')
  await expect(page.locator('text=승인되었습니다')).toBeVisible()
})
```

### API 통합 테스트 (Jest)
```javascript
// tests/api/reports.test.js
describe('POST /api/admin/reports/:id/process', () => {
  it('신고를 승인한다', async () => {
    const response = await api.post('/api/admin/reports/123/process', {
      action: 'approve',
      resolution: '적절한 신고입니다'
    })
    expect(response.success).toBe(true)
  })
})
```

---

**작성일**: 2025-11-29  
**버전**: 1.0  
**상태**: ✅ 완료

