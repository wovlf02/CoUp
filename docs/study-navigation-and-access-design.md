# 스터디 네비게이션 및 접근 제어 종합 설계

> **작성일**: 2025.11.07  
> **목적**: 스터디 탐색과 내 스터디의 네비게이션 및 접근 제어 최종 설계  
> **기반 문서**: 
> - `navigation-study-separation-design.md`
> - `navigation-study-separation-design-SUPPLEMENT.md`
> - `access-control-policy.md`
> - `design-right-sidebar-widgets.md`
> - 전체 화면 설계 문서 17개

---

## 🎯 설계 목표

### 사용자 경험 중심 원칙

1. **명확한 컨텍스트 구분**
   - "지금 내가 스터디를 찾는 중인가?" → 스터디 탐색
   - "내가 속한 스터디에서 활동 중인가?" → 내 스터디

2. **정보 접근의 점진적 공개**
   - 미가입자: 가입 결정에 필요한 정보만
   - 가입자: 모든 기능 전체 접근
   - 역할별: PENDING → MEMBER → ADMIN → OWNER

3. **매끄러운 전환**
   - 탐색 → 가입 → 내 스터디로 자동 이동
   - 미들웨어 레벨에서 자동 리다이렉트
   - Toast 알림으로 상황 설명

---

## 📊 전체 화면 구조 (17개)

### 🔍 스터디 탐색 (5개)

```
/studies                          탐색 목록 (SSR)
/studies/create                   스터디 생성
/studies/[studyId]                프리뷰 (제한적)
/studies/[studyId]/join           가입 플로우
/studies/search                   고급 검색
```

**특징**:
- SSR로 SEO 최적화
- 공개 정보 + 미리보기만 표시
- 큰 [가입하기] 버튼 강조
- FOMO 전략 (제한된 정보로 가입 유도)

---

### 👥 내 스터디 (12개)

```
/my-studies                       내 스터디 목록 (CSR)
/my-studies/[studyId]             대시보드 (개요)
/my-studies/[studyId]/chat        채팅
/my-studies/[studyId]/notices     공지사항
/my-studies/[studyId]/files       파일
/my-studies/[studyId]/calendar    캘린더
/my-studies/[studyId]/tasks       할일
/my-studies/[studyId]/video-call  화상 통화 (MVP 핵심 기능)
/my-studies/[studyId]/settings    설정 (ADMIN+)

# 관리 기능
/my-studies/[studyId]/approvals   승인관리 (ADMIN+)
/my-studies/[studyId]/analytics   분석 (ADMIN+)
/my-studies/[studyId]/members/[userId]  멤버 프로필
```

**특징**:
- CSR로 실시간 업데이트 (WebSocket)
- 전체 정보 접근 (역할별 권한)
- 8개 탭 + 우측 위젯 (280px 고정)
- 모든 탭에 공통 위젯 표시
- **WebRTC 기반 실시간 화상 통화**

---

## 🔐 접근 제어 매트릭스

| 사용자 상태 | 스터디 탐색 | 프리뷰 | 내 스터디 |
|------------|-----------|--------|----------|
| **미로그인** | ✅ 전체 | ✅ 공개정보 | ❌ 로그인 필요 |
| **로그인 (미가입)** | ✅ 전체 | ✅ 공개정보 + 미리보기 | ❌ 가입 필요 |
| **PENDING** | ✅ 전체 | ✅ 리다이렉트 | 🔒 읽기만 |
| **MEMBER** | ✅ 전체 | ✅ 리다이렉트 | ✅ 읽기/쓰기 |
| **ADMIN** | ✅ 전체 | ✅ 리다이렉트 | ✅ 관리 |
| **OWNER** | ✅ 전체 | ✅ 리다이렉트 | ✅ 전체 권한 |

---

## 🔀 자동 리다이렉트 로직

### Case 1: 가입한 스터디를 탐색 URL로 접근

```
사용자: /studies/123 접속 (이미 가입된 스터디)
     ↓
미들웨어: 가입 여부 확인 → MEMBER 발견
     ↓
자동 리다이렉트: /my-studies/123
     ↓
Toast: "이미 참여 중인 스터디입니다"
```

### Case 2: 미가입 스터디를 내 스터디 URL로 접근

```
사용자: /my-studies/999 접속 (미가입 스터디)
     ↓
미들웨어: 가입 여부 확인 → 미가입
     ↓
공개 스터디인가?
├─ Yes → /studies/999 (프리뷰)
└─ No  → 404 (비공개 스터디)
     ↓
Toast: "가입이 필요한 스터디입니다"
```

