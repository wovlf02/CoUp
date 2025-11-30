# CoUp 예외 처리 구현 가이드

**프로젝트**: CoUp Exception Handling Implementation  
**작성일**: 2025-11-30  
**버전**: 1.0.0  
**대상**: 개발자, 코드 리뷰어

---

## 📚 목차

1. [개요](#개요)
2. [코드 작성 규칙](#코드-작성-규칙)
3. [예외 처리 패턴](#예외-처리-패턴)
4. [에러 헬퍼 함수](#에러-헬퍼-함수)
5. [유효성 검사](#유효성-검사)
6. [테스트 가이드](#테스트-가이드)
7. [코드 리뷰 체크리스트](#코드-리뷰-체크리스트)
8. [베스트 프랙티스](#베스트-프랙티스)

---

## 🎯 개요

### 목적

이 가이드는 CoUp 프로젝트의 예외 처리를 일관되고 효율적으로 구현하기 위한 규칙과 패턴을 제공합니다.

### 기본 원칙

1. **일관성**: 모든 영역에서 동일한 패턴 사용
2. **명확성**: 에러 메시지는 사용자 친화적이고 명확하게
3. **추적성**: 모든 예외는 코드로 추적 가능
4. **테스트 가능성**: 모든 예외는 테스트 가능해야 함
5. **문서화**: JSDoc으로 모든 함수 문서화

### 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: JavaScript (ES6+)
- **ORM**: Prisma
- **인증**: NextAuth.js v5
- **타입 힌트**: JSDoc

---

## 📝 코드 작성 규칙

### 1. 파일 구조

#### Server Component (RSC)
```javascript
// coup/src/app/[영역]/page.js
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/authOptions';

/**
 * [영역] 페이지 컴포넌트
 * @returns {Promise<JSX.Element>}
 */
export default async function Page() {
  const session = await getServerSession(authOptions);
  
  // AUTH-001: 세션 없음
  if (!session) {
    redirect('/auth/signin?callbackUrl=/current-path');
  }
  
  try {
    const data = await fetchData(session.user.id);
    return <Component data={data} />;
  } catch (error) {
    // 에러 처리
    if (error.code === 'DATA_FETCH_ERROR') {
      return <ErrorComponent message="데이터를 불러올 수 없습니다." />;
    }
    throw error;
  }
}
```

#### API Route
```javascript
// coup/src/app/api/[영역]/route.js
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, throwApiError } from '@/lib/exceptions/apiErrors';
import { authOptions } from '@/lib/auth/authOptions';

/**
 * GET /api/[영역]
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // AUTH-001: 세션 없음
    if (!session) {
      throwApiError('AUTH-001', '로그인 후 다시 시도해주세요.');
    }
    
    // 데이터 조회
    const data = await prisma.study.findMany({
      where: { userId: session.user.id }
    });
    
    return NextResponse.json({ 
      success: true,
      data 
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/[영역]
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // AUTH-001: 세션 없음
    if (!session) {
      throwApiError('AUTH-001', '로그인 후 다시 시도해주세요.');
    }
    
    const body = await request.json();
    
    // 유효성 검사
    // ... validation logic
    
    // 데이터 생성
    const result = await prisma.study.create({
      data: {
        ...body,
        userId: session.user.id
      }
    });
    
    return NextResponse.json({ 
      success: true,
      data: result 
    }, { status: 201 });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

#### Client Component
```javascript
// coup/src/components/[영역]/Component.jsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

/**
 * [영역] 컴포넌트
 * @returns {JSX.Element}
 */
export default function Component() {
  const { data: session, status } = useSession();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // AUTH-001: 세션 로딩 중
  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  
  // AUTH-001: 세션 없음
  if (status === 'unauthenticated') {
    return <Redirect to="/auth/signin" />;
  }
  
  /**
   * 폼 제출 핸들러
   * @param {Object} data - 폼 데이터
   */
  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // STD-CRT-001: 스터디 생성 실패
        if (result.error === 'STD-CRT-001') {
          toast.error(result.message);
          setError(result.message);
          return;
        }
        
        throw new Error(result.message || '오류가 발생했습니다.');
      }
      
      toast.success('스터디가 생성되었습니다!');
      
    } catch (error) {
      console.error('STD-CRT-001:', error);
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        {/* form fields */}
        <button type="submit" disabled={loading}>
          {loading ? '처리 중...' : '제출'}
        </button>
      </form>
    </div>
  );
}
```

### 2. JSDoc 주석 규칙

#### 함수 문서화
```javascript
/**
 * 함수 설명
 * @param {타입} 파라미터명 - 파라미터 설명
 * @returns {타입} 반환값 설명
 * @throws {Error} 발생 가능한 예외
 * @example
 * const result = functionName(param);
 */
function functionName(param) {
  // 구현
}
```

#### 예외 코드 주석
```javascript
// [예외코드]: 예외 설명
// 참조: docs/exception/[영역]/[파일명].md#[예외코드]
if (condition) {
  throwApiError('AUTH-001', '세션이 없습니다.');
}
```

### 3. 네이밍 컨벤션

#### 변수명
- **camelCase**: 일반 변수 (`userName`, `studyList`)
- **UPPER_SNAKE_CASE**: 상수 (`MAX_FILE_SIZE`, `API_ENDPOINT`)
- **PascalCase**: 컴포넌트, 클래스 (`UserProfile`, `StudyCard`)

#### 함수명
- **동사 + 명사**: `getUser`, `createStudy`, `validateInput`
- **is/has + 형용사**: `isValid`, `hasPermission`
- **handle + 이벤트**: `handleSubmit`, `handleClick`

#### 파일명
- **컴포넌트**: `PascalCase.jsx` (`UserProfile.jsx`)
- **유틸리티**: `camelCase.js` (`authHelper.js`)
- **API 라우트**: `route.js`
- **페이지**: `page.js`

---

## 🛡️ 예외 처리 패턴

### 1. Server Component 패턴

#### 인증 확인
```javascript
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  // AUTH-001: 세션 없음
  if (!session) {
    redirect('/auth/signin?callbackUrl=/current-path');
  }
  
  // AUTH-003: 권한 없음
  if (session.user.role !== 'admin') {
    redirect('/unauthorized');
  }
  
  // 페이지 렌더링
  return <Component />;
}
```

#### 데이터 로딩 에러
```javascript
export default async function Page() {
  try {
    const data = await fetchData();
    return <Component data={data} />;
  } catch (error) {
    // DASH-001: 데이터 로딩 실패
    console.error('DASH-001:', error);
    return <ErrorComponent message="데이터를 불러올 수 없습니다." />;
  }
}
```

#### 데이터 없음
```javascript
export default async function Page() {
  const data = await fetchData();
  
  // DASH-002: 데이터 없음
  if (!data || data.length === 0) {
    return <EmptyState message="표시할 데이터가 없습니다." />;
  }
  
  return <Component data={data} />;
}
```

### 2. API Route 패턴

#### 기본 구조
```javascript
import { handleApiError, throwApiError } from '@/lib/exceptions/apiErrors';

export async function GET(request) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      throwApiError('AUTH-001', '로그인이 필요합니다.');
    }
    
    // 2. 권한 확인
    if (session.user.role !== 'admin') {
      throwApiError('AUTH-003', '관리자 권한이 필요합니다.');
    }
    
    // 3. 파라미터 검증
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      throwApiError('VALIDATION-001', 'ID가 필요합니다.');
    }
    
    // 4. 데이터 조회
    const data = await prisma.study.findUnique({
      where: { id }
    });
    
    // 5. 데이터 존재 확인
    if (!data) {
      throwApiError('STD-001', '스터디를 찾을 수 없습니다.');
    }
    
    // 6. 응답 반환
    return NextResponse.json({ 
      success: true,
      data 
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

#### POST 요청 패턴
```javascript
export async function POST(request) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      throwApiError('AUTH-001', '로그인이 필요합니다.');
    }
    
    // 2. 요청 본문 파싱
    const body = await request.json();
    
    // 3. 유효성 검사
    const validation = validateStudyData(body);
    if (!validation.success) {
      throwApiError('VALIDATION-001', validation.error);
    }
    
    // 4. 비즈니스 로직 검증
    const existing = await prisma.study.findFirst({
      where: { 
        name: body.name,
        userId: session.user.id 
      }
    });
    if (existing) {
      throwApiError('STD-CRT-001', '이미 같은 이름의 스터디가 있습니다.');
    }
    
    // 5. 데이터 생성
    const result = await prisma.study.create({
      data: {
        ...body,
        userId: session.user.id
      }
    });
    
    // 6. 응답 반환
    return NextResponse.json({ 
      success: true,
      data: result 
    }, { status: 201 });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

#### PUT/PATCH 요청 패턴
```javascript
export async function PUT(request, { params }) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      throwApiError('AUTH-001', '로그인이 필요합니다.');
    }
    
    // 2. 대상 조회
    const { id } = params;
    const existing = await prisma.study.findUnique({
      where: { id }
    });
    
    if (!existing) {
      throwApiError('STD-001', '스터디를 찾을 수 없습니다.');
    }
    
    // 3. 권한 확인
    if (existing.userId !== session.user.id && session.user.role !== 'admin') {
      throwApiError('AUTH-003', '수정 권한이 없습니다.');
    }
    
    // 4. 요청 본문 파싱 및 검증
    const body = await request.json();
    const validation = validateStudyData(body);
    if (!validation.success) {
      throwApiError('VALIDATION-001', validation.error);
    }
    
    // 5. 데이터 업데이트
    const result = await prisma.study.update({
      where: { id },
      data: body
    });
    
    // 6. 응답 반환
    return NextResponse.json({ 
      success: true,
      data: result 
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

#### DELETE 요청 패턴
```javascript
export async function DELETE(request, { params }) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      throwApiError('AUTH-001', '로그인이 필요합니다.');
    }
    
    // 2. 대상 조회
    const { id } = params;
    const existing = await prisma.study.findUnique({
      where: { id }
    });
    
    if (!existing) {
      throwApiError('STD-001', '스터디를 찾을 수 없습니다.');
    }
    
    // 3. 권한 확인
    if (existing.userId !== session.user.id && session.user.role !== 'admin') {
      throwApiError('AUTH-003', '삭제 권한이 없습니다.');
    }
    
    // 4. 삭제 가능 여부 확인
    const memberCount = await prisma.studyMember.count({
      where: { studyId: id }
    });
    if (memberCount > 1) {
      throwApiError('STD-DEL-001', '멤버가 있는 스터디는 삭제할 수 없습니다.');
    }
    
    // 5. 데이터 삭제
    await prisma.study.delete({
      where: { id }
    });
    
    // 6. 응답 반환
    return NextResponse.json({ 
      success: true,
      message: '스터디가 삭제되었습니다.' 
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 3. Client Component 패턴

#### 세션 확인
```javascript
'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function Component() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    }
  });
  
  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  
  return <div>...</div>;
}
```

#### API 호출
```javascript
const handleAction = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // 특정 예외 코드 처리
      if (result.error === 'AUTH-001') {
        signOut({ callbackUrl: '/auth/signin' });
        return;
      }
      
      if (result.error === 'STD-CRT-001') {
        toast.error(result.message);
        setError(result.message);
        return;
      }
      
      throw new Error(result.message || '오류가 발생했습니다.');
    }
    
    toast.success('작업이 완료되었습니다!');
    
  } catch (error) {
    console.error('Error:', error);
    toast.error(error.message);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

#### 폼 유효성 검사
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 클라이언트 측 유효성 검사
  const errors = {};
  
  if (!formData.name) {
    errors.name = '이름을 입력해주세요.';
  }
  
  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = '올바른 이메일을 입력해주세요.';
  }
  
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }
  
  // API 호출
  await handleAction();
};
```

---

## 🔧 에러 헬퍼 함수

### 1. apiErrors.js

파일 생성: `coup/src/lib/exceptions/apiErrors.js`

```javascript
import { NextResponse } from 'next/server';

