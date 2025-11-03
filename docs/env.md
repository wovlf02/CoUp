# 환경 변수 설정 가이드 (CoUp 프로젝트)

CoUp 프로젝트는 다양한 외부 서비스 및 민감한 정보 관리를 위해 환경 변수를 사용합니다. `.env.local` 파일에 필요한 환경 변수를 설정해야 하며, 이 파일은 Git 저장소에 커밋되지 않도록 `.gitignore`에 추가되어 있습니다.

이 문서는 각 환경 변수의 역할과 값을 얻는 방법을 단계별로 안내합니다.

## 1. `.env.local` 파일 생성

프로젝트 루트 디렉토리 (`C:\Project\CoUp\coup`)에 `.env.local` 파일을 생성합니다. 다음 내용을 복사하여 붙여넣고 각 `YOUR_...` 부분을 실제 값으로 대체합니다.

```dotenv
DATABASE_URL="postgresql://postgres:elskvhfh12@localhost:5432/postgres"

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET

# Google OAuth Provider
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# GitHub OAuth Provider
GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET

# AWS S3 (for file uploads)
AWS_S3_REGION=YOUR_AWS_S3_REGION
AWS_S3_ACCESS_KEY_ID=YOUR_AWS_S3_ACCESS_KEY_ID
AWS_S3_SECRET_ACCESS_KEY=YOUR_AWS_S3_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME=YOUR_AWS_S3_BUCKET_NAME

# Redis
REDIS_HOST=YOUR_REDIS_HOST
REDIS_PORT=YOUR_REDIS_PORT
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
```

## 2. 각 환경 변수 값 얻는 방법

### 2.1. PostgreSQL (DATABASE_URL)

`DATABASE_URL`은 Prisma가 데이터베이스에 연결하는 데 사용됩니다. 로컬 개발 환경에서는 Docker 또는 직접 설치한 PostgreSQL 인스턴스를 사용합니다.

**형식**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`

**값 얻는 방법 (로컬 PostgreSQL 예시)**:
1.  **PostgreSQL 설치 및 실행**: Docker를 사용하거나 로컬에 직접 PostgreSQL을 설치합니다.
    *   Docker 예시: `docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres`
2.  **사용자, 비밀번호, 데이터베이스 이름 확인**: 설치 시 설정한 사용자 이름, 비밀번호, 데이터베이스 이름을 사용합니다. 기본값은 `postgres`인 경우가 많습니다.
3.  **DATABASE_URL 구성**: 예를 들어, 사용자 `postgres`, 비밀번호 `mysecretpassword`, 호스트 `localhost`, 포트 `5432`, 데이터베이스 이름 `postgres`인 경우:
    `DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"`

### 2.2. NextAuth.js (NEXTAUTH_URL, NEXTAUTH_SECRET)

`NEXTAUTH_URL`은 NextAuth.js가 콜백 URL을 생성하는 데 사용되며, `NEXTAUTH_SECRET`은 세션 및 JWT를 암호화하는 데 사용됩니다.

#### `NEXTAUTH_URL`

**값 얻는 방법**:
1.  **로컬 개발**: `http://localhost:3000` (기본 Next.js 개발 서버 포트)
2.  **배포 환경**: 애플리케이션이 배포된 실제 URL (예: `https://www.yourdomain.com`)

#### `NEXTAUTH_SECRET`

**값 얻는 방법**:
1.  **비밀 키 생성**: 강력하고 무작위적인 문자열이어야 합니다. 다음 명령어를 터미널에서 실행하여 생성할 수 있습니다.
    *   Linux/macOS: `openssl rand -base64 32`
    *   Windows (PowerShell): `[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))`
2.  생성된 문자열을 `NEXTAUTH_SECRET` 값으로 사용합니다.

### 2.3. Google OAuth Provider (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

Google 계정을 통해 로그인 기능을 제공하기 위해 필요합니다.

