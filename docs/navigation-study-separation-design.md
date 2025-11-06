# 네비게이션 설계: 스터디 탐색 vs 내 스터디 분리 전략

> **작성일**: 2025.11.06  
> **결론**: **분리 유지 (2개 탭)**  
> **목적**: 사용자 경험 최적화 및 명확한 기능 구분

---

## 📊 의사결정 분석

### ✅ 분리 유지 (권장)

#### 장점
1. **명확한 멘탈 모델**
   - 사용자가 "탐색 모드"와 "활동 모드"를 즉시 인지
   - 혼란 없이 목적에 맞는 공간으로 빠르게 이동

2. **UI/UX 최적화**
   - 각 모드에 최적화된 레이아웃 사용 가능
   - 탐색: 카드 그리드 + 강력한 필터
   - 내 스터디: 대시보드 + 실시간 위젯

3. **성능 최적화**
   - 필요한 데이터만 로드 (탐색 시 내 스터디 데이터 불필요)
   - 캐싱 전략 단순화

4. **확장성**
   - 향후 기능 추가 시 각 영역에 독립적으로 추가 가능
   - 예: 탐색에 "추천 시스템", 내 스터디에 "통계 대시보드"

#### 단점
1. **탐색 → 가입 → 내 스터디 전환 시 경로 변경**
   - 해결: 자동 리다이렉트로 매끄럽게 처리

2. **URL 구조 설계 필요**
   - 해결: 명확한 prefix로 구분 (`/studies` vs `/my-studies`)

---

### ❌ 합치는 경우 (비권장)

#### 장점
1. 하나의 탭으로 통합되어 네비게이션 단순화

#### 단점
1. **사용자 혼란**
   - "지금 내가 속한 스터디를 보는 건가, 탐색 중인가?" 계속 확인 필요
   - 토글/필터로 구분 시 추가 클릭 발생

2. **UI 복잡도 증가**
   - 하나의 페이지에 2가지 완전히 다른 기능을 넣어야 함
   - 예: 카드에 "가입하기" 버튼 vs "채팅 열기" 버튼 혼재

3. **성능 저하**
   - 모든 데이터를 동시에 로드해야 함
   - 불필요한 API 호출 증가

4. **개발 복잡도**
   - 조건부 렌더링 로직 복잡해짐
   - 버그 발생 가능성 증가

---

## 🎯 최종 결론: 분리 유지

**네비게이션 구성:**
```
좌측 사이드바:
🏠 대시보드
━━━━━━━━━━━━━━━
🔍 스터디 탐색      ← 공개 스터디 찾기
👥 내 스터디       ← 참여 중인 스터디 활동
━━━━━━━━━━━━━━━
📋 할 일
🔔 알림
👤 마이페이지
```

---

## 🔀 URL 구조 설계

### 명확한 Prefix 구분

```
스터디 탐색 (Search Study)
─────────────────────────────────────────
/studies                     공개 스터디 목록 (탐색)
/studies/create              스터디 생성
/studies/[studyId]           스터디 프리뷰 (미가입자용)

내 스터디 (My Studies)
─────────────────────────────────────────
/my-studies                  내 스터디 목록
/my-studies/[studyId]        스터디 대시보드 (개요)
/my-studies/[studyId]/chat           채팅
/my-studies/[studyId]/notices        공지사항
/my-studies/[studyId]/files          파일
/my-studies/[studyId]/calendar       캘린더
/my-studies/[studyId]/tasks          할일
/my-studies/[studyId]/video-call     화상통화
/my-studies/[studyId]/settings       설정 (권한 필요)
```

### URL 충돌 방지 전략

**원칙**: Prefix로 명확히 구분 → 충돌 불가능

```javascript
// 자동 리다이렉트 로직
const handleStudyAccess = async (studyId, userId) => {
  const membership = await checkMembership(studyId, userId)
  
  // 사용자가 /studies/123 접근 시
  if (membership) {
    // 이미 가입됨 → 내 스터디로 리다이렉트
    return redirect(`/my-studies/${studyId}`)
  }
  
  // 사용자가 /my-studies/123 접근 시
  if (!membership) {
    // 미가입 → 탐색 프리뷰로 리다이렉트
    return redirect(`/studies/${studyId}`)
  }
}
```