/**
 * 에러 코드 정의
 * @type {Object.<string, {code: string, message: string, status: number}>}
 */
export const ErrorCodes = {
  // 인증 (AUTH)
  AUTH_001: { 
    code: 'AUTH-001', 
    message: '인증이 필요합니다.', 
    status: 401 
  },
  AUTH_002: { 
    code: 'AUTH-002', 
    message: 'JWT 토큰이 만료되었습니다.', 
    status: 401 
  },
  AUTH_003: { 
    code: 'AUTH-003', 
    message: '권한이 없습니다.', 
    status: 403 
  },
  
  // 대시보드 (DASH)
  DASH_001: { 
    code: 'DASH-001', 
    message: '데이터를 불러올 수 없습니다.', 
    status: 500 
  },
  
  // 스터디 (STD)
  STD_001: { 
    code: 'STD-001', 
    message: '스터디를 찾을 수 없습니다.', 
    status: 404 
  },
  STD_CRT_001: { 
    code: 'STD-CRT-001', 
    message: '스터디를 생성할 수 없습니다.', 
    status: 400 
  },
  STD_DEL_001: { 
    code: 'STD-DEL-001', 
    message: '스터디를 삭제할 수 없습니다.', 
    status: 400 
  },
  
  // 유효성 검사 (VALIDATION)
  VALIDATION_001: { 
    code: 'VALIDATION-001', 
    message: '입력값이 올바르지 않습니다.', 
    status: 400 
  },
  
  // ... 나머지 예외 코드 (1,020개)
};

