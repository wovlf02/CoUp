# API 도메인 (API)

## 개요

CoUp 프로젝트의 API 도메인은 Next.js App Router 기반의 RESTful API를 제공합니다.
인증, 스터디, 사용자, 알림, 할일, 관리자 기능 등 다양한 엔드포인트를 포함합니다.

### 주요 특징

- **Next.js API Routes**: App Router 기반 서버리스 API
- **Prisma ORM**: 타입 안전한 데이터베이스 쿼리
- **NextAuth.js**: 인증/인가 통합
- **Zod 검증**: 런타임 데이터 검증
- **예외 처리**: 구조화된 에러 응답

---

## API 구조

```
src/app/api/
├── auth/                      # 인증 API
│   ├── [...nextauth]/         # NextAuth 핸들러
│   ├── me/                    # 현재 사용자 정보
│   ├── signup/                # 회원가입
│   ├── verify/                # 토큰 검증
│   └── validate-session/      # 세션 검증
│
├── admin/                     # 관리자 API
│   ├── analytics/             # 통계 분석
│   ├── audit-logs/            # 감사 로그
│   ├── reports/               # 신고 관리
│   │   └── [reportId]/
│   ├── settings/              # 시스템 설정
│   ├── stats/                 # 대시보드 통계
│   ├── studies/               # 스터디 관리
│   │   └── [studyId]/
│   └── users/                 # 사용자 관리
│       └── [id]/
│
├── studies/                   # 스터디 API
│   ├── route.js               # 목록/생성
│   └── [id]/                  # 스터디 상세
│       ├── route.js           # 조회/수정/삭제
│       ├── calendar/          # 캘린더 일정
│       ├── chat/              # 채팅
│       ├── check-member/      # 멤버 확인
│       ├── files/             # 파일 관리
│       ├── invite/            # 초대 코드
│       ├── join/              # 가입 신청
│       ├── join-requests/     # 가입 요청 목록
│       ├── leave/             # 탈퇴
│       ├── members/           # 멤버 관리
│       ├── notices/           # 공지사항
│       ├── tasks/             # 스터디 할일
│       └── transfer-ownership/ # 소유권 이전
│
├── notifications/             # 알림 API
│   ├── route.js               # 목록/생성
│   ├── [id]/                  # 알림 상세
│   ├── bulk/                  # 대량 처리
│   ├── count/                 # 개수 조회
│   └── mark-all-read/         # 전체 읽음
│
├── tasks/                     # 할일 API
│   └── route.js               # 개인 할일
│
├── user/                      # 사용자 프로필
│   └── route.js
│
├── users/                     # 사용자 목록
│   └── route.js
│
├── groups/                    # 그룹 API
│   └── route.js
│
├── dashboard/                 # 대시보드 API
│   └── route.js
│
├── attendance/                # 출석 API
│   └── route.js
│
├── my-studies/                # 내 스터디 API
│   └── route.js
│
└── upload/                    # 파일 업로드
    └── route.js
```

---

## 인증 API

### NextAuth 핸들러

**경로:** `/api/auth/[...nextauth]`

NextAuth.js 인증 핸들러입니다. OAuth 및 Credentials 인증을 지원합니다.

**지원 Provider:**

| Provider | 설명 |
|----------|------|
| Credentials | 이메일/비밀번호 인증 |
| Google | Google OAuth (계획) |
| GitHub | GitHub OAuth (계획) |

### 회원가입

**경로:** `POST /api/auth/signup`

**요청:**

```javascript
{
  email: string;       // 이메일 (필수)
  password: string;    // 비밀번호 (필수, 8자 이상)
  name: string;        // 이름 (필수)
}
```

**응답:**

```javascript
// 성공 (201)
{
  success: true,
  user: {
    id: string,
    email: string,
    name: string
  }
}

// 실패 (400/409)
{
  error: string,
  code: string
}
```

### 현재 사용자 정보

**경로:** `GET /api/auth/me`

**응답:**

