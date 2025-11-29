# CoUp 예외 처리 크로스 레퍼런스 (Cross Reference)

**작성일**: 2025-11-29  
**Phase**: 8 - 통합 및 마무리  
**버전**: 1.0.0  
**목적**: 문서 간 참조 관계 및 의존성 시각화

---

## 📋 목차

1. [개요](#개요)
2. [영역 간 의존성 맵](#영역-간-의존성-맵)
3. [인증 중심 참조](#인증-중심-참조)
4. [공통 패턴 참조](#공통-패턴-참조)
5. [기능별 참조 체인](#기능별-참조-체인)
6. [역방향 참조](#역방향-참조)
7. [순환 참조 주의](#순환-참조-주의)

---

## 개요

### 문서 간 참조의 필요성

CoUp의 예외 처리 문서는 서로 연관되어 있습니다:

- **인증 (Auth)**: 모든 기능의 전제 조건
- **권한 (Permissions)**: 각 영역마다 다른 권한 체계
- **네트워크**: 공통적으로 발생하는 오류
- **데이터 검증**: 유사한 패턴 반복

이 문서는 이런 참조 관계를 명확히 하여:
1. 문제 해결 시 관련 문서를 빠르게 찾기
2. 새 기능 개발 시 참고할 패턴 찾기
3. 코드 리뷰 시 일관성 확인

---

## 영역 간 의존성 맵

### 전체 의존성 다이어그램

```
                    [인증 (Auth)]
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
   [대시보드]        [스터디]          [프로필]
        ↓                ↓                
   [내 스터디] ←────── [멤버 관리]
        ↓                ↓
     [채팅] ──────→  [알림]
        ↓                
    [파일 업로드]
        
   [검색/필터] ←──── 모든 목록 기능
   
   [설정] ←─────────── [사용자 데이터]
   
   [관리자] ─────────→ 모든 영역
```

### 의존성 레벨

**Level 0 (기반)**: 다른 모든 영역이 의존
- **인증 (Auth)**

**Level 1 (핵심)**: 여러 영역에서 참조
- **스터디 관리 (Studies)**
- **프로필 (Profile)**
- **검색/필터 (Search/Filter)**

**Level 2 (기능)**: 특정 영역에 의존
- **대시보드 (Dashboard)** ← Auth, Studies
- **내 스터디 (My Studies)** ← Auth, Studies
- **채팅 (Chat)** ← Auth, My Studies
- **알림 (Notifications)** ← 모든 영역

**Level 3 (확장)**: 다른 기능을 통합
- **설정 (Settings)** ← Auth, Profile
- **관리자 (Admin)** ← 모든 영역

---

## 인증 중심 참조

### Auth → 다른 영역

인증은 모든 기능의 전제 조건입니다.

#### Auth → Dashboard

**참조 관계**:
```
auth/03-session-management-exceptions.md
  → dashboard/01-data-loading-exceptions.md#인증-확인
```

**주요 예외**:
- AUTH-003 (JWT 만료) → DASH-001 (API 실패)
- 세션 만료 시 대시보드 데이터 로딩 차단

**코드 예제**:
```javascript
// Dashboard에서 Auth 체크
const { data, error } = await fetchDashboardData();

if (error?.status === 401) {
  // auth/03-session-management-exceptions.md 참조
  await refreshToken();
  // 재시도
}
```

#### Auth → Studies

**참조 관계**:
```
auth/01-credentials-login-exceptions.md#계정-상태
  → studies/05-permissions-exceptions.md#멤버-권한
```

**주요 예외**:
- AUTH-002 (정지된 계정) → STD-002 (권한 부족)
- 계정 정지 시 스터디 접근 차단

#### Auth → My Studies

**참조 관계**:
```
auth/03-session-management-exceptions.md
  → my-studies/02-study-detail-exceptions.md#권한-확인
```

**주요 예외**:
- AUTH-003 (세션 만료) → MYSTD-002 (권한 부족)

#### Auth → Chat

**참조 관계**:
```
auth/03-session-management-exceptions.md
  → chat/01-connection-exceptions.md#인증-오류
```

**주요 예외**:
- AUTH-003 (세션 만료) → CHAT-001 (Socket 인증 실패)

**코드 예제**:
```javascript
// Chat에서 Socket.IO 인증
socket.auth = {
  token: sessionStorage.getItem('accessToken')
};

socket.on('connect_error', (err) => {
  if (err.message === 'Authentication error') {
    // auth/03-session-management-exceptions.md 참조
    redirectToLogin();
  }
});
```

#### Auth → Profile

**참조 관계**:
```
auth/04-signup-exceptions.md#이메일-검증
  → profile/01-profile-edit-exceptions.md#이메일-수정
```

**주요 예외**:
- AUTH-004 (이메일 중복) → PROF-002 (이메일 변경 실패)

#### Auth → Settings

**참조 관계**:
```
auth/01-credentials-login-exceptions.md#비밀번호-검증
  → settings/01-password-change-exceptions.md#비밀번호-정책
```

**주요 예외**:
- AUTH-PWD-001 (비밀번호 정책) → SET-001 (비밀번호 변경 실패)

#### Auth → Admin

**참조 관계**:
```
auth/03-session-management-exceptions.md
  → admin/01-user-management.md#관리자-권한
```

**주요 예외**:
- AUTH-003 (세션 만료) → ADM-USR-001 (관리자 권한 없음)
- AUTH-ROLE (역할 확인) → ADM-USR-001 (권한 검증)

---

## 공통 패턴 참조

### 네트워크 오류 패턴

**기준 문서**: `auth/06-common-edge-cases.md#네트워크-연결-끊김`

**참조하는 영역**:
- Dashboard: `dashboard/01-data-loading-exceptions.md#네트워크-오류`
- Studies: `studies/01-study-crud-exceptions.md#네트워크-실패`
- Chat: `chat/01-connection-exceptions.md#연결-끊김`
- 모든 API 호출 문서

**공통 해결 패턴**:
```javascript
// 재시도 로직 (공통)
const fetchWithRetry = async (url, options = {}, retries = 3) => {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries > 0 && error.message === 'Network request failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};
```

### 유효성 검사 패턴

**기준 문서**: `auth/04-signup-exceptions.md#입력-검증`

**참조하는 영역**:
- Studies: `studies/01-study-crud-exceptions.md#유효성-검사-오류`
- Profile: `profile/01-profile-edit-exceptions.md#유효성-검사`
- Settings: `settings/01-password-change-exceptions.md#비밀번호-검증`

**공통 검증 패턴**:
```javascript
// Zod 스키마 (공통)
import { z } from 'zod';

const emailSchema = z.string().email('유효한 이메일을 입력하세요');
const nameSchema = z.string().min(2).max(50);
const passwordSchema = z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)/);
```

### 권한 검증 패턴

**기준 문서**: `studies/05-permissions-exceptions.md#권한-체계`

**참조하는 영역**:
- My Studies: `my-studies/02-study-detail-exceptions.md#권한-부족`
- Chat: `chat/01-connection-exceptions.md#권한-확인`
- Admin: `admin/01-user-management.md#권한-검증`

**공통 권한 체크**:
```javascript
// 권한 확인 유틸 (공통)
const checkPermission = (user, resource, action) => {
  // studies/05-permissions-exceptions.md 참조
  if (resource.type === 'STUDY') {
    const membership = resource.members.find(m => m.userId === user.id);
    if (!membership) {
      throw new Error('STD-002: 권한 부족');
    }
    
    if (action === 'DELETE' && membership.role !== 'OWNER') {
      throw new Error('STD-PRM-001: OWNER 권한 필요');
    }
  }
};
```

### 파일 업로드 패턴

**기준 문서**: `profile/02-avatar-exceptions.md#파일-업로드`

**참조하는 영역**:
- My Studies: `my-studies/05-files-exceptions.md#업로드-실패`
- Chat: `chat/04-file-exceptions.md#파일-첨부`

**공통 업로드 검증**:
```javascript
// 파일 크기 및 타입 검증 (공통)
const validateFile = (file, maxSize, allowedTypes) => {
  // profile/02-avatar-exceptions.md 참조
  if (file.size > maxSize) {
    throw new Error(`파일 크기는 ${maxSize / 1024 / 1024}MB 이하여야 합니다`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`허용된 파일 형식: ${allowedTypes.join(', ')}`);
  }
};

// 프로필 아바타: 5MB, 이미지만
validateFile(avatarFile, 5 * 1024 * 1024, ['image/jpeg', 'image/png']);

// 스터디 파일: 10MB, 모든 타입
validateFile(studyFile, 10 * 1024 * 1024, ['*']);
```

### 실시간 동기화 패턴

**기준 문서**: `dashboard/03-real-time-sync-exceptions.md#react-query`

**참조하는 영역**:
- My Studies: `my-studies/07-widgets-exceptions.md#실시간-업데이트`
- Chat: `chat/03-realtime-sync-exceptions.md#메시지-순서`
- Notifications: `notifications/02-notification-delivery.md#실시간-전송`

**공통 React Query 설정**:
```javascript
// React Query 실시간 갱신 (공통)
const { data } = useQuery({
  queryKey: ['resource', id],
  queryFn: fetchResource,
  refetchInterval: 30000, // 30초마다 갱신
  refetchOnWindowFocus: true,
  staleTime: 10000, // 10초 동안 fresh
});

// dashboard/03-real-time-sync-exceptions.md 참조
```

---

## 기능별 참조 체인

### 스터디 생성 → 참여 → 활동 체인

```
1. 스터디 생성
   studies/01-study-crud-exceptions.md#스터디-생성
   ↓
2. 멤버 초대
   studies/02-member-management-exceptions.md#멤버-초대
   ↓
3. 가입 승인
   studies/03-join-leave-exceptions.md#가입-승인
   ↓
4. 내 스터디 목록 표시
   my-studies/01-my-studies-list-exceptions.md#목록-조회
   ↓
5. 스터디 상세 접근
   my-studies/02-study-detail-exceptions.md#권한-확인
   ↓
6. 채팅 참여
   chat/01-connection-exceptions.md#스터디-멤버-확인
   ↓
7. 알림 수신
   notifications/01-notification-creation.md#멤버-알림
```

### 사용자 인증 → 활동 체인

```
1. 로그인
   auth/01-credentials-login-exceptions.md
   ↓
2. 세션 생성
   auth/03-session-management-exceptions.md#세션-생성
   ↓
3. 대시보드 접근
   dashboard/01-data-loading-exceptions.md#인증-확인
   ↓
4. 스터디 조회
   studies/01-study-crud-exceptions.md#권한-확인
   ↓
5. 프로필 수정
   profile/01-profile-edit-exceptions.md#권한-검증
   ↓
6. 설정 변경
   settings/01-password-change-exceptions.md#인증-필요
```

### 파일 업로드 체인

```
1. 프로필 아바타 업로드
   profile/02-avatar-exceptions.md#파일-업로드
   ├── 크기 제한: 5MB
   └── 타입: 이미지만
   
2. 스터디 파일 업로드
   my-studies/05-files-exceptions.md#파일-업로드
   ├── 크기 제한: 10MB
   └── 타입: 모든 파일
   
3. 채팅 파일 첨부
   chat/04-file-exceptions.md#파일-첨부
   ├── 크기 제한: 10MB
   └── 타입: 이미지, 문서, 압축파일

공통 참조:
→ 모두 동일한 업로드 API 사용
→ 동일한 오류 처리 패턴
→ profile/02-avatar-exceptions.md#공통-업로드-로직 참조
```

### 알림 생성 → 전송 → 표시 체인

```
1. 이벤트 발생
   (스터디 초대, 댓글, 공지 등)
   ↓
2. 알림 생성
   notifications/01-notification-creation.md#알림-생성
   ↓
3. 푸시 알림 전송
   notifications/02-notification-delivery.md#푸시-전송
   ├── FCM 토큰 확인
   │   → settings/02-notification-settings-exceptions.md#fcm-토큰
   └── 실패 시 재시도
   ↓
4. 실시간 알림 표시
   notifications/03-notification-ui.md#실시간-업데이트
   ↓
5. 읽음 처리
   notifications/03-notification-ui.md#읽음-표시
```

---

## 역방향 참조

### Dashboard ← 다른 영역

**Dashboard가 참조되는 경우**:

```
auth/03-session-management-exceptions.md
  → "세션 만료 시 대시보드로 리다이렉트"
  → dashboard/01-data-loading-exceptions.md#재인증

studies/01-study-crud-exceptions.md
  → "스터디 생성 후 대시보드에서 확인"
  → dashboard/01-data-loading-exceptions.md#데이터-갱신

my-studies/01-my-studies-list-exceptions.md
  → "대시보드의 스터디 목록과 동일한 로직"
  → dashboard/02-widget-exceptions.md#studystatus
```

### Studies ← 다른 영역

**Studies가 참조되는 경우**:

```
my-studies/02-study-detail-exceptions.md
  → "스터디 상세 정보는 Studies 참조"
  → studies/01-study-crud-exceptions.md#스터디-조회

chat/01-connection-exceptions.md
  → "스터디 멤버십 확인"
  → studies/05-permissions-exceptions.md#멤버-권한

admin/01-user-management.md
  → "스터디 강제 종료"
  → studies/01-study-crud-exceptions.md#스터디-삭제
```

### Profile ← 다른 영역

**Profile이 참조되는 경우**:

```
auth/04-signup-exceptions.md
  → "회원가입 후 프로필 생성"
  → profile/01-profile-edit-exceptions.md#초기-프로필

dashboard/01-data-loading-exceptions.md
  → "사용자 정보 표시"
  → profile/01-profile-edit-exceptions.md#프로필-조회

settings/01-password-change-exceptions.md
  → "OAuth 사용자 확인"
  → profile/01-profile-edit-exceptions.md#계정-타입
```

---

## 순환 참조 주의

### 주의해야 할 순환 참조

#### ❌ 잘못된 참조 (무한 루프)

```
studies/05-permissions-exceptions.md
  → my-studies/02-study-detail-exceptions.md
  → studies/05-permissions-exceptions.md  ← 순환!
```

#### ✅ 올바른 참조 (단방향)

```
studies/05-permissions-exceptions.md (기준 문서)
  ↑
my-studies/02-study-detail-exceptions.md (참조)
  "권한 체계는 studies/05-permissions-exceptions.md 참조"
```

### 순환 참조 방지 규칙

1. **기준 문서 지정**: 각 토픽마다 하나의 기준 문서
2. **단방향 참조**: 기준 문서를 참조만 하고 역참조 금지
3. **계층 구조 유지**: 상위 레벨 → 하위 레벨 참조만 허용

---

## 문서별 참조 통계

### 가장 많이 참조되는 문서 (Top 10)

| 순위 | 문서 | 참조 횟수 | 이유 |
|------|------|-----------|------|
| 1 | auth/03-session-management-exceptions.md | ~50회 | 모든 API 인증 |
| 2 | studies/05-permissions-exceptions.md | ~30회 | 권한 체계 |
| 3 | auth/01-credentials-login-exceptions.md | ~25회 | 로그인 프로세스 |
| 4 | dashboard/03-real-time-sync-exceptions.md | ~20회 | React Query 패턴 |
| 5 | profile/02-avatar-exceptions.md | ~15회 | 파일 업로드 |
| 6 | studies/01-study-crud-exceptions.md | ~15회 | 스터디 기본 작업 |
| 7 | auth/06-common-edge-cases.md | ~12회 | 네트워크 오류 |
| 8 | chat/01-connection-exceptions.md | ~10회 | Socket.IO 패턴 |
| 9 | admin/01-user-management.md | ~8회 | 관리자 작업 |
| 10 | settings/01-password-change-exceptions.md | ~8회 | 보안 정책 |

### 가장 많이 참조하는 문서 (Top 10)

| 순위 | 문서 | 참조 개수 | 주요 참조 대상 |
|------|------|-----------|----------------|
| 1 | my-studies/02-study-detail-exceptions.md | ~15개 | Auth, Studies |
| 2 | dashboard/01-data-loading-exceptions.md | ~12개 | Auth, Studies, Profile |
| 3 | admin/01-user-management.md | ~12개 | 모든 영역 |
| 4 | chat/01-connection-exceptions.md | ~10개 | Auth, Studies |
| 5 | notifications/01-notification-creation.md | ~10개 | 모든 영역 |
| 6 | studies/03-join-leave-exceptions.md | ~8개 | Auth, Studies |
| 7 | my-studies/05-files-exceptions.md | ~7개 | Profile, Chat |
| 8 | settings/02-notification-settings-exceptions.md | ~7개 | Notifications |
| 9 | search/01-search-exceptions.md | ~6개 | Studies, Dashboard |
| 10 | profile/01-profile-edit-exceptions.md | ~6개 | Auth, Settings |

---

## 참조 규칙 및 컨벤션

### 참조 링크 작성 규칙

#### 1. 상대 경로 사용

```markdown
✅ 올바른 예:
[인증 확인](../auth/03-session-management-exceptions.md#세션-확인)

❌ 잘못된 예:
[인증 확인](/docs/exception/auth/03-session-management-exceptions.md)
```

#### 2. 앵커 링크 포함

```markdown
✅ 올바른 예:
[권한 검증](../studies/05-permissions-exceptions.md#멤버-권한)

❌ 잘못된 예:
[권한 검증](../studies/05-permissions-exceptions.md)
```

#### 3. 참조 목적 명시

```markdown
✅ 올바른 예:
권한 체계에 대한 자세한 내용은 
[스터디 권한](../studies/05-permissions-exceptions.md#권한-체계)를 참조하세요.

❌ 잘못된 예:
[여기](../studies/05-permissions-exceptions.md) 참조
```

### 참조 업데이트 체크리스트

문서 수정 시 다음을 확인:

- [ ] 이 문서를 참조하는 다른 문서 확인
- [ ] 참조된 섹션 제목이 변경되었는지 확인
- [ ] 참조 링크가 여전히 유효한지 확인
- [ ] CROSS-REFERENCE.md 업데이트
- [ ] MASTER-INDEX.md 필요 시 업데이트

---

## 참조 관계 시각화 도구

### VS Code에서 참조 추적

```bash
# 특정 문서를 참조하는 파일 찾기
grep -r "auth/03-session-management" docs/exception/

# 특정 예외 코드를 언급하는 파일 찾기
grep -r "AUTH-003" docs/exception/
```

### 참조 그래프 생성 (미래 작업)

```javascript
// 참조 그래프 생성 스크립트 (예시)
const fs = require('fs');
const path = require('path');

function extractReferences(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const linkRegex = /\[.*?\]\((\.\.\/.*?\.md.*?)\)/g;
  return [...content.matchAll(linkRegex)].map(m => m[1]);
}

// docs/exception/ 모든 .md 파일 스캔
// 참조 관계 JSON 생성
// 그래프 시각화 도구로 전달
```

---

## 마이그레이션 가이드

### 문서 구조 변경 시

만약 문서 구조를 변경해야 한다면:

1. **변경 계획 수립**
   - 어떤 파일이 이동/이름 변경되는지
   - 영향받는 참조 리스트 작성

2. **참조 업데이트**
   ```bash
   # 모든 참조 찾기
   grep -r "old-filename.md" docs/exception/
   
   # 일괄 변경 (주의!)
   find docs/exception/ -type f -name "*.md" \
     -exec sed -i 's/old-filename\.md/new-filename.md/g' {} +
   ```

3. **검증**
   - 모든 링크가 작동하는지 확인
   - 404 에러 없는지 확인

4. **문서 업데이트**
   - MASTER-INDEX.md 업데이트
   - CROSS-REFERENCE.md 업데이트
   - README.md 업데이트

---

## 다음 단계

- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - 빠른 찾기 가이드
- [FINAL-GUIDE.md](FINAL-GUIDE.md) - 전체 사용 가이드
- [MASTER-INDEX.md](MASTER-INDEX.md) - 전체 색인으로 돌아가기

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-29  
**버전**: 1.0.0  
**이전 문서**: [MASTER-INDEX.md](MASTER-INDEX.md)  
**다음 문서**: [QUICK-REFERENCE.md](QUICK-REFERENCE.md)

