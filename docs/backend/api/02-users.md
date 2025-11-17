# 사용자 API 명세

## 📋 개요
- **Base URL**: `/api/users`
- **인증 필요**: ✅ 모든 엔드포인트
- **총 엔드포인트**: 3개

---

## 👤 API 목록

### 1. 내 정보 조회
**GET** `/api/users/me`

#### Headers
```
Authorization: Bearer {token}
```

#### Response (200)
```json
{
  "success": true,
  "user": {
    "id": "clxx123...",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    "bio": "백엔드 개발자입니다",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2025-11-18T10:00:00.000Z",
    "lastLoginAt": "2025-11-18T15:30:00.000Z",
    "stats": {
      "studyCount": 6,
      "taskCount": 15,
      "unreadNotifications": 10
    }
  }
}
```

#### Error Responses
- **401**: 인증 필요
- **404**: 사용자 없음

---

### 2. 프로필 수정
**PATCH** `/api/users/me`

#### Request Body
```json
{
  "name": "김철수",
  "bio": "프론트엔드 개발자로 전향했습니다",
  "avatar": "https://new-avatar-url.com/image.jpg"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "프로필이 업데이트되었습니다",
  "user": {
    "id": "clxx123...",
    "email": "user@example.com",
    "name": "김철수",
    "avatar": "https://new-avatar-url.com/image.jpg",
    "bio": "프론트엔드 개발자로 전향했습니다"
  }
}
```

#### Validation
- `name`: 2자 이상 (선택)
- `bio`: 500자 이하 (선택)
- `avatar`: URL 형식 (선택)

---

### 3. 비밀번호 변경
**PATCH** `/api/users/me/password`

#### Request Body
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Validation
- `currentPassword`: 필수
- `newPassword`: 최소 8자 이상

#### Response (200)
```json
{
  "success": true,
  "message": "비밀번호가 변경되었습니다"
}
```

#### Error Responses
- **400**: 현재 비밀번호 불일치
  ```json
  {
    "error": "현재 비밀번호가 일치하지 않습니다"
  }
  ```
- **400**: 소셜 로그인 계정
  ```json
  {
    "error": "비밀번호를 변경할 수 없습니다"
  }
  ```

---

## 🔐 보안 정책

### 비밀번호 변경
- OAuth 계정(Google, GitHub)은 비밀번호 변경 불가
- 현재 비밀번호 확인 필수
- bcrypt 해싱 사용

### 프로필 수정
- 이메일 변경 불가 (보안)
- role 변경 불가 (관리자만)
- status 변경 불가 (관리자만)

---

## 📊 사용자 통계

### stats 객체
```javascript
{
  studyCount: 6,        // 활성 스터디 수
  taskCount: 15,        // 전체 할일 수
  unreadNotifications: 10  // 읽지 않은 알림
}
```

### 계산 방식
```javascript
// 활성 스터디
studyMembers: {
  where: { status: 'ACTIVE' }
}

// 읽지 않은 알림
notifications: {
  where: { isRead: false }
}
```

---

## 🎨 아바타 시스템

### 기본 아바타
```javascript
// DiceBear API 사용
`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
```

### 커스텀 아바타
- URL 저장 (파일 업로드 시)
- 최대 크기: 2MB
- 허용 형식: jpg, png, gif

---

## 🔄 세션 업데이트

### 프로필 수정 후 세션 갱신
```javascript
import { useSession } from 'next-auth/react'

const { update } = useSession()

// 프로필 수정 후
await update({
  name: newName,
  avatar: newAvatar
})
```

---

## 📝 Client Usage 예시

### React Query Hook 사용
```javascript
import { useMe, useUpdateProfile } from '@/lib/hooks/useApi'

function ProfilePage() {
  const { data, isLoading } = useMe()
  const updateProfile = useUpdateProfile()

  const handleUpdate = async (formData) => {
    try {
      await updateProfile.mutateAsync(formData)
      toast.success('프로필이 업데이트되었습니다')
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (isLoading) return <Loading />

  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>{data.user.bio}</p>
      {/* 수정 폼 */}
    </div>
  )
}
```

---

**최종 업데이트**: 2025-11-18