---

## 📋 기능 및 정보 접근 범위

### 🔍 스터디 탐색 (Search Study)

#### 목적
"내게 맞는 스터디 찾기"

#### 표시 정보
```
✅ 공개 정보 (100%)
├─ 스터디명
├─ 카테고리/태그
├─ 소개글 (전체)
├─ 멤버 수 (12/20명)
├─ 그룹장 이름/프로필
├─ 생성일
├─ 활동 빈도
└─ 공개 설정

⚠️ 제한적 정보 (미리보기)
├─ 최근 공지 2개 (제목 + 100자 미리보기)
├─ 상위 멤버 5명 (이름 + 역할만)
└─ 활동 통계 (요약)

❌ 접근 불가
├─ 채팅 내용 (전체 숨김)
├─ 파일 목록 (전체 숨김)
├─ 캘린더 상세 (전체 숨김)
├─ 할일 목록 (전체 숨김)
└─ 멤버 연락처 (전체 숨김)
```

#### 가능한 액션
```
✅ 할 수 있는 것:
├─ 스터디 검색 (키워드, 카테고리)
├─ 필터링 (정렬, 공개 여부)
├─ 스터디 프리뷰 보기
├─ 가입 신청
└─ 스터디 생성

❌ 할 수 없는 것:
├─ 채팅 참여
├─ 파일 다운로드
├─ 공지 작성
├─ 일정 확인
└─ 모든 쓰기 작업
```

#### UI 특징
```
레이아웃:
├─ 좌측: 카테고리 필터
├─ 중앙: 스터디 카드 그리드 (3-4컬럼)
└─ 우측: 추천 스터디, 인기 카테고리

스터디 카드:
├─ 이모지 아이콘
├─ 스터디명 (2줄 제한)
├─ 멤버 수 배지
├─ 태그 (최대 3개)
└─ [가입하기] 버튼 (Primary, 크게)

프리뷰 페이지:
├─ 상단: 스터디 기본 정보 + [가입하기] 큰 버튼
├─ 중앙: 소개, 공지 미리보기, 규칙
└─ 우측: 멤버 미리보기, 통계
```

---

### 👥 내 스터디 (My Studies)

#### 목적
"참여 중인 스터디에서 활동하기"

#### 표시 정보
```
✅ 전체 접근 (역할에 따라)
├─ 모든 공지 내용
├─ 실시간 채팅
├─ 전체 파일 목록
├─ 캘린더 전체
├─ 할일 전체
├─ 멤버 상세 정보
├─ 통계 대시보드
└─ 설정 (권한에 따라)

🔒 역할별 제한
PENDING (승인 대기):
├─ 읽기만 가능
└─ 채팅/쓰기 불가

MEMBER (일반 멤버):
├─ 전체 읽기/쓰기
└─ 설정/관리 불가

ADMIN (관리자):
├─ 멤버 관리 가능
├─ 공지 고정/삭제
└─ 일부 설정 변경

OWNER (그룹장):
├─ 모든 권한
└─ 스터디 삭제 가능
```

#### 가능한 액션
```
✅ 기본 액션 (모든 멤버):
├─ 채팅 메시지 전송
├─ 공지 읽기
├─ 파일 다운로드
├─ 캘린더 확인
├─ 할일 확인
└─ 화상 통화 참여

✅ 생성 액션 (MEMBER+):
├─ 공지 작성
├─ 파일 업로드
├─ 일정 추가
└─ 할일 추가

✅ 관리 액션 (ADMIN+):
├─ 멤버 강퇴
├─ 역할 변경
├─ 공지 고정/삭제
└─ 일정 수정/삭제

✅ 최고 권한 (OWNER):
├─ 스터디 설정 변경
└─ 스터디 삭제
```

