# CoUp 예외 처리 구현 - Phase 4 시작 프롬프트

**프로젝트**: CoUp (스터디 관리 플랫폼)  
**현재 Phase**: Phase 4 - 프론트엔드 통합  
**영역**: profile  
**날짜**: 2025-12-01

---

## 📋 프로젝트 정보

### 기술 스택
- **프레임워크**: Next.js 16 App Router
- **언어**: JavaScript (ES6+) - TypeScript 사용 안 함
- **스타일**: Tailwind CSS + shadcn/ui
- **ORM**: Prisma
- **인증**: NextAuth v4

### 프로젝트 구조
```
CoUp/
├── coup/                    # Next.js 앱
│   ├── src/
│   │   ├── app/            # App Router
│   │   │   ├── api/        # API 라우트 ✅
│   │   │   └── ...
│   │   ├── components/     # React 컴포넌트
│   │   ├── lib/           # 유틸리티 라이브러리
│   │   │   ├── exceptions/ # 예외 클래스 ✅
│   │   │   ├── utils/     # 검증 함수 ✅
│   │   │   └── loggers/   # 로거 ✅
│   │   └── ...
│   └── ...
└── docs/                   # 문서
    └── exception/
        └── implement/
            └── profile/    # Profile 영역 문서 ✅
```

---

## ✅ 완료된 작업 (Phase 1-3)

### Phase 1: 분석 및 계획 ✅
- ✅ 현재 코드 분석 (12개 파일)
- ✅ 예외 설계 (90개 메서드, 7개 카테고리)
- ✅ Phase 계획 수립 (6개 Phase, 30시간)
- ✅ 문서화 완료

### Phase 2: 예외 클래스 및 유틸리티 구현 ✅
- ✅ **ProfileException.js** (90개 메서드)
- ✅ **validators.js** (13개 검증 함수)
- ✅ **profileLogger.js** (17개 로깅 함수)
- ✅ 테스트 66개 (100% 통과)

### Phase 3: API 라우트 강화 ✅
- ✅ **GET /api/users/me** - 프로필 조회 강화
- ✅ **PATCH /api/users/me** - 프로필 수정 강화
- ✅ **DELETE /api/users/me** - 계정 삭제 강화
- ✅ **POST /api/users/avatar** - 아바타 업로드 신규 생성
- ✅ **DELETE /api/users/avatar** - 아바타 삭제 신규 생성
- ✅ **PATCH /api/users/me/password** - 비밀번호 변경 강화

**Phase 3 성과**:
- ProfileException 25개 메서드 적용
- Validators 8개 함수 적용
- Loggers 7개 함수 적용
- 보안 검사 (XSS, SQL Injection) 추가
- 예상 6시간 → 실제 1시간 완료

---

## 🎯 현재 작업: Phase 4 - 프론트엔드 통합

### 목표
사용자 프로필 페이지와 설정 페이지에서 강화된 API를 사용하도록 프론트엔드를 업데이트하고, 에러 처리를 구현합니다.

### 예상 시간
8시간

### 대상 파일 및 컴포넌트

#### 1. 프로필 페이지 구조 파악 (1시간)
**작업 내용**:
- 현재 프로필 관련 페이지/컴포넌트 찾기
- `coup/src/app/` 디렉토리 탐색
- `coup/src/components/` 디렉토리 탐색
- 프로필 수정 폼 위치 확인
- 아바타 업로드 UI 위치 확인
- 비밀번호 변경 폼 위치 확인
- 계정 설정 페이지 위치 확인

**찾아야 할 파일 (추정)**:
```
coup/src/app/
├── profile/
│   └── page.js (또는 [userId]/page.js)
├── settings/
│   └── page.js
└── ...

coup/src/components/
├── profile/
│   ├── ProfileForm.jsx
│   ├── AvatarUpload.jsx
│   └── ...
├── settings/
│   ├── PasswordChange.jsx
│   ├── AccountSettings.jsx
│   └── ...
└── ...
```

#### 2. 프로필 수정 폼 업데이트 (2시간)
**작업 내용**:
- API 호출을 `/api/users/me` PATCH로 변경
- 이름 입력 필드에 실시간 검증 추가
- 바이오 입력 필드에 글자 수 카운터 추가 (200자 제한)
- 에러 메시지 표시 컴포넌트 추가
- 성공 토스트 메시지 추가
- 로딩 상태 관리

