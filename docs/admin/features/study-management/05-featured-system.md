# 스터디 관리 - 05: 추천 스터디 시스템

> **파일**: 05-featured-system.md  
> **분량**: ~800줄

---

## 1. 시스템 개요

추천 스터디 시스템은 관리자가 직접 선정한 양질의 스터디를 플랫폼의 주요 영역(예: 메인 페이지, 스터디 검색 결과 상단)에 노출시켜, 사용자들의 참여를 유도하고 스터디 생태계의 질적 상향 평준화를 도모하는 기능입니다.

- **선정 방식**: 시스템이 제안하는 자격 요건을 바탕으로 관리자가 최종 검토 후 수동으로 지정합니다.
- **자격 검증**: 추천 후보가 되기 위한 최소한의 객관적인 기준(품질 점수, 평점 등)을 정의합니다.
- **관리**: 관리자는 언제든지 스터디를 추천 목록에 추가하거나 제외할 수 있습니다.

---

## 2. 추천 자격 검증

모든 스터디를 추천 후보로 고려할 수 없으므로, `isEligibleForFeatured` 함수를 통해 추천 가능한 최소 자격 요건을 검증합니다. 이 검증을 통과한 스터디에 대해서만 관리자 UI에 '추천하기' 버튼이 활성화됩니다.

### 2.1 자격 요건

- **품질 점수**: 80점 이상
- **사용자 평점**: 4.0 이상
- **최소 리뷰 수**: 5개 이상
- **멤버 충원율**: 정원의 70% 이상
- **신고 이력**: 0건

> 이 기준은 서비스 정책에 따라 언제든지 조정될 수 있습니다.

### 2.2 구현 예시: `isEligibleForFeatured` 함수

**`lib/admin/featuredStudy.ts`**
```typescript
import { Study } from '@prisma/client';

type StudyWithStats = Study & {
  // 통계 관련 필드
};

export function isEligibleForFeatured(study: StudyWithStats): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (study.qualityScore < 80) {
    reasons.push(`품질 점수 미달 (현재 ${study.qualityScore}점, 80점 이상 필요)`);
  }
  if (study.rating < 4.0) {
    reasons.push(`사용자 평점 미달 (현재 ${study.rating}점, 4.0 이상 필요)`);
  }
  if (study.reviewCount < 5) {
    reasons.push(`리뷰 수 부족 (현재 ${study.reviewCount}개, 5개 이상 필요)`);
  }
  if (study.memberCount < study.maxMembers * 0.7) {
    reasons.push('멤버 충원율 미달 (정원의 70% 이상 필요)');
  }
  if (study.reportCount > 0) {
    reasons.push('신고 이력이 없어야 함');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}
```
> 반환값에 '자격 미달 사유'(`reasons`)를 포함하여, 관리자가 왜 추천할 수 없는지 UI에서 명확히 인지할 수 있도록 돕습니다.

---

## 3. API 명세

### 3.1 추천 스터디 지정

#### **엔드포인트**
```http
POST /api/admin/studies/{studyId}/feature
```

#### **로직**
1.  `requireAdmin`으로 권한을 확인합니다.
2.  `studyId`로 스터디 정보를 조회합니다.
3.  `isEligibleForFeatured` 함수로 자격 요건을 검증합니다.
4.  자격 미달 시 400 Bad Request 에러를 반환합니다.
5.  `isFeatured` 필드를 `true`로 업데이트합니다.
6.  감사 로그에 "추천 스터디 지정" 액션을 기록합니다.

#### **Response (200 OK)**
```json
{
  "success": true,
  "message": "스터디를 추천 목록에 추가했습니다."
}
```

### 3.2 추천 스터디 해제

#### **엔드포인트**
```http
DELETE /api/admin/studies/{studyId}/feature
```

#### **로직**
1.  `requireAdmin`으로 권한을 확인합니다.
2.  `isFeatured` 필드를 `false`로 업데이트합니다.
3.  감사 로그에 "추천 스터디 해제" 액션을 기록합니다.

