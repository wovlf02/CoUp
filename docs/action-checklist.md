# 백엔드 점검 후 액션 체크리스트

**작성일**: 2025-11-18  
**기준**: check_report.md 점검 결과  
**목표**: Mock 데이터 완전 제거 및 누락 기능 구현

---

## 🚨 즉시 조치 항목 (Critical)

### 1. Mock 데이터 제거 - 관리자 신고 관리 페이지

**파일**: `src/app/admin/reports/page.jsx`  
**예상 시간**: 30분  
**우선순위**: 🔴 최우선

**현재 문제**:
```javascript
import { adminReports } from '@/mocks/admin' // ❌ 파일이 존재하지 않음
const [reports, setReports] = useState(adminReports) // ❌ Mock 데이터 사용
```

**작업 내용**:
- [ ] Line 6: Mock import 제거
- [ ] `useAdminReports()` 훅으로 교체
- [ ] 로딩 상태 UI 추가
- [ ] 에러 처리 추가
- [ ] 필터링 로직을 서버 사이드로 이동 (searchParams 활용)

**수정 코드 예시**:
```javascript
'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import ReportDetailModal from '@/components/admin/ReportDetailModal'
import { useAdminReports, useProcessReport } from '@/lib/hooks/useApi'
import styles from '../users/page.module.css'

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // 실제 API 호출
  const { data, isLoading, error } = useAdminReports({
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    page: 1,
    limit: 20
  })
  
  const processReport = useProcessReport()
  const reports = data?.data || []

  // ... 나머지 로직
}
```

**테스트**:
- [ ] 신고 목록 조회 확인
- [ ] 필터링 동작 확인
- [ ] 신고 상세 모달 확인
- [ ] 신고 처리 기능 확인

---

### 2. Mock 데이터 제거 - 관리자 시스템 설정 페이지

**파일**: `src/app/admin/settings/page.jsx`  
**예상 시간**: 4-5시간 (API 구현 포함)  
**우선순위**: 🟡 중간 (선택적)

**현재 문제**:
```javascript
import { systemSettings } from '@/mocks/admin' // ❌ 파일이 존재하지 않음
const [settings, setSettings] = useState(systemSettings) // ❌ Mock 데이터 사용
```

#### 옵션 A: 백엔드 API 구현 (권장)

**작업 내용**:

**Step 1**: Prisma 스키마에 Setting 모델 추가
```prisma
// prisma/schema.prisma

model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value String @db.Text
  type  SettingType @default(STRING)
  
  updatedAt DateTime @updatedAt
  updatedBy String?
  
  @@index([key])
}

enum SettingType {
  STRING
  NUMBER
  BOOLEAN
  JSON
}
```

- [ ] 스키마 수정
- [ ] `npx prisma migrate dev --name add_settings` 실행
- [ ] `npx prisma generate` 실행

**Step 2**: 시드 데이터 추가
```javascript
// prisma/seed.js 에 추가

const settings = [
  { key: 'service.status', value: 'OPERATIONAL', type: 'STRING' },
  { key: 'service.signupEnabled', value: 'true', type: 'BOOLEAN' },
  { key: 'service.studyCreationEnabled', value: 'true', type: 'BOOLEAN' },
  { key: 'service.socialLoginEnabled', value: 'true', type: 'BOOLEAN' },
  { key: 'limits.maxStudiesPerUser', value: '10', type: 'NUMBER' },
  { key: 'limits.maxMembersPerStudy', value: '50', type: 'NUMBER' },
  { key: 'limits.maxFileSize', value: '50', type: 'NUMBER' },
  { key: 'limits.maxMessageLength', value: '2000', type: 'NUMBER' },
]

for (const setting of settings) {
  await prisma.setting.upsert({
    where: { key: setting.key },
    update: {},
    create: setting
  })
}
```

- [ ] 시드 데이터 추가
- [ ] `npx prisma db seed` 실행

