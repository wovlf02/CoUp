# 내 스터디 탭 기능 구현 (1단계: 채팅 및 파일 전송)

## 📋 수정 일자
2025-01-21

## 🎯 구현 목표
내 스터디의 각 탭을 완벽하게 구현
- ✅ 채팅 탭: 실시간 채팅 및 파일 전송
- ⏳ 파일 탭: 파일 업로드 및 다운로드
- ⏳ 캘린더 탭: 일정 관리
- ⏳ 화상 탭: 채팅 기능

## ✅ 1단계: 채팅 탭 완성

### 구현된 기능:

#### 1. **실시간 채팅 (Socket.io)**
```javascript
// Socket.io 연결
const { socket, isConnected } = useSocket();

// 스터디 채팅방 입장
socket.emit('study:join', { studyId });

// 실시간 메시지 수신
socket.on('study:message', handleNewMessage);

// 메시지 전송
socket.emit('study:message', { studyId, message });
```

**기능:**
- ✅ 실시간 메시지 송수신
- ✅ 낙관적 업데이트 (즉시 화면에 표시)
- ✅ 타이핑 인디케이터
- ✅ 자동 스크롤

#### 2. **타이핑 인디케이터**
```javascript
// 타이핑 이벤트 전송
const handleTyping = () => {
  socket.emit('study:typing', {
    studyId,
    userId: currentUser.id,
    userName: currentUser.name
  });
};

// 타이핑 이벤트 수신
socket.on('study:typing', ({ userId, userName }) => {
  setTypingUsers(prev => [...prev, userName]);
  
  // 3초 후 제거
  setTimeout(() => {
    setTypingUsers(prev => prev.filter(name => name !== userName));
  }, 3000);
});
```

**화면 표시:**
```
{typingUsers.length > 0 && (
  <div className={styles.typingIndicator}>
    <div className={styles.typingDots}>...</div>
    <span>{typingUsers[0]}님이 입력 중...</span>
  </div>
)}
```

#### 3. **파일 업로드 및 전송**
```javascript
// 파일 선택
const handleFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (file.size > 50 * 1024 * 1024) {
    alert('파일 크기는 50MB를 초과할 수 없습니다.');
    return;
  }
  setSelectedFile(file);
};

// 파일 업로드
const handleSendFile = async () => {
  const formData = new FormData();
  formData.append('file', selectedFile);
  
  const response = await fetch(`/api/studies/${studyId}/files`, {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  
  // Socket.io로 파일 메시지 전송
  socket.emit('study:message', {
    studyId,
    message: {
      content: `파일: ${selectedFile.name}`,
      fileUrl: result.data.url,
      fileName: selectedFile.name,
      fileSize: selectedFile.size
    }
  });
};
```

**UI:**
```
[파일 미리보기]
📎 example.pdf (2.5 MB)
[전송] [취소]

[입력창]
📎 [메시지 입력] [전송]
```

#### 4. **파일 크기 제한**
- 최대 50MB
- 초과 시 경고 메시지

#### 5. **파일 미리보기**
```javascript
{selectedFile && (
  <div className={styles.filePreview}>
    <div className={styles.filePreviewInfo}>
      <span className={styles.fileIcon}>📎</span>
      <div>
        <div className={styles.fileName}>{selectedFile.name}</div>
        <div className={styles.fileSize}>{formatFileSize(selectedFile.size)}</div>
      </div>
    </div>
    <div className={styles.fileActions}>
      <button onClick={handleSendFile}>전송</button>
      <button onClick={handleCancelFile}>취소</button>
    </div>
  </div>
)}
```

### 수정된 파일:
1. **`chat/page.jsx`**
   - Socket.io 연결 및 이벤트 리스너
   - 실시간 메시지 수신
   - 파일 업로드 및 전송
   - 타이핑 인디케이터
   
2. **`chat/page.module.css`**
   - 파일 미리보기 스타일
   - 입력 래퍼 스타일

### 주요 변경사항:

#### Before:
- 정적 메시지만 표시
- 파일 전송 불가
- 실시간 업데이트 없음

#### After:
- ✅ 실시간 메시지 송수신
- ✅ 파일 업로드 및 전송
- ✅ 타이핑 인디케이터
- ✅ 낙관적 업데이트
- ✅ 자동 스크롤