```javascript
{
  success: true,
  user: {
    id: string,
    email: string,
    name: string,
    avatar: string | null,
    bio: string | null,
    role: 'USER' | 'ADMIN',
    status: 'ACTIVE' | 'SUSPENDED' | 'DELETED',
    provider: 'CREDENTIALS' | 'GOOGLE' | 'GITHUB',
    createdAt: string,
    lastLoginAt: string | null
  }
}
```

### 토큰 검증

**경로:** `POST /api/auth/verify`

시그널링 서버에서 사용자 인증을 검증할 때 사용합니다.

**요청:**

```javascript
{
  userId: string
}
```

**응답:**

```javascript
{
  success: true,
  user: {
    id: string,
    name: string,
    email: string,
    avatar: string | null,
    status: 'ACTIVE' | 'SUSPENDED'
  }
}
```

---

## 스터디 API

### 스터디 목록

**경로:** `GET /api/studies`

**쿼리 파라미터:**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 10 | 페이지당 항목 수 |
| `category` | string | - | 카테고리 필터 |
| `search` | string | - | 검색어 (이름, 설명, 태그) |
| `recruiting` | string | - | 모집 상태 (all, recruiting, closed) |

**응답:**

```javascript
{
  success: true,
  data: [{
    id: string,
    name: string,
    emoji: string,
    description: string,
    category: string,
    maxMembers: number,
    currentMembers: number,
    isPublic: boolean,
    isRecruiting: boolean,
    tags: string[],
    owner: {
      id: string,
      name: string,
      avatar: string | null
    },
    createdAt: string
  }],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### 스터디 생성

**경로:** `POST /api/studies`

**인증:** 필수

**요청:**

```javascript
{
  name: string;           // 스터디 이름 (2~50자)
  description: string;    // 설명
  category: string;       // 카테고리
  emoji: string;          // 이모지
  capacity?: number;      // 최대 인원 (기본: 10)
  tags?: string[];        // 태그
}
```

**응답:**

```javascript
{
  success: true,
  data: {
    id: string,
    name: string,
    // ... 스터디 정보
  }
}
```

### 스터디 상세

**경로:** `GET /api/studies/[id]`

**응답:**

```javascript
{
  success: true,
  data: {
    id: string,
    name: string,
    emoji: string,
    description: string,
    category: string,
    subCategory: string | null,
    maxMembers: number,
    isPublic: boolean,
    autoApprove: boolean,
    isRecruiting: boolean,
    rating: number,
    reviewCount: number,
    tags: string[],
    inviteCode: string,
    owner: {
      id: string,
      name: string,
      avatar: string | null
    },
    members: [{
      id: string,
      role: 'OWNER' | 'ADMIN' | 'MEMBER',
      status: 'ACTIVE' | 'PENDING',
      user: {
        id: string,
        name: string,
        avatar: string | null
      },
      joinedAt: string
    }],
    _count: {
      members: number,
      notices: number,
      files: number,
      events: number
    },
    createdAt: string,
    updatedAt: string
  }
}
```

### 스터디 가입 신청

**경로:** `POST /api/studies/[id]/join`

**인증:** 필수

**요청:**

```javascript
{
  introduction?: string;  // 자기소개
  motivation?: string;    // 가입 동기
  level?: string;         // 실력 수준
}
```

**응답:**

```javascript
// 자동 승인 (200)
{
  success: true,
  message: "가입이 완료되었습니다",
  status: "ACTIVE"
}

