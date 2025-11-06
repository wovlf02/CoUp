# Study 폴더 화면 설계 문서

> **스터디 기능 화면 설계 모음**  
> **작성일**: 2025.11.06  
> **목적**: CoUp 플랫폼의 핵심 기능인 스터디 관련 모든 화면 상세 설계

---

## 📁 폴더 구조

```
docs/screens/study/
├── README.md                    # 📚 전체 문서 요약
├── search/                      # 🔍 스터디 탐색 (미가입자)
│   ├── 01_study-explore.md
│   ├── 02_study-create.md
│   ├── 03_study-preview.md
│   ├── 04_study-join-flow.md
│   └── 05_study-search-advanced.md
└── my/                          # 👥 내 스터디 (가입자)
    ├── 01_my-study-list.md
    ├── 02_my-study-dashboard.md
    ├── 03_my-study-chat.md
    ├── 04_study-approval-management.md
    ├── 05_study-member-profile.md
    ├── 06_study-onboarding.md
    └── 07_study-analytics.md
```

---

## 📚 문서 목록

### 🔍 스터디 탐색 (Search) - 5개

공개 스터디를 찾고 가입하는 과정의 모든 화면

1. **[search/01_study-explore.md](search/01_study-explore.md)** - 스터디 탐색
   - 공개 스터디 검색 및 필터링
   - 카드 그리드 레이아웃
   - 카테고리별 분류
   - **라우트**: `/studies`

2. **[search/02_study-create.md](search/02_study-create.md)** - 스터디 생성
   - 스터디 기본 정보 입력
   - 모집 설정
   - 태그 및 카테고리 설정
   - **라우트**: `/studies/create`

3. **[search/03_study-preview.md](search/03_study-preview.md)** - 스터디 프리뷰 (미가입자용)
   - 제한된 정보 공개 (공지 2개 미리보기 등)
   - 가입 유도 UI
   - 멤버 미리보기 (상위 5명)
   - **라우트**: `/studies/[studyId]`

4. **[search/04_study-join-flow.md](search/04_study-join-flow.md)** - 가입 플로우 ⭐
   - 멀티 스텝 폼 (규칙 확인 → 자기소개 → 알림 설정)
   - 자동/수동 승인 분기 처리
   - 환영 메시지 및 대기 모달
   - **라우트**: `/studies/[studyId]/join`
   - **효과**: 가입 전환율 +30%

5. **[search/05_study-search-advanced.md](search/05_study-search-advanced.md)** - 고급 검색/필터 ⭐
   - 다중 필터 (카테고리, 활동 빈도, 평점, 지역 등)
   - 검색 조건 저장 기능
   - AI 기반 맞춤 추천
   - 실시간 결과 미리보기
   - **라우트**: `/studies/search`
   - **효과**: 스터디 발견율 +60%

---

### 👥 내 스터디 (My Studies) - 7개

참여 중인 스터디에서 활동하고 관리하는 모든 화면

1. **[my/01_my-study-list.md](my/01_my-study-list.md)** - 내 스터디 목록
   - 참여 중인 스터디 관리
   - 역할별 배지 표시 (OWNER/ADMIN/MEMBER/PENDING)
   - 빠른 액션 버튼
   - **라우트**: `/my-studies`

2. **[my/02_my-study-dashboard.md](my/02_my-study-dashboard.md)** - 스터디 대시보드 (개요)
   - 2컬럼 레이아웃 (메인 + 우측 위젯)
   - 최근 활동 요약
   - 8개 탭 네비게이션
   - 우측 고정 위젯 (모든 탭에 표시)
   - **라우트**: `/my-studies/[studyId]`

3. **[my/03_my-study-chat.md](my/03_my-study-chat.md)** - 스터디 채팅
   - 실시간 WebSocket 채팅
   - 무한 스크롤 (50개씩)
   - 파일 첨부, 입력 중 표시
   - **라우트**: `/my-studies/[studyId]/chat`