#### **Response (200 OK)**
```json
{
  "success": true,
  "message": "스터디를 추천 목록에서 제외했습니다."
}
```

---

## 4. 구현 예시

### 4.1 Server-side: 추천 지정 API

**`app/api/admin/studies/[studyId]/feature/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { isEligibleForFeatured } from '@/lib/admin/featuredStudy';
import { logAdminAction } from '@/lib/admin/auditLog';

// POST 핸들러 (추천 지정)
export async function POST(
  request: Request,
  { params }: { params: { studyId: string } }
) {
  const session = await requireAdmin();
  const { studyId } = params;

  const study = await prisma.study.findUnique({ where: { id: studyId } });
  if (!study) {
    return NextResponse.json({ error: 'Study not found' }, { status: 404 });
  }

  const eligibility = isEligibleForFeatured(study);
  if (!eligibility.eligible) {
    return NextResponse.json({
      error: 'Not eligible for featured',
      reasons: eligibility.reasons,
    }, { status: 400 });
  }

  await prisma.study.update({
    where: { id: studyId },
    data: { isFeatured: true },
  });

  await logAdminAction({
    adminId: session.user.id,
    action: 'STUDY_FEATURED',
    targetId: studyId,
    targetName: study.name,
  });

  return NextResponse.json({ success: true });
}

// DELETE 핸들러 (추천 해제)
export async function DELETE(
  request: Request,
  { params }: { params: { studyId: string } }
) {
    const session = await requireAdmin();
    const { studyId } = params;

    const study = await prisma.study.update({
        where: { id: studyId },
        data: { isFeatured: false },
    });

    await logAdminAction({
        adminId: session.user.id,
        action: 'STUDY_UNFEATURED',
        targetId: studyId,
        targetName: study.name,
    });

    return NextResponse.json({ success: true });
}
```

### 4.2 Client-side: 관리자 UI

스터디 상세 페이지에서 `isEligibleForFeatured` 함수의 반환값을 사용하여 조건부 렌더링을 구현합니다.

```tsx
function StudyDetailActions({ study }) {
  const eligibility = isEligibleForFeatured(study);

  const handleFeature = async () => {
    // POST /api/admin/studies/{study.id}/feature 호출
  };

  const handleUnfeature = async () => {
    // DELETE /api/admin/studies/{study.id}/feature 호출
  };

  if (study.isFeatured) {
    return <button onClick={handleUnfeature}>추천 해제하기</button>;
  }

  return (
    <div>
      <button onClick={handleFeature} disabled={!eligibility.eligible}>
        추천하기
      </button>
      {!eligibility.eligible && (
        <div>
          <p>추천할 수 없는 이유:</p>
          <ul>
            {eligibility.reasons.map(reason => <li key={reason}>{reason}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## 5. 테스트 시나리오

- **자격 검증 단위 테스트**:
  - `isEligibleForFeatured` 함수에 대해, 자격 요건을 모두 충족하는 스터디 객체를 전달했을 때 `{ eligible: true, reasons: [] }`가 반환되는지 확인.
  - 품질 점수만 낮은 객체를 전달했을 때, `eligible`이 `false`이고 `reasons` 배열에 '품질 점수 미달' 사유가 포함되는지 확인.
- **API 통합 테스트**:
  - **성공**: 자격 요건을 충족하는 스터디에 대해 `POST /feature` 요청 시, 200 OK 응답과 함께 DB의 `isFeatured` 필드가 `true`로 변경되는지 확인.
  - **실패**: 자격 미달 스터디에 대해 `POST /feature` 요청 시, 400 Bad Request 응답과 함께 미달 사유가 반환되는지 확인.
  - **해제**: `DELETE /feature` 요청 시, `isFeatured` 필드가 `false`로 변경되는지 확인.
- **UI 테스트**:
  - 스터디 상세 페이지에서 자격 미달 스터디의 '추천하기' 버튼이 비활성화되고, 미달 사유가 올바르게 표시되는지 확인.

---

**이전**: [04-quality-system.md](04-quality-system.md)  
**다음**: [06-moderation.md](06-moderation.md)

**작성일**: 2025-11-28
