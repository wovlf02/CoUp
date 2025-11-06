# 내 스터디 목록 (My Studies List)

> **화면 ID**: `MY-STUDY-01`  
> **라우트**: `/my-studies`  
> **목적**: 참여 중인 스터디 목록 및 관리  
> **사용자 상태**: 가입 완료 (PENDING/MEMBER/ADMIN/OWNER)  
> **렌더링**: CSR (실시간 업데이트)

---

## ? 화면 목적

**"내가 속한 스터디에서 활동하기"**
- 참여 중인 모든 스터디를 한눈에 확인
- 역할별로 구분하여 관리
- 빠른 액션으로 주요 기능 접근
- 실시간 알림으로 놓치지 않는 활동

---

## ? 레이아웃 구조 (FHD 최적화)

```
┌─────┬─────────────────────────────────────────────────────┬──────────────────┐
│     │ ? 내 스터디                    [+ 스터디 만들기]    │                  │
│ Nav ├─────────────────────────────────────────────────────┤  활동 요약       │
│ 12% │ [전체 4] [참여중 3] [관리중 1] [대기중 0]            │  (280px)         │
│     ├─────────────────────────────────────────────────────┤                  │
│     │                                                     │  ? 나의 활동    │
│     │ ┌─────────────────────────────────────────────────┐ │  참여: 4개       │
│     │ │ ? [OWNER] 알고리즘 마스터 스터디                │ │  관리: 1개       │
│     │ │                                                 │ │  새 메시지: 7개  │
│     │ │ 매일 알고리즘 문제를 풀고 코드 리뷰...          │ │  새 공지: 2개    │
│     │ │                                                 │ │                  │
│     │ │ ? 12/20명 · ? 1시간 전 · ? 새 메시지 5개    │ │  ? 급한 할일(3) │
│ ?  │ │                                                 │ │  ? 백준 1234    │
│ ?  │ │ [채팅] [공지] [파일] [캘린더] [설정]            │ │     (D-1)        │
│ ?← │ └─────────────────────────────────────────────────┘ │  ? 코드리뷰     │
│ ?  │                                                     │     (D-2)        │
│ ?  │ ┌─────────────────────────────────────────────────┐ │  ? 자소서       │
│ ?  │ │ ? [MEMBER] 취업 준비 스터디                    │ │     (D-3)        │
│     │ │                                                 │ │                  │
│     │ │ 함께 이력서와 면접을 준비하는 스터디            │ │  ? 다가오는 일정│
│     │ │                                                 │ │  11/7 주간회의   │
│     │ │ ? 8/15명 · ? 3시간 전                         │ │  11/10 과제마감  │
│     │ │                                                 │ │  11/13 모의면접  │
│     │ │ [채팅] [공지] [파일] [캘린더]                   │ │                  │
│     │ └─────────────────────────────────────────────────┘ │  ? 빠른 액션    │
│     │                                                     │  [전체 통계]     │
│     │ ┌─────────────────────────────────────────────────┐ │  [스터디 찾기]   │
│     │ │ ? [ADMIN] 영어 회화 스터디                     │ │                  │
│     │ │                                                 │ │  ? 활동 팁      │
│     │ │ 주 3회 화상으로 영어 회화 연습                  │ │  ? 매일 확인     │
│     │ │                                                 │ │  ? 적극 참여     │
│     │ │ ? 10/15명 · ? 1일 전                          │ │  ? 규칙 준수     │
│     │ │                                                 │ │                  │
│     │ │ [채팅] [공지] [파일] [캘린더]                   │ │                  │
│     │ └─────────────────────────────────────────────────┘ │                  │
│     │                                                     │                  │
└─────┴─────────────────────────────────────────────────────┴──────────────────┘
```

**레이아웃 비율**:
- 좌측 네비게이션: 12% (240px)
- 스터디 목록: 58% (1100px)
- 우측 활동 요약: 30% (280px)

---

## ? 섹션별 상세 설계

### 1. 페이지 헤더

```
┌──────────────────────────────────────────────────────────┐
│ ? 내 스터디                          [+ 스터디 만들기]   │
└──────────────────────────────────────────────────────────┘
```

**좌측**: 제목 "? 내 스터디"
- 아이콘으로 "내가 속한" 느낌 강조

**우측**: [+ 스터디 만들기] 버튼
- 클릭 → `/studies/create`
- 항상 접근 가능

