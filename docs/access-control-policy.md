# 접근 제어 정책 (Access Control Policy)

> **작성일**: 2025.11.07  
> **목적**: 스터디 정보 접근 권한 명확화  
> **적용 범위**: 스터디 탐색 vs 내 스터디

---

## 📊 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                      사용자 상태                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  미로그인 사용자  →  로그인 사용자  →  스터디 멤버          │
│                                                             │
│  ❌ 제한적 접근    ⚠️ 프리뷰만      ✅ 전체 접근            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 스터디 탐색 (/studies)

### 접근 가능 대상
- ✅ **미로그인 사용자**: 공개 정보 조회만 가능
- ✅ **로그인 사용자**: 공개 정보 + 가입 신청 가능
- ✅ **스터디 멤버**: 자동으로 `/my-studies`로 리다이렉트

---

## 📋 정보 접근 레벨 상세

### Level 1: 공개 정보 (100% 접근 가능)

**누구나 볼 수 있는 정보**:

```javascript
// API 응답 예시
{
  "id": 123,
  "name": "알고리즘 마스터 스터디",
  "description": "매일 아침 알고리즘 문제를 풀고 서로의 풀이를 공유하며...",
  "category": "프로그래밍",
  "subCategory": "알고리즘/코테",
  "tags": ["#알고리즘", "#코테", "#매일"],
  "icon": "📚",
  "visibility": "PUBLIC",
  "autoApproval": true,
  "memberCount": 12,
  "maxMembers": 20,
  "createdAt": "2025-10-01T00:00:00Z",
  "activityLevel": "DAILY",
  "owner": {
    "name": "김철수",
    "imageUrl": "https://...",
    "bio": "백엔드 개발자" // 공개 프로필만
  }
}
```

**UI 표시**:
- ✅ 스터디명
- ✅ 카테고리/서브카테고리
- ✅ 소개글 (전체)
- ✅ 태그 (전체)
- ✅ 멤버 수 (12/20명)
- ✅ 그룹장 이름 + 공개 프로필
- ✅ 생성일
- ✅ 활동 빈도 (매일/주 3회 등)
- ✅ 공개 설정 (전체 공개/비공개)
- ✅ 가입 방식 (자동 승인/수동 승인)

---

### Level 2: 미리보기 정보 (제한적 접근)

**일부만 보여주는 정보 (가입 유도)**:

```javascript
// API 응답 예시
{
  "recentNotices": [
    {
      "id": 1,
      "title": "이번 주 일정 안내",
      "content": "이번 주는 백준 골드 문제로...", // ⚠️ 100자만
      "author": { "name": "김철수" },
      "createdAt": "2025-11-05T14:23:00Z",
      "isLocked": true // 전체 내용 잠김
    },
    {
      "id": 2,
      "title": "참고 자료 공유",
      "content": "알고리즘 학습 자료입니다...", // ⚠️ 100자만
      "author": { "name": "이영희" },
      "createdAt": "2025-11-04T10:15:00Z",
      "isLocked": true
    }
  ],
  "topMembers": [
    { "name": "김철수", "role": "OWNER" },
    { "name": "이영희", "role": "ADMIN" },
    { "name": "박민수", "role": "MEMBER" },
    { "name": "최지은", "role": "MEMBER" },
    { "name": "정소현", "role": "MEMBER" }
    // ⚠️ 상위 5명만, 나머지는 "... 외 7명"
  ],
  "activitySummary": {
    "totalMessages": "500+", // ⚠️ 정확한 수치 숨김
    "totalFiles": "20+",
    "totalEvents": "10+",
    "lastActivity": "2시간 전"
  }
}
```

**UI 표시**:
- ⚠️ **최근 공지 2개**
  - 제목 전체 표시
  - 내용 100자 + "..." 처리
  - 🔒 "전체 내용은 가입 후 확인" 표시
  - 작성자 이름만 (프로필 링크 없음)
  
- ⚠️ **멤버 미리보기 (상위 5명)**
  - 이름 + 역할 배지만
  - 프로필 이미지 없음
  - 연락처/이메일 숨김
  - "... 외 N명" 표시
  - 🔒 "전체 멤버는 가입 후 확인"

- ⚠️ **활동 통계 (요약)**
  - "500+ 메시지" (정확한 수 숨김)
  - "20+ 파일" (정확한 수 숨김)
  - 마지막 활동 시간만