#### UI 특징
```
레이아웃:
├─ 좌측: 글로벌 네비게이션
├─ 중앙: 탭별 메인 콘텐츠 (70%)
└─ 우측: 고정 위젯 (30%)

탭 네비게이션:
├─ [개요] - 대시보드
├─ [채팅] - 실시간 채팅
├─ [공지] - 공지사항 목록
├─ [파일] - 파일 관리
├─ [캘린더] - 일정 관리
├─ [할일] - 할일 목록
├─ [화상통화] - WebRTC
└─ [설정] - 스터디 설정 (권한 필요)

우측 위젯 (모든 탭에서 표시):
├─ 📊 스터디 현황 (D-day, 출석률, 할일)
├─ 👥 온라인 멤버 (실시간)
├─ ⚡ 빠른 액션 (채팅, 화상, 초대)
├─ 📌 고정 공지
├─ ✅ 급한 할일 (D-3 이내)
└─ 📅 다가오는 일정
```

---

## 🔄 사용자 플로우

### Flow 1: 신규 사용자 - 스터디 찾기
```
Step 1: 네비게이션에서 "🔍 스터디 탐색" 클릭
        ↓
Step 2: /studies 페이지 (탐색 화면)
        - 카테고리 필터로 관심 분야 선택
        - 키워드 검색 (예: "알고리즘")
        ↓
Step 3: 스터디 카드 클릭
        ↓ /studies/123
Step 4: 프리뷰 페이지
        - 기본 정보 확인
        - 공지 2개 미리보기
        - 멤버 5명 확인
        - "🔒 전체 기능은 가입 후 이용 가능" 표시
        ↓
Step 5: [가입하기] 버튼 클릭
        - API: POST /api/v1/studies/123/join
        - 성공 Toast: "가입이 완료되었습니다!"
        ↓
Step 6: 자동 리다이렉트 → /my-studies/123
        - 전체 기능 접근 가능
        - 역할 배지 표시: [MEMBER]
        - 8개 탭 활성화
```

### Flow 2: 기존 사용자 - 스터디 활동
```
Step 1: 네비게이션에서 "👥 내 스터디" 클릭
        ↓
Step 2: /my-studies 페이지 (내 스터디 목록)
        - 참여 중인 스터디 4개 표시
        - 역할 배지 표시 (OWNER/ADMIN/MEMBER)
        - 빠른 액션 버튼: [채팅] [공지] [파일]
        ↓
Step 3: "알고리즘 스터디" 카드 클릭
        ↓ /my-studies/123
Step 4: 대시보드 (개요 탭)
        - 최근 활동 요약
        - 공지 3개
        - 파일 3개
        - 다가오는 일정
        ↓
Step 5: [채팅] 탭 클릭
        ↓ /my-studies/123/chat
Step 6: 채팅 화면
        - 실시간 메시지 송수신
        - 우측 위젯: 온라인 멤버 실시간 표시
        ↓
Step 7: [파일] 탭 클릭
        ↓ /my-studies/123/files
Step 8: 파일 업로드
        - 드래그 앤 드롭
        - 파일 목록 실시간 업데이트
```

### Flow 3: 잘못된 접근 - 자동 처리
```
시나리오 A: 가입한 스터디를 탐색 URL로 접근

사용자가 북마크로 /studies/123 접속
        ↓
서버/미들웨어: 가입 여부 확인
        ↓
✅ 이미 가입됨 감지
        ↓
자동 리다이렉트 → /my-studies/123
        ↓
Toast: "이미 참여 중인 스터디입니다"
전체 기능 접근 가능
```

```
시나리오 B: 미가입 스터디를 내 스터디 URL로 접근

사용자가 잘못된 링크로 /my-studies/999 접속
        ↓
서버: 가입 여부 확인
        ↓
❌ 미가입 감지
        ↓
공개 스터디인가?
├─ Yes → 리다이렉트: /studies/999 (프리뷰)
└─ No  → 404 페이지 (비공개 스터디)
```

---

## 🎨 비교 화면 설계

### 스터디 탐색 화면 (`/studies`)