**Step 3**: API 라우트 생성
- [ ] `src/app/api/admin/settings/route.js` 생성
  ```javascript
  // GET /api/admin/settings
  export async function GET(request) {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const settings = await prisma.setting.findMany()
    
    // 그룹화
    const grouped = {}
    settings.forEach(s => {
      const [group, key] = s.key.split('.')
      if (!grouped[group]) grouped[group] = {}
      grouped[group][key] = parseValue(s.value, s.type)
    })

    return NextResponse.json({ success: true, data: grouped })
  }

  // PATCH /api/admin/settings
  export async function PATCH(request) {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const { key, value } = body

    const setting = await prisma.setting.update({
      where: { key },
      data: { 
        value: String(value),
        updatedBy: session.user.id
      }
    })

    return NextResponse.json({ success: true, data: setting })
  }
  ```

**Step 4**: 프론트엔드 수정
- [ ] `useAdminSettings()` 훅 추가 (`src/lib/hooks/useApi.js`)
- [ ] `adminApi.getSettings()`, `adminApi.updateSetting()` 추가
- [ ] `admin/settings/page.jsx`에서 API 연동
- [ ] 저장 버튼 동작 구현

**테스트**:
- [ ] 설정 조회 확인
- [ ] 설정 수정 확인
- [ ] 권한 확인 (SYSTEM_ADMIN만)

#### 옵션 B: 프론트엔드 전용 설정 (빠른 해결)

**작업 내용**:
- [ ] Mock import 제거
- [ ] localStorage 기반 설정 관리
- [ ] 초기값 하드코딩
- [ ] 주석 추가: "// TODO: 백엔드 API 연동 필요"

**코드 예시**:
```javascript
const DEFAULT_SETTINGS = {
  service: {
    status: 'OPERATIONAL',
    signupEnabled: true,
    studyCreationEnabled: true,
    socialLoginEnabled: true,
  },
  limits: {
    maxStudiesPerUser: 10,
    maxMembersPerStudy: 50,
    maxFileSize: 50,
  }
}

const [settings, setSettings] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_settings')
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
  }
  return DEFAULT_SETTINGS
})

const handleSave = () => {
  localStorage.setItem('admin_settings', JSON.stringify(settings))
  alert('설정이 저장되었습니다.')
}
```

---

## 🟡 권장 조치 항목 (Major)

### 3. 스터디 사이드바 위젯 API 연동 (6개)

**예상 시간**: 4-6시간  
**우선순위**: 🟡 중간

#### 3-1. MyActivityWidget - 나의 활동 통계

**파일**: `src/components/studies/sidebar/MyActivityWidget.jsx`

**작업 내용**:
- [ ] 새 API 추가: `GET /api/studies/[id]/my-activity`
- [ ] 응답 데이터:
  ```json
  {
    "attendance": { "current": 5, "total": 7 },
    "completedTasks": 8,
    "chatMessages": 42
  }
  ```
- [ ] 프론트엔드: `useStudyActivity(studyId)` 훅 사용

#### 3-2. PinnedNoticeWidget - 고정 공지

**파일**: `src/components/studies/sidebar/PinnedNoticeWidget.jsx`

**작업 내용**:
- [ ] 기존 API 활용: `GET /api/studies/[id]/notices?pinned=true&limit=1`
- [ ] 프론트엔드: `useNotices(studyId, { pinned: true, limit: 1 })` 훅 사용

#### 3-3. StatsWidget - 스터디 통계

**파일**: `src/components/studies/sidebar/StatsWidget.jsx`

**작업 내용**:
- [ ] 새 API 추가: `GET /api/studies/[id]/stats`
- [ ] 응답 데이터:
  ```json
  {
    "members": 12,
    "tasks": 15,
    "files": 23,
    "messages": 456
  }
  ```

#### 3-4. OnlineMembersWidget - 온라인 멤버

**파일**: `src/components/studies/sidebar/OnlineMembersWidget.jsx`

