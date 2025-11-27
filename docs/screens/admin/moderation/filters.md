# 콘텐츠 모더레이션 - 필터 관리

> **페이지 경로**: `/admin/moderation/filters`

---

## 1. 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 자동 필터 관리                                               │
├─────────────────────────────────────────────────────────────┤
│ [새 필터 추가]                                               │
├─────────────────────────────────────────────────────────────┤
│ [테이블]                                                    │
│ ┌────────┬──────┬────────┬────────┬──────────┬────────┐    │
│ │키워드  │유형  │심각도  │ 액션   │감지 횟수 │ 관리   │    │
│ ├────────┼──────┼────────┼────────┼──────────┼────────┤    │
│ │욕설1   │키워드│ HIGH   │ DELETE │   245    │[편집]  │    │
│ │/광고.*/ │REGEX │MEDIUM  │ WARN   │    89    │[편집]  │    │
│ └────────┴──────┴────────┴────────┴──────────┴────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 필터 추가 모달

```tsx
<AddFilterModal>
  <h2>새 필터 추가</h2>
  
  <FormGroup>
    <Label>키워드</Label>
    <Input placeholder="필터링할 단어 또는 정규식" />
  </FormGroup>
  
  <FormGroup>
    <Label>유형</Label>
    <RadioGroup>
      <Radio value="keyword">키워드 (정확히 일치)</Radio>
      <Radio value="regex">정규식 (패턴 매칭)</Radio>
    </RadioGroup>
  </FormGroup>
  
  <FormGroup>
    <Label>심각도</Label>
    <Select>
      <option value="LOW">낮음</option>
      <option value="MEDIUM">보통</option>
      <option value="HIGH">높음</option>
    </Select>
  </FormGroup>
  
  <FormGroup>
    <Label>자동 액션</Label>
    <Select>
      <option value="WARN">경고만</option>
      <option value="DELETE">즉시 삭제</option>
      <option value="BLOCK">발송 차단</option>
    </Select>
  </FormGroup>
  
  <FormGroup>
    <Label>카테고리</Label>
    <Input placeholder="욕설, 비속어, 스팸 등" />
  </FormGroup>
  
  <ButtonGroup>
    <Button variant="ghost">취소</Button>
    <Button variant="primary">추가</Button>
  </ButtonGroup>
</AddFilterModal>
```

---

**작성 완료**: 2025-11-27

