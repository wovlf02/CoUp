# 콘텐츠 모더레이션 - 메시지 검토

> **페이지 경로**: `/admin/moderation/messages`

---

## 1. 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 메시지 모더레이션                                            │
├─────────────────────────────────────────────────────────────┤
│ [필터] [신고된 메시지] [자동 감지] [AI 플래그]              │
├─────────────────────────────────────────────────────────────┤
│ 🚨 신고 3건 | 2시간 전                                      │
│ 작성자: 홍길동 (user_123)                                   │
│ 스터디: 자바 스터디                                         │
│ 내용: "욕설이 포함된 메시지..."                             │
│ 신고 사유: 욕설/비속어 (3건)                                │
│ [상세보기] [삭제] [삭제+경고] [삭제+정지] [무시]            │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ AI 감지 | 5시간 전                                       │
│ 작성자: 김철수 (user_456)                                   │
│ 스터디: 영어 회화                                           │
│ 내용: "혐오 표현이 감지된 메시지..."                        │
│ AI 분석: 혐오표현 85% | 괴롭힘 72%                          │
│ [상세보기] [삭제] [무시]                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 메시지 상세 모달

```tsx
<MessageDetailModal message={message}>
  <h2>메시지 검토</h2>
  
  {/* 메시지 내용 */}
  <div className="message-content">
    <pre>{message.content}</pre>
  </div>
  
  {/* AI 분석 결과 */}
  {message.aiAnalysis && (
    <AIAnalysisCard>
      <h4>AI 분석</h4>
      <ProgressBar label="성적 콘텐츠" value={message.aiAnalysis.sexual * 100} />
      <ProgressBar label="혐오 표현" value={message.aiAnalysis.hate * 100} />
      <ProgressBar label="괴롭힘" value={message.aiAnalysis.harassment * 100} />
      <ProgressBar label="폭력" value={message.aiAnalysis.violence * 100} />
    </AIAnalysisCard>
  )}
  
  {/* 신고 이력 */}
  <ReportHistory reports={message.reports} />
  
  {/* 작성자 제재 이력 */}
  <AuthorHistory userId={message.author.id} />
  
  {/* 액션 버튼 */}
  <ButtonGroup>
    <Button variant="danger" onClick={deleteMessage}>삭제</Button>
    <Button variant="danger" onClick={deleteAndWarn}>삭제 + 경고</Button>
    <Button variant="danger" onClick={deleteAndSuspend}>삭제 + 정지</Button>
    <Button variant="ghost" onClick={ignore}>무시</Button>
  </ButtonGroup>
</MessageDetailModal>
```

---

**작성 완료**: 2025-11-27