---

### 2. 탭 필터

```
┌──────────────────────────────────────────────────────────┐
│ [전체 4] [참여중 3] [관리중 1] [대기중 0]  [최신순 ▼]    │
└──────────────────────────────────────────────────────────┘
```

**탭 목록**:
1. **전체** (기본) - 모든 스터디
2. **참여중** - 승인된 스터디 (MEMBER/ADMIN/OWNER)
3. **관리중** - 내가 관리하는 스터디 (ADMIN/OWNER)
4. **대기중** - 승인 대기 스터디 (PENDING)

**정렬 옵션** (우측):
- 최신 활동순 (기본)
- 이름순
- 생성일순
- 멤버 수순

**스타일**:
```css
.tabs-container {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #6B7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tab-button.active {
  color: #6366F1;
  font-weight: 600;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  right: 0;
  height: 2px;
  background: #6366F1;
}

.tab-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 6px;
  background: #F3F4F6;
  border-radius: 10px;
  font-size: 12px;
  color: #6B7280;
}

.tab-button.active .tab-badge {
  background: #EEF2FF;
  color: #6366F1;
}
```

---

### 3. 스터디 카드 (목록)

```
┌─────────────────────────────────────────────────────────┐
│ ? [OWNER] 알고리즘 마스터 스터디                        │
│                                                         │
│ 매일 알고리즘 문제를 풀고 서로의 풀이를 공유하며         │
│ 성장하는 스터디입니다.                                   │
│                                                         │
│ ? 12/20명  ? 마지막 활동: 1시간 전  ? 새 메시지 5개  │
│                                                         │
│ [채팅] [공지] [파일] [캘린더] [설정]                     │
└─────────────────────────────────────────────────────────┘
```

**카드 구조** (위→아래):

1. **헤더 영역**
   - 이모지 (좌측, 32px)
   - 역할 배지 (우측 상단)
   - 스터디명 (text-lg, Bold)

2. **설명** (2줄 제한)
   - text-sm, gray-600
   - 말줄임 (ellipsis)

3. **메타 정보**
   - ? 멤버 수: "12/20명"
   - ? 마지막 활동: "1시간 전", "어제", "2일 전"
   - ? 새 메시지: "새 메시지 5개" (빨간 배지)
   - 아이콘 + 텍스트, text-sm, gray-500

4. **빠른 액션 버튼**
   - [채팅] [공지] [파일] [캘린더]
   - OWNER/ADMIN: + [설정]
   - 스타일: gray-100 배경, gray-700 텍스트
   - Hover: gray-200
   - 간격: 8px

**역할 배지**:
```css
.role-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.owner {
  background: #FEE2E2;
  color: #DC2626;
}

.role-badge.admin {
  background: #EDE9FE;
  color: #7C3AED;
}

.role-badge.member {
  background: #F3F4F6;
  color: #6B7280;
}

.role-badge.pending {
  background: #FEF3C7;
  color: #D97706;
}
```

**카드 전체 스타일**:
```css
.study-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.study-card:hover {
  border-color: #6366F1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.study-card.has-unread {
  border-left: 4px solid #6366F1;
}
```

---

### 4. 빠른 액션 버튼 동작

```javascript
const quickActions = {
  chat: (studyId) => router.push(`/my-studies/${studyId}/chat`),
  notice: (studyId) => router.push(`/my-studies/${studyId}/notices`),
  file: (studyId) => router.push(`/my-studies/${studyId}/files`),
  calendar: (studyId) => router.push(`/my-studies/${studyId}/calendar`),
  settings: (studyId) => router.push(`/my-studies/${studyId}/settings`)
}

const handleQuickAction = (e, action, studyId) => {
  e.stopPropagation() // 카드 클릭 이벤트 방지
  quickActions[action](studyId)
}
```

---

## ? 우측 활동 요약 위젯 (280px)

### 1?? 나의 활동 요약

```
┌─────────────────────────────────────┐
│ ? 나의 활동 요약                    │
│                                     │
│ 참여 스터디                          │
│ ? 전체: 4개                         │
│ ? 관리중: 1개 (OWNER/ADMIN)         │
│                                     │
│ 새 소식                             │
│ ? 읽지 않은 메시지: 7개              │
│ ? 새 공지: 2개                      │
│ ? 새 파일: 3개                      │
│                                     │
│ 이번 주 활동                         │
│ ? 출석: 5/7일                       │
│ ? 완료 할일: 12개                   │
│ ? 채팅 메시지: 42개                  │
│                                     │
│ [내 통계 자세히 →]                  │
└─────────────────────────────────────┘
```

