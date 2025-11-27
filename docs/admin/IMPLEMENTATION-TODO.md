# CoUp 관리자 시스템 - 구현 TODO 리스트

> **작성일**: 2025-11-27  
> **예상 기간**: 10주 (2025-11-27 ~ 2026-02-05)  
> **참조**: `docs/admin/03-admin-system-integrated.md`

---

## 📋 목차

- [Phase 1: 기본 인프라 (Week 1-2)](#phase-1-기본-인프라-week-1-2)
- [Phase 2: 핵심 기능 (Week 3-4)](#phase-2-핵심-기능-week-3-4)
- [Phase 3: 확장 기능 (Week 5-6)](#phase-3-확장-기능-week-5-6)
- [Phase 4: 분석 & 로그 (Week 7-8)](#phase-4-분석--로그-week-7-8)
- [Phase 5: 최적화 & 자동화 (Week 9-10)](#phase-5-최적화--자동화-week-9-10)

---

## Phase 1: 기본 인프라 (Week 1-2)

### Week 1: 기본 설정 및 인증

#### 📦 환경 설정
- [ ] `.env` 파일에 관리자 관련 환경 변수 추가
  ```env
  VIRUSTOTAL_API_KEY=  # 선택 사항
  REDIS_URL=
  ```
- [ ] Redis 서버 설정 및 연결 테스트
- [ ] Next.js 15/16 프로젝트 설정 확인

#### 🔐 인증 및 권한
- [ ] `middleware.js`에 관리자 권한 체크 추가
  ```typescript
  // middleware.js
  if (pathname.startsWith('/admin')) {
    if (!session || !['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect('/');
    }
  }
  ```
- [ ] `lib/adminAuth.js` 생성
  - [ ] `requireAdmin()` 함수 구현
  - [ ] `requireSystemAdmin()` 함수 구현
  - [ ] `hasPermission()` 함수 구현
- [ ] 권한 체크 테스트 (단위 테스트)

#### 🗄️ 데이터베이스 스키마 확장
- [ ] `prisma/schema.prisma` 업데이트
  - [ ] `AdminLog` 모델 추가
    ```prisma
    model AdminLog {
      id         String      @id @default(cuid())
      adminId    String
      adminName  String
      action     AdminAction
      targetType String?
      targetId   String?
      targetName String?
      before     Json?
      after      Json?
      reason     String?     @db.Text
      ipAddress  String?
      userAgent  String?
      createdAt  DateTime    @default(now())
      
      @@index([adminId, createdAt])
      @@index([action, createdAt])
      @@index([targetType, targetId])
    }
    ```
  - [ ] `SystemSetting` 모델 추가
  - [ ] `Sanction` 모델 추가
  - [ ] `FunctionRestriction` 모델 추가
  - [ ] `AdminAction` enum 추가
- [ ] 마이그레이션 파일 생성
  ```bash
  npx prisma migrate dev --name add_admin_tables
  ```
- [ ] 마이그레이션 실행 및 확인

#### 🎨 관리자 레이아웃
- [ ] `app/admin/layout.tsx` 생성
  ```tsx
  import { requireAdmin } from '@/lib/adminAuth';
  import AdminSidebar from '@/components/admin/layout/AdminSidebar';
  import AdminHeader from '@/components/admin/layout/AdminHeader';
  
  export default async function AdminLayout({ children }) {
    await requireAdmin();
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main>
          <AdminHeader />
          {children}
        </main>
      </div>
    );
  }
  ```
- [ ] `components/admin/layout/AdminSidebar.tsx` 구현
  - [ ] 네비게이션 메뉴 (7개 항목)
  - [ ] 현재 페이지 하이라이트
  - [ ] 접기/펼치기 기능
- [ ] `components/admin/layout/AdminHeader.tsx` 구현
  - [ ] 사용자 프로필
  - [ ] 알림 아이콘
  - [ ] 로그아웃 버튼

---

### Week 2: 대시보드 MVP

#### 📊 대시보드 페이지
- [ ] `app/admin/dashboard/page.tsx` 생성
  - [ ] Server Component로 구현
  - [ ] 핵심 지표 데이터 페칭
  - [ ] ISR 설정 (`export const revalidate = 60`)
- [ ] 핵심 지표 계산 함수 구현
  - [ ] `lib/admin/stats.ts` 생성
  - [ ] `getDashboardStats()` 함수
    ```typescript
    export async function getDashboardStats() {
      const [totalUsers, activeStudies, pendingReports, dau] = await Promise.all([
        prisma.user.count(),
        prisma.study.count({ where: { /* 활성 조건 */ } }),
        prisma.report.count({ where: { status: 'PENDING' } }),
        calculateDAU()
      ]);
      return { totalUsers, activeStudies, pendingReports, dau };
    }
    ```
  - [ ] `calculateDAU()` 함수 구현

#### 🎴 통계 카드 컴포넌트
- [ ] `components/admin/dashboard/StatCard.tsx` 생성
  - [ ] Props 타입 정의
  - [ ] 호버 애니메이션
  - [ ] 변화율 표시 (전주 대비)
  - [ ] 아이콘 통합
- [ ] 4개 통계 카드 렌더링
  - [ ] 총 사용자
  - [ ] 활성 스터디
  - [ ] 미처리 신고
  - [ ] 오늘 DAU

#### 📈 활동 그래프 (기본)
- [ ] Recharts 라이브러리 설치
  ```bash
  npm install recharts
  ```
- [ ] `components/admin/dashboard/ActivityGraph.tsx` 생성
  - [ ] Client Component로 구현
  - [ ] Dynamic Import 적용
  - [ ] 최근 7일 활동 데이터 표시

#### 🚨 긴급 알림 목록
- [ ] `components/admin/dashboard/AlertsList.tsx` 생성
  - [ ] Server Component로 구현
  - [ ] Suspense로 스트리밍
  - [ ] 최근 24시간 HIGH/URGENT 신고 표시

#### 🔧 감사 로그 시스템
- [ ] `lib/admin/auditLog.ts` 생성
  - [ ] `logAdminAction()` 함수
    ```typescript
    export async function logAdminAction({
      adminId,
      action,
      targetType,
      targetId,
      before,
      after,
      reason
    }: AdminLogInput) {
      return await prisma.adminLog.create({
        data: {
          adminId,
          adminName: session.user.name,
          action,
          targetType,
          targetId,
          before,
          after,
          reason,
          ipAddress: getClientIP(),
          userAgent: headers.get('user-agent')
        }
      });
    }
    ```
  - [ ] IP 주소 추출 함수
  - [ ] 모든 관리자 액션에 자동 로깅 추가

#### ✅ Week 1-2 완료 기준
- [ ] `/admin/dashboard` 접근 시 권한 체크 작동
- [ ] 대시보드에 4개 통계 카드 표시
- [ ] 관리자 액션 로그 자동 저장 확인
- [ ] 테스트: 일반 사용자는 접근 불가

---

## Phase 2: 핵심 기능 (Week 3-4)

### Week 3: 사용자 관리

#### 📋 사용자 목록 페이지
- [ ] `app/admin/users/page.tsx` 생성
  - [ ] URL 쿼리 파라미터 처리 (`searchParams`)
  - [ ] 페이지네이션 (20개씩)
  - [ ] 검색 및 필터링
- [ ] API 엔드포인트: 사용자 목록
  - [ ] `app/api/admin/users/route.ts` 생성
  - [ ] GET 메서드 구현
    ```typescript
    export async function GET(request: Request) {
      const session = await requireAdmin();
      const { searchParams } = new URL(request.url);
      
      const query = searchParams.get('q');
      const role = searchParams.get('role');
      const status = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1');
      
      const users = await prisma.user.findMany({
        where: {
          ...(query && {
            OR: [
              { email: { contains: query } },
              { name: { contains: query } }
            ]
          }),
          ...(role && { role }),
          ...(status && { status })
        },
        skip: (page - 1) * 20,
        take: 20,
        orderBy: { createdAt: 'desc' }
      });
      
      return NextResponse.json({ data: users });
    }
    ```
  - [ ] 권한 체크 추가

#### 🔍 검색 및 필터 컴포넌트
- [ ] `components/admin/users/SearchBar.tsx` 생성
  - [ ] Client Component
  - [ ] Debouncing 적용 (500ms)
  - [ ] URL 쿼리 업데이트
- [ ] `components/admin/users/FilterPanel.tsx` 생성
  - [ ] 역할 필터 (USER, ADMIN, SYSTEM_ADMIN)
  - [ ] 상태 필터 (ACTIVE, SUSPENDED, DELETED)
  - [ ] 날짜 범위 필터

#### 📊 사용자 테이블
- [ ] `components/admin/users/UsersTable.tsx` 생성
  - [ ] Client Component (정렬, 선택 기능)
  - [ ] 9개 컬럼 렌더링
  - [ ] 일괄 선택 기능
  - [ ] 행 클릭 시 상세 페이지 이동

#### 👤 사용자 상세 페이지
- [ ] `app/admin/users/[userId]/page.tsx` 생성
  - [ ] 2단 레이아웃
  - [ ] 기본 정보, 활동 통계 표시
  - [ ] 제재 이력 타임라인
  - [ ] 신고 이력
- [ ] 사용자 상세 데이터 조회 API
  - [ ] `app/api/admin/users/[userId]/route.ts`
  - [ ] GET 메서드 구현

#### 🚫 계정 정지 기능
- [ ] 정지 모달 컴포넌트
  - [ ] `components/admin/users/SuspendModal.tsx` 생성
  - [ ] 정지 기간 선택 (1일/3일/7일/30일/영구)
  - [ ] 정지 사유 입력 (필수)
  - [ ] 이메일 알림 옵션
  - [ ] 추천 조치 표시
- [ ] 정지 API 엔드포인트
  - [ ] `app/api/admin/users/[userId]/suspend/route.ts` 생성
  - [ ] POST 메서드 구현
    ```typescript
    export async function POST(
      request: Request,
      { params }: { params: { userId: string } }
    ) {
      const session = await requireAdmin();
      const { duration, reason, notifyUser } = await request.json();
      
      // 1. 사용자 정지
      await prisma.user.update({
        where: { id: params.userId },
        data: {
          status: 'SUSPENDED',
          suspendedUntil: calculateSuspendDate(duration),
          suspendReason: reason
        }
      });
      
      // 2. 제재 이력 저장
      await prisma.sanction.create({
        data: {
          userId: params.userId,
          type: 'SUSPEND',
          reason,
          duration,
          adminId: session.user.id,
          adminName: session.user.name
        }
      });
      
      // 3. 감사 로그
      await logAdminAction({
        adminId: session.user.id,
        action: 'USER_SUSPEND',
        targetId: params.userId,
        reason
      });
      
      // 4. 이메일 알림
      if (notifyUser) {
        await sendSuspensionEmail(params.userId, reason, duration);
      }
      
      return NextResponse.json({ success: true });
    }
    ```
  - [ ] 정지 종료일 계산 함수
  - [ ] 이메일 알림 발송

#### ✅ 정지 해제 기능
- [ ] 정지 해제 API
  - [ ] `app/api/admin/users/[userId]/unsuspend/route.ts` 생성
  - [ ] POST 메서드 구현
  - [ ] 해제 사유 입력
  - [ ] 감사 로그 기록

---

### Week 4: 신고 관리

#### 🚨 신고 목록 페이지
- [ ] `app/admin/reports/page.tsx` 생성
  - [ ] 카드 형식 목록
  - [ ] 우선순위별 색상 구분
  - [ ] 필터 (상태, 우선순위, 유형)
- [ ] 신고 목록 API
  - [ ] `app/api/admin/reports/route.ts` 생성
  - [ ] GET 메서드 구현
  - [ ] 필터링 및 정렬

#### 📋 신고 상세 페이지
- [ ] `app/admin/reports/[reportId]/page.tsx` 생성
  - [ ] 3단 레이아웃
  - [ ] 신고 정보 / 증거 자료 / 처리 액션
  - [ ] AI 분석 결과 표시
  - [ ] 피신고자 이력 표시
- [ ] 신고 상세 API
  - [ ] `app/api/admin/reports/[reportId]/route.ts`
  - [ ] GET 메서드 구현

#### ⚡ 신고 우선순위 자동 계산
- [ ] `lib/admin/reportPriority.ts` 생성
  - [ ] `calculateReportPriority()` 함수
    ```typescript
    export function calculateReportPriority(report: Report): Priority {
      let score = 0;
      
      // 신고 유형 (0-30점)
      if (report.type === 'HARASSMENT') score += 30;
      else if (report.type === 'INAPPROPRIATE') score += 20;
      else if (report.type === 'SPAM') score += 10;
      
      // 피신고자 이력 (0-40점)
      score += report.target.warningCount * 15;
      score += report.target.suspensionCount * 25;
      
      // 신고 빈도 (0-20점)
      const recentReports = getRecentReports(report.targetId, 7);
      score += recentReports.length * 10;
      
      // 증거 품질 (0-10점)
      if (report.evidence?.screenshots?.length > 0) score += 5;
      
      // 우선순위 결정
      if (score >= 70) return 'URGENT';
      if (score >= 50) return 'HIGH';
      if (score >= 30) return 'MEDIUM';
      return 'LOW';
    }
    ```
  - [ ] 신고 생성 시 자동 적용

#### 🎯 신고 처리 기능
- [ ] 신고 처리 모달
  - [ ] `components/admin/reports/ProcessModal.tsx` 생성
  - [ ] 처리 결정 (승인/거절/보류)
  - [ ] 제재 조치 선택
  - [ ] 처리 사유 입력
- [ ] 신고 처리 API
  - [ ] `app/api/admin/reports/[reportId]/process/route.ts` 생성
  - [ ] POST 메서드 구현
    ```typescript
    export async function POST(request: Request, { params }) {
      const session = await requireAdmin();
      const { action, sanction, resolution } = await request.json();
      
      // 1. 신고 상태 업데이트
      await prisma.report.update({
        where: { id: params.reportId },
        data: {
          status: action === 'approve' ? 'RESOLVED' : 'REJECTED',
          resolution,
          processedBy: session.user.id,
          processedAt: new Date()
        }
      });
      
      // 2. 제재 조치 실행 (승인 시)
      if (action === 'approve') {
        await executeSanction(report.targetId, sanction);
      }
      
      // 3. 감사 로그
      await logAdminAction({
        adminId: session.user.id,
        action: 'REPORT_PROCESS',
        targetId: params.reportId,
        reason: resolution
      });
      
      return NextResponse.json({ success: true });
    }
    ```
  - [ ] 제재 조치 실행 함수

#### 👥 담당자 할당
- [ ] 담당자 할당 API
  - [ ] `app/api/admin/reports/[reportId]/assign/route.ts` 생성
  - [ ] POST 메서드 구현
  - [ ] 자동 할당 (Round-robin) 로직

#### ✅ Week 3-4 완료 기준
- [ ] 사용자 검색 및 필터링 작동
- [ ] 사용자 정지/해제 기능 작동
- [ ] 신고 목록 조회 및 필터링
- [ ] 신고 처리 완료 시 제재 자동 실행
- [ ] 모든 액션 감사 로그 기록 확인

---

## Phase 3: 확장 기능 (Week 5-6)

### Week 5: 스터디 관리

#### 📚 스터디 목록 페이지
- [ ] `app/admin/studies/page.tsx` 생성
  - [ ] 탭 (전체/활성/저품질/추천/신고됨)
  - [ ] 검색 및 카테고리 필터
  - [ ] 품질 점수 표시
- [ ] 스터디 목록 API
  - [ ] `app/api/admin/studies/route.ts` 생성
  - [ ] GET 메서드 구현

#### 📊 스터디 품질 점수 계산
- [ ] `lib/admin/studyQuality.ts` 생성
  - [ ] `calculateQualityScore()` 함수
    ```typescript
    export function calculateQualityScore(study: Study): number {
      let score = 0;
      
      // 1. 활동도 (0-30점)
      const daysSinceActivity = getDaysSince(study.lastActivityAt);
      if (daysSinceActivity <= 1) score += 30;
      else if (daysSinceActivity <= 3) score += 25;
      else if (daysSinceActivity <= 7) score += 20;
      else if (daysSinceActivity <= 14) score += 10;
      else if (daysSinceActivity <= 30) score += 5;
      
      // 2. 멤버 충족률 (0-25점)
      const fillRate = study.memberCount / study.maxMembers;
      if (fillRate >= 0.8) score += 25;
      else if (fillRate >= 0.6) score += 20;
      else if (fillRate >= 0.4) score += 15;
      else if (fillRate >= 0.2) score += 10;
      else score += 5;
      
      // 3. 평점 (0-25점)
      if (study.rating >= 4.5) score += 25;
      else if (study.rating >= 4.0) score += 20;
      else if (study.rating >= 3.5) score += 15;
      else if (study.rating >= 3.0) score += 10;
      else if (study.rating >= 2.0) score += 5;
      
      // 4. 콘텐츠 활동 (0-20점)
      let contentScore = 0;
      if (study.stats.messageCount > 100) contentScore += 8;
      else if (study.stats.messageCount > 50) contentScore += 5;
      else if (study.stats.messageCount > 10) contentScore += 3;
      
      if (study.stats.fileCount > 20) contentScore += 6;
      else if (study.stats.fileCount > 10) contentScore += 4;
      
      if (study.stats.noticeCount > 5) contentScore += 6;
      else if (study.stats.noticeCount > 2) contentScore += 4;
      
      score += contentScore;
      
      // 5. 신고 이력 페널티
      score -= study.reportCount * 10;
      
      return Math.max(Math.min(score, 100), 0);
    }
    ```
  - [ ] 크론 작업으로 주기적 업데이트
    ```typescript
    // 매 시간 실행
    export async function updateAllStudyQualityScores() {
      const studies = await prisma.study.findMany();
      for (const study of studies) {
        const score = calculateQualityScore(study);
        await prisma.study.update({
          where: { id: study.id },
          data: { qualityScore: score }
        });
      }
    }
    ```

#### 📈 스터디 상세 페이지
- [ ] `app/admin/studies/[studyId]/page.tsx` 생성
  - [ ] 2단 레이아웃
  - [ ] 품질 리포트 카드
  - [ ] 멤버 목록 (상위 5명)
  - [ ] 활동 통계

#### 🗑️ 스터디 삭제 기능
- [ ] 스터디 삭제 API
  - [ ] `app/api/admin/studies/[studyId]/route.ts` 생성
  - [ ] DELETE 메서드 구현
  - [ ] OWNER 및 멤버들에게 알림

#### 🔒 공개/비공개 전환
- [ ] 공개 설정 API
  - [ ] `app/api/admin/studies/[studyId]/visibility/route.ts` 생성
  - [ ] PATCH 메서드 구현

#### ⭐ 추천 스터디 설정
- [ ] 추천 스터디 자격 검증
  - [ ] `lib/admin/featuredStudy.ts` 생성
  - [ ] `isEligibleForFeatured()` 함수
    ```typescript
    export function isEligibleForFeatured(study: Study): boolean {
      return (
        study.qualityScore >= 80 &&
        study.rating >= 4.0 &&
        study.reviewCount >= 5 &&
        study.memberCount >= study.maxMembers * 0.7 &&
        study.reportCount === 0
      );
    }
    ```
- [ ] 추천 스터디 설정 API
  - [ ] `app/api/admin/studies/[studyId]/feature/route.ts` 생성
  - [ ] POST 메서드 구현

#### 🔄 OWNER 권한 위임
- [ ] 권한 위임 API (SYSTEM_ADMIN만)
  - [ ] `app/api/admin/studies/[studyId]/transfer-owner/route.ts` 생성
  - [ ] POST 메서드 구현
  - [ ] 이전 OWNER는 ADMIN으로 강등
  - [ ] 관련자들에게 알림

---

### Week 6: 콘텐츠 모더레이션

#### 💬 메시지 모더레이션
- [ ] 신고된 메시지 목록 페이지
  - [ ] `app/admin/moderation/messages/page.tsx` 생성
  - [ ] 신고된 메시지 + 자동 감지 메시지
- [ ] 메시지 목록 API
  - [ ] `app/api/admin/moderation/messages/route.ts` 생성

#### 🤖 혐오발언 감정분석 모델
- [ ] 혐오발언 감정분석 모델 통합
  - [ ] `lib/moderation/hateSpeechDetection.ts` 생성
  - [ ] `detectHateSpeech()` 함수
    ```typescript
    // 자체 혐오발언 감정분석 모델 사용
    export async function detectHateSpeech(content: string) {
      // 혐오발언 감정분석 모델 API 호출
      const response = await fetch(`${process.env.HATE_SPEECH_MODEL_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      });
      
      const result = await response.json();
      
      return {
        isHateSpeech: result.prediction === 'hate',
        confidence: result.confidence,
        categories: result.categories // 예: 성별, 인종, 종교 등
      };
    }
    ```
  - [ ] 메시지 생성 시 자동 검사

#### 🔤 자동 필터 시스템
- [ ] 욕설 사전 관리 UI
  - [ ] `app/admin/moderation/filters/page.tsx` 생성
  - [ ] 필터 추가/편집/삭제
- [ ] 필터 관리 API
  - [ ] `app/api/admin/moderation/filters/route.ts` 생성
  - [ ] GET/POST/PUT/DELETE 메서드
- [ ] 필터 적용 함수
  - [ ] `lib/moderation/autoFilter.ts` 생성
  - [ ] `autoModerateMessage()` 함수
  - [ ] 정규식 지원

#### 📁 파일 모더레이션
- [ ] 신고된 파일 목록 페이지
  - [ ] `app/admin/moderation/files/page.tsx` 생성
- [ ] 파일 목록 API
  - [ ] `app/api/admin/moderation/files/route.ts` 생성

#### 🦠 악성 파일 스캔 (VirusTotal)
- [ ] VirusTotal API 통합
  - [ ] `lib/moderation/virusScan.ts` 생성
  - [ ] `scanFileWithVirusTotal()` 함수
  - [ ] 파일 업로드 시 자동 스캔
- [ ] 악성 파일 자동 삭제
  - [ ] 감지 즉시 삭제
  - [ ] 업로더에게 알림
  - [ ] 반복 시 계정 정지

#### ©️ 저작권 침해 처리
- [ ] 저작권 침해 신고 UI
  - [ ] `components/admin/moderation/CopyrightClaimModal.tsx` 생성
  - [ ] 저작권자 정보 입력
  - [ ] 증빙 자료 업로드
- [ ] 저작권 처리 API
  - [ ] `app/api/admin/moderation/files/[fileId]/copyright-claim/route.ts` 생성

#### 🗑️ 메시지/파일 삭제 기능
- [ ] 메시지 삭제 API
  - [ ] `app/api/admin/moderation/messages/[messageId]/route.ts` 생성
  - [ ] DELETE 메서드
  - [ ] 옵션: 삭제 + 경고 / 삭제 + 정지
- [ ] 파일 삭제 API
  - [ ] `app/api/admin/moderation/files/[fileId]/route.ts` 생성

#### ✅ Week 5-6 완료 기준
- [ ] 스터디 품질 점수 자동 계산
- [ ] 저품질 스터디 목록 조회
- [ ] 추천 스터디 설정 가능
- [ ] AI 모더레이션 작동 확인
- [ ] 욕설 필터 자동 적용
- [ ] 악성 파일 자동 삭제

---

## Phase 4: 분석 & 로그 (Week 7-8)

### Week 7: 분석 대시보드

#### 📊 분석 메인 페이지
- [ ] `app/admin/analytics/page.tsx` 생성
  - [ ] 기간 선택 (오늘/주/월/사용자 정의)
  - [ ] 4개 핵심 지표 카드
  - [ ] 사용자 성장 그래프
  - [ ] 카테고리 분포 차트

#### 📈 사용자 통계
- [ ] 사용자 통계 페이지
  - [ ] `app/admin/analytics/users/page.tsx` 생성
  - [ ] DAU/WAU/MAU 차트
  - [ ] 코호트 분석 (리텐션)
  - [ ] 신규 가입자 추이
- [ ] 사용자 통계 API
  - [ ] `app/api/admin/analytics/users/route.ts` 생성
  - [ ] 코호트 데이터 계산

#### 📚 스터디 통계
- [ ] 스터디 통계 페이지
  - [ ] `app/admin/analytics/studies/page.tsx` 생성
  - [ ] 카테고리별 분포
  - [ ] 품질 분포 (우수/보통/저품질)
  - [ ] 스터디 성장 추이
- [ ] 스터디 통계 API
  - [ ] `app/api/admin/analytics/studies/route.ts` 생성

#### 🚨 신고 통계
- [ ] 신고 통계 API
  - [ ] `app/api/admin/analytics/reports/route.ts` 생성
  - [ ] 유형별 분포
  - [ ] 평균 처리 시간
  - [ ] 처리율

#### 📊 일일 집계 테이블
- [ ] `DailyStats` 모델 활용
  - [ ] Prisma 스키마에 이미 정의됨
  - [ ] 크론 작업 설정
    ```typescript
    // scripts/aggregateDailyStats.ts
    export async function aggregateDailyStats() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dau = await calculateDAU(today);
      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });
      
      await prisma.dailyStats.create({
        data: {
          date: today,
          dau,
          newUsers,
          activeStudies: await countActiveStudies(today),
          newStudies: await countNewStudies(today),
          messages: await countMessages(today),
          filesUploaded: await countFilesUploaded(today)
        }
      });
    }
    ```
  - [ ] 매일 자정 실행 (Vercel Cron 또는 Node-cron)

#### 📄 리포트 생성
- [ ] 일일 리포트 API
  - [ ] `app/api/admin/analytics/reports/daily/route.ts` 생성
  - [ ] PDF 또는 JSON 형식
- [ ] 주간 리포트 API
  - [ ] `app/api/admin/analytics/reports/weekly/route.ts` 생성
- [ ] CSV 내보내기 기능
  - [ ] 사용자 목록 CSV
  - [ ] 스터디 목록 CSV
  - [ ] 신고 이력 CSV

---

### Week 8: 감사 로그 & 시스템 설정

#### 📋 감사 로그 조회 (SYSTEM_ADMIN)
- [ ] 감사 로그 페이지
  - [ ] `app/admin/settings/logs/page.tsx` 생성
  - [ ] 필터 (관리자, 액션 유형, 날짜)
  - [ ] 검색 (대상 이름, 사유)
- [ ] 감사 로그 API
  - [ ] `app/api/admin/settings/logs/route.ts` 생성
  - [ ] GET 메서드
  - [ ] 페이지네이션

#### 🔍 로그 상세 모달
- [ ] `components/admin/settings/LogDetailModal.tsx` 생성
  - [ ] Before/After 비교
  - [ ] IP 주소, User Agent 표시

#### ⚙️ 시스템 설정 (SYSTEM_ADMIN)
- [ ] 시스템 설정 페이지
  - [ ] `app/admin/settings/page.tsx` 생성
  - [ ] 카테고리별 그룹화
    - 사용자 설정
    - 스터디 설정
    - 파일 설정
    - 보안 설정
    - 알림 설정
    - 기능 토글
- [ ] 시스템 설정 API
  - [ ] `app/api/admin/settings/route.ts` 생성
  - [ ] GET/PUT 메서드
  - [ ] 변경 이력 저장

#### 👥 관리자 관리 (SYSTEM_ADMIN)
- [ ] 관리자 목록 페이지
  - [ ] `app/admin/settings/admins/page.tsx` 생성
  - [ ] 관리자 목록 표시
  - [ ] 활동 통계
- [ ] 관리자 임명 기능
  - [ ] `components/admin/settings/AppointAdminModal.tsx` 생성
  - [ ] 사용자 검색
  - [ ] 역할 선택 (ADMIN/SYSTEM_ADMIN)
  - [ ] 임명 사유 입력
- [ ] 관리자 관리 API
  - [ ] `app/api/admin/settings/admins/route.ts` 생성
  - [ ] GET/POST/DELETE 메서드

#### 🔧 점검 모드
- [ ] 점검 모드 토글
  - [ ] `MAINTENANCE_MODE` 설정 추가
  - [ ] 활성화 시 모든 일반 사용자 접근 차단
- [ ] 점검 페이지
  - [ ] `app/maintenance/page.tsx` 생성
  - [ ] 점검 메시지, 예상 종료 시간 표시

#### 💾 백업 기능 (SYSTEM_ADMIN)
- [ ] 백업 생성 API
  - [ ] `app/api/admin/settings/backup/route.ts` 생성
  - [ ] POST 메서드
  - [ ] PostgreSQL 덤프 생성
    ```typescript
    import { exec } from 'child_process';
    import { promisify } from 'util';
    
    const execAsync = promisify(exec);
    
    export async function createBackup() {
      const filename = `coup-backup-${Date.now()}.sql.gz`;
      const command = `pg_dump ${process.env.DATABASE_URL} | gzip > backups/${filename}`;
      
      await execAsync(command);
      
      return { filename, size: await getFileSize(filename) };
    }
    ```
- [ ] 백업 목록 조회
- [ ] 백업 다운로드

#### ✅ Week 7-8 완료 기준
- [ ] 분석 대시보드에 모든 차트 표시
- [ ] 코호트 분석 작동
- [ ] 일일 집계 크론 작업 실행
- [ ] 감사 로그 조회 및 필터링 가능
- [ ] 시스템 설정 변경 가능
- [ ] 관리자 임명/해임 가능
- [ ] 백업 생성 및 다운로드

---

## Phase 5: 최적화 & 자동화 (Week 9-10)

### Week 9: 자동화 시스템

#### 🤖 혐오발언 자동 감지 시스템
- [ ] 메시지 작성 시 실시간 검사
  - [ ] `lib/moderation/realtimeCheck.ts` 생성
  - [ ] 혐오발언 모델 + 키워드 필터 + 스팸 패턴 통합
    ```typescript
    export async function checkMessageBeforePost(content: string, userId: string) {
      // 1. 혐오발언 감정분석
      const hateSpeechResult = await detectHateSpeech(content);
      if (hateSpeechResult?.isHateSpeech && hateSpeechResult.confidence > 0.8) {
        // 고신뢰도 혐오발언 → 즉시 차단
        return { allowed: false, action: 'DELETE_AND_WARN' };
      }
      if (hateSpeechResult?.isHateSpeech && hateSpeechResult.confidence > 0.6) {
        // 중간 신뢰도 → 검토 필요
        await flagForReview(content, userId, hateSpeechResult);
        return { allowed: true, action: 'FLAG_FOR_REVIEW' };
      }
      
      // 2. 키워드 필터
      const filterResult = autoModerateMessage(content);
      if (filterResult.shouldBlock) {
        return { allowed: false, action: filterResult.action };
      }
      
      // 3. 스팸 패턴
      const spamResult = await detectSpamPatterns(content, userId);
      if (spamResult.isSpam) {
        return { allowed: false, action: 'FLAG' };
      }
      
      return { allowed: true, action: 'ALLOW' };
    }
    ```
- [ ] 실시간 차단 vs 플래그 로직
- [ ] 오탐 보고 기능

#### 🎯 자동 제재 시스템
- [ ] 3-Strike 자동 적용
  - [ ] `lib/admin/autoSanction.ts` 생성
  - [ ] `determineSanctionLevel()` 함수 (이미 설계됨)
  - [ ] 신고 승인 시 자동 제재 실행
- [ ] 반복 위반자 자동 탐지
  - [ ] 7일 내 경고 3회 → 자동 정지
  - [ ] 30일 내 정지 3회 → 영구 정지

#### 🚨 스마트 알림 시스템
- [ ] 긴급 신고 실시간 알림
  - [ ] URGENT 신고 생성 시 즉시 알림
  - [ ] 이메일 + SMS (Twilio) + Slack
- [ ] 이상 패턴 감지 알림
  - [ ] 1시간 내 신고 5건 이상 → 알림
  - [ ] 파일 업로드 실패 급증 → 알림
- [ ] 일일 요약 이메일
  - [ ] 매일 오전 9시 발송
  - [ ] 전일 주요 지표 요약
  - [ ] 미처리 신고 개수

#### 📧 이메일 템플릿
- [ ] React Email 라이브러리 설정
  ```bash
  npm install react-email @react-email/components
  ```
- [ ] 이메일 템플릿 생성
  - [ ] `emails/SuspensionNotice.tsx` - 정지 통보
  - [ ] `emails/WarningNotice.tsx` - 경고 통보
  - [ ] `emails/ReportProcessed.tsx` - 신고 처리 결과
  - [ ] `emails/DailySummary.tsx` - 일일 요약
- [ ] 이메일 발송 함수
  - [ ] `lib/email/sendEmail.ts` 생성
  - [ ] Resend 또는 SendGrid 통합

#### 🔔 알림 시스템
- [ ] Slack Webhook 통합
  - [ ] 긴급 신고 → #admin-urgent 채널
  - [ ] 시스템 오류 → #tech-team 채널
- [ ] 브라우저 푸시 알림 (선택)
  - [ ] Web Push API 활용
  - [ ] Service Worker 설정

---

### Week 10: 성능 최적화

#### ⚡ Redis 캐싱
- [ ] Redis 캐싱 레이어 구현
  - [ ] `lib/cache/redis.ts` 생성
  - [ ] `getCachedData()` 헬퍼 함수
    ```typescript
    import Redis from 'ioredis';
    
    const redis = new Redis(process.env.REDIS_URL);
    
    export async function getCachedData<T>(
      key: string,
      fetcher: () => Promise<T>,
      ttl: number = 60
    ): Promise<T> {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
      
      const data = await fetcher();
      await redis.setex(key, ttl, JSON.stringify(data));
      
      return data;
    }
    ```
- [ ] 캐싱 적용 대상
  - [ ] 대시보드 통계 (1분 TTL)
  - [ ] 사용자 검색 결과 (5분 TTL)
  - [ ] 스터디 목록 (3분 TTL)
  - [ ] 시스템 설정 (10분 TTL)

#### 📊 데이터베이스 최적화
- [ ] 인덱스 추가
  ```prisma
  // prisma/schema.prisma
  model User {
    // ...existing fields...
    
    @@index([email])
    @@index([status, role, createdAt])
    @@index([lastLoginAt])
  }
  
  model Study {
    // ...existing fields...
    
    @@index([category, isPublic])
    @@index([qualityScore])
    @@index([isFeatured, isPublic])
  }
  
  model Report {
    // ...existing fields...
    
    @@index([status, priority, createdAt])
    @@index([targetType, targetId])
  }
  
  model AdminLog {
    // ...existing fields...
    
    @@index([adminId, createdAt])
    @@index([action, createdAt])
    @@index([targetType, targetId])
  }
  ```
- [ ] 마이그레이션 실행
  ```bash
  npx prisma migrate dev --name add_indexes
  ```

#### 🎯 API 응답 최적화
- [ ] 페이지네이션 개선
  - [ ] Cursor-based pagination 적용 (무한 스크롤용)
- [ ] 필드 선택 최적화
  - [ ] 필요한 필드만 SELECT
  - [ ] `select` 옵션 활용
- [ ] N+1 쿼리 제거
  - [ ] `include` 대신 `select` 사용
  - [ ] 데이터로더 패턴 적용 (선택)

#### 🚀 Next.js 최적화
- [ ] Server Components 최대 활용
  - [ ] 데이터 페칭은 Server Component
  - [ ] 인터랙션만 Client Component
- [ ] Dynamic Import 적용
  - [ ] 차트 라이브러리 지연 로딩
  - [ ] 모달 컴포넌트 지연 로딩
    ```typescript
    const SuspendModal = dynamic(() => import('./SuspendModal'), {
      ssr: false
    });
    ```
- [ ] 이미지 최적화
  - [ ] `next/image` 사용
  - [ ] 프로필 이미지 압축
- [ ] 번들 크기 최적화
  - [ ] Tree shaking 확인
  - [ ] lodash → lodash-es
  - [ ] 불필요한 라이브러리 제거

#### 📊 성능 모니터링
- [ ] Vercel Analytics 설정
  ```typescript
  // app/layout.tsx
  import { SpeedInsights } from '@vercel/speed-insights/next';
  import { Analytics } from '@vercel/analytics/react';
  
  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          {children}
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    );
  }
  ```
- [ ] Web Vitals 측정
  - [ ] FCP, LCP, TTI, CLS 목표 달성 확인
- [ ] 커스텀 성능 메트릭
  - [ ] API 응답 시간 측정
  - [ ] 데이터베이스 쿼리 시간 로깅

#### ✅ Week 9-10 완료 기준
- [ ] 메시지 작성 시 혐오발언 검사 작동
- [ ] 3-Strike 자동 제재 작동
- [ ] 긴급 신고 시 실시간 알림 수신
- [ ] 일일 요약 이메일 발송 확인
- [ ] Redis 캐싱 적용 완료
- [ ] 모든 인덱스 추가 완료
- [ ] Web Vitals 목표 달성 (LCP < 2.5s)

---

## 🎯 마일스톤 체크리스트

### Milestone 1: 기본 인프라 (Week 2 종료)
- [ ] 관리자 인증 시스템 작동
- [ ] 관리자 레이아웃 완성
- [ ] 대시보드 MVP 표시
- [ ] 감사 로그 자동 기록
- [ ] 데이터베이스 스키마 확장 완료

### Milestone 2: 핵심 기능 (Week 4 종료)
- [ ] 사용자 관리 완전 작동 (검색, 정지, 해제)
- [ ] 신고 관리 완전 작동 (목록, 처리, 담당자 할당)
- [ ] 모든 액션 감사 로그 기록
- [ ] 이메일 알림 발송 확인

### Milestone 3: 확장 기능 (Week 6 종료)
- [ ] 스터디 관리 (품질 점수, 추천 설정)
- [ ] 콘텐츠 모더레이션 (AI, 자동 필터)
### Milestone 3: 확장 기능 (Week 6 종료)
- [ ] 스터디 관리 (품질 점수, 추천 설정)
- [ ] 콘텐츠 모더레이션 (혐오발언 감지, 자동 필터)
- [ ] 악성 파일 자동 삭제 (선택)
- [ ] 메시지/파일 삭제 기능

### Milestone 4: 분석 기능 (Week 8 종료)
- [ ] 분석 대시보드 완성 (사용자, 스터디, 신고 통계)
- [ ] 일일 집계 크론 작업 실행
- [ ] 감사 로그 조회 (SYSTEM_ADMIN)
- [ ] 시스템 설정 관리
- [ ] 관리자 임명/해임

### Milestone 5: 완성 (Week 10 종료)
- [ ] 혐오발언 자동 감지 시스템 작동
- [ ] 자동 제재 시스템 작동
- [ ] 실시간 알림 시스템 구축
- [ ] Redis 캐싱 적용
- [ ] 성능 목표 달성
- [ ] 전체 시스템 테스트 완료

---

## 📊 진행률 추적

```
Phase 1: [                    ] 0% (Week 1-2)
Phase 2: [                    ] 0% (Week 3-4)
Phase 3: [                    ] 0% (Week 5-6)
Phase 4: [                    ] 0% (Week 7-8)
Phase 5: [                    ] 0% (Week 9-10)

