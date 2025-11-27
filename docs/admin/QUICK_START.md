# 관리자 시스템 빠른 시작 가이드

## 🚀 관리자 계정 생성

### 방법 1: 스크립트 사용 (권장)

```bash
cd coup
node scripts/create-admin.js <이메일> [ADMIN|SYSTEM_ADMIN]
```

**예시**:
```bash
# ADMIN 계정 생성
node scripts/create-admin.js admin@coup.com ADMIN

# SYSTEM_ADMIN 계정 생성
node scripts/create-admin.js superadmin@coup.com SYSTEM_ADMIN
```

### 방법 2: 데이터베이스 직접 수정

기존 사용자를 관리자로 승격:
```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';
```

---

## 🔑 접속 방법

1. **로그인**
   - 주소: `http://localhost:3000/sign-in`
   - 관리자 이메일과 비밀번호로 로그인

2. **관리자 대시보드 접속**
   - 주소: `http://localhost:3000/admin/dashboard`
   - 또는 일반 대시보드에서 "관리자 모드" 링크 클릭 (권한 있는 경우)

---

## 📱 관리자 페이지 목록

| 경로 | 설명 | 권한 |
|------|------|------|
| `/admin/dashboard` | 대시보드 (통계, 최근 활동) | ADMIN, SYSTEM_ADMIN |
| `/admin/users` | 사용자 목록 | ADMIN, SYSTEM_ADMIN |
| `/admin/users/:userId` | 사용자 상세 & 제재 | ADMIN, SYSTEM_ADMIN |
| `/admin/studies` | 스터디 관리 | ADMIN, SYSTEM_ADMIN |
| `/admin/reports` | 신고 관리 | ADMIN, SYSTEM_ADMIN |
| `/admin/settings` | 시스템 설정 | SYSTEM_ADMIN 전용 |

---

## 🛠 주요 기능

### 1. 대시보드
- ✅ 핵심 지표 (사용자, 스터디, 신고)
- ✅ 미처리 신고 목록
- ✅ 최근 제재 내역
- ✅ 주간 추이 그래프

### 2. 사용자 관리
- ✅ 검색 & 필터 (상태, 역할, 가입 경로)
- ✅ 사용자 상세 정보
- ✅ 활동 통계
- ✅ 제재 기능:
  - ⚠️ 경고 발송
  - ⛔ 사용자 정지 (1일/3일/7일/30일/영구)
  - ✅ 정지 해제
- ✅ 제재 이력 조회
- ✅ 신고 이력 (신고당함/신고함)

### 3. 스터디 관리 (구현 예정)
- ⏳ 스터디 목록/상세
- ⏳ 스터디 숨김/종료
- ⏳ 추천 스터디 관리

### 4. 신고 관리 (구현 예정)
- ⏳ 신고 목록/상세
- ⏳ 우선순위 배정
- ⏳ 담당자 배정
- ⏳ 신고 처리

---

## 🔒 권한 체계

### ADMIN
- ✅ 사용자 조회
- ✅ 경고 발송
- ✅ 사용자 정지/해제
- ✅ 스터디 관리
- ✅ 신고 처리
- ❌ 시스템 설정 (불가)
- ❌ 사용자 완전 삭제 (불가)

### SYSTEM_ADMIN
- ✅ ADMIN 권한 전체
- ✅ 시스템 설정
- ✅ 사용자 완전 삭제
- ✅ 관리자 임명/해임
- ✅ 플랫폼 설정 변경

---

## 📊 API 엔드포인트

### 대시보드
```
GET /api/admin/dashboard
```

### 사용자 관리
```
GET    /api/admin/users                    # 목록
GET    /api/admin/users/:userId             # 상세
POST   /api/admin/users/:userId/warn        # 경고
POST   /api/admin/users/:userId/suspend     # 정지
POST   /api/admin/users/:userId/unsuspend   # 정지 해제
GET    /api/admin/users/:userId/sanctions   # 제재 이력
DELETE /api/admin/users/:userId             # 완전 삭제 (SYSTEM_ADMIN)
POST   /api/admin/users/export              # 데이터 익스포트
```

