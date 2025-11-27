# 스터디 관리 - 스터디 상세 페이지

> **페이지 경로**: `/admin/studies/:studyId`

---

## 1. 레이아웃 (2단)

```
┌─────────────────────────────────────────────────────────────┐
│ ← 스터디 목록으로    스터디 상세: 자바 스터디 모임           │
├────────────────────────────┬────────────────────────────────┤
│ [왼쪽: 정보]               │ [우측: 액션 & 메모]            │
│                            │                                │
│ 📊 기본 정보               │ 🛠 빠른 액션                   │
│ ───────────────────        │ ───────────────────            │
│ 💻 이름: 자바 스터디        │ [비공개 전환]                  │
│ 👤 OWNER: 홍길동            │ [스터디 삭제]                  │
│ 📁 카테고리: 프로그래밍     │ [추천 스터디 설정]             │
│ 👥 멤버: 15/20 (75%)        │ [OWNER에게 메시지]             │
│ ⭐ 평점: 4.5 (10개 리뷰)   │ [OWNER 권한 위임]              │
│ 📅 생성일: 2025-09-01      │                                │
│ 🕐 마지막 활동: 1시간 전   │ ───────────────────            │
│ 🔓 상태: 공개, 모집 중     │                                │
│                            │ 📝 관리자 메모                 │
│ 📈 활동 통계               │ [입력창]                       │
│ ───────────────────        │ "2025-11-20: 우수 스터디로     │
│ 💬 총 메시지: 1,250건      │  선정. 메인 페이지 노출 예정"  │
│ 📁 총 파일: 45개           │ [저장]                         │
│ 📢 공지사항: 8개           │                                │
│ ✅ 평균 출석률: 85%         │ ───────────────────            │
│ 📋 할일 완료율: 75%         │                                │
│                            │ 📊 품질 분석                   │
│ 📊 품질 점수: 92/100       │ [차트]                         │
│ ───────────────────        │                                │
│ - 활동도: 95점             │ - 활동도: 95점                 │
│ - 멤버 충족률: 90점        │ - 멤버 충족률: 90점            │
│ - 평점: 95점               │ - 평점: 95점                   │
│ - 콘텐츠: 85점             │ - 콘텐츠: 85점                 │
│ [품질 리포트 보기]         │                                │
│                            │                                │
│ 👥 멤버 목록 (상위 5명)    │                                │
│ ───────────────────        │                                │
│ 1. 홍길동 (OWNER) - 90%    │                                │
│ 2. 김철수 (ADMIN) - 85%    │                                │
│ 3. 이영희 (MEMBER) - 80%   │                                │
│ [전체 멤버 보기 (15명)]    │                                │
│                            │                                │
│ 🚨 신고 이력               │                                │
│ ───────────────────        │                                │
│ 신고 접수: 0건             │                                │
│                            │                                │
│ 🔧 관리자 조치 이력        │                                │
│ ───────────────────        │                                │
│ 2025-11-20: 추천 스터디 설정│                               │
│ 담당자: admin1             │                                │
└────────────────────────────┴────────────────────────────────┘
```

---

## 2. 품질 리포트 카드

```tsx
<QualityReportCard study={study}>
  <h3>📊 품질 분석 리포트</h3>
  
  {/* 종합 점수 */}
  <div className="overall-score">
    <CircularProgress value={study.qualityScore} max={100} size="large" />
    <div>
      <h2>{study.qualityScore}</h2>
      <p>종합 품질 점수</p>
    </div>
  </div>
  
  {/* 세부 점수 */}
  <div className="score-breakdown">
    <ScoreBar label="활동도" score={95} max={30} />
    <ScoreBar label="멤버 충족률" score={90} max={25} />
    <ScoreBar label="평점" score={95} max={25} />
    <ScoreBar label="콘텐츠 활동" score={85} max={20} />
  </div>
  
  {/* 권장 사항 */}
  {study.qualityScore >= 80 && !study.isFeatured && (
    <Alert variant="success">
      <h4>⭐ 우수 스터디</h4>
      <p>품질 점수가 높습니다. 추천 스터디로 설정하시겠습니까?</p>
      <Button onClick={() => setFeatured(study.id)} size="sm">
        추천 스터디로 설정
      </Button>
    </Alert>
  )}
  
  {study.qualityScore < 50 && (
    <Alert variant="warning">
      <h4>⚠️ 개선 필요</h4>
      <ul>
        {study.daysSinceActivity > 14 && (
          <li>활동이 부족합니다. OWNER에게 활성화 권유가 필요합니다.</li>
        )}
        {study.memberFillRate < 0.5 && (
          <li>멤버 충족률이 낮습니다.</li>
        )}
      </ul>
      <Button 
        onClick={() => sendImprovementRequest(study.id)} 
        size="sm"
        variant="warning"
      >
        OWNER에게 개선 요청 발송
      </Button>
    </Alert>
  )}
</QualityReportCard>
```

---

## 3. 멤버 목록

```tsx
<MemberList members={study.topMembers}>
  <h4>👥 멤버 목록 (상위 5명)</h4>
  
  {members.map((member, index) => (
    <MemberRow key={member.id}>
      <div className="rank">{index + 1}</div>
      <Avatar src={member.avatar} size="sm" />
      <div className="member-info">
        <span className="name">{member.name}</span>
        <Badge variant={getRoleBadge(member.role)}>
          {member.role}
        </Badge>
      </div>
      <div className="attendance">
        <ProgressBar value={member.attendanceRate} max={100} size="sm" />
        <span>{member.attendanceRate}%</span>
      </div>
      <IconButton
        icon="eye"
        tooltip="상세보기"
        onClick={() => viewMember(member.id)}
      />
    </MemberRow>
  ))}
  
  <Button 
    variant="outline" 
    onClick={() => viewAllMembers(study.id)}
    fullWidth
  >
    전체 멤버 보기 ({study.memberCount}명)
  </Button>
</MemberList>
```

---

**작성 완료**: 2025-11-27

