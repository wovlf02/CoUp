# 🔍 프론트엔드 미구현 기능 분석 보고서

> **작성일**: 2025-11-17  
> **목적**: 설계 문서 대비 실제 구현되지 않은 기능 상세 분석  
> **기준**: IMPLEMENTATION_STATUS.md (95% 완성) 대비

---

## 📊 전체 요약

### 완성도 분석

| 카테고리 | 설계 화면 | 구현 완료 | 미구현 | 완성도 |
|---------|---------|---------|--------|--------|
| **MVP 핵심** | 21개 | 21개 | 0개 | 100% ✅ |
| **관리자 화면** | 6개 | 6개 (UI만) | 모달/차트 | 60% 🔨 |
| **세부 인터랙션** | - | 일부 | 다수 | ~80% 🔨 |
| **백엔드 연동** | - | Mock | 전체 | 0% 🔌 |

**전체 프론트엔드 완성도: 약 75%** (관리자 화면 UI 추가)

---

## ❌ 미구현 주요 화면 (6개)

### 1. 관리자 화면 (60% 완성 🔨)

**현재 상태**: 
- ✅ 6개 페이지 UI 구현 완료
- ✅ Mock 데이터 준비 완료
- ✅ 반응형 레이아웃 완료
- ❌ 모달 컴포넌트 (0%)
- ❌ 차트 구현 (0%)
- ❌ 액션 기능 (0%)

**상세 문서**: `docs/ADMIN_IMPLEMENTATION_COMPLETE.md`

#### 1.1 관리자 대시보드 (`/admin`)
- **우선순위**: Low (Post-MVP)
- **설계 문서**: `docs/screens/admin/dashboard.md`
- **구현 상태**: 
  - ✅ UI 레이아웃 (100%)
  - ✅ 통계 카드 (100%)
  - ❌ 차트 (0% - Recharts 필요)
  - ✅ 신고 목록 (100%)
  - ✅ 사용자 목록 (100%)

#### 1.2 사용자 관리 (`/admin/users`)
- **우선순위**: Low (Post-MVP)
- **설계 문서**: `docs/screens/admin/users-management.md`
- **구현 상태**:
  - ✅ UI 레이아웃 (100%)
  - ✅ 검색/필터 (100%)
  - ✅ 테이블 (100%)
  - ❌ 상세 모달 (0%)
  - ❌ 정지 모달 (0%)
  - ❌ 실제 액션 (0%)

#### 1.3 스터디 관리 (`/admin/studies`)
- **우선순위**: Low (Post-MVP)
- **설계 문서**: `docs/screens/admin/studies-management.md`
- **구현 상태**:
  - ✅ UI 레이아웃 (100%)
  - ✅ 필터 (100%)
  - ❌ 상세 모달 (0%)
  - ❌ 실제 액션 (0%)

#### 1.4 신고 관리 (`/admin/reports`)
- **우선순위**: Low (Post-MVP)
- **설계 문서**: `docs/screens/admin/reports.md`
- **구현 상태**:
  - ✅ UI 레이아웃 (100%)
  - ✅ 우선순위 표시 (100%)
  - ❌ 신고 상세 모달 (0%)
  - ❌ 처리 모달 (0%)
  - ❌ 실제 처리 (0%)

#### 1.5 통계 분석 (`/admin/analytics`)
- **우선순위**: Low (Post-MVP)
- **설계 문서**: `docs/screens/admin/analytics.md`
- **구현 상태**:
  - ✅ UI 레이아웃 (100%)
  - ✅ 전환 퍼널 시각화 (100%)
  - ❌ 차트 (0% - Recharts 필요)

#### 1.6 시스템 설정 (`/admin/settings`)
- **우선순위**: Low (Post-MVP)
- **설계 문서**: `docs/screens/admin/settings.md`
- **구현 상태**:
  - ✅ UI 레이아웃 (100%)
  - ✅ 탭 전환 (100%)
  - ✅ 폼 (100%)
  - ❌ 관리자 추가 모달 (0%)
  - ❌ 실제 저장 (0%)

---

## 🔨 미구현 세부 기능 (우선순위별)

### 🔴 High Priority (즉시 필요)