```
┌────────────────────────────────────────────────────────────────┐
│ 🔍 스터디 탐색                         [+ 스터디 만들기]        │
├────────────────────────────────────────────────────────────────┤
│ [전체 ▼] [프로그래밍 ▼] [최신순 ▼]            🔍 [검색창]     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│ │ 📚           │  │ 💼           │  │ 🏃           │         │
│ │ 알고리즘     │  │ 취업 준비    │  │ 운동 루틴    │         │
│ │              │  │              │  │              │         │
│ │ 12/20명      │  │ 8/15명       │  │ 5/10명       │         │
│ │              │  │              │  │              │         │
│ │ [가입하기]   │  │ [가입하기]   │  │ [가입하기]   │         │
│ └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│ │ 📖           │  │ 🎨           │  │ 💡           │         │
│ │ 영어 회화    │  │ 디자인 공부  │  │ 창업 스터디  │         │
│ │              │  │              │  │              │         │
│ │ 15/20명      │  │ 10/10명      │  │ 3/8명        │         │
│ │              │  │ (정원 마감)  │  │              │         │
│ │ [가입하기]   │  │ [대기 중]    │  │ [가입하기]   │         │
│ └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                │
└────────────────────────────────────────────────────────────────┘

특징:
- 중립적 톤 (회색/블루)
- [가입하기] 버튼 강조 (Primary 색상, 크게)
- 멤버 수 배지
- 카드 중심 그리드
- 필터 바 상단 고정
```

### 스터디 프리뷰 화면 (`/studies/123`)

```
┌────────────────────────────────────────────────────────────────┐
│ ← 스터디 탐색으로                                               │
├────────────────────────────────────────────────────────────────┤
│ 📚 알고리즘 마스터 스터디                      [🔍 탐색 중]    │
│ OWNER: 김철수 | 12/20명 | 프로그래밍                          │
│                                                                │
│ [💚 가입하기 - 자동 승인]    ← 큰 버튼                         │
│                                                                │
│ ⚠️ 가입하면 채팅, 파일, 캘린더 등 모든 기능을 이용할 수 있습니다  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ 📝 스터디 소개                                                 │
│ 매일 아침 알고리즘 문제를 풀고 서로의 풀이를 공유하며...       │
│                                                                │
│ 📌 최근 공지 (2개만)                                           │
│ ┌────────────────────────────────────────────────────────┐    │
│ │ 이번 주 일정 안내                                       │    │
│ │ 김철수 · 2시간 전                                       │    │
│ │ 이번 주는 백준 골드 문제로... (2줄만 표시)              │    │
│ │ 🔒 전체 내용은 가입 후 확인                             │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                                │
│ 👥 멤버 미리보기 (5명만)                                       │
│ • 김철수 (OWNER)                                              │
│ • 이영희 (ADMIN)                                              │
│ • 박민수, 최지은, 정소현                                       │
│ ... 외 7명                                                    │
│ 🔒 전체 멤버는 가입 후 확인                                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘

특징:
- [가입하기] 버튼 2곳 (상단 + 하단)
- 제한된 정보 표시 (미리보기)
- 🔒 잠금 아이콘으로 제한 강조
- 가입 유도 메시지
```

---

### 내 스터디 목록 화면 (`/my-studies`)

```
┌────────────────────────────────────────────────────────────────┐
│ 👥 내 스터디                                                   │
├────────────────────────────────────────────────────────────────┤
│ [전체 4] [참여중 3] [관리중 1] [대기중 0]                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌────────────────────────────────────────────────────────┐    │
│ │ 📚 [OWNER] 알고리즘 마스터 스터디                       │    │
│ │ 매일 알고리즘 문제를 풀고...                            │    │
│ │ 👥 12/20명 · 📅 1시간 전 · 💬 새 메시지 5개            │    │
│ │ [채팅] [공지] [파일] [캘린더] [설정]                    │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                                │
│ ┌────────────────────────────────────────────────────────┐    │
│ │ 💼 [MEMBER] 취업 준비 스터디                            │    │
│ │ 함께 이력서와 면접을...                                 │    │
│ │ 👥 8/15명 · 📅 3시간 전                                 │    │
│ │ [채팅] [공지] [파일] [캘린더]                           │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                                │
└────────────────────────────────────────────────────────────────┘

특징:
- 역할 배지 강조 (OWNER/ADMIN/MEMBER)
- 활동 상태 표시 (새 메시지, 마지막 활동)
- 빠른 액션 버튼 (주요 탭 바로가기)
- 탭 필터 (전체/참여중/관리중/대기중)
```

