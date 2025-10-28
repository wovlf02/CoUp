# 04. 기술 아키텍처

CoUp 플랫폼은 **프론트엔드, 백엔드, 그리고 실시간 시그널링 서버를 명확하게 분리**하는 아키텍처를 채택합니다. 이를 통해 각 영역의 독립성과 전문성을 보장하고, 대규모 실시간 트래픽 처리에 대비하며, 장기적인 확장성과 유지보수성을 확보하는 것을 목표로 합니다.

## 1. 시스템 아키텍처 다이어그램

```mermaid
graph TD
    subgraph User Device
        A[Web Browser]
    end

    subgraph Frontend Tier (Vercel)
        B(Next.js Frontend Server)
    end

    subgraph Backend Tier (AWS)
        C{API Gateway}
        D[Spring Boot Business Server]
        E[(Database - PostgreSQL)]
        F[File Storage - S3]
    end

    subgraph Signaling Tier (AWS)
        H[Node.js Signaling Server]
    end

    subgraph Shared Services (AWS)
        G[Cache & Message Broker - Redis]
    end

    A -- HTTPS --> B
    B -- Server-Side Rendering --> A
    A -- API Request (HTTPS) --> C
    C -- Routes to --> D
    
    A -- WebSocket Connection --> H

    D <--> E
    D <--> F
    
    H -- REST API Call --> D
    D -- Publish Event --> G
    G -- Message Subscribe --> H
    D <--> G

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#ccf,stroke:#333,stroke-width:2px
    style D fill:#9f9,stroke:#333,stroke-width:2px
    style H fill:#f9c,stroke:#333,stroke-width:2px
```

## 2. 주요 구성 요소 (Key Components)

### 2.1. 프론트엔드 (Frontend Tier)

- **기술**: **Next.js (React)**
- **역할**: 사용자에게 보여지는 모든 UI와 상호작용을 담당합니다. 비즈니스 서버와는 REST API로, 시그널링 서버와는 WebSocket으로 통신합니다.
- **배포**: Vercel 플랫폼을 통해 자동화된 CI/CD 파이프라인으로 배포됩니다.

### 2.2. 비즈니스 서버 (Backend Tier)

- **기술**: **Spring Boot (Java)**
- **역할**: CoUp 서비스의 **핵심 비즈니스 로직**을 모두 처리합니다. 데이터 영속성, 사용자 인증/인가, 복잡한 도메인 규칙 등을 담당하며, 프론트엔드와 시그널링 서버에 RESTful API를 제공합니다.
- **배포**: Docker 컨테이너로 빌드되어 **AWS ECS/Fargate**를 통해 배포됩니다.

### 2.3. 시그널링 서버 (Signaling Tier)

- **기술**: **Node.js (e.g., with Socket.IO or ws)**
- **역할**: **모든 실시간 통신**을 전담합니다. 클라이언트로부터 WebSocket 연결을 수신 및 유지하고, 메시지 브로드캐스팅, 실시간 알림 전송 등의 역할을 수행합니다.
- **동작 방식**:
  1.  클라이언트로부터 채팅 메시지 등 이벤트를 수신합니다.
  2.  수신한 메시지를 DB에 저장하거나 관련 비즈니스 로직을 처리하기 위해 **비즈니스 서버의 내부 API를 호출**합니다.
  3.  비즈니스 서버에서 특정 이벤트(예: 새로운 공지 등록)가 발생하면, **Redis Pub/Sub**을 통해 해당 이벤트를 구독(Subscribe)하여 클라이언트에게 실시간으로 푸시합니다.
- **배포**: Docker 컨테이너로 빌드되어 **AWS ECS/Fargate**를 통해 배포됩니다.

### 2.4. 공유 서비스 (Shared Services)

- **데이터베이스 (PostgreSQL on AWS RDS)**: 모든 핵심 데이터를 저장하는 주력 데이터베이스입니다.
- **파일 스토리지 (AWS S3)**: 이미지, 파일 등 정적 파일을 저장합니다.
- **캐시 & 메시지 브로커 (Redis on AWS ElastiCache)**:
  - **캐시**: 비즈니스 서버의 DB 부하를 줄이기 위한 캐싱 용도로 사용됩니다.
  - **메시지 브로커 (Pub/Sub)**: 비즈니스 서버와 시그널링 서버 간의 **느슨한 결합(Loose Coupling)**을 위해 사용됩니다. 비즈니스 서버가 특정 채널에 이벤트를 발행(Publish)하면, 시그널링 서버가 이를 구독하여 처리하는 방식으로 서버 간 직접적인 의존성을 제거합니다.