---

### Level 3: 완전 차단 정보 (0% 접근 불가)

**절대 볼 수 없는 정보**:

```javascript
// ❌ API에서 반환하지 않음
{
  // 채팅
  "messages": [], // 전체 숨김
  
  // 파일
  "files": [], // 전체 숨김
  
  // 캘린더
  "events": [], // 전체 숨김
  
  // 할일
  "tasks": [], // 전체 숨김
  
  // 멤버 상세 정보
  "members": [
    {
      "email": "***@***.com", // 숨김
      "phone": "***-****-****", // 숨김
      "lastSeen": null, // 숨김
      "activityScore": null // 숨김
    }
  ]
}
```

**UI 표시**:
- ❌ 채팅 메시지 (전체)
- ❌ 파일 목록 및 다운로드
- ❌ 캘린더 일정 상세
- ❌ 할일 목록
- ❌ 멤버 연락처 (이메일, 전화번호)
- ❌ 멤버 활동 통계
- ❌ 온라인 멤버 목록
- ❌ 공지사항 전체 내용 (3개 이상)
- ❌ 댓글 내용

**대신 표시**:
```
┌────────────────────────────────────────────────┐
│ 🔒 멤버 전용 콘텐츠                            │
│                                                │
│ 이 정보는 스터디 멤버만 확인할 수 있습니다     │
│                                                │
│ [가입하고 전체 기능 이용하기 →]                │
└────────────────────────────────────────────────┘
```

---

## 👥 내 스터디 (/my-studies)

### 접근 조건
- ✅ **로그인 필수**
- ✅ **스터디 멤버십 필수**

### 자동 리다이렉트 규칙

```typescript
// 미들웨어 로직
const accessControl = {
  // Case 1: 미로그인 + /my-studies 접근
  async checkAuth(request) {
    if (!isLoggedIn && pathname.startsWith('/my-studies')) {
      return redirect('/sign-in?redirect=' + pathname)
    }
  },
  
  // Case 2: 로그인 + 미가입 + /my-studies/[id] 접근
  async checkMembership(request) {
    const studyId = extractStudyId(pathname)
    const isMember = await checkMembership(userId, studyId)
    
    if (!isMember) {
      // 공개 스터디면 프리뷰로, 비공개면 404
      const study = await getStudy(studyId)
      
      if (study?.visibility === 'PUBLIC') {
        return redirect(`/studies/${studyId}`)
      } else {
        return { status: 404, message: '존재하지 않는 스터디입니다' }
      }
    }
  },
  
  // Case 3: 로그인 + 가입됨 + /studies/[id] 접근
  async redirectToMyStudy(request) {
    const studyId = extractStudyId(pathname)
    const isMember = await checkMembership(userId, studyId)
    
    if (isMember) {
      return redirect(`/my-studies/${studyId}`)
    }
  }
}
```

---

## 🔐 역할별 권한 (내 스터디 내에서)

### PENDING (승인 대기)

```javascript
permissions = {
  read: ['notices', 'members', 'events', 'tasks'], // 읽기만
  write: [], // 쓰기 불가
  delete: [],
  manage: []
}
```

**할 수 있는 것**:
- ✅ 공지 읽기 (댓글 불가)
- ✅ 멤버 목록 보기
- ✅ 일정 보기
- ✅ 할일 보기

**할 수 없는 것**:
- ❌ 채팅 메시지 전송
- ❌ 공지/댓글 작성
- ❌ 파일 업로드/다운로드
- ❌ 일정 추가
- ❌ 할일 추가

**UI 표시**:
```
┌────────────────────────────────────────────────┐
│ ⏳ 승인 대기 중                                │
│                                                │
│ 그룹장의 승인을 기다리고 있습니다              │
│ 승인 후 모든 기능을 사용할 수 있습니다         │
└────────────────────────────────────────────────┘
```

---

### MEMBER (일반 멤버)

```javascript
permissions = {
  read: ['all'], // 모든 정보 읽기
  write: ['chat', 'notices', 'files', 'events', 'tasks'], // 생성 가능
  delete: ['own_content'], // 본인 콘텐츠만 삭제
  manage: []
}
```

**할 수 있는 것**:
- ✅ 모든 정보 읽기
- ✅ 채팅 메시지 전송
- ✅ 공지 작성 (고정 불가)
- ✅ 파일 업로드/다운로드
- ✅ 일정 추가
- ✅ 할일 추가
- ✅ 댓글 작성
- ✅ 본인 글만 수정/삭제