### 내 스터디 대시보드 화면 (`/my-studies/123`)

```
┌────────┬───────────────────────────────────────┬──────────────┐
│        │ ← 내 스터디 목록으로                   │              │
│  Nav   ├───────────────────────────────────────┤              │
│  Bar   │ 📚 알고리즘 마스터 스터디   [OWNER]   │              │
│        │ 12/20명 | 프로그래밍                  │              │
│ 🏠     ├───────────────────────────────────────┤              │
│ 🔍     │ [개요] [채팅] [공지] [파일] [캘린더]  │              │
│ 👥 ←   │ [할일] [화상] [설정]                  │              │
│ 📋     ├───────────────────────────────────────┤  우측 위젯  │
│ 🔔     │                                       │              │
│ 👤     │   메인 콘텐츠 (70%)                   │ 📊 현황      │
│        │                                       │ D-7, 85%     │
│        │   - 최근 활동                         │              │
│        │   - 공지 3개                          │ 👥 온라인 (3)│
│        │   - 파일 3개                          │ • 김철수     │
│        │   - 다가오는 일정                     │ • 이영희     │
│        │                                       │              │
│        │                                       │ ⚡ 빠른액션  │
│        │                                       │ [채팅][화상] │
│        │                                       │              │
│        │                                       │ ✅ 급한할일  │
│        │                                       │ 백준 1234    │
│        │                                       │ (D-2)        │
│        │                                       │              │
└────────┴───────────────────────────────────────┴──────────────┘

특징:
- 8개 탭 네비게이션 (수평)
- 우측 고정 위젯 (30%)
- 실시간 정보 (온라인 멤버, 알림)
- 역할 배지 항상 표시
- 전체 기능 접근 가능
```

---

## 🔧 기술 구현 가이드

### 1. 라우팅 설정

```typescript
// app/studies/page.tsx (스터디 탐색)
export default function StudiesExplorePage() {
  return <StudyExploreView />
}

// app/studies/[studyId]/page.tsx (프리뷰)
export default async function StudyPreviewPage({ params }) {
  const { studyId } = params
  const user = await getServerSession()
  
  // 가입 여부 확인
  if (user) {
    const membership = await checkMembership(studyId, user.id)
    if (membership) {
      // 이미 가입됨 → 내 스터디로 리다이렉트
      redirect(`/my-studies/${studyId}`)
    }
  }
  
  // 미가입 → 프리뷰 표시
  return <StudyPreviewView studyId={studyId} />
}

// app/my-studies/page.tsx (내 스터디 목록)
export default function MyStudiesPage() {
  return <MyStudiesListView />
}

// app/my-studies/[studyId]/page.tsx (대시보드)
export default async function MyStudyDashboardPage({ params }) {
  const { studyId } = params
  const user = await getServerSession()
  
  if (!user) redirect('/sign-in')
  
  // 가입 여부 확인
  const membership = await checkMembership(studyId, user.id)
  if (!membership) {
    // 미가입 → 탐색 프리뷰로 리다이렉트
    redirect(`/studies/${studyId}`)
  }
  
  // 가입됨 → 대시보드 표시
  return <MyStudyDashboardView studyId={studyId} role={membership.role} />
}
```

