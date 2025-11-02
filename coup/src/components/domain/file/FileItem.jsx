import React from 'react';
import Image from 'next/image';
import styles from './FileItem.module.css';

export default function FileItem({
  fileId,
  fileName,
  fileUrl,
  fileSize,
  fileType,
  uploaderName,
  createdAt,
  onDelete,
}) {
  // Placeholder for user role check
  const canDelete = true; 

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    // Basic icon mapping, can be expanded
    if (type.includes('image')) return '/file.svg'; // Placeholder for image icon
    if (type.includes('pdf')) return '/file.svg'; // Placeholder for pdf icon
    return '/file.svg'; // Generic file icon
  };

  return (
    <div className={styles.fileItemContainer}>
      <Image src={getFileIcon(fileType)} alt="file icon" width={24} height={24} className={styles.fileIcon} />
      <div className={styles.fileInfo}>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={styles.fileName}>{fileName}</a>
        <div className={styles.fileMeta}>
          <span className={styles.uploader}>업로더: {uploaderName}</span>
          <span className={styles.date}>{createdAt}</span>
          <span className={styles.size}>{formatFileSize(fileSize)}</span>
        </div>
      </div>
      <div className={styles.actionButtons}>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" download className={styles.downloadButton}>다운로드</a>
        {canDelete && (
          <button onClick={() => onDelete(fileId)} className={styles.deleteButton}>삭제</button>
        )}
      </div>
    </div>
  );
}
