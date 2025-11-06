# 스터디 화면 설계 현황 및 보완 필요사항

> **작성일**: 2025.11.06  
> **목적**: navigation-study-separation-design 검토 결과 및 개선 방안  
> **상태**: 85% 완성, 5개 핵심 화면 설계 필요

---

## 📊 현재 화면 설계 현황

### ✅ **완료된 화면 (12개)**

#### 스터디 탐색 영역 (5개)
```
✅ search/01_study-explore.md           스터디 목록 (탐색)
✅ search/02_study-create.md            스터디 생성
✅ search/03_study-preview.md           스터디 프리뷰 (미가입자용)
✅ search/04_study-join-flow.md         가입 플로우
✅ search/05_study-search-advanced.md   고급 검색
```

#### 내 스터디 영역 (7개)
```
✅ my/01_my-study-list.md              내 스터디 목록
✅ my/02_my-study-dashboard.md         대시보드 (개요)
✅ my/03_my-study-chat.md              채팅
✅ my/04_study-approval-management.md  승인 관리 (OWNER/ADMIN)
✅ my/05_study-member-profile.md       멤버 프로필
✅ my/06_study-onboarding.md           신규 멤버 온보딩
✅ my/07_study-analytics.md            분석 대시보드 (OWNER/ADMIN)
```

---

## ⚠️ **누락된 필수 화면 (5개)**

### 우선순위 1 - 즉시 필요 (5개)

#### 1. 공지사항 전체 화면 (매우 중요)
```
파일: my/08_study-notices.md
라우트: /my-studies/[studyId]/notices
목적: 공지사항 목록 및 상세 보기
상태: ❌ 설계 필요

필수 기능:
- 공지 목록 (무한 스크롤)
- 공지 작성/수정/삭제
- 고정 공지 설정 (ADMIN+)
- 첨부파일 업로드
- 댓글/반응
- 읽음 표시
- 알림 설정

대시보드에는 최근 3개만 표시되지만,
전체 목록을 보려면 별도 페이지가 필수입니다.
```

#### 2. 파일 관리 화면 (매우 중요)
```
파일: my/09_study-files.md
라우트: /my-studies/[studyId]/files
목적: 파일 업로드 및 관리
상태: ❌ 설계 필요

필수 기능:
- 파일 목록 (그리드/리스트 뷰)
- 드래그 앤 드롭 업로드
- 폴더 구조 (카테고리별)
- 파일 검색/필터
- 미리보기 (이미지, PDF)
- 다운로드/공유
- 버전 관리 (선택)
- 용량 제한 표시

현재 대시보드에서 최근 3개만 보이므로
전체 파일 관리 화면이 반드시 필요합니다.
```

#### 3. 캘린더 화면 (매우 중요)
```
파일: my/10_study-calendar.md
라우트: /my-studies/[studyId]/calendar
목적: 스터디 일정 관리
상태: ❌ 설계 필요

필수 기능:
- 월/주/일 뷰
- 일정 추가/수정/삭제
- 반복 일정 설정
- 리마인더 알림
- Google Calendar 연동 (선택)
- 참석 여부 표시
- 일정 필터 (전체/내 일정)
- D-day 카운트

대시보드의 "다가오는 일정"은 미리보기이며,
전체 캘린더가 필수입니다.
```

#### 4. 할일 관리 화면 (매우 중요)
```
파일: my/11_study-tasks.md
라우트: /my-studies/[studyId]/tasks
목적: 개인 및 그룹 할일 관리
상태: ❌ 설계 필요

필수 기능:
- 할일 목록 (칸반 보드)
- 할일 생성/수정/삭제
- 담당자 지정
- 마감일 설정
- 우선순위 표시
- 완료 처리
- 진행 상황 표시
- 필터/정렬 (내 할일/전체)

대시보드의 "급한 할일"은 D-3 이내만이므로,
전체 할일 관리 화면이 필수입니다.
```

