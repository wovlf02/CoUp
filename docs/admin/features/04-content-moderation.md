# 관리자 기능 - 콘텐츠 모더레이션 상세 명세

> **작성일**: 2025-11-27  
> **영역**: Content Moderation  
> **우선순위**: P1 (중요)

---

## 📋 목차

1. [기능 개요](#1-기능-개요)
2. [메시지 모더레이션](#2-메시지-모더레이션)
3. [파일 모더레이션](#3-파일-모더레이션)
4. [자동 필터 시스템](#4-자동-필터-시스템)
5. [AI 모더레이션](#5-ai-모더레이션)
6. [API 명세](#6-api-명세)

---

## 1. 기능 개요

### 1.1 목적
- 부적절한 콘텐츠 탐지 및 삭제
- 저작권 침해 파일 관리
- 자동 필터링으로 관리자 부담 감소
- 건전한 커뮤니티 환경 유지

### 1.2 핵심 기능
1. **메시지 모더레이션**: 욕설, 스팸, 혐오 표현 탐지
2. **파일 모더레이션**: 저작권 침해, 악성 파일 관리
3. **자동 필터**: 키워드 기반 자동 감지 및 처리
4. **AI 모더레이션**: OpenAI Moderation API 활용
5. **신고 기반 검토**: 사용자 신고 콘텐츠 우선 검토

---

## 2. 메시지 모더레이션

### 2.1 신고된 메시지 목록

```http
GET /api/admin/moderation/messages?type=reported

Response:
{
  data: [
    {
      id: "flagged_msg_123",
      messageId: "msg_123",
      content: "욕설이 포함된 메시지...",
      author: {
        id: "user_123",
        name: "홍길동",
        email: "hong@coup.com"
      },
      study: {
        id: "study_123",
        name: "자바 스터디"
      },
      detectionType: "REPORTED",  // REPORTED | AUTO | AI
      reportCount: 3,
      reportReasons: ["욕설/비속어", "스팸"],
      status: "PENDING",
      createdAt: "2025-11-27T10:00:00Z"
    }
  ]
}
```

### 2.2 자동 필터링

```typescript
// 욕설 사전
const profanityList = [
  { word: '욕설1', severity: 'HIGH', action: 'DELETE' },
  { word: '비속어1', severity: 'MEDIUM', action: 'WARN' },
];

// 자동 처리
function autoModerateMessage(message: string) {
  for (const profanity of profanityList) {
    if (message.includes(profanity.word)) {
      if (profanity.action === 'DELETE') {
        deleteMessage();
        warnUser();
      }
    }
  }
}
```

### 2.3 메시지 삭제 API

```http
DELETE /api/admin/moderation/messages/:id

Request:
{
  action: "DELETE" | "DELETE_WARN" | "DELETE_SUSPEND",
  reason: "부적절한 콘텐츠"
}

Response:
{
  success: true,
  data: {
    messageId: "msg_123",
    deleted: true,
    userAction: "WARNED"
  }
}
```

---

## 3. 파일 모더레이션

### 3.1 저작권 침해 파일

```http
POST /api/admin/moderation/files/:fileId/copyright-claim

Request:
{
  claimant: "저작권자 이름",
  reason: "DMCA 신고 접수",
  evidence: ["증빙자료.pdf"],
  notifyUploader: true
}
```

### 3.2 악성 파일 스캔

```typescript
// VirusTotal API 통합
async function scanFile(fileUrl: string) {
  const response = await fetch('https://www.virustotal.com/api/v3/files', {
    method: 'POST',
    headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
    body: fileUrl
  });
  
  const result = await response.json();
  
  if (result.data.attributes.last_analysis_stats.malicious > 0) {
    // 악성 파일 감지
    await deleteFile(fileUrl);
    await notifyUploader();
  }
}
```

---

## 4. 자동 필터 시스템

### 4.1 필터 규칙 관리

```typescript
interface FilterRule {
  id: string;
  word: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  action: 'WARN' | 'DELETE' | 'BLOCK';
  isRegex: boolean;
  category: string;
}
```

### 4.2 스팸 패턴 감지

```typescript
// 스팸 감지 규칙
const spamPatterns = [
  { pattern: /(.)\1{4,}/, description: '동일 문자 5회 이상 반복' },
  { pattern: /(https?:\/\/[^\s]+){3,}/, description: 'URL 3개 이상 포함' },
];
```

---

## 5. 혐오발언 감정분석

### 5.1 혐오발언 감정분석 모델

```typescript
// 자체 혐오발언 감정분석 모델 사용
async function detectHateSpeech(content: string) {
  // 혐오발언 감정분석 모델 API 호출
  const response = await fetch(`${process.env.HATE_SPEECH_MODEL_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: content })
  });
  
  const result = await response.json();
  
  if (result.prediction === 'hate') {
    if (result.confidence > 0.8) {
      // 고신뢰도 혐오발언 → 즉시 차단
      return { action: 'DELETE', reason: 'High confidence hate speech detected' };
    } else if (result.confidence > 0.6) {
      // 중간 신뢰도 → 검토 필요
      return { action: 'REVIEW', reason: 'Potential hate speech detected' };
    }
  }
  
  return { action: 'APPROVE', reason: 'Content approved' };
}
```

### 5.2 환경 변수 설정

```env
# .env
HATE_SPEECH_MODEL_URL=http://your-model-api-url
```

---

## 6. API 명세

```http
# 메시지 모더레이션
GET    /api/admin/moderation/messages
GET    /api/admin/moderation/messages/:id
DELETE /api/admin/moderation/messages/:id
POST   /api/admin/moderation/messages/:id/ignore

# 파일 모더레이션
GET    /api/admin/moderation/files
GET    /api/admin/moderation/files/:id
DELETE /api/admin/moderation/files/:id
POST   /api/admin/moderation/files/:id/copyright-claim
POST   /api/admin/moderation/files/:id/scan

# 자동 필터 설정
GET    /api/admin/moderation/filters
POST   /api/admin/moderation/filters
PUT    /api/admin/moderation/filters/:id
DELETE /api/admin/moderation/filters/:id

# 혐오발언 분석
POST   /api/admin/moderation/hate-speech-analyze
```

---

**작성 완료**: 2025-11-27

