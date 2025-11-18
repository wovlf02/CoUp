# 인증 시스템 문서

이 폴더는 CoUp 프로젝트의 인증 시스템 관련 문서를 포함합니다.

## 📁 파일 구조

### 1. [nextauth.md](./nextauth.md)
**NextAuth.js 마이그레이션 설계 문서**

JWT 기반 인증에서 NextAuth로 마이그레이션하는 전체 설계 문서입니다.

**주요 내용:**
- 현재 인증 시스템 분석
- NextAuth 도입 이유 및 장점
- 아키텍처 설계
- 마이그레이션 전략 (6 Phase)
- 구현 상세 (코드 예시 포함)
- 테스트 계획
- 배포 및 롤백 계획
- 참고 자료

**대상 독자:** 개발자, 아키텍트

---

### 2. [nextauth-migration-todo.md](./nextauth-migration-todo.md)
**NextAuth 마이그레이션 Todo List**

실제 마이그레이션 작업을 수행할 때 사용할 단계별 체크리스트입니다.

**주요 내용:**
- 12개 Phase별 상세 작업 목록
- 체크박스 형식의 Todo List
- 각 작업의 예상 시간
- 코드 스니펫 및 명령어
- 테스트 체크리스트
- 문제 해결 가이드

**대상 독자:** 실제 마이그레이션 담당 개발자

---

## 🔄 현재 상태

### JWT 기반 인증 (현재)
```
- Access Token: 15분 (JWT)
- Refresh Token: 7일 (Redis)
- 수동 토큰 관리
- OAuth 미지원
```

### NextAuth 인증 (마이그레이션 후)
```
- Session: 7일 (JWT, 자동 갱신)
- OAuth 지원 (Google, GitHub)
- 표준화된 인증 플로우
- 향상된 보안 및 유지보수성
```

---

## 🚀 빠른 시작

### 마이그레이션 순서
1. **설계 이해**: [nextauth.md](./nextauth.md) 읽기
2. **Todo 확인**: [nextauth-migration-todo.md](./nextauth-migration-todo.md) 열기
3. **Phase별 진행**: Phase 1부터 순차적으로 진행
4. **테스트**: 각 Phase마다 테스트
5. **배포**: 스테이징 → 프로덕션

### 예상 일정
- **전체 소요 시간**: 약 28시간 (3.5일)
- **Phase 1-6**: 핵심 기능 (15시간)
- **Phase 7**: OAuth 추가 (3시간, Optional)
- **Phase 8-12**: 정리 및 배포 (10시간)

---

## 📋 주요 변경 사항

### 제거될 파일
- `src/lib/jwt.js` - NextAuth 자체 JWT 사용
- `src/app/api/auth/login/route.js` - NextAuth signIn()
- `src/app/api/auth/logout/route.js` - NextAuth signOut()
- `src/app/api/auth/refresh/route.js` - 자동 갱신
- `src/app/api/auth/me/route.js` - useSession()

### 추가될 파일
- `src/lib/auth.ts` - NextAuth 설정
- `src/lib/session-provider.tsx` - SessionProvider
- `src/types/next-auth.d.ts` - 타입 정의
- `src/hooks/useAuth.ts` - 커스텀 Hook

### 수정될 파일
- `middleware.ts` - NextAuth 기반 미들웨어
- `src/lib/auth-helpers.ts` - NextAuth 기반 헬퍼
- `src/app/layout.tsx` - SessionProvider 추가
- `src/app/(auth)/sign-in/page.tsx` - signIn() 사용
- `src/app/(auth)/sign-up/page.tsx` - 회원가입 후 signIn()

---

## 🔑 핵심 개념

### NextAuth Session Strategy
```javascript
// JWT 전략 사용
session: {
  strategy: "jwt",
  maxAge: 7 * 24 * 60 * 60, // 7일
}
```

### 세션 사용 (클라이언트)
```javascript
"use client"
import { useSession } from "next-auth/react"

function Component() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <div>Loading...</div>
  if (status === "unauthenticated") return <div>Not logged in</div>
  
  return <div>Hello {session.user.name}</div>
}
```

### 세션 사용 (서버)
```javascript
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Page() {
  const session = await auth()
  
  if (!session) {
    redirect("/sign-in")
  }
  
  return <div>Hello {session.user.name}</div>
}
```

### 로그인/로그아웃
```javascript
"use client"
import { signIn, signOut } from "next-auth/react"

// 로그인
signIn("credentials", { email, password })
signIn("google")
signIn("github")

// 로그아웃
signOut({ callbackUrl: "/" })
```

---

## ✅ 마이그레이션 체크리스트

- [ ] 설계 문서 읽기 완료
- [ ] Todo List 확인 완료
- [ ] 팀원과 일정 조율
- [ ] 백업 계획 수립
- [ ] Phase 1-6 완료 (핵심 기능)
- [ ] Phase 7 완료 (OAuth, Optional)
- [ ] Phase 8-9 완료 (코드 정리)
- [ ] Phase 10 완료 (테스트)
- [ ] Phase 11 완료 (문서화)
- [ ] Phase 12 완료 (배포)
- [ ] 모니터링 확인

---

## 🔗 참고 링크

### 공식 문서
- [NextAuth.js (Auth.js)](https://authjs.dev/)
- [Credentials Provider](https://authjs.dev/getting-started/providers/credentials)
- [Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)
- [JWT Strategy](https://authjs.dev/guides/jwt)

### 예제
- [NextAuth Example](https://github.com/nextauthjs/next-auth-example)
- [T3 Stack](https://create.t3.gg/)

### 마이그레이션 가이드
- [Migrating to v5](https://authjs.dev/guides/upgrade-to-v5)

---

## 💡 팁

1. **점진적 마이그레이션**: 한 번에 모든 것을 바꾸지 말고 Phase별로 진행
2. **테스트 필수**: 각 Phase 완료 후 반드시 테스트
3. **백업**: Git 커밋을 세분화하여 롤백 가능하게
4. **문서화**: 변경 사항을 기록하며 진행
5. **OAuth는 나중에**: 핵심 기능 먼저 완료 후 OAuth 추가

---

## ❓ 문제 해결

### 자주 묻는 질문

**Q: NextAuth를 꼭 도입해야 하나요?**
A: 현재 JWT 시스템도 잘 작동하지만, NextAuth를 사용하면 OAuth 추가, 보안 강화, 유지보수성 향상 등의 장점이 있습니다.

**Q: Redis는 계속 사용하나요?**
A: Refresh Token 저장은 필요 없어지지만, Rate Limiting, Caching 등 다른 용도로 계속 사용할 수 있습니다.

**Q: 마이그레이션 중 서비스 중단이 있나요?**
A: 스테이징 환경에서 충분히 테스트 후 배포하면 최소한의 중단만 발생합니다.

**Q: 롤백이 가능한가요?**
A: Phase별로 Git 커밋하고 백업하면 언제든 롤백 가능합니다.

---

## 📞 연락처

마이그레이션 중 문제가 발생하면:
1. [nextauth-migration-todo.md](./nextauth-migration-todo.md)의 "문제 발생 시 대응" 참조
2. NextAuth 공식 문서 검색
3. GitHub Issues 확인
4. 팀 리드에게 문의

---

**작성일**: 2025-01-18  
**버전**: 1.0
**작성자**: GitHub Copilot