/**
 * API 에러 핸들러
 * @param {Error} error - 에러 객체
 * @returns {NextResponse} JSON 응답
 */
export function handleApiError(error) {
  console.error('API Error:', error);
  
  // 알려진 예외 코드
  if (error.code && ErrorCodes[error.code.replace(/-/g, '_')]) {
    const errorInfo = ErrorCodes[error.code.replace(/-/g, '_')];
    return NextResponse.json(
      {
        success: false,
        error: errorInfo.code,
        message: errorInfo.message,
        details: error.message
      },
      { status: errorInfo.status }
    );
  }
  
  // Prisma 에러
  if (error.code?.startsWith('P')) {
    return handlePrismaError(error);
  }
  
  // 일반 에러
  return NextResponse.json(
    {
      success: false,
      error: 'INTERNAL_ERROR',
      message: '서버 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    },
    { status: 500 }
  );
}

/**
 * API 에러 던지기
 * @param {string} code - 에러 코드
 * @param {string} [details] - 추가 상세 정보
 * @throws {Error} 에러 객체
 */
export function throwApiError(code, details) {
  const errorInfo = ErrorCodes[code.replace(/-/g, '_')];
  
  if (!errorInfo) {
    throw new Error(`Unknown error code: ${code}`);
  }
  
  const error = new Error(details || errorInfo.message);
  error.code = errorInfo.code;
  error.status = errorInfo.status;
  throw error;
}

/**
 * Prisma 에러 핸들러
 * @param {Error} error - Prisma 에러 객체
 * @returns {NextResponse} JSON 응답
 */
function handlePrismaError(error) {
  const statusCode = 500;
  let message = '데이터베이스 오류가 발생했습니다.';
  
  // Prisma 에러 코드별 처리
  switch (error.code) {
    case 'P2002':
      message = '이미 존재하는 데이터입니다.';
      return NextResponse.json(
        { success: false, error: 'DUPLICATE_ERROR', message },
        { status: 400 }
      );
    case 'P2025':
      message = '데이터를 찾을 수 없습니다.';
      return NextResponse.json(
        { success: false, error: 'NOT_FOUND', message },
        { status: 404 }
      );
    default:
      return NextResponse.json(
        { success: false, error: 'DATABASE_ERROR', message },
        { status: statusCode }
      );
  }
}
```

### 2. 영역별 에러 헬퍼

#### authErrors.js
```javascript
// coup/src/lib/exceptions/authErrors.js

/**
 * 인증 관련 에러 헬퍼
 */

import { throwApiError } from './apiErrors';

/**
 * 세션 유효성 검사
 * @param {Object} session - NextAuth 세션 객체
 * @throws {Error} 세션이 없는 경우
 */
export function validateSession(session) {
  if (!session) {
    throwApiError('AUTH-001', '세션이 없습니다.');
  }
  
  if (!session.user) {
    throwApiError('AUTH-001', '사용자 정보가 없습니다.');
  }
}

/**
 * 권한 검사
 * @param {Object} session - NextAuth 세션 객체
 * @param {string} requiredRole - 필요한 역할 ('admin', 'user' 등)
 * @throws {Error} 권한이 없는 경우
 */
export function validatePermission(session, requiredRole) {
  validateSession(session);
  
  if (session.user.role !== requiredRole && session.user.role !== 'admin') {
    throwApiError('AUTH-003', `${requiredRole} 권한이 필요합니다.`);
  }
}

/**
 * 소유권 검사
 * @param {Object} session - NextAuth 세션 객체
 * @param {string} resourceUserId - 리소스 소유자 ID
 * @throws {Error} 소유권이 없는 경우
 */
export function validateOwnership(session, resourceUserId) {
  validateSession(session);
  
  if (session.user.id !== resourceUserId && session.user.role !== 'admin') {
    throwApiError('AUTH-003', '접근 권한이 없습니다.');
  }
}
```

---

## ✅ 유효성 검사

### 1. commonValidation.js

파일 생성: `coup/src/lib/validators/commonValidation.js`

```javascript
/**
 * 공통 유효성 검사 함수
 */

import { throwApiError } from '../exceptions/apiErrors';

/**
 * 필수 필드 검사
 * @param {Object} data - 검증할 데이터
 * @param {string[]} requiredFields - 필수 필드 목록
 * @throws {Error} 필수 필드가 없는 경우
 */
export function validateRequiredFields(data, requiredFields) {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throwApiError(
      'VALIDATION-001', 
      `필수 항목이 누락되었습니다: ${missingFields.join(', ')}`
    );
  }
}

