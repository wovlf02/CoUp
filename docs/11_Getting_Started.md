# 11. 시작하기 (Getting Started)

CoUp 프로젝트에 오신 것을 환영합니다! 이 문서는 새로운 개발자가 로컬 환경에서 **프론트엔드(Next.js)**, **비즈니스 서버(Spring Boot)**, **시그널링 서버(Node.js)** 프로젝트를 모두 실행하고 개발에 참여하기까지의 과정을 안내합니다.

## 1. 필수 도구 설치 (Prerequisites)

- **Git**: 버전 관리 도구.
- **Docker Desktop**: 개발용 데이터베이스(PostgreSQL, Redis)를 실행하기 위해 필요.
- **IDE/에디터**: **Visual Studio Code** (프론트엔드/시그널링) 와 **IntelliJ IDEA** (백엔드) 조합을 권장합니다.
- **Node.js**: v18.17.0 이상 (프론트엔드 및 시그널링 서버용).
- **Java JDK**: **Java 17** 이상 버전 (백엔드용).

## 2. 프로젝트 클론 및 공용 서비스 실행

1.  **프로젝트 클론**: `git clone [저장소_URL] coup` 후 `cd coup`
2.  **데이터베이스 및 메시지 브로커 실행**:
    프로젝트 루트 디렉토리에서 Docker Compose를 사용하여 PostgreSQL과 Redis를 실행합니다.
    ```bash
    docker-compose up -d
    ```

## 3. 백엔드 설정 및 실행 (Spring Boot)

- **위치**: `/backend` 디렉토리
1.  **프로젝트 열기**: IntelliJ IDEA로 `backend` 디렉토리를 엽니다.
2.  **환경 변수 설정**: `backend/src/main/resources/application.yml` 파일의 `dev` 프로필 설정을 확인합니다.
3.  **실행**: `CoupApplication.java`의 `main` 메서드를 실행하거나, 터미널에서 `./gradlew bootRun` 명령을 실행합니다.

- **실행 확인**:
  - **백엔드 서버**: [http://localhost:8080](http://localhost:8080)
  - **API 문서**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

## 4. 시그널링 서버 설정 및 실행 (Node.js)

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
    JWT_SECRET="YOUR_SUPER_SECRET_KEY_FOR_JWT_CHANGE_IT" # 백엔드와 동일한 키 사용
    INTERNAL_API_URL=http://localhost:8080
    ```
3.  **실행**:
    ```bash
    npm run dev
    ```

- **실행 확인**:
  - **시그널링 서버**: `localhost:8081`에서 실행됩니다. (터미널 로그 확인)

## 5. 프론트엔드 설정 및 실행 (Next.js)

- **위치**: `/frontend` 디렉토리
1.  **의존성 설치**:
    ```bash
    cd frontend
    npm install
    ```
2.  **환경 변수 설정**: `.env.example` 파일을 `.env.local`로 복사하고 내용을 수정합니다.
    ```env
    # .env.local
    NEXT_PUBLIC_API_URL=http://localhost:8080
    NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:8081
    ```
3.  **실행**:
    ```bash
    npm run dev
    ```

- **실행 확인**:
  - **프론트엔드 앱**: [http://localhost:3000](http://localhost:3000) 에서 접속 가능합니다.

## 6. 요약

- 개발을 위해서는 **3개의 터미널**을 열고 각 서버를 실행해야 합니다.
  1.  **비즈니스 서버 (Spring Boot)**: `localhost:8080`
  2.  **시그널링 서버 (Node.js)**: `localhost:8081`
  3.  **프론트엔드 서버 (Next.js)**: `localhost:3000`
- 모든 서버가 실행되어야 전체 기능이 정상적으로 동작합니다.