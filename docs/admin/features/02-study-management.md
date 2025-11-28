# 스터디 관리 기능 분석 및 관리자 요구사항

## 📊 현재 스터디 기능 분석

### 1. 스터디 생성 및 기본 정보

#### 1.1 스터디 생성
**현재 기능:**
- 누구나 스터디 생성 가능
- 기본 정보 입력: 이름, 설명, 카테고리, 이모지
- 설정: 최대 인원, 공개/비공개, 자동 승인, 모집 중 여부

**데이터 모델:**
```prisma
model Study {
  id          String  @id @default(cuid())
  ownerId     String
  name        String
  emoji       String  @default("📚")
  description String  @db.Text
  category    String
  subCategory String?
  
  maxMembers   Int     @default(20)
  isPublic     Boolean @default(true)
  autoApprove  Boolean @default(true)
  isRecruiting Boolean @default(true)
  
  rating      Float? @default(0)
  reviewCount Int?   @default(0)
  tags        String[]
  inviteCode  String   @unique @default(cuid())
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**관리자 요구사항:**
- 스팸 스터디 탐지 및 차단
- 부적절한 이름/설명 모니터링
- 스터디 생성 제한 (일일 생성 수 제한)
- 카테고리 오용 방지

#### 1.2 스터디 검색 및 탐색
**현재 기능:**
- 카테고리별 필터링
- 키워드 검색
- 정렬 (최신순, 인기순, 평점순)
- 태그 필터링

**API:**
```javascript
GET /api/studies?category=프로그래밍&search=react&sort=rating
```

**관리자 요구사항:**
- 추천 스터디 설정
- 숨김 처리 (검색 결과에서 제외)
- 카테고리 강제 변경
- 우선 노출 설정

### 2. 스터디 멤버 관리

#### 2.1 멤버 역할
**현재 역할:**
```prisma
enum MemberRole {
  OWNER   // 스터디장 (1명)
  MEMBER  // 일반 멤버
}
```

**권한:**
- OWNER: 모든 권한 (삭제, 설정 변경, 멤버 관리, 콘텐츠 관리)
- MEMBER: 제한된 권한 (콘텐츠 작성, 조회)

**관리자 요구사항:**
- 스터디장 변경 기능
- 문제 멤버 강제 퇴출
- 멤버 활동 모니터링

#### 2.2 가입 및 탈퇴
**현재 기능:**
- 가입 신청 및 승인 프로세스
- 자동 승인 옵션
- 자발적 탈퇴
- 강퇴 기능 (OWNER만)

**멤버 상태:**
```prisma
enum MemberStatus {
  PENDING  // 승인 대기
  ACTIVE   // 활동 중
  KICKED   // 강퇴됨
  LEFT     // 탈퇴함
}
```

**관리자 요구사항:**
- 가입 신청 모니터링
- 스팸 가입 방지
- 강퇴 남용 감지
- 대량 탈퇴 알림

### 3. 스터디 콘텐츠

#### 3.1 채팅 (Messages)
**현재 기능:**
- 실시간 채팅 (Socket.IO)
- 파일 첨부
- 읽음 표시
- 메시지 삭제 (작성자만)

**관리자 요구사항:**
- 부적절한 메시지 모니터링
- 메시지 강제 삭제
- 채팅 금지어 필터링
- 스팸 메시지 탐지

#### 3.2 공지사항 (Notices)
**현재 기능:**
- 공지사항 작성 (OWNER)
- 상단 고정 옵션
- 중요 공지 마킹
- 조회수 추적
- 파일 첨부

**관리자 요구사항:**
- 전체 공지사항 조회
- 부적절한 공지 삭제
- 공지사항 통계

#### 3.3 파일 (Files)
**현재 기능:**
- 파일 업로드
- 폴더 구조
- 다운로드 추적
- 파일 타입 제한

**관리자 요구사항:**
- 저작권 침해 파일 감지
- 유해 파일 검사
- 파일 강제 삭제
- 스토리지 사용량 모니터링

#### 3.4 일정 (Events)
**현재 기능:**
- 캘린더 일정 생성
- 날짜, 시간, 장소 설정
- 색상 태그

**관리자 요구사항:**
- 일정 조회 및 통계
- 부적절한 일정 삭제

#### 3.5 할일 (StudyTasks)
**현재 기능:**
- 스터디 공유 할일
- 담당자 지정
- 상태 관리 (TODO, IN_PROGRESS, REVIEW, DONE)
- 우선순위 설정

**관리자 요구사항:**
- 할일 통계
- 비정상 활동 감지

### 4. 스터디 평가

#### 4.1 평점 및 리뷰
**현재 기능:**
- 평점: 0-5점
- 리뷰 수 추적

**관리자 요구사항:**
- 평점 조작 탐지
- 리뷰 관리 (작성 예정)
- 평점 초기화

## 🎯 관리자 기능 설계

### 1. 스터디 조회 및 검색

#### 1.1 스터디 목록
**기능:**
- 전체 스터디 목록 (페이지네이션)
- 다양한 필터 및 정렬

**필터 옵션:**
- 카테고리
- 공개/비공개
- 모집 중/모집 완료
- 멤버 수 범위
- 생성일 범위
- 상태 (정상/숨김/삭제)
- 신고 여부

**정렬 옵션:**
- 최근 생성순
- 멤버 수 순
- 활동량 순
- 신고 수 순
- 평점 순

#### 1.2 스터디 검색
**검색 기준:**
- 스터디 이름
- 설명 내용
- 태그
- 스터디장 이름/이메일
- 스터디 ID

#### 1.3 스터디 상세 정보
**표시 정보:**
- 기본 정보 (이름, 설명, 카테고리, 설정)
- 스터디장 정보
- 멤버 목록 및 통계
- 활동 통계 (메시지, 파일, 공지 수)
- 신고 이력
- 관리 이력 (숨김, 경고 등)
- 최근 활동 로그

### 2. 스터디 상태 관리

#### 2.1 스터디 숨김 (Hide)
**기능:**
- 검색 결과에서 제외
- 직접 링크로만 접근 가능
- 신규 가입 차단
- 기존 멤버는 계속 활동 가능

**사용 시나리오:**
- 규정 위반 경고
- 추가 조사 중
- 임시 조치

#### 2.2 스터디 종료 (Close)
**기능:**
- 모든 활동 정지
- 읽기 전용 모드 전환
- 신규 가입 및 콘텐츠 작성 불가
- 기존 콘텐츠는 보존

**사용 시나리오:**
- 심각한 규정 위반
- 법적 문제
- 영구 정지

#### 2.3 스터디 삭제 (Delete)
**옵션:**
- 소프트 삭제: 데이터 보존, 접근 불가
- 하드 삭제: 모든 데이터 완전 삭제

**삭제 효과:**
- 모든 멤버 자동 탈퇴
- 관련 콘텐츠 삭제/보존 선택
- 복구 불가 (하드 삭제 시)

### 3. 스터디 모더레이션

#### 3.1 콘텐츠 관리
**기능:**
- 메시지 조회 및 삭제
- 파일 조회 및 삭제
- 공지사항 수정/삭제
- 일괄 삭제 기능

#### 3.2 멤버 관리
**기능:**
- 멤버 강제 퇴출
- 스터디장 변경
- 멤버 가입 승인/거절
- 멤버 활동 모니터링

#### 3.3 설정 변경
**기능:**
- 카테고리 강제 변경
- 공개/비공개 전환
- 모집 중지
- 최대 인원 조정

### 4. 스터디 추천 및 큐레이션

#### 4.1 추천 스터디
**기능:**
- 홈페이지 추천 영역에 노출
- 추천 순서 설정
- 추천 기간 설정

**선정 기준:**
- 활동성
- 멤버 만족도
- 콘텐츠 품질
- 규정 준수

#### 4.2 우수 스터디 배지
**기능:**
- 우수 스터디 마크 부여
- 검색 결과 상단 노출
- 특별 혜택 (추후 기능)

### 5. 스터디 통계 및 분석

#### 5.1 대시보드 지표
- 전체 스터디 수
- 신규 생성 스터디 (일/주/월)
- 활성 스터디 비율
- 카테고리별 분포
- 평균 멤버 수
- 평균 활동량

#### 5.2 추세 분석
- 스터디 생성 추이
- 카테고리 인기도 변화
- 활동량 추이
- 신고 추이

#### 5.3 상세 분석
- 스터디 생명 주기 분석
- 성공 스터디 특징 분석
- 실패 스터디 패턴 분석

## 🔐 권한 설계

### 스터디 관리 권한 레벨

**VIEWER:**
- 스터디 목록 조회
- 스터디 상세 정보 조회
- 통계 조회

**MODERATOR:**
- VIEWER 권한 포함
- 콘텐츠 삭제 (메시지, 파일, 공지)
- 멤버 경고
- 스터디 숨김 (7일 이하)

**ADMIN:**
- MODERATOR 권한 포함
- 스터디 종료
- 스터디장 변경
- 스터디 소프트 삭제
- 설정 강제 변경

**SUPER_ADMIN:**
- ADMIN 권한 포함
- 스터디 하드 삭제
- 추천 스터디 설정
- 시스템 설정 변경

## 📊 데이터 모델 확장

```prisma
// 스터디 관리 로그
model StudyLog {
  id        String   @id @default(cuid())
  studyId   String
  adminId   String
  action    StudyAction
  reason    String?  @db.Text
  details   Json?
  createdAt DateTime @default(now())
  
  @@index([studyId, createdAt])
  @@index([action, createdAt])
}

