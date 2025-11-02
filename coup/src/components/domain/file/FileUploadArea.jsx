import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import styles from './FileUploadArea.module.css';

export default function FileUploadArea({ studyId }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
      // TODO: Implement file upload logic here
      console.log('File dropped:', files[0].name);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      // TODO: Implement file upload logic here
      console.log('File selected:', files[0].name);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // TODO: Call API to upload file
      console.log('Uploading file:', selectedFile.name, 'to study', studyId);
      alert(`파일 업로드 요청: ${selectedFile.name}`);
      setSelectedFile(null);
    } else {
      alert('업로드할 파일을 선택해주세요.');
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
      />
      <label htmlFor="file-upload-input">
        <Button variant="secondary" asChild>
          <span>파일 선택</span>
        </Button>
      </label>
      {selectedFile && (
        <div className={styles.selectedFileContainer}>
          <span className={styles.selectedFileName}>{selectedFile.name}</span>
          <Button onClick={handleUpload} variant="primary" size="small">업로드</Button>
        </div>
      )}
    </div>
  );
}
