# 관리자 모달 설계

> **작성일**: 2025-11-26

---

## 📋 개요

관리자 시스템에서 사용되는 모든 모달을 정의합니다.

---

## 🔍 1. 사용자 상세 모달

### 크기
- Width: 800px
- Height: auto (max 80vh)

### 탭
- [프로필] [활동] [신고]

### 하단 액션
- [정지하기] [삭제하기] [역할 변경]

---

## ⚠️ 2. 사용자 정지 모달

### 폼 필드
- 정지 기간: 라디오 (7일/30일/영구)
- 정지 사유: textarea (필수, 10-500자)
- 이메일 통보: 체크박스

### 버튼
- [취소] [정지하기]

### 확인 절차
- "정지" 입력하여 확인 (영구 정지 시)

---

## 🗑️ 3. 사용자 삭제 모달

### 경고 메시지
```
⚠️ 경고
이 작업은 되돌릴 수 없습니다.
사용자의 모든 데이터가 영구적으로 삭제됩니다.
```

### 폼 필드
- 삭제 사유: textarea (필수)
- 콘텐츠도 삭제: 체크박스

### 확인 절차
- "삭제" 입력하여 확인 (필수)

---

## 📚 4. 스터디 상세 모달

### 탭
- [개요] [멤버] [활동] [신고]

### 하단 액션
- [숨김 처리] [삭제하기]

---

## 🚨 5. 신고 처리 모달

### 정보 표시
- 신고 유형
- 신고 대상
- 신고자
- 신고 사유
- 증거 자료

### 처리 옵션 (라디오)
- ⚠️ 경고
- 🚫 정지 (기간 선택)
- 🗑️ 삭제
- ❌ 기각

### 추가 필드
- 처리 사유: textarea (필수)
- 이메일 통보: 2개 체크박스 (신고자/대상)

---

## 📂 6. 카테고리 생성/수정 모달

### 폼 필드
- 카테고리명: input (필수, 2-20자)
- 이모지: 이모지 선택기
- 순서: number input

---

## 📝 7. 공지사항 상세 모달

### 표시 정보
- 제목
- 스터디명
- 작성자
- 작성일
- 내용 (마크다운 렌더링)

### 액션
- [삭제하기]

---

## 🔄 8. 일괄 작업 확인 모달

### 메시지
```
N명의 사용자를 정지하시겠습니까?
```

### 리스트
- 선택된 사용자 목록 (최대 5개 표시, "외 N명")

### 폼 필드
- 정지 기간: 라디오
- 정지 사유: textarea

---

## 💡 모달 디자인 원칙

### 1. 일관성
- 모든 모달은 동일한 스타일
- 헤더, 바디, 푸터 구조

### 2. 명확한 액션
- 주요 액션은 우측
- 취소는 좌측
- 위험한 액션은 빨간색

### 3. 키보드 접근성
- ESC로 닫기
- Enter로 확인 (텍스트 영역 제외)
- Tab으로 이동

### 4. 반응형
- 모바일에서는 전체 화면

---

## 🎨 스타일 예시

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

---

## 🔗 관련 문서

- [공통 컴포넌트](./09-components.md)
- [사용자 관리 화면](./03-users.md)
- [스터디 관리 화면](./04-studies.md)
- [신고 관리 화면](./05-reports.md)

---

**완료**: 관리자 시스템 문서 전체 작성 완료! 🎉

