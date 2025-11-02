import React from 'react';
import FileItem from './FileItem';
import styles from './FileList.module.css';

export default function FileList({ studyId, files, onDelete }) {
  // Placeholder files if not provided
  const defaultFiles = [
    {
      fileId: '1',
      fileName: '스터디_자료_1주차.pdf',
      fileUrl: '#',
      fileSize: 1234567,
      fileType: 'application/pdf',
      uploaderName: '김철수',
      createdAt: '2025.10.28',
    },
    {
      fileId: '2',
      fileName: '발표_이미지.png',
      fileUrl: '#',
      fileSize: 543210,
      fileType: 'image/png',
      uploaderName: '이영희',
      createdAt: '2025.10.27',
    },
  ];

  const filesToDisplay = files || defaultFiles;

  return (
    <div className={styles.fileListContainer}>
      {filesToDisplay.length > 0 ? (
        filesToDisplay.map((file) => (
          <FileItem
            key={file.fileId}
            fileId={file.fileId}
            fileName={file.fileName}
            fileUrl={file.fileUrl}
            fileSize={file.fileSize}
            fileType={file.fileType}
            uploaderName={file.uploaderName}
            createdAt={file.createdAt}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p className={styles.emptyMessage}>아직 공유된 파일이 없습니다. 첫 파일을 업로드해보세요!</p>
      )}
    </div>
  );
}
