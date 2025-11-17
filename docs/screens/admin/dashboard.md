# 17. 관리자 대시보드 (Admin Dashboard)

> **화면 ID**: `ADMIN-01`  
> **라우트**: `/admin`  
> **레이아웃**: 2컬럼 레이아웃 (좌측 네비 + 메인 콘텐츠)  
> **구조**: 좌측 Admin Nav(240px 고정) + 메인 콘텐츠(flex-1, 최소 600px)  
> **렌더링**: CSR (관리자 전용, 실시간 데이터)  
> **권한**: SYSTEM_ADMIN  
> **색상**: 차분한 파란색 계열 (프로페셔널 테마)

**참고**: 우측 위젯은 제거하고 메인 콘텐츠에 통합. 네비게이션은 좌측 하나만 유지.

---

## 📐 개선된 레이아웃 (2컬럼)

```
┌────────────┬──────────────────────────────────────────────────────────────┐
│  Admin Nav │              Main Content (전체 나머지 공간)                  │
│  (240px)   │                                                              │
│            │                                                              │
│            │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ 📊 대시보드 │  ┃  관리자 대시보드                        [새로고침] ┃ │
│ 👥 사용자  │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│ 📚 스터디  │                                                              │
│ ⚠️ 신고   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐    │
│ 📈 통계   │  │전체 사용자│ │활성 스터디│ │ 신규 가입 │ │  신고 건수  │    │
│ ⚙️ 설정   │  │  1,234   │ │   156    │ │    45    │ │    12     │    │
│           │  │ +12(1주) │ │ +8(1주)  │ │  오늘    │ │   미처리   │    │
│           │  └──────────┘ └──────────┘ └──────────┘ └────────────┘    │
│           │                                                              │
│ ━━━━━━━━━ │  ┌──────────────────────────────────────────────────────┐  │
│           │  │  사용자 증가 추이 (지난 30일)        [주간][월간][연간]│  │
│ 🏠 메인으로│  │                                                      │  │
│ 🚪 로그아웃│  │       📈 라인 차트 (파란색 계열)                      │  │
│           │  │                                                      │  │
│  240px    │  └──────────────────────────────────────────────────────┘  │
│  고정     │                                                              │
│           │  ┌─────────────────────┐ ┌────────────────────────────┐   │
│           │  │ 최근 신고 내역  [더보기]│ │실시간 현황        [상세]  │   │
│           │  │                     │ │                            │   │
│           │  │ ⚠️ [스팸] 코딩테스트 │ │ 활성 사용자: 1,234명       │   │
│           │  │   신고자: 김철수     │ │ 오늘 신규 가입: 45명       │   │
│           │  │   2시간 전 · 미처리  │ │ 진행중 스터디: 156개       │   │
│           │  │   [처리하기]        │ │ 미처리 신고: 12건          │   │
│           │  │                     │ │                            │   │
│           │  │ ⚠️ [욕설] 취업 준비  │ │ 🟢 시스템 정상 운영        │   │
│           │  │   신고자: 이영희     │ │ CPU: 45% | MEM: 62%       │   │
│           │  │   5시간 전 · 미처리  │ │                            │   │
│           │  └─────────────────────┘ └────────────────────────────┘   │
│           │  │ 스터디 활동 현황 (주간)                    │  │            │
│           │  │                                            │  │  30%      │
│           │  │       📊 바 차트 (카테고리별)              │  │            │
│           │  │                                            │  │            │
│           │  └────────────────────────────────────────────┘  │            │
│           │                                                    │            │
│           │                   58%                              │    30%     │
└────────────┴────────────────────────────────────────────────────┴──────────────┘
```

---

## 🎨 섹션별 상세 설계

### 1. 관리자 전용 네비게이션 (좌측, 12%)

```
┌─────────────────────┐
│                     │
│  🔴 CoUp Admin      │  ← 레드 로고 (관리자 강조)
│                     │
├─────────────────────┤
│                     │
│ 📊 대시보드          │  ← 현재 활성화 (빨간색)
│ 👥 사용자 관리       │
│ 📚 스터디 관리       │
│ ⚠️ 신고 관리        │
│ 📈 통계 분석         │
│ ⚙️ 시스템 설정      │
│                     │
├─────────────────────┤
│                     │
│ 🏠 메인으로          │  ← 일반 사용자 화면으로
│ 🚪 로그아웃         │
│                     │
└─────────────────────┘
```

