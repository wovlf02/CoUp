# 스터디 관리 예외 처리 색인 (Studies Exception Index)

**작성일**: 2025-11-29  
**목적**: 문제 증상별 빠른 해결책 찾기

---

## 📋 목차

- [증상별 찾기](#증상별-찾기)
- [카테고리별 찾기](#카테고리별-찾기)
- [HTTP 상태 코드별](#http-상태-코드별)
- [권한 오류별](#권한-오류별)
- [빠른 해결 가이드](#빠른-해결-가이드)

---

## 증상별 찾기

### "스터디를 찾을 수 없습니다"

**원인**:
- 잘못된 스터디 ID
- 삭제된 스터디
- URL 파라미터 오류

**해결**:
- [스터디 조회 실패 → 01-study-crud-exceptions.md#스터디-조회-실패](./01-study-crud-exceptions.md#스터디-조회-실패)

---

### "권한이 없습니다"

**원인**:
- 멤버가 아님
- 역할 부족 (MEMBER → ADMIN 필요)
- 비공개 스터디 접근

**해결**:
- [권한 부족 → 05-permissions-exceptions.md#권한-부족](./05-permissions-exceptions.md#권한-부족)

---

### "정원이 마감되었습니다"

**원인**:
- 최대 인원 도달
- 동시 가입 요청

**해결**:
- [정원 초과 → 03-join-leave-exceptions.md#정원-초과](./03-join-leave-exceptions.md#정원-초과)

---

### "이미 가입된 스터디입니다"

**원인**:
- 중복 가입 시도
- 캐시 문제

**해결**:
- [중복 가입 → 03-join-leave-exceptions.md#중복-가입-방지](./03-join-leave-exceptions.md#중복-가입-방지)

---

### "스터디장은 탈퇴할 수 없습니다"

**원인**:
- OWNER가 탈퇴 시도
- 소유권 이전 필요

**해결**:
- [OWNER 탈퇴 방지 → 03-join-leave-exceptions.md#owner-탈퇴-방지](./03-join-leave-exceptions.md#owner-탈퇴-방지)

---

### "현재 모집 중이 아닙니다"

**원인**:
- `isRecruiting: false`
- OWNER가 모집 중단

**해결**:
- [모집 중단 상태 → 03-join-leave-exceptions.md#모집-중단-상태](./03-join-leave-exceptions.md#모집-중단-상태)

---

### "필수 필드를 모두 입력해주세요"

**원인**:
- name, description, category 누락
- 빈 문자열

**해결**:
- [유효성 검사 오류 → 01-study-crud-exceptions.md#유효성-검사-오류](./01-study-crud-exceptions.md#유효성-검사-오류)

---

### "멤버를 찾을 수 없습니다"

**원인**:
- 잘못된 userId
- 이미 탈퇴한 멤버

**해결**:
- [멤버 조회 실패 → 02-member-management-exceptions.md#멤버-조회-실패](./02-member-management-exceptions.md#멤버-조회-실패)

---

### "스터디 목록을 불러올 수 없습니다"

**원인**:
- 네트워크 오류
- 서버 응답 없음
- 잘못된 쿼리 파라미터

**해결**:
- [목록 조회 실패 → 01-study-crud-exceptions.md#목록-조회-실패](./01-study-crud-exceptions.md#목록-조회-실패)

---

### "가입 승인 대기 중입니다"

**원인**:
- `autoApprove: false`
- PENDING 상태

**해결**:
- [가입 승인 대기 → 03-join-leave-exceptions.md#가입-승인-대기](./03-join-leave-exceptions.md#가입-승인-대기)

---

### "역할을 변경할 수 없습니다"

**원인**:
- OWNER만 역할 변경 가능
- 자기 자신의 역할 변경 시도

**해결**:
- [역할 변경 실패 → 02-member-management-exceptions.md#역할-변경-실패](./02-member-management-exceptions.md#역할-변경-실패)

---

### "소유권을 이전할 수 없습니다"

**원인**:
- 대상이 ACTIVE 멤버 아님
- 자기 자신에게 이전

**해결**:
- [소유권 이전 실패 → 05-permissions-exceptions.md#소유권-이전](./05-permissions-exceptions.md#소유권-이전)

---

### 스터디 카드가 로딩되지 않음

**원인**:
- API 응답 지연
- 데이터 형식 불일치
- 이미지 로딩 실패

**해결**:
- [UI 로딩 실패 → 08-ui-ux-exceptions.md#로딩-실패](./08-ui-ux-exceptions.md#로딩-실패)

---

### 검색 결과가 나오지 않음

**원인**:
- 검색어 인코딩 문제
- 대소문자 구분
- 필터 조합 오류

**해결**:
- [검색 실패 → 06-search-filter-exceptions.md#검색-실패](./06-search-filter-exceptions.md#검색-실패)

---

### 페이지네이션이 작동하지 않음

**원인**:
- 잘못된 페이지 번호
- limit 파라미터 오류
- 총 페이지 계산 오류

**해결**:
- [페이지네이션 오류 → 06-search-filter-exceptions.md#페이지네이션-오류](./06-search-filter-exceptions.md#페이지네이션-오류)

---

### 실시간 업데이트가 안 됨

**원인**:
- React Query 캐시 문제
- invalidateQueries 누락
- WebSocket 연결 끊김

**해결**:
- [실시간 동기화 → 07-real-time-sync-exceptions.md#동기화-실패](./07-real-time-sync-exceptions.md#동기화-실패)

---

### 이미지 업로드가 실패함

**원인**:
- 파일 크기 초과
- 지원하지 않는 형식
- 업로드 권한 없음

**해결**:
- [이미지 업로드 → 04-settings-exceptions.md#이미지-업로드-실패](./04-settings-exceptions.md#이미지-업로드-실패)

---

## 카테고리별 찾기

### 🔴 스터디 CRUD
- [01-study-crud-exceptions.md](./01-study-crud-exceptions.md)
  - 스터디 생성 실패
  - 스터디 조회 실패
  - 스터디 수정 실패
  - 스터디 삭제 실패
  - 유효성 검사 오류
  - 목록 조회 실패

### 👥 멤버 관리
- [02-member-management-exceptions.md](./02-member-management-exceptions.md)
  - 멤버 목록 조회 실패
  - 멤버 추가 실패
  - 멤버 제거 실패
  - 역할 변경 실패
  - 권한 검증 오류

### 🚪 가입/탈퇴
- [03-join-leave-exceptions.md](./03-join-leave-exceptions.md)
  - 가입 요청 실패
  - 정원 초과
  - 중복 가입 방지
  - 가입 승인/거절
  - 탈퇴 실패
  - OWNER 탈퇴 방지

### ⚙️ 설정 관리
- [04-settings-exceptions.md](./04-settings-exceptions.md)
  - 기본 정보 수정
  - 공개/비공개 전환
  - 모집 상태 변경
  - 이미지 업로드
  - 카테고리 변경

### 🔐 권한 관리
- [05-permissions-exceptions.md](./05-permissions-exceptions.md)
  - 권한 부족
  - OWNER 전용 기능
  - ADMIN 전용 기능
  - 소유권 이전
  - 역할별 제한

### 🔍 검색/필터
- [06-search-filter-exceptions.md](./06-search-filter-exceptions.md)
  - 검색 실패
  - 필터링 오류
  - 정렬 문제
  - 페이지네이션
  - 쿼리 파라미터 검증

### 🔄 실시간 동기화
- [07-real-time-sync-exceptions.md](./07-real-time-sync-exceptions.md)
  - React Query 캐시
  - 낙관적 업데이트
  - 데이터 동기화
  - WebSocket 연결
  - 캐시 무효화

### 🎨 UI/UX
- [08-ui-ux-exceptions.md](./08-ui-ux-exceptions.md)
  - 로딩 상태
  - 에러 상태
  - 빈 상태
  - 스켈레톤 UI
  - 토스트 알림

### ⚡ 성능 최적화
- [09-performance-optimization.md](./09-performance-optimization.md)
  - 쿼리 최적화
  - N+1 문제 해결
  - 렌더링 최적화
  - 메모리 관리
  - 이미지 최적화

### ✅ 모범 사례
- [99-best-practices.md](./99-best-practices.md)
  - 에러 핸들링 패턴
  - 보안 고려사항
  - 테스트 전략
  - 코드 리뷰 체크리스트

---

## HTTP 상태 코드별

### 400 Bad Request

| 오류 메시지 | 문서 |
|------------|------|
| "필수 필드를 모두 입력해주세요" | [01-study-crud-exceptions.md](./01-study-crud-exceptions.md#유효성-검사-오류) |
| "정원이 마감되었습니다" | [03-join-leave-exceptions.md](./03-join-leave-exceptions.md#정원-초과) |
| "이미 가입된 스터디입니다" | [03-join-leave-exceptions.md](./03-join-leave-exceptions.md#중복-가입-방지) |
| "현재 모집 중이 아닙니다" | [03-join-leave-exceptions.md](./03-join-leave-exceptions.md#모집-중단-상태) |
| "스터디장은 탈퇴할 수 없습니다" | [03-join-leave-exceptions.md](./03-join-leave-exceptions.md#owner-탈퇴-방지) |

### 401 Unauthorized

| 오류 메시지 | 문서 |
|------------|------|
| "로그인이 필요합니다" | [../auth/README.md](../auth/README.md) |
| "세션이 만료되었습니다" | [../auth/README.md](../auth/README.md) |

### 403 Forbidden

| 오류 메시지 | 문서 |
|------------|------|
| "권한이 없습니다" | [05-permissions-exceptions.md](./05-permissions-exceptions.md#권한-부족) |
| "스터디 소유자만 수정할 수 있습니다" | [05-permissions-exceptions.md](./05-permissions-exceptions.md#owner-전용-기능) |
| "관리자만 사용할 수 있는 기능입니다" | [05-permissions-exceptions.md](./05-permissions-exceptions.md#admin-전용-기능) |
| "멤버가 아닙니다" | [05-permissions-exceptions.md](./05-permissions-exceptions.md#멤버십-검증) |

### 404 Not Found

| 오류 메시지 | 문서 |
|------------|------|
| "스터디를 찾을 수 없습니다" | [01-study-crud-exceptions.md](./01-study-crud-exceptions.md#스터디-조회-실패) |
| "멤버를 찾을 수 없습니다" | [02-member-management-exceptions.md](./02-member-management-exceptions.md#멤버-조회-실패) |
| "스터디 멤버가 아닙니다" | [03-join-leave-exceptions.md](./03-join-leave-exceptions.md#탈퇴-실패) |

### 409 Conflict

| 오류 메시지 | 문서 |
|------------|------|
| "이미 가입된 스터디입니다" | [03-join-leave-exceptions.md](./03-join-leave-exceptions.md#중복-가입-방지) |
| "가입 승인 대기 중입니다" | [03-join-leave-exceptions.md](./03-join-leave-exceptions.md#가입-승인-대기) |

### 500 Internal Server Error

| 오류 메시지 | 문서 |
|------------|------|
| "스터디 목록을 가져오는 중 오류가 발생했습니다" | [01-study-crud-exceptions.md](./01-study-crud-exceptions.md#목록-조회-실패) |
| "스터디 정보를 가져오는 중 오류가 발생했습니다" | [01-study-crud-exceptions.md](./01-study-crud-exceptions.md#스터디-조회-실패) |
| "스터디 생성 중 오류가 발생했습니다" | [01-study-crud-exceptions.md](./01-study-crud-exceptions.md#스터디-생성-실패) |

---

## 권한 오류별

### OWNER 전용 기능

```javascript
// 스터디 삭제
DELETE /api/studies/:id

// 스터디 수정
PATCH /api/studies/:id

// 소유권 이전
PATCH /api/studies/:id/owner

// 역할 변경
PATCH /api/studies/:id/members/:userId/role
```

**문서**: [05-permissions-exceptions.md#owner-전용-기능](./05-permissions-exceptions.md#owner-전용-기능)

---

### OWNER/ADMIN 전용 기능

```javascript
// 멤버 제거
DELETE /api/studies/:id/members/:userId

// 가입 요청 승인/거절
POST /api/studies/:id/join-requests/:id/approve
POST /api/studies/:id/join-requests/:id/reject

// 공지사항 관리
POST   /api/studies/:id/notices
PATCH  /api/studies/:id/notices/:noticeId
DELETE /api/studies/:id/notices/:noticeId

// 일정 관리
POST   /api/studies/:id/calendar
PATCH  /api/studies/:id/calendar/:eventId
DELETE /api/studies/:id/calendar/:eventId
```

**문서**: [05-permissions-exceptions.md#admin-전용-기능](./05-permissions-exceptions.md#admin-전용-기능)

---

### MEMBER 이상 필요

```javascript
// 스터디 상세 조회 (비공개 스터디)
GET /api/studies/:id

// 멤버 목록
GET /api/studies/:id/members

// 공지사항 조회
GET /api/studies/:id/notices

// 파일 조회
GET /api/studies/:id/files

// 파일 업로드
POST /api/studies/:id/files
```

**문서**: [05-permissions-exceptions.md#멤버십-검증](./05-permissions-exceptions.md#멤버십-검증)

---

## 빠른 해결 가이드

### 1단계: 에러 메시지 확인

```javascript
try {
  const response = await fetch('/api/studies')
  if (!response.ok) {
    const error = await response.json()
    console.error('Error:', error)
  }
} catch (error) {
  console.error('Network error:', error)
}
```

### 2단계: 증상별 찾기 사용

- 에러 메시지로 [증상별 찾기](#증상별-찾기) 검색
- 관련 문서로 이동

### 3단계: 디버깅

```javascript
// 세션 확인
console.log('Session:', session)

// 멤버십 확인
const member = await prisma.studyMember.findUnique({
  where: {
    studyId_userId: { studyId, userId }
  }
})
console.log('Member:', member)

// 권한 확인
console.log('Role:', member?.role)

// 스터디 상태 확인
const study = await prisma.study.findUnique({
  where: { id: studyId },
  include: { _count: { select: { members: true } } }
})
console.log('Study:', study)
console.log('Current/Max members:', study._count.members, '/', study.maxMembers)
```

### 4단계: 해결책 적용

- 각 문서의 **해결 방법** 섹션 참고
- **Before/After** 코드 예제 적용
- **테스트** 케이스 실행

### 5단계: 검증

```javascript
// 단위 테스트
npm test studies

// E2E 테스트
npm run test:e2e studies

// 수동 테스트
# 브라우저에서 확인
```

---

## 자주 사용하는 스니펫

### 스터디 조회 (에러 핸들링 포함)

```javascript
import { useStudy } from '@/lib/hooks/useApi'

function StudyDetail({ studyId }) {
  const { data, isLoading, error } = useStudy(studyId)
  
  if (isLoading) return <StudySkeleton />
  if (error) return <ErrorState error={error} />
  if (!data) return <EmptyState />
  
  return <div>{data.name}</div>
}
```

### 스터디 가입 (에러 핸들링 포함)

```javascript
import { useJoinStudy } from '@/lib/hooks/useApi'
import { toast } from 'react-hot-toast'

function JoinButton({ studyId }) {
  const joinMutation = useJoinStudy(studyId)
  
  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync({
        introduction: '...',
        motivation: '...'
      })
      toast.success('가입 신청이 완료되었습니다')
    } catch (error) {
      if (error.message.includes('정원')) {
        toast.error('정원이 마감되었습니다')
      } else if (error.message.includes('이미')) {
        toast.error('이미 가입된 스터디입니다')
      } else {
        toast.error('가입 신청에 실패했습니다')
      }
    }
  }
  
  return (
    <button onClick={handleJoin} disabled={joinMutation.isLoading}>
      {joinMutation.isLoading ? '처리 중...' : '가입하기'}
    </button>
  )
}
```

### 권한 확인

```javascript
// API Route
export async function DELETE(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session
  
  const { id: studyId } = await params
  const member = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId: session.user.id
      }
    }
  })
  
  if (!member || member.role !== 'OWNER') {
    return NextResponse.json(
      { error: '권한이 없습니다' },
      { status: 403 }
    )
  }
  
  // 로직...
}
```

---

## 도움이 필요하신가요?

### 문제가 해결되지 않으면:

1. **관련 문서 재확인**
   - 각 카테고리별 문서의 **전체 예제** 참고
   
2. **모범 사례 확인**
   - [99-best-practices.md](./99-best-practices.md)
   
3. **디버깅 스크립트 실행**
   ```bash
   node scripts/check-study.js <studyId>
   ```

4. **로그 확인**
   ```bash
   # 서버 로그
   npm run dev
   
   # Prisma Studio로 데이터 확인
   npx prisma studio
   ```

---

## 관련 문서

- [README](./README.md) - 스터디 관리 개요
- [인증 예외 처리](../auth/INDEX.md) - 인증 관련
- [대시보드 예외 처리](../dashboard/INDEX.md) - 대시보드 관련

---

**업데이트**: 2025-11-29

