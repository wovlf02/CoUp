# 내 스터디 예외 처리 색인 (INDEX)

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**목적**: 증상별/카테고리별 빠른 문제 해결 가이드

---

## 📋 목차

1. [증상별 찾기](#증상별-찾기)
2. [카테고리별 찾기](#카테고리별-찾기)
3. [탭별 찾기](#탭별-찾기)
4. [빠른 해결 가이드](#빠른-해결-가이드)
5. [체크리스트](#체크리스트)

---

## 증상별 찾기

### 🔴 치명적 오류

#### "스터디를 찾을 수 없습니다"
- **원인**: 잘못된 스터디 ID, 삭제된 스터디, 권한 없음
- **해결**: [01-my-studies-list-exceptions.md > 스터디 없음](./01-my-studies-list-exceptions.md#스터디-없음)
- **긴급도**: 🔥 높음

#### "권한이 없습니다"
- **원인**: 멤버 권한 없음, 탈퇴, 강퇴, PENDING 상태
- **해결**: [02-study-detail-exceptions.md > 권한 부족](./02-study-detail-exceptions.md#권한-부족)
- **긴급도**: 🔥 높음

#### "세션이 만료되었습니다"
- **원인**: 로그인 세션 만료
- **해결**: [../auth/01-credentials-login-exceptions.md](../auth/01-credentials-login-exceptions.md)
- **긴급도**: 🔥 높음

---

### 🟠 데이터 로딩 문제

#### 내 스터디 목록이 표시되지 않음
- **원인**: API 호출 실패, 네트워크 오류
- **해결**: [01-my-studies-list-exceptions.md > 로딩 실패](./01-my-studies-list-exceptions.md#로딩-실패)
- **긴급도**: 🟡 중간

#### 공지사항이 표시되지 않음
- **원인**: API 실패, 권한 부족, 공지 없음
- **해결**: [03-notices-exceptions.md > 로딩 실패](./03-notices-exceptions.md#로딩-실패)
- **긴급도**: 🟡 중간

#### 할일 목록이 비어있음
- **원인**: API 실패, 할일 없음
- **해결**: [04-tasks-exceptions.md > 빈 상태](./04-tasks-exceptions.md#빈-상태)
- **긴급도**: 🟢 낮음

#### 파일 목록이 로딩되지 않음
- **원인**: API 실패, 파일 없음
- **해결**: [05-files-exceptions.md > 로딩 실패](./05-files-exceptions.md#로딩-실패)
- **긴급도**: 🟡 중간

#### 캘린더 일정이 표시되지 않음
- **원인**: API 실패, 날짜 파싱 오류, 일정 없음
- **해결**: [06-calendar-exceptions.md > 로딩 실패](./06-calendar-exceptions.md#로딩-실패)
- **긴급도**: 🟡 중간

#### 위젯 데이터가 로딩되지 않음
- **원인**: API 실패, 통계 계산 오류
- **해결**: [07-widgets-exceptions.md > 위젯 로딩 실패](./07-widgets-exceptions.md#위젯-로딩-실패)
- **긴급도**: 🟢 낮음

---

### 🟡 CRUD 작업 문제

#### 공지사항 작성 실패
- **원인**: 권한 부족 (MEMBER), 유효성 오류, 네트워크 오류
- **해결**: [03-notices-exceptions.md > 작성 실패](./03-notices-exceptions.md#작성-실패)
- **긴급도**: 🟡 중간

#### 공지사항 수정/삭제 실패
- **원인**: 권한 부족, 공지 없음
- **해결**: [03-notices-exceptions.md > 수정-삭제 실패](./03-notices-exceptions.md#수정-삭제-실패)
- **긴급도**: 🟡 중간

#### 할일 생성 실패
- **원인**: 유효성 오류, 네트워크 오류
- **해결**: [04-tasks-exceptions.md > 생성 실패](./04-tasks-exceptions.md#생성-실패)
- **긴급도**: 🟡 중간

#### 할일 상태 변경 실패
- **원인**: 네트워크 오류, 동시성 문제
- **해결**: [04-tasks-exceptions.md > 상태 변경 실패](./04-tasks-exceptions.md#상태-변경-실패)
- **긴급도**: 🟡 중간

#### 파일 업로드 실패
- **원인**: 용량 초과 (10MB), 형식 제한, 네트워크 오류
- **해결**: [05-files-exceptions.md > 업로드 실패](./05-files-exceptions.md#업로드-실패)
- **긴급도**: 🟡 중간

#### 파일 다운로드 실패
- **원인**: 파일 없음, 권한 부족, S3 오류
- **해결**: [05-files-exceptions.md > 다운로드 실패](./05-files-exceptions.md#다운로드-실패)
- **긴급도**: 🟡 중간

#### 일정 생성 실패
- **원인**: 유효성 오류, 날짜 형식 오류
- **해결**: [06-calendar-exceptions.md > 생성 실패](./06-calendar-exceptions.md#생성-실패)
- **긴급도**: 🟡 중간

---

### 🟢 UI/UX 문제

#### 탭 전환이 안됨
- **원인**: 권한 부족 (adminOnly 탭), 라우팅 오류
- **해결**: [02-study-detail-exceptions.md > 탭 전환 오류](./02-study-detail-exceptions.md#탭-전환-오류)
- **긴급도**: 🟢 낮음

#### 필터링/정렬이 작동하지 않음
- **원인**: 클라이언트 측 필터링 로직 오류
- **해결**: [01-my-studies-list-exceptions.md > 필터링 오류](./01-my-studies-list-exceptions.md#필터링-오류)
- **긴급도**: 🟢 낮음

#### 페이지네이션이 작동하지 않음
- **원인**: 페이지 계산 오류, 상태 관리 문제
- **해결**: [01-my-studies-list-exceptions.md > 페이지네이션 오류](./01-my-studies-list-exceptions.md#페이지네이션-오류)
- **긴급도**: 🟢 낮음

#### 모달이 열리지 않음/닫히지 않음
- **원인**: 상태 관리 오류, 이벤트 핸들러 문제
- **해결**: [03-notices-exceptions.md > 모달 문제](./03-notices-exceptions.md#모달-문제)
- **긴급도**: 🟢 낮음

---

### 🔵 실시간 동기화 문제

#### 채팅 메시지가 실시간으로 표시되지 않음
- **원인**: WebSocket 연결 실패, Pusher 설정 오류
- **해결**: [08-chat-exceptions.md > 실시간 동기화 실패](./08-chat-exceptions.md#실시간-동기화-실패)
- **긴급도**: 🟡 중간

#### 새 공지가 자동으로 표시되지 않음
- **원인**: React Query 캐시 무효화 실패
- **해결**: [03-notices-exceptions.md > 실시간 동기화](./03-notices-exceptions.md#실시간-동기화)
- **긴급도**: 🟢 낮음

#### 위젯 데이터가 자동 갱신되지 않음
- **원인**: refetchInterval 설정 오류, 캐시 문제
- **해결**: [07-widgets-exceptions.md > 자동 갱신 실패](./07-widgets-exceptions.md#자동-갱신-실패)
- **긁급도**: 🟢 낮음

---

### ⚪ 성능 문제

#### 페이지 로딩이 느림
- **원인**: 대량 데이터, N+1 쿼리, 느린 네트워크
- **해결**: [99-best-practices.md > 성능 최적화](./99-best-practices.md#성능-최적화)
- **긴급도**: 🟢 낮음

#### 파일 업로드가 느림
- **원인**: 큰 파일, 느린 네트워크, S3 업로드
- **해결**: [05-files-exceptions.md > 업로드 성능](./05-files-exceptions.md#업로드-성능)
- **긴급도**: 🟢 낮음

#### 채팅 스크롤이 버벅임
- **원인**: 대량 메시지, 가상 스크롤 없음
- **해결**: [08-chat-exceptions.md > 성능 문제](./08-chat-exceptions.md#성능-문제)
- **긴급도**: 🟢 낮음

---

## 카테고리별 찾기

### 📂 내 스터디 목록
- [01-my-studies-list-exceptions.md](./01-my-studies-list-exceptions.md)
  - 로딩 실패
  - 스터디 없음
  - 필터링 오류
  - 정렬 문제
  - 페이지네이션 오류
  - 역할 배지 표시

### 📊 스터디 대시보드 (개요)
- [02-study-detail-exceptions.md](./02-study-detail-exceptions.md)
  - 스터디 로딩 실패
  - 권한 부족
  - 위젯 데이터 오류
  - 통계 계산 오류
  - 탭 전환 오류

### 📢 공지사항
- [03-notices-exceptions.md](./03-notices-exceptions.md)
  - 공지 목록 로딩 실패
  - 공지 작성 실패
  - 공지 수정/삭제 실패
  - 고정 공지 처리
  - 마크다운 렌더링
  - 검색/필터링

### ✅ 할일 관리
- [04-tasks-exceptions.md](./04-tasks-exceptions.md)
  - 할일 목록 로딩 실패
  - 할일 생성 실패
  - 할일 수정/삭제 실패
  - 상태 변경 (TODO, IN_PROGRESS, REVIEW, DONE)
  - 할당/담당자 변경
  - 기한 관리
  - 칸반/리스트 뷰

### 📁 파일 관리
- [05-files-exceptions.md](./05-files-exceptions.md)
  - 파일 목록 로딩 실패
  - 파일 업로드 실패
  - 파일 다운로드 실패
  - 파일 삭제 실패
  - 용량 제한 (10MB)
  - 형식 제한
  - S3 연동

### 📅 캘린더
- [06-calendar-exceptions.md](./06-calendar-exceptions.md)
  - 일정 목록 로딩 실패
  - 일정 생성 실패
  - 일정 수정/삭제 실패
  - 반복 일정
  - 알림 설정
  - 날짜 파싱

### 📊 위젯 시스템
- [07-widgets-exceptions.md](./07-widgets-exceptions.md)
  - 활동 요약 위젯
  - 최근 공지 위젯
  - 멤버 목록 위젯
  - 다가오는 일정 위젯
  - 긴급 할일 위젯
  - 자동 갱신

### 💬 채팅
- [08-chat-exceptions.md](./08-chat-exceptions.md)
  - 채팅 메시지 로딩
  - 메시지 전송 실패
  - WebSocket 연결 실패
  - 실시간 동기화
  - 스크롤 관리
  - 알림

### 🎯 모범 사례
- [99-best-practices.md](./99-best-practices.md)
  - 에러 핸들링 패턴
  - 권한 검증
  - 데이터 로딩 전략
  - 실시간 동기화
  - 성능 최적화
  - 테스트 전략

---

## 탭별 찾기

### 📊 개요 탭 (`/my-studies/[studyId]`)
- **문서**: [02-study-detail-exceptions.md](./02-study-detail-exceptions.md)
- **주요 기능**: 활동 요약, 스터디 소개, 최근 공지, 멤버 목록, 일정, 할일
- **권한**: 모든 멤버
- **주요 예외**:
  - 스터디 로딩 실패
  - 위젯 데이터 오류
  - 통계 계산 오류

### 💬 채팅 탭 (`/my-studies/[studyId]/chat`)
- **문서**: [08-chat-exceptions.md](./08-chat-exceptions.md)
- **주요 기능**: 실시간 채팅, 메시지 전송, 파일 첨부
- **권한**: 모든 멤버
- **주요 예외**:
  - WebSocket 연결 실패
  - 메시지 전송 실패
  - 실시간 동기화 문제

### 📢 공지 탭 (`/my-studies/[studyId]/notices`)
- **문서**: [03-notices-exceptions.md](./03-notices-exceptions.md)
- **주요 기능**: 공지 목록, 작성, 수정, 삭제, 고정
- **권한**: 읽기(모든 멤버), 쓰기(ADMIN+)
- **주요 예외**:
  - 권한 부족
  - 작성/수정/삭제 실패
  - 고정 처리 오류

### 📁 파일 탭 (`/my-studies/[studyId]/files`)
- **문서**: [05-files-exceptions.md](./05-files-exceptions.md)
- **주요 기능**: 파일 업로드, 다운로드, 삭제
- **권한**: 모든 멤버
- **주요 예외**:
  - 용량 초과
  - 형식 제한
  - S3 연동 오류

### 📅 캘린더 탭 (`/my-studies/[studyId]/calendar`)
- **문서**: [06-calendar-exceptions.md](./06-calendar-exceptions.md)
- **주요 기능**: 일정 생성, 수정, 삭제, 반복 일정
- **권한**: 모든 멤버
- **주요 예외**:
  - 날짜 파싱 오류
  - 반복 일정 처리
  - 알림 설정

### ✅ 할일 탭 (`/my-studies/[studyId]/tasks`)
- **문서**: [04-tasks-exceptions.md](./04-tasks-exceptions.md)
- **주요 기능**: 할일 생성, 상태 변경, 할당, 칸반/리스트 뷰
- **권한**: 모든 멤버
- **주요 예외**:
  - 상태 변경 실패
  - 할당 오류
  - 뷰 전환 문제

### 📹 화상 탭 (`/my-studies/[studyId]/video-call`)
- **문서**: [README_VIDEO_CALL.md](../../../README_VIDEO_CALL.md)
- **주요 기능**: 화상 통화, 화면 공유
- **권한**: 모든 멤버
- **주요 예외**:
  - WebRTC 연결 실패
  - 미디어 권한 거부

### 👥 멤버 탭 (`/my-studies/[studyId]/members`)
- **문서**: [../studies/02-member-management-exceptions.md](../studies/02-member-management-exceptions.md)
- **주요 기능**: 멤버 추가, 제거, 역할 변경
- **권한**: ADMIN+
- **주요 예외**:
  - 권한 부족 (MEMBER 접근)
  - 멤버 제거 실패
  - 역할 변경 실패

### ⚙️ 설정 탭 (`/my-studies/[studyId]/settings`)
- **문서**: [../studies/04-settings-exceptions.md](../studies/04-settings-exceptions.md)
- **주요 기능**: 스터디 정보 수정, 공개 설정, 이미지 업로드
- **권한**: OWNER (일부 ADMIN)
- **주요 예외**:
  - 권한 부족 (MEMBER, ADMIN 접근)
  - 설정 업데이트 실패

---

## 빠른 해결 가이드

### 🚨 긴급 상황 (5분 해결)

#### 1. 스터디 접근 불가
```javascript
// 체크리스트
1. 로그인 상태 확인 → 재로그인
2. 스터디 ID 확인 → URL 확인
3. 멤버십 확인 → /my-studies에서 해당 스터디 있는지 확인
4. 브라우저 캐시 삭제 → Ctrl+Shift+R
```

#### 2. 데이터 로딩 실패
```javascript
// 해결 순서
1. 네트워크 탭 확인 → API 응답 확인
2. 콘솔 에러 확인 → 에러 메시지 확인
3. 페이지 새로고침 → F5
4. 로그아웃 후 재로그인
```

#### 3. 파일 업로드 실패
```javascript
// 체크리스트
1. 파일 크기 확인 → 10MB 이하
2. 파일 형식 확인 → 허용된 형식인지
3. 네트워크 확인 → 업로드 진행 중 연결 끊김
4. 다시 시도
```

---

### ⚙️ 일반적인 문제 (15분 해결)

#### 1. 공지사항 작성 안됨
```javascript
// 해결 순서
1. 권한 확인 → ADMIN 이상인지
2. 필수 항목 확인 → 제목, 내용 입력
3. 네트워크 확인
4. 에러 메시지 확인 → 콘솔/토스트
```

#### 2. 할일 상태 변경 안됨
```javascript
// 해결 순서
1. 네트워크 확인
2. 낙관적 업데이트 확인 → UI는 변경되지만 API 실패
3. React Query 캐시 확인
4. 페이지 새로고침
```

#### 3. 실시간 동기화 안됨
```javascript
// 해결 순서
1. WebSocket/Pusher 연결 확인
2. React Query 설정 확인 → refetchInterval
3. 브라우저 DevTools Network 탭 확인
4. 페이지 새로고침
```

---

### 🔍 디버깅 가이드

#### 1. API 요청 실패
```javascript
// 확인 순서
1. Network 탭에서 요청 확인
2. 응답 코드 확인 (401, 403, 404, 500)
3. 응답 body 확인 (error 메시지)
4. 해당 문서의 에러 코드 섹션 참조
```

#### 2. React Query 캐시 문제
```javascript
// 확인 방법
1. React Query DevTools 설치
2. 캐시 상태 확인
3. invalidateQueries 호출 확인
4. 수동으로 캐시 무효화 테스트

// 임시 해결
queryClient.invalidateQueries(['notices', studyId])
queryClient.invalidateQueries(['study', studyId])
```

#### 3. 권한 문제
```javascript
// 확인 순서
1. useStudy 훅으로 study.myRole 확인
2. 서버 응답의 myRole 필드 확인
3. 탭/버튼의 adminOnly 속성 확인
4. API 엔드포인트의 requireStudyMember 확인
```

---

## 체크리스트

### 새 기능 추가 시

- [ ] 멤버 권한 검증 추가 (API)
- [ ] 클라이언트 권한 체크 (UI)
- [ ] 로딩 상태 처리
- [ ] 에러 상태 처리
- [ ] 빈 상태 처리
- [ ] React Query 캐시 무효화
- [ ] 낙관적 업데이트 (필요 시)
- [ ] 유효성 검사
- [ ] 에러 메시지 한글화
- [ ] 테스트 작성

### 버그 수정 시

- [ ] 증상 확인
- [ ] 에러 로그 확인
- [ ] 관련 문서 확인
- [ ] 재현 시나리오 작성
- [ ] 원인 파악
- [ ] 수정 적용
- [ ] 테스트
- [ ] 문서 업데이트

### 배포 전

- [ ] 모든 탭 접근 테스트
- [ ] 권한별 접근 테스트 (OWNER, ADMIN, MEMBER)
- [ ] CRUD 작업 테스트
- [ ] 에러 핸들링 테스트
- [ ] 실시간 동기화 테스트
- [ ] 성능 테스트
- [ ] 브라우저 호환성 테스트

---

## 참고 자료

### 내부 문서
- [README.md](./README.md) - 내 스터디 개요
- [99-best-practices.md](./99-best-practices.md) - 모범 사례

### 외부 문서
- [../auth/](../auth/) - 인증 예외 처리
- [../dashboard/](../dashboard/) - 대시보드 예외 처리
- [../studies/](../studies/) - 스터디 관리 예외 처리

### 개발 가이드
- [../../guides/error-handling.md](../../guides/error-handling.md)
- [../../guides/api-design.md](../../guides/api-design.md)

---

## 문의

문제가 해결되지 않으면:
1. 해당 카테고리의 상세 문서 참조
2. 개발팀 Slack 채널에 문의
3. GitHub Issue 생성

---

**업데이트**: 이 색인은 새로운 예외 상황 발견 시 계속 업데이트됩니다.  
**기여**: 새로운 예외 상황을 발견하면 PR을 보내주세요.

---

**다음 문서**: [01-my-studies-list-exceptions.md](./01-my-studies-list-exceptions.md)  
**이전 문서**: [README.md](./README.md)