**할 수 없는 것**:
- ❌ 공지 고정/삭제 (타인 글)
- ❌ 멤버 권한 변경
- ❌ 멤버 강퇴
- ❌ 스터디 설정 변경

---

### ADMIN (관리자)

```javascript
permissions = {
  read: ['all'],
  write: ['all'],
  delete: ['notices', 'files', 'events', 'tasks'], // 타인 콘텐츠 삭제 가능
  manage: ['members', 'settings'] // 일부 관리 권한
}
```

**할 수 있는 것**:
- ✅ MEMBER 권한 전체
- ✅ 공지 고정/삭제 (타인 글 포함)
- ✅ 파일 삭제 (타인 파일 포함)
- ✅ 일정 수정/삭제
- ✅ 멤버 권한 변경 (MEMBER ↔ ADMIN)
- ✅ 멤버 강퇴
- ✅ 스터디 설정 일부 변경

**할 수 없는 것**:
- ❌ 그룹장 권한 양도
- ❌ 스터디 삭제
- ❌ OWNER 역할 부여

---

### OWNER (그룹장)

```javascript
permissions = {
  read: ['all'],
  write: ['all'],
  delete: ['all'],
  manage: ['all'] // 모든 권한
}
```

**할 수 있는 것**:
- ✅ 모든 권한
- ✅ 스터디 삭제
- ✅ 그룹장 권한 양도
- ✅ 스터디 설정 전체 변경

---

## 🚨 예외 상황 처리

### 1. 비공개 스터디 접근

```typescript
// /studies/999 (비공개 스터디)
if (study.visibility === 'PRIVATE' && !isMember) {
  return {
    status: 404,
    title: '스터디를 찾을 수 없습니다',
    message: '삭제되었거나 비공개 스터디입니다',
    action: {
      label: '다른 스터디 찾기',
      href: '/studies'
    }
  }
}
```

### 2. 삭제된 스터디 접근

```typescript
if (!study) {
  return {
    status: 404,
    title: '스터디를 찾을 수 없습니다',
    message: '삭제되었거나 존재하지 않는 스터디입니다',
    action: {
      label: '다른 스터디 찾기',
      href: '/studies'
    }
  }
}
```

### 3. 강퇴된 멤버 접근

```typescript
if (membership?.status === 'KICKED') {
  return {
    status: 403,
    title: '접근이 제한되었습니다',
    message: '이 스터디에서 강퇴되었습니다',
    action: {
      label: '다른 스터디 찾기',
      href: '/studies'
    }
  }
}
```

---

## 📊 접근 제어 매트릭스

| 정보 유형 | 미로그인 | 로그인 (미가입) | PENDING | MEMBER | ADMIN | OWNER |
|----------|----------|-----------------|---------|--------|-------|-------|
| 스터디 기본 정보 | ✅ 전체 | ✅ 전체 | ✅ 전체 | ✅ 전체 | ✅ 전체 | ✅ 전체 |
| 공지 (최근 2개) | ✅ 100자 | ✅ 100자 | ✅ 전체 | ✅ 전체 | ✅ 전체 | ✅ 전체 |
| 공지 (전체) | ❌ | ❌ | ✅ 읽기만 | ✅ 읽기/쓰기 | ✅ 전체 | ✅ 전체 |
| 멤버 (상위 5명) | ✅ 이름만 | ✅ 이름만 | ✅ 전체 | ✅ 전체 | ✅ 전체 | ✅ 전체 |
| 멤버 (전체) | ❌ | ❌ | ✅ 읽기만 | ✅ 읽기 | ✅ 관리 | ✅ 전체 |
| 채팅 | ❌ | ❌ | ❌ | ✅ 전체 | ✅ 전체 | ✅ 전체 |
| 파일 | ❌ | ❌ | ❌ | ✅ 전체 | ✅ 전체 | ✅ 전체 |
| 캘린더 | ❌ | ❌ | ✅ 읽기만 | ✅ 전체 | ✅ 전체 | ✅ 전체 |
| 할일 | ❌ | ❌ | ✅ 읽기만 | ✅ 전체 | ✅ 전체 | ✅ 전체 |
| 화상통화 | ❌ | ❌ | ❌ | ✅ 참여 | ✅ 참여 | ✅ 참여 |
| 스터디 설정 | ❌ | ❌ | ❌ | ❌ | ✅ 일부 | ✅ 전체 |
| 스터디 삭제 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🎯 구현 예시

