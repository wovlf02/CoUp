# OAuth 로그인 예외 처리

Google, GitHub 등 소셜 로그인에서 발생할 수 있는 모든 예외 상황을 다룹니다.

---

## 📋 목차

1. [OAuth 설정 예외](#oauth-설정-예외)
2. [인증 흐름 예외](#인증-흐름-예외)
3. [계정 연동 예외](#계정-연동-예외)
4. [프로바이더별 예외](#프로바이더별-예외)
5. [보안 관련 예외](#보안-관련-예외)

---

## ⚠️ 현재 상태

OAuth 로그인은 **아직 구현되지 않았습니다**.

```javascript
// src/app/(auth)/sign-in/page.jsx
const handleSocialLogin = async (provider) => {
  setError(`${provider} 로그인은 아직 지원하지 않습니다.`)
}
```

이 문서는 **향후 OAuth 구현 시** 참고할 예외 처리 가이드입니다.

---

## OAuth 설정 예외

### 1. 환경 변수 누락

#### 증상
```
Error: Please define the GOOGLE_CLIENT_ID environment variable
```

#### 필요한 환경 변수

```bash
# .env.local

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
```

#### 발급 방법

**Google Cloud Console**:
1. https://console.cloud.google.com/
2. 프로젝트 생성
3. "API 및 서비스" → "사용자 인증 정보"
4. "OAuth 2.0 클라이언트 ID" 생성
5. 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback/google`

**GitHub Settings**:
1. https://github.com/settings/developers
2. "OAuth Apps" → "New OAuth App"
3. Application name: CoUp
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

---

### 2. 리디렉션 URI 불일치

#### 증상 (Google)
```
Error: redirect_uri_mismatch
```

#### 증상 (GitHub)
```
The redirect_uri MUST match the registered callback URL for this application.
```

#### 원인
```javascript
// Google Cloud Console에 등록된 URI
http://localhost:3000/api/auth/callback/google

// 실제 요청된 URI
http://localhost:3001/api/auth/callback/google  // 포트 다름
https://localhost:3000/api/auth/callback/google // 프로토콜 다름
```

#### 해결 방법

**개발 환경**:
```
등록할 URI:
- http://localhost:3000/api/auth/callback/google
- http://localhost:3000/api/auth/callback/github
```

**프로덕션 환경**:
```
등록할 URI:
- https://coup.com/api/auth/callback/google
- https://coup.com/api/auth/callback/github
```

**NEXTAUTH_URL 확인**:
```bash
# .env.local (개발)
NEXTAUTH_URL=http://localhost:3000

# .env.production (프로덕션)
NEXTAUTH_URL=https://coup.com
```

---

## 인증 흐름 예외

### 1. OAuth 팝업 차단

#### 증상
사용자가 "Google로 로그인" 버튼 클릭해도 아무 일도 안 일어남

#### 원인
브라우저 팝업 차단 설정

#### 감지 방법

```javascript
const handleSocialLogin = async (provider) => {
  try {
    setLoading(provider)
    
    // 팝업 테스트
    const popup = window.open('', '_blank', 'width=500,height=600')
    
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setError('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
      setLoading(null)
      return
    }
    
    popup.close()
    
    // OAuth 진행
    await signIn(provider, { callbackUrl })
    
  } catch (err) {
    console.error(`${provider} 로그인 실패:`, err)
    setError('로그인 중 오류가 발생했습니다.')
    setLoading(null)
  }
}
```

#### 사용자 안내

```jsx
{error?.includes('팝업') && (
  <Alert type="warning">
    <h4>팝업이 차단되었습니다</h4>
    <p>소셜 로그인을 위해 팝업을 허용해주세요.</p>
    <button onClick={() => window.location.reload()}>
      팝업 허용 후 다시 시도
    </button>
  </Alert>
)}
```

---

### 2. OAuth 콜백 실패

#### 증상
OAuth 인증 후 `/sign-in?error=OAuthCallback` 로 리다이렉트

#### 발생 위치

```javascript
// src/lib/auth.js - signIn callback
async signIn({ user, account, profile }) {
  if (account?.provider === 'google') {
    // Google OAuth 처리
    try {
      // 사용자 처리 로직
    } catch (error) {
      console.error('OAuth callback error:', error)
      return false  // 로그인 실패
    }
  }
  
  return true
}
```

#### 원인

**Case 1: 데이터베이스 오류**
```javascript
// Prisma 쿼리 실패
const user = await prisma.user.create({
  data: { /* ... */ }
})
// Error: Unique constraint violation
```

**Case 2: 필수 정보 누락**
```javascript
// Google에서 이메일을 받지 못함
if (!profile?.email) {
  throw new Error('Email not provided by OAuth provider')
}
```

**Case 3: 계정 상태 확인 실패**
```javascript
// 정지된 계정으로 로그인 시도
if (existingUser.status === 'SUSPENDED') {
  return false
}
```

#### 해결 방법

**상세 에러 로깅**:
```javascript
async signIn({ user, account, profile }) {
  console.log('🔐 [OAuth] signIn callback')
  console.log('Provider:', account?.provider)
  console.log('Profile:', profile)
  
  try {
    if (account?.provider === 'google') {
      // 이메일 확인
      if (!profile?.email) {
        console.error('❌ [OAuth] Email not provided')
        return '/sign-in?error=email-required'
      }
      
      // 기존 사용자 확인
      let user = await prisma.user.findUnique({
        where: { email: profile.email }
      })
      
      if (user) {
        // 계정 상태 확인
        if (user.status !== 'ACTIVE') {
          console.error(`❌ [OAuth] User status is ${user.status}`)
          return `/sign-in?error=account-${user.status.toLowerCase()}`
        }
        
        // 프로바이더 확인
        if (user.provider !== 'GOOGLE') {
          console.error(`❌ [OAuth] User registered with ${user.provider}`)
          return '/sign-in?error=different-provider'
        }
        
      } else {
        // 새 사용자 생성
        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            avatar: profile.picture,
            provider: 'GOOGLE',
            role: 'USER',
            status: 'ACTIVE',
          }
        })
        console.log('✅ [OAuth] New user created:', user.id)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ [OAuth] signIn callback error:', error)
    return '/sign-in?error=oauth-callback-failed'
  }
}
```

**에러 메시지 처리**:
```javascript
// src/app/(auth)/sign-in/page.jsx
const errorMessages = {
  'OAuthCallback': 'OAuth 인증 중 오류가 발생했습니다.',
  'email-required': 'OAuth 제공자로부터 이메일을 받지 못했습니다.',
  'account-suspended': '정지된 계정입니다.',
  'account-deleted': '삭제된 계정입니다.',
  'different-provider': '다른 방법으로 가입된 계정입니다.',
  'oauth-callback-failed': '로그인 처리 중 오류가 발생했습니다.',
}

const errorParam = searchParams.get('error')
const [error, setError] = useState(errorMessages[errorParam] || null)
```

---

### 3. OAuth 인증 취소

#### 증상
사용자가 OAuth 동의 화면에서 "취소" 버튼 클릭

#### 처리

```javascript
// NextAuth가 자동으로 처리
// /sign-in?error=OAuthSignin 로 리다이렉트

const errorMessages = {
  'OAuthSignin': 'OAuth 로그인이 취소되었습니다.',
}
```

---

## 계정 연동 예외

### 1. 이메일 중복

#### 시나리오

```
1. 사용자가 test@example.com으로 이메일/비밀번호 가입
2. 나중에 Google 계정 (test@example.com)으로 로그인 시도
3. 이메일이 이미 존재함
```

#### 문제

**Option A: 에러 발생**
```
"이미 가입된 이메일입니다. 이메일/비밀번호로 로그인하세요."
```

**Option B: 자동 연동**
```
기존 계정에 Google 계정을 연동
```

#### 구현: Option A (안전)

```javascript
// src/lib/auth.js - signIn callback
async signIn({ user, account, profile }) {
  if (account?.provider === 'google') {
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email }
    })
    
    if (existingUser) {
      // 프로바이더 확인
      if (existingUser.provider !== 'GOOGLE') {
        console.error(`이메일 중복: ${profile.email} (${existingUser.provider})`)
        return `/sign-in?error=email-exists&provider=${existingUser.provider}`
      }
    }
  }
  
  return true
}
```

**에러 메시지**:
```javascript
const errorParam = searchParams.get('error')
const providerParam = searchParams.get('provider')

if (errorParam === 'email-exists') {
  const providerName = providerParam === 'CREDENTIALS' ? '이메일/비밀번호' :
                       providerParam === 'GITHUB' ? 'GitHub' : '다른 방법'
  
  setError(`이 이메일은 이미 ${providerName}으로 가입되어 있습니다. 해당 방법으로 로그인해주세요.`)
}
```

---

#### 구현: Option B (자동 연동)

```javascript
// src/lib/auth.js - signIn callback
async signIn({ user, account, profile }) {
  if (account?.provider === 'google') {
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email }
    })
    
    if (existingUser) {
      // 계정 상태 확인
      if (existingUser.status !== 'ACTIVE') {
        return false
      }
      
      // Google 계정 연동
      if (existingUser.provider === 'CREDENTIALS') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            provider: 'GOOGLE',  // 또는 'BOTH'로 설정
            googleId: profile.sub,
            avatar: profile.picture,  // 프로필 이미지 업데이트
          }
        })
        
        console.log(`✅ Google 계정 연동: ${existingUser.id}`)
      }
      
      return true
    }
    
    // 새 사용자 생성
    await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
        googleId: profile.sub,
        provider: 'GOOGLE',
        role: 'USER',
        status: 'ACTIVE',
      }
    })
    
    return true
  }
  
  return true
}
```

---

### 2. OAuth 계정에 비밀번호 설정

#### 시나리오
Google로 가입한 사용자가 나중에 이메일/비밀번호 로그인도 사용하고 싶음

#### API 구현

```javascript
// src/app/api/auth/set-password/route.js
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { password } = await request.json()
    
    // 비밀번호 검증
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 8자 이상이어야 합니다' },
        { status: 400 }
      )
    }
    
    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // 이미 비밀번호가 있는지 확인
    if (user.password) {
      return NextResponse.json(
        { error: '이미 비밀번호가 설정되어 있습니다' },
        { status: 400 }
      )
    }
    
    // 비밀번호 해싱 및 저장
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })
    
    return NextResponse.json({
      success: true,
      message: '비밀번호가 설정되었습니다. 이제 이메일/비밀번호로도 로그인할 수 있습니다.'
    })
    
  } catch (error) {
    console.error('Set password error:', error)
    return NextResponse.json(
      { error: '비밀번호 설정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
```

#### UI 구현

```jsx
// src/app/settings/security/page.jsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function SecuritySettingsPage() {
  const { data: session } = useSession()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  
  const handleSetPassword = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setPassword('')
      } else {
        setMessage({ type: 'error', text: data.error })
      }
      
    } catch (error) {
      setMessage({ type: 'error', text: '오류가 발생했습니다' })
    }
  }
  
  // Google 계정이고 비밀번호 없는 경우만 표시
  if (session?.user?.provider !== 'GOOGLE') {
    return null
  }
  
  return (
    <div>
      <h2>비밀번호 설정</h2>
      <p>이메일/비밀번호로도 로그인하려면 비밀번호를 설정하세요.</p>
      
      <form onSubmit={handleSetPassword}>
        <input
          type="password"
          placeholder="새 비밀번호 (8자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <button type="submit">비밀번호 설정</button>
      </form>
      
      {message && (
        <div className={message.type}>
          {message.text}
        </div>
      )}
    </div>
  )
}
```

---

## 프로바이더별 예외

### Google OAuth

#### 1. 이메일 스코프 거부

**증상**: 사용자가 이메일 공유를 거부함

**처리**:
```javascript
if (!profile?.email) {
  return '/sign-in?error=email-required'
}
```

#### 2. Google 계정 선택 취소

**증상**: 여러 Google 계정 중 선택 화면에서 취소

**처리**: 자동으로 로그인 페이지로 돌아감

#### 3. Google API 할당량 초과

**증상**: 
```
Error: Rate limit exceeded
```

**원인**: Google Cloud Console에서 설정한 일일 요청 한도 초과

**해결**: 할당량 증가 요청 또는 프로덕션 모드로 변경

---

### GitHub OAuth

#### 1. 이메일이 비공개

**증상**: GitHub 프로필에 이메일이 없음

**원인**: 사용자가 이메일을 비공개로 설정

**해결**:
```javascript
// GitHub API로 이메일 조회
if (!profile?.email) {
  const emailResponse = await fetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `token ${account.access_token}`
    }
  })
  
  const emails = await emailResponse.json()
  const primaryEmail = emails.find(e => e.primary)?.email
  
  if (!primaryEmail) {
    return '/sign-in?error=email-required'
  }
  
  profile.email = primaryEmail
}
```

#### 2. 조직 제한

**증상**: 특정 조직 멤버만 로그인 허용하고 싶음

**구현**:
```javascript
// GitHub API로 조직 멤버십 확인
const orgResponse = await fetch(`https://api.github.com/orgs/your-org/members/${profile.login}`, {
  headers: {
    Authorization: `token ${account.access_token}`
  }
})