### 2. 미들웨어 (자동 리다이렉트)

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await getToken({ req: request })
  
  // /studies/[id] 접근 시
  if (pathname.match(/^\/studies\/\d+$/)) {
    if (session) {
      const studyId = pathname.split('/')[2]
      const membership = await checkMembershipAPI(studyId, session.userId)
      
      if (membership) {
        // 가입됨 → /my-studies/[id]로 리다이렉트
        return NextResponse.redirect(new URL(`/my-studies/${studyId}`, request.url))
      }
    }
  }
  
  // /my-studies/[id] 접근 시
  if (pathname.match(/^\/my-studies\/\d+/)) {
    if (!session) {
      // 미로그인 → 로그인 페이지
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
    
    const studyId = pathname.split('/')[2]
    const membership = await checkMembershipAPI(studyId, session.userId)
    
    if (!membership) {
      // 미가입 → /studies/[id]로 리다이렉트
      return NextResponse.redirect(new URL(`/studies/${studyId}`, request.url))
    }
  }
  
  return NextResponse.next()
}
```

### 3. API 엔드포인트

```typescript
// app/api/v1/studies/route.ts (탐색용)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const keyword = searchParams.get('keyword')
  
  // 공개 스터디만 반환
  const studies = await prisma.studyGroup.findMany({
    where: {
      visibility: 'PUBLIC',
      ...(category && { category }),
      ...(keyword && {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } }
        ]
      })
    },
    include: {
      owner: { select: { name: true, imageUrl: true } },
      _count: { select: { members: true } }
    }
  })
  
  return Response.json({ studies })
}

// app/api/v1/studies/[studyId]/preview/route.ts
export async function GET(request: Request, { params }) {
  const { studyId } = params
  
  const study = await prisma.studyGroup.findUnique({
    where: { id: parseInt(studyId) },
    include: {
      owner: { select: { name: true, imageUrl: true } },
      members: {
        take: 5,
        include: {
          user: { select: { name: true, imageUrl: true } }
        }
      },
      notices: {
        take: 2,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          content: true, // 100자만 잘라서 반환
          createdAt: true,
          author: { select: { name: true } }
        }
      },
      _count: { select: { members: true } }
    }
  })
  
  // 민감한 정보 제거
  return Response.json({
    ...study,
    notices: study.notices.map(n => ({
      ...n,
      content: n.content.substring(0, 100) + '...'
    }))
  })
}

// app/api/v1/my-studies/route.ts (내 스터디)
export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const myStudies = await prisma.studyMember.findMany({
    where: { userId: session.user.id },
    include: {
      studyGroup: {
        include: {
          owner: { select: { name: true } },
          _count: { select: { members: true } }
        }
      }
    }
  })
  
  return Response.json({ studies: myStudies })
}

// app/api/v1/my-studies/[studyId]/route.ts
export async function GET(request: Request, { params }) {
  const session = await getServerSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { studyId } = params
  
  // 가입 여부 확인
  const membership = await prisma.studyMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: parseInt(studyId)
      }
    }
  })
  
  if (!membership) {
    return Response.json({ error: 'Not a member' }, { status: 403 })
  }
  
  // 전체 정보 반환
  const study = await prisma.studyGroup.findUnique({
    where: { id: parseInt(studyId) },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, imageUrl: true, email: true } }
        }
      },
      notices: { orderBy: { createdAt: 'desc' } },
      files: { orderBy: { createdAt: 'desc' } },
      events: { orderBy: { startDate: 'asc' } },
      tasks: { orderBy: { createdAt: 'desc' } }
    }
  })
  
  return Response.json({ study, role: membership.role })
}
```

---

## 📊 컴포넌트 구조

```
components/
├── studies/
│   ├── explore/                     # 스터디 탐색용
│   │   ├── StudyExploreHeader.tsx   # 검색바, 필터
│   │   ├── StudyCardGrid.tsx        # 카드 그리드
│   │   ├── StudyCard.tsx            # 개별 카드
│   │   ├── CategoryFilter.tsx       # 카테고리 필터
│   │   ├── StudyPreview.tsx         # 프리뷰 페이지
│   │   └── JoinButton.tsx           # 가입 버튼
│   │
│   └── my-study/                    # 내 스터디용
│       ├── MyStudyList.tsx          # 내 스터디 목록
│       ├── MyStudyCard.tsx          # 내 스터디 카드
│       ├── StudyHeader.tsx          # 스터디 헤더 (역할 배지)
│       ├── StudyTabs.tsx            # 8개 탭 네비게이션
│       ├── StudyDashboard.tsx       # 대시보드
│       ├── ChatRoom.tsx             # 채팅
│       ├── NoticeList.tsx           # 공지
│       ├── FileManager.tsx          # 파일
│       ├── Calendar.tsx             # 캘린더
│       ├── TaskManager.tsx          # 할일
│       ├── VideoCall.tsx            # 화상통화
│       ├── SettingsForm.tsx         # 설정
│       └── widgets/                 # 우측 위젯
│           ├── StatsWidget.tsx
│           ├── OnlineMembersWidget.tsx
│           ├── QuickActionsWidget.tsx
│           ├── UrgentTasksWidget.tsx
│           └── UpcomingEventsWidget.tsx
│
└── common/
    ├── Navigation.tsx               # 좌측 네비게이션
    └── RoleBadge.tsx               # 역할 배지