// 승인 대기 (200)
{
  success: true,
  message: "가입 신청이 완료되었습니다",
  status: "PENDING"
}
```

### 스터디 멤버 관리

**경로:** `GET /api/studies/[id]/members`

**쿼리 파라미터:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | string | ACTIVE, PENDING, KICKED, LEFT |
| `role` | string | OWNER, ADMIN, MEMBER |

**경로:** `PUT /api/studies/[id]/members/[userId]`

**권한:** OWNER, ADMIN

**요청:**

```javascript
{
  role?: 'ADMIN' | 'MEMBER';  // 역할 변경
  status?: 'KICKED';          // 강퇴
}
```

---

## 알림 API

### 알림 목록

**경로:** `GET /api/notifications`

**인증:** 필수

**쿼리 파라미터:**

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 (최대 100) |
| `isRead` | boolean | - | 읽음 여부 필터 |
| `type` | string | - | 알림 타입 필터 |

**응답:**

```javascript
{
  success: true,
  data: [{
    id: string,
    type: NotificationType,
    message: string,
    isRead: boolean,
    studyId: string | null,
    studyName: string | null,
    studyEmoji: string | null,
    data: object | null,
    createdAt: string
  }],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### 알림 생성

**경로:** `POST /api/notifications`

**인증:** 필수 (시스템 내부용)

**요청:**

```javascript
{
  userId: string;              // 수신자 ID
  type: NotificationType;      // 알림 타입
  message: string;             // 메시지
  studyId?: string;            // 관련 스터디 ID
  studyName?: string;          // 스터디 이름
  studyEmoji?: string;         // 스터디 이모지
  data?: object;               // 추가 데이터
}
```

### 알림 읽음 처리

**경로:** `POST /api/notifications/[id]/read`

**인증:** 필수

### 전체 읽음 처리

**경로:** `POST /api/notifications/mark-all-read`

**인증:** 필수

### 읽지 않은 알림 수

**경로:** `GET /api/notifications/count`

**인증:** 필수

**응답:**

```javascript
{
  success: true,
  count: number
}
```

### 알림 대량 삭제

**경로:** `DELETE /api/notifications/bulk`

**인증:** 필수

**요청:**

```javascript
{
  filter: 'read' | 'all';  // 읽은 알림만 또는 전체
}
```

---

## 할일 API

### 개인 할일 목록

**경로:** `GET /api/tasks`

**인증:** 필수

**쿼리 파라미터:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | string | TODO, IN_PROGRESS, REVIEW, DONE |
| `priority` | string | LOW, MEDIUM, HIGH, URGENT |
| `studyId` | string | 스터디 ID |
| `completed` | boolean | 완료 여부 |
| `dueDate` | string | 마감일 필터 |

**응답:**

```javascript
{
  success: true,
  data: [{
    id: string,
    title: string,
    description: string | null,
    status: TaskStatus,
    priority: Priority,
    dueDate: string | null,
    completed: boolean,
    completedAt: string | null,
    studyId: string | null,
    study: {
      id: string,
      name: string,
      emoji: string
    } | null,
    createdAt: string
  }]
}
```

### 할일 생성

**경로:** `POST /api/tasks`

**인증:** 필수

**요청:**

```javascript
{
  title: string;            // 제목
  description?: string;     // 설명
  status?: TaskStatus;      // 상태 (기본: TODO)
  priority?: Priority;      // 우선순위 (기본: MEDIUM)
  dueDate?: string;         // 마감일
  studyId?: string;         // 관련 스터디
}
```

### 할일 수정

**경로:** `PUT /api/tasks/[id]`

**인증:** 필수

**요청:**

```javascript
{
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  completed?: boolean;
}
```

### 할일 삭제

**경로:** `DELETE /api/tasks/[id]`

**인증:** 필수

---

## 관리자 API

### 통계 조회

**경로:** `GET /api/admin/stats`

**권한:** ANALYTICS_VIEW

**응답:**

```javascript
{
  success: true,
  data: {
    summary: {
      users: {
        total: number,
        active: number,
        suspended: number,
        newToday: number,
        newThisWeek: number
      },
      studies: {
        total: number,
        active: number,
        newToday: number,
        newThisWeek: number
      },
      reports: {
        total: number,
        pending: number,
        urgent: number,
        newToday: number
      },
      warnings: {
        total: number,
        today: number
      },
      sanctions: {
        active: number
      }
    },
    recentActivity: {
      users: Array,
      reports: Array,
      warnings: Array
    },
    charts: {
      userGrowth: Array,
      reportStats: Array
    }
  }
}
```

### 사용자 관리

**경로:** `GET /api/admin/users`

**권한:** USER_VIEW

**쿼리 파라미터:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `page` | number | 페이지 |
| `limit` | number | 항목 수 |
| `search` | string | 검색어 |
| `status` | string | 상태 필터 |
| `provider` | string | 가입 방식 |
| `hasWarnings` | boolean | 경고 유무 |
| `sortBy` | string | 정렬 필드 |
| `sortOrder` | string | 정렬 방향 |

**응답:**

```javascript
{
  success: true,
  data: [{
    id: string,
    email: string,
    name: string,
    avatar: string | null,
    status: UserStatus,
    provider: Provider,
    createdAt: string,
    lastLoginAt: string | null,
    stats: {
      studiesOwned: number,
      studiesJoined: number,
      messagesCount: number,
      warningsCount: number,
      activeSanctions: number
    },
    lastWarning: Warning | null,
    activeSanction: Sanction | null
  }],
  pagination: { ... }
}
```

### 사용자 정지

**경로:** `POST /api/admin/users/[id]/suspend`

**권한:** USER_SUSPEND

**요청:**

```javascript
{
  reason: string;           // 정지 사유
  duration?: string;        // "1d", "7d", "30d", "permanent"
}
```

### 신고 관리

**경로:** `GET /api/admin/reports`

**권한:** REPORT_VIEW

**쿼리 파라미터:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | string | PENDING, IN_PROGRESS, RESOLVED, REJECTED |
| `type` | string | 신고 유형 |
| `priority` | string | 우선순위 |
| `targetType` | string | USER, STUDY, MESSAGE |
| `assignedTo` | string | 담당자 (me, unassigned, userId) |

### 신고 처리

**경로:** `POST /api/admin/reports/[reportId]/resolve`

**권한:** REPORT_RESOLVE

**요청:**

```javascript
{
  resolution: string;              // 처리 결과
  sanction?: {                     // 제재 조치 (선택)
    userId: string;
    type: SanctionType;
    reason: string;
    duration?: string;
  }
}
```

---

## 파일 업로드 API

### 파일 업로드

**경로:** `POST /api/upload`

**인증:** 필수

**요청:** `multipart/form-data`

| 필드 | 타입 | 설명 |
|------|------|------|
| `file` | File | 업로드 파일 |
| `studyId` | string | 스터디 ID |
| `folderId` | string | 폴더 ID (선택) |

**응답:**

```javascript
{
  success: true,
  file: {
    id: string,
    name: string,
    size: number,
    type: string,
    url: string
  }
}
```

**제한사항:**

- 최대 파일 크기: 10MB
- 허용 타입: 이미지, 문서, 압축 파일

---

## 에러 응답

### 표준 에러 형식

```javascript
{
  success: false,
  error: string,          // 에러 메시지
  code?: string,          // 에러 코드
  details?: object        // 추가 정보
}
```

### HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복) |
| 422 | 유효성 검사 실패 |
| 429 | 요청 한도 초과 |
| 500 | 서버 오류 |

### 에러 코드 목록

| 코드 | 설명 |
|------|------|
| `AUTH_REQUIRED` | 인증 필요 |
| `INVALID_CREDENTIALS` | 잘못된 인증 정보 |
| `ACCOUNT_SUSPENDED` | 계정 정지됨 |
| `PERMISSION_DENIED` | 권한 없음 |
| `RESOURCE_NOT_FOUND` | 리소스 없음 |
| `VALIDATION_ERROR` | 유효성 검사 실패 |
| `DUPLICATE_ENTRY` | 중복 항목 |
| `RATE_LIMIT_EXCEEDED` | 요청 한도 초과 |

---

## 검증 (Validation)

### Zod 스키마

```javascript
import { z } from 'zod';

// 회원가입 스키마
const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다')
});

// 스터디 생성 스키마
const createStudySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(10),
  category: z.string(),
  emoji: z.string(),
  capacity: z.number().min(2).max(100).optional(),
  tags: z.array(z.string()).optional()
});
```

### 검증 헬퍼

```javascript
function validateBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message);
    throw new ValidationError(errors.join(', '));
  }
  return result.data;
}
```

---

## 인증 미들웨어

### 세션 확인

```javascript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function requireAuth(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }
  
  return session;
}
```

### 계정 상태 확인

```javascript
async function checkAccountStatus(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (user.status === 'SUSPENDED') {
    throw new Error('계정이 정지되었습니다');
  }

  if (user.status === 'DELETED') {
    throw new Error('삭제된 계정입니다');
  }

  return user;
}
```

---

## 페이지네이션

### 표준 형식

```javascript
{
  data: [...],
  pagination: {
    page: 1,           // 현재 페이지
    limit: 20,         // 페이지당 항목 수
    total: 100,        // 전체 항목 수
    totalPages: 5      // 전체 페이지 수
  }
}
```

### 구현 헬퍼

```javascript
function getPagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function createPaginatedResponse(data, total, page, limit) {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

---

## CORS 설정

### Next.js API 라우트

```javascript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ]
      }
    ];
  }
};
```

---

## Rate Limiting

### 구현 (계획)

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15분
  max: 100,                   // 최대 100 요청
  message: {
    error: '요청 한도를 초과했습니다',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
```

