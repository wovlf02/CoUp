# 사용자 관리 화면

> **작성일**: 2025-11-26

---

## 📋 개요

사용자 목록 조회, 필터링, 상세 보기, 정지/삭제 기능을 제공합니다.

---

## 🎨 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│ 👥 사용자 관리                                           │
├─────────────────────────────────────────────────────────┤
│ [전체▼] [검색: _________] [Google▼] [정렬: 가입일▼]     │
├─────────────────────────────────────────────────────────┤
│ ☑ │ 사용자 │ 이메일 │ 가입일 │ 활동 │ 상태 │ 액션      │
├─────────────────────────────────────────────────────────┤
│ ☐ │ 👤홍길동│hong@...│1/15 │🟢 온라인│활성 │ ⋯        │
│ ☐ │ 👤김철수│kim@... │1/20 │   5분전 │활성 │ ⋯        │
│ ☐ │ 👤이영희│lee@... │2/01 │  1시간  │정지 │ ⋯        │
├─────────────────────────────────────────────────────────┤
│ [이전] 1 2 3 4 5 [다음]              1-20 / 1,234       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 필터 바

### 구성
```jsx
<div className="flex gap-4 mb-4">
  <Select
    value={status}
    onChange={setStatus}
    options={[
      { value: 'all', label: '전체' },
      { value: 'active', label: '활성' },
      { value: 'suspended', label: '정지' },
      { value: 'deleted', label: '탈퇴' }
    ]}
  />
  
  <Input
    type="search"
    placeholder="이름, 이메일 검색..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
  
  <Select
    value={provider}
    options={[
      { value: 'all', label: '전체 가입 방법' },
      { value: 'google', label: 'Google' },
      { value: 'github', label: 'GitHub' },
      { value: 'email', label: 'Email' }
    ]}
  />
  
  <Select
    value={sortBy}
    options={[
      { value: 'createdAt', label: '가입일' },
      { value: 'name', label: '이름' },
      { value: 'lastLoginAt', label: '최근 로그인' }
    ]}
  />
</div>
```

---

## 📋 사용자 테이블

### 컬럼
1. **체크박스**: 일괄 작업용
2. **사용자**: 아바타 + 이름 + provider 아이콘
3. **이메일**: hong@example.com
4. **가입일**: 1/15 (M/D)
5. **활동**: 온라인 인디케이터 + 마지막 로그인
6. **상태**: 활성/정지/탈퇴 배지
7. **액션**: ⋯ 드롭다운

### 테이블 행
```jsx
<tr>
  <td>
    <input type="checkbox" />
  </td>
  <td>
    <div className="flex items-center gap-2">
      <img src={user.avatar} className="w-8 h-8 rounded-full" />
      <span>{user.name}</span>
      {user.provider === 'google' && <FaGoogle />}
    </div>
  </td>
  <td>{user.email}</td>
  <td>{formatDate(user.createdAt)}</td>
  <td>
    {user.isOnline ? (
      <><span className="w-2 h-2 bg-green-500 rounded-full" /> 온라인</>
    ) : (
      <span>{timeAgo(user.lastLoginAt)}</span>
    )}
  </td>
  <td>
    <Badge color={statusColor}>{user.status}</Badge>
  </td>
  <td>
    <Dropdown>
      <DropdownItem onClick={() => openDetail(user.id)}>
        상세 보기
      </DropdownItem>
      <DropdownItem onClick={() => openSuspend(user.id)}>
        정지
      </DropdownItem>
      <DropdownItem onClick={() => openDelete(user.id)} danger>
        삭제
      </DropdownItem>
    </Dropdown>
  </td>
</tr>
```

---

## 💡 일괄 작업

### 선택 시 나타나는 바
```jsx
{selectedUsers.length > 0 && (
  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
    <span>{selectedUsers.length}명 선택됨</span>
    <button onClick={bulkSuspend}>정지</button>
    <button onClick={bulkDelete}>삭제</button>
    <button onClick={clearSelection}>선택 해제</button>
  </div>
)}
```

---

## 🔍 사용자 상세 모달

### 레이아웃
```
┌──────────────────────────────────────┐
│ 사용자 상세               [✕ 닫기]   │
├──────────────────────────────────────┤
│ 👤 홍길동                            │
│ hong@example.com                     │
│ Google 가입 | 활성                   │
├──────────────────────────────────────┤
│ [프로필] [활동] [신고]               │
├──────────────────────────────────────┤
│ (선택된 탭 내용)                     │
│                                      │
├──────────────────────────────────────┤
│ [정지하기] [삭제하기] [역할 변경]    │
└──────────────────────────────────────┘
```

### 탭 1: 프로필
- 가입일, 마지막 로그인
- 참여 스터디 수
- 자기소개

### 탭 2: 활동
- 완료한 할 일: 45개
- 작성한 공지: 12개
- 업로드한 파일: 8개
- 채팅 메시지: 234개

### 탭 3: 신고
- 신고한 횟수: 2회
- 신고당한 횟수: 0회

---

## ⚠️ 정지 모달

```
┌──────────────────────────────────────┐
│ 사용자 정지               [✕ 닫기]   │
├──────────────────────────────────────┤
│ 홍길동 (hong@example.com)을          │
│ 정지하시겠습니까?                    │
├──────────────────────────────────────┤
│ 정지 기간:                           │
│ ◉ 7일   ○ 30일   ○ 영구             │
├──────────────────────────────────────┤
│ 정지 사유: (필수)                    │
│ [____________________________]       │
│                                      │
├──────────────────────────────────────┤
│ ☑ 사용자에게 이메일 통보             │
├──────────────────────────────────────┤
│ [취소] [정지하기]                    │
└──────────────────────────────────────┘
```

---

**다음 문서**: [04-studies.md](./04-studies.md)

