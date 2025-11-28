# 🚀 다음 세션 빠른 시작

다음 세션을 시작할 때 아래 프롬프트를 **복사해서 첫 메시지로 보내세요**.

---

## 📋 완전한 프롬프트 (추천)

```
CoUp 관리자 시스템 구현을 이어서 진행해.

먼저 다음 문서들을 읽어줘:

1. docs/admin/IMPLEMENTATION-PROGRESS-SESSION-2.md
   - 현재까지 완료된 항목 (사용자 관리 100% 완료)
   - 다음 작업 (스터디 관리, 신고 처리)
   - 기술 스택 및 컨벤션

2. docs/admin/features/complete/02-study-management-complete.md
   - 스터디 관리 API 명세
   - Prisma 모델
   - 구현 예시 코드

3. docs/screens/admin/13-studies-list.md
   - 스터디 목록/상세 UI 설계
   - 컴포넌트 구조

그 다음 이 순서대로 구현해줘:

### Phase 3: 스터디 관리

1단계: 스터디 관리 API (5개)
- GET /api/admin/studies (목록 - 검색, 필터, 정렬, 페이지네이션)
- GET /api/admin/studies/[studyId] (상세 - 멤버, 활동, 통계)
- POST /api/admin/studies/[studyId]/hide (숨김 처리)
- POST /api/admin/studies/[studyId]/close (강제 종료)
- POST /api/admin/studies/[studyId]/delete (삭제)

2단계: 스터디 관리 UI
- src/app/admin/studies/page.jsx (목록 페이지)
- src/app/admin/studies/_components/StudyList.jsx (Server Component)
- src/app/admin/studies/_components/StudyFilters.jsx (Client Component)
- src/app/admin/studies/[studyId]/page.jsx (상세 페이지)
- src/app/admin/studies/[studyId]/_components/StudyActions.jsx (액션 모달)

사용자 관리와 동일한 패턴으로 구현하고, 
기존에 만든 Button, Modal, Badge 컴포넌트를 재사용해.

모든 명령어는 포그라운드에서 실행하고,
파일 생성 후 에러 확인해줘.

구현 완료 후 다음 단계 (신고 처리) 안내해줘.
```

---

## 📋 간단한 프롬프트 (빠른 버전)

```
docs/admin/IMPLEMENTATION-PROGRESS-SESSION-2.md 확인하고
스터디 관리 구현 이어서 진행해.

docs/admin/features/complete/02-study-management-complete.md와
docs/screens/admin/13-studies-list.md 참고해서
스터디 관리 API 5개 + UI 완성해줘.

사용자 관리와 동일한 패턴으로 구현하고
기존 Button, Modal, Badge 컴포넌트 재사용.
```

---

## 📚 참고 문서

상세한 정보는 다음 문서들을 확인하세요:

- **`docs/admin/NEXT-SESSION-PROMPT.md`** - 완벽한 프롬프트 + 사용 가이드
- **`docs/admin/IMPLEMENTATION-PROGRESS-SESSION-2.md`** - 현재 진행 상황
- **`docs/admin/IMPLEMENTATION-STATUS.md`** - 전체 구현 상태

---

**위 프롬프트를 복사해서 새 세션을 시작하세요! 🚀**

