# 관리자 기능 - 스터디 관리 상세 명세

> **작성일**: 2025-11-27  
> **영역**: Study Management  
> **우선순위**: P0 (최우선)

---

## 📋 목차

1. [기능 개요](#1-기능-개요)
2. [스터디 목록 관리](#2-스터디-목록-관리)
3. [스터디 상세 조회](#3-스터디-상세-조회)
4. [스터디 품질 관리](#4-스터디-품질-관리)
5. [추천 스터디 시스템](#5-추천-스터디-시스템)
6. [OWNER 권한 위임](#6-owner-권한-위임)
7. [API 명세](#7-api-명세)

---

## 1. 기능 개요

### 1.1 목적
- 플랫폼의 모든 스터디를 효율적으로 관리
- 저품질 스터디 탐지 및 개선 유도
- 우수 스터디 발굴 및 큐레이션
- 부적절한 스터디 제재

### 1.2 핵심 기능
1. **스터디 검색 및 필터링**: 다양한 조건으로 스터디 검색
2. **스터디 상세 조회**: 활동 통계, 멤버 현황, 신고 이력
3. **스터디 삭제**: 부적절한 스터디 삭제
4. **공개/비공개 전환**: 문제 발생 시 임시 비공개 처리
5. **추천 스터디 설정**: 우수 스터디 큐레이션
6. **OWNER 권한 위임**: OWNER 장기 부재 시 권한 이전

---

## 2. 스터디 목록 관리

### 2.1 스터디 목록 페이지

#### 페이지 경로
```
/admin/studies
```

#### 레이아웃
```
┌─────────────────────────────────────────────────────────────┐
│ 관리자 > 스터디 관리                                         │
├─────────────────────────────────────────────────────────────┤
│ [🔍 검색창: 스터디 이름, 설명]  [필터 ▼] [품질 분석 ▼]     │
├─────────────────────────────────────────────────────────────┤
│ 총 850개 | 활성: 720 | 모집완료: 80 | 비공개: 50            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [탭] [전체] [활성] [저품질] [추천] [신고됨]                 │
│                                                             │
│ [테이블]                                                    │
│ ┌───┬────────┬────────┬────────┬──────┬────────┬─────────┐ │
│ │선택│스터디명│ OWNER  │ 멤버수 │ 평점 │ 상태   │  액션   │ │
│ ├───┼────────┼────────┼────────┼──────┼────────┼─────────┤ │
│ │□  │자바스터│홍길동  │ 15/20  │ 4.5  │●공개   │[상세]   │ │
│ │□  │영어회화│김철수  │ 10/10  │ 4.8  │⭐추천  │[상세]   │ │
│ │□  │의심스터│이영희  │ 1/50   │ 0.0  │⚠️저품질│[검토]   │ │
│ └───┴────────┴────────┴────────┴──────┴────────┴─────────┘ │
│                                                             │
│ [일괄 선택: 0개] [일괄 비공개 전환] [품질 리포트 생성]       │
│                                                             │
│ ◀ 1 2 3 ... 43 ▶                                          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 검색 및 필터

#### 검색 옵션
```typescript
interface StudySearchParams {
  // 기본 검색
  query?: string;  // 스터디 이름, 설명 통합 검색
  
  // 카테고리
  category?: string;  // "프로그래밍", "어학", "자격증" 등
  subCategory?: string;
  
  // 상태
  isPublic?: boolean;
  isRecruiting?: boolean;
  isFeatured?: boolean;  // 추천 스터디
  
  // 통계
  minMembers?: number;
  maxMembers?: number;
  minRating?: number;
  maxRating?: number;
  
  // 품질
  qualityScore?: "low" | "medium" | "high";  // 저품질/중간/우수
  hasReports?: boolean;  // 신고 접수된 스터디
  
  // 날짜
  createdFrom?: string;
  createdTo?: string;
  lastActivityFrom?: string;
  lastActivityTo?: string;
  
  // 정렬
  sortBy?: "createdAt" | "memberCount" | "rating" | "lastActivityAt" | "qualityScore";
  sortOrder?: "asc" | "desc";
  
  // 페이지네이션
  page?: number;
  limit?: number;
}
```

#### 필터 UI
```tsx
<FilterPanel>
  <FilterGroup title="카테고리">
    <Select value={category}>
      <option value="">전체</option>
      <option value="프로그래밍">프로그래밍</option>
      <option value="어학">어학</option>
      <option value="자격증">자격증</option>
      <option value="취미">취미</option>
      <option value="독서">독서</option>
      <option value="재테크">재테크</option>
    </Select>
  </FilterGroup>
  
  <FilterGroup title="상태">
    <Checkbox label="공개 스터디" value="isPublic" />
    <Checkbox label="모집 중" value="isRecruiting" />
    <Checkbox label="추천 스터디" value="isFeatured" />
  </FilterGroup>
  
  <FilterGroup title="품질 점수">
    <Radio label="전체" value="" />
    <Radio label="우수 (80점 이상)" value="high" />
    <Radio label="보통 (50-80점)" value="medium" />
    <Radio label="저품질 (50점 미만)" value="low" />
  </FilterGroup>
  
  <FilterGroup title="멤버 수">
    <NumberRange 
      label="멤버 수"
      min={minMembers}
      max={maxMembers}
    />
  </FilterGroup>
  
  <FilterGroup title="평점">
    <NumberRange 
      label="평점"
      min={minRating}
      max={maxRating}
      step={0.1}
    />
  </FilterGroup>
  
  <FilterGroup title="신고 상태">
    <Checkbox label="신고 접수된 스터디만" value="hasReports" />
  </FilterGroup>
  
  <Button onClick={applyFilters}>적용</Button>
  <Button onClick={resetFilters} variant="ghost">초기화</Button>
</FilterPanel>
```

### 2.3 스터디 테이블

#### 컬럼 정의
```typescript
interface StudyTableColumn {
  id: string;
  label: string;
  sortable: boolean;
  width?: string;
}

const columns: StudyTableColumn[] = [
  { id: "select", label: "선택", sortable: false, width: "50px" },
  { id: "emoji", label: "", sortable: false, width: "40px" },
  { id: "name", label: "스터디명", sortable: true, width: "200px" },
  { id: "owner", label: "OWNER", sortable: false, width: "120px" },
  { id: "memberCount", label: "멤버수", sortable: true, width: "100px" },
  { id: "rating", label: "평점", sortable: true, width: "80px" },
  { id: "category", label: "카테고리", sortable: true, width: "100px" },
  { id: "status", label: "상태", sortable: false, width: "120px" },
  { id: "qualityScore", label: "품질", sortable: true, width: "80px" },
  { id: "actions", label: "액션", sortable: false, width: "150px" },
];
```

#### 컬럼 렌더링

**1. 스터디명**
```tsx
<div className="flex items-center gap-2">
  <span className="text-2xl">{study.emoji}</span>
  <div>
    <div className="font-semibold">{study.name}</div>
    <div className="text-sm text-gray-500">
      {study.description.substring(0, 50)}...
    </div>
  </div>
</div>
```

**2. 멤버 수**
```tsx
<div className="flex flex-col items-center">
  <span className="font-semibold">
    {study.memberCount} / {study.maxMembers}
  </span>
  <ProgressBar 
    value={study.memberCount} 
    max={study.maxMembers}
    size="sm"
  />
</div>
```

**3. 상태**
```tsx
<div className="flex flex-col gap-1">
  {study.isPublic ? (
    <Badge variant="success">●공개</Badge>
  ) : (
    <Badge variant="gray">🔒비공개</Badge>
  )}
  
  {study.isRecruiting && (
    <Badge variant="info">📢모집 중</Badge>
  )}
  
  {study.isFeatured && (
    <Badge variant="warning">⭐추천</Badge>
  )}
  
  {study.reportCount > 0 && (
    <Badge variant="danger">🚨신고 {study.reportCount}건</Badge>
  )}
</div>
```

**4. 품질 점수**
```tsx
<div className="flex flex-col items-center">
  <span className={`text-2xl ${getQualityColor(study.qualityScore)}`}>
    {study.qualityScore}
  </span>
  <span className="text-xs text-gray-500">
    {getQualityLabel(study.qualityScore)}
  </span>
</div>

// 80+ → "우수" (green)
// 50-80 → "보통" (yellow)
// 0-50 → "저품질" (red)
```

**5. 액션 버튼**
```tsx
<ActionButtons>
  <IconButton 
    icon="eye" 
    tooltip="상세보기"
    onClick={() => router.push(`/admin/studies/${study.id}`)}
  />
  
  {study.isPublic ? (
    <IconButton 
      icon="lock" 
      tooltip="비공개 전환"
      variant="warning"
      onClick={() => toggleVisibility(study.id, false)}
    />
  ) : (
    <IconButton 
      icon="unlock" 
      tooltip="공개 전환"
      variant="success"
      onClick={() => toggleVisibility(study.id, true)}
    />
  )}
  
  <IconButton 
    icon="trash" 
    tooltip="스터디 삭제"
    variant="danger"
    onClick={() => openDeleteModal(study)}
  />
</ActionButtons>
```

### 2.4 저품질 스터디 탭

#### 자동 감지 조건
```typescript
interface QualityCheckCriteria {
  // 활동도
  daysSinceLastActivity: number;     // 30일 이상 활동 없음
  
  // 멤버 참여율
  memberFillRate: number;            // 30% 미만
  
  // 평점
  rating: number;                    // 2.0 미만
  
  // 신고
  reportCount: number;               // 3건 이상
  
  // 콘텐츠
  messageCount: number;              // 총 10개 미만
  noticeCount: number;               // 0개
}

function calculateQualityScore(study: Study): number {
  let score = 100;
  
  // 활동도 (-30점)
  const daysSinceActivity = getDaysSince(study.lastActivityAt);
  if (daysSinceActivity > 30) score -= 30;
  else if (daysSinceActivity > 14) score -= 15;
  else if (daysSinceActivity > 7) score -= 5;
  
  // 멤버 충족률 (-20점)
  const fillRate = study.memberCount / study.maxMembers;
  if (fillRate < 0.2) score -= 20;
  else if (fillRate < 0.5) score -= 10;
  
  // 평점 (-25점)
  if (study.rating < 2.0) score -= 25;
  else if (study.rating < 3.0) score -= 15;
  else if (study.rating < 4.0) score -= 5;
  
  // 신고 이력 (-10점 per 건)
  score -= study.reportCount * 10;
  
  // 콘텐츠 활동 (-15점)
  if (study.messageCount < 10) score -= 15;
  if (study.noticeCount === 0) score -= 10;
  
  return Math.max(score, 0);
}
```

#### 저품질 스터디 목록
```tsx
<LowQualityStudiesList>
  {lowQualityStudies.map(study => (
    <StudyCard key={study.id} study={study}>
      <div className="flex justify-between items-start">
        <div>
          <h3>{study.emoji} {study.name}</h3>
          <p className="text-sm text-gray-600">{study.description}</p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl text-red-500">{study.qualityScore}</div>
          <div className="text-xs text-gray-500">품질 점수</div>
        </div>
      </div>
      
      {/* 문제점 표시 */}
      <div className="mt-3 flex flex-wrap gap-2">
        {study.daysSinceActivity > 30 && (
          <Badge variant="danger">⏰ 30일 이상 활동 없음</Badge>
        )}
        {study.memberFillRate < 0.3 && (
          <Badge variant="warning">👥 멤버 부족 ({study.memberCount}/{study.maxMembers})</Badge>
        )}
        {study.rating < 2.0 && (
          <Badge variant="danger">⭐ 낮은 평점 ({study.rating.toFixed(1)})</Badge>
        )}
        {study.reportCount > 0 && (
          <Badge variant="danger">🚨 신고 {study.reportCount}건</Badge>
        )}
      </div>
      
      {/* 액션 */}
      <div className="mt-3 flex gap-2">
        <Button onClick={() => viewStudyDetail(study.id)} size="sm">
          상세보기
        </Button>
        <Button 
          onClick={() => notifyOwner(study.id)} 
          variant="warning" 
          size="sm"
        >
          OWNER에게 개선 요청
        </Button>
        <Button 
          onClick={() => makePrivate(study.id)} 
          variant="danger" 
          size="sm"
        >
          비공개 전환
        </Button>
      </div>
    </StudyCard>
  ))}
</LowQualityStudiesList>
```

---

## 3. 스터디 상세 조회

### 3.1 스터디 상세 페이지

#### 페이지 경로
```
/admin/studies/:studyId
```

#### 레이아웃
```
┌─────────────────────────────────────────────────────────────┐
│ ← 뒤로가기     스터디 상세: 자바 스터디 모임                 │
├────────────────────────────┬────────────────────────────────┤
│ [왼쪽: 정보 패널]          │ [우측: 빠른 액션 & 메모]       │
│                            │                                │
│ 📊 기본 정보               │ 🛠 빠른 액션                   │
│ ───────────────────        │ ───────────────────            │
│ 📚 이름: 자바 스터디        │ [비공개 전환]                  │
│ 😀 이모지: 💻              │ [스터디 삭제]                  │
│ 👤 OWNER: 홍길동            │ [추천 스터디 설정]             │
│ 📁 카테고리: 프로그래밍     │ [OWNER에게 메시지]             │
│ 👥 멤버: 15/20 (75%)        │ [OWNER 권한 위임]              │
│ ⭐ 평점: 4.5 (10개 리뷰)   │                                │
│ 📅 생성일: 2025-09-01      │ ───────────────────            │
│ 🕐 마지막 활동: 1시간 전   │                                │
│ 🔓 상태: 공개, 모집 중     │ 📝 관리자 메모                 │
│                            │ [텍스트 입력창]                │
│ 📈 활동 통계               │ "2025-11-20: 우수 스터디로     │
│ ───────────────────        │  선정하여 메인 페이지에 노출   │
│ 💬 총 메시지: 1,250건      │  예정. OWNER에게 축하 메시지   │
│ 📁 총 파일: 45개           │  발송 완료"                    │
│ 📢 공지사항: 8개           │ [저장]                         │
│ ✅ 평균 출석률: 85%         │                                │
│ 📋 할일 완료율: 75%         │ ───────────────────            │
│                            │                                │
│ 📊 품질 점수: 92/100       │ 📊 품질 분석                   │
│ [상세 품질 리포트 보기]    │ [차트: 품질 점수 추이]         │
│                            │                                │
│ 👥 멤버 목록 (상위 5명)    │ - 활동도: 95점                 │
│ ───────────────────        │ - 멤버 충족률: 90점            │
│ 1. 홍길동 (OWNER) - 90%    │ - 평점: 95점                   │
│ 2. 김철수 (ADMIN) - 85%    │ - 콘텐츠: 85점                 │
│ 3. 이영희 (MEMBER) - 80%   │                                │
│ 4. 박민수 (MEMBER) - 78%   │                                │
│ 5. 정수진 (MEMBER) - 75%   │                                │
│ [전체 멤버 보기 (15명)]    │                                │
│                            │                                │
│ 🚨 신고 이력               │                                │
│ ───────────────────        │                                │
│ 신고 접수: 0건             │                                │
│ (신고 없음)                │                                │
│                            │                                │
│ 🔧 관리자 조치 이력        │                                │
│ ───────────────────        │                                │
│ 2025-11-20: 추천 스터디 설정│                               │
│ 담당자: admin1             │                                │
│                            │                                │
└────────────────────────────┴────────────────────────────────┘
```

### 3.2 데이터 구조

```typescript
interface StudyDetailData {
  // 기본 정보
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  subCategory: string;
  tags: string[];
  
  // OWNER 정보
  owner: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  
  // 멤버 정보
  memberCount: number;
  maxMembers: number;
  memberFillRate: number;
  
  // 평가
  rating: number;
  reviewCount: number;
  
  // 상태
  isPublic: boolean;
  isRecruiting: boolean;
  isFeatured: boolean;
  featuredUntil?: string;
  
  // 날짜
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  
  // 활동 통계
  stats: {
    messageCount: number;
    fileCount: number;
    noticeCount: number;
    avgAttendanceRate: number;
    taskCompletionRate: number;
    eventCount: number;
  };
  
  // 품질 점수
  qualityScore: number;
  qualityBreakdown: {
    activity: number;      // 활동도
    memberFill: number;    // 멤버 충족률
    rating: number;        // 평점
    content: number;       // 콘텐츠 활동
  };
  
  // 멤버 목록 (상위 5명)
  topMembers: {
    id: string;
    name: string;
    avatar: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    attendanceRate: number;
  }[];
  
  // 신고 이력
  reportCount: number;
  reports: Report[];
  
  // 관리자 조치 이력
  adminActions: AdminAction[];
  
  // 관리자 메모
  adminNotes?: string;
}
```

### 3.3 품질 리포트

```tsx
<QualityReportCard>
  <h3>품질 분석 리포트</h3>
  
  {/* 종합 점수 */}
  <div className="flex items-center justify-between">
    <span>종합 품질 점수</span>
    <div className="flex items-center gap-2">
      <span className="text-3xl font-bold text-green-600">
        {study.qualityScore}
      </span>
      <span className="text-gray-500">/ 100</span>
    </div>
  </div>
  
  {/* 세부 점수 */}
  <div className="mt-4 space-y-3">
    <QualityMetric 
      label="활동도"
      score={study.qualityBreakdown.activity}
      description="최근 활동 빈도"
    />
    <QualityMetric 
      label="멤버 충족률"
      score={study.qualityBreakdown.memberFill}
      description={`${study.memberCount}/${study.maxMembers} (${(study.memberFillRate * 100).toFixed(0)}%)`}
    />
    <QualityMetric 
      label="평점"
      score={study.qualityBreakdown.rating}
      description={`⭐ ${study.rating.toFixed(1)} (${study.reviewCount}개 리뷰)`}
    />
    <QualityMetric 
      label="콘텐츠 활동"
      score={study.qualityBreakdown.content}
      description={`메시지 ${study.stats.messageCount}건, 파일 ${study.stats.fileCount}개`}
    />
  </div>
  
  {/* 추천 사항 */}
  {study.qualityScore < 70 && (
    <Alert variant="warning" className="mt-4">
      <h4>개선 권장 사항</h4>
      <ul>
        {study.qualityBreakdown.activity < 70 && (
          <li>• 활동이 부족합니다. OWNER에게 활성화 권유 메시지 발송을 고려하세요.</li>
        )}
        {study.memberFillRate < 0.5 && (
          <li>• 멤버 충족률이 낮습니다. 모집 홍보가 필요할 수 있습니다.</li>
        )}
        {study.rating < 3.0 && (
          <li>• 평점이 낮습니다. 스터디 품질 개선이 필요합니다.</li>
        )}
      </ul>
    </Alert>
  )}
  
  {/* 우수 스터디 추천 */}
  {study.qualityScore >= 80 && !study.isFeatured && (
    <Alert variant="success" className="mt-4">
      <h4>⭐ 우수 스터디</h4>
      <p>이 스터디는 품질 점수가 높습니다. 추천 스터디로 설정하시겠습니까?</p>
      <Button onClick={() => setFeatured(study.id)} className="mt-2">
        추천 스터디로 설정
      </Button>
    </Alert>
  )}
</QualityReportCard>
```

---

## 4. 스터디 품질 관리

### 4.1 품질 점수 계산 알고리즘

```typescript
// 품질 점수 계산 (0-100점)
function calculateDetailedQualityScore(study: Study): QualityScore {
  const scores = {
    activity: 0,
    memberFill: 0,
    rating: 0,
    content: 0,
  };
  
  // 1. 활동도 (0-30점)
  const daysSinceActivity = getDaysSince(study.lastActivityAt);
  if (daysSinceActivity <= 1) scores.activity = 30;
  else if (daysSinceActivity <= 3) scores.activity = 25;
  else if (daysSinceActivity <= 7) scores.activity = 20;
  else if (daysSinceActivity <= 14) scores.activity = 10;
  else if (daysSinceActivity <= 30) scores.activity = 5;
  else scores.activity = 0;
  
  // 2. 멤버 충족률 (0-25점)
  const fillRate = study.memberCount / study.maxMembers;
  if (fillRate >= 0.8) scores.memberFill = 25;
  else if (fillRate >= 0.6) scores.memberFill = 20;
  else if (fillRate >= 0.4) scores.memberFill = 15;
  else if (fillRate >= 0.2) scores.memberFill = 10;
  else scores.memberFill = 5;
  
  // 3. 평점 (0-25점)
  if (study.rating >= 4.5) scores.rating = 25;
  else if (study.rating >= 4.0) scores.rating = 20;
  else if (study.rating >= 3.5) scores.rating = 15;
  else if (study.rating >= 3.0) scores.rating = 10;
  else if (study.rating >= 2.0) scores.rating = 5;
  else scores.rating = 0;
  
  // 4. 콘텐츠 활동 (0-20점)
  let contentScore = 0;
  if (study.stats.messageCount > 100) contentScore += 8;
  else if (study.stats.messageCount > 50) contentScore += 5;
  else if (study.stats.messageCount > 10) contentScore += 3;
  
  if (study.stats.fileCount > 20) contentScore += 6;
  else if (study.stats.fileCount > 10) contentScore += 4;
  else if (study.stats.fileCount > 5) contentScore += 2;
  
  if (study.stats.noticeCount > 5) contentScore += 6;
  else if (study.stats.noticeCount > 2) contentScore += 4;
  else if (study.stats.noticeCount > 0) contentScore += 2;
  
  scores.content = contentScore;
  
  // 5. 신고 이력 페널티 (-10점 per 건)
  const penalty = study.reportCount * 10;
  
  // 종합 점수
  const total = scores.activity + scores.memberFill + scores.rating + scores.content - penalty;
  
  return {
    total: Math.max(Math.min(total, 100), 0),
    breakdown: scores,
  };
}
```

### 4.2 OWNER에게 개선 요청

```tsx
<Button 
  onClick={() => sendImprovementRequest(study.id)}
  variant="warning"
>
  OWNER에게 개선 요청 발송
</Button>

// 모달
<ImprovementRequestModal study={study}>
  <h2>스터디 개선 요청</h2>
  
  <StudyInfoCard study={study} />
  
  {/* 문제점 자동 선택 */}
  <div>
    <h4>감지된 문제점</h4>
    <CheckboxGroup value={issues}>
      {study.qualityBreakdown.activity < 70 && (
        <Checkbox value="low_activity">
          ⏰ 활동 부족 (최근 {daysSinceActivity}일간 활동 없음)
        </Checkbox>
      )}
      {study.memberFillRate < 0.5 && (
        <Checkbox value="low_members">
          👥 멤버 부족 (현재 {study.memberCount}/{study.maxMembers})
        </Checkbox>
      )}
      {study.rating < 3.0 && (
        <Checkbox value="low_rating">
          ⭐ 낮은 평점 ({study.rating.toFixed(1)})
        </Checkbox>
      )}
    </CheckboxGroup>
  </div>
  
  {/* 추가 메시지 */}
  <FormGroup>
    <Label>추가 메시지 (선택)</Label>
    <Textarea 
      placeholder="OWNER에게 전달할 추가 메시지를 입력하세요"
      value={additionalMessage}
      onChange={(e) => setAdditionalMessage(e.target.value)}
    />
  </FormGroup>
  
  {/* 이메일 템플릿 미리보기 */}
  <div>
    <h4>이메일 미리보기</h4>
    <EmailPreview>
      <p>안녕하세요, {study.owner.name}님</p>
      <p>
        {study.name} 스터디의 활동 상태를 확인한 결과,
        다음과 같은 개선이 필요한 부분이 있습니다:
      </p>
      <ul>
        {issues.map(issue => (
          <li key={issue}>{getIssueDescription(issue)}</li>
        ))}
      </ul>
      <p>스터디 품질 개선을 위해 노력 부탁드립니다.</p>
    </EmailPreview>
  </div>
  
  <ButtonGroup>
    <Button onClick={closeModal} variant="ghost">취소</Button>
    <Button onClick={sendRequest} variant="warning">발송</Button>
  </ButtonGroup>
</ImprovementRequestModal>
```

---

## 5. 추천 스터디 시스템

### 5.1 추천 스터디 선정 기준

```typescript
// 자동 추천 자격 검증
function isEligibleForFeatured(study: Study): boolean {
  return (
    study.qualityScore >= 80 &&
    study.rating >= 4.0 &&
    study.reviewCount >= 5 &&
    study.memberCount >= study.maxMembers * 0.7 &&
    study.stats.avgAttendanceRate >= 0.8 &&
    study.reportCount === 0 &&
    study.daysSinceLastActivity <= 7
  );
}

// 추천 우선순위 계산
function calculateFeaturedPriority(study: Study): number {
  let priority = 0;
  
  // 품질 점수 (50%)
  priority += study.qualityScore * 0.5;
  
  // 평점 (20%)
  priority += (study.rating / 5) * 100 * 0.2;
  
  // 활동도 (20%)
  const activityScore = Math.max(0, 100 - study.daysSinceLastActivity * 3);
  priority += activityScore * 0.2;
  
  // 멤버 충족률 (10%)
  priority += study.memberFillRate * 100 * 0.1;
  
  return priority;
}
```

### 5.2 추천 스터디 설정

```tsx
<Button 
  onClick={() => setFeaturedStudy(study.id)}
  variant="primary"
  disabled={!isEligibleForFeatured(study)}
>
  ⭐ 추천 스터디로 설정
</Button>

// 모달
<SetFeaturedModal study={study}>
  <h2>추천 스터디 설정</h2>
  
  <StudyInfoCard study={study} />
  
  {/* 자격 검증 */}
  <div>
    <h4>추천 자격 확인</h4>
    <CheckList>
      <CheckItem checked={study.qualityScore >= 80}>
        품질 점수 80점 이상 (현재: {study.qualityScore}점)
      </CheckItem>
      <CheckItem checked={study.rating >= 4.0}>
        평점 4.0 이상 (현재: {study.rating.toFixed(1)})
      </CheckItem>
      <CheckItem checked={study.reviewCount >= 5}>
        리뷰 5개 이상 (현재: {study.reviewCount}개)
      </CheckItem>
      <CheckItem checked={study.memberFillRate >= 0.7}>
        멤버 충족률 70% 이상 (현재: {(study.memberFillRate * 100).toFixed(0)}%)
      </CheckItem>
      <CheckItem checked={study.reportCount === 0}>
        신고 이력 없음
      </CheckItem>
    </CheckList>
  </div>
  
  {/* 추천 기간 설정 */}
  <FormGroup>
    <Label>추천 기간 *</Label>
    <Select value={featuredDuration}>
      <option value="7">7일</option>
      <option value="14" selected>14일 (권장)</option>
      <option value="30">30일</option>
      <option value="0">무기한</option>
    </Select>
  </FormGroup>
  
  {/* 추천 사유 */}
  <FormGroup>
    <Label>추천 사유 *</Label>
    <Textarea 
      placeholder="이 스터디를 추천하는 이유를 입력하세요"
      value={featuredReason}
      onChange={(e) => setFeaturedReason(e.target.value)}
    />
  </FormGroup>
  
  {/* OWNER에게 축하 메시지 */}
  <FormGroup>
    <Checkbox checked={sendCongratulations}>
      OWNER에게 축하 메시지 발송
    </Checkbox>
  </FormGroup>
  
  <ButtonGroup>
    <Button onClick={closeModal} variant="ghost">취소</Button>
    <Button 
      onClick={submitSetFeatured} 
      variant="primary"
      disabled={!isEligibleForFeatured(study)}
    >
      추천 스터디 설정
    </Button>
  </ButtonGroup>
</SetFeaturedModal>
```

### 5.3 추천 스터디 목록 관리

```tsx
<FeaturedStudiesPage>
  <h2>추천 스터디 관리</h2>
  
  {/* 현재 추천 중인 스터디 */}
  <section>
    <h3>현재 추천 중 ({featuredStudies.length}개)</h3>
    
    <div className="grid grid-cols-3 gap-4">
      {featuredStudies.map(study => (
        <FeaturedStudyCard key={study.id} study={study}>
          <StudyBadge study={study} />
          
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              추천 종료: {formatDate(study.featuredUntil)}
            </span>
          </div>
          
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => extendFeatured(study.id)}>
              기간 연장
            </Button>
            <Button 
              size="sm" 
              variant="danger" 
              onClick={() => removeFeatured(study.id)}
            >
              추천 해제
            </Button>
          </div>
        </FeaturedStudyCard>
      ))}
    </div>
  </section>
  
  {/* 추천 후보 스터디 */}
  <section className="mt-8">
    <h3>추천 후보 스터디</h3>
    <p className="text-sm text-gray-600">
      자동으로 선정된 우수 스터디 목록입니다.
    </p>
    
    <div className="mt-4 space-y-4">
      {eligibleStudies.map(study => (
        <StudyRow key={study.id} study={study}>
          <div className="flex items-center justify-between">
            <div>
              <h4>{study.emoji} {study.name}</h4>
              <p className="text-sm text-gray-600">
                품질: {study.qualityScore}점 | 평점: {study.rating.toFixed(1)} |
                우선순위: {calculateFeaturedPriority(study).toFixed(0)}
              </p>
            </div>
            
            <Button onClick={() => setFeaturedStudy(study.id)}>
              추천 스터디로 설정
            </Button>
          </div>
        </StudyRow>
      ))}
    </div>
  </section>
</FeaturedStudiesPage>
```

---

## 6. OWNER 권한 위임

### 6.1 권한 위임 사유

- OWNER 장기 부재 (30일 이상 미접속)
- OWNER 계정 정지
- OWNER 자진 요청
- 스터디 분쟁 중재

### 6.2 권한 위임 프로세스

```tsx
<Button 
  onClick={() => transferOwnership(study.id)}
  variant="warning"
  disabled={session.user.role !== "SYSTEM_ADMIN"}
>
  🔄 OWNER 권한 위임
</Button>

// 모달
<TransferOwnershipModal study={study}>
  <h2>OWNER 권한 위임</h2>
  
  <Alert variant="warning">
    ⚠️ 이 기능은 SYSTEM_ADMIN만 사용할 수 있습니다.
    신중하게 결정해 주세요.
  </Alert>
  
  <StudyInfoCard study={study} />
  
  {/* 현재 OWNER */}
  <div>
    <h4>현재 OWNER</h4>
    <UserCard user={study.owner} />
    <div className="mt-2 text-sm text-gray-600">
      마지막 로그인: {formatDate(study.owner.lastLoginAt)}
      ({getDaysSince(study.owner.lastLoginAt)}일 전)
    </div>
  </div>
  
  {/* 새 OWNER 선택 */}
  <FormGroup>
    <Label>새 OWNER 선택 *</Label>
    <Select value={newOwnerId} onChange={setNewOwnerId}>
      <option value="">선택하세요</option>
      {study.admins.map(admin => (
        <option key={admin.id} value={admin.id}>
          {admin.name} ({admin.email}) - ADMIN
        </option>
      ))}
      {study.activeMembers.map(member => (
        <option key={member.id} value={member.id}>
          {member.name} ({member.email}) - MEMBER (활동도: {member.attendanceRate}%)
        </option>
      ))}
    </Select>
    <span className="text-sm text-gray-500">
      💡 팁: ADMIN 또는 활동도가 높은 MEMBER를 선택하세요
    </span>
  </FormGroup>
  
  {/* 권한 위임 사유 */}
  <FormGroup>
    <Label>위임 사유 *</Label>
    <Textarea 
      placeholder="OWNER 권한을 위임하는 이유를 구체적으로 입력하세요"
      value={transferReason}
      onChange={(e) => setTransferReason(e.target.value)}
      rows={4}
    />
  </FormGroup>
  
  {/* 알림 옵션 */}
  <FormGroup>
    <Checkbox checked={notifyOldOwner}>
      이전 OWNER에게 알림
    </Checkbox>
    <Checkbox checked={notifyNewOwner}>
      새 OWNER에게 알림
    </Checkbox>
    <Checkbox checked={notifyAllMembers}>
      모든 멤버에게 공지
    </Checkbox>
  </FormGroup>
  
  <Alert variant="info">
    📌 권한 위임 후:
    <ul>
      <li>• 이전 OWNER는 ADMIN으로 강등됩니다</li>
      <li>• 새 OWNER는 모든 스터디 관리 권한을 갖게 됩니다</li>
      <li>• 변경 사항은 즉시 적용됩니다</li>
    </ul>
  </Alert>
  
  <ButtonGroup>
    <Button onClick={closeModal} variant="ghost">취소</Button>
    <Button 
      onClick={submitTransfer} 
      variant="warning"
      disabled={!newOwnerId || !transferReason.trim()}
    >
      권한 위임 실행
    </Button>
  </ButtonGroup>
</TransferOwnershipModal>
```

---

## 7. API 명세

### 7.1 스터디 목록 조회

```http
GET /api/admin/studies
```

**Query Parameters**: `StudySearchParams` 참조

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "study_123",
      "name": "자바 스터디",
      "emoji": "💻",
      "description": "...",
      "category": "프로그래밍",
      "owner": {
        "id": "user_123",
        "name": "홍길동",
        "email": "hong@coup.com"
      },
      "memberCount": 15,
      "maxMembers": 20,
      "rating": 4.5,
      "reviewCount": 10,
      "isPublic": true,
      "isRecruiting": true,
      "isFeatured": false,
      "qualityScore": 92,
      "reportCount": 0,
      "lastActivityAt": "2025-11-27T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 850,
    "totalPages": 43
  }
}
```

### 7.2 스터디 상세 조회

```http
GET /api/admin/studies/:studyId
```

**Response**: `StudyDetailData` 참조

### 7.3 스터디 삭제

```http
DELETE /api/admin/studies/:studyId
```

**Request Body**:
```json
{
  "reason": "부적절한 스터디 운영으로 삭제",
  "notifyOwner": true,
  "notifyMembers": true
}
```

### 7.4 공개/비공개 전환

```http
PATCH /api/admin/studies/:studyId/visibility
```

**Request Body**:
```json
{
  "isPublic": false,
  "reason": "신고 접수로 인한 임시 비공개 처리"
}
```

### 7.5 추천 스터디 설정

```http
POST /api/admin/studies/:studyId/feature
```

**Request Body**:
```json
{
  "duration": 14,
  "reason": "우수한 활동과 높은 품질로 추천",
  "sendCongratulations": true
}
```

### 7.6 OWNER 권한 위임

```http
POST /api/admin/studies/:studyId/transfer-owner
```

**Request Body**:
```json
{
  "newOwnerId": "user_456",
  "reason": "이전 OWNER 30일 이상 미접속으로 권한 위임",
  "notifyOldOwner": true,
  "notifyNewOwner": true,
  "notifyAllMembers": true
}
```

### 7.7 저품질 스터디 목록

```http
GET /api/admin/studies/low-quality
```

**Query Parameters**:
```typescript
{
  threshold?: number;  // 품질 점수 임계값 (기본: 50)
  limit?: number;
}
```

---

**문서 버전**: 1.0  
**작성 완료일**: 2025-11-27  
**다음 문서**: `03-report-management.md`