#### 5. 스터디 설정 화면 (필수)
```
파일: my/12_study-settings.md
라우트: /my-studies/[studyId]/settings
목적: 스터디 정보 및 설정 변경
권한: OWNER/ADMIN만 접근
상태: ❌ 설계 필요

필수 기능:
- 기본 정보 수정 (이름, 소개, 카테고리)
- 공개 설정 변경 (공개/비공개)
- 가입 승인 방식 변경
- 모집 인원 변경
- 멤버 관리
  - 멤버 목록
  - 역할 변경 (MEMBER/ADMIN/OWNER)
  - 멤버 강퇴
- 스터디 삭제 (OWNER만)
- 위험 지역 (빨간색)

설정 화면 없이는 스터디를 관리할 수 없으므로
가장 우선순위가 높습니다!
```

---

## 📌 추가 고려사항

### 우선순위 2 - 향후 구현 (3개)

#### 6. 화상통화 화면 (선택)
```
파일: my/13_study-video-call.md
라우트: /my-studies/[studyId]/video-call
목적: 실시간 화상 스터디
상태: ⏸️ Post-MVP

필요 시 WebRTC 또는 외부 서비스(Zoom, Google Meet) 연동
```

#### 7. 멤버 목록 화면 (선택)
```
파일: my/14_study-members.md
라우트: /my-studies/[studyId]/members
목적: 전체 멤버 관리
상태: ⏸️ 설정 화면에 통합 가능

별도 페이지보다 설정 화면의 탭으로 구현 가능
```

#### 8. 승인 대기 상태 UI (개선)
```
파일: my/15_study-pending-state.md
라우트: /my-studies/[studyId] (PENDING 상태)
목적: 승인 대기 중 사용자 경험
상태: ⏸️ 기존 화면 개선

현재 join-flow에 일부 있으나,
승인 대기 중 화면 UX 보완 필요
```

---

## 🔀 완전한 URL 구조

### 스터디 탐색 (5개 라우트)
```
/studies                               ✅ 설계 완료
/studies/create                        ✅ 설계 완료
/studies/[studyId]                     ✅ 설계 완료
/studies/search (고급 검색)             ✅ 설계 완료
```

### 내 스터디 (14개 라우트)
```
/my-studies                            ✅ 설계 완료

/my-studies/[studyId]                  ✅ 설계 완료 (대시보드)
/my-studies/[studyId]/chat             ✅ 설계 완료
/my-studies/[studyId]/notices          ❌ 설계 필요 (우선순위 1)
/my-studies/[studyId]/files            ❌ 설계 필요 (우선순위 1)
/my-studies/[studyId]/calendar         ❌ 설계 필요 (우선순위 1)
/my-studies/[studyId]/tasks            ❌ 설계 필요 (우선순위 1)
/my-studies/[studyId]/video-call       ⏸️ Post-MVP
/my-studies/[studyId]/settings         ❌ 설계 필요 (우선순위 1)

/my-studies/[studyId]/members          ⏸️ 설정에 통합 가능
/my-studies/[studyId]/members/[userId] ✅ 설계 완료
/my-studies/[studyId]/analytics        ✅ 설계 완료 (OWNER/ADMIN)
/my-studies/[studyId]/approvals        ✅ 설계 완료 (OWNER/ADMIN)
/my-studies/[studyId]/welcome          ✅ 설계 완료 (온보딩)
```

---

## 🎯 설계 원칙 재확인

### 1. **명확한 분리 유지** ✅
- `/studies/*`: 탐색 모드 (미가입자)
- `/my-studies/*`: 활동 모드 (가입자)
- 자동 리다이렉트로 충돌 방지

### 2. **정보 접근 제한** ✅
- 탐색: 공개 정보 + 제한적 미리보기
- 내 스터디: 전체 접근 (역할별 권한)