**구현 예제**:
```javascript
// ProfileForm.jsx
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function ProfileForm({ user }) {
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio || '')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio })
      })

      const data = await response.json()

      if (!data.success) {
        // 에러 처리
        const errorCode = data.error.code
        switch (errorCode) {
          case 'PROFILE-003':
            setErrors({ name: '이름은 2자 이상이어야 합니다' })
            break
          case 'PROFILE-004':
            setErrors({ name: '이름은 50자 이하여야 합니다' })
            break
          case 'PROFILE-005':
            setErrors({ bio: '자기소개는 200자 이하여야 합니다' })
            break
          case 'PROFILE-012':
            setErrors({ general: '보안상 문제가 있는 입력입니다' })
            break
          default:
            setErrors({ general: data.error.message })
        }
        return
      }

      // 성공
      toast({
        title: '프로필 업데이트 완료',
        description: '프로필이 성공적으로 업데이트되었습니다',
      })

    } catch (error) {
      setErrors({ general: '네트워크 오류가 발생했습니다' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>이름</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={50}
        />
        {errors.name && <p className="text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label>자기소개</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
        />
        <p>{bio.length}/200자</p>
        {errors.bio && <p className="text-red-500">{errors.bio}</p>}
      </div>

      {errors.general && (
        <p className="text-red-500">{errors.general}</p>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}
```

#### 3. 아바타 업로드 UI 구현 (2시간)
**작업 내용**:
- 파일 선택 버튼 추가
- 이미지 미리보기 기능
- 드래그 앤 드롭 지원
- 파일 크기/형식 검증 (클라이언트 측)
- 업로드 진행률 표시
- 아바타 삭제 버튼
- 에러 처리

**구현 예제**:
```javascript
// AvatarUpload.jsx
import { useState, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

export function AvatarUpload({ currentAvatar, onUpdate }) {
  const [preview, setPreview] = useState(currentAvatar)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  const handleFileChange = async (file) => {
    // 클라이언트 측 검증
    if (!file) return

    // 파일 크기 확인 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '파일 크기 초과',
        description: '파일 크기는 5MB 이하여야 합니다',
        variant: 'destructive'
      })
      return
    }

    // 파일 형식 확인
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast({
        title: '지원하지 않는 형식',
        description: 'JPG, PNG, GIF, WebP 형식만 지원합니다',
        variant: 'destructive'
      })
      return
    }

    // 미리보기
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)

    // 업로드
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!data.success) {
        // 에러 처리
        toast({
          title: '업로드 실패',
          description: data.error.message,
          variant: 'destructive'
        })
        setPreview(currentAvatar) // 이전 이미지로 복구
        return
      }

      // 성공
      toast({
        title: '아바타 업로드 완료',
        description: '프로필 이미지가 변경되었습니다',
      })
      onUpdate(data.user)

    } catch (error) {
      toast({
        title: '네트워크 오류',
        description: '업로드 중 오류가 발생했습니다',
        variant: 'destructive'
      })
      setPreview(currentAvatar)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('아바타를 삭제하시겠습니까?')) return

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!data.success) {
        toast({
          title: '삭제 실패',
          description: data.error.message,
          variant: 'destructive'
        })
        return
      }

      toast({
        title: '아바타 삭제 완료',
        description: '기본 이미지로 변경되었습니다',
      })
      setPreview(null)
      onUpdate(data.user)

    } catch (error) {
      toast({
        title: '네트워크 오류',
        description: '삭제 중 오류가 발생했습니다',
        variant: 'destructive'
      })
    }
  }

  return (
    <div>
      <div className="avatar-preview">
        {preview ? (
          <img src={preview} alt="Avatar" />
        ) : (
          <div className="default-avatar">기본 이미지</div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={(e) => handleFileChange(e.target.files[0])}
        hidden
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? '업로드 중...' : '이미지 선택'}
      </button>

      {preview && (
        <button onClick={handleDelete} variant="destructive">
          아바타 삭제
        </button>
      )}
    </div>
  )
}
```

#### 4. 비밀번호 변경 폼 구현 (1.5시간)
**작업 내용**:
- 현재 비밀번호 입력 필드
- 새 비밀번호 입력 필드
- 비밀번호 확인 입력 필드
- 비밀번호 강도 표시기
- 요구사항 체크리스트
- 에러 처리