**작업 내용**:
- [ ] WebSocket 연동 (`useStudySocket(studyId)`)
- [ ] 실시간 온라인 상태 수신
- [ ] 폴백: REST API로 멤버 목록 조회

#### 3-5. UpcomingEventsWidget - 다가오는 일정

**파일**: `src/components/studies/sidebar/UpcomingEventsWidget.jsx`

**작업 내용**:
- [ ] 기존 API 활용: `GET /api/studies/[id]/calendar`
- [ ] 필터: 오늘 이후 3일 이내
- [ ] 프론트엔드: `useEvents(studyId)` + 클라이언트 필터링

#### 3-6. UrgentTasksWidget - 긴급 할일

**파일**: `src/components/studies/sidebar/UrgentTasksWidget.jsx`

**작업 내용**:
- [ ] 기존 API 활용: `GET /api/tasks?studyId=[id]&completed=false`
- [ ] 클라이언트에서 마감일 기준 필터링 (3일 이내)
- [ ] 할일 완료 처리: `useToggleTask()` 훅 사용

---

### 4. 폴더 기능 구현 (파일 관리)

**예상 시간**: 3-4시간  
**우선순위**: 🟢 낮음

**작업 내용**:

**Step 1**: API 추가
- [ ] `POST /api/studies/[id]/folders` - 폴더 생성
- [ ] `GET /api/studies/[id]/folders` - 폴더 목록
- [ ] `PATCH /api/studies/[id]/folders/[folderId]` - 폴더 이름 수정
- [ ] `DELETE /api/studies/[id]/folders/[folderId]` - 폴더 삭제

**Step 2**: 프론트엔드 UI
- [ ] 폴더 트리 컴포넌트
- [ ] 파일을 폴더로 이동
- [ ] 폴더별 필터링

**참고**: File 모델에 `folderId` 필드 이미 존재 ✅

---

## 🟢 선택적 개선 항목 (Minor)

### 5. TODO 주석 정리

**예상 시간**: 1-2시간  
**우선순위**: 🟢 낮음

**작업 내용**:
- [ ] 구현 완료된 TODO 제거
- [ ] 미구현 TODO에 이슈 번호 추가
- [ ] 불필요한 TODO 주석 삭제

**TODO 주석 분류**:
```
✅ 제거 가능: 0개
🔄 이슈 등록 필요: 14개 (기능 개선)
📝 유지: 6개 (장기 계획)
```

---

### 6. 배지 시스템 구현

**예상 시간**: 6-8시간  
**우선순위**: 🟢 매우 낮음

**작업 내용**:
- [ ] Badge 모델 추가
- [ ] 배지 조건 정의
- [ ] 자동 배지 부여 로직
- [ ] 프로필에 배지 표시

---

### 7. 화상회의 WebRTC 클라이언트

**예상 시간**: 12-16시간  
**우선순위**: 🟢 매우 낮음 (MVP 아님)

**작업 내용**:
- [ ] WebRTC Peer Connection 설정
- [ ] 오디오/비디오 스트림 관리
- [ ] 화면 공유 기능
- [ ] 참여자 UI 구현

**참고**: Socket.IO 시그널링 서버는 이미 구현됨 ✅

---

## 📅 작업 일정 제안

### Week 1: Critical 항목 완료

**Day 1 (4시간)**:
- [x] 점검 보고서 작성
- [ ] Mock 데이터 제거 - 신고 관리 (30분)
- [ ] 테스트 및 디버깅 (30분)
- [ ] 시스템 설정 API 설계 (1시간)
- [ ] Prisma 스키마 수정 (1시간)

**Day 2 (4시간)**:
- [ ] 시스템 설정 API 구현 (3시간)
- [ ] 프론트엔드 연동 (1시간)

**Day 3 (2시간)**:
- [ ] 전체 테스트
- [ ] 문서 업데이트
- [ ] Mock 완전 제거 확인

### Week 2: Major 항목 (선택적)

**Day 4-5 (6시간)**:
- [ ] 스터디 사이드바 위젯 6개 API 연동