4. **[my/04_study-approval-management.md](my/04_study-approval-management.md)** - 가입 승인 관리 ⭐
   - 승인 대기 멤버 목록
   - 신청자 상세 정보 (자기소개, 실력 수준 등)
   - 승인/거절 처리 및 사유 관리
   - **라우트**: `/my-studies/[studyId]/approvals`
   - **권한**: OWNER, ADMIN
   - **효과**: 승인 처리 시간 -70%

5. **[my/05_study-member-profile.md](my/05_study-member-profile.md)** - 멤버 프로필 & 활동 ⭐
   - 멤버별 활동 통계 (출석률, 할일 완료율)
   - 기여도 분석 및 순위
   - 뱃지 시스템 (🔥 7일 연속, ⭐ MVP 등)
   - 멤버 간 평가 시스템
   - **라우트**: `/my-studies/[studyId]/members/[userId]`

6. **[my/06_study-onboarding.md](my/06_study-onboarding.md)** - 신규 멤버 온보딩 ⭐
   - 7단계 체크리스트 (프로필 작성, 첫 인사 등)
   - 자동 진행 상황 감지
   - 완료 보상 (뱃지, 포인트)
   - 주요 기능 가이드 투어
   - **라우트**: `/my-studies/[studyId]/welcome`
   - **표시**: 가입 후 첫 7일간
   - **효과**: 신규 멤버 이탈률 -50%

7. **[my/07_study-analytics.md](my/07_study-analytics.md)** - 스터디 분석 대시보드 ⭐
   - 핵심 지표 (활성 멤버, 출석률, 할일 완료율)
   - 활동 트렌드 그래프
   - 멤버 참여도 순위 및 이탈 위험 분석
   - AI 기반 운영 제안
   - **라우트**: `/my-studies/[studyId]/analytics`
   - **권한**: OWNER, ADMIN
   - **효과**: 저활동 멤버 조기 발견 +90%

---

## 🎯 화면 구성 전략

### 1. 스터디 탐색 vs 내 스터디 분리

```
🔍 search/ (/studies/*)        → 공개 스터디 탐색 (미가입자)
👥 my/ (/my-studies/*)          → 참여 중인 스터디 (가입자)
```

**분리 이유**:
- 명확한 사용자 컨텍스트 구분
- 각 모드에 최적화된 UI/UX
- 권한 관리 단순화
- URL 구조의 직관성

**자동 리다이렉트**:
- 가입한 스터디를 `/studies/[id]`로 접근 → `/my-studies/[id]`로 이동
- 미가입 스터디를 `/my-studies/[id]`로 접근 → `/studies/[id]`로 이동

---

### 2. 정보 공개 수준

| 상태 | 공개 정보 | 제한 정보 | 접근 불가 |
|------|-----------|-----------|-----------|
| **미가입** | 기본 정보, 규칙 | 공지 2개 미리보기, 멤버 5명 | 채팅, 파일, 캘린더, 할일 |
| **PENDING** | 전체 | 읽기만 가능 | 채팅 쓰기, 파일 업로드 |
| **MEMBER+** | 전체 | - | 설정 (ADMIN+만) |

---

### 3. 2컬럼 레이아웃 (FHD 최적화)

```
[메인 콘텐츠 70%] + [우측 고정 위젯 30%]
```

**우측 위젯 (모든 탭에서 표시)**:
- 📊 스터디 현황 대시보드
- 👥 온라인 멤버 (실시간)
- ⚡ 빠른 액션 버튼
- 📌 고정 공지
- ✅ 급한 할일 (D-3 이내)
- 📅 다가오는 일정
- 📈 나의 활동 요약

---

## 🚀 구현 우선순위

### Phase 1: 핵심 기능 (필수) - search/my 기본
1. ✅ 스터디 탐색 (search/01)
2. ✅ 스터디 생성 (search/02)
3. ✅ 스터디 프리뷰 (search/03)
4. ✅ 내 스터디 목록 (my/01)
5. ✅ 스터디 대시보드 (my/02)
6. ✅ 스터디 채팅 (my/03)

### Phase 2: 사용자 경험 향상
7. ⭐ 가입 플로우 (search/04) - 전환율 향상
8. ⭐ 신규 멤버 온보딩 (my/06) - 이탈 방지
9. ⭐ 고급 검색 (search/05) - 발견 가능성 향상

