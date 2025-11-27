# 사용자 관리 - 사용자 상세 페이지

> **페이지 경로**: `/admin/users/:userId`

---

## 1. 레이아웃 (2단)

```
┌─────────────────────────────────────────────────────────────┐
│ ← 사용자 목록으로    사용자 상세: hong@coup.com             │
├────────────────────────────┬────────────────────────────────┤
│ [왼쪽: 정보]               │ [우측: 빠른 액션]              │
│                            │                                │
│ 👤 기본 정보               │ 🛠 빠른 액션                   │
│ ───────────────────        │ ───────────────────            │
│ 이름: 홍길동               │ [경고 발송]                    │
│ 이메일: hong@coup.com      │ [3일 정지]                     │
│ 가입일: 2025-10-01         │ [7일 정지]                     │
│ 마지막 로그인: 1시간 전    │ [30일 정지]                    │
│ 역할: USER                 │ [기능 제한]                    │
│ 상태: ●ACTIVE              │ [메시지 보내기]               │
│                            │ [역할 변경] (SYSTEM_ADMIN)     │
│ 📈 활동 통계               │                                │
│ ───────────────────        │ 📝 관리자 메모                 │
│ 참여 스터디: 5개           │ [입력창]                       │
│ 메시지 발송: 1,234건       │ "2025-11-20: 경고 1회          │
│ 파일 업로드: 45개          │  욕설 사용으로..."             │
│ 할일 완료: 78개            │ [저장]                         │
│                            │                                │
│ 🚨 제재 이력               │                                │
│ ───────────────────        │                                │
│ 📋 2025-10-15: 3일 정지    │                                │
│    사유: 스팸 발송         │                                │
│    담당자: admin1          │                                │
│ ⚠️ 2025-09-20: 경고        │                                │
│    사유: 부적절한 언어     │                                │
│                            │                                │
│ 🚫 신고 이력               │                                │
│ ───────────────────        │                                │
│ 신고한 횟수: 2회 [보기]    │                                │
│ 신고당한 횟수: 5회 [보기]  │                                │
│                            │                                │
│ 📚 참여 스터디             │                                │
│ ───────────────────        │                                │
│ 1. 💻 자바 스터디 (MEMBER) │                                │
│ 2. 📚 영어 회화 (ADMIN)    │                                │
│ [전체보기]                 │                                │
└────────────────────────────┴────────────────────────────────┘
```

---

## 2. 빠른 액션 버튼

```tsx
<QuickActions user={user}>
  {/* 경고 발송 */}
  <Button
    icon="alert"
    variant="warning"
    onClick={() => warnUser(user.id)}
  >
    경고 발송
  </Button>
  
  {/* 정지 */}
  {user.status === 'ACTIVE' && (
    <>
      <Button
        variant="danger"
        onClick={() => suspendUser(user.id, '3일')}
      >
        3일 정지
      </Button>
      <Button
        variant="danger"
        onClick={() => suspendUser(user.id, '7일')}
      >
        7일 정지
      </Button>
      <Button
        variant="danger"
        onClick={() => suspendUser(user.id, '30일')}
      >
        30일 정지
      </Button>
    </>
  )}
  
  {/* 정지 해제 */}
  {user.status === 'SUSPENDED' && (
    <Button
      variant="success"
      onClick={() => unsuspendUser(user.id)}
    >
      정지 해제
    </Button>
  )}
  
  {/* 기능 제한 */}
  <Button
    variant="warning"
    onClick={() => restrictFunctions(user.id)}
  >
    기능 제한
  </Button>
  
  {/* 메시지 보내기 */}
  <Button
    variant="outline"
    onClick={() => sendMessage(user.id)}
  >
    메시지 보내기
  </Button>
  
  {/* 역할 변경 (SYSTEM_ADMIN만) */}
  {session.user.role === 'SYSTEM_ADMIN' && (
    <Button
      variant="primary"
      onClick={() => changeRole(user.id)}
    >
      역할 변경
    </Button>
  )}
</QuickActions>
```

---

## 3. 제재 이력 타임라인

```tsx
<SanctionTimeline sanctions={user.sanctions}>
  {sanctions.map(sanction => (
    <TimelineItem key={sanction.id}>
      <TimelineDot variant={getSanctionVariant(sanction.type)} />
      <TimelineContent>
        <div className="sanction-header">
          <Badge variant={getSanctionVariant(sanction.type)}>
            {getSanctionLabel(sanction.type)}
          </Badge>
          <span className="date">{formatDate(sanction.createdAt)}</span>
        </div>
        <p className="reason">{sanction.reason}</p>
        <small className="admin">담당자: {sanction.adminName}</small>
        
        {sanction.type === 'SUSPEND' && sanction.unsuspendAt && (
          <div className="unsuspend-info">
            <Icon name="check" color="green" />
            <span>
              {formatDate(sanction.unsuspendAt)}에 해제됨
              {sanction.unsuspendReason && ` (${sanction.unsuspendReason})`}
            </span>
          </div>
        )}
      </TimelineContent>
    </TimelineItem>
  ))}
</SanctionTimeline>
```

---

**작성 완료**: 2025-11-27

