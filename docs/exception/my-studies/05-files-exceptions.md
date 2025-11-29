# 파일 관리 예외 처리

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**대상 파일**:
- `src/app/my-studies/[studyId]/files/page.jsx`
- `src/app/api/studies/[id]/files/route.js`

---

## 📚 목차

1. [개요](#개요)
2. [파일 목록 예외](#파일-목록-예외)
3. [파일 업로드 예외](#파일-업로드-예외)
4. [파일 다운로드 예외](#파일-다운로드-예외)
5. [파일 삭제 예외](#파일-삭제-예외)
6. [용량 제한 예외](#용량-제한-예외)
7. [파일 형식 검증](#파일-형식-검증)
8. [S3 연동 예외](#s3-연동-예외)

---

## 개요

### 기능 설명

**파일 관리(Files)**는 스터디 내에서 자료를 **공유하고 관리**하는 기능입니다. 파일 업로드, 다운로드, 삭제를 지원하며 AWS S3를 사용하여 파일을 저장합니다.

### 주요 기능

1. **파일 업로드**: 드래그 앤 드롭, 파일 선택
2. **파일 목록**: 최신순, 이름순, 크기순 정렬
3. **파일 다운로드**: 직접 다운로드
4. **파일 삭제**: 업로더 본인 또는 관리자
5. **검색**: 파일명 검색
6. **필터링**: 파일 형식별

### 제한사항

- **최대 파일 크기**: 10MB
- **허용 형식**: PDF, DOC(X), XLS(X), PPT(X), TXT, 이미지 (JPG, PNG, GIF), ZIP
- **동시 업로드**: 최대 5개

### 권한 구조

| 작업 | MEMBER | ADMIN | OWNER |
|------|--------|-------|-------|
| 목록 조회 | ✅ | ✅ | ✅ |
| 업로드 | ✅ | ✅ | ✅ |
| 다운로드 | ✅ | ✅ | ✅ |
| 삭제 | 본인 파일 | 모두 | 모두 |

---

## 파일 목록 예외

### 1.1 API 호출 실패

```javascript
// ✅ 좋은 예: 완전한 에러 처리
const { 
  data: filesData, 
  isLoading, 
  error, 
  refetch 
} = useStudyFiles(studyId)

const files = filesData?.data || []

if (isLoading) {
  return (
    <div className={styles.container}>
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>파일 목록을 불러오는 중...</p>
      </div>
    </div>
  )
}

if (error) {
  return (
    <div className={styles.error}>
      <div className={styles.errorIcon}>⚠️</div>
      <h3>파일 목록을 불러올 수 없습니다</h3>
      <p>{error.response?.data?.error || '잠시 후 다시 시도해주세요'}</p>
      <button onClick={() => refetch()}>🔄 다시 시도</button>
    </div>
  )
}
```

---

### 1.2 빈 상태 처리

```javascript
// ✅ 좋은 예: 업로드 유도
{files.length === 0 ? (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📁</div>
    <h3>아직 업로드된 파일이 없습니다</h3>
    <p>팀원들과 자료를 공유해보세요</p>
    <div className={styles.uploadGuide}>
      <h4>파일 업로드 방법</h4>
      <ul>
        <li>파일을 드래그 앤 드롭하거나</li>
        <li>업로드 버튼을 클릭하세요</li>
      </ul>
      <p className={styles.limitation}>
        최대 10MB, PDF/문서/이미지 형식 지원
      </p>
    </div>
    <button 
      onClick={() => fileInputRef.current?.click()}
      className={styles.uploadButton}
    >
      + 첫 번째 파일 업로드
    </button>
  </div>
) : (
  <FileList files={files} />
)}
```

---

## 파일 업로드 예외

### 2.1 파일 크기 제한

```javascript
// ✅ 좋은 예: 사전 검증
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const validateFile = (file) => {
  const errors = []

  // 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    errors.push({
      file: file.name,
      error: `파일 크기가 10MB를 초과합니다 (${formatFileSize(file.size)})`
    })
  }

  // 형식 검증
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip'
  ]

  if (!allowedTypes.includes(file.type)) {
    errors.push({
      file: file.name,
      error: `지원하지 않는 파일 형식입니다 (${file.type})`
    })
  }

  // 파일명 길이
  if (file.name.length > 255) {
    errors.push({
      file: file.name,
      error: '파일명이 너무 깁니다 (최대 255자)'
    })
  }

  return errors
}

const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files || [])

  // 최대 5개 제한
  if (selectedFiles.length > 5) {
    alert('한 번에 최대 5개의 파일만 업로드할 수 있습니다')
    return
  }

  // 각 파일 검증
  const allErrors = []
  selectedFiles.forEach(file => {
    const errors = validateFile(file)
    allErrors.push(...errors)
  })

  if (allErrors.length > 0) {
    // 에러 표시
    setUploadErrors(allErrors)
    return
  }

  // 업로드 진행
  uploadFiles(selectedFiles)
}
```

---

### 2.2 드래그 앤 드롭

```javascript
// ✅ 좋은 예: 드래그 앤 드롭 with 검증
const [isDragging, setIsDragging] = useState(false)

const handleDragOver = (e) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragging(true)
}

const handleDragLeave = (e) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragging(false)
}

const handleDrop = (e) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragging(false)

  const droppedFiles = Array.from(e.dataTransfer.files)

  if (droppedFiles.length === 0) {
    return
  }

  if (droppedFiles.length > 5) {
    alert('한 번에 최대 5개의 파일만 업로드할 수 있습니다')
    return
  }

  // 검증 후 업로드
  const allErrors = []
  droppedFiles.forEach(file => {
    const errors = validateFile(file)
    allErrors.push(...errors)
  })

  if (allErrors.length > 0) {
    setUploadErrors(allErrors)
    return
  }

  uploadFiles(droppedFiles)
}

// UI
<div 
  className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
  <div className={styles.dropZoneContent}>
    <div className={styles.uploadIcon}>📤</div>
    <p className={styles.dropZoneText}>
      {isDragging 
        ? '파일을 여기에 놓으세요'
        : '파일을 드래그하거나 클릭하여 업로드'}
    </p>
    <p className={styles.dropZoneHint}>
      최대 10MB, 최대 5개 파일
    </p>
    <input
      ref={fileInputRef}
      type="file"
      multiple
      onChange={handleFileSelect}
      style={{ display: 'none' }}
      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip"
    />
    <button 
      onClick={() => fileInputRef.current?.click()}
      className={styles.uploadButton}
    >
      파일 선택
    </button>
  </div>
</div>

{/* 업로드 에러 표시 */}
{uploadErrors.length > 0 && (
  <div className={styles.uploadErrors}>
    <h4>업로드 실패</h4>
    <ul>
      {uploadErrors.map((err, idx) => (
        <li key={idx}>
          <strong>{err.file}</strong>: {err.error}
        </li>
      ))}
    </ul>
    <button onClick={() => setUploadErrors([])}>확인</button>
  </div>
)}
```

---

### 2.3 업로드 진행 상태

```javascript
// ✅ 좋은 예: 진행률 표시
const [uploadProgress, setUploadProgress] = useState({})

const uploadFiles = async (files) => {
  const uploads = files.map(async (file) => {
    try {
      // FormData 생성
      const formData = new FormData()
      formData.append('file', file)

      // Axios with progress
      const response = await api.post(`/studies/${studyId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }))
        }
      })

      return { success: true, file: file.name, data: response.data }

    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error)
      return {
        success: false,
        file: file.name,
        error: error.response?.data?.error || '업로드 실패'
      }
    }
  })

  const results = await Promise.allSettled(uploads)

  // 결과 처리
  const successful = results.filter(r => r.value?.success).length
  const failed = results.filter(r => !r.value?.success).length

  if (failed > 0) {
    alert(`${successful}개 업로드 성공, ${failed}개 실패`)
  } else {
    alert(`${successful}개 파일이 업로드되었습니다`)
  }

  // 진행 상태 초기화
  setUploadProgress({})

  // 목록 새로고침
  queryClient.invalidateQueries(['studyFiles', studyId])
}