**구현 예제**:
```javascript
// PasswordChangeForm.jsx
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { toast } = useToast()

  // 비밀번호 강도 체크
  const checkStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
    }
    return checks
  }

  const strength = checkStrength(newPassword)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      })

      const data = await response.json()

      if (!data.success) {
        const errorCode = data.error.code
        switch (errorCode) {
          case 'PROFILE-055':
            setErrors({ current: '비밀번호를 입력해주세요' })
            break
          case 'PROFILE-056':
            setErrors({ new: '비밀번호가 너무 약합니다' })
            break
          case 'PROFILE-057':
            setErrors({ current: '현재 비밀번호가 일치하지 않습니다' })
            break
          case 'PROFILE-060':
            setErrors({ new: '새 비밀번호가 현재 비밀번호와 같습니다' })
            break
          case 'PROFILE-061':
            setErrors({ confirm: '비밀번호가 일치하지 않습니다' })
            break
          default:
            setErrors({ general: data.error.message })
        }
        return
      }

      // 성공
      toast({
        title: '비밀번호 변경 완료',
        description: '비밀번호가 성공적으로 변경되었습니다',
      })

      // 폼 초기화
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

    } catch (error) {
      setErrors({ general: '네트워크 오류가 발생했습니다' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>현재 비밀번호</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        {errors.current && <p className="text-red-500">{errors.current}</p>}
      </div>

      <div>
        <label>새 비밀번호</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {errors.new && <p className="text-red-500">{errors.new}</p>}

        {/* 비밀번호 요구사항 체크리스트 */}
        <div className="requirements">
          <p className={strength.length ? 'text-green-500' : 'text-gray-400'}>
            ✓ 8자 이상
          </p>
          <p className={strength.uppercase ? 'text-green-500' : 'text-gray-400'}>
            ✓ 대문자 포함
          </p>
          <p className={strength.lowercase ? 'text-green-500' : 'text-gray-400'}>
            ✓ 소문자 포함
          </p>
          <p className={strength.number ? 'text-green-500' : 'text-gray-400'}>
            ✓ 숫자 포함
          </p>
          <p className={strength.special ? 'text-green-500' : 'text-gray-400'}>
            ✓ 특수문자 포함
          </p>
        </div>
      </div>

      <div>
        <label>비밀번호 확인</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errors.confirm && <p className="text-red-500">{errors.confirm}</p>}
      </div>

      {errors.general && (
        <p className="text-red-500">{errors.general}</p>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? '변경 중...' : '비밀번호 변경'}
      </button>
    </form>
  )
}
```

#### 5. 계정 삭제 다이얼로그 구현 (1.5시간)
**작업 내용**:
- 삭제 확인 다이얼로그
- 이메일 입력 검증
- OWNER 스터디 경고 메시지
- 삭제 후 로그아웃 처리

