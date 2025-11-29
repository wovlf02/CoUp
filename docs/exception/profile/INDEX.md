# 프로필 예외 처리 색인

**작성일**: 2025-11-29  
**카테고리**: Profile Management  
**목적**: 빠른 문제 해결을 위한 완전한 색인

---

## 📋 목차

1. [증상별 찾기](#증상별-찾기)
2. [카테고리별 찾기](#카테고리별-찾기)
3. [HTTP 상태 코드별 찾기](#http-상태-코드별-찾기)
4. [컴포넌트별 찾기](#컴포넌트별-찾기)
5. [빠른 해결 가이드](#빠른-해결-가이드)

---

## 증상별 찾기

사용자가 보고하는 증상으로 문제를 찾습니다.

### 프로필 조회 관련

| 증상 | 가능한 원인 | 해결 문서 | 우선순위 |
|------|-------------|-----------|----------|
| "프로필을 불러올 수 없습니다" | 세션 만료, DB 오류 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#프로필-조회-실패) | 🔴 높음 |
| "사용자 정보가 없습니다" | 유효하지 않은 사용자 ID | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#사용자-없음) | 🔴 높음 |
| "통계를 불러올 수 없습니다" | 통계 API 실패 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#통계-조회-실패) | 🟡 중간 |
| "권한이 없습니다" | 타인 프로필 접근 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#권한-검증) | 🟡 중간 |
| 로딩이 끝나지 않음 | 무한 로딩 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#무한-로딩) | 🟡 중간 |

### 프로필 수정 관련

| 증상 | 가능한 원인 | 해결 문서 | 우선순위 |
|------|-------------|-----------|----------|
| "이름은 2-50자여야 합니다" | 유효성 검사 실패 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#이름-검증) | 🟢 낮음 |
| "자기소개는 200자 이하여야 합니다" | 글자 수 초과 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#자기소개-검증) | 🟢 낮음 |
| "프로필 수정에 실패했습니다" | 네트워크 오류, DB 실패 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#수정-실패) | 🔴 높음 |
| "이메일이 이미 사용 중입니다" | 중복 이메일 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#중복-이메일) | 🟡 중간 |
| 수정 후 반영 안 됨 | 캐시 무효화 실패 | [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#캐시-동기화) | 🟡 중간 |

### 아바타 업로드 관련

| 증상 | 가능한 원인 | 해결 문서 | 우선순위 |
|------|-------------|-----------|----------|
| "파일 크기가 너무 큽니다" | 5MB 초과 | [02-avatar-exceptions.md](./02-avatar-exceptions.md#파일-크기-초과) | 🟢 낮음 |
| "지원하지 않는 파일 형식입니다" | 비이미지 파일 | [02-avatar-exceptions.md](./02-avatar-exceptions.md#파일-형식-오류) | 🟢 낮음 |
| "아바타 업로드에 실패했습니다" | 네트워크 오류 | [02-avatar-exceptions.md](./02-avatar-exceptions.md#업로드-실패) | 🟡 중간 |
| 아바타가 표시되지 않음 | URL 오류, CORS | [02-avatar-exceptions.md](./02-avatar-exceptions.md#아바타-표시-실패) | 🟡 중간 |
| 크롭 기능이 작동 안 함 | 라이브러리 오류 | [02-avatar-exceptions.md](./02-avatar-exceptions.md#크롭-오류) | 🟢 낮음 |

### 계정 삭제 관련

| 증상 | 가능한 원인 | 해결 문서 | 우선순위 |
|------|-------------|-----------|----------|
| "OWNER 스터디가 있습니다" | 소유자 권한 양도 필요 | [03-account-deletion-exceptions.md](./03-account-deletion-exceptions.md#owner-스터디-존재) | 🔴 높음 |
| "계정 삭제에 실패했습니다" | DB 트랜잭션 실패 | [03-account-deletion-exceptions.md](./03-account-deletion-exceptions.md#삭제-실패) | 🔴 높음 |
| 삭제 후 로그아웃 안 됨 | 세션 클리어 실패 | [03-account-deletion-exceptions.md](./03-account-deletion-exceptions.md#세션-정리) | 🟡 중간 |
| 데이터가 남아있음 | 연관 데이터 미삭제 | [03-account-deletion-exceptions.md](./03-account-deletion-exceptions.md#데이터-정리) | 🔴 높음 |

---

## 카테고리별 찾기

### 1. 데이터 조회 예외

**프로필 조회**:
- [사용자 없음](./01-profile-edit-exceptions.md#사용자-없음)
- [세션 만료](./01-profile-edit-exceptions.md#세션-만료)
- [DB 연결 오류](./01-profile-edit-exceptions.md#db-연결-오류)
- [권한 없음](./01-profile-edit-exceptions.md#권한-검증)

**통계 조회**:
- [통계 API 실패](./01-profile-edit-exceptions.md#통계-조회-실패)
- [데이터 없음](./01-profile-edit-exceptions.md#통계-데이터-없음)
- [계산 오류](./01-profile-edit-exceptions.md#통계-계산-오류)

### 2. 데이터 수정 예외

**프로필 수정**:
- [유효성 검사 실패](./01-profile-edit-exceptions.md#유효성-검사)
- [중복 데이터](./01-profile-edit-exceptions.md#중복-이메일)
- [업데이트 실패](./01-profile-edit-exceptions.md#수정-실패)
- [캐시 동기화](./01-profile-edit-exceptions.md#캐시-동기화)

### 3. 파일 업로드 예외

**아바타 업로드**:
- [파일 크기 초과](./02-avatar-exceptions.md#파일-크기-초과)
- [파일 형식 오류](./02-avatar-exceptions.md#파일-형식-오류)
- [업로드 실패](./02-avatar-exceptions.md#업로드-실패)
- [이미지 처리 오류](./02-avatar-exceptions.md#이미지-처리-오류)

### 4. 계정 관리 예외

**계정 삭제**:
- [OWNER 스터디 존재](./03-account-deletion-exceptions.md#owner-스터디-존재)
- [삭제 실패](./03-account-deletion-exceptions.md#삭제-실패)
- [데이터 정리](./03-account-deletion-exceptions.md#데이터-정리)
- [세션 정리](./03-account-deletion-exceptions.md#세션-정리)

---

## HTTP 상태 코드별 찾기

### 4xx 클라이언트 오류

#### 400 Bad Request
- [유효성 검사 실패](./01-profile-edit-exceptions.md#유효성-검사)
- [잘못된 입력](./01-profile-edit-exceptions.md#잘못된-입력)
- [파일 크기 초과](./02-avatar-exceptions.md#파일-크기-초과)

**해결 방법**:
```javascript
if (error.status === 400) {
  // 에러 메시지 표시
  toast.error(error.response?.data?.error || '잘못된 요청입니다')
}
```

#### 401 Unauthorized
- [세션 만료](./01-profile-edit-exceptions.md#세션-만료)
- [인증 실패](./01-profile-edit-exceptions.md#인증-실패)

**해결 방법**:
```javascript
if (error.status === 401) {
  // 재로그인 필요
  signOut({ callbackUrl: '/auth/signin' })
}
```

#### 403 Forbidden
- [권한 없음](./01-profile-edit-exceptions.md#권한-검증)
- [타인 프로필 수정 시도](./01-profile-edit-exceptions.md#권한-없음)

**해결 방법**:
```javascript
if (error.status === 403) {
  toast.error('권한이 없습니다')
  router.back()
}
```

#### 404 Not Found
- [사용자 없음](./01-profile-edit-exceptions.md#사용자-없음)
- [삭제된 계정](./03-account-deletion-exceptions.md#삭제된-계정)

**해결 방법**:
```javascript
if (error.status === 404) {
  toast.error('사용자를 찾을 수 없습니다')
  router.push('/dashboard')
}
```

#### 409 Conflict
- [중복 이메일](./01-profile-edit-exceptions.md#중복-이메일)

**해결 방법**:
```javascript
if (error.status === 409) {
  toast.error('이미 사용 중인 이메일입니다')
}
```

#### 413 Payload Too Large
- [파일 크기 초과](./02-avatar-exceptions.md#파일-크기-초과)

**해결 방법**:
```javascript
if (error.status === 413) {
  toast.error('파일 크기가 너무 큽니다 (최대 5MB)')
}
```

### 5xx 서버 오류

#### 500 Internal Server Error
- [DB 연결 오류](./01-profile-edit-exceptions.md#db-연결-오류)
- [서버 내부 오류](./01-profile-edit-exceptions.md#서버-오류)

**해결 방법**:
```javascript
if (error.status === 500) {
  toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
  // 로깅
  console.error('Server error:', error)
}
```

---

## 컴포넌트별 찾기

### 페이지 컴포넌트

#### src/app/me/page.jsx
- [프로필 페이지 로딩 실패](./01-profile-edit-exceptions.md#프로필-조회-실패)
- [사용자 없음](./01-profile-edit-exceptions.md#사용자-없음)
- [통계 로딩 실패](./01-profile-edit-exceptions.md#통계-조회-실패)

### UI 컴포넌트

#### ProfileSection.jsx
- [아바타 표시 실패](./02-avatar-exceptions.md#아바타-표시-실패)
- [프로필 정보 누락](./01-profile-edit-exceptions.md#프로필-정보-누락)

#### ProfileEditForm.jsx
- [유효성 검사 실패](./01-profile-edit-exceptions.md#유효성-검사)
- [수정 실패](./01-profile-edit-exceptions.md#수정-실패)
- [세션 갱신 실패](./01-profile-edit-exceptions.md#세션-갱신)

#### ActivityStats.jsx
- [통계 계산 오류](./01-profile-edit-exceptions.md#통계-계산-오류)
- [데이터 없음](./01-profile-edit-exceptions.md#통계-데이터-없음)

#### DeleteAccountModal.jsx
- [OWNER 스터디 존재](./03-account-deletion-exceptions.md#owner-스터디-존재)
- [삭제 실패](./03-account-deletion-exceptions.md#삭제-실패)

### API 라우트

#### /api/users/me - GET
- [사용자 조회 실패](./01-profile-edit-exceptions.md#프로필-조회-실패)
- [DB 연결 오류](./01-profile-edit-exceptions.md#db-연결-오류)

#### /api/users/me - PATCH
- [프로필 수정 실패](./01-profile-edit-exceptions.md#수정-실패)
- [유효성 검사 실패](./01-profile-edit-exceptions.md#유효성-검사)

#### /api/users/me - DELETE
- [계정 삭제 실패](./03-account-deletion-exceptions.md#삭제-실패)
- [OWNER 스터디 존재](./03-account-deletion-exceptions.md#owner-스터디-존재)

#### /api/users/me/stats - GET
- [통계 조회 실패](./01-profile-edit-exceptions.md#통계-조회-실패)

---

## 빠른 해결 가이드

### 🚨 긴급 문제 (5분 이내 해결)

#### 1. 프로필을 불러올 수 없습니다

**즉시 확인**:
```bash
# 1. 세션 확인
- 브라우저 개발자 도구 > Application > Cookies
- next-auth.session-token 존재하는지 확인

# 2. API 응답 확인
- Network 탭에서 /api/users/me 요청 확인
- 상태 코드 및 응답 확인

# 3. 콘솔 에러 확인
- Console 탭에서 에러 메시지 확인
```

**즉시 해결**:
```javascript
// 세션 만료 시
signOut({ callbackUrl: '/auth/signin' })

// 네트워크 오류 시
// 재시도 버튼 제공
<button onClick={() => refetch()}>다시 시도</button>
```

#### 2. 프로필 수정이 저장되지 않습니다

**즉시 확인**:
```javascript
// 1. 입력값 검증
console.log('Form data:', formData)

// 2. API 요청 확인
console.log('Update request:', {
  url: '/api/users/me',
  method: 'PATCH',
  body: formData
})

// 3. 응답 확인
console.log('Update response:', response)
```

**즉시 해결**:
```javascript
// 클라이언트 검증 추가
if (formData.name.length < 2) {
  toast.error('이름은 2자 이상이어야 합니다')
  return
}

// 에러 핸들링 개선
try {
  await updateProfile.mutateAsync(formData)
  toast.success('프로필이 수정되었습니다')
} catch (error) {
  console.error('Update error:', error)
  toast.error(error.response?.data?.error || '수정에 실패했습니다')
}
```

#### 3. 아바타 업로드가 실패합니다

**즉시 확인**:
```javascript
// 1. 파일 정보 확인
console.log('File info:', {
  name: file.name,
  size: file.size,
  type: file.type
})

// 2. 크기 확인
if (file.size > 5 * 1024 * 1024) {
  console.error('File too large:', file.size)
}

// 3. 형식 확인
if (!file.type.startsWith('image/')) {
  console.error('Invalid file type:', file.type)
}
```

**즉시 해결**:
```javascript
// 파일 검증
const validateFile = (file) => {
  if (file.size > 5 * 1024 * 1024) {
    toast.error('파일 크기는 5MB 이하여야 합니다')
    return false
  }
  
  if (!file.type.startsWith('image/')) {
    toast.error('이미지 파일만 업로드 가능합니다')
    return false
  }
  
  return true
}

if (!validateFile(file)) return
```

### ⚡ 일반 문제 (30분 이내 해결)

#### 1. 통계가 표시되지 않습니다

**문서**: [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#통계-조회-실패)

**빠른 해결**:
```javascript
const { data, isLoading, error } = useUserStats()

if (isLoading) return <StatsSkeleton />
if (error) return <div>통계를 불러올 수 없습니다</div>
if (!data?.stats) return <div>통계가 없습니다</div>

return <ActivityStats stats={data.stats} />
```

#### 2. 계정 삭제가 실패합니다

**문서**: [03-account-deletion-exceptions.md](./03-account-deletion-exceptions.md#삭제-실패)

**빠른 해결**:
```javascript
// OWNER 스터디 확인
const hasOwnerStudies = await checkOwnerStudies(userId)
if (hasOwnerStudies) {
  toast.error('OWNER인 스터디의 소유권을 먼저 양도해주세요')
  return
}

// 계정 삭제
await deleteAccount()
await signOut({ callbackUrl: '/' })
```

### 🔧 복잡한 문제 (1시간 이내 해결)

#### 1. 프로필 수정 후 반영이 안 됩니다

**문서**: [01-profile-edit-exceptions.md](./01-profile-edit-exceptions.md#캐시-동기화)

**상세 해결**:
```javascript
// React Query 캐시 무효화
const updateProfile = useMutation({
  mutationFn: (data) => api.patch('/api/users/me', data),
  onSuccess: () => {
    // 캐시 무효화
    queryClient.invalidateQueries(['users', 'me'])
    
    // NextAuth 세션 갱신
    updateSession({
      name: formData.name
    })
  }
})
```

#### 2. 아바타 크롭 기능이 작동하지 않습니다

**문서**: [02-avatar-exceptions.md](./02-avatar-exceptions.md#크롭-오류)

**상세 해결**:
[02-avatar-exceptions.md](./02-avatar-exceptions.md#크롭-오류) 참조

---

## 성능 최적화 참조

### React Query 설정

```javascript
// 프로필 조회 최적화
const { data: userData } = useMe({
  staleTime: 5 * 60 * 1000,  // 5분
  cacheTime: 10 * 60 * 1000, // 10분
  refetchOnWindowFocus: false
})

// 통계 조회 최적화
const { data: statsData } = useUserStats({
  staleTime: 2 * 60 * 1000,  // 2분
  cacheTime: 5 * 60 * 1000   // 5분
})
```

### 낙관적 업데이트

```javascript
const updateProfile = useMutation({
  mutationFn: (data) => api.patch('/api/users/me', data),
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['users', 'me'])
    const previousData = queryClient.getQueryData(['users', 'me'])
    
    queryClient.setQueryData(['users', 'me'], (old) => ({
      ...old,
      user: { ...old.user, ...newData }
    }))
    
    return { previousData }
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['users', 'me'], context.previousData)
  }
})
```

---

## 관련 문서

- **[프로필 개요](./README.md)**: 프로필 시스템 전체 개요
- **[프로필 수정 예외](./01-profile-edit-exceptions.md)**: 프로필 수정 관련 예외
- **[아바타 예외](./02-avatar-exceptions.md)**: 아바타 업로드 예외
- **[계정 삭제 예외](./03-account-deletion-exceptions.md)**: 계정 삭제 관련 예외
- **[모범 사례](./99-best-practices.md)**: 프로필 관리 모범 사례

---

## 도움이 필요하신가요?

**문서를 찾을 수 없나요?**
1. 증상별 찾기에서 검색
2. 카테고리별 찾기에서 탐색
3. HTTP 상태 코드로 확인

**여전히 해결되지 않나요?**
- 📧 **이메일**: support@coup.com
- 💬 **슬랙**: #coup-support
- 🐛 **버그 리포트**: [GitHub Issues](https://github.com/coup/coup/issues)

---

**다음 문서**: [프로필 수정 예외 (01-profile-edit-exceptions.md)](./01-profile-edit-exceptions.md)  
**이전 문서**: [프로필 개요 (README.md)](./README.md)  
**상위 문서**: [예외 처리 메인](../README.md)