전체: [                    ] 0%
```

---

## 🛠️ 필수 도구 및 라이브러리

### 설치 필요
```bash
# Redis 클라이언트
npm install ioredis

# 이메일
npm install react-email @react-email/components resend

# 차트
npm install recharts

# 유틸리티
npm install lodash-es date-fns
npm install -D @types/lodash-es

# 테스트 (선택)
npm install -D vitest @testing-library/react
```

### 외부 서비스 설정 필요
- [ ] Redis (Upstash 추천)
- [ ] 혐오발언 감정분석 모델 (자체)
- [ ] VirusTotal API Key (선택)
- [ ] Resend (이메일)
- [ ] Slack Webhook (알림)
- [ ] Twilio (SMS, 선택)

---

## 🔧 크론 작업 설정

### Vercel Cron (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-stats",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/update-quality-scores",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/daily-summary-email",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 크론 작업 API 생성
- [ ] `app/api/cron/daily-stats/route.ts`
- [ ] `app/api/cron/update-quality-scores/route.ts`
- [ ] `app/api/cron/daily-summary-email/route.ts`

---

## 📝 테스트 체크리스트

### 단위 테스트
- [ ] `lib/admin/auditLog.ts` 테스트
- [ ] `lib/admin/reportPriority.ts` 테스트
- [ ] `lib/admin/studyQuality.ts` 테스트
- [ ] `lib/moderation/autoFilter.ts` 테스트

### 통합 테스트
- [ ] 사용자 정지 → 로그인 불가 확인
- [ ] 신고 처리 → 제재 자동 실행 확인
- [ ] 스터디 품질 점수 계산 정확도
- [ ] AI 모더레이션 정확도

### E2E 테스트 (선택)
- [ ] Playwright 설정
- [ ] 관리자 로그인 시나리오
- [ ] 사용자 정지 시나리오
- [ ] 신고 처리 시나리오

---

## 🎉 최종 체크리스트

### 기능 완성도
- [ ] 모든 API 엔드포인트 구현 (30+ 개)
- [ ] 모든 페이지 구현 (15+ 개)
- [ ] 모든 모달/컴포넌트 구현 (50+ 개)

### 성능
- [ ] LCP < 2.5s
- [ ] FCP < 1.0s
- [ ] TTI < 3.0s
- [ ] API 응답 < 500ms (평균)

### 보안
- [ ] 모든 관리자 API 권한 체크
- [ ] SYSTEM_ADMIN 전용 기능 접근 제한
- [ ] SQL Injection 방어 (Prisma ORM)
- [ ] XSS 방어 (입력 sanitization)
- [ ] CSRF 방어

### 문서화
- [ ] API 문서 작성 (Swagger/OpenAPI, 선택)
- [ ] README 업데이트
- [ ] 관리자 매뉴얼 작성

### 배포 준비
- [ ] 환경 변수 설정 (Production)
- [ ] 데이터베이스 마이그레이션 (Production)
- [ ] Redis 연결 확인
- [ ] 외부 API 키 설정 확인
- [ ] 크론 작업 등록

---

**시작일**: 2025-11-27  
**목표 완료일**: 2026-02-05  
**예상 기간**: 10주  
**문서 버전**: 1.0

**화이팅! 🚀**