### 프론트엔드 (React 컴포넌트)

```typescript
// components/StudyPreview.tsx
export function StudyPreview({ studyId }: { studyId: string }) {
  const { data: study, isLoading } = useQuery({
    queryKey: ['study', 'preview', studyId],
    queryFn: () => api.get(`/api/v1/studies/${studyId}/preview`)
  })
  
  if (isLoading) return <Skeleton />
  
  return (
    <div>
      {/* Level 1: 공개 정보 */}
      <StudyHeader study={study} />
      <StudyDescription text={study.description} />
      
      {/* Level 2: 미리보기 */}
      <NoticePreview notices={study.recentNotices} locked />
      <MemberPreview members={study.topMembers} locked />
      
      {/* Level 3: 차단 (표시 안 함) */}
      <LockedContent
        title="멤버 전용 콘텐츠"
        items={['채팅', '파일', '캘린더', '할일']}
        action={<JoinButton studyId={studyId} />}
      />
    </div>
  )
}
```

### 백엔드 (API)

```typescript
// app/api/v1/studies/[studyId]/preview/route.ts
export async function GET(req: Request, { params }: { params: { studyId: string } }) {
  const studyId = parseInt(params.studyId)
  const session = await getServerSession()
  
  // 가입 여부 확인
  if (session) {
    const membership = await checkMembership(studyId, session.user.id)
    if (membership) {
      // 이미 가입됨 → 리다이렉트 응답
      return NextResponse.json(
        { redirect: `/my-studies/${studyId}` },
        { status: 307 }
      )
    }
  }
  
  // 스터디 조회
  const study = await prisma.studyGroup.findUnique({
    where: { id: studyId },
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
        orderBy: { joinedAt: 'asc' },
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
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          content: true, // 나중에 100자로 자름
          createdAt: true,
          author: {
            select: { name: true }
          }
        }
      },
      _count: {
        select: {
          members: true,
          notices: true,
          files: true
        }
      }
      // ❌ chat, files, events, tasks 제외
    }
  })
  
  if (!study) {
    return NextResponse.json(
      { error: 'Study not found' },
      { status: 404 }
    )
  }
  
  // 비공개 스터디는 404 처리
  if (study.visibility === 'PRIVATE') {
    return NextResponse.json(
      { error: 'Study not found' },
      { status: 404 }
    )
  }
  
  // Level 2: 미리보기 정보 제한
  const preview = {
    ...study,
    notices: study.notices.map(notice => ({
      ...notice,
      content: notice.content.substring(0, 100) + '...', // ⚠️ 100자만
      isLocked: true
    })),
    activitySummary: {
      totalMessages: '500+', // ⚠️ 정확한 수 숨김
      totalFiles: `${study._count.files}+`,
      totalNotices: `${study._count.notices}개`,
      lastActivity: '2시간 전'
    }
  }
  
  return NextResponse.json(preview)
}
```

---

## ✅ 체크리스트

### 백엔드
- [ ] 미들웨어에서 가입 여부 자동 확인
- [ ] 프리뷰 API에서 정보 제한 (Level 1, 2만)
- [ ] 내 스터디 API에서 전체 정보 반환 (역할 체크)
- [ ] 비공개 스터디 404 처리
- [ ] 강퇴된 멤버 403 처리

### 프론트엔드
- [ ] 스터디 탐색 화면 (`/studies`)
- [ ] 스터디 프리뷰 화면 (`/studies/[id]`)
- [ ] 내 스터디 목록 (`/my-studies`)
- [ ] 내 스터디 대시보드 (`/my-studies/[id]`)
- [ ] 잠금 아이콘 및 안내 메시지 표시
- [ ] 자동 리다이렉트 처리

### 테스트
- [ ] 미로그인 사용자 접근 테스트
- [ ] 로그인 미가입 사용자 접근 테스트
- [ ] 가입 멤버 자동 리다이렉트 테스트
- [ ] 역할별 권한 테스트
- [ ] 비공개 스터디 404 테스트

---

**이 문서는 모든 접근 제어 정책을 명확히 정의하여 개발 시 혼란을 방지합니다.** 🔒

