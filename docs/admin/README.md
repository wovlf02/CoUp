# CoUp 관리자 시스템 문서

이 디렉토리는 CoUp 플랫폼의 관리자 시스템 설계 및 운영 문서를 포함합니다.

## 📂 문서 구조

### 설계 문서

#### `/features` - 기능별 설계 명세
현재 CoUp의 일반 사용자 기능을 분석하고, 각 기능 영역에서 필요한 관리자 기능을 정의한 문서입니다.

- `01-user-management.md` - 사용자 관리 (인증, 프로필, 계정 상태)
- `02-study-management.md` - 스터디 관리 (생성, 운영, 모더레이션)
- `03-report-system.md` - 신고 및 제재 시스템

#### `/features/complete` - 통합 기능 명세
features 문서를 기반으로 CoUp에 최적화된 최종 관리자 기능 명세입니다.

- `01-user-management-complete.md` - 사용자 관리 완전 명세
- `02-study-management-complete.md` - 스터디 관리 완전 명세
- `03-report-handling-complete.md` - 신고 처리 완전 명세
- `04-analytics-dashboard-complete.md` - 분석 대시보드 완전 명세
- `05-system-settings-complete.md` - 시스템 설정 완전 명세
- `06-audit-log-complete.md` - 감사 로그 완전 명세

#### `/examples` - 모범 사례
웹 서비스 관리자 시스템의 일반적인 패턴과 모범 사례를 분석한 문서입니다.

- `01-best-practices.md` - 관리자 시스템 아키텍처 및 모범 사례

### 기술 문서

#### API 및 배포
- **`API-ENDPOINTS.md`** - 관리자 API 엔드포인트 명세
- **`DEPLOYMENT-GUIDE.md`** - 배포 가이드 (로컬/프로덕션)
- **`TROUBLESHOOTING-GUIDE.md`** - 트러블슈팅 가이드

#### 운영
- **`OPERATIONS-MANUAL.md`** - 일일/주간/월간 운영 매뉴얼
- **`LOGIN-GUIDE.md`** - 관리자 로그인 가이드

## 🎯 설계 원칙

1. **사용자 중심**: 일반 사용자 경험을 저해하지 않는 관리 시스템
2. **확장성**: 플랫폼 성장에 따라 유연하게 확장 가능한 구조
3. **보안**: 관리자 권한의 명확한 분리와 감사 추적
4. **투명성**: 모든 관리 활동의 기록과 추적

## 🚀 빠른 시작

### 개발자
1. **설계 이해**: `/features` 디렉토리의 문서 읽기
2. **API 확인**: `API-ENDPOINTS.md` 참고
3. **로컬 실행**: `DEPLOYMENT-GUIDE.md` > 로컬 개발 환경 섹션

### 운영자
1. **로그인**: `LOGIN-GUIDE.md` 참고
2. **일일 운영**: `OPERATIONS-MANUAL.md` > 일일 운영 섹션
3. **문제 해결**: `TROUBLESHOOTING-GUIDE.md` 참고

## 📖 문서 읽기 순서

### 처음 시작하는 경우
1. 이 README 파일 (현재 문서)
2. `/features/complete` 디렉토리의 관심 기능 문서
3. `API-ENDPOINTS.md`로 구현 사항 확인
4. `DEPLOYMENT-GUIDE.md`로 환경 설정

### 운영 담당자
1. `LOGIN-GUIDE.md`
2. `OPERATIONS-MANUAL.md`
3. `TROUBLESHOOTING-GUIDE.md`

## 🔧 기술 스택

- **프레임워크**: Next.js 14
- **데이터베이스**: PostgreSQL + Prisma ORM
- **인증**: NextAuth.js
- **UI**: React + Tailwind CSS
- **상태 관리**: React Hooks + Context API

## 📝 문서 업데이트

문서는 코드 변경사항과 함께 업데이트되어야 합니다.

- 새로운 API 추가 시: `API-ENDPOINTS.md` 업데이트
- 배포 프로세스 변경 시: `DEPLOYMENT-GUIDE.md` 업데이트
- 새로운 문제 해결 방법 발견 시: `TROUBLESHOOTING-GUIDE.md` 업데이트

---

**최종 업데이트**: 2025-11-30
