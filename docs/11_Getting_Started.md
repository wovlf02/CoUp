# 11. 시작하기 (Getting Started)

CoUp 프로젝트에 오신 것을 환영합니다! 이 문서는 새로운 개발자가 로컬 환경에서 **Next.js 풀스택 (프론트엔드 & API Routes)**, **시그널링 서버(Node.js)** 프로젝트를 모두 실행하고 개발에 참여하기까지의 과정을 안내합니다.

## 1. 필수 도구 설치 (Prerequisites)

- **Git**: 버전 관리 도구.
- **Docker Desktop**: 개발용 데이터베이스(PostgreSQL, Redis)를 실행하기 위해 필요.
- **IDE/에디터**: **Visual Studio Code** (Next.js 풀스택 및 시그널링)를 권장합니다.
- **Node.js**: v18.17.0 이상 (Next.js 풀스택 및 시그널링 서버용).
- **Prisma CLI**: 데이터베이스 스키마 관리 및 마이그레이션을 위해 필요 (`npm install -g prisma`).

## 2. 프로젝트 클론 및 공용 서비스 실행

1.  **프로젝트 클론**: `git clone [저장소_URL] coup` 후 `cd coup`
2.  **데이터베이스 및 메시지 브로커 실행**:
    프로젝트 루트 디렉토리에서 Docker Compose를 사용하여 PostgreSQL과 Redis를 실행합니다.
    ```bash
    docker-compose up -d
    ```

## 3. 시그널링 서버 설정 및 실행 (Node.js)

- **위치**: `/signaling` 디렉토리
1.  **의존성 설치**:
    ```bash
    cd signaling
    npm install
    ```
2.  **환경 변수 설정**: `.env.example` 파일을 `.env`로 복사하고 내용을 수정합니다.
    ```env
    # .env
    PORT=8081
    CORS_ORIGIN=http://localhost:3000
    REDIS_URL=redis://localhost:6379
    JWT_SECRET="YOUR_SUPER_SECRET_KEY_FOR_JWT_CHANGE_IT" # Next.js API Routes와 동일한 키 사용
    INTERNAL_API_URL=http://localhost:3000/api/v1 # Next.js API Routes의 내부 API 엔드포인트
    ```
3.  **실행**:
    ```bash
    npm run dev
    ```

- **실행 확인**:
  - **시그널링 서버**: `localhost:8081`에서 실행됩니다. (터미널 로그 확인)

## 4. Next.js 풀스택 설정 및 실행 (Frontend & API Routes)

- **위치**: `/frontend` 디렉토리
1.  **의존성 설치**:
    ```bash
    cd frontend
    npm install
    ```
2.  **Prisma Client 생성 및 DB 마이그레이션**:
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```
3.  **환경 변수 설정**: `.env.example` 파일을 `.env.local`로 복사하고 내용을 수정합니다.
    ```env
    # .env.local
    DATABASE_URL="postgresql://user:password@localhost:5432/coupdb" # Docker Compose에 설정된 DB 정보
    NEXTAUTH_SECRET="YOUR_SUPER_SECRET_KEY_FOR_NEXTAUTH_CHANGE_IT"
    NEXTAUTH_URL="http://localhost:3000"
    NEXT_PUBLIC_WEBSOCKET_URL="http://localhost:8081"
    # GitHub OAuth (NextAuth.js)
    GITHUB_ID="YOUR_GITHUB_CLIENT_ID"
    GITHUB_SECRET="YOUR_GITHUB_CLIENT_SECRET"
    # Google OAuth (NextAuth.js)
    GOOGLE_ID="YOUR_GOOGLE_CLIENT_ID"
    GOOGLE_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
    ```
4.  **실행**:
    ```bash
    npm run dev
    ```

- **실행 확인**:
  - **Next.js 앱 (프론트엔드 & API Routes)**: [http://localhost:3000](http://localhost:3000) 에서 접속 가능합니다.

## 5. 요약

- 개발을 위해서는 **2개의 터미널**을 열고 각 서버를 실행해야 합니다.
  1.  **Next.js 풀스택 (프론트엔드 & API Routes)**: `localhost:3000`
  2.  **시그널링 서버 (Node.js)**: `localhost:8081`
- 모든 서버가 실행되어야 전체 기능이 정상적으로 동작합니다.