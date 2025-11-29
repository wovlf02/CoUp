# 프로필 예외 처리 가이드

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**카테고리**: Profile Management  
**난이도**: ⭐⭐⭐ (중급)

---

## 📋 목차

1. [개요](#개요)
2. [주요 기능](#주요-기능)
3. [아키텍처](#아키텍처)
4. [API 엔드포인트](#api-엔드포인트)
5. [예외 상황 분류](#예외-상황-분류)
6. [빠른 참조](#빠른-참조)
7. [문서 구조](#문서-구조)

---

## 개요

### 프로필 관리란?

프로필 관리는 사용자가 자신의 개인 정보와 활동을 조회하고 수정하는 기능입니다. CoUp에서는 다음과 같은 프로필 기능을 제공합니다:

- **프로필 조회**: 사용자 정보, 통계, 활동 내역
- **프로필 수정**: 이름, 자기소개, 아바타 변경
- **통계 대시보드**: 스터디 참여, 할일 완료, 출석률
- **계정 관리**: 계정 삭제, 데이터 다운로드

### 왜 중요한가?

프로필 관리는 다음과 같은 이유로 중요합니다:

1. **개인정보 보호**: 민감한 정보 처리
2. **데이터 무결성**: 일관된 사용자 데이터
3. **사용자 경험**: 직관적인 정보 관리
4. **보안**: 안전한 정보 수정

---

## 주요 기능

### 1. 프로필 조회

사용자의 프로필 정보와 활동 통계를 조회합니다.

```javascript
// src/app/me/page.jsx
const { data: userData, isLoading, error } = useMe()

if (isLoading) return <LoadingSkeleton />
if (error) return <ErrorState error={error} />
if (!userData?.user) return <EmptyState />

const user = userData.user
```

**주요 데이터**:
- 기본 정보: 이름, 이메일, 아바타, 자기소개
- 통계: 참여 스터디 수, 할일 수, 읽지 않은 알림
- 활동: 최근 활동, 출석률, 완료율

### 2. 프로필 수정

사용자가 자신의 프로필 정보를 수정합니다.

```javascript
// src/components/my-page/ProfileEditForm.jsx
const updateProfile = useUpdateProfile()

const handleSubmit = async (e) => {
  e.preventDefault()
  
  // 검증
  if (formData.name.length < 2 || formData.name.length > 50) {
    alert('이름은 2-50자여야 합니다')
    return
  }

  try {
    await updateProfile.mutateAsync(formData)
    await updateSession({ name: formData.name })
    alert('정보가 수정되었습니다!')
  } catch (error) {
    console.error('프로필 업데이트 실패:', error)
    alert('프로필 수정에 실패했습니다.')
  }
}
```

**수정 가능한 필드**:
- 이름 (2-50자)
- 자기소개 (0-200자)
- 아바타 이미지

### 3. 통계 조회

사용자의 활동 통계를 조회합니다.

```javascript
// src/app/api/users/me/stats/route.js
const stats = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    _count: {
      select: {
        studyMembers: { where: { status: 'ACTIVE' } },
        tasks: { where: { status: 'COMPLETED' } },
        notifications: { where: { isRead: false } }
      }
    }
  }
})
```

**제공 통계**:
- 활성 스터디 수
- 완료한 할일 수
- 읽지 않은 알림 수
- 출석률, 완료율

### 4. 계정 삭제

사용자가 자신의 계정을 삭제합니다.

```javascript
// src/app/api/users/me/route.js - DELETE
await prisma.user.update({
  where: { id: session.user.id },
  data: {
    status: 'DELETED',
    email: `deleted_${session.user.id}@deleted.com`
  }
})
```

**삭제 프로세스**:
1. 확인 모달 표시
2. "삭제" 텍스트 입력 요구
3. 계정 상태를 DELETED로 변경
4. 이메일 중복 방지 처리

---

## 아키텍처

### 컴포넌트 구조

```
src/app/me/
├── page.jsx                          # 메인 프로필 페이지
└── page.module.css

src/components/my-page/
├── ProfileSection.jsx                # 프로필 정보 표시
├── ProfileEditForm.jsx               # 프로필 수정 폼
├── ActivityStats.jsx                 # 활동 통계
├── MyStudiesList.jsx                 # 참여 스터디 목록
├── AccountActions.jsx                # 계정 관리 액션
└── DeleteAccountModal.jsx            # 계정 삭제 모달
```

### API 라우트

```
src/app/api/users/
├── me/
│   ├── route.js                      # GET, PATCH, DELETE /api/users/me
│   ├── stats/route.js                # GET /api/users/me/stats
│   └── password/route.js             # PATCH /api/users/me/password
├── [userId]/route.js                 # GET /api/users/:userId (공개 프로필)
└── route.js                          # GET /api/users (사용자 목록)
```

### 데이터 흐름

```
[클라이언트]
    ↓
[React Query Hooks]
  - useMe()
  - useUpdateProfile()
  - useUserStats()
    ↓
[API Routes]
  - GET /api/users/me
  - PATCH /api/users/me
  - GET /api/users/me/stats
    ↓
[Prisma ORM]
    ↓
[PostgreSQL Database]
```

---

## API 엔드포인트

### 1. 프로필 조회

```http
GET /api/users/me
Authorization: Bearer {token}
```

**응답**:
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "/uploads/avatars/user123.jpg",
    "bio": "안녕하세요!",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00Z",
    "stats": {
      "studyCount": 3,
      "taskCount": 25,
      "unreadNotifications": 5
    }
  }
}
```

### 2. 프로필 수정

```http
PATCH /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "김철수",
  "bio": "새로운 자기소개",
  "avatar": "/uploads/avatars/new.jpg"
}
```

**응답**:
```json
{
  "success": true,
  "message": "프로필이 업데이트되었습니다",
  "user": {
    "id": "user123",
    "name": "김철수",
    "bio": "새로운 자기소개",
    "avatar": "/uploads/avatars/new.jpg"
  }
}
```

### 3. 통계 조회

```http
GET /api/users/me/stats
Authorization: Bearer {token}
```

**응답**:
```json
{
  "success": true,
  "stats": {
    "totalStudies": 5,
    "activeStudies": 3,
    "completedTasks": 45,
    "totalTasks": 60,
    "attendanceRate": 85.5,
    "completionRate": 75.0
  }
}
```

### 4. 계정 삭제

```http
DELETE /api/users/me
Authorization: Bearer {token}
```

**응답**:
```json
{
  "success": true,
  "message": "계정이 삭제되었습니다"
}
```

---

## 예외 상황 분류

### 1. 데이터 조회 예외

| 예외 | 원인 | 영향도 | 문서 |
|------|------|--------|------|
| 사용자 없음 | 유효하지 않은 세션 | 🔴 높음 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#사용자-없음) |
| 통계 조회 실패 | DB 연결 오류 | 🟡 중간 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#통계-조회-실패) |
| 권한 없음 | 타인 프로필 접근 | 🟡 중간 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#권한-없음) |

### 2. 데이터 수정 예외

| 예외 | 원인 | 영향도 | 문서 |
|------|------|--------|------|
| 유효성 검사 실패 | 잘못된 입력 | 🟡 중간 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#유효성-검사) |
| 중복 이메일 | 이메일 중복 | 🟡 중간 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#중복-이메일) |
| 업데이트 실패 | DB 트랜잭션 실패 | 🔴 높음 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#업데이트-실패) |

### 3. 아바타 업로드 예외

| 예외 | 원인 | 영향도 | 문서 |
|------|------|--------|------|
| 파일 크기 초과 | 5MB 초과 | 🟢 낮음 | [02-avatar-exceptions.md](./02-avatar-exceptions.md#파일-크기-초과) |
| 지원하지 않는 형식 | 비이미지 파일 | 🟢 낮음 | [02-avatar-exceptions.md](./02-avatar-exceptions.md#파일-형식-오류) |
| 업로드 실패 | 네트워크 오류 | 🟡 중간 | [02-avatar-exceptions.md](./02-avatar-exceptions.md#업로드-실패) |

### 4. 계정 삭제 예외

| 예외 | 원인 | 영향도 | 문서 |
|------|------|--------|------|
| OWNER 스터디 존재 | 양도 필요 | 🔴 높음 | [03-account-deletion-exceptions.md](./03-account-deletion-exceptions.md#owner-스터디-존재) |
| 삭제 실패 | DB 트랜잭션 실패 | 🔴 높음 | [03-account-deletion-exceptions.md](./03-account-deletion-exceptions.md#삭제-실패) |

---

## 빠른 참조

### 자주 발생하는 문제

#### 1. "프로필을 불러올 수 없습니다"

**원인**: 세션 만료 또는 DB 연결 오류

**해결**:
```javascript
// 1. 세션 확인
const { data: session, status } = useSession()
if (status === 'unauthenticated') {
  router.push('/auth/signin')
  return
}

// 2. 에러 핸들링
const { data, error } = useMe()
if (error) {
  if (error.status === 401) {
    // 재로그인 필요
    signOut({ callbackUrl: '/auth/signin' })
  } else {
    // 일시적 오류
    toast.error('프로필을 불러올 수 없습니다. 다시 시도해주세요.')
  }
}
```

#### 2. "프로필 수정이 실패합니다"

**원인**: 유효성 검사 실패 또는 네트워크 오류

**해결**:
```javascript
// 클라이언트 검증
if (formData.name.length < 2 || formData.name.length > 50) {
  toast.error('이름은 2-50자여야 합니다')
  return
}

if (formData.bio && formData.bio.length > 200) {
  toast.error('자기소개는 200자 이하여야 합니다')
  return
}

// 서버 검증
try {
  await updateProfile.mutateAsync(formData)
} catch (error) {
  if (error.response?.data?.error) {
    toast.error(error.response.data.error)
  } else {
    toast.error('프로필 수정에 실패했습니다')
  }
}
```

#### 3. "통계가 표시되지 않습니다"

**원인**: 통계 API 실패 또는 데이터 없음

**해결**:
```javascript
const { data: statsData, isLoading, error } = useUserStats()

if (isLoading) {
  return <StatsSkeleton />
}

if (error) {
  console.error('Stats error:', error)
  return <div>통계를 불러올 수 없습니다</div>
}

if (!statsData?.stats) {
  return <div>통계가 없습니다</div>
}

return <ActivityStats stats={statsData.stats} />
```

### 디버깅 체크리스트

프로필 관련 문제 발생 시:

- [ ] **세션 확인**: 로그인 상태인가?
- [ ] **네트워크**: API 요청이 성공하는가?
- [ ] **검증**: 입력값이 유효한가?
- [ ] **권한**: 수정 권한이 있는가?
- [ ] **데이터**: 사용자 데이터가 존재하는가?
- [ ] **에러 로그**: 콘솔에 에러가 있는가?

### 성능 최적화

```javascript
// ✅ 좋은 예: React Query 캐싱 활용
const { data: userData } = useMe({
  staleTime: 5 * 60 * 1000, // 5분
  cacheTime: 10 * 60 * 1000 // 10분
})

// ✅ 좋은 예: 낙관적 업데이트
const updateProfile = useMutation({
  mutationFn: (data) => api.patch('/api/users/me', data),
  onMutate: async (newData) => {
    // 낙관적 업데이트
    await queryClient.cancelQueries(['users', 'me'])
    const previousData = queryClient.getQueryData(['users', 'me'])
    queryClient.setQueryData(['users', 'me'], (old) => ({
      ...old,
      user: { ...old.user, ...newData }
    }))
    return { previousData }
  },
  onError: (err, newData, context) => {
    // 롤백
    queryClient.setQueryData(['users', 'me'], context.previousData)
  }
})
```

---

## 문서 구조

### 프로필 문서 (docs/exception/profile/)

1. **[README.md](./README.md)** (현재 문서)
   - 프로필 시스템 개요
   - 아키텍처 및 API
   - 빠른 참조

2. **[INDEX.md](./INDEX.md)**
   - 증상별 찾기
   - 카테고리별 색인
   - 빠른 해결 가이드

3. **[01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md)**
   - 프로필 조회 예외
   - 프로필 수정 예외
   - 유효성 검사
   - 권한 관리

4. **[02-avatar-exceptions.md](./02-avatar-exceptions.md)**
   - 아바타 업로드
   - 이미지 크기 제한
   - 파일 형식 검증
   - 크롭 및 리사이징

5. **[03-account-deletion-exceptions.md](./03-account-deletion-exceptions.md)**
   - 계정 삭제 프로세스
   - OWNER 스터디 처리
   - 데이터 정리
   - 복구 불가 확인

6. **[99-best-practices.md](./99-best-practices.md)**
   - 프로필 관리 모범 사례
   - 보안 고려사항
   - 성능 최적화
   - 테스트 전략

---

## 관련 문서

### 인증 관련
- [인증 예외 처리](../auth/README.md)
- [세션 관리](../auth/03-session-management-exceptions.md)

### 설정 관련
- [설정 예외 처리](../settings/README.md)
- [비밀번호 변경](../settings/01-account-settings-exceptions.md)

### 데이터베이스
- [Prisma 스키마](../../../coup/prisma/schema.prisma)
- [User 모델](../../../coup/prisma/schema.prisma#L20)

---

## 버전 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0.0 | 2025-11-29 | 초기 문서 작성 | CoUp Team |

---

## 도움이 필요하신가요?

- 📧 **이메일**: support@coup.com
- 💬 **슬랙**: #coup-support
- 📚 **문서**: [전체 문서 목록](../README.md)
- 🐛 **버그 리포트**: [GitHub Issues](https://github.com/coup/coup/issues)

---

**다음 문서**: [프로필 색인 (INDEX.md)](./INDEX.md)  
**이전 문서**: [채팅 예외 처리](../chat/README.md)  
**상위 문서**: [예외 처리 메인](../README.md)

