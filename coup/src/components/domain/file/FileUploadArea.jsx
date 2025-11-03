import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import styles from './FileUploadArea.module.css';
import api from '@/lib/api'; // Import the API client
import { useUploadFileMutation } from '@/lib/api/mutations/files'; // Import the mutation hook

export default function FileUploadArea({ studyId }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFileMutation = useUploadFileMutation(studyId);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('업로드할 파일을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get presigned URL from our API
      const { data: { signedUrl, Key } } = await api.post(`/studies/${studyId}/files/upload-url`, {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
      });

      // 2. Upload file directly to S3 using the presigned URL
      await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
        // You might need to implement progress tracking manually for fetch or use a library like axios
        // For simplicity, progress is not tracked here for S3 direct upload
      });

      // 3. Save file metadata to our database
      await uploadFileMutation.mutateAsync({
        fileName: selectedFile.name,
        fileUrl: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com/${Key}`, // Construct public URL
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
      });

      alert('파일이 성공적으로 업로드되었습니다.');
      setSelectedFile(null);
      setUploadProgress(100);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert(`파일 업로드에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`${styles.fileUploadArea} ${isDragging ? styles.dragging : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <p className={styles.uploadText}>여기에 파일을 드래그하거나</p>
      <input
        type="file"
        className={styles.fileInput}
        id="file-upload-input"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <label htmlFor="file-upload-input">
        <Button variant="secondary" asChild disabled={isUploading}>
          <span>파일 선택</span>
        </Button>
      </label>
      {selectedFile && (
        <div className={styles.selectedFileContainer}>
          <span className={styles.selectedFileName}>{selectedFile.name}</span>
          <Button onClick={handleUpload} variant="primary" size="small" disabled={isUploading}>
            {isUploading ? `업로드 중 (${uploadProgress}%)` : '업로드'}
          </Button>
        </div>
      )}
      {isUploading && uploadProgress < 100 && (
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}
    </div>
  );
}
