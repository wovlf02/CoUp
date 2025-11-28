# 🚀 다음 세션 프롬프트: API 클라이언트 마이그레이션

**작업 목표**: 기존 `fetch()` 호출을 중앙화된 `api` 클라이언트로 전환

---

## 📋 프롬프트 (복사해서 사용)

```
CoUp 프로젝트의 API 클라이언트 마이그레이션 작업을 진행해줘.

먼저 다음 문서들을 읽어줘:
1. docs/api/API-MIGRATION-TODO.md - 마이그레이션 대상 파일 목록
2. docs/api/API-CENTRALIZATION-COMPLETE.md - API 클라이언트 사용법
3. docs/api/API-CLIENT-GUIDE.md - 상세 가이드

그 다음 이 순서대로 진행해줘:

## Phase 1: 관리자 - 신고 처리 (3개 파일)
1. app/admin/reports/[reportId]/_components/ReportActions.jsx
2. app/admin/reports/[reportId]/page.jsx
3. app/admin/reports/_components/ReportList.jsx

변경 규칙:
- fetch() → api.get(), api.post(), api.patch(), api.delete()로 변경
- import api from '@/lib/api' 추가
- URLSearchParams → 객체로 전달
- method: 'POST' → api.post() 사용
- headers 수동 설정 제거
- 에러 핸들링 개선

## Phase 2: 관리자 - 스터디 관리 (3개 파일)
1. app/admin/studies/[studyId]/_components/StudyActions.jsx
2. app/admin/studies/[studyId]/page.jsx
3. app/admin/studies/_components/StudyList.jsx

## Phase 3: 관리자 - 분석 (3개 파일)
1. app/admin/analytics/_components/OverviewCharts.jsx
2. app/admin/analytics/_components/StudyAnalytics.jsx
3. app/admin/analytics/_components/UserAnalytics.jsx

## Phase 4: 관리자 - 설정 (2개 파일)
1. app/admin/settings/_components/SettingsForm.jsx
2. app/admin/settings/_components/SettingsHistory.jsx

## Phase 5: 관리자 - 감사 로그 (2개 파일)
1. app/admin/audit-logs/_components/LogFilters.jsx
2. app/admin/audit-logs/_components/LogTable.jsx

## Phase 6: 관리자 - 사용자 상세 (2개 파일)
1. app/admin/users/[userId]/_components/UserActions.jsx
2. app/admin/users/[userId]/page.jsx

## Phase 7: 일반 사용자 - 스터디 채팅 (1개 파일)
1. app/my-studies/[studyId]/chat/page.jsx
   - 주의: FormData 처리 필요

각 Phase별로:
1. 파일들을 읽고 fetch() 사용 부분 찾기
2. api.get(), api.post() 등으로 변경
3. import 추가
4. 에러 체크
5. 다음 Phase로 진행

모든 Phase 완료 후:
1. docs/api/API-MIGRATION-TODO.md 업데이트 (체크리스트)
2. 최종 보고서 작성
3. 테스트 가이드 작성

중요:
- 코드 수정 시 기존 로직은 유지
- api.get('/api/endpoint', { params })처럼 query parameters는 객체로 전달
- FormData는 headers: {} 설정 필요
- 에러 핸들링은 try-catch로 통일
- 각 파일 수정 후 반드시 get_errors로 검증

시작해줘!
```

---

## 🎯 예상 작업 시간

- **Phase 1-3**: ~30분 (관리자 핵심 기능)
- **Phase 4-6**: ~20분 (관리자 부가 기능)
- **Phase 7**: ~10분 (일반 사용자)
- **문서화**: ~10분
- **총 예상 시간**: 약 70분

---

## 📚 참고 자료

### API 클라이언트 사용법

```javascript
import api from '@/lib/api'

// GET 요청
const users = await api.get('/api/admin/users', { 
  page: 1, 
  limit: 20,
  status: 'ACTIVE' 
})

// POST 요청
await api.post('/api/admin/users/123/warn', {
  reason: '경고 사유',
  severity: 'MEDIUM'
})

// PATCH 요청
await api.patch('/api/admin/users/123', {
  status: 'SUSPENDED'
})

// DELETE 요청
await api.delete('/api/admin/users/123')
```

### 에러 핸들링

```javascript
import { ApiError } from '@/lib/api'

try {
  const result = await api.post('/api/endpoint', data)
  // 성공 처리
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      alert('권한이 없습니다')
    } else if (error.status === 404) {
      alert('찾을 수 없습니다')
    } else {
      alert(error.message)
    }
  }
}
```

---

## ✅ 체크리스트 (작업 중 확인)

각 파일 수정 시:
- [ ] import api from '@/lib/api' 추가
- [ ] fetch() 제거
- [ ] api.get/post/patch/delete로 변경
- [ ] URLSearchParams → 객체로 변경
- [ ] headers 수동 설정 제거
- [ ] credentials: 'include' 제거 (자동 처리됨)
- [ ] JSON.stringify() 제거 (자동 처리됨)
- [ ] res.json() 제거 (자동 처리됨)
- [ ] 에러 핸들링 개선
- [ ] get_errors로 검증

---

## 🎉 완료 기준

모든 Phase가 완료되면:
1. ✅ 28개 파일 모두 마이그레이션
2. ✅ 에러 없음
3. ✅ TODO 문서 업데이트
4. ✅ 최종 보고서 작성

---

**준비 완료!** 이 프롬프트를 복사해서 새 세션에 붙여넣으면 바로 작업을 시작할 수 있습니다. 🚀

