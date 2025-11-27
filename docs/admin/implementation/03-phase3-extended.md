# 구현 가이드 - Phase 3: 확장 기능 (Week 5-6)

> **파일**: 03-phase3-extended.md  
> **분량**: ~1000줄
> **기간**: Week 5 ~ Week 6

---

## 1. Phase 3 목표

Phase 3에서는 관리자 시스템의 기능을 확장하여 **스터디 관리**와 **콘텐츠 모더레이션**을 구현합니다. 이 단계는 서비스의 질적 수준을 유지하고 사용자를 유해 콘텐츠로부터 보호하는 데 중점을 둡니다.

### 완료 기준
- ✅ **스터디 관리**: 스터디 목록 조회, 검색, 필터링, 상세 조회가 가능하다.
- ✅ **품질 관리**: 모든 스터디에 대해 '품질 점수'가 주기적으로 계산 및 업데이트된다.
- ✅ **추천 관리**: 관리자가 특정 스터디를 '추천 스터디'로 지정/해제할 수 있다.
- ✅ **콘텐츠 모더레이션**: 신고된 메시지와 파일을 조회하고 삭제할 수 있다.
- ✅ **자동화**: 혐오 발언 감지 모델과 키워드 필터를 통해 유해 콘텐츠가 자동으로 감지되고 플래그 처리된다.
- ✅ **악성 파일 차단**: 파일 업로드 시 VirusTotal API를 연동하여 악성 파일을 스캔하고 차단한다. (선택 사항)

---

## 2. Week 5: 스터디 관리 구현

### 2.1 체크리스트

- [ ] **알고리즘**: `calculateQualityScore()` 스터디 품질 점수 계산 함수 구현.
- [ ] **크론 작업**: 매시간 `updateAllStudyQualityScores()`를 실행하여 모든 스터디의 품질 점수를 업데이트.
- [ ] **API (Study List)**: `GET /api/admin/studies`
  - [ ] 탭 기반 필터 (전체, 활성, 저품질, 추천 등)
  - [ ] 검색 및 카테고리 필터
- [ ] **API (Study Detail)**: `GET /api/admin/studies/[studyId]`
- [ ] **API (Feature/Unfeature)**:
  - [ ] `POST /api/admin/studies/[studyId]/feature`
  - [ ] `DELETE /api/admin/studies/[studyId]/feature`
- [ ] **API (Visibility)**: `PATCH /api/admin/studies/[studyId]/visibility` (공개/비공개 전환)
- [ ] **API (Ownership)**: `POST /api/admin/studies/[studyId]/transfer-owner` (소유자 위임)
- [ ] **Frontend (Study List Page)**: `app/admin/studies/page.tsx`
  - [ ] 탭 UI 및 테이블/카드 뷰 구현
- [ ] **Frontend (Study Detail Page)**: `app/admin/studies/[studyId]/page.tsx`
  - [ ] 품질 리포트 카드, 멤버 목록, 활동 통계 표시

### 2.2 핵심 로직 구현 가이드

#### 스터디 품질 점수 계산 (`calculateQualityScore`)

- **파일**: `lib/admin/studyQuality.ts`
- **로직**:
  - 100점 만점의 점수 기반 시스템을 사용합니다.
  - **평가 항목**:
    - **활동성 (30점)**: 최근 활동(메시지, 공지 등)이 얼마나 오래되었는가? (최근일수록 높은 점수)
    - **충원율 (25점)**: `현재 인원 / 최대 인원` 비율. (높을수록 좋은 점수)
    - **평점 (25점)**: 사용자들이 매긴 스터디 평점.
    - **콘텐츠 활성도 (20점)**: 누적 메시지, 파일, 공지 수.
    - **페널티**: 신고받은 횟수만큼 감점.
  - **주기적 업데이트**: Vercel Cron 또는 `node-cron`을 사용하여 매시간 모든 스터디의 점수를 다시 계산하고 DB에 저장합니다.

**코드 예시**:
```typescript
// lib/admin/studyQuality.ts
export function calculateQualityScore(study: StudyWithStats): number {
  let score = 0;
  // 1. 활동성 점수
  const daysSinceActivity = (new Date() - study.lastActivityAt) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 30 - daysSinceActivity * 2);
  
  // 2. 충원율 점수
  score += (study.memberCount / study.maxMembers) * 25;
  
  // ... 나머지 항목 계산
  
  // 5. 페널티
  score -= study.reportCount * 10;
  
  return Math.max(0, Math.min(score, 100)); // 0~100점 사이로 클램핑
}
```

#### 추천 스터디 자격 검증 (`isEligibleForFeatured`)

- **파일**: `lib/admin/featuredStudy.ts`
- **로직**:
  - 추천 스터디가 되기 위한 최소 조건을 정의합니다.
  - **조건**:
    - 품질 점수 80점 이상
    - 평점 4.0 이상
    - 멤버 5명 이상
    - 신고 이력 0건
- **적용**: 관리자가 추천 버튼을 누를 때 이 함수를 호출하여 자격 여부를 먼저 확인하고, 통과 시에만 추천 상태로 변경합니다.

---

## 3. Week 6: 콘텐츠 모더레이션 구현

### 3.1 체크리스트