/**
 * 이메일 유효성 검사
 * @param {string} email - 이메일 주소
 * @returns {boolean} 유효한 경우 true
 * @throws {Error} 유효하지 않은 경우
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throwApiError('VALIDATION-001', '올바른 이메일 형식이 아닙니다.');
  }
  
  return true;
}

/**
 * 비밀번호 유효성 검사
 * @param {string} password - 비밀번호
 * @returns {boolean} 유효한 경우 true
 * @throws {Error} 유효하지 않은 경우
 */
export function validatePassword(password) {
  if (password.length < 8) {
    throwApiError('VALIDATION-001', '비밀번호는 최소 8자 이상이어야 합니다.');
  }
  
  if (!/[A-Z]/.test(password)) {
    throwApiError('VALIDATION-001', '비밀번호에 대문자가 포함되어야 합니다.');
  }
  
  if (!/[a-z]/.test(password)) {
    throwApiError('VALIDATION-001', '비밀번호에 소문자가 포함되어야 합니다.');
  }
  
  if (!/[0-9]/.test(password)) {
    throwApiError('VALIDATION-001', '비밀번호에 숫자가 포함되어야 합니다.');
  }
  
  return true;
}

/**
 * 문자열 길이 검사
 * @param {string} value - 검사할 문자열
 * @param {number} min - 최소 길이
 * @param {number} max - 최대 길이
 * @param {string} fieldName - 필드명
 * @returns {boolean} 유효한 경우 true
 * @throws {Error} 유효하지 않은 경우
 */