---

## 🧪 테스트 시나리오

### 1. 기본 접속 테스트
```
1. 관리자 계정으로 로그인
2. /admin/dashboard 접속
3. 대시보드 데이터 확인
```

### 2. 사용자 관리 테스트
```
1. /admin/users 접속
2. 검색: 사용자 이름 입력
3. 필터: 상태=ACTIVE 선택
4. 사용자 클릭 → 상세 페이지
5. [경고] 버튼 클릭 → 사유 입력 → 확인
6. [정지] 버튼 클릭 → 기간 선택 → 사유 입력 → 확인
7. 제재 이력 확인
```

### 3. 제재 플로우 테스트
```
1. 테스트 사용자 생성
2. 경고 발송 (3회)
3. 사용자 정지 (3일)
4. 해당 사용자로 로그인 시도 → 차단 확인
5. 관리자로 정지 해제
6. 다시 로그인 가능 확인
```

---

## 📝 개발 가이드

### 새 관리자 페이지 추가

1. **레이아웃 수정** (`src/app/admin/layout.js`)
   ```jsx
   <Link href="/admin/new-page">새 메뉴</Link>
   ```

2. **페이지 생성** (`src/app/admin/new-page/page.js`)
   ```jsx
   'use client'
   export default function NewPage() {
     return <div>새 페이지</div>
   }
   ```

3. **API 라우트 생성** (`src/app/api/admin/new-route/route.js`)
   ```js
   import { requireAdmin } from "@/lib/admin-helpers"
   export async function GET() {
     const auth = await requireAdmin()
     // ...
   }
   ```

### 관리자 미들웨어 사용

```js
import { requireAdmin, requireSystemAdmin, logAdminAction } from "@/lib/admin-helpers"

// ADMIN 또는 SYSTEM_ADMIN 권한 필요
const auth = await requireAdmin()

// SYSTEM_ADMIN 권한만 필요
const auth = await requireSystemAdmin()

// 관리자 로그 기록
await logAdminAction({
  adminId: auth.user.id,
  action: 'USER_WARN',
  targetType: 'User',
  targetId: userId,
  details: { reason },
  request
})
```

---

## 🐛 트러블슈팅

### 권한 오류 (403 Forbidden)
```
문제: "관리자 권한이 필요합니다"
해결: node scripts/create-admin.js <이메일> ADMIN
```

### 페이지 접속 불가
```
문제: 로그인 페이지로 리다이렉트
해결: 
1. 세션 확인 (로그인 상태)
2. 역할 확인 (ADMIN 또는 SYSTEM_ADMIN)
```

### API 응답 없음
```
문제: API 요청이 실패함
해결:
1. 네트워크 탭에서 에러 확인
2. 서버 로그 확인
3. Prisma 연결 상태 확인
```

---

## 📚 관련 문서

- **구현 보고서**: `docs/admin/IMPLEMENTATION_REPORT.md`
- **기능 명세**: `docs/admin/features/`
- **API 명세**: `docs/backend/api/admin/`
- **완료 체크리스트**: `docs/admin/COMPLETION_REPORT.md`

---

## 🎯 다음 단계

### Phase 2 - 스터디 관리
- [ ] 스터디 목록/상세 API
- [ ] 스터디 숨김/종료 기능
- [ ] 추천 스터디 관리
- [ ] 콘텐츠 삭제 (메시지, 파일)

### Phase 3 - 신고 관리
- [ ] 신고 목록/상세 API
- [ ] 우선순위 자동 배정
- [ ] 담당자 배정 (라운드 로빈)
- [ ] 신고 처리 워크플로우

### Phase 4 - 고급 기능
- [ ] 콘텐츠 자동 검열 (금지어)
- [ ] 분석 및 리포트
- [ ] 시스템 설정 (SYSTEM_ADMIN)

---

**문의**: 구현 관련 질문은 개발팀에 문의하세요 📧