### Case 3: 탐색에서 가입 후 자동 전환

```
사용자: /studies/123 → [가입하기] 클릭
     ↓
API: POST /api/v1/studies/123/join
     ↓
성공 → 멤버십 생성 (MEMBER 또는 PENDING)
     ↓
자동 리다이렉트: /my-studies/123
     ↓
Toast: "가입이 완료되었습니다!" 또는 "승인을 기다려주세요"
```

---

## 📋 정보 접근 레벨 상세

### Level 1: 공개 정보 (100% 접근)

**누구나 볼 수 있음**:
```javascript
{
  name: "알고리즘 마스터 스터디",
  description: "매일 아침 알고리즘...", // 전체
  category: "프로그래밍",
  subCategory: "알고리즘/코테",
  tags: ["#알고리즘", "#코테", "#매일"], // 전체
  icon: "📚",
  visibility: "PUBLIC",
  autoApproval: true,
  memberCount: 12,
  maxMembers: 20,
  createdAt: "2025-10-01",
  activityLevel: "DAILY",
  owner: {
    name: "김철수",
    imageUrl: "...",
    bio: "백엔드 개발자"
  }
}
```

---

### Level 2: 미리보기 정보 (제한적 접근)

**가입 유도 목적**:
```javascript
{
  // 최근 공지 2개 (제목 + 100자)
  recentNotices: [
    {
      title: "이번 주 일정 안내",
      content: "이번 주는 백준 골드로...", // 100자만
      author: "김철수",
      createdAt: "...",
      isLocked: true // 🔒 전체 내용 잠김
    }
  ],
  
  // 상위 멤버 5명 (이름 + 역할만)
  topMembers: [
    { name: "김철수", role: "OWNER" },
    { name: "이영희", role: "ADMIN" },
    // ... 3명 더
  ],
  hasMoreMembers: true, // "... 외 7명"
  
  // 활동 통계 (요약만)
  activitySummary: {
    totalMessages: "500+", // 정확한 수 숨김
    totalFiles: "20+",
    totalNotices: "10+",
    lastActivity: "2시간 전"
  }
}
```

**UI에 표시**:
- 🔒 잠금 아이콘
- "전체 내용은 가입 후 확인" 메시지
- 그라디언트 페이드 아웃 효과
- "가입하면 이용 가능" 혜택 리스트

---

### Level 3: 완전 차단 (0% 접근)

**절대 볼 수 없음**:
```javascript
// API에서 아예 반환하지 않음
{
  messages: [], // 채팅 전체 숨김
  files: [],    // 파일 전체 숨김
  events: [],   // 캘린더 전체 숨김
  tasks: [],    // 할일 전체 숨김
  members: [
    {
      email: null,      // 연락처 숨김
      phone: null,
      lastSeen: null,   // 온라인 상태 숨김
    }
  ]
}
```

**UI에 표시**:
```
┌────────────────────────────────────────┐
│ 🔒 멤버 전용 콘텐츠                    │
│                                        │
│ 이 정보는 스터디 멤버만 확인 가능      │
│                                        │
│ [가입하고 전체 기능 이용하기 →]        │
└────────────────────────────────────────┘
```

---

## 🎨 레이아웃 설계 (FHD 최적화)

### 3컬럼 레이아웃 (모든 화면 공통)

```
┌────────┬─────────────────────────┬──────────────┐
│  Nav   │   Main Content          │   Widgets    │
│  12%   │        58%              │     30%      │
│ 240px  │      1100px             │    280px     │
└────────┴─────────────────────────┴──────────────┘
```

**비율 선택 이유**:
- **Nav 12%**: 아이콘 + 텍스트 표시 가능
- **Content 58%**: 최대 콘텐츠 표시 (FHD 활용)
- **Widget 30%**: 충분한 위젯 공간 (고정 280px)

---

### 반응형 전략

**Desktop (1920px - FHD)**
```css
.layout {
  grid-template-columns: 240px 1100px 280px;
  gap: 20px;
}
```

**Tablet (1024px)**
```css
.layout {
  grid-template-columns: 60px 1fr 240px;
  /* Nav 아이콘만, Widget 축소 */
}
```

**Mobile (<768px)**
```css
.layout {
  flex-direction: column;
  /* Widget을 하단으로 이동 */
}
```