export function validateStringLength(value, min, max, fieldName) {
  if (value.length < min) {
    throwApiError(
      'VALIDATION-001', 
      `${fieldName}는 최소 ${min}자 이상이어야 합니다.`
    );
  }
  
  if (value.length > max) {
    throwApiError(
      'VALIDATION-001', 
      `${fieldName}는 최대 ${max}자를 초과할 수 없습니다.`
    );
  }
  
  return true;
}

/**
 * 숫자 범위 검사
 * @param {number} value - 검사할 숫자
 * @param {number} min - 최솟값
 * @param {number} max - 최댓값
 * @param {string} fieldName - 필드명
 * @returns {boolean} 유효한 경우 true
 * @throws {Error} 유효하지 않은 경우
 */
export function validateNumberRange(value, min, max, fieldName) {
  if (value < min) {
    throwApiError(
      'VALIDATION-001', 
      `${fieldName}는 ${min} 이상이어야 합니다.`
    );
  }
  
  if (value > max) {
    throwApiError(
      'VALIDATION-001', 
      `${fieldName}는 ${max} 이하여야 합니다.`
    );
  }
  
  return true;
}

/**
 * URL 유효성 검사
 * @param {string} url - URL 주소
 * @returns {boolean} 유효한 경우 true
 * @throws {Error} 유효하지 않은 경우
 */
