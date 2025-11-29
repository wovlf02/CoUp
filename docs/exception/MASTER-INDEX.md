# CoUp 전체 예외 코드 마스터 색인 (Master Index)

**작성일**: 2025-11-29  
**Phase**: 8 - 통합 및 마무리  
**버전**: 1.0.0  
**총 예외 영역**: 8개 (Phase 0-7)  
**총 문서 수**: 80+개  
**총 예외 코드**: 800+개

---

## 📊 전체 통계

### 영역별 문서 수

| Phase | 영역 | 약어 | 문서 수 | 예외 코드 수 | 상태 |
|-------|------|------|---------|--------------|------|
| 0 | 인증 (Authentication) | AUTH | 9개 | ~80개 | ✅ 완료 |
| 1 | 대시보드 (Dashboard) | DASH | 9개 | ~100개 | ✅ 완료 |
| 2 | 스터디 관리 (Studies) | STD | 13개 | ~150개 | ✅ 완료 |
| 3 | 내 스터디 (My Studies) | MYSTD | 11개 | ~120개 | ✅ 완료 |
| 4 | 채팅 (Chat) | CHAT | 11개 | ~100개 | ✅ 완료 |
| 5 | 알림 (Notifications) | NOTIF | 11개 | ~80개 | ✅ 완료 |
| 6 | 프로필 (Profile) | PROF | 13개 | ~90개 | ✅ 완료 |
| 7 | 설정 (Settings) | SET | 9개 | ~70개 | ✅ 완료 |
| 8 | 검색/필터 (Search/Filter) | SRCH | 9개 | ~80개 | ✅ 완료 |
| 9 | 관리자 (Admin) | ADM | 5개 | ~150개 | ✅ 완료 |
| **합계** | - | - | **100개** | **~1,020개** | **✅ 100%** |

### 심각도별 분포

| 심각도 | 설명 | 예상 개수 | 비율 |
|--------|------|-----------|------|
| 🔴 **Critical** | 즉시 해결 필요, 시스템 장애 | ~150개 | 15% |
| 🟠 **High** | 빠른 해결 필요, 기능 제한 | ~300개 | 29% |
| 🟡 **Medium** | 계획된 해결, 불편함 | ~400개 | 39% |
| 🟢 **Low** | 개선 권장, 영향 미미 | ~170개 | 17% |

### 빈도별 분포

| 빈도 | 예상 개수 | 비율 |
|------|-----------|------|
| **높음** | ~250개 | 25% |
| **중간** | ~500개 | 49% |
| **낮음** | ~270개 | 26% |

---

## 🎯 빠른 찾기

### 증상별 빠른 검색

