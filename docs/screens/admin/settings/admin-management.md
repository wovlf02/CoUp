# 시스템 설정 - 관리자 관리

> **페이지 경로**: `/admin/settings/admins`  
> **권한**: SYSTEM_ADMIN 전용

---

## 1. 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 관리자 관리                                                  │
├─────────────────────────────────────────────────────────────┤
│ [새 관리자 임명]                                             │
├─────────────────────────────────────────────────────────────┤
│ [테이블]                                                    │
│ ┌────────┬──────────────┬────────┬──────────┬────────────┐ │
│ │ 이름   │ 이메일       │ 역할   │최근로그인│  액션 수   │ │
│ ├────────┼──────────────┼────────┼──────────┼────────────┤ │
│ │홍길동  │admin@coup.com│ ADMIN  │ 1시간 전 │    234     │ │
│ │김철수  │admin2@...    │SYSTEM  │ 5분 전   │    567     │ │
│ └────────┴──────────────┴────────┴──────────┴────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 관리자 임명 모달

```tsx
<AppointAdminModal>
  <h2>새 관리자 임명</h2>
  
  <Alert variant="warning">
    ⚠️ 이 작업은 SYSTEM_ADMIN만 수행할 수 있습니다.
  </Alert>
  
  <FormGroup>
    <Label>사용자 검색</Label>
    <UserSearchInput
      onSelect={setSelectedUser}
      placeholder="이메일 또는 이름으로 검색"
    />
  </FormGroup>
  
  {selectedUser && (
    <UserInfoCard user={selectedUser} />
  )}
  
  <FormGroup>
    <Label>역할 선택</Label>
    <RadioGroup value={role} onChange={setRole}>
      <Radio value="ADMIN">
        <strong>관리자 (ADMIN)</strong>
        <p>사용자 관리, 신고 처리, 콘텐츠 검열</p>
      </Radio>
      <Radio value="SYSTEM_ADMIN">
        <strong>시스템 관리자 (SYSTEM_ADMIN)</strong>
        <p>모든 권한 + 시스템 설정, 관리자 임명</p>
      </Radio>
    </RadioGroup>
  </FormGroup>
  
  <FormGroup>
    <Label>임명 사유</Label>
    <Textarea
      placeholder="관리자로 임명하는 이유를 입력하세요"
      value={reason}
      onChange={setReason}
      rows={3}
    />
  </FormGroup>
  
  <ButtonGroup>
    <Button variant="ghost">취소</Button>
    <Button variant="primary">임명</Button>
  </ButtonGroup>
</AppointAdminModal>
```

---

## 3. 관리자 해임 모달

```tsx
<RevokeAdminModal admin={admin}>
  <h2>관리자 해임</h2>
  
  <Alert variant="danger">
    ⚠️ 이 사용자의 관리자 권한이 제거됩니다.
  </Alert>
  
  <UserInfoCard user={admin} />
  
  <div className="admin-stats">
    <StatItem label="총 액션 수" value={admin.actionsCount} />
    <StatItem label="관리자 기간" value={getAdminDuration(admin)} />
  </div>
  
  <FormGroup>
    <Label>해임 사유</Label>
    <Textarea
      placeholder="해임 사유를 입력하세요"
      value={reason}
      onChange={setReason}
      rows={3}
    />
  </FormGroup>
  
  <ButtonGroup>
    <Button variant="ghost">취소</Button>
    <Button variant="danger">해임</Button>
  </ButtonGroup>
</RevokeAdminModal>
```

---

**작성 완료**: 2025-11-27

