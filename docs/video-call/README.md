# 화상회의 시스템 구현 문서

> **작성일**: 2025-11-19  
> **상태**: 🚧 진행 중  
> **목표**: WebRTC 기반 P2P 화상회의 시스템 구현

---

## 📚 문서 구조

이 폴더는 화상회의 시스템의 설계, 구현, 테스트에 관한 모든 문서를 포함합니다.

### 문서 목록

1. **[설계 분석](./01-design-analysis.md)** - 기존 설계 문서 분석
2. **[현재 구현 상태](./02-current-status.md)** - 프론트엔드/백엔드 구현 현황
3. **[구현 계획](./03-implementation-plan.md)** - 단계별 구현 계획
4. **[API 명세](./04-api-specification.md)** - 백엔드 API 설계
5. **[WebRTC 가이드](./05-webrtc-guide.md)** - WebRTC 구현 상세 가이드
6. **[테스트 계획](./06-test-plan.md)** - 테스트 시나리오 및 체크리스트
7. **[Todo List](./07-todo-list.md)** - 구현 작업 목록
8. **[시그널링 서버 아키텍처](./08-signaling-server-architecture.md)** - 통합 vs 분리 아키텍처 분석
9. **[아키텍처 전환 요약](./09-architecture-migration-summary.md)** ⭐ NEW - 분리형으로 전환 완료

---

## 🎯 프로젝트 개요

### 목표

스터디 그룹 멤버들이 실시간으로 화상회의를 진행할 수 있는 시스템 구축

### 핵심 기능

1. **실시간 화상/음성 통화** (WebRTC P2P)
2. **화면 공유** 
3. **채팅** (텍스트 메시지)
4. **참여자 관리** (음소거, 강퇴 등)
5. **통화 품질 모니터링**

### 기술 스택

- **프론트엔드**: Next.js 14, React 18
- **WebRTC**: RTCPeerConnection (P2P Mesh)
- **시그널링**: Socket.io
- **백엔드**: Node.js, Socket.io Server
- **데이터베이스**: PostgreSQL (세션 기록)

---

## 📖 참고 자료

### 기존 설계 문서

- `/docs/screens/study/my/video-call.md` - 메인 설계 문서
- `/docs/screens/study/my/video-call-supplement.md` - 보완 문서
- `/VIDEO_CALL_UI_IMPROVEMENT.md` - UI 개선 완료 보고서

### 관련 코드

- **페이지**: `/coup/src/app/my-studies/[studyId]/video-call/page.jsx`
- **훅**: `/coup/src/lib/hooks/useVideoCall.js`
- **컴포넌트**: `/coup/src/components/video-call/`
- **소켓 서버**: `/coup/src/lib/socket/server.js`

---

## 🚀 빠른 시작

### 1. 문서 읽기 순서

```
01. 설계 분석 → 기존 설계 이해
02. 현재 구현 상태 → 무엇이 구현되었는지 파악
03. 구현 계획 → 앞으로 해야 할 작업 이해
04-06. 상세 가이드 → 구현 시 참고
07. Todo List → 실제 작업 진행
```

### 2. 개발 환경 설정

```bash
# 의존성 설치
cd coup
npm install

# 개발 서버 실행 (Socket.io 포함)
npm run dev
```

### 3. 테스트

```bash
# 브라우저에서 열기
# User 1: http://localhost:3000/my-studies/[studyId]/video-call
# User 2: 시크릿 모드에서 다른 계정으로 동일 URL 접속
```

---

## ⚠️ 주요 제약사항

### P2P Mesh 방식의 한계

- **최대 참여자**: 6-8명 권장 (네트워크 부하 고려)
- **대역폭 요구사항**: 참여자 수에 비례하여 증가
- **확장성**: 분리형 아키텍처로 시그널링 서버는 무제한 확장 가능

### 브라우저 호환성

- Chrome 90+ ✅
- Firefox 85+ ✅
- Safari 14+ ✅ (일부 제약)
- Edge 90+ ✅

### 네트워크 요구사항

- **최소 대역폭**: 업로드/다운로드 각 2Mbps
- **권장 대역폭**: 업로드/다운로드 각 5Mbps
- **NAT 통과**: STUN 서버 필요 (Google STUN 사용 중)
- **방화벽**: 일부 기업 네트워크에서는 TURN 서버 필요 (선택 구현)

### 인프라 요구사항

- **Redis**: 필수 (다중 시그널링 서버 동기화)
- **도메인**: 2개 필요 (coup.com, ws.coup.com)
- **서버**: 최소 2대 (Next.js + Signaling)

---

## 📝 문서 업데이트 규칙

1. **모든 변경사항은 문서에 반영**
2. **작업 완료 시 Todo List 업데이트**
3. **새로운 이슈 발견 시 즉시 문서화**
4. **코드 변경 시 해당 문서도 함께 업데이트**

---

## 🤝 기여 가이드

### 문서 작성 원칙

- 명확하고 간결하게 작성
- 코드 예제 포함
- 스크린샷/다이어그램 활용
- 업데이트 날짜 명시

### 코드 작성 원칙

- 주석 필수 (특히 WebRTC 관련)
- 에러 핸들링 철저히
- 로그 레벨 적절히 설정
- 테스트 코드 작성

---

## 📞 문의

- **개발 관련**: 프로젝트 이슈 트래커 활용
- **설계 변경**: 문서 리뷰 후 진행
- **긴급 버그**: 즉시 팀에 공유

---

**Last Updated**: 2025-11-19

