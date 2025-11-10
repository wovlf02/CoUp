'use client'

import { useState, useRef } from 'react'
import styles from '@/styles/studies/files.module.css'

export default function StudyFilesPage({ params }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [sortBy, setSortBy] = useState('latest') // latest, name, size

  // 샘플 파일 데이터
  const [files, setFiles] = useState([
    {
      id: 1,
      name: '알고리즘_문제집.pdf',
      type: 'pdf',
      size: '2.5MB',
      uploader: '김철수',
      uploadedAt: '2시간 전',
      url: '#',
      canDelete: true
    },
    {
      id: 2,
      name: '면접_준비_자료.xlsx',
      type: 'xlsx',
      size: '1.2MB',
      uploader: '이영희',
      uploadedAt: '1일 전',
      url: '#',
      canDelete: false
    },
    {
      id: 3,
      name: '코드_리뷰_자료.zip',
      type: 'zip',
      size: '5.8MB',
      uploader: '박민수',
      uploadedAt: '3일 전',
      url: '#',
      canDelete: false
    }
  ])

  const getFileIcon = (type) => {
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xlsx: '📊',
      xls: '📊',
      ppt: '📊',
      pptx: '📊',
      zip: '📦',
      jpg: '🖼️',
      png: '🖼️',
      gif: '🖼️'
    }
    return icons[type] || '📄'
  }

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

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFileUpload(droppedFiles)
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFileUpload(selectedFiles)
  }

  const handleFileUpload = async (filesToUpload) => {
    for (const file of filesToUpload) {
      // 파일 크기 검증 (50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('파일 크기는 50MB를 초과할 수 없습니다.')
        continue
      }

      // 파일 형식 검증
      const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'jpg', 'png', 'gif']
      const fileExt = file.name.split('.').pop().toLowerCase()
      if (!allowedTypes.includes(fileExt)) {
        alert('지원하지 않는 파일 형식입니다.')
        continue
      }

      // 업로드 시뮬레이션
      setUploadProgress({ name: file.name, progress: 0 })

      // TODO: 실제 S3 Pre-signed URL 업로드
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadProgress({ name: file.name, progress: i })
      }

      // 파일 목록에 추가
      const newFile = {
        id: Date.now(),
        name: file.name,
        type: fileExt,
        size: formatFileSize(file.size),
        uploader: '나',
        uploadedAt: '방금 전',
        url: '#',
        canDelete: true
      }
      setFiles(prev => [newFile, ...prev])
      setUploadProgress(null)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleDownload = (file) => {
    // TODO: 실제 다운로드 구현
    console.log('다운로드:', file.name)
    // window.open(file.url, '_blank')
  }

  const handleDelete = (fileId) => {
    if (!confirm('파일을 삭제하시겠습니까?')) return

    setFiles(prev => prev.filter(f => f.id !== fileId))
    // TODO: API 호출
    console.log('파일 삭제:', fileId)
  }

  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'size') return parseFloat(b.size) - parseFloat(a.size)
    return 0 // latest (기본 순서 유지)
  })

  return (
    <div className={styles.filesContainer}>
      {/* 파일 업로드 영역 */}
      <div
        className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploadProgress ? (
          <div className={styles.uploadProgress}>
            <p>업로드 중... {uploadProgress.progress}%</p>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
            <p className={styles.fileName}>{uploadProgress.name}</p>
          </div>
        ) : (
          <>
            <p className={styles.uploadText}>파일을 드래그하거나 클릭하여 업로드</p>
            <button className={styles.uploadButton}>파일 선택</button>
            <p className={styles.uploadHint}>최대 50MB (PDF, DOC, XLS, ZIP, 이미지)</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* 파일 목록 헤더 */}
      <div className={styles.filesHeader}>
        <h3>전체 파일 ({files.length}개)</h3>
        <select
          className={styles.sortSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="latest">최신순</option>
          <option value="name">이름순</option>
          <option value="size">크기순</option>
        </select>
      </div>

      {/* 파일 목록 */}
      <div className={styles.filesList}>
        {sortedFiles.length === 0 ? (
          <div className={styles.emptyState}>
            <p>아직 업로드된 파일이 없습니다</p>
          </div>
        ) : (
          sortedFiles.map((file) => (
            <div key={file.id} className={styles.fileCard}>
              <div className={styles.fileIcon}>
                {getFileIcon(file.type)}
              </div>
              <div className={styles.fileInfo}>
                <div className={styles.fileName}>{file.name}</div>
                <div className={styles.fileMeta}>
                  <span>{file.uploader}</span>
                  <span>·</span>
                  <span>{file.size}</span>
                  <span>·</span>
                  <span>{file.uploadedAt}</span>
                </div>
              </div>
              <div className={styles.fileActions}>
                <button
                  className={styles.downloadButton}
                  onClick={() => handleDownload(file)}
                  title="다운로드"
                >
                  ⬇️
                </button>
                {file.canDelete && (
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(file.id)}
                    title="삭제"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