## 🎨 UI/UX 개선

### 채팅 화면:
```
┌─────────────────────────────────────┐
│ 💬 채팅                    🔍 검색  │
├─────────────────────────────────────┤
│                                     │
│  [다른 사람]                        │
│  안녕하세요! 👋                     │
│  12:30 PM                           │
│                                     │
│                      [나]           │
│                      반가워요!      │
│                      12:31 PM  ✓   │
│                                     │
│  [다른 사람]                        │
│  📎 example.pdf (2.5 MB)           │
│  [다운로드]                         │
│  12:32 PM                           │
│                                     │
│  💬 홍길동님이 입력 중...          │
│                                     │
├─────────────────────────────────────┤
│ [파일 미리보기]                     │
│ 📎 example.pdf (2.5 MB)            │
│ [전송] [취소]                       │
├─────────────────────────────────────┤
│ 📎 [메시지 입력...        ] [전송] │
└─────────────────────────────────────┘
```

### 파일 첨부 흐름:
```
1. 📎 버튼 클릭
2. 파일 선택
3. 미리보기 표시
4. [전송] 버튼으로 업로드
5. 채팅에 파일 메시지 표시
6. [다운로드] 버튼으로 다운로드
```

## 🔧 기술적 세부사항

### Socket.io 이벤트:
```javascript
// 송신
socket.emit('study:join', { studyId });
socket.emit('study:leave', { studyId });
socket.emit('study:message', { studyId, message });
socket.emit('study:typing', { studyId, userId, userName });

// 수신
socket.on('study:message', handleNewMessage);
socket.on('study:typing', handleTyping);
```

### 메시지 상태 관리:
```javascript
// API로 가져온 메시지
const messages = messagesData?.messages || [];

// 실시간 메시지
const [realtimeMessages, setRealtimeMessages] = useState([]);

// 합친 메시지
const allMessages = [...messages, ...realtimeMessages];
```

### 낙관적 업데이트:
```javascript
// 1. 임시 메시지 즉시 표시
const tempId = `temp-${Date.now()}`;
setRealtimeMessages(prev => [...prev, optimisticMessage]);

// 2. API로 저장
const result = await sendMessageMutation.mutateAsync({ ... });

// 3. Socket.io로 전송
socket.emit('study:message', { studyId, message: result.data });

// 4. 임시 메시지 제거
setRealtimeMessages(prev => prev.filter(m => m.id !== tempId));
```

## 📊 성능 최적화

### 1. 메시지 중복 방지
```javascript
// 자신이 보낸 메시지는 이미 낙관적 업데이트로 표시했으므로 무시
if (message.senderId === currentUser.id) return;
```

### 2. 타이핑 인디케이터 디바운싱
```javascript
// 3초 후 자동으로 제거
setTimeout(() => {
  setTypingUsers(prev => prev.filter(name => name !== userName));
}, 3000);
```

### 3. 자동 스크롤
```javascript
useEffect(() => {
  scrollToBottom();
}, [allMessages]);
```

## 🎉 결과

이제 채팅 탭에서:
- ✅ **실시간 채팅** - Socket.io로 즉시 메시지 송수신
- ✅ **파일 전송** - 최대 50MB 파일 업로드 및 다운로드
- ✅ **타이핑 인디케이터** - 상대방이 입력 중일 때 표시
- ✅ **낙관적 업데이트** - 즉시 화면에 반영
- ✅ **자동 스크롤** - 새 메시지 시 자동으로 스크롤
- ✅ **파일 미리보기** - 전송 전 파일 정보 확인

## 🔄 다음 단계

### 2단계: 파일 탭 (계획)
- [ ] 파일 목록 표시
- [ ] 파일 업로드
- [ ] 파일 다운로드
- [ ] 파일 삭제
- [ ] 파일 검색

### 3단계: 캘린더 탭 (계획)
- [ ] 월간 달력 표시
- [ ] 일정 생성
- [ ] 일정 수정
- [ ] 일정 삭제
- [ ] 일정 알림

### 4단계: 화상 탭 채팅 (계획)
- [ ] 화상 회의 중 채팅
- [ ] 파일 전송
- [ ] 채팅 이력 표시

브라우저를 새로고침하면 완성된 채팅 기능을 확인할 수 있습니다! 🎉

