# 채팅 파일 예외 처리

**문서 ID**: CHAT-04  
**작성일**: 2025-11-29  
**카테고리**: 파일 관리  
**우선순위**: 🔶 중간

---

## 📋 목차

1. [파일 업로드 실패](#1-파일-업로드-실패)
2. [업로드 성능](#2-업로드-성능)
3. [미리보기 오류](#3-미리보기-오류)
4. [다운로드 실패](#4-다운로드-실패)

---

## 1. 파일 업로드 실패

### 1.1 용량 제한

#### 증상
```
❌ 413 Payload Too Large
❌ File size exceeds maximum limit
```

#### 해결 방법

**✅ 클라이언트 검증**:
```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ✅ 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    toast.error('파일 크기는 10MB 이하여야 합니다');
    return;
  }

  // 업로드 진행
  setIsUploading(true);
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studyId', studyId);

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      setSelectedFile(data.data);
      toast.success('파일이 업로드되었습니다');
    }
  } catch (error) {
    console.error('Upload failed:', error);
    toast.error('파일 업로드에 실패했습니다');
  } finally {
    setIsUploading(false);
  }
};
```

### 1.2 파일 타입 제한

**✅ 허용된 파일 타입만 업로드**:
```javascript
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ✅ 파일 타입 검증
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error('지원하지 않는 파일 형식입니다');
    return;
  }

  // 업로드...
};
```

---

## 2. 업로드 성능

### 2.1 진행률 표시

**✅ Progress Bar**:
```javascript
const [uploadProgress, setUploadProgress] = useState(0);

const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData
    });

    // 진행률 업데이트 (실제로는 XMLHttpRequest 사용)
    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedLength += value.length;
      const progress = (receivedLength / contentLength) * 100;
      setUploadProgress(Math.round(progress));
    }

    toast.success('업로드 완료');
  } catch (error) {
    console.error('Upload failed:', error);
    toast.error('업로드 실패');
  } finally {
    setUploadProgress(0);
  }
};
```

---

## 3. 미리보기 오류

### 3.1 이미지 미리보기

**✅ 이미지 미리보기 컴포넌트**:
```javascript
export function FilePreview({ file }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (error) {
    return <div>이미지를 불러올 수 없습니다</div>;
  }

  if (file.type.startsWith('image/')) {
    return (
      <img 
        src={imageUrl} 
        alt={file.name}
        onError={() => setError(true)}
        style={{ maxWidth: '200px', maxHeight: '200px' }}
      />
    );
  }

  return <div>📄 {file.name}</div>;
}
```

---

## 4. 다운로드 실패

### 4.1 파일 다운로드

**✅ 안전한 다운로드**:
```javascript
const handleDownload = async (file) => {
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('다운로드 완료');
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('다운로드 실패');
  }
};
```

---

**마지막 업데이트**: 2025-11-29

