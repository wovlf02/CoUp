# 사용자 관리 기능 분석 및 관리자 요구사항

## 📊 현재 사용자 기능 분석

### 1. 사용자 인증 시스템

#### 1.1 회원가입
**현재 기능:**
- 이메일/비밀번호 기반 회원가입
- OAuth 로그인 지원 (Google, GitHub 예정)
- 프로필 정보 입력 (이름, 아바타, 자기소개)

**데이터 모델:**
```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String?
  name     String?
  avatar   String?
  bio      String?
  provider Provider @default(CREDENTIALS)
  role     UserRole @default(USER)
  status   UserStatus @default(ACTIVE)
  
  // 소셜 로그인
  googleId String? @unique
  githubId String? @unique
  
  // 타임스탬프
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastLoginAt DateTime?
}
```

**관리자 요구사항:**
- 회원가입 승인제 전환 옵션
- 스팸/봇 계정 탐지 및 차단
- 이메일 도메인 화이트리스트/블랙리스트
- 대량 가입 모니터링

#### 1.2 로그인 및 세션 관리
**현재 기능:**
- NextAuth 기반 세션 관리
- 자동 로그인 (Remember Me)
- 계정 상태 확인 (삭제됨, 정지됨)

**관리자 요구사항:**
- 강제 로그아웃 기능
- 다중 기기 세션 관리
- 의심스러운 로그인 탐지
- 세션 로그 조회

### 2. 사용자 프로필 관리

#### 2.1 프로필 정보
**현재 기능:**
- 이름, 아바타, 자기소개 수정
- 비밀번호 변경
- 프로필 공개/비공개 설정

**API 엔드포인트:**
- `GET /api/users/me` - 내 정보 조회
- `PATCH /api/users/me` - 프로필 수정
- `PATCH /api/users/me/password` - 비밀번호 변경
- `GET /api/users/:userId` - 타 사용자 정보 조회

**관리자 요구사항:**
- 부적절한 프로필 정보 모니터링
- 아바타 이미지 검수
- 닉네임/이름 금지어 필터링
- 프로필 강제 수정 기능

### 3. 사용자 활동 통계

#### 3.1 활동 지표
**현재 기능:**
```javascript
// GET /api/users/me/stats
{
  studiesOwned: number,     // 생성한 스터디 수
  studiesJoined: number,    // 참여중인 스터디 수
  tasksCompleted: number,   // 완료한 할일 수
  messagesCount: number     // 보낸 메시지 수
}
```

**관리자 요구사항:**
- 사용자별 활동 히스토리
- 비활성 사용자 탐지
- 활동 패턴 분석 (스팸 탐지)
- 참여도 점수 계산

### 4. 사용자 상태 관리

#### 4.1 계정 상태
**현재 상태:**
```prisma
enum UserStatus {
  ACTIVE      // 정상
  SUSPENDED   // 정지
  DELETED     // 삭제
}
```

**제한 사항:**
- SUSPENDED: 로그인 불가, 기존 활동 보존
- DELETED: 로그인 불가, 개인정보 삭제

**관리자 요구사항:**
- 정지 사유 및 기간 설정
- 정지 이력 조회
- 자동 정지 해제
- 경고 시스템 (누적 경고 → 자동 정지)

## 🎯 관리자 기능 설계

### 1. 사용자 조회 및 검색

#### 1.1 사용자 목록
**기능:**
- 전체 사용자 목록 조회 (페이지네이션)
- 다양한 필터링 옵션
- 정렬 기능

**필터 옵션:**
- 상태 (활성/정지/삭제)
- 가입 방식 (자체/Google/GitHub)
- 가입 기간
- 최종 로그인 기간
- 활동 수준 (활발함/보통/비활성)
- 경고 횟수

**정렬 옵션:**
- 최근 가입순
- 활동량 순
- 경고 횟수 순
- 마지막 로그인 순

#### 1.2 사용자 검색
**검색 기준:**
- 이메일
- 이름
- 사용자 ID
- IP 주소 (로그 기반)

#### 1.3 사용자 상세 정보
**표시 정보:**
- 기본 정보 (이메일, 이름, 가입일, 마지막 로그인)
- 활동 통계
- 참여 스터디 목록
- 제재 이력
- 신고 이력 (신고한 것/신고당한 것)
- 로그인 로그 (최근 10개)

### 2. 사용자 상태 관리

#### 2.1 계정 정지
**정지 옵션:**
- 정지 기간: 1일, 3일, 7일, 30일, 영구
- 정지 사유 (필수): 텍스트 입력
- 관련 신고 연결 (선택)
- 사용자에게 이메일 알림 발송

**정지 효과:**
- 즉시 모든 세션 무효화
- 로그인 시도 시 정지 사유 표시
- 기존 활동은 유지 (삭제 안 함)
- 정지 기간 만료 시 자동 해제

#### 2.2 계정 해제
**해제 옵션:**
- 수동 해제 (정지 기간 전에)
- 해제 사유 기록
- 사용자에게 알림

#### 2.3 계정 삭제
**삭제 옵션:**
- 소프트 삭제: status = DELETED, 데이터 보존
- 하드 삭제: 완전 삭제 (GDPR 요청 시)

**삭제 효과:**
- 개인정보 마스킹 (이메일, 이름 등)
- 활동 내역은 "삭제된 사용자"로 표시
- 복구 불가 (하드 삭제 시)

