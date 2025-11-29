# CoUp 팀 온보딩 가이드 (Team Onboarding)

**작성일**: 2025-11-29  
**Phase**: 8 - 통합 및 마무리  
**버전**: 1.0.0  
**목적**: 신규 팀원의 빠른 적응과 생산성 향상

---

## 📋 목차

1. [환영합니다!](#환영합니다)
2. [첫날 (Day 1)](#첫날-day-1)
3. [첫 주 (Week 1)](#첫-주-week-1)
4. [첫 달 (Month 1)](#첫-달-month-1)
5. [역할별 학습 경로](#역할별-학습-경로)
6. [자주 묻는 질문](#자주-묻는-질문)

---

## 환영합니다!

CoUp 프로젝트에 오신 것을 환영합니다! 🎉

이 가이드는 여러분이 팀에 빠르게 적응하고, 효과적으로 기여할 수 있도록 돕기 위해 만들어졌습니다.

### 프로젝트 소개

**CoUp**은 대학생들을 위한 스터디 관리 플랫폼입니다.

**주요 기능**:
- 📚 스터디 생성 및 관리
- 👥 멤버 초대 및 역할 관리
- 💬 실시간 채팅
- 📊 출석 및 통계
- 📁 파일 공유
- 📅 일정 관리
- 🔔 실시간 알림

**기술 스택**:
- **프론트엔드**: Next.js 14, React, TypeScript, Tailwind CSS
- **백엔드**: Next.js API Routes, Prisma
- **데이터베이스**: PostgreSQL
- **실시간**: Socket.IO
- **인증**: NextAuth.js
- **배포**: Vercel / AWS

---

## 첫날 (Day 1)

### 오전: 환경 설정 (2-3시간)

#### 1. 계정 설정
**체크리스트**:
- [ ] GitHub 계정 팀 조직에 추가됨
- [ ] Slack/Discord 워크스페이스 가입
- [ ] 이메일 계정 활성화
- [ ] 필요한 서비스 접근 권한 부여
  - Vercel
  - Database (읽기 전용)
  - Sentry
  - 기타 모니터링 도구

---

#### 2. 개발 환경 구축
```bash
# 1. 저장소 클론
git clone https://github.com/your-org/coup.git
cd coup

# 2. Node.js 버전 확인 (>= 18)
node --version

# 3. 의존성 설치
cd coup
npm install

# 4. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 수정 (팀원에게 실제 값 요청)

# 5. 데이터베이스 설정
npx prisma generate
npx prisma db push

# 6. 시드 데이터 생성
npm run seed

# 7. 개발 서버 실행
npm run dev

# 8. 브라우저에서 확인
# http://localhost:3000
```

**테스트 계정**:
```
이메일: test@example.com
비밀번호: test123456
```

**체크리스트**:
- [ ] 저장소 클론 완료
- [ ] 의존성 설치 완료
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 연결 성공
- [ ] 개발 서버 실행 성공
- [ ] 로그인 테스트 성공

**문제 해결**:
- 환경 변수 누락: 팀원에게 `.env.local` 템플릿 요청
- 데이터베이스 연결 실패: `DATABASE_URL` 확인
- 포트 충돌: `.env.local`에서 `PORT` 변경

---

### 오후: 프로젝트 구조 이해 (2-3시간)

#### 3. 프로젝트 구조 둘러보기

```
CoUp/
├── coup/                    # Next.js 프로젝트
│   ├── src/
│   │   ├── app/            # App Router (페이지)
│   │   │   ├── (auth)/     # 인증 페이지
│   │   │   ├── dashboard/  # 대시보드
│   │   │   ├── studies/    # 스터디 목록
│   │   │   └── api/        # API 라우트
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── lib/            # 유틸리티 함수
│   │   ├── contexts/       # React Context
│   │   └── styles/         # 글로벌 스타일
│   ├── prisma/
│   │   └── schema.prisma   # 데이터베이스 스키마
│   └── public/             # 정적 파일
├── docs/                    # 문서
│   ├── exception/          # 예외 처리 문서 ⭐
│   ├── api/                # API 문서
│   └── guides/             # 가이드
└── signaling-server/        # Socket.IO 서버
```

**중요한 디렉토리**:
- `src/app/api`: 백엔드 API 엔드포인트
- `src/components`: 재사용 가능한 UI 컴포넌트
- `docs/exception`: 예외 처리 문서 (매우 중요!) ⭐

---

#### 4. 문서 읽기 (필수)

**Day 1 필수 문서** (30분):

1. **프로젝트 전체 개요**
   - `README.md` (루트)
   - `coup/README.md`

2. **예외 처리 시작**
   - [FINAL-GUIDE.md](FINAL-GUIDE.md) ⭐⭐⭐
   - [QUICK-REFERENCE.md](QUICK-REFERENCE.md)

3. **코딩 컨벤션**
   - `docs/guides/CODING-STYLE.md`

**체크리스트**:
- [ ] README.md 읽음
- [ ] FINAL-GUIDE.md 읽음
- [ ] QUICK-REFERENCE.md 북마크
- [ ] 코딩 컨벤션 이해

---

#### 5. 첫 번째 코드 실행

**간단한 테스트** (30분):

```javascript
// 1. API 테스트
// coup/src/app/api/test/route.js 생성
export async function GET() {
  return Response.json({ 
    message: 'Hello from CoUp!',
    timestamp: new Date().toISOString()
  });
}

// 2. 브라우저에서 확인
// http://localhost:3000/api/test

// 3. 프론트엔드 컴포넌트 테스트
// coup/src/app/test/page.js 생성
export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Hello from {'{'}사용자 이름{'}'}!
      </h1>
    </div>
  );
}

// 4. 브라우저에서 확인
// http://localhost:3000/test
```

**체크리스트**:
- [ ] API 엔드포인트 생성
- [ ] API 응답 확인
- [ ] React 페이지 생성
- [ ] 페이지 렌더링 확인

---

### 첫날 마무리

**오늘 한 일 체크**:
- [ ] 개발 환경 구축 완료
- [ ] 프로젝트 구조 이해
- [ ] 필수 문서 읽음
- [ ] 간단한 코드 실행 성공

**내일 할 일**:
- 첫 번째 이슈 선택
- 예외 처리 문서 상세 학습
- 팀원과 페어 프로그래밍

---

## 첫 주 (Week 1)

### Day 2: 인증 시스템 이해

#### 오전: 인증 문서 학습

**필수 문서** (2시간):
- [auth/README.md](auth/README.md)
- [auth/INDEX.md](auth/INDEX.md)
- [auth/01-credentials-login-exceptions.md](auth/01-credentials-login-exceptions.md)
- [auth/03-session-management-exceptions.md](auth/03-session-management-exceptions.md)

**체크리스트**:
- [ ] 로그인 프로세스 이해
- [ ] JWT 토큰 관리 방식 이해
- [ ] 세션 갱신 로직 이해
- [ ] 주요 예외 케이스 파악

---

#### 오후: 인증 코드 분석

**분석할 파일**:
```
coup/src/app/api/auth/
├── signin/route.js         # 로그인 API
├── signout/route.js        # 로그아웃 API
├── signup/route.js         # 회원가입 API
└── refresh/route.js        # 토큰 갱신 API

coup/src/components/auth/
├── LoginForm.jsx           # 로그인 폼
├── SignupForm.jsx          # 회원가입 폼
└── AuthGuard.jsx           # 인증 가드
```

**실습** (1-2시간):
```bash
# 1. 디버거 설정
# VS Code에서 F5 눌러 디버깅 시작

# 2. 로그인 흐름 따라가기
# - 브라우저에서 로그인
# - 브레이크포인트로 코드 실행 추적
# - API 요청/응답 확인

# 3. 에러 케이스 테스트
# - 잘못된 비밀번호 입력
# - 존재하지 않는 이메일 입력
# - 네트워크 에러 시뮬레이션
```

**체크리스트**:
- [ ] 로그인 API 코드 이해
- [ ] 프론트엔드 로그인 폼 이해
- [ ] 에러 처리 방식 이해
- [ ] 예외 코드 (AUTH-*) 적용 방식 파악

---

### Day 3: 첫 번째 이슈 해결

#### 오전: Good First Issue 선택

**Good First Issue 찾기**:
```
GitHub Issues에서:
- 라벨: "good first issue"
- 라벨: "documentation"
- 라벨: "bug" + "easy"
```

**추천 첫 이슈**:
1. 문서 오타 수정
2. 간단한 UI 버그 수정
3. 테스트 케이스 추가
4. 로깅 개선

**체크리스트**:
- [ ] 이슈 선택 및 할당
- [ ] 이슈 이해 및 재현
- [ ] 해결 방법 계획

---

#### 오후: 이슈 해결 및 PR

**개발 프로세스**:
```bash
# 1. 브랜치 생성
git checkout -b fix/issue-123-login-button-text

# 2. 코드 수정
# ... 수정 작업 ...

# 3. 테스트
npm test
npm run lint

# 4. 커밋
git add .
git commit -m "fix: 로그인 버튼 텍스트 수정

- 기존: 'Submit'
- 변경: '로그인'
- Closes #123"

# 5. 푸시
git push origin fix/issue-123-login-button-text

# 6. PR 생성
# GitHub에서 Pull Request 생성
# - 제목: "fix: 로그인 버튼 텍스트 수정"
# - 설명: 변경 내용, 스크린샷, 테스트 방법
# - 관련 이슈: #123
```

**PR 템플릿**:
```markdown
## 변경 내용
로그인 버튼 텍스트를 'Submit'에서 '로그인'으로 변경

## 변경 이유
사용자 친화적인 한글 텍스트 사용

## 테스트 방법
1. 로그인 페이지 접속
2. 버튼 텍스트 확인

## 스크린샷
[Before] [After]

## 체크리스트
- [x] 코드 리뷰 요청
- [x] 테스트 통과
- [x] 린트 통과
- [x] 문서 업데이트 (해당 없음)
```

**체크리스트**:
- [ ] 브랜치 생성 및 작업
- [ ] 테스트 및 린트 통과
- [ ] 커밋 메시지 작성
- [ ] PR 생성
- [ ] 코드 리뷰 대응

---

### Day 4-5: 기능 영역 학습

#### 관심 영역 선택

**프론트엔드 개발자**:
- Dashboard (대시보드)
- Studies (스터디 관리)
- Chat (채팅)

**백엔드 개발자**:
- API 설계
- 데이터베이스 최적화
- 권한 관리

**풀스택 개발자**:
- 전체 기능 흐름
- 통합 테스트

---

#### 학습 방법

**1. 문서 읽기** (각 영역 2-3시간):
```
[영역]/README.md          → 전체 개요
[영역]/INDEX.md           → 상세 색인
[영역]/01-*.md            → 핵심 기능
[영역]/99-best-practices  → 모범 사례
```

**2. 코드 분석** (2-3시간):
```
src/app/[영역]/           → 페이지 컴포넌트
src/app/api/[영역]/       → API 엔드포인트
src/components/[영역]/    → UI 컴포넌트
```

**3. 실습** (2-3시간):
- 기능 사용해보기
- 디버거로 코드 추적
- 간단한 수정 시도

---

### 첫 주 마무리

**이번 주 성과**:
- [ ] 개발 환경 구축
- [ ] 프로젝트 구조 이해
- [ ] 인증 시스템 학습
- [ ] 첫 PR 생성
- [ ] 관심 영역 학습 시작

**다음 주 목표**:
- 중간 난이도 이슈 해결
- 페어 프로그래밍 참여
- 코드 리뷰 시작

---

## 첫 달 (Month 1)

### Week 2: 기여 확대

**목표**:
- 주요 기능 개발 참여
- 코드 리뷰 적극 참여
- 팀 프로세스 이해

**활동**:
- [ ] 중간 난이도 이슈 2-3개 해결
- [ ] 다른 팀원 PR 리뷰 3개 이상
- [ ] 스탠드업 미팅 참여
- [ ] 페어 프로그래밍 2-3회

---

### Week 3: 전문성 개발

**목표**:
- 특정 영역 전문가 되기
- 문서 기여 시작

**활동**:
- [ ] 전문 영역 선택 (예: Chat, Admin)
- [ ] 해당 영역 모든 문서 숙지
- [ ] 복잡한 이슈 해결
- [ ] 문서 개선 제안

---

### Week 4: 독립적 기여

**목표**:
- 독립적으로 기능 개발
- 멘토링 시작 (후배 온보딩)

**활동**:
- [ ] 새로운 기능 설계 및 구현
- [ ] 기술 문서 작성
- [ ] 다른 팀원 멘토링
- [ ] 프로젝트 개선 제안

---

## 역할별 학습 경로

### 프론트엔드 개발자

#### Week 1: 기초
- [ ] Next.js App Router 이해
- [ ] React Query 패턴 학습
- [ ] Tailwind CSS 활용

**핵심 문서**:
- [dashboard/README.md](dashboard/README.md)
- [dashboard/03-real-time-sync-exceptions.md](dashboard/03-real-time-sync-exceptions.md)

**실습**:
- 간단한 컴포넌트 생성
- API 연동
- 에러 처리 구현

---

#### Week 2-3: 심화
- [ ] 실시간 기능 (Socket.IO)
- [ ] 파일 업로드
- [ ] 복잡한 상태 관리

**핵심 문서**:
- [chat/README.md](chat/README.md)
- [chat/01-connection-exceptions.md](chat/01-connection-exceptions.md)

**실습**:
- 채팅 기능 개선
- 파일 업로드 UI
- 낙관적 업데이트 구현

---

#### Week 4: 전문화
- [ ] 성능 최적화
- [ ] 접근성 개선
- [ ] 테스트 작성

**핵심 문서**:
- [dashboard/05-performance-optimization.md](dashboard/05-performance-optimization.md)
- [search/04-performance-optimization.md](search/04-performance-optimization.md)

---

### 백엔드 개발자

#### Week 1: 기초
- [ ] Prisma ORM 이해
- [ ] API 라우트 패턴
- [ ] 인증 및 권한 체계

**핵심 문서**:
- [auth/README.md](auth/README.md)
- [studies/05-permissions-exceptions.md](studies/05-permissions-exceptions.md)

**실습**:
- API 엔드포인트 생성
- 데이터베이스 쿼리
- 권한 검증 구현

---

#### Week 2-3: 심화
- [ ] 복잡한 쿼리 최적화
- [ ] 트랜잭션 처리
- [ ] 실시간 서버 (Socket.IO)

**핵심 문서**:
- [studies/01-study-crud-exceptions.md](studies/01-study-crud-exceptions.md)
- [admin/01-user-management.md](admin/01-user-management.md)

**실습**:
- 복잡한 비즈니스 로직
- 데이터 무결성 보장
- 에러 처리 개선

---

#### Week 4: 전문화
- [ ] 성능 모니터링
- [ ] 보안 강화
- [ ] 스케일링 전략

**핵심 문서**:
- [admin/99-best-practices.md](admin/99-best-practices.md)

---

### QA 엔지니어

#### Week 1: 기초
- [ ] 기능 명세 이해
- [ ] 테스트 케이스 작성
- [ ] 버그 리포트 작성

**핵심 문서**:
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
- 각 영역의 INDEX.md

**실습**:
- 수동 테스트
- 버그 재현
- 이슈 리포트

---

#### Week 2-3: 심화
- [ ] 자동화 테스트 작성
- [ ] E2E 테스트 구축
- [ ] 성능 테스트

**실습**:
- Jest 테스트 작성
- Playwright E2E 테스트
- 부하 테스트

---

#### Week 4: 전문화
- [ ] 테스트 전략 수립
- [ ] CI/CD 개선
- [ ] 품질 메트릭 추적

---

## 자주 묻는 질문

### 개발 환경

**Q: npm install이 실패해요**
```bash
# 1. Node.js 버전 확인
node --version  # >= 18 필요

# 2. npm 캐시 클리어
npm cache clean --force

# 3. node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

---

**Q: 데이터베이스 연결이 안 돼요**
```bash
# 1. DATABASE_URL 확인
cat .env.local | grep DATABASE_URL

# 2. PostgreSQL 실행 확인
# Windows
net start postgresql-x64-14

# Mac
brew services start postgresql

# 3. 연결 테스트
psql -U postgres -d coup -c "SELECT 1"
```

**문서**: [auth/01-credentials-login-exceptions.md](auth/01-credentials-login-exceptions.md)

---

### 코딩

**Q: 어떤 코딩 스타일을 따라야 하나요?**

**답변**:
- ESLint 규칙 준수
- Prettier 포맷팅
- 커밋 메시지 컨벤션 (Conventional Commits)

**자동 포맷팅**:
```bash
npm run format
npm run lint:fix
```

---

**Q: 예외 처리는 어떻게 하나요?**

**답변**:
1. 관련 예외 문서 찾기 (MASTER-INDEX.md)
2. 예외 코드 사용 (예: AUTH-003)
3. 사용자 친화적 메시지
4. 로깅 추가

**예제**:
```javascript
try {
  const study = await getStudy(id);
} catch (error) {
  if (error.code === 'P2025') {
    // studies/01-study-crud-exceptions.md 참조
    throw new NotFoundError('STD-001: 스터디를 찾을 수 없습니다');
  }
  throw error;
}
```

**문서**: [FINAL-GUIDE.md](FINAL-GUIDE.md)

---

### 프로세스

**Q: 어떤 이슈를 선택해야 하나요?**

**답변**:
- **첫 주**: "good first issue" 라벨
- **첫 달**: "help wanted" 라벨
- **이후**: 관심 영역의 모든 이슈

**이슈 선택 기준**:
1. 난이도 (easy → medium → hard)
2. 관심 영역
3. 학습 목표
4. 팀 우선순위

---

**Q: PR 리뷰는 얼마나 걸리나요?**

**답변**:
- 일반적으로 24시간 이내
- 긴급 수정(Hotfix)은 1시간 이내
- 리뷰 요청 후 1일 이내 응답 없으면 리마인드

---

**Q: 코드 리뷰 코멘트에 어떻게 대응하나요?**

**답변**:
1. 모든 코멘트에 답변
2. 동의하면 수정 후 "Done" 코멘트
3. 동의하지 않으면 이유 설명 및 토론
4. 모든 대화 해결 후 "Resolved" 표시

---

### 문서

**Q: 예외 처리 문서가 너무 많아요. 어디서 시작해야 하나요?**

**답변**:
1. [FINAL-GUIDE.md](FINAL-GUIDE.md) 읽기 (30분)
2. [QUICK-REFERENCE.md](QUICK-REFERENCE.md) 북마크
3. 필요할 때 [MASTER-INDEX.md](MASTER-INDEX.md)에서 검색

**자주 쓰는 문서**:
- auth/01-credentials-login-exceptions.md
- dashboard/01-data-loading-exceptions.md
- studies/01-study-crud-exceptions.md

---

**Q: 문서를 업데이트해야 할 때는?**

**답변**:
- 새로운 예외 발견 시
- 해결 방법 개선 시
- 예제 코드 추가 시

**절차**:
1. 관련 문서 수정
2. INDEX.md 업데이트
3. PR 생성
4. 리뷰 후 머지

**문서**: [FINAL-GUIDE.md#문서-유지보수](FINAL-GUIDE.md#문서-유지보수)

---

## 다음 단계

### 신규 개발자 다음 단계

1. ✅ 온보딩 완료
2. → 관심 영역 전문화
3. → 멘토링 시작
4. → 기술 리더십 개발

---

### 도움이 필요할 때

**누구에게 물어볼까요?**
- 개발 환경: DevOps 팀
- 코드 질문: 시니어 개발자
- 문서 관련: Tech Writer
- 프로세스: PM/Scrum Master

**어디서 물어볼까요?**
- Slack/Discord: 일반 질문
- GitHub Issues: 버그, 기능 요청
- 1:1 미팅: 복잡한 주제
- 팀 회의: 전체 공유 필요 시

---

## 축하합니다! 🎉

온보딩 가이드를 완료하셨습니다!

이제 여러분은:
- ✅ CoUp 프로젝트 구조 이해
- ✅ 개발 환경 구축
- ✅ 첫 기여 완료
- ✅ 팀 프로세스 숙지

**계속 성장하세요!**
- 문서 계속 읽기
- 어려운 이슈 도전
- 팀원과 협업
- 새로운 기술 학습

**환영합니다!** 🚀

---

## 추가 자료

### 필수 문서
- [MASTER-INDEX.md](MASTER-INDEX.md) - 전체 예외 색인
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - 빠른 참조
- [FINAL-GUIDE.md](FINAL-GUIDE.md) - 사용 가이드
- [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - 배포 체크리스트

### 외부 자료
- Next.js 공식 문서: https://nextjs.org/docs
- Prisma 공식 문서: https://www.prisma.io/docs
- React 공식 문서: https://react.dev

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-29  
**버전**: 1.0.0  
**이전 문서**: [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)  
**다음 문서**: [FINAL-REPORT.md](FINAL-REPORT.md)

