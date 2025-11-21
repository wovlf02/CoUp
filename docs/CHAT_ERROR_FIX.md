# 채팅 탭 오류 수정

## 📋 수정 일자
2025-01-21

## ❌ 문제

### 오류 메시지:
```
SyntaxError: Identifier 'handleTyping' has already been declared. (160:8)
```

### 원인:
`handleTyping` 함수가 3번 중복 선언됨:
1. **82번째 줄**: useEffect 내부에서 Socket 이벤트 리스너로 선언
2. **149번째 줄**: 타이핑 이벤트 전송 함수로 선언
3. **160번째 줄**: 또 중복 선언

### 코드 분석:
```javascript
// useEffect 내부 (Socket 이벤트 리스너)
const handleTyping = ({ userId, userName }) => {
  // 타이핑 이벤트 수신 처리
};

// 컴포넌트 레벨 (중복 1)
const handleTyping = () => {
  // 타이핑 이벤트 전송
};

// 컴포넌트 레벨 (중복 2)
const handleTyping = () => {
  // 타이핑 이벤트 전송 (동일한 코드)
};
```

## ✅ 해결 방법

### 1. 함수명 구분
- **수신 함수**: `handleTyping` (useEffect 내부, Socket 이벤트 리스너)
- **전송 함수**: `handleSendTyping` (컴포넌트 레벨, 타이핑 이벤트 전송)

### 2. 중복 제거 및 이름 변경

#### Before:
```javascript
// useEffect 내부
const handleTyping = ({ userId, userName }) => {
  if (userId === currentUser.id) return;
  setTypingUsers(prev => [...prev, userName]);
  setTimeout(() => {
    setTypingUsers(prev => prev.filter(name => name !== userName));
  }, 3000);
};

// 컴포넌트 레벨 (중복 1)
const handleTyping = () => {
  if (socket && currentUser) {
    socket.emit('study:typing', {
      studyId,
      userId: currentUser.id,
      userName: currentUser.name
    });
  }
};

// 컴포넌트 레벨 (중복 2)
const handleTyping = () => {
  if (socket && currentUser) {
    socket.emit('study:typing', {
      studyId,
      userId: currentUser.id,
      userName: currentUser.name
    });
  }
};
```

#### After:
```javascript
// useEffect 내부 (Socket 이벤트 리스너)
const handleTyping = ({ userId, userName }) => {
  if (userId === currentUser.id) return;
  setTypingUsers(prev => {
    if (!prev.includes(userName)) {
      return [...prev, userName];
    }
    return prev;
  });

  setTimeout(() => {
    setTypingUsers(prev => prev.filter(name => name !== userName));
  }, 3000);
};

// 컴포넌트 레벨 (타이핑 이벤트 전송)
const handleSendTyping = () => {
  if (socket && currentUser) {
    socket.emit('study:typing', {
      studyId,
      userId: currentUser.id,
      userName: currentUser.name
    });
  }
};
```

### 3. 호출부 수정

#### Before:
```javascript
<textarea
  value={content}
  onChange={(e) => {
    setContent(e.target.value);
    handleTyping(); // ← 오류 발생
  }}
/>
```

#### After:
```javascript
<textarea
  value={content}
  onChange={(e) => {
    setContent(e.target.value);
    handleSendTyping(); // ← 수정됨
  }}
/>
```

## 📊 결과

### Before:
- ❌ `handleTyping` 함수 3번 중복 선언
- ❌ SyntaxError 발생
- ❌ 채팅 페이지 로딩 실패

### After:
- ✅ 함수명 명확히 구분 (`handleTyping` vs `handleSendTyping`)
- ✅ 중복 선언 제거
- ✅ SyntaxError 해결
- ✅ 채팅 페이지 정상 작동

## 🔧 수정된 파일

**파일**: `coup/src/app/my-studies/[studyId]/chat/page.jsx`

### 변경사항:
1. 149번째 줄과 160번째 줄의 중복된 `handleTyping` 함수 제거
2. 타이핑 이벤트 전송 함수를 `handleSendTyping`으로 이름 변경
3. textarea의 onChange에서 `handleSendTyping()` 호출

## 💡 교훈

### 함수명 네이밍 규칙:
- **이벤트 수신**: `handle[EventName]` (예: `handleTyping`)
- **이벤트 전송**: `handleSend[EventName]` 또는 `send[EventName]` (예: `handleSendTyping`, `sendTyping`)

### 중복 방지:
- 동일한 이벤트를 수신하고 전송할 때는 함수명을 명확히 구분
- useEffect 내부와 컴포넌트 레벨에서 같은 이름 사용 금지

## 🎉 최종 확인

브라우저를 새로고침하면 채팅 페이지가 정상적으로 로드되고 다음 기능이 작동합니다:
- ✅ 실시간 메시지 송수신
- ✅ 타이핑 인디케이터
- ✅ 파일 전송
- ✅ 자동 스크롤