---

## 🎯 우측 위젯 전략

### 공통 위젯 (모든 탭)

```
1. 📊 스터디 현황 (최상단)
   - D-day 카운트다운
   - 출석률 (프로그레스 바)
   - 할일 완료율
   - 연속 출석 기록

2. 👥 온라인 멤버 (실시간)
   - WebSocket으로 실시간
   - 현재 보는 탭 표시
   - 최대 5명 표시

3. ⚡ 빠른 액션
   - [채팅] [화상] 항상 표시
   - 탭별 맞춤 버튼 추가
```

---

### 탭별 특화 위젯

| 탭 | 추가 위젯 |
|----|---------|
| **개요** | 고정공지 + 급한할일 + 다가오는일정 + 나의활동 |
| **채팅** | 온라인 멤버 확장 + 고정공지 |
| **공지** | 최근 공지 3개 + 급한할일 |
| **파일** | 최근 업로드 3개 + 저장공간 사용량 |
| **캘린더** | 오늘 일정 + 이번 주 일정 상세 |
| **할일** | 할일 완료율 차트 + 멤버별 완료 현황 |

---

## 🔧 기술 구현 가이드

### 1. 미들웨어 (자동 리다이렉트)

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
        // 가입됨 → 내 스터디로
        return NextResponse.redirect(
          new URL(`/my-studies/${studyId}`, request.url)
        )
      }
    }
  }
  
  // /my-studies/[id] 접근 시
  if (pathname.match(/^\/my-studies\/\d+/)) {
    if (!session) {
      // 미로그인 → 로그인 페이지
      return NextResponse.redirect(
        new URL(`/sign-in?redirect=${pathname}`, request.url)
      )
    }
    
    const studyId = pathname.split('/')[2]
    const membership = await checkMembershipAPI(studyId, session.userId)
    
    if (!membership) {
      // 미가입 → 탐색 프리뷰로
      const study = await getStudyVisibility(studyId)
      
      if (study?.visibility === 'PUBLIC') {
        return NextResponse.redirect(
          new URL(`/studies/${studyId}`, request.url)
        )
      } else {
        // 비공개 → 404
        return NextResponse.redirect(
          new URL('/404', request.url)
        )
      }
    }
  }
  
  return NextResponse.next()
}
```

---

### 2. API 레벨 접근 제어

```typescript
// app/api/v1/studies/[studyId]/preview/route.ts
export async function GET(req: Request, { params }) {
  const { studyId } = params
  const session = await getServerSession()
  
  // 가입 여부 확인
  if (session) {
    const membership = await checkMembership(studyId, session.user.id)
    if (membership) {
      // 이미 가입 → 리다이렉트 응답
      return NextResponse.json(
        { redirect: `/my-studies/${studyId}` },
        { status: 307 }
      )
    }
  }
  
  const study = await prisma.studyGroup.findUnique({
    where: { id: parseInt(studyId) },
    include: {
      owner: {
        select: {
          name: true,
          imageUrl: true,
          bio: true // 공개 프로필만
        }
      },
      members: {
        take: 5, // ⚠️ 상위 5명만
        select: {
          user: {
            select: {
              name: true,
              imageUrl: true
              // ❌ email, phone 제외
            }
          },
          role: true
        }
      },
      notices: {
        take: 2, // ⚠️ 최근 2개만
        select: {
          title: true,
          content: true, // 100자로 자름
          createdAt: true,
          author: { select: { name: true } }
        }
      }
      // ❌ chat, files, events, tasks 제외
    }
  })
  
  // 비공개 스터디 404
  if (study.visibility === 'PRIVATE') {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )
  }
  
  // 미리보기 데이터 가공
  return NextResponse.json({
    ...study,
    notices: study.notices.map(n => ({
      ...n,
      content: n.content.substring(0, 100) + '...', // 100자만
      isLocked: true
    }))
  })
}
```

---

### 3. WebSocket 실시간 업데이트

```typescript
// useStudyPresence.ts
export const useStudyPresence = (studyId: string) => {
  const { socket } = useSocket()
  const [onlineMembers, setOnlineMembers] = useState([])
  
  useEffect(() => {
    if (!socket || !studyId) return
    
    // 방 입장
    socket.emit('join_study_presence', { studyId })
    
    // 온라인 멤버 업데이트
    socket.on('presence_update', (data) => {
      setOnlineMembers(data.onlineMembers)
    })
    
    // 현재 탭 브로드캐스트
    socket.emit('update_current_tab', { 
      studyId, 
      tab: window.location.pathname.split('/').pop()
    })
    
    return () => {
      socket.emit('leave_study_presence', { studyId })
      socket.off('presence_update')
    }
  }, [socket, studyId])
  
  return { onlineMembers }
}
```

---

## 🎯 사용자 플로우 시나리오

### 플로우 1: 신규 사용자 - 스터디 찾기 → 가입

```
Step 1: 홈페이지 진입
        ↓