export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    throwApiError('VALIDATION-001', '올바른 URL 형식이 아닙니다.');
  }
}

/**
 * 파일 크기 검사
 * @param {number} size - 파일 크기 (bytes)
 * @param {number} maxSize - 최대 크기 (bytes)
 * @returns {boolean} 유효한 경우 true
 * @throws {Error} 유효하지 않은 경우
 */
export function validateFileSize(size, maxSize) {
  if (size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    throwApiError(
      'VALIDATION-001', 
      `파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`
    );
  }
  
  return true;
}

/**
 * 파일 타입 검사
 * @param {string} mimeType - 파일 MIME 타입
 * @param {string[]} allowedTypes - 허용된 MIME 타입 목록
 * @returns {boolean} 유효한 경우 true
 * @throws {Error} 유효하지 않은 경우
 */
export function validateFileType(mimeType, allowedTypes) {
  if (!allowedTypes.includes(mimeType)) {
    throwApiError(
      'VALIDATION-001', 
      `허용되지 않는 파일 형식입니다. 허용: ${allowedTypes.join(', ')}`
    );
  }
  
  return true;
}
```

### 2. 영역별 유효성 검사

#### studyValidation.js
```javascript
// coup/src/lib/validators/studyValidation.js

import { 
  validateRequiredFields, 
  validateStringLength,
  validateNumberRange 
} from './commonValidation';

/**
 * 스터디 데이터 유효성 검사
 * @param {Object} data - 스터디 데이터
 * @returns {{success: boolean, error?: string}}
 */