- [ ] **혐오 발언 감지 모델 통합**:
  - [ ] `detectHateSpeech()` 함수 구현 (자체 모델 API 호출)
  - [ ] 메시지 생성 시 비동기적으로 호출하여 검사
- [ ] **키워드 필터 시스템**:
  - [ ] 관리자 페이지에서 욕설/금지어 목록 관리 UI
  - [ ] `autoModerateMessage()` 함수 구현
- [ ] **VirusTotal API 통합 (선택)**:
  - [ ] `scanFileWithVirusTotal()` 함수 구현
  - [ ] 파일 업로드 시 비동기적으로 호출하여 검사
- [ ] **API (Moderation Queue)**: `GET /api/admin/moderation/messages`
  - [ ] 신고 또는 자동 감지된 메시지 목록 반환
- [ ] **API (Delete Message/File)**:
  - [ ] `DELETE /api/admin/moderation/messages/[messageId]`
  - [ ] `DELETE /api/admin/moderation/files/[fileId]`
- [ ] **Frontend (Moderation Page)**: `app/admin/moderation/messages/page.tsx`
  - [ ] 검토가 필요한 메시지 목록 UI
  - [ ] 원본 메시지 내용 및 감지 사유 표시
  - [ ] '삭제', '문제없음' 처리 버튼

### 3.2 핵심 로직 구현 가이드

#### 혐오 발언 감지 (`detectHateSpeech`)

- **파일**: `lib/moderation/hateSpeechDetection.ts`
- **로직**:
  1. 외부에서 호스팅되는 혐오 발언 감지 모델의 API 엔드포인트를 호출합니다.
  2. `fetch`를 사용하여 텍스트를 `POST` 요청으로 보냅니다.
  3. API 응답(예: `{ "prediction": "hate", "confidence": 0.95 }`)을 파싱합니다.
  4. 특정 신뢰도(confidence) 임계값(예: 0.8)을 넘는 경우에만 '혐오 발언'으로 간주하고, 결과를 `ModerationLog`와 같은 별도 테이블에 기록하거나 해당 메시지에 플래그를 지정합니다.

**코드 예시**:
```typescript
// lib/moderation/hateSpeechDetection.ts
export async function detectHateSpeech(content: string) {
  try {
    const response = await fetch(process.env.HATE_SPEECH_MODEL_URL, {
      method: 'POST',
      body: JSON.stringify({ text: content }),
    });
    if (!response.ok) return null;
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Hate speech detection failed:", error);
    return null;
  }
}

// 사용처 (메시지 생성 API)
// ...
const detectionResult = await detectHateSpeech(newMessage.content);
if (detectionResult?.isHateSpeech && detectionResult.confidence > 0.8) {
  // 플래그 처리 로직
  await prisma.message.update({
      where: { id: newMessage.id },
      data: { isFlagged: true, flagReason: 'HATE_SPEECH' },
  });
}
```

#### 악성 파일 스캔 (`scanFileWithVirusTotal`)

- **파일**: `lib/moderation/virusScan.ts`
- **로직**:
  1. 사용자가 파일을 업로드하면, 먼저 서버 스토리지(S3 등)에 파일을 저장합니다.
  2. 저장된 파일의 해시(SHA-256)를 계산하거나 파일을 직접 VirusTotal API에 업로드하여 스캔을 요청합니다.
  3. VirusTotal은 스캔 결과를 즉시 반환하지 않을 수 있으므로, **웹훅(Webhook)**을 사용하거나 주기적으로 스캔 결과 API를 **폴링(polling)**해야 합니다.
  4. 스캔 결과 'malicious'로 판명되면, 해당 파일을 즉시 삭제하고 업로드한 사용자에게 경고 및 제재를 가합니다.

---

## 4. 테스트 시나리오

### 4.1 단위 테스트 (Vitest)
- **`calculateQualityScore`**: 다양한 스터디 데이터를 입력하여 점수가 예상 범위 내에서 정확하게 계산되는지 확인.
- **`isEligibleForFeatured`**: 자격 요건을 충족하는/못하는 스터디 객체를 각각 입력하여 `true`/`false`가 올바르게 반환되는지 확인.
- **`autoModerateMessage`**: 욕설이 포함된/포함되지 않은 텍스트를 입력하여 필터링 로직이 정상 동작하는지 확인.

### 4.2 통합 테스트
- **스터디 품질 점수 업데이트**: 크론 작업을 수동으로 트리거한 후, DB에서 `qualityScore` 필드가 업데이트되었는지 확인.
- **콘텐츠 자동 감지**:
  1. 혐오 발언으로 탐지될 만한 텍스트로 메시지를 작성.
  2. 메시지 생성 후, 해당 메시지의 `isFlagged` 필드가 `true`로 변경되었는지 확인.
  3. 관리자 모더레이션 페이지(`GET /api/admin/moderation/messages`)에 해당 메시지가 나타나는지 확인.
- **스터디 추천**:
  1. 자격 미달 스터디를 추천하려고 시도 시 API가 에러를 반환하는지 확인.
  2. 자격 충족 스터디를 추천 시, `isFeatured` 필드가 `true`로 변경되는지 확인.

---

**이전**: [02-phase2-core.md](02-phase2-core.md)  
**다음**: [04-phase4-analytics.md](04-phase4-analytics.md)

**작성일**: 2025-11-28