// 진행률 UI
{Object.keys(uploadProgress).length > 0 && (
  <div className={styles.uploadProgressPanel}>
    <h4>업로드 중...</h4>
    {Object.entries(uploadProgress).map(([filename, progress]) => (
      <div key={filename} className={styles.progressItem}>
        <span className={styles.filename}>{filename}</span>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.progressPercent}>{progress}%</span>
      </div>
    ))}
  </div>
)}
```

---

## 파일 다운로드 예외

### 3.1 다운로드 처리

```javascript
// ✅ 좋은 예: Blob 다운로드
const handleDownload = async (fileId, filename) => {
  try {
    const response = await api.get(`/studies/${studyId}/files/${fileId}/download`, {
      responseType: 'blob'
    })

    // Blob 생성
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)

    // 다운로드 링크 생성
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // 정리
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

  } catch (error) {
    console.error('Download failed:', error)
    
    if (error.response?.status === 404) {
      alert('파일을 찾을 수 없습니다')
    } else if (error.response?.status === 403) {
      alert('다운로드 권한이 없습니다')
    } else {
      alert('파일 다운로드에 실패했습니다')
    }
  }
}
```

---

### 3.2 S3 Presigned URL

```javascript
// src/app/api/studies/[id]/files/[fileId]/download/route.js
export async function GET(request, { params }) {
  const { id: studyId, fileId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId, studyId }
    })

    if (!file) {
      return NextResponse.json(
        { error: "파일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // S3 Presigned URL 생성 (15분 유효)
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })

    const presignedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: file.s3Key,
      Expires: 900, // 15분
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`
    })

    // 다운로드 카운트 증가
    await prisma.file.update({
      where: { id: fileId },
      data: { downloadCount: { increment: 1 } }
    })

    return NextResponse.redirect(presignedUrl)

  } catch (error) {
    console.error('Get download URL error:', error)
    return NextResponse.json(
      { error: "다운로드 URL 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

## 파일 삭제 예외

### 4.1 권한 및 확인

```javascript
// ✅ 좋은 예: 삭제 전 확인
const handleDelete = async (file) => {
  // 권한 체크
  const canDelete = 
    study.myRole === 'OWNER' ||
    study.myRole === 'ADMIN' ||
    file.uploaderId === currentUser.id

  if (!canDelete) {
    alert('삭제 권한이 없습니다\n본인이 업로드한 파일만 삭제할 수 있습니다')
    return
  }

  // 확인
  const confirmed = confirm(
    `"${file.name}" 파일을 삭제하시겠습니까?\n\n` +
    `크기: ${formatFileSize(file.size)}\n` +
    `업로드: ${formatDateTimeKST(file.createdAt)}\n\n` +
    `이 작업은 되돌릴 수 없습니다.`
  )

  if (!confirmed) return

  try {
    await deleteFileMutation.mutateAsync({ studyId, fileId: file.id })
    alert('파일이 삭제되었습니다')
  } catch (error) {
    console.error('Delete failed:', error)
    alert(error.response?.data?.error || '파일 삭제에 실패했습니다')
  }
}
```

---

### 4.2 S3 파일 삭제

```javascript
// src/app/api/studies/[id]/files/[fileId]/route.js
export async function DELETE(request, { params }) {
  const { id: studyId, fileId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId, studyId }
    })

    if (!file) {
      return NextResponse.json(
        { error: "파일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 권한 확인
    const canDelete =
      member.role === 'OWNER' ||
      member.role === 'ADMIN' ||
      file.uploaderId === session.user.id

    if (!canDelete) {
      return NextResponse.json(
        { error: "삭제 권한이 없습니다" },
        { status: 403 }
      )
    }

    // S3에서 파일 삭제
    try {
      const s3 = new AWS.S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      })

      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: file.s3Key
      }).promise()

    } catch (s3Error) {
      console.error('S3 delete error:', s3Error)
      // S3 삭제 실패해도 DB 레코드는 삭제 진행
    }

    // DB에서 파일 레코드 삭제
    await prisma.file.delete({
      where: { id: fileId }
    })

    return NextResponse.json({
      success: true,
      message: "파일이 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      { error: "파일 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

## 용량 제한 예외

### 5.1 스터디별 총 용량 제한

```javascript
// ✅ 좋은 예: 스터디 용량 확인
const MAX_STUDY_STORAGE = 1024 * 1024 * 1024 // 1GB

export async function POST(request, { params }) {
  const { id: studyId } = await params
  
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    // 현재 스터디의 총 파일 용량 계산
    const totalSize = await prisma.file.aggregate({
      where: { studyId },
      _sum: { size: true }
    })

    const currentUsage = totalSize._sum.size || 0

    // 업로드할 파일 크기
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다" },
        { status: 400 }
      )
    }

    // 용량 초과 체크
    if (currentUsage + file.size > MAX_STUDY_STORAGE) {
      const remaining = MAX_STUDY_STORAGE - currentUsage
      return NextResponse.json(
        { 
          error: "스터디 저장 공간이 부족합니다",
          currentUsage: formatFileSize(currentUsage),
          maxStorage: formatFileSize(MAX_STUDY_STORAGE),
          remaining: formatFileSize(remaining),
          fileSize: formatFileSize(file.size)
        },
        { status: 413 } // Payload Too Large
      )
    }

    // S3 업로드 및 DB 저장
    // ...

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

## 파일 형식 검증

### 6.1 MIME 타입 및 확장자 검증

```javascript
// ✅ 좋은 예: 이중 검증
const validateFileType = (file) => {
  const allowedMimeTypes = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/plain': ['.txt'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'application/zip': ['.zip']
  }

  // MIME 타입 검증
  if (!Object.keys(allowedMimeTypes).includes(file.type)) {
    return {
      valid: false,
      error: `지원하지 않는 파일 형식입니다: ${file.type}`
    }
  }

  // 확장자 검증
  const extension = `.${file.name.split('.').pop().toLowerCase()}`
  const allowedExtensions = allowedMimeTypes[file.type]

  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `파일 확장자와 형식이 일치하지 않습니다`
    }
  }

  return { valid: true }
}
```

---

## S3 연동 예외

### 7.1 S3 업로드

```javascript
// ✅ 좋은 예: S3 업로드 with 에러 처리
async function uploadToS3(file, studyId, userId) {
  const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })

  // 고유 키 생성
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(7)
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const s3Key = `studies/${studyId}/${timestamp}-${randomStr}-${sanitizedFilename}`

  try {
    // 파일 버퍼 읽기
    const buffer = Buffer.from(await file.arrayBuffer())

    // S3 업로드
    const uploadResult = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedBy: userId,
        studyId: studyId
      }
    }).promise()

    return {
      success: true,
      s3Key,
      location: uploadResult.Location,
      etag: uploadResult.ETag
    }

  } catch (s3Error) {
    console.error('S3 upload error:', s3Error)
    
    if (s3Error.code === 'NetworkingError') {
      throw new Error('네트워크 오류: S3에 연결할 수 없습니다')
    } else if (s3Error.code === 'InvalidAccessKeyId') {
      throw new Error('S3 인증 오류: 관리자에게 문의하세요')
    } else if (s3Error.code === 'NoSuchBucket') {
      throw new Error('S3 버킷을 찾을 수 없습니다')
    } else {
      throw new Error(`S3 업로드 실패: ${s3Error.message}`)
    }
  }
}
```

---

## 관련 문서

- [04-tasks-exceptions.md](./04-tasks-exceptions.md) - 할일 관리 예외
- [06-calendar-exceptions.md](./06-calendar-exceptions.md) - 캘린더 예외
- [../studies/06-file-upload-exceptions.md](../studies/06-file-upload-exceptions.md) - 파일 업로드 공통

---

**다음 문서**: [06-calendar-exceptions.md](./06-calendar-exceptions.md)  
**이전 문서**: [04-tasks-exceptions.md](./04-tasks-exceptions.md)

