# 헬퍼 함수 및 유틸리티

## 위치

```
src/lib/
├── admin/               # 관리자 헬퍼
│   ├── auth.js
│   ├── permissions.js
│   └── roles.js
├── helpers/             # 도메인 헬퍼
├── validators/          # 유효성 검증
├── exceptions/          # 예외 처리
├── middleware/          # 미들웨어
├── error-handlers/      # 에러 핸들러
└── loggers/             # 로깅
```

---

## 인증 헬퍼

### `src/lib/auth-helpers.js`

```javascript
// 현재 세션 사용자 조회
export async function getCurrentUser()
// 반환: { user, session } | null

// 인증 필수 (401 에러)
export async function requireAuth()
// 반환: user

// 관리자 권한 필수 (403 에러)
export async function requireAdmin()
// 반환: user (role: ADMIN)
```

### `src/lib/jwt.js`

```javascript
// JWT 토큰 생성
export function signToken(payload, expiresIn = '7d')

// JWT 토큰 검증
export function verifyToken(token)
```

---

## 관리자 헬퍼

### `src/lib/admin/auth.js`

```javascript
// 관리자 인증 확인
export async function verifyAdminAuth()

// 관리자 세션 검증
export async function getAdminSession()
```

### `src/lib/admin/permissions.js`

```javascript
// 권한 확인
export function hasPermission(user, permission)

// 필요 권한 검증
export function requirePermission(permission)
```

### `src/lib/admin/roles.js`

```javascript
// 역할별 권한 정의
export const ROLE_PERMISSIONS = {
  VIEWER: ['view_users', 'view_studies', 'view_reports'],
  MODERATOR: [...VIEWER, 'moderate_content', 'process_reports'],
  ADMIN: [...MODERATOR, 'manage_users', 'manage_studies', 'apply_sanctions'],
  SUPER_ADMIN: ['*']
}
```

---

## 스터디 헬퍼

### `src/lib/study-helpers.js`

```javascript
// 스터디 멤버 권한 확인
export async function checkStudyMembership(studyId, userId)
// 반환: { isMember, role, member }

// 스터디 관리자 여부
export function isStudyAdmin(member)
// member.role === 'OWNER' || 'ADMIN'

// 초대 코드 생성
export function generateInviteCode()
```

---

## 마이 스터디 헬퍼

### `src/lib/my-studies-helpers.js`

```javascript
// 내 스터디 목록 조회
export async function getMyStudies(userId, filters)

// 스터디 권한 확인
export async function checkStudyPermission(studyId, userId, requiredRole)
```

---

## 알림 헬퍼

### `src/lib/notification-helpers.js`

```javascript
// 알림 생성
export async function createNotification({
  userId,
  type,
  studyId,
  studyName,
  studyEmoji,
  message,
  data
})

// 다수에게 알림 생성
export async function createBulkNotifications(notifications)
```

---

## 파일 업로드 헬퍼

### `src/lib/file-upload-helpers.js`

```javascript
// 파일 저장
export async function saveFile(file, directory)

// 파일 삭제
export async function deleteFile(filePath)

// 파일 크기 검증
export function validateFileSize(size, maxSize)

// 파일 타입 검증
export function validateFileType(mimeType, allowedTypes)
```

---

## 활동 로그 헬퍼

### `src/lib/activity-log-helpers.js`

```javascript
// 활동 로그 생성
export async function logActivity({
  userId,
  action,
  targetType,
  targetId,
  metadata
})

// 관리자 활동 로그
export async function logAdminAction({
  adminId,
  action,
  targetType,
  targetId,
  before,
  after,
  reason
})
```

---

## 트랜잭션 헬퍼

### `src/lib/transaction-helpers.js`

```javascript
// 트랜잭션 실행
export async function withTransaction(callback)
// Prisma $transaction 래퍼

// 재시도 로직
export async function withRetry(fn, maxRetries = 3)
```

---

## 캐시 헬퍼

### `src/lib/cache-helpers.js`

```javascript
// 캐시 조회
export async function getCache(key)

// 캐시 저장
export async function setCache(key, value, ttl)

// 캐시 삭제
export async function deleteCache(key)

// 캐시 패턴 삭제
export async function deleteCachePattern(pattern)
```

---

## 유효성 검증

### `src/lib/validators/study-validators.js`

```javascript
// 스터디 생성 검증
export function validateStudyCreate(data)

// 스터디 수정 검증
export function validateStudyUpdate(data)
```

### `src/lib/validators/chat-validators.js`

```javascript
// 메시지 검증
export function validateMessage(content)
```

### `src/lib/validators/notification-validators.js`

```javascript
// 알림 데이터 검증
export function validateNotification(data)
```

### `src/lib/validators/group-validators.js`

```javascript
// 그룹 생성 검증
export function validateGroupCreate(data)
```

### `src/lib/validators/validation-helpers.js`

```javascript
// 공통 검증 헬퍼
export function isValidEmail(email)
export function isValidPassword(password)
export function sanitizeString(str)
```

---

## 예외 처리

### `src/lib/exceptions/`

```javascript
// 인증 에러
export class AuthError extends Error {}

// 권한 에러
export class ForbiddenError extends Error {}

// 찾을 수 없음
export class NotFoundError extends Error {}

// 유효성 검증 에러
export class ValidationError extends Error {}

// 비즈니스 로직 에러
export class BusinessError extends Error {}
```

### `src/lib/error-handlers/`

```javascript
// API 에러 핸들러
export function handleApiError(error, req, res)

// 예외 타입별 응답
export function formatErrorResponse(error)
```

---

## Rate Limiter

### `src/lib/validators/rate-limiter.js`

```javascript
// Rate Limit 체크
export async function checkRateLimit(identifier, limit, window)

// 반환: { allowed: boolean, remaining: number, resetAt: Date }
```

---

## 미들웨어

### `src/lib/middleware/`

```javascript
// 인증 미들웨어
export function withAuth(handler)

// 관리자 미들웨어
export function withAdmin(handler)

// Rate Limit 미들웨어
export function withRateLimit(handler, options)

// 로깅 미들웨어
export function withLogging(handler)
```

---

## 로깅

### `src/lib/loggers/`

```javascript
// 정보 로그
export function logInfo(message, metadata)

// 경고 로그
export function logWarn(message, metadata)

// 에러 로그
export function logError(error, metadata)

// 요청 로그
export function logRequest(req, res, duration)
```

---

## API 클라이언트

### `src/lib/api.js`

```javascript
// API 클라이언트 클래스
class ApiClient {
  async get(endpoint, params)
  async post(endpoint, body, options)
  async put(endpoint, body)
  async patch(endpoint, body)
  async delete(endpoint)
}

export default new ApiClient()
```

**사용법:**
```javascript
import api from '@/lib/api'

// GET 요청
const users = await api.get('/api/users', { page: 1 })

// POST 요청
await api.post('/api/studies', { name: '스터디' })

// PATCH 요청
await api.patch('/api/studies/1', { name: '새 이름' })

// DELETE 요청
await api.delete('/api/studies/1')
```