#### 1. WebSocket 실시간 기능
**영향 범위**: 채팅, 알림, 온라인 멤버

**현재 상태**: Mock 데이터만 표시, 실시간 업데이트 없음

**필요 작업**:
```javascript
// 1. Socket.IO 클라이언트 설정
// coup/src/lib/socket.js
import io from 'socket.io-client'

export const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
  autoConnect: false,
  auth: {
    token: getAuthToken()
  }
})

// 2. useSocket 훅 구현
// coup/src/hooks/useSocket.js
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false)
  
  useEffect(() => {
    socket.connect()
    
    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))
    
    return () => socket.disconnect()
  }, [])
  
  return { socket, isConnected }
}

// 3. 채팅 실시간 연동
// coup/src/app/my-studies/[studyId]/chat/page.jsx
const { socket } = useSocket()

useEffect(() => {
  socket.emit('join_study', { studyId })
  
  socket.on('new_message', (message) => {
    setMessages(prev => [...prev, message])
  })
  
  return () => {
    socket.emit('leave_study', { studyId })
    socket.off('new_message')
  }
}, [studyId])
```

**예상 작업 시간**: 2-3일

---

#### 2. 백엔드 API 연동
**영향 범위**: 모든 CRUD 기능

**현재 상태**: Mock 데이터만 사용, API 호출 없음

**필요 작업**:
```javascript
// 1. API 클라이언트 설정
// coup/src/lib/api/client.js
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 인터셉터 (토큰 자동 추가)
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 2. 각 도메인별 API 함수
// coup/src/lib/api/studies.js
export const studiesApi = {
  getPublicStudies: (params) => 
    apiClient.get('/studies', { params }),
  
  getMyStudies: () => 
    apiClient.get('/my-studies'),
  
  getStudyDetail: (studyId) => 
    apiClient.get(`/my-studies/${studyId}`),
  
  createStudy: (data) => 
    apiClient.post('/studies', data),
  
  joinStudy: (studyId, data) => 
    apiClient.post(`/studies/${studyId}/join`, data)
}

// 3. React Query 적용
// coup/src/app/studies/page.jsx
const { data: studies, isLoading } = useQuery({
  queryKey: ['studies', filters],
  queryFn: () => studiesApi.getPublicStudies(filters)
})
```

**예상 작업 시간**: 5-7일 (전체 API 연동)

---

#### 3. 파일 업로드/다운로드 실제 구현
**영향 범위**: 파일 관리, 채팅 첨부

**현재 상태**: UI만 구현, 실제 업로드 불가

**필요 작업**:
```javascript
// 1. S3 Pre-signed URL 방식
// coup/src/lib/api/files.js
export const filesApi = {
  // 업로드 URL 요청
  getUploadUrl: (filename, contentType) =>
    apiClient.post('/files/upload-url', { filename, contentType }),
  
  // S3에 직접 업로드
  uploadToS3: async (presignedUrl, file) => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    })
    return response
  },
  
  // 업로드 완료 알림
  confirmUpload: (fileId, studyId) =>
    apiClient.post(`/my-studies/${studyId}/files/${fileId}/confirm`)
}

// 2. 드래그 앤 드롭 구현
// coup/src/app/my-studies/[studyId]/files/page.jsx
const handleDrop = async (e) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files)
  
  for (const file of files) {
    // 1. Pre-signed URL 요청
    const { presignedUrl, fileId } = await filesApi.getUploadUrl(
      file.name, 
      file.type
    )
    
    // 2. S3에 업로드
    await filesApi.uploadToS3(presignedUrl, file)
    
    // 3. 백엔드에 완료 알림
    await filesApi.confirmUpload(fileId, studyId)
  }
}

// 3. 다운로드 구현
const handleDownload = async (fileId) => {
  const { downloadUrl } = await filesApi.getDownloadUrl(fileId)
  window.open(downloadUrl, '_blank')
}
```

**예상 작업 시간**: 2-3일

---

### 🟡 Medium Priority (중요하지만 긴급하지 않음)

#### 4. WebRTC 화상 통화 실제 구현
**영향 범위**: 화상 회의