**디자인 차별화**:
- 로고: "CoUp Admin" (빨간색 #EF4444)
- 활성 메뉴: 빨간색 배경 (#FEE2E2)
- 일반 사용자 네비게이션과 완전 분리
- "메인으로" 버튼 → 일반 대시보드로 이동

**CSS (비율 기반)**:
```css
.adminNav {
  width: 12%; /* 반응형 비율 */
  min-width: 200px; /* 최소 너비 보장 */
  max-width: 280px; /* 최대 너비 제한 */
  background: #1F2937; /* Dark Gray */
  border-right: 2px solid #EF4444; /* Red Border */
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .adminNav {
    width: 60px; /* 태블릿: 아이콘만 */
    min-width: 60px;
  }
  
  .adminNavText {
    display: none; /* 텍스트 숨김 */
  }
}

@media (max-width: 768px) {
  .adminNav {
    width: 100%; /* 모바일: 전체 너비 */
    height: auto;
    position: relative;
  }
}

.adminNavItem.active {
  background: #FEE2E2;
  color: #EF4444;
  border-left: 4px solid #EF4444;
}
```

---

### 2. 통계 카드 (4개, 상단)

```
┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ 👥 전체 사용자 │  │ 📚 활성 스터디 │  │ ✨ 신규 가입  │  │ ⚠️ 신고 건수 │
│               │  │               │  │               │  │               │
│    1,234      │  │     156       │  │      45       │  │      12       │
│   (text-4xl)  │  │   (text-4xl)  │  │   (text-4xl)  │  │   (text-4xl)  │
│               │  │               │  │               │  │               │
│ 🔺 +12 (1주)  │  │ 🔺 +8 (1주)   │  │   오늘        │  │   미처리      │
│  (text-green) │  │  (text-green) │  │  (text-blue)  │  │  (text-red)   │
└───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘
```

**카드 구조**:
- 아이콘 (text-2xl)
- 레이블 (text-sm, text-gray-600)
- 메인 숫자 (text-4xl, font-bold)
- 증감 표시 (text-sm, 화살표 + 숫자)

**증감 표시 규칙**:
- 증가: 🔺 +12 (초록색)
- 감소: 🔻 -5 (빨간색)
- 변화 없음: ➖ 0 (회색)

**CSS**:
```css
.statCard {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s;
}

.statCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.statNumber {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin: 8px 0;
}

.statChange.increase {
  color: #10B981;
}

.statChange.decrease {
  color: #EF4444;
}
```

---

### 3. 사용자 증가 추이 차트

```
┌────────────────────────────────────────────────────────────┐
│ 사용자 증가 추이 (지난 30일)           [주간▼] [월간▼] [연간▼] │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                         •             │  │
│  │                                •       /              │  │
│  │                       •       /       /               │  │
│  │              •       /       /       /                │  │
│  │     •       /       /       /       /                 │  │
│  │    /       /       /       /       /                  │  │
│  │───────────────────────────────────────────────────    │  │
│  │   11/1   11/8  11/15  11/22  11/29                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ━━ 신규 가입 (파란색)    ━━ 활성 사용자 (초록색)           │
│  ━━ 탈퇴 사용자 (빨간색)                                   │
└────────────────────────────────────────────────────────────┘
```

**기능**:
- 3가지 라인: 신규 가입, 활성 사용자, 탈퇴
- 기간 선택: 주간(7일), 월간(30일), 연간(365일)
- 툴팁: 특정 날짜 호버 시 상세 수치 표시
- 범례: 하단에 색상별 설명

**라이브러리**: Recharts 또는 Chart.js

**코드 예시**:
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const data = [
  { date: '11/1', newUsers: 12, activeUsers: 1180, churnedUsers: 3 },
  { date: '11/8', newUsers: 18, activeUsers: 1195, churnedUsers: 5 },
  // ...
]

<LineChart width={1000} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="newUsers" stroke="#3B82F6" name="신규 가입" />
  <Line type="monotone" dataKey="activeUsers" stroke="#10B981" name="활성 사용자" />
  <Line type="monotone" dataKey="churnedUsers" stroke="#EF4444" name="탈퇴" />
</LineChart>
```

---

### 4. 최근 신고 내역 (좌측 하단)

```
┌────────────────────────────────────┐
│ 최근 신고 내역             [더보기] │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ⚠️ [스팸] 코딩테스트 스터디    │ │
│ │                                │ │
│ │ 신고자: 김철수 (kim@...)       │ │
│ │ 신고 사유: 광고성 게시물 반복   │ │
│ │ 2시간 전 · 미처리              │ │
│ │                                │ │
│ │ [🔍 상세보기] [✅ 처리하기]    │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ⚠️ [욕설] 취업 준비 스터디     │ │
│ │                                │ │
│ │ 신고자: 이영희 (lee@...)       │ │
│ │ 신고 사유: 부적절한 언어 사용   │ │
│ │ 5시간 전 · 미처리              │ │
│ │                                │ │
│ │ [🔍 상세보기] [✅ 처리하기]    │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ✅ [기타] 디자인 스터디        │ │
│ │                                │ │
│ │ 신고자: 박민수                 │ │
│ │ 처리자: admin@coup.com         │ │
│ │ 1일 전 · 처리 완료 (경고 발송) │ │
│ │                                │ │
│ │ [🔍 상세보기]                  │ │
│ └────────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

**신고 카드 구성**:
- 신고 유형 배지: [스팸] [욕설] [기타]
- 신고 대상: 스터디명 또는 사용자명
- 신고자 정보
- 신고 사유 (1줄 요약)
- 시간 + 상태
- 액션 버튼 (미처리만 "처리하기" 표시)

**신고 유형 색상**:
- 스팸: #FCA5A5 (빨간색)
- 욕설: #FDBA74 (오렌지)
- 부적절: #FCD34D (노란색)
- 저작권: #A78BFA (보라색)
- 기타: #9CA3AF (회색)

**인터랙션**:
1. **상세보기**: 신고 상세 내용, 증거 자료 확인
2. **처리하기**: 드롭다운 → 경고 / 계정 정지 / 콘텐츠 삭제 / 기각

---

### 5. 최근 가입 사용자 (우측 하단)

```
┌────────────────────────────────────┐
│ 최근 가입 사용자           [더보기] │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 👤 김철수                       │ │
│ │                                │ │
│ │ kim@example.com                │ │
│ │ 🔵 Google 계정                 │ │
│ │ 5분 전                         │ │
│ │                                │ │
│ │ [👁️ 상세보기]                  │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 👤 이영희                       │ │
│ │                                │ │
│ │ lee@example.com                │ │
│ │ 🐙 GitHub 계정                 │ │
│ │ 1시간 전                       │ │
│ │                                │ │
│ │ [👁️ 상세보기]                  │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 👤 박민수                       │ │
│ │                                │ │
│ │ park@example.com               │ │
│ │ 📧 이메일 계정                 │ │
│ │ 3시간 전                       │ │
│ │                                │ │
│ │ [👁️ 상세보기]                  │ │
│ └────────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

**사용자 카드 구성**:
- 프로필 이미지 (또는 이니셜)
- 사용자명
- 이메일
- 가입 방법 아이콘 (Google, GitHub, Email)
- 가입 시간 (상대 시간)
- 상세보기 버튼

---

### 6. 스터디 활동 현황 (바 차트)

```
┌────────────────────────────────────────────────────────────┐
│ 스터디 활동 현황 (주간)                          [카테고리별▼] │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  프로그래밍  ████████████████████████ 45개           │  │
│  │                                                      │  │
│  │  취업 준비   ████████████████ 28개                   │  │
│  │                                                      │  │
│  │  자격증     ████████████ 20개                        │  │
│  │                                                      │  │
│  │  어학       ████████ 15개                            │  │
│  │                                                      │  │
│  │  운동       ████ 8개                                 │  │
│  │                                                      │  │
│  │  기타       ██ 5개                                   │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**기능**:
- 카테고리별 활성 스터디 수
- 색상: 카테고리마다 다른 색상
- 클릭 시: 해당 카테고리 스터디 목록으로 이동

---

### 7. 우측 위젯 (30%)

**CSS (비율 기반)**:
```css
.rightWidget {
  width: 30%; /* 반응형 비율 */
  min-width: 250px; /* 최소 너비 */
  max-width: 350px; /* 최대 너비 */
  padding: 20px;
}

@media (max-width: 1280px) {
  .rightWidget {
    width: 100%; /* 작은 화면: 하단으로 */
    max-width: 100%;
    margin-top: 20px;
  }
}
```

#### 7.1 실시간 현황

```
┌──────────────────┐
│ 📊 실시간 현황   │
├──────────────────┤
│                  │
│ 활성 사용자       │
│   1,234명        │
│  (text-3xl)      │
│                  │
│ 오늘 신규 가입    │
│    45명          │
│  (text-2xl)      │
│                  │
│ 진행중 스터디     │
│    156개         │
│  (text-2xl)      │
│                  │
└──────────────────┘
```

**자동 갱신**: 30초마다 WebSocket으로 업데이트

---

#### 7.2 긴급 신고

```
┌──────────────────┐
│ ⚠️ 긴급 신고     │
├──────────────────┤
│                  │
│ 🔴 스팸 신고      │
│      2건         │
│                  │
│ 🟠 욕설 신고      │
│      1건         │
│                  │
│ 🟡 부적절 콘텐츠  │
│      0건         │
│                  │
│ [전체 보기 →]    │
│                  │
└──────────────────┘
```

**우선순위**:
- 🔴 스팸: 최우선
- 🟠 욕설/비방: 높음
- 🟡 부적절: 중간
- 🟢 기타: 낮음

---

#### 7.3 시스템 상태

```
┌──────────────────┐
│ 📊 시스템 상태   │
├──────────────────┤
│                  │
│ 🟢 정상 운영     │
│                  │
│ ━━━━━━━━━━━━━━  │
│                  │
│ CPU 사용률       │
│  45%             │
│ ████████░░░░     │
│                  │
│ 메모리 사용량     │
│  62%             │
│ ████████████░░   │
│                  │
│ 디스크 사용량     │
│  38%             │
│ ██████░░░░░░░░   │
│                  │
│ [상세 보기]      │
│                  │
└──────────────────┘
```

**상태 색상**:
- 🟢 정상 (0-70%)
- 🟡 주의 (70-85%)
- 🔴 경고 (85% 이상)

---

## 🔐 권한 및 보안

### 1. 접근 제어

```javascript
// middleware.js
export async function middleware(request) {
  const { pathname } = request.nextUrl
  
  if (pathname.startsWith('/admin')) {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (user.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
  }
  
  return NextResponse.next()
}
```

### 2. 역할 구조

```javascript
enum UserRole {
  USER = 'USER',                 // 일반 사용자
  STUDY_ADMIN = 'STUDY_ADMIN',   // 스터디 그룹장 (스터디 내 권한)
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'  // 시스템 관리자 (전체 권한)
}
```

### 3. 감사 로그

모든 관리자 액션은 자동으로 로그 기록:
```javascript
{
  adminId: 1,
  action: 'USER_SUSPENDED',
  targetType: 'USER',
  targetId: 123,
  reason: '스팸 신고 누적 3회',
  timestamp: '2025-11-17T10:30:00Z'
}
```

---

## 📱 반응형 설계

### Desktop (1920px+)
```
┌─────────┬────────────────────────┬──────────┐
│ Nav 12% │ Content 58%            │ Widget 30%│
└─────────┴────────────────────────┴──────────┘
```

### Tablet (1024-1919px)
```
┌─────────┬──────────────────────────────────┐
│ Nav 15% │ Content 85%                      │
│         │ (위젯을 하단으로 이동)             │
└─────────┴──────────────────────────────────┘
```

### Mobile (<1024px)
```
┌──────────────────────────────────┐
│ ☰ 햄버거 메뉴                     │
├──────────────────────────────────┤
│ Content (Full Width)             │
│                                  │
│ (모든 요소 수직 배치)              │
└──────────────────────────────────┘
```

---

## 🎯 인터랙션 가이드

### 1. 통계 카드 클릭
- 전체 사용자 클릭 → `/admin/users`
- 활성 스터디 클릭 → `/admin/studies?filter=active`
- 신규 가입 클릭 → `/admin/users?sort=latest`
- 신고 건수 클릭 → `/admin/reports?status=pending`

### 2. 차트 인터랙션
- 특정 날짜 호버: 툴팁으로 상세 수치
- 범례 클릭: 해당 라인 show/hide
- 기간 선택: 드롭다운으로 주간/월간/연간 전환

### 3. 신고 처리 플로우
```
[처리하기] 클릭
  ↓
드롭다운 메뉴
  ├─ ⚠️ 경고 발송
  ├─ 🚫 계정 정지 (7일/30일/영구)
  ├─ 🗑️ 콘텐츠 삭제
  └─ ✅ 신고 기각
  ↓
확인 모달
  ↓
API 호출
  ↓
성공 Toast + 목록 새로고침
```

### 4. 새로고침
- 페이지 새로고침: 전체 데이터 갱신
- 자동 갱신: 30초마다 실시간 현황만 업데이트

---

## 📊 데이터 구조

### API 엔드포인트

```javascript
// GET /api/v1/admin/dashboard
{
  stats: {
    totalUsers: 1234,
    totalUsersChange: 12,
    activeStudies: 156,
    activeStudiesChange: 8,
    newSignups: 45,
    pendingReports: 12
  },
  
  userGrowth: [
    { date: '2025-11-01', newUsers: 12, activeUsers: 1180, churned: 3 },
    // ...
  ],
  
  recentReports: [
    {
      id: 1,
      type: 'SPAM',
      targetType: 'STUDY',
      targetId: 123,
      targetName: '코딩테스트 스터디',
      reporterName: '김철수',
      reporterEmail: 'kim@...',
      reason: '광고성 게시물 반복',
      createdAt: '2025-11-17T08:30:00Z',
      status: 'PENDING'
    },
    // ...
  ],
  
  recentUsers: [
    {
      id: 456,
      name: '김철수',
      email: 'kim@example.com',
      imageUrl: '...',
      provider: 'GOOGLE',
      createdAt: '2025-11-17T09:55:00Z'
    },
    // ...
  ],
  
  studyActivities: [
    { category: 'PROGRAMMING', count: 45 },
    { category: 'JOB_PREP', count: 28 },
    // ...
  ],
  
  systemStatus: {
    status: 'HEALTHY',
    cpu: 45,
    memory: 62,
    disk: 38
  }
}
```

---

## 🎨 CSS 스타일 가이드

```css
/* 관리자 테마 색상 */
:root {
  --admin-primary: #EF4444;      /* Red */
  --admin-primary-light: #FEE2E2;
  --admin-primary-dark: #DC2626;
  
  --admin-warning: #F59E0B;      /* Orange */
  --admin-danger: #EF4444;       /* Red */
  --admin-success: #10B981;      /* Green */
}

/* 관리자 네비게이션 */
.adminNav {
  background: #1F2937;
  border-right: 2px solid var(--admin-primary);
}

.adminNavItem {
  color: #9CA3AF;
  padding: 12px 20px;
  transition: all 0.2s;
}

.adminNavItem:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--admin-primary);
}

.adminNavItem.active {
  background: var(--admin-primary-light);
  color: var(--admin-primary);
  border-left: 4px solid var(--admin-primary);
}

/* 통계 카드 */
.statCard {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.statCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  border-color: var(--admin-primary);
}

/* 신고 카드 */
.reportCard {
  background: white;
  border: 1px solid #E5E7EB;
  border-left: 4px solid var(--admin-warning);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.reportCard.pending {
  border-left-color: var(--admin-danger);
}

.reportCard.resolved {
  border-left-color: var(--admin-success);
  opacity: 0.7;
}

/* 위젯 */
.adminWidget {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.adminWidget h3 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}
```

---

## ✅ 구현 체크리스트

### Phase 1: 기본 레이아웃
- [ ] 관리자 전용 네비게이션 (레드 테마)
- [ ] 3컬럼 레이아웃 (Nav + Content + Widget)
- [ ] 권한 체크 미들웨어
- [ ] 일반 사용자 화면 분리

### Phase 2: 통계 카드
- [ ] 4개 통계 카드 컴포넌트
- [ ] 실시간 데이터 연동
- [ ] 증감 표시 로직
- [ ] 카드 클릭 시 상세 페이지 이동

### Phase 3: 차트
- [ ] 사용자 증가 라인 차트
- [ ] 기간 선택 필터 (주간/월간/연간)
- [ ] 스터디 활동 바 차트
- [ ] 툴팁 및 범례

### Phase 4: 신고 관리
- [ ] 최근 신고 목록
- [ ] 신고 처리 드롭다운
- [ ] 신고 상세 모달
- [ ] 처리 완료 로그

### Phase 5: 사용자 목록
- [ ] 최근 가입 사용자 목록
- [ ] 사용자 상세 모달
- [ ] 프로필 이미지 표시

### Phase 6: 우측 위젯
- [ ] 실시간 현황 (WebSocket)
- [ ] 긴급 신고 위젯
- [ ] 시스템 상태 위젯
- [ ] 자동 갱신 (30초)

### Phase 7: 반응형
- [ ] Desktop 최적화
- [ ] Tablet 레이아웃
- [ ] Mobile 레이아웃

---

**다음 화면**: `18_admin-users.md` (사용자 관리)