Step 2: 네비게이션에서 "🔍 스터디 탐색" 클릭
        ↓ /studies
        
Step 3: 탐색 화면
        - 카테고리 필터: "프로그래밍" 선택
        - 키워드 검색: "알고리즘"
        - 결과: 15개 스터디 표시
        ↓
        
Step 4: 관심 스터디 카드 클릭
        ↓ /studies/123
        
Step 5: 프리뷰 페이지
        ✅ 볼 수 있는 것:
        - 스터디명, 소개 (전체)
        - 그룹장 정보
        - 멤버 수: 12/20명
        - 최근 공지 2개 (100자만)
        - 멤버 5명 (이름만)
        
        🔒 볼 수 없는 것:
        - "🔒 전체 내용은 가입 후 확인"
        - 채팅, 파일, 캘린더, 할일
        ↓
        
Step 6: [가입하기] 버튼 클릭
        - 미로그인 → 로그인 페이지
        - 로그인 후 자동으로 다시 돌아옴
        ↓
        
Step 7: 가입 완료
        - API: POST /api/v1/studies/123/join
        - 성공 Toast: "가입이 완료되었습니다! 🎉"
        ↓
        
Step 8: 자동 리다이렉트
        ↓ /my-studies/123
        
Step 9: 내 스터디 대시보드
        ✅ 이제 모든 것이 가능:
        - [MEMBER] 역할 배지
        - 8개 탭 전체 접근
        - 채팅, 파일, 공지 전체 보기
        - 우측 위젯 (온라인 멤버 등)
```

---

### 플로우 2: 기존 사용자 - 스터디 활동

```
Step 1: 홈페이지 진입
        ↓
Step 2: 네비게이션에서 "👥 내 스터디" 클릭
        ↓ /my-studies
        
Step 3: 내 스터디 목록
        - 참여 중인 스터디 4개 표시
        - 역할 배지: OWNER / ADMIN / MEMBER
        - 새 메시지, 공지 배지
        ↓
        
Step 4: "알고리즘 마스터" 카드 클릭
        ↓ /my-studies/123
        
Step 5: 대시보드 (개요 탭)
        📊 우측 위젯 표시:
        - 스터디 현황 (D-7, 출석률 85%)
        - 온라인 멤버 3명
        - 빠른 액션
        - 고정 공지
        - 급한 할일 (D-1)
        
        메인 콘텐츠:
        - 이번 주 활동 요약
        - 최근 공지 3개
        - 최근 파일 3개
        - 다가오는 일정
        ↓
        
Step 6: [채팅] 탭 클릭
        ↓ /my-studies/123/chat
        
Step 7: 채팅 화면
        📊 우측 위젯 변경:
        - 스터디 현황 (동일)
        - 온라인 멤버 확장 (실시간 "채팅 중")
        - 빠른 액션
        - 고정 공지
        
        메인 콘텐츠:
        - 실시간 채팅 (WebSocket)
        - 입력 중... 표시
        - 파일 드래그&드롭
        ↓
        
Step 8: [파일] 탭 클릭
        ↓ /my-studies/123/files
        
Step 9: 파일 화면
        📊 우측 위젯 변경:
        - 스터디 현황
        - 온라인 멤버
        - 빠른 액션
        - 최근 파일 3개 ← 탭 특화
        - 저장공간 사용량 ← 탭 특화
        
        메인 콘텐츠:
        - 폴더 구조
        - 파일 목록
        - 드래그&드롭 업로드
```

---

### 플로우 3: 잘못된 접근 - 자동 처리

**시나리오 A: 가입한 스터디를 탐색 URL로**

```
사용자: 북마크에서 /studies/123 접속
        ↓
미들웨어: 가입 여부 체크
        → MEMBER 발견
        ↓
자동 리다이렉트: /my-studies/123
        ↓
Toast: "이미 참여 중인 스터디입니다"
        ↓