```

---

## 🎯 UX 최적화 전략

### 1. 명확한 시각적 구분

```css
/* 스터디 탐색 - 중립적 톤 */
.study-explore {
  --primary-color: #6366F1;    /* 블루 */
  --accent-color: #10B981;     /* 그린 (가입 버튼) */
}

/* 내 스터디 - 활성화 톤 */
.my-study {
  --primary-color: #6366F1;    /* 블루 */
  --accent-color: #F59E0B;     /* 오렌지 (알림) */
  --role-owner: #EF4444;       /* 레드 (OWNER) */
  --role-admin: #8B5CF6;       /* 퍼플 (ADMIN) */
  --role-member: #6B7280;      /* 그레이 (MEMBER) */
}
```

### 2. 일관된 아이콘

```
스터디 탐색: 🔍 (돋보기)
내 스터디: 👥 (그룹)
역할:
  - OWNER: 👑
  - ADMIN: ⭐
  - MEMBER: 👤
  - PENDING: ⏳
```

### 3. 컨텍스트 유지

```
스터디 탐색에서 가입 후:
1. "가입이 완료되었습니다!" Toast
2. 자동 리다이렉트 (부드러운 전환)
3. 내 스터디 목록에 새 카드 추가됨
4. 해당 스터디로 자동 진입

브레드크럼:
- /studies → 스터디 탐색
- /studies/123 → 스터디 탐색 > 알고리즘 마스터
- /my-studies → 내 스터디
- /my-studies/123 → 내 스터디 > 알고리즘 마스터 > 개요
```

### 4. 에러 처리

```typescript
// 403 에러 페이지 (권한 없음)
export default function ForbiddenPage() {
  return (
    <div>
      <h1>접근 권한이 없습니다</h1>
      <p>이 스터디의 멤버가 아닙니다.</p>
      <Button onClick={() => router.push('/studies')}>
        스터디 탐색하기
      </Button>
    </div>
  )
}

// 404 에러 페이지 (존재하지 않음)
export default function NotFoundPage() {
  return (
    <div>
      <h1>스터디를 찾을 수 없습니다</h1>
      <p>삭제되었거나 비공개 스터디입니다.</p>
      <Button onClick={() => router.push('/studies')}>
        다른 스터디 찾기
      </Button>
    </div>
  )
}
```

---

## 📈 성능 최적화

### 1. 데이터 로딩 전략

```typescript
// 스터디 탐색: SSR (SEO 최적화)
export async function generateMetadata({ params }): Promise<Metadata> {
  const study = await getStudyPreview(params.studyId)
  return {
    title: study.name,
    description: study.description,
    openGraph: {
      title: study.name,
      description: study.description,
      images: [study.imageUrl]
    }
  }
}

// 내 스터디: CSR (실시간 업데이트)
const { data: myStudies } = useQuery({
  queryKey: ['my-studies'],
  queryFn: fetchMyStudies,
  refetchOnWindowFocus: true,
  staleTime: 1000 * 60 * 2 // 2분
})
```

### 2. 캐싱 전략

```typescript
// React Query 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      cacheTime: 1000 * 60 * 10, // 10분
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

