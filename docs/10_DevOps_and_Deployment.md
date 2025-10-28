# 10. DevOps 및 배포 전략

CoUp 프로젝트는 **프론트엔드, 비즈니스 서버, 시그널링 서버**가 각각 분리된 아키텍처를 채택하므로, 각 서비스는 독립적인 배포 파이프라인을 가집니다. CI/CD 파이프라인을 자동화하여, 개발자가 코드 작성에만 집중하고 배포 과정의 부담을 최소화하는 것을 목표로 합니다.

## 1. CI/CD 파이프라인 (GitHub Actions)

- 각 서비스(frontend, backend, signaling)는 별도의 디렉토리에서 관리되므로, GitHub Actions 워크플로우는 `paths` 필터를 사용하여 변경된 프로젝트에 대해서만 실행됩니다.

### 1.1. 프론트엔드 (Next.js)

- **CI (`on: pull_request`)**: `frontend/**` 경로 변경 시 실행. `npm test`, `npm run lint` 등을 수행.
- **CD (`on: push, branches: [main]`)**: Vercel의 GitHub 연동 기능을 통해 자동으로 처리됩니다. `main` 브랜치에 새로운 코드가 푸시되면, Vercel이 이를 감지하여 자동으로 빌드 및 프로덕션 환경에 배포합니다.

### 1.2. 비즈니스 서버 (Spring Boot)

- **CI (`on: pull_request`)**: `backend/**` 경로 변경 시 실행. `./gradlew test` 등을 수행.
- **CD (`on: push, branches: [main]`)**: `backend/**` 경로의 `main` 브랜치에 코드가 푸시되면 실행됩니다. Docker 이미지를 빌드하여 AWS ECR에 푸시하고, ECS에 배포합니다.

(YAML 예시는 이전 버전과 거의 동일)

### 1.3. 시그널링 서버 (Node.js)

- **CI (`on: pull_request`)**: `signaling/**` 경로 변경 시 실행. `npm test`, `npm run lint` 등을 수행.
- **CD (`on: push, branches: [main]`)**: `signaling/**` 경로의 `main` 브랜치에 코드가 푸시되면 실행됩니다. 비즈니스 서버와 마찬가지로 Docker 이미지를 빌드하여 AWS ECR에 푸시하고, ECS에 배포합니다.

**예시: `signaling-cd.yml`**
```yaml
name: Signaling Server CD Pipeline
on:
  push:
    branches: [ main ]
    paths:
      - 'signaling/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./signaling
        run: npm install

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2

      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ secrets.AWS_ECR_REGISTRY }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/coup-signaling:$IMAGE_TAG ./signaling
          docker push $ECR_REGISTRY/coup-signaling:$IMAGE_TAG
          echo "::set-output name=image::$ECR_REGISTRY/coup-signaling:$IMAGE_TAG"

      - name: Deploy to Amazon ECS
        # ... ECS 배포 단계 (비즈니스 서버와 유사)
```

## 2. 인프라 구성 (Infrastructure)

### 프론트엔드 호스팅

- **Vercel**: Next.js 프론트엔드 앱을 호스팅합니다.

### 서버 호스팅 (비즈니스 서버 & 시그널링 서버)

- **AWS ECS (Elastic Container Service) + Fargate**: 두 서버(Spring Boot, Node.js) 애플리케이션을 **Docker 컨테이너**로 실행하기 위한 오케스트레이션 서비스입니다. Fargate를 사용하여 서버 인스턴스를 직접 관리할 필요 없이 컨테이너를 실행합니다.
- **Application Load Balancer (ALB)**: 외부 트래픽을 수신하여, 경로(예: `/api/*`)에 따라 적절한 백엔드 서비스(비즈니스 서버)로 요청을 라우팅합니다. WebSocket 업그레이드 요청은 시그널링 서버로 라우팅하도록 구성할 수 있습니다.
- **VPC (Virtual Private Cloud)**: 모든 AWS 리소스를 논리적으로 격리된 가상 네트워크 내에 배치하여 보안을 강화합니다. 서비스 간 통신(예: 시그널링 서버 -> 비즈니스 서버)은 이 VPC 내부에서 이루어집니다.

### 공유 인프라

- **AWS RDS for PostgreSQL**: 비즈니스 서버가 사용하는 주력 데이터베이스입니다.
- **AWS ElastiCache for Redis**: 비즈니스 서버의 캐싱 및 서버 간 통신을 위한 메시지 브로커(Pub/Sub)로 사용됩니다.
- **AWS S3**: 이미지, 파일 등 정적 자산을 저장합니다.