**구현 예제**:
```javascript
// AccountDeletion.jsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

export function AccountDeletion({ userEmail }) {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmation !== userEmail) {
      setError('이메일이 일치하지 않습니다')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation })
      })

      const data = await response.json()

      if (!data.success) {
        const errorCode = data.error.code
        switch (errorCode) {
          case 'PROFILE-064':
            setError('OWNER 권한의 스터디가 있어 계정을 삭제할 수 없습니다. 먼저 스터디를 다른 사람에게 양도하거나 삭제해주세요.')
            break
          case 'PROFILE-067':
            setError('이메일이 일치하지 않습니다')
            break
          default:
            setError(data.error.message)
        }
        return
      }

      // 성공 - 로그아웃 처리
      toast({
        title: '계정 삭제 완료',
        description: '그동안 이용해 주셔서 감사합니다',
      })

      // 로그아웃 후 홈으로 이동
      await signOut({ redirect: false })
      router.push('/')

    } catch (error) {
      setError('네트워크 오류가 발생했습니다')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-red-600"
      >
        계정 삭제
      </button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 계정을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 계정을 삭제하려면 아래에 이메일 주소를 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div>
            <label>이메일 확인</label>
            <input
              type="email"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={userEmail}
            />
            {error && <p className="text-red-500">{error}</p>}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || confirmation !== userEmail}
              className="bg-red-600"
            >
              {isDeleting ? '삭제 중...' : '계정 삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

---

## 📋 작업 순서

### 1단계: 현재 구조 파악 (1시간)
```bash
# 프로필 관련 페이지/컴포넌트 찾기
- coup/src/app/ 디렉토리 탐색
- coup/src/components/ 디렉토리 탐색
- 현재 구현 상태 확인
```

### 2단계: 프로필 수정 폼 업데이트 (2시간)
- API 호출 수정
- 검증 로직 추가
- 에러 처리 구현
- 성공 토스트 추가

### 3단계: 아바타 업로드 UI 구현 (2시간)
- 파일 선택 UI
- 미리보기 기능
- 업로드/삭제 처리
- 에러 처리

### 4단계: 비밀번호 변경 폼 구현 (1.5시간)
- 비밀번호 강도 표시기
- 요구사항 체크리스트
- 에러 처리

### 5단계: 계정 삭제 다이얼로그 구현 (1.5시간)
- 확인 다이얼로그
- 삭제 후 로그아웃 처리

---

## ✅ 완료 기준

### 프로필 수정 폼
- [ ] 이름 입력 실시간 검증 (2-50자)
- [ ] 바이오 글자 수 카운터 (200자)
- [ ] 에러 메시지 표시
- [ ] 성공 토스트 표시
- [ ] 로딩 상태 표시

### 아바타 업로드
- [ ] 파일 선택 버튼
- [ ] 이미지 미리보기
- [ ] 파일 크기/형식 검증
- [ ] 업로드 진행률 표시 (선택)
- [ ] 아바타 삭제 기능
- [ ] 에러 처리

### 비밀번호 변경
- [ ] 비밀번호 강도 표시기
- [ ] 요구사항 체크리스트
- [ ] 현재 비밀번호 확인
- [ ] 에러 처리
- [ ] 성공 후 폼 초기화

### 계정 삭제
- [ ] 삭제 확인 다이얼로그
- [ ] 이메일 입력 검증
- [ ] OWNER 스터디 경고
- [ ] 삭제 후 로그아웃
- [ ] 에러 처리

---

## 🎯 진행 방식

1. **구조 파악**: 현재 프로필 관련 파일 찾기
2. **단계별 구현**: 위 순서대로 하나씩 구현
3. **테스트**: 각 기능 동작 확인
4. **문서화**: 변경 사항 기록

---

## 📚 참조 문서

### Phase 3 완료 문서
- **PHASE-3-COMPLETE.md** - API 강화 완료 보고서
- **API-CHANGES.md** - API 변경 사항 상세 가이드

### 사용 가능한 컴포넌트
- shadcn/ui 컴포넌트 활용
- Tailwind CSS 스타일링
- Next.js App Router 패턴

---

## 🚀 작업 지시

**새 세션에서 이 파일을 읽은 후, 위 내용을 기반으로 Phase 4 작업을 즉시 시작하세요.**

### 작업 절차

1. **1단계 (1시간)**: 현재 프로필 관련 파일 구조 파악
   - app/ 디렉토리 탐색
   - components/ 디렉토리 탐색
   - 현재 구현 확인

2. **2단계 (2시간)**: 프로필 수정 폼 업데이트
   - API 호출 수정
   - 검증 로직 추가
   - 에러 처리 구현

3. **3단계 (2시간)**: 아바타 업로드 UI 구현
   - 파일 선택/미리보기
   - 업로드/삭제 처리

4. **4단계 (1.5시간)**: 비밀번호 변경 폼 구현
   - 비밀번호 강도 표시기
   - 에러 처리

5. **5단계 (1.5시간)**: 계정 삭제 다이얼로그 구현
   - 확인 다이얼로그
   - 로그아웃 처리

### 중요 사항

- **위 구현 예제를 참고**하여 일관성 유지
- **에러 코드별 메시지 매핑** 필수
- **shadcn/ui 컴포넌트 활용**
- **사용자 경험(UX) 중시**

### 완료 기준

모든 체크리스트 항목이 ✅로 표시되고, 기능이 정상 작동하며, 문서가 작성되면 완료

---

**즉시 1단계부터 시작하세요!**

---

**작성일**: 2025-12-01  
**Phase**: 4 - 프론트엔드 통합  
**예상 시간**: 8시간  
**우선순위**: 🔴 높음