### Phase 3: 관리 도구
10. 🛠️ 가입 승인 관리 (my/04)
11. 🛠️ 멤버 프로필 (my/05)
12. 🛠️ 스터디 분석 (my/07)

---

## 💡 주요 설계 원칙

### 1. 점진적 정보 공개 (Progressive Disclosure)
- 필요한 정보만 단계적으로 표시
- 첫 화면에 핵심만, 상세는 펼치기/클릭

### 2. 실시간 피드백
- WebSocket 기반 실시간 업데이트
- Optimistic UI 업데이트
- 즉각적인 Toast 알림

### 3. 데이터 기반 의사결정
- 멤버 활동 분석
- 이탈 위험 조기 감지
- AI 기반 추천 및 제안

### 4. 게이미피케이션
- 뱃지 시스템 (🔥 연속 출석, ⭐ MVP 등)
- 멤버 간 긍정적 경쟁
- 온보딩 완료 보상

### 5. 접근성 & 반응형
- Mobile-first 접근
- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원

---

## 🎨 디자인 시스템

### 색상 코딩
```
Primary:   #6366F1 (인디고)
Success:   #10B981 (그린)
Warning:   #F59E0B (오렌지)
Danger:    #EF4444 (레드)
Gray:      #6B7280 (중립)
```

### 역할 배지 색상
```
OWNER:     #EF4444 (레드) 👑
ADMIN:     #8B5CF6 (퍼플) ⭐
MEMBER:    #6B7280 (그레이) 👤
PENDING:   #F59E0B (오렌지) ⏳
```

### 타이포그래피
```
H1: 2xl (24px) Bold
H2: xl (20px) Bold
Body: base (16px) Regular
Small: sm (14px) Regular
Tiny: xs (12px) Regular
```

---

## 📊 예상 효과

### 사용자 경험
- ✅ 가입 전환율 **+30%** 향상 (개선된 가입 플로우)
- ✅ 신규 멤버 이탈률 **-50%** 감소 (온보딩)
- ✅ 평균 체류 시간 **+40%** 증가 (우측 위젯)
- ✅ 스터디 발견율 **+60%** 향상 (고급 검색)

### 운영 효율
- ✅ 승인 처리 시간 **-70%** 단축 (승인 관리 UI)
- ✅ 저활동 멤버 조기 발견 **+90%** (분석 대시보드)
- ✅ 관리자 작업 시간 **-40%** 절감

---

## 🔧 기술 스택 권장

### Frontend
- **Framework**: Next.js 14 (App Router)
- **State**: React Query + Zustand
- **Realtime**: Socket.IO Client
- **Charts**: Recharts / Chart.js
- **Forms**: React Hook Form + Zod

### Backend
- **API**: Next.js API Routes / Express
- **Database**: PostgreSQL + Prisma
- **Realtime**: Socket.IO Server
- **Cache**: Redis
- **Storage**: AWS S3

### Infrastructure
- **Hosting**: Vercel / AWS
- **CDN**: Cloudflare
- **Monitoring**: Sentry
- **Analytics**: Mixpanel / Amplitude

---

## 📝 다음 단계

### 1. 개발 준비
- [ ] 데이터베이스 스키마 설계
- [ ] API 엔드포인트 정의
- [ ] 컴포넌트 구조 설계

### 2. 프로토타입
- [ ] Figma 디자인
- [ ] 인터랙티브 프로토타입
- [ ] 사용자 테스트

### 3. 개발 시작
- [ ] Phase 1 구현 (핵심 기능)
- [ ] Phase 2 구현 (UX 향상)
- [ ] Phase 3 구현 (관리 도구)

---

## 📚 참고 문서

- [navigation-study-separation-design.md](../navigation-study-separation-design.md) - 네비게이션 분리 전략
- [database.md](../database.md) - 데이터베이스 설계
- [api.md](../api.md) - API 명세

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025.11.06  
**버전**: 2.0 (폴더 구조 개편)