#### "권한이 없습니다" (401/403)
- **인증**: [AUTH-001, AUTH-002](auth/INDEX.md#권한-검증) - 로그인/세션 문제
- **스터디**: [STD-PRM-001](studies/INDEX.md#권한-부족) - 스터디 접근 권한
- **내 스터디**: [MYSTD-002](my-studies/INDEX.md#권한-부족) - 멤버 권한
- **관리자**: [ADM-USR-001](admin/INDEX.md#권한-검증) - 관리자 권한

#### "데이터를 불러올 수 없습니다" (500)
- **대시보드**: [DASH-001](dashboard/INDEX.md#api-요청-실패) - 데이터 로딩
- **스터디**: [STD-CRUD-001](studies/INDEX.md#스터디-조회-실패) - 스터디 조회
- **프로필**: [PROF-001](profile/INDEX.md#프로필-조회-실패) - 프로필 로딩

#### "네트워크 연결을 확인해주세요"
- **인증**: [AUTH-NET-001](auth/06-common-edge-cases.md#네트워크-연결-끊김) - 로그인 실패
- **채팅**: [CHAT-001](chat/01-connection-exceptions.md#socket-연결-실패) - Socket 연결
- **공통**: 모든 API 요청 (네트워크 오류)

#### "세션이 만료되었습니다"
- **인증**: [AUTH-003](auth/03-session-management-exceptions.md#jwt-토큰-만료) - JWT 만료
- **모든 영역**: 인증 필요 시 세션 체크

#### "필수 항목을 입력해주세요"
- **스터디**: [STD-CRUD-002](studies/01-study-crud-exceptions.md#유효성-검사-오류) - 스터디 생성
- **프로필**: [PROF-002](profile/01-profile-edit-exceptions.md#유효성-검사) - 프로필 수정
- **설정**: [SET-PWD-001](settings/01-password-change-exceptions.md#비밀번호-강도-부족) - 비밀번호 검증

#### "파일 크기가 너무 큽니다"
- **프로필**: [PROF-AVT-001](profile/02-avatar-exceptions.md#파일-크기-초과) - 아바타 (5MB)
- **내 스터디**: [MYSTD-FILE-001](my-studies/05-files-exceptions.md#업로드-실패) - 파일 업로드 (10MB)
- **채팅**: [CHAT-FILE-001](chat/04-file-exceptions.md#업로드-실패) - 파일 첨부 (10MB)

---

## 📁 영역별 색인

### Phase 0: 인증 (Authentication) - AUTH

**문서 수**: 9개 | **예외 코드**: ~80개

#### 주요 카테고리
- **로그인 (Credentials)**: 이메일/비밀번호 인증
- **OAuth**: 소셜 로그인 (Google/GitHub)
- **세션 관리**: JWT, 토큰, 쿠키
- **회원가입**: 계정 생성 및 검증
- **공통 엣지 케이스**: 네트워크, 브라우저 제한

#### 주요 예외 코드

| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| AUTH-001 | 이메일/비밀번호 불일치 | 🟡 | 높음 | [01-credentials-login](auth/01-credentials-login-exceptions.md#이메일-또는-비밀번호-불일치) |
| AUTH-002 | 정지된 계정 | 🔴 | 중간 | [01-credentials-login](auth/01-credentials-login-exceptions.md#정지된-계정) |
| AUTH-003 | JWT 토큰 만료 | 🟠 | 높음 | [03-session-management](auth/03-session-management-exceptions.md#jwt-토큰-만료) |
| AUTH-004 | 이메일 이미 존재 | 🟡 | 높음 | [04-signup](auth/04-signup-exceptions.md#이메일-이미-존재) |
| AUTH-005 | 소셜 로그인 계정 혼동 | 🟡 | 중간 | [01-credentials-login](auth/01-credentials-login-exceptions.md#소셜-로그인-계정-혼동) |

#### 문서 링크
- [README.md](auth/README.md) - 개요 및 시작 가이드
- [INDEX.md](auth/INDEX.md) - 상세 색인
- [01-credentials-login-exceptions.md](auth/01-credentials-login-exceptions.md)
- [02-oauth-login-exceptions.md](auth/02-oauth-login-exceptions.md)
- [03-session-management-exceptions.md](auth/03-session-management-exceptions.md)
- [04-signup-exceptions.md](auth/04-signup-exceptions.md)
- [06-common-edge-cases.md](auth/06-common-edge-cases.md)
- [99-exception-handling-best-practices.md](auth/99-exception-handling-best-practices.md)

---

### Phase 1: 대시보드 (Dashboard) - DASH

**문서 수**: 9개 | **예외 코드**: ~100개

#### 주요 카테고리
- **데이터 로딩**: 통계, 스터디 목록, 활동 내역
- **위젯 시스템**: StudyStatus, OnlineMembers, QuickActions, UrgentTasks, PinnedNotice
- **실시간 동기화**: React Query, WebSocket, 캐시 관리
- **빈 상태 (Empty State)**: 신규 사용자, 데이터 없음
- **성능 최적화**: 렌더링, 메모리, 로딩 최적화

#### 주요 예외 코드

| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| DASH-001 | API 요청 실패 | 🟠 | 높음 | [01-data-loading](dashboard/01-data-loading-exceptions.md#api-요청-실패) |
| DASH-002 | 무한 로딩 루프 | 🔴 | 중간 | [01-data-loading](dashboard/01-data-loading-exceptions.md#무한-로딩) |
| DASH-003 | 부분 데이터 로딩 실패 | 🟡 | 중간 | [01-data-loading](dashboard/01-data-loading-exceptions.md#부분-데이터-로딩) |
| DASH-004 | 위젯 렌더링 오류 | 🟡 | 중간 | [02-widget-exceptions](dashboard/02-widget-exceptions.md#위젯-오류) |
| DASH-005 | WebSocket 연결 끊김 | 🟠 | 낮음 | [03-real-time-sync](dashboard/03-real-time-sync-exceptions.md#websocket-재연결) |

#### 문서 링크
- [README.md](dashboard/README.md)
- [INDEX.md](dashboard/INDEX.md)
- [01-data-loading-exceptions.md](dashboard/01-data-loading-exceptions.md)
- [02-widget-exceptions.md](dashboard/02-widget-exceptions.md)
- [03-real-time-sync-exceptions.md](dashboard/03-real-time-sync-exceptions.md)
- [04-empty-states.md](dashboard/04-empty-states.md)
- [05-performance-optimization.md](dashboard/05-performance-optimization.md)
- [99-best-practices.md](dashboard/99-best-practices.md)

---

### Phase 2: 스터디 관리 (Studies) - STD

**문서 수**: 13개 | **예외 코드**: ~150개

#### 주요 카테고리
- **CRUD 작업**: 생성, 조회, 수정, 삭제
- **멤버 관리**: 초대, 승인, 강퇴, 역할 변경
- **가입/탈퇴**: 가입 신청, 승인 대기, 탈퇴
- **카테고리/태그**: 분류 및 검색
- **권한 시스템**: OWNER, ADMIN, MEMBER
- **출석 관리**: 출석 체크, 통계
- **파일/공지**: 파일 업로드, 공지사항

#### 주요 예외 코드

| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| STD-001 | 스터디 찾을 수 없음 | 🟠 | 높음 | [01-study-crud](studies/01-study-crud-exceptions.md#스터디-조회-실패) |
| STD-002 | 권한 부족 | 🟠 | 높음 | [05-permissions](studies/05-permissions-exceptions.md#권한-부족) |
| STD-003 | 정원 초과 | 🟡 | 중간 | [03-join-leave](studies/03-join-leave-exceptions.md#정원-초과) |
| STD-004 | 중복 가입 | 🟡 | 높음 | [03-join-leave](studies/03-join-leave-exceptions.md#중복-가입-방지) |
| STD-005 | OWNER 탈퇴 방지 | 🔴 | 낮음 | [03-join-leave](studies/03-join-leave-exceptions.md#owner-탈퇴-방지) |

#### 문서 링크
- [README.md](studies/README.md)
- [INDEX.md](studies/INDEX.md)
- [01-study-crud-exceptions.md](studies/01-study-crud-exceptions.md)
- [02-member-management-exceptions.md](studies/02-member-management-exceptions.md)
- [03-join-leave-exceptions.md](studies/03-join-leave-exceptions.md)
- [04-category-tag-exceptions.md](studies/04-category-tag-exceptions.md)
- [05-permissions-exceptions.md](studies/05-permissions-exceptions.md)
- [06-attendance-exceptions.md](studies/06-attendance-exceptions.md)
- [07-file-notice-exceptions.md](studies/07-file-notice-exceptions.md)
- [99-best-practices.md](studies/99-best-practices.md)

---

### Phase 3: 내 스터디 (My Studies) - MYSTD

**문서 수**: 11개 | **예외 코드**: ~120개

#### 주요 카테고리
- **목록 조회**: 내가 참여한 스터디 목록
- **상세 정보**: 스터디 상세 페이지
- **공지사항**: 작성, 수정, 삭제
- **할일 관리**: 생성, 상태 변경, 삭제
- **파일 관리**: 업로드, 다운로드, 삭제
- **캘린더**: 일정 표시 및 관리
- **위젯**: 통계, 진행률, 멤버 정보

#### 주요 예외 코드

| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| MYSTD-001 | 스터디 목록 로딩 실패 | 🟠 | 중간 | [01-my-studies-list](my-studies/01-my-studies-list-exceptions.md#로딩-실패) |
| MYSTD-002 | 권한 부족 | 🟠 | 높음 | [02-study-detail](my-studies/02-study-detail-exceptions.md#권한-부족) |
| MYSTD-003 | 공지사항 작성 실패 | 🟡 | 중간 | [03-notices](my-studies/03-notices-exceptions.md#작성-실패) |
| MYSTD-004 | 할일 생성 실패 | 🟡 | 중간 | [04-tasks](my-studies/04-tasks-exceptions.md#생성-실패) |
| MYSTD-005 | 파일 업로드 실패 | 🟡 | 중간 | [05-files](my-studies/05-files-exceptions.md#업로드-실패) |

#### 문서 링크
- [README.md](my-studies/README.md)
- [INDEX.md](my-studies/INDEX.md)
- [01-my-studies-list-exceptions.md](my-studies/01-my-studies-list-exceptions.md)
- [02-study-detail-exceptions.md](my-studies/02-study-detail-exceptions.md)
- [03-notices-exceptions.md](my-studies/03-notices-exceptions.md)
- [04-tasks-exceptions.md](my-studies/04-tasks-exceptions.md)
- [05-files-exceptions.md](my-studies/05-files-exceptions.md)
- [06-calendar-exceptions.md](my-studies/06-calendar-exceptions.md)
- [07-widgets-exceptions.md](my-studies/07-widgets-exceptions.md)
- [99-best-practices.md](my-studies/99-best-practices.md)

---

### Phase 4: 채팅 (Chat) - CHAT

**문서 수**: 11개 | **예외 코드**: ~100개

#### 주요 카테고리
- **연결 관리**: Socket.IO 연결, 재연결, 인증
- **메시지 처리**: 전송, 수신, 삭제, 편집
- **실시간 동기화**: 메시지 순서, 낙관적 업데이트
- **파일 첨부**: 업로드, 다운로드, 미리보기
- **UI/UX**: 자동 스크롤, 무한 스크롤, 타이핑 인디케이터

#### 주요 예외 코드

| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| CHAT-001 | Socket 연결 실패 | 🔴 | 중간 | [01-connection](chat/01-connection-exceptions.md#socket-연결-실패) |
| CHAT-002 | 메시지 전송 실패 | 🟠 | 높음 | [02-message](chat/02-message-exceptions.md#메시지-전송-실패) |
| CHAT-003 | 중복 메시지 | 🟡 | 중간 | [02-message](chat/02-message-exceptions.md#중복-메시지) |
| CHAT-004 | 메시지 순서 문제 | 🟡 | 중간 | [03-realtime-sync](chat/03-realtime-sync-exceptions.md#메시지-순서-문제) |
| CHAT-005 | 파일 업로드 실패 | 🟡 | 중간 | [04-file](chat/04-file-exceptions.md#업로드-실패) |

#### 문서 링크
- [README.md](chat/README.md)
- [INDEX.md](chat/INDEX.md)
- [01-connection-exceptions.md](chat/01-connection-exceptions.md)
- [02-message-exceptions.md](chat/02-message-exceptions.md)
- [03-realtime-sync-exceptions.md](chat/03-realtime-sync-exceptions.md)
- [04-file-exceptions.md](chat/04-file-exceptions.md)
- [05-ui-exceptions.md](chat/05-ui-exceptions.md)
- [99-best-practices.md](chat/99-best-practices.md)

---

### Phase 5: 알림 (Notifications) - NOTIF

**문서 수**: 11개 | **예외 코드**: ~80개

#### 주요 카테고리
- **알림 생성**: 알림 생성, 중복 방지
- **알림 전송**: 전송 로직, 재시도
- **UI/UX**: 목록 표시, 필터링, 읽음 처리
- **실시간**: WebSocket, 푸시 알림

#### 주요 예외 코드

| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| NOTIF-001 | 알림 생성 실패 | 🟠 | 중간 | [01-notification-creation](notifications/01-notification-creation.md#알림-생성-실패) |
| NOTIF-002 | 중복 알림 | 🟡 | 낮음 | [01-notification-creation](notifications/01-notification-creation.md#중복-알림-방지) |
| NOTIF-003 | 알림 전송 실패 | 🟠 | 중간 | [02-notification-delivery](notifications/02-notification-delivery.md#전송-실패) |
| NOTIF-004 | 읽음 처리 실패 | 🟡 | 중간 | [03-notification-ui](notifications/03-notification-ui.md#읽음-처리) |

#### 문서 링크
- [README.md](notifications/README.md)
- [INDEX.md](notifications/INDEX.md)
- [01-notification-creation.md](notifications/01-notification-creation.md)
- [02-notification-delivery.md](notifications/02-notification-delivery.md)
- [03-notification-ui.md](notifications/03-notification-ui.md)
- [99-best-practices.md](notifications/99-best-practices.md)

---

### Phase 6: 프로필 (Profile) - PROF

**문서 수**: 13개 | **예외 코드**: ~90개

#### 주요 카테고리
- **프로필 조회**: 사용자 정보, 통계
- **프로필 수정**: 이름, 자기소개, 이메일
- **아바타 업로드**: 이미지 업로드, 크롭
- **계정 삭제**: 계정 삭제 및 데이터 정리

#### 주요 예외 코드

| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| PROF-001 | 프로필 조회 실패 | 🟠 | 중간 | [01-profile-edit](profile/01-profile-edit-exceptions.md#프로필-조회-실패) |
| PROF-002 | 유효성 검사 실패 | 🟡 | 높음 | [01-profile-edit](profile/01-profile-edit-exceptions.md#유효성-검사) |
| PROF-003 | 아바타 업로드 실패 | 🟡 | 중간 | [02-avatar](profile/02-avatar-exceptions.md#업로드-실패) |
| PROF-004 | 계정 삭제 실패 | 🔴 | 낮음 | [03-account-deletion](profile/03-account-deletion-exceptions.md#삭제-실패) |

#### 문서 링크
- [README.md](profile/README.md)
- [INDEX.md](profile/INDEX.md)
- [01-profile-edit-exceptions.md](profile/01-profile-edit-exceptions.md)
- [02-avatar-exceptions.md](profile/02-avatar-exceptions.md)
- [03-account-deletion-exceptions.md](profile/03-account-deletion-exceptions.md)
- [99-best-practices.md](profile/99-best-practices.md)

---

### Phase 7: 설정 (Settings) - SET

**문서 수**: 9개 | **예외 코드**: ~70개

#### 주요 카테고리
- **비밀번호 변경**: 검증, 보안
- **알림 설정**: 푸시, 이메일, FCM
- **테마 설정**: 다크모드, 접근성

#### 주요 예외 코드

| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| SET-001 | 현재 비밀번호 확인 실패 | 🔴 | 높음 | [01-password-change](settings/01-password-change-exceptions.md#현재-비밀번호-확인-실패) |
| SET-002 | 비밀번호 강도 부족 | 🟡 | 높음 | [01-password-change](settings/01-password-change-exceptions.md#비밀번호-강도-부족) |
| SET-003 | FCM 토큰 등록 실패 | 🔴 | 중간 | [02-notification-settings](settings/02-notification-settings-exceptions.md#fcm-토큰-등록-실패) |
| SET-004 | 테마 전환 깜빡임 | 🟡 | 중간 | [03-theme-settings](settings/03-theme-settings-exceptions.md#테마-전환-깜빡임) |

#### 문서 링크
- [README.md](settings/README.md)
- [INDEX.md](settings/INDEX.md)
- [01-password-change-exceptions.md](settings/01-password-change-exceptions.md)
- [02-notification-settings-exceptions.md](settings/02-notification-settings-exceptions.md)
- [03-theme-settings-exceptions.md](settings/03-theme-settings-exceptions.md)
- [99-best-practices.md](settings/99-best-practices.md)

---

### Phase 8: 검색/필터 (Search/Filter) - SRCH

**문서 수**: 9개 | **예외 코드**: ~80개

#### 주요 카테고리
- **검색**: 키워드 검색, 자동완성
- **필터**: 카테고리, 옵션 필터
- **페이지네이션/정렬**: 페이지 관리, 정렬
- **성능 최적화**: 디바운싱, 캐싱
- **UI/UX**: 로딩, 빈 상태

#### 주요 예외 코드

| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| SRCH-001 | 검색 결과 없음 | 🟢 | 높음 | [01-search](search/01-search-exceptions.md#검색-결과-없음) |
| SRCH-002 | 필터 조합 오류 | 🟡 | 중간 | [02-filter](search/02-filter-exceptions.md#필터-충돌) |
| SRCH-003 | 페이지 범위 초과 | 🟡 | 중간 | [03-pagination-sort](search/03-pagination-sort-exceptions.md#페이지-범위) |
| SRCH-004 | 검색 타임아웃 | 🟠 | 낮음 | [04-performance](search/04-performance-optimization.md#쿼리-타임아웃) |

#### 문서 링크
- [README.md](search/README.md)
- [INDEX.md](search/INDEX.md)
- [01-search-exceptions.md](search/01-search-exceptions.md)
- [02-filter-exceptions.md](search/02-filter-exceptions.md)
- [03-pagination-sort-exceptions.md](search/03-pagination-sort-exceptions.md)
- [04-performance-optimization.md](search/04-performance-optimization.md)
- [05-ui-ux-exceptions.md](search/05-ui-ux-exceptions.md)
- [99-best-practices.md](search/99-best-practices.md)

---

### Phase 9: 관리자 (Admin) - ADM

**문서 수**: 5개 | **예외 코드**: ~150개

#### 주요 카테고리
- **사용자 관리 (USR)**: 조회, 정지, 활성화, 삭제
- **스터디 관리 (STD)**: 모니터링, 강제 종료
- **신고 처리 (RPT)**: 신고 접수, 처리
- **통계/분석 (ANL)**: 대시보드, 리포트
- **설정 (SET)**: 시스템 설정
- **로그 (LOG)**: 감사 로그
- **권한 (PRM)**: RBAC, 권한 관리

#### 주요 예외 코드

| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-USR-001 | 관리자 권한 없음 | 🔴 | 높음 | [01-user-management](admin/01-user-management.md#권한-검증) |
| ADM-USR-002 | 세션 만료 | 🟠 | 높음 | [01-user-management](admin/01-user-management.md#세션-관리) |
| ADM-USR-021 | 사용자 정지 실패 | 🟠 | 중간 | [01-user-management](admin/01-user-management.md#정지) |
| ADM-USR-026 | 마지막 관리자 삭제 시도 | 🔴 | 낮음 | [01-user-management](admin/01-user-management.md#마지막-관리자) |

#### 문서 링크
- [README.md](admin/README.md)
- [INDEX.md](admin/INDEX.md)
- [01-user-management.md](admin/01-user-management.md)
- [99-best-practices.md](admin/99-best-practices.md)

---

## 🎨 심각도별 색인

### 🔴 Critical (치명적) - 즉시 해결 필요

**시스템 장애, 보안 문제, 데이터 손실 위험**

| 영역 | 주요 Critical 예외 |
|------|-------------------|
| **인증** | AUTH-002 (정지된 계정), AUTH-005 (보안 위협) |
| **대시보드** | DASH-002 (무한 로딩) |
| **스터디** | STD-005 (OWNER 탈퇴 방지), STD-DEL-001 (강제 삭제 실패) |
| **채팅** | CHAT-001 (Socket 연결 실패) |
| **프로필** | PROF-004 (계정 삭제 실패) |
| **설정** | SET-001 (비밀번호 확인 실패), SET-003 (FCM 토큰 등록 실패) |
| **관리자** | ADM-USR-001 (권한 없음), ADM-USR-026 (마지막 관리자) |

**총 개수**: ~150개 (15%)

---

### 🟠 High (높음) - 빠른 해결 필요

**주요 기능 제한, 사용자 경험 저하**

| 영역 | 주요 High 예외 |
|------|---------------|
| **인증** | AUTH-003 (JWT 만료) |
| **대시보드** | DASH-001 (API 실패), DASH-005 (WebSocket 끊김) |
| **스터디** | STD-001 (스터디 없음), STD-002 (권한 부족) |
| **내 스터디** | MYSTD-001 (목록 로딩 실패), MYSTD-002 (권한 부족) |
| **채팅** | CHAT-002 (메시지 전송 실패) |
| **알림** | NOTIF-001 (알림 생성 실패), NOTIF-003 (전송 실패) |
| **프로필** | PROF-001 (프로필 조회 실패) |
| **관리자** | ADM-USR-002 (세션 만료), ADM-USR-021 (정지 실패) |

**총 개수**: ~300개 (29%)

---

### 🟡 Medium (중간) - 계획된 해결

**불편함, 개선 필요**

| 영역 | 주요 Medium 예외 |
|------|-----------------|
| **인증** | AUTH-001 (로그인 실패), AUTH-004 (이메일 중복) |
| **대시보드** | DASH-003 (부분 로딩 실패), DASH-004 (위젯 오류) |
| **스터디** | STD-003 (정원 초과), STD-004 (중복 가입) |
| **내 스터디** | MYSTD-003~005 (공지/할일/파일 오류) |
| **채팅** | CHAT-003 (중복 메시지), CHAT-004 (메시지 순서) |
| **알림** | NOTIF-002 (중복 알림), NOTIF-004 (읽음 처리) |
| **프로필** | PROF-002 (유효성 실패), PROF-003 (아바타 업로드) |
| **설정** | SET-002 (비밀번호 강도), SET-004 (테마 깜빡임) |
| **검색** | SRCH-002 (필터 충돌), SRCH-003 (페이지 범위) |

**총 개수**: ~400개 (39%)

---

### 🟢 Low (낮음) - 개선 권장

**영향 미미, 점진적 개선**

| 영역 | 주요 Low 예외 |
|------|--------------|
| **인증** | 입력 검증, UI 개선 |
| **대시보드** | 빈 상태 디자인 |
| **검색** | SRCH-001 (결과 없음) |
| **기타** | 접근성, 사용성 개선 |

**총 개수**: ~170개 (17%)

---

## 📈 빈도별 색인

### 높은 빈도 (~250개, 25%)

**자주 발생하는 예외 - 우선 처리 필요**

- AUTH-001: 이메일/비밀번호 불일치
- AUTH-003: JWT 토큰 만료
- AUTH-004: 이메일 중복
- STD-001: 스터디 찾을 수 없음
- STD-002: 권한 부족
- STD-004: 중복 가입
- CHAT-002: 메시지 전송 실패
- PROF-002: 유효성 검사 실패
- SET-001: 비밀번호 확인 실패
- SET-002: 비밀번호 강도 부족
- SRCH-001: 검색 결과 없음
- ADM-USR-001: 관리자 권한 없음

### 중간 빈도 (~500개, 49%)

**가끔 발생 - 모니터링 필요**

- 대부분의 API 오류
- 네트워크 관련 오류
- 데이터 검증 오류
- UI/UX 관련 문제

### 낮은 빈도 (~270개, 26%)

**드물게 발생 - 엣지 케이스**

- 동시성 문제
- 특수한 권한 오류
- 시스템 설정 오류
- 관리자 기능 오류

---

## 🔗 연관 예외 매핑

### 인증 관련 (모든 영역)

대부분의 영역에서 인증 예외가 발생할 수 있습니다:

```
인증 실패 → 모든 API 요청 차단
├── AUTH-001: 로그인 실패
├── AUTH-002: 계정 정지
├── AUTH-003: 세션 만료
└── 영역별 권한 검증
    ├── STD-002: 스터디 권한
    ├── MYSTD-002: 내 스터디 권한
    ├── CHAT-001: 채팅 접근 권한
    └── ADM-USR-001: 관리자 권한
```

### 네트워크 관련 (모든 영역)

```
네트워크 오류
├── 연결 끊김: AUTH-NET-001
├── 타임아웃: 각 영역 타임아웃 예외
├── API 실패: DASH-001, STD-001, etc.
└── WebSocket 문제: CHAT-001, DASH-005
```

### 권한 관련

```
권한 계층 구조
└── 인증 (Authentication)
    ├── 로그인 필요: AUTH-001~005
    └── 역할 기반 (RBAC)
        ├── 일반 사용자
        │   ├── 프로필: PROF-*
        │   ├── 스터디 MEMBER: STD-002
        │   └── 내 스터디: MYSTD-002
        ├── 스터디 ADMIN: STD-PRM-002
        ├── 스터디 OWNER: STD-PRM-001
        └── 시스템 관리자: ADM-USR-001
```

---

## 📚 추가 참조 문서

### Phase 8 통합 문서
- [CROSS-REFERENCE.md](CROSS-REFERENCE.md) - 문서 간 참조 관계
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - 빠른 찾기 가이드
- [FINAL-GUIDE.md](FINAL-GUIDE.md) - 전체 사용 가이드
- [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - 배포 체크리스트
- [TEAM-ONBOARDING.md](TEAM-ONBOARDING.md) - 신규 팀원 온보딩

### 각 Phase README
- [auth/README.md](auth/README.md) - 인증 개요
- [dashboard/README.md](dashboard/README.md) - 대시보드 개요
- [studies/README.md](studies/README.md) - 스터디 개요
- [my-studies/README.md](my-studies/README.md) - 내 스터디 개요
- [chat/README.md](chat/README.md) - 채팅 개요
- [notifications/README.md](notifications/README.md) - 알림 개요
- [profile/README.md](profile/README.md) - 프로필 개요
- [settings/README.md](settings/README.md) - 설정 개요
- [search/README.md](search/README.md) - 검색 개요
- [admin/README.md](admin/README.md) - 관리자 개요

---

## 🎯 활용 가이드

### 1. 신규 개발자

1. **먼저 읽기**: [FINAL-GUIDE.md](FINAL-GUIDE.md)
2. **관심 영역 선택**: 위 영역별 색인에서 README 읽기
3. **예외 코드 검색**: 이 문서에서 Ctrl+F로 검색
4. **상세 문서 참조**: 링크를 통해 상세 내용 확인

### 2. 버그 수정

1. **에러 메시지 확인**: 예외 코드 식별
2. **이 문서에서 검색**: Ctrl+F로 코드 찾기
3. **해결 방법 적용**: 링크된 문서의 해결책 따라하기
4. **테스트**: 동일 카테고리의 다른 예외도 확인

### 3. 코드 리뷰

1. **체크리스트 확인**: 각 영역 99-best-practices.md
2. **보안 검증**: admin/99-best-practices.md 보안 섹션
3. **성능 체크**: */05-performance-*.md 문서들

### 4. 새 기능 개발

1. **유사 기능 찾기**: 이 색인에서 관련 영역 탐색
2. **예외 패턴 학습**: 해당 영역의 예외 처리 방식
3. **일관성 유지**: 동일한 네이밍과 구조 사용

---

## 🔄 문서 유지보수

### 업데이트 필요 시점

- 새로운 API 엔드포인트 추가
- 예외 처리 로직 변경
- 새로운 기능 영역 추가
- 보안 정책 변경

### 업데이트 절차

1. 해당 영역 문서 수정
2. INDEX.md 업데이트
3. 이 MASTER-INDEX.md 업데이트
4. CROSS-REFERENCE.md 확인 및 업데이트
5. 변경 이력 기록

---

## 📞 문의 및 기여

### 문서 개선 제안
- 누락된 예외 상황 발견 시
- 더 나은 해결 방법 제안
- 문서 구조 개선 아이디어

### 버그 리포트
- 문서 내 오타 또는 오류
- 잘못된 링크
- 코드 예제 오류

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-29  
**버전**: 1.0.0  
**다음 문서**: [CROSS-REFERENCE.md](CROSS-REFERENCE.md)