export function validateStudyData(data) {
  try {
    // 필수 필드 검사
    validateRequiredFields(data, ['name', 'description', 'category', 'maxMembers']);
    
    // 이름 길이 검사
    validateStringLength(data.name, 2, 50, '스터디 이름');
    
    // 설명 길이 검사
    validateStringLength(data.description, 10, 500, '스터디 설명');
    
    // 최대 인원 검사
    validateNumberRange(data.maxMembers, 2, 50, '최대 인원');
    
    return { success: true };
    
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

---

## 🧪 테스트 가이드

### 1. 유닛 테스트

#### API Route 테스트
```javascript
// coup/src/app/api/studies/__tests__/route.test.js

import { GET, POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mock
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    study: {
      findMany: jest.fn(),
      create: jest.fn(),
    }
  }
}));

describe('/api/studies', () => {
  describe('GET', () => {
    it('AUTH-001: 세션 없을 때 401 응답', async () => {
      getServerSession.mockResolvedValue(null);
      
      const request = new Request('http://localhost/api/studies');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('AUTH-001');
    });
    
    it('정상적으로 스터디 목록 반환', async () => {
      getServerSession.mockResolvedValue({
        user: { id: '1', role: 'user' }
      });
      
      prisma.study.findMany.mockResolvedValue([
        { id: '1', name: 'Test Study' }
      ]);
      
      const request = new Request('http://localhost/api/studies');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
    });
  });
  
  describe('POST', () => {
    it('STD-CRT-001: 유효하지 않은 데이터일 때 400 응답', async () => {
      getServerSession.mockResolvedValue({
        user: { id: '1', role: 'user' }
      });
      
      const request = new Request('http://localhost/api/studies', {
        method: 'POST',
        body: JSON.stringify({}) // 빈 데이터
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
    });
  });
});
```

### 2. 통합 테스트

#### E2E 테스트 (Playwright)
```javascript
// coup/tests/e2e/studies.spec.js

import { test, expect } from '@playwright/test';

test.describe('스터디 관리', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/auth/signin');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });
  
  test('스터디 생성 - 정상 케이스', async ({ page }) => {
    await page.goto('/studies/create');
    
    await page.fill('[name="name"]', 'Test Study');
    await page.fill('[name="description"]', 'This is a test study');
    await page.selectOption('[name="category"]', 'programming');
    await page.fill('[name="maxMembers"]', '10');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/studies\/\w+/);
    await expect(page.locator('text=스터디가 생성되었습니다')).toBeVisible();
  });
  
  test('STD-CRT-001: 필수 필드 누락 시 에러', async ({ page }) => {
    await page.goto('/studies/create');
    
    await page.click('button[type="submit"]'); // 빈 폼 제출
    
    await expect(page.locator('text=필수 항목')).toBeVisible();
  });
});
```

---

## ✅ 코드 리뷰 체크리스트

### 1. 예외 처리
- [ ] 모든 예외 코드가 문서와 일치하는가?
- [ ] 예외 메시지가 사용자 친화적인가?
- [ ] 예외 코드 주석이 있는가?
- [ ] 에러 로깅이 적절한가?

### 2. 코드 품질
- [ ] JSDoc 주석이 작성되었는가?
- [ ] 네이밍이 명확하고 일관적인가?
- [ ] 중복 코드가 없는가?
- [ ] 함수가 단일 책임 원칙을 따르는가?

### 3. 보안
- [ ] SQL Injection 방어가 되어 있는가?
- [ ] XSS 방어가 되어 있는가?
- [ ] CSRF 토큰이 사용되는가?
- [ ] 민감한 정보가 로그에 노출되지 않는가?

### 4. 성능
- [ ] 불필요한 데이터베이스 쿼리가 없는가?
- [ ] N+1 쿼리 문제가 없는가?
- [ ] 캐싱이 적절히 사용되는가?

### 5. 테스트
- [ ] 유닛 테스트가 작성되었는가?
- [ ] 통합 테스트가 작성되었는가?
- [ ] 엣지 케이스가 테스트되었는가?
- [ ] 테스트 커버리지가 90% 이상인가?

---

## 🏆 베스트 프랙티스

### 1. DRY (Don't Repeat Yourself)
- 반복되는 코드는 함수나 컴포넌트로 추출
- 공통 유효성 검사는 헬퍼 함수 사용
- 공통 에러 처리는 미들웨어 사용

### 2. KISS (Keep It Simple, Stupid)
- 복잡한 로직은 작은 함수로 분리
- 명확하고 간결한 코드 작성
- 불필요한 추상화 피하기

### 3. YAGNI (You Aren't Gonna Need It)
- 당장 필요하지 않은 기능 구현하지 않기
- 실제 요구사항에 집중
- 과도한 엔지니어링 피하기

### 4. 에러 처리
- 예상 가능한 모든 예외 처리
- 사용자 친화적인 에러 메시지
- 개발자를 위한 상세 로그
- 적절한 HTTP 상태 코드 사용

### 5. 보안
- 모든 입력값 검증
- SQL Injection 방어
- XSS 방어
- CSRF 방어
- 민감한 정보 보호

---

**작성자**: GitHub Copilot  
**최종 수정**: 2025-11-30  
**버전**: 1.0.0