### 3. 경고 시스템

#### 3.1 경고 발급
**경고 정보:**
- 경고 사유
- 관련 콘텐츠 링크
- 발급 일시 및 관리자

**경고 누적 효과:**
- 1차 경고: 알림만
- 2차 경고: 알림 + 24시간 채팅 제한
- 3차 경고: 3일 정지
- 4차 경고: 7일 정지
- 5차 경고: 영구 정지

#### 3.2 경고 조회
- 사용자별 경고 이력
- 경고 통계 (기간별, 사유별)

### 4. 사용자 통계 및 분석

#### 4.1 대시보드 지표
- 전체 사용자 수
- 신규 가입자 수 (일/주/월)
- 활성 사용자 수 (DAU/WAU/MAU)
- 정지된 사용자 수
- 평균 활동 지표

#### 4.2 추세 분석
- 가입자 추이 그래프
- 활동량 추이
- 정지/경고 추이

#### 4.3 코호트 분석
- 가입 시기별 리텐션
- 활동 패턴 분석

## 🔐 권한 설계

### 사용자 관리 권한 레벨

**VIEWER (조회자):**
- 사용자 목록 조회
- 사용자 상세 정보 조회
- 통계 조회

**MODERATOR (모더레이터):**
- VIEWER 권한 포함
- 경고 발급
- 7일 이하 정지
- 콘텐츠 삭제

**ADMIN (관리자):**
- MODERATOR 권한 포함
- 무제한 정지
- 영구 정지
- 계정 삭제 (소프트)

**SUPER_ADMIN (최고 관리자):**
- ADMIN 권한 포함
- 계정 하드 삭제
- 관리자 권한 부여/회수
- 시스템 설정 변경

## 📊 데이터 모델 확장

### 필요한 추가 모델

```prisma
// 제재 이력
model Sanction {
  id              String       @id @default(cuid())
  userId          String
  adminId         String
  type            SanctionType // WARNING, SUSPENSION, BAN
  reason          String       @db.Text
  duration        String?      // "1d", "3d", "7d", "30d", "permanent"
  expiresAt       DateTime?
  relatedReportId String?
  createdAt       DateTime     @default(now())
  
  @@index([userId, createdAt])
  @@index([type, createdAt])
}

enum SanctionType {
  WARNING
  SUSPENSION
  BAN
}

// 관리자 활동 로그
model AdminLog {
  id         String      @id @default(cuid())
  adminId    String
  action     AdminAction
  targetType String?     // "User", "Study", "Report"
  targetId   String?
  details    Json?
  ipAddress  String?
  createdAt  DateTime    @default(now())
  
  @@index([adminId, createdAt])
  @@index([action, createdAt])
}

enum AdminAction {
  USER_VIEW
  USER_WARN
  USER_SUSPEND
  USER_UNSUSPEND
  USER_DELETE
  // ... more actions
}
```

## 🎨 UI/UX 설계

### 1. 사용자 목록 페이지
- 테이블 형식으로 표시
- 한 눈에 중요 정보 확인 (상태, 경고 수)
- 각 행에서 빠른 액션 (보기, 정지, 경고)
- 체크박스로 일괄 작업 지원

### 2. 사용자 상세 페이지
- 탭 구조: 기본정보 / 활동 / 스터디 / 제재이력 / 신고이력
- 빠른 액션 버튼 (경고, 정지, 해제)
- 타임라인 형식의 활동 로그

### 3. 정지 모달
- 사유 입력 (필수)
- 기간 선택 (드롭다운)
- 관련 신고 선택 (선택)
- 확인/취소 버튼

## 🚀 구현 우선순위

### Phase 1: 필수 기능
1. 사용자 목록 및 검색
2. 사용자 상세 정보 조회
3. 계정 정지/해제
4. 기본 통계 대시보드

### Phase 2: 핵심 기능
1. 경고 시스템
2. 제재 이력 관리
3. 관리자 활동 로그
4. 일괄 작업

### Phase 3: 고급 기능
1. 고급 검색 및 필터
2. 상세 통계 및 분석
3. 자동화 룰
4. 이메일 알림 템플릿

## 📝 API 명세 (예시)

```typescript
// 사용자 목록 조회
GET /api/admin/users
Query Parameters:
  - page: number
  - limit: number
  - status: "ACTIVE" | "SUSPENDED" | "DELETED"
  - search: string
  - sortBy: "createdAt" | "lastLoginAt" | "warningCount"
  - sortOrder: "asc" | "desc"

// 사용자 상세 조회
GET /api/admin/users/:userId

// 사용자 정지
POST /api/admin/users/:userId/suspend
Body: {
  reason: string,
  duration: "1d" | "3d" | "7d" | "30d" | "permanent",
  relatedReportId?: string
}

// 사용자 정지 해제
POST /api/admin/users/:userId/unsuspend
Body: {
  reason: string
}

// 경고 발급
POST /api/admin/users/:userId/warn
Body: {
  reason: string,
  relatedContent?: string
}
```

## ✅ 체크리스트

- [ ] 사용자 기능 완전 분석 완료
- [ ] 관리자 요구사항 도출 완료
- [ ] 권한 시스템 설계 완료
- [ ] 데이터 모델 설계 완료
- [ ] API 명세 작성 완료
- [ ] UI/UX 설계 완료
- [ ] 구현 우선순위 결정 완료