**값 얻는 방법**:
1.  **Google Cloud Console 접속**: [https://console.cloud.google.com/](https://console.cloud.google.com/) 에 접속하여 로그인합니다.
2.  **새 프로젝트 생성**: 상단 바에서 프로젝트 선택 드롭다운을 클릭하고 `새 프로젝트`를 생성합니다.
3.  **OAuth 동의 화면 구성**: `API 및 서비스` > `OAuth 동의 화면`으로 이동하여 `외부`를 선택하고 앱 정보를 입력합니다.
4.  **사용자 인증 정보 생성**: `API 및 서비스` > `사용자 인증 정보`로 이동하여 `사용자 인증 정보 만들기` > `OAuth 클라이언트 ID`를 선택합니다.
    *   **애플리케이션 유형**: `웹 애플리케이션`을 선택합니다.
    *   **이름**: 앱 이름을 입력합니다.
    *   **승인된 리디렉션 URI**: 다음 URL을 추가합니다.
        *   로컬 개발: `http://localhost:3000/api/auth/callback/google`
        *   배포 환경: `https://www.yourdomain.com/api/auth/callback/google`
5.  **클라이언트 ID 및 클라이언트 보안 비밀번호 확인**: 생성 후 `클라이언트 ID`와 `클라이언트 보안 비밀번호`를 복사하여 `.env.local` 파일에 각각 `GOOGLE_CLIENT_ID`와 `GOOGLE_CLIENT_SECRET`으로 설정합니다.

### 2.4. GitHub OAuth Provider (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)

GitHub 계정을 통해 로그인 기능을 제공하기 위해 필요합니다.

**값 얻는 방법**:
1.  **GitHub 개발자 설정 접속**: [https://github.com/settings/developers](https://github.com/settings/developers) 에 접속하여 로그인합니다.
2.  **새 OAuth 앱 등록**: `OAuth Apps` 탭에서 `New OAuth App` 버튼을 클릭합니다.
3.  **애플리케이션 정보 입력**:
    *   **Application name**: 앱 이름을 입력합니다.
    *   **Homepage URL**: 애플리케이션의 홈페이지 URL을 입력합니다 (예: `http://localhost:3000` 또는 `https://www.yourdomain.com`).
    *   **Authorization callback URL**: 다음 URL을 입력합니다.
        *   로컬 개발: `http://localhost:3000/api/auth/callback/github`
        *   배포 환경: `https://www.yourdomain.com/api/auth/callback/github`
4.  **클라이언트 ID 및 클라이언트 비밀번호 확인**: 등록 후 `Client ID`와 `Client secrets` 섹션에서 `Generate a new client secret`을 클릭하여 `Client Secret`을 생성하고 복사합니다. 이 값들을 `.env.local` 파일에 각각 `GITHUB_CLIENT_ID`와 `GITHUB_CLIENT_SECRET`으로 설정합니다.

### 2.5. AWS S3 (AWS_S3_REGION, AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME)

파일 업로드 및 저장을 위해 AWS S3 버킷을 사용합니다.

**값 얻는 방법**:
1.  **AWS Management Console 접속**: [https://aws.amazon.com/console/](https://aws.amazon.com/console/) 에 접속하여 로그인합니다.
2.  **S3 버킷 생성**: `S3` 서비스로 이동하여 `버킷 만들기`를 클릭합니다.
    *   **AWS 리전**: 애플리케이션과 가까운 리전을 선택합니다 (예: `ap-northeast-2` for Seoul).
    *   **버킷 이름**: 고유한 버킷 이름을 입력합니다 (예: `coup-uploads-yourname`).
    *   **객체 소유권**: `ACL 활성화됨`을 선택하고 `버킷 소유자가 모든 객체를 소유하도록 설정`을 선택합니다.
    *   **퍼블릭 액세스 차단 설정**: `모든 퍼블릭 액세스 차단`을 해제하고, 경고 메시지를 확인합니다. (파일 업로드 후 퍼블릭 접근이 필요한 경우)
    *   나머지 설정은 기본값으로 두고 버킷을 생성합니다.
3.  **IAM 사용자 생성 및 권한 부여**: `IAM` 서비스로 이동하여 `사용자` > `사용자 추가`를 클릭합니다.
    *   **사용자 이름**: 사용자 이름을 입력합니다 (예: `coup-s3-user`).
    *   **액세스 유형**: `액세스 키 - 프로그래밍 방식 액세스`를 선택합니다.
    *   **권한 설정**: `기존 정책 직접 연결`을 선택하고 `AmazonS3FullAccess` 또는 S3 버킷에 대한 쓰기/읽기 권한을 가진 사용자 지정 정책을 연결합니다.
    *   사용자를 생성하면 `액세스 키 ID`와 `비밀 액세스 키`가 표시됩니다. 이 값들을 `.env.local` 파일에 각각 `AWS_S3_ACCESS_KEY_ID`와 `AWS_S3_SECRET_ACCESS_KEY`로 설정합니다.
4.  **환경 변수 설정**: `.env.local` 파일에 다음을 설정합니다.
    *   `AWS_S3_REGION`: 선택한 AWS 리전 (예: `ap-northeast-2`)
    *   `AWS_S3_ACCESS_KEY_ID`: 생성한 IAM 사용자의 액세스 키 ID
    *   `AWS_S3_SECRET_ACCESS_KEY`: 생성한 IAM 사용자의 비밀 액세스 키
    *   `AWS_S3_BUCKET_NAME`: 생성한 S3 버킷 이름

### 2.6. Redis (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TOKEN)

Redis는 실시간 통신(채팅, 알림)을 위한 Pub/Sub 및 캐싱에 사용됩니다.

**값 얻는 방법 (로컬 Redis 또는 클라우드 Redis 예시)**:
1.  **Redis 설치 및 실행 (로컬)**: Docker를 사용하거나 로컬에 직접 Redis를 설치합니다.
    *   Docker 예시: `docker run --name some-redis -p 6379:6379 -d redis redis-server --requirepass myredispassword`
    *   `REDIS_HOST=localhost`, `REDIS_PORT=6379`, `REDIS_PASSWORD=myredispassword`
2.  **클라우드 Redis (예: Upstash Redis, AWS ElastiCache)**:
    *   선택한 클라우드 서비스의 대시보드에서 Redis 인스턴스를 생성합니다.
    *   생성된 인스턴스의 연결 정보(호스트, 포트, 비밀번호)를 확인하여 `.env.local` 파일에 각각 `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`로 설정합니다.
    *   Upstash Redis의 경우, `REDIS_TOKEN`도 필요합니다. `REDIS_TOKEN=YOUR_REDIS_TOKEN`

---