# 관리자 기능 - 사용자 관리 상세 명세

> **작성일**: 2025-11-27  
> **영역**: User Management  
> **우선순위**: P0 (최우선)

---

## 📋 목차

1. [기능 개요](#1-기능-개요)
2. [사용자 목록 관리](#2-사용자-목록-관리)
3. [사용자 상세 조회](#3-사용자-상세-조회)
4. [제재 시스템](#4-제재-시스템)
5. [기능 제한 시스템](#5-기능-제한-시스템)
6. [역할 관리](#6-역할-관리)
7. [API 명세](#7-api-명세)

---

## 1. 기능 개요

### 1.1 목적
- 플랫폼의 모든 사용자를 효율적으로 관리
- 부적절한 사용자 제재
- 사용자 활동 모니터링
- 문제 사용자 조기 발견 및 대응

### 1.2 핵심 기능
1. **사용자 검색 및 필터링**: 다양한 조건으로 사용자 검색
2. **사용자 상세 조회**: 활동 이력, 제재 이력, 신고 이력 확인
3. **계정 정지/해제**: 일시 정지 및 해제
4. **기능 제한**: 특정 기능만 차단
5. **역할 변경**: 일반 사용자 ↔ 관리자 (SYSTEM_ADMIN만)
6. **계정 삭제**: 영구 삭제 (SYSTEM_ADMIN만)

---

## 2. 사용자 목록 관리

### 2.1 사용자 목록 페이지

#### 페이지 경로
```
/admin/users
```

#### 레이아웃
```
┌─────────────────────────────────────────────────────────────┐
│ 관리자 > 사용자 관리                                        │
├─────────────────────────────────────────────────────────────┤
│ [🔍 검색창: 이메일, 이름, ID 검색]  [필터 ▼] [내보내기 ▼] │
├─────────────────────────────────────────────────────────────┤
│ 총 1,250명 | ACTIVE: 1,180 | SUSPENDED: 50 | DELETED: 20   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [테이블]                                                    │
│ ┌───┬────────┬──────────────┬────────┬──────────┬────────┐ │
│ │선택│ 이름   │ 이메일       │ 역할   │  상태    │  액션  │ │
│ ├───┼────────┼──────────────┼────────┼──────────┼────────┤ │
│ │□  │홍길동  │hong@coup.com │USER    │●ACTIVE   │[상세]  │ │
│ │□  │김철수  │kim@coup.com  │ADMIN   │●ACTIVE   │[상세]  │ │
│ │□  │이영희  │lee@coup.com  │USER    │🔴SUSPENDED│[해제]  │ │
│ └───┴────────┴──────────────┴────────┴──────────┴────────┘ │
│                                                             │
│ [일괄 선택: 0개] [일괄 메시지 발송] [CSV 내보내기]          │
│                                                             │
│ ◀ 1 2 3 ... 63 ▶                                          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 검색 기능

#### 기본 검색
```typescript
interface UserSearchParams {
  query?: string;  // 이메일, 이름, ID 통합 검색
}

// 예시
query = "hong"
→ 이메일에 "hong" 포함 OR 이름에 "hong" 포함
```

#### 고급 검색
```typescript
interface AdvancedUserSearchParams {
  // 기본 정보
  email?: string;
  name?: string;
  
  // 역할 및 상태
  role?: "USER" | "ADMIN" | "SYSTEM_ADMIN";
  status?: "ACTIVE" | "SUSPENDED" | "DELETED";
  
  // 날짜 범위
  createdFrom?: string;  // ISO 8601
  createdTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  
  // 활동도
  minStudyCount?: number;
  maxStudyCount?: number;
  hasWarning?: boolean;
  hasSuspension?: boolean;
  
  // 정렬
  sortBy?: "createdAt" | "lastLoginAt" | "studyCount" | "name";
  sortOrder?: "asc" | "desc";
  
  // 페이지네이션
  page?: number;
  limit?: number;
}
```

#### 필터 UI
```tsx
<FilterPanel>
  <FilterGroup title="역할">
    <Checkbox label="일반 사용자" value="USER" checked />
    <Checkbox label="관리자" value="ADMIN" />
    <Checkbox label="시스템 관리자" value="SYSTEM_ADMIN" />
  </FilterGroup>
  
  <FilterGroup title="상태">
    <Checkbox label="활성" value="ACTIVE" checked />
    <Checkbox label="정지됨" value="SUSPENDED" />
    <Checkbox label="삭제됨" value="DELETED" />
  </FilterGroup>
  
  <FilterGroup title="가입일">
    <DateRangePicker 
      from={createdFrom}
      to={createdTo}
    />
  </FilterGroup>
  
  <FilterGroup title="활동도">
    <NumberRange 
      label="참여 스터디 수"
      min={minStudyCount}
      max={maxStudyCount}
    />
  </FilterGroup>
  
  <FilterGroup title="제재 이력">
    <Checkbox label="경고 받은 사용자" value="hasWarning" />
    <Checkbox label="정지 이력 있음" value="hasSuspension" />
  </FilterGroup>
  
  <Button onClick={applyFilters}>적용</Button>
  <Button onClick={resetFilters} variant="ghost">초기화</Button>
</FilterPanel>
```

### 2.3 사용자 테이블

#### 테이블 컬럼
```typescript
interface UserTableColumn {
  id: "select" | "name" | "email" | "role" | "status" | "studyCount" | "createdAt" | "lastLoginAt" | "actions";
  label: string;
  sortable: boolean;
  width?: string;
}

const columns: UserTableColumn[] = [
  { id: "select", label: "선택", sortable: false, width: "50px" },
  { id: "name", label: "이름", sortable: true, width: "120px" },
  { id: "email", label: "이메일", sortable: true, width: "200px" },
  { id: "role", label: "역할", sortable: true, width: "100px" },
  { id: "status", label: "상태", sortable: true, width: "100px" },
  { id: "studyCount", label: "스터디", sortable: true, width: "80px" },
  { id: "createdAt", label: "가입일", sortable: true, width: "120px" },
  { id: "lastLoginAt", label: "마지막 로그인", sortable: true, width: "150px" },
  { id: "actions", label: "액션", sortable: false, width: "150px" },
];
```

#### 각 컬럼 렌더링

**1. 이름**
```tsx
<div className="flex items-center gap-2">
  <Avatar src={user.avatar} size="sm" />
  <span>{user.name || "(이름 없음)"}</span>
</div>
```

**2. 역할**
```tsx
<Badge variant={getRoleVariant(user.role)}>
  {getRoleLabel(user.role)}
</Badge>

// USER → 회색, ADMIN → 파란색, SYSTEM_ADMIN → 보라색
```

**3. 상태**
```tsx
{user.status === "ACTIVE" && <Badge variant="success">●활성</Badge>}
{user.status === "SUSPENDED" && (
  <Badge variant="danger">
    🔴정지됨 ({formatDate(user.suspendedUntil)}까지)
  </Badge>
)}
{user.status === "DELETED" && <Badge variant="gray">삭제됨</Badge>}
```

**4. 액션 버튼**
```tsx
<ActionButtons>
  <IconButton 
    icon="eye" 
    tooltip="상세보기"
    onClick={() => router.push(`/admin/users/${user.id}`)}
  />
  
  {user.status === "ACTIVE" && (
    <IconButton 
      icon="ban" 
      tooltip="정지"
      variant="danger"
      onClick={() => openSuspendModal(user)}
    />
  )}
  
  {user.status === "SUSPENDED" && (
    <IconButton 
      icon="check" 
      tooltip="정지 해제"
      variant="success"
      onClick={() => unsuspendUser(user.id)}
    />
  )}
</ActionButtons>
```

### 2.4 일괄 작업

#### 일괄 선택
```tsx
const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

// 전체 선택/해제
const toggleSelectAll = () => {
  if (selectedUsers.length === users.length) {
    setSelectedUsers([]);
  } else {
    setSelectedUsers(users.map(u => u.id));
  }
};

// 개별 선택
const toggleSelectUser = (userId: string) => {
  if (selectedUsers.includes(userId)) {
    setSelectedUsers(selectedUsers.filter(id => id !== userId));
  } else {
    setSelectedUsers([...selectedUsers, userId]);
  }
};
```

#### 일괄 액션
```tsx
<BulkActionBar visible={selectedUsers.length > 0}>
  <span>{selectedUsers.length}개 선택됨</span>
  
  <Button onClick={bulkSendMessage}>
    일괄 메시지 발송
  </Button>
  
  <Button onClick={bulkExportCSV}>
    CSV 내보내기
  </Button>
  
  {session.user.role === "SYSTEM_ADMIN" && (
    <Button onClick={bulkRoleChange} variant="primary">
      역할 변경
    </Button>
  )}
</BulkActionBar>
```

### 2.5 데이터 내보내기

#### CSV 내보내기
```typescript
async function exportUsersToCSV(userIds: string[]) {
  const users = await fetchUsers({ userIds });
  
  const csv = [
    // 헤더
    ["ID", "이름", "이메일", "역할", "상태", "가입일", "마지막 로그인", "스터디 수"].join(","),
    
    // 데이터
    ...users.map(u => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.status,
      formatDate(u.createdAt),
      formatDate(u.lastLoginAt),
      u.studyCount
    ].join(","))
  ].join("\n");
  
  downloadFile(csv, "users.csv", "text/csv");
}
```

---

## 3. 사용자 상세 조회

### 3.1 사용자 상세 페이지

#### 페이지 경로
```
/admin/users/:userId
```

#### 레이아웃 (2단 레이아웃)
```
┌─────────────────────────────────────────────────────────────┐
│ ← 뒤로가기     사용자 상세: hong@coup.com                   │
├────────────────────────────┬────────────────────────────────┤
│ [왼쪽: 정보 패널]          │ [우측: 빠른 액션]              │
│                            │                                │
│ 📊 기본 정보               │ 🛠 빠른 액션                   │
│ ───────────────────        │ ───────────────────            │
│ 👤 이름: 홍길동            │ [경고 발송]                    │
│ ✉️ 이메일: hong@coup.com   │ [3일 정지]                     │
│ 🎂 가입일: 2025-10-01      │ [7일 정지]                     │
│ 🕐 마지막 로그인: 1시간 전 │ [30일 정지]                    │
│ 🏷 역할: USER               │ [기능 제한]                    │
│ ● 상태: ACTIVE             │ [메시지 보내기]               │
│                            │ [역할 변경] (SYSTEM_ADMIN만)  │
│ 📈 활동 통계               │                                │
│ ───────────────────        │ 📝 관리자 메모                 │
│ 📚 참여 스터디: 5개        │ [텍스트 입력창]                │
│ 💬 메시지 발송: 1,234건    │ "2025-11-20: 경고 1회 발송    │
│ 📁 파일 업로드: 45개       │  욕설 사용 건으로..."          │
│ ✅ 할일 완료: 78개          │ [저장]                         │
│                            │                                │
│ 🚨 제재 이력               │                                │
│ ───────────────────        │                                │
│ 📋 2025-10-15: 3일 정지    │                                │
│    사유: 스팸 발송         │                                │
│    담당자: admin1          │                                │
│ ⚠️ 2025-09-20: 경고        │                                │
│    사유: 부적절한 언어     │                                │
│    담당자: admin2          │                                │
│                            │                                │
│ 🚫 신고 이력               │                                │
│ ───────────────────        │                                │
│ 신고한 횟수: 2회           │                                │
│ [상세보기]                 │                                │
│                            │                                │
│ 신고당한 횟수: 5회         │                                │
│ [상세보기]                 │                                │
│                            │                                │
│ 📚 참여 스터디 목록        │                                │
│ ───────────────────        │                                │
│ 1. 자바 스터디 (MEMBER)    │                                │
│ 2. 영어 회화 (ADMIN)       │                                │
│ 3. ...                     │                                │
│ [전체보기]                 │                                │
└────────────────────────────┴────────────────────────────────┘
```

### 3.2 데이터 구조

```typescript
interface UserDetailData {
  // 기본 정보
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  role: "USER" | "ADMIN" | "SYSTEM_ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  provider: "CREDENTIALS" | "GOOGLE" | "GITHUB";
  
  // 날짜 정보
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  
  // 정지 정보 (status === "SUSPENDED"인 경우)
  suspendedUntil?: string;
  suspendReason?: string;
  
  // 활동 통계
  stats: {
    studyCount: number;      // 참여 스터디 수
    messageCount: number;    // 메시지 발송 수
    fileCount: number;       // 파일 업로드 수
    taskCount: number;       // 할일 완료 수
    noticeCount: number;     // 공지 작성 수
  };
  
  // 제재 이력
  sanctions: Sanction[];
  
  // 신고 이력
  reportStats: {
    reported: number;        // 신고한 횟수
    reportedBy: number;      // 신고당한 횟수
  };
  
  // 참여 스터디 목록
  studies: {
    id: string;
    name: string;
    emoji: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    joinedAt: string;
  }[];
  
  // 관리자 메모
  adminNotes?: string;
}

interface Sanction {
  id: string;
  type: "WARNING" | "SUSPEND" | "UNSUSPEND" | "RESTRICT";
  reason: string;
  duration?: string;
  adminId: string;
  adminName: string;
  createdAt: string;
  
  // 정지 해제 정보
  unsuspendReason?: string;
  unsuspendAdminId?: string;
  unsuspendAt?: string;
}
```

### 3.3 빠른 액션 버튼

#### 경고 발송
```tsx
<Button onClick={() => warnUser(user.id)} variant="warning">
  ⚠️ 경고 발송
</Button>

// 모달
<WarnModal>
  <h3>경고 발송</h3>
  <p>사용자: {user.email}</p>
  <textarea 
    placeholder="경고 사유를 입력하세요"
    value={warnReason}
    onChange={(e) => setWarnReason(e.target.value)}
  />
  <Button onClick={submitWarning}>발송</Button>
</WarnModal>
```

#### 계정 정지
```tsx
<Button onClick={() => suspendUser(user.id)} variant="danger">
  🔴 계정 정지
</Button>

// 모달은 다음 섹션에서 상세 설명
```

---

## 4. 제재 시스템

### 4.1 3-Strike 시스템

#### 단계별 제재
```typescript
// 제재 단계 자동 결정
function determineSanctionLevel(userId: string): SanctionLevel {
  const sanctions = getUserSanctions(userId);
  const warnings = sanctions.filter(s => s.type === "WARNING");
  const suspensions = sanctions.filter(s => s.type === "SUSPEND");
  
  if (warnings.length === 0) {
    return { type: "WARNING", duration: null, recommended: true };
  }
  
  if (warnings.length === 1 && suspensions.length === 0) {
    return { type: "SUSPEND", duration: "3일", recommended: true };
  }
  
  if (suspensions.length === 1) {
    return { type: "SUSPEND", duration: "7일", recommended: true };
  }
  
  if (suspensions.length === 2) {
    return { type: "SUSPEND", duration: "30일", recommended: true };
  }
  
  return { type: "SUSPEND", duration: "영구", recommended: true };
}
```

### 4.2 계정 정지 모달

```tsx
<SuspendModal user={user} onClose={closeSuspendModal}>
  <h2>사용자 정지</h2>
  
  {/* 대상 정보 */}
  <UserInfoCard>
    <Avatar src={user.avatar} />
    <div>
      <strong>{user.name}</strong>
      <span>{user.email}</span>
    </div>
  </UserInfoCard>
  
  {/* 추천 조치 */}
  <RecommendedAction>
    <Icon name="lightbulb" />
    <span>
      추천 조치: <strong>{recommended.duration} 정지</strong>
    </span>
    <InfoTooltip>
      이전 제재 이력을 바탕으로 추천됩니다
    </InfoTooltip>
  </RecommendedAction>
  
  {/* 정지 기간 선택 */}
  <FormGroup>
    <Label>정지 기간 *</Label>
    <Select 
      value={duration}
      onChange={setDuration}
    >
      <option value="1일">1일</option>
      <option value="3일" selected={recommended.duration === "3일"}>
        3일 {recommended.duration === "3일" && "(권장)"}
      </option>
      <option value="7일" selected={recommended.duration === "7일"}>
        7일 {recommended.duration === "7일" && "(권장)"}
      </option>
      <option value="30일">30일</option>
      <option value="영구">영구</option>
    </Select>
  </FormGroup>
  
  {/* 정지 사유 */}
  <FormGroup>
    <Label>정지 사유 *</Label>
    <Textarea 
      placeholder="정지 사유를 구체적으로 입력하세요"
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      rows={4}
      required
    />
    <CharCount>{reason.length} / 500</CharCount>
  </FormGroup>
  
  {/* 관련 신고 */}
  {relatedReport && (
    <FormGroup>
      <Label>관련 신고</Label>
      <ReportCard report={relatedReport} />
    </FormGroup>
  )}
  
  {/* 알림 옵션 */}
  <FormGroup>
    <Checkbox 
      checked={notifyUser}
      onChange={setNotifyUser}
    >
      사용자에게 이메일 알림 발송
    </Checkbox>
  </FormGroup>
  
  {/* 확인 */}
  <Alert variant="warning">
    ⚠️ 정지 후 사용자는 로그인이 불가능합니다.
    신중하게 결정해 주세요.
  </Alert>
  
  <ButtonGroup>
    <Button onClick={closeSuspendModal} variant="ghost">
      취소
    </Button>
    <Button 
      onClick={submitSuspend} 
      variant="danger"
      disabled={!reason.trim()}
    >
      정지 실행
    </Button>
  </ButtonGroup>
</SuspendModal>
```

### 4.3 정지 해제

```tsx
<Button onClick={() => unsuspendUser(user.id)} variant="success">
  ✅ 정지 해제
</Button>

// 모달
<UnsuspendModal user={user}>
  <h2>계정 정지 해제</h2>
  
  <UserInfoCard user={user} />
  
  {/* 현재 정지 정보 */}
  <InfoCard>
    <h4>현재 정지 상태</h4>
    <p>정지 종료일: {formatDate(user.suspendedUntil)}</p>
    <p>정지 사유: {user.suspendReason}</p>
  </InfoCard>
  
  {/* 해제 사유 */}
  <FormGroup>
    <Label>해제 사유 *</Label>
    <Textarea 
      placeholder="정지를 해제하는 이유를 입력하세요"
      value={unsuspendReason}
      onChange={(e) => setUnsuspendReason(e.target.value)}
      rows={4}
    />
  </FormGroup>
  
  <ButtonGroup>
    <Button onClick={closeUnsuspendModal} variant="ghost">취소</Button>
    <Button onClick={submitUnsuspend} variant="success">해제</Button>
  </ButtonGroup>
</UnsuspendModal>
```

---

## 5. 기능 제한 시스템

### 5.1 제한 가능한 기능

```typescript
enum RestrictableFunction {
  CHAT = "CHAT",                      // 채팅
  STUDY_CREATE = "STUDY_CREATE",      // 스터디 생성
  STUDY_JOIN = "STUDY_JOIN",          // 스터디 가입
  FILE_UPLOAD = "FILE_UPLOAD",        // 파일 업로드
  NOTICE_CREATE = "NOTICE_CREATE",    // 공지 작성
  COMMENT = "COMMENT",                // 댓글 작성
  REPORT = "REPORT",                  // 신고
}
```

### 5.2 기능 제한 모달

```tsx
<RestrictFunctionModal user={user}>
  <h2>기능 제한 설정</h2>
  
  <UserInfoCard user={user} />
  
  {/* 제한할 기능 선택 */}
  <FormGroup>
    <Label>제한할 기능 선택 (다중 선택 가능)</Label>
    <CheckboxGroup>
      <Checkbox value="CHAT">💬 채팅</Checkbox>
      <Checkbox value="STUDY_CREATE">📚 스터디 생성</Checkbox>
      <Checkbox value="STUDY_JOIN">🚪 스터디 가입</Checkbox>
      <Checkbox value="FILE_UPLOAD">📁 파일 업로드</Checkbox>
      <Checkbox value="NOTICE_CREATE">📢 공지 작성</Checkbox>
      <Checkbox value="COMMENT">💭 댓글 작성</Checkbox>
      <Checkbox value="REPORT">🚨 신고</Checkbox>
    </CheckboxGroup>
  </FormGroup>
  
  {/* 제한 기간 */}
  <FormGroup>
    <Label>제한 기간 *</Label>
    <Select value={restrictDuration}>
      <option value="1일">1일</option>
      <option value="3일">3일</option>
      <option value="7일">7일</option>
      <option value="30일">30일</option>
      <option value="영구">영구</option>
    </Select>
  </FormGroup>
  
  {/* 제한 사유 */}
  <FormGroup>
    <Label>제한 사유 *</Label>
    <Textarea 
      placeholder="기능 제한 사유를 입력하세요"
      value={restrictReason}
      onChange={(e) => setRestrictReason(e.target.value)}
    />
  </FormGroup>
  
  <ButtonGroup>
    <Button onClick={closeRestrictModal} variant="ghost">취소</Button>
    <Button onClick={submitRestrict} variant="warning">제한 실행</Button>
  </ButtonGroup>
</RestrictFunctionModal>
```

---

## 6. 역할 관리

### 6.1 역할 변경 (SYSTEM_ADMIN 전용)

```tsx
<Button 
  onClick={() => changeUserRole(user.id)} 
  variant="primary"
  disabled={session.user.role !== "SYSTEM_ADMIN"}
>
  🔧 역할 변경
</Button>

// 모달
<RoleChangeModal user={user}>
  <h2>사용자 역할 변경</h2>
  
  <Alert variant="warning">
    ⚠️ 이 기능은 SYSTEM_ADMIN만 사용할 수 있습니다.
  </Alert>
  
  <UserInfoCard user={user} />
  
  {/* 현재 역할 */}
  <InfoCard>
    <h4>현재 역할</h4>
    <Badge variant={getRoleVariant(user.role)}>
      {getRoleLabel(user.role)}
    </Badge>
  </InfoCard>
  
  {/* 새 역할 선택 */}
  <FormGroup>
    <Label>새 역할 *</Label>
    <RadioGroup value={newRole} onChange={setNewRole}>
      <Radio value="USER">
        <strong>일반 사용자</strong>
        <p>기본 사용 권한만 가짐</p>
      </Radio>
      <Radio value="ADMIN">
        <strong>관리자</strong>
        <p>사용자 관리, 신고 처리 등 가능</p>
      </Radio>
      <Radio value="SYSTEM_ADMIN" disabled={session.user.role !== "SYSTEM_ADMIN"}>
        <strong>시스템 관리자</strong>
        <p>모든 권한 (시스템 설정 포함)</p>
      </Radio>
    </RadioGroup>
  </FormGroup>
  
  {/* 변경 사유 */}
  <FormGroup>
    <Label>변경 사유 *</Label>
    <Textarea 
      placeholder="역할 변경 사유를 입력하세요"
      value={roleChangeReason}
      onChange={(e) => setRoleChangeReason(e.target.value)}
    />
  </FormGroup>
  
  <ButtonGroup>
    <Button onClick={closeRoleModal} variant="ghost">취소</Button>
    <Button onClick={submitRoleChange} variant="primary">변경 실행</Button>
  </ButtonGroup>
</RoleChangeModal>
```

---

## 7. API 명세

### 7.1 사용자 목록 조회

```http
GET /api/admin/users
```

**Query Parameters**:
```typescript
{
  query?: string;
  role?: "USER" | "ADMIN" | "SYSTEM_ADMIN";
  status?: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdFrom?: string;
  createdTo?: string;
  sortBy?: "createdAt" | "lastLoginAt" | "studyCount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "email": "hong@coup.com",
      "name": "홍길동",
      "avatar": "https://...",
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "2025-10-01T10:00:00Z",
      "lastLoginAt": "2025-11-27T09:00:00Z",
      "studyCount": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63
  }
}
```

### 7.2 사용자 상세 조회

```http
GET /api/admin/users/:userId
```

**Response**: `UserDetailData` 참조

### 7.3 계정 정지

```http
POST /api/admin/users/:userId/suspend
```

**Request Body**:
```json
{
  "duration": "7일",
  "reason": "반복적인 욕설 사용으로 커뮤니티 가이드라인 위반",
  "relatedReportId": "report_456",
  "notifyUser": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "status": "SUSPENDED",
    "suspendedUntil": "2025-12-04T10:00:00Z",
    "reason": "..."
  }
}
```

### 7.4 정지 해제

```http
POST /api/admin/users/:userId/unsuspend
```

**Request Body**:
```json
{
  "reason": "사용자가 반성하고 재발 방지 약속함"
}
```

### 7.5 기능 제한

```http
POST /api/admin/users/:userId/restrict
```

**Request Body**:
```json
{
  "functions": ["CHAT", "STUDY_CREATE"],
  "restrictedUntil": "2025-12-04T10:00:00Z",
  "reason": "스팸 발송으로 채팅 및 스터디 생성 제한"
}
```

### 7.6 역할 변경 (SYSTEM_ADMIN)

```http
PATCH /api/admin/users/:userId/role
```

**Request Body**:
```json
{
  "newRole": "ADMIN",
  "reason": "신뢰할 수 있는 활동 이력으로 관리자 임명"
}
```

### 7.7 계정 삭제 (SYSTEM_ADMIN)

```http
DELETE /api/admin/users/:userId
```

**Request Body**:
```json
{
  "reason": "심각한 이용 약관 위반으로 영구 차단",
  "permanent": true
}
```

---

**문서 버전**: 1.0  
**작성 완료일**: 2025-11-27  
**다음 문서**: `02-study-management.md`

