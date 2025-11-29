# 설정 관리 예외 처리

**작성일**: 2025-11-29  
**카테고리**: 스터디 관리  
**우선순위**: 🟡 중간

---

## 📋 목차

- [개요](#개요)
- [기본 정보 수정](#기본-정보-수정)
- [공개/비공개 전환](#공개비공개-전환)
- [모집 상태 변경](#모집-상태-변경)
- [이미지 업로드 실패](#이미지-업로드-실패)
- [카테고리 변경](#카테고리-변경)
- [태그 관리](#태그-관리)

---

## 개요

스터디 설정 변경 시 발생하는 예외 상황을 다룹니다.

### 관련 파일
- **API**: `src/app/api/studies/[id]/route.js` (PATCH)
- **API**: `src/app/api/studies/[id]/settings/route.js`
- **페이지**: `src/app/studies/[id]/settings/page.jsx`

---

## 기본 정보 수정

### ✅ 설정 업데이트 API

```javascript
// src/app/api/studies/[id]/settings/route.js
export async function PATCH(request, { params }) {
  const { id: studyId } = await params
  
  const result = await requireStudyMember(studyId, 'OWNER')
  if (result instanceof NextResponse) return result

  try {
    const body = await request.json()
    const updateData = {}

    // 이름
    if (body.name !== undefined) {
      if (body.name.trim().length < 2 || body.name.trim().length > 50) {
        return NextResponse.json(
          { error: "스터디 이름은 2자 이상 50자 이하여야 합니다" },
          { status: 400 }
        )
      }
      updateData.name = body.name.trim()
    }

    // 설명
    if (body.description !== undefined) {
      if (body.description.trim().length < 10 || body.description.trim().length > 500) {
        return NextResponse.json(
          { error: "스터디 설명은 10자 이상 500자 이하여야 합니다" },
          { status: 400 }
        )
      }
      updateData.description = body.description.trim()
    }

    // 이모지
    if (body.emoji !== undefined) {
      updateData.emoji = body.emoji
    }

    // 최대 인원 (현재 인원보다 적게 설정 불가)
    if (body.maxMembers !== undefined) {
      const currentMembers = await prisma.studyMember.count({
        where: { studyId, status: 'ACTIVE' }
      })
      
      if (body.maxMembers < currentMembers) {
        return NextResponse.json(
          { error: `현재 멤버 수(${currentMembers}명)보다 적게 설정할 수 없습니다` },
          { status: 400 }
        )
      }
      
      if (body.maxMembers < 2 || body.maxMembers > 100) {
        return NextResponse.json(
          { error: "최대 인원은 2명에서 100명 사이여야 합니다" },
          { status: 400 }
        )
      }
      
      updateData.maxMembers = body.maxMembers
    }

    // 공개/비공개
    if (body.isPublic !== undefined) {
      updateData.isPublic = body.isPublic
    }

    // 모집 상태
    if (body.isRecruiting !== undefined) {
      updateData.isRecruiting = body.isRecruiting
    }

    // 자동 승인
    if (body.autoApprove !== undefined) {
      updateData.autoApprove = body.autoApprove
    }

    // 카테고리
    if (body.category !== undefined) {
      const validCategories = [
        '프로그래밍', '어학', '자격증', '취미', '독서', '재테크', '기타'
      ]
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: "유효하지 않은 카테고리입니다" },
          { status: 400 }
        )
      }
      updateData.category = body.category
    }

    // 서브 카테고리
    if (body.subCategory !== undefined) {
      updateData.subCategory = body.subCategory
    }

    // 태그
    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return NextResponse.json(
          { error: "태그는 배열이어야 합니다" },
          { status: 400 }
        )
      }
      if (body.tags.length > 10) {
        return NextResponse.json(
          { error: "태그는 최대 10개까지 가능합니다" },
          { status: 400 }
        )
      }
      updateData.tags = body.tags
    }

    // 변경사항 없음
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        message: "변경사항이 없습니다"
      })
    }

    // 업데이트
    const updated = await prisma.study.update({
      where: { id: studyId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "설정이 저장되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: "설정 저장 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

## 공개/비공개 전환

### 주의사항

```javascript
// 비공개로 전환 시 고려사항
if (body.isPublic === false) {
  // 1. 가입 요청 중인 사람들에게 알림
  const pendingRequests = await prisma.studyMember.findMany({
    where: { studyId, status: 'PENDING' },
    select: { userId: true }
  })

  await Promise.all(
    pendingRequests.map(req =>
      prisma.notification.create({
        data: {
          userId: req.userId,
          type: 'STUDY_PRIVATE',
          studyId,
          message: '스터디가 비공개로 전환되었습니다'
        }
      })
    )
  )

  // 2. 가입 요청 자동 거절 (선택)
  // await prisma.studyMember.deleteMany({
  //   where: { studyId, status: 'PENDING' }
  // })
}
```

---

## 모집 상태 변경

### ✅ 모집 중단 처리

```javascript
// 모집 중단 시
if (body.isRecruiting === false) {
  // 1. 대기 중인 가입 요청 처리
  const pendingCount = await prisma.studyMember.count({
    where: { studyId, status: 'PENDING' }
  })

  if (pendingCount > 0) {
    // 옵션 1: 거절
    await prisma.studyMember.deleteMany({
      where: { studyId, status: 'PENDING' }
    })

    // 옵션 2: 유지 (관리자가 나중에 처리)
    // 그대로 둠
  }
}
```

---

## 이미지 업로드 실패

### ✅ 이미지 업로드 API

```javascript
// src/app/api/studies/[id]/image/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request, { params }) {
  const { id: studyId } = await params
  
  const result = await requireStudyMember(studyId, 'OWNER')
  if (result instanceof NextResponse) return result

  try {
    const formData = await request.formData()
    const file = formData.get('image')

    if (!file) {
      return NextResponse.json(
        { error: "이미지 파일을 선택해주세요" },
        { status: 400 }
      )
    }

    // 파일 크기 확인 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "이미지 크기는 5MB 이하여야 합니다" },
        { status: 400 }
      )
    }

    // 파일 형식 확인
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 이미지 형식입니다. (JPEG, PNG, WEBP, GIF만 가능)" },
        { status: 400 }
      )
    }

    // 파일 저장
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `study-${studyId}-${Date.now()}.${file.type.split('/')[1]}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'studies', filename)

    // 디렉토리 생성
    await mkdir(path.dirname(filepath), { recursive: true })

    // 파일 쓰기
    await writeFile(filepath, buffer)

    const imageUrl = `/uploads/studies/${filename}`

    // 데이터베이스 업데이트
    await prisma.study.update({
      where: { id: studyId },
      data: { image: imageUrl }
    })

    return NextResponse.json({
      success: true,
      message: "이미지가 업로드되었습니다",
      imageUrl
    })

  } catch (error) {
    console.error('Upload image error:', error)
    return NextResponse.json(
      { error: "이미지 업로드 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

### 클라이언트 처리

```javascript
// src/components/studies/ImageUpload.jsx
'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

function ImageUpload({ studyId, currentImage }) {
  const [preview, setPreview] = useState(currentImage)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 클라이언트 검증
    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 크기는 5MB 이하여야 합니다')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('지원하지 않는 이미지 형식입니다')
      return
    }

    // 미리보기
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result)
    reader.readAsDataURL(file)

    // 업로드
    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`/api/studies/${studyId}/image`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      const data = await response.json()
      setPreview(data.imageUrl)
      toast.success('이미지가 업로드되었습니다')

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || '이미지 업로드에 실패했습니다')
      setPreview(currentImage) // 원래 이미지로 복원
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="image-upload">
      <label>스터디 이미지</label>
      
      {preview && (
        <div className="preview">
          <img src={preview} alt="스터디 이미지" />
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {uploading && <p>업로드 중...</p>}
      
      <small>
        • 최대 크기: 5MB<br />
        • 지원 형식: JPEG, PNG, WEBP, GIF
      </small>
    </div>
  )
}

export default ImageUpload
```

---

## 카테고리 변경

### 유효성 검사

```javascript
// 카테고리 정의
const VALID_CATEGORIES = {
  '프로그래밍': ['웹 개발', '앱 개발', '알고리즘', 'AI/ML', '데이터'],
  '어학': ['영어', '일본어', '중국어', '기타 언어'],
  '자격증': ['IT', '금융', '어학', '전문자격'],
  '취미': ['운동', '음악', '미술', '요리', '여행'],
  '독서': ['소설', '비소설', '자기계발', '전공서적'],
  '재테크': ['주식', '부동산', '재무설계', '창업'],
  '기타': []
}

// 카테고리 검증
if (body.category !== undefined) {
  if (!Object.keys(VALID_CATEGORIES).includes(body.category)) {
    return NextResponse.json(
      { error: "유효하지 않은 카테고리입니다" },
      { status: 400 }
    )
  }
  updateData.category = body.category
  
  // 서브 카테고리가 있으면 유효성 확인
  if (body.subCategory) {
    const validSubs = VALID_CATEGORIES[body.category]
    if (validSubs.length > 0 && !validSubs.includes(body.subCategory)) {
      return NextResponse.json(
        { error: "유효하지 않은 서브 카테고리입니다" },
        { status: 400 }
      )
    }
    updateData.subCategory = body.subCategory
  }
}
```

---

## 태그 관리

### ✅ 태그 추가/제거

```javascript
// 태그 추가
export async function addTag(studyId, tag) {
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: { tags: true }
  })

  if (study.tags.includes(tag)) {
    throw new Error('이미 존재하는 태그입니다')
  }

  if (study.tags.length >= 10) {
    throw new Error('태그는 최대 10개까지 추가할 수 있습니다')
  }

  if (tag.length > 20) {
    throw new Error('태그는 20자 이하여야 합니다')
  }

  await prisma.study.update({
    where: { id: studyId },
    data: {
      tags: [...study.tags, tag]
    }
  })
}

