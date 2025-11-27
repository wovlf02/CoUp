# 관리자 기능 - 04: 콘텐츠 모더레이션

> **파일**: 04-content-moderation.md
> **상태**: 작성 중

---

## 1. 개요

콘텐츠 모더레이션은 CoUp 플랫폼에서 생성되고 공유되는 모든 콘텐츠(메시지, 파일, 게시글 등)의 건전성을 유지하고 사용자를 보호하기 위한 필수 기능입니다. 이 시스템은 **자동화된 감지**와 **관리자의 수동 처리**를 결합하여 유해하거나 부적절한 콘텐츠를 신속하게 식별하고 조치합니다.

### 주요 기능
- **자동 감지**: AI 모델과 키워드 필터를 통해 혐오 발언, 욕설, 스팸 등을 실시간으로 감지합니다.
- **모더레이션 큐**: 자동 감지되었거나 사용자에 의해 신고된 콘텐츠를 관리자가 검토할 수 있는 대기열 페이지를 제공합니다.
- **콘텐츠 처리**: 관리자가 검토 후 콘텐츠를 삭제하거나 '문제없음'으로 처리합니다.
- **악성 파일 스캔**: 파일 업로드 시 악성코드를 스캔하여 플랫폼의 보안을 강화합니다.

---

## 2. 시스템 설계

### 2.1 자동 감지 워크플로우

```mermaid
graph TD
    A[콘텐츠 생성<br/>(메시지, 파일 등)] --> B{실시간 검사};
    B -- 혐오 발언/욕설 --> C[플래그 처리 및<br/>모더레이션 큐에 추가];
    B -- 악성 파일 의심 --> D[VirusTotal 스캔];
    B -- 정상 --> E[게시 허용];
    D -- 악성 판정 --> F[파일 즉시 삭제 및<br/>업로더에게 경고];
    D -- 안전 판정 --> E;
    C --> G(관리자 검토 및 처리);
```

### 2.2 데이터 모델

모더레이션이 필요한 콘텐츠를 추적하기 위해 `Message` 또는 `File` 모델에 플래그를 추가하거나, 별도의 `ModerationQueue` 테이블을 사용할 수 있습니다.

**`Message` 모델에 플래그 추가 방식:**
```prisma
model Message {
  // ...
  isFlagged   Boolean     @default(false) // 검토 필요 여부 플래그
  flagReason  String?     // 감지된 사유 (예: HATE_SPEECH, SPAM)
  reviewedBy  String?     // 검토한 관리자 ID
  reviewedAt  DateTime?   // 검토 시간
  
  @@index([isFlagged])
}
```

---

## 3. 세부 기능 명세

### 3.1 혐오 발언 감지

- **통합**: 외부 AI 모델(자체 구축 또는 서드파티)의 API를 연동합니다.
- **로직**:
  - 콘텐츠(메시지, 게시글 등) 생성 시, 해당 텍스트를 비동기적으로 AI 모델 API에 전달합니다.
  - API 응답에서 '혐오 발언'일 확률(confidence score)을 받아, 특정 임계값(예: 80%)을 초과하면 `isFlagged`를 `true`로 설정하고 `flagReason`을 기록합니다.
  - 신뢰도가 매우 높은(예: 95% 이상) 경우, 게시를 즉시 차단하고 사용자에게 피드백을 주는 정책도 고려할 수 있습니다.
- **관련 파일**: `lib/moderation/hateSpeechDetection.ts`

### 3.2 키워드 필터 시스템

- **기능**: 관리자가 DB나 별도 설정 파일에 욕설, 광고, 금지어 등의 키워드 목록을 등록하고 관리합니다.
- **로직**:
  - 콘텐츠 생성 시, 등록된 키워드(정규식 포함)가 포함되어 있는지 검사합니다.
  - 키워드가 검출되면 해당 콘텐츠를 모더레이션 큐에 추가하거나, 별표(`***`) 등으로 마스킹 처리합니다.
- **관리 UI**: `app/admin/settings/filters/page.tsx` 에서 관리자가 필터 목록을 직접 추가/수정/삭제할 수 있는 UI를 제공합니다.

### 3.3 악성 파일 스캔 (VirusTotal)

- **통합**: VirusTotal API 키를 사용하여 파일 스캔 기능을 연동합니다.
- **로직**:
  1. 사용자가 파일을 업로드하면, 서버는 파일을 임시 저장소에 저장합니다.
  2. 파일의 해시(SHA-256)를 계산하여 VirusTotal에 이미 분석 리포트가 있는지 먼저 조회합니다.
  3. 리포트가 없으면, 파일을 직접 업로드하여 스캔을 요청합니다.
  4. 스캔 결과는 비동기적으로 반환되므로, 웹훅 또는 주기적인 폴링을 통해 결과를 확인합니다.
  5. 최종 결과 'malicious' 판정이 하나 이상 나오면 파일을 영구 삭제하고, 업로더에게 경고 알림을 보냅니다.
- **관련 파일**: `lib/moderation/virusScan.ts`

### 3.4 모더레이션 큐

- **UI**: `app/admin/moderation/messages/page.tsx`, `.../files/page.tsx`
- **기능**:
  - `isFlagged`가 `true`이고 아직 검토되지 않은(`reviewedAt`이 null인) 콘텐츠 목록을 보여줍니다.
  - 필터: 감지 사유(혐오 발언, 스팸), 날짜 등으로 필터링할 수 있습니다.
  - 각 항목에는 원본 콘텐츠, 감지 사유, 생성자 정보 등이 표시됩니다.
- **액션**:
  - **콘텐츠 삭제**: 관리자가 유해하다고 판단한 콘텐츠를 삭제합니다. API(`DELETE /api/admin/moderation/messages/:id`)를 호출합니다.
  - **문제없음**: 관리자가 문제가 없다고 판단하면, `isFlagged`를 `false`로 변경하고 `reviewedBy`, `reviewedAt`을 기록하여 큐에서 제외시킵니다.

---

## 4. API 명세

```http
# 모더레이션 큐 조회
GET /api/admin/moderation/messages
GET /api/admin/moderation/files

# 콘텐츠 처리
DELETE /api/admin/moderation/messages/{messageId}
DELETE /api/admin/moderation/files/{fileId}
PATCH  /api/admin/moderation/messages/{messageId}/approve # '문제없음' 처리
PATCH  /api/admin/moderation/files/{fileId}/approve
```

---

**이전**: [03-report-management.md](03-report-management.md)
**다음**: [05-analytics.md](05-analytics.md)

**작성일**: 2025-11-28