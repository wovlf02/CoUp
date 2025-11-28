# 🚀 CoUp 관리자 시스템 - 다음 세션 시작 프롬프트

## 📋 복사해서 사용할 프롬프트

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

## 🎯 프롬프트 사용 방법

### 1. 위 프롬프트를 복사해서 새 세션 첫 메시지로 보내기

### 2. 또는 더 짧게 (간단 버전):

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

## 💡 프롬프트 포함 내용

✅ 읽어야 할 문서 3개 (우선순위 순)
✅ 구현할 API 목록 (5개)
✅ 구현할 UI 목록 (페이지 + 컴포넌트)
✅ 참고할 패턴 (사용자 관리)
✅ 재사용할 컴포넌트 (Button, Modal, Badge)
✅ 작업 순서 (API → UI)
✅ 실행 방식 (포그라운드)
✅ 다음 단계 안내 요청

---

## 📝 예상 응답

AI가 다음과 같이 진행할 것입니다:

1. 3개 문서 읽기
2. 스터디 관리 API 5개 생성
   - `/api/admin/studies/route.js`
   - `/api/admin/studies/[studyId]/route.js`
   - `/api/admin/studies/[studyId]/hide/route.js`
   - `/api/admin/studies/[studyId]/close/route.js`
   - `/api/admin/studies/[studyId]/delete/route.js`

3. 스터디 관리 UI 생성
   - 목록 페이지 (검색, 필터, 테이블)
   - 상세 페이지 (정보, 멤버, 활동)
   - 액션 모달 (숨김, 종료, 삭제)

4. 에러 확인 및 수정

5. 다음 단계 (신고 처리) 안내

---

## ⏱️ 예상 소요 시간

- 문서 읽기: 5분
- API 구현: 40-50분
- UI 구현: 60-80분
- 테스트 및 수정: 20-30분

**총 약 2-3시간 예상**

---

## 🔄 진행 중 추가 요청 가능

만약 중간에 멈추거나 도움이 필요하면:

```
계속 진행해
```

```
에러 확인하고 수정해줘
```

```
다음 파일 생성해줘
```

---

## ✅ 완료 후 확인사항

스터디 관리 완료 시 확인:
- [ ] API 5개 모두 생성됨
- [ ] UI 페이지 2개 + 컴포넌트 4개 생성됨
- [ ] 에러 없음
- [ ] 기존 컴포넌트 재사용됨
- [ ] 진행 상황 문서 업데이트됨

---

**이 프롬프트로 다음 세션을 시작하세요! 🚀**

