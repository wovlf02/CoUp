# 관리자 기능 모범 사례 및 체크리스트

**작성일**: 2025-11-29  
**카테고리**: 관리자 > 모범 사례  
**우선순위**: 🔴 최고

---

## 목차

1. [보안 체크리스트](#보안-체크리스트)
2. [코드 리뷰 가이드](#코드-리뷰-가이드)
3. [테스트 전략](#테스트-전략)
4. [모니터링 및 알림](#모니터링-및-알림)
5. [운영 가이드](#운영-가이드)
6. [장애 대응](#장애-대응)

---

## 보안 체크리스트

### API 보안

```javascript
// ✅ 모든 관리자 API는 반드시 권한 검증
export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) return auth // 권한 없으면 즉시 반환
  
  // 비즈니스 로직
}

// ❌ 권한 검증 없이 바로 처리 (절대 금지!)
export async function GET(request) {
  const users = await prisma.user.findMany()
  return NextResponse.json({ users })
}
```

### 자가 수정 방지

```javascript
// ✅ 자기 자신 체크
if (targetUserId === auth.adminRole.userId) {
  return NextResponse.json(
    { error: '자기 자신을 수정할 수 없습니다' },
    { status: 400 }
  )
}

// ✅ UI에서도 비활성화
<button disabled={user.id === currentAdminId}>정지</button>
```

### 민감 정보 보호

```javascript
// ✅ 비밀번호 제외
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    // password: false (절대 포함 안 함)
  }
})

// ✅ 로그에서 민감 정보 마스킹
await logAdminAction({
  details: {
    email: maskEmail(user.email), // u***@example.com
    phone: maskPhone(user.phone)  // 010-****-5678
  }
})

function maskEmail(email) {
  const [local, domain] = email.split('@')
  return `${local[0]}***@${domain}`
}
```

### IP 제한 (선택)

```javascript
// lib/admin/auth.js
const ALLOWED_ADMIN_IPS = process.env.ADMIN_ALLOWED_IPS?.split(',') || []

export async function requireAdmin(request, permission) {
  // IP 제한 활성화 시
  if (ALLOWED_ADMIN_IPS.length > 0) {
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip')
    
    if (!ALLOWED_ADMIN_IPS.includes(ip)) {
      return NextResponse.json(
        { error: 'IP 주소가 허용되지 않았습니다' },
        { status: 403 }
      )
    }
  }
  
  // 나머지 권한 검증...
}
```

---

## 코드 리뷰 가이드

### 체크리스트

#### 필수 항목 (Must Have)

- [ ] `requireAdmin()` 호출 확인
- [ ] 적절한 `PERMISSIONS` 사용
- [ ] 자가 수정 방지 로직
- [ ] 에러 핸들링 (`try-catch`)
- [ ] `logAdminAction()` 호출
- [ ] Prisma `$disconnect()` (finally 블록)
- [ ] 입력 검증 (타입, 범위, 포맷)
- [ ] SQL 인젝션 방지 (Prisma 사용)

#### 권장 항목 (Should Have)

- [ ] 트랜잭션 사용 (여러 작업 시)
- [ ] 에러 코드 명시 (`code: 'ADM-XXX-000'`)
- [ ] 페이지네이션 (목록 조회)
- [ ] 인덱스 최적화 (느린 쿼리)
- [ ] 캐시 사용 (자주 조회되는 데이터)
- [ ] 낙관적 락 (동시성 문제)

#### 보안 체크

- [ ] 권한 계층 확인 (관리자 간)
- [ ] 민감 정보 마스킹
- [ ] Rate limiting (DoS 방지)
- [ ] CSRF 토큰 (POST/PUT/DELETE)
- [ ] XSS 방지 (입력 sanitize)

### 코드 리뷰 예시

```javascript
// ❌ 나쁜 예
export async function DELETE(request, { params }) {
  const { id } = params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

// ✅ 좋은 예
export async function DELETE(request, { params }) {
  // 1. 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_DELETE)
  if (auth instanceof NextResponse) return auth
  
  try {
    const { id: userId } = await params
    
    // 2. 자가 수정 방지
    if (userId === auth.adminRole.userId) {
      return NextResponse.json(
        { success: false, error: '자기 자신을 삭제할 수 없습니다' },
        { status: 400 }
      )
    }
    
    // 3. 대상 확인
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    // 4. 마지막 관리자 체크
    if (user.adminRole?.role === 'SUPER_ADMIN') {
      const count = await prisma.adminRole.count({ 
        where: { role: 'SUPER_ADMIN' } 
      })
      if (count <= 1) {
        return NextResponse.json(
          { success: false, error: '마지막 최고 관리자는 삭제할 수 없습니다' },
          { status: 400 }
        )
      }
    }
    
    // 5. Soft delete (트랜잭션)
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status: 'DELETED', deletedAt: new Date() }
      })
      
      // 6. 로그 기록
      await logAdminAction({
        adminId: auth.adminRole.userId,
        action: 'USER_DELETE',
        targetType: 'USER',
        targetId: userId,
        details: { email: user.email }
      })
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('[ADM-USR-025] 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: '삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

---

## 테스트 전략

### 단위 테스트

```javascript
// __tests__/admin/user-management.test.js
describe('Admin User Management', () => {
  describe('권한 검증', () => {
    it('관리자 권한 없으면 403', async () => {
      const res = await fetch('/api/admin/users', {
        headers: { cookie: normalUserSession }
      })
      expect(res.status).toBe(403)
    })
    
    it('세션 없으면 401', async () => {
      const res = await fetch('/api/admin/users')
      expect(res.status).toBe(401)
    })
  })
  
  describe('자가 수정 방지', () => {
    it('자기 자신 정지 시도 시 400', async () => {
      const res = await fetch('/api/admin/users/${adminId}/suspend', {
        method: 'POST',
        headers: { cookie: adminSession },
        body: JSON.stringify({ reason: 'test' })
      })
      expect(res.status).toBe(400)
    })
  })
  
  describe('마지막 관리자 보호', () => {
    it('유일한 SUPER_ADMIN 삭제 시도 시 400', async () => {
      const res = await fetch('/api/admin/users/${lastAdminId}', {
        method: 'DELETE',
        headers: { cookie: superAdminSession }
      })
      expect(res.status).toBe(400)
      expect(res.json()).toMatchObject({
        error: expect.stringContaining('마지막')
      })
    })
  })
})
```

### 통합 테스트

```bash
# E2E 테스트 (Playwright)
npm run test:e2e
```

```javascript
// e2e/admin.spec.js
test('관리자 사용자 정지 플로우', async ({ page }) => {
  // 1. 로그인
  await page.goto('/login')
  await page.fill('[name="email"]', 'admin@coup.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  // 2. 관리자 페이지 접근
  await page.goto('/admin/users')
  await expect(page).toHaveURL(/\/admin\/users/)
  
  // 3. 사용자 검색
  await page.fill('[name="search"]', 'test@example.com')
  await page.waitForSelector('.user-row')
  
  // 4. 사용자 정지
  await page.click('[data-testid="suspend-button"]')
  await page.fill('[name="reason"]', '테스트 계정 정지')
  await page.click('[data-testid="confirm-suspend"]')
  
  // 5. 확인
  await expect(page.locator('.toast')).toHaveText(/정지되었습니다/)
  await expect(page.locator('.user-status')).toHaveText(/SUSPENDED/)
})
```

### 부하 테스트

```bash
# k6로 부하 테스트
k6 run load-test.js
```

```javascript
// load-test.js
import http from 'k6/http'
import { check } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // 10명 동시 접속
    { duration: '3m', target: 50 },  // 50명으로 증가
    { duration: '1m', target: 0 },   // 종료
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95%가 2초 이내
  },
}

export default function () {
  const res = http.get('https://coup.com/api/admin/users', {
    headers: { Cookie: `${__ENV.ADMIN_SESSION}` }
  })
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  })
}
```

---

## 모니터링 및 알림

### 로그 수집

```javascript
// lib/logger.js
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

// 관리자 액션 전용 로거
export function logAdminAction(action) {
  logger.info('ADMIN_ACTION', {
    ...action,
    timestamp: new Date().toISOString(),
  })
}
```

### 메트릭 수집

```javascript
// lib/metrics.js
import { Counter, Histogram } from 'prom-client'

// 관리자 API 호출 수
export const adminApiCalls = new Counter({
  name: 'admin_api_calls_total',
  help: 'Total admin API calls',
  labelNames: ['method', 'endpoint', 'status'],
})

// 관리자 API 응답 시간
export const adminApiDuration = new Histogram({
  name: 'admin_api_duration_seconds',
  help: 'Admin API response time',
  labelNames: ['method', 'endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5],
})

// 사용
adminApiCalls.inc({ method: 'GET', endpoint: '/api/admin/users', status: 200 })
adminApiDuration.observe({ method: 'GET', endpoint: '/api/admin/users' }, duration)
```

### 알림 설정

```javascript
// lib/alerts.js
import { sendSlackAlert, sendEmailAlert } from './notifications'

// 중요 이벤트 알림
export async function alertCriticalEvent(event) {
  const message = `
🚨 중요 관리자 액션 발생
- 액션: ${event.action}
- 관리자: ${event.adminEmail}
- 대상: ${event.targetType} (${event.targetId})
- 시간: ${new Date().toLocaleString()}
  `
  
  await Promise.all([
    sendSlackAlert('#admin-alerts', message),
    sendEmailAlert(process.env.ADMIN_ALERT_EMAIL, message)
  ])
}

// 사용
if (action === 'USER_DELETE' && targetUser.adminRole) {
  await alertCriticalEvent({ action, adminEmail, targetType, targetId })
}
```

---

## 운영 가이드

### 일일 체크리스트

- [ ] 신고 목록 확인 (우선순위 높음)
- [ ] 관리자 로그 확인 (이상 패턴)
- [ ] 시스템 성능 확인 (느린 쿼리)
- [ ] 에러 로그 확인
- [ ] 백업 상태 확인

### 주간 체크리스트

- [ ] 정지된 사용자 검토
- [ ] 신고 처리 통계 분석
- [ ] 로그 보관 정책 실행
- [ ] 관리자 권한 검토
- [ ] 보안 패치 적용

### 월간 체크리스트

- [ ] 관리자 계정 감사
- [ ] 접근 로그 분석
- [ ] 성능 최적화 검토
- [ ] 문서 업데이트
- [ ] 재해 복구 훈련

---

## 장애 대응

### 관리자 계정 잠김

```bash
# 1. 직접 DB 접근
psql -U postgres -d coup

# 2. 상태 확인
SELECT id, email, status FROM "User" WHERE email = 'admin@coup.com';

# 3. 활성화
UPDATE "User" SET status = 'ACTIVE' WHERE email = 'admin@coup.com';

# 또는 스크립트 사용
node scripts/activate-users.js --email admin@coup.com
```

### 모든 관리자 삭제됨

```bash
# 긴급 SUPER_ADMIN 생성
node scripts/create-test-admin.js \
  --email emergency@coup.com \
  --password "$(openssl rand -base64 32)" \
  --role SUPER_ADMIN
```

### 설정 오류로 시스템 다운

```bash
# 1. 설정 백업 확인
SELECT * FROM "SystemSetting" ORDER BY "updatedAt" DESC LIMIT 10;

# 2. 롤백
node scripts/rollback-settings.js --to-timestamp "2025-11-29 10:00:00"

# 3. 기본값으로 리셋
node scripts/reset-settings.js --confirm
```

### 대량 스팸 신고

```bash
# 일괄 거절
node scripts/bulk-reject-reports.js \
  --from "2025-11-29 00:00" \
  --to "2025-11-29 23:59" \
  --reason "spam" \
  --admin-id "admin-id"
```

### 성능 저하

```bash
# 1. 느린 쿼리 확인
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

# 2. 캐시 초기화
curl -X POST https://coup.com/api/admin/settings/cache/clear \
  -H "Cookie: session=..."

# 3. DB 연결 확인
SELECT count(*) FROM pg_stat_activity;
```

---

## 체크리스트 요약

### 배포 전 (Pre-deployment)

- [ ] 모든 API에 `requireAdmin()` 추가
- [ ] 민감 정보 마스킹 확인
- [ ] 에러 핸들링 추가
- [ ] 로그 기록 확인
- [ ] 테스트 통과 (단위 + 통합)
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트
- [ ] 롤백 계획 수립

### 배포 후 (Post-deployment)

- [ ] 헬스 체크
- [ ] 로그 모니터링 (10분)
- [ ] 성능 메트릭 확인
- [ ] 알림 시스템 동작 확인
- [ ] 관리자 기능 smoke 테스트
- [ ] 문서 공유

### 사고 대응 (Incident Response)

1. **감지**: 모니터링 알림
2. **평가**: 영향 범위 파악
3. **완화**: 즉시 조치 (롤백, 긴급 패치)
4. **복구**: 정상 상태 확인
5. **사후 분석**: 근본 원인 및 재발 방지

---

**참고 문서**:
- [관리자 운영 매뉴얼](../../../admin/OPERATIONS-MANUAL.md)
- [API 엔드포인트](../../../admin/API-ENDPOINTS.md)
- [장애 대응 플레이북](../../../admin/INCIDENT-PLAYBOOK.md)
