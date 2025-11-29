# CoUp 예외 처리 빠른 참조 가이드 (Quick Reference)

**작성일**: 2025-11-29  
**Phase**: 8 - 통합 및 마무리  
**버전**: 1.0.0  
**목적**: 상황별 빠른 문제 해결 가이드

---

## 📋 목차

1. [자주 발생하는 문제 Top 20](#자주-발생하는-문제-top-20)
2. [HTTP 상태 코드별 빠른 찾기](#http-상태-코드별-빠른-찾기)
3. [사용자 역할별 가이드](#사용자-역할별-가이드)
4. [상황별 체크리스트](#상황별-체크리스트)
5. [긴급 상황 대응](#긴급-상황-대응)
6. [개발 단계별 가이드](#개발-단계별-가이드)

---

## 자주 발생하는 문제 Top 20

### 🥇 1위: "로그인이 필요합니다" (401)

**원인**:
- 세션 만료
- 토큰 없음
- 잘못된 토큰

**즉시 확인**:
```javascript
// 브라우저 콘솔에서
console.log(sessionStorage.getItem('accessToken'));
console.log(localStorage.getItem('refreshToken'));
```

**해결 방법**:
→ [auth/03-session-management-exceptions.md#jwt-토큰-만료](auth/03-session-management-exceptions.md#jwt-토큰-만료)

**빠른 수정**:
```javascript
// 토큰 갱신
const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken');
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: refresh })
  });
  
  if (response.ok) {
    const { accessToken } = await response.json();
    sessionStorage.setItem('accessToken', accessToken);
    return true;
  }
  
  // 갱신 실패 시 로그인 페이지로
  window.location.href = '/login';
  return false;
};
```

---

### 🥈 2위: "권한이 없습니다" (403)

**원인별 해결**:

| 상황 | 원인 | 해결 문서 |
|------|------|----------|
| 스터디 접근 | 멤버 아님 | [studies/05-permissions-exceptions.md#멤버-권한](studies/05-permissions-exceptions.md) |
| 공지 작성 | MEMBER 역할 | [my-studies/03-notices-exceptions.md#권한-부족](my-studies/03-notices-exceptions.md) |
| 멤버 강퇴 | ADMIN 이상 필요 | [studies/02-member-management-exceptions.md#권한-확인](studies/02-member-management-exceptions.md) |
| 스터디 삭제 | OWNER만 가능 | [studies/01-study-crud-exceptions.md#권한-검증](studies/01-study-crud-exceptions.md) |
| 관리자 기능 | 관리자 아님 | [admin/01-user-management.md#권한-검증](admin/01-user-management.md) |

**디버깅**:
```javascript
// 내 권한 확인
const checkMyRole = async (studyId) => {
  const response = await fetch(`/api/studies/${studyId}/my-membership`);
  const { role, status } = await response.json();
  
  console.log('내 역할:', role); // OWNER, ADMIN, MEMBER
  console.log('상태:', status); // ACTIVE, PENDING, BANNED
  
  return { role, status };
};
```

---

### 🥉 3위: "데이터를 불러올 수 없습니다" (500)

**체크리스트**:
- [ ] 네트워크 연결 확인
- [ ] API 서버 상태 확인
- [ ] 브라우저 콘솔에서 에러 확인
- [ ] 요청 URL 확인

**영역별 해결**:
- **대시보드**: [dashboard/01-data-loading-exceptions.md#api-요청-실패](dashboard/01-data-loading-exceptions.md)
- **스터디**: [studies/01-study-crud-exceptions.md#데이터베이스-오류](studies/01-study-crud-exceptions.md)
- **프로필**: [profile/01-profile-edit-exceptions.md#프로필-조회-실패](profile/01-profile-edit-exceptions.md)

**빠른 디버깅**:
```javascript
// 네트워크 요청 로그
const fetchWithLogging = async (url, options) => {
  console.log('요청:', url, options);
  
  try {
    const response = await fetch(url, options);
    console.log('응답:', response.status, response.statusText);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('에러 상세:', error);
    }
    
    return response;
  } catch (error) {
    console.error('네트워크 에러:', error);
    throw error;
  }
};
```

---

### 4위: "네트워크 연결을 확인해주세요"

**즉시 확인**:
```bash
# 1. 인터넷 연결 확인
ping google.com

# 2. API 서버 확인
curl http://localhost:3000/api/health

# 3. 브라우저 네트워크 탭 확인
# - F12 → Network 탭
# - Failed 요청 확인
```

**해결 방법**:
→ [auth/06-common-edge-cases.md#네트워크-연결-끊김](auth/06-common-edge-cases.md)

**재시도 로직**:
```javascript
// 자동 재시도
const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      console.log(`재시도 ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

### 5위: "이메일 또는 비밀번호가 일치하지 않습니다"

**원인**:
1. 잘못 입력
2. 소셜 로그인 계정
3. 계정 없음

**해결**:
→ [auth/01-credentials-login-exceptions.md#이메일-또는-비밀번호-불일치](auth/01-credentials-login-exceptions.md)

**확인 순서**:
1. 이메일 형식 확인
2. 대소문자 확인
3. 소셜 로그인 계정 여부 확인
4. "비밀번호 찾기" 안내

---

### 6위: "스터디를 찾을 수 없습니다" (404)

**원인**:
- 잘못된 스터디 ID
- 삭제된 스터디
- 비공개 스터디 (권한 없음)

**해결**:
→ [studies/01-study-crud-exceptions.md#스터디-조회-실패](studies/01-study-crud-exceptions.md)

**디버깅**:
```javascript
// 스터디 존재 확인
const checkStudyExists = async (studyId) => {
  try {
    const response = await fetch(`/api/studies/${studyId}`);
    
    if (response.status === 404) {
      console.error('스터디 없음');
      return false;
    }
    
    if (response.status === 403) {
      console.error('접근 권한 없음');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('확인 실패:', error);
    return false;
  }
};
```

---

### 7위: "정원이 마감되었습니다"

**원인**: 최대 인원 도달

**해결**:
→ [studies/03-join-leave-exceptions.md#정원-초과](studies/03-join-leave-exceptions.md)

**확인**:
```javascript
// 정원 확인
const checkStudyCapacity = (study) => {
  const { currentMembers, maxMembers } = study;
  
  if (currentMembers >= maxMembers) {
    return {
      canJoin: false,
      message: `정원 마감 (${currentMembers}/${maxMembers})`
    };
  }
  
  return {
    canJoin: true,
    remaining: maxMembers - currentMembers
  };
};
```

---

### 8위: "이미 가입된 스터디입니다"

**해결**:
→ [studies/03-join-leave-exceptions.md#중복-가입-방지](studies/03-join-leave-exceptions.md)

---

### 9위: "파일 크기가 너무 큽니다"

**제한**:
- 프로필 아바타: 5MB
- 스터디 파일: 10MB
- 채팅 첨부: 10MB

**해결**:
→ [profile/02-avatar-exceptions.md#파일-크기-초과](profile/02-avatar-exceptions.md)

**검증 코드**:
```javascript
const validateFileSize = (file, maxSizeMB) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxBytes) {
    throw new Error(
      `파일 크기는 ${maxSizeMB}MB 이하여야 합니다. ` +
      `현재: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    );
  }
};
```

---

### 10위: "세션이 만료되었습니다"

**해결**:
→ [auth/03-session-management-exceptions.md#jwt-토큰-만료](auth/03-session-management-exceptions.md)

**자동 갱신 구현**:
```javascript
// Axios 인터셉터로 자동 갱신
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshed = await refreshToken();
      if (refreshed) {
        return axios(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

### 11-20위 요약

| 순위 | 문제 | 문서 |
|------|------|------|
| 11 | "필수 항목을 입력해주세요" | [studies/01-study-crud-exceptions.md](studies/01-study-crud-exceptions.md) |
| 12 | "Socket 연결 실패" | [chat/01-connection-exceptions.md](chat/01-connection-exceptions.md) |
| 13 | "메시지 전송 실패" | [chat/02-message-exceptions.md](chat/02-message-exceptions.md) |
| 14 | "비밀번호가 일치하지 않습니다" | [settings/01-password-change-exceptions.md](settings/01-password-change-exceptions.md) |
| 15 | "이메일이 이미 사용 중입니다" | [auth/04-signup-exceptions.md](auth/04-signup-exceptions.md) |
| 16 | "알림을 불러올 수 없습니다" | [notifications/03-notification-ui.md](notifications/03-notification-ui.md) |
| 17 | "검색 결과가 없습니다" | [search/01-search-exceptions.md](search/01-search-exceptions.md) |
| 18 | "프로필을 불러올 수 없습니다" | [profile/01-profile-edit-exceptions.md](profile/01-profile-edit-exceptions.md) |
| 19 | "OWNER는 탈퇴할 수 없습니다" | [studies/03-join-leave-exceptions.md](studies/03-join-leave-exceptions.md) |
| 20 | "관리자 권한이 필요합니다" | [admin/01-user-management.md](admin/01-user-management.md) |

---

## HTTP 상태 코드별 빠른 찾기

### 400 Bad Request - 잘못된 요청

**일반적인 원인**:
- 필수 필드 누락
- 잘못된 데이터 타입
- 유효성 검사 실패

**확인 방법**:
```javascript
// 요청 데이터 검증
const validateRequest = (data, schema) => {
  const errors = [];
  
  for (const [key, validator] of Object.entries(schema)) {
    if (validator.required && !data[key]) {
      errors.push(`${key}는 필수입니다`);
    }
  }
  
  if (errors.length > 0) {
    console.error('검증 실패:', errors);
    return false;
  }
  
  return true;
};
```

**주요 문서**:
- 스터디 생성: [studies/01-study-crud-exceptions.md#유효성-검사-오류](studies/01-study-crud-exceptions.md)
- 프로필 수정: [profile/01-profile-edit-exceptions.md#유효성-검사](profile/01-profile-edit-exceptions.md)
- 회원가입: [auth/04-signup-exceptions.md#입력-검증](auth/04-signup-exceptions.md)

---

### 401 Unauthorized - 인증 필요

**체크리스트**:
- [ ] 로그인 했는지 확인
- [ ] 토큰이 있는지 확인
- [ ] 토큰이 만료되지 않았는지 확인

**해결**:
→ [auth/03-session-management-exceptions.md](auth/03-session-management-exceptions.md)

**전역 처리**:
```javascript
// 전역 401 처리
window.addEventListener('fetch', (event) => {
  event.response.then(response => {
    if (response.status === 401) {
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login?returnUrl=' + 
        encodeURIComponent(window.location.pathname);
    }
  });
});
```

---

### 403 Forbidden - 권한 없음

**역할별 필요 권한**:
- MEMBER: 조회, 댓글
- ADMIN: + 멤버 관리, 공지 작성
- OWNER: + 스터디 삭제, 소유권 이전

**해결**:
→ [studies/05-permissions-exceptions.md](studies/05-permissions-exceptions.md)

---

### 404 Not Found - 찾을 수 없음

**확인 사항**:
1. URL 경로 확인
2. ID 파라미터 확인
3. 리소스가 삭제되었는지 확인

**공통 처리**:
```javascript
// 404 에러 페이지
const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>페이지를 찾을 수 없습니다</h1>
      <button onClick={() => navigate(-1)}>
        이전 페이지로
      </button>
      <button onClick={() => navigate('/')}>
        홈으로
      </button>
    </div>
  );
};
```

---

### 409 Conflict - 충돌

**발생 상황**:
- 이메일 중복
- 중복 가입
- 동시 수정 충돌

**주요 문서**:
- 이메일 중복: [auth/04-signup-exceptions.md#이메일-이미-존재](auth/04-signup-exceptions.md)
- 중복 가입: [studies/03-join-leave-exceptions.md#중복-가입-방지](studies/03-join-leave-exceptions.md)

---

### 500 Internal Server Error - 서버 오류

**즉시 확인**:
1. 서버 로그 확인
2. 데이터베이스 상태 확인
3. 최근 배포 내역 확인

**사용자 대응**:
```javascript
// 친절한 에러 메시지
const handleServerError = (error) => {
  toast.error(
    '일시적인 오류가 발생했습니다. ' +
    '잠시 후 다시 시도해주세요.'
  );
  
  // 에러 리포팅
  reportError(error);
};
```

---

## 사용자 역할별 가이드

### 신규 개발자 (1일차)

**학습 순서**:

1. **기본 개념 이해** (30분)
   - [MASTER-INDEX.md](MASTER-INDEX.md) 전체 구조 파악
   - [FINAL-GUIDE.md](FINAL-GUIDE.md) 사용 방법

2. **인증 시스템** (1시간)
   - [auth/README.md](auth/README.md) 읽기
   - 로그인/회원가입 흐름 이해
   - 세션 관리 방식 학습

3. **주요 기능 하나 선택** (2시간)
   - 스터디 또는 대시보드 선택
   - README → INDEX → 상세 문서 순서로 읽기
   - 예제 코드 실행

4. **실습** (나머지 시간)
   - 간단한 버그 픽스
   - 테스트 코드 작성
   - 코드 리뷰 참여

**즉시 찾아야 할 문서**:
- [auth/01-credentials-login-exceptions.md](auth/01-credentials-login-exceptions.md)
- [dashboard/01-data-loading-exceptions.md](dashboard/01-data-loading-exceptions.md)
- [studies/01-study-crud-exceptions.md](studies/01-study-crud-exceptions.md)

---

### 프론트엔드 개발자

**자주 참조할 문서**:

1. **UI/UX 관련**
   - [dashboard/04-empty-states.md](dashboard/04-empty-states.md)
   - [chat/05-ui-exceptions.md](chat/05-ui-exceptions.md)
   - [search/05-ui-ux-exceptions.md](search/05-ui-ux-exceptions.md)

2. **상태 관리**
   - [dashboard/03-real-time-sync-exceptions.md](dashboard/03-real-time-sync-exceptions.md)
   - [chat/03-realtime-sync-exceptions.md](chat/03-realtime-sync-exceptions.md)

3. **폼 검증**
   - [auth/04-signup-exceptions.md](auth/04-signup-exceptions.md)
   - [profile/01-profile-edit-exceptions.md](profile/01-profile-edit-exceptions.md)
   - [studies/01-study-crud-exceptions.md](studies/01-study-crud-exceptions.md)

**빠른 팁**:
```javascript
// React Query 기본 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 30000,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      onError: (error) => {
        // 전역 에러 처리
        if (error.response?.status === 401) {
          redirectToLogin();
        }
      }
    }
  }
});
```

---

### 백엔드 개발자

**자주 참조할 문서**:

1. **API 설계**
   - 각 영역의 01-*.md (CRUD 작업)
   - [admin/01-user-management.md](admin/01-user-management.md)

2. **권한 관리**
   - [studies/05-permissions-exceptions.md](studies/05-permissions-exceptions.md)
   - [admin/01-user-management.md#권한-검증](admin/01-user-management.md)

3. **데이터베이스**
   - [studies/01-study-crud-exceptions.md#데이터베이스-오류](studies/01-study-crud-exceptions.md)
   - [dashboard/01-data-loading-exceptions.md#쿼리-최적화](dashboard/01-data-loading-exceptions.md)

**빠른 팁**:
```javascript
// API 에러 응답 표준화
const sendError = (res, code, message, details = {}) => {
  return res.status(code).json({
    error: {
      code: `ERR-${code}`,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  });
};

// 사용 예
if (!user) {
  return sendError(res, 404, '사용자를 찾을 수 없습니다', {
    userId: req.params.id
  });
}
```

---

### QA 엔지니어

**테스트 시나리오**:

1. **인증 시나리오**
   - [auth/README.md](auth/README.md) 전체 케이스
   - 로그인/로그아웃/세션 만료

2. **엣지 케이스**
   - 각 영역의 05-edge-cases.md
   - [auth/06-common-edge-cases.md](auth/06-common-edge-cases.md)

3. **성능 테스트**
   - [dashboard/05-performance-optimization.md](dashboard/05-performance-optimization.md)
   - [search/04-performance-optimization.md](search/04-performance-optimization.md)

**체크리스트 템플릿**:
```markdown
## 스터디 생성 테스트

### 정상 케이스
- [ ] 모든 필드 입력 → 생성 성공
- [ ] 최소 필드만 입력 → 생성 성공

### 오류 케이스
- [ ] 필수 필드 누락 → 400 에러
- [ ] 이름 50자 초과 → 400 에러
- [ ] 정원 0명 → 400 에러
- [ ] 로그인 안 함 → 401 에러

### 엣지 케이스
- [ ] 동시에 2개 생성 → 모두 성공
- [ ] 네트워크 끊김 중 생성 → 재시도
- [ ] 이미지 업로드 + 생성 → 성공
```

---

### DevOps 엔지니어

**모니터링 포인트**:

1. **에러 빈도 추적**
   - 401: 인증 문제
   - 500: 서버 오류
   - 타임아웃: 성능 문제

2. **성능 메트릭**
   - API 응답 시간
   - 데이터베이스 쿼리 시간
   - 파일 업로드 시간

3. **보안 이벤트**
   - 로그인 실패 횟수
   - 권한 오류 발생
   - 비정상적인 요청 패턴

**참고 문서**:
- [admin/99-best-practices.md#모니터링](admin/99-best-practices.md)
- 각 영역의 06-performance-*.md

---

## 상황별 체크리스트

### 로그인 안 될 때

- [ ] 이메일 형식 확인
- [ ] 비밀번호 대소문자 확인
- [ ] Caps Lock 확인
- [ ] 소셜 로그인 계정인지 확인
- [ ] 계정 정지 여부 확인
- [ ] 네트워크 연결 확인
- [ ] 브라우저 쿠키 설정 확인

**문서**: [auth/01-credentials-login-exceptions.md](auth/01-credentials-login-exceptions.md)

---

### 데이터 안 보일 때

- [ ] 로그인 상태 확인
- [ ] 권한 확인
- [ ] 브라우저 콘솔 에러 확인
- [ ] 네트워크 탭에서 API 응답 확인
- [ ] 캐시 문제인지 확인 (새로고침)
- [ ] 데이터가 실제로 있는지 확인

**문서**: [dashboard/01-data-loading-exceptions.md](dashboard/01-data-loading-exceptions.md)

---

### 채팅 안 될 때

- [ ] Socket 연결 상태 확인
- [ ] 스터디 멤버인지 확인
- [ ] 브라우저 콘솔 에러 확인
- [ ] 서버 상태 확인
- [ ] 방화벽/프록시 설정 확인

**문서**: [chat/01-connection-exceptions.md](chat/01-connection-exceptions.md)

---

### 파일 업로드 안 될 때

- [ ] 파일 크기 확인 (프로필: 5MB, 기타: 10MB)
- [ ] 파일 형식 확인
- [ ] 네트워크 연결 확인
- [ ] 브라우저 콘솔 에러 확인
- [ ] 저장 공간 확인

**문서**:
- 프로필: [profile/02-avatar-exceptions.md](profile/02-avatar-exceptions.md)
- 스터디: [my-studies/05-files-exceptions.md](my-studies/05-files-exceptions.md)
- 채팅: [chat/04-file-exceptions.md](chat/04-file-exceptions.md)

---

## 긴급 상황 대응

### 🔥 치명적 (Critical) - 즉시 대응

#### 전체 서비스 다운

**체크리스트**:
1. [ ] 서버 프로세스 확인
2. [ ] 데이터베이스 연결 확인
3. [ ] 디스크 용량 확인
4. [ ] 메모리 사용량 확인
5. [ ] 로그 확인

**복구 절차**:
```bash
# 1. 서버 상태 확인
pm2 status

# 2. 서버 재시작
pm2 restart all

# 3. 데이터베이스 확인
psql -U postgres -c "SELECT 1"

# 4. 로그 확인
pm2 logs --lines 100
```

---

#### 대량 401 에러 발생

**원인**:
- JWT 비밀키 변경
- 세션 스토어 초기화
- 서버 재시작

**대응**:
1. 모든 사용자 강제 로그아웃
2. 공지사항 게시
3. 원인 파악 및 수정

**문서**: [auth/03-session-management-exceptions.md](auth/03-session-management-exceptions.md)

---

#### 데이터베이스 연결 실패

**즉시 확인**:
```bash
# PostgreSQL 상태
systemctl status postgresql

# 연결 테스트
psql -U postgres -d coup -c "SELECT NOW()"

# 연결 수 확인
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity"
```

**대응**:
1. 연결 풀 크기 확인
2. 장시간 실행 쿼리 확인
3. 필요시 연결 풀 재시작

---

### ⚠️ 높음 (High) - 빠른 대응

#### 특정 기능 장애

**대응 절차**:
1. 해당 기능 일시 비활성화
2. 에러 로그 수집
3. 원인 분석
4. 수정 및 배포
5. 기능 재활성화

---

#### 성능 저하

**즉시 확인**:
- API 응답 시간
- 데이터베이스 쿼리 시간
- 서버 CPU/메모리 사용률

**문서**: 
- [dashboard/05-performance-optimization.md](dashboard/05-performance-optimization.md)
- [search/04-performance-optimization.md](search/04-performance-optimization.md)

---

## 개발 단계별 가이드

### 기획 단계

**확인할 문서**:
- 유사 기능의 README.md
- 관련 예외 케이스 문서

**질문 리스트**:
- 어떤 권한이 필요한가?
- 어떤 예외 상황이 있을까?
- 다른 기능과의 연관은?

---

### 설계 단계

**참고할 패턴**:
- [CROSS-REFERENCE.md](CROSS-REFERENCE.md) - 의존성 확인
- 각 영역 99-best-practices.md

**설계 체크리스트**:
- [ ] API 엔드포인트 설계
- [ ] 에러 응답 형식 정의
- [ ] 권한 체계 설계
- [ ] 유효성 검사 규칙
- [ ] 테스트 케이스 작성

---

### 구현 단계

**코드 작성 시**:
1. 관련 문서의 코드 예제 참조
2. 공통 패턴 재사용
3. 에러 처리 로직 구현
4. 로깅 추가

---

### 테스트 단계

**테스트 케이스**:
- 정상 케이스
- 오류 케이스 (400, 401, 403, 404, 500)
- 엣지 케이스
- 성능 테스트

**참고**: 각 영역의 05-edge-cases.md

---

### 배포 단계

**체크리스트**:
→ [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)

---

### 운영 단계

**모니터링**:
- 에러 발생 빈도
- API 응답 시간
- 사용자 피드백

**문서 업데이트**:
- 새로운 예외 상황 발견 시
- 해결 방법 개선 시

---

## 추가 참고 자료

### Phase 8 통합 문서
- [MASTER-INDEX.md](MASTER-INDEX.md) - 전체 색인
- [CROSS-REFERENCE.md](CROSS-REFERENCE.md) - 문서 간 참조
- [FINAL-GUIDE.md](FINAL-GUIDE.md) - 사용 가이드
- [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - 배포 체크리스트
- [TEAM-ONBOARDING.md](TEAM-ONBOARDING.md) - 신규 팀원 온보딩

### 각 영역 README
- [auth/README.md](auth/README.md) - 인증
- [dashboard/README.md](dashboard/README.md) - 대시보드
- [studies/README.md](studies/README.md) - 스터디
- [chat/README.md](chat/README.md) - 채팅
- [profile/README.md](profile/README.md) - 프로필
- [admin/README.md](admin/README.md) - 관리자

---

## 피드백

이 가이드에서 찾지 못한 내용이 있다면:
1. [MASTER-INDEX.md](MASTER-INDEX.md)에서 검색
2. 관련 영역의 INDEX.md 확인
3. 문서 개선 제안

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-29  
**버전**: 1.0.0  
**이전 문서**: [CROSS-REFERENCE.md](CROSS-REFERENCE.md)  
**다음 문서**: [FINAL-GUIDE.md](FINAL-GUIDE.md)