// 탐색 데이터: 5분 캐시
useQuery({
  queryKey: ['studies', 'explore', filters],
  queryFn: () => fetchStudies(filters),
  staleTime: 1000 * 60 * 5
})

// 내 스터디: 실시간 업데이트
useQuery({
  queryKey: ['my-studies', studyId],
  queryFn: () => fetchMyStudy(studyId),
  staleTime: 0, // 항상 최신 데이터
  refetchInterval: 30000 // 30초마다 자동 갱신
})
```

---

## 🧪 테스트 시나리오

### 1. 신규 사용자 테스트

```
[TC-001] 스터디 탐색 및 가입
Given: 로그인된 신규 사용자
When: "스터디 탐색" 클릭 → 카테고리 선택 → 스터디 클릭 → "가입하기" 클릭
Then: 
  - Toast 알림 표시
  - /my-studies/[studyId]로 리다이렉트
  - 역할 배지 [MEMBER] 표시
  - 모든 탭 접근 가능
```

### 2. 잘못된 접근 테스트

```
[TC-002] 가입한 스터디를 탐색 URL로 접근
Given: 이미 가입한 스터디 ID = 123
When: /studies/123 URL 직접 접근
Then:
  - 자동 리다이렉트 → /my-studies/123
  - Toast: "이미 참여 중인 스터디입니다"

[TC-003] 미가입 스터디를 내 스터디 URL로 접근
Given: 미가입 스터디 ID = 999
When: /my-studies/999 URL 직접 접근
Then:
  - 공개 스터디 → 리다이렉트: /studies/999
  - 비공개 스터디 → 404 페이지
```

### 3. 권한 테스트

```
[TC-004] PENDING 사용자 제한
Given: 승인 대기 중인 사용자 (role: PENDING)
When: /my-studies/123/chat 접근
Then:
  - 채팅 입력창 비활성화
  - "승인 대기 중입니다" 메시지 표시
  - 읽기만 가능

[TC-005] MEMBER 권한
Given: 일반 멤버 (role: MEMBER)
When: /my-studies/123/settings 접근
Then:
  - 403 Forbidden 에러
  - "관리자만 접근 가능합니다" 메시지
```

---

## 📋 마이그레이션 체크리스트

### Phase 1: 기반 작업
- [ ] URL 구조 재정의 (`/studies` vs `/my-studies`)
- [ ] 미들웨어 구현 (자동 리다이렉트)
- [ ] API 엔드포인트 분리
- [ ] 데이터베이스 쿼리 최적화

### Phase 2: UI 컴포넌트
- [ ] 스터디 탐색 컴포넌트 분리 (`explore/`)
- [ ] 내 스터디 컴포넌트 분리 (`my-study/`)
- [ ] 역할 배지 컴포넌트
- [ ] 네비게이션 업데이트

### Phase 3: 기능 구현
- [ ] 가입 여부 체크 로직
- [ ] 자동 리다이렉트 로직
- [ ] 권한 체크 시스템
- [ ] 프리뷰 제한 로직

### Phase 4: 테스트 & 배포
- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] E2E 테스트
- [ ] 프로덕션 배포

---

## 💡 결론

**스터디 탐색과 내 스터디를 분리하는 것이 사용자 경험에 최적**입니다.

### 핵심 이점 요약:
1. ✅ **명확한 컨텍스트**: 사용자가 현재 "찾는 중"인지 "활동 중"인지 즉시 인지
2. ✅ **최적화된 UI**: 각 목적에 맞는 인터페이스 제공
3. ✅ **성능 향상**: 필요한 데이터만 로드
4. ✅ **확장성**: 독립적인 기능 추가 용이
5. ✅ **개발 편의성**: 코드 분리로 유지보수 쉬움

### URL 구조:
```
스터디 탐색: /studies/*
내 스터디: /my-studies/*
자동 리다이렉트로 충돌 방지
```

이 설계를 기반으로 개발을 진행하면 사용자에게 직관적이고 혼란 없는 경험을 제공할 수 있습니다! 🚀