enum StudyAction {
  HIDE
  UNHIDE
  CLOSE
  REOPEN
  DELETE
  CHANGE_OWNER
  FORCE_UPDATE
  MEMBER_KICK
  CONTENT_DELETE
  RECOMMEND
  UNRECOMMEND
}

// 스터디 추천
model StudyRecommendation {
  id        String   @id @default(cuid())
  studyId   String   @unique
  adminId   String
  reason    String   @db.Text
  priority  Int      @default(0)
  startDate DateTime
  endDate   DateTime?
  createdAt DateTime @default(now())
  
  @@index([priority, startDate])
}
```

## 🎨 UI/UX 설계

### 1. 스터디 목록 페이지
- 카드/테이블 뷰 전환
- 썸네일 (이모지), 이름, 멤버 수, 상태
- 빠른 액션 메뉴 (보기, 숨김, 종료)
- 일괄 작업 지원

### 2. 스터디 상세 페이지
- 탭 구조: 정보 / 멤버 / 콘텐츠 / 통계 / 이력
- 상단 액션 바 (숨김, 종료, 추천, 삭제)
- 실시간 활동 피드
- 신고 연결 링크

### 3. 콘텐츠 모더레이션 페이지
- 메시지/파일/공지 통합 뷰
- 신고된 콘텐츠 우선 표시
- 체크박스 일괄 삭제
- 필터 및 검색

## 🚀 구현 우선순위

### Phase 1: 필수 기능
1. 스터디 목록 및 검색
2. 스터디 상세 정보
3. 스터디 숨김/종료/삭제
4. 기본 통계

### Phase 2: 핵심 기능
1. 콘텐츠 모더레이션
2. 멤버 관리
3. 설정 변경
4. 관리 이력

### Phase 3: 고급 기능
1. 추천 스터디 시스템
2. 상세 통계 및 분석
3. 자동화 룰
4. 큐레이션 도구

## 📝 API 명세 (예시)

```typescript
// 스터디 목록
GET /api/admin/studies
Query: {
  page, limit, category, status, search, sortBy, sortOrder
}

// 스터디 상세
GET /api/admin/studies/:studyId

// 스터디 숨김
POST /api/admin/studies/:studyId/hide
Body: { reason: string, duration?: string }

// 스터디 종료
POST /api/admin/studies/:studyId/close
Body: { reason: string }

// 스터디 삭제
DELETE /api/admin/studies/:studyId
Body: { reason: string, hardDelete?: boolean }

// 스터디장 변경
POST /api/admin/studies/:studyId/change-owner
Body: { newOwnerId: string, reason: string }

// 멤버 강제 퇴출
DELETE /api/admin/studies/:studyId/members/:memberId
Body: { reason: string }

// 추천 스터디 설정
POST /api/admin/studies/:studyId/recommend
Body: {
  reason: string,
  priority: number,
  startDate: string,
  endDate?: string
}
```

## ✅ 체크리스트

- [ ] 스터디 기능 완전 분석 완료
- [ ] 관리자 요구사항 도출 완료
- [ ] 권한 시스템 설계 완료
- [ ] 데이터 모델 설계 완료
- [ ] API 명세 작성 완료
- [ ] UI/UX 설계 완료
- [ ] 구현 우선순위 결정 완료

