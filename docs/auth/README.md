# 인증 시스템 설계

이 폴더에는 CoUp 프로젝트의 인증 시스템 설계 문서가 포함되어 있습니다.

## 📑 문서 목록

### 1. [nextauth.md](./nextauth.md)
- **NextAuth.js 설계 문서**
- JWT에서 NextAuth로 마이그레이션 설계
- 아키텍처 및 전략
- 구현 상세 (코드 예시 포함)

### 2. [migration-changes.md](./migration-changes.md)
- **마이그레이션 변경 사항**
- 파일별 Before/After
- 주요 변경점 요약

### 3. [quick-start.md](./quick-start.md)
- **빠른 시작 가이드**
- NextAuth 기본 사용법
- 세션 관리 예제

## 🔑 핵심 개념

### 세션 사용 (클라이언트)
```javascript
"use client"
import { useSession } from "next-auth/react"

function Component() {
  const { data: session, status } = useSession()
  if (status === "loading") return <div>Loading...</div>
  return <div>Hello {session?.user?.name}</div>
}
```

### 세션 사용 (서버)
```javascript
import { auth } from "@/lib/auth"

export default async function Page() {
  const session = await auth()
  return <div>Hello {session?.user?.name}</div>
}
```

### 로그인/로그아웃
```javascript
import { signIn, signOut } from "next-auth/react"

// 로그인
signIn("credentials", { email, password })

// 로그아웃
signOut({ callbackUrl: "/" })
```

## 🔗 관련 문서

- [프로젝트 초기화](../project-init/) - 전체 프로젝트 구조
- [백엔드 가이드](../backend/) - 백엔드 API 문서

## 📚 참고 링크

- [NextAuth.js 공식 문서](https://authjs.dev/)
- [Credentials Provider](https://authjs.dev/getting-started/providers/credentials)
- [Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)

---

**Last Updated**: 2025-11-22
