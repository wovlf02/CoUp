# 시스템 설정 - 감사 로그

> **페이지 경로**: `/admin/settings/logs`  
> **권한**: SYSTEM_ADMIN 전용

---

## 1. 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 감사 로그                                                    │
├─────────────────────────────────────────────────────────────┤
│ [필터] 관리자 | 액션 유형 | 날짜 범위                        │
│ [내보내기 CSV]                                               │
├─────────────────────────────────────────────────────────────┤
│ [로그 목록]                                                  │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ 2025-11-27 10:30 | 홍길동 | USER_SUSPEND                ││
│ │ 대상: user_456 (피제재자)                                ││
│ │ 사유: "반복적인 욕설 사용"                               ││
│ │ 변경: ACTIVE → SUSPENDED (7일)                          ││
│ │ IP: 123.456.789.000                                     ││
│ │ [상세보기]                                               ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ 2025-11-27 09:15 | 김철수 | STUDY_DELETE                ││
│ │ 대상: study_789 (부적절한 스터디)                        ││
│ │ 사유: "불건전 콘텐츠"                                    ││
│ │ [상세보기]                                               ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 필터 옵션

```tsx
<LogFilters>
  <Select
    label="관리자"
    value={adminId}
    onChange={setAdminId}
    options={admins}
  />
  
  <Select
    label="액션 유형"
    value={action}
    onChange={setAction}
    options={[
      { value: 'USER_SUSPEND', label: '사용자 정지' },
      { value: 'USER_UNSUSPEND', label: '정지 해제' },
      { value: 'STUDY_DELETE', label: '스터디 삭제' },
      { value: 'MESSAGE_DELETE', label: '메시지 삭제' },
      { value: 'REPORT_PROCESS', label: '신고 처리' }
    ]}
  />
  
  <DateRangePicker
    label="날짜 범위"
    from={dateFrom}
    to={dateTo}
    onChange={setDateRange}
  />
  
  <Button onClick={applyFilters}>적용</Button>
  <Button onClick={resetFilters} variant="ghost">초기화</Button>
</LogFilters>
```

---

## 3. 로그 상세 모달

```tsx
<LogDetailModal log={log}>
  <h2>감사 로그 상세</h2>
  
  <InfoGrid>
    <InfoItem label="로그 ID" value={log.id} />
    <InfoItem label="관리자" value={log.adminName} />
    <InfoItem label="액션" value={getActionLabel(log.action)} />
    <InfoItem label="일시" value={formatDateTime(log.createdAt)} />
    <InfoItem label="IP 주소" value={log.ipAddress} />
  </InfoGrid>
  
  <Divider />
  
  <InfoGrid>
    <InfoItem label="대상 유형" value={log.targetType} />
    <InfoItem label="대상 ID" value={log.targetId} />
    <InfoItem label="대상 이름" value={log.targetName} />
  </InfoGrid>
  
  {log.before && log.after && (
    <>
      <Divider />
      <h4>변경 내역</h4>
      <DiffViewer
        before={log.before}
        after={log.after}
      />
    </>
  )}
  
  {log.reason && (
    <>
      <Divider />
      <h4>사유</h4>
      <p>{log.reason}</p>
    </>
  )}
</LogDetailModal>
```

---

**작성 완료**: 2025-11-27

