# 콘텐츠 모더레이션 - 파일 검토

> **페이지 경로**: `/admin/moderation/files`

---

## 1. 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 파일 모더레이션                                              │
├─────────────────────────────────────────────────────────────┤
│ [필터] [신고된 파일] [악성 감지] [저작권 침해]              │
├─────────────────────────────────────────────────────────────┤
│ 🚨 신고 2건 | file_123.pdf | 5MB                           │
│ 업로더: 홍길동 (user_123)                                   │
│ 스터디: 자바 스터디                                         │
│ 신고 사유: 저작권 침해 (2건)                                │
│ [다운로드] [미리보기] [삭제] [저작권 처리]                  │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ 악성 파일 감지 | virus.exe | 1MB                        │
│ 업로더: 김철수 (user_456)                                   │
│ 스터디: 영어 회화                                           │
│ 바이러스 스캔: 위험 (3개 엔진 감지)                         │
│ [삭제] [업로더 정지]                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 저작권 침해 처리 모달

```tsx
<CopyrightClaimModal file={file}>
  <h2>저작권 침해 신고 처리</h2>
  
  <FilePreview file={file} />
  
  <FormGroup>
    <Label>저작권자 정보</Label>
    <Input value={claimant} onChange={setClaimant} />
  </FormGroup>
  
  <FormGroup>
    <Label>증빙 자료</Label>
    <FileUpload accept=".pdf,.jpg,.png" onUpload={setEvidence} />
  </FormGroup>
  
  <FormGroup>
    <Label>침해 사유</Label>
    <Textarea value={reason} onChange={setReason} rows={4} />
  </FormGroup>
  
  <FormGroup>
    <Checkbox checked={notifyUploader}>업로더에게 통보</Checkbox>
    <Checkbox checked={suspendUploader}>업로더 계정 정지 (7일)</Checkbox>
  </FormGroup>
  
  <ButtonGroup>
    <Button variant="ghost" onClick={close}>취소</Button>
    <Button variant="danger" onClick={processClaim}>파일 삭제 및 처리</Button>
  </ButtonGroup>
</CopyrightClaimModal>
```

---

**작성 완료**: 2025-11-27

