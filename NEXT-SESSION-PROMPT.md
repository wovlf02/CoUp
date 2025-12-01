# Next Session Prompt - Study 도메인 예외 처리 (Phase A2)

## 📋 현재 진행 상황

### ✅ 완료된 단계
- **Step 1**: 도메인 분석 및 설계 ✅ (28개 API, 115개 예외 케이스)
- **Step 2**: Exception 클래스 구현 ✅ (8개 서브클래스, 115개 에러 메서드)
- **Step 3**: Validators & Logger 구현 ✅ (12개 검증, 25개 로깅, 30개 헬퍼)
- **Step 4**: 핵심 API 강화 ✅ (6개 API 라우트, ~1,200 라인)
- **Step 5**: 공지사항 & 파일 API 강화 ✅ (4개 API 라우트, ~500 라인)

### 🚀 다음 단계: Step 6 - Task & Calendar API 예외 처리

**목표**: Task(할일) 및 Calendar(일정) API에 예외 처리 패턴 적용

---

## 📝 Step 6 작업 내용

### 1. Task (할일) API 강화 (3개 라우트)

#### A. `/api/studies/[id]/tasks` (GET, POST)
```javascript
// GET - 할일 목록 조회
export const GET = withStudyErrorHandler(async (request, context) => {
  // 1. 멤버 권한 확인
  // 2. 쿼리 파라미터 검증 (page, limit, status, assignee)
  // 3. where 조건 생성
  // 4. 할일 목록 조회
  // 5. 로깅: StudyLogger.logTaskList()
  // 6. 페이지네이션 응답
})

// POST - 할일 생성
export const POST = withStudyErrorHandler(async (request, context) => {
  // 1. ADMIN 권한 확인
  // 2. 입력 검증
  //    - 제목 (필수, 2-100자)
  //    - 설명 (선택, max 1000자)
  //    - 마감일 (미래 날짜)
  //    - 담당자 (멤버 확인)
  // 3. 할일 생성
  // 4. 담당자에게 알림
  // 5. 로깅: StudyLogger.logTaskCreate()
  // 6. 응답
})
```

**예외 케이스**:
- `STUDY-102`: 할일 제목 누락
- `STUDY-103`: 마감일이 과거
- `STUDY-104`: 담당자가 멤버가 아님

#### B. `/api/studies/[id]/tasks/[taskId]` (GET, PATCH, DELETE)
```javascript
// GET - 할일 상세 조회
export const GET = withStudyErrorHandler(async (request, context) => {
  // 1. 멤버 권한 확인
  // 2. 할일 조회
  // 3. 스터디 일치 확인
  // 4. 로깅: StudyLogger.logTaskView()
  // 5. 응답
})

// PATCH - 할일 수정
export const PATCH = withStudyErrorHandler(async (request, context) => {
  // 1. ADMIN 권한 확인
  // 2. 할일 존재 확인
  // 3. 입력 검증
  // 4. 담당자 변경 시 멤버 확인
  // 5. 할일 수정
  // 6. 로깅: StudyLogger.logTaskUpdate()
  // 7. 응답
})

// DELETE - 할일 삭제
export const DELETE = withStudyErrorHandler(async (request, context) => {
  // 1. ADMIN 권한 확인
  // 2. 할일 존재 확인
  // 3. 할일 삭제
  // 4. 로깅: StudyLogger.logTaskDelete()
  // 5. 응답
})
```

#### C. `/api/studies/[id]/tasks/[taskId]/status` (PATCH)
```javascript
// PATCH - 할일 상태 변경
export const PATCH = withStudyErrorHandler(async (request, context) => {
  // 1. 멤버 권한 확인 (담당자 또는 ADMIN)
  // 2. 할일 존재 확인
  // 3. 상태 검증 (TODO, IN_PROGRESS, DONE)
  // 4. 상태 업데이트
  // 5. 로깅: StudyLogger.logTaskStatusChange()
  // 6. 응답
})
```

### 2. Calendar (일정) API 강화 (2개 라우트)

#### A. `/api/studies/[id]/calendar` (GET, POST)
```javascript
// GET - 일정 목록 조회
export const GET = withStudyErrorHandler(async (request, context) => {
  // 1. 멤버 권한 확인
  // 2. 쿼리 파라미터 검증 (startDate, endDate)
  // 3. 날짜 범위 검증
  // 4. 일정 목록 조회
  // 5. 로깅: StudyLogger.logEventList()
  // 6. 응답
})

// POST - 일정 생성
export const POST = withStudyErrorHandler(async (request, context) => {
  // 1. ADMIN 권한 확인
  // 2. 입력 검증
  //    - 제목 (필수, 2-100자)
  //    - 시작 시간 (미래)
  //    - 종료 시간 (시작 시간 이후)
  //    - 설명 (선택, max 1000자)
  // 3. 일정 중복 확인 (선택)
  // 4. 일정 생성
  // 5. 멤버들에게 알림
  // 6. 로깅: StudyLogger.logEventCreate()
  // 7. 응답
})
```

**예외 케이스**:
- `STUDY-108`: 일정 제목 누락
- `STUDY-109`: 종료 시간이 시작 시간보다 이름
- `STUDY-110`: 일정 시작 시간이 과거
- `STUDY-111`: 일정 설명 길이 초과
- `STUDY-112`: 일정 중복