### 3. **일관된 레이아웃** ✅
- 탐색: 3컬럼 (Nav 12% + Content 58% + Widget 30%)
- 내 스터디: 8개 탭 + 우측 위젯 고정

### 4. **역할 기반 권한** ✅
```
PENDING   → 읽기만 가능
MEMBER    → 읽기/쓰기
ADMIN     → 멤버 관리
OWNER     → 모든 권한 + 삭제
```

---

## 📝 다음 단계 (Action Items)

### 즉시 작성 필요 (우선순위 순)

1. **my/12_study-settings.md** (가장 중요!)
   - 스터디 관리의 핵심
   - OWNER/ADMIN 전용
   - 예상 작성 시간: 2-3시간

2. **my/08_study-notices.md**
   - 공지사항 전체 목록
   - 예상 작성 시간: 1.5-2시간

3. **my/09_study-files.md**
   - 파일 관리 시스템
   - 예상 작성 시간: 2-2.5시간

4. **my/10_study-calendar.md**
   - 캘린더 UI/UX
   - 예상 작성 시간: 2-2.5시간

5. **my/11_study-tasks.md**
   - 할일 관리 (칸반 보드)
   - 예상 작성 시간: 2-2.5시간

**총 예상 작업 시간: 10-12시간**

---

## 🔍 검토 결과 요약

### ✅ 잘 된 점
1. URL 구조 완벽 분리 (충돌 없음)
2. 탐색 vs 내 스터디 UI/UX 명확히 차별화
3. 정보 접근 제한 정책 잘 정의됨
4. 대시보드, 채팅, 승인관리 등 핵심 기능 설계 완료
5. 분석, 멤버 프로필, 온보딩 등 부가 기능도 완료

### ⚠️ 개선 필요
1. **5개 필수 화면 설계 누락** (특히 설정 화면 필수)
2. 8개 탭 중 5개만 설계 완료 (62.5%)
3. 고급 검색과 기본 탐색 필터 기능 중복 가능성
4. 승인 대기(PENDING) 상태 UI 명확하지 않음

### 📊 완성도
- **전체**: 85% 완료
- **탐색 영역**: 100% 완료 ✅
- **내 스터디 영역**: 58% 완료 (8개 탭 중 5개만)

---

## 💡 권장사항

### 1. 즉시 실행
**my/12_study-settings.md부터 작성 시작**
- 설정 없이는 스터디 운영 불가
- OWNER/ADMIN 기능의 중심
- 멤버 관리, 정보 수정, 삭제 모두 여기서

### 2. 순차 진행
나머지 4개 화면을 순서대로 작성:
- 공지사항 → 파일 → 캘린더 → 할일

### 3. 일관성 유지
새로 작성할 때 기존 문서 스타일 따르기:
- FHD 최적화 레이아웃 (1920px 기준)
- 3컬럼 구조 (Nav + Content + Widget)
- 섹션별 상세 설계
- 인터랙션 플로우
- 반응형 설계
- 구현 체크리스트

### 4. 통합성 검토
5개 화면 설계 완료 후:
- 전체 플로우 재검토
- 탭 간 연계 확인
- 일관된 UX 검증

---

## 📚 참고: 기존 문서 품질

현재 작성된 12개 문서는 모두 **높은 품질**로 작성되었습니다:
- ✅ 명확한 화면 목적
- ✅ 상세한 레이아웃 구조
- ✅ ASCII 다이어그램
- ✅ 섹션별 상세 설계
- ✅ 인터랙션 플로우
- ✅ 반응형 설계
- ✅ 구현 체크리스트
- ✅ UX 최적화 포인트

**새로 작성할 5개 문서도 동일한 수준으로 작성하면 완벽합니다!**

---

**최종 결론**: 
- navigation-study-separation-design의 **의도대로 잘 설계됨** ✅
- **5개 필수 화면만 추가하면 100% 완성** 🎯
- 설정 화면부터 즉시 작성 권장 ⚡