**표시 정보**:
- 참여 스터디 수
- 관리 중인 스터디 수
- 새 소식 (메시지, 공지, 파일)
- 이번 주 활동 요약

---

### 2?? 급한 할일 (전체 스터디 통합)

```
┌─────────────────────────────────────┐
│ ? 급한 할일 (3)                     │
│                                     │
│ ? [알고리즘] 백준 1234번            │
│    D-1 (11/7)                       │
│    [완료하기]                       │
│                                     │
│ ? [취업준비] 자소서 1차 작성        │
│    D-2 (11/8)                       │
│    [완료하기]                       │
│                                     │
│ ? [알고리즘] 코드 리뷰 준비         │
│    D-3 (11/9)                       │
│    [완료하기]                       │
│                                     │
│ [할일 전체보기 →]                   │
└─────────────────────────────────────┘
```

**기능**:
- 모든 스터디의 D-3 이내 할일 통합
- 스터디명 표시 (어느 스터디 할일인지)
- 마감 긴급도 색상 코딩
- 빠른 완료 버튼

---

### 3?? 다가오는 일정 (전체 스터디 통합)

```
┌─────────────────────────────────────┐
│ ? 다가오는 일정                     │
│                                     │
│ 11/7 (목) 14:00                     │
│ [알고리즘] 주간 회의 (D-1)          │
│                                     │
│ 11/8 (금) 20:00                     │
│ [취업준비] 모의 면접 (D-2)          │
│                                     │
│ 11/10 (일) 23:59                    │
│ [영어회화] 과제 제출 (D-4)          │
│                                     │
│ [캘린더 전체보기 →]                 │
└─────────────────────────────────────┘
```

**기능**:
- 7일 이내 모든 스터디 일정
- 스터디명 + 일정 제목
- D-day 카운트다운

---

### 4?? 빠른 액션

```
┌─────────────────────────────────────┐
│ ? 빠른 액션                         │
│                                     │
│ [? 전체 통계 보기]                 │
│ [? 스터디 더 찾기]                 │
│ [? 스터디 만들기]                  │
└─────────────────────────────────────┘
```

---

### 5?? 활동 팁

```
┌─────────────────────────────────────┐
│ ? 활동 팁                           │
│                                     │
│ ? 매일 확인하기                      │
│   새 소식을 놓치지 마세요           │
│                                     │
│ ? 적극적으로 참여하기                │
│   댓글, 반응으로 소통               │
│                                     │
│ ? 규칙 준수하기                      │
│   스터디 규칙을 지켜주세요           │
└─────────────────────────────────────┘
```

---

## ? 사용자 인터랙션

### 1. 데이터 로딩 (React Query)

```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['my-studies', activeTab, sortBy],
  queryFn: () => fetchMyStudies({ tab: activeTab, sort: sortBy }),
  staleTime: 2 * 60 * 1000, // 2분
  refetchOnWindowFocus: true,
  refetchInterval: 30000 // 30초마다 자동 갱신
})

// 실시간 알림 수신 시 자동 갱신
useEffect(() => {
  if (!socket) return
  
  socket.on('study_update', ({ studyId }) => {
    // 특정 스터디만 갱신
    queryClient.invalidateQueries(['my-studies'])
  })
  
  return () => socket.off('study_update')
}, [socket])
```

---

### 2. 카드 클릭 (스터디 진입)

```javascript
const handleCardClick = (studyId) => {
  // 대시보드로 이동
  router.push(`/my-studies/${studyId}`)
}
```

---

### 3. 컨텍스트 메뉴 (더보기)

