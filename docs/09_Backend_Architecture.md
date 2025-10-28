# 09. 백엔드 아키텍처 (Spring Boot)

CoUp의 백엔드는 **Spring Boot** 프레임워크를 기반으로 구축됩니다. Java 언어의 안정성과 Spring 생태계의 강력한 기능들을 활용하여, **핵심 비즈니스 로직** 처리에만 집중하고, 대규모 트래픽 처리가 가능하며, 유지보수와 확장이 용이한 견고한 서버 애플리케이션을 구축하는 것을 목표로 합니다.

## 1. 아키텍처 원칙

- **계층형 아키텍처 (Layered Architecture)**: **Controller - Service - Repository(Mapper)**의 3-Tier 아키텍처를 기본 구조로 하여 각 계층의 역할을 명확히 분리합니다.
- **의존성 주입 (Dependency Injection)**: Spring의 DI를 통해 객체 간의 의존성을 외부(IoC 컨테이너)에서 주입받아 코드의 결합도를 낮추고 유연성을 극대화합니다.
- **SQL 중심의 데이터 접근**: MyBatis를 사용하여 SQL 쿼리를 코드와 명확하게 분리하고, SQL에 대한 완전한 제어권을 확보합니다.

## 2. 패키지 구조 (Package Structure)

```
com.coup
├── domain/                             # 비즈니스 도메인별 패키지 (DDD 원칙)
│   ├── auth/                           # 인증 및 인가 관련 도메인
│   │   ├── controller/
│   │   │   └── AuthController.java
│   │   ├── service/
│   │   │   └── AuthService.java
│   │   ├── dto/
│   │   │   ├── request/                # API 요청 DTO
│   │   │   │   ├── AuthRequest.java
│   │   │   │   └── ...
│   │   │   └── response/               # API 응답 DTO
│   │   │       ├── AuthResponse.java
│   │   │       └── ...
│   │   └── handler/
│   │       ├── OAuth2AuthenticationSuccessHandler.java
│   │       └── OAuth2AuthenticationFailureHandler.java
│   ├── user/                           # 사용자 관련 도메인
│   │   ├── controller/
│   │   │   └── UserController.java
│   │   ├── service/
│   │   │   └── UserService.java
│   │   ├── repository/
│   │   │   └── UserRepository.java
│   │   ├── dto/
│   │   │   ├── request/                # API 요청 DTO
│   │   │   │   └── UserUpdateRequest.java
│   │   │   ├── response/               # API 응답 DTO
│   │   │   │   └── UserProfileResponse.java
│   │   │   └── UserDto.java            # 내부 서비스/DB 매핑용 DTO (필요시)
│   │   └── model/                      # 도메인 모델 (필요시)
│   │       └── User.java
│   ├── study/                          # 스터디 그룹 관련 도메인
│   │   ├── controller/
│   │   │   └── StudyController.java
│   │   ├── service/
│   │   │   └── StudyService.java
│   │   ├── repository/
│   │   │   ├── StudyRepository.java
│   │   │   └── StudyMemberRepository.java
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   │   └── StudyCreationRequest.java
│   │   │   │   └── ...
│   │   │   ├── response/
│   │   │   │   ├── StudyResponse.java
│   │   │   │   └── ...
│   │   │   └── StudyDto.java           # 내부 서비스/DB 매핑용 DTO
│   │   │   └── StudyMemberDto.java
│   │   └── event/
│   │       └── StudyEventPublisher.java
│   ├── chat/                           # 채팅 관련 도메인 (내부 API용)
│   │   ├── controller/
│   │   │   └── InternalChatController.java
│   │   ├── service/
│   │   │   └── ChatService.java
│   │   ├── repository/
│   │   │   └── ChatMessageRepository.java
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   │   └── ChatMessageRequest.java
│   │   │   │   └── ...
│   │   │   └── response/
│   │   │       ├── ChatMessageResponse.java
│   │   │       └── ...
│   │   │   └── ChatMessageDto.java     # 내부 서비스/DB 매핑용 DTO
│   ├── notice/                         # 공지사항 관련 도메인
│   │   ├── controller/
│   │   │   └── NoticeController.java
│   │   ├── service/
│   │   │   └── NoticeService.java
│   │   ├── repository/
│   │   │   └── NoticeRepository.java
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   │   └── NoticeCreateRequest.java
│   │   │   │   └── NoticeUpdateRequest.java
│   │   │   │   └── ...
│   │   │   └── response/
│   │   │       ├── NoticeResponse.java
│   │   │       └── ...
│   │   │   └── NoticeDto.java          # 내부 서비스/DB 매핑용 DTO
│   ├── file/                           # 파일 공유 관련 도메인
│   │   ├── controller/
│   │   │   └── FileController.java
│   │   ├── service/
│   │   │   └── FileService.java
│   │   ├── repository/
│   │   │   └── FileRepository.java
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   │   └── FileUploadRequest.java
│   │   │   │   └── ...
│   │   │   └── response/
│   │   │       ├── FileResponse.java
│   │   │       └── ...
│   │   │   └── FileDto.java            # 내부 서비스/DB 매핑용 DTO
│   ├── calendar/                       # 캘린더/일정 관련 도메인
│   │   ├── controller/
│   │   │   └── CalendarController.java
│   │   ├── service/
│   │   │   └── CalendarService.java
│   │   ├── repository/
│   │   │   └── CalendarEventRepository.java
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   │   └── CalendarEventCreateRequest.java
│   │   │   │   └── ...
│   │   │   └── response/
│   │   │       ├── CalendarEventResponse.java
│   │   │       └── ...
│   │   │   └── CalendarEventDto.java   # 내부 서비스/DB 매핑용 DTO
│   └── notification/                   # 알림 관련 도메인
│       ├── service/
│       │   └── NotificationService.java
│       ├── repository/
│       │   └── NotificationRepository.java
│       ├── dto/
│   │   │   ├── request/
│   │   │   │   └── NotificationRequest.java
│   │   │   │   └── ...
│   │   │   └── response/
│   │   │       ├── NotificationResponse.java
│   │   │       └── ...
│   │   │   └── NotificationDto.java    # 내부 서비스/DB 매핑용 DTO
│
├── common/                             # 공통 유틸리티 및 기반 클래스
│   ├── exception/                      # 전역 예외 처리
│   │   ├── GlobalExceptionHandler.java
│   │   ├── CustomException.java
│   │   └── ErrorCode.java
│   ├── response/                       # 공통 API 응답 형식
│   │   └── ApiResponse.java
│   ├── security/                       # JWT 관련 공통 유틸리티
│   │   ├── JwtTokenProvider.java
│   │   └── ...
│   └── util/                           # 기타 범용 유틸리티
│       └── DateUtils.java
│
├── config/                             # 애플리케이션 설정
│   ├── security/                       # Spring Security 설정
│   │   ├── SecurityConfig.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── ...
│   ├── mybatis/                        # MyBatis 설정
│   │   └── MyBatisConfig.java
│   ├── redis/                          # Redis 설정
│   │   └── RedisConfig.java
│   └── web/                            # Web 관련 설정 (CORS 등)
│       └── WebConfig.java
│
└── CoupApplication.java                # Spring Boot 메인 애플리케이션
```