**Day 6 (3시간)**:
- [ ] 폴더 기능 구현 (선택)

---

## 🧪 테스트 체크리스트

### 회귀 테스트 (기존 기능)

- [ ] 로그인/로그아웃
- [ ] 스터디 생성/수정/삭제
- [ ] 스터디 가입/탈퇴
- [ ] 공지사항 CRUD
- [ ] 파일 업로드/다운로드
- [ ] 채팅 메시지 전송
- [ ] 할일 CRUD
- [ ] 알림 읽음 처리
- [ ] 관리자 사용자 관리
- [ ] 관리자 스터디 관리

### 새 기능 테스트

- [ ] 관리자 신고 관리 (API 연동)
- [ ] 관리자 시스템 설정 (API 연동)
- [ ] 스터디 사이드바 위젯 (각각)

### 성능 테스트

- [ ] API 응답 시간 (< 500ms)
- [ ] 페이지 로딩 속도
- [ ] 무한 스크롤 동작
- [ ] 이미지 로딩 최적화

---

## 🚀 배포 전 최종 체크리스트

### 코드 품질

- [ ] ESLint 에러 없음
- [ ] TypeScript 에러 없음 (해당 시)
- [ ] Console.log 제거
- [ ] 디버그 코드 제거
- [ ] Mock import 완전 제거 확인

### 환경 설정

- [ ] `.env.example` 업데이트
- [ ] 프로덕션 환경 변수 설정
- [ ] DATABASE_URL 프로덕션 연결
- [ ] NEXTAUTH_SECRET 변경
- [ ] NEXTAUTH_URL 프로덕션 도메인

### 데이터베이스

- [ ] 마이그레이션 파일 확인
- [ ] Seed 데이터 확인
- [ ] 인덱스 최적화
- [ ] 백업 계획 수립

### 보안

- [ ] API 권한 체크 재확인
- [ ] SQL Injection 방어 (Prisma 사용 ✅)
- [ ] XSS 방어
- [ ] CSRF 토큰
- [ ] Rate Limiting (선택)

### 모니터링

- [ ] 에러 로그 확인 (Winston)
- [ ] 성능 모니터링 설정 (선택)
- [ ] 알림 설정 (에러 발생 시)

---

## 📊 진행 상황 추적

### 전체 진행률

```
즉시 조치 (Critical):    0/2   (0%)
권장 조치 (Major):        0/5   (0%)
선택적 개선 (Minor):      0/3   (0%)

전체 진행률:              0/10  (0%)
```

### 우선순위별 현황

```
🔴 Critical:  2개  (Mock 제거)
🟡 Major:     5개  (위젯 연동, 폴더)
🟢 Minor:     3개  (TODO 정리, 배지, 화상회의)
```

---

## 🎯 성공 기준

### Minimum (최소)
- ✅ Mock 데이터 완전 제거 (2개 파일)
- ✅ 빌드 에러 없음
- ✅ 기존 기능 정상 동작

### Target (목표)
- ✅ 시스템 설정 API 구현
- ✅ 스터디 사이드바 위젯 3개 이상 연동
- ✅ 회귀 테스트 통과

### Stretch (최상)
- ✅ 모든 사이드바 위젯 API 연동
- ✅ 폴더 기능 구현
- ✅ 성능 최적화 완료

---

## 📝 참고 문서

- [check_report.md](./check_report.md) - 점검 결과 상세 보고서
- [docs/backend/COMPLETION_REPORT_FINAL.md](./backend/COMPLETION_REPORT_FINAL.md) - 백엔드 완료 보고서
- [docs/backend/MOCK_REMOVAL_COMPLETE.md](./backend/MOCK_REMOVAL_COMPLETE.md) - Mock 제거 가이드
- [docs/backend/api/](./backend/api/) - API 명세서 (8개 파일)

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-18  
**업데이트**: 작업 완료 시 체크 표시 업데이트 필요