```javascript
const contextMenuOptions = (study, role) => {
  const options = [
    { label: '스터디 상세', action: () => router.push(`/my-studies/${study.id}`) },
    { label: '알림 설정', action: () => openNotificationSettings(study.id) }
  ]
  
  if (role === 'MEMBER') {
    options.push({
      label: '스터디 나가기',
      action: () => handleLeaveStudy(study.id),
      danger: true
    })
  }
  
  if (role === 'OWNER') {
    options.push({
      label: '스터디 삭제',
      action: () => handleDeleteStudy(study.id),
      danger: true
    })
  }
  
  return options
}

const handleLeaveStudy = async (studyId) => {
  if (!confirm('정말 나가시겠습니까? 재가입하려면 다시 신청해야 합니다.')) return
  
  try {
    await api.delete(`/api/v1/my-studies/${studyId}/leave`)
    toast.success('스터디에서 나갔습니다')
    queryClient.invalidateQueries(['my-studies'])
  } catch (error) {
    toast.error('오류가 발생했습니다')
  }
}
```

---

## ? 로딩 및 빈 상태

### 로딩 상태 (Skeleton)

```
┌─────────────────────────────────────────────────────────┐
│ ???? ????????????                                     │
│ ????????????????????????????????????                │
│ ????????????????????????????????????                │
│ ???? ???? ???? ????                                   │
│ ???? ???? ???? ???? ????                             │
└─────────────────────────────────────────────────────────┘
```

---

### 빈 상태 (탭별)

#### 전체 탭 - 참여 스터디 없음
```
┌────────────────────────────────────────┐
│                                        │
│         [일러스트 - 빈 폴더]            │
│                                        │
│    아직 참여 중인 스터디가 없어요        │
│   지금 바로 관심있는 스터디를 찾아보세요! │
│                                        │
│      [스터디 둘러보기 →]                │
│                                        │
└────────────────────────────────────────┘
```

#### 관리중 탭 - 관리 스터디 없음
```
┌────────────────────────────────────────┐
│                                        │
│        [일러스트 - 리더 배지]           │
│                                        │
│    관리 중인 스터디가 없어요            │
│   새로운 스터디를 만들어보세요!         │
│                                        │
│       [스터디 만들기 →]                 │
│                                        │
└────────────────────────────────────────┘
```

---

## ? 반응형 설계

### Desktop (1920px)
```css
.my-studies-layout {
  display: grid;
  grid-template-columns: 240px 1fr 280px;
  gap: 20px;
}

.study-list {
  max-width: 1100px;
}
```

### Tablet (1024px)
```css
.my-studies-layout {
  grid-template-columns: 60px 1fr 240px;
  gap: 16px;
}
```

### Mobile (<768px)
```css
.my-studies-layout {
  display: flex;
  flex-direction: column;
}

.activity-widgets {
  order: 3;
  margin-top: 24px;
}

/* 빠른 액션 버튼 아이콘만 */
.quick-action-btn {
  padding: 8px;
  font-size: 0;
}

.quick-action-btn::before {
  content: attr(data-icon);
  font-size: 16px;
}
```

---

## ? 구현 체크리스트

### Phase 1: 레이아웃
- [ ] 3컬럼 레이아웃
- [ ] 탭 필터
- [ ] 우측 활동 요약 위젯

### Phase 2: 스터디 카드
- [ ] 카드 컴포넌트
- [ ] 역할 배지
- [ ] 빠른 액션 버튼
- [ ] 새 메시지 배지

### Phase 3: 데이터 로딩
- [ ] React Query 설정
- [ ] 탭별 필터링
- [ ] 정렬 기능
- [ ] 실시간 업데이트

### Phase 4: 우측 위젯
- [ ] 활동 요약
- [ ] 급한 할일 (통합)
- [ ] 다가오는 일정 (통합)
- [ ] 빠른 액션

### Phase 5: 인터랙션
- [ ] 카드 클릭
- [ ] 빠른 액션 버튼
- [ ] 컨텍스트 메뉴
- [ ] 스터디 나가기/삭제

### Phase 6: 상태 처리
- [ ] 로딩 스켈레톤
- [ ] 빈 상태 (탭별)
- [ ] 에러 처리
- [ ] 반응형 테스트

---

## ? UX 최적화 포인트

1. **명확한 역할**: 배지로 내 역할 즉시 인지
2. **실시간 알림**: 새 메시지, 공지 배지로 놓치지 않음
3. **빠른 액션**: 자주 쓰는 기능에 원클릭 접근
4. **통합 관리**: 모든 스터디의 할일/일정을 한곳에서
5. **활동 상태**: 마지막 활동 시간으로 활성도 파악
6. **효율적 공간**: 우측 위젯으로 공간 최대 활용

---

**다음 화면**: `05_my-study-dashboard.md` (스터디 대시보드)