if (orgResponse.status !== 204) {
  return '/sign-in?error=not-organization-member'
}
```

---

## 보안 관련 예외

### 1. CSRF 토큰 불일치

#### 증상
```
Error: CSRF token mismatch
```

#### 원인
- 세션 쿠키가 없음
- 다른 도메인에서 요청
- 브라우저 확장 프로그램 간섭

#### 해결 방법

NextAuth가 자동으로 처리하지만, 문제 발생 시:

```javascript
// src/lib/auth.js
export const authOptions = {
  // ...
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  }
}
```

---

### 2. State 파라미터 변조

#### 증상
OAuth 콜백 시 `state` 파라미터가 일치하지 않음

#### 원인
- MITM 공격 시도
- URL 수동 조작

#### 처리
NextAuth가 자동으로 검증하고 실패 시 에러 반환

---

### 3. Redirect URI 변조

#### 증상
```
Error: Invalid redirect_uri
```

#### 원인
공격자가 `redirect_uri`를 조작하여 토큰 탈취 시도

#### 방어
Google/GitHub에서 미리 등록된 URI만 허용

---

## 요약

### OAuth 로그인 체크리스트

구현 전 확인사항:

1. ✅ 환경 변수 모두 설정
2. ✅ OAuth 앱 등록 (Google/GitHub)
3. ✅ 리디렉션 URI 정확히 등록
4. ✅ 이메일 중복 처리 방법 결정
5. ✅ 계정 상태 확인 로직
6. ✅ 에러 메시지 처리
7. ✅ 팝업 차단 감지

### 구현 가이드

**1단계: Provider 추가**
```javascript
// src/lib/auth.js
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions = {
  providers: [
    CredentialsProvider({ /* ... */ }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
}
```

**2단계: signIn 콜백 구현**
```javascript
callbacks: {
  async signIn({ user, account, profile }) {
    // OAuth 처리 로직
  }
}
```

**3단계: 프론트엔드 연결**
```javascript
// src/app/(auth)/sign-in/page.jsx
const handleSocialLogin = async (provider) => {
  await signIn(provider, { callbackUrl: '/dashboard' })
}
```

---

**다음 문서**: [04-signup-exceptions.md](./04-signup-exceptions.md)