내 스터디 대시보드 표시
```

**시나리오 B: 미가입 스터디를 내 스터디 URL로**

```
사용자: 잘못된 링크로 /my-studies/999 접속
        ↓
미들웨어: 가입 여부 체크
        → 미가입
        ↓
스터디 공개 여부 확인
        ↓
PUBLIC 스터디:
  → 리다이렉트: /studies/999
  → Toast: "가입이 필요한 스터디입니다"
  → 프리뷰 표시
  
PRIVATE 스터디:
  → 404 페이지
  → "존재하지 않는 스터디입니다"
```

---

## 📊 역할별 권한 매트릭스

| 기능 | PENDING | MEMBER | ADMIN | OWNER |
|------|---------|--------|-------|-------|
| **읽기** | | | | |
| 공지 읽기 | ✅ | ✅ | ✅ | ✅ |
| 파일 다운로드 | ❌ | ✅ | ✅ | ✅ |
| 캘린더 보기 | ✅ | ✅ | ✅ | ✅ |
| 할일 보기 | ✅ | ✅ | ✅ | ✅ |
| 채팅 읽기 | ✅ | ✅ | ✅ | ✅ |
| **쓰기** | | | | |
| 채팅 메시지 | ❌ | ✅ | ✅ | ✅ |
| 공지 작성 | ❌ | ✅ | ✅ | ✅ |
| 파일 업로드 | ❌ | ✅ | ✅ | ✅ |
| 일정 추가 | ❌ | ✅ | ✅ | ✅ |
| 할일 추가 | ❌ | ✅ | ✅ | ✅ |
| **관리** | | | | |
| 공지 고정/삭제 | ❌ | ❌ | ✅ | ✅ |
| 멤버 권한 변경 | ❌ | ❌ | ✅ | ✅ |
| 멤버 강퇴 | ❌ | ❌ | ✅ | ✅ |
| 스터디 설정 | ❌ | ❌ | 🔸 일부 | ✅ |
| 스터디 삭제 | ❌ | ❌ | ❌ | ✅ |

**범례**:
- ✅ 가능
- ❌ 불가
- 🔸 제한적 가능

---

## 🎨 UI/UX 일관성 가이드

### 색상 시스템

```css
/* 모드별 색상 */
--explore-primary: #6366F1;     /* 탐색 모드 (블루) */
--my-study-primary: #6366F1;    /* 내 스터디 (동일) */

/* 역할 배지 */
--role-owner: #EF4444;          /* 빨강 */
--role-admin: #8B5CF6;          /* 보라 */
--role-member: #6B7280;         /* 회색 */
--role-pending: #F59E0B;        /* 주황 */

/* 상태 색상 */
--success: #10B981;             /* 초록 */
--warning: #F59E0B;             /* 주황 */
--error: #EF4444;               /* 빨강 */
--info: #3B82F6;                /* 파랑 */
```

---

### 아이콘 시스템

```
탐색 모드:
🔍 스터디 탐색
➕ 스터디 만들기
📚 카테고리
🔥 인기 스터디

내 스터디 모드:
👥 내 스터디
📊 대시보드
💬 채팅
📢 공지
📁 파일
📅 캘린더
✅ 할일
📹 화상
⚙️ 설정

역할:
👑 OWNER
⭐ ADMIN
👤 MEMBER
⏳ PENDING
```

---

### 타이포그래피

```css
/* 제목 */
h1 { font-size: 32px; font-weight: 700; }  /* 페이지 제목 */
h2 { font-size: 24px; font-weight: 700; }  /* 섹션 제목 */
h3 { font-size: 18px; font-weight: 600; }  /* 카드 제목 */

/* 본문 */
body { font-size: 16px; line-height: 1.6; }
small { font-size: 14px; }
label { font-size: 14px; font-weight: 600; }

