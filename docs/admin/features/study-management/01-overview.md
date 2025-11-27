# 스터디 관리 - 01: 개요

> **파일**: 01-overview.md  
> **분량**: ~900줄

---

## 1. 기능 개요

스터디 관리 시스템은 플랫폼에 생성된 모든 스터디 그룹의 생명주기를 관리하고, 그 품질을 보장하기 위한 핵심 관리 도구입니다. 관리자는 이 시스템을 통해 사용자들이 양질의 스터디에 참여하고 건전한 활동을 이어갈 수 있도록 지원합니다.

주요 목표는 다음과 같습니다.

- **품질 유지**: 비활성 스터디나 사용자 만족도가 낮은 스터디를 식별하고, 개선을 유도하거나 제재합니다.
- **건전성 확보**: 커뮤니티 가이드라인을 위반하는 스터디(예: 광고, 불법 활동)를 신속하게 발견하고 조치합니다.
- **콘텐츠 추천**: 활동이 활발하고 평가가 좋은 우수 스터디를 발굴하여 사용자들에게 '추천 스터디'로 노출시킵니다.
- **문제 해결**: 스터디 소유자의 부재, 멤버 간 분쟁 등 스터디 내에서 발생하는 다양한 문제에 개입하고 해결합니다.

---

## 2. 데이터 모델

스터디 관리를 위해 `Study` 모델을 중심으로 여러 관련 모델들이 유기적으로 연결됩니다.

### 2.1 `Study` 모델

스터디의 핵심 정보를 담고 있습니다. 관리 시스템에서는 `qualityScore`, `isFeatured`, `reportCount` 등의 필드가 중요하게 사용됩니다.

```prisma
model Study {
  id          String   @id @default(cuid())
  name        String
  description String   @db.Text
  category    String
  
  // 관리용 필드
  isPublic    Boolean  @default(true)
  isFeatured  Boolean  @default(false) // 추천 스터디 여부
  qualityScore Int     @default(70)   // 품질 점수 (0-100)
  
  // 통계 관련 필드
  memberCount Int      @default(1)
  maxMembers  Int
  rating      Float    @default(0)
  reviewCount Int      @default(0)
  reportCount Int      @default(0)   // 신고된 횟수
  
  // 관계
  owner       User     @relation("OwnedStudies", fields: [ownerId], references: [id])
  ownerId     String
  members     StudyMember[]
  // ... 기타 관계
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastActivityAt DateTime @default(now()) // 최근 활동 시간

  @@index([category, isPublic])
  @@index([qualityScore])
  @@index([isFeatured])
}
```

### 2.2 `StudyMember` 모델

스터디에 참여하는 멤버의 정보를 정의합니다.

```prisma
model StudyMember {
  study   Study  @relation(fields: [studyId], references: [id])
  studyId String
  user    User   @relation(fields: [userId], references: [id])
  userId  String
  role    MemberRole // LEADER, ADMIN, MEMBER
  
  joinedAt DateTime @default(now())

  @@id([studyId, userId])
}
```

### 2.3 `StudyStats` 모델 (예시)

통계 정보를 별도 모델로 분리하여 관리할 수도 있습니다. 이는 `Study` 모델의 비대화를 막고, 통계 관련 쿼리 성능을 향상시킬 수 있습니다.

```prisma
model StudyStats {
  studyId       String @id
  study         Study  @relation(fields: [studyId], references: [id])
  
  messageCount  Int    @default(0)
  fileCount     Int    @default(0)
  noticeCount   Int    @default(0)
  
  // ... 주간/월간 활성 사용자 수 등
  
  updatedAt     DateTime @updatedAt
}
```

---

## 3. 역할 및 권한

스터디 관리에 대한 권한은 관리자 등급에 따라 차등 부여됩니다.

| 기능 | ADMIN | SYSTEM_ADMIN | 설명 |
|---|---|---|---|
| 스터디 목록/상세 조회 | ✅ | ✅ | 모든 스터디 정보를 조회할 수 있습니다. |
| 스터디 공개/비공개 전환 | ✅ | ✅ | 스터디의 노출 여부를 제어합니다. |
| 추천 스터디 지정/해제 | ✅ | ✅ | 우수 스터디를 추천 목록에 추가/제외합니다. |
| 스터디 삭제 | ❌ | ✅ | 플랫폼에서 스터디를 영구적으로 삭제합니다. 데이터 무결성에 큰 영향을 주므로 최상위 관리자만 가능합니다. |
| 스터디 소유자 위임 | ❌ | ✅ | 스터디 소유자의 계정이 삭제되거나 장기 비활성 상태일 때, 다른 멤버에게 소유권을 이전합니다. |

`requireAdmin` 또는 `requireSystemAdmin` 헬퍼 함수를 각 API 엔드포인트에 적용하여 권한을 제어합니다.

```typescript
// 예: 스터디 삭제 API
// app/api/admin/studies/[studyId]/route.ts

import { requireSystemAdmin } from '@/lib/adminAuth';

export async function DELETE(request: Request, { params }) {
  await requireSystemAdmin(); // SYSTEM_ADMIN 권한 필요
  
  // ... 삭제 로직
}
```

---

## 4. 주요 관리 시나리오

1.  **저품질 스터디 관리**
    - **탐지**: '품질 점수'가 특정 기준(예: 40점) 이하인 스터디를 '저품질' 탭에서 필터링합니다.
    - **분석**: 해당 스터디의 상세 페이지에서 활동이 저조한 원인(낮은 충원율, 저조한 활동 등)을 파악합니다.
    - **조치**: 스터디 소유자에게 개선을 유도하는 알림을 보내거나, 장기간 개선이 없을 경우 스터디를 비공개 처리합니다.

2.  **분쟁 및 문제 스터디 처리**
    - **탐지**: 특정 스터디에 대한 신고가 단기간에 급증하는 것을 모니터링합니다.
    - **분석**: 신고 내용과 스터디 내 채팅/게시글을 검토하여 문제 상황(분쟁, 광고, 가이드라인 위반)을 파악합니다.
    - **조치**: 문제의 원인이 된 사용자를 제재하고, 필요한 경우 스터디를 일시적으로 비공개하거나, 심각한 경우 `SYSTEM_ADMIN`이 스터디를 삭제합니다.

3.  **우수 스터디 발굴 및 추천**
    - **탐지**: '품질 점수'가 높고 사용자 평점이 좋은 스터디를 필터링합니다.
    - **검증**: `isEligibleForFeatured` 조건을 만족하는지 확인하고, 관리자가 직접 스터디 내용을 검토하여 최종 결정합니다.
    - **조치**: '추천 스터디'로 지정하여 메인 페이지나 스터디 검색 결과 상단에 노출시켜 다른 사용자들이 쉽게 발견할 수 있도록 합니다.

---

**다음**: [02-list-api.md](02-list-api.md)

**작성일**: 2025-11-28
