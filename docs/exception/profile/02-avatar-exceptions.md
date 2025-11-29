# 아바타 업로드 예외 처리

**작성일**: 2025-11-29  
**카테고리**: Profile Management - Avatar Upload  
**난이도**: ⭐⭐⭐ (중급)

---

## 📋 목차

1. [개요](#개요)
2. [파일 업로드 예외](#파일-업로드-예외)
3. [이미지 처리 예외](#이미지-처리-예외)
4. [표시 및 캐싱 예외](#표시-및-캐싱-예외)
5. [모범 사례](#모범-사례)

---

## 개요

아바타 업로드는 사용자가 프로필 이미지를 설정하는 기능입니다. 파일 검증, 업로드, 이미지 처리, 저장 등 여러 단계에서 예외가 발생할 수 있습니다.

### 주요 시나리오

1. **파일 선택 및 검증**: 크기, 형식, 타입 확인
2. **이미지 업로드**: 서버로 파일 전송
3. **이미지 처리**: 리사이징, 크롭, 최적화
4. **저장 및 표시**: DB 저장, URL 반환, 표시

---

## 파일 업로드 예외

### 1.1 파일 크기 초과

#### 증상
- "파일 크기가 너무 큽니다" 에러
- 413 Payload Too Large 응답
- 업로드 진행 중 실패

#### 원인
- 5MB 초과 파일
- 서버 설정 제한
- 네트워크 타임아웃

#### 해결 방법

**클라이언트 검증**:
```javascript
// src/components/my-page/AvatarUpload.jsx
'use client'

import { useState, useRef } from 'react'
import toast from 'react-hot-toast'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function AvatarUpload({ currentAvatar, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentAvatar)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    // 파일 크기 확인
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`파일 크기는 ${MAX_FILE_SIZE / (1024 * 1024)}MB 이하여야 합니다`)
      return false
    }

    // 파일 형식 확인
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('JPG, PNG, GIF, WebP 형식만 지원합니다')
      return false
    }

    return true
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 검증
    if (!validateFile(file)) {
      e.target.value = '' // input 초기화
      return
    }

    try {
      setUploading(true)

      // 미리보기 생성
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target.result)
      }
      reader.readAsDataURL(file)

      // 업로드
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '업로드 실패')
      }

      const data = await response.json()
      
      toast.success('아바타가 업로드되었습니다! 🎉')
      onUploadSuccess(data.url)

    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error(error.message || '아바타 업로드에 실패했습니다')
      
      // 미리보기 복원
      setPreview(currentAvatar)
      
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        {preview ? (
          <img src={preview} alt="Avatar preview" />
        ) : (
          <div className="avatar-placeholder">
            <span>👤</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="upload-button"
      >
        {uploading ? '업로드 중...' : '사진 변경'}
      </button>

      <p className="upload-hint">
        JPG, PNG, GIF, WebP (최대 5MB)
      </p>
    </div>
  )
}
```

**서버 검증 (Next.js API Route)**:
```javascript
// src/app/api/upload/avatar/route.js
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const formData = await request.formData()
    const file = formData.get('avatar')

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다' },
        { status: 400 }
      )
    }

    // 파일 크기 확인
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `파일 크기는 ${MAX_FILE_SIZE / (1024 * 1024)}MB 이하여야 합니다` },
        { status: 413 }
      )
    }

    // 파일 형식 확인
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다' },
        { status: 400 }
      )
    }

    // 파일 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const fileName = `${session.user.id}-${Date.now()}.${file.type.split('/')[1]}`
    const filePath = join(uploadsDir, fileName)

    await writeFile(filePath, buffer)

    const url = `/uploads/avatars/${fileName}`

    // DB에 아바타 URL 저장
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: url }
    })

    return NextResponse.json({
      success: true,
      url,
      message: '아바타가 업로드되었습니다'
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: '아바타 업로드 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// Next.js API Route 설정
export const config = {
  api: {
    bodyParser: false, // FormData를 위해 비활성화
  },
}
```

---

### 1.2 파일 형식 오류

#### 증상
- "지원하지 않는 파일 형식입니다" 에러
- 이미지가 표시되지 않음
- 400 Bad Request

#### 해결 방법

**MIME 타입 검증**:
```javascript
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
]

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

const validateFileType = (file) => {
  // MIME 타입 확인
  if (!ALLOWED_TYPES.includes(file.type)) {
    return '지원하지 않는 파일 형식입니다'
  }

  // 확장자 확인
  const extension = file.name.toLowerCase().split('.').pop()
  if (!ALLOWED_EXTENSIONS.some(ext => ext === `.${extension}`)) {
    return '지원하지 않는 파일 확장자입니다'
  }

  return null
}
```

---

### 1.3 업로드 실패

#### 증상
- 네트워크 오류
- 서버 응답 없음
- 타임아웃

#### 해결 방법

**재시도 로직**:
```javascript
const uploadWithRetry = async (file, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30초

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error)

      if (attempt === maxRetries) {
        throw new Error('업로드에 실패했습니다. 네트워크를 확인해주세요.')
      }

      // 지수 백오프
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
}
```

---

## 이미지 처리 예외

### 2.1 이미지 크롭

#### 구현 (react-easy-crop 사용)

```javascript
// src/components/my-page/AvatarCrop.jsx
'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '@/lib/cropImage'

export default function AvatarCrop({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropChange = (crop) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom) => {
    setZoom(zoom)
  }

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      onCropComplete(croppedImage)
    } catch (error) {
      console.error('Crop error:', error)
      toast.error('이미지 크롭에 실패했습니다')
    }
  }

  return (
    <div className="crop-container">
      <div className="crop-area">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteCallback}
        />
      </div>

      <div className="crop-controls">
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </div>

      <div className="crop-actions">
        <button onClick={onCancel}>취소</button>
        <button onClick={handleSave}>저장</button>
      </div>
    </div>
  )
}
```

**크롭 유틸리티**:
```javascript
// src/lib/cropImage.js
export const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/jpeg', 0.95)
  })
}

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
```

---

### 2.2 이미지 리사이징

**Sharp 라이브러리 사용 (서버)**:
```javascript
// src/app/api/upload/avatar/route.js
import sharp from 'sharp'

export async function POST(request) {
  // ... 파일 검증 ...

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 이미지 처리
    const processedBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    // 파일 저장
    const fileName = `${session.user.id}-${Date.now()}.jpg`
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, processedBuffer)

    // 썸네일 생성
    const thumbnailBuffer = await sharp(buffer)
      .resize(100, 100, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer()

    const thumbnailFileName = `${session.user.id}-${Date.now()}-thumb.jpg`
    const thumbnailPath = join(uploadsDir, thumbnailFileName)
    await writeFile(thumbnailPath, thumbnailBuffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/avatars/${fileName}`,
      thumbnail: `/uploads/avatars/${thumbnailFileName}`
    })

  } catch (error) {
    console.error('Image processing error:', error)
    return NextResponse.json(
      { error: '이미지 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
```

---

## 표시 및 캐싱 예외

### 3.1 아바타 표시 실패

#### 증상
- 깨진 이미지 아이콘
- 404 Not Found
- CORS 오류

#### 해결 방법

**폴백 처리**:
```javascript
// src/components/Avatar.jsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Avatar({ src, alt, size = 40, className = '' }) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleError = () => {
    console.error('Avatar load error:', src)
    setError(true)
    setLoading(false)
  }

  const handleLoad = () => {
    setLoading(false)
  }

  // 폴백 이미지
  if (error || !src) {
    return (
      <div 
        className={`avatar-fallback ${className}`}
        style={{ width: size, height: size }}
      >
        <span>👤</span>
      </div>
    )
  }

  return (
    <div className={`avatar-container ${className}`}>
      {loading && <div className="avatar-skeleton" />}
      <Image
        src={src}
        alt={alt || 'User avatar'}
        width={size}
        height={size}
        onError={handleError}
        onLoad={handleLoad}
        className={loading ? 'hidden' : ''}
        priority={size > 100}
      />
    </div>
  )
}
```

---

### 3.2 캐시 무효화

#### 아바타 업데이트 후 캐시 클리어

```javascript
// src/lib/hooks/useApi.js
export function useUpdateAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (avatarUrl) => {
      const response = await api.patch('/api/users/me', {
        avatar: avatarUrl
      })
      return response.data
    },

    onSuccess: (data) => {
      // 사용자 데이터 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })

      // Next.js 이미지 캐시 무효화 (쿼리 파라미터 추가)
      const timestamp = Date.now()
      queryClient.setQueryData(['users', 'me'], (old) => ({
        ...old,
        user: {
          ...old.user,
          avatar: `${data.user.avatar}?t=${timestamp}`
        }
      }))
    }
  })
}
```

---

## 모범 사례

### 1. 프로그레스 바

```javascript
const [uploadProgress, setUploadProgress] = useState(0)