/* 위젯 */
.widget-title { font-size: 14px; font-weight: 700; }
.widget-content { font-size: 13px; }
```

---

## ✅ 구현 우선순위

### Phase 1: 핵심 인프라 (1주)

- [ ] 미들웨어 (자동 리다이렉트)
- [ ] API 레벨 접근 제어
- [ ] 역할 기반 권한 시스템
- [ ] WebSocket 연결

### Phase 2: 스터디 탐색 (1주)

- [ ] 탐색 목록 (/studies)
- [ ] 스터디 생성 (/studies/create)
- [ ] 프리뷰 페이지 (/studies/[id])
- [ ] 가입 API

### Phase 3: 내 스터디 기본 (2주)

- [ ] 내 스터디 목록
- [ ] 대시보드 (개요)
- [ ] 채팅
- [ ] 공지사항
- [ ] 우측 위젯 (공통)

### Phase 4: 내 스터디 확장 (2주)

- [ ] 파일 관리
- [ ] 캘린더
- [ ] 할일 관리
- [ ] 우측 위젯 (탭별 특화)

### Phase 5: 관리 기능 (1주)

- [ ] 설정 (ADMIN+)
- [ ] 승인 관리
- [ ] 멤버 프로필
- [ ] 분석 대시보드

### Phase 6: 최적화 (1주)

- [ ] 성능 최적화
- [ ] SEO 최적화
- [ ] 반응형 테스트
- [ ] 접근성 개선

---

## 🎯 성공 지표

### 사용자 경험 지표

1. **탐색 → 가입 전환율**: 30% 이상
   - 측정: (가입 수 / 프리뷰 조회 수) × 100

2. **탭 전환 횟수**: 50% 감소
   - 우측 위젯으로 필요 정보 즉시 확인

3. **가입 후 1주 유지율**: 70% 이상
   - 온보딩으로 빠른 적응 지원

4. **멤버 활동률**: 80% 이상
   - 실시간 알림으로 놓치지 않음

---

### 기술 성능 지표

1. **페이지 로드 시간**: 2초 이내
   - SSR로 초기 로딩 최적화

2. **WebSocket 연결 성공률**: 99% 이상
   - 실시간 기능 안정성

3. **API 응답 시간**: 200ms 이내
   - 캐싱 전략으로 최적화

4. **Lighthouse 점수**: 90점 이상
   - 성능, 접근성, SEO 모두

---

## 🔒 보안 고려사항

### 1. 접근 제어

```typescript
// 모든 보호된 라우트에 적용
const checkAccess = async (studyId, userId, requiredRole) => {
  const membership = await getMembership(studyId, userId)
  
  if (!membership) {
    throw new Error('NOT_MEMBER')
  }
  
  if (roleHierarchy[membership.role] < roleHierarchy[requiredRole]) {
    throw new Error('INSUFFICIENT_PERMISSION')
  }
  
  if (membership.status === 'KICKED') {
    throw new Error('BANNED')
  }
  
  return membership
}
```

---

### 2. 데이터 필터링

```typescript
// 항상 역할에 따라 필터링
const filterDataByRole = (data, role) => {
  if (role === 'PENDING') {
    return {
      ...data,
      chat: null,        // 채팅 숨김
      files: null,       // 파일 숨김
      members: data.members.map(m => ({
        name: m.name,
        role: m.role,
        // email, phone 제거
      }))
    }
  }
  
  // MEMBER+는 전체 접근
  return data
}
```

---

### 3. Rate Limiting

```typescript
// 가입 신청 제한
const rateLimits = {
  'join_study': { max: 5, window: '1h' },     // 1시간 5회
  'create_study': { max: 3, window: '1d' },   // 1일 3회
  'send_message': { max: 100, window: '1h' }, // 1시간 100회
}
```

---

## 📱 모바일 최적화

### 화면 크기별 전략

**Mobile (<768px)**
```
전체 너비 사용
위젯을 하단으로 이동
탭을 드롭다운으로
버튼 전체 너비
```

**Tablet (768-1023px)**
```
2컬럼 레이아웃 유지
네비게이션 축소 (아이콘만)
위젯 축소 (240px)
```

**Desktop (1024px+)**
```
3컬럼 레이아웃
모든 기능 표시
최적의 UX
```

---

## 🎓 결론

### 핵심 성공 요인

1. **명확한 컨텍스트 구분**
   - 탐색 vs 내 스터디
   - URL만 봐도 현재 상태 파악

2. **정보 접근의 점진적 공개**
   - 미가입자: FOMO로 가입 유도
   - 가입자: 전체 기능 즉시 접근
   - 역할별: 명확한 권한 구분

3. **매끄러운 사용자 경험**
   - 자동 리다이렉트
   - 실시간 업데이트
   - 우측 위젯으로 컨텍스트 유지

4. **확장 가능한 구조**
   - 역할 추가 용이
   - 기능 추가 용이
   - 유지보수 편의성

---

**이 설계를 기반으로 개발하면 사용자에게 직관적이고 혼란 없는 경험을 제공할 수 있습니다!** 🚀