## 3. 계층별 역할 정의 (Layer Definitions)

- **Controller (`@RestController`)**: HTTP 요청을 수신하고, 적절한 Service 메서드를 호출하는 진입점입니다.
  - `@RequestBody`를 통해 DTO로 요청 데이터를 바인딩하고 유효성을 검사(`@Valid`)합니다.
  - Service로부터 받은 결과를 `ApiResponse` 형태로 감싸 클라이언트에게 반환합니다.

- **Service (`@Service`)**: 핵심 비즈니스 로직을 처리하는 계층입니다.
  - `@Transactional` 어노테이션을 통해 트랜잭션을 관리합니다.
  - 여러 매퍼(Mapper)를 조합하여 복잡한 로직을 수행합니다.
  - Controller와 Repository(Mapper) 사이의 중재자 역할을 합니다.

- **Repository / Mapper (`@Mapper`)**: 데이터베이스와의 상호작용을 담당하는 데이터 접근 계층입니다.
  - MyBatis의 매퍼 인터페이스로 작성됩니다.
  - 인터페이스의 메서드에 어노테이션이나 별도의 XML 파일을 통해 실행할 SQL 쿼리를 직접 매핑합니다.
  - Service 계층은 이 매퍼 인터페이스를 주입받아, 정의된 메서드를 호출함으로써 데이터베이스와 통신합니다.

- **DTO (Data Transfer Object)**: 계층 간, 특히 데이터베이스의 쿼리 결과와 서비스 계층 간의 데이터 전송에 사용되는 객체입니다. Controller의 요청/응답 객체로도 사용됩니다.

## 4. 인증 및 인가 (Authentication & Authorization)

- **`Spring Security`** 와 **JWT (JSON Web Token)**를 조합하여 모든 REST API의 접근을 제어합니다.
- **흐름**: 클라이언트가 API 요청 시 보낸 JWT를 `JwtAuthenticationFilter`가 검증하고, 유효한 경우 `SecurityContextHolder`에 인증 정보를 저장합니다.

## 5. 시그널링 서버와의 연동

- 비즈니스 서버는 실시간 통신을 직접 처리하지 않고, **내부 REST API**와 **Redis Pub/Sub**을 통해 시그널링 서버와 상호작용합니다.
- **Inbound (시그널링 -> 비즈니스)**: 시그널링 서버가 DB 저장을 요청할 수 있도록 `/api/internal/**` 경로의 내부 API를 제공합니다.
- **Outbound (비즈니스 -> 시그널링)**: 비즈니스 서버에서 발생한 실시간 알림 필요 이벤트를 `RedisTemplate`을 통해 Redis 채널에 발행(Publish)합니다.
