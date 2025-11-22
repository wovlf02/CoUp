# 화상 통화 시스템 설계

이 폴더에는 CoUp 프로젝트의 WebRTC 기반 화상 통화 시스템 설계 문서가 포함되어 있습니다.

## 📑 문서 목록

### 1. [design.md](./design.md)
- **화상 통화 UI/UX 설계**
- 화면 레이아웃 분석
- 컴포넌트 구조
- 사용자 시나리오

### 2. [implementation.md](./implementation.md)
- **구현 계획**
- Phase별 구현 단계
- 기술 스택 선정
- 개발 로드맵

### 3. [api.md](./api.md)
- **API 명세**
- 시그널링 서버 API
- Socket.io 이벤트
- WebRTC 시그널링

### 4. [webrtc.md](./webrtc.md)
- **WebRTC 가이드**
- WebRTC 기본 개념
- PeerConnection 관리
- 미디어 스트림 처리
- ICE, STUN, TURN 서버

### 5. [architecture.md](./architecture.md)
- **시그널링 서버 아키텍처**
- 서버 구조 설계
- 분리형 아키텍처
- Redis Adapter
- 스케일링 전략

## 🎯 시스템 개요

### 기술 스택
- **프론트엔드**: Next.js 14, React
- **WebRTC**: getUserMedia, RTCPeerConnection
- **시그널링**: Socket.io
- **서버**: Express.js + Socket.io
- **캐싱**: Redis Adapter

### 주요 기능
- 실시간 화상/음성 통화
- 화면 공유
- 채팅
- 참여자 관리
- 음소거/비디오 on/off

## 📖 읽는 순서

### 신규 개발자
1. **design.md** - UI/UX 이해
2. **webrtc.md** - WebRTC 기본 학습
3. **architecture.md** - 시스템 구조 파악
4. **implementation.md** - 구현 계획 확인
5. **api.md** - API 사용법 학습

### 기능 개발 시
1. 해당 기능 관련 섹션 확인
2. API 명세 참조
3. 코드 예제 활용

## 🔗 관련 문서

- [화면 설계](../screens/study/my/video-call.md) - 상세 화면 설계
- [백엔드 API](../backend/api/) - REST API 연동

## 📚 참고 자료

### WebRTC
- [WebRTC API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [WebRTC Samples](https://webrtc.github.io/samples/)

### Socket.io
- [Socket.io 공식 문서](https://socket.io/docs/v4/)
- [Socket.io Redis Adapter](https://socket.io/docs/v4/redis-adapter/)

---

**Last Updated**: 2025-11-22