#### B. `/api/studies/[id]/calendar/[eventId]` (GET, PATCH, DELETE)
```javascript
// GET - 일정 상세 조회
export const GET = withStudyErrorHandler(async (request, context) => {
  // 1. 멤버 권한 확인
  // 2. 일정 조회
  // 3. 스터디 일치 확인
  // 4. 로깅: StudyLogger.logEventView()
  // 5. 응답
})

// PATCH - 일정 수정
export const PATCH = withStudyErrorHandler(async (request, context) => {
  // 1. ADMIN 권한 확인
  // 2. 일정 존재 확인
  // 3. 입력 검증
  // 4. 시간 검증 (종료 > 시작)
  // 5. 일정 수정
  // 6. 로깅: StudyLogger.logEventUpdate()
  // 7. 응답
})

// DELETE - 일정 삭제
export const DELETE = withStudyErrorHandler(async (request, context) => {
  // 1. ADMIN 권한 확인
  // 2. 일정 존재 확인
  // 3. 일정 삭제
  // 4. 로깅: StudyLogger.logEventDelete()
  // 5. 응답
})
```

### 3. StudyLogger 메서드 추가

```javascript
// Task 로깅 (6개)
static logTaskList(studyId, context)
static logTaskCreate(taskId, studyId, userId, taskData)
static logTaskView(taskId, studyId, userId)
static logTaskUpdate(taskId, studyId, userId, changes)
static logTaskDelete(taskId, studyId, userId)
static logTaskStatusChange(taskId, studyId, userId, oldStatus, newStatus)

// Calendar 로깅 (5개)
static logEventList(studyId, context)
static logEventCreate(eventId, studyId, userId, eventData)
static logEventView(eventId, studyId, userId)
static logEventUpdate(eventId, studyId, userId, changes)
static logEventDelete(eventId, studyId, userId)
```

---

## 📂 파일 경로

### Task API
```
coup/src/app/api/studies/[id]/
└── tasks/
    ├── route.js (GET, POST)
    ├── [taskId]/
    │   └── route.js (GET, PATCH, DELETE)
    └── [taskId]/status/
        └── route.js (PATCH)
```

### Calendar API
```
coup/src/app/api/studies/[id]/
└── calendar/
    ├── route.js (GET, POST)
    └── [eventId]/
        └── route.js (GET, PATCH, DELETE)
```

---

## 🎯 구현 패턴 (참고)

### 1. 공통 패턴
```javascript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { 
  withStudyErrorHandler, 
  createSuccessResponse,
  createPaginatedResponse 
} from '@/lib/utils/study-utils'
import { requireStudyMember } from "@/lib/auth-helpers"
import { StudyFeatureException, StudyPermissionException } from '@/lib/exceptions/study'
import { StudyLogger } from '@/lib/logging/studyLogger'

export const GET = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId } = await params
  
  // 1. 권한 확인
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result
  
  // 2. 입력 검증
  // 3. 비즈니스 로직
  // 4. 로깅
  // 5. 응답
  
  return createSuccessResponse(data, message)
})
```

### 2. 예외 발생 패턴
```javascript
// 제목 누락
if (!title || !title.trim()) {
  throw StudyFeatureException.taskTitleMissing({ studyId, taskId })
}

// 마감일 과거
if (new Date(deadline) < new Date()) {
  throw StudyFeatureException.taskDeadlineInPast(deadline, { studyId, taskId })
}

// 담당자가 멤버가 아님
const member = await prisma.studyMember.findFirst({ ... })
if (!member) {
  throw StudyFeatureException.assigneeNotMember(assigneeId, studyId, { taskId })
}
```

---

## ✅ 완료 기준

1. **5개 API 파일 강화**
   - 3개 Task API 라우트
   - 2개 Calendar API 라우트

2. **예외 처리 적용**
   - Task: STUDY-102 ~ STUDY-104
   - Calendar: STUDY-108 ~ STUDY-112

3. **로깅 메서드 추가**
   - Task 로깅: 6개 메서드
   - Calendar 로깅: 5개 메서드

4. **문서 작성**
   - `STUDY-STEP6-COMPLETE.md` 생성
   - `STUDY-FINAL-COMPLETE.md` 생성 (전체 요약)

5. **에러 확인**
   - 모든 파일 컴파일 에러 없음
   - Import 정리 완료

---

## 📊 예상 통계

### 수정/추가 예상
- Task API: ~400 라인
- Calendar API: ~350 라인
- StudyLogger: ~150 라인
- **총 예상**: ~900 라인

### 예상 작업 시간
- Task API: ~1.5시간
- Calendar API: ~1.5시간
- **총 예상 시간**: ~3시간

---

## 📌 참고 문서
- [STUDY-STEP5-COMPLETE.md](./docs/study/STUDY-STEP5-COMPLETE.md) - 공지사항 & 파일 완료
- [STUDY-STEP4-COMPLETE.md](./docs/study/STUDY-STEP4-COMPLETE.md) - 핵심 API 완료
- [StudyException.js](./coup/src/lib/exceptions/study/StudyException.js) - 예외 클래스 (STUDY-102~112)
- [studyLogger.js](./coup/src/lib/logging/studyLogger.js) - 로깅 시스템

---

## 🚀 시작 명령어

```
다음 작업을 진행해:
Step 6 - Task & Calendar API 예외 처리

1. Task API 3개 라우트 강화
2. Calendar API 2개 라우트 강화
3. StudyLogger에 Task & Calendar 로깅 메서드 추가
4. 완료 문서 작성

완료되면 next-session-prompt를 최종 완료 상태로 업데이트해
```

---

**현재 Phase**: A2 (예외 처리 시스템 구축)  
**진행률**: 83% (5/6 단계 완료)  
**마지막 업데이트**: 2025-12-01  
**다음 세션 시작점**: Step 6 - Task & Calendar API