// 태그 제거
export async function removeTag(studyId, tag) {
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: { tags: true }
  })

  await prisma.study.update({
    where: { id: studyId },
    data: {
      tags: study.tags.filter(t => t !== tag)
    }
  })
}
```

### 클라이언트

```javascript
// src/components/studies/TagManager.jsx
function TagManager({ studyId, initialTags }) {
  const [tags, setTags] = useState(initialTags)
  const [newTag, setNewTag] = useState('')

  const handleAddTag = () => {
    if (!newTag.trim()) return

    if (tags.includes(newTag.trim())) {
      toast.error('이미 존재하는 태그입니다')
      return
    }

    if (tags.length >= 10) {
      toast.error('태그는 최대 10개까지 가능합니다')
      return
    }

    if (newTag.length > 20) {
      toast.error('태그는 20자 이하여야 합니다')
      return
    }

    setTags([...tags, newTag.trim()])
    setNewTag('')
  }

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <div>
      <div className="tags">
        {tags.map(tag => (
          <span key={tag} className="tag">
            {tag}
            <button onClick={() => handleRemoveTag(tag)}>×</button>
          </span>
        ))}
      </div>

      <div className="add-tag">
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          placeholder="태그 입력"
          maxLength={20}
        />
        <button onClick={handleAddTag}>추가</button>
      </div>

      <small>{tags.length}/10 개</small>
    </div>
  )
}
```

---

## 관련 문서

- [INDEX](./INDEX.md)
- [01-study-crud-exceptions.md](./01-study-crud-exceptions.md)
- [05-permissions-exceptions.md](./05-permissions-exceptions.md)

---

**다음 문서**: [권한 관리 예외 처리](./05-permissions-exceptions.md)