const handleUpload = async (file) => {
  const xhr = new XMLHttpRequest()

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const progress = (e.loaded / e.total) * 100
      setUploadProgress(progress)
    }
  })

  xhr.addEventListener('load', () => {
    if (xhr.status === 200) {
      toast.success('업로드 완료!')
      setUploadProgress(0)
    }
  })

  const formData = new FormData()
  formData.append('avatar', file)

  xhr.open('POST', '/api/upload/avatar')
  xhr.send(formData)
}
```

### 2. 드래그 앤 드롭

```javascript
const [isDragging, setIsDragging] = useState(false)

const handleDragOver = (e) => {
  e.preventDefault()
  setIsDragging(true)
}

const handleDragLeave = () => {
  setIsDragging(false)
}

const handleDrop = (e) => {
  e.preventDefault()
  setIsDragging(false)

  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFileUpload(files[0])
  }
}

return (
  <div
    className={`drop-zone ${isDragging ? 'dragging' : ''}`}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
  >
    드래그하여 업로드
  </div>
)
```

### 3. 테스트

```javascript
// __tests__/avatar-upload.test.js
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AvatarUpload from '@/components/my-page/AvatarUpload'

describe('AvatarUpload', () => {
  it('should reject large files', async () => {
    render(<AvatarUpload />)

    const file = new File(['a'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg'
    })

    const input = screen.getByLabelText(/사진 변경/)
    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/파일 크기/)).toBeInTheDocument()
    })
  })
})
```

---

## 관련 문서

- **[프로필 개요](./README.md)**
- **[프로필 수정](./01-profile-edit-exceptions.md)**
- **[모범 사례](./99-best-practices.md)**

---

**다음 문서**: [계정 삭제 (03-account-deletion-exceptions.md)](./03-account-deletion-exceptions.md)  
**이전 문서**: [프로필 수정 (01-profile-edit-exceptions.md)](./01-profile-edit-exceptions.md)