### 엔드포인트별 제한

| 엔드포인트 | 제한 | 윈도우 |
|------------|------|--------|
| `/api/auth/signup` | 5회 | 1시간 |
| `/api/auth/signin` | 10회 | 15분 |
| `/api/studies` (POST) | 10회 | 1시간 |
| `/api/upload` | 20회 | 1시간 |
| 기타 | 100회 | 15분 |

---

## 로깅

### Winston 로거

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### API 로깅

```javascript
async function logApiRequest(request, response, duration) {
  logger.info({
    method: request.method,
    path: request.url,
    status: response.status,
    duration: `${duration}ms`,
    userAgent: request.headers.get('user-agent')
  });
}
```

---

## 테스트

### API 테스트 예시

```javascript
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/studies/route';

describe('Studies API', () => {
  it('스터디 목록을 반환한다', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { page: '1', limit: '10' }
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toHaveProperty('data');
    expect(res._getJSONData()).toHaveProperty('pagination');
  });
});
```

---

## API 클라이언트

### 프론트엔드 API 클라이언트

**파일 위치:** `src/lib/api.js`

```javascript
const api = {
  async get(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return handleResponse(response);
  },

  async post(url, data, options = {}) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return handleResponse(response);
  },

  async put(url, data, options = {}) { ... },
  async delete(url, options = {}) { ... }
};

async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(data.error, data.code, response.status);
  }
  
  return data;
}

export default api;
```

### 사용 예시

```javascript
// 스터디 목록 조회
const studies = await api.get('/api/studies?page=1&limit=10');

// 스터디 생성
const newStudy = await api.post('/api/studies', {
  name: '알고리즘 스터디',
  category: '프로그래밍',
  emoji: '💻'
});

// 알림 읽음 처리
await api.post(`/api/notifications/${id}/read`);
```

---

## 보안 고려사항

### 입력 검증

- 모든 입력에 Zod 스키마 검증 적용
- SQL 인젝션 방지 (Prisma ORM)
- XSS 방지 (입력 이스케이프)

### 인증/인가

- NextAuth.js 세션 기반 인증
- 민감한 엔드포인트 권한 검증
- 계정 상태 확인 (정지/삭제)

### 데이터 보호

- 비밀번호 bcrypt 해싱
- 민감 정보 응답에서 제외
- HTTPS 강제 (프로덕션)

### 로깅

- 모든 API 요청 로깅
- 에러 상세 정보 기록
- 관리자 활동 감사 로그