**현재 상태**: UI 프로토타입만 존재

**필요 작업**:
```javascript
// 1. WebRTC 연결 설정
// coup/src/lib/webrtc.js
export class WebRTCManager {
  constructor(signalingServer) {
    this.signalingServer = signalingServer
    this.peerConnections = new Map()
    this.localStream = null
  }
  
  // 로컬 미디어 스트림 획득
  async getLocalStream() {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    return this.localStream
  }
  
  // Peer Connection 생성
  createPeerConnection(remoteUserId) {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    })
    
    // 로컬 스트림 추가
    this.localStream.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream)
    })
    
    // ICE Candidate 처리
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingServer.sendIceCandidate(
          remoteUserId, 
          event.candidate
        )
      }
    }
    
    // 원격 스트림 수신
    pc.ontrack = (event) => {
      this.onRemoteStream(remoteUserId, event.streams[0])
    }
    
    this.peerConnections.set(remoteUserId, pc)
    return pc
  }
  
  // Offer 생성 및 전송
  async createOffer(remoteUserId) {
    const pc = this.createPeerConnection(remoteUserId)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    this.signalingServer.sendOffer(remoteUserId, offer)
  }
}

// 2. 시그널링 서버 통신
// coup/src/app/my-studies/[studyId]/video-call/page.jsx
const webrtc = useRef(new WebRTCManager(socket))

useEffect(() => {
  // 방 입장
  socket.emit('join_video_room', { studyId })
  
  // Offer 수신
  socket.on('offer', async ({ userId, offer }) => {
    const pc = webrtc.current.createPeerConnection(userId)
    await pc.setRemoteDescription(offer)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    socket.emit('answer', { userId, answer })
  })
  
  // Answer 수신
  socket.on('answer', async ({ userId, answer }) => {
    const pc = webrtc.current.peerConnections.get(userId)
    await pc.setRemoteDescription(answer)
  })
  
  // ICE Candidate 수신
  socket.on('ice_candidate', async ({ userId, candidate }) => {
    const pc = webrtc.current.peerConnections.get(userId)
    await pc.addIceCandidate(candidate)
  })
  
  return () => {
    webrtc.current.cleanup()
    socket.emit('leave_video_room', { studyId })
  }
}, [studyId])
```

**예상 작업 시간**: 5-7일

---

#### 5. 드래그 앤 드롭 인터랙션
**영향 범위**: 할일 칸반, 파일 정렬

**현재 상태**: UI만 존재, 드래그 불가

**필요 작업**:
```javascript
// 1. react-beautiful-dnd 설치
// npm install react-beautiful-dnd

// 2. 할일 칸반 드래그 구현
// coup/src/app/my-studies/[studyId]/tasks/page.jsx
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const handleDragEnd = async (result) => {
  if (!result.destination) return
  
  const { source, destination, draggableId } = result
  
  // 같은 컬럼 내 이동
  if (source.droppableId === destination.droppableId) {
    const column = columns[source.droppableId]
    const newTaskIds = Array.from(column.taskIds)
    newTaskIds.splice(source.index, 1)
    newTaskIds.splice(destination.index, 0, draggableId)
    
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        taskIds: newTaskIds
      }
    })
  } else {
    // 다른 컬럼으로 이동 (상태 변경)
    const sourceColumn = columns[source.droppableId]
    const destColumn = columns[destination.droppableId]
    
    // ... 상태 업데이트 로직
    
    // API 호출
    await tasksApi.updateTask(draggableId, {
      status: destination.droppableId
    })
  }
}

return (
  <DragDropContext onDragEnd={handleDragEnd}>
    {Object.entries(columns).map(([columnId, column]) => (
      <Droppable droppableId={columnId} key={columnId}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {column.taskIds.map((taskId, index) => (
              <Draggable draggableId={taskId} index={index} key={taskId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard task={tasks[taskId]} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    ))}
  </DragDropContext>
)
```

**예상 작업 시간**: 2-3일

---

#### 6. 캘린더 주/일 뷰
**영향 범위**: 캘린더

**현재 상태**: 월 뷰만 구현

**필요 작업**:
```javascript
// coup/src/app/my-studies/[studyId]/calendar/page.jsx
const [viewMode, setViewMode] = useState('month') // 'month' | 'week' | 'day'

// 주 뷰 렌더링
const renderWeekView = () => {
  const startOfWeek = getStartOfWeek(currentDate)
  const days = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek, i)
  )
  
  return (
    <div className={styles.weekView}>
      <div className={styles.timeGrid}>
        {/* 시간 라벨 (00:00 ~ 23:00) */}
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className={styles.timeLabel}>
            {hour.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>
      
      <div className={styles.daysGrid}>
        {days.map(day => (
          <div key={day} className={styles.dayColumn}>
            <div className={styles.dayHeader}>
              {format(day, 'E d')}
            </div>
            <div className={styles.eventsContainer}>
              {getEventsForDay(day).map(event => (
                <EventBlock 
                  key={event.id} 
                  event={event}
                  startHour={getHours(event.startDate)}
                  duration={getDurationInHours(event)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 일 뷰 렌더링
const renderDayView = () => {
  const events = getEventsForDay(currentDate)
  
  return (
    <div className={styles.dayView}>
      <div className={styles.timeGrid}>
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className={styles.hourSlot}>
            <span className={styles.timeLabel}>
              {hour.toString().padStart(2, '0')}:00
            </span>
            <div className={styles.eventsContainer}>
              {events
                .filter(e => getHours(e.startDate) === hour)
                .map(event => (
                  <EventBlock key={event.id} event={event} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**예상 작업 시간**: 2-3일

---

### 🟢 Low Priority (추후 개선)

#### 7. 고급 검색 기능
**영향 범위**: 스터디 탐색

**현재 상태**: 기본 검색만 가능

**필요 기능**:
- 복합 필터 (카테고리 + 태그 + 멤버 수 + 활동도)
- 정렬 옵션 확장 (인기순, 최신순, 멤버 수순)
- 검색 히스토리
- 저장된 검색 조건

**예상 작업 시간**: 2일

---

#### 8. 알림 설정 상세화
**영향 범위**: 알림

**현재 상태**: 기본 알림만

**필요 기능**:
- 알림 유형별 on/off
- 알림 시간대 설정
- 이메일 알림 연동
- 푸시 알림 연동

**예상 작업 시간**: 2-3일

---

#### 9. 마크다운 에디터 고도화
**영향 범위**: 공지사항, 채팅

**현재 상태**: 기본 마크다운만 지원

**필요 기능**:
- 이미지 드래그 앤 드롭
- 테이블 편집
- 코드 블록 syntax highlighting
- 미리보기/편집 분할 화면

**예상 작업 시간**: 2일

---

#### 10. 프로필 이미지 크롭
**영향 범위**: 마이페이지, 프로필 편집

**현재 상태**: 이미지 업로드만 가능

**필요 기능**:
- 이미지 크롭 (react-image-crop)
- 회전, 확대/축소
- 미리보기

**예상 작업 시간**: 1-2일

---

## 🔌 백엔드 연동 체크리스트

### 인증
- [ ] 로그인 API 연동
- [ ] 회원가입 API 연동
- [ ] 소셜 로그인 (Google, GitHub) 연동
- [ ] 토큰 갱신 자동화
- [ ] 로그아웃 API 연동

### 스터디 탐색
- [ ] 공개 스터디 목록 API
- [ ] 스터디 생성 API
- [ ] 스터디 프리뷰 API
- [ ] 가입 신청 API

### 내 스터디
- [ ] 내 스터디 목록 API
- [ ] 스터디 대시보드 데이터 API
- [ ] 스터디 설정 수정 API
- [ ] 스터디 탈퇴 API

### 채팅
- [ ] WebSocket 연결
- [ ] 메시지 전송/수신
- [ ] 이전 메시지 로드 (페이지네이션)
- [ ] 파일 첨부

### 공지사항
- [ ] 공지 CRUD API
- [ ] 고정 공지 설정 API
- [ ] 댓글 CRUD API

### 파일
- [ ] S3 Pre-signed URL API
- [ ] 파일 업로드 확인 API
- [ ] 파일 다운로드 URL API
- [ ] 파일 삭제 API

### 캘린더
- [ ] 일정 CRUD API
- [ ] 반복 일정 API

### 할일
- [ ] 할일 CRUD API
- [ ] 할일 상태 변경 API
- [ ] 할일 완료 토글 API

### 알림
- [ ] 알림 목록 API
- [ ] 알림 읽음 처리 API
- [ ] WebSocket 실시간 알림

### 마이페이지
- [ ] 프로필 조회 API
- [ ] 프로필 수정 API
- [ ] 이미지 업로드 API
- [ ] 계정 삭제 API

---

## 📊 작업 우선순위 요약

### Phase 1: 즉시 필요 (1-2주)
1. **WebSocket 실시간 기능** (3일)
2. **백엔드 API 연동 - 인증** (2일)
3. **백엔드 API 연동 - 스터디 기본** (3일)
4. **파일 업로드/다운로드** (3일)

**예상 시간**: 11일

---

### Phase 2: 중요 기능 (2-3주)
1. **백엔드 API 연동 - 채팅/공지/파일** (5일)
2. **백엔드 API 연동 - 캘린더/할일** (3일)
3. **WebRTC 화상 통화** (7일)
4. **드래그 앤 드롭** (3일)
5. **캘린더 주/일 뷰** (3일)

**예상 시간**: 21일

---

### Phase 3: 개선 및 최적화 (1-2주)
1. **고급 검색** (2일)
2. **알림 설정 상세화** (3일)
3. **마크다운 에디터 고도화** (2일)
4. **프로필 이미지 크롭** (2일)
5. **성능 최적화** (5일)

**예상 시간**: 14일

---

### Phase 4: 관리자 기능 (Post-MVP, 2-3주)
1. **관리자 대시보드** (3일)
2. **사용자 관리** (3일)
3. **스터디 관리** (3일)
4. **신고 관리** (3일)
5. **통계 분석** (5일)
6. **시스템 설정** (3일)

**예상 시간**: 20일

---

## 🎯 총 작업 예상 시간

| Phase | 기간 | 우선순위 |
|-------|------|---------|
| Phase 1 | 11일 (2주) | 🔴 High |
| Phase 2 | 21일 (3주) | 🟡 Medium |
| Phase 3 | 14일 (2주) | 🟢 Low |
| Phase 4 | 20일 (3주) | ⚪ Post-MVP |

**총계**: 66일 (약 3개월)

---

## ✅ 권장 작업 순서

### 1단계: MVP 완성 (Phase 1)
```
Week 1-2: WebSocket + API 기본 연동
→ 채팅, 알림 실시간 동작
→ 로그인, 스터디 CRUD 동작
→ 파일 업로드 동작
```

### 2단계: 고급 기능 (Phase 2)
```
Week 3-5: 전체 API 연동 + WebRTC
→ 모든 기능이 백엔드와 연결됨
→ 화상 통화 실제 동작
→ 드래그 앤 드롭 UX 개선
```

### 3단계: 완성도 향상 (Phase 3)
```
Week 6-7: UX 개선 + 최적화
→ 고급 검색, 알림 설정
→ 마크다운 에디터, 이미지 크롭
→ 성능 최적화
```

### 4단계: 관리자 기능 (Phase 4, 선택)
```
Week 8-10: 관리자 페이지
→ Post-MVP로 미뤄도 됨
→ 사용자 피드백 반영 후 개발
```

---

## 📝 결론

### 현재 상태
- **UI/UX**: 95% 완성 ✅
- **기능성**: 85% 완성 (Mock 데이터)
- **실제 동작**: 10% (백엔드 연동 필요)

### 다음 단계
1. **WebSocket 구현** - 실시간 기능의 핵심
2. **API 연동** - Mock에서 실제 데이터로 전환
3. **파일 업로드** - S3 연동
4. **WebRTC** - 화상 통화 실제 구현

### MVP 출시를 위해 필수
- Phase 1 완료 (2주)
- Phase 2의 API 연동 부분 (1주)

**최소 3주 작업 후 MVP 출시 가능** 🚀

---

**작성일**: 2025-11-17  
**버전**: 1.0  
**상태**: ✅ 분석 완료

